import { useEffect, useState } from 'react';
import type { AuthResponse, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setSession(data.session);
      } catch (error) {
        if (active) {
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
      setSession(s);
    });

    return () => {
      active = false;
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
): Promise<AuthResponse['data']> {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw error;
  return data;
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
    return (
      'The email or password is incorrect. Supabase does not reveal which one is wrong for security, ' +
      'so check both and try again.'
    );
  }

  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'This email already has an account. Switch to sign in instead.';
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
