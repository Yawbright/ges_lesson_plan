import type { ServiceClient } from './types.ts';

export async function loadSettings(service: ServiceClient) {
  const { data, error } = await service.from('admin_app_settings').select('key,value,updated_at').order('key');
  if (error) return [];
  return data ?? [];
}

export async function updateSettings(service: ServiceClient, settings: Record<string, unknown>) {
  const allowedKeys = new Set([
    'starter_credits',
    'referral_reward',
    'feature_credit_costs',
    'generated_file_retention',
    'credit_purchasing',
  ]);
  const rows = Object.entries(settings)
    .filter(([key]) => allowedKeys.has(key))
    .map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

  if (!rows.length) throw new Error('No supported settings were provided');

  const { data, error } = await service
    .from('admin_app_settings')
    .upsert(rows, { onConflict: 'key' })
    .select('key,value,updated_at')
    .order('key');
  if (error) throw new Error(error.message);
  return data ?? [];
}
