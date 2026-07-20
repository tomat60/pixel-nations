import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'fable-output');
const OUT_MD = path.join(OUT_DIR, 'fable-issue-directive.md');
const OUT_JSON = path.join(OUT_DIR, 'fable-issue-directive-meta.json');

const SOURCE_FILES = [
  ['README.md', 25000],
  ['package.json', 10000],
  ['docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md', 18000],
  ['docs/ONE_PAGE_PRODUCT_BRIEF.md', 18000],
  ['docs/PRODUCT_SIMPLICITY_DOCTRINE.md', 18000],
  ['docs/PRODUCT_SCOPE_CUT.md', 18000],
  ['docs/contest-build-week-orchestration-note.md', 12000],
  ['app/play/page.tsx', 42000],
  ['app/play/components/TopBar.tsx', 12000],
  ['app/play/components/CurrentObjective.tsx', 18000],
  ['app/play/components/BottomDock.tsx', 10000],
  ['app/play/components/VillageScene.tsx', 38000],
  ['app/play/components/MapStage.tsx', 30000],
  ['app/play/world/WorldMapScene.tsx', 52000],
];

const MAX_VISUAL_FILES = 2;
const MAX_VISUAL_FILE_BYTES = 4_000_000;
const MAX_VISUAL_TOTAL_BYTES = 8_000_000;
const ESTIMATED_TOKENS_PER_VISUAL = 4_000;
const ALLOWED_VISUAL_PREFIXES = ['docs/visual-evidence/', 'public/qa/', 'assets-src/'];
const VISUAL_MEDIA_TYPES = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
]);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function intEnv(name, fallback) {
  const raw = env(name, String(fallback));
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`Invalid integer env var ${name}: ${raw}`);
  return parsed;
}

function numberEnv(name, fallback) {
  const raw = env(name, String(fallback));
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Invalid number env var ${name}: ${raw}`);
  return parsed;
}

function estimateTokens(text) {
  return Math.ceil(text.length / 3.6);
}

async function readText(filePath, maxChars) {
  const abs = path.join(ROOT, filePath);
  try {
    const content = await fs.readFile(abs, 'utf8');
    const truncated = content.length > maxChars;
    const safe = truncated ? content.slice(0, maxChars) : content;
    return `\n\n--- FILE: ${filePath}${truncated ? ' (TRUNCATED)' : ''} ---\n${safe}\n`;
  } catch (error) {
    return `\n\n--- FILE: ${filePath} ---\n[missing or unreadable: ${error.message}]\n`;
  }
}

async function readIssue() {
  const eventPath = requiredEnv('GITHUB_EVENT_PATH');
  const raw = await fs.readFile(eventPath, 'utf8');
  const event = JSON.parse(raw);
  const issue = event?.issue;
  if (!issue || typeof issue !== 'object') throw new Error('Fable Issue Directive requires a GitHub issue event.');

  const title = typeof issue.title === 'string' ? issue.title.trim() : '';
  const body = typeof issue.body === 'string' ? issue.body.trim() : '';
  if (!title.startsWith('FABLE DIRECTIVE:')) throw new Error(`Unexpected issue title: ${title}`);
  if (!body) throw new Error('Issue body is empty.');
  return { number: issue.number, title, body };
}

function extractRequiredOutputContract(body) {
  const match = body.match(/## Required output contract\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!match) throw new Error('Issue must include a `## Required output contract` section.');

  const items = [];
  for (const line of match[1].split('\n')) {
    const item = line.match(/^\s*(\d+)\.\s+(.+?)\s*$/);
    if (item) items.push({ number: item[1], text: item[2] });
  }
  if (items.length === 0) throw new Error('Required output contract must contain a numbered list.');
  return items;
}

