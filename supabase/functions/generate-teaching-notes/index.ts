import { callClaudeJson, corsHeaders } from '../_shared/claude.ts';
import {
  buildTeachingNotesPrompt,
  normalizeTeachingNotesResponse,
  teachingNotesSystemPrompt,
  type TeachingNotesGenerationBody,
} from '../_shared/generation.ts';
import { consumeCreditsForRequest, getFeatureCreditCost, refundCredits } from '../_shared/credits.ts';
import { HttpError, logEdgeError } from '../_shared/supabase.ts';
import { rewardReferralIfQualified } from '../_shared/referrals.ts';

const TEACHING_NOTES_CREDIT_COST = 1;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let body: TeachingNotesGenerationBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.lessonPlan || typeof body.lessonPlan !== 'object') {
    return json({ error: 'lessonPlan is required' }, 400);
  }

  let creditDebit: Awaited<ReturnType<typeof consumeCreditsForRequest>> | null = null;
  let creditCost = TEACHING_NOTES_CREDIT_COST;

  try {
    creditCost = await getFeatureCreditCost('teaching_notes_generation', TEACHING_NOTES_CREDIT_COST);
    creditDebit = await consumeCreditsForRequest(
      req,
      creditCost,
      'teaching_notes_generation',
      'Teaching notes generation',
      {
        lessonPlanId: (body.lessonPlan as Record<string, unknown>).id ?? null,
        subject: (body.lessonPlan as Record<string, unknown>).subject ?? null,
        classLevel: (body.lessonPlan as Record<string, unknown>).classLevel ?? null,
        week: (body.lessonPlan as Record<string, unknown>).week ?? null,
      },
    );

    const rawNotes = await callClaudeJson<Record<string, unknown>>({
      system: teachingNotesSystemPrompt,
      user: buildTeachingNotesPrompt(body),
      maxTokens: 12000,
    });
    const normalized = normalizeTeachingNotesResponse(rawNotes, body);

    await rewardReferralIfQualified(creditDebit.user.id);

    return json({ ...normalized, creditBalance: creditDebit.balance }, 200);
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message, ...(err.payload ?? {}) }, err.status);
    }

    await logEdgeError({
      userId: creditDebit?.user.id ?? null,
      source: 'edge',
      action: 'generate_teaching_notes',
      message: (err as Error).message,
      metadata: {
        lessonPlanId: (body.lessonPlan as Record<string, unknown>).id ?? null,
        subject: (body.lessonPlan as Record<string, unknown>).subject ?? null,
      },
    });

    if (creditDebit) {
      await refundCredits(
        creditDebit.user.id,
        creditCost,
        'Refund for failed teaching notes generation',
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
