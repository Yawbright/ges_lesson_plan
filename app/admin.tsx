import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { adminAdjustCredits, adminLoadLogs, adminSearchUsers, type AdminLog, type AdminUser } from '@/lib/admin';
import { colors } from '@/theme/colors';

export default function AdminScreen() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [amount, setAmount] = useState('10');
  const [reason, setReason] = useState('Admin credit adjustment');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextUsers, nextLogs] = await Promise.all([adminSearchUsers(submittedQuery), adminLoadLogs()]);
      setUsers(nextUsers);
      setLogs(nextLogs);
    } catch (err: unknown) {
      Alert.alert('Admin unavailable', getMessage(err));
    } finally {
      setLoading(false);
    }
  }, [submittedQuery]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function adjustCredits() {
    if (!selectedUser) return;
    const parsed = Number(amount);
    if (!Number.isInteger(parsed) || parsed === 0) {
      Alert.alert('Invalid amount', 'Enter a non-zero whole number.');
      return;
    }
    try {
      await adminAdjustCredits({ userId: selectedUser.user_id, amount: parsed, reason });
      Alert.alert('Credits updated', `${selectedUser.email} has been adjusted by ${parsed} credits.`);
      setSelectedUser(null);
      await refresh();
    } catch (err: unknown) {
      Alert.alert('Adjustment failed', getMessage(err));
    }
  }

  async function searchUsers() {
    setSearching(true);
    try {
      const nextQuery = query.trim();
      setSubmittedQuery(nextQuery);
      const nextUsers = await adminSearchUsers(nextQuery);
      setUsers(nextUsers);
    } catch (err: unknown) {
      Alert.alert('Search failed', getMessage(err));
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Admin Dashboard</Text>
      <Text style={styles.sub}>Manage users, credits, and system error logs.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Users</Text>
        <Field
          label="Search by email"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="teacher@example.com"
          keyboardType="email-address"
        />
        <Button title="Search users" onPress={searchUsers} loading={searching} />
        <Text style={styles.resultMeta}>
          {submittedQuery ? `Showing matches for "${submittedQuery}"` : 'Showing latest users'}
        </Text>
        {users.length ? (
          users.map((user) => (
            <View key={user.user_id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{user.email || 'No email'}</Text>
                <Text style={styles.meta}>Balance: {user.balance} credits</Text>
                <Text style={styles.meta}>Joined {new Date(user.created_at).toLocaleDateString()}</Text>
                <Text style={styles.meta}>User ID: {user.user_id}</Text>
              </View>
              <Button title="Adjust" variant="secondary" onPress={() => setSelectedUser(user)} style={styles.smallButton} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No users found. Try a shorter part of the email address.</Text>
        )}
      </View>

      {selectedUser ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adjust Credits</Text>
          <Text style={styles.meta}>{selectedUser.email}</Text>
          <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
          <Field label="Reason" value={reason} onChangeText={setReason} />
          <Button title="Apply adjustment" onPress={adjustCredits} />
          <Button title="Cancel" variant="ghost" onPress={() => setSelectedUser(null)} />
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Error Logs</Text>
        {logs.length ? (
          logs.map((log) => (
            <Pressable
              key={log.id}
              style={styles.logRow}
              onPress={() => setSelectedLogId((current) => (current === log.id ? null : log.id))}
            >
              <Text style={styles.rowTitle}>{log.action}</Text>
              <Text style={styles.meta}>{log.source} | {log.severity} | {new Date(log.created_at).toLocaleString()}</Text>
              <Text style={styles.logMessage}>{log.message}</Text>
              {selectedLogId === log.id ? (
                <View style={styles.logDetails}>
                  <Text style={styles.meta}>User ID: {log.user_id ?? 'Not available'}</Text>
                  <Text style={styles.detailText}>{JSON.stringify(log.metadata ?? {}, null, 2)}</Text>
                </View>
              ) : (
                <Text style={styles.expandText}>Tap to view details</Text>
              )}
            </Pressable>
          ))
        ) : (
          <Text style={styles.meta}>No logs yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function getMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong.';
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  heading: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 10 },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
  },
  rowTitle: { color: colors.text, fontWeight: '800' },
  meta: { color: colors.textMuted, marginTop: 3 },
  smallButton: { minHeight: 40, paddingHorizontal: 10, paddingVertical: 8 },
  resultMeta: { color: colors.textMuted, marginTop: 10, marginBottom: 2, lineHeight: 18 },
  emptyText: { color: colors.textMuted, marginTop: 12, lineHeight: 20 },
  logRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
  logMessage: { color: colors.text, marginTop: 4, lineHeight: 19 },
  expandText: { color: colors.primary, fontWeight: '700', marginTop: 6 },
  logDetails: {
    backgroundColor: '#F7F9F4',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  detailText: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 6,
  },
});
