import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';
import {
  Alert,
  FlatList,
  GestureResponderEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useToast } from '@/components/ToastProvider';
import {
  exportLessonPlanPdf,
  exportLessonPlansPdf,
  exportSchemePdf,
  exportTeachingNotesPdf,
  shareLessonPlan,
  shareLessonPlans,
  shareScheme,
} from '@/lib/export';
import { deleteLessonPlan, loadLessonWorks } from '@/lib/lessonStore';
import { deleteScheme, loadSchemes } from '@/lib/schemeStore';
import { deleteTeachingNotes, loadTeachingNotes } from '@/lib/teachingNotesStore';
import { colors } from '@/theme/colors';
import type { LessonPlanBundle, SavedLessonWork } from '@/types/lessonPlan';
import type { SchemeOfWork } from '@/types/scheme';
import type { TeachingNotes } from '@/types/teachingNotes';

type LibraryTab = 'lesson' | 'scheme' | 'notes';
type SortMode = 'newest' | 'title';

type LibraryItem =
  | { kind: 'lesson'; work: SavedLessonWork }
  | { kind: 'scheme'; scheme: SchemeOfWork }
  | { kind: 'notes'; notes: TeachingNotes };

const tabs: Array<{ key: LibraryTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'lesson', label: 'Lesson Plan', icon: 'document-text-outline' },
  { key: 'scheme', label: 'Scheme', icon: 'calendar-outline' },
  { key: 'notes', label: 'Teaching Notes', icon: 'reader-outline' },
];

export default function LibraryScreen() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<LibraryTab>('lesson');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [query, setQuery] = useState('');
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
    }, [refresh]),
  );

  const counts = useMemo(
    () => ({
      lesson: lessonWorks.length,
      scheme: schemes.length,
      notes: notes.length,
    }),
    [lessonWorks.length, notes.length, schemes.length],
  );

  const activeItems = useMemo<LibraryItem[]>(() => {
    if (activeTab === 'lesson') return lessonWorks.map((work) => ({ kind: 'lesson', work }));
    if (activeTab === 'scheme') return schemes.map((scheme) => ({ kind: 'scheme', scheme }));
    return notes.map((item) => ({ kind: 'notes', notes: item }));
  }, [activeTab, lessonWorks, notes, schemes]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? activeItems.filter((item) => getSearchText(item).includes(normalizedQuery))
      : activeItems;

    return [...filtered].sort((a, b) => {
      if (sortMode === 'title') return getItemTitle(a).localeCompare(getItemTitle(b));
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [activeItems, query, sortMode]);

  const activeTabLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? 'Library';

  async function confirmDeleteLesson(work: SavedLessonWork) {
    const confirmed = await confirmRemoval(
      'Delete lesson plan',
      `Delete ${work.subject} ${work.classLevel} Week ${work.week}?`,
    );
    if (!confirmed || !work.id) return;
    await deleteLessonPlan(work.id);
    await refresh();
    showToast({ message: 'Lesson plan deleted.' });
  }

  async function confirmDeleteScheme(scheme: SchemeOfWork) {
    const confirmed = await confirmRemoval(
      'Delete scheme',
      `Delete ${scheme.subject} ${scheme.classLevel} ${scheme.term}?`,
    );
    if (!confirmed || !scheme.id) return;
    await deleteScheme(scheme.id);
    await refresh();
    showToast({ message: 'Scheme deleted.' });
  }

  async function confirmDeleteNotes(item: TeachingNotes) {
    const confirmed = await confirmRemoval('Delete teaching notes', `Delete ${item.title}?`);
    if (!confirmed || !item.id) return;
    await deleteTeachingNotes(item.id);
    await refresh();
    showToast({ message: 'Teaching notes deleted.' });
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filteredItems}
      keyExtractor={getItemKey}
      ListHeaderComponent={
        <LibraryHeader
          activeTab={activeTab}
          activeTabLabel={activeTabLabel}
          counts={counts}
          query={query}
          sortMode={sortMode}
          totalVisible={filteredItems.length}
          onChangeQuery={setQuery}
          onChangeSort={setSortMode}
          onSelectTab={setActiveTab}
        />
      }
      ListEmptyComponent={<EmptyState activeTabLabel={activeTabLabel} hasQuery={Boolean(query.trim())} />}
      renderItem={({ item }) =>
        item.kind === 'lesson' ? (
          <LessonCard work={item.work} onDelete={() => confirmDeleteLesson(item.work)} />
        ) : item.kind === 'scheme' ? (
          <SchemeCard scheme={item.scheme} onDelete={() => confirmDeleteScheme(item.scheme)} />
        ) : (
          <TeachingNotesCard notes={item.notes} onDelete={() => confirmDeleteNotes(item.notes)} />
        )
      }
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews={Platform.OS !== 'web'}
    />
  );
}

