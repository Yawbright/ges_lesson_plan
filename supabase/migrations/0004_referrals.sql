-- Referral rewards.

alter table public.credit_transactions
  drop constraint if exists credit_transactions_kind_check;

alter table public.credit_transactions
  add constraint credit_transactions_kind_check
  check (kind in (
    'starter',
    'purchase',
    'lesson_generation',
    'scheme_generation',
    'scheme_parsing',
    'referral_reward',
    'refund',
    'adjustment'
  ));

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  code text not null unique,
  referrer_device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid not null references auth.users(id) on delete cascade unique,
  referral_code text not null,
  referrer_device_id text,
  referred_device_id text,
  referred_ip text,
  referred_user_agent text,
  status text not null default 'pending' check (status in ('pending','rewarded','rejected')),
  rejection_reason text,
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self_referrals check (referrer_user_id <> referred_user_id)
);

create index if not exists referrals_referrer_status_idx
  on public.referrals (referrer_user_id, status, rewarded_at desc);

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;

create policy "owners read own referral code"
  on public.referral_codes for select
  using (auth.uid() = user_id);

create policy "owners read own referral records"
  on public.referrals for select
  using (auth.uid() = referrer_user_id or auth.uid() = referred_user_id);

create or replace function public.ensure_referral_code(
  p_user_id uuid,
  p_device_id text default null
)
returns table (code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  select rc.code
  into v_code
  from public.referral_codes rc
  where rc.user_id = p_user_id;

  if v_code is null then
    loop
      v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      begin
        insert into public.referral_codes (user_id, code, referrer_device_id)
        values (p_user_id, v_code, nullif(trim(coalesce(p_device_id, '')), ''));
        exit;
      exception when unique_violation then
        -- Try another code.
      end;
    end loop;
  elsif nullif(trim(coalesce(p_device_id, '')), '') is not null then
    update public.referral_codes
    set referrer_device_id = p_device_id,
        updated_at = now()
    where user_id = p_user_id;
  end if;

  return query select v_code;
end;
$$;

create or replace function public.apply_referral_code(
  p_referred_user_id uuid,
  p_referral_code text,
  p_referred_device_id text default null,
  p_referred_ip text default null,
  p_referred_user_agent text default null
)
returns table (status text, referrer_user_id uuid, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.referral_codes%rowtype;
  v_existing public.referrals%rowtype;
  v_reason text;
  v_status text;
  v_referrer_user_id uuid;
  v_rejection_reason text;
begin
  select *
  into v_existing
  from public.referrals
  where referred_user_id = p_referred_user_id;

  if found then
    return query select v_existing.status, v_existing.referrer_user_id, v_existing.rejection_reason;
    return;
  end if;

  select *
  into v_code
  from public.referral_codes
  where upper(code) = upper(trim(p_referral_code));

  if not found then
    return query select 'rejected'::text, null::uuid, 'Referral code not found';
    return;
  end if;

  if v_code.user_id = p_referred_user_id then
    v_reason := 'Self referral';
  elsif nullif(v_code.referrer_device_id, '') is not null
    and nullif(trim(coalesce(p_referred_device_id, '')), '') is not null
    and v_code.referrer_device_id = p_referred_device_id then
    v_reason := 'Same device as referrer';
  end if;

  insert into public.referrals (
    referrer_user_id,
    referred_user_id,
    referral_code,
    referrer_device_id,
    referred_device_id,
    referred_ip,
    referred_user_agent,
    status,
    rejection_reason
  )
  values (
    v_code.user_id,
    p_referred_user_id,
    v_code.code,
    v_code.referrer_device_id,
    nullif(trim(coalesce(p_referred_device_id, '')), ''),
    nullif(trim(coalesce(p_referred_ip, '')), ''),
    nullif(trim(coalesce(p_referred_user_agent, '')), ''),
    case when v_reason is null then 'pending' else 'rejected' end,
    v_reason
  )
  returning status, referrer_user_id, rejection_reason
  into v_status, v_referrer_user_id, v_rejection_reason;

  return query select v_status, v_referrer_user_id, v_rejection_reason;
end;
$$;

create or replace function public.reward_referral_if_qualified(
  p_referred_user_id uuid
)
returns table (rewarded boolean, referrer_user_id uuid, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral public.referrals%rowtype;
  v_month_rewards int;
begin
  select *
  into v_referral
  from public.referrals
  where referred_user_id = p_referred_user_id
  for update;

  if not found then
    return query select false, null::uuid, 'No referral';
    return;
  end if;

  if v_referral.status = 'rewarded' then
    return query select false, v_referral.referrer_user_id, 'Already rewarded';
    return;
  end if;

  if v_referral.status = 'rejected' then
    return query select false, v_referral.referrer_user_id, coalesce(v_referral.rejection_reason, 'Rejected');
    return;
  end if;

  select count(*)
  into v_month_rewards
  from public.referrals
  where referrer_user_id = v_referral.referrer_user_id
    and status = 'rewarded'
    and rewarded_at >= date_trunc('month', now());

  if v_month_rewards >= 5 then
    update public.referrals
    set status = 'rejected',
        rejection_reason = 'Monthly referral reward limit reached',
        updated_at = now()
    where id = v_referral.id;

    return query select false, v_referral.referrer_user_id, 'Monthly referral reward limit reached';
    return;
  end if;

  perform public.add_user_credits(
    v_referral.referrer_user_id,
    5,
    'referral_reward',
    'Referral reward',
    jsonb_build_object(
      'referral_id', v_referral.id,
      'referred_user_id', v_referral.referred_user_id
    )
  );

  update public.referrals
  set status = 'rewarded',
      qualified_at = now(),
      rewarded_at = now(),
      updated_at = now()
  where id = v_referral.id;

  return query select true, v_referral.referrer_user_id, null::text;
end;
$$;

revoke execute on function public.ensure_referral_code(uuid, text) from anon, authenticated;
revoke execute on function public.apply_referral_code(uuid, text, text, text, text) from anon, authenticated;
revoke execute on function public.reward_referral_if_qualified(uuid) from anon, authenticated;
