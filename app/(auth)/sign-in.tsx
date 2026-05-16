import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SinglePageAuthForm } from '@/components/SinglePageAuthForm';
import { useAuthSession } from '@/lib/auth';
import { brandIdentity, colors, radii, shadows, spacing, typography } from '@/theme/colors';

export default function SignInScreen() {
  const params = useLocalSearchParams<{ ref?: string }>();
  const { session } = useAuthSession();
  const insets = useSafeAreaInsets();
  const referralCode = typeof params.ref === 'string' ? params.ref : undefined;

  if (session) {
    return <Redirect href="/(tabs)/generate" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing[8], paddingBottom: insets.bottom + spacing[8] },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>GES</Text>
          </View>
          <Text style={styles.brandTitle}>{brandIdentity.name}</Text>
          <Text style={styles.brandTag}>{brandIdentity.tagline}</Text>
        </View>

        <View style={styles.formWrapper}>
          <SinglePageAuthForm
            referralCode={referralCode}
            onSignedIn={() => router.replace('/(tabs)/generate')}
            onAccountCreated={() => router.replace('/onboarding')}
          />
        </View>

        <View style={styles.benefitsRow}>
          <Benefit icon="sparkles-outline" label="AI-drafted plans" />
          <Benefit icon="shield-checkmark-outline" label="Private & secure" />
          <Benefit icon="phone-portrait-outline" label="Works on mobile" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Benefit({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.benefit}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.benefitText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing[7],
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing[11],
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
    ...shadows.md,
  },
  brandMarkText: {
    color: colors.accentOn,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 1,
  },
  brandTitle: {
    ...typography.h1,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  brandTag: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
  formWrapper: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.xl,
    padding: spacing[8],
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing[5],
    marginTop: spacing[9],
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
  },
  benefitText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
