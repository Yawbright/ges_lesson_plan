-- Reserve the founder/base invitation code.
-- This maps KHERKHELLY to the existing founder account if the account exists.

do $$
declare
  v_founder_user_id uuid;
begin
  select id
  into v_founder_user_id
  from auth.users
  where lower(email) = 'sesorkelly@gmail.com'
  limit 1;

  if v_founder_user_id is null then
    raise notice 'Founder account sesorkelly@gmail.com not found. Sign up once, then rerun this migration or insert the referral code manually.';
    return;
  end if;

  delete from public.referral_codes
  where upper(code) = 'KHERKHELLY'
    and user_id <> v_founder_user_id;

  insert into public.referral_codes (user_id, code)
  values (v_founder_user_id, 'KHERKHELLY')
  on conflict (user_id) do update
  set code = excluded.code,
      updated_at = now();
end;
$$;
