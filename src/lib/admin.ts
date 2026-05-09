import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';

export type AdminUser = {
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

export type AdminLog = {
  id: string;
  user_id: string | null;
  email?: string;
  severity: string;
  source: string;
  action: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AdminTransaction = {
  id: string;
  user_id: string;
  email?: string;
  amount: number;
  balance_after: number;
  kind: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AdminPurchase = {
  id: string;
  user_id: string;
  email?: string;
  package_id: string;
  credits: number;
  amount_subunit: number;
  currency: string;
  paystack_reference: string;
  status: string;
  verified_at: string | null;
  created_at: string;
};

export type AdminReferral = {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  referrer_email?: string;
  referred_email?: string;
  referral_code: string;
  status: string;
  rejection_reason: string | null;
  qualified_at: string | null;
  rewarded_at: string | null;
  created_at: string;
};

export type AdminCreditPackage = {
  id: string;
  name: string;
  credits: number;
  price_subunit: number;
  currency: string;
  active: boolean;
  sort_order: number;
  original_price_subunit: number | null;
  promotion_type: string;
  promotion_value: number;
  badge_text: string;
  bonus_credits: number;
  promo_starts_at: string | null;
  promo_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminOverview = {
  totalUsers: number;
  completedProfiles: number;
  unconfirmedUsers: number;
  revenueTodaySubunit: number;
  revenueWeekSubunit: number;
  revenueMonthSubunit: number;
  revenueTotalSubunit: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  creditsSold: number;
  creditsUsed: number;
  outstandingCredits: number;
  lessonPlansGenerated: number;
  schemesGenerated: number;
  customSchemesAnalyzed: number;
  errors: number;
  referralRewardsThisMonth: number;
};

export type AdminSetting = {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
};

export type AdminDashboard = {
  overview: AdminOverview;
  users: AdminUser[];
  transactions: AdminTransaction[];
  purchases: AdminPurchase[];
  referrals: AdminReferral[];
  logs: AdminLog[];
  packages: AdminCreditPackage[];
  settings: AdminSetting[];
};

export type AdminUserDetail = {
  user: AdminUser | null;
  transactions: AdminTransaction[];
  purchases: AdminPurchase[];
  referrals: AdminReferral[];
};

export async function adminLoadDashboard() {
  return invokeAdmin<AdminDashboard>({ action: 'dashboard' });
}

export async function adminSearchUsers(query = '') {
  const data = await invokeAdmin<{ users: AdminUser[] }>({ action: 'search-users', query });
  return data.users;
}

export async function adminLoadUserDetail(userId: string) {
  const data = await invokeAdmin<{ detail: AdminUserDetail }>({ action: 'user-detail', userId });
  return data.detail;
}

export async function adminAdjustCredits(input: { userId: string; amount: number; reason: string }) {
  return invokeAdmin<{ result: { balance: number; transaction_id: string } }>({
    action: 'adjust-credits',
    userId: input.userId,
    amount: input.amount,
    reason: input.reason,
  });
}

export async function adminUpdatePackage(input: {
  id: string;
  name: string;
  credits: number;
  originalPriceSubunit: number;
  priceSubunit: number;
  promotionType: string;
  promotionValue: number;
  badgeText: string;
  bonusCredits: number;
  promoStartsAt?: string | null;
  promoEndsAt?: string | null;
  active: boolean;
}) {
  const data = await invokeAdmin<{ package: AdminCreditPackage }>({ action: 'update-package', package: input });
  return data.package;
}

export async function adminCreatePackage(input: {
  id: string;
  name: string;
  credits: number;
  originalPriceSubunit: number;
  priceSubunit: number;
  promotionType: string;
  promotionValue: number;
  badgeText: string;
  bonusCredits: number;
  promoStartsAt?: string | null;
  promoEndsAt?: string | null;
  active: boolean;
}) {
  const data = await invokeAdmin<{ package: AdminCreditPackage }>({ action: 'create-package', package: input });
  return data.package;
}

export async function adminDeletePackage(id: string) {
  return invokeAdmin<{ deleted: boolean; deactivated: boolean }>({ action: 'delete-package', package: { id } });
}

export async function adminLoadLogs() {
  const data = await invokeAdmin<{ logs: AdminLog[] }>({ action: 'logs' });
  return data.logs;
}

async function invokeAdmin<T>(body: object): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sign in first.');
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase is not configured.');

  const response = await fetch(`${supabaseUrl}/functions/v1/admin-tools`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;
  if (!response.ok) throw new Error(payload?.error ?? `Admin request failed with HTTP ${response.status}`);
  return payload as T;
}
