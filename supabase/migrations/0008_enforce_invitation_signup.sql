-- Enforce invitation-only signups at the database layer.
-- Supabase Auth stores signup metadata in auth.users.raw_user_meta_data.

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
  v_invitation_code := nullif(trim(coalesce(new.raw_user_meta_data ->> 'invitation_code', '')), '');

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

drop trigger if exists enforce_invitation_signup_before_auth_user_insert on auth.users;
create trigger enforce_invitation_signup_before_auth_user_insert
  before insert on auth.users
  for each row execute function public.enforce_invitation_signup();
