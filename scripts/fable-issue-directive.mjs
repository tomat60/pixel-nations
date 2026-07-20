import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'fable-output');
const OUT_MD = path.join(OUT_DIR, 'fable-issue-directive.md');
const OUT_JSON = path.join(OUT_DIR, 'fable-issue-directive-meta.json');

const MODES = new Set(['strategy', 'asset_review', 'temporal_review', 'implementation_handoff']);
const PROFILES = new Set(['general', 'village-v2', 'legacy']);
const ASSET_GATE_SENTENCE = 'No Village V2 integration work may begin until a committed 2048×1152 developed master and same-camera shelter proof have both passed GPT-5.6 and Fable asset review.';

const GENERAL_SOURCE_FILES = [
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

const VILLAGE_V2_SOURCE_FILES = [
  ['docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md', 12000],
  ['docs/village-v2/PRODUCTION_CONTRACT.md', 24000],
  ['docs/village-v2/LEGACY_CONTEXT_SUMMARY.md', 8000],
  ['docs/village-v2/QUARANTINE.md', 10000],
  ['app/play/visual/village-v2/VillageStageV2.tsx', 12000],
  ['app/play/visual/village-v2/village-layer-manifest.ts', 12000],
];

const LEGACY_SOURCE_FILES = [
  ...VILLAGE_V2_SOURCE_FILES,
  ['app/play/components/VillageScene.tsx', 38000],
];

const MAX_VISUAL_FILES = 4;
const MAX_VISUAL_FILE_BYTES = 4_000_000;
const MAX_VISUAL_TOTAL_BYTES = 16_000_000;
const ESTIMATED_TOKENS_PER_VISUAL = 4_000;
const ALLOWED_VISUAL_PREFIXES = ['docs/visual-evidence/', 'docs/village-v2/assets/', 'public/qa/', 'assets-src/'];
const VISUAL_MEDIA_TYPES = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
]);

