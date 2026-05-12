import type { ClassLevel, LessonPlan } from './lessonPlan';

export type TeachingNoteVisualKind =
  | 'diagram'
  | 'chart'
  | 'process'
  | 'table'
  | 'board_sketch'
  | 'curated_image'
  | 'generated_image';

export type TeachingNoteVisualSource = 'structured' | 'curated' | 'generated';

export interface TeachingNoteVisual {
  id: string;
  kind: TeachingNoteVisualKind;
  source: TeachingNoteVisualSource;
  title: string;
  caption?: string;
  altText?: string;
  imageUrl?: string;
  storagePath?: string;
  prompt?: string;
  attribution?: string;
  labels?: Array<{ label: string; description?: string }>;
  rows?: string[][];
  steps?: string[];
}

export interface TeachingNotePhaseGuide {
  phase: 1 | 2 | 3;
  title: string;
  teacherNotes: string[];
}

export interface TeachingNotes {
  id?: string;
  lessonPlanId: string;
  versionNumber?: number;
  title: string;
  subject: string;
  classLevel: ClassLevel;
  week: number;
  lessonNumber?: string;
  topic?: string;
  overview: string;
  preparation: string[];
  phaseGuidance: TeachingNotePhaseGuide[];
  keyExplanations: string[];
  misconceptions: string[];
  questionsToAsk: string[];
  differentiation: string[];
  classroomManagement: string[];
  boardSummary: string[];
  homework?: string[];
  visuals?: TeachingNoteVisual[];
  sourceLessonPlan?: Pick<
    LessonPlan,
    'id' | 'subject' | 'classLevel' | 'week' | 'lessonNumber' | 'topic' | 'strand' | 'subStrand'
  >;
  createdAt?: string;
  updatedAt?: string;
}
