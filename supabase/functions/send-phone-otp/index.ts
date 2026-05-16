import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatPhoneForArkesel } from '../_shared/phone.ts'; // ✅ Use shared utility

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const arkeselApiKey = Deno.env.get('ARKESEL_API_KEY') || '';

interface SendPhoneOtpRequest {
  phoneNumber: string;
}

interface SendPhoneOtpResponse {
  success: boolean;
  message: string;
  otpId?: string;
  expiresIn?: number;
}

// Generate random 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate phone number (basic validation)
function validatePhoneNumber(phone: string): boolean {
  // Accept various formats: +233XXXXXXXXX, 0XXXXXXXXX, 233XXXXXXXXX, etc.
  const formatted = formatPhoneForArkesel(phone);
  const isValid = formatted !== null;
  console.log('[validatePhoneNumber] Input:', phone, '-> Formatted:', formatted, '-> Valid:', isValid);
  return isValid;
}

// Send SMS via Arkesel API
async function sendViaArkesel(phoneNumber: string, otp: string, message: string): Promise<boolean> {
  try {
    console.log('[Arkesel] Sending SMS to:', phoneNumber);
    console.log('[Arkesel] Using API Key:', arkeselApiKey ? 'Present' : 'Missing');
    
    // Arkesel API uses GET with query parameters
    const params = new URLSearchParams({
      action: 'send-sms',
      api_key: arkeselApiKey,
      to: phoneNumber,
      from: 'LessonPlan', // Sender ID
      sms: message,
      response: 'json', // Request JSON response
    });
    
    const arkeselUrl = `https://sms.arkesel.com/sms/api?${params.toString()}`;
    console.log('[Arkesel] Sending to:', 'https://sms.arkesel.com/sms/api?...');
    console.log('[Arkesel] With phone:', phoneNumber);
    
    // ✅ Add 15-second timeout for Arkesel API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    let response;
    try {
      response = await fetch(arkeselUrl, {
        method: 'GET',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    console.log('[Arkesel] Response status:', response.status);
    
    const text = await response.text();
    console.log('[Arkesel] Raw response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('[Arkesel] Failed to parse response as JSON:', text);
      return false;
    }
    
    console.log('[Arkesel] Parsed response:', JSON.stringify(data));
    
    // Arkesel returns success when code is "ok"
    // Sample success: {"code":"ok","message":"Successfully Sent","balance":8,"main_balance":0.165,"user":"Kekeli Torkpo"}
    const success = response.ok && data.code === 'ok';
    
    console.log('[Arkesel] Success determination:', {
      statusCode: response.status,
      responseOk: response.ok,
      dataCode: data.code,
      message: data.message,
      final: success
    });
    
    return success;
  } catch (error) {
    console.error('[Arkesel Error]', error);
    console.error('[Arkesel Error Message]', error instanceof Error ? error.message : String(error));
    console.error('[Arkesel Error Stack]', error instanceof Error ? error.stack : 'No stack');
    return false;
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
    return new Response(JSON.stringify({ error: 'Method not allowed', success: false }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    console.log('[send-phone-otp] Request received');
    
    // Check if ARKESEL_API_KEY is set
    if (!arkeselApiKey?.trim()) {
      console.error('[send-phone-otp] ARKESEL_API_KEY is not configured');
      return new Response(
        JSON.stringify({
          error: 'SMS service is not configured. Please contact support. (Missing ARKESEL_API_KEY)',
          success: false,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const body = await req.json();
    console.log('[send-phone-otp] Request body:', { phoneNumber: body?.phoneNumber ? '***' : 'missing' });
    
    const { phoneNumber } = body as SendPhoneOtpRequest;

    if (!phoneNumber?.trim()) {
      console.warn('[send-phone-otp] Missing phone number');
      return new Response(
        JSON.stringify({ error: 'Phone number is required', success: false }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!validatePhoneNumber(phoneNumber)) {
      console.warn('[send-phone-otp] Invalid phone number format:', phoneNumber);
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format', success: false }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('[send-phone-otp] Supabase client initialized');

    // Format phone number properly for Arkesel
    const formattedPhone = formatPhoneForArkesel(phoneNumber);
    if (!formattedPhone) {
      console.error('[send-phone-otp] Could not format phone number:', phoneNumber);
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format', success: false }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('[send-phone-otp] Formatted phone for Arkesel:', formattedPhone);

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log('[send-phone-otp] Generated OTP:', otp, 'for phone:', formattedPhone);

    // Send SMS via Arkesel FIRST (before database operations)
    console.log('[send-phone-otp] Sending SMS via Arkesel...');
    const smsMessage = `Your verification code is: ${otp}\n\nValid for 15 minutes.`;
    const sendSuccess = await sendViaArkesel(formattedPhone, otp, smsMessage);
    
    console.log('[send-phone-otp] Arkesel send result:', sendSuccess);

    if (!sendSuccess) {
      console.error('[send-phone-otp] Arkesel SMS send failed');
      return new Response(
        JSON.stringify({
          error: 'Failed to send SMS. Please check your phone number and try again.',
          success: false,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('[send-phone-otp] SMS sent successfully by Arkesel! Now storing OTP in database');
    console.log('[send-phone-otp] OTP to store:', otp, 'Phone:', formattedPhone, 'Expires:', expiresAt.toISOString());

    // Store OTP in database (use formatted phone number with country code)
    const { data, error } = await supabase.from('phone_auth_requests').insert({
      phone_number: formattedPhone,
      otp_code: otp,
      otp_expires_at: expiresAt.toISOString(),
      attempt_count: 0,
    });

    if (error) {
      console.error('[send-phone-otp] DB Insert Error:', error);
      console.error('[send-phone-otp] Error details:', JSON.stringify(error));
      return new Response(
        JSON.stringify({
          error: 'Failed to create OTP request in database: ' + (error?.message || 'Unknown error'),
          success: false,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('[send-phone-otp] OTP stored successfully in database');
    console.log('[send-phone-otp] Inserted data:', JSON.stringify(data));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully to your phone',
        otpId: data?.[0]?.id,
        expiresIn: 900,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error) {
    console.error('[send-phone-otp] Catch error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: `Internal server error: ${errorMessage}`,
        success: false,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