let LAST_CONTEXT = { issue: null, mode: null, profile: null, sourceFiles: [], resultWritten: false };

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function boolEnv(name, fallback = false) {
  const raw = env(name, String(fallback)).toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
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

async function readIssueEvent() {
  const eventPath = requiredEnv('GITHUB_EVENT_PATH');
  const raw = await fs.readFile(eventPath, 'utf8');
  const event = JSON.parse(raw);
  const issue = event?.issue;
  if (!issue || typeof issue !== 'object') throw new Error('Fable Issue Directive requires a GitHub issue event.');

  const title = typeof issue.title === 'string' ? issue.title.trim() : '';
  const body = typeof issue.body === 'string' ? issue.body.trim() : '';
  if (!/^FABLE DIRECTIVE(?::|\s*\[)/.test(title)) throw new Error(`Unexpected issue title: ${title}`);
  if (!body) throw new Error('Issue body is empty.');
  return { number: issue.number ?? 0, title, body };
}

function extractEnum(body, label, allowed, fallback) {
  const match = body.match(new RegExp(`^${label}:\\s*([\\w-]+)\\s*$`, 'mi'));
  const value = match?.[1] ?? fallback;
  if (!allowed.has(value)) throw new Error(`Invalid ${label}: ${value}. Allowed: ${[...allowed].join(', ')}`);
  return value;
}

function selectSourceFiles(profile) {
  if (profile === 'village-v2') return VILLAGE_V2_SOURCE_FILES;
  if (profile === 'legacy') return LEGACY_SOURCE_FILES;
  return GENERAL_SOURCE_FILES;
}

function extractRequiredOutputContract(body) {
  const match = body.match(/## Required output(?: contract)?\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!match) throw new Error('Issue must include a `## Required output contract` or legacy `## Required output` section.');

  const items = [];
  for (const line of match[1].split('\n')) {
    const item = line.match(/^\s*(\d+)\.\s+(.+?)\s*$/);
    if (item) items.push({ number: item[1], text: item[2] });
  }
  if (items.length === 0) throw new Error('Required output section must contain a numbered list.');
  return items;
}

function extractVisualEvidencePaths(body) {
  const match = body.match(/## Visual evidence files\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!match) return [];
  const paths = [...new Set([...match[1].matchAll(/`([^`]+\.(?:png|jpe?g|webp))`/gi)].map((entry) => entry[1].trim()))];
  if (paths.length > MAX_VISUAL_FILES) throw new Error(`Too many visual evidence files: ${paths.length} > ${MAX_VISUAL_FILES}`);
  return paths;
}

function cleanValue(value) {
  return value.trim().replace(/^`|`$/g, '');
}

function extractVisualMetadata(body) {
  const match = body.match(/## Visual evidence metadata\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  if (!match) return [];
  const records = [];
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.trim();
    if (!line.startsWith('- ')) continue;
    const record = {};
    for (const segment of line.slice(2).split('|')) {
      const [rawKey, ...rest] = segment.split('=');
      if (!rawKey || rest.length === 0) continue;
      record[rawKey.trim()] = cleanValue(rest.join('='));
    }
    if (Object.keys(record).length) records.push(record);
  }
  return records;
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
  return { normalized, mediaType, extension };
}

function readPngDimensions(bytes) {
  if (bytes.length < 24 || bytes.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function readWebpDimensions(bytes) {
  if (bytes.length < 30 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = bytes.toString('ascii', 12, 16);
  const p = 20;
  if (chunk === 'VP8X' && bytes.length >= 30) {
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  }
  if (chunk === 'VP8 ' && bytes.length >= p + 10 && bytes[p + 3] === 0x9d && bytes[p + 4] === 0x01 && bytes[p + 5] === 0x2a) {
    return { width: bytes.readUInt16LE(p + 6) & 0x3fff, height: bytes.readUInt16LE(p + 8) & 0x3fff };
  }
  if (chunk === 'VP8L' && bytes.length >= p + 5 && bytes[p] === 0x2f) {
    const b1 = bytes[p + 1];
    const b2 = bytes[p + 2];
    const b3 = bytes[p + 3];
    const b4 = bytes[p + 4];
    return { width: 1 + b1 + ((b2 & 0x3f) << 8), height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10) };
  }
  return null;
}

function readJpegDimensions(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1];
    const size = bytes.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    if (!Number.isFinite(size) || size < 2) break;
    offset += 2 + size;
  }
  return null;
}

function readImageDimensions(bytes, extension) {
  if (extension === '.png') return readPngDimensions(bytes);
  if (extension === '.webp') return readWebpDimensions(bytes);
  return readJpegDimensions(bytes);
}

async function readVisualEvidence(filePaths) {
  const evidence = [];
  let totalBytes = 0;
  const realRoot = await fs.realpath(ROOT);
  const rootPrefix = `${realRoot}${path.sep}`;
  for (const requestedPath of filePaths) {
    const { normalized, mediaType, extension } = normalizeVisualPath(requestedPath);
    const abs = path.resolve(ROOT, normalized);
    const realPath = await fs.realpath(abs);
    if (realPath !== realRoot && !realPath.startsWith(rootPrefix)) throw new Error(`Visual evidence resolved outside repository: ${normalized}`);
    const stat = await fs.stat(realPath);
    if (!stat.isFile()) throw new Error(`Visual evidence is not a file: ${normalized}`);
    if (stat.size > MAX_VISUAL_FILE_BYTES) throw new Error(`Visual evidence file too large: ${normalized} (${stat.size} bytes)`);
    totalBytes += stat.size;
    if (totalBytes > MAX_VISUAL_TOTAL_BYTES) throw new Error(`Visual evidence total too large: ${totalBytes} bytes`);
    const bytes = await fs.readFile(realPath);
    const dimensions = readImageDimensions(bytes, extension);
    if (!dimensions) throw new Error(`Could not read native dimensions for visual evidence: ${normalized}`);
    evidence.push({ filePath: normalized, mediaType, base64: bytes.toString('base64'), sizeBytes: stat.size, dimensions });
  }
  return evidence;
}

function validatePrerequisites(mode, body) {
  const reasons = [];
  if (mode === 'temporal_review' && !/^PREREQUISITE_ASSET_REVIEW:\s*PASS\s*@\s*\S+/mi.test(body)) {
    reasons.push('temporal_review requires `PREREQUISITE_ASSET_REVIEW: PASS @ <artifact-or-sha>`');
  }
  if (mode === 'implementation_handoff') {
    if (!/^PREREQUISITE_ASSET_REVIEW:\s*PASS\s*@\s*\S+/mi.test(body)) reasons.push('implementation_handoff requires asset-review PASS reference');
    if (!/^PREREQUISITE_TEMPORAL_REVIEW:\s*PASS\s*@\s*\S+/mi.test(body)) reasons.push('implementation_handoff requires temporal-review PASS reference');
  }
  return reasons;
}

function validateAssetReviewEvidence(mode, evidence, metadata) {
  if (mode !== 'asset_review') return [];
  const reasons = [];
  const requiredRoles = ['developed-master', 'master-1x-crop', 'shelter', 'v1-baseline'];
  const byRole = new Map(metadata.map((record) => [record.role, record]));
  for (const role of requiredRoles) if (!byRole.has(role)) reasons.push(`missing metadata role: ${role}`);
  const requiredFields = ['role', 'path', 'dimensions', 'bytes', 'sha', 'capture', 'scale', 'camera', 'stage'];
  for (const record of metadata) {
    for (const field of requiredFields) if (!record[field]) reasons.push(`metadata role ${record.role ?? '[unknown]'} missing field: ${field}`);
    const file = evidence.find((item) => item.filePath === record.path);
    if (!file) { reasons.push(`metadata path not attached: ${record.path ?? '[missing]'}`); continue; }
    const declaredDimensions = record.dimensions?.match(/^(\d+)x(\d+)$/i);
    if (!declaredDimensions) reasons.push(`invalid dimensions for ${record.role}: ${record.dimensions}`);
    else if (Number(declaredDimensions[1]) !== file.dimensions.width || Number(declaredDimensions[2]) !== file.dimensions.height) {
      reasons.push(`native dimension mismatch for ${record.role}: declared ${record.dimensions}, actual ${file.dimensions.width}x${file.dimensions.height}`);
    }
    if (Number(record.bytes) !== file.sizeBytes) reasons.push(`byte-size mismatch for ${record.role}: declared ${record.bytes}, actual ${file.sizeBytes}`);
  }
  const master = byRole.get('developed-master');
  if (master) {
    const match = master.dimensions?.match(/^(\d+)x(\d+)$/i);
    if (!match || Number(match[1]) < 2048 || Number(match[2]) < 1152) reasons.push('developed master must be at least 2048x1152 native pixels');
    if (!Number.isFinite(Number(master.bytes)) || Number(master.bytes) <= 50_000) reasons.push('developed master claimed as production art must be larger than 50 KB');
  }
  const developedCamera = byRole.get('developed-master')?.camera;
  const shelterCamera = byRole.get('shelter')?.camera;
  if (developedCamera && shelterCamera && developedCamera !== shelterCamera) reasons.push(`camera registration mismatch: master=${developedCamera}, shelter=${shelterCamera}`);
  if (evidence.length !== 4) reasons.push(`asset_review requires exactly four images; received ${evidence.length}`);
  return [...new Set(reasons)];
}

function evidenceMetadataText(metadata, evidence) {
  if (!metadata.length) return '- No structured metadata supplied.';
  return metadata.map((record) => {
    const actual = evidence.find((item) => item.filePath === record.path);
    const actualText = actual ? `actual=${actual.dimensions.width}x${actual.dimensions.height}/${actual.sizeBytes}B` : 'actual=unavailable';
    return `- ${record.role ?? 'unknown'}: ${record.path ?? 'missing'} | declared=${record.dimensions ?? 'missing'}/${record.bytes ?? 'missing'}B | ${actualText} | sha=${record.sha ?? 'missing'} | capture=${record.capture ?? 'missing'} | scale=${record.scale ?? 'missing'} | camera=${record.camera ?? 'missing'} | stage=${record.stage ?? 'missing'}`;
  }).join('\n');
}

function buildPrompt({ issue, contractItems, repositoryContext, visualEvidence, visualMetadata, mode, profile }) {
  const exactHeadings = contractItems.map((item) => `## ${item.number}. ${item.text}`).join('\n');
  const provenance = evidenceMetadataText(visualMetadata, visualEvidence);
  const visualInstruction = visualEvidence.length
    ? `ACTUAL VISUAL EVIDENCE\n- ${visualEvidence.length} repository-local image(s) are attached after this text.\n- Inspect only these attached images directly.\n- Every visual finding must begin with an exact \`## EVIDENCE PROVENANCE\` block.\n${provenance}`
    : 'ACTUAL VISUAL EVIDENCE\n- No image blocks were supplied. Do not claim direct visual inspection.';
  const legacyWarning = profile === 'legacy'
    ? 'LEGACY PROFILE WARNING: VillageScene.tsx is supplied only for fallback mechanics and QA. Its SVG/CSS visual language is forbidden as Village V2 art direction.'
    : '';

  return `You are Fable, a delegated product, UX and visual-strategy consultant inside a GPT-5.6-led Pixel Nations development system.

FABLE MODE: ${mode}
CONTEXT PROFILE: ${profile}
${legacyWarning}

AUTHORITY AND ROLE
- GPT-5.6 is the project-level co-creator, product lead, creative director, technical strategist and final reviewer.
- The GitHub issue below is the binding task contract.
- The repository file docs/visual-evidence/village-v2-approved-direction.webp is a 450x200 comparison fixture only. Never recommend scaling, cropping, importing or extracting it as production art.
- ${ASSET_GATE_SENTENCE}

MODE RULES
- strategy: create direction/contracts only; never authorize implementation.
- asset_review: verdict only (PASS, FAIL or HOLD_NO_IMPLEMENTATION); never provide implementation steps.
- temporal_review: review genuine cumulative art deltas only after a declared asset-review PASS.
- implementation_handoff: integration-only handoff after declared asset and temporal PASS references; repeat the asset gate sentence verbatim.

EXECUTION RULES
1. Read the entire binding issue before answering.
2. Complete every numbered item in order, with these exact headings:\n${exactHeadings}
3. Ground recommendations in selected repository context and attached evidence.
4. Mark uncertain claims as inferences.
5. Do not propose crypto, backend expansion, multiplayer, a new rendering engine or a large asset pipeline unless explicitly reopened.
6. Do not use V1 SVG/CSS primitives, filters, snapshot reuse, glows, blobs, dots, stripes or full-frame crossfades as substitutes for missing Village V2 art.
7. End with the exact compliance block below. A valid HOLD_NO_IMPLEMENTATION is allowed.

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
DECISION: READY_FOR_GPT56_REVIEW / INCOMPLETE_RETRY_REQUIRED / HOLD_FOR_SCOPE_CLARIFICATION / HOLD_NO_IMPLEMENTATION`;
}

function extractText(data) {
  return (data?.content ?? []).filter((part) => part?.type === 'text' && typeof part.text === 'string').map((part) => part.text).join('\n\n').trim();
}

function validateOutput(output, contractItems, stopReason, mode, visualEvidence) {
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
  ];
  for (const marker of requiredMarkers) if (!output.includes(marker)) failures.push(`missing compliance marker: ${marker}`);
  if (!/DECISION: (READY_FOR_GPT56_REVIEW|HOLD_NO_IMPLEMENTATION)/.test(output)) failures.push('missing valid final decision');
  if (visualEvidence.length && !output.includes('## EVIDENCE PROVENANCE')) failures.push('visual report missing EVIDENCE PROVENANCE block');
  const hold = output.includes('HOLD_NO_IMPLEMENTATION');
  const authorizes = /\b(begin|start|authorize|dispatch|open)\b.{0,50}\b(implementation|integration|executor|pull request|PR)\b/i.test(output);
  if (hold && authorizes) failures.push('output contradicts HOLD_NO_IMPLEMENTATION with implementation authorization');
  if (mode === 'strategy' && authorizes) failures.push('strategy mode may not authorize implementation');
  if (mode === 'asset_review' && authorizes) failures.push('asset_review mode may not provide implementation authorization');
  if (mode === 'implementation_handoff' && !output.includes(ASSET_GATE_SENTENCE)) failures.push('implementation_handoff omitted verbatim asset gate');
  return failures;
}

async function callAnthropic({ apiKey, model, prompt, visualEvidence, maxOutputTokens }) {
  const content = [{ type: 'text', text: prompt }, ...visualEvidence.map((item) => ({ type: 'image', source: { type: 'base64', media_type: item.mediaType, data: item.base64 } }))];
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: maxOutputTokens, messages: [{ role: 'user', content }] }),
  });
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = { raw }; }
  if (!response.ok) throw new Error(`Anthropic API failed ${response.status}: ${JSON.stringify(data).slice(0, 2000)}`);
  return data;
}

