import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import { useToast } from '@/components/ToastProvider';
import {
  addEntryToWeek,
  allocateNextEntry,
  buildQuickScheme,
  buildSchemeFromWeeks,
  createEmptyWeeks,
  duplicatePreviousWeek,
  getBuilderCurriculumEntries,
  getContentStandardOptions,
  getStrandOptions,
  getSubStrandOptions,
  isLanguageSubject,
  removeEntryFromWeek,
  type BuilderMode,
  type CurriculumEntryOption,
} from '@/lib/schemeBuilder';
import { getWeekEntries, getWeekTopic } from '@/lib/schemeWeek';
import { saveScheme } from '@/lib/schemeStore';
import {
  CLASS_LEVEL_OPTIONS,
  getDefaultSubjectForClassLevel,
  getSubjectOptionsForClassLevel,
  TERM_OPTIONS,
  type SelectOption,
} from '@/lib/options';
import { colors } from '@/theme/colors';
import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeOfWork, SchemeWeek } from '@/types/scheme';

const WEEK_COUNT_OPTIONS: SelectOption[] = [8, 9, 10, 11, 12, 13, 14].map((value) => ({
  label: `${value} weeks`,
  value: String(value),
}));

export default function SchemeBuilderScreen() {
  const { showToast } = useToast();
  const [mode, setMode] = useState<BuilderMode>('quick');
  const [classLevel, setClassLevel] = useState<ClassLevel>('B7');
  const [subject, setSubject] = useState(getDefaultSubjectForClassLevel('B7'));
  const [term, setTerm] = useState('Term 1');
  const [numberOfWeeksInput, setNumberOfWeeksInput] = useState('12');
  const [includeFullYear, setIncludeFullYear] = useState(false);
  const [selectedStrands, setSelectedStrands] = useState<string[]>([]);
  const [selectedSubStrands, setSelectedSubStrands] = useState<string[]>([]);
  const [activeWeek, setActiveWeek] = useState(1);
  const [detailStrand, setDetailStrand] = useState('');
  const [detailSubStrand, setDetailSubStrand] = useState('');
  const [detailStandard, setDetailStandard] = useState('');
  const [detailTopicSearch, setDetailTopicSearch] = useState('');
  const [weeks, setWeeks] = useState<SchemeWeek[]>(createEmptyWeeks(12));
  const [saving, setSaving] = useState(false);

  const subjectOptions = useMemo(
    () => getSubjectOptionsForClassLevel(classLevel),
    [classLevel]
  );
  const numberOfWeeks = Math.max(1, Math.min(14, Number(numberOfWeeksInput) || 12));
  const languageSubject = isLanguageSubject(subject);

  const curriculumEntries = useMemo(
    () =>
      getBuilderCurriculumEntries({
        subject,
        classLevel,
        term,
        includeFullYear,
      }),
    [classLevel, includeFullYear, subject, term]
  );
  const strandOptions = useMemo(() => getStrandOptions(curriculumEntries), [curriculumEntries]);
  const selectedStrandOptions = useMemo(
    () => strandOptions.filter((option) => selectedStrands.includes(option.value)),
    [selectedStrands, strandOptions]
  );
  const quickSubStrandOptions = useMemo(() => {
    const scopedEntries = selectedStrands.length
      ? curriculumEntries.filter((entry) => selectedStrands.includes(entry.strand ?? ''))
      : curriculumEntries;
    return getSubStrandOptions(scopedEntries);
  }, [curriculumEntries, selectedStrands]);
  const detailSubStrandOptions = useMemo(
    () => getSubStrandOptions(curriculumEntries, detailStrand),
    [curriculumEntries, detailStrand]
  );
  const detailStandardOptions = useMemo(
    () =>
      getContentStandardOptions(curriculumEntries, {
        strand: detailStrand,
        subStrand: detailSubStrand,
      }),
    [curriculumEntries, detailStrand, detailSubStrand]
  );
  const languageTopicMatches = useMemo(() => {
    if (!languageSubject || !detailStrand) return [];

    const query = detailTopicSearch.trim();
    const strandEntries = curriculumEntries.filter((entry) => entry.strand === detailStrand);
    const matches = query
      ? strandEntries.filter((entry) => curriculumEntryMatchesTopicSearch(entry, query))
      : strandEntries;

    return [...matches].sort(compareCurriculumEntriesForPicker);
  }, [curriculumEntries, detailStrand, detailTopicSearch, languageSubject]);
  const weekOptions = useMemo(
    () =>
      Array.from({ length: numberOfWeeks }, (_, index) => ({
        label: `Week ${index + 1}`,
        value: String(index + 1),
      })),
    [numberOfWeeks]
  );
  const previewScheme = useMemo(
    () => buildSchemeFromWeeks({ subject, classLevel, term, weeks }),
    [classLevel, subject, term, weeks]
  );
  const activeWeekEntries = getWeekEntries(
    weeks.find((week) => week.week === activeWeek) ?? { week: activeWeek }
  );

  useEffect(() => {
    if (!subjectOptions.some((option) => option.value === subject)) {
      setSubject(getDefaultSubjectForClassLevel(classLevel));
    }
  }, [classLevel, subject, subjectOptions]);

  useEffect(() => {
    if (languageSubject && mode === 'quick') {
      setMode('detailed');
    }
  }, [languageSubject, mode]);

  useEffect(() => {
    setWeeks(createEmptyWeeks(numberOfWeeks));
    setActiveWeek(1);
    setSelectedStrands([]);
    setSelectedSubStrands([]);
    setDetailStrand('');
    setDetailSubStrand('');
    setDetailStandard('');
    setDetailTopicSearch('');
  }, [classLevel, numberOfWeeks, subject, term]);

  useEffect(() => {
    setDetailSubStrand('');
    setDetailStandard('');
    setDetailTopicSearch('');
  }, [detailStrand]);

  useEffect(() => {
    setDetailStandard('');
  }, [detailSubStrand]);

  function handleBuildQuickDraft() {
    if (languageSubject) {
      setMode('detailed');
      return;
    }

    if (!curriculumEntries.length) {
      Alert.alert('No mapped curriculum', 'No mapped curriculum entries were found for this selection.');
      return;
    }
    const draft = buildQuickScheme({
      subject,
      classLevel,
      term,
      numberOfWeeks,
      entries: curriculumEntries,
      selectedStrands,
      selectedSubStrands,
    });
    setWeeks(draft.weeks);
    showToast({ message: 'Scheme draft built from mapped curriculum.' });
  }

  function handleAddDetailedEntry() {
    if (!detailStrand || !detailSubStrand || !detailStandard) {
      Alert.alert('Selection incomplete', 'Choose the strand, sub-strand and content standard first.');
      return;
    }

    const entry = allocateNextEntry({
      entries: curriculumEntries,
      existingWeeks: weeks,
      selection: {
        strand: detailStrand,
        subStrand: detailSubStrand,
        contentStandard: detailStandard,
      },
    });

    if (!entry) {
      Alert.alert(
        'No unused indicator',
        'All mapped indicators for this content standard have already been used in this draft.'
      );
      return;
    }

    setWeeks((current) => addEntryToWeek(current, activeWeek, entry));
    showToast({ message: 'Next unused indicator assigned.' });
  }

  function handleAddLanguageTopic(entry: CurriculumEntryOption) {
    const alreadyUsed = weeks
      .flatMap((week) => getWeekEntries(week))
      .some((usedEntry) => getEntryKey(usedEntry) === getEntryKey(entry));

    if (alreadyUsed) {
      Alert.alert(
        'Indicator already used',
        'This mapped indicator is already in the draft. Choose another topic/focus or remove the existing entry first.'
      );
      return;
    }

    setWeeks((current) => addEntryToWeek(current, activeWeek, entry));
    setDetailTopicSearch(entry.topic ?? '');
    showToast({ message: 'Topic mapped to curriculum details.' });
  }

  async function handleSave() {
    const hasEntries = weeks.some((week) => getWeekEntries(week).length);
    if (!hasEntries) {
      Alert.alert('Empty scheme', 'Add at least one curriculum focus before saving.');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveScheme({
        ...previewScheme,
        title: `${subject} Scheme of Work - ${classLevel} ${term}`,
      });
      showToast({ message: 'Scheme builder draft saved.' });
      router.push(`/scheme/${saved.id}`);
    } catch (error: unknown) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Could not save this scheme.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.heading}>Scheme Builder</Text>
        <Text style={styles.sub}>
          Build from mapped curriculum. The app assigns the next unused indicator when a content standard repeats.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Setup</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <SelectField
              label="Class"
              value={classLevel}
              options={CLASS_LEVEL_OPTIONS}
              onChange={(value) => setClassLevel(value as ClassLevel)}
            />
          </View>
          <View style={styles.gridItem}>
            <SelectField
              label="Subject"
              value={subject}
              options={subjectOptions}
              onChange={setSubject}
              placeholder="Select a subject"
            />
          </View>
          <View style={styles.gridItem}>
            <SelectField label="Term" value={term} options={TERM_OPTIONS} onChange={setTerm} />
          </View>
          <View style={styles.gridItem}>
            <SelectField
              label="Weeks"
              value={numberOfWeeksInput}
              options={WEEK_COUNT_OPTIONS}
              onChange={setNumberOfWeeksInput}
            />
          </View>
        </View>

        <View style={styles.modeRow}>
          {!languageSubject ? (
            <ModeButton
              title="Quick Builder"
              active={mode === 'quick'}
              onPress={() => setMode('quick')}
            />
          ) : null}
          <ModeButton
            title="Detailed Builder"
            active={mode === 'detailed'}
            onPress={() => setMode('detailed')}
          />
        </View>

        <Pressable
          style={[styles.toggleRow, includeFullYear && styles.toggleRowActive]}
          onPress={() => setIncludeFullYear((value) => !value)}
        >
          <Ionicons
            name={includeFullYear ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={includeFullYear ? colors.primary : colors.textMuted}
          />
          <Text style={styles.toggleText}>Allow topics mapped under other terms</Text>
        </Pressable>

        <Text style={styles.metaText}>
          {curriculumEntries.length
            ? `${curriculumEntries.length} mapped curriculum entries available.`
            : 'No mapped curriculum entries found for this setup.'}
        </Text>
      </View>

      {mode === 'quick' ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Quick Builder</Text>
          <Text style={styles.helper}>
            Select the strands or aspects to cover. For language subjects, each selected aspect is added every week; for other subjects, the builder spreads them across the term.
          </Text>

          <Text style={styles.fieldLabel}>Strands / Aspects</Text>
          <ChipGrid
            options={strandOptions}
            selected={selectedStrands}
            onToggle={(value) => setSelectedStrands((current) => toggleValue(current, value))}
          />

          <Text style={styles.fieldLabel}>Sub-strands (optional)</Text>
          <ChipGrid
            options={quickSubStrandOptions}
            selected={selectedSubStrands}
            onToggle={(value) => setSelectedSubStrands((current) => toggleValue(current, value))}
          />

          <Button title="Build Draft Scheme" onPress={handleBuildQuickDraft} />
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Detailed Builder</Text>
          <Text style={styles.helper}>
            {languageSubject
              ? 'Choose a week and aspect, then select a mapped topic or focus. Use the filter only when you want to narrow the list.'
              : 'Choose a week, then choose strand, sub-strand and content standard. The system assigns the next unused indicator.'}
          </Text>

          <SelectField
            label="Active week"
            value={String(activeWeek)}
            options={weekOptions}
            onChange={(value) => setActiveWeek(Number(value))}
          />

          <View style={styles.inlineActions}>
            <Button
              title="Copy previous week"
              variant="secondary"
              onPress={() => setWeeks((current) => duplicatePreviousWeek(current, activeWeek))}
              disabled={activeWeek <= 1}
              style={styles.smallButton}
            />
          </View>

          <SelectField
            label="Strand / Aspect"
            value={detailStrand}
            options={strandOptions}
            onChange={setDetailStrand}
            placeholder="Choose strand or aspect"
          />
          {languageSubject ? (
            <>
              <Field
                label="Filter topic / focus (optional)"
                value={detailTopicSearch}
                onChangeText={setDetailTopicSearch}
                placeholder="Type to narrow the curriculum list below..."
                editable={Boolean(detailStrand)}
              />
              {detailStrand ? (
                <View style={styles.matchPanel}>
                  <Text style={styles.matchTitle}>
                    {languageTopicMatches.length
                      ? `${languageTopicMatches.length} mapped topic${languageTopicMatches.length === 1 ? '' : 's'}`
                      : 'No mapped topics found'}
                  </Text>
                  <Text style={styles.matchHint}>
                    Topics are listed from the selected strand/aspect across topic, indicator and exemplar levels.
                  </Text>
                  {languageTopicMatches.map((entry) => (
                    <Pressable
                      key={entry.id}
                      style={({ pressed }) => [styles.matchRow, pressed && styles.pressed]}
                      onPress={() => handleAddLanguageTopic(entry)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchRowTitle}>{entry.topic || entry.indicator}</Text>
                        <Text style={styles.matchRowMeta}>
                          {formatSourcePlacement(entry)} | {entry.subStrand || 'No sub-strand'}
                        </Text>
                        <Text style={styles.matchRowMeta}>{entry.indicator || entry.contentStandard}</Text>
                        {entry.exemplars?.length ? (
                          <Text style={styles.matchRowMeta}>Exemplar: {entry.exemplars[0]}</Text>
                        ) : null}
                      </View>
                      <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <>
              <SelectField
                label="Sub-strand"
                value={detailSubStrand}
                options={detailSubStrandOptions}
                onChange={setDetailSubStrand}
                placeholder="Choose sub-strand"
                disabled={!detailStrand}
              />
              <SelectField
                label="Content standard"
                value={detailStandard}
                options={detailStandardOptions}
                onChange={setDetailStandard}
                placeholder="Choose content standard"
                disabled={!detailSubStrand}
              />

              <Button title="Assign Next Indicator to Week" onPress={handleAddDetailedEntry} />
            </>
          )}

          <View style={styles.weekEditor}>
            <Text style={styles.weekEditorTitle}>Week {activeWeek} Focuses</Text>
            {activeWeekEntries.length ? (
              activeWeekEntries.map((entry, index) => (
                <View key={`${activeWeek}-${index}-${entry.indicator}`} style={styles.focusRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.focusTitle}>{entry.strand} - {entry.subStrand}</Text>
                    <Text style={styles.focusMeta}>{entry.topic || entry.indicator}</Text>
                  </View>
                  <Pressable
                    style={styles.iconButton}
                    onPress={() =>
                      setWeeks((current) => removeEntryFromWeek(current, activeWeek, index))
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No curriculum focus added for this week yet.</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.previewPanel}>
        <View style={styles.previewHeader}>
          <View>
            <Text style={styles.panelTitle}>Live Preview</Text>
            <Text style={styles.metaText}>
              {languageSubject ? 'Language weekly multi-aspect scheme' : 'Weekly curriculum scheme'}
            </Text>
          </View>
          <Button title="Save Scheme" onPress={handleSave} loading={saving} style={styles.saveButton} />
        </View>
        <SchemePreview scheme={previewScheme} />
      </View>
    </ScrollView>
  );
}

function ModeButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        active && styles.modeButtonActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{title}</Text>
    </Pressable>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
}: {
  options: SelectOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (!options.length) {
    return <Text style={styles.emptyText}>No options available for this selection.</Text>;
  }

  return (
    <View style={styles.chipGrid}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => onToggle(option.value)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SchemePreview({ scheme }: { scheme: SchemeOfWork }) {
  return (
    <View style={styles.previewList}>
      {scheme.weeks.map((week) => {
        const entries = getWeekEntries(week);
        return (
          <View key={`${scheme.id}-${week.week}`} style={styles.previewWeek}>
            <Text style={styles.previewWeekTitle}>
              Week {week.week}: {getWeekTopic(week) || 'No topic assigned'}
            </Text>
            {entries.length ? (
              entries.map((entry, index) => (
                <View key={`${week.week}-${index}-${entry.indicator}`} style={styles.previewEntry}>
                  <Text style={styles.previewEntryTitle}>
                    {entry.strand || 'Strand'} - {entry.subStrand || 'Sub-strand'}
                  </Text>
                  <Text style={styles.previewText}>{entry.topic || 'Topic pending'}</Text>
                  <Text style={styles.previewLabel}>Content Standard</Text>
                  <Text style={styles.previewText}>{entry.contentStandard || 'Not specified'}</Text>
                  <Text style={styles.previewLabel}>Indicator</Text>
                  <Text style={styles.previewText}>{entry.indicator || 'Not specified'}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No curriculum focus yet.</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function curriculumEntryMatchesTopicSearch(entry: CurriculumEntryOption, query: string): boolean {
  const haystack = tokenizeSearchText(
    [
      entry.strand,
      entry.subStrand,
      entry.topic,
      entry.indicator,
      entry.contentStandard,
      ...(entry.exemplars ?? []),
      getTopicAliases(entry),
    ].join(' ')
  );
  const queryTokens = tokenizeSearchText(expandQueryAliases(query));

  return queryTokens.every((queryToken) =>
    haystack.some(
      (token) =>
        token === queryToken ||
        token.includes(queryToken) ||
        queryToken.includes(token) ||
        stripTrailingS(token) === stripTrailingS(queryToken)
    )
  );
}

function getTopicAliases(entry: CurriculumEntryOption): string {
  const text = [entry.topic, entry.indicator, entry.contentStandard].join(' ').toLowerCase();
  const aliases: string[] = [];

  if (text.includes('formal') || text.includes('letter') || text.includes('email')) {
    aliases.push('letter writing formal letter informal letter email business letter practical writing');
  }
  if (text.includes('summary') || text.includes('summar')) {
    aliases.push('summary writing summarising summarizing');
  }
  if (text.includes('reported speech')) {
    aliases.push('direct speech indirect speech');
  }
  if (text.includes('article')) {
    aliases.push('publication writing magazine writing');
  }
  if (text.includes('dialogue')) {
    aliases.push('dialog writing conversation script');
  }

  return aliases.join(' ');
}

function expandQueryAliases(query: string): string {
  const normalized = query.toLowerCase();
  const aliases = [query];

  if (normalized.includes('letter')) {
    aliases.push('formal letters emails business letters formal writing practical writing');
  }
  if (normalized.includes('summary')) {
    aliases.push('summarising summarizing objective summary');
  }
  if (normalized.includes('direct speech') || normalized.includes('indirect speech')) {
    aliases.push('reported speech');
  }

  return aliases.join(' ');
}

function tokenizeSearchText(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !SEARCH_STOP_WORDS.has(token));
}

function stripTrailingS(value: string): string {
  return value.endsWith('s') ? value.slice(0, -1) : value;
}

function compareCurriculumEntriesForPicker(
  left: CurriculumEntryOption,
  right: CurriculumEntryOption
): number {
  return (
    getTermSortValue(left.sourceTerm) - getTermSortValue(right.sourceTerm) ||
    left.sourceWeek - right.sourceWeek ||
    (left.strand ?? '').localeCompare(right.strand ?? '') ||
    (left.subStrand ?? '').localeCompare(right.subStrand ?? '') ||
    (left.topic ?? left.indicator ?? '').localeCompare(right.topic ?? right.indicator ?? '')
  );
}

function getTermSortValue(term: string): number {
  const match = term.match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function formatSourcePlacement(entry: CurriculumEntryOption): string {
  const term = entry.sourceTerm || 'Mapped curriculum';
  return entry.sourceWeek ? `${term} - Week ${entry.sourceWeek}` : term;
}

function getEntryKey(entry: { indicator?: string; contentStandard?: string; topic?: string }) {
  return [entry.contentStandard, entry.indicator, entry.topic]
    .join('|')
    .trim()
    .toLowerCase();
}

const SEARCH_STOP_WORDS = new Set([
  'and',
  'the',
  'for',
  'with',
  'using',
  'use',
  'write',
  'compose',
  'create',
  'apply',
  'different',
  'given',
  'appropriate',
]);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 48 },
  header: { marginBottom: 16 },
  heading: { fontSize: 24, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, lineHeight: 20 },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  panelTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 5 },
  helper: { color: colors.textMuted, lineHeight: 19, marginBottom: 14 },
  grid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: Platform.OS === 'web' ? '22%' : '100%',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  modeButtonText: { color: colors.text, fontWeight: '700' },
  modeButtonTextActive: { color: colors.primary },
  toggleRow: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  toggleRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  toggleText: { color: colors.text, fontWeight: '600' },
  metaText: { color: colors.textMuted, lineHeight: 18 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: { color: colors.text, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
  pressed: { opacity: 0.82 },
  inlineActions: { marginBottom: 4 },
  smallButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  weekEditor: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 12,
  },
  weekEditorTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 8 },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  focusTitle: { color: colors.text, fontWeight: '700', marginBottom: 3 },
  focusMeta: { color: colors.textMuted, lineHeight: 18 },
  matchPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginTop: -6,
    marginBottom: 14,
  },
  matchTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  matchHint: { color: colors.textMuted, lineHeight: 18, marginBottom: 8 },
  matchRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  matchRowTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 3 },
  matchRowMeta: { color: colors.textMuted, lineHeight: 18 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: colors.textMuted, lineHeight: 18, marginBottom: 10 },
  previewPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
  },
  previewHeader: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  saveButton: {
    minHeight: 42,
    paddingVertical: 8,
  },
  previewList: { gap: 10 },
  previewWeek: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.bg,
  },
  previewWeekTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 8 },
  previewEntry: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 9,
    marginTop: 7,
  },
  previewEntryTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  previewLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 5,
    marginBottom: 2,
  },
  previewText: { color: colors.text, lineHeight: 18 },
});
