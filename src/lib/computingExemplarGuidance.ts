import { computingExemplarsByIndicator } from '@/data/curriculum/computingExemplars';
import { getWeekEntries } from './schemeWeek';
import type { LessonFocusGuidance } from './scienceExemplarGuidance';
import type { SchemeWeek } from '@/types/scheme';

export function buildComputingLessonFocusGuidance(input: {
  subject: string;
  classLevel: string;
  week?: SchemeWeek;
  sessionIndex?: number;
  sessionsPerWeek?: number;
}): LessonFocusGuidance | undefined {
  if (!isJhsComputing(input.subject, input.classLevel) || !input.week) return undefined;

  const entries = getWeekEntries(input.week);
  const directCodes = entries.flatMap((entry) => extractIndicatorCodes(entry.indicator));
  const candidateCodes = directCodes.length
    ? directCodes
    : entries.flatMap((entry) => getBestCodesForStandard(entry.contentStandard, entry));

  const exemplarItems = uniqueStrings(candidateCodes)
    .flatMap((code) => computingExemplarsByIndicator[code]?.exemplars ?? []);

  const uniqueExemplars = uniqueStrings(exemplarItems);
  if (!uniqueExemplars.length) return undefined;

  const allFocuses = buildThreeLessonFocuses(uniqueExemplars);
  const focusIndex = Math.min(
    Math.max((input.sessionIndex ?? 1) - 1, 0),
    Math.max(allFocuses.length - 1, 0)
  );

  return {
    allFocuses,
    currentFocus: allFocuses[focusIndex],
  };
}

function getBestCodesForStandard(
  contentStandard: string | undefined,
  entry: ReturnType<typeof getWeekEntries>[number]
): string[] {
  const standardCode = extractStandardCode(contentStandard);
  if (!standardCode) return [];

  const candidates = Object.entries(computingExemplarsByIndicator)
    .filter(([code]) => code.startsWith(`${standardCode}.`))
    .map(([code, record]) => ({
      code,
      score: countSharedTokens(
        tokenize([entry.topic, entry.indicator, entry.subStrand].join(' ')),
        tokenize([record.indicator, ...record.exemplars].join(' '))
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const bestScore = candidates[0]?.score ?? 0;
  if (bestScore <= 0) return candidates.map((item) => item.code);
  return candidates.filter((item) => item.score === bestScore).map((item) => item.code);
}

function buildThreeLessonFocuses(exemplars: string[]): string[] {
  if (exemplars.length >= 6) {
    return [joinFocus(exemplars, 0, 2), joinFocus(exemplars, 2, 4), joinFocus(exemplars, 4)];
  }

  if (exemplars.length === 5) {
    return [joinFocus(exemplars, 0, 2), joinFocus(exemplars, 2, 4), joinFocus(exemplars, 4)];
  }

  if (exemplars.length === 4) {
    return [joinFocus(exemplars, 0, 1), joinFocus(exemplars, 1, 3), joinFocus(exemplars, 3)];
  }

  if (exemplars.length === 3) return exemplars;

  if (exemplars.length === 2) {
    return [
      exemplars[0],
      exemplars[1],
      `Consolidate with hands-on practice, troubleshooting or a short digital artefact: ${exemplars[0]} ${exemplars[1]}`,
    ];
  }

  return [
    exemplars[0],
    `Extend through guided demonstration, practice and troubleshooting: ${exemplars[0]}`,
    `Consolidate by creating, presenting or improving a small computing artefact: ${exemplars[0]}`,
  ];
}

function joinFocus(exemplars: string[], start: number, end?: number): string {
  return exemplars.slice(start, end).join(' ');
}

function extractIndicatorCodes(value?: string): string[] {
  const indicator = value ?? '';
  const directCodes = indicator.match(/B[789](?:\/JHS[123])?(?:\.\d+){4}/g) ?? [];
  const expanded = [...directCodes];

  for (const code of directCodes) {
    const rangeMatch = indicator.match(new RegExp(`${escapeRegExp(code)}-(?:\\d+\\.)*(\\d+)`));
    if (!rangeMatch) continue;

    const parts = code.split('.');
    const firstIndicator = Number(parts[4]);
    const lastIndicator = Number(rangeMatch[1]);
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
  return value?.match(/B[789](?:\/JHS[123])?(?:\.\d+){3}/)?.[0] ?? '';
}

function isJhsComputing(subject: string, classLevel: string): boolean {
  return /computing/i.test(subject) && ['B7', 'B8', 'B9'].includes(classLevel);
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
  'explain',
  'examine',
  'discuss',
  'identify',
  'demonstrate',
  'describe',
]);
