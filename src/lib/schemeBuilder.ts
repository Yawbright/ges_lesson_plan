import { getExplicitCurriculumYearWeeks } from '@/lib/curriculum';
import { getWeekEntries } from '@/lib/schemeWeek';
import { englishExemplarsByIndicator } from '@/data/curriculum/englishExemplars';
import { primaryEnglishExemplarsByIndicator } from '@/data/curriculum/primaryEnglishExemplars';
import { mathematicsExemplarsByIndicator } from '@/data/curriculum/mathematicsExemplars';
import { primaryMathematicsExemplarsByIndicator } from '@/data/curriculum/primaryMathematicsExemplars';
import { scienceExemplarsByIndicator } from '@/data/curriculum/scienceExemplars';
import { primaryScienceExemplarsByIndicator } from '@/data/curriculum/primaryScienceExemplars';
import { primaryHistoryExemplarsByIndicator } from '@/data/curriculum/primaryHistoryExemplars';
import { socialStudiesExemplarsByIndicator } from '@/data/curriculum/socialStudiesExemplars';
import { computingExemplarsByIndicator } from '@/data/curriculum/computingExemplars';
import { primaryComputingExemplarsByIndicator } from '@/data/curriculum/primaryComputingExemplars';
import { careerTechnologyExemplarsByIndicator } from '@/data/curriculum/careerTechnologyExemplars';
import { rmeExemplarsByIndicator } from '@/data/curriculum/rmeExemplars';
import { primaryRmeExemplarsByIndicator } from '@/data/curriculum/primaryRmeExemplars';
import { creativeArtsDesignExemplarsByIndicator } from '@/data/curriculum/creativeArtsDesignExemplars';
import { primaryCreativeArtsExemplarsByIndicator } from '@/data/curriculum/primaryCreativeArtsExemplars';
import { ghanaianLanguageExemplarsByIndicator } from '@/data/curriculum/ghanaianLanguageExemplars';
import { primaryGhanaianLanguageExemplarsByIndicator } from '@/data/curriculum/primaryGhanaianLanguageExemplars';
import { frenchLanguageExemplarsByIndicator } from '@/data/curriculum/frenchLanguageExemplars';
import { primaryFrenchExemplarsByIndicator } from '@/data/curriculum/primaryFrenchExemplars';
import { primaryPhysicalEducationExemplarsByIndicator } from '@/data/curriculum/primaryPhysicalEducationExemplars';
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

  const mappedEntries = weeks
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

  const supplementalEntries = getSourceSupplementalEntries(input.subject, input.classLevel, weeks)
    .filter((entry) => input.includeFullYear || normalizeTerm(entry.sourceTerm) === normalizedTerm);

  return mergeCurriculumEntries([...mappedEntries, ...supplementalEntries]);
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

function getEnglishSupplementalEntries(
  subject: string,
  classLevel: ClassLevel,
  pacingWeeks: Array<SchemeWeek & { sourceTerm?: string }>
): CurriculumEntryOption[] {
  return Object.entries(englishExemplarsByIndicator)
    .filter(([code]) => code.startsWith(`${classLevel}/`))
    .map(([code, record]) => {
      const strand = getEnglishStrandFromCode(code);
      const subStrand = getEnglishSubStrandFromIndicator(strand, record.indicator, record.exemplars);
      const topic = getEnglishTopicFromIndicator(record.indicator, record.exemplars);
      const standardCode = getContentStandardCodeFromIndicatorCode(code);
      const placement = getSuggestedEnglishPlacement({
        code,
        strand,
        subStrand,
        topic,
        indicator: record.indicator,
        pacingWeeks,
      });

      return {
        id: `english-exemplar|${code}`,
        strand,
        subStrand,
        contentStandard: `${standardCode} ${getEnglishContentStandardSummary(strand, subStrand)}`,
        indicator: `${code} ${record.indicator}`,
        topic,
        resources: getLanguageResourcesForStrand(strand),
        exemplars: record.exemplars,
        sourceWeek: placement.week,
        sourceTerm: placement.term,
      };
    })
    .filter((entry) => Boolean(entry.strand));
}

