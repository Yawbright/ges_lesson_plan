-- Editable non-secret app settings used by admin and runtime functions.

insert into public.admin_app_settings (key, value)
values
  ('generated_file_retention', '{"days": 15}'::jsonb),
  ('paystack_mode', '{"mode": "live"}'::jsonb),
  ('parser_backend', '{"provider": "active"}'::jsonb)
on conflict (key) do nothing;

drop policy if exists "authenticated read non-secret app settings" on public.admin_app_settings;
create policy "authenticated read non-secret app settings"
  on public.admin_app_settings for select
  using (auth.role() = 'authenticated');

create or replace function public.app_setting(p_key text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce((select value from public.admin_app_settings where key = p_key), '{}'::jsonb);
$$;

create or replace function public.grant_starter_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_setting jsonb := public.app_setting('starter_credits');
  v_credits int := greatest(0, coalesce((v_setting->>'credits')::int, 5));
  v_active boolean := coalesce((v_setting->>'active')::boolean, true);
begin
  if v_active and v_credits > 0 then
    perform public.add_user_credits(
      new.id,
      v_credits,
      'starter',
      'Starter credits',
      jsonb_build_object('source', 'signup')
    );
  end if;
  return new;
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
  v_setting jsonb := public.app_setting('referral_reward');
  v_reward_credits int := greatest(0, coalesce((v_setting->>'credits')::int, 5));
  v_monthly_limit int := greatest(0, coalesce((v_setting->>'monthly_limit')::int, 5));
  v_active boolean := coalesce((v_setting->>'active')::boolean, true);
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

  if not v_active or v_reward_credits <= 0 then
    update public.referrals
    set status = 'rejected',
        rejection_reason = 'Referral rewards are inactive',
        updated_at = now()
    where id = v_referral.id and status = 'pending';

    return query select false, v_referral.referrer_user_id, 'Referral rewards are inactive';
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

  if v_month_rewards >= v_monthly_limit then
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
    v_reward_credits,
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
