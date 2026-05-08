// Types match the EXACT Ghanaian NaCCA/GES lesson plan format used in Ghanaian schools.
// Derived from real B7 Science lesson plans (Term 2, 2022).

export type ClassLevel =
  | 'KG1' | 'KG2'
  | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6'
  | 'B7' | 'B8' | 'B9'
  | 'SHS1' | 'SHS2' | 'SHS3';

/**
 * A single phase row in the 3-phase lesson table.
 *
 * The official template has ONE combined "Learners Activities" column
 * (written from the teacher's perspective: "Guide learners to...",
 * "Revise with learners...") plus a separate Resources column.
 * Assessment questions are embedded at the end of Phase 2.
 */
export interface LessonPhase {
  /** 1 = STARTER · 2 = NEW LEARNING · 3 = REFLECTION */
  phase: 1 | 2 | 3;
  /** e.g. "STARTER", "NEW LEARNING", "REFLECTION" */
  title: string;
  /** Optional time allocation shown in Phase/Duration column, e.g. "10 mins" */
  duration?: string;
  /** Combined teacher-led / learner activities written as instructional steps */
  activities: string[];
  /** Resources listed in the Resources column for this phase */
  resources?: string[];
  /** Assessment questions — only present in Phase 2 */
  assessment?: string[];
}

/**
 * Full lesson plan matching the official Ghanaian template.
 *
 * Layout (top → bottom):
 *   Title block  →  Header info rows  →  Curriculum block  →  3-phase table
 */
export interface LessonPlan {
  id?: string;

  // ── Title block ──────────────────────────────────────────────────────────
  /** e.g. "SECOND TERM LESSON PLAN" */
  termTitle: string;
  /** e.g. "SCIENCE – B7" */
  subjectClassTitle: string;
  /** e.g. "WEEK 1" */
  weekTitle: string;

  // ── Header info rows ─────────────────────────────────────────────────────
  date?: string;          // e.g. "13TH MAY, 2022"
  period?: string;        // e.g. "1st"
  subject: string;        // e.g. "Science"
  duration?: string;      // e.g. "50MINS"
  strand?: string;        // e.g. "Systems"
  classLevel: ClassLevel; // e.g. "B7"
  classSize?: string;     // left blank in template
  subStrand?: string;     // e.g. "The Human Body Systems"
  topic?: string;         // e.g. "Algebraic Expressions"

  // ── Curriculum block ─────────────────────────────────────────────────────
  contentStandard?: string;      // e.g. "B7.3.1.1 Show an understanding of..."
  indicator?: string;            // e.g. "B7.3.1.1.1 Explain the concept of..."
  /** Lesson number within the week's series, e.g. "1 of 3" */
  lessonNumber?: string;
  performanceIndicator?: string; // e.g. "Learners can explain why humans need to eat."
  /** NaCCA competency codes, e.g. ["DL 5.1", "CP 5.1", "DL 6.6"] */
  coreCompetencies?: string[];
  references?: string;           // e.g. "Science Curriculum Pg. 16-17"
  teacherName?: string;
  schoolName?: string;
  schoolDistrict?: string;

  // ── 3-phase lesson table ─────────────────────────────────────────────────
  phases: LessonPhase[];

  // ── Meta ─────────────────────────────────────────────────────────────────
  week: number;
  sessionIndex?: number;
  sessionsPerWeek?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Inputs the user provides on the Generate screen. */
export interface LessonPlanPromptInput {
  subject: string;
  classLevel: ClassLevel;
  week: number;
  /** e.g. "Term 2" */
  term?: string;
  /** e.g. 1 for Lesson 1 of 3 in the week */
  sessionIndex?: number;
  /** e.g. 3 maths lessons per week */
  sessionsPerWeek?: number;
  /** Optional free-text guidance e.g. "focus on practical experiment" */
  notes?: string;
  /** Calculated/manual week ending date shown in the lesson header */
  weekEnding?: string;
  duration?: string;
  teacherName?: string;
  schoolName?: string;
  schoolDistrict?: string;
  classSize?: string;
  /** Optional id of a stored Scheme of Learning to ground generation */
  schemeOfLearningId?: string;
}
