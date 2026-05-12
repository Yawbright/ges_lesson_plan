import { callClaudeJson, corsHeaders } from '../_shared/claude.ts';
import {
  buildLessonPlanTranslationPrompt,
  lessonPlanTranslationSystemPrompt,
  normalizeLessonPlanTranslationResponse,
  type LessonSupportTranslationBody,
} from '../_shared/generation.ts';
import { HttpError, logEdgeError } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let body: LessonSupportTranslationBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.lessonPlan || typeof body.lessonPlan !== 'object' || !body.localLanguage) {
    return json({ error: 'lessonPlan and localLanguage are required' }, 400);
  }
  if (!isSupportedGhanaianLanguage(body.localLanguage)) {
    return json({ error: 'Translation is currently limited to supported Ghanaian languages.' }, 400);
  }

  try {
    const prompt = buildLessonPlanTranslationPrompt(body);
    const rawPlan = await callClaudeJson<Record<string, unknown>>({
      system: lessonPlanTranslationSystemPrompt,
      user: prompt,
      maxTokens: 6000,
    });

    return json(normalizeLessonPlanTranslationResponse(rawPlan, body), 200);
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message, ...(err.payload ?? {}) }, err.status);
    }

    await logEdgeError({
      userId: null,
      source: 'edge',
      action: 'translate_lesson_support',
      message: (err as Error).message,
      metadata: {
        lessonPlanId: body.lessonPlan?.id ?? null,
        localLanguage: body.localLanguage,
      },
    });

    return json({ error: (err as Error).message }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

function isSupportedGhanaianLanguage(language: string) {
  return new Set([
    'Twi / Akan',
    'Fante',
    'Ewe',
    'Ga',
    'Dangme',
    'Dagbani',
    'Nzema',
    'Gonja',
    'Kasem',
  ]).has(language);
}
