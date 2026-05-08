import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature') ?? '';
    const expected = await hmacSha512Hex(secretKey, rawBody);

    if (!signature || signature !== expected) {
      return json({ error: 'Invalid Paystack signature' }, 401);
    }

    const event = JSON.parse(rawBody);
    if (event?.event !== 'charge.success' && event?.event !== 'transaction.success') {
      return json({ received: true }, 200);
    }

    const reference = event?.data?.reference;
    if (typeof reference !== 'string' || !reference.trim()) {
      return json({ error: 'Missing transaction reference' }, 400);
    }

    const service = createServiceClient();
    const { data: purchase, error: purchaseError } = await service
      .from('credit_purchases')
      .select('amount_subunit,currency')
      .eq('paystack_reference', reference)
      .single();

    if (purchaseError || !purchase) {
      return json({ error: 'Purchase not found' }, 404);
    }

    if (Number(event.data?.amount) !== Number(purchase.amount_subunit)) {
      return json({ error: 'Webhook amount mismatch' }, 400);
    }

    if (event.data?.currency !== purchase.currency) {
      return json({ error: 'Webhook currency mismatch' }, 400);
    }

    const { data: finalized, error: finalizeError } = await service.rpc(
      'finalize_credit_purchase',
      {
        p_reference: reference,
        p_raw_response: event,
      },
    );

    if (finalizeError) {
      throw new Error(finalizeError.message);
    }

    const result = Array.isArray(finalized) ? finalized[0] : finalized;
    return json({
      received: true,
      credited: Boolean(result?.credited),
      balance: Number(result?.balance ?? 0),
    }, 200);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

async function hmacSha512Hex(secret: string, message: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

