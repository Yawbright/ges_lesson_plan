-- Admin tools, app logs, and profile/onboarding support.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "admins can read admin users"
  on public.admin_users for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

insert into public.admin_users (user_id)
select id from auth.users where lower(email) = 'sesorkelly@gmail.com'
on conflict (user_id) do nothing;

create table if not exists public.app_error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  severity text not null default 'error' check (severity in ('info','warning','error')),
  source text not null,
  action text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_error_logs_created_idx
  on public.app_error_logs (created_at desc);

create index if not exists app_error_logs_user_idx
  on public.app_error_logs (user_id, created_at desc);

alter table public.app_error_logs enable row level security;

create policy "admins read error logs"
  on public.app_error_logs for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create table if not exists public.teacher_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  teacher_name text not null default '',
  school_name text not null default '',
  school_district text not null default '',
  class_sizes jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teacher_profiles enable row level security;

create policy "owners read own teacher profile"
  on public.teacher_profiles for select
  using (auth.uid() = user_id);

create policy "owners upsert own teacher profile"
  on public.teacher_profiles for insert
  with check (auth.uid() = user_id);

create policy "owners update own teacher profile"
  on public.teacher_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = p_user_id);
$$;

create or replace function public.log_app_error(
  p_user_id uuid,
  p_source text,
  p_action text,
  p_message text,
  p_metadata jsonb default '{}'::jsonb,
  p_severity text default 'error'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.app_error_logs (user_id, source, action, message, metadata, severity)
  values (p_user_id, p_source, p_action, left(p_message, 2000), coalesce(p_metadata, '{}'::jsonb), p_severity)
  returning id into v_id;

  return v_id;
end;
$$;

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
begin
  if not public.is_admin(p_admin_user_id) then
    raise exception 'Admin access required';
  end if;

  return query
  select
    u.id,
    u.email::text,
    u.created_at,
    coalesce(b.balance, 0),
    exists (select 1 from public.admin_users a where a.user_id = u.id)
  from auth.users u
  left join public.user_credit_balances b on b.user_id = u.id
  where coalesce(p_query, '') = ''
    or lower(u.email) like '%' || lower(p_query) || '%'
  order by u.created_at desc
  limit 50;
end;
$$;

create or replace function public.admin_adjust_user_credits(
  p_admin_user_id uuid,
  p_target_user_id uuid,
  p_amount int,
  p_reason text
)
returns table (balance int, transaction_id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(p_admin_user_id) then
    raise exception 'Admin access required';
  end if;

  if p_amount = 0 then
    raise exception 'Amount cannot be zero';
  end if;

  if p_amount > 0 then
    return query
    select r.balance, r.transaction_id
    from public.add_user_credits(
      p_target_user_id,
      p_amount,
      'adjustment',
      coalesce(nullif(trim(p_reason), ''), 'Admin credit adjustment'),
      jsonb_build_object('admin_user_id', p_admin_user_id)
    ) r;
  else
    return query
    select r.balance, r.transaction_id
    from public.consume_user_credits(
      p_target_user_id,
      abs(p_amount),
      'adjustment',
      coalesce(nullif(trim(p_reason), ''), 'Admin credit adjustment'),
      jsonb_build_object('admin_user_id', p_admin_user_id)
    ) r;
  end if;
end;
$$;

revoke execute on function public.is_admin(uuid) from anon, authenticated;
revoke execute on function public.log_app_error(uuid, text, text, text, jsonb, text) from anon, authenticated;
revoke execute on function public.admin_search_users(uuid, text) from anon, authenticated;
revoke execute on function public.admin_adjust_user_credits(uuid, uuid, int, text) from anon, authenticated;
