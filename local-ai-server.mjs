import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { createAnthropicJsonCaller } from './parser-service/src/anthropic-json.mjs';
import { extractSchemeTextFromUpload } from './parser-service/src/document-extraction.mjs';
import {
  cleanText,
  detectAvailableClassLevels,
  detectUploadedSchemeMetadata,
  detectWeekCountFromText,
  extractAnnualPlanText,
  extractLikelyWeekRows,
  isolateRequestedSubjectText,
  selectPreferredSchemeSection,
  subjectsRoughlyMatch,
} from './parser-service/src/scheme-text-parser.mjs';
import {
  applyAnnualPlanTopicsToScheme,
  normalizeSchemeResponse,
  reconcileParsedSchemeWithCurriculumBackend,
} from './parser-service/src/scheme-normalizer.mjs';
import {
  getErrorMessage,
  loadEnvFile,
  readJsonBody,
  setCorsHeaders,
  writeJson,
} from './parser-service/src/runtime-utils.mjs';

const PORT = Number(process.env.LOCAL_AI_PORT || 8787);
const ENV_PATH = resolve(process.cwd(), '.env');

loadEnvFile(ENV_PATH);

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.LOCAL_AI_MODEL || 'claude-sonnet-4-5';
const callAnthropicJson = createAnthropicJsonCaller({ apiKey, model });

if (!apiKey) {
  console.error('Missing ANTHROPIC_API_KEY in .env.');
  process.exit(1);
}

