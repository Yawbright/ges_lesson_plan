import { invokeEdgeFunction } from './edgeFunctions';
import { buildFallbackLessonPlan } from './fallbackLessonPlan';
import { getExplicitCurriculumYearWeeks, getExplicitSchemeOfWork } from './curriculum';
import { buildSchemeContext, findMatchingScheme } from './schemeStore';
import { buildExemplarLessonGuidance } from './exemplarLessonGuidance';
import type { LessonPlan, LessonPlanPromptInput } from '@/types/lessonPlan';
import type { SchemeGenerationInput, SchemeOfWork } from '@/types/scheme';
import type { TeachingNotes } from '@/types/teachingNotes';

export interface ParsedUploadedSchemeResult {
  scheme: SchemeOfWork;
  detectedMetadata?: {
    subject?: string;
    classLevel?: string;
    term?: string;
  };
  creditBalance?: number;
}

export function isInsufficientCreditsError(err: unknown): boolean {
  const message = getErrorMessage(err).toLowerCase();
  return message.includes('insufficient_credits') || message.includes('not have enough credits');
}

export function isAiSecretMissingError(err: unknown): boolean {
  const message = getErrorMessage(err).toLowerCase();
  return message.includes('anthropic_api_key') && message.includes('not configured');
}

export function formatAiActionError(err: unknown): string {
  if (isInsufficientCreditsError(err)) {
    return 'You do not have enough credits for this action. Refer friends to earn more credits.';
  }

  if (isAiSecretMissingError(err)) {
    return (
      'AI generation is not configured on Supabase yet. Set the ANTHROPIC_API_KEY secret, ' +
      'then redeploy the generation functions.'
    );
  }

  return getErrorMessage(err);
}

const bypassAuth = process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true';
const explicitUseLocalAi = process.env.EXPO_PUBLIC_USE_LOCAL_AI === 'true';
const forceCloudAi = process.env.EXPO_PUBLIC_USE_LOCAL_AI === 'false';
const useLocalAi = explicitUseLocalAi || (bypassAuth && !forceCloudAi);

const localAiBaseUrl =
  (process.env.EXPO_PUBLIC_LOCAL_AI_URL ?? 'http://localhost:8787').replace(/\/$/, '');

async function invokeEdgeFunctionJson<T>(functionName: string, body: object): Promise<T> {
  return invokeEdgeFunction<T>(functionName, body, {
    authErrorMessage: 'Cloud AI unavailable: no signed-in Supabase session.',
  });
}

export async function generateLessonPlan(
  input: LessonPlanPromptInput,
  selectedScheme?: SchemeOfWork | null
): Promise<LessonPlan> {
  const matchedScheme = selectedScheme
    ? null
    : await findMatchingScheme({
        subject: input.subject,
        classLevel: input.classLevel,
        term: input.term,
      });
  const groundingScheme = selectedScheme ?? matchedScheme;

  if (!groundingScheme) {
    throw new Error(
      'Lesson plan generation now depends on a saved scheme of work. Generate or select a scheme for this subject, class and term first.'
    );
  }

  const schemeContext = buildSchemeContext(groundingScheme, input.week);
  const lessonFocusGuidance = buildExemplarLessonGuidance({
    subject: groundingScheme.subject || input.subject,
    classLevel: groundingScheme.classLevel || input.classLevel,
    week: schemeContext.selectedWeek,
    sessionIndex: input.sessionIndex,
    sessionsPerWeek: input.sessionsPerWeek,
  });

  const requestBody = {
    ...input,
    schemeContext: {
      ...schemeContext,
      lessonFocusGuidance,
    },
  };

  if (useLocalAi) {
    try {
      return await postLocal<LessonPlan>('/generate-lesson-plan', requestBody);
    } catch {
      return buildFallbackLessonPlan(input, groundingScheme);
    }
  }

  const data = await invokeEdgeFunctionJson<LessonPlan>('generate-lesson-plan', requestBody);
  return validateLessonPlan(data);
}

export async function generateSchemeOfWork(
  input: SchemeGenerationInput
): Promise<SchemeOfWork> {
  const explicitScheme = getExplicitSchemeOfWork(input);
  if (explicitScheme) {
    return explicitScheme;
  }

  if (useLocalAi) {
    return postLocal<SchemeOfWork>('/generate-scheme', input);
  }

  return invokeEdgeFunctionJson<SchemeOfWork>('generate-scheme', input);
}

export async function parseUploadedScheme(input: {
  subject: string;
  classLevel: string;
  term: string;
  fileName: string;
  fileBase64: string;
  numberOfWeeks?: number;
}): Promise<ParsedUploadedSchemeResult> {
  const curriculumHint = getExplicitSchemeOfWork({
    subject: input.subject,
    classLevel: input.classLevel as SchemeGenerationInput['classLevel'],
    term: input.term,
    numberOfWeeks: input.numberOfWeeks,
  });
  const curriculumYearHint = getExplicitCurriculumYearWeeks({
    subject: input.subject,
    classLevel: input.classLevel as SchemeGenerationInput['classLevel'],
  });

  const requestBody = {
    ...input,
    curriculumHint,
    curriculumYearHint,
  };

  if (useLocalAi) {
    return postJson<ParsedUploadedSchemeResult>(
      localAiBaseUrl,
      '/parse-scheme-upload',
      requestBody,
    );
  }

  return invokeEdgeFunctionJson<ParsedUploadedSchemeResult>('parse-uploaded-scheme', requestBody);
}

