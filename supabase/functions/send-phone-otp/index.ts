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

// Validate phone number (basic validation)
function validatePhoneNumber(phone: string): boolean {
  // Accept various formats: +233XXXXXXXXX, 0XXXXXXXXX, 233XXXXXXXXX, etc.
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10; // At least 10 digits
}

// Send SMS via Arkesel API
async function sendViaArkesel(phoneNumber: string, otp: string, message: string): Promise<boolean> {
  try {
    console.log('[Arkesel] Sending SMS to:', phoneNumber);
    console.log('[Arkesel] Using API Key:', arkeselApiKey ? 'Present' : 'Missing');
    
    const response = await fetch('https://sms.arkesel.com/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: arkeselApiKey,
        sms: message,
        recipients: phoneNumber,
      }),
    });

    console.log('[Arkesel] Response status:', response.status);
    
    const data = await response.json();
    console.log('[Arkesel Response]', JSON.stringify(data));
    
    const success = data.status === 'success' || data.code === 200 || data.code === '200';
    console.log('[Arkesel] Success result:', success);
    
    return success;
  } catch (error) {
    console.error('[Arkesel Error]', error);
    console.error('[Arkesel Error Details]', error instanceof Error ? error.message : String(error));
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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed', success: false }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Check if ARKESEL_API_KEY is set
    if (!arkeselApiKey?.trim()) {
      console.error('[send-phone-otp] ARKESEL_API_KEY is not configured');
      return new Response(
        JSON.stringify({
          error: 'SMS service is not configured. Please contact support. (Missing ARKESEL_API_KEY)',
          success: false,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { phoneNumber } = (await req.json()) as SendPhoneOtpRequest;

    if (!phoneNumber?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required', success: false }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format', success: false }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Clean phone number for storage
    const cleanedPhone = phoneNumber.replace(/\D/g, '');

    // Check for recent attempts to prevent abuse
    const { data: recentAttempts } = await supabase
      .from('phone_auth_requests')
      .select('*')
      .eq('phone_number', cleanedPhone)
      .gt('created_at', new Date(Date.now() - 60 * 1000).toISOString()) // Last 60 seconds
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentAttempts && recentAttempts.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Please wait before requesting a new OTP',
          success: false,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via Arkesel
    const smsMessage = `Your verification code is: ${otp}\n\nValid for 15 minutes.`;
    const sendSuccess = await sendViaArkesel(cleanedPhone, otp, smsMessage);

    if (!sendSuccess) {
      return new Response(
        JSON.stringify({
          error: 'Failed to send SMS. Please check your phone number and try again.',
          success: false,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store OTP in database
    const { data, error } = await supabase.from('phone_auth_requests').insert({
      phone_number: cleanedPhone,
      otp_code: otp,
      otp_expires_at: expiresAt.toISOString(),
      attempt_count: 0,
    });

    if (error) {
      console.error('[DB Error]', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to create OTP request',
          success: false,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully to your phone',
        otpId: data?.[0]?.id,
        expiresIn: 900, // 15 minutes in seconds
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Request Error]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: `Internal server error: ${errorMessage}`,
        success: false,
        details: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