async function writeArtifact({ issue, mode, profile, sourceFiles, contractItems = [], model = null, data = {}, output = '', visualEvidence = [], visualMetadata = [], estimatedInputTokens = null, maxOutputTokens = null, estimatedMaxCost = null, failures = [], resultClass }) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const validation = failures.length ? 'rejected' : 'passed';
  const meta = {
    issueNumber: issue?.number ?? null,
    issueTitle: issue?.title ?? null,
    mode,
    contextProfile: profile,
    model,
    stopReason: data?.stop_reason ?? null,
    estimatedInputTokens,
    maxOutputTokens,
    estimatedMaxCostUsd: estimatedMaxCost === null ? null : Number(estimatedMaxCost.toFixed(6)),
    usage: data?.usage ?? null,
    requiredOutputContract: contractItems,
    sourceFiles: sourceFiles.map(([filePath]) => filePath),
    visualEvidence: visualEvidence.map(({ filePath, mediaType, sizeBytes, dimensions }) => ({ filePath, mediaType, sizeBytes, dimensions })),
    visualMetadata,
    resultClass,
    validation,
    validationFailures: failures,
    createdAt: new Date().toISOString(),
  };
  const failureSection = failures.length ? `\n\n## VALIDATION FAILURES\n${failures.map((failure) => `- ${failure}`).join('\n')}\n` : '';
  const report = `# Fable Issue Directive\n\nIssue: #${issue?.number ?? 'unknown'} — ${issue?.title ?? 'unavailable'}\n\nMode: ${mode ?? 'unavailable'}\n\nContext profile: ${profile ?? 'unavailable'}\n\nModel: ${model ?? 'not called'}\n\nResult class: ${resultClass}\n\nValidation: ${validation.toUpperCase()}${failureSection}\n\n---\n\n${output || '[no text output returned]'}\n`;
  await fs.writeFile(OUT_MD, report, 'utf8');
  await fs.writeFile(OUT_JSON, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  LAST_CONTEXT.resultWritten = true;
  console.log(`Wrote ${OUT_MD}`);
  console.log(`Wrote ${OUT_JSON}`);
}

