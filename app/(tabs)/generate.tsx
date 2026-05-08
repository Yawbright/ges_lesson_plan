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
import { LessonPlanTable } from '@/components/LessonPlanTable';
import { SelectField } from '@/components/SelectField';
import { Toast } from '@/components/Toast';
import { formatAiActionError, generateLessonPlan, isInsufficientCreditsError } from '@/lib/ai';
import { exportLessonPlanPdf } from '@/lib/export';
import { saveLessonPlan } from '@/lib/lessonStore';
import {
  CLASS_LEVEL_OPTIONS,
  getDefaultSubjectForClassLevel,
  getLessonIndexOptions,
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

export default function GenerateScreen() {
  const [classLevel, setClassLevel] = useState<ClassLevel>('B7');
  const [subject, setSubject] = useState(getDefaultSubjectForClassLevel('B7'));
  const [week, setWeek] = useState('1');
  const [term, setTerm] = useState('Term 1');
  const [sessionsPerWeekInput, setSessionsPerWeekInput] = useState('3');
  const [sessionIndex, setSessionIndex] = useState(1);
  const [termStartDate, setTermStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [matchedScheme, setMatchedScheme] = useState<SchemeOfWork | null>(null);
  const [matchingSchemes, setMatchingSchemes] = useState<SchemeOfWork[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    }, [refreshSchemes]),
  );

  const selectedScheme =
    matchingSchemes.find((scheme) => scheme.id === selectedSchemeId) ?? matchedScheme;
  const sessionsPerWeek = Math.max(1, Math.min(7, Number(sessionsPerWeekInput) || 1));
  const availableWeeks = useMemo(
    () =>
      selectedScheme?.weeks.length
        ? selectedScheme.weeks.map((item) => item.week)
        : Array.from({ length: 12 }, (_, index) => index + 1),
    [selectedScheme],
  );

  const weekOptions = useMemo(() => getWeekOptions(availableWeeks.length), [availableWeeks.length]);
  const lessonOptions = useMemo(
    () => getLessonIndexOptions(sessionsPerWeek),
    [sessionsPerWeek],
  );

  useEffect(() => {
    if (sessionIndex > sessionsPerWeek) {
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
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

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
      const teacherProfile = await loadTeacherProfile();
      const weekEnding = calculateWeekEnding(termStartDate, weekNum);
      const result = await generateLessonPlan(
        {
          subject: subject.trim(),
          classLevel,
          week: weekNum,
          term: term.trim() || undefined,
          weekEnding: weekEnding || undefined,
          duration: '60 mins',
          sessionIndex,
          sessionsPerWeek,
          notes: notes.trim() || undefined,
          teacherName: teacherProfile.teacherName || undefined,
          schoolName: teacherProfile.schoolName || undefined,
          schoolDistrict: teacherProfile.schoolDistrict || undefined,
        },
        selectedScheme,
      );
      const enrichedResult = {
        ...result,
        date: weekEnding || result.date,
        duration: '60 mins',
        teacherName: teacherProfile.teacherName || undefined,
        schoolName: teacherProfile.schoolName || undefined,
        schoolDistrict: teacherProfile.schoolDistrict || undefined,
      };
      const saved = await saveLessonPlan(enrichedResult);
      setSavedPlanId(saved.id ?? null);
      setPlan(enrichedResult);
      const usedFallback =
        typeof result.references === 'string' &&
        result.references.toLowerCase().includes('fallback template');
      setToast({
        message: usedFallback
          ? 'Lesson plan generated from fallback template.'
          : 'Lesson plan generated successfully.',
        type: 'success',
      });
    } catch (err: unknown) {
      const message = formatAiActionError(err);
      setToast({ message, type: 'error' });
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

  if (plan) {
    return (
      <View style={{ flex: 1 }}>
        <LessonPlanTable plan={plan} />
        <View style={styles.actions}>
          <Button title="Save as PDF" onPress={() => exportLessonPlanPdf(plan)} />
          {savedPlanId ? (
            <Button
              title="Open full view"
              variant="secondary"
              onPress={() => router.push(`/lesson/${savedPlanId}`)}
            />
          ) : null}
          <Button
            title="Generate another"
            variant="ghost"
            onPress={() => {
              setPlan(null);
              setSavedPlanId(null);
            }}
          />
        </View>
        <Toast visible={!!toast} message={toast?.message ?? ''} type={toast?.type} />
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
          label="Term"
          value={term}
          options={TERM_OPTIONS}
          onChange={setTerm}
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

        <SelectField
          label="Lesson This Week"
          value={String(sessionIndex)}
          options={lessonOptions}
          onChange={(value) => setSessionIndex(Number(value))}
        />

        <Field
          label="Term start date"
          value={termStartDate}
          onChangeText={setTermStartDate}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
        />
        <View style={styles.schemeHint}>
          <Text style={styles.schemeHintTitle}>Week ending</Text>
          <Text style={styles.schemeHintText}>
            {calculateWeekEnding(termStartDate, Number(week))
              ? calculateWeekEnding(termStartDate, Number(week))
              : 'Enter the term start date as YYYY-MM-DD to auto-fill the week ending.'}
          </Text>
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
              ? `${selectedScheme.subject} - ${selectedScheme.classLevel} - ${selectedScheme.term}. Week ${week || '?'} will be grounded on that scheme for Lesson ${sessionIndex} of ${sessionsPerWeek}.`
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

        <Button title="Generate lesson plan" onPress={handleGenerate} loading={loading} />
      </ScrollView>
      <Toast visible={!!toast} message={toast?.message ?? ''} type={toast?.type} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
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
