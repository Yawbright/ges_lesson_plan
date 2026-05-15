import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface VerifyPhoneOtpRequest {
  phoneNumber: string;
  otp: string;
  email?: string;
  password?: string;
  referralCode?: string;
}

interface VerifyPhoneOtpResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    phone_number: string;
  };
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { phoneNumber, otp, email, password, referralCode } = (await req.json()) as VerifyPhoneOtpRequest;

    if (!phoneNumber?.trim() || !otp?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required', success: false }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean phone number
    const cleanedPhone = phoneNumber.replace(/\D/g, '');

    // Find OTP request
    const { data: otpRequests, error: queryError } = await supabase
      .from('phone_auth_requests')
      .select('*')
      .eq('phone_number', cleanedPhone)
      .is('verified_at', null)
      .gt('otp_expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (queryError) {
      console.error('[Query Error]', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify OTP', success: false }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!otpRequests || otpRequests.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No valid OTP request found. Please request a new OTP.',
          success: false,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const otpRecord = otpRequests[0];

    // Check if OTP is correct
    if (otpRecord.otp_code !== otp.trim()) {
      // Increment attempt count
      await supabase
        .from('phone_auth_requests')
        .update({
          attempt_count: (otpRecord.attempt_count || 0) + 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', otpRecord.id);

      return new Response(
        JSON.stringify({
          error: 'Invalid OTP. Please try again.',
          success: false,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if phone number already has an account
    const { data: existingPhoneUser } = await supabase
      .from('user_phone_numbers')
      .select('user_id')
      .eq('phone_number', cleanedPhone)
      .limit(1);

    let userId: string;

    if (existingPhoneUser && existingPhoneUser.length > 0) {
      // User already exists, just verify the OTP
      userId = existingPhoneUser[0].user_id;
    } else {
      // Create new user with phone number
      if (!password || password.length < 6) {
        return new Response(
          JSON.stringify({
            error: 'Password must be at least 6 characters',
            success: false,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create auth user with email if provided, otherwise use phone-based email
      const userEmail = email?.trim().toLowerCase() || `phone_${cleanedPhone}@local.lessonplanner`;
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          phone_number: cleanedPhone,
          signup_method: email ? 'email_and_phone' : 'phone',
          referral_code: referralCode?.trim().toUpperCase() || null,
        },
      });

      if (authError) {
        console.error('[Auth Error]', authError);
        return new Response(
          JSON.stringify({
            error: authError.message || 'Failed to create user account',
            success: false,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      userId = authData.user.id;

      // Handle referral code if provided
      if (referralCode) {
        const { data: referralCodeData } = await supabase
          .from('referral_codes')
          .select('user_id')
          .eq('code', referralCode.trim().toUpperCase())
          .limit(1);

        if (referralCodeData && referralCodeData.length > 0) {
          // Create referral record - email confirmation is skipped since email_confirm=true
          await supabase.from('referrals').insert({
            referrer_user_id: referralCodeData[0].user_id,
            referred_user_id: userId,
            referral_code: referralCode.trim().toUpperCase(),
            referred_email: email?.trim().toLowerCase(),
            status: 'pending',
            referred_email_confirmed: true, // Email confirmation is skipped
          });
        }
      }
    }

    // Link phone number to user
    const { error: phoneError } = await supabase.from('user_phone_numbers').upsert(
      {
        user_id: userId,
        phone_number: cleanedPhone,
        verified_at: new Date().toISOString(),
        is_primary: true,
      },
      { onConflict: 'user_id,phone_number' }
    );

    if (phoneError) {
      console.error('[Phone Link Error]', phoneError);
      // Don't fail if phone linking fails - user is already created
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('phone_auth_requests')
      .update({
        verified_at: new Date().toISOString(),
      })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('[Update Error]', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Phone number verified successfully',
        user: {
          id: userId,
          phone_number: cleanedPhone,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Request Error]', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        success: false,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
