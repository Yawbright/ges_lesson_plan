import { Alert, Platform } from 'react-native';
import { Share } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  getWeekEntries,
  getWeekResourceList,
  getWeekStrandSummary,
  getWeekSubStrandSummary,
  getWeekTopic,
} from '@/lib/schemeWeek';
import type { LessonPlan } from '@/types/lessonPlan';
import type { SchemeOfWork } from '@/types/scheme';
import type { TeachingNoteVisual, TeachingNotes } from '@/types/teachingNotes';

export async function exportLessonPlanPdf(plan: LessonPlan) {
  const html = pageHtml(buildLessonPlanContent(plan), 'lesson');
  const fileName = `${slugify(plan.subject)}-${plan.classLevel}-week-${plan.week}.pdf`;
  await exportHtmlAsPdf(html, fileName);
}

export async function shareLessonPlan(plan: LessonPlan) {
  if (Platform.OS === 'web') {
    await shareText(`Lesson plan: ${plan.subject} ${plan.classLevel} Week ${plan.week}`);
    return;
  }
  await exportLessonPlanPdf(plan);
}

export async function shareLessonPlans(plans: LessonPlan[]) {
  if (!plans.length) return;
  const first = plans[0];
  if (Platform.OS === 'web') {
    await shareText(
      `Lesson plans: ${first.subject} ${first.classLevel} Week ${first.week} (${plans.length} lessons)`,
    );
    return;
  }
  await exportLessonPlansPdf(plans);
}

export async function shareScheme(scheme: SchemeOfWork) {
  if (Platform.OS === 'web') {
    await shareText(`Scheme of work: ${scheme.subject} ${scheme.classLevel} ${scheme.term}`);
    return;
  }
  await exportSchemePdf(scheme);
}

export async function exportLessonPlansPdf(plans: LessonPlan[]) {
  if (!plans.length) return;
  const html = pageHtml(
    plans
      .map((plan, index) => `<section class="lesson-page${index > 0 ? ' page-break' : ''}">${buildLessonPlanContent(plan)}</section>`)
      .join(''),
    'lesson',
  );
  const first = plans[0];
  const fileName = `${slugify(first.subject)}-${first.classLevel}-week-${first.week}-all-lessons.pdf`;
  await exportHtmlAsPdf(html, fileName);
}

export async function exportSchemePdf(scheme: SchemeOfWork) {
  const html = buildSchemeHtml(scheme);
  const fileName = `${slugify(scheme.subject)}-${scheme.classLevel}-${slugify(scheme.term)}-scheme.pdf`;
  await exportHtmlAsPdf(html, fileName);
}

export async function exportTeachingNotesPdf(notes: TeachingNotes) {
  const html = pageHtml(buildTeachingNotesContent(notes), 'notes');
  const fileName = `${slugify(notes.subject)}-${notes.classLevel}-week-${notes.week}-teaching-notes-v${notes.versionNumber ?? 1}.pdf`;
  await exportHtmlAsPdf(html, fileName);
}

async function exportHtmlAsPdf(html: string, fileName: string) {
  if (Platform.OS === 'web') {
    const popup = window.open('', '_blank');
    if (!popup) {
      Alert.alert('Popup blocked', 'Allow popups so the browser print dialog can open.');
      return;
    }

    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: fileName,
      UTI: '.pdf',
    });
    return;
  }

  await Print.printAsync({ uri });
}

async function shareText(message: string) {
  const webNavigator =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & {
          share?: (data: { text?: string; title?: string }) => Promise<void>;
          clipboard?: { writeText: (text: string) => Promise<void> };
        })
      : undefined;
  if (webNavigator?.share) {
    await webNavigator.share({ text: message, title: 'GES Lesson Plan' });
    return;
  }
  if (webNavigator?.clipboard) {
    await webNavigator.clipboard.writeText(message);
    Alert.alert('Copied', 'Share text copied to clipboard.');
    return;
  }
  await Share.share({ message });
}

