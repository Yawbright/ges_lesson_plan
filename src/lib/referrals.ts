import { getDeviceId } from './device';
import { invokeEdgeFunction } from './edgeFunctions';
import { appStorage } from './storage';

const PENDING_REFERRAL_KEY = 'pending-referral-code';

export type ReferralDashboard = {
  code: string;
  stats: {
    pending: number;
    rewarded: number;
    rejected: number;
    rewardsThisMonth: number;
    monthlyLimit: number;
    rewardCredits?: number;
    active?: boolean;
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

  const payload = await invokeEdgeFunction<{ valid?: boolean; code?: string; error?: string }>(
    'validate-referral-code',
    { code: cleaned },
    { requireAuth: false },
  );

  if (!payload?.valid) {
    throw new Error(payload?.error ?? 'Invitation code is invalid.');
  }

  return String(payload.code ?? cleaned).toUpperCase();
}

export async function savePendingReferralCode(code: string) {
  const cleaned = code.trim().toUpperCase();
  if (!cleaned) return;
  await appStorage.setItem(PENDING_REFERRAL_KEY, cleaned);
}

export async function consumePendingReferralCode() {
  const code = await appStorage.getItem(PENDING_REFERRAL_KEY);
  if (code) {
    await appStorage.removeItem(PENDING_REFERRAL_KEY);
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
  return invokeEdgeFunction<T>(functionName, body, {
    authErrorMessage: 'Sign in first.',
  });
}
