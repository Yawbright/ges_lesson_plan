import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';

export async function logAppError(input: {
  source: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error';
}) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) return;
    const { data } = await supabase.auth.getSession();
    await fetch(`${supabaseUrl}/functions/v1/log-app-error`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  } catch {
    // Logging must never break user workflows.
  }
}
