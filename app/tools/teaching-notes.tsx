import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { CreditUsagePreview } from '@/components/CreditUsagePreview';
import { TeachingNotesView } from '@/components/TeachingNotesView';
import { useToast } from '@/components/ToastProvider';
import { formatAiActionError, generateTeachingNotes, isInsufficientCreditsError } from '@/lib/ai';
import { loadRuntimeAppSettings } from '@/lib/appSettings';
import { loadCreditBalance } from '@/lib/credits';
import { exportTeachingNotesPdf } from '@/lib/export';
import { loadLessonPlans } from '@/lib/lessonStore';
import { logAppError } from '@/lib/logger';
import {
  loadTeachingNotesForLesson,
  saveTeachingNotes,
} from '@/lib/teachingNotesStore';
import { colors } from '@/theme/colors';
import type { LessonPlan } from '@/types/lessonPlan';
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
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditCost, setCreditCost] = useState(1);

  const refresh = useCallback(async () => {
    const [lessonPlans, balance, settings] = await Promise.all([
      loadLessonPlans(),
      loadCreditBalance().catch(() => 0),
      loadRuntimeAppSettings(),
    ]);
    setPlans(lessonPlans);
    setCreditBalance(balance);
    setCreditCost(settings.featureCreditCosts.teaching_notes_generation);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!lessonPlanId || !plans.length || selectedPlan?.id === lessonPlanId) return;
    const match = plans.find((plan) => plan.id === lessonPlanId);
    if (match) {
      selectPlan(match);
    }
  }, [lessonPlanId, plans, selectedPlan?.id]);

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

    setLoading(true);
    try {
      const generated = await generateTeachingNotes(selectedPlan);
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
      const planVersions = await loadTeachingNotesForLesson(selectedPlan.id);
      setVersions(planVersions);
      setActiveNotes(saved);
      loadCreditBalance().then(setCreditBalance).catch(() => undefined);
      showToast({ message: `Teaching notes version ${saved.versionNumber ?? 1} generated.` });
    } catch (err: unknown) {
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
          { text: 'Buy credits', onPress: () => router.push('/(tabs)/credits') },
        ]);
      } else {
        Alert.alert('Generation failed', message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (activeNotes) {
    return (
      <View style={styles.preview}>
        <View style={styles.previewActions}>
          <Button title="Back to lessons" variant="secondary" onPress={() => setActiveNotes(null)} style={styles.actionButton} />
          <Button title="Save Notes as PDF" onPress={() => exportTeachingNotesPdf(activeNotes)} style={styles.actionButton} />
          <Button title="Regenerate" variant="secondary" onPress={handleGenerate} loading={loading} style={styles.actionButton} />
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
      <Text style={styles.heading}>Teaching Notes</Text>
      <Text style={styles.sub}>Search a saved lesson plan, then generate detailed classroom notes from it.</Text>

      <Field
        label="Search saved lesson plans"
        value={query}
        onChangeText={setQuery}
        placeholder="Search subject, class, week, topic, strand..."
        autoCapitalize="none"
      />

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
            <Button title={versions.length ? 'Generate new version' : 'Generate teaching notes'} onPress={handleGenerate} loading={loading} style={styles.actionButton} />
          </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 18,
  },
  selectedTitle: { color: colors.primary, fontWeight: '800', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 3 },
  cardSub: { color: colors.textMuted, lineHeight: 18 },
  selectButton: { minHeight: 40, paddingHorizontal: 12 },
  buttonRow: { gap: 10 },
  actionButton: { flex: 1 },
  empty: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
  },
  emptyText: { color: colors.textMuted },
  preview: { flex: 1, backgroundColor: colors.bg },
  previewActions: {
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  versionStrip: {
    maxHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  versionStripContent: { padding: 10, gap: 8 },
  versionPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  versionPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  versionText: { color: colors.primary, fontWeight: '800' },
  versionTextActive: { color: '#fff' },
});
