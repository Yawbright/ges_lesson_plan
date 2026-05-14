import { corsHeaders } from '../_shared/claude.ts';
import type { PageInput, PageResult, ServiceClient } from './types.ts';

export function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

export async function safeLoad<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

export function pageBounds(input: PageInput, fallbackSize = 80) {
  const page = Math.max(0, Math.floor(Number(input.page ?? 0)));
  const pageSize = Math.min(100, Math.max(1, Math.floor(Number(input.pageSize ?? fallbackSize))));
  const from = page * pageSize;
  const to = from + pageSize;
  return { page, pageSize, from, to };
}

export function pageResult<T>(rows: T[], page: number, pageSize: number): PageResult<T> {
  return {
    items: rows.slice(0, pageSize),
    page,
    pageSize,
    hasMore: rows.length > pageSize,
  };
}

export async function countRows(
  service: ServiceClient,
  table: string,
  column: string,
  configure?: (query: any) => any,
) {
  let query = service.from(table).select(column, { count: 'exact', head: true });
  if (configure) query = configure(query);
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export async function loadEmails(service: ServiceClient, userIds: string[]) {
  const emailById = new Map<string, string>();
  if (!userIds.length) return emailById;
  try {
    const { data, error } = await service.from('app_user_directory').select('user_id,email').in('user_id', userIds);
    if (error) {
      console.error('[loadEmails] Query error:', error.message, error.details);
      return emailById;
    }
    for (const item of data ?? []) emailById.set(item.user_id, item.email ?? '');
  } catch (err) {
    console.error('[loadEmails] Exception:', err);
  }
  return emailById;
}
