import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser, HttpError } from '../_shared/supabase.ts';

type InitBody = {
  packageId?: string;
  callbackUrl?: string;
};

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price_subunit: number;
  currency: string;
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
    const body = (await req.json().catch(() => ({}))) as InitBody;
    const packageId = body.packageId?.trim();
    if (!packageId) {
      return json({ error: 'packageId is required' }, 400);
    }

    const service = createServiceClient();
    const { data: pack, error: packageError } = await service
      .from('credit_packages')
      .select('id,name,credits,price_subunit,currency')
      .eq('id', packageId)
      .eq('active', true)
      .single<CreditPackage>();

    if (packageError || !pack) {
      return json({ error: 'Credit package not found' }, 404);
    }

    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const reference = `glp-${Date.now()}-${crypto.randomUUID().replaceAll('-', '')}`;
    const callbackUrl = body.callbackUrl?.trim() || Deno.env.get('PAYSTACK_CALLBACK_URL') || undefined;
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${secretKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: String(pack.price_subunit),
        currency: pack.currency,
        reference,
        callback_url: callbackUrl,
        metadata: JSON.stringify({
          userId: user.id,
          packageId: pack.id,
          credits: pack.credits,
        }),
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.status || !payload?.data?.authorization_url) {
      return json(
        {
          error: payload?.message ?? `Paystack initialization failed with status ${response.status}`,
        },
        502,
      );
    }

    const { error: insertError } = await service.from('credit_purchases').insert({
      user_id: user.id,
      package_id: pack.id,
      credits: pack.credits,
      amount_subunit: pack.price_subunit,
      currency: pack.currency,
      paystack_reference: reference,
      paystack_access_code: payload.data.access_code,
      authorization_url: payload.data.authorization_url,
      status: 'pending',
      raw_response: payload,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return json({
      authorizationUrl: payload.data.authorization_url,
      accessCode: payload.data.access_code,
      reference,
      package: {
        id: pack.id,
        name: pack.name,
        credits: pack.credits,
        amountSubunit: pack.price_subunit,
        currency: pack.currency,
      },
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

