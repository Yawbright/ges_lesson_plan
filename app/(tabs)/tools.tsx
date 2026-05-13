import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

const tools = [
  {
    title: 'Lesson Plan',
    description: 'Create NaCCA/GES lesson plans from a saved scheme.',
    icon: 'sparkles-outline' as const,
    route: '/tools/lesson-plan',
  },
  {
    title: 'Scheme of Work',
    description: 'Generate or analyse a termly scheme.',
    icon: 'document-text-outline' as const,
    route: '/tools/scheme',
  },
  {
    title: 'Scheme Builder',
    description: 'Build a scheme week by week from mapped curriculum.',
    icon: 'calendar-outline' as const,
    route: '/tools/scheme-builder',
  },
  {
    title: 'Teaching Notes',
    description: 'Generate comprehensive notes from a saved lesson plan.',
    icon: 'reader-outline' as const,
    route: '/tools/teaching-notes',
  },
];

export default function ToolsLauncherScreen() {
  const [visible, setVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setVisible(true);
    }, []),
  );

  function closeLauncher() {
    setVisible(false);
    requestAnimationFrame(() => router.replace('/(tabs)/library'));
  }

  function openTool(route: string) {
    setVisible(false);
    requestAnimationFrame(() => router.push(route));
  }

  return (
    <View style={styles.screen}>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={closeLauncher}>
        <Pressable style={styles.backdrop} onPress={closeLauncher}>
          <Pressable style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Tools</Text>
                <Text style={styles.sub}>Choose what you want to create.</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={closeLauncher}>
                <Ionicons name="close" size={22} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.toolList}>
            {tools.map((tool) => (
              <Pressable
                key={tool.title}
                style={({ pressed }) => [styles.toolRow, pressed && styles.pressed]}
                onPress={() => openTool(tool.route)}
              >
                <View style={styles.iconBox}>
                  <Ionicons name={tool.icon} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolDescription}>{tool.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: { fontSize: 23, fontWeight: '700', color: colors.primaryDark },
  sub: { color: colors.textMuted, marginTop: 2 },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toolList: { gap: 10 },
  toolRow: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.82 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  toolDescription: { color: colors.textMuted, lineHeight: 18 },
});
