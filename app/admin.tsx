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
import { supabase } from '@/lib/supabase';
import {
  adminAdjustCredits,
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
    try {
      await adminUpdatePackage({
        id: editingPackage.id,
        name: editingPackage.name.trim(),
        credits: toWhole(editingPackage.credits),
        originalPriceSubunit: toSubunit(editingPackage.originalPrice),
        priceSubunit: toSubunit(editingPackage.finalPrice),
        promotionType: editingPackage.promotionType.trim() || 'none',
        promotionValue: toWhole(editingPackage.promotionValue),
        badgeText: editingPackage.badgeText.trim(),
        bonusCredits: toWhole(editingPackage.bonusCredits),
        promoStartsAt: editingPackage.startsAt.trim() || null,
        promoEndsAt: editingPackage.endsAt.trim() || null,
        active: editingPackage.active,
      });
      Alert.alert('Package saved', 'Credit package pricing has been updated.');
      setEditingPackage(null);
      await load();
    } catch (err: unknown) {
      Alert.alert('Could not save package', getMessage(err));
    }
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
              {section === 'credits' ? <CreditsSection transactions={dashboard.transactions} /> : null}
              {section === 'payments' ? <PaymentsSection purchases={dashboard.purchases} /> : null}
              {section === 'usage' ? <UsageSection transactions={dashboard.transactions} /> : null}
              {section === 'referrals' ? <ReferralsSection referrals={dashboard.referrals} /> : null}
              {section === 'logs' ? (
                <LogsSection logs={dashboard.logs} selectedLog={selectedLog} setSelectedLog={setSelectedLog} />
              ) : null}
              {section === 'settings' ? (
                <SettingsSection
                  packages={dashboard.packages}
                  editingPackage={editingPackage}
                  setEditingPackage={setEditingPackage}
                  savePackage={savePackage}
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

function CreditsSection({ transactions }: { transactions: AdminTransaction[] }) {
  const adjustments = transactions.filter((item) => item.kind === 'adjustment');
  return (
    <Panel title="Credit Adjustments">
      {(adjustments.length ? adjustments : transactions).length ? (
        (adjustments.length ? adjustments : transactions).map((item) => <TransactionRow key={item.id} item={item} />)
      ) : (
        <Text style={styles.emptyText}>No credit adjustments yet.</Text>
      )}
    </Panel>
  );
}

function PaymentsSection({ purchases }: { purchases: AdminPurchase[] }) {
  return (
    <Panel title="Payment Receipts">
      {purchases.length ? (
        purchases.map((item) => <PaymentRow key={item.id} purchase={item} />)
      ) : (
        <Text style={styles.emptyText}>No payment records yet.</Text>
      )}
    </Panel>
  );
}

function UsageSection({ transactions }: { transactions: AdminTransaction[] }) {
  const usage = transactions.filter((item) => ['lesson_generation', 'scheme_generation', 'scheme_parsing'].includes(item.kind));
  return (
    <Panel title="Usage History">
      {usage.length ? (
        usage.map((item) => <TransactionRow key={item.id} item={item} />)
      ) : (
        <Text style={styles.emptyText}>No credit-consuming usage yet.</Text>
      )}
    </Panel>
  );
}

function ReferralsSection({ referrals }: { referrals: AdminReferral[] }) {
  return (
    <Panel title="Referral Activity">
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

function LogsSection(props: { logs: AdminLog[]; selectedLog: string | null; setSelectedLog: (id: string | null) => void }) {
  return (
    <Panel title="Error Logs">
      {props.logs.length ? props.logs.map((log) => {
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
}) {
  return (
    <>
      <Panel title="Credit Pricing & Promotions">
        <View style={styles.tableHeader}>
          <Text style={styles.tableCell}>Credits</Text>
          <Text style={styles.tableCell}>Original Price</Text>
          <Text style={styles.tableCell}>Promotion</Text>
          <Text style={styles.tableCell}>Final Price</Text>
          <Text style={styles.tableCell}>Badge</Text>
        </View>
        {props.packages.length ? (
          props.packages.map((pack) => (
            <Pressable key={pack.id} style={styles.tableRow} onPress={() => props.setEditingPackage(toDraft(pack))}>
              <Text style={styles.tableCell}>{pack.credits}</Text>
              <Text style={styles.tableCell}>{formatMoney(pack.original_price_subunit ?? pack.price_subunit)}</Text>
              <Text style={styles.tableCell}>{promotionLabel(pack)}</Text>
              <Text style={styles.tableCell}>{formatMoney(pack.price_subunit)}</Text>
              <Text style={styles.tableCell}>{pack.badge_text || '-'}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyText}>No credit packages are available.</Text>
        )}
      </Panel>
      {props.editingPackage ? (
        <Panel title={`Edit ${props.editingPackage.name}`}>
          <View style={styles.formGrid}>
            <Field label="Package name" value={props.editingPackage.name} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, name: value })} />
            <Field label="Credits" value={props.editingPackage.credits} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, credits: value })} keyboardType="number-pad" />
            <Field label="Original price (GHS)" value={props.editingPackage.originalPrice} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, originalPrice: value })} keyboardType="decimal-pad" />
            <Field label="Final price (GHS)" value={props.editingPackage.finalPrice} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, finalPrice: value })} keyboardType="decimal-pad" />
            <Field label="Promotion type" value={props.editingPackage.promotionType} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, promotionType: value })} placeholder="percent | fixed | bonus | none" />
            <Field label="Promotion value" value={props.editingPackage.promotionValue} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, promotionValue: value })} keyboardType="number-pad" />
            <Field label="Bonus credits" value={props.editingPackage.bonusCredits} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, bonusCredits: value })} keyboardType="number-pad" />
            <Field label="Badge text" value={props.editingPackage.badgeText} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, badgeText: value })} />
            <Field label="Starts at" value={props.editingPackage.startsAt} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, startsAt: value })} placeholder="YYYY-MM-DD or ISO date" />
            <Field label="Ends at" value={props.editingPackage.endsAt} onChangeText={(value) => props.setEditingPackage({ ...props.editingPackage!, endsAt: value })} placeholder="YYYY-MM-DD or ISO date" />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.rowTitle}>Active</Text>
            <Switch value={props.editingPackage.active} onValueChange={(value) => props.setEditingPackage({ ...props.editingPackage!, active: value })} />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Save package" onPress={props.savePackage} />
            <Button title="Cancel" variant="ghost" onPress={() => props.setEditingPackage(null)} />
          </View>
        </Panel>
      ) : null}
      <Panel title="App Settings">
        <Text style={styles.bodyText}>Starter credits, referral reward limits, feature credit costs, Paystack mode, and parser backend are displayed here first. Editable controls can be safely added after the pricing table proves stable.</Text>
      </Panel>
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
  promotionType: string;
  promotionValue: string;
  bonusCredits: string;
  badgeText: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

