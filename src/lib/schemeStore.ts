import { normalizeSchemeWeek } from '@/lib/schemeWeek';
import { supabase } from './supabase';
import { cachedRequest, invalidateCache } from './cache';
import { withTimeout } from './async';
import {
  addDays,
  getCurrentUserId,
  loadGeneratedRetentionDays,
  loadLocalItems,
  writeLocalItems,
} from './generatedStore';
import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeOfWork, SchemeWeek } from '@/types/scheme';

const STORAGE_KEY = 'local-schemes';
const CACHE_PREFIX = 'generated:schemes';

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
  const userId = await getCurrentUserId();
  if (userId) {
    const retentionDays = await loadGeneratedRetentionDays();
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
    invalidateCache(CACHE_PREFIX);
    return normalized;
  }

  const schemes = await loadLocalSchemes();
  const next = [normalized, ...schemes.filter((item) => item.id !== normalized.id)];
  await writeSchemes(next);
  invalidateCache(CACHE_PREFIX);
  return normalized;
}

export async function loadSchemes(): Promise<SchemeOfWork[]> {
  const userId = await getCurrentUserId();
  if (userId) {
    return cachedRequest(`${CACHE_PREFIX}:${userId}`, async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('saved_schemes')
          .select('payload')
          .eq('user_id', userId)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false }),
        10000,
        'Saved schemes took too long to load.',
      );
      if (error) throw error;
      return (data ?? []).map((item) => normalizeScheme(item.payload as SchemeOfWork));
    });
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
  const userId = await getCurrentUserId();
  if (userId) {
    const { data, error } = await withTimeout(
      supabase
        .from('saved_schemes')
        .select('payload')
        .eq('user_id', userId)
        .eq('id', id)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle(),
      10000,
      'Saved scheme took too long to load.',
    );
    if (error) throw error;
    return data?.payload ? normalizeScheme(data.payload as SchemeOfWork) : null;
  }

  const schemes = await loadLocalSchemes();
  return schemes.find((scheme) => scheme.id === id) ?? null;
}

export async function deleteScheme(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (userId) {
    const { error } = await withTimeout(
      supabase.from('saved_schemes').delete().eq('user_id', userId).eq('id', id),
      10000,
      'Saved scheme deletion took too long.',
    );
    if (error) throw error;
    invalidateCache(CACHE_PREFIX);
    return;
  }

  const schemes = await loadLocalSchemes();
  const next = schemes.filter((scheme) => scheme.id !== id);
  await writeSchemes(next);
  invalidateCache(CACHE_PREFIX);
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
  return loadLocalItems(
    STORAGE_KEY,
    normalizeScheme,
    (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
    (item) => item.createdAt,
  );
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
  await writeLocalItems(STORAGE_KEY, schemes);
}

function normalizeText(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}