function extractVisualEvidencePaths(body) {
  const match = body.match(/## Visual evidence files\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!match) return [];

  const paths = [...new Set(
    [...match[1].matchAll(/`([^`]+\.(?:png|jpe?g|webp))`/gi)].map((entry) => entry[1].trim()),
  )];
  if (paths.length > MAX_VISUAL_FILES) {
    throw new Error(`Too many visual evidence files: ${paths.length} > ${MAX_VISUAL_FILES}`);
  }
  return paths;
}

function normalizeVisualPath(filePath) {
  const normalized = path.posix.normalize(filePath.replace(/^\.\//, ''));
  if (normalized.startsWith('/') || normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Unsafe visual evidence path: ${filePath}`);
  }
  if (!ALLOWED_VISUAL_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    throw new Error(`Visual evidence path outside allowlist: ${normalized}`);
  }
  const extension = path.extname(normalized).toLowerCase();
  const mediaType = VISUAL_MEDIA_TYPES.get(extension);
  if (!mediaType) throw new Error(`Unsupported visual evidence format: ${normalized}`);
  return { normalized, mediaType };
}

async function readVisualEvidence(filePaths) {
  const evidence = [];
  let totalBytes = 0;
  const realRoot = await fs.realpath(ROOT);
  const rootPrefix = `${realRoot}${path.sep}`;

  for (const requestedPath of filePaths) {
    const { normalized, mediaType } = normalizeVisualPath(requestedPath);
    const abs = path.resolve(ROOT, normalized);
    const realPath = await fs.realpath(abs);
    if (realPath !== realRoot && !realPath.startsWith(rootPrefix)) {
      throw new Error(`Visual evidence resolved outside repository: ${normalized}`);
    }
    const stat = await fs.stat(realPath);
    if (!stat.isFile()) throw new Error(`Visual evidence is not a file: ${normalized}`);
    if (stat.size > MAX_VISUAL_FILE_BYTES) {
      throw new Error(`Visual evidence file too large: ${normalized} (${stat.size} bytes)`);
    }
    totalBytes += stat.size;
    if (totalBytes > MAX_VISUAL_TOTAL_BYTES) {
      throw new Error(`Visual evidence total too large: ${totalBytes} bytes`);
    }
    const bytes = await fs.readFile(realPath);
    evidence.push({ filePath: normalized, mediaType, base64: bytes.toString('base64'), sizeBytes: stat.size });
  }
  return evidence;
}

function buildPrompt({ issue, contractItems, repositoryContext, visualEvidence }) {
  const exactHeadings = contractItems.map((item) => `## ${item.number}. ${item.text}`).join('\n');
  const visualInstruction = visualEvidence.length
    ? `ACTUAL VISUAL EVIDENCE\n- ${visualEvidence.length} repository-local image(s) are attached as image blocks after this text.\n- Inspect them directly. You may make visual observations grounded in those images.\n- Refer to them by repository path: ${visualEvidence.map((item) => item.filePath).join(', ')}.\n- Do not claim access to any image not attached in this request.`
    : 'ACTUAL VISUAL EVIDENCE\n- No image blocks were supplied. Do not claim direct visual inspection.';

  return `You are Fable, a delegated product, UX and visual-strategy consultant inside a GPT-5.6-led Pixel Nations development system.

AUTHORITY AND ROLE
- GPT-5.6 is the project-level co-creator, product lead, creative director, technical strategist and final reviewer.
- You are a high-value specialist consultant. You do not write repository code, choose merges, or replace the binding task with your preferred generic template.
- The GitHub issue below is the binding task contract. Its explicit deliverables, order, labels, constraints and stop condition override generic advice.
- Current product source of truth is the active /play route, Sector A-01 / Aurelian Basin, and the loop land -> settlement/city -> nation -> empire.
- Do not revive stale /dashboard, /settlement, /nation, /empire or legacy /world route architecture.

EXECUTION RULES
1. Read the entire binding issue before answering.
2. Complete every item in the Required output contract, in the same order.
3. Use the following exact Markdown headings; do not rename, merge, skip or replace them:
${exactHeadings}
4. Answer the actual issue. Do not substitute the old generic three-Cursor-prompts template unless the issue explicitly requests exactly that.
5. Ground recommendations in the supplied current repository context and attached visual evidence. Distinguish what exists now from what you propose.
6. Keep suggestions bounded, reviewable and realistic for the stated deadline.
7. Mark uncertain claims as inferences. Claim direct visual inspection only for attached image blocks.
8. If a deliverable cannot be completed, keep its exact heading and write INCOMPLETE with the precise missing information. Do not silently omit it.
9. Do not propose crypto, NFT, wallet, mint, token, pay-to-win, backend expansion, multiplayer, a new rendering engine or a large asset pipeline unless the issue explicitly reopens that direction.
10. End with the exact compliance block defined below.

${visualInstruction}

BINDING GITHUB ISSUE
Title: ${issue.title}

${issue.body}

CURRENT REPOSITORY CONTEXT
${repositoryContext}

MANDATORY ENDING
## COMPLIANCE CHECK
- Binding issue followed: YES or NO
- Every requested deliverable completed: YES or NO
- Exact required headings preserved: YES or NO
- Current /play source used: YES or NO
- Constraints and stop condition respected: YES or NO
DECISION: READY_FOR_GPT56_REVIEW / INCOMPLETE_RETRY_REQUIRED / HOLD_FOR_SCOPE_CLARIFICATION`;
}

function extractText(data) {
  return (data?.content ?? [])
    .filter((part) => part?.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n\n')
    .trim();
}

function validateOutput(output, contractItems, stopReason) {
  const failures = [];
  if (stopReason === 'max_tokens') failures.push('model stopped at max_tokens');
  if (output.length < 1500) failures.push(`output too short (${output.length} characters)`);

  for (const item of contractItems) {
    const exactHeading = `## ${item.number}. ${item.text}`;
    if (!output.includes(exactHeading)) failures.push(`missing exact heading: ${exactHeading}`);
  }

  const requiredMarkers = [
    '## COMPLIANCE CHECK',
    '- Binding issue followed: YES',
    '- Every requested deliverable completed: YES',
    '- Exact required headings preserved: YES',
    '- Current /play source used: YES',
    '- Constraints and stop condition respected: YES',
    'DECISION: READY_FOR_GPT56_REVIEW',
  ];
  for (const marker of requiredMarkers) {
    if (!output.includes(marker)) failures.push(`missing compliance marker: ${marker}`);
  }
  return failures;
}

async function callAnthropic({ apiKey, model, prompt, visualEvidence, maxOutputTokens }) {
  const content = [
    { type: 'text', text: prompt },
    ...visualEvidence.map((item) => ({
      type: 'image',
      source: { type: 'base64', media_type: item.mediaType, data: item.base64 },
    })),
  ];
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens: maxOutputTokens, messages: [{ role: 'user', content }] }),
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }
  if (!response.ok) throw new Error(`Anthropic API failed ${response.status}: ${JSON.stringify(data).slice(0, 2000)}`);
  return data;
}

