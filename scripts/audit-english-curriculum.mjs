import { execFileSync } from 'node:child_process';
import { englishExemplarsByIndicator } from '../src/data/curriculum/englishExemplars.ts';

const pdfPath = '_archive\\non-code-assets\\English-Language.pdf';

const python = String.raw`
import json, re, sys
import pdfplumber

pdf_path = sys.argv[1]
code_re = re.compile(r'B[789]/JHS[123](?:\s*\.\s*\d+){4}')

with pdfplumber.open(pdf_path) as pdf:
    text = "\n".join(page.extract_text() or "" for page in pdf.pages)

codes = sorted({
    re.sub(r'\s+', '', match.group(0))
    for match in code_re.finditer(text)
})

print(json.dumps(codes))
`;

const pdfCodes = JSON.parse(
  execFileSync('python', ['-c', python, pdfPath], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  })
);
const tsCodes = Object.keys(englishExemplarsByIndicator).sort();
const pdfSet = new Set(pdfCodes);
const tsSet = new Set(tsCodes);
const missingInTs = pdfCodes.filter((code) => !tsSet.has(code));
const extraInTs = tsCodes.filter((code) => !pdfSet.has(code));

console.log(`PDF indicator codes: ${pdfCodes.length}`);
console.log(`TS indicator records: ${tsCodes.length}`);
console.log(`Missing in TS: ${missingInTs.length}`);
if (missingInTs.length) console.log(missingInTs.join('\n'));
console.log(`Extra in TS: ${extraInTs.length}`);
if (extraInTs.length) console.log(extraInTs.join('\n'));

if (missingInTs.length) {
  process.exitCode = 1;
}
