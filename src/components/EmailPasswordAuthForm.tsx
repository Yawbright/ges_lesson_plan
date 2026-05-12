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
        if (data.session) {
          await applyPendingReferral();
          showToast({ message: 'Account created. You are now signed in.' });
          onAccountCreated?.();
        } else {
          showToast({
            message: 'Account created. Please confirm your email, then sign in.',
            type: 'info',
          });
          setInfoMessage('Sign-up successful. Check your email and confirm your account before signing in.');
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
          secureTextEntry
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
            secureTextEntry
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

      <Button
        title={getPrimaryButtonTitle(mode)}
        onPress={submit}
        loading={loading}
      />
      {mode === 'signin' ? (
        <>
          <Button
            title="Forgot password?"
            variant="ghost"
            onPress={() => {
              setFieldError(null);
              setInfoMessage('Enter your email and we will send a password reset link.');
              setPassword('');
              setMode('reset-request');
            }}
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
          />
        </>
      ) : (
        <Button
          title="Back to sign in"
          variant="ghost"
          onPress={() => {
            setFieldError(null);
            setInfoMessage(null);
            setConfirmPassword('');
            setMode('signin');
          }}
        />
      )}
    </View>
  );
}

async function applyPendingReferral() {
  const code = await consumePendingReferralCode();
  if (!code) return;
  try {
    await applyReferralCode(code);
  } catch (error) {
    console.warn('[referrals] Could not apply referral code', error);
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
  block: { gap: 0 },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  referralNote: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: -6,
    marginBottom: 12,
  },
  invitationNotice: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -8,
    marginBottom: 14,
  },
  infoNote: {
    backgroundColor: '#EEF5EF',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 12,
    padding: 10,
  },
});
