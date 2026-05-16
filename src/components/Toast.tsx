import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '@/theme/colors';

export type ToastType = 'success' | 'error' | 'info';

interface Props {
  visible: boolean;
  message: string;
  type?: ToastType;
}

const ICONS: Record<ToastType, 'checkmark-circle' | 'alert-circle' | 'information-circle'> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

export function Toast({ visible, message, type = 'success' }: Props) {
  if (!visible || !message) return null;

  const wrapStyle =
    type === 'success' ? styles.successWrap : type === 'info' ? styles.infoWrap : styles.errorWrap;
  const iconColor =
    type === 'success' ? colors.primary : type === 'info' ? colors.primaryDark : colors.danger;

  return (
    <View pointerEvents="none" style={[styles.wrap, wrapStyle]}>
      <View style={styles.iconWrap}>
        <Ionicons name={ICONS[type]} size={20} color={iconColor} />
      </View>
      <Text style={styles.text} numberOfLines={3}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing[6],
    right: spacing[6],
    bottom: spacing[8],
    zIndex: 50,
    borderRadius: radii.md,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    borderWidth: 1,
    ...shadows.md,
  },
  successWrap: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.primary,
  },
  errorWrap: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.danger,
  },
  infoWrap: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.borderStrong,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});
