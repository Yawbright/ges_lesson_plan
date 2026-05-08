import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '@/components/Button';
import { useToast } from '@/components/ToastProvider';
import {
  formatCreditPrice,
  grantDeveloperCredits,
  initializeCreditPurchase,
  loadCreditBalance,
  loadCreditPackages,
  loadCreditTransactions,
  type CreditPackage,
  type CreditTransaction,
  verifyCreditPurchase,
} from '@/lib/credits';
import { colors } from '@/theme/colors';

export default function CreditsScreen() {
  const { showToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [pendingReference, setPendingReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextBalance, nextPackages, nextTransactions] = await Promise.all([
        loadCreditBalance(),
        loadCreditPackages(),
        loadCreditTransactions(),
      ]);
      setBalance(nextBalance);
      setPackages(nextPackages);
      setTransactions(nextTransactions);
      setSelectedPackageId((current) => current ?? nextPackages[0]?.id ?? null);
    } catch (err: unknown) {
      Alert.alert('Credits unavailable', getMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey || !event.shiftKey || event.key.toLowerCase() !== 'g') return;
      event.preventDefault();
      grantDevCreditsFromShortcut();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refresh]);

  async function startCheckout() {
    setCheckoutStatus('Paystack button pressed. Preparing checkout...');

    if (!selectedPackageId) {
      Alert.alert('Choose a package', 'Select a credit pack first.');
      setCheckoutStatus('Choose a credit pack first.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutStatus('Starting Paystack checkout...');
    try {
      const purchase = await initializeCreditPurchase(selectedPackageId);
      setPendingReference(purchase.reference);
      setCheckoutStatus(`Checkout created. Reference: ${purchase.reference}`);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setCheckoutStatus('Redirecting to Paystack checkout...');
        window.location.href = purchase.authorizationUrl;
      } else {
        await WebBrowser.openBrowserAsync(purchase.authorizationUrl);
        setCheckoutStatus('Paystack checkout opened. Return here and verify payment.');
      }
    } catch (err: unknown) {
      const message = getMessage(err);
      setCheckoutStatus(`Checkout failed: ${message}`);
      Alert.alert('Checkout failed', getMessage(err));
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function verifyCheckout() {
    if (!pendingReference) return;

    setVerifyLoading(true);
    try {
      const result = await verifyCreditPurchase(pendingReference);
      if (result.status === 'success') {
        setPendingReference(null);
        setBalance(result.balance);
        await refresh();
        showToast({ message: `${result.credits} credits added.` });
      } else {
        Alert.alert('Payment not complete', result.message ?? 'Paystack has not confirmed this payment yet.');
      }
    } catch (err: unknown) {
      Alert.alert('Verification failed', getMessage(err));
    } finally {
      setVerifyLoading(false);
    }
  }

  async function grantDevCreditsFromShortcut() {
    if (typeof window === 'undefined') {
      Alert.alert('Shortcut unavailable', 'Developer credit shortcut is available on web.');
      return;
    }

    const storedSecret = window.localStorage.getItem('glp-dev-credit-secret') ?? '';
    const secret =
      storedSecret ||
      window.prompt('Developer credit secret')?.trim() ||
      '';

    if (!secret) return;

    if (!storedSecret) {
      window.localStorage.setItem('glp-dev-credit-secret', secret);
    }

    const amountText = window.prompt('Credits to grant', '25')?.trim();
    if (!amountText) return;

    const amount = Number(amountText);
    if (!Number.isInteger(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a whole number greater than 0.');
      return;
    }

    try {
      const result = await grantDeveloperCredits({ secret, amount });
      setBalance(result.balance);
      await refresh();
      showToast({ message: `${result.amount} developer credits added. New balance: ${result.balance}.` });
    } catch (err: unknown) {
      window.localStorage.removeItem('glp-dev-credit-secret');
      Alert.alert('Developer grant failed', getMessage(err));
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.balancePanel}>
        <Text style={styles.label}>Available credits</Text>
        <Text style={styles.balance}>{balance}</Text>
        <Text style={styles.balanceNote}>All generation and parsing actions cost 1 credit.</Text>
      </View>

      <Text style={styles.sectionTitle}>Buy Credits</Text>
      <View style={styles.packages}>
        {packages.map((pack) => {
          const active = pack.id === selectedPackageId;
          return (
            <Pressable
              key={pack.id}
              style={[styles.packageCard, active && styles.packageCardActive]}
              onPress={() => setSelectedPackageId(pack.id)}
            >
              <View>
                <Text style={styles.packageTitle}>{pack.name}</Text>
                <Text style={styles.packageMeta}>
                  {formatCreditPrice(pack.priceSubunit, pack.currency)}
                </Text>
              </View>
              <Text style={styles.packageCredits}>{pack.credits}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button title="Pay with Paystack" onPress={startCheckout} loading={checkoutLoading} />

      {checkoutStatus ? (
        <View style={styles.statusPanel}>
          <Text style={styles.statusText}>{checkoutStatus}</Text>
        </View>
      ) : null}

      {pendingReference ? (
        <View style={styles.pendingPanel}>
          <Text style={styles.pendingTitle}>Payment pending</Text>
          <Text style={styles.pendingText}>After completing Paystack checkout, verify the payment here.</Text>
          <Button
            title="Verify payment"
            variant="secondary"
            onPress={verifyCheckout}
            loading={verifyLoading}
          />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {transactions.length ? (
        transactions.map((item) => (
          <View key={item.id} style={styles.transactionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.transactionTitle}>{item.description}</Text>
              <Text style={styles.transactionMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <Text style={[styles.transactionAmount, item.amount < 0 && styles.transactionDebit]}>
              {item.amount > 0 ? '+' : ''}
              {item.amount}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No credit activity yet.</Text>
      )}
    </ScrollView>
  );
}

function getMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  balancePanel: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 18,
    marginBottom: 22,
  },
  label: { color: '#DDEBE5', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  balance: { color: '#fff', fontSize: 46, fontWeight: '800', marginTop: 4 },
  balanceNote: { color: '#EAF2EE', marginTop: 6, lineHeight: 19 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginBottom: 12 },
  packages: { gap: 10, marginBottom: 14 },
  packageCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageCardActive: { borderColor: colors.primary, backgroundColor: '#F3F8F5' },
  packageTitle: { fontSize: 16, color: colors.text, fontWeight: '800' },
  packageMeta: { color: colors.textMuted, marginTop: 3 },
  packageCredits: { fontSize: 22, color: colors.primary, fontWeight: '800' },
  pendingPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    marginBottom: 22,
    gap: 10,
  },
  pendingTitle: { color: colors.text, fontWeight: '800' },
  pendingText: { color: colors.textMuted, lineHeight: 19 },
  statusPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
  },
  statusText: { color: colors.textMuted, lineHeight: 19 },
  transactionRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
  },
  transactionTitle: { color: colors.text, fontWeight: '700' },
  transactionMeta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  transactionAmount: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  transactionDebit: { color: colors.danger },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
});
