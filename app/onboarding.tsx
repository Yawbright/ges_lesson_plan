import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import { CLASS_LEVEL_OPTIONS } from '@/lib/options';
import { loadTeacherProfile, saveTeacherProfile } from '@/lib/teacherProfile';
import { brandIdentity, colors, radii, spacing, typography } from '@/theme/colors';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolDistrict, setSchoolDistrict] = useState('');
  const [classSizes, setClassSizes] = useState<Record<string, string>>({});
  const [classToAdd, setClassToAdd] = useState<string>(CLASS_LEVEL_OPTIONS[0]?.value ?? 'B7');
  const [classSizeToAdd, setClassSizeToAdd] = useState('');
  const [saving, setSaving] = useState(false);

  const classOptions = useMemo(
    () =>
      CLASS_LEVEL_OPTIONS.map((option) => ({
        ...option,
        label: classSizes[option.value] !== undefined ? `${option.label} (added)` : option.label,
      })),
    [classSizes],
  );

  useEffect(() => {
    loadTeacherProfile().then((profile) => {
      setTeacherName(profile.teacherName);
      setSchoolName(profile.schoolName);
      setSchoolDistrict(profile.schoolDistrict);
      setClassSizes(profile.classSizes ?? {});
    });
  }, []);

  async function finish() {
    const cleanedClassSizes = cleanClassSizes(classSizes);
    if (!teacherName.trim() || !schoolName.trim() || !Object.keys(cleanedClassSizes).length) {
      Alert.alert(
        'Setup required',
        'Add your teacher name, school, and at least one class with class size.',
      );
      return;
    }
    setSaving(true);
    try {
      await saveTeacherProfile({
        teacherName: teacherName.trim(),
        schoolName: schoolName.trim(),
        schoolDistrict: schoolDistrict.trim(),
        classSizes: cleanedClassSizes,
        onboardingCompleted: true,
      });
      router.replace('/(tabs)/schemes');
    } catch (err: unknown) {
      Alert.alert('Setup failed', err instanceof Error ? err.message : 'Could not save setup.');
    } finally {
      setSaving(false);
    }
  }

  function skipSetup() {
    router.replace('/(tabs)/generate');
  }

  function addClassSize() {
    if (!classToAdd || !classSizeToAdd.trim()) {
      Alert.alert('Class size required', 'Select a class and enter its class size.');
      return;
    }
    const next = { ...classSizes, [classToAdd]: classSizeToAdd.trim() };
    setClassSizes(next);
    setClassSizeToAdd('');
    const nextAvailable = CLASS_LEVEL_OPTIONS.find((option) => next[option.value] === undefined);
    if (nextAvailable) setClassToAdd(nextAvailable.value);
  }

  function removeClassSize(classLevel: string) {
    setClassSizes((current) => {
      const next = { ...current };
      delete next[classLevel];
      return next;
    });
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing[7], paddingBottom: insets.bottom + spacing[10] },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroRow}>
        <View style={styles.heroIcon}>
          <Ionicons name="school-outline" size={22} color={colors.primary} />
        </View>
        <Text style={styles.eyebrow}>Step 1 of 1</Text>
      </View>
      <Text style={styles.heading}>Welcome to {brandIdentity.name}</Text>
      <Text style={styles.sub}>
        These details appear on every lesson plan you generate. You can edit them anytime from your
        Profile.
      </Text>

      <Card padding="lg" style={styles.formCard}>
        <Field label="Teacher full name" value={teacherName} onChangeText={setTeacherName} placeholder="e.g. Ama Mensah" />
        <Field label="Name of school" value={schoolName} onChangeText={setSchoolName} placeholder="e.g. Adenta M/A Basic School" />
        <Field label="School district" value={schoolDistrict} onChangeText={setSchoolDistrict} placeholder="e.g. Adenta Municipal" />

        <View style={styles.subhead}>
          <Text style={styles.sectionTitle}>Classes you teach</Text>
          <Text style={styles.sectionMeta}>Add every class with its size.</Text>
        </View>

        <Card variant="muted" padding="md" style={styles.addRowCard}>
          <View style={styles.addRow}>
            <View style={styles.addCol}>
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
            <View style={styles.addCol}>
              <Field
                label="Class size"
                value={classSizeToAdd}
                onChangeText={(value) => setClassSizeToAdd(value.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder="42"
              />
            </View>
          </View>
          <Button
            title={classSizes[classToAdd] !== undefined ? 'Update class size' : 'Add class'}
            variant="secondary"
            icon="add-circle-outline"
            onPress={addClassSize}
          />
        </Card>

        {Object.entries(classSizes).length ? (
          <View style={styles.classList}>
            {Object.entries(classSizes).map(([classLevel, size]) => (
              <View key={classLevel} style={styles.classRow}>
                <View style={styles.classBadge}>
                  <Text style={styles.classBadgeText}>{classLevel}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.className}>{classLevel}</Text>
                  <Text style={styles.classMeta}>Class size: {size || 'Not set'}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${classLevel}`}
                  onPress={() => removeClassSize(classLevel)}
                  style={styles.removeButton}
                  hitSlop={6}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actionStack}>
          <Button title="Finish setup" onPress={finish} loading={saving} icon="checkmark-circle-outline" />
          <Button title="Skip for now" variant="ghost" onPress={skipSetup} disabled={saving} />
        </View>
      </Card>
    </ScrollView>
  );
}

function cleanClassSizes(classSizes: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(classSizes)
      .map(([classLevel, size]) => [classLevel, size.trim()])
      .filter(([, size]) => size),
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing[6],
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[5],
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.primary,
  },
  heading: {
    ...typography.h1,
    color: colors.primaryDark,
    marginBottom: spacing[3],
  },
  sub: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing[7],
    maxWidth: 560,
  },
  formCard: {},
  subhead: {
    marginTop: spacing[5],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  sectionMeta: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginTop: 2,
  },
  addRowCard: {
    marginBottom: spacing[5],
  },
  addRow: {
    flexDirection: 'row',
    gap: spacing[4],
    flexWrap: 'wrap',
  },
  addCol: { flex: 1, minWidth: 140 },
  classList: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  classBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classBadgeText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  className: {
    ...typography.h4,
    color: colors.text,
  },
  classMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radii.md,
    backgroundColor: colors.dangerSoft,
  },
  removeText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 12,
  },
  actionStack: {
    gap: spacing[3],
    marginTop: spacing[3],
  },
});
