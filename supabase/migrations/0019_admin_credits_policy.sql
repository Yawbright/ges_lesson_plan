-- Add admin read policies for credit tables to allow admin dashboard access

-- Credit transactions table
drop policy if exists "admins read credit transactions" on public.credit_transactions;
create policy "admins read credit transactions"
  on public.credit_transactions for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Credit purchases table
drop policy if exists "admins read credit purchases" on public.credit_purchases;
create policy "admins read credit purchases"
  on public.credit_purchases for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
