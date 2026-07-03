import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'fable-output');
const OUT_MD = path.join(OUT_DIR, 'fable-pixel-audit.md');
const OUT_JSON = path.join(OUT_DIR, 'fable-pixel-audit-meta.json');

const FILES = [
  'README.md',
  'package.json',
  'docs/ONE_PAGE_PRODUCT_BRIEF.md',
  'docs/PRODUCT_SIMPLICITY_DOCTRINE.md',
  'docs/PRODUCT_SCOPE_CUT.md',
  'docs/WORLD_MAP_V7_SPEC.md',
  'docs/WORLD_MAP_V7_EXECUTION_RUNBOOK.md',
  'docs/AI_COST_CONTROL_CODEX.md',
  'docs/NEXT_SPRINT_PLAN.md',
  'docs/ai/FABLE5_PIXEL_NATIONS_EXPERIMENT_PLAN.md',
  'docs/ai/FABLE_FULL_PROJECT_REVIEW_BRIEF.md',
  'app/page.tsx',
  'app/world/page.tsx',
  'app/globals.css',
  'app/lib/demo-objective.ts',
  'app/lib/game-state.ts',
  'app/lib/playable-engine.ts',
  'app/lib/playable-state.ts',
  'app/lib/settlement-state.ts',
  'reports/agent/agent-report-true-mobile-fullscreen-world-shell-v0.12.2.md',
  'reports/agent/vision-gameplay-slice-v0.14.md',
];

const FORBIDDEN_PATH_PARTS = [
  '.env',
  'secret',
  'credential',
  'private-key',
  'private_key',
  'stripe',
  'vercel',
];

const MAX_CHARS_BY_FILE = {
  'app/world/page.tsx': 140000,
  'app/lib/game-state.ts': 80000,
  'app/lib/playable-engine.ts': 80000,
};

function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function intEnv(name, fallback) {
  const raw = env(name, String(fallback));
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`Invalid ${name}: ${raw}`);
  return parsed;
}

