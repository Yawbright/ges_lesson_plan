import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { PreviewActionButton, PreviewActions, PreviewHeader } from '@/components/PreviewChrome';
import { SchemeTable } from '@/components/SchemeTable';
import { useToast } from '@/components/ToastProvider';
import { exportSchemePdf, shareScheme } from '@/lib/export';
import { deleteScheme, getSchemeById } from '@/lib/schemeStore';
import { colors } from '@/theme/colors';
import type { SchemeOfWork } from '@/types/scheme';

export default function SchemeDetailScreen() {
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [scheme, setScheme] = useState<SchemeOfWork | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const result = await getSchemeById(id);
      setScheme(result);
    }
    load();
  }, [id]);

  if (!scheme) {
    return (
      <View style={styles.container}>
        <Button title="Scheme not found" variant="secondary" onPress={() => Alert.alert('Missing scheme', 'This saved scheme could not be found locally.')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PreviewHeader
        title="Scheme"
        onBack={() => router.back()}
        onShare={() => shareScheme(scheme)}
      />
      <SchemeTable scheme={scheme} />
      <PreviewActions>
        <PreviewActionButton title="Save as PDF" onPress={() => exportSchemePdf(scheme)} />
        <PreviewActionButton
          title="Delete"
          variant="danger"
          onPress={async () => {
            const confirmed = await confirmRemoval(
              'Delete scheme',
              `Delete ${scheme.subject} ${scheme.classLevel} ${scheme.term}?`
            );
            if (!confirmed || !scheme.id) return;
            await deleteScheme(scheme.id);
            showToast({ message: 'Scheme deleted.' });
            router.back();
          }}
        />
      </PreviewActions>
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
});
