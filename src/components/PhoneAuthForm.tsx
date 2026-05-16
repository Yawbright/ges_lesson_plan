import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { useToast } from '@/components/ToastProvider';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  validatePhoneNumber,
  formatPhoneNumber,
} from '@/lib/phoneAuth';
import { colors } from '@/theme/colors';

type PhoneAuthMode = 'phone-input' | 'otp-input' | 'password-input';

export interface PhoneAuthFormProps {
  onSignedUp?: () => void;
  referralCode?: string;
}

export function PhoneAuthForm({ onSignedUp, referralCode }: PhoneAuthFormProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<PhoneAuthMode>('phone-input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<number>(0);

  // Handle OTP expiry countdown
  useEffect(() => {
    if (otpExpiry <= 0) return;

    const timer = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpExpiry]);

  async function sendOtp() {
    setFieldError(null);

    // Validate phone number
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      setFieldError(validation.error ?? 'Invalid phone number');
      showToast({ message: validation.error || 'Invalid phone number', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      console.log('[PhoneAuthForm] Sending OTP to:', phoneNumber);
      const result = await sendPhoneOtp(phoneNumber);

      if (result.success) {
        setMode('otp-input');
        if (result.expiresIn) {
          setOtpExpiry(result.expiresIn);
        }
        showToast({
          message: `OTP sent to ${formatPhoneNumber(phoneNumber)}`,
          type: 'success',
        });
      } else {
        const message = getPhoneAuthResultMessage(result, 'Failed to send OTP');
        setFieldError(message);
        showToast({
          message,
          type: 'error',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      setFieldError(message);
      showToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setFieldError(null);

    if (!otp.trim()) {
      setFieldError('Please enter the OTP code');
      return;
    }

    if (otp.trim().length !== 6 || !/^\d+$/.test(otp.trim())) {
      setFieldError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      console.log('[PhoneAuthForm] Verifying OTP');
      const result = await verifyPhoneOtp(phoneNumber, otp, password, referralCode);

      if (result.success) {
        // OTP verified, need password for first-time users
        if (!password) {
          setMode('password-input');
          showToast({ message: 'OTP verified. Please set a password.', type: 'success' });
        } else {
          // Complete signup
          showToast({
            message: 'Account created successfully!',
            type: 'success',
          });
          onSignedUp?.();
        }
      } else {
        const message = getPhoneAuthResultMessage(result, 'Failed to verify OTP');
        setFieldError(message);
        showToast({
          message,
          type: 'error',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify OTP';
      setFieldError(message);
      showToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function completeSignup() {
    setFieldError(null);

    if (!password.trim()) {
      setFieldError('Password is required');
      return;
    }

    if (password.length < 6) {
      setFieldError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      console.log('[PhoneAuthForm] Creating account with password');
      const result = await verifyPhoneOtp(phoneNumber, otp, password, referralCode);

      if (result.success) {
        showToast({
          message: 'Account created successfully!',
          type: 'success',
        });
        onSignedUp?.();
      } else {
        const message = getPhoneAuthResultMessage(result, 'Failed to create account');
        setFieldError(message);
        showToast({
          message,
          type: 'error',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setFieldError(message);
      showToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up with Phone Number</Text>

      {mode === 'phone-input' && (
        <>
          <Field
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+233 XX XXX XXXX or 0XX XXX XXXX"
            keyboardType="phone-pad"
            editable={!loading}
          />
          <Text style={styles.helpText}>
            Enter your phone number. We'll send you a verification code.
          </Text>
          {fieldError && <Text style={styles.errorText}>{fieldError}</Text>}
          <Button
            title="Send OTP"
            onPress={sendOtp}
            loading={loading}
            style={styles.button}
          />
        </>
      )}

      {mode === 'otp-input' && (
        <>
          <Text style={styles.infoText}>
            Enter the 6-digit code sent to {formatPhoneNumber(phoneNumber)}
          </Text>
          <Field
            label="OTP Code"
            value={otp}
            onChangeText={(val) => setOtp(val.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            keyboardType="number-pad"
            editable={!loading}
            maxLength={6}
          />
          {otpExpiry > 0 && (
            <Text style={styles.expiryText}>
              Expires in {Math.floor(otpExpiry / 60)}:{String(otpExpiry % 60).padStart(2, '0')}
            </Text>
          )}
          {fieldError && <Text style={styles.errorText}>{fieldError}</Text>}
          <View style={styles.buttonRow}>
            <Button
              title="Verify"
              onPress={verifyOtp}
              loading={loading}
              style={styles.button}
            />
            <Button
              title="Back"
              variant="ghost"
              onPress={() => {
                setMode('phone-input');
                setOtp('');
              }}
              style={styles.button}
            />
          </View>
        </>
      )}

      {mode === 'password-input' && (
        <>
          <Text style={styles.infoText}>
            Phone verified! Now set a password for your account.
          </Text>
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
            editable={!loading}
          />
          <Field
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm password"
            editable={!loading}
          />
          {fieldError && <Text style={styles.errorText}>{fieldError}</Text>}
          <Button
            title="Create Account"
            onPress={completeSignup}
            loading={loading}
            style={styles.button}
          />
        </>
      )}
    </View>
  );
}

function getPhoneAuthResultMessage(
  result: { error?: string; message?: string },
  fallback: string
): string {
  return result.error || result.message || fallback;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  helpText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  expiryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '700',
  },
  button: {
    marginTop: 16,
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
});
