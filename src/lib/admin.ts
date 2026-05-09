import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';

export type AdminUser = {
  user_id: string;
  email: string;
  created_at: string;
  balance: number;
  is_admin: boolean;
};

export type AdminLog = {
  id: string;
  user_id: string | null;
  severity: string;
  source: string;
  action: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function adminSearchUsers(query = '') {
  const data = await invokeAdmin<{ users: AdminUser[] }>({ action: 'search-users', query });
  return data.users;
}

export async function adminAdjustCredits(input: { userId: string; amount: number; reason: string }) {
  return invokeAdmin<{ result: { balance: number; transaction_id: string } }>({
    action: 'adjust-credits',
    userId: input.userId,
    amount: input.amount,
    reason: input.reason,
  });
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
