import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { LessonPlanTable } from '@/components/LessonPlanTable';
import { PreviewActionButton, PreviewActions, PreviewHeader } from '@/components/PreviewChrome';
import { SelectField } from '@/components/SelectField';
import { useToast } from '@/components/ToastProvider';
import { translateLessonPlan } from '@/lib/ai';
import { exportLessonPlanPdf, shareLessonPlan } from '@/lib/export';
import { deleteLessonPlan, getLessonPlanById, saveLessonPlan } from '@/lib/lessonStore';
import { LOCAL_LANGUAGE_OPTIONS } from '@/lib/options';
import { colors } from '@/theme/colors';
import type { LessonPlan } from '@/types/lessonPlan';

export default function LessonDetailScreen() {
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [localLanguage, setLocalLanguage] = useState('');
  const [translating, setTranslating] = useState(false);

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

  const canTranslate = isGhanaianLanguageSubject(plan.subject);

  return (
    <View style={styles.container}>
      <PreviewHeader
        title="Lesson Plan"
        onBack={() => router.back()}
        onShare={() => shareLessonPlan(plan)}
      />
      <LessonPlanTable plan={plan} />
      {canTranslate ? (
        <View style={styles.translatePanel}>
            <SelectField
              label="Translate lesson plan"
              value={localLanguage}
              options={LOCAL_LANGUAGE_OPTIONS}
              onChange={setLocalLanguage}
              helperText="Creates a new AI-draft copy of this lesson plan in the selected Ghanaian language."
            />
            <Button
              title="Create translated copy"
              variant="secondary"
              loading={translating}
              onPress={async () => {
                if (!localLanguage) {
                  Alert.alert('Choose language', 'Select a local language first.');
                  return;
                }
                setTranslating(true);
                try {
                  const translated = await translateLessonPlan(plan, localLanguage);
                  const saved = await saveLessonPlan(translated);
                  setPlan(saved);
                  showToast({ message: 'Translated lesson plan saved.' });
                  if (saved.id) {
                    router.replace(`/lesson/${encodeURIComponent(saved.id)}`);
                  }
                } catch (err) {
                  Alert.alert('Translation failed', err instanceof Error ? err.message : 'Could not translate lesson plan.');
                } finally {
                  setTranslating(false);
                }
              }}
            />
        </View>
      ) : null}
      <PreviewActions>
        <PreviewActionButton title="Save as PDF" onPress={() => exportLessonPlanPdf(plan)} />
        <PreviewActionButton title="Teaching Notes" variant="secondary" onPress={() => router.push(`/tools/teaching-notes?lessonPlanId=${encodeURIComponent(plan.id ?? '')}`)} />
        <PreviewActionButton
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
      </PreviewActions>
    </View>
  );
}

function isGhanaianLanguageSubject(subject?: string) {
  return subject?.trim().toLowerCase() === 'ghanaian language';
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
  translatePanel: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
