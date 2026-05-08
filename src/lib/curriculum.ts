import { mathematicsB7Terms } from '@/data/curriculum/mathematicsB7';
import {
  mathematicsB8Terms,
  mathematicsB9Terms,
} from '@/data/curriculum/mathematicsB8B9';
import { primaryMathematicsTerms } from '@/data/curriculum/primaryMathematicsB1B6';
import {
  computingB7Terms,
  computingB8Terms,
  computingB9Terms,
} from '@/data/curriculum/computingB7B9';
import { primaryComputingTerms } from '@/data/curriculum/primaryComputingB4B6';
import {
  careerTechnologyB7Terms,
  careerTechnologyB8Terms,
  careerTechnologyB9Terms,
} from '@/data/curriculum/careerTechnologyB7B9';
import {
  creativeArtsDesignB7Terms,
  creativeArtsDesignB8Terms,
  creativeArtsDesignB9Terms,
} from '@/data/curriculum/creativeArtsDesignB7B9';
import { primaryCreativeArtsTerms } from '@/data/curriculum/primaryCreativeArtsB1B6';
import {
  frenchLanguageB7Terms,
  frenchLanguageB8Terms,
  frenchLanguageB9Terms,
} from '@/data/curriculum/frenchLanguageB7B9';
import { primaryFrenchTerms } from '@/data/curriculum/primaryFrenchB4B6';
import {
  englishB7Terms,
  englishB8Terms,
  englishB9Terms,
} from '@/data/curriculum/englishB7B9';
import { primaryEnglishTerms } from '@/data/curriculum/primaryEnglishB1B6';
import {
  ghanaianLanguageB7Terms,
  ghanaianLanguageB8Terms,
  ghanaianLanguageB9Terms,
} from '@/data/curriculum/ghanaianLanguageB7B9';
import { primaryGhanaianLanguageTerms } from '@/data/curriculum/primaryGhanaianLanguageB1B6';
import { scienceB7Terms } from '@/data/curriculum/scienceB7';
import { scienceB8Terms, scienceB9Terms } from '@/data/curriculum/scienceB8B9';
import { primaryScienceTerms } from '@/data/curriculum/primaryScienceB1B6';
import {
  socialStudiesB7Terms,
  socialStudiesB8Terms,
  socialStudiesB9Terms,
} from '@/data/curriculum/socialStudiesB7B9';
import { primaryHistoryTerms } from '@/data/curriculum/primaryHistoryB1B6';
import { rmeB7Terms, rmeB8Terms, rmeB9Terms } from '@/data/curriculum/rmeB7B9';
import { primaryRmeTerms } from '@/data/curriculum/primaryRmeB1B6';
import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeGenerationInput, SchemeOfWork, SchemeWeek } from '@/types/scheme';

interface CurriculumLookupInput {
  subject: string;
  classLevel: ClassLevel;
  term?: string;
}

export type ExplicitCurriculumYearWeek = SchemeWeek & {
  sourceTerm: string;
};

