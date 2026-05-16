/**
 * Shared phone number utilities for Ghana phone authentication
 * Used by: send-phone-otp, verify-phone-otp, and other phone-based functions
 */

/**
 * Format phone number to Arkesel standard format (233XXXXXXXXX)
 * Accepts various formats:
 * - +233123456789 → 233123456789
 * - 0123456789 → 233123456789
 * - 233123456789 → 233123456789
 * - 123456789 (9 digits) → 233123456789
 * 
 * @param phone - Raw phone number in any format
 * @returns Formatted number (233XXXXXXXXX) or null if invalid
 */
export function formatPhoneForArkesel(phone: string): string | null {
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

/**
 * Validate Ghana phone number
 * Checks format, length, and valid mobile prefixes
 */
export function validateGhanaPhoneNumber(phone: string): { valid: boolean; normalized?: string; error?: string } {
  const formatted = formatPhoneForArkesel(phone);

  if (!formatted) {
    return { valid: false, error: 'Invalid phone format' };
  }

  // Ghana numbers: 233XXXXXXXXX (12 chars, all digits)
  if (formatted.length !== 12) {
    return { valid: false, error: 'Phone number must be 10 digits (Ghana format)' };
  }

  // Must be all digits
  if (!/^\d+$/.test(formatted)) {
    return { valid: false, error: 'Phone number contains invalid characters' };
  }

  // Ghana-specific: must start with 233
  if (!formatted.startsWith('233')) {
    return { valid: false, error: 'Phone number must be a Ghana number (233XXXXXXXXX)' };
  }

  // Ghana mobile prefixes: 020-029, 050-059, 070-079, 090-099
  const prefix = formatted.substring(3, 5);
  const validPrefixes = ['02', '05', '07', '09'];
  if (!validPrefixes.includes(prefix)) {
    return { valid: false, error: 'Invalid Ghana mobile number prefix' };
  }

  return { valid: true, normalized: formatted };
}