async function main() {
  const issue = await readIssueEvent();
  LAST_CONTEXT.issue = issue;
  const mode = extractEnum(issue.body, 'FABLE_MODE', MODES, 'strategy');
  const profile = extractEnum(issue.body, 'CONTEXT_PROFILE', PROFILES, 'general');
  const sourceFiles = selectSourceFiles(profile);
  LAST_CONTEXT = { issue, mode, profile, sourceFiles, resultWritten: false };
  const contractItems = extractRequiredOutputContract(issue.body);
  const visualPaths = extractVisualEvidencePaths(issue.body);
  const visualMetadata = extractVisualMetadata(issue.body);
  const visualEvidence = await readVisualEvidence(visualPaths);
  const holdReasons = [
    ...validatePrerequisites(mode, issue.body),
    ...validateAssetReviewEvidence(mode, visualEvidence, visualMetadata),
  ];
  if (holdReasons.length) {
    const output = `## HOLD_NO_IMPLEMENTATION\n${holdReasons.map((reason) => `- ${reason}`).join('\n')}\n\nNo Anthropic call was made. Correct the evidence package and open/edit the directive again.\n\n## COMPLIANCE CHECK\n- Binding issue followed: YES\n- Every requested deliverable completed: YES\n- Exact required headings preserved: YES\n- Current /play source used: YES\n- Constraints and stop condition respected: YES\nDECISION: HOLD_NO_IMPLEMENTATION`;
    await writeArtifact({ issue, mode, profile, sourceFiles, contractItems, output, visualEvidence, visualMetadata, resultClass: 'HOLD_NO_IMPLEMENTATION' });
    return;
  }

  const chunks = [];
  for (const [filePath, maxChars] of sourceFiles) chunks.push(await readText(filePath, maxChars));
  const repositoryContext = chunks.join('\n');
  const model = env('ANTHROPIC_MODEL', 'claude-fable-5');
  const maxInputTokens = intEnv('MAX_INPUT_TOKENS', 70000);
  const maxOutputTokens = intEnv('MAX_OUTPUT_TOKENS', 15000);
  const maxEstimatedCost = numberEnv('MAX_ESTIMATED_COST_USD', 1.5);
  const inputPricePerMillion = numberEnv('INPUT_PRICE_PER_MILLION_USD', 10);
  const outputPricePerMillion = numberEnv('OUTPUT_PRICE_PER_MILLION_USD', 50);
  const prompt = buildPrompt({ issue, contractItems, repositoryContext, visualEvidence, visualMetadata, mode, profile });
  const estimatedInputTokens = estimateTokens(prompt) + visualEvidence.length * ESTIMATED_TOKENS_PER_VISUAL;
  const estimatedMaxCost = (estimatedInputTokens / 1_000_000) * inputPricePerMillion + (maxOutputTokens / 1_000_000) * outputPricePerMillion;
  if (estimatedInputTokens > maxInputTokens) throw new Error(`Input token estimate ${estimatedInputTokens} exceeds cap ${maxInputTokens}`);
  if (estimatedMaxCost > maxEstimatedCost) throw new Error(`Estimated max cost $${estimatedMaxCost.toFixed(4)} exceeds cap $${maxEstimatedCost.toFixed(4)}`);

  if (boolEnv('FABLE_PREFLIGHT_ONLY')) {
    const output = `## PREFLIGHT VALIDATED\n- Mode: ${mode}\n- Context profile: ${profile}\n- Source files: ${sourceFiles.map(([filePath]) => filePath).join(', ')}\n- Visual evidence count: ${visualEvidence.length}\n- Estimated input tokens: ${estimatedInputTokens}\n- Estimated max cost USD: ${estimatedMaxCost.toFixed(4)}\n\nNo Anthropic call was made.`;
    await writeArtifact({ issue, mode, profile, sourceFiles, contractItems, model, output, visualEvidence, visualMetadata, estimatedInputTokens, maxOutputTokens, estimatedMaxCost, resultClass: 'DRY_RUN_VALIDATED' });
    return;
  }

  const apiKey = requiredEnv('ANTHROPIC_API_KEY');
  const data = await callAnthropic({ apiKey, model, prompt, visualEvidence, maxOutputTokens });
  const output = extractText(data);
  const failures = validateOutput(output, contractItems, data.stop_reason ?? null, mode, visualEvidence);
  await writeArtifact({ issue, mode, profile, sourceFiles, contractItems, model, data, output, visualEvidence, visualMetadata, estimatedInputTokens, maxOutputTokens, estimatedMaxCost, failures, resultClass: failures.length ? 'MODEL_OUTPUT_REJECTED' : 'VALIDATED_FABLE_OUTPUT' });
  if (failures.length) throw new Error(`Fable directive output failed validation:\n- ${failures.join('\n- ')}`);
}

main().catch(async (error) => {
  console.error(error);
  if (!LAST_CONTEXT.resultWritten) {
    try {
      await writeArtifact({
        issue: LAST_CONTEXT.issue,
        mode: LAST_CONTEXT.mode,
        profile: LAST_CONTEXT.profile,
        sourceFiles: LAST_CONTEXT.sourceFiles,
        output: `## PREFLIGHT FAILURE\n- ${error.message}\n\nNo Anthropic call was completed.`,
        failures: [error.message],
        resultClass: 'PREFLIGHT_FAILURE',
      });
    } catch (artifactError) {
      console.error(`Failed to write preflight artifact: ${artifactError.message}`);
    }
  }
  process.exitCode = 1;
});
