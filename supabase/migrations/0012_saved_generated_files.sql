-- Persist generated lesson plans and schemes per user with a 15-day expiry window.

create table if not exists public.saved_lesson_plans (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  payload jsonb not null,
  expires_at timestamptz not null default (now() + interval '15 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_lesson_plans_user_created_idx
  on public.saved_lesson_plans (user_id, created_at desc);

create index if not exists saved_lesson_plans_expires_idx
  on public.saved_lesson_plans (expires_at);

create table if not exists public.saved_schemes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  payload jsonb not null,
  expires_at timestamptz not null default (now() + interval '15 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_schemes_user_created_idx
  on public.saved_schemes (user_id, created_at desc);

create index if not exists saved_schemes_expires_idx
  on public.saved_schemes (expires_at);

alter table public.saved_lesson_plans enable row level security;
alter table public.saved_schemes enable row level security;

drop policy if exists "owners manage saved lesson plans" on public.saved_lesson_plans;
create policy "owners manage saved lesson plans"
  on public.saved_lesson_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "owners manage saved schemes" on public.saved_schemes;
create policy "owners manage saved schemes"
  on public.saved_schemes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
