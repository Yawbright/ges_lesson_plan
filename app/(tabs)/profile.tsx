import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button } from '@/components/Button';
import { EmailPasswordAuthForm } from '@/components/EmailPasswordAuthForm';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import { useToast } from '@/components/ToastProvider';
import { defaultRuntimeSettings, loadRuntimeAppSettings } from '@/lib/appSettings';
import { signOut, useAuthSession } from '@/lib/auth';
import { CLASS_LEVEL_OPTIONS } from '@/lib/options';
import { buildReferralLink, loadReferralDashboard, type ReferralDashboard } from '@/lib/referrals';
import { loadTeacherProfile, saveTeacherProfile } from '@/lib/teacherProfile';
import { colors, radii, shadows, spacing, typography } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { showToast } = useToast();
  const { session, loading } = useAuthSession();
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolDistrict, setSchoolDistrict] = useState('');
  const [classSizes, setClassSizes] = useState<Record<string, string>>({});
  const [classToAdd, setClassToAdd] = useState<string>(CLASS_LEVEL_OPTIONS[0]?.value ?? '');
  const [classSizeToAdd, setClassSizeToAdd] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [referral, setReferral] = useState<ReferralDashboard | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralRewardCredits, setReferralRewardCredits] = useState(defaultRuntimeSettings.referralReward.credits);
  const [referralMonthlyLimit, setReferralMonthlyLimit] = useState(defaultRuntimeSettings.referralReward.monthlyLimit);
  const [referralRewardActive, setReferralRewardActive] = useState(defaultRuntimeSettings.referralReward.active);

  const referralLink = useMemo(
    () => (referral?.code ? buildReferralLink(referral.code) : ''),
    [referral?.code],
  );
  const classOptions = useMemo(
    () =>
      CLASS_LEVEL_OPTIONS.map((option) => ({
        ...option,
        label: classSizes[option.value] !== undefined ? `${option.label} (added)` : option.label,
      })),
    [classSizes],
  );

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const profile = await loadTeacherProfile();
      if (!active) return;
      setTeacherName(profile.teacherName);
      setSchoolName(profile.schoolName);
      setSchoolDistrict(profile.schoolDistrict);
      setClassSizes(profile.classSizes ?? {});
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const refreshReferral = useCallback(async () => {
    if (!session) return;
    setReferralLoading(true);
    setReferralError(null);
    try {
      const [dashboard, settings] = await Promise.all([
        loadReferralDashboard(),
        loadRuntimeAppSettings(),
      ]);
      setReferral(dashboard);
      setReferralRewardCredits(dashboard.stats.rewardCredits ?? settings.referralReward.credits);
      setReferralMonthlyLimit(dashboard.stats.monthlyLimit ?? settings.referralReward.monthlyLimit);
      setReferralRewardActive(dashboard.stats.active ?? settings.referralReward.active);
    } catch (err: unknown) {
      setReferralError(getMessage(err));
    } finally {
      setReferralLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      refreshReferral();
    }, [refreshReferral]),
  );

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err: unknown) {
      Alert.alert('Sign-out failed', getMessage(err));
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await saveTeacherProfile({
        teacherName: teacherName.trim(),
        schoolName: schoolName.trim(),
        schoolDistrict: schoolDistrict.trim(),
        classSizes: cleanClassSizes(classSizes),
        onboardingCompleted: true,
      });
      showToast({ message: 'Teacher details saved.' });
    } catch (err: unknown) {
      Alert.alert('Profile save failed', getMessage(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function copyReferralLink() {
    if (!referralLink) {
      Alert.alert('Referral link unavailable', referralError ?? 'Referral code is still loading.');
      return;
    }

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(referralLink);
      showToast({ message: 'Referral link copied.' });
      return;
    }

    await Share.share({ message: referralLink });
    showToast({ message: 'Referral link shared.' });
  }

  async function shareReferralLink() {
    if (!referralLink) {
      Alert.alert('Referral link unavailable', referralError ?? 'Referral code is still loading.');
      return;
    }
    await Share.share({
      message: `Join GES Lesson Planner with my referral link: ${referralLink}`,
    });
    showToast({ message: 'Referral link shared.' });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Profile</Text>
        <Text style={styles.lead}>
          Sign in with your Supabase account to use cloud lesson and scheme generation.
        </Text>
        <EmailPasswordAuthForm
          subtitle="Use the same email and password as your GES Lesson Planner account."
          onAccountCreated={() => router.replace('/onboarding')}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerPanel}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(teacherName, session.user.email)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerEyebrow}>Signed in</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {teacherName.trim() || session.user.email || 'Welcome back'}
            </Text>
            {teacherName.trim() ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {session.user.email}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Teacher Details</Text>
          <Text style={styles.sectionMeta}>Printed below new lesson plans</Text>
        </View>
        <Field
          label="Teacher Full Name"
          value={teacherName}
          onChangeText={setTeacherName}
          placeholder="e.g. Ama Mensah"
        />
        <Field
          label="Name of School"
          value={schoolName}
          onChangeText={setSchoolName}
          placeholder="e.g. Adenta M/A Basic School"
        />
        <Field
          label="School District"
          value={schoolDistrict}
          onChangeText={setSchoolDistrict}
          placeholder="e.g. Adenta Municipal"
        />

        <View style={styles.classEntryPanel}>
          <Text style={styles.subsectionTitle}>Classes Teaching</Text>
          <Text style={styles.sectionMeta}>Add each class and its size before saving.</Text>
          <View style={styles.classEntryRow}>
            <View style={styles.classSelectWrap}>
              <SelectField
                label="Class"
                value={classToAdd}
                options={classOptions}
                onChange={(value) => {
                  setClassToAdd(value);
                  setClassSizeToAdd(classSizes[value] ?? '');
                }}
              />
            </View>
            <View style={styles.classSizeWrap}>
              <Field
                label="Class size"
                value={classSizeToAdd}
                onChangeText={(value) => setClassSizeToAdd(cleanNumeric(value))}
                placeholder="42"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Button
            title={classSizes[classToAdd] !== undefined ? 'Update class size' : 'Add class'}
            variant="secondary"
            onPress={addClassSize}
          />
        </View>

        {Object.keys(classSizes).length ? (
          <View style={styles.classList}>
            {Object.entries(classSizes).map(([classLevel, size]) => (
              <View key={classLevel} style={styles.classRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.className}>{classLevel}</Text>
                  <Text style={styles.classSizeText}>Class size: {size || 'Not set'}</Text>
                </View>
                <Pressable
                  onPress={() => removeClassSize(classLevel)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <Button title="Save teacher details" onPress={handleSaveProfile} loading={savingProfile} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Referral Rewards</Text>
          <Text style={styles.sectionMeta}>
            {referralRewardActive
              ? `${referralRewardCredits} ${referralRewardCredits === 1 ? 'credit' : 'credits'} after a referred teacher generates a lesson`
              : 'Referral rewards are currently inactive'}
          </Text>
        </View>

        {referralLoading && !referral ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <View style={styles.referralCodePanel}>
              <Text style={styles.referralLabel}>Your referral code</Text>
              <Text style={styles.referralCode}>{referral?.code ?? 'Loading...'}</Text>
              <Text style={styles.referralLink} numberOfLines={2}>{referralLink}</Text>
              {referralError ? <Text style={styles.referralError}>{referralError}</Text> : null}
            </View>

            <View style={styles.actionRow}>
              <Button
                title="Copy link"
                variant="secondary"
                onPress={copyReferralLink}
                disabled={!referralLink}
                style={styles.actionButton}
              />
              <Button
                title="Share"
                onPress={shareReferralLink}
                disabled={!referralLink}
                style={styles.actionButton}
              />
            </View>

            <View style={styles.statsRow}>
              <Stat label="This month" value={`${referral?.stats.rewardsThisMonth ?? 0}/${referral?.stats.monthlyLimit ?? referralMonthlyLimit}`} />
              <Stat label="Pending" value={String(referral?.stats.pending ?? 0)} />
              <Stat label="Rewarded" value={String(referral?.stats.rewarded ?? 0)} />
              <Stat label="Not rewarded" value={String(referral?.stats.rejected ?? 0)} />
            </View>

            {referral?.referrals.length ? (
              <View style={styles.referralList}>
                {referral.referrals.slice(0, 5).map((item) => (
                  <View key={item.id} style={styles.referralRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.referralStatus}>{formatStatus(item.status)}</Text>
                      <Text style={styles.referralDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                    {item.rejection_reason ? (
                      <Text style={styles.rejectionReason}>{item.rejection_reason}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No referrals yet.</Text>
            )}

            <Pressable onPress={refreshReferral} style={styles.refreshLink}>
              <Text style={styles.refreshText}>Refresh referral stats</Text>
            </Pressable>
          </>
        )}
      </View>

      <Button title="Sign out" variant="secondary" onPress={handleSignOut} />
      <View style={styles.developerBlock}>
        <Text style={styles.developerLabel}>Developer</Text>
        <Text style={styles.developerName}>KG Logics</Text>
        <Text style={styles.developerContact}>WhatsApp: 0506071735</Text>
      </View>
    </ScrollView>
  );

  function addClassSize() {
    if (!classToAdd || !classSizeToAdd.trim()) {
      Alert.alert('Class size required', 'Select a class and enter its class size.');
      return;
    }

    const nextClassSizes = {
      ...classSizes,
      [classToAdd]: classSizeToAdd.trim(),
    };

    setClassSizes((current) => ({
      ...current,
      [classToAdd]: classSizeToAdd.trim(),
    }));
    setClassSizeToAdd('');
    const nextAvailableClass = CLASS_LEVEL_OPTIONS.find(
      (option) => nextClassSizes[option.value] === undefined,
    );
    if (nextAvailableClass) {
      setClassToAdd(nextAvailableClass.value);
    }
  }

  function removeClassSize(classLevel: string) {
    setClassSizes((current) => {
      const next = { ...current };
      delete next[classLevel];
      return next;
    });
  }

  function cleanNumeric(value: string) {
    return value.replace(/[^0-9]/g, '').slice(0, 3);
  }

}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Unknown error';
}

function getInitials(name: string, email?: string | null) {
  const source = name.trim() || (email ?? '').split('@')[0] || '';
  const parts = source.replace(/[._-]+/g, ' ').split(/\s+/).filter(Boolean);
  if (!parts.length) return 'GP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatStatus(status: string) {
  if (status === 'rejected') return 'Not rewarded';
  return status.slice(0, 1).toUpperCase() + status.slice(1);
}

function cleanClassSizes(classSizes: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(classSizes)
      .map(([classLevel, size]) => [classLevel, size.trim()])
      .filter(([, size]) => size),
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing[7], paddingBottom: spacing[12], gap: spacing[5] },
  screenTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing[3],
  },
  lead: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing[6],
  },
  headerPanel: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.lg,
    padding: spacing[7],
    ...shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accentOn,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerEyebrow: {
    ...typography.eyebrow,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: spacing[2],
  },
  headerTitle: { color: colors.primaryOn, fontSize: 20, fontWeight: '800', letterSpacing: -0.2 },
  headerSubtitle: { color: 'rgba(255,255,255,0.78)', ...typography.bodySm, marginTop: spacing[1] },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[7],
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[5],
    ...shadows.sm,
  },
  sectionHeader: { gap: spacing[1] },
  sectionTitle: { ...typography.h3, color: colors.text },
  sectionMeta: { ...typography.bodySm, color: colors.textMuted },
  classEntryPanel: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: spacing[5],
    backgroundColor: colors.surfaceAlt,
    gap: spacing[3],
  },
  subsectionTitle: { ...typography.label, color: colors.text },
  classEntryRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: spacing[4],
  },
  classSelectWrap: { flex: 1 },
  classSizeWrap: { flex: 1 },
  classList: { gap: spacing[3] },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
  },
  className: { ...typography.label, color: colors.text },
  classSizeText: { ...typography.bodySm, color: colors.textMuted, marginTop: spacing[1] },
  removeButton: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderRadius: radii.md },
  removeButtonText: { ...typography.label, color: colors.danger },
  referralCodePanel: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: spacing[6],
    backgroundColor: colors.surfaceAlt,
    gap: spacing[2],
  },
  referralLabel: { ...typography.eyebrow, color: colors.textMuted },
  referralCode: { color: colors.primaryDark, fontSize: 28, fontWeight: '800', letterSpacing: 1.5 },
  referralLink: { ...typography.bodySm, color: colors.textMuted },
  referralError: { color: colors.danger, ...typography.bodySm },
  actionRow: { flexDirection: 'row', gap: spacing[4] },
  actionButton: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: spacing[3], flexWrap: 'wrap' },
  statBox: {
    flex: 1,
    minWidth: 76,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  statValue: { color: colors.primary, fontSize: 20, fontWeight: '800' },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: spacing[1], textAlign: 'center' },
  referralList: { gap: spacing[2] },
  referralRow: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: spacing[3],
    alignItems: 'center',
  },
  referralStatus: { ...typography.label, color: colors.text },
  referralDate: { ...typography.caption, color: colors.textMuted, marginTop: spacing[1] },
  rejectionReason: { ...typography.caption, color: colors.danger, flexShrink: 1, textAlign: 'right' },
  emptyText: { ...typography.body, color: colors.textMuted },
  refreshLink: { alignItems: 'center', paddingTop: spacing[3] },
  refreshText: { ...typography.label, color: colors.primary },
  developerBlock: {
    marginTop: spacing[6],
    paddingTop: spacing[6],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: spacing[1],
  },
  developerLabel: {
    ...typography.eyebrow,
    color: colors.textMuted,
  },
  developerName: {
    ...typography.h4,
    color: colors.primaryDark,
  },
  developerContact: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
});
