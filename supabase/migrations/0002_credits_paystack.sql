-- Credits and Paystack payments.
-- Run with: supabase db push

create table if not exists public.credit_packages (
  id text primary key,
  name text not null,
  credits int not null check (credits > 0),
  price_subunit int not null check (price_subunit > 0),
  currency text not null default 'GHS',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.credit_packages (id, name, credits, price_subunit, currency, sort_order)
values
  ('starter_20', '20 credits', 20, 2000, 'GHS', 10),
  ('teacher_50', '50 credits', 50, 4500, 'GHS', 20),
  ('school_120', '120 credits', 120, 9500, 'GHS', 30)
on conflict (id) do update
set name = excluded.name,
    credits = excluded.credits,
    price_subunit = excluded.price_subunit,
    currency = excluded.currency,
    sort_order = excluded.sort_order,
    active = true;

create table if not exists public.user_credit_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  balance_after int not null check (balance_after >= 0),
  kind text not null check (kind in ('starter','purchase','lesson_generation','scheme_generation','scheme_parsing','refund','adjustment')),
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_transactions_user_idx
  on public.credit_transactions (user_id, created_at desc);

create table if not exists public.credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id text not null references public.credit_packages(id),
  credits int not null check (credits > 0),
  amount_subunit int not null check (amount_subunit > 0),
  currency text not null default 'GHS',
  paystack_reference text not null unique,
  paystack_access_code text,
  authorization_url text,
  status text not null default 'pending' check (status in ('pending','success','failed','abandoned')),
  verified_at timestamptz,
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists credit_purchases_user_idx
  on public.credit_purchases (user_id, created_at desc);

alter table public.credit_packages enable row level security;
alter table public.user_credit_balances enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.credit_purchases enable row level security;

create policy "anyone can read active credit packages"
  on public.credit_packages for select
  using (active = true);

create policy "owners read own credit balance"
  on public.user_credit_balances for select
  using (auth.uid() = user_id);

create policy "owners read own credit transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

create policy "owners read own credit purchases"
  on public.credit_purchases for select
  using (auth.uid() = user_id);

create or replace function public.add_user_credits(
  p_user_id uuid,
  p_amount int,
  p_kind text,
  p_description text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (balance int, transaction_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
  v_transaction_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'Credit amount must be positive';
  end if;

  insert into public.user_credit_balances (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.user_credit_balances
  set balance = user_credit_balances.balance + p_amount,
      updated_at = now()
  where user_id = p_user_id
  returning user_credit_balances.balance into v_balance;

  insert into public.credit_transactions (user_id, amount, balance_after, kind, description, metadata)
  values (p_user_id, p_amount, v_balance, p_kind, p_description, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_transaction_id;

  return query select v_balance, v_transaction_id;
end;
$$;

create or replace function public.consume_user_credits(
  p_user_id uuid,
  p_amount int,
  p_kind text,
  p_description text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (ok boolean, balance int, transaction_id uuid, error text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance int;
  v_transaction_id uuid;
begin
  if p_amount <= 0 then
    return query select false, 0, null::uuid, 'Credit amount must be positive';
    return;
  end if;

  insert into public.user_credit_balances (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select b.balance
  into v_balance
  from public.user_credit_balances b
  where b.user_id = p_user_id
  for update;

  if v_balance < p_amount then
    return query select false, v_balance, null::uuid, 'INSUFFICIENT_CREDITS';
    return;
  end if;

  update public.user_credit_balances
  set balance = user_credit_balances.balance - p_amount,
      updated_at = now()
  where user_id = p_user_id
  returning user_credit_balances.balance into v_balance;

  insert into public.credit_transactions (user_id, amount, balance_after, kind, description, metadata)
  values (p_user_id, -p_amount, v_balance, p_kind, p_description, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_transaction_id;

  return query select true, v_balance, v_transaction_id, null::text;
end;
$$;

create or replace function public.grant_starter_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.add_user_credits(
    new.id,
    5,
    'starter',
    'Starter credits',
    jsonb_build_object('source', 'signup')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_starter_credits on auth.users;
create trigger on_auth_user_created_grant_starter_credits
  after insert on auth.users
  for each row execute procedure public.grant_starter_credits();

create or replace function public.finalize_credit_purchase(
  p_reference text,
  p_raw_response jsonb default '{}'::jsonb
)
returns table (user_id uuid, credits int, balance int, credited boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.credit_purchases%rowtype;
  v_balance int;
begin
  select *
  into v_purchase
  from public.credit_purchases
  where paystack_reference = p_reference
  for update;

  if not found then
    raise exception 'Purchase not found';
  end if;

  if v_purchase.status = 'success' then
    select b.balance
    into v_balance
    from public.user_credit_balances b
    where b.user_id = v_purchase.user_id;

    return query select v_purchase.user_id, v_purchase.credits, coalesce(v_balance, 0), false;
    return;
  end if;

  update public.credit_purchases
  set status = 'success',
      verified_at = now(),
      updated_at = now(),
      raw_response = coalesce(p_raw_response, '{}'::jsonb)
  where id = v_purchase.id;

  select added.balance
  into v_balance
  from public.add_user_credits(
    v_purchase.user_id,
    v_purchase.credits,
    'purchase',
    'Paystack credit purchase',
    jsonb_build_object(
      'purchase_id', v_purchase.id,
      'package_id', v_purchase.package_id,
      'reference', v_purchase.paystack_reference
    )
  ) as added;

  return query select v_purchase.user_id, v_purchase.credits, v_balance, true;
end;
$$;

insert into public.user_credit_balances (user_id, balance)
select id, 5
from auth.users
on conflict (user_id) do nothing;

insert into public.credit_transactions (user_id, amount, balance_after, kind, description, metadata)
select id, 5, 5, 'starter', 'Starter credits', jsonb_build_object('source', 'migration')
from auth.users u
where not exists (
  select 1
  from public.credit_transactions t
  where t.user_id = u.id
    and t.kind = 'starter'
);

revoke execute on function public.add_user_credits(uuid, int, text, text, jsonb) from anon, authenticated;
revoke execute on function public.consume_user_credits(uuid, int, text, text, jsonb) from anon, authenticated;
revoke execute on function public.finalize_credit_purchase(text, jsonb) from anon, authenticated;
