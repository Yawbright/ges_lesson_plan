import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { TeachingNoteContentBlock, TeachingNotes } from '@/types/teachingNotes';

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

      <ContentBlocks blocks={notes.contentBlocks ?? []} />
    </ScrollView>
  );
}

function ContentBlocks({ blocks }: { blocks: TeachingNoteContentBlock[] }) {
  return (
    <View style={styles.noteFlow}>
      {blocks.map((block, index) => <ContentBlock key={block.id || index} block={block} />)}
    </View>
  );
}

function ContentBlock({ block }: { block: TeachingNoteContentBlock }) {
  if (block.type === 'heading') {
    return <Text style={styles.blockHeading}>{block.title || block.text}</Text>;
  }

  if (block.type === 'paragraph') {
    return (
      <View style={styles.textBlock}>
        {block.title ? <Text style={styles.inlineTitle}>{block.title}</Text> : null}
        <Text style={styles.body}>{block.text}</Text>
      </View>
    );
  }

  if (block.type === 'bullet_list' || block.type === 'practice_questions') {
    return (
      <View style={styles.textBlock}>
        {block.title ? <Text style={styles.inlineTitle}>{block.title}</Text> : null}
        {(block.items ?? []).map((item, index) => <Bullet key={index} text={item} />)}
      </View>
    );
  }

  if (block.type === 'worked_example') {
    return (
      <View style={[styles.visual, styles.exampleBlock]}>
        <Text style={styles.visualTitle}>{block.title || 'Worked Example'}</Text>
        {block.text ? <Text style={styles.body}>{block.text}</Text> : null}
        {(block.steps ?? block.items ?? []).map((step, index) => (
          <View key={index} style={styles.diagramStep}>
            <Text style={styles.diagramIndex}>{index + 1}</Text>
            <Text style={styles.diagramText}>{step}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (block.type === 'comparison_table') {
    return <TableBlock block={block} />;
  }

  if (block.type === 'process_steps') {
    return (
      <View style={styles.visual}>
        <Text style={styles.visualTitle}>{block.title || 'Steps'}</Text>
        {(block.steps ?? block.items ?? []).map((step, index) => (
          <View key={index} style={styles.diagramStep}>
            <Text style={styles.diagramIndex}>{index + 1}</Text>
            <Text style={styles.diagramText}>{step}</Text>
          </View>
        ))}
        {block.caption ? <Text style={styles.caption}>{block.caption}</Text> : null}
      </View>
    );
  }

  if (block.type === 'labelled_diagram') {
    return (
      <View style={styles.visual}>
        <Text style={styles.visualTitle}>{block.title || 'Labelled Diagram'}</Text>
        <View style={styles.diagramBox}>
          {(block.labels ?? []).map((item, index) => (
            <View key={index} style={styles.diagramStep}>
              <Text style={styles.diagramIndex}>{index + 1}</Text>
              <Text style={styles.diagramText}>
                <Text style={styles.boldText}>{item.label}</Text>
                {item.description ? `: ${item.description}` : ''}
              </Text>
            </View>
          ))}
        </View>
        {block.caption ? <Text style={styles.caption}>{block.caption}</Text> : null}
      </View>
    );
  }

  if (block.type === 'image_grid') {
    return <ImageGridBlock block={block} />;
  }

  if (block.type === 'teacher_tip') {
    return (
      <View style={styles.tipBlock}>
        <Text style={styles.visualTitle}>{block.title || 'Teacher Tip'}</Text>
        <Text style={styles.body}>{block.text}</Text>
      </View>
    );
  }

  return block.text ? <Section title={block.title || 'Note'} text={block.text} /> : null;
}

function TableBlock({ block }: { block: TeachingNoteContentBlock }) {
  if (!block.rows?.length) return null;
  return (
    <View style={styles.visual}>
      <Text style={styles.visualTitle}>{block.title || 'Table'}</Text>
      <View style={styles.tableVisual}>
        {block.rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.tableRow, rowIndex === 0 && styles.tableHead]}>
            {row.map((cell, cellIndex) => (
              <Text key={cellIndex} style={styles.tableCell}>{cell}</Text>
            ))}
          </View>
        ))}
      </View>
      {block.caption ? <Text style={styles.caption}>{block.caption}</Text> : null}
    </View>
  );
}

function ImageGridBlock({ block }: { block: TeachingNoteContentBlock }) {
  if (!block.imageItems?.length) return null;
  return (
    <View style={styles.visual}>
      <Text style={styles.visualTitle}>{block.title || 'Examples'}</Text>
      {block.text ? <Text style={styles.body}>{block.text}</Text> : null}
      <View style={styles.imageGrid}>
        {block.imageItems.map((item) => (
          <View key={item.label} style={styles.imageTile}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.imageTileImage} resizeMode="contain" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>{item.label.slice(0, 2).toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.imageTileLabel}>{item.label}</Text>
            {item.description ? <Text style={styles.imageTileDescription}>{item.description}</Text> : null}
          </View>
        ))}
      </View>
      {block.caption ? <Text style={styles.caption}>{block.caption}</Text> : null}
    </View>
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

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>{'\u2022'}</Text>
      <Text style={styles.body}>{text}</Text>
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
  noteFlow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  blockHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 2,
  },
  textBlock: { gap: 4 },
  inlineTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  body: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21 },
  boldText: { fontWeight: '800', color: colors.text },
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
  exampleBlock: { backgroundColor: '#fffaf0' },
  tipBlock: {
    borderWidth: 1,
    borderColor: '#d9c88f',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fffaf0',
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
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  imageTile: {
    width: 132,
    minHeight: 132,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  imageTileImage: { width: 58, height: 58, marginBottom: 6 },
  imagePlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#eef6f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  imagePlaceholderText: { color: colors.primary, fontWeight: '800', fontSize: 18 },
  imageTileLabel: { color: colors.text, fontWeight: '800', textAlign: 'center' },
  imageTileDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 15, marginTop: 3, textAlign: 'center' },
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
