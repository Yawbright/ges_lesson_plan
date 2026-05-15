import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { EmailPasswordAuthForm } from '@/components/EmailPasswordAuthForm';
import { PhoneAuthForm } from '@/components/PhoneAuthForm';
import { colors } from '@/theme/colors';

export default function SignInScreen() {
  const params = useLocalSearchParams<{ ref?: string }>();
  const referralCode = typeof params.ref === 'string' ? params.ref : undefined;
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>📚</Text>
          </View>
          <Text style={styles.brandTitle}>Ghana Lesson Planner</Text>
          <Text style={styles.brandTag}>AI-powered lesson plans for Ghanaian classrooms</Text>
        </View>

        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, authMode === 'email' && styles.tabActive]}
            onPress={() => setAuthMode('email')}
          >
            <Text style={[styles.tabText, authMode === 'email' && styles.tabTextActive]}>
              Email
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, authMode === 'phone' && styles.tabActive]}
            onPress={() => setAuthMode('phone')}
          >
            <Text style={[styles.tabText, authMode === 'phone' && styles.tabTextActive]}>
              Phone Number
            </Text>
          </Pressable>
        </View>

        <View style={styles.formWrapper}>
          {authMode === 'email' ? (
            <EmailPasswordAuthForm
              referralCode={referralCode}
              onSignedIn={() => router.replace('/(tabs)/generate')}
              onAccountCreated={() => router.replace('/onboarding')}
            />
          ) : (
            <PhoneAuthForm
              referralCode={referralCode}
              onSignedUp={() => router.replace('/onboarding')}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { 
    padding: 24, 
    paddingTop: 60,
    paddingBottom: 40,
  },
  brand: { 
    alignItems: 'center', 
    marginBottom: 48 
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  brandIconText: {
    fontSize: 32,
  },
  brandTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: colors.primaryDark,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  brandTag: { 
    color: colors.textMuted, 
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: 'white',
  },
  formWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
