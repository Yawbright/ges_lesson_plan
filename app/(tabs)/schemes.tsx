import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { router, useFocusEffect } from 'expo-router';
import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { useToast } from '@/components/ToastProvider';
import {
  formatAiActionError,
  generateSchemeOfWork,
  isInsufficientCreditsError,
  parseUploadedScheme,
} from '@/lib/ai';
import { exportSchemePdf } from '@/lib/export';
import {
  CLASS_LEVEL_OPTIONS,
  getDefaultSubjectForClassLevel,
  getSubjectOptionsForClassLevel,
  TERM_OPTIONS,
} from '@/lib/options';
import { getWeekStrandSummary, getWeekSubStrandSummary, getWeekTopic } from '@/lib/schemeWeek';
import { loadSchemes, saveScheme } from '@/lib/schemeStore';
import { colors } from '@/theme/colors';
import type { ClassLevel } from '@/types/lessonPlan';
import type { SchemeOfWork } from '@/types/scheme';

export default function SchemesScreen() {
  const { showToast } = useToast();
  const webInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [classLevel, setClassLevel] = useState<ClassLevel>('B7');
  const [subject, setSubject] = useState(getDefaultSubjectForClassLevel('B7'));
  const [term, setTerm] = useState('Term 1');
  const [savedSchemes, setSavedSchemes] = useState<SchemeOfWork[]>([]);
  const [latestScheme, setLatestScheme] = useState<SchemeOfWork | null>(null);
  const [webSelectedAsset, setWebSelectedAsset] = useState<UploadAsset | null>(null);

  const subjectOptions = useMemo(
    () => getSubjectOptionsForClassLevel(classLevel),
    [classLevel],
  );

  useEffect(() => {
    if (!subjectOptions.some((option) => option.value === subject)) {
      setSubject(getDefaultSubjectForClassLevel(classLevel));
    }
  }, [classLevel, subject, subjectOptions]);

  const refreshSchemes = useCallback(async () => {
    const schemes = await loadSchemes();
    setSavedSchemes(schemes);
  }, []);

  useEffect(() => {
    refreshSchemes();
  }, [refreshSchemes]);

  useFocusEffect(
    useCallback(() => {
      refreshSchemes();
    }, [refreshSchemes]),
  );

  async function handleUpload() {
    if (!subject.trim()) {
      Alert.alert('Subject required', 'Select the subject for the uploaded scheme first.');
      return;
    }
    const asset =
      Platform.OS === 'web'
        ? webSelectedAsset
        : await pickUploadAsset(webInputRef);
    if (!asset) return;

    setUploading(true);
    try {
      const fileBase64 = await readAssetAsBase64(asset);
      const parsed = await parseUploadedScheme({
        subject: subject.trim(),
        classLevel,
        term: term.trim(),
        fileName: asset.name,
        fileBase64,
        numberOfWeeks: 12,
      });
      const schemeToSave = applyDetectedMetadata(parsed.scheme, parsed.detectedMetadata, {
        subject: subject.trim(),
        classLevel,
        term: term.trim(),
      });
      const saved = await saveScheme(schemeToSave);
      setLatestScheme(saved);
      await refreshSchemes();
      if (Platform.OS === 'web') {
        setWebSelectedAsset(null);
      }
      const mismatchMessage = buildMetadataNotice(parsed.detectedMetadata, {
        subject: subject.trim(),
        classLevel,
        term: term.trim(),
      });
      const parserMessage = buildParserNotice(saved);
      showToast({ message: `${asset.name} parsed and saved.` });
      const details = [mismatchMessage, parserMessage].filter(Boolean).join('\n\n');
      if (details) {
        Alert.alert('Scheme parsed', details);
      }
    } catch (err: unknown) {
      showSchemeActionError('Upload or parsing failed', err);
    } finally {
      setUploading(false);
    }
  }

  function handleWebFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      setWebSelectedAsset(null);
      return;
    }

    setWebSelectedAsset({
      uri: URL.createObjectURL(file),
      name: file.name,
      file,
    });
  }

  async function handleGenerate() {
    if (!subject.trim()) {
      Alert.alert('Subject required', 'Please select the subject.');
      return;
    }
    setGenerating(true);
    try {
      const scheme = await generateSchemeOfWork({
        subject: subject.trim(),
        classLevel,
        term: term.trim(),
        numberOfWeeks: 12,
      });
      const saved = await saveScheme(scheme);
      setLatestScheme(saved);
      await refreshSchemes();
      showToast({ message: `${saved.weeks.length} weeks drafted for ${saved.subject}.` });
    } catch (err: unknown) {
      showSchemeActionError('Generation failed', err);
    } finally {
      setGenerating(false);
    }
  }

  function showSchemeActionError(title: string, err: unknown) {
    const message = formatAiActionError(err);
    showToast({ message, type: 'error' });

    if (isInsufficientCreditsError(err)) {
      Alert.alert('Not enough credits', message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy credits', onPress: () => router.push('/(tabs)/credits') },
      ]);
      return;
    }

    Alert.alert(title, message);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Schemes of Learning</Text>
      <Text style={styles.sub}>
        Choose the class first. The subject selector only shows subjects mapped for that level.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upload Scheme of Learning (PDF or DOCX)</Text>
        <Text style={styles.cardSub}>
          Select the class, subject and term first. The upload will be parsed into week-by-week
          scheme rows that can be selected directly for lesson planning.
        </Text>

        <SelectField
          label="Class"
          value={classLevel}
          options={CLASS_LEVEL_OPTIONS}
          onChange={(value) => setClassLevel(value as ClassLevel)}
        />

        <SelectField
          label="Subject"
          value={subject}
          options={subjectOptions}
          onChange={setSubject}
          placeholder="Select a subject"
          helperText={
            subjectOptions.length
              ? undefined
              : 'No mapped subjects are available for this level yet.'
          }
          disabled={!subjectOptions.length}
        />

        <SelectField
          label="Term"
          value={term}
          options={TERM_OPTIONS}
          onChange={setTerm}
        />

        {Platform.OS === 'web' ? (
          <View style={styles.webUploadBlock}>
            <Text style={styles.webUploadLabel}>Choose a PDF or DOCX file</Text>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleWebFileChange}
              style={{
                width: '100%',
                fontSize: 14,
                color: colors.text,
              }}
            />
            <Text style={styles.webUploadMeta}>
              {webSelectedAsset ? `Selected: ${webSelectedAsset.name}` : 'No file selected yet.'}
            </Text>
          </View>
        ) : null}
        <Button
          title={Platform.OS === 'web' ? 'Parse Selected File' : 'Choose PDF or DOCX'}
          variant="secondary"
          onPress={handleUpload}
          loading={uploading}
          disabled={Platform.OS === 'web' && !webSelectedAsset}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Generate Scheme of Work</Text>
        <Button title="Generate Scheme of Work" onPress={handleGenerate} loading={generating} />
      </View>

      {latestScheme ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest Generated Scheme</Text>
          <Text style={styles.cardSub}>
            {latestScheme.subject} - {latestScheme.classLevel} - {latestScheme.term}
          </Text>
          <View style={styles.cardActions}>
            <Button
              title="View full"
              variant="secondary"
              onPress={() => router.push(`/scheme/${latestScheme.id}`)}
            />
            <Button
              title="Save as PDF"
              onPress={() => exportSchemePdf(latestScheme)}
            />
          </View>
          {latestScheme.weeks.map((week) => (
            <View key={`${latestScheme.id}-${week.week}`} style={styles.weekRow}>
              <Text style={styles.weekTitle}>Week {week.week}: {getWeekTopic(week) || 'Topic pending'}</Text>
              <Text style={styles.weekMeta}>
                {getWeekStrandSummary(week) || 'No strand'} | {getWeekSubStrandSummary(week) || 'No sub-strand'}
              </Text>
              <Text style={styles.weekMeta}>{week.indicator || week.contentStandard || 'No indicator yet'}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {savedSchemes.length ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved Schemes</Text>
          {savedSchemes.map((scheme) => (
            <Pressable
              key={scheme.id}
              style={styles.savedRow}
              onPress={() => router.push(`/scheme/${scheme.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.savedTitle}>
                  {scheme.subject} - {scheme.classLevel} - {scheme.term}
                </Text>
                <Text style={styles.savedMeta}>
                  {scheme.weeks.length} weeks | {scheme.title}
                </Text>
              </View>
              <Button
                title="PDF"
                variant="secondary"
                onPress={() => exportSchemePdf(scheme)}
                style={styles.savedButton}
              />
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.primaryDark, marginBottom: 6 },
  sub: { color: colors.textMuted, marginBottom: 20, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardSub: { color: colors.textMuted, marginBottom: 12 },
  webUploadBlock: {
    marginBottom: 12,
    gap: 8,
  },
  webUploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  webUploadMeta: {
    color: colors.textMuted,
    lineHeight: 18,
  },
  cardActions: { gap: 10, marginBottom: 8 },
  weekRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  weekTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  weekMeta: { color: colors.textMuted, lineHeight: 18 },
  savedRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  savedMeta: { color: colors.textMuted, lineHeight: 18 },
  savedButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

type UploadAsset = {
  uri: string;
  name: string;
  file?: File;
};

async function pickUploadAsset(
  webInputRef: React.MutableRefObject<HTMLInputElement | null>,
): Promise<UploadAsset | null> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return pickWebUploadAsset(webInputRef);
  }

  const res = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    copyToCacheDirectory: true,
  });

  if (res.canceled || !res.assets?.[0]) return null;

  return {
    uri: res.assets[0].uri,
    name: res.assets[0].name,
  };
}

async function pickWebUploadAsset(
  webInputRef: React.MutableRefObject<HTMLInputElement | null>,
): Promise<UploadAsset | null> {
  const nativePickerAsset = await pickWithShowOpenFilePicker();
  if (nativePickerAsset) {
    return nativePickerAsset;
  }

  return await new Promise((resolve) => {
    let input = webInputRef.current;

    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      input.style.position = 'fixed';
      input.style.left = '-9999px';
      input.style.width = '1px';
      input.style.height = '1px';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
      document.body.appendChild(input);
      webInputRef.current = input;
    }

    input.onchange = () => {
      const file = input?.files?.[0];
      input!.value = '';
      if (!file) {
        resolve(null);
        return;
      }
      resolve({
        uri: URL.createObjectURL(file),
        name: file.name,
        file,
      });
    };

    input.click();
  });
}

async function pickWithShowOpenFilePicker(): Promise<UploadAsset | null> {
  const picker = (globalThis as typeof globalThis & {
    showOpenFilePicker?: (options?: {
      multiple?: boolean;
      excludeAcceptAllOption?: boolean;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<Array<{ getFile: () => Promise<File> }>>;
  }).showOpenFilePicker;

  if (!picker) return null;

  try {
    const [handle] = await picker({
      multiple: false,
      excludeAcceptAllOption: false,
      types: [
        {
          description: 'Scheme documents',
          accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          },
        },
      ],
    });

    if (!handle) return null;

    const file = await handle.getFile();
    return {
      uri: URL.createObjectURL(file),
      name: file.name,
      file,
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return null;
    }
    return null;
  }
}

async function readAssetAsBase64(asset: UploadAsset): Promise<string> {
  if (asset.file) {
    return await blobToBase64(asset.file);
  }

  if (typeof window !== 'undefined' && asset.uri.startsWith('blob:')) {
    const blob = await fetch(asset.uri).then((response) => response.blob());
    return await blobToBase64(blob);
  }

  return FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the uploaded file.'));
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.split(',')[1] ?? '';
      if (!base64) {
        reject(new Error('Could not convert the uploaded file to base64.'));
        return;
      }
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

function applyDetectedMetadata(
  scheme: SchemeOfWork,
  _detectedMetadata: { subject?: string; classLevel?: string; term?: string } | undefined,
  requested: { subject: string; classLevel: string; term: string },
): SchemeOfWork {
  return {
    ...scheme,
    subject: requested.subject,
    classLevel: requested.classLevel as ClassLevel,
    term: requested.term,
  };
}

function buildMetadataNotice(
  detectedMetadata: { subject?: string; classLevel?: string; term?: string } | undefined,
  requested: { subject: string; classLevel: string; term: string },
): string {
  if (!detectedMetadata) return '';

  const notes: string[] = [];

  if (
    detectedMetadata.subject &&
    normalizeLabel(detectedMetadata.subject) !== normalizeLabel(requested.subject)
  ) {
    notes.push(`Detected subject in file: ${detectedMetadata.subject}`);
  }

  if (
    detectedMetadata.classLevel &&
    normalizeLabel(detectedMetadata.classLevel) !== normalizeLabel(requested.classLevel)
  ) {
    notes.push(`Detected class in file: ${detectedMetadata.classLevel}`);
  }

  if (
    detectedMetadata.term &&
    normalizeLabel(detectedMetadata.term) !== normalizeLabel(requested.term)
  ) {
    notes.push(`Detected term in file: ${detectedMetadata.term}`);
  }

  if (!notes.length) {
    return 'The uploaded file metadata matched the selected subject, class and term.';
  }

  return `The uploaded file seems to describe a different scheme.\n${notes.join('\n')}`;
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildParserNotice(scheme: SchemeOfWork): string {
  const warnings = scheme.parserMetadata?.warnings ?? [];
  const confidence = scheme.parserMetadata?.confidence;

  if (!warnings.length && typeof confidence !== 'number') {
    return '';
  }

  const parts: string[] = [];

  if (typeof confidence === 'number') {
    parts.push(`Curriculum match confidence: ${Math.round(confidence * 100)}%`);
  }

  if (warnings.length) {
    parts.push(warnings.slice(0, 3).join('\n'));
  }

  return parts.join('\n\n');
}
