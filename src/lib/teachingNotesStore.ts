import { supabase } from './supabase';
import { cachedRequest, invalidateCache } from './cache';
import { withTimeout } from './async';
import {
  addDays,
  getCurrentUserId,
  loadGeneratedRetentionDays,
  loadLocalItems,
  slugify,
  writeLocalItems,
} from './generatedStore';
import type { TeachingNotes } from '@/types/teachingNotes';

const STORAGE_KEY = 'local-teaching-notes';
const CACHE_PREFIX = 'generated:teaching-notes';
const MAX_VERSION_SAVE_ATTEMPTS = 3;

export async function saveTeachingNotes(notes: TeachingNotes): Promise<TeachingNotes> {
  const userId = await getCurrentUserId();

  if (userId) {
    return saveTeachingNotesRemote(notes, userId);
  }

  const existing = await loadTeachingNotesForLesson(notes.lessonPlanId);
  const versionNumber = notes.versionNumber ?? (existing[0]?.versionNumber ?? 0) + 1;
  const normalized = normalizeTeachingNotes({ ...notes, versionNumber });
  const notesList = await loadLocalTeachingNotes();
  const next = [normalized, ...notesList.filter((item) => item.id !== normalized.id)];
  await writeTeachingNotes(next);
  invalidateCache(CACHE_PREFIX);
  return normalized;
}

export async function loadTeachingNotes(): Promise<TeachingNotes[]> {
  const userId = await getCurrentUserId();
  if (userId) {
    return cachedRequest(`${CACHE_PREFIX}:${userId}`, async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('saved_teaching_notes')
          .select('payload')
          .eq('user_id', userId)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false }),
        10000,
        'Saved teaching notes took too long to load.',
      );
      if (error) {
        if (isMissingTableError(error)) return [];
        throw error;
      }
      return (data ?? []).map((item) => normalizeTeachingNotes(item.payload as TeachingNotes));
    });
  }

  return loadLocalTeachingNotes();
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = (error.message ?? '').toLowerCase();
  return error.code === '42P01' || message.includes('saved_teaching_notes');
}

export async function loadTeachingNotesForLesson(lessonPlanId: string): Promise<TeachingNotes[]> {
  const userId = await getCurrentUserId();
  if (userId) {
    return cachedRequest(`${CACHE_PREFIX}:${userId}:lesson:${lessonPlanId}`, async () => {
      const { data, error } = await withTimeout(
        supabase
          .from('saved_teaching_notes')
          .select('payload')
          .eq('user_id', userId)
          .eq('lesson_plan_id', lessonPlanId)
          .gt('expires_at', new Date().toISOString())
          .order('version_number', { ascending: false })
          .order('created_at', { ascending: false }),
        10000,
        'Saved teaching note versions took too long to load.',
      );
      if (error) {
        if (isMissingTableError(error)) return [];
        throw error;
      }
      return (data ?? [])
        .map((item) => normalizeTeachingNotes(item.payload as TeachingNotes))
        .sort(compareNotesNewestFirst);
    });
  }

  const allNotes = await loadTeachingNotes();
  return allNotes
    .filter((item) => item.lessonPlanId === lessonPlanId)
    .sort(compareNotesNewestFirst);
}

export async function getLatestTeachingNotesForLesson(lessonPlanId: string): Promise<TeachingNotes | null> {
  const notes = await loadTeachingNotesForLesson(lessonPlanId);
  return notes[0] ?? null;
}

export async function getTeachingNotesById(id: string): Promise<TeachingNotes | null> {
  const userId = await getCurrentUserId();
  if (userId) {
    const { data, error } = await withTimeout(
      supabase
        .from('saved_teaching_notes')
        .select('payload')
        .eq('user_id', userId)
        .eq('id', id)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle(),
      10000,
      'Saved teaching notes took too long to load.',
    );
    if (error) {
      if (isMissingTableError(error)) return null;
      throw error;
    }
    return data?.payload ? normalizeTeachingNotes(data.payload as TeachingNotes) : null;
  }

  const allNotes = await loadTeachingNotes();
  return allNotes.find((item) => item.id === id) ?? null;
}

export async function deleteTeachingNotes(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (userId) {
    const { error } = await withTimeout(
      supabase.from('saved_teaching_notes').delete().eq('user_id', userId).eq('id', id),
      10000,
      'Teaching notes deletion took too long.',
    );
    if (error) throw error;
    invalidateCache(CACHE_PREFIX);
    return;
  }

  const notesList = await loadLocalTeachingNotes();
  await writeTeachingNotes(notesList.filter((item) => item.id !== id));
  invalidateCache(CACHE_PREFIX);
}

async function loadLocalTeachingNotes(): Promise<TeachingNotes[]> {
  return loadLocalItems(
    STORAGE_KEY,
    normalizeTeachingNotes,
    compareNotesNewestFirst,
    (item) => item.createdAt,
  );
}

function normalizeTeachingNotes(notes: TeachingNotes): TeachingNotes {
  const createdAt = notes.createdAt ?? new Date().toISOString();
  const versionNumber = notes.versionNumber ?? 1;
  const id =
    notes.id ??
    `${slugify(notes.subject)}-${notes.classLevel}-week-${notes.week}-${slugify(notes.lessonNumber)}-notes-v${versionNumber}-${Date.now()}`;

  return {
    ...notes,
    id,
    versionNumber,
    createdAt,
    updatedAt: notes.updatedAt ?? createdAt,
  };
}

function compareNotesNewestFirst(a: TeachingNotes, b: TeachingNotes) {
  const byVersion = (b.versionNumber ?? 0) - (a.versionNumber ?? 0);
  if (byVersion !== 0) return byVersion;
  return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
}

async function writeTeachingNotes(notes: TeachingNotes[]) {
  await writeLocalItems(STORAGE_KEY, notes);
}

async function saveTeachingNotesRemote(notes: TeachingNotes, userId: string): Promise<TeachingNotes> {
  for (let attempt = 0; attempt < MAX_VERSION_SAVE_ATTEMPTS; attempt += 1) {
    const existing = await loadTeachingNotesForLesson(notes.lessonPlanId);
    const versionNumber = notes.versionNumber ?? (existing[0]?.versionNumber ?? 0) + 1 + attempt;
    const normalized = normalizeTeachingNotes({ ...notes, versionNumber });
    const retentionDays = await loadGeneratedRetentionDays();
    const expiresAt = addDays(new Date(), retentionDays).toISOString();
    const { error } = await withTimeout(
      supabase.from('saved_teaching_notes').upsert({
        id: normalized.id,
        user_id: userId,
        lesson_plan_id: normalized.lessonPlanId,
        title: normalized.title,
        version_number: normalized.versionNumber,
        payload: normalized,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }),
      10000,
      'Teaching notes took too long to save.',
    );
    if (!error) {
      invalidateCache(CACHE_PREFIX);
      return normalized;
    }
    if (!isUniqueViolation(error) || notes.versionNumber) throw error;
    invalidateCache(CACHE_PREFIX);
  }

  throw new Error('Unable to assign a unique teaching notes version. Please try again.');
}

function isUniqueViolation(error: { code?: string }) {
  return error.code === '23505';
}
