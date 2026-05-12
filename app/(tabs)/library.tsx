import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, GestureResponderEvent, Platform, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useToast } from '@/components/ToastProvider';
import { exportLessonPlanPdf, exportLessonPlansPdf, exportSchemePdf, exportTeachingNotesPdf, shareLessonPlan, shareLessonPlans, shareScheme } from '@/lib/export';
import { deleteLessonPlan, loadLessonWorks } from '@/lib/lessonStore';
import { deleteScheme, loadSchemes } from '@/lib/schemeStore';
import { deleteTeachingNotes, loadTeachingNotes } from '@/lib/teachingNotesStore';
import { colors } from '@/theme/colors';
import type { LessonPlanBundle, SavedLessonWork } from '@/types/lessonPlan';
import type { SchemeOfWork } from '@/types/scheme';
import type { TeachingNotes } from '@/types/teachingNotes';

type LibraryItem =
  | { kind: 'lesson'; work: SavedLessonWork }
  | { kind: 'notes'; notes: TeachingNotes }
  | { kind: 'scheme'; scheme: SchemeOfWork };

type LibrarySection = {
  title: string;
  emptyText: string;
  data: LibraryItem[];
};

export default function LibraryScreen() {
  const { showToast } = useToast();
  const [lessonWorks, setLessonWorks] = useState<SavedLessonWork[]>([]);
  const [notes, setNotes] = useState<TeachingNotes[]>([]);
  const [schemes, setSchemes] = useState<SchemeOfWork[]>([]);

  const refresh = useCallback(async () => {
    const [lessonResult, notesResult, schemeResult] = await Promise.allSettled([
      loadLessonWorks(),
      loadTeachingNotes(),
      loadSchemes(),
    ]);
    setLessonWorks(lessonResult.status === 'fulfilled' ? lessonResult.value : []);
    setNotes(notesResult.status === 'fulfilled' ? notesResult.value : []);
    setSchemes(schemeResult.status === 'fulfilled' ? schemeResult.value : []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function confirmDeleteLesson(work: SavedLessonWork) {
    const confirmed = await confirmRemoval(
      'Delete lesson plan',
      `Delete ${work.subject} ${work.classLevel} Week ${work.week}?`
    );
    if (!confirmed || !work.id) return;
    await deleteLessonPlan(work.id);
    await refresh();
    showToast({ message: 'Lesson plan deleted.' });
  }

  async function confirmDeleteScheme(scheme: SchemeOfWork) {
    const confirmed = await confirmRemoval(
      'Delete scheme',
      `Delete ${scheme.subject} ${scheme.classLevel} ${scheme.term}?`
    );
    if (!confirmed || !scheme.id) return;
    await deleteScheme(scheme.id);
    await refresh();
    showToast({ message: 'Scheme deleted.' });
  }

  async function confirmDeleteNotes(item: TeachingNotes) {
    const confirmed = await confirmRemoval(
      'Delete teaching notes',
      `Delete ${item.title}?`
    );
    if (!confirmed || !item.id) return;
    await deleteTeachingNotes(item.id);
    await refresh();
    showToast({ message: 'Teaching notes deleted.' });
  }

  const sections = useMemo<LibrarySection[]>(
    () => [
      {
        title: 'Saved Lesson Plans',
        emptyText: 'No lesson plans yet. Generate your first lesson plan from the Tools tab.',
        data: lessonWorks.map((work) => ({ kind: 'lesson', work })),
      },
      {
        title: 'Saved Teaching Notes',
        emptyText: 'No teaching notes yet. Generate them from the Tools tab.',
        data: notes.map((item) => ({ kind: 'notes', notes: item })),
      },
      {
        title: 'Saved Schemes',
        emptyText: 'No saved schemes yet. Generate a scheme from the Tools tab.',
        data: schemes.map((scheme) => ({ kind: 'scheme', scheme })),
      },
    ],
    [lessonWorks, notes, schemes],
  );

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) =>
        item.kind === 'lesson'
          ? `lesson-${item.work.id ?? `${item.work.subject}-${item.work.week}`}`
          : item.kind === 'notes'
            ? `notes-${item.notes.id ?? `${item.notes.subject}-${item.notes.week}`}`
          : `scheme-${item.scheme.id ?? `${item.scheme.subject}-${item.scheme.term}`}`
      }
      ListHeaderComponent={LibraryHeader}
      renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
      renderSectionFooter={({ section }) =>
        section.data.length ? <View style={styles.sectionSpacer} /> : <EmptyState text={section.emptyText} />
      }
      renderItem={({ item }) =>
        item.kind === 'lesson' ? (
          <LessonCard work={item.work} onDelete={() => confirmDeleteLesson(item.work)} />
        ) : item.kind === 'notes' ? (
          <TeachingNotesCard notes={item.notes} onDelete={() => confirmDeleteNotes(item.notes)} />
        ) : (
          <SchemeCard scheme={item.scheme} onDelete={() => confirmDeleteScheme(item.scheme)} />
        )
      }
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews={Platform.OS !== 'web'}
      stickySectionHeadersEnabled={false}
    />
  );
}

