export function extractAnnualPlanText(text, requestedClassLevel, requestedSubject = '') {
  const subjectScopedText = isolateRequestedSubjectText(text, requestedSubject);
  const classScopedText = isolateRequestedClassText(subjectScopedText || text, requestedClassLevel);
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

export function selectPreferredSchemeSection(text, requestedClassLevel, requestedTerm, requestedSubject = '') {
  const subjectScopedText = isolateRequestedSubjectText(text, requestedSubject);
  const classScopedText = isolateRequestedClassText(subjectScopedText || text, requestedClassLevel);
  const detailedText = extractDetailedTermSection(classScopedText, requestedTerm);
  if (detailedText.trim()) {
    return { source: 'detailed', text: detailedText, weekCount: detectWeekCountFromText(detailedText) };
  }

  const annualPlanText = extractAnnualPlanText(subjectScopedText || text, requestedClassLevel);
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

  const fallbackText = isolateRequestedTermText(classScopedText, requestedTerm);
  return {
    source: 'fallback',
    text: fallbackText,
    weekCount: detectWeekCountFromText(fallbackText),
  };
}

export function extractLikelyWeekRows(text) {
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

export function detectAvailableClassLevels(text) {
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

export function detectAvailableSubjects(text) {
  const lines = String(text || '').split(/\r?\n/);
  const seen = new Set();
  const ordered = [];

  for (const line of lines) {
    const subject = detectSubjectFromLine(line);
    if (!subject || seen.has(subject.normalized)) continue;
    seen.add(subject.normalized);
    ordered.push(subject.label);
  }

  return ordered;
}

export function isolateRequestedSubjectText(text, requestedSubject) {
  const normalizedSubject = normalizeSubjectLabel(requestedSubject);
  if (!normalizedSubject) return text;

  const lines = String(text || '').split(/\r?\n/);
  const markers = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const subject = detectSubjectFromLine(line);
    if (!subject) continue;

    const score = scoreSubjectMarker(line, subject.normalized);
    if (score >= 3) {
      markers.push({ index, subject, score });
    }
  }

  if (!markers.length) return text;

  const targetMarker = markers
    .filter((marker) => marker.subject.normalized === normalizedSubject)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.index - right.index;
    })[0];

  if (!targetMarker) return '';

  const nextMarker = markers
    .filter(
      (marker) =>
        marker.index > targetMarker.index &&
        marker.subject.normalized !== normalizedSubject &&
        marker.score >= 3
    )
    .sort((left, right) => left.index - right.index)[0];

  const endIndex = nextMarker ? nextMarker.index : lines.length;
  const slice = lines.slice(targetMarker.index, endIndex).join('\n').trim();
  return slice || text;
}

export function detectUploadedSchemeMetadata(text) {
  const compact = cleanText(text).replace(/\s+/g, ' ');
  const subjectMatch = detectSubjectFromLine(compact);
  const classMatch = compact.match(/\b(?:basic|b|jhs)\s*([1-9])\b/i);
  const termMatch = detectTermFromLine(compact);

  return {
    subject: subjectMatch?.label || '',
    classLevel: classMatch ? `B${classMatch[1]}` : '',
    term: termMatch || '',
  };
}

export function subjectsRoughlyMatch(left, right) {
  return normalizeSubjectLabel(left) === normalizeSubjectLabel(right);
}

