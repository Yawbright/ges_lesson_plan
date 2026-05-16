import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { appStorage } from './storage';

type Extra = { supabaseUrl?: string; supabaseAnonKey?: string };

const extra = Constants.expoConfig?.extra as Extra | undefined;

const url =
  (process.env.EXPO_PUBLIC_SUPABASE_URL || extra?.supabaseUrl || '').trim();
const anonKey = (
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  extra?.supabaseAnonKey ||
  ''
).trim();

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!url || !anonKey) {
  console.warn(
    '[supabase] Missing Supabase URL or anon/publishable key. ' +
      'Fill .env (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY), ensure app.config.js loads it, ' +
      'then restart with: npx expo start -c'
  );
}

const clientUrl = isSupabaseConfigured ? url : 'https://placeholder.supabase.co';
const clientAnonKey = isSupabaseConfigured ? anonKey : 'placeholder-anon-key';

export const supabase = createClient(clientUrl, clientAnonKey, {
  auth: {
    storage: appStorage,
    autoRefreshToken: Platform.OS !== 'web',
    persistSession: true,
    detectSessionInUrl: false,
  },
});
