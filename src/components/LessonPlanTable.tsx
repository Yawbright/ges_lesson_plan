import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { LessonPlan, LessonPhase, LessonVisualAid, LocalLanguageSupport } from '@/types/lessonPlan';

interface Props {
  plan: LessonPlan;
}

interface StackProps {
  plans: LessonPlan[];
}

/**
 * Renders a LessonPlan in the EXACT layout of the official Ghanaian
 * NaCCA/GES lesson plan template (verified against B7 Science Term 2 plans).
 *
 * Layout order:
 *   1. Title block  (TERM LESSON PLAN / SUBJECT – CLASS / WEEK N)
 *   2. Header info  (Date | Period | Subject · Duration | Strand · Class | Size | SubStrand)
 *   3. Curriculum   (Content Standard | Indicator | Lesson No  ·  Perf. Indicator | Competencies)
 *   4. References
 *   5. Phase table  (Phase/Duration · Learners Activities · Resources)
 *      └─ Assessment block embedded inside Phase 2
 */
export function LessonPlanTable({ plan }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <LessonPlanContent plan={plan} />
    </ScrollView>
  );
}

export function LessonPlanStack({ plans }: StackProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {plans.map((plan, index) => (
        <View key={plan.id ?? `${plan.week}-${plan.lessonNumber}-${index}`} style={index > 0 && styles.lessonDivider}>
          <LessonPlanContent plan={plan} />
        </View>
      ))}
    </ScrollView>
  );
}