function buildLessonPlanContent(plan: LessonPlan) {
  const lessonTitle = buildLessonTitle(plan);
  const rows = plan.phases
    .map(
      (phase, index) => `
        <tr class="${index % 2 === 1 ? 'alt' : ''}">
          <td class="phase-cell">
            <strong>PHASE ${phase.phase}:</strong><br/>
            <span>${escapeHtml(phase.title)}</span><br/>
            <small>${escapeHtml(phase.duration ?? '')}</small>
          </td>
          <td class="activity-cell">
            ${phase.activities.map((item) => `<div>${escapeHtml(item)}</div>`).join('')}
            ${
              phase.assessment?.length
                ? `<div class="assessment"><strong>Assessment</strong>${phase.assessment
                    .map((item, index) => `<div>${index + 1}. ${escapeHtml(item)}</div>`)
                    .join('')}</div>`
                : ''
            }
          </td>
          <td class="resource-cell">${(phase.resources ?? []).map((item) => `<div>${escapeHtml(item)}</div>`).join('')}</td>
        </tr>
      `
    )
    .join('');

  return `
    <section class="lesson-title">
      <h1>${escapeHtml((plan.termTitle || '').toUpperCase())}</h1>
      <h2>${escapeHtml(lessonTitle.toUpperCase())}</h2>
    </section>

    <table class="info-table">
      <tr>
        <td style="width:40%"><span class="label">Week ending:</span> ${escapeHtml(plan.date ?? '')}</td>
        <td style="width:27%"><span class="label">Period:</span> ${escapeHtml(plan.period ?? '')}</td>
        <td style="width:33%"><span class="label">Subject:</span> ${escapeHtml(plan.subject)}</td>
      </tr>
      <tr class="alt">
        <td style="width:40%"><span class="label">Duration:</span> ${escapeHtml(plan.duration ?? '')}</td>
        <td colspan="2"><span class="label">Strand:</span> ${escapeHtml(plan.strand ?? '')}</td>
      </tr>
      <tr>
        <td style="width:40%"><span class="label">Class:</span> ${escapeHtml(plan.classLevel)}</td>
        <td style="width:27%"><span class="label">Class Size:</span> ${escapeHtml(plan.classSize ?? '')}</td>
        <td style="width:33%"><span class="label">Sub Strand:</span> ${escapeHtml(plan.subStrand ?? '')}</td>
      </tr>
      <tr class="alt">
        <td colspan="2"><span class="label">Topic:</span> ${escapeHtml(plan.topic ?? '')}</td>
        <td><span class="label">Lesson in Week:</span> ${escapeHtml(plan.lessonNumber ?? (plan.sessionIndex && plan.sessionsPerWeek ? `${plan.sessionIndex} of ${plan.sessionsPerWeek}` : ''))}</td>
      </tr>
    </table>

    <table class="info-table mt8">
      <tr>
        <td style="width:45%"><span class="label">Content Standard:</span> ${escapeHtml(plan.contentStandard ?? '')}</td>
        <td style="width:40%"><span class="label">Indicator:</span> ${escapeHtml(plan.indicator ?? '')}</td>
        <td style="width:15%"><span class="label">Lesson:</span> ${escapeHtml(plan.lessonNumber ?? '')}</td>
      </tr>
      <tr class="alt">
        <td style="width:45%"><span class="label">Performance Indicator:</span> ${escapeHtml(plan.performanceIndicator ?? '')}</td>
        <td colspan="2"><span class="label">Core Competencies:</span> ${escapeHtml((plan.coreCompetencies ?? []).join(': '))}</td>
      </tr>
      ${
        plan.references
          ? `<tr><td colspan="3"><span class="label">References:</span> ${escapeHtml(plan.references)}</td></tr>`
          : ''
      }
    </table>

    <table class="phase-table mt8">
      <tr class="phase-head"><th style="width:12%">Phase/Duration</th><th style="width:76%">Learners Activities</th><th style="width:12%">Resources</th></tr>
      ${rows}
    </table>

    ${buildVisualAidHtml(plan)}
    ${buildLocalLanguageHtml(plan)}
    ${buildTeacherDetailsHtml(plan)}
  `;
}

