import type { AdminUser, DirectoryUser, ListedAuthUser, ServiceClient } from './types.ts';
import { loadEmails } from './shared.ts';
import { loadPurchases, loadReferrals, loadTransactions } from './reports.ts';

export async function loadUsers(service: ServiceClient, query: string, limit: number): Promise<AdminUser[]> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return enrichUsers(service, await loadDirectoryUsers(service, limit));
  }

  return enrichUsers(service, await searchDirectoryUsers(service, normalizedQuery, limit));
}

export async function loadUserDetail(service: ServiceClient, userId: string) {
  const users = await loadUsers(service, userId, 1);
  const [transactions, purchases, referrals] = await Promise.all([
    loadTransactions(service, { pageSize: 50, userId }),
    loadPurchases(service, { pageSize: 50, userId }),
    loadReferrals(service, { pageSize: 50, userId }),
  ]);
  return {
    user: users[0] ?? null,
    transactions: transactions.items,
    purchases: purchases.items,
    referrals: referrals.items,
  };
}

async function loadDirectoryUsers(service: ServiceClient, limit: number): Promise<DirectoryUser[]> {
  const { data, error } = await service
    .from('app_user_directory')
    .select('user_id,email,email_confirmed_at,invitation_code,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!error && data?.length) return data;

  const authUsers: DirectoryUser[] = [];
  const pages = Math.max(1, Math.ceil(limit / 1000));
  for (let page = 1; page <= pages; page += 1) {
    const { data: pageData, error: authError } = await service.auth.admin.listUsers({
      page,
      perPage: Math.min(1000, limit),
    });
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
    if (authUsers.length >= limit || pageUsers.length < 1000) break;
  }
  return authUsers.slice(0, limit);
}

async function searchDirectoryUsers(
  service: ServiceClient,
  normalizedQuery: string,
  limit: number,
): Promise<DirectoryUser[]> {
  const { data: emailMatches, error: emailError } = await service
    .from('app_user_directory')
    .select('user_id,email,email_confirmed_at,invitation_code,created_at')
    .ilike('email', `%${normalizedQuery}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  const rowsById = new Map<string, DirectoryUser>();
  for (const row of emailError ? [] : emailMatches ?? []) rowsById.set(row.user_id, row);

  if (isUuid(normalizedQuery)) {
    const { data: userMatch, error: userError } = await service
      .from('app_user_directory')
      .select('user_id,email,email_confirmed_at,invitation_code,created_at')
      .eq('user_id', normalizedQuery)
      .maybeSingle();
    if (!userError && userMatch) rowsById.set(userMatch.user_id, userMatch);
  }

  return Array.from(rowsById.values())
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, limit);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function enrichUsers(service: ServiceClient, users: DirectoryUser[]): Promise<AdminUser[]> {
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
