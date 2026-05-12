import { supabase } from './supabase';
import { defaultRuntimeSettings, loadRuntimeAppSettings } from './appSettings';
import { appStorage } from './storage';
import type { LessonPlan, LessonPlanBundle, SavedLessonWork } from '@/types/lessonPlan';

const STORAGE_KEY = 'local-lesson-plans';
const FALLBACK_EXPIRY_DAYS = defaultRuntimeSettings.generatedFileRetention.days;

export async function saveLessonPlan(plan: LessonPlan): Promise<LessonPlan> {
  const normalized = normalizeLessonPlan(plan);
  await saveLessonWork(normalized);
  return normalized;
}

export async function saveLessonPlanBundle(plans: LessonPlan[]): Promise<LessonPlanBundle> {
  const normalized = normalizeLessonPlanBundle(plans);
  await saveLessonWork(normalized);
  return normalized;
}

async function saveLessonWork(work: SavedLessonWork): Promise<void> {
  const normalized = normalizeLessonWork(work);
  const userId = await getUserId();
  if (userId) {
    const retentionDays = await loadRetentionDays();
    const expiresAt = addDays(new Date(), retentionDays).toISOString();
    const { error } = await supabase.from('saved_lesson_plans').upsert({
      id: normalized.id,
      user_id: userId,
      title: buildTitle(normalized),
      payload: normalized,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return;
  }

  const works = await loadLocalLessonWorks();
  const next = [normalized, ...works.filter((item) => item.id !== normalized.id)];
  await writeLessonWorks(next);
}

export async function loadLessonPlans(): Promise<LessonPlan[]> {
  const works = await loadLessonWorks();
  return works.filter(isLessonPlan);
}

export async function loadLessonWorks(): Promise<SavedLessonWork[]> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase
      .from('saved_lesson_plans')
      .select('payload')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? [])
      .map((item) => normalizeLessonWork(item.payload as SavedLessonWork));
  }
  return loadLocalLessonWorks();
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
    if (!data?.payload) return null;
    const work = normalizeLessonWork(data.payload as SavedLessonWork);
    return isLessonPlan(work) ? work : null;
  }

  const works = await loadLocalLessonWorks();
  const work = works.find((item) => item.id === id);
  return work && isLessonPlan(work) ? work : null;
}

export async function getLessonPlanBundleById(id: string): Promise<LessonPlanBundle | null> {
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
    if (!data?.payload) return null;
    const work = normalizeLessonWork(data.payload as SavedLessonWork);
    return isLessonPlanBundle(work) ? work : null;
  }

  const works = await loadLocalLessonWorks();
  const work = works.find((item) => item.id === id);
  return work && isLessonPlanBundle(work) ? work : null;
}

export async function deleteLessonPlan(id: string): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const { error } = await supabase.from('saved_lesson_plans').delete().eq('user_id', userId).eq('id', id);
    if (error) throw error;
    return;
  }

  const works = await loadLocalLessonWorks();
  const next = works.filter((work) => work.id !== id);
  await writeLessonWorks(next);
}

async function loadLocalLessonWorks(): Promise<SavedLessonWork[]> {
  const raw = await appStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SavedLessonWork[];
    return parsed
      .map(normalizeLessonWork)
      .filter((item) => !isExpired(item.createdAt, FALLBACK_EXPIRY_DAYS))
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch {
    return [];
  }
}

function normalizeLessonWork(work: SavedLessonWork): SavedLessonWork {
  return isLessonPlanBundle(work) ? normalizeLessonPlanBundle(work.plans, work) : normalizeLessonPlan(work as LessonPlan);
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

function normalizeLessonPlanBundle(plans: LessonPlan[], bundle?: Partial<LessonPlanBundle>): LessonPlanBundle {
  const normalizedPlans = plans.map(normalizeLessonPlan);
  const first = normalizedPlans[0];
  const createdAt = bundle?.createdAt ?? first?.createdAt ?? new Date().toISOString();
  const lessonCount = normalizedPlans.length;
  const subject = bundle?.subject ?? first?.subject ?? 'Lesson';
  const classLevel = bundle?.classLevel ?? first?.classLevel ?? 'B7';
  const week = bundle?.week ?? first?.week ?? 1;
  const termTitle = bundle?.termTitle ?? first?.termTitle ?? '';
  const weekTitle = bundle?.weekTitle ?? first?.weekTitle ?? `WEEK ${week}`;
  const title = bundle?.title ?? `${subject} ${classLevel} Week ${week} (${lessonCount} lessons)`;
  const id =
    bundle?.id ??
    `${slugify(subject)}-${classLevel}-${week}-week-plan-${lessonCount}-lessons-${slugify(termTitle)}-${createdAt}`;

  return {
    kind: 'bundle',
    id,
    title,
    subject,
    classLevel,
    termTitle,
    week,
    weekTitle,
    lessonCount,
    plans: normalizedPlans,
    createdAt,
    updatedAt: bundle?.updatedAt ?? createdAt,
  };
}

async function writeLessonWorks(works: SavedLessonWork[]) {
  await appStorage.setItem(STORAGE_KEY, JSON.stringify(works));
}

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

function buildTitle(work: SavedLessonWork) {
  if (isLessonPlanBundle(work)) return work.title;
  return `${work.subject} ${work.classLevel} Week ${work.week}`;
}

async function loadRetentionDays() {
  const settings = await loadRuntimeAppSettings();
  return Math.max(1, Math.round(settings.generatedFileRetention.days || FALLBACK_EXPIRY_DAYS));
}

function isExpired(createdAt: string | undefined, days: number) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() > days * 24 * 60 * 60 * 1000;
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

function isLessonPlanBundle(work: SavedLessonWork): work is LessonPlanBundle {
  return (work as LessonPlanBundle).kind === 'bundle' && Array.isArray((work as LessonPlanBundle).plans);
}

function isLessonPlan(work: SavedLessonWork): work is LessonPlan {
  return !isLessonPlanBundle(work);
}
