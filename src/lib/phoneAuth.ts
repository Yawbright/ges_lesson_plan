import { supabase } from './supabase';

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  otpId?: string;
  expiresIn?: number;
  error?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  email?: string;
  password?: string;
  referralCode?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    phone_number: string;
  };
  error?: string;
}

/**
 * Send OTP via SMS to phone number using Arkesel
 */
export async function sendPhoneOtp(phoneNumber: string): Promise<SendOtpResponse> {
  try {
    console.log('[phoneAuth] Sending OTP to:', phoneNumber);

    const { data, error } = await supabase.functions.invoke('send-phone-otp', {
      body: {
        phoneNumber: phoneNumber.trim(),
      },
    });

    console.log('[phoneAuth] Function response - error:', error, 'data:', data);

    if (error) {
      console.error('[phoneAuth] Send error:', error);
      const errorMessage = error?.message || error?.msg || JSON.stringify(error);
      return {
        success: false,
        message: errorMessage || 'Failed to send OTP',
        error: errorMessage,
      };
    }

    // Check if response has success property or if it's an error response
    if (data && typeof data === 'object') {
      if ('error' in data) {
        console.error('[phoneAuth] Function returned error:', data.error);
        return {
          success: false,
          message: data.error || 'Failed to send OTP',
          error: data.error,
        };
      }

      if (data.success === false) {
        return {
          success: false,
          message: data.error || data.message || 'Failed to send OTP',
          error: data.error,
        };
      }
    }

    console.log('[phoneAuth] OTP sent successfully:', data);
    return {
      success: data?.success || true,
      message: data?.message || 'OTP sent successfully',
      otpId: data?.otpId,
      expiresIn: data?.expiresIn,
    };
  } catch (err) {
    console.error('[phoneAuth] Request error:', err);
    const message = err instanceof Error ? err.message : 'Failed to send OTP';
    console.error('[phoneAuth] Full error details:', {
      message,
      name: err instanceof Error ? err.name : 'Unknown',
      stack: err instanceof Error ? err.stack : 'N/A',
    });
    return {
      success: false,
      message: `${message} - Please check your internet connection and try again.`,
      error: message,
    };
  }
}

/**
 * Verify OTP and sign up / verify user with phone number
 */
export async function verifyPhoneOtp(
  phoneNumber: string,
  otp: string,
  password?: string,
  referralCode?: string,
  email?: string
): Promise<VerifyOtpResponse> {
  try {
    console.log('[phoneAuth] Verifying OTP for:', phoneNumber);

    const { data, error } = await supabase.functions.invoke('verify-phone-otp', {
      body: {
        phoneNumber: phoneNumber.trim(),
        otp: otp.trim(),
        email,
        password,
        referralCode,
      },
    });

    if (error) {
      console.error('[phoneAuth] Verify error:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP',
        error: error.message,
      };
    }

    console.log('[phoneAuth] OTP verified successfully:', data);
    return {
      success: data.success,
      message: data.message,
      user: data.user,
    };
  } catch (err) {
    console.error('[phoneAuth] Request error:', err);
    const message = err instanceof Error ? err.message : 'Failed to verify OTP';
    return {
      success: false,
      message,
      error: message,
    };
  }
}

/**
 * Get user's phone numbers
 */
export async function getUserPhoneNumbers(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_phone_numbers')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[phoneAuth] Error fetching phone numbers:', err);
    return [];
  }
}

/**
 * Add a new phone number to user account
 */
export async function addPhoneToAccount(userId: string, phoneNumber: string) {
  try {
    const { data, error } = await supabase.from('user_phone_numbers').insert({
      user_id: userId,
      phone_number: phoneNumber.replace(/\D/g, ''),
      verified_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[phoneAuth] Error adding phone:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to add phone number',
    };
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // Ghana phone numbers
  if (cleaned.startsWith('233')) {
    const local = cleaned.slice(3);
    if (local.length === 9) {
      return `+233 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
    }
  }

  // Local format (0 prefix)
  if (cleaned.startsWith('0')) {
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
  }

  return phone;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): {
  valid: boolean;
  error?: string;
  normalized?: string;
} {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 10) {
    return { valid: false, error: 'Phone number must be at least 10 digits' };
  }

  if (cleaned.length > 15) {
    return { valid: false, error: 'Phone number is too long' };
  }

  return { valid: true, normalized: cleaned };
}