function getSourceSupplementalEntries(
  subject: string,
  classLevel: ClassLevel,
  pacingWeeks: Array<SchemeWeek & { sourceTerm?: string }>
): CurriculumEntryOption[] {
  if (isEnglishSubject(subject)) {
    return getEnglishSupplementalEntries(subject, classLevel, pacingWeeks);
  }
  if (isGhanaianLanguageSubject(subject)) {
    return getGhanaianLanguageSupplementalEntries(subject, classLevel, pacingWeeks);
  }
  if (isFrenchLanguageSubject(subject)) {
    return getFrenchLanguageSupplementalEntries(subject, classLevel, pacingWeeks);
  }

  const source = getExemplarSource(subject);
  if (!source) return [];

  return Object.entries(source)
    .filter(([code]) => codeMatchesClassLevel(code, classLevel))
    .map(([code, record]) => {
      const placement = getSuggestedSourcePlacement({
        code,
        indicator: record.indicator,
        pacingWeeks,
      });
      const standardCode = getContentStandardCodeFromIndicatorCode(code);

      return {
        id: `source-exemplar|${slugify(subject)}|${code}`,
        strand: placement.match?.entry.strand ?? getFallbackStrandFromCode(code),
        subStrand: placement.match?.entry.subStrand ?? getFallbackSubStrandFromCode(code),
        contentStandard:
          placement.match?.entry.contentStandard ?? `${standardCode} Curriculum content standard.`,
        indicator: `${code} ${cleanIndicatorText(record.indicator)}`,
        topic: cleanIndicatorText(record.indicator),
        resources: getSubjectResources(subject),
        exemplars: record.exemplars,
        sourceWeek: placement.week,
        sourceTerm: placement.term,
      };
    });
}

function getSuggestedEnglishPlacement(input: {
  code: string;
  strand: string;
  subStrand: string;
  topic: string;
  indicator: string;
  pacingWeeks: Array<SchemeWeek & { sourceTerm?: string }>;
}): { term: string; week: number } {
  const standardCode = getContentStandardCodeFromIndicatorCode(input.code);
  const exactCode = input.code;
  const candidates = input.pacingWeeks
    .map((week) => ({
      week,
      entries: getWeekEntries(week),
    }))
    .flatMap(({ week, entries }) =>
      entries.map((entry) => ({
        week,
        entry,
        text: [entry.contentStandard, entry.indicator, entry.topic, entry.subStrand].join(' '),
      }))
    );

  const exactMatch = candidates.find((candidate) => candidate.text.includes(exactCode));
  if (exactMatch) {
    return {
      term: exactMatch.week.sourceTerm || 'Term 1',
      week: exactMatch.week.week,
    };
  }

  const standardMatches = candidates.filter((candidate) => candidate.text.includes(standardCode));
  if (standardMatches.length) {
    const scored = standardMatches
      .map((candidate) => ({
        ...candidate,
        score: countTokenOverlap(
          tokenizeForMatch([input.topic, input.indicator, input.subStrand].join(' ')),
          tokenizeForMatch(candidate.text)
        ),
      }))
      .sort((left, right) => right.score - left.score || left.week.week - right.week.week);
    return {
      term: scored[0].week.sourceTerm || 'Term 1',
      week: scored[0].week.week,
    };
  }

  const strandMatches = candidates.filter(
    (candidate) => getBuilderStrandLabel('English Language', candidate.entry.strand) === input.strand
  );
  if (strandMatches.length) {
    const sorted = [...strandMatches].sort((left, right) => left.week.week - right.week.week);
    return {
      term: sorted[0].week.sourceTerm || 'Term 1',
      week: sorted[0].week.week,
    };
  }

  return fallbackEnglishPlacement(input.code);
}

function getGhanaianLanguageSupplementalEntries(
  subject: string,
  classLevel: ClassLevel,
  pacingWeeks: Array<SchemeWeek & { sourceTerm?: string }>
): CurriculumEntryOption[] {
  return Object.entries(ghanaianLanguageExemplarsByIndicator)
    .filter(([code]) => codeMatchesClassLevel(code, classLevel))
    .map(([code, record]) => {
      const strand = getGhanaianLanguageStrandFromCode(code);
      const subStrand = getGhanaianLanguageSubStrandFromCode(code, record.indicator);
      const placement = getSuggestedSourcePlacement({
        code,
        indicator: record.indicator,
        pacingWeeks,
      });
      const standardCode = getContentStandardCodeFromIndicatorCode(code);

      return {
        id: `ghanaian-language-exemplar|${code}`,
        strand,
        subStrand,
        contentStandard: `${standardCode} Ghanaian Language curriculum content standard.`,
        indicator: `${code} ${cleanIndicatorText(record.indicator)}`,
        topic: cleanIndicatorText(record.indicator),
        resources: getLanguageResourcesForStrand(strand),
        exemplars: record.exemplars,
        sourceWeek: placement.week,
        sourceTerm: placement.term,
      };
    });
}

