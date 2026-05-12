interface SchemeWeekEntry {
  strand?: string;
  subStrand?: string;
  contentStandard?: string;
  indicator?: string;
  topic?: string;
  resources?: string[];
}

interface SchemeWeek extends SchemeWeekEntry {
  week: number;
  theme?: string;
  entries?: SchemeWeekEntry[];
}

interface SchemeContext {
  title?: string;
  subject?: string;
  classLevel?: string;
  term?: string;
  selectedWeek?: SchemeWeek;
  previousWeek?: SchemeWeek;
  nextWeek?: SchemeWeek;
}

export interface LessonGenerationBody {
  subject: string;
  classLevel: string;
  week: number;
  term?: string;
  notes?: string;
  sessionIndex?: number;
  sessionsPerWeek?: number;
  weekEnding?: string;
  duration?: string;
  teacherName?: string;
  schoolName?: string;
  schoolDistrict?: string;
  classSize?: string;
  schemeContext?: SchemeContext;
}

export interface LessonSupportTranslationBody {
  lessonPlan: Record<string, unknown>;
  localLanguage: string;
}

export interface SchemeGenerationBody {
  subject: string;
  classLevel: string;
  term: string;
  academicYear?: string;
  numberOfWeeks?: number;
  notes?: string;
}

export interface TeachingNotesGenerationBody {
  lessonPlan: Record<string, unknown>;
}

export const lessonPlanSystemPrompt = `You are an expert curriculum designer for the Ghanaian Basic and Senior High
School standards-based curriculum (NaCCA / GES). You write lesson plans that match
the exact official Ghanaian lesson plan template used by schools across Ghana.

Always respond with a single JSON object only, no markdown or commentary, with this shape:
{
  "termTitle": string,
  "subjectClassTitle": string,
  "weekTitle": string,
  "date": string,
  "period": string,
  "subject": string,
  "duration": string,
  "strand": string,
  "classLevel": string,
  "classSize": string,
  "subStrand": string,
  "topic": string,
  "contentStandard": string,
  "indicator": string,
  "lessonNumber": string,
  "performanceIndicator": string,
  "coreCompetencies": string[],
  "references": string,
  "week": number,
  "phases": [
    {
      "phase": 1,
      "title": "STARTER",
      "duration": string,
      "activities": string[],
      "resources": string[]
    },
    {
      "phase": 2,
      "title": "NEW LEARNING",
      "duration": string,
      "activities": string[],
      "resources": string[],
      "assessment": string[]
    },
    {
      "phase": 3,
      "title": "REFLECTION",
      "duration": string,
      "activities": string[],
      "resources": string[]
    }
  ],
  "visualAids": [
    {
      "type": "labelled_diagram" | "bar_chart" | "flowchart" | "timeline" | "comparison_table",
      "title": string,
      "purpose": string,
      "phase": 1 | 2 | 3,
      "activityLink": string,
      "labels": string[],
      "steps": string[],
      "data": [{ "label": string, "value": number }],
      "rows": [{ "label": string, "value": string }],
      "caption": string
    }
  ]
}

Rules:
- When a scheme context is provided, treat it as the authoritative guide for the week's strand, sub-strand,
  content standard, indicator, topic focus, and progression.
- When a scheme context is provided, the output topic, strand, sub-strand, content standard, and indicator
  must match the selected week from that scheme. Do not substitute a different topic from another term or strand.
- When session information is provided, set lessonNumber to match that weekly session, for example "1 of 3",
  "2 of 3", or "3 of 3", and make the activities progress within the same topic across the week.
- Always set duration to "60 mins" unless the request explicitly provides a different duration.
- When a week ending date is provided, put it in the date field.
- When no scheme context is provided, infer the weekly focus from the NaCCA curriculum and the term position:
  Term 1 = beginning of the curriculum sequence, Term 2 = middle sequence, Term 3 = later/end sequence.
- Use Ghanaian English spelling.
- Use culturally relevant Ghanaian examples.
- Make activities age-appropriate.
- Phase 2 must include exactly 3 assessment questions.
- Include at most one visual aid when it genuinely supports a classroom activity. If no visual is useful, return "visualAids": [].
- Visual aids must be compact and renderable from structured data only; do not return image URLs, markdown, SVG, or base64.
- For labelled_diagram use labels; for flowchart/timeline use steps; for bar_chart use data; for comparison_table use rows.
- Return JSON only.`;

