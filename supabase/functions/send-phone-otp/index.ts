import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Format phone number for Arkesel (must be 233XXXXXXXXX format)
function formatPhoneForArkesel(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0 (local format), replace with 233 (country code)
  if (cleaned.startsWith('0')) {
    return '233' + cleaned.substring(1);
  }
  
  // If already has country code (233), return as is
  if (cleaned.startsWith('233')) {
    return cleaned;
  }
  
  // If no country code, assume Ghana (233) and prepend
  if (cleaned.length === 9) {
    return '233' + cleaned;
  }
  
  return null;
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
    
    const payload = {
      api_key: arkeselApiKey,
      sms: message,
      recipients: phoneNumber,
    };
    
    console.log('[Arkesel] Payload:', JSON.stringify({ ...payload, api_key: '***' }));
    
    const response = await fetch('https://sms.arkesel.com/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[Arkesel] Response status:', response.status);
    
    let data;
    const text = await response.text();
    console.log('[Arkesel] Raw response:', text);
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('[Arkesel] Failed to parse response as JSON:', text);
      return false;
    }
    
    console.log('[Arkesel] Parsed response:', JSON.stringify(data));
    
    // Check for success indicators - Arkesel returns different formats
    const success = 
      response.ok || 
      data.status === 'success' || 
      data.code === 200 || 
      data.code === '200' ||
      data.success === true;
    
    console.log('[Arkesel] Success determination:', {
      ok: response.ok,
      statusCode: response.status,
      dataStatus: data.status,
      dataCode: data.code,
      dataSuccess: data.success,
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

    console.log('[send-phone-otp] SMS sent successfully, storing OTP in database');

    // Store OTP in database (use formatted phone number with country code)
    const { data, error } = await supabase.from('phone_auth_requests').insert({
      phone_number: formattedPhone,
      otp_code: otp,
      otp_expires_at: expiresAt.toISOString(),
      attempt_count: 0,
    });

    if (error) {
      console.error('[send-phone-otp] DB Error:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to create OTP request',
          success: false,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('[send-phone-otp] OTP stored successfully');

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