function getFrenchLanguageSupplementalEntries(
  subject: string,
  classLevel: ClassLevel,
  pacingWeeks: Array<SchemeWeek & { sourceTerm?: string }>
): CurriculumEntryOption[] {
  return Object.entries(frenchLanguageExemplarsByIndicator)
    .filter(([code]) => codeMatchesClassLevel(code, classLevel))
    .map(([code, record]) => {
      const strand = getFrenchStrandFromCode(code);
      const subStrand = getFrenchSubStrandFromCode(code, record.indicator);
      const placement = getSuggestedSourcePlacement({
        code,
        indicator: record.indicator,
        pacingWeeks,
      });
      const standardCode = getContentStandardCodeFromIndicatorCode(code);

      return {
        id: `french-language-exemplar|${code}`,
        strand,
        subStrand,
        contentStandard: `${standardCode} French Language curriculum content standard.`,
        indicator: `${code} ${cleanIndicatorText(record.indicator)}`,
        topic: cleanIndicatorText(record.indicator),
        resources: getLanguageResourcesForStrand(strand),
        exemplars: record.exemplars,
        sourceWeek: placement.week,
        sourceTerm: placement.term,
      };
    });
}

function getSuggestedSourcePlacement(input: {
  code: string;
  indicator: string;
  pacingWeeks: Array<SchemeWeek & { sourceTerm?: string }>;
}): { term: string; week: number; match?: { entry: SchemeWeekEntry } } {
  const standardCode = getContentStandardCodeFromIndicatorCode(input.code);
  const candidates = getPlacementCandidates(input.pacingWeeks);

  const exactMatch = candidates.find((candidate) => candidate.codes.includes(input.code));
  if (exactMatch) {
    return {
      term: exactMatch.week.sourceTerm || 'Term 1',
      week: exactMatch.week.week,
      match: { entry: exactMatch.entry },
    };
  }

  const standardMatches = candidates.filter((candidate) =>
    normalizeCurriculumCodeSpacing(
      [candidate.entry.contentStandard, candidate.entry.indicator].join(' ')
    ).includes(standardCode)
  );
  if (standardMatches.length) {
    const scored = standardMatches
      .map((candidate) => ({
        ...candidate,
        score: countTokenOverlap(
          tokenizeForMatch(input.indicator),
          tokenizeForMatch(candidate.text)
        ),
      }))
      .sort((left, right) => right.score - left.score || left.week.week - right.week.week);
    return {
      term: scored[0].week.sourceTerm || 'Term 1',
      week: scored[0].week.week,
      match: { entry: scored[0].entry },
    };
  }

  return fallbackSourcePlacement(input.code);
}

function getPlacementCandidates(pacingWeeks: Array<SchemeWeek & { sourceTerm?: string }>) {
  return pacingWeeks
    .map((week) => ({
      week,
      entries: getWeekEntries(week),
    }))
    .flatMap(({ week, entries }) =>
      entries.map((entry) => ({
        week,
        entry,
        codes: extractIndicatorCodes(entry.indicator),
        text: normalizeCurriculumCodeSpacing(
          [entry.contentStandard, entry.indicator, entry.topic, entry.subStrand, entry.strand].join(' ')
        ),
      }))
    );
}

function fallbackEnglishPlacement(code: string): { term: string; week: number } {
  const parts = code.split('.');
  const strandNumber = Number(parts[1]) || 1;
  const contentNumber = Number(parts[3]) || 1;
  const indicatorNumber = Number(parts[4]) || 1;
  const sequence = (strandNumber - 1) * 8 + contentNumber * 2 + indicatorNumber;
  const termIndex = Math.min(2, Math.floor((sequence - 1) / 12));
  const week = ((sequence - 1) % 12) + 1;

  return {
    term: `Term ${termIndex + 1}`,
    week,
  };
}

function fallbackSourcePlacement(code: string): { term: string; week: number } {
  const parts = code.split('.').map((part) => Number(part.replace(/\D+/g, '')) || 1);
  const sequence = ((parts[1] ?? 1) - 1) * 8 + ((parts[2] ?? 1) - 1) * 3 + (parts[4] ?? 1);
  const termIndex = Math.min(2, Math.floor((sequence - 1) / 12));

  return {
    term: `Term ${termIndex + 1}`,
    week: ((sequence - 1) % 12) + 1,
  };
}

