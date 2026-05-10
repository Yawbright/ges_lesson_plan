import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import {
  adminAdjustCredits,
  adminCreatePackage,
  adminDeletePackage,
  adminListReport,
  adminLoadDashboard,
  adminLoadUserDetail,
  adminSearchUsers,
  adminUpdateSettings,
  adminUpdatePackage,
  type AdminDashboard,
  type AdminLog,
  type AdminPage,
  type AdminPurchase,
  type AdminReferral,
  type AdminReportKind,
  type AdminTransaction,
  type AdminUser,
  type AdminUserDetail,
} from '@/lib/admin';
import {
  AdminAccessPanel,
  CreditsSection,
  LogsSection,
  Overview,
  PaymentsSection,
  ReferralsSection,
  SettingsSection,
  UsageSection,
  UsersSection,
} from '@/features/admin/AdminSections';
import { adminSections } from '@/features/admin/adminConstants';
import { styles } from '@/features/admin/adminStyles';
import type {
  AdminSection,
  AppSettingsDraft,
  PackageDraft,
  ReportFilter,
} from '@/features/admin/adminTypes';
import {
  emptyAppSettingsDraft,
  emptyFilter,
  getMessage,
  isAdminAuthError,
  preparePackageDraft,
  settingsToDraft,
  toPromotionValue,
  toSubunit,
  toWhole,
} from '@/features/admin/adminUtils';
import { colors } from '@/theme/colors';

