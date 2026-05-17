-- Idempotent credit refunds for failed generation/parsing requests.

create or replace function public.refund_credit_transaction(
  p_original_transaction_id uuid,
  p_description text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (
  ok boolean,
  balance int,
  transaction_id uuid,
  already_refunded boolean,
  error text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_original public.credit_transactions%rowtype;
  v_existing public.credit_transactions%rowtype;
  v_balance int;
  v_transaction_id uuid;
begin
  select *
  into v_original
  from public.credit_transactions
  where id = p_original_transaction_id
  for update;

  if not found then
    return query select false, 0, null::uuid, false, 'ORIGINAL_TRANSACTION_NOT_FOUND';
    return;
  end if;

  if v_original.amount >= 0 then
    return query select false, v_original.balance_after, null::uuid, false, 'ORIGINAL_TRANSACTION_NOT_DEBIT';
    return;
  end if;

  select *
  into v_existing
  from public.credit_transactions
  where user_id = v_original.user_id
    and kind = 'refund'
    and metadata->>'originalTransactionId' = p_original_transaction_id::text
  order by created_at asc
  limit 1;

  if found then
    return query select true, v_existing.balance_after, v_existing.id, true, null::text;
    return;
  end if;

  insert into public.user_credit_balances (user_id, balance)
  values (v_original.user_id, 0)
  on conflict (user_id) do nothing;

  update public.user_credit_balances
  set balance = user_credit_balances.balance + abs(v_original.amount),
      updated_at = now()
  where user_id = v_original.user_id
  returning user_credit_balances.balance into v_balance;

  insert into public.credit_transactions (user_id, amount, balance_after, kind, description, metadata)
  values (
    v_original.user_id,
    abs(v_original.amount),
    v_balance,
    'refund',
    p_description,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('originalTransactionId', p_original_transaction_id)
  )
  returning id into v_transaction_id;

  return query select true, v_balance, v_transaction_id, false, null::text;
end;
$$;

revoke execute on function public.refund_credit_transaction(uuid, text, jsonb) from anon, authenticated;
