import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { createAnthropicJsonCaller } from './anthropic-json.mjs';
import { extractSchemeTextFromUpload } from './document-extraction.mjs';
import {
  detectAvailableClassLevels,
  detectUploadedSchemeMetadata,
  detectWeekCountFromText,
  extractAnnualPlanText,
  extractLikelyWeekRows,
  selectPreferredSchemeSection,
  subjectsRoughlyMatch,
} from './scheme-text-parser.mjs';
import {
  normalizeSchemeResponse,
  reconcileParsedSchemeWithCurriculumBackend,
} from './scheme-normalizer.mjs';
import {
  getErrorMessage,
  loadEnvFile,
  readJsonBody,
  setCorsHeaders,
  writeJson,
} from './runtime-utils.mjs';

const PORT = Number(process.env.PARSER_SERVICE_PORT || process.env.PORT || 8788);
const LOCAL_ENV_PATH = resolve(process.cwd(), '.env');
const ROOT_ENV_PATH = resolve(process.cwd(), '..', '.env');

loadEnvFile(LOCAL_ENV_PATH);
loadEnvFile(ROOT_ENV_PATH);

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.LOCAL_AI_MODEL || 'claude-sonnet-4-5';
const callAnthropicJson = createAnthropicJsonCaller({ apiKey, model });

if (!apiKey) {
  console.error('Missing ANTHROPIC_API_KEY.');
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
    writeJson(res, 200, { ok: true, service: 'parser-service' });
    return;
  }

  if (req.method === 'POST' && req.url === '/parse-scheme') {
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
      const detectedMetadata = detectUploadedSchemeMetadata(extractedText);
      if (
        detectedMetadata.subject &&
        !subjectsRoughlyMatch(detectedMetadata.subject, body.subject)
      ) {
        writeJson(res, 400, {
          error: `This file appears to contain a ${detectedMetadata.subject} scheme, not ${body.subject}.`,
        });
        return;
      }

      const availableClassLevels = detectAvailableClassLevels(extractedText);
      if (
        availableClassLevels.length &&
        !availableClassLevels.includes(String(body.classLevel).toUpperCase())
      ) {
        const described = availableClassLevels.join(', ');
        writeJson(res, 400, {
          error:
            availableClassLevels.length === 1
              ? `This file appears to contain a scheme for ${described} only, not ${body.classLevel}.`
              : `This file appears to contain schemes for ${described}, not ${body.classLevel}.`,
        });
        return;
      }

      const annualPlanText = extractAnnualPlanText(extractedText, body.classLevel);
      const selectedSection = selectPreferredSchemeSection(
        extractedText,
        body.classLevel,
        body.term
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

      const reconciled = reconcileParsedSchemeWithCurriculumBackend({
        scheme: {
          ...normalized,
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

      writeJson(res, 200, { scheme: reconciled, detectedMetadata });
    } catch (error) {
      writeJson(res, 500, { error: getErrorMessage(error) });
    }
    return;
  }

  writeJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Parser service listening on http://localhost:${PORT}`);
});

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
