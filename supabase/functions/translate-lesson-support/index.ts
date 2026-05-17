import { corsHeaders } from '../_shared/claude.ts';
import { HttpError, logEdgeError } from '../_shared/supabase.ts';

type LessonPhase = {
  phase?: number;
  title?: string;
  duration?: string;
  activities?: string[];
  resources?: string[];
  assessment?: string[];
};

type LessonPlan = {
  id?: string;
  subject?: string;
  classLevel?: string;
  week?: number;
  weekTitle?: string;
  termTitle?: string;
  subjectClassTitle?: string;
  indicator?: string;
  performanceIndicator?: string;
  phases?: LessonPhase[];
  translationLanguage?: string;
  [key: string]: unknown;
};

type Body = {
  lessonPlan?: LessonPlan;
  localLanguage?: string;
};

const NLLB_SPACE_BASE_URL = 'https://unesco-nllb.hf.space';
const NLLB_SOURCE_LANGUAGE = 'English';
const NLLB_TIMEOUT_MS = 120000;
const NLLB_LANGUAGE_BY_APP_LANGUAGE: Record<string, string> = {
  'Twi / Akan': 'Twi',
  Ewe: 'Ewe',
  Hausa: 'Hausa',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.lessonPlan || typeof body.lessonPlan !== 'object' || !body.localLanguage) {
    return json({ error: 'lessonPlan and localLanguage are required' }, 400);
  }

  const targetLanguage = NLLB_LANGUAGE_BY_APP_LANGUAGE[body.localLanguage];
  if (!targetLanguage) {
    return json({ error: 'NLLB translation currently supports only Twi / Akan, Ewe, and Hausa.' }, 400);
  }

  try {
    const translated = await translateLessonPlanWithNllb(body.lessonPlan, body.localLanguage, targetLanguage);
    return json(translated, 200);
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
        provider: 'nllb',
      },
    });

    return json({ error: (err as Error).message }, 500);
  }
});

async function translateLessonPlanWithNllb(
  source: LessonPlan,
  appLanguage: string,
  nllbTargetLanguage: string,
): Promise<LessonPlan> {
  const translator = createCachedTranslator(nllbTargetLanguage);
  const phases = Array.isArray(source.phases) ? source.phases : [];

  const translatedPhases: LessonPhase[] = [];
  for (const phase of phases) {
    translatedPhases.push({
      ...phase,
      title: await translator(phase.title),
      activities: await translateList(phase.activities, translator),
      assessment: await translateList(phase.assessment, translator),
      resources: Array.isArray(phase.resources) ? phase.resources : [],
    });
  }

  const subject = cleanText(source.subject);
  const classLevel = cleanText(source.classLevel);
  const week = Number(source.week) || 1;
  const sourceId = cleanText(source.id);

  return {
    ...source,
    id: `${sourceId || `${slugify(subject)}-${slugify(classLevel)}-${week}`}-translated-${slugify(appLanguage)}-${Date.now()}`,
    indicator: await translator(source.indicator),
    performanceIndicator: await translator(source.performanceIndicator),
    phases: translatedPhases,
    localLanguageSupport: {
      language: appLanguage,
      reviewNote: 'NLLB machine translation draft. Teacher should review before classroom use.',
    },
    translationLanguage: appLanguage,
    translatedFrom: cleanText(source.translationLanguage) || 'English',
    sourceLessonPlanId: sourceId,
    translationStatus: 'machine_draft',
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
  };
}

async function translateList(
  value: string[] | undefined,
  translator: (text?: string) => Promise<string>,
) {
  if (!Array.isArray(value)) return [];
  const translated: string[] = [];
  for (const item of value) {
    translated.push(await translator(item));
  }
  return translated;
}

function createCachedTranslator(targetLanguage: string) {
  const cache = new Map<string, Promise<string>>();
  return (text?: string) => {
    const cleaned = cleanText(text);
    if (!cleaned) return Promise.resolve('');
    const existing = cache.get(cleaned);
    if (existing) return existing;
    const request = translateTextWithNllb(cleaned, targetLanguage);
    cache.set(cleaned, request);
    return request;
  };
}

async function translateTextWithNllb(text: string, targetLanguage: string): Promise<string> {
  const direct = await translateViaGradioCallApi(text, targetLanguage).catch(() => '');
  if (direct) return direct;

  const legacy = await translateViaLegacyPredictApi(text, targetLanguage).catch(() => '');
  if (legacy) return legacy;

  throw new Error('NLLB translation service is temporarily unavailable. Please try again.');
}

async function translateViaGradioCallApi(text: string, targetLanguage: string): Promise<string> {
  const response = await fetchWithTimeout(`${NLLB_SPACE_BASE_URL}/call/translate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      data: [text, NLLB_SOURCE_LANGUAGE, targetLanguage],
    }),
  });

  if (!response.ok) {
    throw new Error(`NLLB request failed with status ${response.status}`);
  }

  const payload = await response.json().catch(() => null) as { event_id?: string } | null;
  if (!payload?.event_id) {
    throw new Error('NLLB did not return an event id.');
  }

  const resultResponse = await fetchWithTimeout(`${NLLB_SPACE_BASE_URL}/call/translate/${payload.event_id}`);
  if (!resultResponse.ok) {
    throw new Error(`NLLB result failed with status ${resultResponse.status}`);
  }

  return parseGradioEventStream(await resultResponse.text());
}

async function translateViaLegacyPredictApi(text: string, targetLanguage: string): Promise<string> {
  const response = await fetchWithTimeout(`${NLLB_SPACE_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      data: [text, NLLB_SOURCE_LANGUAGE, targetLanguage],
      fn_index: 0,
    }),
  });

  if (!response.ok) {
    throw new Error(`NLLB legacy request failed with status ${response.status}`);
  }

  const payload = await response.json().catch(() => null) as { data?: unknown[] } | null;
  return extractTranslatedText(payload?.data?.[0]);
}

function parseGradioEventStream(stream: string): string {
  for (const line of stream.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const raw = line.replace(/^data:\s*/, '').trim();
    if (!raw || raw === 'null') continue;
    const parsed = JSON.parse(raw) as unknown;
    const translated = extractTranslatedText(Array.isArray(parsed) ? parsed[0] : parsed);
    if (translated) return translated;
  }
  return '';
}

function extractTranslatedText(value: unknown): string {
  if (typeof value === 'string') return cleanText(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const translated = extractTranslatedText(item);
      if (translated) return translated;
    }
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return extractTranslatedText(record.value ?? record.text ?? record.data);
  }
  return '';
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NLLB_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

function cleanText(value: unknown) {
  return String(value ?? '').trim();
}

function slugify(value?: string) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
