import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useToast } from '@/components/ToastProvider';
import { getAuthErrorMessage, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { applyReferralCode, consumePendingReferralCode, savePendingReferralCode } from '@/lib/referrals';
import { isSupabaseConfigured } from '@/lib/supabase';
import { colors } from '@/theme/colors';

export interface EmailPasswordAuthFormProps {
  onSignedIn?: () => void;
  subtitle?: string;
  referralCode?: string;
}

export function EmailPasswordAuthForm({ onSignedIn, subtitle, referralCode }: EmailPasswordAuthFormProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    if (!normalizedEmail || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
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
        onSignedIn?.();
      } else {
        const data = await signUpWithEmail(normalizedEmail, password);
        if (referralCode) {
          await savePendingReferralCode(referralCode);
        }
        if (data.session) {
          await applyPendingReferral();
          showToast({ message: 'Account created. You are now signed in.' });
          onSignedIn?.();
        } else {
          showToast({
            message: 'Account created. Please confirm your email, then sign in.',
            type: 'info',
          });
          setInfoMessage('Sign-up successful. Check your email and confirm your account before signing in.');
          setMode('signin');
        }
      }
    } catch (err: unknown) {
      const message = getAuthErrorMessage(err, mode);
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
      <Field
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setFieldError(null);
        }}
        placeholder="Enter your password"
        secureTextEntry
        autoComplete={mode === 'signin' ? 'password' : 'new-password'}
        error={fieldError ?? undefined}
      />
      {mode === 'signup' ? (
        <Field
          label="Confirm password"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            setFieldError(null);
          }}
          placeholder="Re-enter your password"
          secureTextEntry
          autoComplete="new-password"
        />
      ) : null}
      {mode === 'signup' && referralCode ? (
        <Text style={styles.referralNote}>Referral code: {referralCode.trim().toUpperCase()}</Text>
      ) : null}
      {infoMessage ? <Text style={styles.infoNote}>{infoMessage}</Text> : null}

      <Button
        title={mode === 'signin' ? 'Sign in' : 'Create account'}
        onPress={submit}
        loading={loading}
      />
      <Button
        title={mode === 'signin' ? 'New here? Create an account' : 'Have an account? Sign in'}
        variant="ghost"
        onPress={() => {
          setFieldError(null);
          setInfoMessage(null);
          setConfirmPassword('');
          setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
        }}
      />
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
