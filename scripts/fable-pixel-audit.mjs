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
  full_play_redesign: [
    'README.md',
    'package.json',
    'app/page.tsx',
    'app/world/page.tsx',
    'app/dashboard/page.tsx',
    'app/settlement/page.tsx',
    'app/nation/page.tsx',
    'app/empire/page.tsx',
    'app/lib/game-state.ts',
    'app/lib/settlement-state.ts',
    'docs/product/ONE_PAGE_PRODUCT_BRIEF.md',
    'docs/product/PRODUCT_SIMPLICITY_DOCTRINE.md',
    'docs/product/PRODUCT_SCOPE_CUT.md',
    'docs/world/WORLD_MAP_V7_SPEC.md',
    'docs/ai/AI_COST_CONTROL_CODEX.md',
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

function fullPlayRedesignPrompt(context) {
  return `You are the elite AI-native game director, product lead, UX architect, art director, frontend strategist, QA lead, and scope cutter for Pixel Nations.

Important correction:
PR #50 proved a First Age loop, but failed the target. It created a fullscreen shell, yet the map felt like an abstract command board instead of an illustrated world. The product target is NOT separate pages with a map page. The target is one fullscreen game where the map is the primary play surface.

Core fantasy:
One land can become an empire. The world has 10,000 finite lands. The current demo focuses on Sector A-01 / Aurelian Basin. Simple first. Deep later.

Target experience:
- One fullscreen illustrated map game.
- The player chooses and claims a land on a beautiful, readable strategy map.
- The player issues one meaningful order per season.
- The map visibly changes as land is claimed, developed, secured, and expanded.
- Dashboard, settlement, nation, and empire are not primary separate experiences. They should become modes, panels, overlays, drawers, tabs, or sub-states inside the fullscreen map game shell.
- The experience should look closer to a premium mobile strategy game mockup than a website dashboard.

Visual north star:
A rich stylized strategy map with landmass, rivers, mountains, forests, coast, ruins, roads/paths, owned region outlines, banner identity, bottom navigation, order cards, log/consequences, and clear next action.

Hard constraints:
- No crypto, wallet, token, mint, NFT, payment, or pay-to-win direction.
- No backend dependency for this sprint.
- No multiplayer requirement.
- No complex city builder yet.
- No combat system yet.
- No huge asset pipeline.
- Prefer deterministic mock/local state.
- Bold prototype is allowed, but it must be bounded and shippable as a branch/PR.

Output required:
1. Brutal product verdict on current direction and PR #50.
2. Final Play architecture for one fullscreen map game.
3. How /dashboard, /settlement, /nation, and /empire should be absorbed into the map shell.
4. Map art direction: layout, terrain, visual hierarchy, regions, icons, interaction states.
5. First 10-minute player experience, step by step.
6. The smallest playable loop that actually feels like a game.
7. State model for the prototype.
8. What to salvage from existing repo and PR #50.
9. What to delete, ignore, or postpone.
10. Safe sprint: narrow implementation that should pass quickly.
11. Bold sprint: the largest implementation move worth risking now.
12. One implementation prompt for Cursor/Codex that can build the next branch without strategic freedom.
13. QA acceptance criteria, including mobile no-scroll, real map feel, and route absorption checks.
14. Cost-control advice: where to spend AI effort and where not to.

At the end write exactly one decision line:
DECISION: BUILD_BOLD_FULLSCREEN_MAP / BUILD_SAFE_MAP_POLISH / HOLD_FOR_HUMAN_REVIEW / REJECT_CURRENT_DIRECTION

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
  if (taskType === 'full_play_redesign') return fullPlayRedesignPrompt(context);
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
  const maxInputTokens = intEnv('MAX_INPUT_TOKENS', taskType === 'weak_prompt' ? 8000 : taskType === 'full_play_redesign' ? 110000 : 25000);
  const maxOutputTokens = intEnv('MAX_OUTPUT_TOKENS', taskType === 'weak_prompt' ? 4000 : taskType === 'full_play_redesign' ? 12000 : 5000);
  const inputPricePerMillion = numberEnv('INPUT_PRICE_PER_MILLION_USD', 10);
  const outputPricePerMillion = numberEnv('OUTPUT_PRICE_PER_MILLION_USD', 50);
  const maxEstimatedCost = numberEnv('MAX_ESTIMATED_COST_USD', taskType === 'weak_prompt' ? 0.35 : taskType === 'full_play_redesign' ? 2.25 : 0.75);
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
