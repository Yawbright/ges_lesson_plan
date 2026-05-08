-- Allow uploaded scheme parsing to have its own transaction kind.

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
    'refund',
    'adjustment'
  ));

