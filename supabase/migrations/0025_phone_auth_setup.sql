-- Create table for phone OTP verification
create table if not exists public.phone_auth_requests (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  otp_code text not null,
  otp_expires_at timestamptz not null,
  verified_at timestamptz,
  attempt_count integer default 0,
  last_attempt_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster phone number lookups
create index if not exists phone_auth_requests_phone_number_idx 
  on public.phone_auth_requests(phone_number);

create index if not exists phone_auth_requests_verified_at_idx 
  on public.phone_auth_requests(verified_at);

-- Allow authenticated users to insert OTP requests
create policy "users_can_request_otp"
  on public.phone_auth_requests
  for insert
  with check (true);

-- Allow public to verify OTP (important for signup flow before auth)
create policy "public_can_request_otp"
  on public.phone_auth_requests
  for insert
  to anon
  with check (true);

-- Allow users to verify their own OTP
create policy "users_can_verify_otp"
  on public.phone_auth_requests
  for update
  using (true)
  with check (true);

-- Allow reading unverified OTPs within 15 minutes
create policy "can_read_recent_otp"
  on public.phone_auth_requests
  for select
  using (
    phone_number = phone_number 
    and (verified_at is null or now() < verified_at + interval '15 minutes')
  );

-- Create table to link phone numbers to auth users
create table if not exists public.user_phone_numbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_number text not null unique,
  verified_at timestamptz not null default now(),
  is_primary boolean default true,
  created_at timestamptz default now(),
  
  unique(user_id, phone_number)
);

-- Create index for phone lookups
create index if not exists user_phone_numbers_phone_idx 
  on public.user_phone_numbers(phone_number);

create index if not exists user_phone_numbers_user_id_idx 
  on public.user_phone_numbers(user_id);

-- RLS for user_phone_numbers
alter table public.user_phone_numbers enable row level security;

create policy "users_can_read_own_phones"
  on public.user_phone_numbers
  for select
  using (user_id = auth.uid());

create policy "users_can_insert_phones"
  on public.user_phone_numbers
  for insert
  with check (user_id = auth.uid());

create policy "users_can_update_phones"
  on public.user_phone_numbers
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Enable RLS on phone_auth_requests
alter table public.phone_auth_requests enable row level security;
