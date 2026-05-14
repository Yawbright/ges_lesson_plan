import { Pressable, StyleProp, Switch, Text, View, ViewStyle } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import {
  creditKindOptions,
  logSeverityOptions,
  paymentStatusOptions,
  promotionTypeOptions,
  referralStatusOptions,
  usageKindOptions,
} from './adminConstants';
import { styles } from './adminStyles';
import type {
  AdminCreditPackage,
  AdminDashboard,
  AdminLog,
  AdminPurchase,
  AdminReferral,
  AdminTransaction,
  AdminUser,
  AdminUserDetail,
} from '@/lib/admin';
import type { AppSettingsDraft, PackageDraft, PromotionType, ReportFilter } from './adminTypes';
import {
  cleanWholeNumber,
  emptyFilter,
  filterLogs,
  filterPurchases,
  filterReferrals,
  filterTransactions,
  formatMoney,
  isAdminAuthError,
  newPackageDraft,
  packageIdFromCredits,
  preparePackageDraft,
  promotionLabel,
  promotionValueLabel,
  toDraft,
  toSubunit,
  toWhole,
} from './adminUtils';

export function AdminAccessPanel(props: {
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

export function Overview({ dashboard, openUser }: { dashboard: AdminDashboard; openUser: (user: AdminUser) => void }) {
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
        <Metric title="Teaching Notes" value={String(overview.teachingNotesGenerated)} />
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

export function UsersSection(props: {
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

export function CreditsSection(props: {
  transactions: AdminTransaction[];
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
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
      <LoadMoreButton hasMore={props.hasMore} loading={props.loadingMore} onPress={props.loadMore} />
    </Panel>
  );
}

export function PaymentsSection(props: {
  purchases: AdminPurchase[];
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
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
      <LoadMoreButton hasMore={props.hasMore} loading={props.loadingMore} onPress={props.loadMore} />
    </Panel>
  );
}

export function UsageSection(props: {
  transactions: AdminTransaction[];
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
}) {
  const usage = filterTransactions(props.transactions, props.filter, [
    'lesson_generation',
    'scheme_generation',
    'scheme_parsing',
    'teaching_notes_generation',
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
      <LoadMoreButton hasMore={props.hasMore} loading={props.loadingMore} onPress={props.loadMore} />
    </Panel>
  );
}

export function ReferralsSection(props: {
  referrals: AdminReferral[];
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
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
              <Text style={styles.meta}>Email: {item.referred_email_confirmed ? '✓ Confirmed' : '⏱ Unconfirmed'}</Text>
              {item.rejection_reason ? <Text style={styles.meta}>Reason: {item.rejection_reason}</Text> : null}
            </View>
            <StatusPill status={item.status === 'rejected' ? 'not rewarded' : item.status} />
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No referrals yet.</Text>
      )}
      <LoadMoreButton hasMore={props.hasMore} loading={props.loadingMore} onPress={props.loadMore} />
    </Panel>
  );
}

export function LogsSection(props: {
  logs: AdminLog[];
  selectedLog: string | null;
  setSelectedLog: (id: string | null) => void;
  filter: ReportFilter;
  setFilter: (patch: Partial<ReportFilter>) => void;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
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
      <LoadMoreButton hasMore={props.hasMore} loading={props.loadingMore} onPress={props.loadMore} />
    </Panel>
  );
}

export function SettingsSection(props: {
  packages: AdminCreditPackage[];
  editingPackage: PackageDraft | null;
  setEditingPackage: (value: PackageDraft | null) => void;
  savePackage: () => void;
  removePackage: (pack: PackageDraft) => void;
  appSettings: AppSettingsDraft;
  setAppSettings: (patch: Partial<AppSettingsDraft>) => void;
  saveAppSettings: () => void;
  savingAppSettings: boolean;
}) {
  const draft = props.editingPackage ? preparePackageDraft(props.editingPackage) : null;
  const setDraft = (patch: Partial<PackageDraft>) => {
    if (!props.editingPackage) return;
    const next = { ...props.editingPackage, ...patch };
    if (next.isNew && Object.prototype.hasOwnProperty.call(patch, 'credits')) {
      next.id = packageIdFromCredits(next.credits);
      if (!next.name.trim() || next.name === `${props.editingPackage.credits} credits`) {
        next.name = next.credits ? `${toWhole(next.credits)} credits` : '';
      }
    }
    props.setEditingPackage(preparePackageDraft(next));
  };

  return (
    <View style={styles.settingsStack}>
      <View style={styles.settingsIntro}>
        <Text style={styles.settingsIntroTitle}>Settings</Text>
        <Text style={styles.settingsIntroText}>
          Manage credit packages, promotions, starter credits, referral reward limits, feature credit costs,
          Paystack mode, parser backend, and AI backend controls from this area.
        </Text>
      </View>
      <Panel title="Credit Pricing & Promotions" style={styles.settingsPanel}>
        <View style={styles.buttonRow}>
          <Button title="Add package" onPress={() => props.setEditingPackage(newPackageDraft())} />
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
        <Panel title={draft.isNew ? 'Add Credit Package' : `Edit ${draft.name}`} style={styles.settingsPanel}>
          <View style={styles.formGrid}>
            <View style={styles.generatedIdBox}>
              <Text style={styles.generatedIdLabel}>Package ID</Text>
              <Text style={styles.generatedIdValue}>
                {draft.id || 'Enter credits to generate ID'}
              </Text>
              {draft.isNew ? (
                <Text style={styles.generatedIdHelp}>Generated automatically from the credits field.</Text>
              ) : (
                <Text style={styles.generatedIdHelp}>Existing package IDs cannot be changed safely.</Text>
              )}
            </View>
            <Field label="Package name" value={draft.name} onChangeText={(value) => setDraft({ name: value })} />
            <Field
              label="Credits"
              value={draft.credits}
              onChangeText={(value) => setDraft({ credits: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
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
      <Panel title="App Settings" style={[styles.settingsPanel, styles.appSettingsPanel]}>
        <Text style={styles.bodyText}>
          These controls affect new signups, referral rewards, credit deductions, and generated file retention.
          Paystack mode and AI backend fields are shown here as read-only because they still rely on secure deployment
          secrets and function wiring.
        </Text>
        <View style={styles.settingsGrid}>
          <View style={styles.settingsBox}>
            <Text style={styles.sectionLabel}>Starter Credits</Text>
            <Field
              label="Credits for new users"
              value={props.appSettings.starterCredits}
              onChangeText={(value) => props.setAppSettings({ starterCredits: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
            <View style={styles.switchRow}>
              <Text style={styles.rowTitle}>Active</Text>
              <Switch
                value={props.appSettings.starterActive}
                onValueChange={(value) => props.setAppSettings({ starterActive: value })}
              />
            </View>
          </View>
          <View style={styles.settingsBox}>
            <Text style={styles.sectionLabel}>Referral Rewards</Text>
            <Field
              label="Reward credits"
              value={props.appSettings.referralCredits}
              onChangeText={(value) => props.setAppSettings({ referralCredits: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
            <Field
              label="Monthly reward limit"
              value={props.appSettings.referralMonthlyLimit}
              onChangeText={(value) => props.setAppSettings({ referralMonthlyLimit: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
            <View style={styles.switchRow}>
              <Text style={styles.rowTitle}>Active</Text>
              <Switch
                value={props.appSettings.referralActive}
                onValueChange={(value) => props.setAppSettings({ referralActive: value })}
              />
            </View>
          </View>
          <View style={styles.settingsBox}>
            <Text style={styles.sectionLabel}>Feature Credit Costs</Text>
            <Field
              label="Lesson generation"
              value={props.appSettings.lessonCost}
              onChangeText={(value) => props.setAppSettings({ lessonCost: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
            <Field
              label="Scheme generation"
              value={props.appSettings.schemeCost}
              onChangeText={(value) => props.setAppSettings({ schemeCost: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
            <Field
              label="Custom scheme analysis"
              value={props.appSettings.parsingCost}
              onChangeText={(value) => props.setAppSettings({ parsingCost: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
            <Field
              label="Teaching notes generation"
              value={props.appSettings.teachingNotesCost}
              onChangeText={(value) => props.setAppSettings({ teachingNotesCost: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.settingsBox}>
            <Text style={styles.sectionLabel}>Retention & Runtime</Text>
            <Field
              label="Generated file retention days"
              value={props.appSettings.retentionDays}
              onChangeText={(value) => props.setAppSettings({ retentionDays: cleanWholeNumber(value) })}
              keyboardType="number-pad"
            />
            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.rowTitle}>Credit purchasing</Text>
                <Text style={styles.meta}>When off, users can view packages but cannot start MoMo checkout.</Text>
              </View>
              <Switch
                value={props.appSettings.purchasingEnabled}
                onValueChange={(value) => props.setAppSettings({ purchasingEnabled: value })}
              />
            </View>
            <Field label="Paystack mode" value={props.appSettings.paystackMode} editable={false} />
            <Field label="Parser backend" value={props.appSettings.parserBackend} editable={false} />
            <Field label="Translation provider" value={props.appSettings.translationProvider} editable={false} />
            <Text style={styles.meta}>Lesson translation currently uses Anthropic. Gemini switching can be wired into this setting later.</Text>
          </View>
        </View>
        <View style={styles.editActionPanel}>
          <Button title="Save app settings" onPress={props.saveAppSettings} loading={props.savingAppSettings} />
        </View>
      </Panel>
    </View>
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

function Panel({ title, children, style }: { title: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.panel, style]}>
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

function LoadMoreButton({
  hasMore,
  loading,
  onPress,
}: {
  hasMore: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  if (!hasMore) return null;
  return (
    <View style={styles.buttonRow}>
      <Button title="Load more" variant="secondary" onPress={onPress} loading={loading} />
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
