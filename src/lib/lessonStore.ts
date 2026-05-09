import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { LessonPlan } from '@/types/lessonPlan';

const STORAGE_KEY = 'local-lesson-plans';
const EXPIRY_DAYS = 15;

export async function saveLessonPlan(plan: LessonPlan): Promise<LessonPlan> {
  const normalized = normalizeLessonPlan(plan);
  const userId = await getUserId();
  if (userId) {
    const expiresAt = addDays(new Date(), EXPIRY_DAYS).toISOString();
    const { error } = await supabase.from('saved_lesson_plans').upsert({
      id: normalized.id,
      user_id: userId,
      title: buildTitle(normalized),
      payload: normalized,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return normalized;
  }

  const plans = await loadLocalLessonPlans();
  const next = [normalized, ...plans.filter((item) => item.id !== normalized.id)];
  await writeLessonPlans(next);
  return normalized;
}

export async function loadLessonPlans(): Promise<LessonPlan[]> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase
      .from('saved_lesson_plans')
      .select('payload')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((item) => normalizeLessonPlan(item.payload as LessonPlan));
  }
  return loadLocalLessonPlans();
}

export async function getLessonPlanById(id: string): Promise<LessonPlan | null> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase
      .from('saved_lesson_plans')
      .select('payload')
      .eq('user_id', userId)
      .eq('id', id)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data?.payload ? normalizeLessonPlan(data.payload as LessonPlan) : null;
  }

  const plans = await loadLocalLessonPlans();
  return plans.find((plan) => plan.id === id) ?? null;
}

export async function deleteLessonPlan(id: string): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const { error } = await supabase.from('saved_lesson_plans').delete().eq('user_id', userId).eq('id', id);
    if (error) throw error;
    return;
  }

  const plans = await loadLocalLessonPlans();
  const next = plans.filter((plan) => plan.id !== id);
  await writeLessonPlans(next);
}

async function loadLocalLessonPlans(): Promise<LessonPlan[]> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as LessonPlan[];
    return parsed
      .map(normalizeLessonPlan)
      .filter((item) => !isExpired(item.createdAt))
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch {
    return [];
  }
}

function normalizeLessonPlan(plan: LessonPlan): LessonPlan {
  const createdAt = plan.createdAt ?? new Date().toISOString();
  const lessonSegment =
    plan.sessionIndex && plan.sessionsPerWeek
      ? `lesson-${plan.sessionIndex}-of-${plan.sessionsPerWeek}`
      : slugify(plan.lessonNumber) || 'lesson';
  const id =
    plan.id ??
    `${slugify(plan.subject)}-${plan.classLevel}-${plan.week}-${lessonSegment}-${slugify(plan.termTitle)}-${createdAt}`;

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

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function buildTitle(plan: LessonPlan) {
  return `${plan.subject} ${plan.classLevel} Week ${plan.week}`;
}

function isExpired(createdAt?: string) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() > EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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