function mergeCurriculumEntries(entries: CurriculumEntryOption[]): CurriculumEntryOption[] {
  const seen = new Set<string>();
  const result: CurriculumEntryOption[] = [];

  for (const entry of entries) {
    const code = extractIndicatorCodes(entry.indicator)[0];
    const key = code || [entry.strand, entry.subStrand, entry.contentStandard, entry.indicator, entry.topic]
      .map((part) => normalizeText(part))
      .join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }

  return result;
}

function getEnglishStrandFromCode(code: string): string {
  const strandNumber = code.match(/JHS\d\.(\d)\./)?.[1];
  if (strandNumber === '1') return 'Oral Language';
  if (strandNumber === '2') return 'Reading';
  if (strandNumber === '3') return 'Grammar';
  if (strandNumber === '4') return 'Writing';
  if (strandNumber === '5') return 'Literature';
  return '';
}

function getEnglishSubStrandFromIndicator(
  strand: string,
  indicator: string,
  exemplars: string[]
): string {
  const text = normalizeText([indicator, ...exemplars].join(' '));

  if (strand === 'Writing') {
    if (hasAny(text, ['formal writing', 'business letter', 'formal letter', 'email', 'minutes', 'agenda', 'reports'])) {
      return 'Text Types and Purposes';
    }
    if (hasAny(text, ['informal letter', 'friendly letter', 'personal letter'])) {
      return 'Text Types and Purposes';
    }
    if (hasAny(text, ['article', 'publication', 'magazine', 'flyer', 'poster', 'notice', 'invitation', 'speech', 'dialogue'])) {
      return 'Text Types and Purposes';
    }
    if (hasAny(text, ['research', 'source', 'figures', 'tables', 'graphs', 'maps'])) {
      return 'Building and Presenting Knowledge';
    }
    if (hasAny(text, ['paragraph', 'coherent', 'cohesive', 'revise', 'edit'])) {
      return 'Production and Distribution of Writing';
    }
    return 'Writing';
  }

  if (strand === 'Grammar') {
    if (hasAny(text, ['punctuation', 'capitalisation', 'capitalization', 'apostrophe', 'colon', 'semicolon', 'hyphen'])) {
      return 'Punctuation and Capitalisation';
    }
    if (hasAny(text, ['vocabulary', 'spelling', 'word choice', 'register', 'formal language', 'slang', 'jargon'])) {
      return 'Vocabulary and Language Use';
    }
    if (hasAny(text, ['aesthetic', 'figurative', 'proverb', 'imagery', 'simile', 'metaphor'])) {
      return 'Aesthetic Language';
    }
    return 'Grammar';
  }

  if (strand === 'Reading') {
    if (hasAny(text, ['summary', 'summarise', 'summarize'])) return 'Summarising';
    if (hasAny(text, ['independent reading', 'reading portfolio'])) return 'Independent Reading';
    return 'Comprehension';
  }

  if (strand === 'Oral Language') {
    if (hasAny(text, ['sound', 'vowel', 'diphthong', 'consonant'])) return 'English Sounds';
    if (hasAny(text, ['listen', 'listening'])) return 'Listening Comprehension';
    return 'Conversation/Everyday Discourse';
  }

  if (strand === 'Literature') return 'Narrative, Drama and Poetry';

  return strand;
}

function getEnglishTopicFromIndicator(indicator: string, exemplars: string[]): string {
  const text = normalizeText([indicator, ...exemplars].join(' '));

  if (hasAny(text, ['informal letter', 'friendly letter', 'personal letter'])) return 'Informal letter writing';
  if (hasAny(text, ['formal letter', 'business letter', 'email', 'minutes', 'agenda'])) return 'Formal and practical writing';
  if (hasAny(text, ['article', 'publication', 'magazine'])) return 'Article and publication writing';
  if (hasAny(text, ['flyer', 'poster', 'notice', 'invitation'])) return 'Flyers, notices, posters and invitations';
  if (hasAny(text, ['dialogue', 'monologue'])) return 'Dialogue and monologue writing';
  if (hasAny(text, ['speech'])) return 'Speech writing and presentation';
  if (hasAny(text, ['summary', 'summarise', 'summarize'])) return 'Summary writing';
  if (hasAny(text, ['report'])) return 'Report writing';
  if (hasAny(text, ['research'])) return 'Research-supported writing';
  if (hasAny(text, ['personal narrative'])) return 'Personal narrative writing';
  if (hasAny(text, ['descriptive'])) return 'Descriptive writing';
  if (hasAny(text, ['persuasive', 'argumentative'])) return 'Persuasive and argumentative writing';
  if (hasAny(text, ['informative', 'explanatory'])) return 'Informative and explanatory writing';

  return cleanIndicatorText(indicator);
}

