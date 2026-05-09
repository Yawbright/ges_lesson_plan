import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser, HttpError } from '../_shared/supabase.ts';

type Body = {
  action?: string;
  query?: string;
  userId?: string;
  amount?: number;
  reason?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const user = await getAuthenticatedUser(req);
    const body = (await req.json().catch(() => ({}))) as Body;
    const service = createServiceClient();

    const { data: isAdmin, error: adminError } = await service.rpc('is_admin', {
      p_user_id: user.id,
    });
    if (adminError) throw new Error(adminError.message);
    if (!isAdmin) return json({ error: 'Admin access required' }, 403);

    if (body.action === 'search-users') {
      const { data, error } = await service.rpc('admin_search_users', {
        p_admin_user_id: user.id,
        p_query: body.query ?? '',
      });
      if (error) throw new Error(error.message);
      return json({ users: data ?? [] }, 200);
    }

    if (body.action === 'adjust-credits') {
      if (!body.userId || !Number.isInteger(body.amount) || body.amount === 0) {
        return json({ error: 'userId and non-zero integer amount are required' }, 400);
      }
      const { data, error } = await service.rpc('admin_adjust_user_credits', {
        p_admin_user_id: user.id,
        p_target_user_id: body.userId,
        p_amount: body.amount,
        p_reason: body.reason ?? 'Admin credit adjustment',
      });
      if (error) throw new Error(error.message);
      return json({ result: Array.isArray(data) ? data[0] : data }, 200);
    }

    if (body.action === 'logs') {
      const { data, error } = await service
        .from('app_error_logs')
        .select('id,user_id,severity,source,action,message,metadata,created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return json({ logs: data ?? [] }, 200);
    }

    return json({ error: 'Unknown admin action' }, 400);
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