export const lessonSupportTranslationSystemPrompt = `You translate Ghanaian classroom lesson support into local languages.
Return a single JSON object only, no markdown or commentary, with this shape:
{
  "language": string,
  "reviewNote": string,
  "vocabulary": [{ "english": string, "local": string, "pronunciation": string }],
  "classroomExpressions": [{ "english": string, "local": string }],
  "activityPrompts": [{ "english": string, "local": string }],
  "assessmentPrompts": [{ "english": string, "local": string }]
}

Rules:
- Keep English as the source text and provide side-by-side local language support only.
- Do not translate the full lesson plan.
- Produce 4-6 vocabulary items, 2-4 classroom expressions, 1-3 activity prompts, and 1-3 assessment prompts.
- Prefer natural classroom language over literal wording.
- Use Ghanaian classroom context.
- Add a reviewNote reminding the teacher to review spelling, dialect, and tone before classroom use.
- Return JSON only.`;

export const schemeSystemPrompt = `You are an expert Ghanaian curriculum planner.
Return a single JSON object only with this shape:
{
  "title": string,
  "subject": string,
  "classLevel": string,
  "term": string,
  "weeks": [
    {
      "week": number,
      "strand": string,
      "subStrand": string,
      "contentStandard": string,
      "indicator": string,
      "topic": string,
      "resources": string[]
    }
  ]
}

Rules:
- Produce the requested number of weeks.
- Base the scheme on the Ghana Education Service / NaCCA curriculum progression for the requested subject and class.
- Respect term progression:
  * Term 1 / First Term = beginning topics and foundations for the curriculum year
  * Term 2 / Second Term = middle topics that logically follow term 1 work
  * Term 3 / Third Term = later or concluding topics for the curriculum year
- Sequence the weeks logically across the term rather than repeating the same strand.
- For each week, provide a clear topic, strand, sub-strand, content standard, and indicator that fit the term position.
- Use Ghanaian curriculum language and examples.
- Return JSON only.`;

