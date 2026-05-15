import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useToast } from '@/components/ToastProvider';
import {
  applyReferralCode,
  savePendingReferralCode,
  validateReferralCode,
} from '@/lib/referrals';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { sendPhoneOtp, verifyPhoneOtp, validatePhoneNumber, formatPhoneNumber } from '@/lib/phoneAuth';
import { signInWithEmail, getAuthErrorMessage } from '@/lib/auth';

type FormMode = 'signin' | 'signup';

export interface SinglePageAuthFormProps {
  onSignedIn?: () => void;
  onAccountCreated?: () => void;
  referralCode?: string;
}

export function SinglePageAuthForm({
  onSignedIn,
  onAccountCreated,
  referralCode,
}: SinglePageAuthFormProps) {
  const { showToast } = useToast();

  // Form mode
  const [mode, setMode] = useState<FormMode>(referralCode ? 'signup' : 'signin');

  // Sign-in fields
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Sign-up fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState(referralCode?.trim().toUpperCase() ?? '');

  // States
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP countdown
  useEffect(() => {
    if (otpExpiry <= 0) return;
    const timer = setInterval(() => {
      setOtpExpiry((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpExpiry]);

  async function handleSignIn() {
    setFieldError(null);

    if (!signinEmail.trim() || !signinPassword.trim()) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(signinEmail.trim().toLowerCase(), signinPassword);
      showToast({ message: 'Signed in successfully.' });
      onSignedIn?.();
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err, 'signin');
      setFieldError(message);
      showToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function checkEmailExists(emailToCheck: string): Promise<boolean> {
    try {
      const { data } = await supabase.auth.admin.listUsers();
      return data?.users?.some((u) => u.email?.toLowerCase() === emailToCheck.toLowerCase()) ?? false;
    } catch {
      // If we can't check, allow it to proceed
      return false;
    }
  }

  async function handleSendOtp() {
    setFieldError(null);

    // Validate email
    if (!email.trim()) {
      setFieldError('Email is required.');
      return;
    }

    // Check if email already has an account
    const emailExists = await checkEmailExists(email.trim());
    if (emailExists) {
      setFieldError('This email already has an account. Please sign in instead.');
      showToast({
        message: 'Email already registered. Please sign in or use a different email.',
        type: 'error',
      });
      return;
    }

    // Validate phone
    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      setFieldError(validation.error || 'Invalid phone number.');
      return;
    }

    // Validate referral code if provided
    if (invitationCode.trim()) {
      try {
        await validateReferralCode(invitationCode);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid referral code.';
        setFieldError(message);
        showToast({ message, type: 'error' });
        return;
      }
    } else {
      // Make referral code required
      setFieldError('Referral / Invitation code is required.');
      showToast({
        message: 'Registration is by invitation only. Please enter your referral code.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await sendPhoneOtp(validation.normalized!);
      if (result.success) {
        showToast({ message: 'OTP sent to your phone.' });
        setOtpExpiry(900); // 15 minutes
        setOtpSent(true);
      } else {
        setFieldError(result.message || 'Could not send OTP.');
        showToast({ message: result.message || 'Could not send OTP.', type: 'error' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not send OTP.';
      setFieldError(message);
      showToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount() {
    setFieldError(null);

    // Validate OTP
    if (otp.length !== 6) {
      setFieldError('OTP must be 6 digits.');
      return;
    }

    // Validate password
    if (password.length < 6) {
      setFieldError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFieldError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Save and apply the referral code (already validated in handleSendOtp)
      await savePendingReferralCode(invitationCode);

      // Verify phone OTP and create account
      const validation = validatePhoneNumber(phone);
      const result = await verifyPhoneOtp(
        validation.normalized!,
        otp,
        password,
        invitationCode,
        email,
      );

      if (result.success) {
        showToast({ message: 'Account created successfully!' });
        // Apply referral immediately
        await applyReferralCode(invitationCode, result.user?.id);
        onAccountCreated?.();
      } else {
        setFieldError(result.message || 'Could not create account.');
        showToast({ message: result.message || 'Could not create account.', type: 'error' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not create account.';
      setFieldError(message);
      showToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const formatOtpExpiry = () => {
    const mins = Math.floor(otpExpiry / 60);
    const secs = otpExpiry % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // SIGN-IN MODE
  if (mode === 'signin') {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.block}>
          <Text style={styles.modeTitle}>Sign In</Text>
          <Field
            label="Email"
            value={signinEmail}
            onChangeText={(value) => {
              setSigninEmail(value);
              setFieldError(null);
            }}
            placeholder="teacher@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Field
            label="Password"
            value={signinPassword}
            onChangeText={(value) => {
              setSigninPassword(value);
              setFieldError(null);
            }}
            placeholder="Enter your password"
            isPasswordField
            autoComplete="password"
            error={fieldError ?? undefined}
          />
          {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}
          <View style={styles.buttonContainer}>
            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              size="medium"
            />
          </View>
          <View style={styles.secondaryButtonContainer}>
            <Button
              title="Create account instead"
              variant="ghost"
              onPress={() => {
                setFieldError(null);
                setEmail('');
                setPhone('');
                setPassword('');
                setConfirmPassword('');
                setOtp('');
                setOtpSent(false);
                setMode('signup');
              }}
              size="small"
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  // SIGN-UP MODE - ALL FIELDS ON ONE PAGE
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.block}>
        <Text style={styles.modeTitle}>Create Account</Text>

        {/* Email */}
        <Field
          label="Email Address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setFieldError(null);
          }}
          placeholder="teacher@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!otpSent}
        />

        {/* Phone */}
        <Field
          label="Phone Number"
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setFieldError(null);
          }}
          placeholder="+233, 0, or 233 format"
          keyboardType="phone-pad"
          editable={!otpSent}
        />

        {/* Referral / Invitation Code */}
        <Field
          label="Referral / Invitation Code"
          value={invitationCode}
          onChangeText={(value) => {
            setInvitationCode(value.trim().toUpperCase());
            setFieldError(null);
          }}
          placeholder="8-character code, e.g. A1B2C3D4"
          autoCapitalize="characters"
          editable={!otpSent}
        />
        <Text style={styles.invitationNotice}>
          Registration is strictly by invitation. Contact your referrer for a referral code.
        </Text>

        {/* Send OTP Button */}
        {!otpSent ? (
          <View style={styles.buttonContainer}>
            <Button
              title="Send OTP to Phone"
              onPress={handleSendOtp}
              loading={loading}
              size="medium"
            />
          </View>
        ) : null}

        {/* OTP Input (appears after OTP is sent) */}
        {otpSent ? (
          <>
            <Text style={styles.otpLabel}>
              Verification code sent to {formatPhoneNumber(phone)}
            </Text>
            <Field
              label="6-Digit OTP"
              value={otp}
              onChangeText={(value) => {
                setOtp(value.replace(/[^0-9]/g, '').slice(0, 6));
                setFieldError(null);
              }}
              placeholder="000000"
              keyboardType="number-pad"
            />
            <View style={styles.otpCountdown}>
              <Text style={styles.otpCountdownText}>
                {otpExpiry > 0 ? `Expires in ${formatOtpExpiry()}` : 'Code expired'}
              </Text>
            </View>
            <Button
              title={otpExpiry > 0 ? 'Resend OTP' : 'Request New OTP'}
              variant="secondary"
              onPress={handleSendOtp}
              size="small"
              loading={loading}
            />
          </>
        ) : null}

        {/* Password (only show after OTP sent) */}
        {otpSent ? (
          <>
            <Field
              label="Password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setFieldError(null);
              }}
              placeholder="At least 6 characters"
              isPasswordField
              autoComplete="new-password"
            />
            <Field
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setFieldError(null);
              }}
              placeholder="Re-enter password"
              isPasswordField
              autoComplete="new-password"
            />
          </>
        ) : null}

        {/* Error Message */}
        {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}

        {/* Create Account Button (only enabled after OTP sent) */}
        {otpSent ? (
          <View style={styles.buttonContainer}>
            <Button
              title="Create Account"
              onPress={handleCreateAccount}
              loading={loading}
              size="medium"
            />
          </View>
        ) : null}

        {/* Switch to Sign In */}
        <View style={styles.secondaryButtonContainer}>
          <Button
            title={otpSent ? 'Back' : 'Already have an account? Sign in'}
            variant="ghost"
            onPress={() => {
              if (otpSent) {
                setOtpSent(false);
                setFieldError(null);
              } else {
                setFieldError(null);
                setMode('signin');
              }
            }}
            size="small"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  block: {
    width: '100%',
    gap: 12,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  otpLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  otpCountdown: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    marginVertical: 8,
  },
  otpCountdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  invitationNotice: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 8,
  },
  secondaryButtonContainer: {
    marginTop: 4,
    gap: 4,
  },
});
