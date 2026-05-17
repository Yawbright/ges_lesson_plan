import { invokeEdgeFunction } from './edgeFunctions';

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
  referred_email_confirmed: boolean;
  referred_email_confirmed_at: string | null;
  created_at: string;
};

export type AdminPhoneSignupEvent = {
  id: string;
  phone_number: string;
  event_type: string;
  status: string;
  otp_request_id: string | null;
  user_id: string | null;
  email?: string;
  referral_code: string | null;
  provider: string | null;
  provider_message: string | null;
  metadata: Record<string, unknown>;
  legacy: boolean;
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
  teachingNotesGenerated: number;
  errors: number;
  referralRewardsThisMonth: number;
};

export type AdminSetting = {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
};

export type AdminFaqItem = {
  id: string;
  section_id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminFaqSection = {
  id: string;
  title: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  items: AdminFaqItem[];
};

export type AdminReportKind = 'transactions' | 'purchases' | 'referrals' | 'logs' | 'phone-signups';

export type AdminPage<T> = {
  items: T[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type AdminDashboard = {
  overview: AdminOverview;
  users: AdminUser[];
  transactions: AdminTransaction[];
  purchases: AdminPurchase[];
  referrals: AdminReferral[];
  logs: AdminLog[];
  phoneSignups: AdminPhoneSignupEvent[];
  reportPages?: {
    transactions: AdminPage<AdminTransaction>;
    purchases: AdminPage<AdminPurchase>;
    referrals: AdminPage<AdminReferral>;
    logs: AdminPage<AdminLog>;
    phoneSignups: AdminPage<AdminPhoneSignupEvent>;
  };
  packages: AdminCreditPackage[];
  settings: AdminSetting[];
  faqs: AdminFaqSection[];
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

export async function adminListReport<T>(report: AdminReportKind, page: number, pageSize = 80) {
  const data = await invokeAdmin<AdminPage<T> & { report: AdminReportKind }>({
    action: 'list-report',
    report,
    page,
    pageSize,
  });
  return data;
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

export async function adminUpdateSettings(settings: Record<string, unknown>) {
  const data = await invokeAdmin<{ settings: AdminSetting[] }>({ action: 'update-settings', settings });
  return data.settings;
}

export async function adminUpsertFaqSection(input: {
  id?: string;
  title: string;
  sortOrder: number;
  active: boolean;
}) {
  const data = await invokeAdmin<{ section: AdminFaqSection }>({ action: 'upsert-faq-section', faqSection: input });
  return data.section;
}

export async function adminDeleteFaqSection(id: string) {
  return invokeAdmin<{ deleted: boolean }>({ action: 'delete-faq-section', faqSection: { id } });
}

export async function adminUpsertFaqItem(input: {
  id?: string;
  sectionId: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
}) {
  const data = await invokeAdmin<{ item: AdminFaqItem }>({ action: 'upsert-faq-item', faqItem: input });
  return data.item;
}

export async function adminDeleteFaqItem(id: string) {
  return invokeAdmin<{ deleted: boolean }>({ action: 'delete-faq-item', faqItem: { id } });
}

export async function adminLoadLogs() {
  const data = await invokeAdmin<{ logs: AdminLog[] }>({ action: 'logs' });
  return data.logs;
}

async function invokeAdmin<T>(body: object): Promise<T> {
  return invokeEdgeFunction<T>('admin-tools', body, {
    authErrorMessage: 'Sign in first.',
  });
}
