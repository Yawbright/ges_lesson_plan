import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser, HttpError } from '../_shared/supabase.ts';

type Body = {
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
    const service = createServiceClient();

    const { data: codeRows, error: codeError } = await service.rpc('ensure_referral_code', {
      p_user_id: user.id,
      p_device_id: body.deviceId ?? null,
    });

    if (codeError) throw new Error(codeError.message);

    const code = Array.isArray(codeRows) ? codeRows[0]?.code : codeRows?.code;
    const { data: referrals, error: referralsError } = await service
      .from('referrals')
      .select('id,status,rejection_reason,created_at,rewarded_at')
      .eq('referrer_user_id', user.id)
      .order('created_at', { ascending: false });

    if (referralsError) throw new Error(referralsError.message);

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const stats = {
      pending: 0,
      rewarded: 0,
      rejected: 0,
      rewardsThisMonth: 0,
      monthlyLimit: 5,
    };

    for (const referral of referrals ?? []) {
      if (referral.status === 'pending') stats.pending += 1;
      if (referral.status === 'rewarded') {
        stats.rewarded += 1;
        if (referral.rewarded_at && new Date(referral.rewarded_at) >= startOfMonth) {
          stats.rewardsThisMonth += 1;
        }
      }
      if (referral.status === 'rejected') stats.rejected += 1;
    }

    return json({
      code,
      stats,
      referrals: referrals ?? [],
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

