import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

export function CreditUsagePreview({
  cost,
  balance,
  label,
  onBuyCredits,
}: {
  cost: number;
  balance: number;
  label: string;
  onBuyCredits: () => void;
}) {
  const enough = balance >= cost;
  const balanceAfter = balance - cost;

  return (
    <View style={[styles.wrap, !enough && styles.warning]}>
      <Text style={styles.title}>Credit usage</Text>
      <Text style={styles.text}>{label}</Text>
      <Text style={[styles.text, !enough && styles.warningText]}>
        {enough
          ? `Balance after this: ${balanceAfter} ${balanceAfter === 1 ? 'credit' : 'credits'}.`
          : `You have ${balance} ${balance === 1 ? 'credit' : 'credits'}. Refer friends to earn more credits.`}
      </Text>
      {!enough ? (
        <Button title="Get credits" variant="secondary" onPress={onBuyCredits} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#EEF5EF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  warning: { backgroundColor: '#FFF7ED', borderColor: colors.accent },
  title: { color: colors.primaryDark, fontWeight: '800', marginBottom: 4 },
  text: { color: colors.text, lineHeight: 19 },
  warningText: { color: colors.danger, fontWeight: '700' },
  button: { marginTop: 10 },
});
