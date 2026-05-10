create index if not exists credit_purchases_status_created_idx
  on public.credit_purchases (status, created_at desc);

create index if not exists credit_purchases_status_verified_idx
  on public.credit_purchases (status, verified_at desc)
  where verified_at is not null;

create index if not exists credit_transactions_created_idx
  on public.credit_transactions (created_at desc);

create index if not exists credit_transactions_kind_created_idx
  on public.credit_transactions (kind, created_at desc);

create index if not exists credit_transactions_debits_created_idx
  on public.credit_transactions (created_at desc)
  where amount < 0;

create index if not exists referrals_created_idx
  on public.referrals (created_at desc);

create index if not exists referrals_status_rewarded_idx
  on public.referrals (status, rewarded_at desc)
  where rewarded_at is not null;

create index if not exists app_error_logs_severity_created_idx
  on public.app_error_logs (severity, created_at desc);

create index if not exists app_user_directory_created_idx
  on public.app_user_directory (created_at desc);
