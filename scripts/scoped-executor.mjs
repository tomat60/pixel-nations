import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "scoped-executor-output");
const OUT_PATCH = path.join(OUT_DIR, "scoped-executor.patch");
const OUT_REPORT = path.join(OUT_DIR, "scoped-executor-report.md");
const OUT_META = path.join(OUT_DIR, "scoped-executor-meta.json");
const OUT_RAW_OUTPUT = path.join(OUT_DIR, "scoped-executor-raw-output.txt");
const OUT_APPLY_CHECK = path.join(OUT_DIR, "scoped-executor-apply-check.json");
const OUT_APPLY_RESULT = path.join(OUT_DIR, "scoped-executor-apply-result.json");

const CANDIDATE_FILES = [
  "package.json",
  "app/play/page.tsx",
  "app/play/lib/play-state.ts",
  "app/play/lib/post-crisis-countermove.ts",
  "app/play/world/WorldMapScene.tsx",
  "app/play/components/BottomDock.tsx",
  "app/play/components/CouncilPanel.tsx",
  "app/play/components/CurrentObjective.tsx",
  "app/play/components/DemoCompleteOverlay.tsx",
  "scripts/qa-empire-crisis.mjs",
  "scripts/qa-post-crisis-countermove.mjs",
  ".github/workflows/play-visual-qa.yml",
];

const FILE_CONTEXT_LIMITS = new Map([
  ["app/play/lib/play-state.ts", 120000],
]);

const FORBIDDEN_PATH_FRAGMENTS = [
  ".env",
  "secret",
  "credential",
  "private-key",
  "private_key",
  "token",
  "wallet",
  "payment",
  "stripe",
  "vercel",
  "node_modules",
  ".next",
];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

