import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { colors, radii, shadows, spacing, typography } from '@/theme/colors';
import type { SelectOption } from '@/lib/options';

interface Props {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
}

export function SelectField({
  label,
  value,
  options,
  placeholder = 'Select an option',
  onChange,
  disabled,
  helperText,
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? '',
    [options, value],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          disabled && styles.triggerDisabled,
          pressed && !disabled && styles.triggerPressed,
        ]}
      >
        <Text style={[styles.triggerText, !selectedLabel && styles.placeholder]} numberOfLines={1}>
          {selectedLabel || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => setOpen(false)}
                hitSlop={10}
                style={styles.sheetClose}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.optionRow,
                      active && styles.optionRowActive,
                      pressed && styles.optionRowPressed,
                    ]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={2}>
                      {option.label}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  trigger: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    minHeight: 48,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  triggerPressed: {
    borderColor: colors.primary,
  },
  triggerText: {
    ...typography.bodyLg,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.textSubtle,
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing[3],
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing[6],
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '78%',
    overflow: 'hidden',
    ...shadows.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  sheetTitle: {
    ...typography.h4,
    color: colors.text,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  list: {
    maxHeight: 460,
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[5],
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
    borderRadius: radii.md,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    marginTop: spacing[2],
  },
  optionRowActive: {
    backgroundColor: colors.primarySoft,
  },
  optionRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
