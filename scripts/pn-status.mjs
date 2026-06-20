#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

function run(command) {
  try {
    return {
      ok: true,
      text: execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(),
    };
  } catch (error) {
    return {
      ok: false,
      text: `${error.stdout || ""}${error.stderr || ""}`.trim() || error.message,
    };
  }
}

function line(text, prefix) {
  return text.split(/\r?\n/).find((item) => item.startsWith(prefix)) || "";
}

function block(text, start, count = 7) {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((item) => item.trim() === start);
  if (index === -1) return [];
  return lines.slice(index, index + count);
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

const status = run("git status --short --branch");
const log = run("git log --oneline -8");
const currentStatePath = "docs/PROJECT_CURRENT_STATE.md";
const docsMapPath = "docs/README.md";
const handoffPath = "public/qa/latest/handoff.txt";

section("Pixel Nations Status");
console.log(status.text || "git status unavailable");

section("Last commits");
console.log(log.text || "git log unavailable");

section("Local QA handoff");
if (existsSync(handoffPath)) {
  const handoff = readFileSync(handoffPath, "utf8");
  console.log(line(handoff, "Generated:"));
  console.log(line(handoff, "Branch:"));
  console.log(line(handoff, "Working tree:"));
  console.log(line(handoff, "Smoke result:"));
  console.log(line(handoff, "Evidence status:"));
  console.log(line(handoff, "Screenshots count:"));
  console.log(block(handoff, "Last 5 commits:", 7).join("\n"));
} else {
  console.log("Missing public/qa/latest/handoff.txt");
}

section("Project docs");
console.log(`${existsSync(currentStatePath) ? "PASS" : "FAIL"} ${currentStatePath}`);
console.log(`${existsSync(docsMapPath) ? "PASS" : "FAIL"} ${docsMapPath}`);
console.log(`${existsSync("docs/PROJECT_OPERATING_SYSTEM.md") ? "PASS" : "FAIL"} docs/PROJECT_OPERATING_SYSTEM.md`);
console.log(`${existsSync("docs/ASSISTANT_COMMAND_PROTOCOL.md") ? "PASS" : "FAIL"} docs/ASSISTANT_COMMAND_PROTOCOL.md`);

section("Public QA check");
const publicCheck = run("npm run pn:public-check --silent");
console.log(publicCheck.text || "pn:public-check unavailable");

section("Next allowed action");
const dirty = status.text.includes("\n M ") || status.text.includes("\nM ") || status.text.includes("\n?? ") || status.text.includes("\n D ") || status.text.includes("\nD ");
const publicPass = publicCheck.ok && publicCheck.text.includes("PUBLIC_QA_CHECK=PASS");

if (dirty) {
  console.log("BLOCKED: repo has local changes. Resolve or intentionally package them before product work.");
} else if (!publicPass) {
  console.log("BLOCKED FOR PRODUCT WORK: public QA check is not passing yet. Wait for deploy or inspect the mismatch.");
} else {
  console.log("ALLOWED: strategic planning or a scoped audit may proceed. Cursor remains blocked until a reviewed prompt exists.");
  console.log("Recommended next product step: Demo Readiness v0.7 — Player Confusion Pass.");
}

section("Tool policy");
console.log("Cursor default: GPT-5.5 without MAX.");
console.log("MAX: blocked unless clearly justified.");
console.log("Terminal: allowed for deterministic audits, QA, docs, and safe patches.");
console.log("Coding: blocked until scope, files, validation, and stop condition are explicit.");
console.log("Report handoff: run npm run pn:report to reveal/select a ZIP for ChatGPT upload.");
