import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LessonPlan } from '@/types/lessonPlan';

const STORAGE_KEY = 'local-lesson-plans';

export async function saveLessonPlan(plan: LessonPlan): Promise<LessonPlan> {
  const plans = await loadLessonPlans();
  const normalized = normalizeLessonPlan(plan);
  const next = [normalized, ...plans.filter((item) => item.id !== normalized.id)];
  await writeLessonPlans(next);
  return normalized;
}

export async function loadLessonPlans(): Promise<LessonPlan[]> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as LessonPlan[];
    return parsed
      .map(normalizeLessonPlan)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch {
    return [];
  }
}

export async function getLessonPlanById(id: string): Promise<LessonPlan | null> {
  const plans = await loadLessonPlans();
  return plans.find((plan) => plan.id === id) ?? null;
}

export async function deleteLessonPlan(id: string): Promise<void> {
  const plans = await loadLessonPlans();
  const next = plans.filter((plan) => plan.id !== id);
  await writeLessonPlans(next);
}

function normalizeLessonPlan(plan: LessonPlan): LessonPlan {
  const createdAt = plan.createdAt ?? new Date().toISOString();
  const id =
    plan.id ??
    `${slugify(plan.subject)}-${plan.classLevel}-${plan.week}-${slugify(plan.termTitle)}-${createdAt}`;

  return {
    ...plan,
    id,
    createdAt,
    updatedAt: plan.updatedAt ?? createdAt,
  };
}

async function writeLessonPlans(plans: LessonPlan[]) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function slugify(value?: string) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
};
