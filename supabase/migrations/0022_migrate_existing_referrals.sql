-- Migrate existing referrals from app_user_directory and referral_codes to referrals table

insert into public.referrals (
  referrer_user_id,
  referred_user_id,
  referral_code,
  status,
  referred_email_confirmed,
  referred_email_confirmed_at,
  created_at,
  updated_at
)
select
  rc.user_id as referrer_user_id,
  aud.user_id as referred_user_id,
  rc.code as referral_code,
  'pending' as status,
  aud.email_confirmed_at is not null as referred_email_confirmed,
  aud.email_confirmed_at as referred_email_confirmed_at,
  aud.created_at,
  aud.updated_at
from public.app_user_directory aud
join public.referral_codes rc on upper(trim(aud.invitation_code)) = upper(trim(rc.code))
where 
  aud.invitation_code is not null 
  and trim(aud.invitation_code) != ''
  and rc.user_id != aud.user_id
on conflict (referred_user_id) do nothing;
