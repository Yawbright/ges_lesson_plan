import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DatePickerField({ label, value, onChange, placeholder = 'Select date' }: Props) {
  const selectedDate = parseDate(value);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? new Date());
  const monthTitle = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);
  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  function openPicker() {
    setVisibleMonth(selectedDate ?? new Date());
    setOpen(true);
  }

  function shiftMonth(delta: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function selectDate(date: Date) {
    onChange(formatDateOnly(date));
    setOpen(false);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={openPicker} style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
        <Text style={[styles.triggerText, !selectedDate && styles.placeholder]}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </Text>
        <Text style={styles.calendarIcon}>Cal</Text>
      </Pressable>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdropPressable} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>Select date</Text>
                <Text style={styles.monthTitle}>{monthTitle}</Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setOpen(false)}>
                <Text style={styles.closeText}>X</Text>
              </Pressable>
            </View>

            <View style={styles.navRow}>
              <Pressable style={styles.navButton} onPress={() => shiftMonth(-1)}>
                <Text style={styles.navText}>Previous</Text>
              </Pressable>
              <Pressable style={styles.todayButton} onPress={() => selectDate(new Date())}>
                <Text style={styles.todayText}>Today</Text>
              </Pressable>
              <Pressable style={styles.navButton} onPress={() => shiftMonth(1)}>
                <Text style={styles.navText}>Next</Text>
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {days.map((day, index) => {
                const active = selectedDate ? isSameDate(day.date, selectedDate) : false;
                const today = isSameDate(day.date, new Date());
                return (
                  <Pressable
                    key={`${day.date.toISOString()}-${index}`}
                    onPress={() => selectDate(day.date)}
                    style={({ pressed }) => [
                      styles.dayCell,
                      !day.inMonth && styles.dayCellMuted,
                      today && styles.dayCellToday,
                      active && styles.dayCellActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !day.inMonth && styles.dayTextMuted,
                        active && styles.dayTextActive,
                      ]}
                    >
                      {day.date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function buildCalendarDays(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, inMonth: date.getMonth() === monthDate.getMonth() };
  });
}

function parseDate(value: string) {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  trigger: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: { fontSize: 16, color: colors.text, flex: 1 },
  placeholder: { color: colors.textMuted },
  calendarIcon: { color: colors.primary, fontSize: 18, marginLeft: 10 },
  pressed: { opacity: 0.82 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 16, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetEyebrow: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  monthTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 2 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.text, fontSize: 24, lineHeight: 26 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F4F7F1',
  },
  navText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  todayButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  todayText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  weekdayRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCellMuted: { opacity: 0.35 },
  dayCellToday: { borderColor: colors.accent },
  dayCellActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { color: colors.text, fontWeight: '800' },
  dayTextMuted: { color: colors.textMuted },
  dayTextActive: { color: '#fff' },
});
