import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'fable-output');
const OUT_MD = path.join(OUT_DIR, 'fable-pixel-audit.md');
const OUT_JSON = path.join(OUT_DIR, 'fable-pixel-audit-meta.json');

const FORBIDDEN_PATTERNS = [
  '.env',
  'secret',
  'secrets',
  'credential',
  'credentials',
  'private-key',
  'private_key',
  'token',
  'wallet',
  'payment',
  'stripe',
  'vercel',
];

const ALLOWLIST = {
  weak_prompt: [],
  repo_audit: [
    'README.md',
    'package.json',
    'app/page.tsx',
    'docs/ai/FABLE5_PIXEL_NATIONS_EXPERIMENT_PLAN.md',
  ],
  cursor_prompts: [
    'README.md',
    'package.json',
    'app/page.tsx',
    'docs/ai/FABLE5_PIXEL_NATIONS_EXPERIMENT_PLAN.md',
  ],
};

const TASKS = new Set(Object.keys(ALLOWLIST));

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
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid integer env var ${name}: ${raw}`);
  }
  return parsed;
}

function numberEnv(name, fallback) {
  const raw = env(name, String(fallback));
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid number env var ${name}: ${raw}`);
  }
  return parsed;
}

function estimateTokens(text) {
  // Conservative enough for gating. Real tokenizer can differ.
  return Math.ceil(text.length / 3.6);
}

function isForbidden(filePath) {
  const normalized = filePath.toLowerCase();
  return FORBIDDEN_PATTERNS.some((pattern) => normalized.includes(pattern));
}

async function readAllowedFile(filePath, maxChars = 60000) {
  if (isForbidden(filePath)) {
    throw new Error(`Refusing forbidden file path: ${filePath}`);
  }
  const abs = path.join(ROOT, filePath);
  let content;
  try {
    content = await fs.readFile(abs, 'utf8');
  } catch (error) {
    return `\n\n--- FILE: ${filePath} ---\n[missing or unreadable: ${error.message}]\n`;
  }
  const truncated = content.length > maxChars;
  const safeContent = truncated ? content.slice(0, maxChars) : content;
  return `\n\n--- FILE: ${filePath}${truncated ? ' (TRUNCATED)' : ''} ---\n${safeContent}\n`;
}

async function readIssueEventContext(maxChars = 45000) {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return '';

  let event;
  try {
    const raw = await fs.readFile(eventPath, 'utf8');
    event = JSON.parse(raw);
  } catch (error) {
    return `\n\n--- GITHUB EVENT CONTEXT ---\n[unreadable event payload: ${error.message}]\n`;
  }

  const issue = event?.issue;
  if (!issue || typeof issue !== 'object') return '';

  const title = typeof issue.title === 'string' ? issue.title : '';
  const body = typeof issue.body === 'string' ? issue.body : '';
  if (!title && !body) return '';

  const truncated = body.length > maxChars;
  const safeBody = truncated ? body.slice(0, maxChars) : body;

  return `\n\n--- GITHUB ISSUE CONTEXT ---\nTitle: ${title}\n\nBody:\n${safeBody}${truncated ? '\n\n[issue body truncated]' : ''}\n`;
}

function weakPrompt() {
  return `Create the best possible first playable version of Pixel Nations.

It is a browser game about a persistent world of finite lands where the first explorers claim land, build settlements, form nations and eventually empires. Make it feel ambitious but implementable by a tiny team.

Output:
1. the core fantasy in one sentence,
2. the smallest playable loop,
3. the first 10-minute player experience,
4. what to cut from MVP,
5. the simplest data model,
6. the screen/page list,
7. implementation phases,
8. risks,
9. what Cursor should build first,
10. a self-score from 0 to 10 using this rubric: preserves Pixel Nations fantasy, cuts scope, creates playable loop, first-session clarity, avoids expensive infrastructure, Cursor-ready next step.

At the end write exactly one decision line:
DECISION: PASS_TO_REPO_AUDIT / HOLD_FOR_HUMAN_REVIEW / REJECT_AS_GENERIC

Do not propose blockchain, payments, multiplayer servers, accounts, real-time infrastructure, or huge art systems unless absolutely necessary. Prefer a convincing browser MVP that can be built quickly.`;
}

function repoAuditPrompt(context) {
  return `You are a senior game product director and technical scope cutter reviewing Pixel Nations.

Context:
- It is a Next.js browser game.
- Current direction: a persistent world of 10,000 finite lands. The player claims one land, founds a settlement, raises a nation, and declares an empire. The demo should make the player feel like the first founder in a living world.
- Current implementation already has a landing page and demo flow direction.

Task:
Design the strongest next playable vertical slice that can be built by a tiny team without backend complexity.

Required output:
1. Product verdict: what Pixel Nations is really promising.
2. The one MVP loop that must exist.
3. The exact first-session path, screen by screen.
4. What should be removed or deferred.
5. Minimal state model.
6. UX copy improvements.
7. Implementation milestones.
8. Cursor implementation prompts split into safe small tasks.
9. Acceptance criteria and QA commands.
10. Stop conditions where Cursor should ask instead of decide.
11. A self-score from 0 to 10 on: MVP clarity, scope reduction, first-session clarity, implementation safety, no infrastructure creep.

At the end write exactly one decision line:
DECISION: PASS_TO_CURSOR_PROMPTS / HOLD_FOR_HUMAN_REVIEW / REJECT_AS_SCOPE_CREEP

Constraints:
- No broad refactor.
- No secrets.
- No payments.
- No blockchain.
- No live multiplayer requirement.
- No external paid tools.
- No huge art generation scope.
- Prefer localStorage/mock persistence unless a backend is truly necessary.

Repository context:
${context}`;
}

