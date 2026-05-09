import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import { supabase } from '@/lib/supabase';
import {
  adminAdjustCredits,
  adminCreatePackage,
  adminDeletePackage,
  adminLoadDashboard,
  adminLoadUserDetail,
  adminSearchUsers,
  adminUpdatePackage,
  type AdminCreditPackage,
  type AdminDashboard,
  type AdminLog,
  type AdminPurchase,
  type AdminReferral,
  type AdminTransaction,
  type AdminUser,
  type AdminUserDetail,
} from '@/lib/admin';
import { colors } from '@/theme/colors';

type Section = 'overview' | 'users' | 'credits' | 'payments' | 'usage' | 'referrals' | 'logs' | 'settings';
type PromotionType = 'none' | 'bonus' | 'percent_discount' | 'fixed_discount' | 'custom';
type ReportFilter = { search: string; startDate: string; endDate: string; status: string };

const sections: Array<{ id: Section; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { id: 'overview', label: 'Overview', icon: 'view-dashboard-outline' },
  { id: 'users', label: 'Users', icon: 'account-group-outline' },
  { id: 'credits', label: 'Credits', icon: 'wallet-outline' },
  { id: 'payments', label: 'Payments', icon: 'script-text-outline' },
  { id: 'usage', label: 'Usage', icon: 'chart-timeline-variant' },
  { id: 'referrals', label: 'Referrals', icon: 'share-variant-outline' },
  { id: 'logs', label: 'Error Logs', icon: 'alert-circle-outline' },
  { id: 'settings', label: 'Settings', icon: 'cog-outline' },
];

const paymentStatusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Success', value: 'success' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Abandoned', value: 'abandoned' },
];

const creditKindOptions = [
  { label: 'All credit kinds', value: '' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Referral reward', value: 'referral_reward' },
  { label: 'Lesson generation', value: 'lesson_generation' },
  { label: 'Scheme generation', value: 'scheme_generation' },
  { label: 'Scheme parsing', value: 'scheme_parsing' },
  { label: 'Starter', value: 'starter' },
];

const usageKindOptions = [
  { label: 'All features', value: '' },
  { label: 'Lesson generation', value: 'lesson_generation' },
  { label: 'Scheme generation', value: 'scheme_generation' },
  { label: 'Custom scheme analysis', value: 'scheme_parsing' },
];

const referralStatusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rewarded', value: 'rewarded' },
  { label: 'Not rewarded', value: 'rejected' },
];

