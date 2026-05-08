-- Initial schema for Ghana Lesson Planner.
-- Run with: supabase db push   (after `supabase link`)

create extension if not exists "pgcrypto";

-- Lesson plans -------------------------------------------------------------
create table if not exists public.lesson_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  class_level text not null,
  week int not null check (week between 1 and 14),
  term text,
  data jsonb not null,            -- full LessonPlan shape
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lesson_plans_user_idx on public.lesson_plans (user_id, created_at desc);

alter table public.lesson_plans enable row level security;

create policy "owners read own plans"
  on public.lesson_plans for select
  using (auth.uid() = user_id);

create policy "owners insert own plans"
  on public.lesson_plans for insert
  with check (auth.uid() = user_id);

create policy "owners update own plans"
  on public.lesson_plans for update
  using (auth.uid() = user_id);

create policy "owners delete own plans"
  on public.lesson_plans for delete
  using (auth.uid() = user_id);

-- Schemes of Learning (uploaded) and Scheme of Work (generated) ----------
create table if not exists public.schemes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('learning','work')),
  subject text not null,
  class_level text not null,
  term text not null,
  academic_year text,
  source_file_key text,           -- storage path for uploaded PDFs
  data jsonb not null,            -- full SchemeOfLearning shape
  created_at timestamptz not null default now()
);

create index if not exists schemes_user_idx on public.schemes (user_id, created_at desc);

alter table public.schemes enable row level security;

create policy "owners read own schemes"
  on public.schemes for select
  using (auth.uid() = user_id);

create policy "owners write own schemes"
  on public.schemes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket for uploaded scheme PDFs ---------------------------------
insert into storage.buckets (id, name, public)
values ('schemes', 'schemes', false)
on conflict (id) do nothing;

create policy "owners read own scheme files"
  on storage.objects for select
  using (bucket_id = 'schemes' and owner = auth.uid());

create policy "owners upload own scheme files"
  on storage.objects for insert
  with check (bucket_id = 'schemes' and owner = auth.uid());

create policy "owners delete own scheme files"
  on storage.objects for delete
  using (bucket_id = 'schemes' and owner = auth.uid());
