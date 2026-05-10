import { appStorage } from './storage';

const STORAGE_KEY = 'subject-lesson-counts';

type SubjectLessonCounts = Record<string, string>;

export async function getLessonsPerWeekForSubject(subject: string): Promise<string | null> {
  const prefs = await loadPrefs();
  return prefs[normalizeSubject(subject)] ?? null;
}

export async function setLessonsPerWeekForSubject(
  subject: string,
  value: string
): Promise<void> {
  const key = normalizeSubject(subject);
  if (!key) return;

  const prefs = await loadPrefs();
  prefs[key] = value;
  await writePrefs(prefs);
}

async function loadPrefs(): Promise<SubjectLessonCounts> {
  const raw = await appStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as SubjectLessonCounts;
  } catch {
    return {};
  }
}

async function writePrefs(prefs: SubjectLessonCounts) {
  await appStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function normalizeSubject(subject: string) {
  return subject.trim().toLowerCase();
}
