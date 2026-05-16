import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
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
import { defaultRuntimeSettings, loadRuntimeAppSettings } from '@/lib/appSettings';
import { logAppError } from '@/lib/logger';
import { colors, radii, shadows, spacing, typography } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const PURCHASING_UNAVAILABLE_MESSAGE =
  'Credit Purchasing is coming soon. You can only refer friends to get credit for now or contact admin for special credit grant';

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
  const [purchasingEnabled, setPurchasingEnabled] = useState(defaultRuntimeSettings.creditPurchasing.enabled);
  const [referralRewardCredits, setReferralRewardCredits] = useState(defaultRuntimeSettings.referralReward.credits);
  const [referralRewardActive, setReferralRewardActive] = useState(defaultRuntimeSettings.referralReward.active);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextBalance, nextPackages, nextTransactions, nextPurchases, settings] = await Promise.all([
        loadCreditBalance(),
        loadCreditPackages(),
        loadCreditTransactions(),
        loadCreditPurchases(),
        loadRuntimeAppSettings(),
      ]);
      setBalance(nextBalance);
      setPackages(nextPackages);
      setTransactions(nextTransactions);
      setPurchases(nextPurchases);
      setPurchasingEnabled(settings.creditPurchasing.enabled);
      setReferralRewardCredits(settings.referralReward.credits);
      setReferralRewardActive(settings.referralReward.active);
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
    if (!purchasingEnabled) {
      setCheckoutStatus(PURCHASING_UNAVAILABLE_MESSAGE);
      showToast({ message: PURCHASING_UNAVAILABLE_MESSAGE, type: 'error' });
      Alert.alert('Purchasing unavailable', PURCHASING_UNAVAILABLE_MESSAGE);
      return;
    }

    setCheckoutStatus('MoMo button pressed. Preparing checkout...');

    if (!selectedPackageId) {
      Alert.alert('Choose a package', 'Select a credit pack first.');
      setCheckoutStatus('Choose a credit pack first.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutStatus('Starting MoMo checkout...');
    try {
      const purchase = await initializeCreditPurchase(selectedPackageId);
      setPendingReference(purchase.reference);
      setCheckoutStatus(`Checkout created. Reference: ${purchase.reference}`);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setCheckoutStatus('Redirecting to MoMo checkout...');
        window.location.href = purchase.authorizationUrl;
      } else {
        await WebBrowser.openBrowserAsync(purchase.authorizationUrl);
        setCheckoutStatus('MoMo checkout opened. Return here and verify payment.');
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
        Alert.alert('Payment not complete', result.message ?? 'MoMo payment has not been confirmed yet.');
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
        <View style={styles.balanceHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Available credits</Text>
            <Text style={styles.balance}>{balance}</Text>
          </View>
          <View style={styles.balanceIcon}>
            <Ionicons name="sparkles" size={22} color={colors.primaryOn} />
          </View>
        </View>
        <Text style={styles.balanceNote}>All generation and parsing actions cost 1 credit.</Text>
      </View>

      {purchasingEnabled ? (
        <>
          <Text style={styles.sectionTitle}>Credit Packages</Text>
          <View style={styles.packages}>
            {packages.map((pack) => {
              const active = pack.id === selectedPackageId;
              const hasOriginalPrice = !!pack.originalPriceSubunit && pack.originalPriceSubunit > pack.priceSubunit;
              const totalCredits = pack.credits + Number(pack.bonusCredits ?? 0);
              return (
                <Pressable
                  key={pack.id}
                  style={[styles.packageCard, active && styles.packageCardActive]}
                  onPress={() => setSelectedPackageId(pack.id)}
                >
                  <View>
                    <View style={styles.packageHeader}>
                      <Text style={styles.packageTitle}>{pack.name}</Text>
                      {!!pack.badgeText && <Text style={styles.packageBadge}>{pack.badgeText}</Text>}
                    </View>
                    <View style={styles.priceLine}>
                      <Text style={styles.packageMeta}>{formatCreditPrice(pack.priceSubunit, pack.currency)}</Text>
                      {hasOriginalPrice ? (
                        <Text style={styles.originalPrice}>
                          {formatCreditPrice(Number(pack.originalPriceSubunit), pack.currency)}
                        </Text>
                      ) : null}
                    </View>
                    {pack.bonusCredits ? <Text style={styles.bonusText}>You receive {totalCredits} credits</Text> : null}
                  </View>
                  <Text style={styles.packageCredits}>{totalCredits}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button title="Pay with MoMo" onPress={startCheckout} loading={checkoutLoading} />

          {checkoutStatus ? (
            <View style={styles.statusPanel}>
              <Text style={styles.statusText}>{checkoutStatus}</Text>
            </View>
          ) : null}

          {pendingReference ? (
            <View style={styles.pendingPanel}>
              <Text style={styles.pendingTitle}>Payment pending</Text>
              <Text style={styles.pendingText}>After completing MoMo checkout, verify the payment here.</Text>
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
        </>
      ) : (
        <View style={styles.referralPanel}>
          <Text style={styles.referralTitle}>Need more credits?</Text>
          <Text style={styles.referralText}>
            {referralRewardActive
              ? `Invite other teachers with your referral link. When a referred teacher signs up and starts generating work, you can earn ${referralRewardCredits} ${referralRewardCredits === 1 ? 'credit' : 'credits'} per referral.`
              : 'Referral rewards are currently inactive. Check back later for more ways to earn credits.'}
          </Text>
          <Button title="Open referral details" variant="secondary" onPress={() => router.push('/(tabs)/profile')} />
        </View>
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
  content: { padding: spacing[7], paddingBottom: spacing[12], gap: spacing[6] },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  balancePanel: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.lg,
    padding: spacing[7],
    gap: spacing[3],
    ...shadows.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.eyebrow,
    color: 'rgba(255,255,255,0.78)',
  },
  balance: { color: colors.primaryOn, fontSize: 48, fontWeight: '800', marginTop: spacing[2], letterSpacing: -1 },
  balanceNote: { color: 'rgba(255,255,255,0.82)', ...typography.bodySm },
  sectionTitle: { ...typography.h2, color: colors.text, marginTop: spacing[2] },
  referralPanel: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.lg,
    padding: spacing[7],
    gap: spacing[4],
    ...shadows.sm,
  },
  referralTitle: { ...typography.h3, color: colors.text },
  referralText: { ...typography.body, color: colors.text },
  packages: { gap: spacing[4] },
  packageCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[5],
    ...shadows.sm,
  },
  packageCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  packageTitle: { ...typography.h4, color: colors.text },
  packageHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing[3] },
  packageBadge: {
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[1],
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  priceLine: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[1] },
  packageMeta: { ...typography.bodySm, color: colors.textMuted },
  originalPrice: { ...typography.bodySm, color: colors.textMuted, textDecorationLine: 'line-through' },
  bonusText: { ...typography.caption, color: colors.primary, marginTop: spacing[2], fontWeight: '700' },
  packageCredits: { fontSize: 26, color: colors.primary, fontWeight: '800' },
  pendingPanel: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.lg,
    padding: spacing[6],
    gap: spacing[4],
    ...shadows.sm,
  },
  pendingTitle: { ...typography.h4, color: colors.text },
  pendingText: { ...typography.bodySm, color: colors.text },
  statusPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[5],
  },
  statusText: { ...typography.bodySm, color: colors.textMuted },
  transactionRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[5],
    marginBottom: spacing[3],
    flexDirection: 'row',
    gap: spacing[5],
    alignItems: 'center',
  },
  transactionTitle: { ...typography.label, color: colors.text },
  transactionMeta: { ...typography.caption, color: colors.textMuted, marginTop: spacing[1] },
  transactionAmount: { color: colors.primary, fontSize: 20, fontWeight: '800' },
  transactionDebit: { color: colors.danger },
  receiptRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing[5],
    marginBottom: spacing[3],
    flexDirection: 'row',
    gap: spacing[5],
  },
  copyText: { ...typography.label, color: colors.primary },
  emptyText: { ...typography.body, color: colors.textMuted },
});
