import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { LessonPlanTable } from '@/components/LessonPlanTable';
import { useToast } from '@/components/ToastProvider';
import { exportLessonPlanPdf, shareLessonPlan } from '@/lib/export';
import { deleteLessonPlan, getLessonPlanById } from '@/lib/lessonStore';
import { colors } from '@/theme/colors';
import type { LessonPlan } from '@/types/lessonPlan';

export default function LessonDetailScreen() {
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const result = await getLessonPlanById(id);
      setPlan(result);
    }
    load();
  }, [id]);

  if (!plan) {
    return (
      <View style={styles.container}>
        <Button title="Lesson not found" variant="secondary" onPress={() => Alert.alert('Missing lesson', 'This saved lesson plan could not be found locally.')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LessonPlanTable plan={plan} />
      <View style={styles.actions}>
        <Button title="Save as PDF" onPress={() => exportLessonPlanPdf(plan)} />
        <Button title="Share" variant="secondary" onPress={() => shareLessonPlan(plan)} />
        <Button
          title="Delete"
          variant="danger"
          onPress={async () => {
            const confirmed = await confirmRemoval(
              'Delete lesson plan',
              `Delete ${plan.subject} ${plan.classLevel} Week ${plan.week}?`
            );
            if (!confirmed || !plan.id) return;
            await deleteLessonPlan(plan.id);
            showToast({ message: 'Lesson plan deleted.' });
            router.back();
          }}
        />
      </View>
    </View>
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
