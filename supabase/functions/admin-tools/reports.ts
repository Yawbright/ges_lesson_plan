import type { PageInput, PageResult, ServiceClient } from './types.ts';
import { loadEmails, pageBounds, pageResult } from './shared.ts';

type ReportInput = PageInput & {
  userId?: string;
};

export async function loadTransactions(service: ServiceClient, input: ReportInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  let query = service
    .from('credit_transactions')
    .select('id,user_id,amount,balance_after,kind,description,metadata,created_at')
    .order('created_at', { ascending: false })
    .range(from, to);
  if (input.userId) query = query.eq('user_id', input.userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id))));
  const rows = (data ?? []).map((item) => ({ ...item, email: emailById.get(item.user_id) ?? '' }));
  return pageResult(rows, page, pageSize);
}

export async function loadPurchases(service: ServiceClient, input: ReportInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  let query = service
    .from('credit_purchases')
    .select('id,user_id,package_id,credits,amount_subunit,currency,paystack_reference,status,verified_at,created_at')
    .order('created_at', { ascending: false })
    .range(from, to);
  if (input.userId) query = query.eq('user_id', input.userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id))));
  const rows = (data ?? []).map((item) => ({ ...item, email: emailById.get(item.user_id) ?? '' }));
  return pageResult(rows, page, pageSize);
}

export async function loadReferrals(service: ServiceClient, input: ReportInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  let query = service
    .from('referrals')
    .select('id,referrer_user_id,referred_user_id,referral_code,status,rejection_reason,qualified_at,rewarded_at,created_at')
    .order('created_at', { ascending: false })
    .range(from, to);
  if (input.userId) query = query.or(`referrer_user_id.eq.${input.userId},referred_user_id.eq.${input.userId}`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const ids = Array.from(
    new Set((data ?? []).flatMap((item) => [item.referrer_user_id, item.referred_user_id]).filter(Boolean)),
  );
  const emailById = await loadEmails(service, ids);
  const rows = (data ?? []).map((item) => ({
    ...item,
    referrer_email: emailById.get(item.referrer_user_id) ?? '',
    referred_email: emailById.get(item.referred_user_id) ?? '',
  }));
  return pageResult(rows, page, pageSize);
}

export async function loadLogs(service: ServiceClient, input: PageInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  const { data, error } = await service
    .from('app_error_logs')
    .select('id,user_id,severity,source,action,message,metadata,created_at')
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id).filter(Boolean))));
  const rows = (data ?? []).map((item) => ({ ...item, email: item.user_id ? emailById.get(item.user_id) ?? '' : '' }));
  return pageResult(rows, page, pageSize);
}
