import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient } from '../_shared/supabase.ts';

type Body = {
  code?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const code = body.code?.trim();

    if (!code) {
      return json({ valid: false, error: 'Invitation code is required.' }, 400);
    }

    const service = createServiceClient();
    const { data, error } = await service
      .from('referral_codes')
      .select('code')
      .ilike('code', code)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      return json({ valid: false, error: 'Invitation code was not found.' }, 404);
    }

    return json({ valid: true, code: data.code }, 200);
  } catch (err) {
    return json({ valid: false, error: (err as Error).message }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