function toDraft(pack: AdminCreditPackage): PackageDraft {
  return {
    id: pack.id,
    name: pack.name,
    credits: String(pack.credits),
    originalPrice: String(((pack.original_price_subunit ?? pack.price_subunit) / 100).toFixed(2)),
    finalPrice: String((pack.price_subunit / 100).toFixed(2)),
    promotionType: pack.promotion_type ?? 'none',
    promotionValue: String(pack.promotion_value ?? 0),
    bonusCredits: String(pack.bonus_credits ?? 0),
    badgeText: pack.badge_text ?? '',
    startsAt: pack.promo_starts_at ?? '',
    endsAt: pack.promo_ends_at ?? '',
    active: pack.active,
  };
}

function promotionLabel(pack: AdminCreditPackage) {
  if (pack.bonus_credits) return `+${pack.bonus_credits} credits`;
  if (pack.promotion_type && pack.promotion_type !== 'none') return `${pack.promotion_type} ${pack.promotion_value}`;
  return '-';
}

function formatMoney(subunit: number) {
  return `GHS ${(Number(subunit || 0) / 100).toFixed(2)}`;
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
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailItem: { flexGrow: 1, flexBasis: 180, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 },
  detailLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  detailValue: { color: colors.text, fontWeight: '800', marginTop: 4 },
  sectionLabel: { color: colors.primaryDark, fontWeight: '900', marginTop: 14, marginBottom: 6 },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
  errorText: { color: colors.danger, fontWeight: '700', lineHeight: 20, marginTop: 10 },
  adminLoginBox: { marginTop: 16, maxWidth: 440 },
  tableHeader: { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: 8, padding: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, padding: 10 },
  tableCell: { flex: 1, color: colors.text, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
});
