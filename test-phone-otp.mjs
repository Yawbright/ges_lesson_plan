#!/usr/bin/env node
/**
 * Test script to verify send-phone-otp function
 * Usage: node test-phone-otp.mjs
 */

const SUPABASE_URL = 'https://xzgflafcenfnwiqexxuf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z2ZsYWZjZW5mbildxZXh4dWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY2NDAwMjE1MCwiZXhwIjoxOTk5NjMyMTUwfQ.ZY6wVlL1Ixp-fXJm0wpjVhjmCBVpLYaVJYzcqNlhfn0';

const TEST_PHONE = '0501234567'; // Ghana phone number format

async function testPhoneOtp() {
  console.log('🔍 Testing send-phone-otp function...\n');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-phone-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phoneNumber: TEST_PHONE,
        }),
      }
    );

    console.log('✅ Response status:', response.status);
    console.log('📋 Response headers:');
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });

    const data = await response.json();
    console.log('\n📦 Response body:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Function is working!');
      console.log('OTP sent successfully to:', TEST_PHONE);
    } else {
      console.log('\n❌ Function returned an error');
    }
  } catch (error) {
    console.error('\n❌ Error testing function:');
    console.error(error);
  }
}

testPhoneOtp();