function buildSchemeHtml(scheme: SchemeOfWork) {
  const rows = scheme.weeks
    .map(
      (week) => `
        <tr>
          <td>${week.week}</td>
          <td>${escapeHtml(getWeekTopic(week))}</td>
          <td>${escapeHtml(getWeekStrandSummary(week))}</td>
          <td>${escapeHtml(getWeekSubStrandSummary(week))}</td>
          <td>${escapeHtml(buildWeekContentStandards(week))}</td>
          <td>${escapeHtml(buildWeekIndicators(week))}</td>
          <td>${escapeHtml(getWeekResourceList(week).join(', '))}</td>
        </tr>
      `
    )
    .join('');

  return pageHtml(`
    <h1>${escapeHtml(scheme.title)}</h1>
    <h2>${escapeHtml(scheme.subject)} - ${escapeHtml(scheme.classLevel)} - ${escapeHtml(
      scheme.term
    )}</h2>
    <table>
      <tr><th>Week</th><th>Topic</th><th>Strand</th><th>Sub-strand</th><th>Content Standard</th><th>Indicator</th><th>Resources</th></tr>
      ${rows}
    </table>
  `, 'scheme');
}

function buildTeachingNotesContent(notes: TeachingNotes) {
  return `
    <section class="notes-title">
      <h1>${escapeHtml(notes.title)}</h1>
      <h2>${escapeHtml(`${notes.subject} - ${notes.classLevel} - Week ${notes.week}${notes.lessonNumber ? ` - Lesson ${notes.lessonNumber}` : ''}${notes.versionNumber ? ` - Version ${notes.versionNumber}` : ''}`)}</h2>
    </section>
    ${notes.overview ? notesSection('Overview', `<p>${escapeHtml(notes.overview)}</p>`) : ''}
    ${notesListSection('Teacher Preparation', notes.preparation)}
    ${notes.visuals?.length ? notesSection('Content Diagrams and Examples', notes.visuals.map(buildVisualHtml).join('')) : ''}
    ${notesSection('Teaching Guide', notes.phaseGuidance.map((phase) => `
      <div class="phase-note">
        <h3>Phase ${phase.phase}: ${escapeHtml(phase.title)}</h3>
        ${listHtml(phase.teacherNotes)}
      </div>
    `).join(''))}
    ${notesListSection('Key Explanations', notes.keyExplanations)}
    ${notesListSection('Likely Misconceptions', notes.misconceptions)}
    ${notesListSection('Questions to Ask', notes.questionsToAsk)}
    ${notesListSection('Differentiation', notes.differentiation)}
    ${notesListSection('Classroom Management', notes.classroomManagement)}
    ${notesListSection('Board Summary', notes.boardSummary)}
    ${notesListSection('Homework / Follow-up', notes.homework ?? [])}
  `;
}

function notesSection(title: string, content: string) {
  return `<section class="notes-section"><h3>${escapeHtml(title)}</h3>${content}</section>`;
}

function notesListSection(title: string, items: string[]) {
  return items.length ? notesSection(title, listHtml(items)) : '';
}

