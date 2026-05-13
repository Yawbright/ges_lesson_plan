import { mathematicsExemplarsByIndicator } from '@/data/curriculum/mathematicsExemplars';
import { getWeekEntries } from './schemeWeek';
import type { LessonFocusGuidance } from './scienceExemplarGuidance';
import type { SchemeWeek } from '@/types/scheme';

export function buildMathematicsLessonFocusGuidance(input: {
  subject: string;
  classLevel: string;
  week?: SchemeWeek;
  sessionIndex?: number;
  sessionsPerWeek?: number;
}): LessonFocusGuidance | undefined {
  if (!isJhsMathematics(input.subject, input.classLevel) || !input.week) return undefined;

  const exemplarItems = getWeekEntries(input.week)
    .flatMap((entry) => extractIndicatorCodes(entry.indicator))
    .flatMap((code) => mathematicsExemplarsByIndicator[code]?.exemplars ?? []);

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

function buildThreeLessonFocuses(exemplars: string[]): string[] {
  if (exemplars.length >= 6) {
    return splitEvenly(exemplars, 3).map((group) => group.join(' '));
  }

  if (exemplars.length === 5) {
    return [joinFocus(exemplars, 0, 2), joinFocus(exemplars, 2, 4), joinFocus(exemplars, 4)];
  }

  if (exemplars.length === 4) {
    return [joinFocus(exemplars, 0, 1), joinFocus(exemplars, 1, 3), joinFocus(exemplars, 3)];
  }

  if (exemplars.length === 3) {
    return exemplars;
  }

  if (exemplars.length === 2) {
    return [
      exemplars[0],
      exemplars[1],
      `Consolidate and solve similar problems around: ${exemplars[0]} ${exemplars[1]}`,
    ];
  }

  return [
    exemplars[0],
    `Extend with guided worked examples around: ${exemplars[0]}`,
    `Consolidate with independent practice and assessment around: ${exemplars[0]}`,
  ];
}

function splitEvenly(values: string[], groups: number): string[][] {
  const result: string[][] = [];
  const size = Math.ceil(values.length / groups);

  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }

  while (result.length < groups) result.push([]);
  return result.slice(0, groups);
}

function joinFocus(exemplars: string[], start: number, end?: number): string {
  return exemplars.slice(start, end).join(' ');
}

function extractIndicatorCodes(value?: string): string[] {
  const indicator = value ?? '';
  const directCodes = indicator.match(/B[789](?:\.\d+){4}/g) ?? [];
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

function isJhsMathematics(subject: string, classLevel: string): boolean {
  return /mathematics|maths/i.test(subject) && ['B7', 'B8', 'B9'].includes(classLevel);
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
