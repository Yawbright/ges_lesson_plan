import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import LandingPage from './landingpage';
import { useAuthSession } from '@/lib/auth';
import { colors } from '@/theme/colors';

export default function Entry() {
  const { session, loading } = useAuthSession();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Opening Ghana Lesson Planner...</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/tools" />;
  }

  return <LandingPage onGetAccess={() => router.push('/(auth)/sign-in')} />;
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
