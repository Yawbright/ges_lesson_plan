import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

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
];

let hasMissing = false;

for (const subject of subjects) {
  const pdfCodes = extractPdfCodes(
    subject.pdf,
    subject.codePattern,
    subject.normalizeJhsSpace,
    subject.minPage,
  );
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
  hasMissing = hasMissing || missing.length > 0;

  console.log(`\n${subject.name}`);
  console.log(`PDF indicator-like codes: ${pdfCodes.length}`);
  console.log(`TS source records: ${sourceCodes.length}`);
  console.log(`Missing in TS: ${missing.length}`);
  if (missing.length) console.log(missing.join('\n'));
  if (parentCovered.length) {
    console.log(`Covered by parent exemplar rows: ${parentCovered.length}`);
  }
  console.log(`Extra in TS: ${extra.length}`);
  if (extra.length) console.log(extra.join('\n'));
}

if (hasMissing) {
  process.exitCode = 1;
}

function extractPdfCodes(pdfPath, codePattern, normalizeJhsSpace = false, minPage = 1) {
  const python = String.raw`
import json, re, sys
import pdfplumber

pdf_path = sys.argv[1]
code_re = re.compile(sys.argv[2])
normalize_jhs_space = sys.argv[3] == "1"
min_page = int(sys.argv[4])

def normalize_code(value):
    if normalize_jhs_space:
        value = re.sub(r"(JHS\d)\s+", r"\1.", value)
    return re.sub(r"\s+", "", value)

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

  return JSON.parse(
    execFileSync(
      'python',
      ['-c', python, pdfPath, codePattern, normalizeJhsSpace ? '1' : '0', String(minPage)],
      {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
      }
    )
  );
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