function LibraryHeader({
  activeTab,
  activeTabLabel,
  counts,
  query,
  sortMode,
  totalVisible,
  onChangeQuery,
  onChangeSort,
  onSelectTab,
}: {
  activeTab: LibraryTab;
  activeTabLabel: string;
  counts: Record<LibraryTab, number>;
  query: string;
  sortMode: SortMode;
  totalVisible: number;
  onChangeQuery: (value: string) => void;
  onChangeSort: (value: SortMode) => void;
  onSelectTab: (value: LibraryTab) => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.heading}>Library</Text>
          <Text style={styles.sub}>Find, open, export, and manage saved classroom files.</Text>
        </View>
        <View style={styles.fileCountPill}>
          <Text style={styles.fileCountValue}>{counts.lesson + counts.scheme + counts.notes}</Text>
          <Text style={styles.fileCountLabel}>files</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onSelectTab(tab.key)}
              style={({ pressed }) => [styles.tabButton, active && styles.tabButtonActive, pressed && styles.pressed]}
            >
              <Ionicons name={tab.icon} size={18} color={active ? '#fff' : colors.primaryDark} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              <Text style={[styles.tabCount, active && styles.tabCountActive]}>{counts[tab.key]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.filtersPanel}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder={`Search ${activeTabLabel.toLowerCase()}`}
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {query.trim() ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onChangeQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.sortRow}>
          <Text style={styles.resultsText}>{totalVisible} shown</Text>
          <View style={styles.sortSegment}>
            <SortButton label="Newest" active={sortMode === 'newest'} onPress={() => onChangeSort('newest')} />
            <SortButton label="A-Z" active={sortMode === 'title'} onPress={() => onChangeSort('title')} />
          </View>
        </View>
      </View>
    </View>
  );
}

function SortButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.sortButton, active && styles.sortButtonActive, pressed && styles.pressed]}
    >
      <Text style={[styles.sortButtonText, active && styles.sortButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function LessonCard({ work, onDelete }: { work: SavedLessonWork; onDelete: () => void }) {
  const isBundle = isLessonBundle(work);
  const title = `${work.subject} - ${work.classLevel} - Week ${work.week}`;
  const translationLanguage = isBundle ? work.plans[0]?.translationLanguage : work.translationLanguage;
  const subtitleBase = isBundle ? `${work.lessonCount} lessons | ${work.termTitle}` : work.termTitle;
  const subtitle = translationLanguage ? `${subtitleBase} | ${translationLanguage} AI draft` : subtitleBase;

  return (
    <DocumentCard
      icon="document-text-outline"
      title={title}
      subtitle={subtitle}
      meta={formatDate(work.updatedAt ?? work.createdAt)}
      onOpen={() => {
        if (isBundle && work.id) {
          router.push(`/lesson/week?bundleId=${encodeURIComponent(work.id)}`);
          return;
        }
        router.push(`/lesson/${work.id}`);
      }}
      actions={
        <CardActions
          onShare={() => (isBundle ? shareLessonPlans(work.plans) : shareLessonPlan(work))}
          onPdf={() => (isBundle ? exportLessonPlansPdf(work.plans) : exportLessonPlanPdf(work))}
          onDelete={onDelete}
        />
      }
    />
  );
}

function TeachingNotesCard({ notes, onDelete }: { notes: TeachingNotes; onDelete: () => void }) {
  return (
    <DocumentCard
      icon="reader-outline"
      title={`${notes.subject} - ${notes.classLevel} - Week ${notes.week}`}
      subtitle={`Teaching notes v${notes.versionNumber ?? 1} | ${notes.topic || notes.title}`}
      meta={formatDate(notes.updatedAt ?? notes.createdAt)}
      onOpen={() => router.push(`/teaching-note/${notes.id}`)}
      actions={
        <CardActions
          onShare={() => exportTeachingNotesPdf(notes)}
          onPdf={() => exportTeachingNotesPdf(notes)}
          onDelete={onDelete}
        />
      }
    />
  );
}

function SchemeCard({ scheme, onDelete }: { scheme: SchemeOfWork; onDelete: () => void }) {
  return (
    <DocumentCard
      icon="calendar-outline"
      title={`${scheme.subject} - ${scheme.classLevel} - ${scheme.term}`}
      subtitle={`${scheme.weeks.length} weeks | ${scheme.title}`}
      meta={formatDate(scheme.createdAt)}
      onOpen={() => router.push(`/scheme/${scheme.id}`)}
      actions={
        <CardActions
          onShare={() => shareScheme(scheme)}
          onPdf={() => exportSchemePdf(scheme)}
          onDelete={onDelete}
        />
      }
    />
  );
}

function DocumentCard({
  icon,
  title,
  subtitle,
  meta,
  onOpen,
  actions,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  meta: string;
  onOpen: () => void;
  actions: React.ReactNode;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onOpen}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.cardSub} numberOfLines={2}>{subtitle}</Text>
        <Text style={styles.cardMeta}>{meta}</Text>
      </View>
      {actions}
    </Pressable>
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
      <ActionIcon icon="share-social-outline" label="Share" onPress={onShare} />
      <ActionIcon icon="download-outline" label="PDF" onPress={onPdf} />
      <ActionIcon icon="trash-outline" label="Delete" onPress={onDelete} danger />
    </View>
  );
}

