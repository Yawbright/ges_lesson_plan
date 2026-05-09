create or replace function public.admin_search_users(
  p_admin_user_id uuid,
  p_query text default ''
)
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  balance int,
  is_admin boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_query text := lower(trim(coalesce(p_query, '')));
begin
  if not public.is_admin(p_admin_user_id) then
    raise exception 'Admin access required';
  end if;

  return query
  select
    u.id,
    coalesce(u.email, '')::text,
    u.created_at,
    coalesce(b.balance, 0),
    exists (select 1 from public.admin_users a where a.user_id = u.id)
  from auth.users u
  left join public.user_credit_balances b on b.user_id = u.id
  where v_query = ''
    or lower(coalesce(u.email, '')) like '%' || v_query || '%'
    or u.id::text like '%' || v_query || '%'
  order by u.created_at desc
  limit 50;
end;
$$;

revoke execute on function public.admin_search_users(uuid, text) from anon, authenticated;
