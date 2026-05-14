import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, Pressable } from 'react-native';
import { colors } from '@/theme/colors';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  isPasswordField?: boolean;
}

export function Field({ label, error, style, isPasswordField, ...rest }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = isPasswordField || rest.secureTextEntry;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, !!error && styles.inputError, isPassword && styles.inputWithIcon, style]}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconButton}
          >
            <Text style={styles.icon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: colors.danger,
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
