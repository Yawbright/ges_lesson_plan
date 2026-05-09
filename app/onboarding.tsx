import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [classLevel, setClassLevel] = useState<string>(CLASS_LEVEL_OPTIONS[0]?.value ?? 'B7');
  const [classSize, setClassSize] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeacherProfile().then((profile) => {
      setTeacherName(profile.teacherName);
      setSchoolName(profile.schoolName);
      setSchoolDistrict(profile.schoolDistrict);
      const firstClass = Object.keys(profile.classSizes)[0];
      if (firstClass) {
        setClassLevel(firstClass);
        setClassSize(profile.classSizes[firstClass] ?? '');
      }
    });
  }, []);

  async function finish() {
    if (!teacherName.trim() || !schoolName.trim() || !classLevel || !classSize.trim()) {
      Alert.alert('Setup required', 'Add your teacher name, school, class, and class size.');
      return;
    }
    setSaving(true);
    try {
      await saveTeacherProfile({
        teacherName: teacherName.trim(),
        schoolName: schoolName.trim(),
        schoolDistrict: schoolDistrict.trim(),
        classSizes: { [classLevel]: classSize.trim() },
        onboardingCompleted: true,
      });
      router.replace('/(tabs)/schemes');
    } catch (err: unknown) {
      Alert.alert('Setup failed', err instanceof Error ? err.message : 'Could not save setup.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Complete Teacher Setup</Text>
      <Text style={styles.sub}>These details will appear on your generated lesson plans.</Text>
      <View style={styles.card}>
        <Field label="Teacher Full Name" value={teacherName} onChangeText={setTeacherName} />
        <Field label="Name of School" value={schoolName} onChangeText={setSchoolName} />
        <Field label="School District" value={schoolDistrict} onChangeText={setSchoolDistrict} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <SelectField label="Class" value={classLevel} options={CLASS_LEVEL_OPTIONS} onChange={setClassLevel} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Class size" value={classSize} onChangeText={(value) => setClassSize(value.replace(/[^0-9]/g, '').slice(0, 3))} keyboardType="number-pad" />
          </View>
        </View>
        <Button title="Finish setup" onPress={finish} loading={saving} />
      </View>
    </ScrollView>
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
  row: { flexDirection: 'row', gap: 10 },
});
