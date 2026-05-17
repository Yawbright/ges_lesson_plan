import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { CreditUsagePreview } from '@/components/CreditUsagePreview';
import { GenerationProgress } from '@/components/GenerationProgress';
import { TeachingNotesView } from '@/components/TeachingNotesView';
import { useToast } from '@/components/ToastProvider';
import { formatAiActionError, generateTeachingNotes, isInsufficientCreditsError } from '@/lib/ai';
import { loadRuntimeAppSettings } from '@/lib/appSettings';
import { loadCreditBalance } from '@/lib/credits';
import { exportTeachingNotesPdf } from '@/lib/export';
import { loadLessonWorks } from '@/lib/lessonStore';
import { logAppError } from '@/lib/logger';
import {
  loadTeachingNotesForLesson,
  saveTeachingNotes,
} from '@/lib/teachingNotesStore';
import { colors, radii, shadows, spacing, typography } from '@/theme/colors';
import type { LessonPlan, LessonPlanBundle, SavedLessonWork } from '@/types/lessonPlan';
import type { TeachingNotes } from '@/types/teachingNotes';

export default function TeachingNotesToolScreen() {
  const { showToast } = useToast();
  const { lessonPlanId } = useLocalSearchParams<{ lessonPlanId?: string }>();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [query, setQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [versions, setVersions] = useState<TeachingNotes[]>([]);
  const [activeNotes, setActiveNotes] = useState<TeachingNotes | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditCost, setCreditCost] = useState(1);
  // ✅ Track abort controller for generation
  const generationAbortController = useRef<AbortController | null>(null);
  const mounted = useRef(true);

  // ✅ Cleanup on unmount: cancel generation if in progress
  useEffect(() => {
    return () => {
      mounted.current = false;
      generationAbortController.current?.abort();
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [lessonWorks, balance, settings] = await Promise.all([
        loadLessonWorks(),
        loadCreditBalance().catch(() => 0),
        loadRuntimeAppSettings(),
      ]);
      if (!mounted.current) return;
      setPlans(flattenLessonWorks(lessonWorks));
      setCreditBalance(balance);
      setCreditCost(settings.featureCreditCosts.teaching_notes_generation);
      setLoadError('');
    } catch (err) {
      if (!mounted.current) return;
      const message = err instanceof Error ? err.message : 'Unable to load teaching notes data.';
      setLoadError(message);
      showToast({ message, type: 'error' });
    }
  }, [showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!lessonPlanId || !plans.length || selectedPlan) return;
    const match = plans.find((plan) => plan.id === lessonPlanId);
    if (match) {
      selectPlan(match);
    }
  }, [lessonPlanId, plans, selectedPlan]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const filteredPlans = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return plans;
    return plans.filter((plan) =>
      [
        plan.subject,
        plan.classLevel,
        plan.weekTitle,
        plan.termTitle,
        plan.lessonNumber,
        plan.topic,
        plan.strand,
        plan.subStrand,
        `week ${plan.week}`,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [plans, query]);

  async function selectPlan(plan: LessonPlan) {
    setSelectedPlan(plan);
    const planVersions = plan.id ? await loadTeachingNotesForLesson(plan.id) : [];
    setVersions(planVersions);
    setActiveNotes(null);
  }

  async function handleGenerate() {
    if (!selectedPlan) return;
    if (!selectedPlan.id) {
      Alert.alert('Save required', 'This lesson plan must be saved before teaching notes can be generated.');
      return;
    }

    const controller = new AbortController();
    generationAbortController.current?.abort();
    generationAbortController.current = controller;
    setLoading(true);

    try {
      const generated = await generateTeachingNotes(selectedPlan, { signal: controller.signal });
      if (controller.signal.aborted || !mounted.current) return;

      const saved = await saveTeachingNotes({
        ...generated,
        lessonPlanId: selectedPlan.id,
        sourceLessonPlan: {
          id: selectedPlan.id,
          subject: selectedPlan.subject,
          classLevel: selectedPlan.classLevel,
          week: selectedPlan.week,
          lessonNumber: selectedPlan.lessonNumber,
          topic: selectedPlan.topic,
          strand: selectedPlan.strand,
          subStrand: selectedPlan.subStrand,
        },
      });
      
      if (controller.signal.aborted || !mounted.current) return;

      const planVersions = await loadTeachingNotesForLesson(selectedPlan.id);
      if (!controller.signal.aborted && mounted.current) {
        setVersions(planVersions);
        setActiveNotes(saved);
        loadCreditBalance().then((balance) => {
          if (!controller.signal.aborted && mounted.current) setCreditBalance(balance);
        }).catch(() => undefined);
        showToast({ message: `Teaching notes version ${saved.versionNumber ?? 1} generated.` });
      }
    } catch (err: unknown) {
      if (!controller.signal.aborted && mounted.current) {
        const message = formatAiActionError(err);
        logAppError({
          source: 'client',
          action: 'generate_teaching_notes',
          message,
          metadata: { lessonPlanId: selectedPlan.id, subject: selectedPlan.subject },
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
      }
    } finally {
      if (!controller.signal.aborted && mounted.current) {
        setLoading(false);
      }
      if (generationAbortController.current === controller) {
        generationAbortController.current = null;
      }
    }
  }

  if (activeNotes) {
    return (
      <View style={styles.preview}>
        <View style={styles.previewActions}>
          <Button title="Back to lessons" variant="secondary" onPress={() => setActiveNotes(null)} style={styles.actionButton} />
          <Button title="Save Notes as PDF" onPress={() => exportTeachingNotesPdf(activeNotes)} style={styles.actionButton} />
          <Button title="Regenerate" variant="secondary" onPress={handleGenerate} disabled={loading} style={styles.actionButton} />
          <GenerationProgress active={loading} label="Regenerating teaching notes" estimateMs={85000} />
        </View>
        {versions.length > 1 ? (
          <ScrollView horizontal style={styles.versionStrip} contentContainerStyle={styles.versionStripContent}>
            {versions.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.versionPill, item.id === activeNotes.id && styles.versionPillActive]}
                onPress={() => setActiveNotes(item)}
              >
                <Text style={[styles.versionText, item.id === activeNotes.id && styles.versionTextActive]}>
                  Version {item.versionNumber ?? 1}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <TeachingNotesView notes={activeNotes} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Teaching Notes</Text>
        <Text style={styles.heading}>Turn lesson plans into classroom notes</Text>
        <Text style={styles.sub}>
          Search a saved lesson plan, then generate detailed classroom-ready teaching notes from it.
        </Text>
      </View>

      <Field
        label="Search saved lesson plans"
        value={query}
        onChangeText={setQuery}
        placeholder="Search subject, class, week, topic, strand..."
        autoCapitalize="none"
      />

      {loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Button title="Retry" variant="secondary" onPress={refresh} style={styles.retryButton} />
        </View>
      ) : null}

      {selectedPlan ? (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedTitle}>Selected lesson</Text>
          <Text style={styles.cardTitle}>{lessonTitle(selectedPlan)}</Text>
          <Text style={styles.cardSub}>{selectedPlan.topic || selectedPlan.strand || selectedPlan.termTitle}</Text>
          {versions.length ? (
            <Text style={styles.cardSub}>{versions.length} saved note version{versions.length === 1 ? '' : 's'} found. Latest opens first.</Text>
          ) : null}
          <CreditUsagePreview
            cost={creditCost}
            balance={creditBalance}
            label={`Generating or regenerating teaching notes uses ${creditCost} ${creditCost === 1 ? 'credit' : 'credits'}.`}
            onBuyCredits={() => router.push('/(tabs)/credits')}
          />
          <View style={styles.buttonRow}>
            {versions[0] ? (
              <Button title="Open latest notes" variant="secondary" onPress={() => setActiveNotes(versions[0])} style={styles.actionButton} />
            ) : null}
            <Button title={versions.length ? 'Generate new version' : 'Generate teaching notes'} onPress={handleGenerate} disabled={loading} style={styles.actionButton} />
          </View>
          <GenerationProgress
            active={loading}
            label={versions.length ? 'Generating new teaching notes version' : 'Generating teaching notes'}
            estimateMs={85000}
          />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Saved Lesson Plans</Text>
      {filteredPlans.length ? (
        filteredPlans.map((plan) => (
          <Pressable key={plan.id ?? `${plan.subject}-${plan.week}`} style={styles.card} onPress={() => selectPlan(plan)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{lessonTitle(plan)}</Text>
              <Text style={styles.cardSub}>{plan.topic || plan.strand || plan.termTitle}</Text>
            </View>
            <Button title="Select" variant="secondary" onPress={() => selectPlan(plan)} style={styles.selectButton} />
          </Pressable>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No matching saved lesson plans found.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function lessonTitle(plan: LessonPlan) {
  return `${plan.subject} - ${plan.classLevel} - Week ${plan.week}${plan.lessonNumber ? ` (${plan.lessonNumber})` : ''}`;
}

function flattenLessonWorks(works: SavedLessonWork[]): LessonPlan[] {
  return works.flatMap((work) => (isLessonBundle(work) ? work.plans : [work]));
}

function isLessonBundle(work: SavedLessonWork): work is LessonPlanBundle {
  return (work as LessonPlanBundle).kind === 'bundle' && Array.isArray((work as LessonPlanBundle).plans);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
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
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing[3] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
    ...shadows.sm,
  },
  selectedCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing[7],
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing[4],
    ...shadows.sm,
  },
  selectedTitle: {
    ...typography.eyebrow,
    color: colors.primaryDark,
  },
  cardTitle: { ...typography.h4, color: colors.text, marginBottom: spacing[1] },
  cardSub: { ...typography.bodySm, color: colors.textMuted },
  selectButton: { minHeight: 40, paddingHorizontal: spacing[5] },
  buttonRow: { flexDirection: 'row', gap: spacing[4], flexWrap: 'wrap' },
  actionButton: { flex: 1, minWidth: 140 },
  empty: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing[7],
    alignItems: 'center',
  },
  emptyText: { ...typography.body, color: colors.textMuted },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.md,
    padding: spacing[5],
    gap: spacing[3],
  },
  errorText: { ...typography.bodySm, color: colors.danger },
  retryButton: { alignSelf: 'flex-start', minHeight: 40 },
  preview: { flex: 1, backgroundColor: colors.bg },
  previewActions: {
    padding: spacing[5],
    gap: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  versionStrip: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  versionStripContent: { padding: spacing[4], gap: spacing[3] },
  versionPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
  },
  versionPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  versionText: { ...typography.label, color: colors.primary },
  versionTextActive: { color: colors.primaryOn },
});
