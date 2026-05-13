import { englishExemplarsByIndicator } from '@/data/curriculum/englishExemplars';
import { getWeekEntries } from './schemeWeek';
import type { LessonFocusGuidance } from './scienceExemplarGuidance';
import type { SchemeWeek, SchemeWeekEntry } from '@/types/scheme';

export function buildEnglishLessonSupportGuidance(input: {
  subject: string;
  classLevel: string;
  week?: SchemeWeek;
  sessionIndex?: number;
  sessionsPerWeek?: number;
}): LessonFocusGuidance | undefined {
  if (!isJhsEnglish(input.subject, input.classLevel) || !input.week) return undefined;

  const entries = getWeekEntries(input.week);
  if (!entries.length) return undefined;

  const entryGuidance = entries
    .map((entry) => ({
      entry,
      support: getSupportForEntry(entry),
    }))
    .filter((item) => item.support.length);

  if (!entryGuidance.length) return undefined;

  const allFocuses = entryGuidance.map(
    ({ entry, support }) =>
      `${entry.strand || 'English'}${entry.subStrand ? ` - ${entry.subStrand}` : ''}: ${support.join(' ')}`
  );
  const entryIndex = Math.min(
    Math.max((input.sessionIndex ?? 1) - 1, 0),
    Math.max(entryGuidance.length - 1, 0)
  );

  return {
    allFocuses,
    currentFocus: allFocuses[entryIndex],
  };
}

function getSupportForEntry(entry: SchemeWeekEntry): string[] {
  const codes = extractIndicatorCodes(entry.indicator);
  const directSupport = codes.flatMap((code) => englishExemplarsByIndicator[code]?.exemplars ?? []);
  if (directSupport.length) return uniqueStrings(directSupport).slice(0, 6);

  const standardCode = extractStandardCode(entry.contentStandard);
  if (!standardCode) return [];

  const entryTokens = tokenize([entry.topic, entry.indicator, entry.subStrand].join(' '));
  const candidates = Object.entries(englishExemplarsByIndicator)
    .filter(([code]) => code.startsWith(`${standardCode}.`))
    .map(([code, record]) => ({
      code,
      support: record.exemplars,
      score: countSharedTokens(entryTokens, tokenize([record.indicator, ...record.exemplars].join(' '))),
    }))
    .sort((a, b) => b.score - a.score);

  const best = candidates[0];
  if (!best) return [];
  return best.support.slice(0, 6);
}

function extractIndicatorCodes(value?: string): string[] {
  const indicator = value ?? '';
  const directCodes = indicator.match(/B[789]\/JHS[123](?:\.\d+){4}/g) ?? [];
  const expanded = [...directCodes];

  for (const code of directCodes) {
    const rangeMatch = indicator.match(new RegExp(`${escapeRegExp(code)}-(?:(\\d+)\\.)?(\\d+)`));
    if (!rangeMatch) continue;

    const parts = code.split('.');
    const firstIndicator = Number(parts[4]);
    const lastIndicator = Number(rangeMatch[2]);
    if (!Number.isFinite(firstIndicator) || !Number.isFinite(lastIndicator)) continue;

    const prefix = parts.slice(0, 4).join('.');
    if (lastIndicator >= firstIndicator && lastIndicator - firstIndicator < 20) {
      for (let current = firstIndicator + 1; current <= lastIndicator; current += 1) {
        expanded.push(`${prefix}.${current}`);
      }
    }
  }

  return uniqueStrings(expanded);
}

function extractStandardCode(value?: string): string {
  return value?.match(/B[789]\/JHS[123](?:\.\d+){3}/)?.[0] ?? '';
}

function isJhsEnglish(subject: string, classLevel: string): boolean {
  return /english/i.test(subject) && ['B7', 'B8', 'B9'].includes(classLevel);
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 3 && !STOP_WORDS.has(token));
}

function countSharedTokens(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return left.reduce((total, token) => total + (rightSet.has(token) ? 1 : 0), 0);
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = value.trim();
    const key = cleaned.toLowerCase();
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const STOP_WORDS = new Set([
  'with',
  'from',
  'that',
  'this',
  'their',
  'them',
  'into',
  'using',
  'including',
  'read',
  'write',
  'texts',
  'text',
  'language',
  'english',
]);
