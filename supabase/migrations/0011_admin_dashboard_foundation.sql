-- Admin dashboard foundation: reliable user directory and editable pricing metadata.

alter table public.credit_packages
  add column if not exists original_price_subunit int,
  add column if not exists promotion_type text not null default 'none',
  add column if not exists promotion_value int not null default 0,
  add column if not exists badge_text text not null default '',
  add column if not exists bonus_credits int not null default 0,
  add column if not exists promo_starts_at timestamptz,
  add column if not exists promo_ends_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.credit_packages
set original_price_subunit = coalesce(original_price_subunit, price_subunit)
where original_price_subunit is null;

create table if not exists public.app_user_directory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  invitation_code text,
  email_confirmed_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_user_directory_email_idx
  on public.app_user_directory (lower(email));

alter table public.app_user_directory enable row level security;

drop policy if exists "admins read app user directory" on public.app_user_directory;
create policy "admins read app user directory"
  on public.app_user_directory for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create or replace function public.sync_app_user_directory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_user_directory (
    user_id,
    email,
    invitation_code,
    email_confirmed_at,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'invitation_code', new.raw_user_meta_data->>'referral_code'),
    new.email_confirmed_at,
    new.created_at,
    now()
  )
  on conflict (user_id) do update
  set email = excluded.email,
      invitation_code = coalesce(excluded.invitation_code, public.app_user_directory.invitation_code),
      email_confirmed_at = excluded.email_confirmed_at,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_sync_app_directory on auth.users;
create trigger on_auth_user_sync_app_directory
  after insert or update of email, email_confirmed_at, raw_user_meta_data on auth.users
  for each row execute procedure public.sync_app_user_directory();

insert into public.app_user_directory (
  user_id,
  email,
  invitation_code,
  email_confirmed_at,
  created_at,
  updated_at
)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data->>'invitation_code', u.raw_user_meta_data->>'referral_code'),
  u.email_confirmed_at,
  u.created_at,
  now()
from auth.users u
on conflict (user_id) do update
set email = excluded.email,
    invitation_code = coalesce(excluded.invitation_code, public.app_user_directory.invitation_code),
    email_confirmed_at = excluded.email_confirmed_at,
    updated_at = now();

create table if not exists public.admin_app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.admin_app_settings enable row level security;

drop policy if exists "admins read app settings" on public.admin_app_settings;
create policy "admins read app settings"
  on public.admin_app_settings for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

insert into public.admin_app_settings (key, value)
values
  ('starter_credits', '{"credits": 5}'::jsonb),
  ('referral_reward', '{"credits": 5, "monthly_limit": 5}'::jsonb),
  ('feature_credit_costs', '{"lesson_generation": 1, "scheme_generation": 1, "scheme_parsing": 1}'::jsonb)
on conflict (key) do nothing;