export const teachingNotesSystemPrompt = `You are an expert Ghanaian subject teacher and textbook writer.
Generate a learner-facing teaching note from a saved Ghanaian NaCCA/GES lesson plan.
The note should read like a focused textbook section for exactly what the teacher will teach in that lesson, not like a lesson-plan extension.

Always respond with a single JSON object only, no markdown or commentary, with this shape:
{
  "lessonPlanId": string,
  "title": string,
  "subject": string,
  "classLevel": string,
  "week": number,
  "lessonNumber": string,
  "topic": string,
  "overview": string,
  "preparation": string[],
  "phaseGuidance": [
    { "phase": 1, "title": "STARTER", "teacherNotes": string[] },
    { "phase": 2, "title": "NEW LEARNING", "teacherNotes": string[] },
    { "phase": 3, "title": "REFLECTION", "teacherNotes": string[] }
  ],
  "keyExplanations": string[],
  "misconceptions": string[],
  "questionsToAsk": string[],
  "differentiation": string[],
  "classroomManagement": string[],
  "boardSummary": string[],
  "homework": string[],
  "visuals": [
    {
      "id": string,
      "kind": "diagram" | "chart" | "process" | "table" | "board_sketch" | "curated_image" | "generated_image",
      "source": "structured" | "curated" | "generated",
      "title": string,
      "caption": string,
      "altText": string,
      "prompt": string,
      "labels": [{ "label": string, "description": string }],
      "rows": string[][],
      "steps": string[]
    }
  ]
  }
  
  Rules:
  - Ground the notes strictly in the provided lesson plan.
  - Write the content the teacher will teach and the learners can copy/read, not instructions about how to teach.
  - Keep the current JSON structure, but reinterpret the fields as content-note sections:
    * overview = textbook-style introduction to the topic.
    * preparation = key words, prior knowledge, and materials needed to understand the note.
    * phaseGuidance.teacherNotes = the main lesson content, arranged from introduction to worked examples/practice/reflection.
    * keyExplanations = clear definitions, rules, formulas, steps, and examples.
    * misconceptions = common learner errors with corrected explanations.
    * questionsToAsk = learner practice questions and oral review questions.
    * differentiation = extra support examples and extension tasks for learners.
    * classroomManagement = short teacher-only delivery notes; keep this practical and brief.
    * boardSummary = concise learner copy notes for the board.
  - Include worked examples where the subject needs them, especially Mathematics.
  - For Mathematics, include definitions, place-value tables, worked examples, comparison/ordering steps, and practice items.
  - Visuals must be embedded concept aids for the lesson content, as if placed inside a textbook chapter.
  - Include visuals only when they directly match the subject and topic. Never include examples from another subject.
  - Use structured diagrams/charts/tables for science diagrams, maths place-value tables, processes, comparison charts, board summaries, and labelled explanations.
  - Use curated_image only when the subject/topic explicitly needs a known real-world image, for example Computing/ICT web browsers or a lesson about posture.
  - Do not mention web browsers, Chrome, Firefox, Edge, Safari, or internet examples unless the lesson subject/topic is Computing/ICT or explicitly about browsers.
  - Use generated_image only as a placeholder prompt for a custom content illustration; do not include imageUrl.
  - Keep the JSON complete: overview 3-5 sentences; preparation 4-6 items; each phaseGuidance.teacherNotes 6-9 rich content items; every other text array 4-8 items; visuals 0-3 items.
  - Do not wrap the response in markdown fences.
  - Return JSON only.`;

export function buildLessonPrompt(body: LessonGenerationBody): string {
  const sessionBlock =
    body.sessionIndex && body.sessionsPerWeek
      ? `\nThis lesson is session ${body.sessionIndex} of ${body.sessionsPerWeek} for the week.
Shape the activities as part of a multi-lesson sequence on the same weekly topic:
- Session 1 should introduce the weekly topic and establish foundational understanding.
- Later sessions should deepen, practise, apply, assess, or extend the same topic without changing it.\n`
      : '';

  const schemeContextBlock = body.schemeContext
    ? `\nUse this saved term scheme as the primary curriculum guide for this lesson:
- Scheme title: ${body.schemeContext.title || ''}
- Subject: ${body.schemeContext.subject || ''}
- Class Level: ${body.schemeContext.classLevel || ''}
- Term: ${body.schemeContext.term || ''}
${formatWeekBlock('Selected week', body.schemeContext.selectedWeek)}${formatWeekBlock(
        'Previous week',
        body.schemeContext.previousWeek,
      )}${formatWeekBlock('Next week', body.schemeContext.nextWeek)}

The lesson plan must align tightly with the selected scheme week. Use the strand, sub-strand, indicator,
content standard, and topic progression from the scheme. Do not jump ahead to later-term content unless the
scheme context explicitly does so.\n`
    : '\nIf no saved scheme context is provided, infer the correct week focus from the NaCCA curriculum progression for the requested term.\n';

  return (
    `Draft a complete Ghanaian lesson plan for:\n` +
    `- Subject: ${body.subject}\n` +
    `- Class Level: ${body.classLevel}\n` +
    `- Week: ${body.week}\n` +
    (body.term ? `- Term: ${body.term}\n` : '') +
    (body.weekEnding ? `- Week ending: ${body.weekEnding}\n` : '') +
    (body.duration ? `- Lesson duration: ${body.duration}\n` : '- Lesson duration: 60 mins\n') +
    (body.classSize ? `- Class size: ${body.classSize}\n` : '') +
    (body.notes ? `- Additional notes: ${body.notes}\n` : '') +
    sessionBlock +
    schemeContextBlock +
    `\nReturn the JSON object only.`
  );
}

