import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import { CLASS_LEVEL_OPTIONS } from '@/lib/options';
import { loadTeacherProfile, saveTeacherProfile } from '@/lib/teacherProfile';
import { colors } from '@/theme/colors';

export default function OnboardingScreen() {
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
      Alert.alert('Setup required', 'Add your teacher name, school, and at least one class with class size.');
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Complete Teacher Setup</Text>
      <Text style={styles.sub}>These details will appear on your generated lesson plans.</Text>
      <View style={styles.card}>
        <Field label="Teacher Full Name" value={teacherName} onChangeText={setTeacherName} />
        <Field label="Name of School" value={schoolName} onChangeText={setSchoolName} />
        <Field label="School District" value={schoolDistrict} onChangeText={setSchoolDistrict} />
        <View style={styles.classPanel}>
          <Text style={styles.subTitle}>Classes Teaching</Text>
          <Text style={styles.meta}>Add every class you teach and its size.</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
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
            <View style={{ flex: 1 }}>
              <Field
                label="Class size"
                value={classSizeToAdd}
                onChangeText={(value) => setClassSizeToAdd(value.replace(/[^0-9]/g, '').slice(0, 3))}
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

        {Object.entries(classSizes).length ? (
          <View style={styles.classList}>
            {Object.entries(classSizes).map(([classLevel, size]) => (
              <View key={classLevel} style={styles.classRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.className}>{classLevel}</Text>
                  <Text style={styles.meta}>Class size: {size || 'Not set'}</Text>
                </View>
                <Pressable onPress={() => removeClassSize(classLevel)} style={styles.removeButton}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <Button title="Finish setup" onPress={finish} loading={saving} />
      </View>
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
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 24, fontWeight: '900', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
  },
  classPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F7F9F4',
    marginBottom: 14,
  },
  subTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  meta: { color: colors.textMuted, marginTop: 3 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  classList: { marginBottom: 14, borderTopWidth: 1, borderTopColor: colors.border },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  className: { color: colors.text, fontWeight: '800' },
  removeButton: { paddingHorizontal: 10, paddingVertical: 8 },
  removeText: { color: colors.danger, fontWeight: '700' },
});