function enumEnv(name, fallback, allowed) {
  const value = env(name, fallback);
  if (!allowed.includes(value)) {
    throw new Error(`Invalid env var ${name}: ${value}. Allowed: ${allowed.join(", ")}`);
  }
  return value;
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

function normalizePath(filePath) {
  return filePath.replace(/^a\//, "").replace(/^b\//, "").replace(/^\.\//, "");
}

function isForbiddenPath(filePath) {
  const lower = filePath.toLowerCase();
  return FORBIDDEN_PATH_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

function isAllowedPath(filePath) {
  const normalized = normalizePath(filePath);
  if (isForbiddenPath(normalized)) return false;
  if (normalized.startsWith("app/play/")) return true;
  if (/^scripts\/qa-[a-z0-9-]+\.mjs$/.test(normalized)) return true;
  if (normalized === "package.json") return true;
  if (normalized === ".github/workflows/play-visual-qa.yml") return true;
  return false;
}

function extractPatch(text) {
  const fenced = text.match(/```(?:diff|patch)?\s*\n([\s\S]*?)```/i);
  const patch = (fenced ? fenced[1] : text).trim();
  if (!patch.includes("diff --git")) {
    throw new Error("Model output did not contain a unified git diff.");
  }
  return `${patch}\n`;
}

function collectPatchPaths(patch) {
  const paths = new Set();
  for (const line of patch.split("\n")) {
    const diffMatch = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (diffMatch) {
      paths.add(normalizePath(diffMatch[1]));
      paths.add(normalizePath(diffMatch[2]));
    }
    const plusMatch = line.match(/^\+\+\+ b\/(.+)$/);
    if (plusMatch) paths.add(normalizePath(plusMatch[1]));
    const minusMatch = line.match(/^--- a\/(.+)$/);
    if (minusMatch) paths.add(normalizePath(minusMatch[1]));
  }
  return Array.from(paths).filter((item) => item && item !== "/dev/null");
}

function validatePatch(patch) {
  if (/GIT binary patch|Binary files/i.test(patch)) throw new Error("Binary patches are forbidden.");
  if (/deleted file mode/i.test(patch)) throw new Error("File deletion is forbidden for scoped executor runs.");
  if (/rename from|rename to/i.test(patch)) throw new Error("File renames are forbidden for scoped executor runs.");

  const paths = collectPatchPaths(patch);
  if (!paths.length) throw new Error("Patch contains no changed paths.");
  for (const filePath of paths) {
    if (!isAllowedPath(filePath)) throw new Error(`Patch path is outside allowlist: ${filePath}`);
  }
  return paths;
}

async function readFileForPrompt(filePath, maxChars = 45000) {
  if (isForbiddenPath(filePath)) throw new Error(`Refusing forbidden file path: ${filePath}`);
  try {
    const content = await fs.readFile(path.join(ROOT, filePath), "utf8");
    const truncated = content.length > maxChars;
    return `\n\n--- FILE: ${filePath}${truncated ? " (TRUNCATED)" : ""} ---\n${truncated ? content.slice(0, maxChars) : content}\n`;
  } catch (error) {
    return `\n\n--- FILE: ${filePath} ---\n[missing or unreadable: ${error.message}]\n`;
  }
}

async function readIssueContext() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) throw new Error("Missing GITHUB_EVENT_PATH; scoped executor requires a GitHub issue event.");
  const event = JSON.parse(await fs.readFile(eventPath, "utf8"));
  const issue = event.issue;
  if (!issue) throw new Error("Scoped executor requires an issue event payload.");
  const title = String(issue.title ?? "");
  const body = String(issue.body ?? "");
  const author = String(issue.user?.login ?? "");
  if (author !== "tomat60") throw new Error(`Unauthorized issue author: ${author}`);
  if (!title.startsWith("AGENT RUN: scoped_implementation")) {
    throw new Error(`Issue title must start with AGENT RUN: scoped_implementation. Got: ${title}`);
  }
  if (!body.includes("Allowed files") || !body.includes("Forbidden") || !body.includes("Validation") || !body.includes("Stop condition")) {
    throw new Error("Issue body must include Allowed files, Forbidden, Validation and Stop condition sections.");
  }
  return { number: issue.number, title, body, author };
}

async function buildPrompt(issue) {
  const chunks = [];
  for (const file of CANDIDATE_FILES) {
    const maxChars = FILE_CONTEXT_LIMITS.get(file) ?? 45000;
    chunks.push(await readFileForPrompt(file, maxChars));
  }
  const repoContext = chunks.join("\n");
  return `You are a careful coding agent for Pixel Nations. Produce one minimal unified git diff only.\n\n` +
    `MISSION\n${issue.title}\n\n${issue.body}\n\n` +
    `ABSOLUTE RULES\n` +
    `- Output exactly one unified git diff. No prose outside the diff.\n` +
    `- Keep the patch minimal and bounded.\n` +
    `- Only modify allowlisted paths: app/play/**, scripts/qa-*.mjs, package.json, .github/workflows/play-visual-qa.yml.\n` +
    `- Do not delete files. Do not rename files. Do not add packages. Do not touch secrets.\n` +
    `- Do not revive legacy routes. Do not create backend/auth/database/payments/multiplayer.\n` +
    `- Prefer deterministic state and localStorage-safe hydration.\n` +
    `- If the mission requires broader changes, output a tiny patch that adds no code and instead adds a report file is NOT allowed; fail by explaining inside a diff is not allowed. Therefore only patch if the implementation is safe.\n\n` +
    `REPOSITORY CONTEXT\n${repoContext}`;
}

async function callAnthropic({ apiKey, model, prompt, maxOutputTokens, thinkingMode }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxOutputTokens,
      thinking: { type: thinkingMode },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!response.ok) throw new Error(`Anthropic API failed ${response.status}: ${JSON.stringify(data).slice(0, 2000)}`);
  return data;
}

function extractText(data) {
  return (data?.content ?? [])
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n\n")
    .trim();
}

