import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateGhanaPhoneNumber } from '../_shared/phone.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface VerifyPhoneOtpRequest {
  phoneNumber: string;
  otp: string;
  email?: string;
  password?: string;
  referralCode?: string;
  deviceId?: string;
}

async function logPhoneSignupEvent(
  supabase: any,
  input: {
    phoneNumber: string;
    eventType: string;
    status: string;
    otpRequestId?: string | null;
    userId?: string | null;
    referralCode?: string | null;
    providerMessage?: string;
    metadata?: Record<string, unknown>;
  },
) {
  try {
    const { error } = await supabase.from('phone_signup_events').insert({
      phone_number: input.phoneNumber,
      event_type: input.eventType,
      status: input.status,
      otp_request_id: input.otpRequestId ?? null,
      user_id: input.userId ?? null,
      referral_code: input.referralCode ?? null,
      provider: 'app',
      provider_message: input.providerMessage ?? null,
      metadata: input.metadata ?? {},
      legacy: false,
    });
    if (error) console.error('[phone-signup-event] Insert error:', error.message);
  } catch (error) {
    console.error('[phone-signup-event] Insert exception:', error);
  }
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
    const { phoneNumber, otp, email, password, referralCode, deviceId } = (await req.json()) as VerifyPhoneOtpRequest;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!phoneNumber?.trim() || !otp?.trim()) {
      await logPhoneSignupEvent(supabase, {
        phoneNumber: phoneNumber?.trim() || 'unknown',
        eventType: 'otp_verify_failed',
        status: 'failed',
        referralCode: referralCode?.trim().toUpperCase() || null,
        providerMessage: 'Phone number and OTP are required',
        metadata: { reason: 'missing_phone_or_otp' },
      });
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required', success: false }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const phoneValidation = validateGhanaPhoneNumber(phoneNumber);
    if (!phoneValidation.valid || !phoneValidation.normalized) {
      await logPhoneSignupEvent(supabase, {
        phoneNumber: phoneNumber.trim(),
        eventType: 'otp_verify_failed',
        status: 'failed',
        referralCode: referralCode?.trim().toUpperCase() || null,
        providerMessage: phoneValidation.error ?? 'Invalid phone number format',
        metadata: { reason: 'invalid_phone_number' },
      });
      return new Response(
        JSON.stringify({ error: phoneValidation.error ?? 'Invalid phone number format', success: false }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formattedPhone = phoneValidation.normalized;
    console.log('[verify-phone-otp] Looking up OTP for phone:', formattedPhone);
    await logPhoneSignupEvent(supabase, {
      phoneNumber: formattedPhone,
      eventType: 'otp_verify_attempted',
      status: 'info',
      referralCode: referralCode?.trim().toUpperCase() || null,
      providerMessage: 'User submitted OTP for verification',
    });

    // Find OTP request
    const { data: otpRequests, error: queryError } = await supabase
      .from('phone_auth_requests')
      .select('*')
      .eq('phone_number', formattedPhone)
      .is('verified_at', null)
      .gt('otp_expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (queryError) {
      console.error('[Query Error]', queryError);
      await logPhoneSignupEvent(supabase, {
        phoneNumber: formattedPhone,
        eventType: 'otp_verify_failed',
        status: 'failed',
        referralCode: referralCode?.trim().toUpperCase() || null,
        providerMessage: 'Failed to query OTP request',
        metadata: { reason: 'otp_query_failed', database_error: queryError.message },
      });
      return new Response(
        JSON.stringify({ error: 'Failed to verify OTP', success: false }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!otpRequests || otpRequests.length === 0) {
      await logPhoneSignupEvent(supabase, {
        phoneNumber: formattedPhone,
        eventType: 'otp_verify_failed',
        status: 'failed',
        referralCode: referralCode?.trim().toUpperCase() || null,
        providerMessage: 'No valid OTP request found',
        metadata: { reason: 'missing_or_expired_otp' },
      });
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

      await logPhoneSignupEvent(supabase, {
        phoneNumber: formattedPhone,
        eventType: 'otp_verify_failed',
        status: 'failed',
        otpRequestId: otpRecord.id,
        referralCode: referralCode?.trim().toUpperCase() || null,
        providerMessage: 'Invalid OTP entered',
        metadata: { reason: 'invalid_otp', attempt_count: (otpRecord.attempt_count || 0) + 1 },
      });

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
      .eq('phone_number', formattedPhone)
      .limit(1);

    let userId: string;

    const isExistingPhoneUser = Boolean(existingPhoneUser && existingPhoneUser.length > 0);

    if (isExistingPhoneUser && existingPhoneUser?.[0]) {
      // User already exists, just verify the OTP
      userId = existingPhoneUser[0].user_id;
    } else {
      // Create new user with phone number
      if (!password || password.length < 6) {
        await logPhoneSignupEvent(supabase, {
          phoneNumber: formattedPhone,
          eventType: 'otp_verify_failed',
          status: 'failed',
          otpRequestId: otpRecord.id,
          referralCode: referralCode?.trim().toUpperCase() || null,
          providerMessage: 'Password must be at least 6 characters',
          metadata: { reason: 'password_required_after_otp' },
        });
        return new Response(
          JSON.stringify({
            error: 'Password must be at least 6 characters',
            success: false,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create auth user with email if provided, otherwise use phone-based email
      const userEmail = email?.trim().toLowerCase() || `phone_${formattedPhone}@local.lessonplanner`;
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          phone_number: formattedPhone,
          signup_method: email ? 'email_and_phone' : 'phone',
          invitation_code: referralCode?.trim().toUpperCase() || null,
          referral_code: referralCode?.trim().toUpperCase() || null,
        },
      });

      if (authError) {
        console.error('[Auth Error]', authError);
        await logPhoneSignupEvent(supabase, {
          phoneNumber: formattedPhone,
          eventType: 'registration_failed',
          status: 'failed',
          otpRequestId: otpRecord.id,
          referralCode: referralCode?.trim().toUpperCase() || null,
          providerMessage: authError.message || 'Failed to create user account',
          metadata: { reason: 'auth_user_creation_failed', email: userEmail },
        });
        return new Response(
          JSON.stringify({
            error: authError.message || 'Failed to create user account',
            success: false,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      userId = authData.user.id;

      // Handle referral code after phone OTP verification. Phone verification makes
      // the referred account active immediately, so the referral can be rewarded here.
      if (referralCode) {
        const { data: referralResult, error: referralError } = await supabase.rpc('apply_referral_code', {
          p_referred_user_id: userId,
          p_referral_code: referralCode.trim().toUpperCase(),
          p_referred_device_id: deviceId ?? null,
          p_referred_ip:
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('cf-connecting-ip') ||
            null,
          p_referred_user_agent: req.headers.get('user-agent'),
        });

        if (referralError) {
          console.error('[Referral Error]', referralError);
          await logPhoneSignupEvent(supabase, {
            phoneNumber: formattedPhone,
            eventType: 'registration_failed',
            status: 'failed',
            otpRequestId: otpRecord.id,
            userId,
            referralCode: referralCode.trim().toUpperCase(),
            providerMessage: referralError.message || 'Failed to apply referral code',
            metadata: { reason: 'referral_apply_failed' },
          });
          return new Response(
            JSON.stringify({
              error: referralError.message || 'Failed to apply referral code',
              success: false,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const appliedReferral = Array.isArray(referralResult) ? referralResult[0] : referralResult;
        if (appliedReferral?.status === 'pending') {
          const { error: rewardError } = await supabase.rpc('reward_referral_if_qualified', {
            p_referred_user_id: userId,
          });
          if (rewardError) {
            console.error('[Referral Reward Error]', rewardError);
            await logPhoneSignupEvent(supabase, {
              phoneNumber: formattedPhone,
              eventType: 'registration_failed',
              status: 'failed',
              otpRequestId: otpRecord.id,
              userId,
              referralCode: referralCode.trim().toUpperCase(),
              providerMessage: rewardError.message || 'Failed to grant referral reward',
              metadata: { reason: 'referral_reward_failed' },
            });
            return new Response(
              JSON.stringify({
                error: rewardError.message || 'Failed to grant referral reward',
                success: false,
              }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    }

    // Link phone number to user
    const { error: phoneError } = await supabase.from('user_phone_numbers').upsert(
      {
        user_id: userId,
        phone_number: formattedPhone,
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

    await logPhoneSignupEvent(supabase, {
      phoneNumber: formattedPhone,
      eventType: 'otp_verified',
      status: 'success',
      otpRequestId: otpRecord.id,
      userId,
      referralCode: referralCode?.trim().toUpperCase() || null,
      providerMessage: 'Phone OTP verified successfully',
      metadata: { existing_phone_user: isExistingPhoneUser },
    });

    if (!isExistingPhoneUser) {
      await logPhoneSignupEvent(supabase, {
        phoneNumber: formattedPhone,
        eventType: 'registration_completed',
        status: 'success',
        otpRequestId: otpRecord.id,
        userId,
        referralCode: referralCode?.trim().toUpperCase() || null,
        providerMessage: 'Phone signup flow completed',
        metadata: { existing_phone_user: false },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Phone number verified successfully',
        user: {
          id: userId,
          phone_number: formattedPhone,
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
