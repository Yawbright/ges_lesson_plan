import { supabase } from './supabase';
import { defaultRuntimeSettings, loadRuntimeAppSettings } from './appSettings';
import { appStorage } from './storage';
import type { TeachingNotes } from '@/types/teachingNotes';

const STORAGE_KEY = 'local-teaching-notes';
const FALLBACK_EXPIRY_DAYS = defaultRuntimeSettings.generatedFileRetention.days;

export async function saveTeachingNotes(notes: TeachingNotes): Promise<TeachingNotes> {
  const userId = await getUserId();
  const existing = await loadTeachingNotesForLesson(notes.lessonPlanId);
  const versionNumber = notes.versionNumber ?? (existing[0]?.versionNumber ?? 0) + 1;
  const normalized = normalizeTeachingNotes({ ...notes, versionNumber });

  if (userId) {
    const retentionDays = await loadRetentionDays();
    const expiresAt = addDays(new Date(), retentionDays).toISOString();
    const { error } = await supabase.from('saved_teaching_notes').upsert({
      id: normalized.id,
      user_id: userId,
      lesson_plan_id: normalized.lessonPlanId,
      title: normalized.title,
      version_number: normalized.versionNumber,
      payload: normalized,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return normalized;
  }

  const notesList = await loadLocalTeachingNotes();
  const next = [normalized, ...notesList.filter((item) => item.id !== normalized.id)];
  await writeTeachingNotes(next);
  return normalized;
}

export async function loadTeachingNotes(): Promise<TeachingNotes[]> {
  const userId = await getUserId();
  if (userId) {
    const { data, error } = await supabase
      .from('saved_teaching_notes')
      .select('payload')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) {
      if (isMissingTableError(error)) return [];
      throw error;
    }
    return (data ?? []).map((item) => normalizeTeachingNotes(item.payload as TeachingNotes));
  }

  return loadLocalTeachingNotes();
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = (error.message ?? '').toLowerCase();
  return error.code === '42P01' || message.includes('saved_teaching_notes');
}

export async function loadTeachingNotesForLesson(lessonPlanId: string): Promise<TeachingNotes[]> {
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
  const allNotes = await loadTeachingNotes();
  return allNotes.find((item) => item.id === id) ?? null;
}

export async function deleteTeachingNotes(id: string): Promise<void> {
  const userId = await getUserId();
  if (userId) {
    const { error } = await supabase.from('saved_teaching_notes').delete().eq('user_id', userId).eq('id', id);
    if (error) throw error;
    return;
  }

  const notesList = await loadLocalTeachingNotes();
  await writeTeachingNotes(notesList.filter((item) => item.id !== id));
}

async function loadLocalTeachingNotes(): Promise<TeachingNotes[]> {
  const raw = await appStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as TeachingNotes[];
    return parsed
      .map(normalizeTeachingNotes)
      .filter((item) => !isExpired(item.createdAt, FALLBACK_EXPIRY_DAYS))
      .sort(compareNotesNewestFirst);
  } catch {
    return [];
  }
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
  await appStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
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

function slugify(value?: string) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
