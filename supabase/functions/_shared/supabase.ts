import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export type EdgeUser = {
  id: string;
  email?: string;
};

export class HttpError extends Error {
  constructor(public status: number, message: string, public payload?: Record<string, unknown>) {
    super(message);
  }
}

export function createServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getAuthenticatedUser(req: Request): Promise<EdgeUser> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const authorization = req.headers.get('authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '').trim();

  if (!supabaseUrl || !anonKey) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not configured');
  }

  if (!token) {
    throw new HttpError(401, 'Sign in is required.');
  }

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    throw new HttpError(401, 'Sign in is required.');
  }

  return { id: data.user.id, email: data.user.email ?? undefined };
}

export async function logEdgeError(input: {
  userId?: string | null;
  source: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error';
}) {
  try {
    const service = createServiceClient();
    await service.rpc('log_app_error', {
      p_user_id: input.userId ?? null,
      p_source: input.source,
      p_action: input.action,
      p_message: input.message,
      p_metadata: input.metadata ?? {},
      p_severity: input.severity ?? 'error',
    });
  } catch {
    // Logging should never block the original function response.
  }
}
