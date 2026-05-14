import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useToast } from '@/components/ToastProvider';
import {
  completePasswordReset,
  getAuthErrorMessage,
  initializePasswordRecoveryFromUrl,
  requestPasswordReset,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/auth';
import {
  applyReferralCode,
  consumePendingReferralCode,
  savePendingReferralCode,
  validateReferralCode,
} from '@/lib/referrals';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors } from '@/theme/colors';

type AuthFormMode = 'signin' | 'signup' | 'reset-request' | 'reset-update';

export interface EmailPasswordAuthFormProps {
  onSignedIn?: () => void;
  onAccountCreated?: () => void;
  subtitle?: string;
  referralCode?: string;
}

export function EmailPasswordAuthForm({
  onSignedIn,
  onAccountCreated,
  subtitle,
  referralCode,
}: EmailPasswordAuthFormProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<AuthFormMode>(referralCode ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState(referralCode?.trim().toUpperCase() ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (referralCode) {
      setInvitationCode(referralCode.trim().toUpperCase());
      setMode('signup');
    }
  }, [referralCode]);

  useEffect(() => {
    let active = true;

    async function initializeRecovery() {
      try {
        const recovery = await initializePasswordRecoveryFromUrl();
        if (active && recovery) {
          setMode('reset-update');
          setInfoMessage('Enter a new password for your account.');
        }
      } catch (err: unknown) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Password reset link could not be opened.';
        setFieldError(message);
        showToast({ message, type: 'error' });
      }
    }

    initializeRecovery();
    return () => {
      active = false;
    };
  }, [showToast]);

  async function submit() {
    setFieldError(null);
    setInfoMessage(null);

    if (!isSupabaseConfigured) {
      Alert.alert(
        'Setup required',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env, then restart Expo with a clean cache.',
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'reset-request') {
      if (!normalizedEmail) {
        Alert.alert('Email required', 'Enter your email address to receive a reset link.');
        return;
      }

      setLoading(true);
      try {
        await requestPasswordReset(normalizedEmail);
        showToast({ message: 'Password reset link sent.' });
        setInfoMessage('Check your email for the password reset link.');
        setMode('signin');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not send password reset link.';
        setFieldError(message);
        showToast({ message, type: 'error' });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'reset-update') {
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
        await completePasswordReset(password);
        showToast({ message: 'Password updated. Sign in with your new password.' });
        setInfoMessage('Password updated. You can now sign in with your new password.');
        setPassword('');
        setConfirmPassword('');
        setMode('signin');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not update password.';
        setFieldError(message);
        showToast({ message, type: 'error' });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!normalizedEmail || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!invitationCode.trim()) {
        setFieldError('Invitation code is required to create an account.');
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
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(normalizedEmail, password);
        await applyPendingReferral();
        showToast({ message: 'Signed in successfully.' });
        if (await consumePendingTeacherSetup()) {
          onAccountCreated?.();
        } else {
          onSignedIn?.();
        }
      } else {
        const validatedCode = await validateReferralCode(invitationCode);
        await savePendingReferralCode(validatedCode);
        const data = await signUpWithEmail(normalizedEmail, password, validatedCode);
        
        // Apply referral immediately after signup (before email confirmation)
        console.log('[referral] Applying referral immediately after signup');
        await applyPendingReferral();
        
        if (data.session) {
          showToast({ message: 'Account created. You are now signed in.' });
          onAccountCreated?.();
        } else {
          showToast({
            message: 'Account created. Please confirm your email to unlock all features.',
            type: 'info',
          });
          setInfoMessage('Sign-up successful. Check your email and confirm your account to unlock all features.');
          await savePendingTeacherSetup();
          setMode('signin');
        }
      }
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err, mode === 'signup' ? 'signup' : 'signin');
      setFieldError(message);
      if (message.toLowerCase().includes('confirm your email')) {
        setInfoMessage('Your email is not confirmed yet. Open the confirmation link in your inbox, then sign in again.');
      }
      showToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.block}>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <Field
        label="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setFieldError(null);
        }}
        placeholder="teacher@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      {mode !== 'reset-request' ? (
        <Field
          label={mode === 'reset-update' ? 'New password' : 'Password'}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setFieldError(null);
          }}
          placeholder={mode === 'reset-update' ? 'Enter new password' : 'Enter your password'}
          isPasswordField
          autoComplete={mode === 'signin' ? 'password' : 'new-password'}
          error={fieldError ?? undefined}
        />
      ) : null}
      {mode === 'signup' || mode === 'reset-update' ? (
        <>
          <Field
            label={mode === 'reset-update' ? 'Confirm new password' : 'Confirm password'}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setFieldError(null);
            }}
            placeholder="Re-enter your password"
            isPasswordField
            autoComplete="new-password"
          />
          {mode === 'signup' ? (
            <>
              <Field
                label="Referral / invitation code"
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
            </>
          ) : null}
        </>
      ) : null}
      {mode === 'signup' && referralCode ? (
        <Text style={styles.referralNote}>Referral code: {referralCode.trim().toUpperCase()}</Text>
      ) : null}
      {infoMessage ? <Text style={styles.infoNote}>{infoMessage}</Text> : null}

      <View style={styles.buttonContainer}>
        <Button
          title={getPrimaryButtonTitle(mode)}
          onPress={submit}
          loading={loading}
          size="medium"
        />
      </View>
      {mode === 'signin' ? (
        <View style={styles.secondaryButtonContainer}>
          <Button
            title="Forgot password?"
            variant="ghost"
            onPress={() => {
              setFieldError(null);
              setInfoMessage('Enter your email and we will send a password reset link.');
              setPassword('');
              setMode('reset-request');
            }}
            size="small"
          />
          <Button
            title="New here? Create an account"
            variant="ghost"
            onPress={() => {
              setFieldError(null);
              setInfoMessage(null);
              setConfirmPassword('');
              setMode('signup');
            }}
            size="small"
          />
        </View>
      ) : (
        <View style={styles.secondaryButtonContainer}>
          <Button
            title="Back to sign in"
            variant="ghost"
            onPress={() => {
              setFieldError(null);
              setInfoMessage(null);
              setConfirmPassword('');
              setMode('signin');
            }}
            size="small"
          />
        </View>
      )}
    </View>
  );
}