const logSeverityOptions = [
  { label: 'All severities', value: '' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
];

const promotionTypeOptions = [
  { label: 'None', value: 'none' },
  { label: 'Bonus credits', value: 'bonus' },
  { label: 'Discount (%)', value: 'percent_discount' },
  { label: 'Discount (GHS)', value: 'fixed_discount' },
  { label: 'Custom badge only', value: 'custom' },
];

export default function AdminScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const [section, setSection] = useState<Section>('overview');
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
  const [reportFilters, setReportFilters] = useState<Record<string, ReportFilter>>({
    credits: emptyFilter(),
    payments: emptyFilter(),
    usage: emptyFilter(),
    referrals: emptyFilter(),
    logs: emptyFilter(),
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

  const activeTitle = useMemo(() => sections.find((item) => item.id === section)?.label ?? 'Admin', [section]);

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
    try {
      const payload = {
        id: prepared.id,
        name: prepared.name,
        credits: toWhole(prepared.credits),
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

  function updateReportFilter(key: string, patch: Partial<ReportFilter>) {
    setReportFilters((current) => ({ ...current, [key]: { ...(current[key] ?? emptyFilter()), ...patch } }));
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
          {sections.map((item) => {
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
                />
              ) : null}
              {section === 'payments' ? (
                <PaymentsSection
                  purchases={dashboard.purchases}
                  filter={reportFilters.payments}
                  setFilter={(patch) => updateReportFilter('payments', patch)}
                />
              ) : null}
              {section === 'usage' ? (
                <UsageSection
                  transactions={dashboard.transactions}
                  filter={reportFilters.usage}
                  setFilter={(patch) => updateReportFilter('usage', patch)}
                />
              ) : null}
              {section === 'referrals' ? (
                <ReferralsSection
                  referrals={dashboard.referrals}
                  filter={reportFilters.referrals}
                  setFilter={(patch) => updateReportFilter('referrals', patch)}
                />
              ) : null}
              {section === 'logs' ? (
                <LogsSection
                  logs={dashboard.logs}
                  selectedLog={selectedLog}
                  setSelectedLog={setSelectedLog}
                  filter={reportFilters.logs}
                  setFilter={(patch) => updateReportFilter('logs', patch)}
                />
              ) : null}
              {section === 'settings' ? (
                <SettingsSection
                  packages={dashboard.packages}
                  editingPackage={editingPackage}
                  setEditingPackage={setEditingPackage}
                  savePackage={savePackage}
                  removePackage={removePackage}
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

function AdminAccessPanel(props: {
  loadError: string | null;
  adminEmail: string;
  setAdminEmail: (value: string) => void;
  adminPassword: string;
  setAdminPassword: (value: string) => void;
  signInAdmin: () => void;
  adminSigningIn: boolean;
  refresh: () => void;
  refreshing: boolean;
}) {
  const authIssue = isAdminAuthError(props.loadError);
  return (
    <Panel title={authIssue ? 'Admin Sign In Required' : 'Admin Data Unavailable'}>
      <Text style={styles.bodyText}>
        {authIssue
          ? 'You are signed in, but this browser session is not using an admin account. Sign in with the admin account to continue.'
          : 'The admin shell loaded, but the dashboard data could not be retrieved. Use Refresh to try again.'}
      </Text>
      {props.loadError ? <Text style={styles.errorText}>{props.loadError}</Text> : null}
      {authIssue ? (
        <View style={styles.adminLoginBox}>
          <Field
            label="Admin email"
            value={props.adminEmail}
            onChangeText={props.setAdminEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="admin@example.com"
          />
          <Field
            label="Admin password"
            value={props.adminPassword}
            onChangeText={props.setAdminPassword}
            secureTextEntry
            placeholder="Password"
          />
          <Button title="Sign in to admin" onPress={props.signInAdmin} loading={props.adminSigningIn} />
        </View>
      ) : null}
      <View style={styles.buttonRow}>
        <Button title="Refresh" variant={authIssue ? 'ghost' : 'primary'} onPress={props.refresh} loading={props.refreshing} />
      </View>
    </Panel>
  );
}

function ReportFilters(props: {
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
  statusLabel: string;
  statusOptions: Array<{ label: string; value: string }>;
  searchPlaceholder: string;
}) {
  return (
    <View style={styles.filterPanel}>
      <Field
        label="Search"
        value={props.filter.search}
        onChangeText={(value) => props.setFilter({ search: value })}
        placeholder={props.searchPlaceholder}
        autoCapitalize="none"
        style={styles.filterInput}
      />
      <Field
        label="Start date"
        value={props.filter.startDate}
        onChangeText={(value) => props.setFilter({ startDate: value })}
        placeholder="YYYY-MM-DD"
        style={styles.filterInput}
      />
      <Field
        label="End date"
        value={props.filter.endDate}
        onChangeText={(value) => props.setFilter({ endDate: value })}
        placeholder="YYYY-MM-DD"
        style={styles.filterInput}
      />
      <View style={styles.filterSelect}>
        <SelectField
          label={props.statusLabel}
          value={props.filter.status}
          options={props.statusOptions}
          onChange={(value) => props.setFilter({ status: value })}
        />
      </View>
      <Button title="Clear" variant="ghost" onPress={() => props.setFilter(emptyFilter())} style={styles.clearFilterButton} />
    </View>
  );
}

function Overview({ dashboard, openUser }: { dashboard: AdminDashboard; openUser: (user: AdminUser) => void }) {
  const { overview } = dashboard;
  return (
    <>
      <View style={styles.metricGrid}>
        <Metric title="Revenue Today" value={formatMoney(overview.revenueTodaySubunit)} tone="money" />
        <Metric title="This Month" value={formatMoney(overview.revenueMonthSubunit)} tone="money" />
        <Metric title="Total Revenue" value={formatMoney(overview.revenueTotalSubunit)} tone="money" />
        <Metric title="Credits Sold" value={String(overview.creditsSold)} />
        <Metric title="Credits Used" value={String(overview.creditsUsed)} />
        <Metric title="Outstanding Credits" value={String(overview.outstandingCredits)} />
        <Metric title="Users" value={String(overview.totalUsers)} />
        <Metric title="Completed Profiles" value={String(overview.completedProfiles)} />
        <Metric title="Errors" value={String(overview.errors)} tone="danger" />
      </View>
      <View style={styles.twoColumn}>
        <Panel title="Recent Users">
          {dashboard.users.length ? (
            dashboard.users.slice(0, 6).map((user) => <UserRow key={user.user_id} user={user} onPress={() => openUser(user)} />)
          ) : (
            <Text style={styles.emptyText}>No users are available yet.</Text>
          )}
        </Panel>
        <Panel title="Recent Payments">
          {dashboard.purchases.length ? (
            dashboard.purchases.slice(0, 6).map((item) => <PaymentRow key={item.id} purchase={item} />)
          ) : (
            <Text style={styles.emptyText}>No payment records yet.</Text>
          )}
        </Panel>
      </View>
    </>
  );
}

function UsersSection(props: {
  users: AdminUser[];
  query: string;
  setQuery: (value: string) => void;
  searching: boolean;
  searchUsers: () => void;
  openUser: (user: AdminUser) => void;
  selectedUser: AdminUserDetail | null;
  closeUser: () => void;
  amount: string;
  setAmount: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  adjustCredits: () => void;
}) {
  return (
    <>
      <Panel title="Users">
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Field label="Search by email or user ID" value={props.query} onChangeText={props.setQuery} autoCapitalize="none" />
          </View>
          <Button title="Search" onPress={props.searchUsers} loading={props.searching} style={styles.searchButton} />
        </View>
        <Text style={styles.helpText}>Latest users load automatically. Search only when you need a specific account.</Text>
        {props.users.length ? (
          props.users.map((user) => <UserRow key={user.user_id} user={user} onPress={() => props.openUser(user)} />)
        ) : (
          <Text style={styles.emptyText}>No users found.</Text>
        )}
      </Panel>
      {props.selectedUser?.user ? (
        <Panel title="User Details">
          <UserDetails detail={props.selectedUser} />
          <View style={styles.formGrid}>
            <Field label="Credit adjustment" value={props.amount} onChangeText={props.setAmount} keyboardType="number-pad" />
            <Field label="Reason" value={props.reason} onChangeText={props.setReason} />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Apply adjustment" onPress={props.adjustCredits} />
            <Button title="Close" variant="ghost" onPress={props.closeUser} />
          </View>
        </Panel>
      ) : null}
    </>
  );
}

function CreditsSection(props: {
  transactions: AdminTransaction[];
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
}) {
  const filtered = filterTransactions(props.transactions, props.filter, []);
  const adjustments = filtered.filter((item) => item.kind === 'adjustment');
  return (
    <Panel title="Credit Adjustments">
      <ReportFilters
        filter={props.filter}
        setFilter={props.setFilter}
        statusLabel="Credit kind"
        statusOptions={creditKindOptions}
        searchPlaceholder="Search email, user ID, or description"
      />
      {(adjustments.length ? adjustments : filtered).length ? (
        (adjustments.length ? adjustments : filtered).map((item) => <TransactionRow key={item.id} item={item} />)
      ) : (
        <Text style={styles.emptyText}>No credit adjustments yet.</Text>
      )}
    </Panel>
  );
}

function PaymentsSection(props: {
  purchases: AdminPurchase[];
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
}) {
  const purchases = filterPurchases(props.purchases, props.filter);
  return (
    <Panel title="Payment Receipts">
      <ReportFilters
        filter={props.filter}
        setFilter={props.setFilter}
        statusLabel="Payment status"
        statusOptions={paymentStatusOptions}
        searchPlaceholder="Search email, reference, or package"
      />
      {purchases.length ? (
        purchases.map((item) => <PaymentRow key={item.id} purchase={item} />)
      ) : (
        <Text style={styles.emptyText}>No payment records yet.</Text>
      )}
    </Panel>
  );
}

function UsageSection(props: {
  transactions: AdminTransaction[];
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
}) {
  const usage = filterTransactions(props.transactions, props.filter, [
    'lesson_generation',
    'scheme_generation',
    'scheme_parsing',
  ]);
  return (
    <Panel title="Usage History">
      <ReportFilters
        filter={props.filter}
        setFilter={props.setFilter}
        statusLabel="Feature"
        statusOptions={usageKindOptions}
        searchPlaceholder="Search email, user ID, or description"
      />
      {usage.length ? (
        usage.map((item) => <TransactionRow key={item.id} item={item} />)
      ) : (
        <Text style={styles.emptyText}>No credit-consuming usage yet.</Text>
      )}
    </Panel>
  );
}

function ReferralsSection(props: {
  referrals: AdminReferral[];
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
}) {
  const referrals = filterReferrals(props.referrals, props.filter);
  return (
    <Panel title="Referral Activity">
      <ReportFilters
        filter={props.filter}
        setFilter={props.setFilter}
        statusLabel="Reward status"
        statusOptions={referralStatusOptions}
        searchPlaceholder="Search referrer, referred user, or code"
      />
      {referrals.length ? (
        referrals.map((item) => (
          <View key={item.id} style={styles.dataRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.referrer_email || item.referrer_user_id}</Text>
              <Text style={styles.meta}>Referred: {item.referred_email || item.referred_user_id}</Text>
              <Text style={styles.meta}>Code: {item.referral_code}</Text>
              {item.rejection_reason ? <Text style={styles.meta}>Reason: {item.rejection_reason}</Text> : null}
            </View>
            <StatusPill status={item.status === 'rejected' ? 'not rewarded' : item.status} />
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No referrals yet.</Text>
      )}
    </Panel>
  );
}

function LogsSection(props: {
  logs: AdminLog[];
  selectedLog: string | null;
  setSelectedLog: (id: string | null) => void;
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
}) {
  const logs = filterLogs(props.logs, props.filter);
  return (
    <Panel title="Error Logs">
      <ReportFilters
        filter={props.filter}
        setFilter={props.setFilter}
        statusLabel="Severity"
        statusOptions={logSeverityOptions}
        searchPlaceholder="Search email, source, action, or message"
      />
      {logs.length ? logs.map((log) => {
        const open = props.selectedLog === log.id;
        return (
          <Pressable key={log.id} style={styles.dataRow} onPress={() => props.setSelectedLog(open ? null : log.id)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{log.action}</Text>
              <Text style={styles.meta}>{log.source} | {log.severity} | {new Date(log.created_at).toLocaleString()}</Text>
              <Text style={styles.bodyText}>{log.message}</Text>
              <Text style={styles.meta}>User: {log.email || log.user_id || 'Not available'}</Text>
              {open ? <Text style={styles.codeText}>{JSON.stringify(log.metadata ?? {}, null, 2)}</Text> : null}
            </View>
          </Pressable>
        );
      }) : <Text style={styles.emptyText}>No logs yet.</Text>}
    </Panel>
  );
}

function SettingsSection(props: {
  packages: AdminCreditPackage[];
  editingPackage: PackageDraft | null;
  setEditingPackage: (value: PackageDraft | null) => void;
  savePackage: () => void;
  removePackage: (pack: PackageDraft) => void;
}) {
  const draft = props.editingPackage ? preparePackageDraft(props.editingPackage) : null;
  const setDraft = (patch: Partial<PackageDraft>) => {
    if (!props.editingPackage) return;
    props.setEditingPackage(preparePackageDraft({ ...props.editingPackage, ...patch }));
  };

  return (
    <>
      <View style={styles.settingsIntro}>
        <Text style={styles.settingsIntroTitle}>Settings</Text>
        <Text style={styles.settingsIntroText}>
          Manage credit packages, promotions, starter credits, referral reward limits, feature credit costs,
          Paystack mode, and parser backend controls from this area.
        </Text>
      </View>
      <Panel title="Credit Pricing & Promotions">
        <View style={styles.buttonRow}>
          <Button title="Add package" onPress={() => props.setEditingPackage(newPackageDraft(props.packages))} />
        </View>
        {props.packages.length ? (
          <View style={styles.packageGrid}>
            {props.packages.map((pack) => {
              const packDraft = toDraft(pack);
              return (
                <View key={pack.id} style={styles.packageAdminCard}>
                  <View style={styles.packageAdminMain}>
                    <Text style={styles.packageAdminTitle}>{pack.credits} credits</Text>
                    <Text style={styles.meta}>ID: {pack.id}</Text>
                    <Text style={styles.meta}>Original: {formatMoney(pack.original_price_subunit ?? pack.price_subunit)}</Text>
                    <Text style={styles.meta}>Final: {formatMoney(pack.price_subunit)}</Text>
                    <Text style={styles.meta}>Promotion: {promotionLabel(pack)}</Text>
                    <Text style={styles.meta}>Badge: {pack.badge_text || '-'}</Text>
                  </View>
                  <View style={styles.packageAdminActions}>
                    <Text style={[styles.packageStatus, pack.active ? styles.packageStatusActive : styles.packageStatusInactive]}>
                      {pack.active ? 'Active' : 'Inactive'}
                    </Text>
                    <Button
                      title="Edit"
                      variant="secondary"
                      onPress={() => props.setEditingPackage(packDraft)}
                      style={styles.packageActionButton}
                    />
                    <Button
                      title="Delete/deactivate"
                      variant="danger"
                      onPress={() => props.removePackage(packDraft)}
                      style={styles.packageActionButton}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No credit packages are available.</Text>
        )}
      </Panel>
      {draft ? (
        <Panel title={draft.isNew ? 'Add Credit Package' : `Edit ${draft.name}`}>
          <View style={styles.formGrid}>
            <Field label="Package ID" value={draft.id} onChangeText={(value) => setDraft({ id: toPackageId(value) })} editable={draft.isNew} />
            <Field label="Package name" value={draft.name} onChangeText={(value) => setDraft({ name: value })} />
            <Field label="Credits" value={draft.credits} onChangeText={(value) => setDraft({ credits: value })} keyboardType="number-pad" />
            <Field label="Original price (GHS)" value={draft.originalPrice} onChangeText={(value) => setDraft({ originalPrice: value })} keyboardType="decimal-pad" />
            <View style={styles.formField}>
              <SelectField
                label="Promotion type"
                value={draft.promotionType}
                options={promotionTypeOptions}
                onChange={(value) => setDraft({ promotionType: value as PromotionType, promotionValue: '0' })}
              />
            </View>
            {draft.promotionType !== 'none' && draft.promotionType !== 'custom' ? (
              <Field
                label={promotionValueLabel(draft.promotionType)}
                value={draft.promotionValue}
                onChangeText={(value) => setDraft({ promotionValue: value })}
                keyboardType="decimal-pad"
              />
            ) : null}
            <Field label="Final price (GHS)" value={draft.finalPrice} editable={false} />
            <Field label="Badge text" value={draft.badgeText} editable={draft.promotionType === 'custom'} onChangeText={(value) => setDraft({ badgeText: value })} />
            <Field label="Starts at" value={draft.startsAt} onChangeText={(value) => setDraft({ startsAt: value })} placeholder="YYYY-MM-DD or ISO date" />
            <Field label="Ends at" value={draft.endsAt} onChangeText={(value) => setDraft({ endsAt: value })} placeholder="YYYY-MM-DD or ISO date" />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.rowTitle}>Active</Text>
            <Switch value={draft.active} onValueChange={(value) => setDraft({ active: value })} />
          </View>
          <View style={styles.previewBox}>
            <Text style={styles.rowTitle}>Customer preview</Text>
            <Text style={styles.bodyText}>{draft.credits} credits {draft.badgeText ? `| ${draft.badgeText}` : ''}</Text>
            <Text style={styles.bodyText}>
              {formatMoney(toSubunit(draft.finalPrice))}
              {toSubunit(draft.originalPrice) > toSubunit(draft.finalPrice) ? `  ${formatMoney(toSubunit(draft.originalPrice))}` : ''}
            </Text>
            {draft.promotionType === 'bonus' ? (
              <Text style={styles.meta}>User receives {toWhole(draft.credits) + toWhole(draft.promotionValue)} credits.</Text>
            ) : null}
          </View>
          <View style={styles.editActionPanel}>
            <Button title="Save package" onPress={props.savePackage} style={styles.editActionButton} />
            {!draft.isNew ? (
              <Button
                title="Delete/deactivate"
                variant="danger"
                onPress={() => props.removePackage(draft)}
                style={styles.editActionButton}
              />
            ) : null}
            <Button title="Cancel" variant="ghost" onPress={() => props.setEditingPackage(null)} style={styles.editActionButton} />
          </View>
        </Panel>
      ) : null}
    </>
  );
}

function UserDetails({ detail }: { detail: AdminUserDetail }) {
  const user = detail.user;
  if (!user) return <Text style={styles.emptyText}>User was not found.</Text>;
  const classes = Object.entries(user.class_sizes ?? {});
  return (
    <>
      <View style={styles.detailGrid}>
        <Detail label="Email" value={user.email || 'No email'} />
        <Detail label="Balance" value={`${user.balance} credits`} />
        <Detail label="Teacher" value={user.teacher_name || 'Not set'} />
        <Detail label="School" value={user.school_name || 'Not set'} />
        <Detail label="District" value={user.school_district || 'Not set'} />
        <Detail label="Referral code" value={user.referral_code || 'Not generated'} />
        <Detail label="Invited by" value={user.referred_by_email || user.invitation_code || 'Not available'} />
        <Detail label="Status" value={user.profile_completed ? 'Profile complete' : 'Profile incomplete'} />
      </View>
      <Text style={styles.sectionLabel}>Classes</Text>
      <Text style={styles.bodyText}>{classes.length ? classes.map(([name, size]) => `${name}: ${size}`).join(', ') : 'No classes set.'}</Text>
      <Text style={styles.sectionLabel}>Recent user activity</Text>
      {detail.transactions.slice(0, 5).map((item) => <TransactionRow key={item.id} item={item} />)}
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Metric({ title, value, tone }: { title: string; value: string; tone?: 'money' | 'danger' }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, tone === 'money' && styles.metricMoney, tone === 'danger' && styles.metricDanger]}>{value}</Text>
    </View>
  );
}

function UserRow({ user, onPress }: { user: AdminUser; onPress: () => void }) {
  return (
    <Pressable style={styles.dataRow} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{user.email || 'No email'}</Text>
        <Text style={styles.meta}>Balance: {user.balance} credits | Joined {new Date(user.created_at).toLocaleDateString()}</Text>
        <Text style={styles.meta}>{user.teacher_name || 'No teacher profile'} {user.is_admin ? '| Admin' : ''}</Text>
      </View>
      <StatusPill status={user.email_confirmed_at ? 'active' : 'unconfirmed'} />
    </Pressable>
  );
}

function PaymentRow({ purchase }: { purchase: AdminPurchase }) {
  return (
    <View style={styles.dataRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{purchase.email || purchase.user_id}</Text>
        <Text style={styles.meta}>{purchase.credits} credits | {formatMoney(purchase.amount_subunit)} | {purchase.currency}</Text>
        <Text style={styles.meta}>Ref: {purchase.paystack_reference}</Text>
        <Text style={styles.meta}>{new Date(purchase.verified_at ?? purchase.created_at).toLocaleString()}</Text>
      </View>
      <StatusPill status={purchase.status} />
    </View>
  );
}

function TransactionRow({ item }: { item: AdminTransaction }) {
  return (
    <View style={styles.dataRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.description}</Text>
        <Text style={styles.meta}>{item.email || item.user_id} | {item.kind}</Text>
        <Text style={styles.meta}>{new Date(item.created_at).toLocaleString()} | Balance after: {item.balance_after}</Text>
      </View>
      <Text style={[styles.amount, item.amount < 0 && styles.debit]}>{item.amount > 0 ? '+' : ''}{item.amount}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const danger = ['failed', 'error', 'not rewarded', 'unconfirmed'].includes(status);
  const good = ['success', 'active', 'rewarded'].includes(status);
  return <Text style={[styles.pill, danger && styles.pillDanger, good && styles.pillGood]}>{status}</Text>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

type PackageDraft = {
  id: string;
  name: string;
  credits: string;
  originalPrice: string;
  finalPrice: string;
  promotionType: PromotionType;
  promotionValue: string;
  bonusCredits: string;
  badgeText: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  isNew?: boolean;
};

function toDraft(pack: AdminCreditPackage): PackageDraft {
  return {
    id: pack.id,
    name: pack.name,
    credits: String(pack.credits),
    originalPrice: String(((pack.original_price_subunit ?? pack.price_subunit) / 100).toFixed(2)),
    finalPrice: String((pack.price_subunit / 100).toFixed(2)),
    promotionType: normalizePromotionType(pack.promotion_type),
    promotionValue: String(pack.bonus_credits || pack.promotion_value || 0),
    bonusCredits: String(pack.bonus_credits ?? 0),
    badgeText: pack.badge_text ?? '',
    startsAt: pack.promo_starts_at ?? '',
    endsAt: pack.promo_ends_at ?? '',
    active: pack.active,
    isNew: false,
  };
}

function newPackageDraft(packages: AdminCreditPackage[]): PackageDraft {
  const nextCredits = 10;
  const id = uniquePackageId(`credits_${nextCredits}`, packages);
  return preparePackageDraft({
    id,
    name: `${nextCredits} credits`,
    credits: String(nextCredits),
    originalPrice: '5.00',
    finalPrice: '5.00',
    promotionType: 'none',
    promotionValue: '0',
    bonusCredits: '0',
    badgeText: '',
    startsAt: '',
    endsAt: '',
    active: true,
    isNew: true,
  });
}

function promotionLabel(pack: AdminCreditPackage) {
  if (pack.bonus_credits) return `+${pack.bonus_credits} credits`;
  if (pack.promotion_type === 'percent_discount') return `${pack.promotion_value}% discount`;
  if (pack.promotion_type === 'fixed_discount') return `GHS ${(Number(pack.promotion_value) / 100).toFixed(2)} off`;
  if (pack.promotion_type && pack.promotion_type !== 'none') return `${pack.promotion_type} ${pack.promotion_value}`;
  return '-';
}

function preparePackageDraft(draft: PackageDraft): PackageDraft {
  const promotionType = normalizePromotionType(draft.promotionType);
  const original = Math.max(0, Number(draft.originalPrice || 0));
  const value = Math.max(0, Number(draft.promotionValue || 0));
  let finalPrice = original;
  let badgeText = draft.badgeText;
  let bonusCredits = '0';

  if (promotionType === 'none') {
    badgeText = '';
  } else if (promotionType === 'bonus') {
    badgeText = value > 0 ? `+${Math.round(value)} bonus` : '';
    bonusCredits = String(Math.round(value));
  } else if (promotionType === 'percent_discount') {
    const percent = Math.min(100, value);
    finalPrice = original * (1 - percent / 100);
    badgeText = percent > 0 ? `${percent}% discount` : '';
  } else if (promotionType === 'fixed_discount') {
    finalPrice = Math.max(0, original - value);
    badgeText = value > 0 ? `GHS ${value.toFixed(2)} off` : '';
  }

  if (promotionType === 'custom') {
    finalPrice = original;
  }

  return {
    ...draft,
    id: toPackageId(draft.id || draft.name || `${draft.credits}_credits`),
    promotionType,
    finalPrice: finalPrice.toFixed(2),
    badgeText,
    bonusCredits,
  };
}

function promotionValueLabel(type: PromotionType) {
  if (type === 'bonus') return 'Bonus credits';
  if (type === 'percent_discount') return 'Discount percent';
  if (type === 'fixed_discount') return 'Discount amount (GHS)';
  return 'Promotion value';
}

function normalizePromotionType(value?: string): PromotionType {
  if (value === 'bonus' || value === 'percent_discount' || value === 'fixed_discount' || value === 'custom') return value;
  return 'none';
}

function toPromotionValue(draft: PackageDraft) {
  if (draft.promotionType === 'fixed_discount') return toSubunit(draft.promotionValue);
  if (draft.promotionType === 'bonus' || draft.promotionType === 'percent_discount') return toWhole(draft.promotionValue);
  return 0;
}

function toPackageId(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
}

function uniquePackageId(base: string, packages: AdminCreditPackage[]) {
  const ids = new Set(packages.map((item) => item.id));
  let candidate = toPackageId(base);
  let count = 2;
  while (ids.has(candidate)) {
    candidate = `${toPackageId(base)}_${count}`;
    count += 1;
  }
  return candidate;
}

function formatMoney(subunit: number) {
  return `GHS ${(Number(subunit || 0) / 100).toFixed(2)}`;
}

function emptyFilter(): ReportFilter {
  return { search: '', startDate: '', endDate: '', status: '' };
}

function filterTransactions(items: AdminTransaction[], filter: ReportFilter, allowedKinds: string[]) {
  return items.filter((item) => {
    if (allowedKinds.length && !allowedKinds.includes(item.kind)) return false;
    if (filter.status && item.kind !== filter.status) return false;
    if (!matchesDate(item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.email,
      item.user_id,
      item.kind,
      item.description,
      JSON.stringify(item.metadata ?? {}),
    ]);
  });
}

function filterPurchases(items: AdminPurchase[], filter: ReportFilter) {
  return items.filter((item) => {
    if (filter.status && item.status !== filter.status) return false;
    if (!matchesDate(item.verified_at ?? item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.email,
      item.user_id,
      item.package_id,
      item.paystack_reference,
      item.status,
    ]);
  });
}

function filterReferrals(items: AdminReferral[], filter: ReportFilter) {
  return items.filter((item) => {
    if (filter.status && item.status !== filter.status) return false;
    if (!matchesDate(item.rewarded_at ?? item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.referrer_email,
      item.referred_email,
      item.referrer_user_id,
      item.referred_user_id,
      item.referral_code,
      item.rejection_reason,
      item.status,
    ]);
  });
}

function filterLogs(items: AdminLog[], filter: ReportFilter) {
  return items.filter((item) => {
    if (filter.status && item.severity !== filter.status) return false;
    if (!matchesDate(item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.email,
      item.user_id,
      item.severity,
      item.source,
      item.action,
      item.message,
      JSON.stringify(item.metadata ?? {}),
    ]);
  });
}

function matchesSearch(search: string, values: Array<string | null | undefined>) {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => String(value ?? '').toLowerCase().includes(normalized));
}

function matchesDate(value: string | null | undefined, filter: ReportFilter) {
  if (!filter.startDate && !filter.endDate) return true;
  const timestamp = value ? new Date(value).getTime() : 0;
  if (!timestamp) return false;
  if (filter.startDate && timestamp < new Date(`${filter.startDate}T00:00:00`).getTime()) return false;
  if (filter.endDate && timestamp > new Date(`${filter.endDate}T23:59:59`).getTime()) return false;
  return true;
}

function toSubunit(value: string) {
  return Math.max(0, Math.round(Number(value || 0) * 100));
}

function toWhole(value: string) {
  return Math.max(0, Math.round(Number(value || 0)));
}

function getMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong.';
}

function isAdminAuthError(message?: string | null) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('admin access required') || normalized.includes('sign in first');
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  sidebar: {
    width: 232,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    padding: 12,
    zIndex: 3,
  },
  sidebarDesktop: { minHeight: '100%' },
  sidebarCollapsed: { width: 72 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  brandText: { color: colors.primaryDark, fontSize: 18, fontWeight: '900' },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, marginBottom: 6 },
  navItemCollapsed: { justifyContent: 'center', gap: 0 },
  navItemActive: { backgroundColor: colors.primary },
  navLabel: { color: colors.primaryDark, fontWeight: '800' },
  navLabelActive: { color: '#fff' },
  main: { flex: 1, minWidth: 0 },
  topbar: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  heading: { color: colors.primaryDark, fontSize: 22, fontWeight: '900' },
  subheading: { color: colors.textMuted, marginTop: 2 },
  refreshButton: { minHeight: 40, paddingVertical: 8, paddingHorizontal: 12 },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 60 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  metricCard: {
    flexGrow: 1,
    flexBasis: 170,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
  },
  metricTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  metricValue: { color: colors.primaryDark, fontSize: 24, fontWeight: '900', marginTop: 8 },
  metricMoney: { color: colors.primary },
  metricDanger: { color: colors.danger },
  twoColumn: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  panel: {
    flexGrow: 1,
    flexBasis: 360,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  panelTitle: { color: colors.primaryDark, fontSize: 17, fontWeight: '900', marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' },
  searchButton: { marginBottom: 16, minWidth: 120 },
  helpText: { color: colors.textMuted, lineHeight: 19, marginBottom: 8 },
  dataRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 11,
  },
  rowTitle: { color: colors.text, fontWeight: '900' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  bodyText: { color: colors.text, lineHeight: 20, marginTop: 4 },
  codeText: { color: colors.text, fontFamily: 'monospace', fontSize: 12, backgroundColor: '#F7F9F4', padding: 10, borderRadius: 8, marginTop: 8 },
  pill: {
    color: colors.primary,
    backgroundColor: '#F1F4F2',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  pillGood: { color: colors.primary, backgroundColor: '#EAF4EE' },
  pillDanger: { color: colors.danger, backgroundColor: '#FCEDEF' },
  amount: { color: colors.primary, fontWeight: '900', fontSize: 18 },
  debit: { color: colors.danger },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  formField: { minWidth: 220, flexGrow: 1, flexBasis: 220 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  filterPanel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#F7F9F4',
  },
  filterInput: { minWidth: 160 },
  filterSelect: { minWidth: 190, flexGrow: 1, flexBasis: 190 },
  clearFilterButton: { minHeight: 42, marginTop: 22, paddingVertical: 8 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailItem: { flexGrow: 1, flexBasis: 180, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 },
  detailLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  detailValue: { color: colors.text, fontWeight: '800', marginTop: 4 },
  sectionLabel: { color: colors.primaryDark, fontWeight: '900', marginTop: 14, marginBottom: 6 },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
  errorText: { color: colors.danger, fontWeight: '700', lineHeight: 20, marginTop: 10 },
  adminLoginBox: { marginTop: 16, maxWidth: 440 },
  settingsIntro: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
  },
  settingsIntroTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  settingsIntroText: { color: '#EAF2EE', lineHeight: 20 },
  packageGrid: { gap: 10, marginTop: 10 },
  packageAdminCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F7F9F4',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  packageAdminMain: { flex: 1, minWidth: 220 },
  packageAdminTitle: { color: colors.primaryDark, fontSize: 16, fontWeight: '900', marginBottom: 2 },
  packageAdminActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  packageActionButton: { minHeight: 38, paddingVertical: 7, paddingHorizontal: 10 },
  packageStatus: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '900',
  },
  packageStatusActive: { color: colors.primary, backgroundColor: '#EAF4EE' },
  packageStatusInactive: { color: colors.textMuted, backgroundColor: '#ECEDEA' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  previewBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#F7F9F4',
  },
  editActionPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: colors.surface,
  },
  editActionButton: { minWidth: 140 },
});
