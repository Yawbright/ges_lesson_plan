import type { ClassLevel } from '@/types/lessonPlan';

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

export const CLASS_LEVEL_OPTIONS: SelectOption<ClassLevel>[] = [
  { label: 'B1', value: 'B1' },
  { label: 'B2', value: 'B2' },
  { label: 'B3', value: 'B3' },
  { label: 'B4', value: 'B4' },
  { label: 'B5', value: 'B5' },
  { label: 'B6', value: 'B6' },
  { label: 'B7', value: 'B7' },
  { label: 'B8', value: 'B8' },
  { label: 'B9', value: 'B9' },
];

export const TERM_OPTIONS: SelectOption[] = [
  { label: 'Term 1', value: 'Term 1' },
  { label: 'Term 2', value: 'Term 2' },
  { label: 'Term 3', value: 'Term 3' },
];

export const LESSONS_PER_WEEK_OPTIONS: SelectOption[] = [1, 2, 3, 4].map((value) => ({
  label: String(value),
  value: String(value),
}));

export const LOCAL_LANGUAGE_OPTIONS: SelectOption[] = [
  { label: 'None', value: '' },
  { label: 'Twi / Akan', value: 'Twi / Akan' },
  { label: 'Ewe', value: 'Ewe' },
  { label: 'Hausa', value: 'Hausa' },
];

const PRIMARY_LOWER_SUBJECTS = [
  'Mathematics',
  'Science',
  'English Language',
  'Ghanaian Language',
  'RME',
  'History',
  'Creative Arts and Design',
] as const;

const PRIMARY_UPPER_SUBJECTS = [
  ...PRIMARY_LOWER_SUBJECTS,
  'Computing',
  'French',
] as const;

const JHS_SUBJECTS = [
  'Mathematics',
  'Science',
  'English Language',
  'Ghanaian Language',
  'Social Studies',
  'RME',
  'Computing',
  'Career Technology',
  'Creative Arts and Design',
  'French',
] as const;

export function getSubjectOptionsForClassLevel(classLevel: ClassLevel): SelectOption[] {
  const values =
    classLevel === 'B1' || classLevel === 'B2' || classLevel === 'B3'
      ? PRIMARY_LOWER_SUBJECTS
      : classLevel === 'B4' || classLevel === 'B5' || classLevel === 'B6'
        ? PRIMARY_UPPER_SUBJECTS
        : classLevel === 'B7' || classLevel === 'B8' || classLevel === 'B9'
          ? JHS_SUBJECTS
          : [];

  return values.map((value) => ({ label: value, value }));
}

export function getDefaultSubjectForClassLevel(classLevel: ClassLevel): string {
  return getSubjectOptionsForClassLevel(classLevel)[0]?.value ?? '';
}

export function getWeekOptions(count: number): SelectOption[] {
  return Array.from({ length: count }, (_, index) => ({
    label: `Week ${index + 1}`,
    value: String(index + 1),
  }));
}

export function getLessonIndexOptions(count: number): SelectOption[] {
  return Array.from({ length: count }, (_, index) => ({
    label: `Lesson ${index + 1}`,
    value: String(index + 1),
  }));
}
