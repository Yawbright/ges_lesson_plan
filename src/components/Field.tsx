import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '@/theme/colors';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  isPasswordField?: boolean;
  helperText?: string;
}

export function Field({
  label,
  error,
  style,
  isPasswordField,
  helperText,
  multiline,
  ...rest
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = isPasswordField || rest.secureTextEntry;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          focused && styles.inputShellFocused,
          !!error && styles.inputShellError,
          multiline && styles.inputShellMultiline,
        ]}
      >
        <TextInput
          placeholderTextColor={colors.textSubtle}
          {...rest}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            rest.onBlur?.(event);
          }}
          secureTextEntry={isPassword && !showPassword}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            isPassword && styles.inputWithIcon,
            style,
          ]}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            onPress={() => setShowPassword((value) => !value)}
            style={styles.iconButton}
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing[6] },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing[3],
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[5],
    minHeight: 48,
  },
  inputShellMultiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing[4],
  },
  inputShellFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputShellError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: spacing[4],
    ...typography.bodyLg,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  inputWithIcon: {
    paddingRight: spacing[7],
  },
  iconButton: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing[3],
  },
  helper: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing[3],
  },
});
