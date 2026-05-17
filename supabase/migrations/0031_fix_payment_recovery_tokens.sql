-- Keep payment recovery tokens aligned with text credit package IDs.

alter table if exists public.payment_recovery_tokens
  alter column package_id type text using package_id::text;

alter table if exists public.payment_recovery_tokens
  drop constraint if exists payment_recovery_tokens_package_id_fkey;

alter table if exists public.payment_recovery_tokens
  add constraint payment_recovery_tokens_package_id_fkey
  foreign key (package_id) references public.credit_packages(id);