export function getExplicitSchemeOfWork(
  input: SchemeGenerationInput | CurriculumLookupInput
): SchemeOfWork | null {
  const subject = normalizeSubject(input.subject);
  const term = normalizeTerm(input.term);

  if (
    ['B4', 'B5', 'B6'].includes(input.classLevel) &&
    isFrenchSubject(subject)
  ) {
    return buildExplicitScheme(primaryFrenchTerms, input.classLevel, term, 'french-primary');
  }

  if (
    ['B4', 'B5', 'B6'].includes(input.classLevel) &&
    isComputingSubject(subject)
  ) {
    return buildExplicitScheme(primaryComputingTerms, input.classLevel, term, 'computing-primary');
  }

  if (
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(input.classLevel) &&
    isCreativeArtsDesignSubject(subject)
  ) {
    return buildExplicitScheme(
      primaryCreativeArtsTerms,
      input.classLevel,
      term,
      'creative-arts-primary'
    );
  }

  if (
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(input.classLevel) &&
    isHistorySubject(subject)
  ) {
    return buildExplicitScheme(primaryHistoryTerms, input.classLevel, term, 'history-primary');
  }

  if (
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(input.classLevel) &&
    isGhanaianLanguageSubject(subject)
  ) {
    return buildExplicitScheme(
      primaryGhanaianLanguageTerms,
      input.classLevel,
      term,
      'ghanaian-language-primary'
    );
  }

  if (
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(input.classLevel) &&
    isEnglishSubject(subject)
  ) {
    return buildExplicitScheme(primaryEnglishTerms, input.classLevel, term, 'english-primary');
  }

  if (
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(input.classLevel) &&
    isRmeSubject(subject)
  ) {
    return buildExplicitScheme(primaryRmeTerms, input.classLevel, term, 'rme-primary');
  }

  if (
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(input.classLevel) &&
    isScienceSubject(subject)
  ) {
    return buildExplicitScheme(primaryScienceTerms, input.classLevel, term, 'science-primary');
  }

  if (
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(input.classLevel) &&
    isMathematicsSubject(subject)
  ) {
    return buildExplicitScheme(primaryMathematicsTerms, input.classLevel, term, 'mathematics-primary');
  }

  if (input.classLevel === 'B7' && isMathematicsSubject(subject)) {
    return buildExplicitScheme(mathematicsB7Terms, input.classLevel, term, 'mathematics-b7');
  }

  if (input.classLevel === 'B8' && isMathematicsSubject(subject)) {
    return buildExplicitScheme(mathematicsB8Terms, input.classLevel, term, 'mathematics-b8');
  }

  if (input.classLevel === 'B9' && isMathematicsSubject(subject)) {
    return buildExplicitScheme(mathematicsB9Terms, input.classLevel, term, 'mathematics-b9');
  }

  if (input.classLevel === 'B7' && isComputingSubject(subject)) {
    return buildExplicitScheme(computingB7Terms, input.classLevel, term, 'computing-b7');
  }

  if (input.classLevel === 'B8' && isComputingSubject(subject)) {
    return buildExplicitScheme(computingB8Terms, input.classLevel, term, 'computing-b8');
  }

  if (input.classLevel === 'B9' && isComputingSubject(subject)) {
    return buildExplicitScheme(computingB9Terms, input.classLevel, term, 'computing-b9');
  }

  if (input.classLevel === 'B7' && isCareerTechnologySubject(subject)) {
    return buildExplicitScheme(careerTechnologyB7Terms, input.classLevel, term, 'career-technology-b7');
  }

  if (input.classLevel === 'B8' && isCareerTechnologySubject(subject)) {
    return buildExplicitScheme(careerTechnologyB8Terms, input.classLevel, term, 'career-technology-b8');
  }

  if (input.classLevel === 'B9' && isCareerTechnologySubject(subject)) {
    return buildExplicitScheme(careerTechnologyB9Terms, input.classLevel, term, 'career-technology-b9');
  }

  if (input.classLevel === 'B7' && isCreativeArtsDesignSubject(subject)) {
    return buildExplicitScheme(creativeArtsDesignB7Terms, input.classLevel, term, 'creative-arts-design-b7');
  }

  if (input.classLevel === 'B8' && isCreativeArtsDesignSubject(subject)) {
    return buildExplicitScheme(creativeArtsDesignB8Terms, input.classLevel, term, 'creative-arts-design-b8');
  }

  if (input.classLevel === 'B9' && isCreativeArtsDesignSubject(subject)) {
    return buildExplicitScheme(creativeArtsDesignB9Terms, input.classLevel, term, 'creative-arts-design-b9');
  }

  if (input.classLevel === 'B7' && isFrenchSubject(subject)) {
    return buildExplicitScheme(frenchLanguageB7Terms, input.classLevel, term, 'french-b7');
  }

  if (input.classLevel === 'B8' && isFrenchSubject(subject)) {
    return buildExplicitScheme(frenchLanguageB8Terms, input.classLevel, term, 'french-b8');
  }

  if (input.classLevel === 'B9' && isFrenchSubject(subject)) {
    return buildExplicitScheme(frenchLanguageB9Terms, input.classLevel, term, 'french-b9');
  }

  if (input.classLevel === 'B7' && isEnglishSubject(subject)) {
    return buildExplicitScheme(englishB7Terms, input.classLevel, term, 'english-b7');
  }

  if (input.classLevel === 'B8' && isEnglishSubject(subject)) {
    return buildExplicitScheme(englishB8Terms, input.classLevel, term, 'english-b8');
  }

  if (input.classLevel === 'B9' && isEnglishSubject(subject)) {
    return buildExplicitScheme(englishB9Terms, input.classLevel, term, 'english-b9');
  }

  if (input.classLevel === 'B7' && isGhanaianLanguageSubject(subject)) {
    return buildExplicitScheme(ghanaianLanguageB7Terms, input.classLevel, term, 'ghanaian-language-b7');
  }

  if (input.classLevel === 'B8' && isGhanaianLanguageSubject(subject)) {
    return buildExplicitScheme(ghanaianLanguageB8Terms, input.classLevel, term, 'ghanaian-language-b8');
  }

  if (input.classLevel === 'B9' && isGhanaianLanguageSubject(subject)) {
    return buildExplicitScheme(ghanaianLanguageB9Terms, input.classLevel, term, 'ghanaian-language-b9');
  }

  if (input.classLevel === 'B7' && isSocialStudiesSubject(subject)) {
    return buildExplicitScheme(socialStudiesB7Terms, input.classLevel, term, 'social-studies-b7');
  }

  if (input.classLevel === 'B8' && isSocialStudiesSubject(subject)) {
    return buildExplicitScheme(socialStudiesB8Terms, input.classLevel, term, 'social-studies-b8');
  }

  if (input.classLevel === 'B9' && isSocialStudiesSubject(subject)) {
    return buildExplicitScheme(socialStudiesB9Terms, input.classLevel, term, 'social-studies-b9');
  }

  if (input.classLevel === 'B7' && isRmeSubject(subject)) {
    return buildExplicitScheme(rmeB7Terms, input.classLevel, term, 'rme-b7');
  }

  if (input.classLevel === 'B8' && isRmeSubject(subject)) {
    return buildExplicitScheme(rmeB8Terms, input.classLevel, term, 'rme-b8');
  }

  if (input.classLevel === 'B9' && isRmeSubject(subject)) {
    return buildExplicitScheme(rmeB9Terms, input.classLevel, term, 'rme-b9');
  }

  if (input.classLevel === 'B7' && isScienceSubject(subject)) {
    return buildExplicitScheme(scienceB7Terms, input.classLevel, term, 'science-b7');
  }

  if (input.classLevel === 'B8' && isScienceSubject(subject)) {
    return buildExplicitScheme(scienceB8Terms, input.classLevel, term, 'science-b8');
  }

  if (input.classLevel === 'B9' && isScienceSubject(subject)) {
    return buildExplicitScheme(scienceB9Terms, input.classLevel, term, 'science-b9');
  }

  return null;
}

