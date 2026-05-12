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

export const lessonPlanTranslationSystemPrompt = `You translate Ghanaian lesson plans into Ghanaian local languages.
Return a single JSON object only, no markdown or commentary, with this shape:
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
      "title": string,
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
- Translate the lesson plan itself into the requested Ghanaian language.
- Keep curriculum codes, week numbers, lesson numbers, class level codes, dates, durations, and numeric values unchanged.
- Preserve the same JSON structure and all phase/resource/assessment arrays.
- Translate teacher-visible English text naturally for classroom use, not word-for-word when that sounds unnatural.
- Keep Ghanaian curriculum and classroom context.
- Only return a translated lesson plan JSON object.
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
  - Visuals are optional supporting aids, not the main content. If a visual is not clearly necessary for this exact lesson, return "visuals": [].
  - Include visuals only when they directly match the subject and topic. Never include examples from another subject.
  - Use structured diagrams/charts/tables for science diagrams, maths place-value tables, processes, comparison charts, board summaries, and labelled explanations.
  - Use curated_image only when the subject/topic explicitly needs a known real-world image, object, person, place, or tool.
  - Do not invent unrelated image examples. Every visual must be directly named by, or strongly implied by, the lesson topic and activities.
  - Use generated_image only as a placeholder prompt for a custom content illustration; do not include imageUrl.
  - Do not include examples, tools, brands, objects, platforms, organisms, places, diagrams, charts, or images unless they are directly required by the lesson topic, strand, sub-strand, content standard, indicator, or planned activities.
  - Keep the JSON complete: overview 3-5 sentences; preparation 4-6 items; each phaseGuidance.teacherNotes 6-9 rich content items; every other text array 4-8 items; visuals 0-2 items.
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

export function buildLessonPlanTranslationPrompt(body: LessonSupportTranslationBody) {
  const plan = body.lessonPlan;

  return `Translate this English lesson plan into the selected Ghanaian language.
- Target local language: ${body.localLanguage}
- Subject: ${cleanText(plan?.subject)}
- Class Level: ${cleanText(plan?.classLevel)}
- Topic: ${cleanText(plan?.topic)}
- Source lesson plan JSON:
${JSON.stringify(plan)}

Return the JSON object only.`;
}

export function normalizeLessonPlanTranslationResponse(
  payload: Record<string, unknown>,
  body: LessonSupportTranslationBody,
) {
  return normalizeTranslatedLessonPlan(payload, body);
}

function normalizeTranslatedLessonPlan(payload: Record<string, unknown>, body: LessonSupportTranslationBody) {
  const source = body.lessonPlan ?? {};
  const language = cleanText(body.localLanguage);
  const subject = cleanText(payload?.subject) || cleanText(source.subject);
  const classLevel = cleanText(payload?.classLevel) || cleanText(source.classLevel);
  const week = Number(payload?.week) || Number(source.week) || 1;
  const sourceId = cleanText(source.id);

  return {
    ...source,
    ...payload,
    id: `${sourceId || `${slugify(subject)}-${slugify(classLevel)}-${week}`}-translated-${slugify(language)}-${Date.now()}`,
    subject,
    classLevel,
    week,
    weekTitle: cleanText(payload?.weekTitle) || cleanText(source.weekTitle) || `WEEK ${week}`,
    termTitle: cleanText(payload?.termTitle) || cleanText(source.termTitle),
    subjectClassTitle: cleanText(payload?.subjectClassTitle) || cleanText(source.subjectClassTitle) || `${subject.toUpperCase()} - ${classLevel.toUpperCase()}`,
    date: cleanText(payload?.date) || cleanText(source.date),
    duration: cleanText(payload?.duration) || cleanText(source.duration),
    lessonNumber: cleanText(payload?.lessonNumber) || cleanText(source.lessonNumber),
    strand: cleanText(payload?.strand) || cleanText(source.strand),
    subStrand: cleanText(payload?.subStrand) || cleanText(source.subStrand),
    topic: cleanText(payload?.topic) || cleanText(source.topic),
    contentStandard: cleanText(payload?.contentStandard) || cleanText(source.contentStandard),
    indicator: cleanText(payload?.indicator) || cleanText(source.indicator),
    performanceIndicator: cleanText(payload?.performanceIndicator) || cleanText(source.performanceIndicator),
    coreCompetencies: cleanStringList(payload?.coreCompetencies, 8).length
      ? cleanStringList(payload?.coreCompetencies, 8)
      : cleanStringList(source.coreCompetencies, 8),
    references: cleanText(payload?.references) || cleanText(source.references),
    phases: normalizeTranslatedPhases(payload?.phases, source.phases),
    visualAids: normalizeVisualAids(payload?.visualAids),
    localLanguageSupport: undefined,
    translationLanguage: language,
    translatedFrom: cleanText(source.translationLanguage) || 'English',
    sourceLessonPlanId: sourceId,
    translationStatus: 'ai_draft',
    createdAt: new Date().toISOString(),
    updatedAt: undefined,
  };
}

function normalizeTranslatedPhases(value: unknown, fallback: unknown) {
  const phases = Array.isArray(value) && value.length ? value : fallback;
  if (!Array.isArray(phases)) return [];

  return phases
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const phase = item as Record<string, unknown>;
      const phaseNumber = Number(phase.phase) || (index + 1);
      return {
        phase: phaseNumber === 1 || phaseNumber === 2 || phaseNumber === 3 ? phaseNumber : index + 1,
        title: cleanText(phase.title),
        duration: cleanText(phase.duration),
        activities: cleanStringList(phase.activities, 8),
        resources: cleanStringList(phase.resources, 6),
        assessment: cleanStringList(phase.assessment, 5),
      };
    })
    .slice(0, 3);
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
    contentBlocks: normalizeTeachingNoteBlocks(payload?.contentBlocks),
    visuals: Array.isArray(payload?.visuals) ? payload.visuals : [],
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

function normalizeTeachingNoteBlocks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const block = item as Record<string, unknown>;
      return {
        id: cleanText(block.id) || `block-${index + 1}`,
        type: cleanText(block.type) || 'paragraph',
        title: cleanText(block.title),
        text: cleanText(block.text),
        items: arrayOfText(block.items),
        rows: Array.isArray(block.rows)
          ? block.rows
              .filter((row) => Array.isArray(row))
              .map((row) => (row as unknown[]).map((cell) => cleanText(cell)))
              .filter((row) => row.some(Boolean))
          : [],
        steps: arrayOfText(block.steps),
        labels: Array.isArray(block.labels)
          ? block.labels
              .filter((label) => label && typeof label === 'object')
              .map((label) => ({
                label: cleanText((label as Record<string, unknown>).label),
                description: cleanText((label as Record<string, unknown>).description),
              }))
              .filter((label) => label.label)
          : [],
        imageItems: Array.isArray(block.imageItems)
          ? block.imageItems
              .filter((image) => image && typeof image === 'object')
              .map((image) => ({
                label: cleanText((image as Record<string, unknown>).label),
                description: cleanText((image as Record<string, unknown>).description),
                imageUrl: cleanText((image as Record<string, unknown>).imageUrl),
                imagePrompt: cleanText((image as Record<string, unknown>).imagePrompt),
                attribution: cleanText((image as Record<string, unknown>).attribution),
              }))
              .filter((image) => image.label)
          : [],
        caption: cleanText(block.caption),
        teacherOnly: block.teacherOnly === true,
      };
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
