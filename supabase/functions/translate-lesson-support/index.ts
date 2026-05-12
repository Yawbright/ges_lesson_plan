import { callClaudeJson, corsHeaders } from '../_shared/claude.ts';
import {
  buildLessonSupportTranslationPrompt,
  lessonSupportTranslationSystemPrompt,
  normalizeLessonSupportTranslationResponse,
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

  try {
    const prompt = buildLessonSupportTranslationPrompt(body);
    const rawSupport =
      Deno.env.get('GEMINI_API_KEY')
        ? await callGeminiJson(lessonSupportTranslationSystemPrompt, prompt)
        : await callClaudeJson<Record<string, unknown>>({
            system: lessonSupportTranslationSystemPrompt,
            user: prompt,
            maxTokens: 2500,
          });

    return json(normalizeLessonSupportTranslationResponse(rawSupport, body), 200);
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

async function callGeminiJson(system: string, user: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  const model = Deno.env.get('GEMINI_TRANSLATION_MODEL') || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${system}\n\n${user}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(payload).slice(0, 500)}`);
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? '')
    .join('')
    .trim();
  if (!text) throw new Error('Gemini returned an empty translation response');

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned) as Record<string, unknown>;
  }
}
