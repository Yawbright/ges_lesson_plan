import type { createServiceClient } from '../_shared/supabase.ts';

export type ServiceClient = ReturnType<typeof createServiceClient>;

export type Body = {
  action?: string;
  query?: string;
  userId?: string;
  amount?: number;
  reason?: string;
  package?: CreditPackageUpdate;
  settings?: Record<string, unknown>;
  page?: number;
  pageSize?: number;
  report?: AdminReportKind;
};

export type AdminReportKind = 'transactions' | 'purchases' | 'referrals' | 'logs';

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

export type CreditPackageUpdate = {
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

export type DirectoryUser = {
  user_id: string;
  email: string | null;
  email_confirmed_at: string | null;
  invitation_code: string | null;
  created_at: string;
};

export type ListedAuthUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type OverviewMetrics = {
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

export type OverviewMetricsRow = {
  total_users?: number | string | null;
  completed_profiles?: number | string | null;
  unconfirmed_users?: number | string | null;
  revenue_today_subunit?: number | string | null;
  revenue_week_subunit?: number | string | null;
  revenue_month_subunit?: number | string | null;
  revenue_total_subunit?: number | string | null;
  successful_payments?: number | string | null;
  failed_payments?: number | string | null;
  pending_payments?: number | string | null;
  credits_sold?: number | string | null;
  credits_used?: number | string | null;
  outstanding_credits?: number | string | null;
  lesson_plans_generated?: number | string | null;
  schemes_generated?: number | string | null;
  custom_schemes_analyzed?: number | string | null;
  teaching_notes_generated?: number | string | null;
  errors?: number | string | null;
  referral_rewards_this_month?: number | string | null;
};

export type PageInput = {
  page?: number;
  pageSize?: number;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  hasMore: boolean;
};
