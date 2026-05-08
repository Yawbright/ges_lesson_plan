-- Replace the referral code generator on projects where 0004 was already applied
-- with the old gen_random_bytes() implementation.

create or replace function public.ensure_referral_code(
  p_user_id uuid,
  p_device_id text default null
)
returns table (code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  select rc.code
  into v_code
  from public.referral_codes rc
  where rc.user_id = p_user_id;

  if v_code is null then
    loop
      v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      begin
        insert into public.referral_codes (user_id, code, referrer_device_id)
        values (p_user_id, v_code, nullif(trim(coalesce(p_device_id, '')), ''));
        exit;
      exception when unique_violation then
        -- Try another code.
      end;
    end loop;
  elsif nullif(trim(coalesce(p_device_id, '')), '') is not null then
    update public.referral_codes
    set referrer_device_id = p_device_id,
        updated_at = now()
    where user_id = p_user_id;
  end if;

  return query select v_code;
end;
$$;

revoke execute on function public.ensure_referral_code(uuid, text) from anon, authenticated;