export function getExplicitCurriculumYearWeeks(
  input: Omit<CurriculumLookupInput, 'term'>
): ExplicitCurriculumYearWeek[] {
  const yearTerms = getExplicitCurriculumTerms(input.subject, input.classLevel);
  return yearTerms.flatMap((scheme) =>
    scheme.weeks.map((week) => ({
      ...week,
      sourceTerm: scheme.term,
    }))
  );
}

function isMathematicsSubject(subject: string): boolean {
  return ['mathematics', 'maths', 'math', 'core mathematics', 'primary mathematics', 'p. maths', 'p maths'].includes(subject);
}

function isScienceSubject(subject: string): boolean {
  return [
    'science',
    'integrated science',
    'general science',
    'primary science',
    'p. science',
    'p science',
  ].includes(subject);
}

function isComputingSubject(subject: string): boolean {
  return ['computing', 'ict', 'information and communication technology'].includes(subject);
}

function isCareerTechnologySubject(subject: string): boolean {
  return [
    'career technology',
    'career tech',
    'ct',
  ].includes(subject);
}

function isCreativeArtsDesignSubject(subject: string): boolean {
  return [
    'creative arts and design',
    'creative arts',
    'cad',
  ].includes(subject);
}

function isFrenchSubject(subject: string): boolean {
  return [
    'french',
    'french language',
  ].includes(subject);
}

