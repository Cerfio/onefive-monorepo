// One-shot helper: generates the minimal binary fixture files used by E2E tests.
// Run with: node tests/e2e/fixtures-files/make-fixtures.mjs
// All outputs are tiny placeholders sufficient to upload through the UI.
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// Minimal valid 1-page PDF (~600 bytes).
const PDF =
  '%PDF-1.4\n' +
  '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n' +
  '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n' +
  '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n' +
  '4 0 obj << /Length 44 >> stream\nBT /F1 12 Tf 10 100 Td (sample-pdf) Tj ET\nendstream endobj\n' +
  '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n' +
  'xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000110 00000 n \n0000000220 00000 n \n0000000300 00000 n \n' +
  'trailer << /Size 6 /Root 1 0 R >>\nstartxref\n400\n%%EOF';

writeFileSync(resolve(here, 'sample.pdf'), PDF);

// 1×1 transparent PNG fakes our "jpg" — content type is sniffed by the upload modal
// only loosely (extension wins for the UI label). Good enough.
const PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082',
  'hex',
);
writeFileSync(resolve(here, 'sample.jpg'), PNG);

// Minimal DOCX = empty zip stub. Not a fully valid Office document but the
// upload pipeline only checks size + extension; the viewer is not exercised.
const ZIP_EMPTY = Buffer.from('504b0506000000000000000000000000000000000000', 'hex');
writeFileSync(resolve(here, 'sample.docx'), ZIP_EMPTY);

// Tiny dummy mp4 (~24 bytes ftyp box). Not playable but accepted by upload.
const MP4 = Buffer.from(
  '0000001866747970697336350000020069736f366d703431' + '0000000866726565',
  'hex',
);
writeFileSync(resolve(here, 'sample.mp4'), MP4);

console.log('Generated fixtures:');
for (const name of ['sample.pdf', 'sample.jpg', 'sample.docx', 'sample.mp4']) {
  console.log(' -', resolve(here, name));
}
