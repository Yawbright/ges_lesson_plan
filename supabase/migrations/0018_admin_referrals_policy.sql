-- Add admin read policies for referrals and referral_codes tables to allow admin dashboard access

-- Referrals table
drop policy if exists "admins read referrals" on public.referrals;
create policy "admins read referrals"
  on public.referrals for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Referral codes table
drop policy if exists "admins read referral codes" on public.referral_codes;
create policy "admins read referral codes"
  on public.referral_codes for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
