-- Phone signup funnel:
-- - durable admin-visible events for OTP sends, verification attempts, and completed phone signups
-- - legacy backfill from phone_auth_requests and user_phone_numbers

create table if not exists public.phone_signup_events (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  event_type text not null,
  status text not null default 'info',
  otp_request_id uuid references public.phone_auth_requests(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  referral_code text,
  provider text,
  provider_message text,
  metadata jsonb not null default '{}'::jsonb,
  legacy boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists phone_signup_events_created_idx
  on public.phone_signup_events (created_at desc);

create index if not exists phone_signup_events_phone_created_idx
  on public.phone_signup_events (phone_number, created_at desc);

create index if not exists phone_signup_events_type_created_idx
  on public.phone_signup_events (event_type, created_at desc);

create index if not exists phone_signup_events_user_created_idx
  on public.phone_signup_events (user_id, created_at desc);

alter table public.phone_signup_events enable row level security;

drop policy if exists "admins read phone signup events" on public.phone_signup_events;
create policy "admins read phone signup events"
  on public.phone_signup_events for select
  using (public.is_admin());

insert into public.phone_signup_events (
  phone_number,
  event_type,
  status,
  otp_request_id,
  provider,
  provider_message,
  metadata,
  legacy,
  created_at
)
select
  par.phone_number,
  'otp_send_succeeded',
  'success',
  par.id,
  'legacy',
  'Backfilled from stored OTP request',
  jsonb_build_object(
    'otp_expires_at', par.otp_expires_at,
    'attempt_count', coalesce(par.attempt_count, 0),
    'source_table', 'phone_auth_requests'
  ),
  true,
  par.created_at
from public.phone_auth_requests par
where not exists (
  select 1
  from public.phone_signup_events pse
  where pse.otp_request_id = par.id
    and pse.event_type = 'otp_send_succeeded'
);

insert into public.phone_signup_events (
  phone_number,
  event_type,
  status,
  otp_request_id,
  provider,
  provider_message,
  metadata,
  legacy,
  created_at
)
select
  par.phone_number,
  'otp_verified',
  'success',
  par.id,
  'legacy',
  'Backfilled from verified OTP request',
  jsonb_build_object(
    'attempt_count', coalesce(par.attempt_count, 0),
    'source_table', 'phone_auth_requests'
  ),
  true,
  par.verified_at
from public.phone_auth_requests par
where par.verified_at is not null
  and not exists (
    select 1
    from public.phone_signup_events pse
    where pse.otp_request_id = par.id
      and pse.event_type = 'otp_verified'
  );

insert into public.phone_signup_events (
  phone_number,
  event_type,
  status,
  user_id,
  referral_code,
  provider,
  provider_message,
  metadata,
  legacy,
  created_at
)
select
  upn.phone_number,
  'registration_completed',
  'success',
  upn.user_id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'referral_code', ''),
    nullif(u.raw_user_meta_data ->> 'invitation_code', '')
  ),
  'legacy',
  'Backfilled from linked phone user',
  jsonb_build_object(
    'source_table', 'user_phone_numbers',
    'verified_at', upn.verified_at,
    'auth_created_at', u.created_at
  ),
  true,
  coalesce(u.created_at, upn.created_at)
from public.user_phone_numbers upn
left join auth.users u on u.id = upn.user_id
where not exists (
  select 1
  from public.phone_signup_events pse
  where pse.user_id = upn.user_id
    and pse.phone_number = upn.phone_number
    and pse.event_type = 'registration_completed'
);
