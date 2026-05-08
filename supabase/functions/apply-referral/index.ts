import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser, HttpError } from '../_shared/supabase.ts';

type Body = {
  code?: string;
  deviceId?: string;
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
    const body = (await req.json().catch(() => ({}))) as Body;
    const code = body.code?.trim();

    if (!code) {
      return json({ error: 'Referral code is required' }, 400);
    }

    const service = createServiceClient();
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      null;
    const userAgent = req.headers.get('user-agent');

    const { data, error } = await service.rpc('apply_referral_code', {
      p_referred_user_id: user.id,
      p_referral_code: code,
      p_referred_device_id: body.deviceId ?? null,
      p_referred_ip: ip,
      p_referred_user_agent: userAgent,
    });

    if (error) throw new Error(error.message);

    const result = Array.isArray(data) ? data[0] : data;
    return json({
      status: result?.status ?? 'rejected',
      referrerUserId: result?.referrer_user_id ?? null,
      reason: result?.reason ?? null,
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

