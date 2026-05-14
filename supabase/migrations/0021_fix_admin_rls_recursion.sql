-- Fix infinite recursion in admin_users RLS policies by using security definer function

-- Create a secure function to check if user is admin (bypasses RLS)
create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users 
    where user_id = p_user_id
  );
$$;

-- Drop the problematic policy on admin_users
drop policy if exists "admins can read admin users" on public.admin_users;

-- Create a new policy using the secure function (no recursion)
create policy "admins can read admin users"
  on public.admin_users for select
  using (is_admin());

-- Update the policy on app_error_logs to use the function
drop policy if exists "admins read error logs" on public.app_error_logs;
create policy "admins read error logs"
  on public.app_error_logs for select
  using (is_admin());

-- Update the policy on credit_transactions to use the function
drop policy if exists "admins read credit transactions" on public.credit_transactions;
create policy "admins read credit transactions"
  on public.credit_transactions for select
  using (is_admin());

-- Update the policy on credit_purchases to use the function
drop policy if exists "admins read credit purchases" on public.credit_purchases;
create policy "admins read credit purchases"
  on public.credit_purchases for select
  using (is_admin());

-- Update the policy on referrals to use the function
drop policy if exists "admins read referrals" on public.referrals;
create policy "admins read referrals"
  on public.referrals for select
  using (is_admin());

-- Update the policy on referral_codes to use the function
drop policy if exists "admins read referral codes" on public.referral_codes;
create policy "admins read referral codes"
  on public.referral_codes for select
  using (is_admin());

-- Update the policy on admin_app_settings to use the function  
drop policy if exists "admins read settings" on public.admin_app_settings;
create policy "admins read settings"
  on public.admin_app_settings for select
  using (is_admin());