function isEnglishSubject(subject: string): boolean {
  return ['english', 'english language', 'primary english', 'p. english', 'p english'].includes(subject);
}

function isGhanaianLanguageSubject(subject: string): boolean {
  return [
    'ghanaian language',
    'ghanaian languages',
    'gl',
    'primary ghanaian language',
    'p. ghanaian language',
    'p ghanaian language',
  ].includes(subject);
}

function isSocialStudiesSubject(subject: string): boolean {
  return ['social studies', 'social study'].includes(subject);
}

function isHistorySubject(subject: string): boolean {
  return ['history', 'primary history', 'p. history', 'p history'].includes(subject);
}

function isRmeSubject(subject: string): boolean {
  return [
    'rme',
    'religious and moral education',
    'religious moral education',
    'religious education',
  ].includes(subject);
}

function buildExplicitScheme(
  terms: Array<{
    classLevel: ClassLevel;
    term: string;
    title: string;
    subject: string;
    weeks: SchemeOfWork['weeks'];
  }>,
  classLevel: ClassLevel,
  normalizedTerm: string,
  idPrefix: string
): SchemeOfWork | null {
  const match = terms.find(
    (item) =>
      item.classLevel === classLevel &&
      normalizeTerm(item.term) === normalizedTerm
  );

  if (!match) return null;

  return {
    id: `${idPrefix}-${slugify(match.term)}`,
    title: match.title,
    subject: match.subject,
    classLevel: match.classLevel,
    term: match.term,
    source: 'mapped',
    weeks: match.weeks,
    createdAt: new Date().toISOString(),
  };
}

function getExplicitCurriculumTerms(
  subjectInput: string,
  classLevel: ClassLevel
): SchemeOfWork[] {
  const subject = normalizeSubject(subjectInput);

  const terms = resolveExplicitTerms(subject, classLevel);
  return terms.map((item) => ({
    id: `${slugify(item.subject)}-${classLevel}-${slugify(item.term)}`,
    title: item.title,
    subject: item.subject,
    classLevel: item.classLevel,
    term: item.term,
    source: 'mapped',
    weeks: item.weeks,
    createdAt: new Date().toISOString(),
  }));
}

