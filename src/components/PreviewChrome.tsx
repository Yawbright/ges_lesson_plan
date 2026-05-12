import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

type PreviewIcon = keyof typeof Ionicons.glyphMap;

export function PreviewHeader({
  title,
  onBack,
  onShare,
}: {
  title: string;
  onBack: () => void;
  onShare?: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.iconGroup}>
        <PreviewIconButton icon="arrow-back" label="Back" onPress={onBack} />
        {onShare ? <PreviewIconButton icon="share-social-outline" label="Share" onPress={onShare} /> : null}
      </View>
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export function PreviewActions({ children }: { children: React.ReactNode }) {
  return <View style={styles.actions}>{children}</View>;
}

export function PreviewActionButton({
  title,
  onPress,
  variant,
  loading,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}) {
  return (
    <Button
      title={title}
      onPress={onPress}
      variant={variant}
      loading={loading}
      style={styles.actionButton}
    />
  );
}

function PreviewIconButton({
  icon,
  label,
  onPress,
}: {
  icon: PreviewIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
    >
      <Ionicons name={icon} size={20} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 52,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 88,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  iconButtonPressed: { opacity: 0.82 },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: { minWidth: 88 },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
});
