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

export async function exportLessonPlanPdf(plan: LessonPlan) {
  const html = pageHtml(buildLessonPlanContent(plan));
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
          <td>${(phase.resources ?? []).map((item) => `<div>${escapeHtml(item)}</div>`).join('')}</td>
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
  `);
}

function pageHtml(content: string) {
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
      </style>
    </head>
    <body>${content}</body>
  </html>`;
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
