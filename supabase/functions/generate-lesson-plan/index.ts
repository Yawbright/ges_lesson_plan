import { callClaudeJson, corsHeaders } from '../_shared/claude.ts';
import {
  buildLessonPrompt,
  lessonPlanSystemPrompt,
  normalizeLessonPlanResponse,
  type LessonGenerationBody,
} from '../_shared/generation.ts';
import { consumeCreditsForRequest, getFeatureCreditCost, refundCredits } from '../_shared/credits.ts';
import { HttpError, logEdgeError } from '../_shared/supabase.ts';
import { rewardReferralIfQualified } from '../_shared/referrals.ts';

const LESSON_PLAN_CREDIT_COST = 1;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let body: LessonGenerationBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.subject || !body.classLevel || !body.week) {
    return json({ error: 'subject, classLevel and week are required' }, 400);
  }

  let creditDebit: Awaited<ReturnType<typeof consumeCreditsForRequest>> | null = null;
  let creditCost = LESSON_PLAN_CREDIT_COST;

  try {
    creditCost = await getFeatureCreditCost('lesson_generation', LESSON_PLAN_CREDIT_COST);
    creditDebit = await consumeCreditsForRequest(
      req,
      creditCost,
      'lesson_generation',
      'Lesson plan generation',
      {
        subject: body.subject,
        classLevel: body.classLevel,
        week: body.week,
        term: body.term ?? null,
      },
    );

    const plan = await callClaudeJson<Record<string, unknown>>({
      system: lessonPlanSystemPrompt,
      user: buildLessonPrompt(body),
    });
    await rewardReferralIfQualified(creditDebit.user.id);

    return json(
      {
        ...normalizeLessonPlanResponse(plan, body),
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
      action: 'generate_lesson_plan',
      message: (err as Error).message,
      metadata: { subject: body.subject, classLevel: body.classLevel, week: body.week },
    });

    if (creditDebit) {
      await refundCredits(
        creditDebit.user.id,
        creditCost,
        'Refund for failed lesson plan generation',
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