function LibraryHeader() {
  return (
    <>
      <Text style={styles.heading}>Library</Text>
      <Text style={styles.sub}>
        Open full generated works, revisit them later, or save them as PDF.
      </Text>
    </>
  );
}

function LessonCard({ work, onDelete }: { work: SavedLessonWork; onDelete: () => void }) {
  const isBundle = isLessonBundle(work);
  const title = `${work.subject} - ${work.classLevel} - Week ${work.week}`;
  const subtitle = isBundle ? `${work.lessonCount} lessons | ${work.termTitle}` : work.termTitle;

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        if (isBundle && work.id) {
          router.push(`/lesson/week?bundleId=${encodeURIComponent(work.id)}`);
          return;
        }
        router.push(`/lesson/${work.id}`);
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{subtitle}</Text>
      </View>
      <CardActions
        onShare={() => (isBundle ? shareLessonPlans(work.plans) : shareLessonPlan(work))}
        onPdf={() => (isBundle ? exportLessonPlansPdf(work.plans) : exportLessonPlanPdf(work))}
        onDelete={onDelete}
      />
    </Pressable>
  );
}

function isLessonBundle(work: SavedLessonWork): work is LessonPlanBundle {
  return (work as LessonPlanBundle).kind === 'bundle';
}

function TeachingNotesCard({ notes, onDelete }: { notes: TeachingNotes; onDelete: () => void }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/teaching-note/${notes.id}`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {notes.subject} - {notes.classLevel} - Week {notes.week}
        </Text>
        <Text style={styles.cardSub}>
          Teaching notes v{notes.versionNumber ?? 1} | {notes.topic || notes.title}
        </Text>
      </View>
      <CardActions
        onShare={() => exportTeachingNotesPdf(notes)}
        onPdf={() => exportTeachingNotesPdf(notes)}
        onDelete={onDelete}
      />
    </Pressable>
  );
}

function SchemeCard({ scheme, onDelete }: { scheme: SchemeOfWork; onDelete: () => void }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/scheme/${scheme.id}`)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {scheme.subject} - {scheme.classLevel} - {scheme.term}
        </Text>
        <Text style={styles.cardSub}>
          {scheme.weeks.length} weeks | {scheme.title}
        </Text>
      </View>
      <CardActions
        onShare={() => shareScheme(scheme)}
        onPdf={() => exportSchemePdf(scheme)}
        onDelete={onDelete}
      />
    </Pressable>
  );
}

function confirmRemoval(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return Promise.resolve(window.confirm(message));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function CardActions({
  onShare,
  onPdf,
  onDelete,
}: {
  onShare: () => void;
  onPdf: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.cardActions}>
      <View style={styles.cardActionTopRow}>
        <ActionIcon icon="share-social-outline" label="Share" onPress={onShare} />
        <ActionIcon icon="document-text-outline" label="PDF" onPress={onPdf} />
      </View>
      <ActionIcon icon="trash-outline" label="Delete" onPress={onDelete} danger wide />
    </View>
  );
}

function ActionIcon({
  icon,
  label,
  onPress,
  danger,
  wide,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  wide?: boolean;
}) {
  function handlePress(event: GestureResponderEvent) {
    event.stopPropagation();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.actionIcon,
        danger && styles.actionIconDanger,
        wide && styles.actionIconWide,
        pressed && styles.actionIconPressed,
      ]}
    >
      <Ionicons name={icon} size={17} color={danger ? colors.danger : colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  sectionSpacer: { height: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  cardSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  cardActions: {
    width: 82,
    alignItems: 'stretch',
    gap: 6,
  },
  cardActionTopRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionIcon: {
    width: 38,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconWide: {
    width: '100%',
  },
  actionIconDanger: {
    borderColor: '#F3B8B8',
    backgroundColor: '#FFF4F4',
  },
  actionIconPressed: {
    opacity: 0.78,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
});
