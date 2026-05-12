import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { TeachingNoteVisual, TeachingNotes } from '@/types/teachingNotes';

export function TeachingNotesView({ notes }: { notes: TeachingNotes }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{notes.title}</Text>
        <Text style={styles.meta}>
          {notes.subject} - {notes.classLevel} - Week {notes.week}
          {notes.lessonNumber ? ` - Lesson ${notes.lessonNumber}` : ''}
          {notes.versionNumber ? ` - Version ${notes.versionNumber}` : ''}
        </Text>
      </View>

      <Section title="Overview" text={notes.overview} />
      <ListSection title="Teacher Preparation" items={notes.preparation} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teaching Guide</Text>
        {notes.phaseGuidance.map((phase) => (
          <View key={phase.phase} style={styles.phaseBlock}>
            <Text style={styles.phaseTitle}>Phase {phase.phase}: {phase.title}</Text>
            {phase.teacherNotes.map((item, index) => (
              <Bullet key={index} text={item} />
            ))}
          </View>
        ))}
      </View>
      <ListSection title="Key Explanations" items={notes.keyExplanations} />
      <ListSection title="Likely Misconceptions" items={notes.misconceptions} />
      <ListSection title="Questions to Ask" items={notes.questionsToAsk} />
      <ListSection title="Differentiation" items={notes.differentiation} />
      <ListSection title="Classroom Management" items={notes.classroomManagement} />
      <ListSection title="Board Summary" items={notes.boardSummary} />
      <ListSection title="Homework / Follow-up" items={notes.homework ?? []} />
      {notes.visuals?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual Aids</Text>
          {notes.visuals.map((visual) => (
            <VisualBlock key={visual.id} visual={visual} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function Section({ title, text }: { title: string; text?: string }) {
  if (!text) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => <Bullet key={index} text={item} />)}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>{'\u2022'}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function VisualBlock({ visual }: { visual: TeachingNoteVisual }) {
  return (
    <View style={styles.visual}>
      <Text style={styles.visualTitle}>{visual.title}</Text>
      {visual.imageUrl ? (
        <Image source={{ uri: visual.imageUrl }} style={styles.visualImage} resizeMode="contain" />
      ) : (
        <View style={styles.diagramBox}>
          {(visual.steps ?? visual.labels?.map((item) => item.label) ?? (visual.prompt ? [visual.prompt] : [])).map((item, index) => (
            <View key={`${visual.id}-${index}`} style={styles.diagramStep}>
              <Text style={styles.diagramIndex}>{index + 1}</Text>
              <Text style={styles.diagramText}>{item}</Text>
            </View>
          ))}
          {visual.rows?.length ? (
            <View style={styles.tableVisual}>
              {visual.rows.map((row, rowIndex) => (
                <View key={rowIndex} style={[styles.tableRow, rowIndex === 0 && styles.tableHead]}>
                  {row.map((cell, cellIndex) => (
                    <Text key={cellIndex} style={styles.tableCell}>{cell}</Text>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      )}
      {visual.caption ? <Text style={styles.caption}>{visual.caption}</Text> : null}
      {visual.attribution ? <Text style={styles.attribution}>{visual.attribution}</Text> : null}
      {visual.labels?.length && visual.imageUrl ? (
        <View style={styles.labelWrap}>
          {visual.labels.map((item) => (
            <Text key={item.label} style={styles.labelPill}>{item.label}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 56 },
  header: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.primaryDark, marginBottom: 4 },
  meta: { color: colors.textMuted, lineHeight: 18 },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8 },
  body: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bulletDot: { color: colors.primary, fontWeight: '800', lineHeight: 21 },
  phaseBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 8,
  },
  phaseTitle: { color: colors.primary, fontWeight: '800', marginBottom: 6 },
  visual: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    backgroundColor: colors.tableRowAlt,
  },
  visualTitle: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  visualImage: { width: '100%', height: 180, backgroundColor: '#fff', borderRadius: 6 },
  diagramBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    gap: 8,
  },
  diagramStep: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  diagramIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '800',
  },
  diagramText: { flex: 1, color: colors.text, lineHeight: 19 },
  tableVisual: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, overflow: 'hidden' },
  tableRow: { flexDirection: 'row' },
  tableHead: { backgroundColor: colors.tableHeader },
  tableCell: { flex: 1, padding: 8, color: colors.text, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border },
  caption: { color: colors.text, lineHeight: 18, marginTop: 8 },
  attribution: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  labelWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  labelPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: colors.primary,
    fontWeight: '700',
  },
});
