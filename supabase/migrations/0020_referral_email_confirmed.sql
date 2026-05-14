-- Track email confirmation status for referred users in referrals

alter table public.referrals 
add column if not exists referred_email_confirmed boolean default false,
add column if not exists referred_email_confirmed_at timestamptz;

-- Create trigger to update referred_email_confirmed when referred user confirms email
create or replace function public.update_referral_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and (old.email_confirmed_at is null or old.email_confirmed_at <> new.email_confirmed_at) then
    update public.referrals
    set referred_email_confirmed = true,
        referred_email_confirmed_at = new.email_confirmed_at,
        updated_at = now()
    where referred_user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after update on auth.users
  for each row
  execute function public.update_referral_email_confirmed();
