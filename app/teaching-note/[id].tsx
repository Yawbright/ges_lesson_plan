import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { TeachingNotesView } from '@/components/TeachingNotesView';
import { useToast } from '@/components/ToastProvider';
import { deleteTeachingNotes, getTeachingNotesById } from '@/lib/teachingNotesStore';
import { exportTeachingNotesPdf } from '@/lib/export';
import { colors } from '@/theme/colors';
import type { TeachingNotes } from '@/types/teachingNotes';

export default function TeachingNoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();
  const [notes, setNotes] = useState<TeachingNotes | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setNotes(await getTeachingNotesById(id));
    }
    load();
  }, [id]);

  if (!notes) {
    return (
      <View style={styles.container}>
        <Button title="Teaching notes not found" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TeachingNotesView notes={notes} />
      <View style={styles.actions}>
        <Button title="Save Notes as PDF" onPress={() => exportTeachingNotesPdf(notes)} />
        <Button
          title="Delete"
          variant="danger"
          onPress={async () => {
            const confirmed = await confirmRemoval('Delete teaching notes', `Delete ${notes.title}?`);
            if (!confirmed || !notes.id) return;
            await deleteTeachingNotes(notes.id);
            showToast({ message: 'Teaching notes deleted.' });
            router.back();
          }}
        />
      </View>
    </View>
  );
}

function confirmRemoval(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return Promise.resolve(window.confirm(message));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
});