export default function AdminScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const [section, setSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [amount, setAmount] = useState('10');
  const [reason, setReason] = useState('Admin credit adjustment');
  const [editingPackage, setEditingPackage] = useState<PackageDraft | null>(null);
  const [appSettingsDraft, setAppSettingsDraft] = useState<AppSettingsDraft>(emptyAppSettingsDraft());
  const [savingAppSettings, setSavingAppSettings] = useState(false);
  const [reportFilters, setReportFilters] = useState<Record<string, ReportFilter>>({
    credits: emptyFilter(),
    payments: emptyFilter(),
    usage: emptyFilter(),
    referrals: emptyFilter(),
    logs: emptyFilter(),
  });
  const [loadingMore, setLoadingMore] = useState<Record<AdminReportKind, boolean>>({
    transactions: false,
    purchases: false,
    referrals: false,
    logs: false,
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSigningIn, setAdminSigningIn] = useState(false);
  const sidebarVisible = sidebarOpen || !isMobile;
  const sidebarCollapsed = !isMobile && !sidebarOpen;

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await adminLoadDashboard();
      setDashboard(next);
      setUsers(next.users);
      setAppSettingsDraft(settingsToDraft(next.settings));
      setLoadError(null);
    } catch (err: unknown) {
      const message = getMessage(err);
      setLoadError(message);
      if (!isAdminAuthError(message)) {
        Alert.alert('Admin unavailable', message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const activeTitle = useMemo(() => adminSections.find((item) => item.id === section)?.label ?? 'Admin', [section]);

  async function searchUsers() {
    setSearching(true);
    try {
      const nextUsers = await adminSearchUsers(query);
      setUsers(nextUsers);
    } catch (err: unknown) {
      Alert.alert('Search failed', getMessage(err));
    } finally {
      setSearching(false);
    }
  }

  async function openUser(user: AdminUser) {
    try {
      const detail = await adminLoadUserDetail(user.user_id);
      setSelectedUser(detail);
      setSection('users');
    } catch (err: unknown) {
      Alert.alert('User details unavailable', getMessage(err));
    }
  }

  async function adjustCredits() {
    const target = selectedUser?.user;
    if (!target) return;
    const parsed = Number(amount);
    if (!Number.isInteger(parsed) || parsed === 0) {
      Alert.alert('Invalid amount', 'Enter a non-zero whole number.');
      return;
    }
    try {
      await adminAdjustCredits({ userId: target.user_id, amount: parsed, reason });
      Alert.alert('Credits updated', `${target.email} has been adjusted by ${parsed} credits.`);
      setSelectedUser(null);
      await load();
    } catch (err: unknown) {
      Alert.alert('Adjustment failed', getMessage(err));
    }
  }

  async function savePackage() {
    if (!editingPackage) return;
    const prepared = preparePackageDraft(editingPackage);
    const credits = toWhole(prepared.credits);
    if (!prepared.id || credits <= 0) {
      Alert.alert('Package incomplete', 'Enter the number of credits for this package.');
      return;
    }
    if (prepared.isNew && dashboard?.packages.some((pack) => pack.id === prepared.id)) {
      Alert.alert(
        'Package already exists',
        `A package for ${credits} credits already exists. Edit the existing package instead.`,
      );
      return;
    }
    try {
      const payload = {
        id: prepared.id,
        name: prepared.name,
        credits,
        originalPriceSubunit: toSubunit(prepared.originalPrice),
        priceSubunit: toSubunit(prepared.finalPrice),
        promotionType: prepared.promotionType,
        promotionValue: toPromotionValue(prepared),
        badgeText: prepared.badgeText,
        bonusCredits: prepared.promotionType === 'bonus' ? toWhole(prepared.promotionValue) : 0,
        promoStartsAt: prepared.startsAt.trim() || null,
        promoEndsAt: prepared.endsAt.trim() || null,
        active: prepared.active,
      };
      if (prepared.isNew) {
        await adminCreatePackage(payload);
      } else {
        await adminUpdatePackage(payload);
      }
      Alert.alert('Package saved', 'Credit package pricing has been updated.');
      setEditingPackage(null);
      await load();
    } catch (err: unknown) {
      Alert.alert('Could not save package', getMessage(err));
    }
  }

  async function removePackage(pack: PackageDraft) {
    Alert.alert('Remove package', 'If this package has payment history, it will be deactivated instead of deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await adminDeletePackage(pack.id);
            Alert.alert(result.deactivated ? 'Package deactivated' : 'Package deleted');
            setEditingPackage(null);
            await load();
          } catch (err: unknown) {
            Alert.alert('Could not remove package', getMessage(err));
          }
        },
      },
    ]);
  }

  async function saveAppSettings() {
    setSavingAppSettings(true);
    try {
      await adminUpdateSettings({
        starter_credits: {
          credits: toWhole(appSettingsDraft.starterCredits),
          active: appSettingsDraft.starterActive,
        },
        referral_reward: {
          credits: toWhole(appSettingsDraft.referralCredits),
          monthly_limit: toWhole(appSettingsDraft.referralMonthlyLimit),
          active: appSettingsDraft.referralActive,
        },
        feature_credit_costs: {
          lesson_generation: toWhole(appSettingsDraft.lessonCost),
          scheme_generation: toWhole(appSettingsDraft.schemeCost),
          scheme_parsing: toWhole(appSettingsDraft.parsingCost),
        },
        generated_file_retention: {
          days: Math.max(1, toWhole(appSettingsDraft.retentionDays)),
        },
        credit_purchasing: {
          enabled: appSettingsDraft.purchasingEnabled,
        },
      });
      Alert.alert('Settings saved', 'App settings have been updated.');
      await load();
    } catch (err: unknown) {
      Alert.alert('Could not save settings', getMessage(err));
    } finally {
      setSavingAppSettings(false);
    }
  }

  function updateReportFilter(key: string, patch: Partial<ReportFilter>) {
    setReportFilters((current) => ({ ...current, [key]: { ...(current[key] ?? emptyFilter()), ...patch } }));
  }

  async function loadMoreReport(report: AdminReportKind) {
    const currentPage = dashboard?.reportPages?.[report];
    if (!dashboard || !currentPage?.hasMore || loadingMore[report]) return;

    setLoadingMore((current) => ({ ...current, [report]: true }));
    try {
      if (report === 'transactions') {
        const next = await adminListReport<AdminTransaction>(report, currentPage.page + 1, currentPage.pageSize);
        appendReport(report, next, (items) => ({ transactions: [...dashboard.transactions, ...items] }));
      } else if (report === 'purchases') {
        const next = await adminListReport<AdminPurchase>(report, currentPage.page + 1, currentPage.pageSize);
        appendReport(report, next, (items) => ({ purchases: [...dashboard.purchases, ...items] }));
      } else if (report === 'referrals') {
        const next = await adminListReport<AdminReferral>(report, currentPage.page + 1, currentPage.pageSize);
        appendReport(report, next, (items) => ({ referrals: [...dashboard.referrals, ...items] }));
      } else {
        const next = await adminListReport<AdminLog>(report, currentPage.page + 1, currentPage.pageSize);
        appendReport(report, next, (items) => ({ logs: [...dashboard.logs, ...items] }));
      }
    } catch (err: unknown) {
      Alert.alert('Could not load more', getMessage(err));
    } finally {
      setLoadingMore((current) => ({ ...current, [report]: false }));
    }
  }

  function appendReport<T>(
    report: AdminReportKind,
    page: AdminPage<T>,
    mergeItems: (items: T[]) => Partial<AdminDashboard>,
  ) {
    setDashboard((current) => {
      if (!current) return current;
      return {
        ...current,
        ...mergeItems(page.items),
        reportPages: {
          ...current.reportPages,
          [report]: {
            items: [
              ...((current.reportPages?.[report]?.items ?? []) as T[]),
              ...page.items,
            ],
            page: page.page,
            pageSize: page.pageSize,
            hasMore: page.hasMore,
          },
        } as AdminDashboard['reportPages'],
      };
    });
  }

  async function signInAdmin() {
    if (!adminEmail.trim() || !adminPassword) {
      Alert.alert('Admin sign in', 'Enter the admin email and password.');
      return;
    }

    setAdminSigningIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (error) throw error;
      setDashboard(null);
      setLoadError(null);
      setAdminPassword('');
      await load();
    } catch (err: unknown) {
      setLoadError(getMessage(err));
      Alert.alert('Admin sign in failed', getMessage(err));
    } finally {
      setAdminSigningIn(false);
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
    <View style={styles.shell}>
      {sidebarVisible ? (
        <View style={[styles.sidebar, !isMobile && styles.sidebarDesktop, sidebarCollapsed && styles.sidebarCollapsed]}>
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>{sidebarCollapsed ? '' : 'Admin'}</Text>
            <Pressable style={styles.iconButton} onPress={() => setSidebarOpen((current) => !current)}>
              <MaterialCommunityIcons name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'} size={22} color={colors.primary} />
            </Pressable>
          </View>
          {adminSections.map((item) => {
            const active = item.id === section;
            return (
              <Pressable
                key={item.id}
                style={[styles.navItem, sidebarCollapsed && styles.navItemCollapsed, active && styles.navItemActive]}
                onPress={() => {
                  setSection(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <MaterialCommunityIcons name={item.icon} size={22} color={active ? '#fff' : colors.primary} />
                {sidebarCollapsed ? null : (
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View style={styles.main}>
        <View style={styles.topbar}>
          <Pressable style={styles.iconButton} onPress={() => setSidebarOpen((current) => !current)}>
            <MaterialCommunityIcons name="menu" size={24} color={colors.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>{activeTitle}</Text>
            <Text style={styles.subheading}>Control users, credits, payments, referrals, and system health.</Text>
          </View>
          <Button title="Refresh" variant="secondary" onPress={load} loading={refreshing} style={styles.refreshButton} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {dashboard ? (
            <>
              {section === 'overview' ? <Overview dashboard={dashboard} openUser={openUser} /> : null}
              {section === 'users' ? (
                <UsersSection
                  users={users}
                  query={query}
                  setQuery={setQuery}
                  searching={searching}
                  searchUsers={searchUsers}
                  openUser={openUser}
                  selectedUser={selectedUser}
                  closeUser={() => setSelectedUser(null)}
                  amount={amount}
                  setAmount={setAmount}
                  reason={reason}
                  setReason={setReason}
                  adjustCredits={adjustCredits}
                />
              ) : null}
              {section === 'credits' ? (
                <CreditsSection
                  transactions={dashboard.transactions}
                  filter={reportFilters.credits}
                  setFilter={(patch) => updateReportFilter('credits', patch)}
                  hasMore={Boolean(dashboard.reportPages?.transactions.hasMore)}
                  loadingMore={loadingMore.transactions}
                  loadMore={() => loadMoreReport('transactions')}
                />
              ) : null}
              {section === 'payments' ? (
                <PaymentsSection
                  purchases={dashboard.purchases}
                  filter={reportFilters.payments}
                  setFilter={(patch) => updateReportFilter('payments', patch)}
                  hasMore={Boolean(dashboard.reportPages?.purchases.hasMore)}
                  loadingMore={loadingMore.purchases}
                  loadMore={() => loadMoreReport('purchases')}
                />
              ) : null}
              {section === 'usage' ? (
                <UsageSection
                  transactions={dashboard.transactions}
                  filter={reportFilters.usage}
                  setFilter={(patch) => updateReportFilter('usage', patch)}
                  hasMore={Boolean(dashboard.reportPages?.transactions.hasMore)}
                  loadingMore={loadingMore.transactions}
                  loadMore={() => loadMoreReport('transactions')}
                />
              ) : null}
              {section === 'referrals' ? (
                <ReferralsSection
                  referrals={dashboard.referrals}
                  filter={reportFilters.referrals}
                  setFilter={(patch) => updateReportFilter('referrals', patch)}
                  hasMore={Boolean(dashboard.reportPages?.referrals.hasMore)}
                  loadingMore={loadingMore.referrals}
                  loadMore={() => loadMoreReport('referrals')}
                />
              ) : null}
              {section === 'logs' ? (
                <LogsSection
                  logs={dashboard.logs}
                  selectedLog={selectedLog}
                  setSelectedLog={setSelectedLog}
                  filter={reportFilters.logs}
                  setFilter={(patch) => updateReportFilter('logs', patch)}
                  hasMore={Boolean(dashboard.reportPages?.logs.hasMore)}
                  loadingMore={loadingMore.logs}
                  loadMore={() => loadMoreReport('logs')}
                />
              ) : null}
              {section === 'settings' ? (
                <SettingsSection
                  packages={dashboard.packages}
                  editingPackage={editingPackage}
                  setEditingPackage={setEditingPackage}
                  savePackage={savePackage}
                  removePackage={removePackage}
                  appSettings={appSettingsDraft}
                  setAppSettings={(patch) => setAppSettingsDraft((current) => ({ ...current, ...patch }))}
                  saveAppSettings={saveAppSettings}
                  savingAppSettings={savingAppSettings}
                />
              ) : null}
            </>
          ) : (
            <AdminAccessPanel
              loadError={loadError}
              adminEmail={adminEmail}
              setAdminEmail={setAdminEmail}
              adminPassword={adminPassword}
              setAdminPassword={setAdminPassword}
              signInAdmin={signInAdmin}
              adminSigningIn={adminSigningIn}
              refresh={load}
              refreshing={refreshing}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}
