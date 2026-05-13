import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getWeekEntries,
  getWeekResourceList,
  getWeekStrandSummary,
  getWeekSubStrandSummary,
  getWeekTopic,
} from '@/lib/schemeWeek';
import { colors } from '@/theme/colors';
import type { SchemeOfWork } from '@/types/scheme';

interface Props {
  scheme: SchemeOfWork;
}

export function SchemeTable({ scheme }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{scheme.title}</Text>
        <Text style={styles.subTitle}>
          {scheme.subject} - {scheme.classLevel} - {scheme.term}
        </Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.headerCell, { flex: 0.5 }]}>Week</Text>
          <Text style={[styles.headerCell, { flex: 1.2 }]}>Topic</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Strand</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Sub-strand</Text>
        </View>
        {scheme.weeks.map((week, index) => (
          <View
            key={`${scheme.id}-${week.week}`}
            style={[styles.row, index % 2 === 1 && styles.altRow]}
          >
            <View style={[styles.cell, { flex: 0.5 }]}>
              <Text style={styles.cellText}>{week.week}</Text>
            </View>
            <View style={[styles.cell, { flex: 1.2 }]}>
              <Text style={styles.cellText}>{getWeekTopic(week)}</Text>
            </View>
            <View style={[styles.cell, { flex: 1 }]}>
              <Text style={styles.cellText}>{getWeekStrandSummary(week)}</Text>
            </View>
            <View style={[styles.cell, { flex: 1 }, styles.lastCell]}>
              <Text style={styles.cellText}>{getWeekSubStrandSummary(week)}</Text>
            </View>
          </View>
        ))}
      </View>

      {scheme.weeks.map((week) => (
        <View key={`detail-${scheme.id}-${week.week}`} style={styles.detailCard}>
          <Text style={styles.detailTitle}>Week {week.week}: {getWeekTopic(week) || 'Topic'}</Text>
          <Text style={styles.detailMeta}>
            {getWeekStrandSummary(week) || 'No strand'} | {getWeekSubStrandSummary(week) || 'No sub-strand'}
          </Text>
          {week.theme ? (
            <>
              <Text style={styles.detailLabel}>Theme</Text>
              <Text style={styles.detailBody}>{week.theme}</Text>
            </>
          ) : null}
          {getWeekEntries(week).map((entry, index) => (
            <View key={`${scheme.id}-${week.week}-entry-${index}`} style={styles.entryBlock}>
              <Text style={styles.entryTitle}>Strand Focus {index + 1}</Text>
              <Text style={styles.detailBody}>
                {(entry.strand || 'No strand') + (entry.subStrand ? ` | ${entry.subStrand}` : '')}
              </Text>
              <Text style={styles.detailLabel}>Topic</Text>
              <Text style={styles.detailBody}>{entry.topic || 'Not specified'}</Text>
              <Text style={styles.detailLabel}>Content Standard</Text>
              <Text style={styles.detailBody}>{entry.contentStandard || 'Not specified'}</Text>
              <Text style={styles.detailLabel}>Indicator</Text>
              <Text style={styles.detailBody}>{entry.indicator || 'Not specified'}</Text>
              {entry.exemplars?.length ? (
                <>
                  <Text style={styles.detailLabel}>Exemplars</Text>
                  <Text style={styles.detailBody}>{entry.exemplars.join('\n')}</Text>
                </>
              ) : null}
            </View>
          ))}
          <Text style={styles.detailLabel}>Resources</Text>
          <Text style={styles.detailBody}>
            {getWeekResourceList(week).length ? getWeekResourceList(week).join(', ') : 'Not specified'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 64 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
  subTitle: { color: colors.textMuted, lineHeight: 20 },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerRow: { backgroundColor: colors.tableHeader },
  altRow: { backgroundColor: colors.tableRowAlt },
  headerCell: {
    color: colors.tableHeaderText,
    padding: 10,
    fontWeight: '700',
    fontSize: 11,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255,255,255,0.3)',
  },
  cell: {
    padding: 10,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  lastCell: { borderRightWidth: 0 },
  cellText: { fontSize: 12, color: colors.text, lineHeight: 17 },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  detailTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  detailMeta: { color: colors.textMuted, marginBottom: 10, lineHeight: 18 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  detailBody: { fontSize: 12, color: colors.text, lineHeight: 18, marginBottom: 10 },
  entryBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 2,
  },
  entryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
});
