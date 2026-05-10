import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { CreditUsagePreview } from '@/components/CreditUsagePreview';
import { DatePickerField } from '@/components/DatePickerField';
import { LessonPlanStack, LessonPlanTable } from '@/components/LessonPlanTable';
import { SelectField } from '@/components/SelectField';
import { useToast } from '@/components/ToastProvider';
import { formatAiActionError, generateLessonPlan, isInsufficientCreditsError } from '@/lib/ai';
import { loadCreditBalance } from '@/lib/credits';
import { exportLessonPlanPdf, exportLessonPlansPdf, shareLessonPlan, shareLessonPlans } from '@/lib/export';
import { saveLessonPlan } from '@/lib/lessonStore';
import { logAppError } from '@/lib/logger';
import {
  CLASS_LEVEL_OPTIONS,
  getDefaultSubjectForClassLevel,
  getSubjectOptionsForClassLevel,
  getWeekOptions,
  LESSONS_PER_WEEK_OPTIONS,
  TERM_OPTIONS,
} from '@/lib/options';
import { findMatchingScheme, loadMatchingSchemes } from '@/lib/schemeStore';
import {
  getLessonsPerWeekForSubject,
  setLessonsPerWeekForSubject,
} from '@/lib/subjectPrefs';
import { calculateWeekEnding, loadTermStartDate, saveTermStartDate } from '@/lib/termDates';
import { loadTeacherProfile } from '@/lib/teacherProfile';
import { colors } from '@/theme/colors';
import type { ClassLevel, LessonPlan } from '@/types/lessonPlan';
import type { SchemeOfWork } from '@/types/scheme';

type LessonSelection = number | 'all';