function numberEnv(name, fallback) {
  const raw = env(name, String(fallback));
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Invalid ${name}: ${raw}`);
  return parsed;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function estimateTokens(text) {
  return Math.ceil(text.length / 3.6);
}

function safePath(filePath) {
  const normalized = filePath.toLowerCase();
  return !FORBIDDEN_PATH_PARTS.some((part) => normalized.includes(part));
}

async function readAllowedFile(filePath) {
  if (!safePath(filePath)) throw new Error(`Refusing path: ${filePath}`);
  const abs = path.join(ROOT, filePath);
  const maxChars = MAX_CHARS_BY_FILE[filePath] ?? 50000;
  try {
    const content = await fs.readFile(abs, 'utf8');
    const truncated = content.length > maxChars;
    return `\n\n--- FILE: ${filePath}${truncated ? ' (TRUNCATED)' : ''} ---\n${truncated ? content.slice(0, maxChars) : content}\n`;
  } catch (error) {
    return `\n\n--- FILE: ${filePath} ---\n[missing or unreadable: ${error.message}]\n`;
  }
}

async function readIssueEventContext(maxChars = 65000) {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return '';

  try {
    const raw = await fs.readFile(eventPath, 'utf8');
    const event = JSON.parse(raw);
    const issue = event?.issue;
    if (!issue) return '';
    const title = typeof issue.title === 'string' ? issue.title : '';
    const body = typeof issue.body === 'string' ? issue.body : '';
    const truncated = body.length > maxChars;
    return `\n\n--- GITHUB ISSUE CONTEXT ---\nTitle: ${title}\n\nBody:\n${truncated ? body.slice(0, maxChars) : body}${truncated ? '\n\n[issue body truncated]' : ''}\n`;
  } catch (error) {
    return `\n\n--- GITHUB ISSUE CONTEXT ---\n[unreadable event payload: ${error.message}]\n`;
  }
}

function buildFullPlayPrompt(context) {
  return `You are Fable 5 acting as an elite strategy-game creative director, product lead, UX architect, frontend architect, QA lead, and brutal scope cutter for Pixel Nations.

This is a controlled moonshot review. Do not modify the repository. Produce an artifact only.

Context:
- Pixel Nations is a browser-first strategy game.
- The fantasy: one land can become an empire.
- Current demo: Sector A-01 / Aurelian Basin, a window into a finite 10,000-land world.
- Current problem: the project risks becoming a beautiful claim/founding ceremony instead of a genuinely fun strategy game.
- The user wants to see a fuller game, not just a polished map.
- We are willing to rethink the entire Play section if the result is much stronger.

Your task:
Design the strongest possible new Play section / first playable game surface for Pixel Nations using the provided repo/docs/code as context.

You may treat current /world code as reference, not sacred. You may propose replacing the Play surface conceptually if that is the right call. But remain tiny-team feasible.

Hard constraints:
- No blockchain, NFT, wallet, mint, token, crypto, or pay-to-win direction.
- No backend-first plan.
- No real multiplayer-first plan.
- No full simulation/economy/combat/diplomacy system now.
- No expensive engine pivot.
- No new dependencies unless overwhelmingly justified.
- No generic slogans.
- Mobile must be a no-scroll game command shell for core actions.
- Core actions must live in map/HUD/tray/modal/drawer/context overlay, not below the map.
- Use local/mock/localStorage-friendly state for MVP.

Required output:
1. Brutal verdict: what is wrong with the current Play/world direction?
2. What must be preserved from Pixel Nations?
3. What should be thrown away or downgraded?
4. The new Play section vision in one paragraph.
5. The exact first 10 minutes of gameplay, minute by minute.
6. The core loop: name it and show 3-5 repeat cycles.
7. The one strategic decision that makes the MVP a real strategy game.
8. The mobile layout spec: viewport zones, HUD, map, selected land tray, action tray, modal/drawer behavior.
9. The desktop layout spec.
10. The minimal data/state model.
11. The land-choice system: terrains, advantages, risks, starting paths, consequences.
12. The first-turn/season system, if you recommend one.
13. What map consequences must be visible immediately.
14. UX copy for the main screen, selected land, claim/found confirmation, post-claim next action, and first season/action.
15. A code architecture plan for implementing this in the current Next.js app.
16. Which existing files/components/functions to salvage.
17. Which existing UI sections to remove, hide, or convert to drawers.
18. A safe implementation plan split into two sprints.
19. A bolder implementation plan if we accept more risk.
20. One precise Cursor/Codex prompt for the safe sprint, with model, MAX off, cost risk, allowed files, forbidden files/actions, validation commands, screenshot evidence, and stop condition.
21. Optional: provide TypeScript-style pseudo-code or component skeletons for the new Play surface, but do not output an enormous unreviewable full-file dump unless it is actually concise and useful.
22. Acceptance criteria and QA checklist.
23. Final decision line exactly: DECISION: SAFE_REDESIGN / BOLD_REDESIGN / REJECT_CURRENT_DIRECTION / KEEP_CURRENT_DIRECTION

Quality bar:
- Be concrete enough that Cursor could implement the safe sprint.
- Challenge bad product assumptions.
- Avoid vague design language.
- Prioritize fun, strategic clarity, and first-session comprehension.
- Keep it feasible for a tiny team.

Repository context:
${context}`;
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

  if (!response.ok) throw new Error(`Anthropic API failed ${response.status}: ${JSON.stringify(data).slice(0, 2000)}`);
  return data;
}

function extractText(data) {
  return (data?.content ?? [])
    .filter((part) => part?.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n\n')
    .trim();
}

async function main() {
  const model = env('ANTHROPIC_MODEL', 'claude-fable-5');
  const maxInputTokens = intEnv('MAX_INPUT_TOKENS', 110000);
  const maxOutputTokens = intEnv('MAX_OUTPUT_TOKENS', 12000);
  const inputPricePerMillion = numberEnv('INPUT_PRICE_PER_MILLION_USD', 10);
  const outputPricePerMillion = numberEnv('OUTPUT_PRICE_PER_MILLION_USD', 50);
  const maxEstimatedCost = numberEnv('MAX_ESTIMATED_COST_USD', 2.25);
  const apiKey = requiredEnv('ANTHROPIC_API_KEY');

  const chunks = [];
  for (const file of FILES) chunks.push(await readAllowedFile(file));
  const issueContext = await readIssueEventContext();
  if (issueContext) chunks.push(issueContext);

  const prompt = buildFullPlayPrompt(chunks.join('\n'));
  const estimatedInputTokens = estimateTokens(prompt);
  const estimatedMaxCost = (estimatedInputTokens / 1_000_000) * inputPricePerMillion + (maxOutputTokens / 1_000_000) * outputPricePerMillion;

  console.log(`Fable task: full_play_redesign`);
  console.log(`Model: ${model}`);
  console.log(`Estimated input tokens: ${estimatedInputTokens}`);
  console.log(`Max output tokens: ${maxOutputTokens}`);
  console.log(`Estimated max cost USD: ${estimatedMaxCost.toFixed(4)}`);

  if (estimatedInputTokens > maxInputTokens) throw new Error(`Input token estimate ${estimatedInputTokens} exceeds cap ${maxInputTokens}`);
  if (estimatedMaxCost > maxEstimatedCost) throw new Error(`Estimated max cost $${estimatedMaxCost.toFixed(4)} exceeds cap $${maxEstimatedCost.toFixed(4)}`);

  const data = await callAnthropic({ apiKey, model, prompt, maxOutputTokens });
  const outputText = extractText(data);
  if (!outputText) throw new Error('Anthropic returned no text content.');

  await fs.mkdir(OUT_DIR, { recursive: true });
  const meta = {
    taskType: 'full_play_redesign',
    model,
    estimatedInputTokens,
    maxOutputTokens,
    estimatedMaxCostUsd: Number(estimatedMaxCost.toFixed(6)),
    usage: data.usage ?? null,
    createdAt: new Date().toISOString(),
    allowedFiles: FILES,
    includedIssueContext: Boolean(process.env.GITHUB_EVENT_PATH),
  };

  const report = `# Fable 5 Pixel Nations Full Play Redesign\n\n` +
    `Task: full_play_redesign\n\n` +
    `Model: ${model}\n\n` +
    `Estimated input tokens: ${estimatedInputTokens}\n\n` +
    `Max output tokens: ${maxOutputTokens}\n\n` +
    `Estimated max cost USD: ${estimatedMaxCost.toFixed(4)}\n\n` +
    `Allowed files: ${FILES.join(', ')}\n\n` +
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
