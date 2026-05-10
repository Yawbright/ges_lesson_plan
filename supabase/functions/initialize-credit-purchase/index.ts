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
  original_price_subunit: number | null;
  currency: string;
  badge_text: string;
  bonus_credits: number;
  promotion_type: string;
  promotion_value: number;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
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
    const { data: purchasingSetting } = await service
      .from('admin_app_settings')
      .select('value')
      .eq('key', 'credit_purchasing')
      .maybeSingle();
    if (purchasingSetting?.value?.enabled !== true) {
      return json(
        { error: 'Credit Purchasing is coming soon. You can only refer friends to get credit for now or contact admin for special credit grant' },
        403,
      );
    }

    const { data: pack, error: packageError } = await service
      .from('credit_packages')
      .select('id,name,credits,price_subunit,original_price_subunit,currency,badge_text,bonus_credits,promotion_type,promotion_value,promo_starts_at,promo_ends_at')
      .eq('id', packageId)
      .eq('active', true)
      .single<CreditPackage>();

    if (packageError || !pack) {
      return json({ error: 'Credit package not found' }, 404);
    }
    if (!isPackageAvailable(pack)) {
      return json({ error: 'This credit package is not available right now' }, 400);
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
          credits: pack.credits + Number(pack.bonus_credits ?? 0),
          baseCredits: pack.credits,
          bonusCredits: Number(pack.bonus_credits ?? 0),
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
      credits: pack.credits + Number(pack.bonus_credits ?? 0),
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
        bonusCredits: Number(pack.bonus_credits ?? 0),
        badgeText: pack.badge_text,
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

function isPackageAvailable(pack: CreditPackage) {
  const now = Date.now();
  if (pack.promo_starts_at && new Date(pack.promo_starts_at).getTime() > now) return false;
  if (pack.promo_ends_at && new Date(pack.promo_ends_at).getTime() < now) return false;
  return true;
}