export function buildSchemePrompt(body: SchemeGenerationBody): string {
  const weeks = body.numberOfWeeks ?? 12;

  return (
    `Generate a ${weeks}-week Scheme of Work for:\n` +
    `- Subject: ${body.subject}\n` +
    `- Class: ${body.classLevel}\n` +
    `- Term: ${body.term}\n` +
    (body.academicYear ? `- Academic Year: ${body.academicYear}\n` : '') +
    (body.notes ? `- Notes: ${body.notes}\n` : '') +
    `\nReturn the JSON object only.`
  );
}

export function buildTeachingNotesPrompt(body: TeachingNotesGenerationBody): string {
  return (
    `Generate a textbook-style learner teaching note for this saved lesson plan.\n` +
    `The output should contain the actual lesson content to teach, including clear explanations and worked examples where useful.\n` +
    `Lesson plan JSON:\n${JSON.stringify(body.lessonPlan)}\n\n` +
    `Return one complete JSON object only. Do not use markdown fences.`
  );
}

export function normalizeLessonPlanResponse(
  payload: Record<string, unknown>,
  body: LessonGenerationBody,
) {
  const selectedWeek = body?.schemeContext?.selectedWeek;
  const primaryEntry =
    Array.isArray(selectedWeek?.entries) && selectedWeek.entries.length
      ? selectedWeek.entries[0]
      : null;
  const termLabel = cleanText(body?.term) || cleanText(body?.schemeContext?.term) || 'Term';
  const subject = cleanText(payload?.subject) || cleanText(body?.subject);
  const classLevel = cleanText(payload?.classLevel) || cleanText(body?.classLevel);
  const sessionIndex = Number(body?.sessionIndex) || undefined;
  const sessionsPerWeek = Number(body?.sessionsPerWeek) || undefined;

  return {
    ...payload,
    subject,
    classLevel,
    week: Number(payload?.week) || Number(body?.week) || 1,
    weekTitle: cleanText(payload?.weekTitle) || `WEEK ${Number(body?.week) || 1}`,
    date: cleanText(payload?.date) || cleanText(body?.weekEnding),
    duration: cleanText(body?.duration) || cleanText(payload?.duration) || '60 mins',
    classSize: cleanText(body?.classSize) || cleanText(payload?.classSize),
    termTitle:
      cleanText(payload?.termTitle) ||
      `${termLabel.toUpperCase()} LESSON PLAN`,
    subjectClassTitle:
      cleanText(payload?.subjectClassTitle) ||
      `${subject.toUpperCase()} - ${classLevel.toUpperCase()}`,
    lessonNumber:
      cleanText(payload?.lessonNumber) ||
      (sessionIndex && sessionsPerWeek ? `${sessionIndex} of ${sessionsPerWeek}` : ''),
    sessionIndex,
    sessionsPerWeek,
    strand: selectedWeek?.strand || cleanText(primaryEntry?.strand) || cleanText(payload?.strand),
    subStrand:
      selectedWeek?.subStrand || cleanText(primaryEntry?.subStrand) || cleanText(payload?.subStrand),
    topic: selectedWeek?.topic || cleanText(primaryEntry?.topic) || cleanText(payload?.topic),
    contentStandard:
      selectedWeek?.contentStandard ||
      cleanText(primaryEntry?.contentStandard) ||
      cleanText(payload?.contentStandard),
    indicator:
      selectedWeek?.indicator || cleanText(primaryEntry?.indicator) || cleanText(payload?.indicator),
    references:
      cleanText(payload?.references) ||
      (selectedWeek?.topic ? `Scheme topic: ${selectedWeek.topic}` : ''),
    visualAids: normalizeVisualAids(payload?.visualAids),
    teacherName: cleanText(body?.teacherName),
    schoolName: cleanText(body?.schoolName),
    schoolDistrict: cleanText(body?.schoolDistrict),
  };
}

