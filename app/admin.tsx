import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { adminAdjustCredits, adminLoadLogs, adminSearchUsers, type AdminLog, type AdminUser } from '@/lib/admin';
import { colors } from '@/theme/colors';

export default function AdminScreen() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [amount, setAmount] = useState('10');
  const [reason, setReason] = useState('Admin credit adjustment');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextUsers, nextLogs] = await Promise.all([adminSearchUsers(query), adminLoadLogs()]);
      setUsers(nextUsers);
      setLogs(nextLogs);
    } catch (err: unknown) {
      Alert.alert('Admin unavailable', getMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

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
        <Field label="Search by email" value={query} onChangeText={setQuery} autoCapitalize="none" />
        <Button title="Search" onPress={refresh} />
        {users.map((user) => (
          <View key={user.user_id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{user.email}</Text>
              <Text style={styles.meta}>Balance: {user.balance} credits</Text>
              <Text style={styles.meta}>{new Date(user.created_at).toLocaleDateString()}</Text>
            </View>
            <Button title="Adjust" variant="secondary" onPress={() => setSelectedUser(user)} style={styles.smallButton} />
          </View>
        ))}
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
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.rowTitle}>{log.action}</Text>
              <Text style={styles.meta}>{log.source} | {log.severity} | {new Date(log.created_at).toLocaleString()}</Text>
              <Text style={styles.logMessage}>{log.message}</Text>
            </View>
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
  logRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
  logMessage: { color: colors.text, marginTop: 4, lineHeight: 19 },
});
