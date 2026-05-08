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
  schemeContext?: SchemeContext;
}

export interface SchemeGenerationBody {
  subject: string;
  classLevel: string;
  term: string;
  academicYear?: string;
  numberOfWeeks?: number;
  notes?: string;
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
    teacherName: cleanText(body?.teacherName),
    schoolName: cleanText(body?.schoolName),
    schoolDistrict: cleanText(body?.schoolDistrict),
  };
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
