import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { initializeEmailConfirmationFromUrl, useAuthSession } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';
import { colors } from '@/theme/colors';

export default function Entry() {
  const { showToast } = useToast();
  const { session, loading } = useAuthSession();
  const [checkingLink, setCheckingLink] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let active = true;

    async function handleConfirmationLink() {
      try {
        const confirmed = await initializeEmailConfirmationFromUrl();
        if (!active) return;
        if (confirmed) {
          setVerified(true);
          showToast({ message: 'Email verified. Complete your teacher profile.' });
        }
      } catch {
        if (active) {
          showToast({ message: 'Email confirmation link could not be opened.', type: 'error' });
        }
      } finally {
        if (active) setCheckingLink(false);
      }
    }

    handleConfirmationLink();
    return () => {
      active = false;
    };
  }, [showToast]);

  if (loading || checkingLink) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Opening your account...</Text>
      </View>
    );
  }

  if (verified) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href={session ? '/(tabs)/tools' : '/(auth)/sign-in'} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 10,
  },
});
