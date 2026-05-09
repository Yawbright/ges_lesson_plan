import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '@/components/Button';
import { useToast } from '@/components/ToastProvider';
import {
  formatCreditPrice,
  initializeCreditPurchase,
  loadCreditBalance,
  loadCreditPackages,
  loadCreditPurchases,
  loadCreditTransactions,
  type CreditPurchase,
  type CreditPackage,
  type CreditTransaction,
  verifyCreditPurchase,
} from '@/lib/credits';
import { logAppError } from '@/lib/logger';
import { colors } from '@/theme/colors';

export default function CreditsScreen() {
  const { showToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [purchases, setPurchases] = useState<CreditPurchase[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [pendingReference, setPendingReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextBalance, nextPackages, nextTransactions, nextPurchases] = await Promise.all([
        loadCreditBalance(),
        loadCreditPackages(),
        loadCreditTransactions(),
        loadCreditPurchases(),
      ]);
      setBalance(nextBalance);
      setPackages(nextPackages);
      setTransactions(nextTransactions);
      setPurchases(nextPurchases);
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
      logAppError({ source: 'client', action: 'start_checkout', message, metadata: { selectedPackageId } });
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
      logAppError({ source: 'client', action: 'verify_checkout', message: getMessage(err), metadata: { pendingReference } });
      Alert.alert('Verification failed', getMessage(err));
    } finally {
      setVerifyLoading(false);
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

      <Text style={styles.sectionTitle}>Payment Receipts</Text>
      {purchases.length ? (
        purchases.map((item) => (
          <View key={item.id} style={styles.receiptRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.transactionTitle}>{item.credits} credits</Text>
              <Text style={styles.transactionMeta}>
                {formatCreditPrice(item.amountSubunit, item.currency)} | {item.status}
              </Text>
              <Text style={styles.transactionMeta}>Ref: {item.reference}</Text>
              <Text style={styles.transactionMeta}>{new Date(item.paidAt ?? item.createdAt).toLocaleString()}</Text>
            </View>
            <Pressable
              onPress={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(item.reference);
                  showToast({ message: 'Receipt reference copied.' });
                }
              }}
            >
              <Text style={styles.copyText}>Copy ref</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No payments yet.</Text>
      )}

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
  receiptRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
  },
  copyText: { color: colors.primary, fontWeight: '800' },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
});