function getEnglishContentStandardSummary(strand: string, subStrand: string): string {
  if (strand === 'Writing' && subStrand === 'Text Types and Purposes') {
    return 'Apply writing skills to specific life situations and compose texts for different purposes and audiences.';
  }
  if (strand === 'Writing') return 'Develop, organise and present written ideas for appropriate purposes.';
  if (strand === 'Grammar') return 'Apply language structure, vocabulary and conventions accurately in communication.';
  if (strand === 'Reading') return 'Read, comprehend, interpret and analyse varied texts.';
  if (strand === 'Oral Language') return 'Use appropriate spoken language, listening and presentation skills in context.';
  if (strand === 'Literature') return 'Demonstrate understanding of literary genres, elements and devices.';
  return 'Curriculum content standard.';
}

function getLanguageResourcesForStrand(strand: string): string[] {
  if (strand === 'Writing') return ['Exercise book', 'Writing frame', 'Model texts', 'Dictionary'];
  if (strand === 'Reading') return ['Reading passages', 'Library books', 'Graphic organisers'];
  if (strand === 'Grammar') return ['Sentence cards', 'Grammar chart', 'Exercise book'];
  if (strand === 'Oral Language') return ['Prompt cards', 'Discussion guide', 'Audio clips'];
  if (strand === 'Literature') return ['Poems', 'Stories', 'Drama excerpts'];
  return ['Textbook', 'Exercise book'];
}

function getContentStandardCodeFromIndicatorCode(code: string): string {
  return code.split('.').slice(0, 4).join('.');
}

