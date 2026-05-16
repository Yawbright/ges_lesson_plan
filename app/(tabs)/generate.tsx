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
import { router, useFocusEffect } from 'expo-router';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { CreditUsagePreview } from '@/components/CreditUsagePreview';
import { DatePickerField } from '@/components/DatePickerField';
import { GenerationProgress } from '@/components/GenerationProgress';
import { LessonPlanStack, LessonPlanTable } from '@/components/LessonPlanTable';
import { PreviewActionButton, PreviewActions, PreviewHeader } from '@/components/PreviewChrome';
import { SelectField } from '@/components/SelectField';
import { useToast } from '@/components/ToastProvider';
import { formatAiActionError, generateLessonPlan, isInsufficientCreditsError } from '@/lib/ai';
import { defaultRuntimeSettings, loadRuntimeAppSettings } from '@/lib/appSettings';
import { loadCreditBalance } from '@/lib/credits';
import { exportLessonPlanPdf, exportLessonPlansPdf, shareLessonPlan, shareLessonPlans } from '@/lib/export';
import { saveLessonPlan, saveLessonPlanBundle } from '@/lib/lessonStore';
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
import { colors, radii, shadows, spacing, typography } from '@/theme/colors';
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
  const [lessonCreditCost, setLessonCreditCost] = useState(defaultRuntimeSettings.featureCreditCosts.lesson_generation);
  const [generatedPlans, setGeneratedPlans] = useState<LessonPlan[]>([]);
  const [matchedScheme, setMatchedScheme] = useState<SchemeOfWork | null>(null);
  const [matchingSchemes, setMatchingSchemes] = useState<SchemeOfWork[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [savedPlanIds, setSavedPlanIds] = useState<string[]>([]);
  const [savedBundleId, setSavedBundleId] = useState<string | null>(null);

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
      Promise.all([
        loadCreditBalance().catch(() => 0),
        loadRuntimeAppSettings(),
      ])
        .then(([balance, settings]) => {
          setCreditBalance(balance);
          setLessonCreditCost(settings.featureCreditCosts.lesson_generation);
        })
        .catch(() => undefined);
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
  const generationCost = selectedLessonNumbers.length * lessonCreditCost;

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
        if (balance < generationCost) {
          const message = `You need ${formatCredits(generationCost)} to generate all ${sessionsPerWeek} lessons for this week.`;
          showToast({ message, type: 'error' });
          Alert.alert('Not enough credits', message, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Get credits', onPress: () => router.push('/(tabs)/credits') },
          ]);
          return;
        }
      }

      const teacherProfile = await loadTeacherProfile();
      const weekEnding = calculateWeekEnding(termStartDate, weekNum);
      const classSize = teacherProfile.classSizes?.[classLevel]?.trim() ?? '';
      const generated: LessonPlan[] = [];
      const savedIds: string[] = [];
      let bundleId: string | null = null;

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
        generated.push(enrichedResult);
        if (sessionIndex !== 'all') {
          const saved = await saveLessonPlan(enrichedResult);
          if (saved.id) savedIds.push(saved.id);
        }
      }

      if (sessionIndex === 'all') {
        const savedBundle = await saveLessonPlanBundle(generated);
        bundleId = savedBundle.id ?? null;
      }

      setSavedPlanIds(savedIds);
      setSavedBundleId(bundleId);
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
          { text: 'Get credits', onPress: () => router.push('/(tabs)/credits') },
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
    const hasSavedFullView = singlePlan ? Boolean(savedPlanIds[0]) : Boolean(savedBundleId);
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
        return;
      }
      if (savedBundleId) {
        router.push(`/lesson/week?bundleId=${encodeURIComponent(savedBundleId)}`);
      }
    };
    return (
      <View style={styles.previewContainer}>
        <PreviewHeader
          title={singlePlan ? 'Lesson Plan' : `Week Plan (${generatedPlans.length})`}
          onBack={() => {
            setGeneratedPlans([]);
            setSavedPlanIds([]);
            setSavedBundleId(null);
          }}
          onShare={shareGeneratedPlans}
        />
        {singlePlan ? <LessonPlanTable plan={singlePlan} /> : <LessonPlanStack plans={generatedPlans} />}
        <PreviewActions>
          <PreviewActionButton title="Save as PDF" onPress={saveGeneratedPlansAsPdf} />
          {hasSavedFullView ? (
            <PreviewActionButton
              title="Open full view"
              variant="secondary"
              onPress={openFullView}
            />
          ) : null}
        </PreviewActions>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Lesson Planner</Text>
          <Text style={styles.heading}>New Lesson Plan</Text>
          <Text style={styles.sub}>
            Choose the class first — the subject list updates automatically to show only subjects
            mapped for that level.
          </Text>
        </View>

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
                ? `${selectedScheme.subject} - ${selectedScheme.classLevel} - ${selectedScheme.term}. Week ${week || '?'} will generate all ${sessionsPerWeek} lessons and use ${formatCredits(generationCost)}.`
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
              ? `This will use ${formatCredits(generationCost)} for ${selectedLessonNumbers.length} lessons.`
              : `This will use ${formatCredits(generationCost)}.`
          }
          onBuyCredits={() => router.push('/(tabs)/credits')}
        />
        <Button
          title={sessionIndex === 'all' ? `Generate all ${sessionsPerWeek} lesson plans` : 'Generate lesson plan'}
          onPress={handleGenerate}
          disabled={loading}
        />
        <GenerationProgress
          active={loading}
          label={sessionIndex === 'all' ? 'Generating full-week lesson plans' : 'Generating lesson plan'}
          estimateMs={sessionIndex === 'all' ? 45000 * selectedLessonNumbers.length : 40000}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  previewContainer: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing[7], paddingBottom: spacing[12], gap: spacing[5] },
  hero: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing[7],
    paddingVertical: spacing[7],
    marginBottom: spacing[2],
    ...shadows.sm,
  },
  heroEyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
    marginBottom: spacing[3],
  },
  heading: { ...typography.h1, color: colors.text, marginBottom: spacing[3] },
  sub: { ...typography.body, color: colors.textMuted },
  headerPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing[6],
    gap: spacing[3],
    ...shadows.sm,
  },
  headerControls: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing[5],
  },
  headerControl: {
    flex: 1,
  },
  headerMeta: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing[1],
  },
  actions: {
    padding: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing[4],
  },
  schemeHint: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing[6],
    ...shadows.sm,
  },
  schemeHintTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing[2],
  },
  schemeHintText: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  lessonStripWrap: {
    gap: spacing[3],
  },
  lessonStripLabel: {
    ...typography.label,
    color: colors.text,
  },
  lessonStripRow: {
    flexDirection: 'row',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  lessonStrip: {
    minHeight: 44,
    minWidth: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
  },
  lessonStripActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  lessonStripPressed: {
    opacity: 0.82,
  },
  lessonStripText: {
    ...typography.label,
    color: colors.textMuted,
  },
  lessonStripTextActive: {
    color: colors.primary,
  },
  schemeList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing[6],
    gap: spacing[4],
    ...shadows.sm,
  },
  schemeListTitle: {
    ...typography.h4,
    color: colors.text,
  },
  schemeCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
    backgroundColor: colors.surface,
  },
  schemeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  schemeCardTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing[1],
  },
  schemeCardMeta: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  inlineButton: {
    minHeight: 40,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
  },
});

function formatCredits(value: number) {
  return `${value} ${value === 1 ? 'credit' : 'credits'}`;
}