function summarizeAnthropicResponse(data) {
  const content = Array.isArray(data?.content) ? data.content : [];
  return {
    responseId: typeof data?.id === "string" ? data.id : null,
    model: typeof data?.model === "string" ? data.model : null,
    stopReason: typeof data?.stop_reason === "string" ? data.stop_reason : null,
    stopSequence: typeof data?.stop_sequence === "string" ? data.stop_sequence : null,
    usage: data?.usage ?? null,
    contentBlockTypes: content.map((part) => typeof part?.type === "string" ? part.type : "unknown"),
    contentBlockCount: content.length,
  };
}

async function writeFailureDiagnostics({ issue, model, thinkingMode, estimatedInputTokens, maxOutputTokens, estimatedMaxCost, data, reason, diagnostics = null }) {
  const response = summarizeAnthropicResponse(data);
  const meta = {
    status: "failed",
    failureReason: reason,
    issueNumber: issue.number,
    requestedModel: model,
    requestedThinkingMode: thinkingMode,
    estimatedInputTokens,
    maxOutputTokens,
    estimatedMaxCostUsd: Number(estimatedMaxCost.toFixed(6)),
    anthropicResponse: response,
    diagnostics,
    createdAt: new Date().toISOString(),
  };

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_META, JSON.stringify(meta, null, 2), "utf8");
  await fs.writeFile(
    OUT_REPORT,
    `# Scoped Executor Failure Report\n\nIssue: #${issue.number}\n\nRequested model: ${model}\n\nRequested thinking mode: ${thinkingMode}\n\nFailure: ${reason}\n\nStop reason: ${response.stopReason ?? "unknown"}\n\nContent block types: ${response.contentBlockTypes.length ? response.contentBlockTypes.join(", ") : "none"}\n\nResponse ID: ${response.responseId ?? "unknown"}\n\nUsage: ${JSON.stringify(response.usage)}\n\nDiagnostics: ${diagnostics ? JSON.stringify(diagnostics, null, 2) : "none"}\n`,
    "utf8",
  );
  console.error("Anthropic response summary:", JSON.stringify(response));
  if (diagnostics) console.error("Scoped executor diagnostics:", JSON.stringify(diagnostics));
  return response;
}

