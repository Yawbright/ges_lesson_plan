import type { LessonPhase, LessonPlan, LessonPlanPromptInput } from '@/types/lessonPlan';
import type { SchemeOfWork, SchemeWeek, SchemeWeekEntry } from '@/types/scheme';
import { buildSchemeContext } from './schemeStore';

export function buildFallbackLessonPlan(
  input: LessonPlanPromptInput,
  scheme: SchemeOfWork
): LessonPlan {
  const schemeContext = buildSchemeContext(scheme, input.week);
  const selectedWeek = schemeContext.selectedWeek ?? getWeekByNumber(scheme, input.week);
  const primaryEntry = getPrimaryEntry(selectedWeek);
  const topic = selectedWeek?.topic || primaryEntry?.topic || `Week ${input.week} lesson`;
  const strand = selectedWeek?.strand || primaryEntry?.strand || scheme.subject;
  const subStrand = selectedWeek?.subStrand || primaryEntry?.subStrand || topic;
  const contentStandard =
    selectedWeek?.contentStandard ||
    primaryEntry?.contentStandard ||
    `Teach learners the key ideas for ${topic}.`;
  const indicator =
    selectedWeek?.indicator ||
    primaryEntry?.indicator ||
    `Learners should demonstrate understanding of ${topic}.`;
  const sessionsPerWeek = input.sessionsPerWeek ?? 1;
  const sessionIndex = input.sessionIndex ?? 1;
  const lessonNumber = `${sessionIndex} of ${sessionsPerWeek}`;
  const termLabel = normalizeTermLabel(input.term || scheme.term || 'Term 1');
  const resources = unique([
    ...(selectedWeek?.resources ?? []),
    ...(primaryEntry?.resources ?? []),
    ...defaultResourceList(topic),
  ]);
  const performanceIndicator =
    `Learners can ${buildPerformanceVerb(sessionIndex)} ${topic.toLowerCase()}.`;

  return {
    termTitle: `${termLabel.toUpperCase()} LESSON PLAN`,
    subjectClassTitle: `${input.subject.toUpperCase()} - ${input.classLevel.toUpperCase()}`,
    weekTitle: `WEEK ${input.week}`,
    date: input.weekEnding ?? '',
    period: '',
    subject: input.subject,
    duration: input.duration ?? '60 mins',
    strand,
    classLevel: input.classLevel,
    classSize: input.classSize ?? '',
    subStrand,
    topic,
    contentStandard,
    indicator,
    lessonNumber,
    performanceIndicator,
    coreCompetencies: inferCoreCompetencies(input.subject),
    references: `Fallback template based on ${scheme.title}, Week ${input.week}`,
    week: input.week,
    sessionIndex,
    sessionsPerWeek,
    teacherName: input.teacherName,
    schoolName: input.schoolName,
    schoolDistrict: input.schoolDistrict,
    phases: buildFallbackPhases({
      topic,
      notes: input.notes,
      resources,
      sessionIndex,
      sessionsPerWeek,
    }),
    visualAids: [
      {
        type: 'flowchart',
        title: `${topic} learning flow`,
        purpose: `Supports learners to follow the main ideas in ${topic}.`,
        phase: 2,
        activityLink: `Use during the guided practice activity on ${topic}.`,
        steps: [
          'Recall what learners already know',
          'Observe or discuss the classroom example',
          'Identify the key idea',
          'Practise with a partner',
          'Share and correct responses',
        ],
        caption: 'Teacher may copy this flow on the board before group work.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildFallbackPhases(input: {
  topic: string;
  notes?: string;
  resources: string[];
  sessionIndex: number;
  sessionsPerWeek: number;
}): LessonPhase[] {
  const sessionLabel = `${input.sessionIndex} of ${input.sessionsPerWeek}`;
  const notesLine = input.notes ? ` Teacher note: ${input.notes}.` : '';

  return [
    {
      phase: 1,
      title: 'STARTER',
      duration: '10 mins',
      activities: [
        `Revise with learners what they already know about ${input.topic}.`,
        `Brainstorm key words and everyday examples connected to ${input.topic}.`,
        `Share the lesson focus for session ${sessionLabel}.${notesLine}`.trim(),
      ],
      resources: input.resources.slice(0, 3),
    },
    {
      phase: 2,
      title: 'NEW LEARNING',
      duration: '40 mins',
      activities: [
        `Introduce the main idea of ${input.topic} using simple Ghanaian classroom examples.`,
        `Guide learners to identify the important facts, steps, or features in ${input.topic}.`,
        `Model one worked example or demonstration for ${input.topic}.`,
        `Have learners practise in pairs or small groups while you support them.`,
        `Discuss learners' responses and correct misconceptions together.`,
        input.notes
          ? `Incorporate this teaching note into the activity flow: ${input.notes}.`
          : `Provide additional guided practice so learners can apply ${input.topic} with confidence.`,
      ],
      resources: input.resources,
      assessment: [
        `What is ${input.topic}?`,
        `State or show one important idea you learned about ${input.topic}.`,
        `Use ${input.topic} in a short class exercise or explanation.`,
      ],
    },
    {
      phase: 3,
      title: 'REFLECTION',
      duration: '10 mins',
      activities: [
        `Summarise the main lesson points on ${input.topic} with learners.`,
        `Ask learners to share one thing they understood well and one part that needs more practice.`,
      ],
      resources: input.resources.slice(0, 2),
    },
  ];
}

function getWeekByNumber(scheme: SchemeOfWork, week: number): SchemeWeek | undefined {
  return scheme.weeks.find((item) => item.week === week);
}

function getPrimaryEntry(week?: SchemeWeek): SchemeWeekEntry | undefined {
  if (!week) return undefined;
  if (Array.isArray(week.entries) && week.entries.length) return week.entries[0];
  return {
    strand: week.strand,
    subStrand: week.subStrand,
    contentStandard: week.contentStandard,
    indicator: week.indicator,
    topic: week.topic,
    resources: week.resources,
  };
}

function defaultResourceList(topic: string): string[] {
  return ['Marker board', 'Textbook', `${topic} examples`];
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const cleaned = value.trim();
    if (!cleaned) return false;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferCoreCompetencies(subject: string): string[] {
  const lower = subject.toLowerCase();
  if (lower.includes('english') || lower.includes('language') || lower.includes('french')) {
    return ['CC 8.3', 'CI 6.1', 'CP 5.1'];
  }
  if (lower.includes('math')) {
    return ['CP 5.1', 'DL 5.3', 'CI 6.2'];
  }
  if (lower.includes('science') || lower.includes('comput')) {
    return ['CP 5.1', 'CI 6.2', 'DL 5.5'];
  }
  return ['CP 5.1', 'CI 6.2', 'DL 5.3'];
}

function buildPerformanceVerb(sessionIndex: number): string {
  if (sessionIndex <= 1) return 'describe';
  if (sessionIndex === 2) return 'explain and practise';
  return 'apply';
}

function normalizeTermLabel(term: string): string {
  const lower = term.trim().toLowerCase();
  if (lower.includes('1') || lower.includes('first')) return 'Term 1';
  if (lower.includes('2') || lower.includes('second')) return 'Term 2';
  if (lower.includes('3') || lower.includes('third')) return 'Term 3';
  return term.trim() || 'Term 1';
}
