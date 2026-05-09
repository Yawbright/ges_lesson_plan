import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceId } from './device';
import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';

const PENDING_REFERRAL_KEY = 'pending-referral-code';

export type ReferralDashboard = {
  code: string;
  stats: {
    pending: number;
    rewarded: number;
    rejected: number;
    rewardsThisMonth: number;
    monthlyLimit: number;
  };
  referrals: Array<{
    id: string;
    status: string;
    rejection_reason?: string | null;
    created_at: string;
    rewarded_at?: string | null;
  }>;
};

export async function loadReferralDashboard(): Promise<ReferralDashboard> {
  const deviceId = await getDeviceId();
  return invokeAuthedReferralFunction<ReferralDashboard>('referral-dashboard', { deviceId });
}

export async function applyReferralCode(code: string) {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;

  const deviceId = await getDeviceId();
  return invokeAuthedReferralFunction<{
    status: string;
    referrerUserId: string | null;
    reason: string | null;
  }>('apply-referral', { code: trimmed, deviceId });
}

export async function validateReferralCode(code: string) {
  const cleaned = code.trim().toUpperCase();
  if (!cleaned) {
    throw new Error('Invitation code is required.');
  }
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase is not configured.');

  const response = await fetch(`${supabaseUrl}/functions/v1/validate-referral-code`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ code: cleaned }),
  });

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;

  if (!response.ok || !payload?.valid) {
    throw new Error(payload?.error ?? 'Invitation code is invalid.');
  }

  return String(payload.code ?? cleaned).toUpperCase();
}

export async function savePendingReferralCode(code: string) {
  const cleaned = code.trim().toUpperCase();
  if (!cleaned) return;
  await storage.setItem(PENDING_REFERRAL_KEY, cleaned);
}

export async function consumePendingReferralCode() {
  const code = await storage.getItem(PENDING_REFERRAL_KEY);
  if (code) {
    await storage.removeItem(PENDING_REFERRAL_KEY);
  }
  return code;
}

export function buildReferralLink(code: string) {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/sign-in?ref=${encodeURIComponent(code)}`;
  }

  return `Referral code: ${code}`;
}

async function invokeAuthedReferralFunction<T>(functionName: string, body: object): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sign in first.');
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase is not configured.');

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
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

  if (!response.ok) {
    throw new Error(payload?.error ?? `${functionName} failed with HTTP ${response.status}.`);
  }

  return payload as T;
}

const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};
