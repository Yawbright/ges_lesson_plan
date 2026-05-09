import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser, HttpError } from '../_shared/supabase.ts';

type Body = {
  action?: string;
  query?: string;
  userId?: string;
  amount?: number;
  reason?: string;
};

type ListedUser = {
  id: string;
  email?: string | null;
  created_at?: string;
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
      const users = await listAdminUsers(service, body.query ?? '');
      return json({ users }, 200);
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

async function listAdminUsers(service: ReturnType<typeof createServiceClient>, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const authUsers: ListedUser[] = [];

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);

    const pageUsers = data.users ?? [];
    authUsers.push(...pageUsers);

    if (pageUsers.length < 1000) break;
  }

  const filteredUsers = authUsers
    .filter((item) => {
      if (!normalizedQuery) return true;
      return (item.email ?? '').toLowerCase().includes(normalizedQuery) || item.id.toLowerCase().includes(normalizedQuery);
    })
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 50);

  const userIds = filteredUsers.map((item) => item.id);
  const balanceByUser = new Map<string, number>();
  const adminUserIds = new Set<string>();

  if (userIds.length) {
    const { data: balances, error: balanceError } = await service
      .from('user_credit_balances')
      .select('user_id,balance')
      .in('user_id', userIds);
    if (balanceError) throw new Error(balanceError.message);

    for (const row of balances ?? []) {
      balanceByUser.set(row.user_id, Number(row.balance ?? 0));
    }

    const { data: admins, error: adminsError } = await service.from('admin_users').select('user_id').in('user_id', userIds);
    if (adminsError) throw new Error(adminsError.message);

    for (const row of admins ?? []) {
      adminUserIds.add(row.user_id);
    }
  }

  return filteredUsers.map((item) => ({
    user_id: item.id,
    email: item.email ?? '',
    created_at: item.created_at ?? new Date().toISOString(),
    balance: balanceByUser.get(item.id) ?? 0,
    is_admin: adminUserIds.has(item.id),
  }));
}
