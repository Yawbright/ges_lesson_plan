import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xzgflafcenfnwiqexxuf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Check referrals
const { data: referrals } = await supabase
  .from('referrals')
  .select('id, referred_user_id, referred_email_confirmed, referred_email_confirmed_at, status')
  .limit(5);

console.log('Referrals sample:');
console.log(JSON.stringify(referrals, null, 2));

// Check auth users
const { data: { users } } = await supabase.auth.admin.listUsers();
const userSample = users.slice(0, 5).map(u => ({
  id: u.id,
  email: u.email,
  email_confirmed_at: u.email_confirmed_at
}));

console.log('\nAuth users sample:');
console.log(JSON.stringify(userSample, null, 2));
