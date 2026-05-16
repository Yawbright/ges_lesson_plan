import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const defaultConcurrency = 3;

const subjects = [
  {
    name: 'English',
    pdf: '_archive\\non-code-assets\\English-Language.pdf',
    source: 'src/data/curriculum/englishExemplars.ts',
    codePattern: String.raw`B[789]/JHS[123](?:\s*\.\s*\d+){4}`,
  },
  {
    name: 'Mathematics',
    pdf: '_archive\\non-code-assets\\MATHEMATICS-CCP-B7-B9.pdf',
    source: 'src/data/curriculum/mathematicsExemplars.ts',
    codePattern: String.raw`B[789](?:\s*\.\s*\d+){4}`,
  },
  {
    name: 'Science',
    pdf: '_archive\\non-code-assets\\Science-Curriculum.pdf',
    source: 'src/data/curriculum/scienceExemplars.ts',
    codePattern: String.raw`B[789]/JHS[123](?:\s*\.\s*\d+){4}`,
  },
  {
    name: 'Social Studies',
    pdf: '_archive\\non-code-assets\\Social-Studies-curriculum.pdf',
    source: 'src/data/curriculum/socialStudiesExemplars.ts',
    codePattern: String.raw`B[789]/JHS[123](?:\s*\.\s*\d+){4}`,
    allowParentExemplarCoverage: true,
  },
  {
    name: 'Computing',
    pdf: '_archive\\non-code-assets\\COMPUTING-curriculum.pdf',
    source: 'src/data/curriculum/computingExemplars.ts',
    codePattern: String.raw`B[789](?:\s*\.\s*\d+){4}`,
  },
  {
    name: 'RME',
    pdf: '_archive\\non-code-assets\\RME-curriculum.pdf',
    source: 'src/data/curriculum/rmeExemplars.ts',
    codePattern: String.raw`B[789]/JHS[123]\s+(?:\d+\s*\.\s*){3}\d+`,
    normalizeJhsSpace: true,
  },
  {
    name: 'Career Technology',
    pdf: '_archive\\non-code-assets\\Career-Tech.pdf',
    source: 'src/data/curriculum/careerTechnologyExemplars.ts',
    codePattern: String.raw`B[789]/JHS[123](?:\s*\.\s*\d+){4}`,
  },
  {
    name: 'Creative Arts and Design',
    pdf: '_archive\\non-code-assets\\Creative-Arts-and-Design-_-CCP-Curriculum-New.indd_.pdf',
    source: 'src/data/curriculum/creativeArtsDesignExemplars.ts',
    codePattern: String.raw`B[789]/JHS[123](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizeJhsSpace: true,
  },
  {
    name: 'Ghanaian Language',
    pdf: '_archive\\non-code-assets\\Ghanaian Language _ CCP  Curriculum .pdf',
    source: 'src/data/curriculum/ghanaianLanguageExemplars.ts',
    codePattern: String.raw`B[789](?:\s*\.\s*\d+){4}`,
    minPage: 24,
  },
  {
    name: 'French Language',
    pdf: '_archive\\non-code-assets\\FRENCH-LANGUAGE.pdf',
    source: 'src/data/curriculum/frenchLanguageExemplars.ts',
    codePattern: String.raw`B[789]/JHS[123](?:\s*\.\s*\d+){4}`,
    minPage: 36,
  },
  {
    name: 'Primary Mathematics',
    pdf: '_archive\\non-code-assets\\P. Maths CCP B1-6.pdf',
    source: 'src/data/curriculum/primaryMathematicsExemplars.ts',
    codePattern: String.raw`B[1-6](?:\s*\.\s*\d+){4}`,
    minPage: 23,
  },
  {
    name: 'Primary Science',
    pdf: '_archive\\non-code-assets\\P. Science CCP B1-6.pdf',
    source: 'src/data/curriculum/primaryScienceExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 22,
    ignoreCodes: ['B4.2.4.1.2'],
  },
  {
    name: 'Primary History',
    pdf: '_archive\\non-code-assets\\HISTORY-B1-B6.pdf',
    source: 'src/data/curriculum/primaryHistoryExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 24,
  },
  {
    name: 'Primary RME',
    pdf: '_archive\\non-code-assets\\RELIGIOUS-AND-MORAL-EDUCATION-B1-B6.pdf',
    source: 'src/data/curriculum/primaryRmeExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 22,
  },
  {
    name: 'Primary English',
    pdf: '_archive\\non-code-assets\\P. English CCP B1-6.pdf',
    source: 'src/data/curriculum/primaryEnglishExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 28,
  },
  {
    name: 'Primary Ghanaian Language',
    pdf: '_archive\\non-code-assets\\P. G language CCP B1-6.pdf',
    source: 'src/data/curriculum/primaryGhanaianLanguageExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 53,
  },
  {
    name: 'Primary Creative Arts',
    pdf: '_archive\\non-code-assets\\C. ARTS B1-6.pdf',
    source: 'src/data/curriculum/primaryCreativeArtsExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 28,
  },
  {
    name: 'Primary French',
    pdf: '_archive\\non-code-assets\\FRENCH-B1-B6.pdf',
    source: 'src/data/curriculum/primaryFrenchExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 24,
  },
  {
    name: 'Primary Computing',
    pdf: '_archive\\non-code-assets\\COMPUTING-B4-B6.pdf',
    source: 'src/data/curriculum/primaryComputingExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 23,
  },
  {
    name: 'Primary Physical Education',
    pdf: '_archive\\non-code-assets\\PHYSICAL-EDUCATION-B1-B6.pdf',
    source: 'src/data/curriculum/primaryPhysicalEducationExemplars.ts',
    codePattern: String.raw`B[1-6](?:(?:\s*\.\s*\d+){4}|\s+(?:\d+\s*\.\s*){3}\d+)`,
    normalizePrimarySpace: true,
    minPage: 23,
  },
];

const options = parseOptions(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

if (options.list) {
  printSubjectList();
  process.exit(0);
}

const selectedSubjects = selectSubjects(subjects, options);

if (!selectedSubjects.length) {
  console.error('No curriculum subjects matched the requested filters.');
  console.error('Run `npm run audit:curriculum-sources -- --list` to see available subjects.');
  process.exit(1);
}

const results = await mapWithConcurrency(selectedSubjects, options.concurrency, auditSubject);
printResults(results, options);

if (results.some((result) => result.missing.length > 0)) {
  process.exitCode = 1;
}

async function auditSubject(subject) {
  const startedAt = performance.now();
  const ignoredCodes = new Set(subject.ignoreCodes ?? []);
  const pdfCodes = (await extractPdfCodes(
    subject.pdf,
    subject.codePattern,
    subject.normalizeJhsSpace,
    subject.normalizePrimarySpace,
    subject.minPage,
  )).filter((code) => !ignoredCodes.has(code));
  const sourceText = readFileSync(subject.source, 'utf8');
  const sourceRecords = extractSourceRecords(sourceText);
  const sourceCodes = [...sourceRecords.keys()].sort();
  const sourceSet = new Set(sourceCodes);
  const parentCovered = [];
  const missing = [];

  for (const code of pdfCodes) {
    if (sourceSet.has(code)) continue;

    if (subject.allowParentExemplarCoverage && isCoveredByParentExemplar(code, sourceRecords)) {
      parentCovered.push(code);
      continue;
    }

    missing.push(code);
  }

  const extra = sourceCodes.filter((code) => !pdfCodes.includes(code));

  return {
    subject,
    pdfCodes,
    sourceCodes,
    missing,
    extra,
    parentCovered,
    elapsedMs: Math.round(performance.now() - startedAt),
  };
}

async function extractPdfCodes(
  pdfPath,
  codePattern,
  normalizeJhsSpace = false,
  normalizePrimarySpace = false,
  minPage = 1,
) {
  const python = String.raw`
import json, re, sys
import pdfplumber

pdf_path = sys.argv[1]
code_re = re.compile(sys.argv[2])
normalize_jhs_space = sys.argv[3] == "1"
normalize_primary_space = sys.argv[4] == "1"
min_page = int(sys.argv[5])

def normalize_code(value):
    if normalize_jhs_space:
        value = re.sub(r"(JHS\d)\s+", r"\1.", value)
    if normalize_primary_space:
        value = re.sub(r"B([1-6])\s+", r"B\1.", value)
    value = re.sub(r"\s+", "", value)
    return re.sub(r"\.{2,}", ".", value)

with pdfplumber.open(pdf_path) as pdf:
    text = "\n".join(
        page.extract_text() or ""
        for index, page in enumerate(pdf.pages, start=1)
        if index >= min_page
    )

codes = sorted({
    normalize_code(match.group(0))
    for match in code_re.finditer(text)
})

print(json.dumps(codes))
`;

  const { stdout } = await execFileAsync(
    'python',
    [
      '-c',
      python,
      pdfPath,
      codePattern,
      normalizeJhsSpace ? '1' : '0',
      normalizePrimarySpace ? '1' : '0',
      String(minPage),
    ],
    {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    },
  );

  return JSON.parse(stdout);
}

function parseOptions(args) {
  const options = {
    concurrency: defaultConcurrency,
    groups: new Set(),
    help: false,
    list: false,
    names: new Set(),
    summaryOnly: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--list') {
      options.list = true;
    } else if (arg === '--summary') {
      options.summaryOnly = true;
    } else if (arg === '--primary') {
      options.groups.add('primary');
    } else if (arg === '--jhs') {
      options.groups.add('jhs');
    } else if (arg === '--group' && next) {
      options.groups.add(slugify(next));
      index += 1;
    } else if (arg.startsWith('--group=')) {
      options.groups.add(slugify(arg.slice('--group='.length)));
    } else if ((arg === '--subject' || arg === '-s') && next) {
      options.names.add(slugify(next));
      index += 1;
    } else if (arg.startsWith('--subject=')) {
      options.names.add(slugify(arg.slice('--subject='.length)));
    } else if (arg === '--concurrency' && next) {
      options.concurrency = parseConcurrency(next);
      index += 1;
    } else if (arg.startsWith('--concurrency=')) {
      options.concurrency = parseConcurrency(arg.slice('--concurrency='.length));
    }
  }

  return options;
}

function parseConcurrency(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return defaultConcurrency;
  return Math.min(parsed, 6);
}

function selectSubjects(allSubjects, options) {
  const hasGroups = options.groups.size > 0;
  const hasNames = options.names.size > 0;

  if (!hasGroups && !hasNames) return allSubjects;

  return allSubjects.filter((subject) => {
    const subjectSlug = slugify(subject.name);
    const subjectGroup = getSubjectGroup(subject);

    return (
      (hasGroups && options.groups.has(subjectGroup)) ||
      (hasNames && options.names.has(subjectSlug))
    );
  });
}

function getSubjectGroup(subject) {
  return subject.name.startsWith('Primary ') ? 'primary' : 'jhs';
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, worker));

  return results;
}

function printResults(results, options) {
  console.log(`Audited ${results.length} curriculum source map${results.length === 1 ? '' : 's'}.\n`);
  console.log(
    [
      pad('Subject', 28),
      pad('PDF', 5),
      pad('TS', 5),
      pad('Missing', 8),
      pad('Extra', 6),
      pad('Parent', 7),
      'Time',
    ].join('  '),
  );
  console.log('-'.repeat(78));

  for (const result of results) {
    console.log(
      [
        pad(result.subject.name, 28),
        pad(String(result.pdfCodes.length), 5),
        pad(String(result.sourceCodes.length), 5),
        pad(String(result.missing.length), 8),
        pad(String(result.extra.length), 6),
        pad(String(result.parentCovered.length), 7),
        `${(result.elapsedMs / 1000).toFixed(1)}s`,
      ].join('  '),
    );
  }

  if (options.summaryOnly) return;

  for (const result of results) {
    if (!result.missing.length && !result.extra.length && !result.parentCovered.length) {
      continue;
    }

    console.log(`\n${result.subject.name}`);
    if (result.missing.length) {
      console.log(`Missing in TS (${result.missing.length}):`);
      console.log(result.missing.join('\n'));
    }
    if (result.parentCovered.length) {
      console.log(`Covered by parent exemplar rows (${result.parentCovered.length}):`);
      console.log(result.parentCovered.join('\n'));
    }
    if (result.extra.length) {
      console.log(`Extra in TS (${result.extra.length}):`);
      console.log(result.extra.join('\n'));
    }
  }
}

function printSubjectList() {
  console.log('Available curriculum source audits:\n');
  for (const subject of subjects) {
    console.log(`${pad(subject.name, 28)} ${getSubjectGroup(subject)}`);
  }
}

function printHelp() {
  console.log(`
Usage:
  npm run audit:curriculum-sources
  npm run audit:curriculum-sources -- --primary
  npm run audit:curriculum-sources -- --subject "Primary Mathematics"
  npm run audit:curriculum-sources -- --group jhs --summary

Options:
  --primary              Audit only primary subjects.
  --jhs                  Audit only JHS subjects.
  --group <name>         Audit a group: primary or jhs.
  --subject, -s <name>   Audit one subject. Repeat for multiple subjects.
  --summary              Print only the summary table.
  --concurrency <n>      Number of PDF scans to run at once. Default: ${defaultConcurrency}.
  --list                 Show available subjects.
  --help                 Show this help.
`);
}

function pad(value, length) {
  return value.length >= length ? value : `${value}${' '.repeat(length - value.length)}`;
}

function slugify(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractSourceRecords(sourceText) {
  const records = new Map();
  const recordPattern = /^\s*"(?<code>B\d(?:\/JHS\d)?(?:\.\d+){4})"\s*:\s*\{(?<body>[\s\S]*?)^\s*\},/gm;

  for (const match of sourceText.matchAll(recordPattern)) {
    records.set(match.groups.code, {
      exemplarCount: countExemplars(match.groups.body),
    });
  }

  return records;
}

function countExemplars(recordBody) {
  const arrayMatch = recordBody.match(/exemplars:\s*\[([\s\S]*?)\]\s*,/);
  if (!arrayMatch) return 0;
  return [...arrayMatch[1].matchAll(/^\s*"/gm)].length;
}

function isCoveredByParentExemplar(code, records) {
  const parts = code.split('.');
  const exemplarNumber = Number(parts.at(-1));
  if (!Number.isFinite(exemplarNumber)) return false;

  const parentKey = `${parts.slice(0, 4).join('.')}.1`;
  const parent = records.get(parentKey);

  return Boolean(parent && parent.exemplarCount >= exemplarNumber);
}
