import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

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

if (!url || !anonKey) {
  console.warn(
    '[supabase] Missing Supabase URL or anon/publishable key. ' +
      'Fill .env (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY), ensure app.config.js loads it, ' +
      'then restart with: npx expo start -c'
  );
}

const noopStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {},
};

const webStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? {
        getItem: async (key: string) => window.localStorage.getItem(key),
        setItem: async (key: string, value: string) => window.localStorage.setItem(key, value),
        removeItem: async (key: string) => window.localStorage.removeItem(key),
      }
    : noopStorage;

const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const supabase = createClient(url, anonKey, {
  auth: {
    storage,
    autoRefreshToken: Platform.OS !== 'web',
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = Boolean(url && anonKey);
