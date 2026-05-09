import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser, HttpError } from '../_shared/supabase.ts';

type Body = {
  action?: string;
  query?: string;
  userId?: string;
  amount?: number;
  reason?: string;
  package?: CreditPackageUpdate;
};

type AdminUser = {
  user_id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  balance: number;
  is_admin: boolean;
  teacher_name: string;
  school_name: string;
  school_district: string;
  profile_completed: boolean;
  class_sizes: Record<string, number>;
  referral_code: string;
  invitation_code: string;
  referred_by_email: string;
};

type CreditPackageUpdate = {
  id?: string;
  name?: string;
  credits?: number;
  originalPriceSubunit?: number;
  priceSubunit?: number;
  promotionType?: string;
  promotionValue?: number;
  badgeText?: string;
  bonusCredits?: number;
  promoStartsAt?: string | null;
  promoEndsAt?: string | null;
  active?: boolean;
};

type DirectoryUser = {
  user_id: string;
  email: string | null;
  email_confirmed_at: string | null;
  invitation_code: string | null;
  created_at: string;
};

type ListedAuthUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

const GENERATION_KINDS = new Set(['lesson_generation', 'scheme_generation', 'scheme_parsing']);

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

    if (body.action === 'dashboard') {
      const dashboard = await loadDashboard(service);
      return json(dashboard, 200);
    }

    if (body.action === 'search-users') {
      const users = await loadUsers(service, body.query ?? '', 50);
      return json({ users }, 200);
    }

    if (body.action === 'user-detail') {
      if (!body.userId) return json({ error: 'userId is required' }, 400);
      const detail = await loadUserDetail(service, body.userId);
      return json({ detail }, 200);
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
      const logs = await loadLogs(service);
      return json({ logs }, 200);
    }

    if (body.action === 'update-package') {
      if (!body.package?.id) return json({ error: 'Package id is required' }, 400);
      const pack = await updatePackage(service, body.package);
      return json({ package: pack }, 200);
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

async function loadDashboard(service: ReturnType<typeof createServiceClient>) {
  const [users, transactions, purchases, referrals, logs, packages, settings] = await Promise.all([
    safeLoad(() => loadUsers(service, '', 1000), [] as AdminUser[]),
    safeLoad(() => loadTransactions(service, 250), []),
    safeLoad(() => loadPurchases(service, 200), []),
    safeLoad(() => loadReferrals(service, 200), []),
    safeLoad(() => loadLogs(service), []),
    safeLoad(() => loadPackages(service), []),
    safeLoad(() => loadSettings(service), []),
  ]);

  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const successfulPayments = purchases.filter((item) => item.status === 'success');
  const revenue = (from?: Date) =>
    successfulPayments
      .filter((item) => !from || new Date(item.verified_at ?? item.created_at) >= from)
      .reduce((sum, item) => sum + Number(item.amount_subunit ?? 0), 0);
  const debits = transactions.filter((item) => Number(item.amount) < 0);
  const generationDebits = debits.filter((item) => GENERATION_KINDS.has(item.kind));

  return {
    overview: {
      totalUsers: users.length,
      completedProfiles: users.filter((item) => item.profile_completed).length,
      unconfirmedUsers: users.filter((item) => !item.email_confirmed_at).length,
      revenueTodaySubunit: revenue(startOfToday),
      revenueWeekSubunit: revenue(startOfWeek),
      revenueMonthSubunit: revenue(startOfMonth),
      revenueTotalSubunit: revenue(),
      successfulPayments: successfulPayments.length,
      failedPayments: purchases.filter((item) => item.status === 'failed').length,
      pendingPayments: purchases.filter((item) => item.status === 'pending').length,
      creditsSold: successfulPayments.reduce((sum, item) => sum + Number(item.credits ?? 0), 0),
      creditsUsed: Math.abs(debits.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)),
      outstandingCredits: users.reduce((sum, item) => sum + item.balance, 0),
      lessonPlansGenerated: generationDebits.filter((item) => item.kind === 'lesson_generation').length,
      schemesGenerated: generationDebits.filter((item) => item.kind === 'scheme_generation').length,
      customSchemesAnalyzed: generationDebits.filter((item) => item.kind === 'scheme_parsing').length,
      errors: logs.filter((item) => item.severity === 'error').length,
      referralRewardsThisMonth: referrals.filter(
        (item) => item.status === 'rewarded' && item.rewarded_at && new Date(item.rewarded_at) >= startOfMonth,
      ).length,
    },
    users: users.slice(0, 20),
    transactions: transactions.slice(0, 80),
    purchases: purchases.slice(0, 80),
    referrals: referrals.slice(0, 80),
    logs,
    packages,
    settings,
  };
}

