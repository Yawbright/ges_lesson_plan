import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'term-start-dates';

type TermStartDates = Record<string, string>;

export async function loadTermStartDate(input: {
  classLevel: string;
  term: string;
}): Promise<string> {
  const dates = await loadDates();
  return dates[getTermDateKey(input)] ?? '';
}

export async function saveTermStartDate(input: {
  classLevel: string;
  term: string;
  startDate: string;
}) {
  const dates = await loadDates();
  const key = getTermDateKey(input);

  if (input.startDate.trim()) {
    dates[key] = input.startDate.trim();
  } else {
    delete dates[key];
  }

  await storage.setItem(STORAGE_KEY, JSON.stringify(dates));
}

export function calculateWeekEnding(termStartDate: string, week: number): string {
  const start = parseDateOnly(termStartDate);
  if (!start || !Number.isInteger(week) || week < 1) return '';

  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() + (week - 1) * 7);

  const friday = new Date(weekStart);
  const day = friday.getDay();
  const daysUntilFriday = (5 - day + 7) % 7;
  friday.setDate(friday.getDate() + daysUntilFriday);

  return formatDisplayDate(friday);
}

function getTermDateKey(input: { classLevel: string; term: string }) {
  return `${input.classLevel.trim().toLowerCase()}::${input.term.trim().toLowerCase()}`;
}

async function loadDates(): Promise<TermStartDates> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as TermStartDates;
  } catch {
    return {};
  }
}

function parseDateOnly(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
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

