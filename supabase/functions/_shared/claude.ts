// Shared Claude (Anthropic) caller for Supabase Edge Functions (Deno runtime).
// The API key is read from the ANTHROPIC_API_KEY secret — never bundled with the app.
import { fetchWithTimeout } from './http.ts';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

export interface ClaudeJsonOptions {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Calls Claude and parses the response as JSON.
 * The system prompt MUST instruct the model to respond with a single JSON object.
 */
export async function callClaudeJson<T = unknown>(opts: ClaudeJsonOptions): Promise<T> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured for this edge function');
  }

  const res = await fetchWithTimeout(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0.4,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
    }),
  }, 90000);

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Claude API error ${res.status}: ${detail}`);
  }

  const payload = await res.json();
  const text = payload?.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new Error('Unexpected Claude response shape');
  }

  if (payload?.stop_reason === 'max_tokens') {
    throw new Error(
      `Claude response was cut off before valid JSON was complete. Increase maxTokens or reduce the requested output. Raw text: ${text.slice(0, 300)}`,
    );
  }

  const cleaned = extractJsonText(text);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Claude did not return valid JSON. Raw text: ${text.slice(0, 300)}`);
  }
}

function extractJsonText(text: string) {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-dev-credit-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
