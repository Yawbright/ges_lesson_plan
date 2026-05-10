import { cleanText } from './scheme-text-parser.mjs';

export function normalizeSchemeResponse(payload, input) {
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

export function reconcileParsedSchemeWithCurriculumBackend(input) {
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

function slugify(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
