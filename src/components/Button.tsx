import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows, spacing, typography } from '@/theme/colors';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth,
}: Props) {
  const isDisabled = disabled || loading;
  const textVariantStyle = textStylesByVariant[variant];
  const isFilled = variant === 'primary' || variant === 'danger' || variant === 'accent';
  const iconColor = isFilled
    ? variant === 'accent'
      ? colors.accentOn
      : colors.textOnPrimary
    : variant === 'ghost'
      ? colors.primary
      : colors.primaryDark;

  const sizeBoxStyle = sizeBox[size];
  const sizeTextStyle = sizeText[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        sizeBoxStyle,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && iconPosition === 'left' ? (
            <Ionicons name={icon} size={sizeIcon[size]} color={iconColor} />
          ) : null}
          <Text style={[styles.text, sizeTextStyle, textVariantStyle]}>{title}</Text>
          {icon && iconPosition === 'right' ? (
            <Ionicons name={icon} size={sizeIcon[size]} color={iconColor} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const sizeBox = StyleSheet.create({
  small: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    minHeight: 36,
  },
  medium: {
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[7],
    minHeight: 48,
  },
  large: {
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[8],
    minHeight: 56,
  },
});

const sizeText = StyleSheet.create({
  small: { ...typography.bodySm, fontWeight: '700' },
  medium: { ...typography.button },
  large: { ...typography.button, fontSize: 16 },
});

const sizeIcon: Record<'small' | 'medium' | 'large', number> = {
  small: 16,
  medium: 18,
  large: 20,
};

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  danger: {
    backgroundColor: colors.danger,
    ...shadows.sm,
  },
  accent: {
    backgroundColor: colors.accent,
    ...shadows.sm,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  text: {
    textAlign: 'center',
  },
  primaryText: { color: colors.textOnPrimary },
  dangerText: { color: colors.dangerOn },
  accentText: { color: colors.accentOn },
  secondaryText: { color: colors.primaryDark },
  ghostText: { color: colors.primary },
});

const textStylesByVariant: Record<NonNullable<Props['variant']>, { color: string }> = {
  primary: styles.primaryText,
  secondary: styles.secondaryText,
  ghost: styles.ghostText,
  danger: styles.dangerText,
  accent: styles.accentText,
};
