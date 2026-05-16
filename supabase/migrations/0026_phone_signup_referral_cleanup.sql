-- Phone signup cleanup:
-- - accept either legacy invitation_code or new referral_code metadata
-- - sync email confirmation status for legacy email users
-- - lock OTP rows behind service-role edge functions

create or replace function public.enforce_invitation_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation_code text;
  v_code_exists boolean;
begin
  v_invitation_code := nullif(trim(coalesce(
    new.raw_user_meta_data ->> 'invitation_code',
    new.raw_user_meta_data ->> 'referral_code',
    ''
  )), '');

  if v_invitation_code is null then
    raise exception 'Invitation code is required to create an account.';
  end if;

  select exists (
    select 1
    from public.referral_codes
    where upper(code) = upper(v_invitation_code)
  )
  into v_code_exists;

  if not v_code_exists then
    raise exception 'Invitation code is invalid.';
  end if;

  return new;
end;
$$;

update public.app_user_directory aud
set email_confirmed_at = u.email_confirmed_at,
    updated_at = now()
from auth.users u
where aud.user_id = u.id
  and aud.email_confirmed_at is distinct from u.email_confirmed_at;

update public.referrals r
set referred_email_confirmed = (u.email_confirmed_at is not null),
    referred_email_confirmed_at = u.email_confirmed_at,
    updated_at = now()
from auth.users u
where r.referred_user_id = u.id
  and (
    r.referred_email_confirmed is distinct from (u.email_confirmed_at is not null)
    or r.referred_email_confirmed_at is distinct from u.email_confirmed_at
  );

drop policy if exists "users_can_request_otp" on public.phone_auth_requests;
drop policy if exists "public_can_request_otp" on public.phone_auth_requests;
drop policy if exists "users_can_verify_otp" on public.phone_auth_requests;
drop policy if exists "can_read_recent_otp" on public.phone_auth_requests;
