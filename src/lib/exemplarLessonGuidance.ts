import { careerTechnologyExemplarsByIndicator } from '@/data/curriculum/careerTechnologyExemplars';
import { computingExemplarsByIndicator } from '@/data/curriculum/computingExemplars';
import { creativeArtsDesignExemplarsByIndicator } from '@/data/curriculum/creativeArtsDesignExemplars';
import { englishExemplarsByIndicator } from '@/data/curriculum/englishExemplars';
import { frenchLanguageExemplarsByIndicator } from '@/data/curriculum/frenchLanguageExemplars';
import { ghanaianLanguageExemplarsByIndicator } from '@/data/curriculum/ghanaianLanguageExemplars';
import { mathematicsExemplarsByIndicator } from '@/data/curriculum/mathematicsExemplars';
import { primaryCreativeArtsExemplarsByIndicator } from '@/data/curriculum/primaryCreativeArtsExemplars';
import { primaryComputingExemplarsByIndicator } from '@/data/curriculum/primaryComputingExemplars';
import { primaryEnglishExemplarsByIndicator } from '@/data/curriculum/primaryEnglishExemplars';
import { primaryFrenchExemplarsByIndicator } from '@/data/curriculum/primaryFrenchExemplars';
import { primaryGhanaianLanguageExemplarsByIndicator } from '@/data/curriculum/primaryGhanaianLanguageExemplars';
import { primaryHistoryExemplarsByIndicator } from '@/data/curriculum/primaryHistoryExemplars';
import { primaryMathematicsExemplarsByIndicator } from '@/data/curriculum/primaryMathematicsExemplars';
import { primaryPhysicalEducationExemplarsByIndicator } from '@/data/curriculum/primaryPhysicalEducationExemplars';
import { primaryRmeExemplarsByIndicator } from '@/data/curriculum/primaryRmeExemplars';
import { rmeExemplarsByIndicator } from '@/data/curriculum/rmeExemplars';
import { scienceExemplarsByIndicator } from '@/data/curriculum/scienceExemplars';
import { primaryScienceExemplarsByIndicator } from '@/data/curriculum/primaryScienceExemplars';
import { socialStudiesExemplarsByIndicator } from '@/data/curriculum/socialStudiesExemplars';
import { getWeekEntries } from './schemeWeek';
import type { SchemeWeek, SchemeWeekEntry } from '@/types/scheme';

export interface LessonFocusGuidance {
  allFocuses: string[];
  currentFocus?: string;
}

type ExemplarSource = Record<string, { indicator: string; exemplars: string[] }>;

export function buildExemplarLessonGuidance(input: {
  subject: string;
  classLevel: string;
  week?: SchemeWeek;
  sessionIndex?: number;
  sessionsPerWeek?: number;
}): LessonFocusGuidance | undefined {
  if (!['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9'].includes(input.classLevel) || !input.week) {
    return undefined;
  }

  const source = getExemplarSource(input.subject);
  if (!source) return undefined;

  const entries = getWeekEntries(input.week);
  if (!entries.length) return undefined;

  const exemplarItems = uniqueStrings(
    entries.flatMap((entry) => getExemplarsForEntry(entry, source))
  );
  if (!exemplarItems.length) return undefined;

  const lessonCount = Math.max(1, Math.min(input.sessionsPerWeek ?? 3, 3));
  const allFocuses = buildLessonFocuses(exemplarItems, lessonCount, input.subject);
  const focusIndex = Math.min(
    Math.max((input.sessionIndex ?? 1) - 1, 0),
    Math.max(allFocuses.length - 1, 0)
  );

  return {
    allFocuses,
    currentFocus: allFocuses[focusIndex],
  };
}

function getExemplarsForEntry(entry: SchemeWeekEntry, source: ExemplarSource): string[] {
  const entryExemplars = entry.exemplars ?? [];
  const directCodes = uniqueStrings([
    ...extractIndicatorCodes(entry.indicator),
    ...extractIndicatorCodes(entry.contentStandard),
  ]);
  const directExemplars = directCodes.flatMap((code) => source[code]?.exemplars ?? []);
  if (directExemplars.length) return [...entryExemplars, ...directExemplars];

  const standardCode = extractStandardCode([entry.contentStandard, entry.indicator].join(' '));
  const entryTokens = tokenize([entry.topic, entry.indicator, entry.subStrand, entry.contentStandard].join(' '));

  const standardMatches = standardCode
    ? getBestMatchingRecords(
        Object.entries(source).filter(([code]) => code.startsWith(`${standardCode}.`)),
        entryTokens
      )
    : [];
  if (standardMatches.length) return [...entryExemplars, ...standardMatches];

  const broadMatches = getBestMatchingRecords(Object.entries(source), entryTokens);
  return [...entryExemplars, ...broadMatches];
}

