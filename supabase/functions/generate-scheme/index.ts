import { callClaudeJson, corsHeaders } from '../_shared/claude.ts';
import {
  buildSchemePrompt,
  normalizeSchemeResponse,
  schemeSystemPrompt,
  type SchemeGenerationBody,
} from '../_shared/generation.ts';
import { consumeCreditsForRequest, getFeatureCreditCost, refundCredits } from '../_shared/credits.ts';
import { HttpError, logEdgeError } from '../_shared/supabase.ts';

const SCHEME_CREDIT_COST = 1;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let body: SchemeGenerationBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.subject || !body.classLevel || !body.term) {
    return json({ error: 'subject, classLevel and term are required' }, 400);
  }

  let creditDebit: Awaited<ReturnType<typeof consumeCreditsForRequest>> | null = null;
  let creditCost = SCHEME_CREDIT_COST;

  try {
    creditCost = await getFeatureCreditCost('scheme_generation', SCHEME_CREDIT_COST);
    creditDebit = await consumeCreditsForRequest(
      req,
      creditCost,
      'scheme_generation',
      'Scheme of work generation',
      {
        subject: body.subject,
        classLevel: body.classLevel,
        term: body.term,
      },
    );

    const scheme = await callClaudeJson<Record<string, unknown>>({
      system: schemeSystemPrompt,
      user: buildSchemePrompt(body),
    });

    return json(
      {
        ...normalizeSchemeResponse(scheme, body),
        creditBalance: creditDebit.balance,
      },
      200,
    );
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message, ...(err.payload ?? {}) }, err.status);
    }

    await logEdgeError({
      userId: creditDebit?.user.id ?? null,
      source: 'edge',
      action: 'generate_scheme',
      message: (err as Error).message,
      metadata: { subject: body.subject, classLevel: body.classLevel, term: body.term },
    });

    if (creditDebit) {
      await refundCredits(
        creditDebit.user.id,
        creditCost,
        'Refund for failed scheme generation',
        {
          originalTransactionId: creditDebit.transactionId,
          reason: (err as Error).message,
        },
      );
    }

    return json({ error: (err as Error).message }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
