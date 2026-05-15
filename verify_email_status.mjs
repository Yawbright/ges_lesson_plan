import { createClient } from '@supabase/supabase-js';

const url = 'https://xzgflafcenfnwiqexxuf.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY env var not set');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

console.log('🔍 Checking email confirmation status in database...\n');

// Get referrals with email status
const { data: referrals, error: refError } = await supabase
  .from('referrals')
  .select('id, referred_user_id, referred_email_confirmed, referred_email_confirmed_at, status')
  .limit(10);

if (refError) {
  console.error('❌ Error loading referrals:', refError);
  process.exit(1);
}

console.log(`Found ${referrals.length} referrals:\n`);

// Get corresponding auth users
const userIds = referrals.map(r => r.referred_user_id).filter(Boolean);
const { data: { users } } = await supabase.auth.admin.listUsers();

const userMap = new Map();
users.forEach(u => userMap.set(u.id, u));

console.log('COMPARISON: Referrals Table vs Auth.Users Table\n');
console.log('─'.repeat(100));

referrals.forEach(ref => {
  const user = userMap.get(ref.referred_user_id);
  const authConfirmed = user?.email_confirmed_at ? 'YES' : 'NO';
  const refConfirmed = ref.referred_email_confirmed ? 'YES' : 'NO';
  const match = authConfirmed === refConfirmed ? '✓' : '❌';
  
  console.log(`${match} ID: ${ref.referred_user_id}`);
  console.log(`  Referrals table: confirmed=${refConfirmed}, date=${ref.referred_email_confirmed_at || 'null'}`);
  console.log(`  Auth users table: confirmed=${authConfirmed}, date=${user?.email_confirmed_at || 'null'}`);
  console.log(`  Status: ${ref.status}`);
  console.log();
});
