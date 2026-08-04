#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

function run(command) {
  try {
    return {
      ok: true,
      text: execSync(command, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim(),
    };
  } catch (error) {
    return {
      ok: false,
      text: `${error.stdout || ""}${error.stderr || ""}`.trim() || error.message,
    };
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

function field(text, label) {
  const prefix = `${label}:`;
  const match = text
    .split(/\r?\n/)
    .find((item) => item.trimStart().startsWith(prefix));
  return match ? match.slice(match.indexOf(prefix) + prefix.length).trim() : "";
}

function validSha(value) {
  return /^[0-9a-f]{40}$/i.test(value);
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function ageInDays(date, now = new Date()) {
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

function parseTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const currentStatePath = "docs/PROJECT_CURRENT_STATE.md";
const docsMapPath = "docs/README.md";
const handoffPath = "public/qa/latest/handoff.txt";

const requiredDocs = [
  currentStatePath,
  docsMapPath,
  "AGENTS.md",
  "docs/ADR_001_GODOT_DESKTOP_FIRST.md",
  "docs/PROJECT_OPERATING_SYSTEM.md",
  "docs/ASSISTANT_COMMAND_PROTOCOL.md",
  "docs/PROJECT_OPERATING_RULES.md",
  "docs/QA_GOVERNANCE_PROTOCOL.md",
];

const status = run("git status --short --branch");
const porcelain = run("git status --porcelain");
const log = run("git log --oneline -8");
const head = run("git rev-parse HEAD");
const branch = run("git branch --show-current");
const latestCommitDate = run("git log -1 --format=%cI");

const authorityErrors = [];
const authorityWarnings = [];
let currentState = "";
let updated = "";
let authorityBaseline = "";
let productBaseline = "";
let currentMilestone = "";
let activeIssue = "";
let nextAllowedAction = "";

if (!existsSync(currentStatePath)) {
  authorityErrors.push(`missing ${currentStatePath}`);
} else {
  currentState = readFileSync(currentStatePath, "utf8");
  updated = field(currentState, "Updated");
  authorityBaseline = field(currentState, "Authority baseline SHA");
  productBaseline = field(currentState, "Product baseline SHA");
  currentMilestone = field(currentState, "Current milestone");
  activeIssue = field(currentState, "Active execution issue");
  nextAllowedAction = field(currentState, "Next allowed action");

  const requiredFields = [
    ["Status", field(currentState, "Status")],
    ["Updated", updated],
    ["Authority baseline SHA", authorityBaseline],
    ["Product baseline SHA", productBaseline],
    ["Current milestone", currentMilestone],
    ["Active execution issue", activeIssue],
    ["Next allowed action", nextAllowedAction],
  ];

  for (const [label, value] of requiredFields) {
    if (!value) authorityErrors.push(`missing current-state field: ${label}`);
  }

  const updatedDate = parseDate(updated);
  if (!updatedDate) {
    authorityErrors.push(`invalid Updated date: ${updated || "(missing)"}`);
  } else {
    const stateAge = ageInDays(updatedDate);
    if (stateAge > 14) {
      authorityErrors.push(`current state is ${stateAge} days old`);
    } else if (stateAge > 7) {
      authorityWarnings.push(`current state is ${stateAge} days old; review freshness`);
    }

    const repoDate = parseTimestamp(latestCommitDate.text);
    if (repoDate) {
      const driftDays = Math.floor(
        (repoDate.getTime() - updatedDate.getTime()) / 86_400_000,
      );
      if (driftDays > 2) {
        authorityWarnings.push(
          `repository has commits ${driftDays} days newer than current-state date`,
        );
      }
    }
  }

  for (const [label, sha] of [
    ["authority baseline", authorityBaseline],
    ["product baseline", productBaseline],
  ]) {
    if (!validSha(sha)) {
      authorityErrors.push(`invalid ${label} SHA: ${sha || "(missing)"}`);
      continue;
    }

    const commitPresent = run(`git cat-file -e ${sha}^{commit}`);
    if (!commitPresent.ok) {
      const shallow = run("git rev-parse --is-shallow-repository");
      if (shallow.ok && shallow.text === "true") {
        authorityWarnings.push(
          `${label} ${sha} is outside this shallow checkout; ancestry not verified`,
        );
      } else {
        authorityErrors.push(`${label} ${sha} is not available in repository history`);
      }
      continue;
    }

    const ancestor = run(`git merge-base --is-ancestor ${sha} HEAD`);
    if (!ancestor.ok) {
      authorityErrors.push(`${label} ${sha} is not an ancestor of HEAD`);
    }
  }

  if (validSha(authorityBaseline)) {
    const commitsSinceAuthority = run(
      `git rev-list --count ${authorityBaseline}..HEAD`,
    );
    const count = Number(commitsSinceAuthority.text);
    if (commitsSinceAuthority.ok && Number.isFinite(count) && count > 25) {
      authorityWarnings.push(
        `${count} commits exist after the authority baseline; review current state`,
      );
    }
  }

  if (!/^#\d+$/.test(activeIssue)) {
    authorityErrors.push(
      `Active execution issue must use #<number>, got: ${activeIssue || "(missing)"}`,
    );
  }
}

section("Pixel Nations Status");
console.log(status.text || "git status unavailable");
console.log(`HEAD: ${head.text || "unavailable"}`);
console.log(`Branch: ${branch.text || "detached/unavailable"}`);

section("Authority gate");
if (authorityErrors.length === 0) {
  console.log("AUTHORITY_STATUS=PASS");
} else {
  console.log("AUTHORITY_STATUS=FAIL");
  for (const error of authorityErrors) console.log(`ERROR: ${error}`);
}
for (const warning of authorityWarnings) console.log(`WARNING: ${warning}`);

if (currentState) {
  console.log(`Updated: ${updated}`);
  console.log(`Current milestone: ${currentMilestone}`);
  console.log(`Active execution issue: ${activeIssue}`);
  console.log(`Authority baseline SHA: ${authorityBaseline}`);
  console.log(`Product baseline SHA: ${productBaseline}`);
}

section("Project docs");
for (const path of requiredDocs) {
  console.log(`${existsSync(path) ? "PASS" : "FAIL"} ${path}`);
}

section("Last commits");
console.log(log.text || "git log unavailable");

section("QA handoff classification");
let handoffCurrent = false;
if (!existsSync(handoffPath)) {
  console.log("HANDOFF_STATUS=MISSING");
} else {
  const handoff = readFileSync(handoffPath, "utf8");
  const generatedText = field(handoff, "Generated");
  const handoffBranch = field(handoff, "Branch");
  const smokeResult = field(handoff, "Smoke result");
  const evidenceStatus = field(handoff, "Evidence status");
  const generated = parseTimestamp(generatedText);
  const stateDate = parseDate(updated);

  const olderThanState =
    generated && stateDate ? generated.getTime() < stateDate.getTime() : true;
  const handoffAge = generated ? ageInDays(generated) : null;

  handoffCurrent =
    Boolean(generated) &&
    !olderThanState &&
    handoffAge !== null &&
    handoffAge <= 7;

  if (handoffCurrent) {
    console.log("HANDOFF_STATUS=CURRENT_REFERENCE");
    console.log(`Generated: ${generatedText}`);
    console.log(`Branch: ${handoffBranch}`);
    console.log(`Smoke result: ${smokeResult}`);
    console.log(`Evidence status: ${evidenceStatus}`);
  } else {
    console.log("HANDOFF_STATUS=STALE_REFERENCE_ONLY");
    console.log(`Generated: ${generatedText || "unknown"}`);
    console.log(`Branch: ${handoffBranch || "unknown"}`);
    console.log(
      "Do not use public/qa/latest as project authority. Use current-state and exact-head milestone evidence.",
    );
  }
}

section("Public QA check");
const publicCheck = run("npm run pn:public-check --silent");
if (publicCheck.ok && publicCheck.text.includes("PUBLIC_QA_CHECK=PASS")) {
  console.log("PUBLIC_QA_STATUS=PASS");
  console.log(publicCheck.text);
} else {
  console.log("PUBLIC_QA_STATUS=NOT_CURRENT_OR_FAILING");
  console.log(publicCheck.text || "pn:public-check unavailable");
  console.log(
    "Public QA failure does not override exact-head milestone evidence, but it blocks claims that public/qa/latest is current.",
  );
}

section("Next allowed action");
const dirty = porcelain.ok && porcelain.text.length > 0;

if (authorityErrors.length > 0) {
  console.log(
    "BLOCKED_STALE_PROJECT_STATE: repair the authority chain before product work.",
  );
  process.exitCode = 1;
} else if (dirty) {
  console.log(
    "BLOCKED_LOCAL_CHANGES: resolve or intentionally package local changes before unrelated product work.",
  );
  process.exitCode = 1;
} else {
  console.log(`ALLOWED_BY_CURRENT_STATE: ${nextAllowedAction}`);
  if (!handoffCurrent) {
    console.log(
      "EVIDENCE_NOTE: use exact-head evidence referenced by current state or the active issue, not stale latest handoff files.",
    );
  }
}

section("Tool policy");
console.log("Strategy/review/research: ChatGPT/control-plane; coding blocked unless the active issue authorizes it.");
console.log("Cursor/agent: only from a reviewed execution contract with scope, validation, cost mode, evidence, and stop condition.");
console.log("MAX: OFF unless explicitly justified and approved.");
console.log("GitHub: branch/PR path for risky, visual, workflow, or multi-file changes.");
console.log("Report transport: npm run pn:report; a report package is evidence, not authority.");