async function loadUsers(service: ReturnType<typeof createServiceClient>, query: string, limit: number): Promise<AdminUser[]> {
  const normalizedQuery = query.trim().toLowerCase();
  const directoryUsers = await loadDirectoryUsers(service);
  const filtered = directoryUsers
    .filter((item) => {
      if (!normalizedQuery) return true;
      return (item.email ?? '').toLowerCase().includes(normalizedQuery) || item.user_id.toLowerCase().includes(normalizedQuery);
    })
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, limit);

  return enrichUsers(service, filtered);
}

async function loadDirectoryUsers(service: ReturnType<typeof createServiceClient>): Promise<DirectoryUser[]> {
  const { data, error } = await service
    .from('app_user_directory')
    .select('user_id,email,email_confirmed_at,invitation_code,created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (!error && data?.length) return data;

  const authUsers: DirectoryUser[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const { data: pageData, error: authError } = await service.auth.admin.listUsers({ page, perPage: 1000 });
    if (authError) return authUsers;
    const pageUsers = (pageData.users ?? []) as ListedAuthUser[];
    authUsers.push(
      ...pageUsers.map((item) => ({
        user_id: item.id,
        email: item.email ?? '',
        email_confirmed_at: item.email_confirmed_at ?? null,
        invitation_code: String(item.user_metadata?.invitation_code ?? item.user_metadata?.referral_code ?? ''),
        created_at: item.created_at ?? new Date().toISOString(),
      })),
    );
    if (pageUsers.length < 1000) break;
  }
  return authUsers;
}

async function enrichUsers(service: ReturnType<typeof createServiceClient>, users: DirectoryUser[]): Promise<AdminUser[]> {
  const ids = users.map((item) => item.user_id);
  const balanceByUser = new Map<string, number>();
  const adminUserIds = new Set<string>();
  const profileByUser = new Map<string, Record<string, unknown>>();
  const referralCodeByUser = new Map<string, string>();
  const referredByUser = new Map<string, string>();

  if (ids.length) {
    const [balances, admins, profiles, codes, referrals] = await Promise.all([
      service.from('user_credit_balances').select('user_id,balance').in('user_id', ids),
      service.from('admin_users').select('user_id').in('user_id', ids),
      service
        .from('teacher_profiles')
        .select('user_id,teacher_name,school_name,school_district,class_sizes,onboarding_completed')
        .in('user_id', ids),
      service.from('referral_codes').select('user_id,code').in('user_id', ids),
      service.from('referrals').select('referred_user_id,referrer_user_id').in('referred_user_id', ids),
    ]);

    for (const row of balances.error ? [] : balances.data ?? []) balanceByUser.set(row.user_id, Number(row.balance ?? 0));
    for (const row of admins.error ? [] : admins.data ?? []) adminUserIds.add(row.user_id);
    for (const row of profiles.error ? [] : profiles.data ?? []) profileByUser.set(row.user_id, row);
    for (const row of codes.error ? [] : codes.data ?? []) referralCodeByUser.set(row.user_id, row.code ?? '');

    const referralRows = referrals.error ? [] : referrals.data ?? [];
    const referrerIds = Array.from(new Set(referralRows.map((row) => row.referrer_user_id).filter(Boolean)));
    const referrerEmailById = await loadEmails(service, referrerIds);
    for (const row of referralRows) {
      referredByUser.set(row.referred_user_id, referrerEmailById.get(row.referrer_user_id) ?? row.referrer_user_id);
    }
  }

  return users.map((item) => {
    const profile = profileByUser.get(item.user_id) ?? {};
    return {
      user_id: item.user_id,
      email: item.email ?? '',
      created_at: item.created_at,
      email_confirmed_at: item.email_confirmed_at,
      balance: balanceByUser.get(item.user_id) ?? 0,
      is_admin: adminUserIds.has(item.user_id),
      teacher_name: String(profile.teacher_name ?? ''),
      school_name: String(profile.school_name ?? ''),
      school_district: String(profile.school_district ?? ''),
      profile_completed: Boolean(profile.onboarding_completed),
      class_sizes: (profile.class_sizes as Record<string, number>) ?? {},
      referral_code: referralCodeByUser.get(item.user_id) ?? '',
      invitation_code: item.invitation_code ?? '',
      referred_by_email: referredByUser.get(item.user_id) ?? '',
    };
  });
}

async function loadUserDetail(service: ReturnType<typeof createServiceClient>, userId: string) {
  const users = await loadUsers(service, userId, 1);
  const [transactions, purchases, referrals] = await Promise.all([
    loadTransactions(service, 50, userId),
    loadPurchases(service, 50, userId),
    loadReferrals(service, 50, userId),
  ]);
  return { user: users[0] ?? null, transactions, purchases, referrals };
}

async function loadTransactions(service: ReturnType<typeof createServiceClient>, limit: number, userId?: string) {
  let query = service
    .from('credit_transactions')
    .select('id,user_id,amount,balance_after,kind,description,metadata,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id))));
  return (data ?? []).map((item) => ({ ...item, email: emailById.get(item.user_id) ?? '' }));
}

async function loadPurchases(service: ReturnType<typeof createServiceClient>, limit: number, userId?: string) {
  let query = service
    .from('credit_purchases')
    .select('id,user_id,package_id,credits,amount_subunit,currency,paystack_reference,status,verified_at,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id))));
  return (data ?? []).map((item) => ({ ...item, email: emailById.get(item.user_id) ?? '' }));
}

async function loadReferrals(service: ReturnType<typeof createServiceClient>, limit: number, userId?: string) {
  let query = service
    .from('referrals')
    .select('id,referrer_user_id,referred_user_id,referral_code,status,rejection_reason,qualified_at,rewarded_at,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (userId) query = query.or(`referrer_user_id.eq.${userId},referred_user_id.eq.${userId}`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const ids = Array.from(
    new Set((data ?? []).flatMap((item) => [item.referrer_user_id, item.referred_user_id]).filter(Boolean)),
  );
  const emailById = await loadEmails(service, ids);
  return (data ?? []).map((item) => ({
    ...item,
    referrer_email: emailById.get(item.referrer_user_id) ?? '',
    referred_email: emailById.get(item.referred_user_id) ?? '',
  }));
}

async function loadLogs(service: ReturnType<typeof createServiceClient>) {
  const { data, error } = await service
    .from('app_error_logs')
    .select('id,user_id,severity,source,action,message,metadata,created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id).filter(Boolean))));
  return (data ?? []).map((item) => ({ ...item, email: item.user_id ? emailById.get(item.user_id) ?? '' : '' }));
}

async function loadPackages(service: ReturnType<typeof createServiceClient>) {
  const { data, error } = await service
    .from('credit_packages')
    .select(
      'id,name,credits,price_subunit,currency,active,sort_order,original_price_subunit,promotion_type,promotion_value,badge_text,bonus_credits,promo_starts_at,promo_ends_at,created_at,updated_at',
    )
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function loadSettings(service: ReturnType<typeof createServiceClient>) {
  const { data, error } = await service.from('admin_app_settings').select('key,value,updated_at').order('key');
  if (error) return [];
  return data ?? [];
}

async function loadEmails(service: ReturnType<typeof createServiceClient>, userIds: string[]) {
  const emailById = new Map<string, string>();
  if (!userIds.length) return emailById;
  const { data, error } = await service.from('app_user_directory').select('user_id,email').in('user_id', userIds);
  if (error) return emailById;
  for (const item of data ?? []) emailById.set(item.user_id, item.email ?? '');
  return emailById;
}

async function updatePackage(service: ReturnType<typeof createServiceClient>, input: CreditPackageUpdate) {
  const updates = {
    name: input.name?.trim(),
    credits: input.credits,
    original_price_subunit: input.originalPriceSubunit,
    price_subunit: input.priceSubunit,
    promotion_type: input.promotionType?.trim() || 'none',
    promotion_value: input.promotionValue ?? 0,
    badge_text: input.badgeText?.trim() ?? '',
    bonus_credits: input.bonusCredits ?? 0,
    promo_starts_at: input.promoStartsAt || null,
    promo_ends_at: input.promoEndsAt || null,
    active: input.active,
    updated_at: new Date().toISOString(),
  };

  const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
  const { data, error } = await service.from('credit_packages').update(cleanUpdates).eq('id', input.id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function safeLoad<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}