function getBestMatchingRecords(
  records: Array<[string, { indicator: string; exemplars: string[] }]>,
  entryTokens: string[]
): string[] {
  if (!records.length || !entryTokens.length) return [];

  const scored = records
    .map(([code, record]) => ({
      code,
      exemplars: record.exemplars,
      score: countSharedTokens(entryTokens, tokenize([record.indicator, ...record.exemplars].join(' '))),
    }))
    .sort((left, right) => right.score - left.score);

  const bestScore = scored[0]?.score ?? 0;
  if (bestScore <= 0) return [];

  return scored
    .filter((item) => item.score === bestScore)
    .flatMap((item) => item.exemplars);
}

function buildLessonFocuses(exemplars: string[], lessonCount: number, subject: string): string[] {
  const mode = getSubjectMode(subject);

  if (lessonCount === 1) {
    return [decorateFocus(exemplars.join(' '), mode, 0, 1)];
  }

  const chunks = splitEvenly(exemplars, lessonCount);
  return chunks.map((chunk, index) => {
    const focus = chunk.length ? chunk.join(' ') : exemplars.join(' ');
    return decorateFocus(focus, mode, index, lessonCount);
  });
}

function decorateFocus(focus: string, mode: string, index: number, lessonCount: number): string {
  if (mode === 'english') {
    return `Use as supporting teaching points, practice prompts and assessment cues, not as a separate weekly topic: ${focus}`;
  }

  if (mode === 'ghanaian-language') {
    return `Use as language-support guidance for the selected weekly aspect: oral practice, reading, usage, writing, cultural context, literature response and assessment cues, not as a separate unrelated weekly topic: ${focus}`;
  }

  if (mode === 'french') {
    return `Use as French language-support guidance for the selected weekly communicative function: listening, speaking, reading, writing, vocabulary, role-play, pronunciation, culture and assessment cues, not as a separate unrelated weekly topic: ${focus}`;
  }

  if (mode === 'mathematics') {
    return index === lessonCount - 1
      ? `Consolidate with worked examples, similar practice problems and assessment: ${focus}`
      : `Teach through anchor examples, worked examples and guided practice: ${focus}`;
  }

  if (mode === 'science') {
    return `Use as investigation, observation, demonstration, discussion and assessment guidance: ${focus}`;
  }

  if (mode === 'social-studies') {
    return `Use as inquiry, local examples, discussion, role-play, research, presentation or community-action guidance: ${focus}`;
  }

  if (mode === 'computing') {
    return `Use as practical ICT demonstration, hands-on exploration, troubleshooting, safe use or digital artefact guidance: ${focus}`;
  }

  if (mode === 'career-technology') {
    return `Use as practical workshop, design, production, safety, materials, tools or enterprise activity guidance: ${focus}`;
  }

  if (mode === 'rme') {
    return `Use as religious knowledge, moral reflection, values application, discussion, role-play or community-life guidance: ${focus}`;
  }

  if (mode === 'creative-arts-design') {
    return `Use as creative process guidance: exploration, design thinking, media/technique practice, performance or making, display, appreciation and appraisal: ${focus}`;
  }

  return `Use as curriculum exemplar guidance for activities, examples and assessment: ${focus}`;
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

function extractIndicatorCodes(value?: string): string[] {
  const text = normalizeCurriculumCodeSpacing(value ?? '');
  const directCodes = text.match(/B[789](?:\/JHS[123])?(?:\.\d+){4}/g) ?? [];
  const expanded = [...directCodes];

  for (const code of directCodes) {
    const rangeMatch = text.match(new RegExp(`${escapeRegExp(code)}-(?:\\d+\\.)*(\\d+)`));
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
  return normalizeCurriculumCodeSpacing(value ?? '').match(/B[789](?:\/JHS[123])?(?:\.\d+){3}/)?.[0] ?? '';
}

function normalizeCurriculumCodeSpacing(value: string): string {
  return value
    .replace(/(JHS\d)\s+(\d)/g, '$1.$2')
    .replace(/(B\d\/JHS\d)\s*\.\s*/g, '$1.')
    .replace(/\s+\./g, '.')
    .replace(/\.\s+/g, '.');
}

function getExemplarSource(subject: string): ExemplarSource | null {
  const normalized = subject.trim().toLowerCase();
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

function getSubjectMode(subject: string): string {
  const normalized = subject.trim().toLowerCase();
  if (normalized.includes('english')) return 'english';
  if (normalized.includes('mathematics') || normalized.includes('math')) return 'mathematics';
  if (normalized.includes('science')) return 'science';
  if (normalized.includes('social studies')) return 'social-studies';
  if (normalized.includes('history')) return 'history';
  if (normalized.includes('computing')) return 'computing';
  if (
    normalized === 'pe' ||
    normalized.includes('phys ed') ||
    normalized.includes('physical education')
  ) {
    return 'physical-education';
  }
  if (normalized.includes('career technology')) return 'career-technology';
  if (normalized === 'rme' || normalized.includes('religious and moral')) return 'rme';
  if (normalized.includes('creative arts')) return 'creative-arts-design';
  if (normalized.includes('ghanaian language')) return 'ghanaian-language';
  if (normalized.includes('french')) return 'french';
  return 'generic';
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
  'apply',
  'analyse',
  'analyze',
  'create',
  'knowledge',
  'understanding',
]);
