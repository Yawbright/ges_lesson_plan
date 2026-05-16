import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  active: boolean;
  label: string;
  estimateMs?: number;
};

const DEFAULT_ESTIMATE_MS = 45000;

export function GenerationProgress({
  active,
  label,
  estimateMs = DEFAULT_ESTIMATE_MS,
}: Props) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) {
      setStartedAt(null);
      setTick(0);
      return;
    }

    const now = Date.now();
    setStartedAt((current) => current ?? now);
    setTick(0);

    const timer = setInterval(() => {
      setTick((current) => current + 1);
    }, 700);

    return () => clearInterval(timer);
  }, [active]);

  const percent = useMemo(() => {
    if (!active || !startedAt) return 0;

    const elapsed = Date.now() - startedAt + tick;
    const safeEstimate = Math.max(15000, estimateMs);
    const curve = 1 - Math.exp(-elapsed / safeEstimate);
    const cap = elapsed > safeEstimate * 2 ? 97 : 94;
    const estimatedPercent = Math.round(Math.min(cap, Math.max(6, curve * 100)));

    return estimatedPercent;
  }, [active, estimateMs, startedAt, tick]);

  if (!active) return null;

  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: percent }}>
      <View style={styles.metaRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.help}>This can take a little longer for detailed teaching notes and full-week plans.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: colors.primaryDark,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  percent: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  track: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  help: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});
