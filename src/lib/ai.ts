import { invokeEdgeFunction } from './edgeFunctions';
import { buildFallbackLessonPlan } from './fallbackLessonPlan';
import { getExplicitCurriculumYearWeeks, getExplicitSchemeOfWork } from './curriculum';
import { buildSchemeContext, findMatchingScheme } from './schemeStore';
import type { LessonPlan, LessonPlanPromptInput } from '@/types/lessonPlan';
import type { SchemeGenerationInput, SchemeOfWork } from '@/types/scheme';

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
    return 'You do not have enough credits for this action. Buy credits to continue.';
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

  const requestBody = {
    ...input,
    schemeContext: buildSchemeContext(groundingScheme, input.week),
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

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err || 'Something went wrong. Please try again.');
}
