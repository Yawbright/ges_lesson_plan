import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AdminSection } from './adminTypes';

export const adminSections: {
  id: AdminSection;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { id: 'overview', label: 'Overview', icon: 'view-dashboard-outline' },
  { id: 'users', label: 'Users', icon: 'account-group-outline' },
  { id: 'credits', label: 'Credits', icon: 'wallet-outline' },
  { id: 'payments', label: 'Payments', icon: 'script-text-outline' },
  { id: 'usage', label: 'Usage', icon: 'chart-timeline-variant' },
  { id: 'referrals', label: 'Referrals', icon: 'share-variant-outline' },
  { id: 'phone-signups', label: 'Phone Signups', icon: 'cellphone-key' },
  { id: 'logs', label: 'Error Logs', icon: 'alert-circle-outline' },
  { id: 'faqs', label: 'FAQs', icon: 'frequently-asked-questions' },
  { id: 'settings', label: 'Settings', icon: 'cog-outline' },
];

export const paymentStatusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Success', value: 'success' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Abandoned', value: 'abandoned' },
];

export const creditKindOptions = [
  { label: 'All credit kinds', value: '' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Referral reward', value: 'referral_reward' },
  { label: 'Lesson generation', value: 'lesson_generation' },
  { label: 'Scheme generation', value: 'scheme_generation' },
  { label: 'Scheme parsing', value: 'scheme_parsing' },
  { label: 'Teaching notes generation', value: 'teaching_notes_generation' },
  { label: 'Starter', value: 'starter' },
];

export const usageKindOptions = [
  { label: 'All features', value: '' },
  { label: 'Lesson generation', value: 'lesson_generation' },
  { label: 'Scheme generation', value: 'scheme_generation' },
  { label: 'Custom scheme analysis', value: 'scheme_parsing' },
  { label: 'Teaching notes generation', value: 'teaching_notes_generation' },
];

export const referralStatusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Unconfirmed email', value: 'unconfirmed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rewarded', value: 'rewarded' },
  { label: 'Not rewarded', value: 'rejected' },
];

export const logSeverityOptions = [
  { label: 'All severities', value: '' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
];

export const phoneSignupStatusOptions = [
  { label: 'All events', value: '' },
  { label: 'OTP requested', value: 'otp_requested' },
  { label: 'OTP sent', value: 'otp_send_succeeded' },
  { label: 'Send failed', value: 'otp_send_failed' },
  { label: 'Verify attempted', value: 'otp_verify_attempted' },
  { label: 'Verified', value: 'otp_verified' },
  { label: 'Verify failed', value: 'otp_verify_failed' },
  { label: 'Registration completed', value: 'registration_completed' },
  { label: 'Registration failed', value: 'registration_failed' },
];

export const promotionTypeOptions = [
  { label: 'None', value: 'none' },
  { label: 'Bonus credits', value: 'bonus' },
  { label: 'Discount (%)', value: 'percent_discount' },
  { label: 'Discount (GHS)', value: 'fixed_discount' },
  { label: 'Custom badge only', value: 'custom' },
];