export function buildLessonSupportTranslationPrompt(body: LessonSupportTranslationBody) {
  const plan = body.lessonPlan;
  const phases = Array.isArray(plan?.phases) ? plan.phases as Record<string, unknown>[] : [];
  const phaseText = phases
    .map((phase) => {
      const activities = Array.isArray(phase.activities) ? phase.activities.join(' | ') : '';
      const assessment = Array.isArray(phase.assessment) ? phase.assessment.join(' | ') : '';
      return `Phase ${phase.phase || ''} ${phase.title || ''}: ${activities}${assessment ? ` Assessment: ${assessment}` : ''}`;
    })
    .join('\n');

  return `Create local language classroom support for this English lesson plan.
- Target local language: ${body.localLanguage}
- Subject: ${cleanText(plan?.subject)}
- Class Level: ${cleanText(plan?.classLevel)}
- Topic: ${cleanText(plan?.topic)}
- Strand: ${cleanText(plan?.strand)}
- Sub-strand: ${cleanText(plan?.subStrand)}
- Performance indicator: ${cleanText(plan?.performanceIndicator)}
- Core lesson activities:
${phaseText}

Return the JSON object only.`;
}

export function normalizeLessonSupportTranslationResponse(
  payload: Record<string, unknown>,
  body: LessonSupportTranslationBody,
) {
  return normalizeLocalLanguageSupport(payload, body.localLanguage);
}

function normalizeLocalLanguageSupport(value: unknown, requestedLanguage?: string) {
  const language = cleanText(requestedLanguage);
  if (!language || !value || typeof value !== 'object') return undefined;
  const support = value as Record<string, unknown>;

  return {
    language,
    reviewNote:
      cleanText(support?.reviewNote) ||
      'AI-assisted local language draft. Teacher should review spelling, dialect, and tone before classroom use.',
    vocabulary: cleanTranslationPairs(support?.vocabulary, 6, true),
    classroomExpressions: cleanTranslationPairs(support?.classroomExpressions, 4),
    activityPrompts: cleanTranslationPairs(support?.activityPrompts, 3),
    assessmentPrompts: cleanTranslationPairs(support?.assessmentPrompts, 3),
  };
}

function cleanTranslationPairs(value: unknown, limit: number, includePronunciation = false) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = item as Record<string, unknown>;
      const english = cleanText(row?.english);
      const local = cleanText(row?.local);
      if (!english || !local) return null;
      return includePronunciation
        ? { english, local, pronunciation: cleanText(row?.pronunciation) || undefined }
        : { english, local };
    })
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeVisualAids(value: unknown) {
  if (!Array.isArray(value)) return [];
  const allowedTypes = new Set(['labelled_diagram', 'bar_chart', 'flowchart', 'timeline', 'comparison_table']);

  return value
    .slice(0, 1)
    .map((item) => {
      const visual = item as Record<string, unknown>;
      const type = cleanText(visual?.type);
      const title = cleanText(visual?.title);
      if (!allowedTypes.has(type) || !title) return null;
      const phase = Number(visual?.phase);

      return {
        type,
        title,
        purpose: cleanText(visual?.purpose),
        phase: phase === 1 || phase === 2 || phase === 3 ? phase : undefined,
        activityLink: cleanText(visual?.activityLink),
        labels: cleanStringList(visual?.labels, 6),
        steps: cleanStringList(visual?.steps, 6),
        data: cleanChartData(visual?.data),
        rows: cleanVisualRows(visual?.rows),
        caption: cleanText(visual?.caption),
      };
    })
    .filter(Boolean);
}

function cleanStringList(value: unknown, limit: number) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item)).filter(Boolean).slice(0, limit)
    : [];
}

function cleanChartData(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = item as Record<string, unknown>;
      const label = cleanText(row?.label);
      const numericValue = Number(row?.value);
      if (!label || !Number.isFinite(numericValue)) return null;
      return { label, value: numericValue };
    })
    .filter(Boolean)
    .slice(0, 5);
}

function cleanVisualRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = item as Record<string, unknown>;
      const label = cleanText(row?.label);
      const rowValue = cleanText(row?.value);
      if (!label || !rowValue) return null;
      return { label, value: rowValue };
    })
    .filter(Boolean)
    .slice(0, 5);
}

export function normalizeSchemeResponse(
  payload: Record<string, unknown>,
  input: SchemeGenerationBody,
) {
  const weeks = Array.isArray(payload?.weeks) ? payload.weeks : [];
  const normalizedWeeks = normalizeParsedWeeks(
    weeks.map((week, index) => ({
      week: parseWeekNumber((week as Record<string, unknown>)?.week, index),
      strand: cleanText((week as Record<string, unknown>)?.strand),
      subStrand: cleanText((week as Record<string, unknown>)?.subStrand),
      contentStandard: cleanText((week as Record<string, unknown>)?.contentStandard),
      indicator: cleanText((week as Record<string, unknown>)?.indicator),
      topic: cleanText((week as Record<string, unknown>)?.topic),
      resources: Array.isArray((week as Record<string, unknown>)?.resources)
        ? ((week as Record<string, unknown>).resources as unknown[])
            .map((item) => cleanText(item))
            .filter(Boolean)
        : [],
    })),
    input.numberOfWeeks ?? 12,
  );

  return {
    id: `${slugify(input.subject)}-${input.classLevel}-${slugify(input.term)}-${Date.now()}`,
    title:
      cleanText(payload?.title) ||
      `${input.subject} Scheme of Work - ${input.classLevel} ${input.term}`,
    subject: cleanText(payload?.subject) || input.subject,
    classLevel: cleanText(payload?.classLevel) || input.classLevel,
    term: cleanText(payload?.term) || input.term,
    academicYear: cleanText(payload?.academicYear) || input.academicYear || undefined,
    weeks: normalizedWeeks,
    createdAt: new Date().toISOString(),
  };
}

export function normalizeTeachingNotesResponse(
  payload: Record<string, unknown>,
  body: TeachingNotesGenerationBody,
) {
  const lessonPlan = body.lessonPlan ?? {};
  const subject = cleanText(payload?.subject) || cleanText(lessonPlan.subject);
  const classLevel = cleanText(payload?.classLevel) || cleanText(lessonPlan.classLevel);
  const week = Number(payload?.week) || Number(lessonPlan.week) || 1;
  const lessonPlanId = cleanText(payload?.lessonPlanId) || cleanText(lessonPlan.id) || `${subject}-${classLevel}-${week}`;

  return {
    ...payload,
    lessonPlanId,
    title: cleanText(payload?.title) || `Teaching Notes: ${subject} ${classLevel} Week ${week}`,
    subject,
    classLevel,
    week,
    lessonNumber: cleanText(payload?.lessonNumber) || cleanText(lessonPlan.lessonNumber),
    topic: cleanText(payload?.topic) || cleanText(lessonPlan.topic),
    preparation: arrayOfText(payload?.preparation),
    phaseGuidance: Array.isArray(payload?.phaseGuidance) ? payload.phaseGuidance : [],
    keyExplanations: arrayOfText(payload?.keyExplanations),
    misconceptions: arrayOfText(payload?.misconceptions),
    questionsToAsk: arrayOfText(payload?.questionsToAsk),
    differentiation: arrayOfText(payload?.differentiation),
    classroomManagement: arrayOfText(payload?.classroomManagement),
    boardSummary: arrayOfText(payload?.boardSummary),
    homework: arrayOfText(payload?.homework),
    visuals: normalizeTeachingNoteVisuals(payload?.visuals, subject, cleanText(payload?.topic) || cleanText(lessonPlan.topic)),
    sourceLessonPlan: {
      id: cleanText(lessonPlan.id),
      subject: cleanText(lessonPlan.subject),
      classLevel: cleanText(lessonPlan.classLevel),
      week: Number(lessonPlan.week) || week,
      lessonNumber: cleanText(lessonPlan.lessonNumber),
      topic: cleanText(lessonPlan.topic),
      strand: cleanText(lessonPlan.strand),
      subStrand: cleanText(lessonPlan.subStrand),
    },
    createdAt: new Date().toISOString(),
  };
}