const server = createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    writeJson(res, 200, { ok: true, mode: 'local-ai' });
    return;
  }

  if (req.method === 'POST' && req.url === '/generate-lesson-plan') {
    const body = await readJsonBody(req, res);
    if (!body) return;

    if (!body.subject || !body.classLevel || !body.week) {
      writeJson(res, 400, { error: 'subject, classLevel and week are required' });
      return;
    }

    try {
      const schemeContextBlock = body.schemeContext
        ? `\nUse this saved term scheme as the primary curriculum guide for this lesson:
- Scheme title: ${body.schemeContext.title}
- Subject: ${body.schemeContext.subject}
- Class Level: ${body.schemeContext.classLevel}
- Term: ${body.schemeContext.term}
${formatWeekBlock('Selected week', body.schemeContext.selectedWeek)}${formatWeekBlock(
            'Previous week',
            body.schemeContext.previousWeek
          )}${formatWeekBlock('Next week', body.schemeContext.nextWeek)}
${formatLessonFocusGuidance(body.schemeContext.lessonFocusGuidance)}

The lesson plan must align tightly with the selected scheme week. Use the strand, sub-strand, indicator,
content standard, and topic progression from the scheme. Do not jump ahead to later-term content unless the
scheme context explicitly does so.\n`
        : '\nIf no saved scheme context is provided, infer the correct week focus from the NaCCA curriculum progression for the requested term.\n';

      const sessionBlock =
        body.sessionIndex && body.sessionsPerWeek
          ? `\nThis lesson is session ${body.sessionIndex} of ${body.sessionsPerWeek} for the week.
Shape the activities as part of a multi-lesson sequence on the same weekly topic:
- Session 1 should introduce and build foundational understanding.
- Middle sessions should develop practice, guided application, and deeper explanation.
- Final session should consolidate, assess, and extend understanding on the same topic.
Do not switch to a different weekly topic just because it is a new session.\n`
          : '';

      const plan = await callAnthropicJson({
        system: lessonPlanSystemPrompt,
        user:
          `Draft a complete Ghanaian lesson plan for:\n` +
          `- Subject: ${body.subject}\n` +
          `- Class Level: ${body.classLevel}\n` +
          `- Week: ${body.week}\n` +
          (body.sessionIndex && body.sessionsPerWeek
            ? `- Lesson in week: ${body.sessionIndex} of ${body.sessionsPerWeek}\n`
            : '') +
          (body.term ? `- Term: ${body.term}\n` : '') +
          (body.notes ? `- Additional notes: ${body.notes}\n` : '') +
          sessionBlock +
          schemeContextBlock +
          `\nReturn the JSON object only.`,
      });
      writeJson(res, 200, normalizeLessonPlanResponse(plan, body));
    } catch (error) {
      writeJson(res, 500, { error: getErrorMessage(error) });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/generate-scheme') {
    const body = await readJsonBody(req, res);
    if (!body) return;

    if (!body.subject || !body.classLevel || !body.term) {
      writeJson(res, 400, { error: 'subject, classLevel and term are required' });
      return;
    }

    try {
      const scheme = await callAnthropicJson({
        system: schemeSystemPrompt,
        user:
          `Draft a Ghanaian scheme of work for:\n` +
          `- Subject: ${body.subject}\n` +
          `- Class Level: ${body.classLevel}\n` +
          `- Term: ${body.term}\n` +
          `- Number of Weeks: ${body.numberOfWeeks ?? 12}\n` +
          (body.notes ? `- Notes: ${body.notes}\n` : '') +
          `\nReturn the JSON object only.`,
      });
      writeJson(
        res,
        200,
        normalizeSchemeResponse(scheme, {
          subject: body.subject,
          classLevel: body.classLevel,
          term: body.term,
          numberOfWeeks: body.numberOfWeeks ?? 12,
        })
      );
    } catch (error) {
      writeJson(res, 500, { error: getErrorMessage(error) });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/translate-lesson-support') {
    const body = await readJsonBody(req, res);
    if (!body) return;

    if (!body.lessonPlan || !body.localLanguage) {
      writeJson(res, 400, { error: 'lessonPlan and localLanguage are required' });
      return;
    }
    if (!isSupportedGhanaianLanguage(body.localLanguage)) {
      writeJson(res, 400, { error: 'Translation is currently limited to supported Ghanaian languages.' });
      return;
    }

    try {
      const prompt = buildLessonPlanTranslationPrompt(body);
      const translatedPlan = await callAnthropicJson({
        system: lessonPlanTranslationSystemPrompt,
        user: prompt,
        maxTokens: 6000,
      });
      writeJson(res, 200, normalizeTranslatedLessonPlan(translatedPlan, body));
    } catch (error) {
      writeJson(res, 500, { error: getErrorMessage(error) });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/parse-scheme-upload') {
    const body = await readJsonBody(req, res);
    if (!body) return;

    if (!body.subject || !body.classLevel || !body.term || !body.fileName || !body.fileBase64) {
      writeJson(res, 400, {
        error: 'subject, classLevel, term, fileName and fileBase64 are required',
      });
      return;
    }

    try {
      const extractedText = await extractSchemeTextFromUpload(body.fileName, body.fileBase64);
      const subjectScopedText = isolateRequestedSubjectText(extractedText, body.subject);
      if (!subjectScopedText.trim()) {
        writeJson(res, 400, {
          error: `This file contains subject sections, but no ${body.subject} scheme section could be found.`,
        });
        return;
      }

      const detectedMetadata = detectUploadedSchemeMetadata(subjectScopedText);
      if (
        detectedMetadata.subject &&
        !subjectsRoughlyMatch(detectedMetadata.subject, body.subject)
      ) {
        writeJson(res, 400, {
          error: `This file appears to contain a ${detectedMetadata.subject} scheme, not ${body.subject}.`,
        });
        return;
      }

      const availableClassLevels = detectAvailableClassLevels(subjectScopedText);
      if (
        availableClassLevels.length &&
        !availableClassLevels.includes(String(body.classLevel).toUpperCase())
      ) {
        writeJson(res, 400, {
          error:
            availableClassLevels.length === 1
              ? `This file appears to contain a scheme for ${availableClassLevels[0]} only, not ${body.classLevel}.`
              : `This file appears to contain schemes for ${availableClassLevels.join(', ')}, not ${body.classLevel}.`,
        });
        return;
      }

      const annualPlanText = extractAnnualPlanText(subjectScopedText, body.classLevel, body.subject);
      const selectedSection = selectPreferredSchemeSection(
        subjectScopedText,
        body.classLevel,
        body.term,
        body.subject
      );
      const relevantText = selectedSection.text;
      const likelyWeekRows = extractLikelyWeekRows(relevantText);
      const detectedWeekCount =
        selectedSection.weekCount ||
        detectWeekCountFromText(relevantText) ||
        (selectedSection.source === 'annual' ? detectWeekCountFromText(annualPlanText) : 0) ||
        body.numberOfWeeks ||
        12;

      if (!relevantText.trim()) {
        writeJson(res, 400, {
          error: 'The uploaded file could not be read as usable text.',
        });
        return;
      }

      const scheme = await callAnthropicJson({
        system: uploadSchemeParserSystemPrompt,
        user:
          `Parse this uploaded Ghanaian scheme of work into structured JSON.\n` +
          `- Subject: ${body.subject}\n` +
          `- Class Level: ${body.classLevel}\n` +
          `- Term: ${body.term}\n` +
          `- File name: ${body.fileName}\n` +
          `- Expected weeks: ${detectedWeekCount}\n` +
          `- Best-effort detected metadata from the file:\n` +
          `  * Subject: ${detectedMetadata.subject || 'Unknown'}\n` +
          `  * Class Level: ${detectedMetadata.classLevel || 'Unknown'}\n` +
          `  * Term: ${detectedMetadata.term || 'Unknown'}\n` +
          `- The uploaded file may contain the full academic year. Extract only the requested term.\n` +
          `- Parsing precedence: use a detailed weekly/termly scheme section first. Only use the annual scheme/annual scheme of learning if no detailed term section exists.\n` +
          `- Respect the actual number of weeks visible in the uploaded scheme. Do not invent extra weeks beyond ${detectedWeekCount}.\n` +
          `- Selected parser section type: ${selectedSection.source}\n` +
          (selectedSection.source === 'annual'
            ? `- This is an annual-plan column extraction. Keep each Week topic exactly as listed in the relevant uploaded scheme text. Do not replace annual-plan topics with detailed Term 1 topics or mapped curriculum topics.\n`
            : '') +
          `\nAnnual plan summary text (if present):\n${annualPlanText || 'No separate annual summary detected.'}\n` +
          `\nRelevant uploaded scheme text:\n${relevantText}\n` +
          `\nLikely week rows and table cues:\n${likelyWeekRows || 'No obvious week rows detected.'}\n` +
          `\nReturn the JSON object only.`,
      });

      const normalized = normalizeSchemeResponse(scheme, {
        subject: body.subject,
        classLevel: body.classLevel,
        term: body.term,
        numberOfWeeks: detectedWeekCount,
      });

      const annualPreserved = selectedSection.source === 'annual'
        ? applyAnnualPlanTopicsToScheme(normalized, relevantText)
        : normalized;

      const reconciled = reconcileParsedSchemeWithCurriculumBackend({
        scheme: {
          ...annualPreserved,
          subject: body.subject,
          classLevel: body.classLevel,
          term: body.term,
          sourceFileKey: body.fileName,
        },
        subject: body.subject,
        classLevel: body.classLevel,
        preferredTerm: body.term,
        detectedMetadata,
        curriculumYearHint: Array.isArray(body.curriculumYearHint)
          ? body.curriculumYearHint
          : [],
      });

      writeJson(res, 200, {
        scheme:
          selectedSection.source === 'annual'
            ? applyAnnualPlanTopicsToScheme(reconciled, relevantText)
            : reconciled,
        detectedMetadata,
      });
    } catch (error) {
      writeJson(res, 500, { error: getErrorMessage(error) });
    }
    return;
  }

  writeJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Local AI server listening on http://localhost:${PORT}`);
});

const lessonPlanSystemPrompt = `You are an expert curriculum designer for the Ghanaian Basic and Senior High
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

function isSupportedGhanaianLanguage(language) {
  return new Set([
    'Twi / Akan',
    'Fante',
    'Ewe',
    'Ga',
    'Dangme',
    'Dagbani',
    'Nzema',
    'Gonja',
    'Kasem',
  ]).has(language);
}

Rules:
- When a scheme context is provided, treat it as the authoritative guide for the week's strand, sub-strand,
  content standard, indicator, topic focus, and progression.
- When a scheme context is provided, the output topic, strand, sub-strand, content standard, and indicator
  must match the selected week from that scheme. Do not substitute a different topic from another term or strand.
- When session information is provided, set lessonNumber to match that weekly session, for example "1 of 3",
  "2 of 3", or "3 of 3", and make the activities progress within the same topic across the week.
- When lesson focus guidance is provided, use it as internal curriculum guidance for this session's activities,
  performance indicator, examples, and assessment. Do not add an "exemplars" field to the JSON output.
- For Mathematics, treat exemplar examples as anchor examples: teach the method, solve additional similar
  worked examples, and give learners practice problems around the current lesson focus.
- For Social Studies, treat exemplar guidance as inquiry/action guidance: use discussion, local examples,
  role-play, research, presentation, reflection, or community tasks around the current lesson focus.
- For Computing, treat exemplar guidance as practical ICT guidance: include demonstration, hands-on tool
  exploration, troubleshooting, safe/responsible use, and where useful a small digital artefact or lab task
  around the current lesson focus.
- For English Language, do not split exemplar points as separate weekly topics. Keep the selected scheme entry
  or aspect as the lesson focus, and use exemplar points only as supporting teaching points, practice moves,
  text-response prompts, language-use prompts, or assessment cues.
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

const lessonPlanTranslationSystemPrompt = `You translate Ghanaian lesson plans into Ghanaian local languages.
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

const schemeSystemPrompt = `You are an expert Ghanaian curriculum planner.
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

const uploadSchemeParserSystemPrompt = `You are an expert at reading Ghanaian school schemes of work and converting them into structured weekly records.
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
- Treat the uploaded scheme text as the source of truth.
- The uploaded document may contain Term 1, Term 2 and Term 3 together. Extract only the requested term.
- Use the detected file metadata when it is clearly supported by the document text rather than blindly echoing the requested values.
- If the document begins with an annual plan or yearly summary table and later expands into detailed term pages, prefer the detailed page for the requested term.
- Use the annual plan only as a supporting hint about topic sequence, not as the main source when a detailed term page exists.
- Use the supplied "Likely week rows and table cues" as extra hints about row boundaries and column meaning.
- Preserve the uploaded week sequence as closely as possible.
- If the upload uses labels like Week 1, Wk 1, or similar, map them to numeric week values.
- Be tolerant of table-style layouts where one row may be split across multiple lines.
- Ignore rows belonging to other terms once the requested term has been identified.
- If some rows omit strand, sub-strand, standard, indicator, or resources, infer only what is clearly implied by nearby rows.
- Do not invent a different term sequence from NaCCA if the uploaded scheme already specifies its own weekly order.
- Keep titles and topics concise and teacher-usable.
- Return JSON only.`;

function formatWeekBlock(label, week) {
  if (!week) return '';
  const entriesBlock = Array.isArray(week.entries) && week.entries.length
    ? `  Multi-strand entries:\n${week.entries
        .map(
          (entry, index) =>
            `  ${index + 1}. Strand: ${entry?.strand || ''}\n` +
            `     Sub-strand: ${entry?.subStrand || ''}\n` +
            `     Topic: ${entry?.topic || ''}\n` +
            `     Content standard: ${entry?.contentStandard || ''}\n` +
            `     Indicator: ${entry?.indicator || ''}`
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

function formatLessonFocusGuidance(guidance) {
  const allFocuses = Array.isArray(guidance?.allFocuses)
    ? guidance.allFocuses.filter(Boolean)
    : [];
  if (!guidance?.currentFocus && !allFocuses.length) return '';

  return `Internal exemplar lesson focus guidance:
  Current lesson focus: ${guidance?.currentFocus || ''}
  Weekly lesson focus sequence:
${allFocuses.map((focus, index) => `  ${index + 1}. ${focus}`).join('\n')}
`;
}

function normalizeLessonPlanResponse(payload, body) {
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
      selectedWeek?.contentStandard || cleanText(primaryEntry?.contentStandard) || cleanText(payload?.contentStandard),
    indicator: selectedWeek?.indicator || cleanText(primaryEntry?.indicator) || cleanText(payload?.indicator),
    references:
      cleanText(payload?.references) ||
      (selectedWeek?.topic ? `Scheme topic: ${selectedWeek.topic}` : ''),
    visualAids: normalizeVisualAids(payload?.visualAids),
  };
}

function buildLessonPlanTranslationPrompt(body) {
  const plan = body.lessonPlan || {};
  return `Translate this English lesson plan into the selected Ghanaian language.
- Target local language: ${body.localLanguage}
- Subject: ${cleanText(plan.subject)}
- Class Level: ${cleanText(plan.classLevel)}
- Topic: ${cleanText(plan.topic)}
- Source lesson plan JSON:
${JSON.stringify(plan)}

Return the JSON object only.`;
}

function normalizeTranslatedLessonPlan(payload, body) {
  const source = body.lessonPlan || {};
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

function normalizeTranslatedPhases(value, fallback) {
  const phases = Array.isArray(value) && value.length ? value : fallback;
  if (!Array.isArray(phases)) return [];

  return phases
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const phaseNumber = Number(item.phase) || (index + 1);
      return {
        phase: phaseNumber === 1 || phaseNumber === 2 || phaseNumber === 3 ? phaseNumber : index + 1,
        title: cleanText(item.title),
        duration: cleanText(item.duration),
        activities: cleanStringList(item.activities, 8),
        resources: cleanStringList(item.resources, 6),
        assessment: cleanStringList(item.assessment, 5),
      };
    })
    .slice(0, 3);
}

function normalizeVisualAids(value) {
  if (!Array.isArray(value)) return [];
  const allowedTypes = new Set(['labelled_diagram', 'bar_chart', 'flowchart', 'timeline', 'comparison_table']);

  return value
    .slice(0, 1)
    .map((item) => {
      const type = cleanText(item?.type);
      const title = cleanText(item?.title);
      if (!allowedTypes.has(type) || !title) return null;
      const phase = Number(item?.phase);

      return {
        type,
        title,
        purpose: cleanText(item?.purpose),
        phase: phase === 1 || phase === 2 || phase === 3 ? phase : undefined,
        activityLink: cleanText(item?.activityLink),
        labels: cleanStringList(item?.labels, 6),
        steps: cleanStringList(item?.steps, 6),
        data: cleanChartData(item?.data),
        rows: cleanVisualRows(item?.rows),
        caption: cleanText(item?.caption),
      };
    })
    .filter(Boolean);
}

function cleanStringList(value, limit) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item)).filter(Boolean).slice(0, limit)
    : [];
}

function cleanChartData(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const label = cleanText(item?.label);
      const numericValue = Number(item?.value);
      if (!label || !Number.isFinite(numericValue)) return null;
      return { label, value: numericValue };
    })
    .filter(Boolean)
    .slice(0, 5);
}

function cleanVisualRows(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const label = cleanText(item?.label);
      const rowValue = cleanText(item?.value);
      if (!label || !rowValue) return null;
      return { label, value: rowValue };
    })
    .filter(Boolean)
    .slice(0, 5);
}

function slugify(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
