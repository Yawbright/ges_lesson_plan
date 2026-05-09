import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { EmailPasswordAuthForm } from '@/components/EmailPasswordAuthForm';
import { colors } from '@/theme/colors';

export default function SignInScreen() {
  const params = useLocalSearchParams<{ ref?: string }>();
  const referralCode = typeof params.ref === 'string' ? params.ref : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>Ghana Lesson Planner</Text>
          <Text style={styles.brandTag}>AI-powered lesson plans for Ghanaian classrooms</Text>
        </View>

        <EmailPasswordAuthForm
          referralCode={referralCode}
          onSignedIn={() => router.replace('/(tabs)/generate')}
          onAccountCreated={() => router.replace('/onboarding')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 80 },
  brand: { alignItems: 'center', marginBottom: 36 },
  brandTitle: { fontSize: 26, fontWeight: '800', color: colors.primaryDark },
  brandTag: { color: colors.textMuted, marginTop: 6, textAlign: 'center' },
});