function arrayOfText(value: unknown) {
  return Array.isArray(value) ? value.map((item) => cleanText(item)).filter(Boolean) : [];
}

function normalizeTeachingNoteVisuals(value: unknown, subject: string, topic: string) {
  if (!Array.isArray(value)) return [];
  const allowedBrowserContext = /computing|ict|information\s*technology/i.test(`${subject} ${topic}`);

  return value.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    const visual = item as Record<string, unknown>;
    const text = [
      visual.title,
      visual.caption,
      visual.altText,
      visual.prompt,
      ...(Array.isArray(visual.steps) ? visual.steps : []),
      ...(Array.isArray(visual.labels)
        ? visual.labels.map((label) => typeof label === 'object' && label ? JSON.stringify(label) : String(label))
        : []),
    ]
      .map((part) => cleanText(part))
      .join(' ')
      .toLowerCase();

    if (!allowedBrowserContext && /\b(chrome|firefox|safari|edge|web browser|browser logo)\b/.test(text)) {
      return false;
    }

    return true;
  });
}

function formatWeekBlock(label: string, week?: SchemeWeek) {
  if (!week) return '';
  const entriesBlock = Array.isArray(week.entries) && week.entries.length
    ? `  Multi-strand entries:\n${week.entries
        .map(
          (entry, index) =>
            `  ${index + 1}. Strand: ${entry?.strand || ''}\n` +
            `     Sub-strand: ${entry?.subStrand || ''}\n` +
            `     Topic: ${entry?.topic || ''}\n` +
            `     Content standard: ${entry?.contentStandard || ''}\n` +
            `     Indicator: ${entry?.indicator || ''}`,
        )
        .join('\n')}\n`
    : '';
  return `- ${label}: Week ${week.week}
  Topic: ${week.topic || ''}
  Strand: ${week.strand || ''}
  Sub-strand: ${week.subStrand || ''}
  Content standard: ${week.contentStandard || ''}
  Indicator: ${week.indicator || ''}
  Resources: ${(week.resources || []).join(', ')}
${entriesBlock}`;
}

function normalizeParsedWeeks(weeks: SchemeWeek[], expectedWeeks: number) {
  const deduped: SchemeWeek[] = [];
  const seen = new Set<number>();

  for (const week of weeks) {
    if (!week.topic && !week.indicator && !week.contentStandard) continue;

    let weekNumber = week.week;
    if (!Number.isInteger(weekNumber) || weekNumber < 1) {
      weekNumber = deduped.length + 1;
    }

    if (weekNumber > expectedWeeks) continue;

    if (seen.has(weekNumber)) {
      const existingIndex = deduped.findIndex((item) => item.week === weekNumber);
      if (existingIndex >= 0) {
        deduped[existingIndex] = preferRicherWeek(deduped[existingIndex], {
          ...week,
          week: weekNumber,
        });
      }
      continue;
    }

    seen.add(weekNumber);
    deduped.push({
      ...week,
      week: weekNumber,
    });
  }

  deduped.sort((a, b) => a.week - b.week);

  return deduped.slice(0, expectedWeeks);
}

function preferRicherWeek(existingWeek: SchemeWeek, nextWeek: SchemeWeek) {
  return scoreWeek(nextWeek) > scoreWeek(existingWeek) ? nextWeek : existingWeek;
}

function scoreWeek(week: SchemeWeek) {
  return [
    week.topic,
    week.strand,
    week.subStrand,
    week.contentStandard,
    week.indicator,
    Array.isArray(week.resources) ? week.resources.join(' ') : '',
  ]
    .join(' ')
    .trim().length;
}

function parseWeekNumber(value: unknown, index: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  const text = cleanText(value);
  const match = text.match(/\d{1,2}/);

  if (match) {
    return Number(match[0]);
  }

  return index + 1;
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function slugify(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
