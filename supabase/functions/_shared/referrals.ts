import { createServiceClient } from './supabase.ts';

export async function rewardReferralIfQualified(referredUserId: string) {
  const service = createServiceClient();
  const { error } = await service.rpc('reward_referral_if_qualified', {
    p_referred_user_id: referredUserId,
  });

  if (error) {
    console.warn('[referrals] Failed to reward referral', error.message);
  }
}

