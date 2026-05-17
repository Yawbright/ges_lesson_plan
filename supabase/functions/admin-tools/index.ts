import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser, HttpError } from '../_shared/supabase.ts';
import { emptyOverviewMetrics, loadOverviewMetrics } from './overview.ts';
import { createPackage, deletePackage, loadPackages, updatePackage } from './packages.ts';
import { deleteFaqItem, deleteFaqSection, loadFaqs, upsertFaqItem, upsertFaqSection } from './faqs.ts';
import { loadLogs, loadPhoneSignups, loadPurchases, loadReferrals, loadTransactions } from './reports.ts';
import { json, safeLoad } from './shared.ts';
import { loadSettings, updateSettings } from './settings.ts';
import type { AdminReportKind, AdminUser, Body } from './types.ts';
import { loadUserDetail, loadUsers } from './users.ts';

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
      const dashboard = await loadDashboard(service, user.id);
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

    if (body.action === 'list-report') {
      if (!body.report) return json({ error: 'report is required' }, 400);
      return json(await loadReport(service, body.report, body), 200);
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
      return json({ logs: (await loadLogs(service)).items }, 200);
    }

    if (body.action === 'update-package') {
      if (!body.package?.id) return json({ error: 'Package id is required' }, 400);
      const pack = await updatePackage(service, body.package);
      return json({ package: pack }, 200);
    }

    if (body.action === 'create-package') {
      if (!body.package?.id) return json({ error: 'Package id is required' }, 400);
      const pack = await createPackage(service, body.package);
      return json({ package: pack }, 200);
    }

    if (body.action === 'delete-package') {
      if (!body.package?.id) return json({ error: 'Package id is required' }, 400);
      const result = await deletePackage(service, body.package.id);
      return json(result, 200);
    }

    if (body.action === 'update-settings') {
      if (!body.settings || typeof body.settings !== 'object') {
        return json({ error: 'settings object is required' }, 400);
      }
      const settings = await updateSettings(service, body.settings);
      return json({ settings }, 200);
    }

    if (body.action === 'upsert-faq-section') {
      const section = await upsertFaqSection(service, body.faqSection ?? {});
      return json({ section }, 200);
    }

    if (body.action === 'delete-faq-section') {
      return json(await deleteFaqSection(service, body.faqSection?.id), 200);
    }

    if (body.action === 'upsert-faq-item') {
      const item = await upsertFaqItem(service, body.faqItem ?? {});
      return json({ item }, 200);
    }

    if (body.action === 'delete-faq-item') {
      return json(await deleteFaqItem(service, body.faqItem?.id), 200);
    }

    return json({ error: 'Unknown admin action' }, 400);
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message, ...(err.payload ?? {}) }, err.status);
    }
    return json({ error: (err as Error).message }, 500);
  }
});

async function loadDashboard(service: ReturnType<typeof createServiceClient>, adminUserId: string) {
  const [overviewMetrics, users, transactions, purchases, referrals, logs, phoneSignups, packages, settings, faqs] = await Promise.all([
    safeLoad(() => loadOverviewMetrics(service, adminUserId), emptyOverviewMetrics()),
    safeLoad(() => loadUsers(service, '', 20), [] as AdminUser[]),
    safeLoad(() => loadTransactions(service), { items: [], page: 0, pageSize: 80, hasMore: false }),
    safeLoad(() => loadPurchases(service), { items: [], page: 0, pageSize: 80, hasMore: false }),
    safeLoad(() => loadReferrals(service), { items: [], page: 0, pageSize: 80, hasMore: false }),
    safeLoad(() => loadLogs(service), { items: [], page: 0, pageSize: 80, hasMore: false }),
    safeLoad(() => loadPhoneSignups(service), { items: [], page: 0, pageSize: 80, hasMore: false }),
    safeLoad(() => loadPackages(service), []),
    safeLoad(() => loadSettings(service), []),
    safeLoad(() => loadFaqs(service), []),
  ]);

  return {
    overview: overviewMetrics,
    users,
    transactions: transactions.items,
    purchases: purchases.items,
    referrals: referrals.items,
    logs: logs.items,
    phoneSignups: phoneSignups.items,
    reportPages: {
      transactions,
      purchases,
      referrals,
      logs,
      phoneSignups,
    },
    packages,
    settings,
    faqs,
  };
}

async function loadReport(
  service: ReturnType<typeof createServiceClient>,
  report: AdminReportKind,
  body: Pick<Body, 'page' | 'pageSize'>,
) {
  if (report === 'transactions') return { report, ...(await loadTransactions(service, body)) };
  if (report === 'purchases') return { report, ...(await loadPurchases(service, body)) };
  if (report === 'referrals') return { report, ...(await loadReferrals(service, body)) };
  if (report === 'logs') return { report, ...(await loadLogs(service, body)) };
  if (report === 'phone-signups') return { report, ...(await loadPhoneSignups(service, body)) };
  throw new Error('Unsupported report');
}
