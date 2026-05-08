import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser, HttpError } from '../_shared/supabase.ts';

type VerifyBody = {
  reference?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const user = await getAuthenticatedUser(req);
    const body = (await req.json().catch(() => ({}))) as VerifyBody;
    const reference = body.reference?.trim();
    if (!reference) {
      return json({ error: 'reference is required' }, 400);
    }

    const service = createServiceClient();
    const { data: purchase, error: purchaseError } = await service
      .from('credit_purchases')
      .select('user_id,credits,amount_subunit,currency,status')
      .eq('paystack_reference', reference)
      .single();

    if (purchaseError || !purchase) {
      return json({ error: 'Purchase not found' }, 404);
    }

    if (purchase.user_id !== user.id) {
      return json({ error: 'Purchase does not belong to this account' }, 403);
    }

    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: { authorization: `Bearer ${secretKey}` },
      },
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.status) {
      return json(
        { error: payload?.message ?? `Paystack verification failed with status ${response.status}` },
        502,
      );
    }

    const status = payload.data?.status;
    if (status !== 'success') {
      await service
        .from('credit_purchases')
        .update({
          status: status === 'abandoned' ? 'abandoned' : 'failed',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          raw_response: payload,
        })
        .eq('paystack_reference', reference)
        .neq('status', 'success');

      return json({
        status,
        credited: false,
        message: `Payment is ${status ?? 'not successful'} yet.`,
      }, 200);
    }

    if (Number(payload.data.amount) !== Number(purchase.amount_subunit)) {
      return json({ error: 'Verified amount does not match purchase amount' }, 400);
    }

    if (payload.data.currency !== purchase.currency) {
      return json({ error: 'Verified currency does not match purchase currency' }, 400);
    }

    const { data: finalized, error: finalizeError } = await service.rpc(
      'finalize_credit_purchase',
      {
        p_reference: reference,
        p_raw_response: payload,
      },
    );

    if (finalizeError) {
      throw new Error(finalizeError.message);
    }

    const result = Array.isArray(finalized) ? finalized[0] : finalized;
    return json({
      status: 'success',
      credited: Boolean(result?.credited),
      credits: Number(result?.credits ?? purchase.credits),
      balance: Number(result?.balance ?? 0),
    }, 200);
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message, ...(err.payload ?? {}) }, err.status);
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

