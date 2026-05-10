import { appStorage } from './storage';

const STORAGE_KEY = 'glp-device-id';

export async function getDeviceId(): Promise<string> {
  const existing = await appStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await appStorage.setItem(STORAGE_KEY, generated);
  return generated;
}
