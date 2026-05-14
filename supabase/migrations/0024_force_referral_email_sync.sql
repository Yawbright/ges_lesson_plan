-- Force sync email confirmation status from auth.users to referrals
-- This runs unconditionally to ensure all records are updated

update public.referrals r
set 
  referred_email_confirmed = (u.email_confirmed_at is not null),
  referred_email_confirmed_at = u.email_confirmed_at,
  updated_at = now()
from auth.users u
where r.referred_user_id = u.id;
