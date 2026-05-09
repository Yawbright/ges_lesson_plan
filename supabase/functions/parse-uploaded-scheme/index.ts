import { corsHeaders } from '../_shared/claude.ts';
import { consumeCreditsForRequest, getFeatureCreditCost, refundCredits } from '../_shared/credits.ts';
import { HttpError, logEdgeError } from '../_shared/supabase.ts';

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

  const { baseUrl: parserBaseUrl, provider: parserProvider } = getParserBackend();
  if (!parserBaseUrl) {
    return json({ error: 'Parser backend URL is not configured for this edge function' }, 500);
  }

  let creditDebit: Awaited<ReturnType<typeof consumeCreditsForRequest>> | null = null;
  let creditCost = SCHEME_PARSE_CREDIT_COST;

  try {
    creditCost = await getFeatureCreditCost('scheme_parsing', SCHEME_PARSE_CREDIT_COST);
    creditDebit = await consumeCreditsForRequest(
      req,
      creditCost,
      'scheme_parsing',
      'Scheme upload parsing',
      {
        subject: body.subject,
        classLevel: body.classLevel,
        term: body.term,
        fileName: body.fileName,
        parserProvider,
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

    await logEdgeError({
      userId: creditDebit?.user.id ?? null,
      source: 'edge',
      action: 'parse_uploaded_scheme',
      message: (err as Error).message,
      metadata: { subject: body.subject, classLevel: body.classLevel, term: body.term, fileName: body.fileName },
    });

    if (creditDebit) {
      await refundCredits(
        creditDebit.user.id,
        creditCost,
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

function getParserBackend() {
  const provider = (Deno.env.get('PARSER_BACKEND') || 'active').trim().toLowerCase();
  const activeUrl = cleanUrl(Deno.env.get('PARSER_SERVICE_URL'));
  const renderUrl = cleanUrl(Deno.env.get('PARSER_RENDER_SERVICE_URL'));
  const cloudRunUrl = cleanUrl(Deno.env.get('PARSER_CLOUD_RUN_SERVICE_URL'));

  if (provider === 'render') {
    return { provider, baseUrl: renderUrl || activeUrl };
  }

  if (provider === 'cloud-run' || provider === 'cloudrun') {
    return { provider: 'cloud-run', baseUrl: cloudRunUrl || activeUrl };
  }

  return { provider: 'active', baseUrl: activeUrl };
}

function cleanUrl(value?: string | null) {
  return value?.trim().replace(/\/$/, '') || '';
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
