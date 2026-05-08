import { corsHeaders } from '../_shared/claude.ts';
import { consumeCreditsForRequest, refundCredits } from '../_shared/credits.ts';
import { HttpError } from '../_shared/supabase.ts';

const SCHEME_PARSE_CREDIT_COST = 1;

type ParseUploadedSchemeBody = {
  subject?: string;
  classLevel?: string;
  term?: string;
  fileName?: string;
  fileBase64?: string;
  numberOfWeeks?: number;
  curriculumYearHint?: unknown[];
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: ParseUploadedSchemeBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.subject || !body.classLevel || !body.term || !body.fileName || !body.fileBase64) {
    return json({ error: 'subject, classLevel, term, fileName and fileBase64 are required' }, 400);
  }

  const parserBaseUrl = Deno.env.get('PARSER_SERVICE_URL')?.replace(/\/$/, '');
  if (!parserBaseUrl) {
    return json({ error: 'PARSER_SERVICE_URL is not configured for this edge function' }, 500);
  }

  let creditDebit: Awaited<ReturnType<typeof consumeCreditsForRequest>> | null = null;

  try {
    creditDebit = await consumeCreditsForRequest(
      req,
      SCHEME_PARSE_CREDIT_COST,
      'scheme_parsing',
      'Scheme upload parsing',
      {
        subject: body.subject,
        classLevel: body.classLevel,
        term: body.term,
        fileName: body.fileName,
      },
    );

    const response = await fetch(`${parserBaseUrl}/parse-scheme`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        typeof payload?.error === 'string'
          ? payload.error
          : `Parser service failed with status ${response.status}`,
      );
    }

    return json({ ...payload, creditBalance: creditDebit.balance }, 200);
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message, ...(err.payload ?? {}) }, err.status);
    }

    if (creditDebit) {
      await refundCredits(
        creditDebit.user.id,
        SCHEME_PARSE_CREDIT_COST,
        'Refund for failed scheme upload parsing',
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
