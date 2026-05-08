import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button } from '@/components/Button';
import { EmailPasswordAuthForm } from '@/components/EmailPasswordAuthForm';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import { useToast } from '@/components/ToastProvider';
import { signOut, useAuthSession } from '@/lib/auth';
import { CLASS_LEVEL_OPTIONS } from '@/lib/options';
import { buildReferralLink, loadReferralDashboard, type ReferralDashboard } from '@/lib/referrals';
import { loadTeacherProfile, saveTeacherProfile } from '@/lib/teacherProfile';
import { colors } from '@/theme/colors';

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
      setReferral(await loadReferralDashboard());
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
      message: `Join Ghana Lesson Planner with my referral link: ${referralLink}`,
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
        <EmailPasswordAuthForm subtitle="Use the same email and password as your Ghana Lesson Planner account." />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerPanel}>
        <Text style={styles.headerEyebrow}>Account</Text>
        <Text style={styles.headerTitle}>{session.user.email ?? 'Signed in'}</Text>
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
          <Text style={styles.sectionMeta}>5 credits after a referred teacher generates a lesson</Text>
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
              <Stat label="This month" value={`${referral?.stats.rewardsThisMonth ?? 0}/${referral?.stats.monthlyLimit ?? 5}`} />
              <Stat label="Pending" value={String(referral?.stats.pending ?? 0)} />
              <Stat label="Rewarded" value={String(referral?.stats.rewarded ?? 0)} />
              <Stat label="Rejected" value={String(referral?.stats.rejected ?? 0)} />
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

function formatStatus(status: string) {
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  lead: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  headerPanel: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  headerEyebrow: {
    color: '#DDEBE5',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  sectionMeta: { color: colors.textMuted, marginTop: 3, lineHeight: 18 },
  classEntryPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F7F9F4',
    marginBottom: 14,
  },
  subsectionTitle: { color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 2 },
  classEntryRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 10,
    marginTop: 12,
  },
  classSelectWrap: { flex: 1 },
  classSizeWrap: { flex: 1 },
  classList: { marginBottom: 14, borderTopWidth: 1, borderTopColor: colors.border },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  className: { color: colors.text, fontWeight: '800', fontSize: 15 },
  classSizeText: { color: colors.textMuted, marginTop: 2 },
  removeButton: { paddingHorizontal: 10, paddingVertical: 8 },
  removeButtonText: { color: colors.danger, fontWeight: '700' },
  referralCodePanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F7F9F4',
    marginBottom: 12,
  },
  referralLabel: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', fontWeight: '700' },
  referralCode: { color: colors.primaryDark, fontSize: 28, fontWeight: '900', marginTop: 3 },
  referralLink: { color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  referralError: { color: colors.danger, marginTop: 8, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  actionButton: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 3, textAlign: 'center' },
  referralList: { borderTopWidth: 1, borderTopColor: colors.border },
  referralRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    gap: 8,
  },
  referralStatus: { color: colors.text, fontWeight: '700' },
  referralDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  rejectionReason: { color: colors.danger, fontSize: 12, flexShrink: 1, textAlign: 'right' },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
  refreshLink: { alignItems: 'center', paddingTop: 8 },
  refreshText: { color: colors.primary, fontWeight: '700' },
});