async function writeResult({ issue, contractItems, model, data, output, visualEvidence, estimatedInputTokens, maxOutputTokens, estimatedMaxCost, failures }) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const passed = failures.length === 0;
  const meta = {
    issueNumber: issue.number,
    issueTitle: issue.title,
    model,
    stopReason: data.stop_reason ?? null,
    estimatedInputTokens,
    maxOutputTokens,
    estimatedMaxCostUsd: Number(estimatedMaxCost.toFixed(6)),
    usage: data.usage ?? null,
    requiredOutputContract: contractItems,
    sourceFiles: SOURCE_FILES.map(([filePath]) => filePath),
    visualEvidence: visualEvidence.map(({ filePath, mediaType, sizeBytes }) => ({ filePath, mediaType, sizeBytes })),
    validation: passed ? 'passed' : 'rejected',
    validationFailures: failures,
    createdAt: new Date().toISOString(),
  };
  const failureSection = passed ? '' : `\n\n## VALIDATION FAILURES\n${failures.map((failure) => `- ${failure}`).join('\n')}\n`;
  const report = `# Fable Issue Directive\n\nIssue: #${issue.number} — ${issue.title}\n\nModel: ${model}\n\nValidation: ${passed ? 'PASSED' : 'REJECTED'}${failureSection}\n\n---\n\n${output || '[no text output returned]'}\n`;
  await fs.writeFile(OUT_MD, report, 'utf8');
  await fs.writeFile(OUT_JSON, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUT_MD}`);
  console.log(`Wrote ${OUT_JSON}`);
}

async function main() {
  const issue = await readIssue();
  const contractItems = extractRequiredOutputContract(issue.body);
  const visualPaths = extractVisualEvidencePaths(issue.body);
  const visualEvidence = await readVisualEvidence(visualPaths);
  const chunks = [];
  for (const [filePath, maxChars] of SOURCE_FILES) chunks.push(await readText(filePath, maxChars));
  const repositoryContext = chunks.join('\n');

  const model = env('ANTHROPIC_MODEL', 'claude-fable-5');
  const maxInputTokens = intEnv('MAX_INPUT_TOKENS', 70000);
  const maxOutputTokens = intEnv('MAX_OUTPUT_TOKENS', 15000);
  const maxEstimatedCost = numberEnv('MAX_ESTIMATED_COST_USD', 1.5);
  const inputPricePerMillion = numberEnv('INPUT_PRICE_PER_MILLION_USD', 10);
  const outputPricePerMillion = numberEnv('OUTPUT_PRICE_PER_MILLION_USD', 50);
  const apiKey = requiredEnv('ANTHROPIC_API_KEY');

  const prompt = buildPrompt({ issue, contractItems, repositoryContext, visualEvidence });
  const estimatedInputTokens = estimateTokens(prompt) + visualEvidence.length * ESTIMATED_TOKENS_PER_VISUAL;
  const estimatedMaxCost = (estimatedInputTokens / 1_000_000) * inputPricePerMillion + (maxOutputTokens / 1_000_000) * outputPricePerMillion;

  console.log(`Fable directive issue: #${issue.number}`);
  console.log(`Model: ${model}`);
  console.log(`Required output items: ${contractItems.length}`);
  console.log(`Visual evidence files: ${visualEvidence.length ? visualEvidence.map((item) => item.filePath).join(', ') : 'none'}`);
  console.log(`Estimated input tokens: ${estimatedInputTokens}`);
  console.log(`Max output tokens: ${maxOutputTokens}`);
  console.log(`Estimated max cost USD: ${estimatedMaxCost.toFixed(4)}`);

  if (estimatedInputTokens > maxInputTokens) throw new Error(`Input token estimate ${estimatedInputTokens} exceeds cap ${maxInputTokens}`);
  if (estimatedMaxCost > maxEstimatedCost) throw new Error(`Estimated max cost $${estimatedMaxCost.toFixed(4)} exceeds cap $${maxEstimatedCost.toFixed(4)}`);

  const data = await callAnthropic({ apiKey, model, prompt, visualEvidence, maxOutputTokens });
  const output = extractText(data);
  const failures = validateOutput(output, contractItems, data.stop_reason ?? null);
  await writeResult({ issue, contractItems, model, data, output, visualEvidence, estimatedInputTokens, maxOutputTokens, estimatedMaxCost, failures });
  if (failures.length) throw new Error(`Fable directive output failed validation:\n- ${failures.join('\n- ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
