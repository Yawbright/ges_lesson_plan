import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '@/theme/colors';

interface Props extends ViewProps {
  children: ReactNode;
  variant?: 'plain' | 'elevated' | 'muted' | 'accent';
  padding?: keyof typeof paddingMap;
  style?: ViewStyle | ViewStyle[];
}

const paddingMap = {
  none: 0,
  sm: spacing[5],
  md: spacing[6],
  lg: spacing[7],
} as const;

export function Card({ children, variant = 'plain', padding = 'md', style, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        styles.base,
        styles[variant],
        { padding: paddingMap[padding] },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plain: {},
  elevated: {
    ...shadows.md,
    borderColor: colors.borderSubtle,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderSubtle,
  },
  accent: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.primarySoft,
  },
});
