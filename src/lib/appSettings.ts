import { supabase } from './supabase';

export type RuntimeAppSettings = {
  starterCredits: { credits: number; active: boolean };
  referralReward: { credits: number; monthlyLimit: number; active: boolean };
  featureCreditCosts: { lesson_generation: number; scheme_generation: number; scheme_parsing: number };
  generatedFileRetention: { days: number };
  creditPurchasing: { enabled: boolean };
};

export const defaultRuntimeSettings: RuntimeAppSettings = {
  starterCredits: { credits: 5, active: true },
  referralReward: { credits: 5, monthlyLimit: 5, active: true },
  featureCreditCosts: { lesson_generation: 1, scheme_generation: 1, scheme_parsing: 1 },
  generatedFileRetention: { days: 15 },
  creditPurchasing: { enabled: false },
};

export async function loadRuntimeAppSettings(): Promise<RuntimeAppSettings> {
  const { data, error } = await supabase.from('admin_app_settings').select('key,value');
  if (error) return defaultRuntimeSettings;

  const byKey = new Map((data ?? []).map((item) => [item.key, item.value as Record<string, unknown>]));
  return {
    starterCredits: {
      credits: numberValue(byKey.get('starter_credits')?.credits, defaultRuntimeSettings.starterCredits.credits),
      active: booleanValue(byKey.get('starter_credits')?.active, true),
    },
    referralReward: {
      credits: numberValue(byKey.get('referral_reward')?.credits, defaultRuntimeSettings.referralReward.credits),
      monthlyLimit: numberValue(byKey.get('referral_reward')?.monthly_limit, defaultRuntimeSettings.referralReward.monthlyLimit),
      active: booleanValue(byKey.get('referral_reward')?.active, true),
    },
    featureCreditCosts: {
      lesson_generation: numberValue(byKey.get('feature_credit_costs')?.lesson_generation, 1),
      scheme_generation: numberValue(byKey.get('feature_credit_costs')?.scheme_generation, 1),
      scheme_parsing: numberValue(byKey.get('feature_credit_costs')?.scheme_parsing, 1),
    },
    generatedFileRetention: {
      days: numberValue(byKey.get('generated_file_retention')?.days, 15),
    },
    creditPurchasing: {
      enabled: booleanValue(byKey.get('credit_purchasing')?.enabled, false),
    },
  };
}

function numberValue(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}