function cursorPromptSynthesis(context) {
  return `Based on the selected Pixel Nations vertical-slice direction and repository context, write 3 Cursor prompts.

Each prompt must include:
- model/mode recommendation,
- cost level and justification,
- exact allowed files,
- forbidden files/actions,
- safety constraints,
- implementation scope,
- tests,
- validation commands,
- acceptance criteria,
- when Cursor must stop and ask instead of deciding.

Prompts:
1. improve first-session flow and copy,
2. implement one playable loop improvement,
3. add QA evidence/reporting for the new loop.

Do not ask Cursor to refactor everything.
Do not ask Cursor to decide product direction.
Do not include secrets, deployment, payments, blockchain, or broad architecture changes.

At the end write exactly one decision line:
DECISION: READY_FOR_SMALL_CURSOR_TASKS / HOLD_FOR_HUMAN_REVIEW / REJECT_AS_TOO_BROAD

Repository context:
${context}`;
}

async function buildPrompt(taskType) {
  const files = ALLOWLIST[taskType];
  const chunks = [];
  for (const file of files) chunks.push(await readAllowedFile(file));

  const issueContext = await readIssueEventContext();
  if (issueContext) chunks.push(issueContext);

  const context = chunks.join('\n');
  if (taskType === 'weak_prompt') {
    return issueContext ? `${weakPrompt()}\n\nAdditional issue context:\n${issueContext}` : weakPrompt();
  }
  if (taskType === 'repo_audit') return repoAuditPrompt(context);
  if (taskType === 'cursor_prompts') return cursorPromptSynthesis(context);
  throw new Error(`Unsupported task type: ${taskType}`);
}

function extractText(data) {
  const parts = data?.content ?? [];
  return parts
    .filter((part) => part && part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n\n')
    .trim();
}

async function callAnthropic({ apiKey, model, prompt, maxOutputTokens }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxOutputTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Anthropic API failed ${response.status}: ${JSON.stringify(data).slice(0, 2000)}`);
  }
  return data;
}

async function main() {
  const taskType = env('FABLE_TASK_TYPE', 'weak_prompt');
  if (!TASKS.has(taskType)) {
    throw new Error(`Invalid FABLE_TASK_TYPE=${taskType}. Allowed: ${Array.from(TASKS).join(', ')}`);
  }

  const model = env('ANTHROPIC_MODEL', 'claude-fable-5');
  const maxInputTokens = intEnv('MAX_INPUT_TOKENS', taskType === 'weak_prompt' ? 8000 : 25000);
  const maxOutputTokens = intEnv('MAX_OUTPUT_TOKENS', taskType === 'cursor_prompts' ? 6000 : taskType === 'repo_audit' ? 5000 : 4000);
  const inputPricePerMillion = numberEnv('INPUT_PRICE_PER_MILLION_USD', 10);
  const outputPricePerMillion = numberEnv('OUTPUT_PRICE_PER_MILLION_USD', 50);
  const maxEstimatedCost = numberEnv('MAX_ESTIMATED_COST_USD', taskType === 'weak_prompt' ? 0.35 : 0.75);
  const apiKey = requiredEnv('ANTHROPIC_API_KEY');

  const prompt = await buildPrompt(taskType);
  const estimatedInputTokens = estimateTokens(prompt);
  const estimatedMaxCost = (estimatedInputTokens / 1_000_000) * inputPricePerMillion + (maxOutputTokens / 1_000_000) * outputPricePerMillion;

  console.log(`Fable task: ${taskType}`);
  console.log(`Model: ${model}`);
  console.log(`Estimated input tokens: ${estimatedInputTokens}`);
  console.log(`Max output tokens: ${maxOutputTokens}`);
  console.log(`Estimated max cost USD: ${estimatedMaxCost.toFixed(4)}`);

  if (estimatedInputTokens > maxInputTokens) {
    throw new Error(`Input token estimate ${estimatedInputTokens} exceeds cap ${maxInputTokens}`);
  }
  if (estimatedMaxCost > maxEstimatedCost) {
    throw new Error(`Estimated max cost $${estimatedMaxCost.toFixed(4)} exceeds cap $${maxEstimatedCost.toFixed(4)}`);
  }

  const data = await callAnthropic({ apiKey, model, prompt, maxOutputTokens });
  const outputText = extractText(data);
  if (!outputText) throw new Error('Anthropic returned no text content.');

  await fs.mkdir(OUT_DIR, { recursive: true });
  const meta = {
    taskType,
    model,
    estimatedInputTokens,
    maxOutputTokens,
    estimatedMaxCostUsd: Number(estimatedMaxCost.toFixed(6)),
    usage: data.usage ?? null,
    createdAt: new Date().toISOString(),
    allowedFiles: ALLOWLIST[taskType],
    includedIssueContext: Boolean(process.env.GITHUB_EVENT_PATH),
  };

  const report = `# Fable 5 Pixel Nations Audit\n\n` +
    `Task: ${taskType}\n\n` +
    `Model: ${model}\n\n` +
    `Estimated input tokens: ${estimatedInputTokens}\n\n` +
    `Max output tokens: ${maxOutputTokens}\n\n` +
    `Estimated max cost USD: ${estimatedMaxCost.toFixed(4)}\n\n` +
    `Allowed files: ${ALLOWLIST[taskType].length ? ALLOWLIST[taskType].join(', ') : 'none'}\n\n` +
    `---\n\n${outputText}\n`;

  await fs.writeFile(OUT_MD, report, 'utf8');
  await fs.writeFile(OUT_JSON, JSON.stringify(meta, null, 2), 'utf8');
  console.log(`Wrote ${OUT_MD}`);
  console.log(`Wrote ${OUT_JSON}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
