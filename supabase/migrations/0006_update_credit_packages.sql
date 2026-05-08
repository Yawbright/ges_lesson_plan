-- Update Paystack credit packages.
-- Old package rows stay in the table for historical purchase records, but are hidden from checkout.

update public.credit_packages
set active = false
where id in ('starter_20', 'teacher_50', 'school_120');

insert into public.credit_packages (id, name, credits, price_subunit, currency, sort_order, active)
values
  ('starter_10', '10 credits', 10, 500, 'GHS', 10, true),
  ('starter_20_v2', '20 credits', 20, 1000, 'GHS', 20, true),
  ('teacher_40', '40 credits', 40, 2000, 'GHS', 30, true),
  ('school_80', '80 credits', 80, 4000, 'GHS', 40, true),
  ('school_100', '100 credits', 100, 5000, 'GHS', 50, true)
on conflict (id) do update
set name = excluded.name,
    credits = excluded.credits,
    price_subunit = excluded.price_subunit,
    currency = excluded.currency,
    sort_order = excluded.sort_order,
    active = true;