async function applyPendingReferral() {
  const code = await consumePendingReferralCode();
  if (!code) {
    console.log('[referrals] No pending referral code to apply');
    return;
  }
  try {
    console.log('[referrals] Applying referral code:', code);
    const result = await applyReferralCode(code);
    console.log('[referrals] Referral code applied:', result);
  } catch (error) {
    console.error('[referrals] Could not apply referral code:', error);
  }
}

const PENDING_TEACHER_SETUP_KEY = 'pending-teacher-setup-after-signup';

async function savePendingTeacherSetup() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(PENDING_TEACHER_SETUP_KEY, '1');
  }
}

async function consumePendingTeacherSetup() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const value = window.localStorage.getItem(PENDING_TEACHER_SETUP_KEY);
  if (value) {
    window.localStorage.removeItem(PENDING_TEACHER_SETUP_KEY);
  }
  return Boolean(value);
}

function getPrimaryButtonTitle(mode: AuthFormMode) {
  if (mode === 'signin') return 'Sign in';
  if (mode === 'signup') return 'Create account';
  if (mode === 'reset-request') return 'Send reset link';
  return 'Update password';
}

const styles = StyleSheet.create({
  block: { gap: 2 },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: '500',
  },
  referralNote: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: -8,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  invitationNotice: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: -10,
    marginBottom: 20,
    fontWeight: '500',
  },
  infoNote: {
    backgroundColor: '#EEF5EF',
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 10,
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  secondaryButtonContainer: {
    marginTop: 12,
    gap: 8,
  },
});