export async function generateTeachingNotes(plan: LessonPlan): Promise<TeachingNotes> {
  const requestBody = { lessonPlan: plan };

  if (useLocalAi) {
    try {
      return await postLocal<TeachingNotes>('/generate-teaching-notes', requestBody);
    } catch {
      return buildFallbackTeachingNotes(plan);
    }
  }

  const data = await invokeEdgeFunctionJson<TeachingNotes>('generate-teaching-notes', requestBody);
  return validateTeachingNotes(data);
}

export async function translateLessonPlan(
  plan: LessonPlan,
  localLanguage: string,
): Promise<LessonPlan> {
  const requestBody = { lessonPlan: plan, localLanguage };

  if (useLocalAi) {
    const data = await postLocal<LessonPlan>('/translate-lesson-support', requestBody);
    return validateLessonPlan(data);
  }

  const data = await invokeEdgeFunctionJson<LessonPlan>('translate-lesson-support', requestBody);
  return validateLessonPlan(data);
}

async function postLocal<T>(path: string, body: unknown): Promise<T> {
  return postJson<T>(localAiBaseUrl, path, body);
}

async function postJson<T>(baseUrl: string, path: string, body: unknown): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof payload?.error === 'string'
        ? payload.error
        : `Local AI request failed with status ${response.status}`
    );
  }

  if (!payload) {
    throw new Error('Local AI returned an empty response');
  }

  return payload as T;
}

function validateLessonPlan(plan: LessonPlan): LessonPlan {
  if (!plan || typeof plan !== 'object') {
    throw new Error('Lesson generation returned an invalid response.');
  }

  if (!Array.isArray(plan.phases) || !plan.phases.length) {
    throw new Error('Lesson generation completed, but the lesson body was empty. Please try again.');
  }

  if (!plan.subject || !plan.classLevel || !plan.week) {
    throw new Error('Lesson generation returned incomplete lesson metadata. Please try again.');
  }

  return plan;
}

function validateTeachingNotes(notes: TeachingNotes): TeachingNotes {
  if (!notes || typeof notes !== 'object') {
    throw new Error('Teaching notes generation returned an invalid response.');
  }

  if (
    !notes.lessonPlanId ||
    !notes.overview ||
    !Array.isArray(notes.phaseGuidance) ||
    !notes.phaseGuidance.length
  ) {
    throw new Error('Teaching notes generation returned incomplete notes. Please try again.');
  }

  return notes;
}

function buildFallbackTeachingNotes(plan: LessonPlan): TeachingNotes {
  const phaseGuidance = plan.phases.map((phase) => ({
    phase: phase.phase,
    title: phase.title,
    teacherNotes: [
      `Use the planned ${phase.title.toLowerCase()} activities as the classroom sequence.`,
      ...phase.activities.map((activity) => `Explain and model: ${activity}`),
    ],
  }));

  return {
    lessonPlanId: plan.id ?? `${plan.subject}-${plan.classLevel}-${plan.week}`,
    title: `Teaching Notes: ${plan.subject} ${plan.classLevel} Week ${plan.week}`,
    subject: plan.subject,
    classLevel: plan.classLevel,
    week: plan.week,
    lessonNumber: plan.lessonNumber,
    topic: plan.topic,
    overview: `These notes support the lesson on ${plan.topic || plan.subject}. Use them to explain the key ideas clearly and guide learners through the planned activities.`,
    preparation: [
      'Review the lesson plan phases before class.',
      'Prepare the listed resources and any simple local examples learners can recognise.',
      'Write the topic, performance indicator, and key vocabulary on the board.',
    ],
    phaseGuidance,
    keyExplanations: [plan.performanceIndicator || `Learners should understand the main idea in ${plan.topic || plan.subject}.`],
    misconceptions: ['Some learners may memorise terms without explaining them in their own words. Ask them to give examples.'],
    questionsToAsk: plan.phases.flatMap((phase) => phase.assessment ?? []).slice(0, 6),
    differentiation: [
      'Support struggling learners with paired discussion and concrete examples.',
      'Ask fast learners to explain their reasoning or create an extra example.',
    ],
    classroomManagement: [
      'Keep instructions short before group work.',
      'Move around the classroom to listen, prompt, and correct gently.',
    ],
    boardSummary: [
      plan.topic ? `Topic: ${plan.topic}` : `Subject: ${plan.subject}`,
      plan.performanceIndicator || 'Main learning point from the lesson.',
    ],
    homework: ['Ask learners to revise the board summary and answer one related question at home.'],
    contentBlocks: [
      {
        id: 'topic-heading',
        type: 'heading',
        text: plan.topic || plan.subject,
      },
      {
        id: 'overview',
        type: 'paragraph',
        title: 'Lesson Note',
        text: `This note explains the main ideas learners need for ${plan.topic || plan.subject}. The teacher should use clear examples and allow learners to practise the key skill or concept.`,
      },
      {
        id: 'key-points',
        type: 'bullet_list',
        title: 'Key Points',
        items: [
          plan.performanceIndicator || `Understand the main idea in ${plan.topic || plan.subject}.`,
          ...(plan.phases[1]?.activities ?? plan.phases.flatMap((phase) => phase.activities)).slice(0, 4),
        ],
      },
      {
        id: 'practice',
        type: 'practice_questions',
        title: 'Practice Questions',
        items: plan.phases.flatMap((phase) => phase.assessment ?? []).slice(0, 5),
      },
    ],
    visuals: [],
  };
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err || 'Something went wrong. Please try again.');
}
