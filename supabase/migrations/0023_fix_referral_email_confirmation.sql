-- Fix: Sync actual email confirmation status from auth.users to referrals table

-- Update referrals table with correct email confirmation status from auth.users
update public.referrals r
set 
  referred_email_confirmed = u.email_confirmed_at is not null,
  referred_email_confirmed_at = u.email_confirmed_at,
  updated_at = now()
from auth.users u
where r.referred_user_id = u.id
  and (r.referred_email_confirmed != (u.email_confirmed_at is not null) 
       or r.referred_email_confirmed_at != u.email_confirmed_at);
