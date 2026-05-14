-- Add admin read policy for referrals table to allow admin dashboard access

drop policy if exists "admins read referrals" on public.referrals;

create policy "admins read referrals"
  on public.referrals for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
