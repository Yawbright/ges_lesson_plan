create or replace function public.admin_overview_metrics(p_admin_user_id uuid)
returns table (
  total_users bigint,
  completed_profiles bigint,
  unconfirmed_users bigint,
  revenue_today_subunit bigint,
  revenue_week_subunit bigint,
  revenue_month_subunit bigint,
  revenue_total_subunit bigint,
  successful_payments bigint,
  failed_payments bigint,
  pending_payments bigint,
  credits_sold bigint,
  credits_used bigint,
  outstanding_credits bigint,
  lesson_plans_generated bigint,
  schemes_generated bigint,
  custom_schemes_analyzed bigint,
  errors bigint,
  referral_rewards_this_month bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_start_today timestamptz := v_today::timestamp at time zone 'utc';
  v_start_week timestamptz := (v_today - extract(dow from v_today)::int)::timestamp at time zone 'utc';
  v_start_month timestamptz := date_trunc('month', now() at time zone 'utc') at time zone 'utc';
begin
  if not public.is_admin(p_admin_user_id) then
    raise exception 'Admin access required';
  end if;

  return query
  with successful_purchases as (
    select
      amount_subunit,
      credits,
      coalesce(verified_at, created_at) as paid_at
    from public.credit_purchases
    where status = 'success'
  ),
  debit_transactions as (
    select amount, kind
    from public.credit_transactions
    where amount < 0
  )
  select
    (select count(*) from public.app_user_directory)::bigint,
    (select count(*) from public.teacher_profiles where onboarding_completed = true)::bigint,
    (select count(*) from public.app_user_directory where email_confirmed_at is null)::bigint,
    coalesce((select sum(amount_subunit)::bigint from successful_purchases where paid_at >= v_start_today), 0)::bigint,
    coalesce((select sum(amount_subunit)::bigint from successful_purchases where paid_at >= v_start_week), 0)::bigint,
    coalesce((select sum(amount_subunit)::bigint from successful_purchases where paid_at >= v_start_month), 0)::bigint,
    coalesce((select sum(amount_subunit)::bigint from successful_purchases), 0)::bigint,
    (select count(*) from public.credit_purchases where status = 'success')::bigint,
    (select count(*) from public.credit_purchases where status = 'failed')::bigint,
    (select count(*) from public.credit_purchases where status = 'pending')::bigint,
    coalesce((select sum(credits)::bigint from successful_purchases), 0)::bigint,
    coalesce((select abs(sum(amount))::bigint from debit_transactions), 0)::bigint,
    coalesce((select sum(balance)::bigint from public.user_credit_balances), 0)::bigint,
    (select count(*) from debit_transactions where kind = 'lesson_generation')::bigint,
    (select count(*) from debit_transactions where kind = 'scheme_generation')::bigint,
    (select count(*) from debit_transactions where kind = 'scheme_parsing')::bigint,
    (select count(*) from public.app_error_logs where severity = 'error')::bigint,
    (
      select count(*)
      from public.referrals
      where status = 'rewarded'
        and rewarded_at >= v_start_month
    )::bigint;
end;
$$;

revoke execute on function public.admin_overview_metrics(uuid) from anon, authenticated;
