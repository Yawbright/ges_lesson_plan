import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import type { LessonPlan, LessonPhase } from '@/types/lessonPlan';

interface Props {
  plan: LessonPlan;
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
  const title = buildLessonTitle(plan);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* ── 1. Title block ────────────────────────────────── */}
      <View style={styles.titleBlock}>
        <Text style={styles.titleMain}>{(plan.termTitle || '').toUpperCase()}</Text>
        <Text style={styles.titleSub}>{title.toUpperCase()}</Text>
      </View>

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

      {hasTeacherDetails(plan) ? (
        <View style={[styles.teacherDetails, styles.mt8]}>
          {plan.teacherName ? <Text style={styles.teacherText}>Teacher: {plan.teacherName}</Text> : null}
          {plan.schoolName ? <Text style={styles.teacherText}>School: {plan.schoolName}</Text> : null}
          {plan.schoolDistrict ? (
            <Text style={styles.teacherText}>District: {plan.schoolDistrict}</Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
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
    padding: 6,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    justifyContent: 'flex-start',
  },
  lastCell: { borderRightWidth: 0 },
  cellLabel: { fontSize: 10, fontWeight: '700', color: colors.primary },
  cellBody: { fontSize: 12, color: colors.text, lineHeight: 17 },

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
  activityText: { fontSize: 12, color: colors.text, lineHeight: 18, marginBottom: 3 },

  // Assessment (embedded in Phase 2)
  assessmentBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  assessmentTitle: { fontSize: 11, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  assessmentQ: { fontSize: 12, color: colors.text, lineHeight: 17, marginBottom: 2 },

  // Resources
  resourceText: { fontSize: 11, color: colors.text, lineHeight: 16, marginBottom: 2 },
  teacherDetails: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.surface,
    gap: 3,
  },
  teacherText: { fontSize: 12, color: colors.text, lineHeight: 17 },
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