function listHtml(items: string[]) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function buildVisualHtml(visual: TeachingNoteVisual) {
  const rows = visual.rows?.length
    ? `<table class="visual-table">${visual.rows
        .map((row, rowIndex) => `<tr class="${rowIndex === 0 ? 'head' : ''}">${row
          .map((cell) => `<td>${escapeHtml(cell)}</td>`)
          .join('')}</tr>`)
        .join('')}</table>`
    : '';
  const structuredItems = visual.steps ?? visual.labels?.map((item) => item.label) ?? (visual.prompt ? [visual.prompt] : []);
  return `
    <div class="visual-block">
      <h4>${escapeHtml(visual.title)}</h4>
      ${visual.imageUrl ? `<img class="visual-image" src="${escapeHtml(visual.imageUrl)}" alt="${escapeHtml(visual.altText ?? visual.title)}" />` : ''}
      ${structuredItems.length ? `<ol>${structuredItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>` : ''}
      ${rows}
      ${visual.caption ? `<p class="caption">${escapeHtml(visual.caption)}</p>` : ''}
      ${visual.attribution ? `<p class="attribution">${escapeHtml(visual.attribution)}</p>` : ''}
    </div>
  `;
}

function pageHtml(content: string, documentType: 'lesson' | 'scheme' | 'notes') {
  const lessonStyles =
    documentType === 'lesson'
      ? `
        body { padding: 18px; }
        h1 { font-size: 18px; }
        h2 { font-size: 15px; margin-bottom: 10px; }
        table { margin-top: 7px; }
        th, td { border-color: #e2e2dc; padding: 4px; font-size: 12px; line-height: 1.2; }
        th { font-size: 10px; }
        .lesson-title { margin-bottom: 4px; }
        .info-table, .phase-table { margin-top: 6px; }
        .info-table td { line-height: 1.18; }
        .label { font-size: 10px; }
        .phase-head th { font-size: 10px; padding: 4px; }
        .phase-cell { font-size: 12px; line-height: 1.18; }
        .phase-cell strong { font-size: 10px; }
        .phase-cell span { font-size: 11px; }
        .phase-cell small { font-size: 10px; }
        .activity-cell { font-size: 16px; }
        .activity-cell div { margin-bottom: 1px; line-height: 1.24; }
        .resource-cell { font-size: 13px; line-height: 1.2; }
        .assessment { margin-top: 5px; padding-top: 5px; border-top-color: #e2e2dc; }
        .assessment strong { font-size: 11px; }
        .teacher-details { border-color: #e2e2dc; padding: 5px; margin-top: 6px; font-size: 12px; line-height: 1.24; }
        .visual-aid { border: 1px solid #e2e2dc; border-radius: 6px; padding: 7px; margin-top: 7px; break-inside: avoid; page-break-inside: avoid; }
        .visual-kicker { color: #0F4C3A; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .visual-title { font-size: 14px; font-weight: 700; margin-top: 2px; }
        .visual-purpose, .visual-activity, .visual-caption { font-size: 12px; line-height: 1.25; margin-top: 3px; }
        .visual-activity, .visual-caption { color: #6B6B6B; font-size: 11px; }
        .visual-figure { margin-top: 6px; }
        .bar-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .bar-label { width: 90px; font-size: 11px; }
        .bar-track { flex: 1; height: 10px; background: #F4F1EA; border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 10px; background: #0F4C3A; }
        .bar-value { width: 28px; font-size: 11px; text-align: right; color: #6B6B6B; }
        .step-list { display: grid; gap: 4px; }
        .step-item { display: flex; gap: 6px; align-items: flex-start; font-size: 12px; line-height: 1.25; }
        .step-index { min-width: 16px; height: 16px; border-radius: 8px; background: #0F4C3A; color: #fff; text-align: center; font-size: 10px; font-weight: 700; line-height: 16px; }
        .label-grid { display: flex; flex-wrap: wrap; gap: 5px; }
        .label-chip { border: 1px solid #e2e2dc; background: #F4F1EA; border-radius: 5px; padding: 3px 5px; font-size: 11px; }
        .visual-table { border: 1px solid #e2e2dc; border-collapse: collapse; margin-top: 6px; }
        .visual-table td { border: 1px solid #e2e2dc; padding: 4px; font-size: 12px; }
        .visual-table .visual-row-label { color: #0F4C3A; font-weight: 700; width: 35%; }
        .local-language { border: 1px solid #e2e2dc; border-radius: 6px; padding: 7px; margin-top: 7px; break-inside: avoid; page-break-inside: avoid; }
        .local-review { color: #6B6B6B; font-size: 11px; line-height: 1.25; margin-top: 3px; }
        .translation-group { margin-top: 7px; }
        .translation-group-title { color: #0F4C3A; font-size: 11px; font-weight: 700; margin-bottom: 3px; }
        .translation-table { border-collapse: collapse; margin-top: 0; }
        .translation-table td { border: 1px solid #e2e2dc; padding: 4px; font-size: 12px; line-height: 1.2; }
        .translation-english { color: #6B6B6B; width: 45%; }
        .translation-local { font-weight: 700; }
        .translation-pronunciation { display: block; color: #6B6B6B; font-size: 10px; font-weight: 400; margin-top: 1px; }
      `
      : '';

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Export</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a1a; }
        h1, h2, h3 { margin: 0 0 8px; }
        h1 { color: #0F4C3A; font-size: 18px; }
        h2 { font-size: 15px; margin-bottom: 20px; color: #0A3326; }
        h3 { margin-top: 24px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #d8d8d2; padding: 6px; vertical-align: top; font-size: 12px; text-align: left; }
        th { background: #edf3f0; }
        .lesson-title { text-align: center; margin-bottom: 8px; }
        .lesson-title h1, .lesson-title h2 { text-align: center; }
        .page-break { break-before: page; page-break-before: always; }
        .info-table, .phase-table { margin-top: 8px; }
        .info-table td { line-height: 1.32; }
        .alt { background: #F4F1EA; }
        .label { color: #0F4C3A; font-size: 10px; font-weight: 700; }
        .mt8 { margin-top: 8px; }
        .phase-head th { background: #0F4C3A; color: #fff; font-size: 11px; font-weight: 700; }
        .phase-cell strong { color: #0F4C3A; font-size: 10px; }
        .phase-cell span { font-weight: 600; }
        .phase-cell small { color: #6B6B6B; }
        .activity-cell div { margin-bottom: 3px; line-height: 1.45; }
        .assessment { margin-top: 8px; padding-top: 8px; border-top: 1px solid #d8d8d2; }
        .teacher-details { border: 1px solid #d8d8d2; border-radius: 6px; padding: 8px; margin-top: 8px; font-size: 12px; line-height: 1.45; }
        ${lessonStyles}
        ${documentType === 'notes' ? notesStyles() : ''}
      </style>
    </head>
    <body>${content}</body>
  </html>`;
}

function notesStyles() {
  return `
    body { padding: 20px; }
    .notes-title { margin-bottom: 14px; }
    .notes-title h1 { font-size: 20px; color: #0F4C3A; }
    .notes-title h2 { font-size: 13px; color: #555; }
    .notes-section { border: 1px solid #d8d8d2; border-radius: 6px; padding: 10px; margin-bottom: 10px; break-inside: avoid; page-break-inside: avoid; }
    .notes-section h3 { color: #0F4C3A; font-size: 14px; margin-bottom: 6px; }
    .notes-section p, .notes-section li { font-size: 12px; line-height: 1.48; }
    .notes-section ul, .notes-section ol { margin-top: 4px; padding-left: 18px; }
    .notes-section li { margin-bottom: 3px; }
    .phase-note { border-top: 1px solid #e2e2dc; padding-top: 6px; margin-top: 6px; }
    .phase-note h3 { font-size: 12px; color: #0F4C3A; }
    .visual-block { background: #F4F1EA; border: 1px solid #d8d8d2; border-radius: 6px; padding: 8px; margin-top: 8px; break-inside: avoid; page-break-inside: avoid; }
    .visual-block h4 { margin: 0 0 6px; color: #1a1a1a; font-size: 13px; }
    .visual-block ol { margin-top: 4px; padding-left: 18px; }
    .visual-image { max-width: 100%; max-height: 240px; object-fit: contain; display: block; margin: 6px auto; background: #fff; }
    .visual-table { margin-top: 6px; }
    .visual-table td { font-size: 11px; }
    .visual-table .head td { background: #edf3f0; font-weight: 700; }
    .caption { margin-top: 6px; }
    .attribution { color: #666; font-size: 10px; }
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildWeekContentStandards(week: SchemeOfWork['weeks'][number]) {
  return joinUnique(
    getWeekEntries(week)
      .map((entry) => entry.contentStandard)
      .filter(Boolean) as string[]
  );
}

function buildWeekIndicators(week: SchemeOfWork['weeks'][number]) {
  return joinUnique(
    getWeekEntries(week)
      .map((entry) => entry.indicator)
      .filter(Boolean) as string[]
  );
}

function joinUnique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].join(' | ');
}

function buildTeacherDetailsHtml(plan: LessonPlan) {
  const rows = [
    plan.teacherName ? `<div><strong>Teacher:</strong> ${escapeHtml(plan.teacherName)}</div>` : '',
    plan.schoolName ? `<div><strong>School:</strong> ${escapeHtml(plan.schoolName)}</div>` : '',
    plan.schoolDistrict ? `<div><strong>District:</strong> ${escapeHtml(plan.schoolDistrict)}</div>` : '',
  ].filter(Boolean);

  return rows.length ? `<section class="teacher-details">${rows.join('')}</section>` : '';
}

function buildVisualAidHtml(plan: LessonPlan) {
  const visualAid = plan.visualAids?.[0];
  if (!visualAid?.title) return '';

  return `<section class="visual-aid">
    <div class="visual-kicker">Visual Aid${visualAid.phase ? ` - Phase ${visualAid.phase}` : ''}</div>
    <div class="visual-title">${escapeHtml(visualAid.title)}</div>
    ${visualAid.purpose ? `<div class="visual-purpose">${escapeHtml(visualAid.purpose)}</div>` : ''}
    ${visualAid.activityLink ? `<div class="visual-activity">${escapeHtml(visualAid.activityLink)}</div>` : ''}
    ${buildVisualFigureHtml(visualAid)}
    ${visualAid.caption ? `<div class="visual-caption">${escapeHtml(visualAid.caption)}</div>` : ''}
  </section>`;
}

function buildVisualFigureHtml(visualAid: NonNullable<LessonPlan['visualAids']>[number]) {
  if (visualAid.type === 'bar_chart' && visualAid.data?.length) {
    const maxValue = Math.max(...visualAid.data.map((item) => item.value), 1);
    return `<div class="visual-figure">${visualAid.data
      .slice(0, 5)
      .map((item) => {
        const width = Math.max(8, Math.round((item.value / maxValue) * 100));
        return `<div class="bar-row"><div class="bar-label">${escapeHtml(item.label)}</div><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><div class="bar-value">${item.value}</div></div>`;
      })
      .join('')}</div>`;
  }

  if ((visualAid.type === 'flowchart' || visualAid.type === 'timeline') && visualAid.steps?.length) {
    return `<div class="visual-figure step-list">${visualAid.steps
      .slice(0, 6)
      .map((step, index) => `<div class="step-item"><span class="step-index">${index + 1}</span><span>${escapeHtml(step)}</span></div>`)
      .join('')}</div>`;
  }

  if (visualAid.type === 'comparison_table' && visualAid.rows?.length) {
    return `<table class="visual-table">${visualAid.rows
      .slice(0, 5)
      .map((row) => `<tr><td class="visual-row-label">${escapeHtml(row.label)}</td><td>${escapeHtml(row.value)}</td></tr>`)
      .join('')}</table>`;
  }

  const labels = visualAid.labels?.length ? visualAid.labels : visualAid.steps;
  if (!labels?.length) return '';
  return `<div class="visual-figure label-grid">${labels
    .slice(0, 6)
    .map((label) => `<span class="label-chip">${escapeHtml(label)}</span>`)
    .join('')}</div>`;
}

function buildLocalLanguageHtml(plan: LessonPlan) {
  const support = plan.localLanguageSupport;
  if (!support?.language) return '';
  const sections = [
    buildTranslationSection('Key Vocabulary', support.vocabulary, true),
    buildTranslationSection('Classroom Expressions', support.classroomExpressions),
    buildTranslationSection('Activity Prompts', support.activityPrompts),
    buildTranslationSection('Assessment Prompts', support.assessmentPrompts),
  ].filter(Boolean);
  if (!sections.length) return '';

  return `<section class="local-language">
    <div class="visual-kicker">Local Language Support</div>
    <div class="visual-title">${escapeHtml(support.language)}</div>
    <div class="local-review">${escapeHtml(support.reviewNote || 'AI-assisted draft. Teacher should review before classroom use.')}</div>
    ${sections.join('')}
  </section>`;
}

function buildTranslationSection(
  title: string,
  items?: { english: string; local: string; pronunciation?: string }[],
  showPronunciation = false,
) {
  if (!items?.length) return '';
  return `<div class="translation-group">
    <div class="translation-group-title">${escapeHtml(title)}</div>
    <table class="translation-table">${items
      .map(
        (item) => `<tr>
          <td class="translation-english">${escapeHtml(item.english)}</td>
          <td class="translation-local">${escapeHtml(item.local)}${
            showPronunciation && item.pronunciation
              ? `<span class="translation-pronunciation">${escapeHtml(item.pronunciation)}</span>`
              : ''
          }</td>
        </tr>`,
      )
      .join('')}</table>
  </div>`;
}

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
