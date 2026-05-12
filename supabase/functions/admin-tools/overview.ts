import type { OverviewMetrics, OverviewMetricsRow, ServiceClient } from './types.ts';
import { countRows } from './shared.ts';
import { loadPurchases, loadTransactions } from './reports.ts';

const GENERATION_KINDS = new Set([
  'lesson_generation',
  'scheme_generation',
  'scheme_parsing',
  'teaching_notes_generation',
]);

export async function loadOverviewMetrics(service: ServiceClient, adminUserId: string): Promise<OverviewMetrics> {
  const { data, error } = await service.rpc('admin_overview_metrics', {
    p_admin_user_id: adminUserId,
  });
  const row = (Array.isArray(data) ? data[0] : data) as OverviewMetricsRow | undefined;
  if (!error && row) return overviewFromRow(row);

  const [
    totalUsers,
    completedProfiles,
    unconfirmedUsers,
    outstandingCredits,
    purchases,
    transactions,
    errors,
    referralRewardsThisMonth,
  ] = await Promise.all([
    countRows(service, 'app_user_directory', 'user_id'),
    countRows(service, 'teacher_profiles', 'user_id', (query) => query.eq('onboarding_completed', true)),
    countRows(service, 'app_user_directory', 'user_id', (query) => query.is('email_confirmed_at', null)),
    sumCreditBalances(service),
    loadPurchases(service, { pageSize: 1000 }),
    loadTransactions(service, { pageSize: 1000 }),
    countRows(service, 'app_error_logs', 'id', (query) => query.eq('severity', 'error')),
    countRows(service, 'referrals', 'id', (query) =>
      query.eq('status', 'rewarded').gte('rewarded_at', startOfMonthIso()),
    ),
  ]);
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const successfulPayments = purchases.items.filter((item) => item.status === 'success');
  const revenue = (from?: Date) =>
    successfulPayments
      .filter((item) => !from || new Date(item.verified_at ?? item.created_at) >= from)
      .reduce((sum, item) => sum + Number(item.amount_subunit ?? 0), 0);
  const debits = transactions.items.filter((item) => Number(item.amount) < 0);
  const generationDebits = debits.filter((item) => GENERATION_KINDS.has(item.kind));

  return {
    totalUsers,
    completedProfiles,
    unconfirmedUsers,
    revenueTodaySubunit: revenue(startOfToday),
    revenueWeekSubunit: revenue(startOfWeek),
    revenueMonthSubunit: revenue(startOfMonth),
    revenueTotalSubunit: revenue(),
    successfulPayments: successfulPayments.length,
    failedPayments: purchases.items.filter((item) => item.status === 'failed').length,
    pendingPayments: purchases.items.filter((item) => item.status === 'pending').length,
    creditsSold: successfulPayments.reduce((sum, item) => sum + Number(item.credits ?? 0), 0),
    creditsUsed: Math.abs(debits.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)),
    outstandingCredits,
    lessonPlansGenerated: generationDebits.filter((item) => item.kind === 'lesson_generation').length,
    schemesGenerated: generationDebits.filter((item) => item.kind === 'scheme_generation').length,
    customSchemesAnalyzed: generationDebits.filter((item) => item.kind === 'scheme_parsing').length,
    teachingNotesGenerated: generationDebits.filter((item) => item.kind === 'teaching_notes_generation').length,
    errors,
    referralRewardsThisMonth,
  };
}

export function emptyOverviewMetrics(): OverviewMetrics {
  return {
    totalUsers: 0,
    completedProfiles: 0,
    unconfirmedUsers: 0,
    revenueTodaySubunit: 0,
    revenueWeekSubunit: 0,
    revenueMonthSubunit: 0,
    revenueTotalSubunit: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    creditsSold: 0,
    creditsUsed: 0,
    outstandingCredits: 0,
    lessonPlansGenerated: 0,
    schemesGenerated: 0,
    customSchemesAnalyzed: 0,
    teachingNotesGenerated: 0,
    errors: 0,
    referralRewardsThisMonth: 0,
  };
}

function overviewFromRow(row: OverviewMetricsRow): OverviewMetrics {
  return {
    totalUsers: Number(row.total_users ?? 0),
    completedProfiles: Number(row.completed_profiles ?? 0),
    unconfirmedUsers: Number(row.unconfirmed_users ?? 0),
    revenueTodaySubunit: Number(row.revenue_today_subunit ?? 0),
    revenueWeekSubunit: Number(row.revenue_week_subunit ?? 0),
    revenueMonthSubunit: Number(row.revenue_month_subunit ?? 0),
    revenueTotalSubunit: Number(row.revenue_total_subunit ?? 0),
    successfulPayments: Number(row.successful_payments ?? 0),
    failedPayments: Number(row.failed_payments ?? 0),
    pendingPayments: Number(row.pending_payments ?? 0),
    creditsSold: Number(row.credits_sold ?? 0),
    creditsUsed: Number(row.credits_used ?? 0),
    outstandingCredits: Number(row.outstanding_credits ?? 0),
    lessonPlansGenerated: Number(row.lesson_plans_generated ?? 0),
    schemesGenerated: Number(row.schemes_generated ?? 0),
    customSchemesAnalyzed: Number(row.custom_schemes_analyzed ?? 0),
    teachingNotesGenerated: Number(row.teaching_notes_generated ?? 0),
    errors: Number(row.errors ?? 0),
    referralRewardsThisMonth: Number(row.referral_rewards_this_month ?? 0),
  };
}

function startOfMonthIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

async function sumCreditBalances(service: ServiceClient) {
  let total = 0;
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await service
      .from('user_credit_balances')
      .select('balance')
      .range(from, from + pageSize - 1);

    if (error) return total;
    const rows = data ?? [];
    total += rows.reduce((sum, item) => sum + Number(item.balance ?? 0), 0);
    if (rows.length < pageSize) break;
  }

  return total;
}
