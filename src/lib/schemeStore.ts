import { normalizeSchemeWeek } from '@/lib/schemeWeek';
import { supabase } from './supabase';
import { defaultRuntimeSettings, loadRuntimeAppSettings } from './appSettings';
import { appStorage } from './storage';
import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeOfWork, SchemeWeek } from '@/types/scheme';

const STORAGE_KEY = 'local-schemes';
const FALLBACK_EXPIRY_DAYS = defaultRuntimeSettings.generatedFileRetention.days;

type SchemeMatchInput = {
  subject: string;
  classLevel: ClassLevel;
  term?: string;
};

type SchemeContext = {
  schemeId: string;
  title: string;
  subject: string;
  classLevel: ClassLevel;
  term: string;
  selectedWeek?: SchemeWeek;
  previousWeek?: SchemeWeek;
  nextWeek?: SchemeWeek;
  lessonFocusGuidance?: {
    allFocuses: string[];
    currentFocus?: string;
  };
};

export async function saveScheme(scheme: SchemeOfWork): Promise<SchemeOfWork> {
  const normalized = normalizeScheme(scheme);
  const userId = await getUserId();
  if (userId) {
    const retentionDays = await loadRetentionDays();
    const expiresAt = addDays(new Date(), retentionDays).toISOString();
    const { error } = await supabase.from('saved_schemes').upsert({
      id: normalized.id,
      user_id: userId,
      title: normalized.title,
      payload: normalized,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return normalized;
  }

  const schemes = await loadLocalSchemes();
  const next = [normalized, ...schemes.filter((item) => item.id !== normalized.id)];
  await writeSchemes(next);
  return normalized;
}

export async function loadSchemes(): Promise<SchemeOfWork[]> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase
      .from('saved_schemes')
      .select('payload')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((item) => normalizeScheme(item.payload as SchemeOfWork));
  }
  return loadLocalSchemes();
}

export async function findMatchingScheme(input: SchemeMatchInput): Promise<SchemeOfWork | null> {
  const matches = await loadMatchingSchemes(input);
  return matches[0] ?? null;
}

export async function loadMatchingSchemes(input: SchemeMatchInput): Promise<SchemeOfWork[]> {
  const normalizedSubject = normalizeText(input.subject);
  const normalizedTerm = normalizeTerm(input.term);

  const schemes = await loadSchemes();
  return schemes.filter((scheme) => {
    const sameSubject = normalizeText(scheme.subject) === normalizedSubject;
    const sameClass = scheme.classLevel === input.classLevel;
    const sameTerm = !normalizedTerm || normalizeTerm(scheme.term) === normalizedTerm;
    return sameSubject && sameClass && sameTerm;
  });
}

export async function getSchemeById(id: string): Promise<SchemeOfWork | null> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase
      .from('saved_schemes')
      .select('payload')
      .eq('user_id', userId)
      .eq('id', id)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data?.payload ? normalizeScheme(data.payload as SchemeOfWork) : null;
  }

  const schemes = await loadLocalSchemes();
  return schemes.find((scheme) => scheme.id === id) ?? null;
}

export async function deleteScheme(id: string): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const { error } = await supabase.from('saved_schemes').delete().eq('user_id', userId).eq('id', id);
    if (error) throw error;
    return;
  }

  const schemes = await loadLocalSchemes();
  const next = schemes.filter((scheme) => scheme.id !== id);
  await writeSchemes(next);
}

export function buildSchemeContext(scheme: SchemeOfWork, week: number): SchemeContext {
  const weeks = [...scheme.weeks].sort((a, b) => a.week - b.week);
  const index = weeks.findIndex((item) => item.week === week);
  const selectedWeek = index >= 0 ? weeks[index] : undefined;

  return {
    schemeId: scheme.id ?? '',
    title: scheme.title,
    subject: scheme.subject,
    classLevel: scheme.classLevel,
    term: scheme.term,
    selectedWeek,
    previousWeek: index > 0 ? weeks[index - 1] : undefined,
    nextWeek: index >= 0 && index < weeks.length - 1 ? weeks[index + 1] : undefined,
  };
}

export function normalizeTerm(term?: string): string {
  const value = normalizeText(term);

  if (!value) return '';
  if (value.includes('1')) return 'term 1';
  if (value.includes('first')) return 'term 1';
  if (value.includes('begin')) return 'term 1';
  if (value.includes('2')) return 'term 2';
  if (value.includes('second')) return 'term 2';
  if (value.includes('middle')) return 'term 2';
  if (value.includes('mid')) return 'term 2';
  if (value.includes('3')) return 'term 3';
  if (value.includes('third')) return 'term 3';
  if (value.includes('end')) return 'term 3';
  if (value.includes('final')) return 'term 3';

  return value;
}

async function loadLocalSchemes(): Promise<SchemeOfWork[]> {
  const raw = await appStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SchemeOfWork[];
    return parsed
      .map(normalizeScheme)
      .filter((item) => !isExpired(item.createdAt, FALLBACK_EXPIRY_DAYS))
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch {
    return [];
  }
}

function normalizeScheme(scheme: SchemeOfWork): SchemeOfWork {
  const createdAt = scheme.createdAt ?? new Date().toISOString();
  const id = scheme.id ?? `${normalizeText(scheme.subject)}-${scheme.classLevel}-${normalizeTerm(scheme.term)}-${createdAt}`;

  return {
    ...scheme,
    id,
    createdAt,
    title: scheme.title?.trim() || `${scheme.subject} Scheme of Work - ${scheme.classLevel} ${scheme.term}`,
    term: scheme.term?.trim() || 'Term 1',
    weeks: [...(scheme.weeks ?? [])]
      .filter((week) => Number.isFinite(week.week))
      .map(normalizeSchemeWeek)
      .sort((a, b) => a.week - b.week),
  };
}

async function writeSchemes(schemes: SchemeOfWork[]) {
  await appStorage.setItem(STORAGE_KEY, JSON.stringify(schemes));
}

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
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

function normalizeText(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}
