import type { PageInput, PageResult, ServiceClient } from './types.ts';
import { loadEmails, pageBounds, pageResult } from './shared.ts';

type ReportInput = PageInput & {
  userId?: string;
};

export async function loadTransactions(service: ServiceClient, input: ReportInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  let query = service
    .from('credit_transactions')
    .select('id,user_id,amount,balance_after,kind,description,metadata,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (input.userId) query = query.eq('user_id', input.userId);
  const { data, error } = await query;
  if (error) {
    console.error('[loadTransactions] Query error:', error.message);
    throw new Error(`Failed to load transactions: ${error.message}`);
  }
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id))));
  const rows = (data ?? []).map((item) => ({ ...item, email: emailById.get(item.user_id) ?? '' }));
  return pageResult(rows, page, pageSize);
}

export async function loadPurchases(service: ServiceClient, input: ReportInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  let query = service
    .from('credit_purchases')
    .select('id,user_id,package_id,credits,amount_subunit,currency,paystack_reference,status,verified_at,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (input.userId) query = query.eq('user_id', input.userId);
  const { data, error } = await query;
  if (error) {
    console.error('[loadPurchases] Query error:', error.message);
    throw new Error(`Failed to load purchases: ${error.message}`);
  }
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id))));
  const rows = (data ?? []).map((item) => ({ ...item, email: emailById.get(item.user_id) ?? '' }));
  return pageResult(rows, page, pageSize);
}

export async function loadReferrals(service: ServiceClient, input: ReportInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  let query = service
    .from('referrals')
    .select('id,referrer_user_id,referred_user_id,referral_code,status,rejection_reason,qualified_at,rewarded_at,referred_email_confirmed,referred_email_confirmed_at,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (input.userId) query = query.or(`referrer_user_id.eq.${input.userId},referred_user_id.eq.${input.userId}`);
  const { data, error, count } = await query;
  if (error) {
    console.error('[loadReferrals] Query error:', error.message, error.details, error.hint);
    throw new Error(`Failed to load referrals: ${error.message}`);
  }
  
  const ids = Array.from(
    new Set((data ?? []).flatMap((item) => [item.referrer_user_id, item.referred_user_id]).filter(Boolean)),
  );
  const emailById = await loadEmails(service, ids);
  const confirmationById = await loadEmailConfirmationByUserId(service, ids);
  const rows = (data ?? []).map((item) => ({
    ...item,
    referrer_email: emailById.get(item.referrer_user_id) ?? '',
    referred_email: emailById.get(item.referred_user_id) ?? '',
    referred_email_confirmed: confirmationById.has(item.referred_user_id)
      ? confirmationById.get(item.referred_user_id)
      : item.referred_email_confirmed,
  }));
  return pageResult(rows, page, pageSize);
}

async function loadEmailConfirmationByUserId(service: ServiceClient, userIds: string[]) {
  const confirmedById = new Map<string, boolean>();
  if (!userIds.length) return confirmedById;

  const { data, error } = await service
    .from('app_user_directory')
    .select('user_id,email_confirmed_at')
    .in('user_id', userIds);

  if (error) {
    console.error('[loadEmailConfirmationByUserId] Query error:', error.message, error.details);
    return confirmedById;
  }

  for (const item of data ?? []) {
    confirmedById.set(item.user_id, Boolean(item.email_confirmed_at));
  }
  return confirmedById;
}

export async function loadLogs(service: ServiceClient, input: PageInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  const { data, error } = await service
    .from('app_error_logs')
    .select('id,user_id,severity,source,action,message,metadata,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) {
    console.error('[loadLogs] Query error:', error.message);
    throw new Error(`Failed to load logs: ${error.message}`);
  }
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id).filter(Boolean))));
  const rows = (data ?? []).map((item) => ({ ...item, email: item.user_id ? emailById.get(item.user_id) ?? '' : '' }));
  return pageResult(rows, page, pageSize);
}

export async function loadPhoneSignups(service: ServiceClient, input: PageInput = {}): Promise<PageResult<any>> {
  const { page, pageSize, from, to } = pageBounds(input);
  const { data, error } = await service
    .from('phone_signup_events')
    .select('id,phone_number,event_type,status,otp_request_id,user_id,referral_code,provider,provider_message,metadata,legacy,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) {
    console.error('[loadPhoneSignups] Query error:', error.message);
    throw new Error(`Failed to load phone signup events: ${error.message}`);
  }
  const emailById = await loadEmails(service, Array.from(new Set((data ?? []).map((item) => item.user_id).filter(Boolean))));
  const rows = (data ?? []).map((item) => ({
    ...item,
    email: item.user_id ? emailById.get(item.user_id) ?? '' : '',
  }));
  return pageResult(rows, page, pageSize);
}