function LessonPlanContent({ plan }: Props) {
  const title = buildLessonTitle(plan);

  return (
    <View>
      {/* ── 1. Title block ────────────────────────────────── */}
      <View style={styles.titleBlock}>
        <Text style={styles.titleMain}>{(plan.termTitle || '').toUpperCase()}</Text>
        <Text style={styles.titleSub}>{title.toUpperCase()}</Text>
      </View>
      {plan.translationLanguage ? (
        <View style={styles.translationNotice}>
          <Text style={styles.translationNoticeTitle}>{plan.translationLanguage} translation draft</Text>
          <Text style={styles.translationNoticeText}>
            NLLB machine translation. Teacher should review before classroom use.
          </Text>
        </View>
      ) : null}

      {/* ── 2. Header info table ─────────────────────────── */}
      <View style={styles.table}>
        {/* Row 1: Week ending | Period | Subject */}
        <View style={styles.infoRow}>
          <InfoCell label="Week ending" value={plan.date} flex={1.2} />
          <InfoCell label="Period" value={plan.period} flex={0.8} />
          <InfoCell label="Subject" value={plan.subject} flex={1} last />
        </View>
        {/* Row 2: Duration | Strand */}
        <View style={[styles.infoRow, styles.infoRowAlt]}>
          <InfoCell label="Duration" value={plan.duration} flex={1.2} />
          <InfoCell label="Strand" value={plan.strand} flex={1.8} last />
        </View>
        {/* Row 3: Class | Class Size | Sub Strand */}
        <View style={styles.infoRow}>
          <InfoCell label="Class" value={plan.classLevel} flex={1.2} />
          <InfoCell label="Class Size" value={plan.classSize} flex={0.8} />
          <InfoCell label="Sub Strand" value={plan.subStrand} flex={1} last />
        </View>
        <View style={[styles.infoRow, styles.infoRowAlt]}>
          <InfoCell label="Topic" value={plan.topic} flex={1.5} />
          <InfoCell
            label="Lesson in Week"
            value={
              plan.lessonNumber ||
              (plan.sessionIndex && plan.sessionsPerWeek
                ? `${plan.sessionIndex} of ${plan.sessionsPerWeek}`
                : '')
            }
            flex={0.8}
            last
          />
        </View>
      </View>

      {/* ── 3. Curriculum block ───────────────────────────── */}
      <View style={[styles.table, styles.mt8]}>
        {/* Content Standard | Indicator | Lesson */}
        <View style={styles.infoRow}>
          <View style={[styles.cellWrap, { flex: 1.5 }]}>
            <InlineCellText label="Content Standard:" value={plan.contentStandard} />
          </View>
          <View style={[styles.cellWrap, { flex: 1.3 }]}>
            <InlineCellText label="Indicator:" value={plan.indicator} />
          </View>
          <View style={[styles.cellWrap, { flex: 0.5 }, styles.lastCell]}>
            <InlineCellText label="Lesson:" value={plan.lessonNumber} />
          </View>
        </View>
        {/* Performance Indicator | Core Competencies */}
        <View style={[styles.infoRow, styles.infoRowAlt]}>
          <View style={[styles.cellWrap, { flex: 1.5 }]}>
            <InlineCellText label="Performance Indicator:" value={plan.performanceIndicator} />
          </View>
          <View style={[styles.cellWrap, { flex: 1.8 }, styles.lastCell]}>
            <InlineCellText label="Core Competencies:" value={plan.coreCompetencies?.join(': ') ?? ''} />
          </View>
        </View>
        {/* References */}
        {plan.references ? (
          <View style={[styles.infoRow]}>
            <View style={[styles.cellWrap, { flex: 1 }, styles.lastCell]}>
              <InlineCellText label="References:" value={plan.references} />
            </View>
          </View>
        ) : null}
      </View>

      {/* ── 4. Phase table ────────────────────────────────── */}
      <View style={[styles.table, styles.mt8]}>
        {/* Column headers */}
        <View style={[styles.infoRow, { backgroundColor: colors.tableHeader }]}>
          <Text style={[styles.phaseHeaderCell, { flex: 0.45 }]}>Phase/Duration</Text>
          <Text style={[styles.phaseHeaderCell, { flex: 2.8 }]}>Learners Activities</Text>
          <Text style={[styles.phaseHeaderCell, { flex: 0.45 }, styles.lastCell]}>Resources</Text>
        </View>
        {plan.phases.map((phase, idx) => (
          <PhaseRow key={phase.phase} phase={phase} alt={idx % 2 === 1} />
        ))}
      </View>

      {plan.visualAids?.length ? <VisualAidBlock visualAid={plan.visualAids[0]} /> : null}
      {plan.localLanguageSupport ? <LocalLanguageBlock support={plan.localLanguageSupport} /> : null}

      {hasTeacherDetails(plan) ? (
        <View style={[styles.teacherDetails, styles.mt8]}>
          {plan.teacherName ? <Text style={styles.teacherText}>Teacher: {plan.teacherName}</Text> : null}
          {plan.schoolName ? <Text style={styles.teacherText}>School: {plan.schoolName}</Text> : null}
          {plan.schoolDistrict ? (
            <Text style={styles.teacherText}>District: {plan.schoolDistrict}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function LocalLanguageBlock({ support }: { support: LocalLanguageSupport }) {
  const hasContent = Boolean(
    support.reviewNote ||
    support.vocabulary?.length ||
      support.classroomExpressions?.length ||
      support.activityPrompts?.length ||
      support.assessmentPrompts?.length,
  );
  if (!hasContent) return null;

  return (
    <View style={styles.localLanguageBlock}>
      <Text style={styles.visualLabel}>Local Language Support</Text>
      <Text style={styles.visualTitle}>{support.language}</Text>
      <Text style={styles.localReview}>
        {support.reviewNote || 'AI-assisted draft. Teacher should review before classroom use.'}
      </Text>
      <TranslationGroup title="Key Vocabulary" items={support.vocabulary} showPronunciation />
      <TranslationGroup title="Classroom Expressions" items={support.classroomExpressions} />
      <TranslationGroup title="Activity Prompts" items={support.activityPrompts} />
      <TranslationGroup title="Assessment Prompts" items={support.assessmentPrompts} />
    </View>
  );
}

function TranslationGroup({
  title,
  items,
  showPronunciation,
}: {
  title: string;
  items?: { english: string; local: string; pronunciation?: string }[];
  showPronunciation?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <View style={styles.translationGroup}>
      <Text style={styles.translationGroupTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={`${title}-${item.english}-${index}`} style={styles.translationRow}>
          <Text style={styles.translationEnglish}>{item.english}</Text>
          <View style={styles.translationLocalWrap}>
            <Text style={styles.translationLocal}>{item.local}</Text>
            {showPronunciation && item.pronunciation ? (
              <Text style={styles.translationPronunciation}>{item.pronunciation}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function VisualAidBlock({ visualAid }: { visualAid: LessonVisualAid }) {
  return (
    <View style={styles.visualBlock}>
      <Text style={styles.visualLabel}>Visual Aid{visualAid.phase ? ` - Phase ${visualAid.phase}` : ''}</Text>
      <Text style={styles.visualTitle}>{visualAid.title}</Text>
      {visualAid.purpose ? <Text style={styles.visualPurpose}>{visualAid.purpose}</Text> : null}
      {visualAid.activityLink ? <Text style={styles.visualActivity}>{visualAid.activityLink}</Text> : null}
      <VisualAidFigure visualAid={visualAid} />
      {visualAid.caption ? <Text style={styles.visualCaption}>{visualAid.caption}</Text> : null}
    </View>
  );
}

function VisualAidFigure({ visualAid }: { visualAid: LessonVisualAid }) {
  if (visualAid.type === 'bar_chart' && visualAid.data?.length) {
    const maxValue = Math.max(...visualAid.data.map((item) => item.value), 1);
    return (
      <View style={styles.chart}>
        {visualAid.data.slice(0, 5).map((item, index) => (
          <View key={`${item.label}-${index}`} style={styles.barRow}>
            <Text style={styles.barLabel}>{item.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.max(8, (item.value / maxValue) * 100)}%` }]} />
            </View>
            <Text style={styles.barValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  if ((visualAid.type === 'flowchart' || visualAid.type === 'timeline') && visualAid.steps?.length) {
    return (
      <View style={styles.stepList}>
        {visualAid.steps.slice(0, 6).map((step, index) => (
          <View key={`${step}-${index}`} style={styles.stepItem}>
            <Text style={styles.stepIndex}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (visualAid.type === 'comparison_table' && visualAid.rows?.length) {
    return (
      <View style={styles.visualTable}>
        {visualAid.rows.slice(0, 5).map((row, index) => (
          <View key={`${row.label}-${index}`} style={[styles.visualTableRow, index % 2 === 1 && styles.infoRowAlt]}>
            <Text style={styles.visualTableLabel}>{row.label}</Text>
            <Text style={styles.visualTableValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    );
  }

  const labels = visualAid.labels?.length ? visualAid.labels : visualAid.steps;
  return (
    <View style={styles.labelGrid}>
      {labels?.slice(0, 6).map((label, index) => (
        <Text key={`${label}-${index}`} style={styles.labelChip}>{label}</Text>
      ))}
    </View>
  );
}

function InfoCell({
  label, value, flex, last,
}: { label: string; value?: string | number | null; flex: number; last?: boolean }) {
  return (
    <View style={[styles.cellWrap, { flex }, last && styles.lastCell]}>
      <InlineCellText label={label} value={value} />
    </View>
  );
}

function InlineCellText({ label, value }: { label: string; value?: string | number | null }) {
  const separator = label.trim().endsWith(':') ? ' ' : ': ';
  return (
    <Text style={styles.cellBody}>
      <Text style={styles.cellLabel}>{label}{separator}</Text>
      {value ?? ''}
    </Text>
  );
}

function PhaseRow({ phase, alt }: { phase: LessonPhase; alt: boolean }) {
  return (
    <View style={[styles.infoRow, alt && styles.infoRowAlt]}>
      {/* Phase / Duration column */}
      <View style={[styles.cellWrap, { flex: 0.45 }]}>
        <Text style={styles.phaseLabel}>PHASE {phase.phase}:</Text>
        <Text style={styles.phaseTitle}>{phase.title}</Text>
        {phase.duration ? (
          <Text style={styles.phaseDuration}>{phase.duration}</Text>
        ) : null}
      </View>

      {/* Learners Activities column */}
      <View style={[styles.cellWrap, { flex: 2.8 }]}>
        {phase.activities.map((act, i) => (
          <Text key={i} style={styles.activityText}>{act}</Text>
        ))}
        {/* Assessment embedded in Phase 2 */}
        {phase.assessment?.length ? (
          <View style={styles.assessmentBlock}>
            <Text style={styles.assessmentTitle}>Assessment</Text>
            {phase.assessment.map((q, i) => (
              <Text key={i} style={styles.assessmentQ}>{`${i + 1}. ${q}`}</Text>
            ))}
          </View>
        ) : null}
      </View>

      {/* Resources column */}
      <View style={[styles.cellWrap, { flex: 0.45 }, styles.lastCell]}>
        {phase.resources?.map((r, i) => (
          <Text key={i} style={styles.resourceText}>{r}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, paddingBottom: 64 },
  lessonDivider: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },

  // Title block
  titleBlock: { alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
  titleMain: { fontSize: 15, fontWeight: '800', color: colors.primaryDark, textAlign: 'center' },
  titleSub: { fontSize: 13, fontWeight: '700', color: colors.primaryDark, marginTop: 2, textAlign: 'center' },
  titleWeek: { fontSize: 13, fontWeight: '700', color: colors.primaryDark, marginTop: 2, textAlign: 'center' },

  // Generic table/row helpers
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  mt8: { marginTop: 8 },
  infoRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 32,
  },
  infoRowAlt: { backgroundColor: colors.tableRowAlt },

  // Cell
  cellWrap: {
    padding: 5,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    justifyContent: 'flex-start',
  },
  lastCell: { borderRightWidth: 0 },
  cellLabel: { fontSize: 10, fontWeight: '700', color: colors.primary },
  cellBody: { fontSize: 13, color: colors.text, lineHeight: 18 },

  // Phase table header
  phaseHeaderCell: {
    padding: 8,
    fontWeight: '700',
    fontSize: 11,
    color: colors.tableHeaderText,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255,255,255,0.3)',
  },

  // Phase row left column
  phaseLabel: { fontSize: 10, fontWeight: '800', color: colors.primary },
  phaseTitle: { fontSize: 11, fontWeight: '600', color: colors.text, marginTop: 2 },
  phaseDuration: { fontSize: 10, color: colors.textMuted, marginTop: 3 },

  // Activities
  activityText: { fontSize: 13, color: colors.text, lineHeight: 18, marginBottom: 2 },

  // Assessment (embedded in Phase 2)
  assessmentBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  assessmentTitle: { fontSize: 11, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  assessmentQ: { fontSize: 13, color: colors.text, lineHeight: 18, marginBottom: 2 },

  // Resources
  resourceText: { fontSize: 12, color: colors.text, lineHeight: 16, marginBottom: 2 },
  visualBlock: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.surface,
  },
  localLanguageBlock: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.surface,
  },
  localReview: { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginTop: 3 },
  translationGroup: { marginTop: 8 },
  translationGroupTitle: { fontSize: 11, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  translationRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingVertical: 5,
    gap: 8,
  },
  translationEnglish: { flex: 1, fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  translationLocalWrap: { flex: 1.1 },
  translationLocal: { fontSize: 12, color: colors.text, fontWeight: '700', lineHeight: 16 },
  translationPronunciation: { fontSize: 10, color: colors.textMuted, lineHeight: 14 },
  visualLabel: { fontSize: 10, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' },
  visualTitle: { fontSize: 13, fontWeight: '800', color: colors.text, marginTop: 2 },
  visualPurpose: { fontSize: 12, color: colors.text, lineHeight: 17, marginTop: 3 },
  visualActivity: { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginTop: 2 },
  visualCaption: { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginTop: 5 },
  chart: { marginTop: 8, gap: 5 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel: { width: 76, fontSize: 11, color: colors.text },
  barTrack: { flex: 1, height: 10, backgroundColor: colors.tableRowAlt, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary },
  barValue: { width: 28, fontSize: 11, color: colors.textMuted, textAlign: 'right' },
  stepList: { marginTop: 8, gap: 5 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  stepIndex: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 18,
  },
  stepText: { flex: 1, fontSize: 12, color: colors.text, lineHeight: 17 },
  visualTable: { marginTop: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  visualTableRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  visualTableLabel: { flex: 0.8, padding: 5, fontSize: 11, fontWeight: '800', color: colors.primary },
  visualTableValue: { flex: 1.2, padding: 5, fontSize: 12, color: colors.text, lineHeight: 17 },
  labelGrid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  labelChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 11,
    color: colors.text,
    backgroundColor: colors.tableRowAlt,
  },
  teacherDetails: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.surface,
    gap: 3,
  },
  teacherText: { fontSize: 13, color: colors.text, lineHeight: 18 },
  translationNotice: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.accentSoft,
    marginBottom: 8,
  },
  translationNoticeTitle: { fontSize: 12, color: colors.primaryDark, fontWeight: '800' },
  translationNoticeText: { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginTop: 2 },
});

function buildLessonTitle(plan: LessonPlan) {
  const rawLessonCount =
    plan.lessonNumber?.trim() ||
    (plan.sessionIndex && plan.sessionsPerWeek
      ? `Lesson ${plan.sessionIndex} of ${plan.sessionsPerWeek}`
      : '');
  const lessonCount =
    rawLessonCount && rawLessonCount.toLowerCase().includes('lesson')
      ? rawLessonCount
      : rawLessonCount
        ? `Lesson ${rawLessonCount}`
        : '';
  const lessonSuffix = lessonCount ? ` (${lessonCount})` : '';
  return `${plan.subjectClassTitle} - ${plan.weekTitle}${lessonSuffix}`;
}

function hasTeacherDetails(plan: LessonPlan) {
  return Boolean(plan.teacherName || plan.schoolName || plan.schoolDistrict);
}