export default function GenerateScreen() {
  const { showToast } = useToast();
  const [classLevel, setClassLevel] = useState<ClassLevel>('B7');
  const [subject, setSubject] = useState(getDefaultSubjectForClassLevel('B7'));
  const [week, setWeek] = useState('1');
  const [term, setTerm] = useState('Term 1');
  const [sessionsPerWeekInput, setSessionsPerWeekInput] = useState('3');
  const [sessionIndex, setSessionIndex] = useState<LessonSelection>(1);
  const [termStartDate, setTermStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [generatedPlans, setGeneratedPlans] = useState<LessonPlan[]>([]);
  const [matchedScheme, setMatchedScheme] = useState<SchemeOfWork | null>(null);
  const [matchingSchemes, setMatchingSchemes] = useState<SchemeOfWork[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [savedPlanIds, setSavedPlanIds] = useState<string[]>([]);

  const subjectOptions = useMemo(
    () => getSubjectOptionsForClassLevel(classLevel),
    [classLevel],
  );

  useEffect(() => {
    if (!subjectOptions.some((option) => option.value === subject)) {
      setSubject(getDefaultSubjectForClassLevel(classLevel));
    }
  }, [classLevel, subject, subjectOptions]);

  const refreshSchemes = useCallback(async () => {
    if (!subject.trim()) {
      setMatchedScheme(null);
      setMatchingSchemes([]);
      setSelectedSchemeId(null);
      return;
    }

    const [scheme, schemes] = await Promise.all([
      findMatchingScheme({
        subject,
        classLevel,
        term,
      }),
      loadMatchingSchemes({
        subject,
        classLevel,
        term,
      }),
    ]);
    setMatchedScheme(scheme);
    setMatchingSchemes(schemes);
    setSelectedSchemeId((current) => {
      if (current && schemes.some((item) => item.id === current)) return current;
      return scheme?.id ?? null;
    });
  }, [subject, classLevel, term]);

  useEffect(() => {
    refreshSchemes();
  }, [refreshSchemes]);

  useFocusEffect(
    useCallback(() => {
      refreshSchemes();
      loadCreditBalance().then(setCreditBalance).catch(() => undefined);
    }, [refreshSchemes]),
  );

  const selectedScheme =
    matchingSchemes.find((scheme) => scheme.id === selectedSchemeId) ?? matchedScheme;
  const sessionsPerWeek = Math.max(1, Math.min(4, Number(sessionsPerWeekInput) || 1));
  const availableWeeks = useMemo(
    () =>
      selectedScheme?.weeks.length
        ? selectedScheme.weeks.map((item) => item.week)
        : Array.from({ length: 12 }, (_, index) => index + 1),
    [selectedScheme],
  );

  const weekOptions = useMemo(() => getWeekOptions(availableWeeks.length), [availableWeeks.length]);
  const lessonNumbers = useMemo(
    () => Array.from({ length: sessionsPerWeek }, (_, index) => index + 1),
    [sessionsPerWeek],
  );

  const selectedLessonNumbers = useMemo(
    () => (sessionIndex === 'all' ? lessonNumbers : [sessionIndex]),
    [lessonNumbers, sessionIndex],
  );
  const generationCost = selectedLessonNumbers.length;

  useEffect(() => {
    if (sessionIndex !== 'all' && sessionIndex > sessionsPerWeek) {
      setSessionIndex(sessionsPerWeek);
    }
  }, [sessionIndex, sessionsPerWeek]);

  useEffect(() => {
    let active = true;

    async function loadSubjectPreference() {
      if (!subject.trim()) return;
      const savedValue = await getLessonsPerWeekForSubject(subject);
      if (active && savedValue) {
        setSessionsPerWeekInput(savedValue);
      }
    }

    loadSubjectPreference();

    return () => {
      active = false;
    };
  }, [subject]);

  useEffect(() => {
    if (!subject.trim()) return;
    setLessonsPerWeekForSubject(subject, String(sessionsPerWeek));
  }, [subject, sessionsPerWeek]);

  useEffect(() => {
    const currentWeek = Number(week);
    if (availableWeeks.length && !availableWeeks.includes(currentWeek)) {
      setWeek(String(availableWeeks[0]));
    }
  }, [availableWeeks, week]);

  useEffect(() => {
    let active = true;

    async function loadSavedTermDate() {
      const savedDate = await loadTermStartDate({ classLevel, term });
      if (active) setTermStartDate(savedDate);
    }

    loadSavedTermDate();
    return () => {
      active = false;
    };
  }, [classLevel, term]);

  useEffect(() => {
    saveTermStartDate({ classLevel, term, startDate: termStartDate });
  }, [classLevel, term, termStartDate]);

  async function handleGenerate() {
    if (!subject.trim()) {
      Alert.alert('Subject required', 'Please select the subject.');
      return;
    }
    if (!selectedScheme) {
      Alert.alert(
        'Scheme required',
        'Please generate or select a saved scheme of work for this subject, class and term before creating a lesson plan.',
      );
      return;
    }

    const weekNum = Number(week);
    if (!Number.isInteger(weekNum) || weekNum < 1 || weekNum > 14) {
      Alert.alert('Week invalid', 'Select a valid week.');
      return;
    }

    setLoading(true);
    try {
      if (sessionIndex === 'all') {
        const balance = await loadCreditBalance();
        if (balance < sessionsPerWeek) {
          const message = `You need ${sessionsPerWeek} credits to generate all ${sessionsPerWeek} lessons for this week.`;
          showToast({ message, type: 'error' });
          Alert.alert('Not enough credits', message, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Buy credits', onPress: () => router.push('/(tabs)/credits') },
          ]);
          return;
        }
      }

      const teacherProfile = await loadTeacherProfile();
      const weekEnding = calculateWeekEnding(termStartDate, weekNum);
      const classSize = teacherProfile.classSizes?.[classLevel]?.trim() ?? '';
      const generated: LessonPlan[] = [];
      const savedIds: string[] = [];

      for (const lessonNumber of selectedLessonNumbers) {
        const result = await generateLessonPlan(
          {
            subject: subject.trim(),
            classLevel,
            week: weekNum,
            term: term.trim() || undefined,
            weekEnding: weekEnding || undefined,
            duration: '60 mins',
            sessionIndex: lessonNumber,
            sessionsPerWeek,
            notes: notes.trim() || undefined,
            teacherName: teacherProfile.teacherName || undefined,
            schoolName: teacherProfile.schoolName || undefined,
            schoolDistrict: teacherProfile.schoolDistrict || undefined,
            classSize,
          },
          selectedScheme,
        );
        const enrichedResult = {
          ...result,
          date: weekEnding || result.date,
          duration: '60 mins',
          classSize,
          teacherName: teacherProfile.teacherName || undefined,
          schoolName: teacherProfile.schoolName || undefined,
          schoolDistrict: teacherProfile.schoolDistrict || undefined,
        };
        const saved = await saveLessonPlan(enrichedResult);
        generated.push(enrichedResult);
        if (saved.id) savedIds.push(saved.id);
      }

      setSavedPlanIds(savedIds);
      setGeneratedPlans(generated);
      loadCreditBalance().then(setCreditBalance).catch(() => undefined);
      const usedFallback = generated.some(
        (result) =>
          typeof result.references === 'string' &&
          result.references.toLowerCase().includes('fallback template'),
      );
      showToast({
        message:
          sessionIndex === 'all'
            ? `${generated.length} lesson plans generated for the week.`
            : usedFallback
              ? 'Lesson plan generated from fallback template.'
              : 'Lesson plan generated successfully.',
      });
    } catch (err: unknown) {
      const message = formatAiActionError(err);
      logAppError({
        source: 'client',
        action: 'generate_lesson_plan',
        message,
        metadata: { subject, classLevel, week, sessionIndex, sessionsPerWeek },
      });
      showToast({ message, type: 'error' });
      if (isInsufficientCreditsError(err)) {
        Alert.alert('Not enough credits', message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy credits', onPress: () => router.push('/(tabs)/credits') },
        ]);
      } else {
        Alert.alert('Generation failed', message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (generatedPlans.length) {
    const singlePlan = generatedPlans.length === 1 ? generatedPlans[0] : null;
    const hasSavedFullView = singlePlan ? Boolean(savedPlanIds[0]) : savedPlanIds.length === generatedPlans.length;
    const shareGeneratedPlans = () => {
      if (singlePlan) {
        shareLessonPlan(singlePlan);
      } else {
        shareLessonPlans(generatedPlans);
      }
    };
    const saveGeneratedPlansAsPdf = () => {
      if (singlePlan) {
        exportLessonPlanPdf(singlePlan);
      } else {
        exportLessonPlansPdf(generatedPlans);
      }
    };
    const openFullView = () => {
      if (singlePlan && savedPlanIds[0]) {
        router.push(`/lesson/${savedPlanIds[0]}`);
        return;
      }
      if (savedPlanIds.length) {
        router.push(`/lesson/week?ids=${encodeURIComponent(savedPlanIds.join(','))}`);
      }
    };
    return (
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <View style={styles.previewIconGroup}>
            <PreviewIconButton
              icon="arrow-back"
              label="Back"
              onPress={() => {
                setGeneratedPlans([]);
                setSavedPlanIds([]);
              }}
            />
            <PreviewIconButton icon="share-social-outline" label="Share" onPress={shareGeneratedPlans} />
          </View>
          <Text style={styles.previewHeaderTitle}>
            {singlePlan ? 'Lesson Plan' : `Week Plan (${generatedPlans.length})`}
          </Text>
          <View style={styles.previewHeaderSpacer} />
        </View>
        {singlePlan ? <LessonPlanTable plan={singlePlan} /> : <LessonPlanStack plans={generatedPlans} />}
        <View style={styles.previewActions}>
          <Button title="Save as PDF" onPress={saveGeneratedPlansAsPdf} style={styles.previewActionButton} />
          {hasSavedFullView ? (
            <Button
              title="Open full view"
              variant="secondary"
              onPress={openFullView}
              style={styles.previewActionButton}
            />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>New Lesson Plan</Text>
        <Text style={styles.sub}>
          Choose the class first. The subject list updates automatically so it only shows subjects
          mapped for that level.
        </Text>

        <View style={styles.headerPanel}>
          <View style={styles.headerControls}>
            <View style={styles.headerControl}>
              <SelectField
                label="Term"
                value={term}
                options={TERM_OPTIONS}
                onChange={setTerm}
              />
            </View>
            <View style={styles.headerControl}>
              <DatePickerField
                label="Term start date"
                value={termStartDate}
                onChange={setTermStartDate}
                placeholder="Select start date"
              />
            </View>
          </View>
          <Text style={styles.headerMeta}>
            Week ending: {calculateWeekEnding(termStartDate, Number(week)) || 'Enter term start date'}
          </Text>
        </View>

        <SelectField
          label="Class"
          value={classLevel}
          options={CLASS_LEVEL_OPTIONS}
          onChange={(value) => setClassLevel(value as ClassLevel)}
        />

        <SelectField
          label="Subject"
          value={subject}
          options={subjectOptions}
          onChange={setSubject}
          placeholder="Select a subject"
          helperText={
            subjectOptions.length
              ? undefined
              : 'No mapped subjects are available for this level yet.'
          }
          disabled={!subjectOptions.length}
        />

        <SelectField
          label="Week"
          value={week}
          options={weekOptions}
          onChange={setWeek}
        />

        <SelectField
          label="Lessons per week"
          value={sessionsPerWeekInput}
          options={LESSONS_PER_WEEK_OPTIONS}
          onChange={setSessionsPerWeekInput}
        />

        <View style={styles.lessonStripWrap}>
          <Text style={styles.lessonStripLabel}>Lesson This Week</Text>
          <View style={styles.lessonStripRow}>
            {lessonNumbers.map((lessonNumber) => {
              const active = lessonNumber === sessionIndex;
              return (
                <Pressable
                  key={lessonNumber}
                  onPress={() => setSessionIndex(lessonNumber)}
                  style={({ pressed }) => [
                    styles.lessonStrip,
                    active && styles.lessonStripActive,
                    pressed && styles.lessonStripPressed,
                  ]}
                >
                  <Text style={[styles.lessonStripText, active && styles.lessonStripTextActive]}>
                    Lesson {lessonNumber}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setSessionIndex('all')}
              style={({ pressed }) => [
                styles.lessonStrip,
                sessionIndex === 'all' && styles.lessonStripActive,
                pressed && styles.lessonStripPressed,
              ]}
            >
              <Text style={[styles.lessonStripText, sessionIndex === 'all' && styles.lessonStripTextActive]}>
                All
              </Text>
            </Pressable>
          </View>
        </View>

        <Field
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. include a practical activity or group exercise"
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <View style={styles.schemeHint}>
          <Text style={styles.schemeHintTitle}>
            {selectedScheme ? 'Using selected term scheme' : 'No saved term scheme found'}
          </Text>
          <Text style={styles.schemeHintText}>
            {selectedScheme
              ? sessionIndex === 'all'
                ? `${selectedScheme.subject} - ${selectedScheme.classLevel} - ${selectedScheme.term}. Week ${week || '?'} will generate all ${sessionsPerWeek} lessons and use ${sessionsPerWeek} credits.`
                : `${selectedScheme.subject} - ${selectedScheme.classLevel} - ${selectedScheme.term}. Week ${week || '?'} will be grounded on that scheme for Lesson ${sessionIndex} of ${sessionsPerWeek}.`
              : 'Lesson plans now depend on a saved scheme of work. Generate or select a scheme for this subject, class and term first.'}
          </Text>
        </View>

        {matchingSchemes.length ? (
          <View style={styles.schemeList}>
            <Text style={styles.schemeListTitle}>Select Scheme to Use</Text>
            {matchingSchemes.map((scheme) => {
              const active = scheme.id === selectedSchemeId;
              return (
                <Pressable
                  key={scheme.id}
                  style={[styles.schemeCard, active && styles.schemeCardActive]}
                  onPress={() => setSelectedSchemeId(scheme.id ?? null)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.schemeCardTitle}>{scheme.title}</Text>
                    <Text style={styles.schemeCardMeta}>
                      {scheme.term} | {scheme.weeks.length} weeks
                    </Text>
                  </View>
                  <Button
                    title="View full"
                    variant="secondary"
                    onPress={() => router.push(`/scheme/${scheme.id}`)}
                    style={styles.inlineButton}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <CreditUsagePreview
          cost={generationCost}
          balance={creditBalance}
          label={
            sessionIndex === 'all'
              ? `This will use ${generationCost} credits for ${generationCost} lessons.`
              : 'This will use 1 credit.'
          }
          onBuyCredits={() => router.push('/(tabs)/credits')}
        />
        <Button
          title={sessionIndex === 'all' ? `Generate all ${sessionsPerWeek} lesson plans` : 'Generate lesson plan'}
          onPress={handleGenerate}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PreviewIconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.previewIconButton, pressed && styles.previewIconButtonPressed]}
    >
      <Ionicons name={icon} size={20} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  previewContainer: { flex: 1, backgroundColor: colors.bg },
  previewHeader: {
    minHeight: 52,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  previewIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 88,
  },
  previewIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  previewIconButtonPressed: {
    opacity: 0.82,
  },
  previewHeaderTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  previewHeaderSpacer: {
    minWidth: 88,
  },
  previewActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  previewActionButton: {
    flex: Platform.OS === 'web' ? 1 : undefined,
  },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  headerPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  headerControls: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
  },
  headerControl: {
    flex: 1,
  },
  headerMeta: {
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
  schemeHint: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  schemeHintTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  schemeHintText: {
    color: colors.textMuted,
    lineHeight: 19,
  },
  lessonStripWrap: {
    marginBottom: 16,
  },
  lessonStripLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  lessonStripRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  lessonStrip: {
    minHeight: 44,
    minWidth: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  lessonStripActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef6f2',
  },
  lessonStripPressed: {
    opacity: 0.85,
  },
  lessonStripText: {
    color: colors.text,
    fontWeight: '700',
  },
  lessonStripTextActive: {
    color: colors.primary,
  },
  schemeList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  schemeListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  schemeCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  schemeCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#f3f8f5',
  },
  schemeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  schemeCardMeta: {
    color: colors.textMuted,
    lineHeight: 18,
  },
  inlineButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
