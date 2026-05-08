import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import StreamZip from 'node-stream-zip';

const PORT = Number(process.env.PARSER_SERVICE_PORT || process.env.PORT || 8788);
const LOCAL_ENV_PATH = resolve(process.cwd(), '.env');
const ROOT_ENV_PATH = resolve(process.cwd(), '..', '.env');

loadEnvFile(LOCAL_ENV_PATH);
loadEnvFile(ROOT_ENV_PATH);

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.LOCAL_AI_MODEL || 'claude-sonnet-4-5';

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

      const detectedMetadata = detectUploadedSchemeMetadata(extractedText);
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

async function callAnthropicJson({ system, user }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.4,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${detail}`);
  }

  const payload = await response.json();
  const text = payload?.content?.[0]?.text;

  if (typeof text !== 'string') {
    throw new Error('Unexpected Anthropic response shape');
  }

  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function readJsonBody(req, res) {
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    writeJson(res, 400, { error: 'Invalid JSON body' });
    return null;
  }
}

function writeJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

async function extractSchemeTextFromUpload(fileName, fileBase64) {
  const extension = extname(fileName).toLowerCase();

  if (extension === '.docx') {
    return extractDocxText(Buffer.from(fileBase64, 'base64'));
  }

  if (extension === '.pdf') {
    return extractPdfText(Buffer.from(fileBase64, 'base64'));
  }

  throw new Error('Only PDF and DOCX scheme uploads are supported for parsing right now.');
}

async function extractDocxText(buffer) {
  const tempDir = await mkdtemp(join(tmpdir(), 'scheme-docx-'));
  const docxPath = join(tempDir, 'upload.docx');

  try {
    await writeFile(docxPath, buffer);
    const zip = new StreamZip.async({ file: docxPath });
    try {
      const xmlBuffer = await zip.entryData('word/document.xml');
      const xml = xmlBuffer.toString('utf8');
      return decodeXmlEntities(
        xml
          .replace(/<w:p\b[^>]*>/g, '\n')
          .replace(/<w:tab\/>/g, '\t')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+\n/g, '\n')
          .replace(/\n\s+/g, '\n')
          .replace(/[ \t]{2,}/g, ' ')
      ).trim();
    } finally {
      await zip.close();
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function extractPdfText(buffer) {
  const tempDir = await mkdtemp(join(tmpdir(), 'scheme-pdf-'));
  const pdfPath = join(tempDir, 'upload.pdf');

  try {
    await writeFile(pdfPath, buffer);
    const pythonCode = [
      'import pdfplumber, sys',
      `pdf = pdfplumber.open(r"""${pdfPath}""")`,
      'parts = []',
      'for page in pdf.pages:',
      '    text = page.extract_text() or ""',
      '    if text.strip():',
      '        parts.append(text)',
      'sys.stdout.buffer.write("\\n\\n".join(parts).encode("utf-8", "replace"))',
    ].join('\n');

    return await execFileText('python3', ['-c', pythonCode]).catch(() =>
      execFileText('python', ['-c', pythonCode])
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function extractAnnualPlanText(text, requestedClassLevel) {
  const classScopedText = isolateRequestedClassText(text, requestedClassLevel);
  const lines = classScopedText.split(/\r?\n/);
  const annualStartIndex = lines.findIndex((line) => /\bannual\b/i.test(line));
  if (annualStartIndex === -1) return '';

  let endIndex = lines.length;
  for (let index = annualStartIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (scoreTermMarker(line, normalizeTermLabel('term 1')) >= 5) {
      endIndex = index;
      break;
    }
  }

  return lines.slice(annualStartIndex, endIndex).join('\n').trim();
}

async function execFileText(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    execFile(command, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        rejectPromise(
          new Error(
            stderr?.trim()
              ? `Document parsing failed: ${stderr.trim()}`
              : `Document parsing failed: ${error.message}`
          )
        );
        return;
      }
      resolvePromise(stdout);
    });
  });
}

function decodeXmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#160;/g, ' ')
    .replace(/&#xA;/gi, '\n');
}

function isolateRequestedTermText(text, requestedTerm) {
  const normalizedTerm = normalizeTermLabel(requestedTerm);
  if (!normalizedTerm) return text;

  const lines = text.split(/\r?\n/);
  const markers = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const lineTerm = detectTermFromLine(line);
    if (lineTerm) {
      markers.push({
        index,
        term: lineTerm,
        line,
        score: scoreTermMarker(line, lineTerm),
      });
    }
  }

  if (!markers.length) return text;

  const targetMarker = markers
    .filter((marker) => marker.term === normalizedTerm)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.index - right.index;
    })[0];
  if (!targetMarker) return text;

  const nextMarker = markers
    .filter(
      (marker) =>
        marker.index > targetMarker.index &&
        marker.term !== normalizedTerm &&
        marker.score >= 2
    )
    .sort((left, right) => left.index - right.index)[0];
  const endIndex = nextMarker ? nextMarker.index : lines.length;
  const slice = lines.slice(targetMarker.index, endIndex).join('\n').trim();
  return slice || text;
}

function isolateRequestedSectionText(text, requestedClassLevel, requestedTerm) {
  const classScopedText = isolateRequestedClassText(text, requestedClassLevel);
  return isolateRequestedTermText(classScopedText, requestedTerm);
}

function selectPreferredSchemeSection(text, requestedClassLevel, requestedTerm) {
  const classScopedText = isolateRequestedClassText(text, requestedClassLevel);
  const detailedText = extractDetailedTermSection(classScopedText, requestedTerm);
  if (detailedText.trim()) {
    return { source: 'detailed', text: detailedText, weekCount: detectWeekCountFromText(detailedText) };
  }

  const annualPlanText = extractAnnualPlanText(text, requestedClassLevel);
  if (annualPlanText.trim()) {
    const annualTermSection = extractAnnualPlanTermSection(annualPlanText, requestedTerm);
    if (annualTermSection.text.trim()) {
      return {
        source: 'annual',
        text: annualTermSection.text,
        weekCount: annualTermSection.weekCount,
      };
    }
    return { source: 'annual', text: annualPlanText, weekCount: detectWeekCountFromText(annualPlanText) };
  }

  return {
    source: 'fallback',
    text: isolateRequestedTermText(classScopedText, requestedTerm),
    weekCount: detectWeekCountFromText(isolateRequestedTermText(classScopedText, requestedTerm)),
  };
}

function extractAnnualPlanTermSection(annualPlanText, requestedTerm) {
  const requestedIndex = getTermColumnIndex(requestedTerm);
  if (requestedIndex === -1) {
    return { text: '', weekCount: 0 };
  }

  const lines = String(annualPlanText || '')
    .split(/\r?\n/)
    .map((line) => cleanText(line))
    .filter(Boolean);

  const weeksHeaderIndex = lines.findIndex((line) => /^weeks?$/i.test(line));
  if (weeksHeaderIndex === -1) {
    return { text: '', weekCount: 0 };
  }

  const termHeaderWindow = lines.slice(weeksHeaderIndex + 1, weeksHeaderIndex + 6);
  const hasAllTermHeaders =
    termHeaderWindow.some((line) => normalizeTermLabel(line) === 'term 1') &&
    termHeaderWindow.some((line) => normalizeTermLabel(line) === 'term 2') &&
    termHeaderWindow.some((line) => normalizeTermLabel(line) === 'term 3');

  if (!hasAllTermHeaders) {
    return { text: '', weekCount: 0 };
  }

  const bodyLines = lines.slice(weeksHeaderIndex + 4);
  const rows = [];
  let currentRow = null;

  for (const line of bodyLines) {
    const weekMatch = line.match(/^(\d{1,2})(?:\b|\s)/);
    if (weekMatch) {
      if (currentRow) rows.push(currentRow);
      currentRow = { week: Number(weekMatch[1]), values: [] };
      continue;
    }

    if (!currentRow) continue;
    currentRow.values.push(line);
  }

  if (currentRow) rows.push(currentRow);

  const selectedRows = rows
    .map((row) => ({
      week: row.week,
      topic: cleanText(row.values[requestedIndex] || ''),
    }))
    .filter((row) => row.topic);

  return {
    text: selectedRows.map((row) => `Week ${row.week}\n${row.topic}`).join('\n'),
    weekCount: selectedRows.length,
  };
}

function getTermColumnIndex(term) {
  const normalized = normalizeTermLabel(term);
  if (normalized === 'term 1') return 0;
  if (normalized === 'term 2') return 1;
  if (normalized === 'term 3') return 2;
  return -1;
}

function extractDetailedTermSection(text, requestedTerm) {
  const normalizedTerm = normalizeTermLabel(requestedTerm);
  if (!normalizedTerm) return '';

  const lines = text.split(/\r?\n/);
  const detailedMarkers = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (detectTermFromLine(line) !== normalizedTerm) continue;
    const score = scoreTermMarker(line, normalizedTerm);
    if (score >= 5) {
      detailedMarkers.push({ index, line, score });
    }
  }

  if (!detailedMarkers.length) return '';

  const targetMarker = detailedMarkers.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return left.index - right.index;
  })[0];

  let endIndex = lines.length;
  for (let index = targetMarker.index + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const lineTerm = detectTermFromLine(line);
    if (!lineTerm || lineTerm === normalizedTerm) continue;
    if (scoreTermMarker(line, lineTerm) >= 5) {
      endIndex = index;
      break;
    }
  }

  return lines.slice(targetMarker.index, endIndex).join('\n').trim();
}

function isolateRequestedClassText(text, requestedClassLevel) {
  const normalizedClass = normalizeClassLabel(requestedClassLevel);
  if (!normalizedClass) return text;

  const lines = text.split(/\r?\n/);
  const markers = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const lineClass = detectClassFromLine(line);
    if (lineClass) {
      markers.push({ index, classLevel: lineClass });
    }
  }

  if (!markers.length) return text;

  const targetMarker = markers.find((marker) => marker.classLevel === normalizedClass);
  if (!targetMarker) return text;

  const nextMarker = markers.find((marker) => marker.index > targetMarker.index);
  const endIndex = nextMarker ? nextMarker.index : lines.length;
  const slice = lines.slice(targetMarker.index, endIndex).join('\n').trim();
  return slice || text;
}

function normalizeClassLabel(classLevel) {
  const value = cleanText(classLevel).toLowerCase();
  if (!value) return '';
  const match = value.match(/\b([1-9])\b/);
  if (match) return `b${match[1]}`;
  return value.replace(/\s+/g, '');
}

function detectClassFromLine(line) {
  const value = cleanText(line).toLowerCase();
  const match = value.match(/\b(?:basic|b|jhs)\s*([1-9])\b/);
  return match ? `b${match[1]}` : '';
}

function detectAvailableClassLevels(text) {
  const matches = String(text || '').match(/\b(?:basic|b|jhs)\s*([1-9])\b/gi) || [];
  const seen = new Set();
  const ordered = [];

  for (const match of matches) {
    const normalized = normalizeClassLabel(match).toUpperCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    ordered.push(normalized);
  }

  return ordered;
}

function normalizeTermLabel(term) {
  const value = cleanText(term).toLowerCase();
  if (!value) return '';
  if (value.includes('1') || value.includes('first') || /\bone\b/.test(value) || /\bi\b/.test(value)) {
    return 'term 1';
  }
  if (value.includes('2') || value.includes('second') || /\btwo\b/.test(value) || /\bii\b/.test(value)) {
    return 'term 2';
  }
  if (value.includes('3') || value.includes('third') || /\bthree\b/.test(value) || /\biii\b/.test(value)) {
    return 'term 3';
  }
  return value;
}

function detectTermFromLine(line) {
  const value = cleanText(line).toLowerCase();
  const distinctTerms = countDistinctTermMentions(value);
  if (distinctTerms > 1) return '';

  if (/\b(term|semester)\s*1\b/.test(value) || /\b1st\s+(term|semester)\b/.test(value) || /\bfirst\s+(term|semester)\b/.test(value) || /\b(term|semester)\s*one\b/.test(value) || /\b(term|semester)\s*i\b/.test(value) || /\bterm\s*-\s*1\b/.test(value) || /\bterm\s*:\s*1\b/.test(value)) {
    return 'term 1';
  }
  if (/\b(term|semester)\s*2\b/.test(value) || /\b2nd\s+(term|semester)\b/.test(value) || /\bsecond\s+(term|semester)\b/.test(value) || /\b(term|semester)\s*two\b/.test(value) || /\b(term|semester)\s*ii\b/.test(value) || /\bterm\s*-\s*2\b/.test(value) || /\bterm\s*:\s*2\b/.test(value)) {
    return 'term 2';
  }
  if (/\b(term|semester)\s*3\b/.test(value) || /\b3rd\s+(term|semester)\b/.test(value) || /\bthird\s+(term|semester)\b/.test(value) || /\b(term|semester)\s*three\b/.test(value) || /\b(term|semester)\s*iii\b/.test(value) || /\bterm\s*-\s*3\b/.test(value) || /\bterm\s*:\s*3\b/.test(value)) {
    return 'term 3';
  }
  return '';
}

function countDistinctTermMentions(value) {
  const hits = new Set();
  if (/\b(term|semester)\s*1\b/.test(value) || /\b1st\s+(term|semester)\b/.test(value) || /\bfirst\s+(term|semester)\b/.test(value) || /\b(term|semester)\s*one\b/.test(value) || /\b(term|semester)\s*i\b/.test(value) || /\bterm\s*-\s*1\b/.test(value) || /\bterm\s*:\s*1\b/.test(value)) hits.add('term 1');
  if (/\b(term|semester)\s*2\b/.test(value) || /\b2nd\s+(term|semester)\b/.test(value) || /\bsecond\s+(term|semester)\b/.test(value) || /\b(term|semester)\s*two\b/.test(value) || /\b(term|semester)\s*ii\b/.test(value) || /\bterm\s*-\s*2\b/.test(value) || /\bterm\s*:\s*2\b/.test(value)) hits.add('term 2');
  if (/\b(term|semester)\s*3\b/.test(value) || /\b3rd\s+(term|semester)\b/.test(value) || /\bthird\s+(term|semester)\b/.test(value) || /\b(term|semester)\s*three\b/.test(value) || /\b(term|semester)\s*iii\b/.test(value) || /\bterm\s*-\s*3\b/.test(value) || /\bterm\s*:\s*3\b/.test(value)) hits.add('term 3');
  return hits.size;
}

function scoreTermMarker(line, normalizedTerm) {
  const value = cleanText(line).toLowerCase();
  let score = 0;
  if (!value) return score;
  if (countDistinctTermMentions(value) > 1) score -= 5;
  if (value.includes('scheme')) score += 5;
  if (value.includes('scheme of learning')) score += 4;
  if (value.includes('tsol')) score += 4;
  if (value.includes('content standard')) score += 2;
  if (value.includes('weeks')) score += 1;
  if (value.includes('annual')) score -= 6;
  if (detectTermFromLine(value) === normalizedTerm) score += 2;
  return score;
}

function extractLikelyWeekRows(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const selected = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isWeekLikeLine(line) || isSchemeTableHeader(line)) {
      const block = [line];
      for (let offset = 1; offset <= 2; offset += 1) {
        const next = lines[index + offset];
        if (!next) break;
        if (detectTermFromLine(next)) break;
        if (block.join(' ').length + next.length > 260) break;
        block.push(next);
      }
      selected.push(block.join(' | '));
    }
  }

  return selected.slice(0, 36).join('\n');
}

function isWeekLikeLine(line) {
  const value = cleanText(line).toLowerCase();
  return /\b(week|wk|w\/k)\s*[:.\-]?\s*\d{1,2}\b/.test(value) || /^\d{1,2}\s+[a-z]/.test(value);
}

function isSchemeTableHeader(line) {
  const value = cleanText(line).toLowerCase();
  const headerHits = [
    'week', 'topic', 'strand', 'sub-strand', 'sub strand', 'content standard',
    'indicator', 'reference', 'resources', 't l m', 'tlm',
  ].filter((token) => value.includes(token));
  return headerHits.length >= 2;
}

function detectUploadedSchemeMetadata(text) {
  const compact = cleanText(text).replace(/\s+/g, ' ');
  const lower = compact.toLowerCase();
  const subjectPatterns = [
    { pattern: /\bmathematics\b|\bmaths\b|\bcore mathematics\b/i, subject: 'Mathematics' },
    { pattern: /\bscience\b|\bintegrated science\b|\bgeneral science\b/i, subject: 'Science' },
    { pattern: /\bcomputing\b|\bict\b|\binformation and communication technology\b|\bcomputer studies\b/i, subject: 'Computing' },
    { pattern: /\benglish language\b|\benglish\b/i, subject: 'English Language' },
    { pattern: /\bsocial studies\b/i, subject: 'Social Studies' },
  ];
  const subjectMatch = subjectPatterns.find((entry) => entry.pattern.test(lower));
  const classMatch = compact.match(/\b(?:basic|b|jhs)\s*([1-9])\b/i);
  const termMatch = detectTermFromLine(compact);

  return {
    subject: subjectMatch?.subject || '',
    classLevel: classMatch ? `B${classMatch[1]}` : '',
    term: termMatch || '',
  };
}

function normalizeSchemeResponse(payload, input) {
  const weeks = Array.isArray(payload?.weeks) ? payload.weeks : [];
  const normalizedWeeks = normalizeParsedWeeks(
    weeks.map((week, index) => ({
      week: parseWeekNumber(week?.week, index),
      strand: cleanText(week?.strand),
      subStrand: cleanText(week?.subStrand),
      contentStandard: cleanText(week?.contentStandard),
      indicator: cleanText(week?.indicator),
      topic: cleanText(week?.topic),
      resources: Array.isArray(week?.resources)
        ? week.resources.map((item) => cleanText(item)).filter(Boolean)
        : [],
    })),
    input.numberOfWeeks
  );

  return {
    id: `${slugify(input.subject)}-${input.classLevel}-${slugify(input.term)}-${Date.now()}`,
    title: cleanText(payload?.title) || `${input.subject} Scheme of Work - ${input.classLevel} ${input.term}`,
    subject: cleanText(payload?.subject) || input.subject,
    classLevel: cleanText(payload?.classLevel) || input.classLevel,
    term: cleanText(payload?.term) || input.term,
    source: 'uploaded',
    weeks: normalizedWeeks,
    createdAt: new Date().toISOString(),
  };
}

function reconcileParsedSchemeWithCurriculumBackend(input) {
  const curriculumWeeks = Array.isArray(input.curriculumYearHint) ? input.curriculumYearHint : [];
  if (!curriculumWeeks.length) {
    return {
      ...input.scheme,
      source: 'uploaded',
      parserMetadata: {
        ...(input.scheme.parserMetadata || {}),
        detectedMetadata: input.detectedMetadata,
        warnings: ['No mapped curriculum was available for this subject/class, so the uploaded scheme was kept as parsed.'],
        confidence: 0.45,
      },
    };
  }

  const warnings = [];
  const usedCurriculumIndexes = new Set();
  let totalConfidence = 0;

  const reconciledWeeks = (input.scheme.weeks || []).map((week) => {
    const match = findBestCurriculumMatchBackend(week, curriculumWeeks, usedCurriculumIndexes);
    if (!match) {
      warnings.push(`Week ${week.week} could not be matched confidently to the mapped curriculum and was kept mostly as uploaded.`);
      totalConfidence += 0.2;
      return { ...week, uploadedTopic: week.topic, matchedCurriculumTerm: undefined, matchConfidence: 0.2 };
    }

    usedCurriculumIndexes.add(match.index);
    totalConfidence += match.confidence;
    if (normalizeSimpleTerm(match.week.sourceTerm) !== normalizeSimpleTerm(input.preferredTerm)) {
      warnings.push(`Week ${week.week} matched a curriculum topic usually placed in ${match.week.sourceTerm}, but the uploaded scheme keeps it in ${input.preferredTerm}.`);
    }
    return mergeWeekWithCurriculumBackend(week, match.week, match.confidence);
  });

  const confidence = reconciledWeeks.length ? Number((totalConfidence / reconciledWeeks.length).toFixed(2)) : 0;

  return {
    ...input.scheme,
    subject: input.subject,
    classLevel: input.classLevel,
    term: input.preferredTerm,
    source: 'reconciled',
    weeks: reconciledWeeks,
    parserMetadata: {
      ...(input.scheme.parserMetadata || {}),
      detectedMetadata: input.detectedMetadata,
      warnings,
      confidence,
    },
  };
}

function mergeWeekWithCurriculumBackend(uploadedWeek, curriculumWeek, confidence) {
  const mergedEntries = mergeEntriesBackend(uploadedWeek, curriculumWeek);
  return {
    ...uploadedWeek,
    strand: curriculumWeek.strand || uploadedWeek.strand,
    subStrand: curriculumWeek.subStrand || uploadedWeek.subStrand,
    contentStandard: curriculumWeek.contentStandard || uploadedWeek.contentStandard,
    indicator: curriculumWeek.indicator || uploadedWeek.indicator,
    topic: curriculumWeek.topic || uploadedWeek.topic,
    resources: uniqueCleanStrings([
      ...(Array.isArray(curriculumWeek.resources) ? curriculumWeek.resources : []),
      ...(Array.isArray(uploadedWeek.resources) ? uploadedWeek.resources : []),
    ]),
    entries: mergedEntries.length > 1 ? mergedEntries : undefined,
    uploadedTopic: uploadedWeek.topic,
    matchedCurriculumTerm: curriculumWeek.sourceTerm,
    matchConfidence: confidence,
  };
}

function mergeEntriesBackend(uploadedWeek, curriculumWeek) {
  const uploadedEntries = Array.isArray(uploadedWeek.entries) ? uploadedWeek.entries : [];
  const curriculumEntries = Array.isArray(curriculumWeek.entries) ? curriculumWeek.entries : [];
  if (curriculumEntries.length) {
    return curriculumEntries.map((entry, index) => ({
      strand: cleanText(entry?.strand) || cleanText(uploadedEntries[index]?.strand),
      subStrand: cleanText(entry?.subStrand) || cleanText(uploadedEntries[index]?.subStrand),
      contentStandard: cleanText(entry?.contentStandard) || cleanText(uploadedEntries[index]?.contentStandard),
      indicator: cleanText(entry?.indicator) || cleanText(uploadedEntries[index]?.indicator),
      topic: cleanText(entry?.topic) || cleanText(uploadedEntries[index]?.topic),
      resources: uniqueCleanStrings([
        ...(Array.isArray(entry?.resources) ? entry.resources : []),
        ...(Array.isArray(uploadedEntries[index]?.resources) ? uploadedEntries[index].resources : []),
      ]),
    }));
  }
  if (uploadedEntries.length) return uploadedEntries;
  return [{
    strand: curriculumWeek.strand || uploadedWeek.strand,
    subStrand: curriculumWeek.subStrand || uploadedWeek.subStrand,
    contentStandard: curriculumWeek.contentStandard || uploadedWeek.contentStandard,
    indicator: curriculumWeek.indicator || uploadedWeek.indicator,
    topic: curriculumWeek.topic || uploadedWeek.topic,
    resources: uniqueCleanStrings([
      ...(Array.isArray(curriculumWeek.resources) ? curriculumWeek.resources : []),
      ...(Array.isArray(uploadedWeek.resources) ? uploadedWeek.resources : []),
    ]),
  }];
}

function findBestCurriculumMatchBackend(uploadedWeek, curriculumWeeks, usedCurriculumIndexes) {
  const uploadedTokens = tokenizeForMatch(
    [
      uploadedWeek.topic, uploadedWeek.strand, uploadedWeek.subStrand,
      uploadedWeek.contentStandard, uploadedWeek.indicator,
      ...(Array.isArray(uploadedWeek.entries) ? uploadedWeek.entries.flatMap((entry) => [
        entry?.topic, entry?.strand, entry?.subStrand, entry?.contentStandard, entry?.indicator,
      ]) : []),
    ].filter(Boolean).join(' ')
  );
  if (!uploadedTokens.size) return null;

  let best = null;
  curriculumWeeks.forEach((week, index) => {
    const curriculumTokens = tokenizeForMatch(
      [
        week.topic, week.strand, week.subStrand, week.contentStandard, week.indicator,
        ...(Array.isArray(week.entries) ? week.entries.flatMap((entry) => [
          entry?.topic, entry?.strand, entry?.subStrand, entry?.contentStandard, entry?.indicator,
        ]) : []),
      ].filter(Boolean).join(' ')
    );
    const shared = countSharedTokens(uploadedTokens, curriculumTokens);
    const confidence = shared === 0 ? 0 : Number((shared / Math.max(4, uploadedTokens.size)).toFixed(2));
    const duplicatePenalty = usedCurriculumIndexes.has(index) ? 0.08 : 0;
    const finalConfidence = Math.max(0, confidence - duplicatePenalty);
    if (!best || finalConfidence > best.confidence) {
      best = { week, confidence: finalConfidence, index };
    }
  });
  if (!best || best.confidence < 0.18) return null;
  return best;
}

function tokenizeForMatch(value) {
  return new Set(
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 2)
  );
}

function countSharedTokens(left, right) {
  let total = 0;
  left.forEach((token) => {
    if (right.has(token)) total += 1;
  });
  return total;
}

function uniqueCleanStrings(values) {
  const seen = new Set();
  return values.filter((value) => {
    const cleaned = cleanText(value);
    const key = cleaned.toLowerCase();
    if (!cleaned || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeSimpleTerm(term) {
  const lower = cleanText(term).toLowerCase();
  if (lower.includes('1') || lower.includes('first')) return 'term 1';
  if (lower.includes('2') || lower.includes('second')) return 'term 2';
  if (lower.includes('3') || lower.includes('third')) return 'term 3';
  return lower;
}

function normalizeParsedWeeks(weeks, expectedWeeks) {
  const deduped = [];
  const seen = new Set();
  for (const week of weeks) {
    if (!week.topic && !week.indicator && !week.contentStandard) continue;
    let weekNumber = week.week;
    if (!Number.isInteger(weekNumber) || weekNumber < 1) weekNumber = deduped.length + 1;
    if (weekNumber > expectedWeeks) continue;
    if (seen.has(weekNumber)) {
      const existingIndex = deduped.findIndex((item) => item.week === weekNumber);
      if (existingIndex >= 0) {
        deduped[existingIndex] = preferRicherWeek(deduped[existingIndex], { ...week, week: weekNumber });
      }
      continue;
    }
    seen.add(weekNumber);
    deduped.push({ ...week, week: weekNumber });
  }
  deduped.sort((a, b) => a.week - b.week);
  return deduped.slice(0, expectedWeeks);
}

function detectWeekCountFromText(text) {
  const lines = String(text || '').split(/\r?\n/).map((line) => cleanText(line)).filter(Boolean);
  const weekNumbers = [];

  for (const line of lines) {
    let match = line.match(/\b(?:week|wk|w\/k)\s*[:.\-]?\s*(\d{1,2})\b/i);
    if (!match) {
      match = line.match(/^(\d{1,2})(?:\b|\s)/);
    }
    if (!match) continue;
    const value = Number(match[1]);
    if (!Number.isInteger(value) || value < 1 || value > 30) continue;
    weekNumbers.push(value);
  }

  if (!weekNumbers.length) return 0;

  const unique = Array.from(new Set(weekNumbers)).sort((left, right) => left - right);
  let consecutiveFromOne = 0;
  for (const value of unique) {
    if (value === consecutiveFromOne + 1) {
      consecutiveFromOne = value;
      continue;
    }
    if (value > consecutiveFromOne + 1) break;
  }

  return consecutiveFromOne || unique[unique.length - 1] || 0;
}

function preferRicherWeek(existingWeek, nextWeek) {
  return scoreWeek(nextWeek) > scoreWeek(existingWeek) ? nextWeek : existingWeek;
}

function scoreWeek(week) {
  return [
    week.topic,
    week.strand,
    week.subStrand,
    week.contentStandard,
    week.indicator,
    Array.isArray(week.resources) ? week.resources.join(' ') : '',
  ].join(' ').trim().length;
}

function parseWeekNumber(value, index) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  const text = cleanText(value);
  const match = text.match(/\d{1,2}/);
  if (match) return Number(match[0]);
  return index + 1;
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function slugify(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

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
