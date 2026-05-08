import type { SchemeWeek, SchemeWeekEntry } from '@/types/scheme';

export function getWeekEntries(week: SchemeWeek): SchemeWeekEntry[] {
  if (Array.isArray(week.entries) && week.entries.length) {
    return week.entries.filter(hasMeaningfulContent);
  }

  const fallbackEntry: SchemeWeekEntry = {
    strand: week.strand,
    subStrand: week.subStrand,
    contentStandard: week.contentStandard,
    indicator: week.indicator,
    topic: week.topic,
    resources: week.resources,
  };

  return hasMeaningfulContent(fallbackEntry) ? [fallbackEntry] : [];
}

export function getWeekPrimaryEntry(week: SchemeWeek): SchemeWeekEntry | undefined {
  return getWeekEntries(week)[0];
}

export function getWeekTopic(week: SchemeWeek): string {
  return (
    cleanText(week.topic) ||
    cleanText(week.theme) ||
    cleanText(getWeekPrimaryEntry(week)?.topic) ||
    joinDistinct(
      getWeekEntries(week)
        .map((entry) => entry.topic)
        .filter(Boolean)
        .slice(0, 3) as string[],
      ' | '
    )
  );
}

export function getWeekStrandSummary(week: SchemeWeek): string {
  return joinDistinct(
    getWeekEntries(week)
      .map((entry) => entry.strand)
      .filter(Boolean) as string[],
    ' | '
  );
}

export function getWeekSubStrandSummary(week: SchemeWeek): string {
  return joinDistinct(
    getWeekEntries(week)
      .map((entry) => entry.subStrand)
      .filter(Boolean) as string[],
    ' | '
  );
}

export function getWeekResourceList(week: SchemeWeek): string[] {
  const merged = [
    ...(Array.isArray(week.resources) ? week.resources : []),
    ...getWeekEntries(week).flatMap((entry) =>
      Array.isArray(entry.resources) ? entry.resources : []
    ),
  ];

  return uniqueStrings(merged);
}

export function normalizeSchemeWeek(week: SchemeWeek): SchemeWeek {
  const entries = getWeekEntries(week).map((entry) => ({
    strand: cleanText(entry.strand),
    subStrand: cleanText(entry.subStrand),
    contentStandard: cleanText(entry.contentStandard),
    indicator: cleanText(entry.indicator),
    topic: cleanText(entry.topic),
    resources: uniqueStrings(entry.resources ?? []),
  }));

  const primaryEntry = entries[0];

  return {
    ...week,
    theme: cleanText(week.theme),
    topic: cleanText(week.topic) || cleanText(week.theme) || cleanText(primaryEntry?.topic),
    strand: cleanText(week.strand) || cleanText(primaryEntry?.strand),
    subStrand: cleanText(week.subStrand) || cleanText(primaryEntry?.subStrand),
    contentStandard:
      cleanText(week.contentStandard) || cleanText(primaryEntry?.contentStandard),
    indicator: cleanText(week.indicator) || cleanText(primaryEntry?.indicator),
    resources: getWeekResourceList({
      ...week,
      entries,
    }),
    entries: entries.length > 1 ? entries : undefined,
  };
}

function hasMeaningfulContent(entry: SchemeWeekEntry): boolean {
  return Boolean(
    cleanText(entry.topic) ||
      cleanText(entry.strand) ||
      cleanText(entry.subStrand) ||
      cleanText(entry.contentStandard) ||
      cleanText(entry.indicator)
  );
}

function cleanText(value?: string): string {
  return (value ?? '').trim();
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = cleanText(value);
    const key = cleaned.toLowerCase();
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function joinDistinct(values: string[], separator: string): string {
  return uniqueStrings(values).join(separator);
}