function resolveExplicitTerms(
  subject: string,
  classLevel: ClassLevel
): Array<{
  classLevel: ClassLevel;
  term: string;
  title: string;
  subject: string;
  weeks: SchemeOfWork['weeks'];
}> {
  if (['B4', 'B5', 'B6'].includes(classLevel) && isFrenchSubject(subject)) {
    return primaryFrenchTerms.filter((item) => item.classLevel === classLevel);
  }

  if (['B4', 'B5', 'B6'].includes(classLevel) && isComputingSubject(subject)) {
    return primaryComputingTerms.filter((item) => item.classLevel === classLevel);
  }

  if (['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(classLevel) && isCreativeArtsDesignSubject(subject)) {
    return primaryCreativeArtsTerms.filter((item) => item.classLevel === classLevel);
  }

  if (['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(classLevel) && isHistorySubject(subject)) {
    return primaryHistoryTerms.filter((item) => item.classLevel === classLevel);
  }

  if (['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(classLevel) && isGhanaianLanguageSubject(subject)) {
    return primaryGhanaianLanguageTerms.filter((item) => item.classLevel === classLevel);
  }

  if (['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(classLevel) && isEnglishSubject(subject)) {
    return primaryEnglishTerms.filter((item) => item.classLevel === classLevel);
  }

  if (['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(classLevel) && isRmeSubject(subject)) {
    return primaryRmeTerms.filter((item) => item.classLevel === classLevel);
  }

  if (['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(classLevel) && isScienceSubject(subject)) {
    return primaryScienceTerms.filter((item) => item.classLevel === classLevel);
  }

  if (['B1', 'B2', 'B3', 'B4', 'B5', 'B6'].includes(classLevel) && isMathematicsSubject(subject)) {
    return primaryMathematicsTerms.filter((item) => item.classLevel === classLevel);
  }

  if (classLevel === 'B7' && isMathematicsSubject(subject)) return mathematicsB7Terms;
  if (classLevel === 'B8' && isMathematicsSubject(subject)) return mathematicsB8Terms;
  if (classLevel === 'B9' && isMathematicsSubject(subject)) return mathematicsB9Terms;

  if (classLevel === 'B7' && isComputingSubject(subject)) return computingB7Terms;
  if (classLevel === 'B8' && isComputingSubject(subject)) return computingB8Terms;
  if (classLevel === 'B9' && isComputingSubject(subject)) return computingB9Terms;

  if (classLevel === 'B7' && isCareerTechnologySubject(subject)) return careerTechnologyB7Terms;
  if (classLevel === 'B8' && isCareerTechnologySubject(subject)) return careerTechnologyB8Terms;
  if (classLevel === 'B9' && isCareerTechnologySubject(subject)) return careerTechnologyB9Terms;

  if (classLevel === 'B7' && isCreativeArtsDesignSubject(subject)) return creativeArtsDesignB7Terms;
  if (classLevel === 'B8' && isCreativeArtsDesignSubject(subject)) return creativeArtsDesignB8Terms;
  if (classLevel === 'B9' && isCreativeArtsDesignSubject(subject)) return creativeArtsDesignB9Terms;

  if (classLevel === 'B7' && isFrenchSubject(subject)) return frenchLanguageB7Terms;
  if (classLevel === 'B8' && isFrenchSubject(subject)) return frenchLanguageB8Terms;
  if (classLevel === 'B9' && isFrenchSubject(subject)) return frenchLanguageB9Terms;

  if (classLevel === 'B7' && isEnglishSubject(subject)) return englishB7Terms;
  if (classLevel === 'B8' && isEnglishSubject(subject)) return englishB8Terms;
  if (classLevel === 'B9' && isEnglishSubject(subject)) return englishB9Terms;

  if (classLevel === 'B7' && isGhanaianLanguageSubject(subject)) return ghanaianLanguageB7Terms;
  if (classLevel === 'B8' && isGhanaianLanguageSubject(subject)) return ghanaianLanguageB8Terms;
  if (classLevel === 'B9' && isGhanaianLanguageSubject(subject)) return ghanaianLanguageB9Terms;

  if (classLevel === 'B7' && isSocialStudiesSubject(subject)) return socialStudiesB7Terms;
  if (classLevel === 'B8' && isSocialStudiesSubject(subject)) return socialStudiesB8Terms;
  if (classLevel === 'B9' && isSocialStudiesSubject(subject)) return socialStudiesB9Terms;

  if (classLevel === 'B7' && isRmeSubject(subject)) return rmeB7Terms;
  if (classLevel === 'B8' && isRmeSubject(subject)) return rmeB8Terms;
  if (classLevel === 'B9' && isRmeSubject(subject)) return rmeB9Terms;

  if (classLevel === 'B7' && isScienceSubject(subject)) return scienceB7Terms;
  if (classLevel === 'B8' && isScienceSubject(subject)) return scienceB8Terms;
  if (classLevel === 'B9' && isScienceSubject(subject)) return scienceB9Terms;

  return [];
}

function normalizeSubject(subject: string): string {
  return subject.trim().toLowerCase();
}

function normalizeTerm(term?: string): string {
  const value = (term ?? '').trim().toLowerCase();

  if (!value) return '';
  if (value.includes('1') || value.includes('first') || value.includes('begin')) return 'term 1';
  if (value.includes('2') || value.includes('second') || value.includes('mid')) return 'term 2';
  if (value.includes('3') || value.includes('third') || value.includes('end') || value.includes('final')) return 'term 3';
  return value;
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