export function detectWeekCountFromText(text) {
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

export function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
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

function detectSubjectFromLine(line) {
  const value = cleanText(line);
  if (!value) return null;
  return SUBJECT_PATTERNS.find((entry) => entry.pattern.test(value)) || null;
}

function scoreSubjectMarker(line, normalizedSubject) {
  const value = cleanText(line).toLowerCase();
  if (!value) return 0;

  let score = 0;
  if (normalizeSubjectLabel(value) === normalizedSubject) score += 4;
  if (value.length <= 120) score += 1;
  if (value.length <= 70) score += 1;
  if (/\b(subject|scheme|scheme of work|scheme of learning|tsol|department)\b/.test(value)) score += 2;
  if (/\b(term|basic|b[1-9]|jhs|weeks?|strand|indicator|content standard)\b/.test(value)) score += 1;
  if (/^[A-Z0-9\s&/()._-]+$/.test(cleanText(line)) && value.length <= 90) score += 1;
  return score;
}

function normalizeSubjectLabel(value) {
  const lower = cleanText(value).toLowerCase();
  if (!lower) return '';
  if (/\bmathematics\b|\bmaths\b|\bcore mathematics\b/.test(lower)) return 'mathematics';
  if (/\bscience\b|\bintegrated science\b|\bgeneral science\b/.test(lower)) return 'science';
  if (/\bcomputing\b|\bict\b|\binformation and communication technology\b|\bcomputer studies\b/.test(lower)) return 'computing';
  if (/\benglish language\b|\benglish\b/.test(lower)) return 'english language';
  if (/\bsocial studies\b/.test(lower)) return 'social studies';
  if (/\breligious and moral education\b|\breligious moral education\b|\brme\b/.test(lower)) return 'rme';
  if (/\bghanaian language\b|\bghanaian languages\b|\bgl\b/.test(lower)) return 'ghanaian language';
  if (/\bcareer technology\b|\bcareer tech\b|\bct\b/.test(lower)) return 'career technology';
  if (/\bcreative arts and design\b|\bcreative arts\b|\bcad\b/.test(lower)) return 'creative arts and design';
  if (/\bfrench\b/.test(lower)) return 'french';
  if (/\bhistory\b/.test(lower)) return 'history';
  if (/\bphysical education\b|\bphys ed\b|\bpe\b/.test(lower)) return 'physical education';
  return lower.replace(/\s+/g, ' ').trim();
}

const SUBJECT_PATTERNS = [
  {
    label: 'Mathematics',
    normalized: 'mathematics',
    pattern: /\bmathematics\b|\bmaths\b|\bcore mathematics\b|\bp\.?\s*maths?\b/i,
  },
  {
    label: 'Science',
    normalized: 'science',
    pattern: /\bscience\b|\bintegrated science\b|\bgeneral science\b|\bp\.?\s*science\b/i,
  },
  {
    label: 'Computing',
    normalized: 'computing',
    pattern: /\bcomputing\b|\bict\b|\binformation and communication technology\b|\bcomputer studies\b/i,
  },
  {
    label: 'English Language',
    normalized: 'english language',
    pattern: /\benglish language\b|\benglish\b|\bp\.?\s*english\b/i,
  },
  {
    label: 'Social Studies',
    normalized: 'social studies',
    pattern: /\bsocial studies\b/i,
  },
  {
    label: 'Religious and Moral Education',
    normalized: 'rme',
    pattern: /\breligious and moral education\b|\breligious moral education\b|\brme\b/i,
  },
  {
    label: 'Ghanaian Language',
    normalized: 'ghanaian language',
    pattern: /\bghanaian language\b|\bghanaian languages\b|\bgl\b/i,
  },
  {
    label: 'Career Technology',
    normalized: 'career technology',
    pattern: /\bcareer technology\b|\bcareer tech\b|\bct\b/i,
  },
  {
    label: 'Creative Arts and Design',
    normalized: 'creative arts and design',
    pattern: /\bcreative arts and design\b|\bcreative arts\b|\bcad\b/i,
  },
  {
    label: 'French',
    normalized: 'french',
    pattern: /\bfrench language\b|\bfrench\b/i,
  },
  {
    label: 'History',
    normalized: 'history',
    pattern: /\bhistory\b/i,
  },
  {
    label: 'Physical Education',
    normalized: 'physical education',
    pattern: /\bphysical education\b|\bphys ed\b|\bpe\b/i,
  },
];
