import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

const execFileAsync = promisify(execFile);

const QA_REPORT_URL = "https://pixel-nations.vercel.app/qa/latest/report.html";
const WORLD_URL = "https://pixel-nations.vercel.app/world";
const SMOKE_RESULT_PATH = "public/qa/latest/smoke-result.json";
const QA_REPORT_PATH = "public/qa/latest/report.html";

async function runGit(args, fallback = "") {
  try {
    const { stdout } = await execFileAsync("git", args, { encoding: "utf8" });
    return stdout.trim();
  } catch {
    return fallback;
  }
}

async function getBranch() {
  const branch = await runGit(["branch", "--show-current"]);
  if (branch) return branch;
  return runGit(["rev-parse", "--short", "HEAD"], "unknown");
}

async function getSmokeSummary() {
  if (!existsSync(SMOKE_RESULT_PATH)) {
    return [
      "Smoke result: not found",
      `Smoke result path: ${SMOKE_RESULT_PATH}`,
      "Note: run npm run qa:smoke or npm run pn:quick to refresh it.",
    ].join("\n");
  }

  try {
    const raw = await readFile(SMOKE_RESULT_PATH, "utf8");
    const smoke = JSON.parse(raw);
    const steps = Array.isArray(smoke.steps) ? smoke.steps : [];
    const passed = steps.filter((step) => step.status === "PASS").length;
    const failedStep = steps.find((step) => step.status === "FAIL");

    const lines = [
      `Smoke result: ${smoke.status ?? "unknown"}`,
      `Smoke generated: ${smoke.generatedAt ?? "unknown"}`,
      `Smoke app source: ${smoke.appSource ?? "unknown"}`,
      `Smoke steps: ${passed}/${steps.length} passed`,
    ];

    if (smoke.blockingStep || smoke.error || failedStep) {
      lines.push(`Blocking step: ${smoke.blockingStep || failedStep?.name || "unknown"}`);
      lines.push(`Smoke error: ${smoke.error || failedStep?.error || "unknown"}`);
    }

    lines.push(`Smoke result path: ${SMOKE_RESULT_PATH}`);
    return lines.join("\n");
  } catch (error) {
    return [
      "Smoke result: unreadable",
      `Smoke result path: ${SMOKE_RESULT_PATH}`,
      `Smoke parse error: ${error.message}`,
    ].join("\n");
  }
}

function indent(value) {
  if (!value) return "  clean";
  return value
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function buildReport({ branch, statusSummary, isClean, lastCommits, smokeSummary }) {
  const localQaReport = existsSync(QA_REPORT_PATH) ? resolve(QA_REPORT_PATH) : `${QA_REPORT_PATH} (not found)`;

  return `Pixel Nations Handoff Report
Generated: ${new Date().toISOString()}

Branch: ${branch}
Working tree: ${isClean ? "clean" : "has changes"}

Git status:
${indent(statusSummary)}

Last 5 commits:
${indent(lastCommits)}

QA:
${smokeSummary}
Public QA report: ${QA_REPORT_URL}
World URL: ${WORLD_URL}
Local QA report: ${localQaReport}

Next instruction: Paste this report to ChatGPT.`;
}

async function copyToClipboard(report) {
  if (process.platform !== "darwin") {
    return "Clipboard: skipped (not macOS).";
  }

  return new Promise((resolveClipboard) => {
    const child = spawn("pbcopy", { stdio: ["pipe", "ignore", "ignore"] });
    let settled = false;

    const settle = (message) => {
      if (settled) return;
      settled = true;
      resolveClipboard(message);
    };

    child.on("error", () => settle("Clipboard: pbcopy unavailable; copy the report manually."));
    child.on("close", (code) => {
      settle(code === 0 ? "Clipboard: copied to macOS clipboard." : "Clipboard: pbcopy failed; copy the report manually.");
    });

    child.stdin.on("error", () => settle("Clipboard: pbcopy failed; copy the report manually."));
    child.stdin.end(report);
  });
}

async function main() {
  const [branch, statusSummary, porcelain, lastCommits, smokeSummary] = await Promise.all([
    getBranch(),
    runGit(["status", "--short", "--branch"], "unknown"),
    runGit(["status", "--porcelain"], ""),
    runGit(["log", "--oneline", "-5"], "unknown"),
    getSmokeSummary(),
  ]);

  const report = buildReport({
    branch,
    statusSummary,
    isClean: porcelain.length === 0,
    lastCommits,
    smokeSummary,
  });

  const clipboardStatus = await copyToClipboard(report);
  console.log(report);
  console.log("");
  console.log(clipboardStatus);
}

main().catch((error) => {
  console.error(`Failed to generate handoff report: ${error.message}`);
  process.exit(1);
});
