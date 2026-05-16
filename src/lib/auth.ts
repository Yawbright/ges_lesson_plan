import { useEffect, useState } from 'react';
import type { AuthResponse, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let settled = false;

    const timeout = setTimeout(() => {
      if (!active || settled) return;
      console.warn('[auth] Session restore timed out. Continuing without a restored session.');
      setSession(null);
      setLoading(false);
    }, 4000);

    async function loadSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        settled = true;
        clearTimeout(timeout);
        setSession(data.session);
      } catch (error) {
        if (active) {
          settled = true;
          clearTimeout(timeout);
          console.warn('[auth] Failed to restore session', error);
          setSession(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      settled = true;
      clearTimeout(timeout);
      setSession(s);
      setLoading(false);
    });

    return () => {
      active = false;
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse['data']> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;
  if (!data.session) {
    throw new Error('Sign-in did not return a session. Please try again.');
  }

  return data;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  invitationCode?: string,
): Promise<AuthResponse['data']> {
  const emailRedirectTo =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/onboarding`
      : undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        invitation_code: invitationCode?.trim().toUpperCase() ?? '',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email: string) {
  const redirectTo =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/sign-in?reset=1`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function completePasswordReset(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function initializePasswordRecoveryFromUrl() {
  if (typeof window === 'undefined') return false;

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  const queryParams = url.searchParams;
  const isRecovery =
    queryParams.get('reset') === '1' ||
    hashParams.get('type') === 'recovery' ||
    queryParams.get('type') === 'recovery';

  if (!isRecovery) return false;

  const code = queryParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    clearRecoveryUrl(url);
    return true;
  }

  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    clearRecoveryUrl(url);
    return true;
  }

  return isRecovery;
}

export async function initializeEmailConfirmationFromUrl() {
  if (typeof window === 'undefined') return false;

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  const queryParams = url.searchParams;
  const type = hashParams.get('type') || queryParams.get('type');

  if (type !== 'signup' && type !== 'email_change') return false;

  const code = queryParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    clearAuthUrl(url);
    return true;
  }

  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    clearAuthUrl(url);
    return true;
  }

  return false;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function getAuthErrorMessage(err: unknown, mode: 'signin' | 'signup'): string {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email first, then come back and sign in.';
  }

  if (mode === 'signin' && lower.includes('invalid login credentials')) {
    return 'Invalid credentials.';
  }

  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'This email already has an account. Switch to sign in instead.';
  }

  if (lower.includes('invitation code')) {
    return message;
  }

  if (lower.includes('password should be at least') || lower.includes('password')) {
    return 'Use a password with at least 6 characters, then try again.';
  }

  if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed to fetch')) {
    return (
      'Could not reach Supabase. Check your internet connection and confirm your Supabase URL and anon key in .env.'
    );
  }

  return message || 'Something went wrong. Please try again.';
}

function clearRecoveryUrl(url: URL) {
  clearAuthUrl(url);
}

function clearAuthUrl(url: URL) {
  url.searchParams.delete('reset');
  url.searchParams.delete('code');
  url.searchParams.delete('type');
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}`);
}
