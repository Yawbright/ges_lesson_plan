import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as SubjectLessonCounts;
  } catch {
    return {};
  }
}

async function writePrefs(prefs: SubjectLessonCounts) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function normalizeSubject(subject: string) {
  return subject.trim().toLowerCase();
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
