import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient } from '../_shared/supabase.ts';

type GrantBody = {
  secret?: string;
  email?: string;
  userId?: string;
  amount?: number;
  description?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const configuredSecret = Deno.env.get('DEV_CREDIT_GRANT_SECRET');
    if (!configuredSecret) {
      return json({ error: 'DEV_CREDIT_GRANT_SECRET is not configured' }, 500);
    }

    const body = (await req.json().catch(() => ({}))) as GrantBody;
    const providedSecret = req.headers.get('x-dev-credit-secret') || body.secret;
    if (!providedSecret || providedSecret !== configuredSecret) {
      return json({ error: 'Invalid developer credit secret' }, 401);
    }

    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount <= 0 || amount > 1000) {
      return json({ error: 'amount must be an integer between 1 and 1000' }, 400);
    }

    const service = createServiceClient();
    const explicitUserId = body.userId?.trim();
    const userId = explicitUserId || (await findUserIdByEmail(service, body.email?.trim()));

    if (!userId) {
      return json({ error: 'User not found. Provide userId or a registered email.' }, 404);
    }

    const { data, error } = await service.rpc('add_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_kind: 'adjustment',
      p_description: body.description?.trim() || 'Developer test credit grant',
      p_metadata: { source: 'dev-grant-credits' },
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = Array.isArray(data) ? data[0] : data;
    return json({
      userId,
      amount,
      balance: Number(result?.balance ?? 0),
      transactionId: result?.transaction_id ?? null,
    }, 200);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

async function findUserIdByEmail(service: ReturnType<typeof createServiceClient>, email?: string) {
  if (!email) return null;

  const { data, error } = await service.auth.admin.listUsers();
  if (error) {
    throw new Error(error.message);
  }

  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
