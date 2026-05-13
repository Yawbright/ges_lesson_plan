import { getExplicitCurriculumYearWeeks } from '@/lib/curriculum';
import { getWeekEntries } from '@/lib/schemeWeek';
import { englishExemplarsByIndicator } from '@/data/curriculum/englishExemplars';
import { mathematicsExemplarsByIndicator } from '@/data/curriculum/mathematicsExemplars';
import { scienceExemplarsByIndicator } from '@/data/curriculum/scienceExemplars';
import { socialStudiesExemplarsByIndicator } from '@/data/curriculum/socialStudiesExemplars';
import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeOfWork, SchemeWeek, SchemeWeekEntry } from '@/types/scheme';

export type BuilderMode = 'quick' | 'detailed';

export type CurriculumOption = {
  label: string;
  value: string;
};

export type CurriculumEntryOption = SchemeWeekEntry & {
  id: string;
  sourceWeek: number;
  sourceTerm: string;
};

export type BuilderSelection = {
  strand?: string;
  subStrand?: string;
  contentStandard?: string;
};

export function isLanguageSubject(subject: string): boolean {
  const normalized = normalizeText(subject);
  return normalized.includes('english') || normalized.includes('ghanaian language');
}

export function getBuilderCurriculumEntries(input: {
  subject: string;
  classLevel: ClassLevel;
  term?: string;
  includeFullYear?: boolean;
}): CurriculumEntryOption[] {
  const normalizedTerm = normalizeTerm(input.term);
  const weeks = getExplicitCurriculumYearWeeks({
    subject: input.subject,
    classLevel: input.classLevel,
  });

  return weeks
    .filter((week) => input.includeFullYear || normalizeTerm(week.sourceTerm) === normalizedTerm)
    .flatMap((week) =>
      getWeekEntries(week).map((entry, index) => ({
        ...entry,
        strand: getBuilderStrandLabel(input.subject, entry.strand),
        exemplars: getMappedExemplars(input.subject, entry),
        id: [
          week.sourceTerm,
          week.week,
          index,
          getBuilderStrandLabel(input.subject, entry.strand),
          entry.subStrand,
          entry.contentStandard,
          entry.indicator,
        ]
          .map((part) => normalizeText(String(part ?? '')))
          .join('|'),
        sourceWeek: week.week,
        sourceTerm: week.sourceTerm,
      }))
    )
    .filter((entry) => entry.strand || entry.subStrand || entry.contentStandard);
}

export function getStrandOptions(entries: CurriculumEntryOption[]): CurriculumOption[] {
  return uniqueOptions(entries.map((entry) => entry.strand));
}

export function getSubStrandOptions(
  entries: CurriculumEntryOption[],
  strand?: string
): CurriculumOption[] {
  return uniqueOptions(
    entries
      .filter((entry) => !strand || normalizeText(entry.strand) === normalizeText(strand))
      .map((entry) => entry.subStrand)
  );
}

export function getContentStandardOptions(
  entries: CurriculumEntryOption[],
  selection: BuilderSelection
): CurriculumOption[] {
  return uniqueOptions(
    entries
      .filter((entry) => matchesSelection(entry, selection, false))
      .map((entry) => entry.contentStandard)
  );
}

export function allocateNextEntry(input: {
  entries: CurriculumEntryOption[];
  existingWeeks: SchemeWeek[];
  selection: Required<BuilderSelection>;
}): CurriculumEntryOption | null {
  const candidates = input.entries.filter((entry) =>
    matchesSelection(entry, input.selection, true)
  );
  if (!candidates.length) return null;

  const usedKeys = new Set(
    input.existingWeeks
      .flatMap((week) => getWeekEntries(week))
      .filter((entry) =>
        normalizeText(entry.contentStandard) === normalizeText(input.selection.contentStandard)
      )
      .map((entry) => getIndicatorKey(entry))
      .filter(Boolean)
  );

  return candidates.find((entry) => !usedKeys.has(getIndicatorKey(entry))) ?? null;
}

