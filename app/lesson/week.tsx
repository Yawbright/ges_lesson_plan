import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { LessonPlanStack } from '@/components/LessonPlanTable';
import { exportLessonPlansPdf, shareLessonPlans } from '@/lib/export';
import { getLessonPlanBundleById, getLessonPlanById } from '@/lib/lessonStore';
import { colors } from '@/theme/colors';
import type { LessonPlan } from '@/types/lessonPlan';

export default function LessonWeekDetailScreen() {
  const { bundleId, ids } = useLocalSearchParams<{ bundleId?: string; ids?: string }>();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const lessonIds = useMemo(
    () => (ids ?? '').split(',').map((id) => id.trim()).filter(Boolean),
    [ids],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (bundleId) {
        const bundle = await getLessonPlanBundleById(bundleId);
        if (active) setPlans(bundle?.plans ?? []);
        return;
      }
      if (!lessonIds.length) return;
      const results = await Promise.all(lessonIds.map((id) => getLessonPlanById(id)));
      if (active) {
        setPlans(results.filter(Boolean) as LessonPlan[]);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [bundleId, lessonIds]);

  if (!plans.length) {
    return (
      <View style={styles.container}>
        <Button
          title="Lessons not found"
          variant="secondary"
          onPress={() =>
            Alert.alert('Missing lessons', 'These saved lesson plans could not be found.')
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LessonPlanStack plans={plans} />
      <View style={styles.actions}>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
        <Button title="Share" variant="secondary" onPress={() => shareLessonPlans(plans)} />
        <Button title="Save as PDF" onPress={() => exportLessonPlansPdf(plans)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
});
