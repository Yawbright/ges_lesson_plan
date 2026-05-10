import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';

type InvokeEdgeFunctionOptions = {
  headers?: Record<string, string>;
  requireAuth?: boolean;
  authErrorMessage?: string;
};

export class EdgeFunctionError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

export async function invokeEdgeFunction<T>(
  functionName: string,
  body: object,
  options: InvokeEdgeFunctionOptions = {},
): Promise<T> {
  const requireAuth = options.requireAuth ?? true;
  const token = await getAccessToken();

  if (requireAuth && !token) {
    throw new Error(options.authErrorMessage ?? 'Sign in first.');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anon key is missing.');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'content-type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  const payload = parseJsonPayload(raw);

  if (!response.ok) {
    throw new EdgeFunctionError(
      getFunctionErrorMessage(functionName, response.status, payload, raw),
      response.status,
      payload,
    );
  }

  if (payload == null) {
    throw new Error(`No response body from ${functionName}`);
  }

  return payload as T;
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function parseJsonPayload(raw: string) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getFunctionErrorMessage(
  functionName: string,
  status: number,
  payload: unknown,
  raw: string,
) {
  if (payload && typeof payload === 'object') {
    const candidate = payload as { error?: unknown; message?: unknown };
    if (typeof candidate.error === 'string') return candidate.error;
    if (typeof candidate.message === 'string') return candidate.message;
  }

  return raw.trim().slice(0, 1200) || `${functionName} failed with HTTP ${status}.`;
}