function runGit(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function runGitDetailed(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return {
    command: ["git", ...args].join(" "),
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error ? result.error.message : null,
  };
}

function gitSucceeded(result) {
  return result.status === 0 && !result.error;
}

async function main() {
  const issue = await readIssueContext();
  const model = env("ANTHROPIC_MODEL", "claude-sonnet-5");
  const thinkingMode = enumEnv("ANTHROPIC_THINKING_MODE", "disabled", ["disabled"]);
  const maxOutputTokens = intEnv("MAX_OUTPUT_TOKENS", 12000);
  const maxInputTokens = intEnv("MAX_INPUT_TOKENS", 80000);
  const inputPrice = numberEnv("INPUT_PRICE_PER_MILLION_USD", 3);
  const outputPrice = numberEnv("OUTPUT_PRICE_PER_MILLION_USD", 15);
  const maxEstimatedCost = numberEnv("MAX_ESTIMATED_COST_USD", 2.0);
  const apiKey = requiredEnv("ANTHROPIC_API_KEY");

  const prompt = await buildPrompt(issue);
  const estimatedInputTokens = estimateTokens(prompt);
  const estimatedMaxCost = (estimatedInputTokens / 1_000_000) * inputPrice + (maxOutputTokens / 1_000_000) * outputPrice;
  if (estimatedInputTokens > maxInputTokens) throw new Error(`Input token estimate ${estimatedInputTokens} exceeds cap ${maxInputTokens}`);
  if (estimatedMaxCost > maxEstimatedCost) throw new Error(`Estimated max cost $${estimatedMaxCost.toFixed(4)} exceeds cap $${maxEstimatedCost.toFixed(4)}`);

  const data = await callAnthropic({ apiKey, model, prompt, maxOutputTokens, thinkingMode });
  const outputText = extractText(data);
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_RAW_OUTPUT, outputText || "", "utf8");

  if (!outputText) {
    const response = summarizeAnthropicResponse(data);
    const reason = `Anthropic returned no text content (stop_reason=${response.stopReason ?? "unknown"}; content_types=${response.contentBlockTypes.join(",") || "none"}).`;
    await writeFailureDiagnostics({ issue, model, thinkingMode, estimatedInputTokens, maxOutputTokens, estimatedMaxCost, data, reason });
    throw new Error(reason);
  }

  let patch;
  let paths;
  try {
    patch = extractPatch(outputText);
    paths = validatePatch(patch);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await writeFailureDiagnostics({
      issue,
      model,
      thinkingMode,
      estimatedInputTokens,
      maxOutputTokens,
      estimatedMaxCost,
      data,
      reason,
      diagnostics: { stage: "extract-or-validate-patch" },
    });
    throw error;
  }

  await fs.writeFile(OUT_PATCH, patch, "utf8");

  const applyArgs = ["apply", "--recount", "--whitespace=nowarn", OUT_PATCH];
  const applyCheck = runGitDetailed(["apply", "--check", "--recount", "--whitespace=nowarn", OUT_PATCH]);
  await fs.writeFile(OUT_APPLY_CHECK, JSON.stringify(applyCheck, null, 2), "utf8");
  if (!gitSucceeded(applyCheck)) {
    const reason = `git apply --check failed with status ${applyCheck.status ?? "unknown"}.`;
    await writeFailureDiagnostics({
      issue,
      model,
      thinkingMode,
      estimatedInputTokens,
      maxOutputTokens,
      estimatedMaxCost,
      data,
      reason,
      diagnostics: { stage: "git-apply-check", applyCheck },
    });
    throw new Error(reason);
  }

  const applyResult = runGitDetailed(applyArgs);
  await fs.writeFile(OUT_APPLY_RESULT, JSON.stringify(applyResult, null, 2), "utf8");
  if (!gitSucceeded(applyResult)) {
    const reason = `git apply failed with status ${applyResult.status ?? "unknown"}.`;
    await writeFailureDiagnostics({
      issue,
      model,
      thinkingMode,
      estimatedInputTokens,
      maxOutputTokens,
      estimatedMaxCost,
      data,
      reason,
      diagnostics: { stage: "git-apply", applyResult },
    });
    throw new Error(reason);
  }

  let changedFiles = "";
  try { changedFiles = runGit(["diff", "--name-only"]); } catch {}
  if (!changedFiles.trim()) {
    const reason = "Patch applied but produced no working tree changes.";
    await writeFailureDiagnostics({
      issue,
      model,
      thinkingMode,
      estimatedInputTokens,
      maxOutputTokens,
      estimatedMaxCost,
      data,
      reason,
      diagnostics: { stage: "empty-working-tree" },
    });
    throw new Error(reason);
  }

  const meta = {
    status: "succeeded",
    issueNumber: issue.number,
    model,
    thinkingMode,
    estimatedInputTokens,
    maxOutputTokens,
    estimatedMaxCostUsd: Number(estimatedMaxCost.toFixed(6)),
    usage: data.usage ?? null,
    anthropicResponse: summarizeAnthropicResponse(data),
    patchPaths: paths,
    changedFiles: changedFiles.trim().split("\n"),
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(OUT_META, JSON.stringify(meta, null, 2), "utf8");
  await fs.writeFile(OUT_REPORT, `# Scoped Executor Report\n\nIssue: #${issue.number}\n\nModel: ${model}\n\nThinking mode: ${thinkingMode}\n\nEstimated input tokens: ${estimatedInputTokens}\n\nMax output tokens: ${maxOutputTokens}\n\nEstimated max cost USD: ${estimatedMaxCost.toFixed(4)}\n\nPatch paths:\n${paths.map((p) => `- ${p}`).join("\n")}\n\nChanged files:\n${meta.changedFiles.map((p) => `- ${p}`).join("\n")}\n`, "utf8");

  console.log(`Scoped executor changed files:\n${changedFiles}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