export function buildQuickScheme(input: {
  subject: string;
  classLevel: ClassLevel;
  term: string;
  numberOfWeeks: number;
  entries: CurriculumEntryOption[];
  selectedStrands: string[];
  selectedSubStrands: string[];
}): SchemeOfWork {
  const language = isLanguageSubject(input.subject);
  const scopedEntries = input.entries.filter((entry) => {
    const strandMatch =
      !input.selectedStrands.length ||
      input.selectedStrands.some((strand) => normalizeText(strand) === normalizeText(entry.strand));
    const subStrandMatch =
      !input.selectedSubStrands.length ||
      input.selectedSubStrands.some(
        (subStrand) => normalizeText(subStrand) === normalizeText(entry.subStrand)
      );
    return strandMatch && subStrandMatch;
  });
  const fallbackEntries = scopedEntries.length ? scopedEntries : input.entries;
  const usedByStandard = new Map<string, Set<string>>();
  const weeks: SchemeWeek[] = Array.from({ length: input.numberOfWeeks }, (_, index) => {
    const weekNumber = index + 1;
    const weekEntries = language
      ? input.selectedStrands
          .map((strand) =>
            pickNextEntry(
              fallbackEntries.filter((entry) => normalizeText(entry.strand) === normalizeText(strand)),
              usedByStandard
            )
          )
          .filter(Boolean)
      : [
          pickNextEntry(
            fallbackEntries.filter((entry, entryIndex) => {
              if (!input.selectedStrands.length) return true;
              const strand = input.selectedStrands[index % input.selectedStrands.length];
              return normalizeText(entry.strand) === normalizeText(strand) || entryIndex === index;
            }),
            usedByStandard
          ),
        ].filter(Boolean);

    return buildWeek(weekNumber, weekEntries as SchemeWeekEntry[]);
  });

  return {
    id: `scheme-builder-${slugify(input.subject)}-${input.classLevel}-${slugify(input.term)}-${Date.now()}`,
    title: `${input.subject} Scheme Builder Draft - ${input.classLevel} ${input.term}`,
    subject: input.subject,
    classLevel: input.classLevel,
    term: input.term,
    source: 'mapped',
    weeks,
    createdAt: new Date().toISOString(),
  };
}

export function buildSchemeFromWeeks(input: {
  subject: string;
  classLevel: ClassLevel;
  term: string;
  weeks: SchemeWeek[];
}): SchemeOfWork {
  return {
    id: `scheme-builder-${slugify(input.subject)}-${input.classLevel}-${slugify(input.term)}-${Date.now()}`,
    title: `${input.subject} Scheme Builder Draft - ${input.classLevel} ${input.term}`,
    subject: input.subject,
    classLevel: input.classLevel,
    term: input.term,
    source: 'mapped',
    weeks: input.weeks,
    createdAt: new Date().toISOString(),
  };
}

export function createEmptyWeeks(count: number): SchemeWeek[] {
  return Array.from({ length: count }, (_, index) => ({
    week: index + 1,
    topic: '',
    entries: [],
  }));
}

export function addEntryToWeek(
  weeks: SchemeWeek[],
  weekNumber: number,
  entry: SchemeWeekEntry
): SchemeWeek[] {
  return weeks.map((week) => {
    if (week.week !== weekNumber) return week;
    return buildWeek(week.week, [...getWeekEntries(week), entry]);
  });
}

export function removeEntryFromWeek(
  weeks: SchemeWeek[],
  weekNumber: number,
  entryIndex: number
): SchemeWeek[] {
  return weeks.map((week) => {
    if (week.week !== weekNumber) return week;
    const nextEntries = getWeekEntries(week).filter((_, index) => index !== entryIndex);
    return buildWeek(week.week, nextEntries);
  });
}

export function duplicatePreviousWeek(weeks: SchemeWeek[], weekNumber: number): SchemeWeek[] {
  if (weekNumber <= 1) return weeks;
  const previous = weeks.find((week) => week.week === weekNumber - 1);
  if (!previous) return weeks;
  return weeks.map((week) =>
    week.week === weekNumber ? buildWeek(week.week, getWeekEntries(previous)) : week
  );
}

function buildWeek(weekNumber: number, entries: SchemeWeekEntry[]): SchemeWeek {
  const primary = entries[0];
  const resources = uniqueStrings(entries.flatMap((entry) => entry.resources ?? []));
  const topics = uniqueStrings(entries.map((entry) => entry.topic).filter(Boolean) as string[]);

  return {
    week: weekNumber,
    topic: topics.join(' | '),
    strand: primary?.strand,
    subStrand: primary?.subStrand,
    contentStandard: primary?.contentStandard,
    indicator: primary?.indicator,
    resources,
    entries: entries.length ? entries : [],
  };
}

function pickNextEntry(
  candidates: CurriculumEntryOption[],
  usedByStandard: Map<string, Set<string>>
): CurriculumEntryOption | null {
  for (const entry of candidates) {
    const standardKey = normalizeText(entry.contentStandard);
    const indicatorKey = getIndicatorKey(entry);
    const used = usedByStandard.get(standardKey) ?? new Set<string>();
    if (used.has(indicatorKey)) continue;
    used.add(indicatorKey);
    usedByStandard.set(standardKey, used);
    return entry;
  }
  return null;
}

