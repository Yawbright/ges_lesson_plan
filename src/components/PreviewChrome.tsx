import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { colors, radii, shadows, spacing, typography } from '@/theme/colors';

type PreviewIcon = ComponentProps<typeof Ionicons>['name'];

export function PreviewHeader({
  title,
  subtitle,
  onBack,
  onShare,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onShare?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing[3] }]}>
      <PreviewIconButton icon="arrow-back" label="Back" onPress={onBack} />
      <View style={styles.titleWrap}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onShare ? (
        <PreviewIconButton icon="share-social-outline" label="Share" onPress={onShare} />
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

export function PreviewActions({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.actions, { paddingBottom: insets.bottom + spacing[5] }]}>{children}</View>
  );
}

export function PreviewActionButton({
  title,
  onPress,
  variant,
  loading,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  loading?: boolean;
  icon?: PreviewIcon;
}) {
  return (
    <Button
      title={title}
      onPress={onPress}
      variant={variant}
      loading={loading}
      icon={icon}
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
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
    >
      <Ionicons name={icon} size={20} color={colors.textOnPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  iconButtonPressed: { opacity: 0.7 },
  headerTitle: {
    ...typography.h4,
    color: colors.textOnPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    marginTop: 2,
  },
  spacer: { width: 38 },
  actions: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[5],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgElevated,
    gap: spacing[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    ...shadows.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: 132,
  },
});