function ActionIcon({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
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
        pressed && styles.actionIconPressed,
      ]}
    >
      <Ionicons name={icon} size={17} color={danger ? colors.danger : colors.primaryDark} />
    </Pressable>
  );
}

function EmptyState({ activeTabLabel, hasQuery }: { activeTabLabel: string; hasQuery: boolean }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={hasQuery ? 'search-outline' : 'folder-open-outline'} size={22} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{hasQuery ? 'No matching files' : `No ${activeTabLabel.toLowerCase()} yet`}</Text>
      <Text style={styles.emptyText}>
        {hasQuery
          ? 'Try another subject, class, week, topic, or term.'
          : 'Create a new file from the Tools tab and it will appear here.'}
      </Text>
    </View>
  );
}

function isLessonBundle(work: SavedLessonWork): work is LessonPlanBundle {
  return (work as LessonPlanBundle).kind === 'bundle';
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

function getItemKey(item: LibraryItem) {
  if (item.kind === 'lesson') return `lesson-${item.work.id ?? `${item.work.subject}-${item.work.week}`}`;
  if (item.kind === 'scheme') return `scheme-${item.scheme.id ?? `${item.scheme.subject}-${item.scheme.term}`}`;
  return `notes-${item.notes.id ?? `${item.notes.subject}-${item.notes.week}`}`;
}

function getItemTitle(item: LibraryItem) {
  if (item.kind === 'lesson') return `${item.work.subject} ${item.work.classLevel} Week ${item.work.week}`;
  if (item.kind === 'scheme') return `${item.scheme.subject} ${item.scheme.classLevel} ${item.scheme.term}`;
  return `${item.notes.subject} ${item.notes.classLevel} Week ${item.notes.week}`;
}

function getSearchText(item: LibraryItem) {
  if (item.kind === 'lesson') {
    const work = item.work;
    return [
      work.subject,
      work.classLevel,
      work.weekTitle,
      work.termTitle,
      isLessonBundle(work) ? work.title : work.topic,
    ].join(' ').toLowerCase();
  }
  if (item.kind === 'scheme') {
    const scheme = item.scheme;
    return [scheme.title, scheme.subject, scheme.classLevel, scheme.term, scheme.academicYear].join(' ').toLowerCase();
  }
  const note = item.notes;
  return [note.title, note.subject, note.classLevel, note.topic, note.week, note.lessonNumber].join(' ').toLowerCase();
}

function getTimestamp(item: LibraryItem) {
  const value =
    item.kind === 'lesson'
      ? item.work.updatedAt ?? item.work.createdAt
      : item.kind === 'scheme'
        ? item.scheme.createdAt
        : item.notes.updatedAt ?? item.notes.createdAt;
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDate(value?: string) {
  if (!value) return 'Saved locally';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved locally';
  return `Saved ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 14 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 16,
  },
  heading: { fontSize: 24, fontWeight: '700', color: colors.primaryDark, marginBottom: 5 },
  sub: { color: colors.textMuted, lineHeight: 20, maxWidth: 520 },
  fileCountPill: {
    minWidth: 64,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
  },
  fileCountValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  fileCountLabel: { color: '#DCE9E4', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  tabBar: {
    marginBottom: 12,
  },
  tabBarContent: {
    gap: 8,
    paddingRight: 4,
  },
  tabButton: {
    minWidth: 138,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.primaryDark, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tabCount: {
    minWidth: 24,
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: colors.surfaceMuted,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' },
  filtersPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  searchBox: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, minHeight: 42, color: colors.text, fontSize: 15 },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  resultsText: { color: colors.textMuted, fontWeight: '600' },
  sortSegment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  sortButton: { paddingHorizontal: 14, paddingVertical: 8 },
  sortButtonActive: { backgroundColor: colors.primarySoft },
  sortButtonText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  sortButtonTextActive: { color: colors.primaryDark },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardPressed: { opacity: 0.86 },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  cardSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  cardMeta: { color: colors.primaryDark, fontSize: 12, fontWeight: '600', marginTop: 6 },
  cardActions: { flexDirection: 'row', gap: 6 },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconDanger: { borderColor: '#F0C9C9', backgroundColor: colors.dangerSoft },
  actionIconPressed: { opacity: 0.78 },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  emptyText: { color: colors.textMuted, lineHeight: 20, textAlign: 'center' },
  pressed: { opacity: 0.84 },
});
