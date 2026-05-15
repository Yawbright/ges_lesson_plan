import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useToast } from '@/components/ToastProvider';
import {
  applyReferralCode,
  consumePendingReferralCode,
  savePendingReferralCode,
  validateReferralCode,
} from '@/lib/referrals';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { sendPhoneOtp, verifyPhoneOtp, validatePhoneNumber, formatPhoneNumber } from '@/lib/phoneAuth';
import { signInWithEmail, getAuthErrorMessage } from '@/lib/auth';

type AuthFormMode = 'signin' | 'email-input' | 'phone-input' | 'otp-input' | 'password-input';

export interface UnifiedAuthFormProps {
  onSignedIn?: () => void;
  onAccountCreated?: () => void;
  referralCode?: string;
}

export function UnifiedAuthForm({
  onSignedIn,
  onAccountCreated,
  referralCode,
}: UnifiedAuthFormProps) {
  const { showToast } = useToast();
  
  // Sign-in state
  const [mode, setMode] = useState<AuthFormMode>(referralCode ? 'email-input' : 'signin');
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  
  // Sign-up state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState(referralCode?.trim().toUpperCase() ?? '');
  const [otpExpiry, setOtpExpiry] = useState(0);
  
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (referralCode) {
      setInvitationCode(referralCode.trim().toUpperCase());
      setMode('email-input');
    }
  }, [referralCode]);

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

  async function handleEmailInput() {
    setFieldError(null);

    if (!email.trim()) {
      setFieldError('Email is required.');
      return;
    }

    setMode('phone-input');
  }

  async function handlePhoneInput() {
    setFieldError(null);

    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      setFieldError(validation.error || 'Invalid phone number.');
      return;
    }

    setLoading(true);
    try {
      const result = await sendPhoneOtp(validation.normalized!);
      if (result.success) {
        showToast({ message: 'OTP sent to your phone.' });
        setOtpExpiry(900); // 15 minutes
        setMode('otp-input');
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

  async function handleOtpInput() {
    setFieldError(null);

    if (otp.length !== 6) {
      setFieldError('OTP must be 6 digits.');
      return;
    }

    setMode('password-input');
  }

  async function handlePasswordSubmit() {
    setFieldError(null);

    if (!invitationCode.trim()) {
      setFieldError('Referral / invitation code is required.');
      return;
    }

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
      // Validate referral code
      const validatedCode = await validateReferralCode(invitationCode);
      await savePendingReferralCode(validatedCode);

      // Verify phone OTP and create account
      const validation = validatePhoneNumber(phone);
      const result = await verifyPhoneOtp(
        validation.normalized!,
        otp,
        password,
        validatedCode,
        email,
      );

      if (result.success) {
        showToast({ message: 'Account created successfully!' });
        // Apply referral immediately
        await applyReferralCode(validatedCode, result.user?.id);
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
              setMode('email-input');
            }}
            size="small"
          />
        </View>
      </View>
    );
  }

  // SIGN-UP: EMAIL INPUT
  if (mode === 'email-input') {
    return (
      <View style={styles.block}>
        <Text style={styles.modeTitle}>Create Account</Text>
        <Text style={styles.stepIndicator}>Step 1 of 4: Email</Text>
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
          error={fieldError ?? undefined}
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Next"
            onPress={handleEmailInput}
            loading={loading}
            size="medium"
          />
        </View>
        <View style={styles.secondaryButtonContainer}>
          <Button
            title="Already have an account? Sign in"
            variant="ghost"
            onPress={() => {
              setFieldError(null);
              setMode('signin');
            }}
            size="small"
          />
        </View>
      </View>
    );
  }

  // SIGN-UP: PHONE INPUT
  if (mode === 'phone-input') {
    return (
      <View style={styles.block}>
        <Text style={styles.modeTitle}>Create Account</Text>
        <Text style={styles.stepIndicator}>Step 2 of 4: Phone Number</Text>
        <Field
          label="Phone Number"
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setFieldError(null);
          }}
          placeholder="+233 or 0 or 233 format"
          keyboardType="phone-pad"
          error={fieldError ?? undefined}
        />
        <Text style={styles.helpText}>
          We'll send a verification code to your phone via SMS.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Send OTP"
            onPress={handlePhoneInput}
            loading={loading}
            size="medium"
          />
        </View>
        <View style={styles.secondaryButtonContainer}>
          <Button
            title="Back"
            variant="ghost"
            onPress={() => setMode('email-input')}
            size="small"
          />
        </View>
      </View>
    );
  }

  // SIGN-UP: OTP INPUT
  if (mode === 'otp-input') {
    return (
      <View style={styles.block}>
        <Text style={styles.modeTitle}>Create Account</Text>
        <Text style={styles.stepIndicator}>Step 3 of 4: Verify Phone</Text>
        <Text style={styles.otpInfo}>
          Verification code sent to {formatPhoneNumber(phone)}
        </Text>
        <Field
          label="6-Digit Code"
          value={otp}
          onChangeText={(value) => {
            setOtp(value.replace(/[^0-9]/g, '').slice(0, 6));
            setFieldError(null);
          }}
          placeholder="000000"
          keyboardType="number-pad"
          error={fieldError ?? undefined}
        />
        <View style={styles.otpCountdown}>
          <Text style={styles.otpCountdownText}>
            {otpExpiry > 0 ? `Expires in ${formatOtpExpiry()}` : 'Code expired'}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Verify"
            onPress={handleOtpInput}
            loading={loading}
            size="medium"
          />
        </View>
        <View style={styles.secondaryButtonContainer}>
          <Button
            title={otpExpiry > 0 ? 'Resend code' : 'Request new code'}
            variant="ghost"
            onPress={handlePhoneInput}
            size="small"
          />
        </View>
      </View>
    );
  }

  // SIGN-UP: PASSWORD INPUT
  if (mode === 'password-input') {
    return (
      <View style={styles.block}>
        <Text style={styles.modeTitle}>Create Account</Text>
        <Text style={styles.stepIndicator}>Step 4 of 4: Set Password</Text>
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
        <Field
          label="Referral / Invitation Code"
          value={invitationCode}
          onChangeText={(value) => {
            setInvitationCode(value.trim().toUpperCase());
            setFieldError(null);
          }}
          placeholder="8-character code, e.g. A1B2C3D4"
          autoCapitalize="characters"
        />
        <Text style={styles.invitationNotice}>
          Registration is strictly by invitation. Contact your referrer for a referral code.
        </Text>
        {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}
        <View style={styles.buttonContainer}>
          <Button
            title="Create Account"
            onPress={handlePasswordSubmit}
            loading={loading}
            size="medium"
          />
        </View>
        <View style={styles.secondaryButtonContainer}>
          <Button
            title="Back"
            variant="ghost"
            onPress={() => setMode('otp-input')}
            size="small"
          />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
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
  stepIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  helpText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  otpInfo: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
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