function getBuilderStrandLabel(subject: string, strand?: string): string {
  if (!isLanguageSubject(subject)) return cleanText(strand);

  const normalized = normalizeText(strand);
  if (!normalized) return '';

  if (
    normalized === 'reading/literature' ||
    normalized.startsWith('reading/') ||
    normalized.includes('independent reading') ||
    normalized.includes('research reading') ||
    normalized.includes('model analysis') ||
    normalized.includes('comprehension') ||
    (normalized.includes('reading') && !normalized.startsWith('literature/'))
  ) {
    return 'Reading';
  }
  if (
    normalized === 'literature/reading' ||
    normalized.startsWith('literature/') ||
    normalized.includes('literature') ||
    normalized.includes('drama') ||
    normalized.includes('poetry')
  ) {
    return 'Literature';
  }
  if (
    normalized.includes('oral') ||
    normalized.includes('listening') ||
    normalized.includes('speaking') ||
    normalized.includes('conversation') ||
    normalized.includes('presentation')
  ) {
    return 'Oral Language';
  }
  if (
    normalized.includes('grammar') ||
    normalized.includes('grammer') ||
    normalized.includes('convention') ||
    normalized.includes('punctuation') ||
    normalized.includes('vocabulary') ||
    normalized.includes('register')
  ) {
    return 'Grammar';
  }
  if (
    normalized.includes('writing') ||
    normalized.includes('text response') ||
    normalized.includes('summary') ||
    normalized.includes('notes') ||
    normalized.includes('editing') ||
    normalized.includes('revision')
  ) {
    return 'Writing';
  }

  return cleanText(strand);
}

function getMappedExemplars(subject: string, entry: SchemeWeekEntry): string[] {
  const codes = extractIndicatorCodes(entry.indicator);
  if (!codes.length) return [];

  const source = getExemplarSource(subject);
  if (!source) return [];

  return uniqueStrings(codes.flatMap((code) => source[code]?.exemplars ?? [])).slice(0, 6);
}

function getExemplarSource(subject: string): Record<string, { exemplars: string[] }> | null {
  const normalized = normalizeText(subject);
  if (normalized.includes('english')) return englishExemplarsByIndicator;
  if (normalized.includes('mathematics') || normalized.includes('math')) return mathematicsExemplarsByIndicator;
  if (normalized.includes('science')) return scienceExemplarsByIndicator;
  if (normalized.includes('social studies')) return socialStudiesExemplarsByIndicator;
  return null;
}

function extractIndicatorCodes(value?: string): string[] {
  const text = value ?? '';
  const directCodes = text.match(/B\d(?:\/JHS\d)?(?:\.\d+){4}/g) ?? [];
  const expanded = [...directCodes];

  for (const code of directCodes) {
    const rangeMatch = text.match(new RegExp(`${escapeRegExp(code)}-(?:(\\d+)\\.)?(\\d+)`));
    if (!rangeMatch) continue;

    const parts = code.split('.');
    const firstIndicator = Number(parts[4]);
    const lastIndicator = Number(rangeMatch[2]);
    if (!Number.isFinite(firstIndicator) || !Number.isFinite(lastIndicator)) continue;
    if (lastIndicator < firstIndicator || lastIndicator - firstIndicator > 20) continue;

    const prefix = parts.slice(0, 4).join('.');
    for (let current = firstIndicator + 1; current <= lastIndicator; current += 1) {
      expanded.push(`${prefix}.${current}`);
    }
  }

  return uniqueStrings(expanded);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesSelection(
  entry: SchemeWeekEntry,
  selection: BuilderSelection,
  requireStandard: boolean
): boolean {
  const strandMatch =
    !selection.strand || normalizeText(entry.strand) === normalizeText(selection.strand);
  const subStrandMatch =
    !selection.subStrand || normalizeText(entry.subStrand) === normalizeText(selection.subStrand);
  const standardMatch =
    !selection.contentStandard ||
    normalizeText(entry.contentStandard) === normalizeText(selection.contentStandard);
  return strandMatch && subStrandMatch && (requireStandard ? standardMatch : true);
}

function uniqueOptions(values: Array<string | undefined>): CurriculumOption[] {
  return uniqueStrings(values.filter(Boolean) as string[]).map((value) => ({
    label: value,
    value,
  }));
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const cleaned = value.trim();
    const key = normalizeText(cleaned);
    if (!cleaned || seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result;
}

function getIndicatorKey(entry: SchemeWeekEntry): string {
  return normalizeText(entry.indicator || entry.topic || entry.contentStandard);
}

function normalizeTerm(term?: string): string {
  const value = normalizeText(term);
  if (value.includes('1') || value.includes('first')) return 'term 1';
  if (value.includes('2') || value.includes('second')) return 'term 2';
  if (value.includes('3') || value.includes('third')) return 'term 3';
  return value;
}

function normalizeText(value?: string): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function cleanText(value?: string): string {
  return (value ?? '').trim();
}

function slugify(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