function cleanIndicatorText(indicator: string): string {
  return indicator
    .replace(/^B\d(?:\/JHS\d)?(?:\.\d+){4}\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function getMappedExemplars(subject: string, entry: SchemeWeekEntry): string[] {
  const codes = extractIndicatorCodes(entry.indicator);
  const source = getExemplarSource(subject);
  if (!source) return [];

  const directMatches = uniqueStrings(codes.flatMap((code) => source[code]?.exemplars ?? []));
  if (directMatches.length) return directMatches.slice(0, 6);

  if (isEnglishSubject(subject)) {
    return getBestEnglishExemplarsForEntry(entry).slice(0, 6);
  }

  return [];
}

function getBestEnglishExemplarsForEntry(entry: SchemeWeekEntry): string[] {
  const entryTokens = tokenizeForMatch([
    entry.strand,
    entry.subStrand,
    entry.contentStandard,
    entry.indicator,
    entry.topic,
  ].join(' '));
  if (!entryTokens.length) return [];

  const entryCodePrefix = extractStandardCode(entry.contentStandard || entry.indicator);
  const candidates = Object.entries(englishExemplarsByIndicator)
    .filter(([code]) => !entryCodePrefix || code.startsWith(entryCodePrefix))
    .map(([code, record]) => ({
      code,
      exemplars: record.exemplars,
      score: countTokenOverlap(
        entryTokens,
        tokenizeForMatch([record.indicator, ...record.exemplars].join(' '))
      ),
    }))
    .sort((left, right) => right.score - left.score);

  const best = candidates[0];
  return best && best.score > 0 ? best.exemplars : [];
}

function getExemplarSource(
  subject: string
): Record<string, { indicator: string; exemplars: string[] }> | null {
  const normalized = normalizeText(subject);
  if (normalized.includes('english')) {
    return { ...primaryEnglishExemplarsByIndicator, ...englishExemplarsByIndicator };
  }
  if (normalized.includes('mathematics') || normalized.includes('math')) {
    return { ...primaryMathematicsExemplarsByIndicator, ...mathematicsExemplarsByIndicator };
  }
  if (normalized.includes('science')) {
    return { ...primaryScienceExemplarsByIndicator, ...scienceExemplarsByIndicator };
  }
  if (normalized.includes('social studies')) return socialStudiesExemplarsByIndicator;
  if (normalized.includes('history')) return primaryHistoryExemplarsByIndicator;
  if (normalized.includes('computing')) {
    return { ...primaryComputingExemplarsByIndicator, ...computingExemplarsByIndicator };
  }
  if (normalized.includes('career technology')) return careerTechnologyExemplarsByIndicator;
  if (normalized === 'rme' || normalized.includes('religious and moral')) {
    return { ...primaryRmeExemplarsByIndicator, ...rmeExemplarsByIndicator };
  }
  if (normalized.includes('creative arts')) {
    return { ...primaryCreativeArtsExemplarsByIndicator, ...creativeArtsDesignExemplarsByIndicator };
  }
  if (normalized.includes('ghanaian language')) {
    return { ...primaryGhanaianLanguageExemplarsByIndicator, ...ghanaianLanguageExemplarsByIndicator };
  }
  if (normalized.includes('french')) {
    return { ...primaryFrenchExemplarsByIndicator, ...frenchLanguageExemplarsByIndicator };
  }
  if (
    normalized === 'pe' ||
    normalized.includes('phys ed') ||
    normalized.includes('physical education')
  ) {
    return primaryPhysicalEducationExemplarsByIndicator;
  }
  return null;
}

function isEnglishSubject(subject: string): boolean {
  return normalizeText(subject).includes('english');
}

function extractIndicatorCodes(value?: string): string[] {
  const text = normalizeCurriculumCodeSpacing(value ?? '');
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

function extractStandardCode(value?: string): string {
  return normalizeCurriculumCodeSpacing(value ?? '').match(/B\d(?:\/JHS\d)?(?:\.\d+){3}/)?.[0] ?? '';
}

function normalizeCurriculumCodeSpacing(value: string): string {
  return value
    .replace(/(JHS\d)\s+(\d)/g, '$1.$2')
    .replace(/(B\d\/JHS\d)\s*\.\s*/g, '$1.')
    .replace(/\s+\./g, '.')
    .replace(/\.\s+/g, '.');
}

function codeMatchesClassLevel(code: string, classLevel: ClassLevel): boolean {
  const numericLevel = classLevel.replace(/\D+/g, '');
  if (!numericLevel) return false;
  return code.startsWith(`B${numericLevel}`) || code.startsWith(`B${numericLevel}/`);
}

function getFallbackStrandFromCode(code: string): string {
  const strandNumber = code.split('.')[1]?.replace(/\D+/g, '');
  return strandNumber ? `Strand ${strandNumber}` : 'Mapped Curriculum';
}

function getFallbackSubStrandFromCode(code: string): string {
  const parts = code.split('.');
  const strandNumber = parts[1]?.replace(/\D+/g, '');
  const subStrandNumber = parts[2]?.replace(/\D+/g, '');
  if (strandNumber && subStrandNumber) return `Sub-strand ${strandNumber}.${subStrandNumber}`;
  return 'Curriculum Focus';
}

function getSubjectResources(subject: string): string[] {
  const normalized = normalizeText(subject);
  if (normalized.includes('mathematics') || normalized.includes('math')) {
    return ['Textbook', 'Exercise book', 'Manipulatives', 'Graph book'];
  }
  if (normalized.includes('science')) {
    return ['Science textbook', 'Charts', 'Activity materials', 'Observation sheets'];
  }
  if (normalized.includes('social studies')) {
    return ['Social Studies textbook', 'Maps', 'Charts', 'Community resources'];
  }
  if (normalized.includes('computing')) {
    return ['Computer', 'Projector', 'Digital device', 'Activity worksheet'];
  }
  if (normalized.includes('career technology')) {
    return ['Career Technology textbook', 'Tools and materials', 'Charts', 'Activity worksheet'];
  }
  if (normalized === 'rme' || normalized.includes('religious and moral')) {
    return ['RME textbook', 'Scripture references', 'Case studies', 'Role-play cards'];
  }
  if (normalized.includes('creative arts')) {
    return ['Sketchbook', 'Colour tools', 'Local art examples', 'Performance space'];
  }
  if (normalized.includes('ghanaian language')) {
    return ['Ghanaian Language textbook', 'Oral texts', 'Reading passages', 'Writing frame'];
  }
  if (normalized.includes('french')) {
    return ['French textbook', 'Dialogue cards', 'Audio clips', 'Vocabulary list'];
  }
  return ['Textbook', 'Exercise book'];
}

function isGhanaianLanguageSubject(subject: string): boolean {
  return normalizeText(subject).includes('ghanaian language');
}

function getGhanaianLanguageStrandFromCode(code: string): string {
  const strandNumber = code.split('.')[1];
  if (strandNumber === '1') return 'Customs and Institutions';
  if (strandNumber === '2') return 'Listening and Speaking';
  if (strandNumber === '3') return 'Reading';
  if (strandNumber === '4') return 'Language and Usage';
  if (strandNumber === '5') return 'Composition Writing';
  if (strandNumber === '6') return 'Literature';
  return 'Ghanaian Language';
}

function getGhanaianLanguageSubStrandFromCode(code: string, indicator: string): string {
  const parts = code.split('.');
  const strand = parts[1];
  const subStrand = parts[2];
  const key = `${strand}.${subStrand}`;
  const normalizedIndicator = cleanIndicatorText(indicator);

  const labels: Record<string, string> = {
    '1.1': 'Rites of Passage',
    '1.2': 'Naming Systems',
    '1.3': 'The Clan System',
    '1.4': 'Chieftaincy',
    '2.1': 'Listening Comprehension',
    '2.2': 'Conversation/Everyday Discourse',
    '2.3': 'Speech Sounds and Tone',
    '3.1': 'Reading',
    '3.2': 'Translation',
    '4.1': 'Sentences',
    '4.2': 'Vocabulary and Usage',
    '4.3': 'Language Conventions',
    '5.1': 'Composition Writing',
    '6.1': 'Literature',
  };

  return labels[key] ?? normalizedIndicator.split(' ').slice(0, 6).join(' ') ?? 'Ghanaian Language Focus';
}

function isFrenchLanguageSubject(subject: string): boolean {
  return normalizeText(subject).includes('french');
}

function getFrenchStrandFromCode(code: string): string {
  const strandNumber = code.split('.')[1];
  const labels: Record<string, string> = {
    '1': 'Faire connaissance',
    '2': "L'environnement",
    '3': 'La localisation, les horaires et les deplacements',
    '4': 'Les achats',
    '5': 'Les services',
    '6': 'Les loisirs',
    '7': "Les projets d'avenir",
    '8': 'Les sentiments et les opinions',
    '9': 'La vie sociale',
    '10': 'Revision et integration',
  };
  return labels[strandNumber] ?? 'French Language';
}

function getFrenchSubStrandFromCode(code: string, indicator: string): string {
  const parts = code.split('.');
  const key = `${parts[1]}.${parts[2]}`;
  const labels: Record<string, string> = {
    '1.1': 'Saluer et prendre conge',
    '1.2': 'Se presenter et presenter quelqu’un',
    '1.3': 'Exprimer ses gouts et ses preferences',
    '1.4': 'Decrire quelqu’un',
    '1.5': 'Parler de sa famille',
    '2.1': 'Parler de son lieu d’habitation',
    '2.2': 'Parler de son ecole',
    '2.3': 'Comprendre et s’exprimer sur les plats',
    '2.4': 'Parler de l’hygiene et de la sante',
    '3.1': 'Situer dans l’espace',
    '3.2': 'Demander et indiquer l’itineraire',
    '3.3': 'Demander et donner l’heure',
    '3.4': 'Parler de son agenda',
    '4.1': 'Compter et faire des calculs',
    '4.2': 'Faire des achats',
    '5.1': 'Faire une reservation',
    '6.1': 'Parler des loisirs',
    '7.1': 'Situer un evenement dans le futur',
    '8.1': 'Donner des ordres et permissions',
    '9.1': 'Interactions sociales',
    '10.1': 'Integration orale',
    '10.2': 'Integration ecrite',
  };

  return labels[key] ?? cleanIndicatorText(indicator).split(' ').slice(0, 6).join(' ') ?? 'French Language Focus';
}

function tokenizeForMatch(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 3 && !MATCH_STOP_WORDS.has(token));
}

function countTokenOverlap(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return left.reduce((score, token) => score + (rightSet.has(token) ? 1 : 0), 0);
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

const MATCH_STOP_WORDS = new Set([
  'apply',
  'appropriate',
  'communication',
  'compose',
  'content',
  'different',
  'english',
  'given',
  'indicator',
  'language',
  'purposes',
  'specific',
  'standard',
  'texts',
  'using',
  'with',
  'write',
  'writing',
]);
