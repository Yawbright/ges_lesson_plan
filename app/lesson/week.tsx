import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { LessonPlanStack } from '@/components/LessonPlanTable';
import { PreviewActionButton, PreviewActions, PreviewHeader } from '@/components/PreviewChrome';
import { SelectField } from '@/components/SelectField';
import { useToast } from '@/components/ToastProvider';
import { translateLessonPlan } from '@/lib/ai';
import { exportLessonPlansPdf, shareLessonPlans } from '@/lib/export';
import { getLessonPlanBundleById, getLessonPlanById, saveLessonPlanBundle } from '@/lib/lessonStore';
import { LOCAL_LANGUAGE_OPTIONS } from '@/lib/options';
import { colors } from '@/theme/colors';
import type { LessonPlan, LessonPlanBundle } from '@/types/lessonPlan';

export default function LessonWeekDetailScreen() {
  const { showToast } = useToast();
  const { bundleId, ids } = useLocalSearchParams<{ bundleId?: string; ids?: string }>();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [bundle, setBundle] = useState<LessonPlanBundle | null>(null);
  const [localLanguage, setLocalLanguage] = useState('');
  const [translating, setTranslating] = useState(false);
  const lessonIds = useMemo(
    () => (ids ?? '').split(',').map((id) => id.trim()).filter(Boolean),
    [ids],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (bundleId) {
        const result = await getLessonPlanBundleById(bundleId);
        if (active) {
          setBundle(result);
          setPlans(result?.plans ?? []);
        }
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

  const canTranslate = plans.every((plan) => isGhanaianLanguageSubject(plan.subject));

  return (
    <View style={styles.container}>
      <PreviewHeader
        title={`Week Plan (${plans.length})`}
        onBack={() => router.back()}
        onShare={() => shareLessonPlans(plans)}
      />
      <LessonPlanStack plans={plans} />
      {canTranslate ? (
        <View style={styles.translatePanel}>
            <SelectField
              label="Translate week plan"
              value={localLanguage}
              options={LOCAL_LANGUAGE_OPTIONS}
              onChange={setLocalLanguage}
              helperText="Creates NLLB machine-translation drafts of the indicators and lesson phases."
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
                  const translatedPlans = await Promise.all(
                    plans.map((plan) => translateLessonPlan(plan, localLanguage)),
                  );
                  const savedBundle = await saveLessonPlanBundle(translatedPlans);
                  setBundle(savedBundle);
                  setPlans(savedBundle.plans);
                  if (savedBundle.id) {
                    router.replace(`/lesson/week?bundleId=${encodeURIComponent(savedBundle.id)}`);
                  }
                  showToast({ message: 'Translated week plan saved.' });
                } catch (err) {
                  Alert.alert('Translation failed', err instanceof Error ? err.message : 'Could not translate week plan.');
                } finally {
                  setTranslating(false);
                }
              }}
            />
        </View>
      ) : null}
      <PreviewActions>
        <PreviewActionButton title="Save as PDF" onPress={() => exportLessonPlansPdf(plans)} />
        {plans.map((plan, index) => (
          <PreviewActionButton
            key={plan.id ?? `${plan.week}-${plan.lessonNumber}-${index}`}
            title={`Notes L${plan.sessionIndex ?? index + 1}`}
            variant="secondary"
            onPress={() => router.push(`/tools/teaching-notes?lessonPlanId=${encodeURIComponent(plan.id ?? '')}`)}
          />
        ))}
      </PreviewActions>
    </View>
  );
}

function isGhanaianLanguageSubject(subject?: string) {
  return subject?.trim().toLowerCase() === 'ghanaian language';
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
