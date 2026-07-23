import fs from 'node:fs';

const FULL_SHA = /^[0-9a-f]{40}$/i;
const FIELD = /^Visual evidence ref:\s*(\S+)\s*$/gim;

export function extractVisualEvidenceRef(body = '') {
  const matches = [...String(body).matchAll(FIELD)].map((match) => match[1]);
  if (matches.length > 1) throw new Error('Visual evidence ref must appear at most once.');
  if (matches.length === 0) return '';
  const value = matches[0];
  if (!FULL_SHA.test(value)) {
    throw new Error('Visual evidence ref must be exactly one full 40-character hexadecimal commit SHA.');
  }
  return value.toLowerCase();
}

export function validateCheckedOutSha(expectedRef, checkedOutSha) {
  if (!expectedRef) return;
  if (!FULL_SHA.test(String(checkedOutSha ?? ''))) throw new Error('Checked-out SHA is unavailable or malformed.');
  if (expectedRef.toLowerCase() !== String(checkedOutSha).toLowerCase()) {
    throw new Error(`Checked-out SHA ${checkedOutSha} does not match Visual evidence ref ${expectedRef}.`);
  }
}

function readIssueBody(eventPath) {
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  return typeof event?.issue?.body === 'string' ? event.issue.body : '';
}

function runSelfTest() {
  const sha = '0123456789abcdef0123456789abcdef01234567';
  const invalid = [
    'main',
    'refs/heads/main',
    '0123456',
    'https://github.com/example/repo/commit/' + sha,
    '../' + sha,
    sha + '/path',
  ];
  if (extractVisualEvidenceRef('No field here') !== '') throw new Error('No-ref behavior changed.');
  if (extractVisualEvidenceRef(`Visual evidence ref: ${sha}`) !== sha) throw new Error('Valid full SHA was not accepted.');
  validateCheckedOutSha(sha, sha.toUpperCase());
  for (const value of invalid) {
    let rejected = false;
    try { extractVisualEvidenceRef(`Visual evidence ref: ${value}`); } catch { rejected = true; }
    if (!rejected) throw new Error(`Malformed or mutable ref was accepted: ${value}`);
  }
  let duplicateRejected = false;
  try { extractVisualEvidenceRef(`Visual evidence ref: ${sha}\nVisual evidence ref: ${sha}`); } catch { duplicateRejected = true; }
  if (!duplicateRejected) throw new Error('Duplicate evidence refs were accepted.');
  let mismatchRejected = false;
  try { validateCheckedOutSha(sha, 'fedcba9876543210fedcba9876543210fedcba98'); } catch { mismatchRejected = true; }
  if (!mismatchRejected) throw new Error('Checkout mismatch was accepted.');
  console.log('Immutable visual evidence ref self-test passed.');
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) {
  runSelfTest();
} else {
  const eventIndex = args.indexOf('--event');
  const shaIndex = args.indexOf('--checked-out-sha');
  if (eventIndex < 0 || !args[eventIndex + 1]) throw new Error('Missing --event <path>.');
  const expected = extractVisualEvidenceRef(readIssueBody(args[eventIndex + 1]));
  const checkedOut = shaIndex >= 0 ? args[shaIndex + 1] : '';
  validateCheckedOutSha(expected, checkedOut);
  console.log(expected ? `Validated immutable visual evidence ref ${expected}.` : 'No visual evidence ref supplied; default-main behavior preserved.');
}
