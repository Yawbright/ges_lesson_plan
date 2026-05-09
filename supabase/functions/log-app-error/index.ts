import { corsHeaders } from '../_shared/claude.ts';
import { createServiceClient, getAuthenticatedUser } from '../_shared/supabase.ts';

type Body = {
  source?: string;
  action?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const service = createServiceClient();
  const body = (await req.json().catch(() => ({}))) as Body;
  let userId: string | null = null;
  try {
    const user = await getAuthenticatedUser(req);
    userId = user.id;
  } catch {
    userId = null;
  }

  const { data, error } = await service.rpc('log_app_error', {
    p_user_id: userId,
    p_source: body.source ?? 'client',
    p_action: body.action ?? 'unknown',
    p_message: body.message ?? 'Unknown error',
    p_metadata: body.metadata ?? {},
    p_severity: body.severity ?? 'error',
  });

  if (error) return json({ error: error.message }, 500);
  return json({ id: data }, 200);
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
