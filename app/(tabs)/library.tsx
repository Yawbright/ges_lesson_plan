import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button } from '@/components/Button';
import { useToast } from '@/components/ToastProvider';
import { exportLessonPlanPdf, exportSchemePdf } from '@/lib/export';
import { deleteLessonPlan, loadLessonPlans } from '@/lib/lessonStore';
import { deleteScheme, loadSchemes } from '@/lib/schemeStore';
import { colors } from '@/theme/colors';
import type { LessonPlan } from '@/types/lessonPlan';
import type { SchemeOfWork } from '@/types/scheme';

export default function LibraryScreen() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [schemes, setSchemes] = useState<SchemeOfWork[]>([]);

  const refresh = useCallback(async () => {
    const [lessonPlans, savedSchemes] = await Promise.all([
      loadLessonPlans(),
      loadSchemes(),
    ]);
    setPlans(lessonPlans);
    setSchemes(savedSchemes);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function confirmDeleteLesson(plan: LessonPlan) {
    const confirmed = await confirmRemoval(
      'Delete lesson plan',
      `Delete ${plan.subject} ${plan.classLevel} Week ${plan.week}?`
    );
    if (!confirmed || !plan.id) return;
    await deleteLessonPlan(plan.id);
    await refresh();
    showToast({ message: 'Lesson plan deleted.' });
  }

  async function confirmDeleteScheme(scheme: SchemeOfWork) {
    const confirmed = await confirmRemoval(
      'Delete scheme',
      `Delete ${scheme.subject} ${scheme.classLevel} ${scheme.term}?`
    );
    if (!confirmed || !scheme.id) return;
    await deleteScheme(scheme.id);
    await refresh();
    showToast({ message: 'Scheme deleted.' });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Library</Text>
      <Text style={styles.sub}>
        Open full generated works, revisit them later, or save them as PDF.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Lesson Plans</Text>
        {plans.length ? (
          plans.map((plan) => (
            <Pressable
              key={plan.id}
              style={styles.card}
              onPress={() => router.push(`/lesson/${plan.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {plan.subject} - {plan.classLevel} - Week {plan.week}
                </Text>
                <Text style={styles.cardSub}>{plan.termTitle}</Text>
              </View>
              <Button
                title="PDF"
                variant="secondary"
                onPress={() => exportLessonPlanPdf(plan)}
                style={styles.cardButton}
              />
              <Button
                title="Delete"
                variant="danger"
                onPress={() => confirmDeleteLesson(plan)}
                style={styles.cardButton}
              />
            </Pressable>
          ))
        ) : (
          <EmptyState text="No lesson plans yet. Generate your first lesson plan from the Generate tab." />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Schemes</Text>
        {schemes.length ? (
          schemes.map((scheme) => (
            <Pressable
              key={scheme.id}
              style={styles.card}
              onPress={() => router.push(`/scheme/${scheme.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {scheme.subject} - {scheme.classLevel} - {scheme.term}
                </Text>
                <Text style={styles.cardSub}>
                  {scheme.weeks.length} weeks | {scheme.title}
                </Text>
              </View>
              <Button
                title="PDF"
                variant="secondary"
                onPress={() => exportSchemePdf(scheme)}
                style={styles.cardButton}
              />
              <Button
                title="Delete"
                variant="danger"
                onPress={() => confirmDeleteScheme(scheme)}
                style={styles.cardButton}
              />
            </Pressable>
          ))
        ) : (
          <EmptyState text="No saved schemes yet. Generate a scheme from the Schemes tab." />
        )}
      </View>
    </ScrollView>
  );
}

function confirmRemoval(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return Promise.resolve(window.confirm(message));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  cardSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  cardButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
});
