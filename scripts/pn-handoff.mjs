import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";

const execFileAsync = promisify(execFile);

const QA_REPORT_URL = "https://pixel-nations.vercel.app/qa/latest/report.html";
const WORLD_URL = "https://pixel-nations.vercel.app/world";
const HANDOFF_TXT_URL = "https://pixel-nations.vercel.app/qa/latest/handoff.txt";
const HANDOFF_JSON_URL = "https://pixel-nations.vercel.app/qa/latest/handoff.json";

const SMOKE_RESULT_PATH = "public/qa/latest/smoke-result.json";
const QA_REPORT_PATH = "public/qa/latest/report.html";
const HANDOFF_TXT_PATH = "public/qa/latest/handoff.txt";
const HANDOFF_JSON_PATH = "public/qa/latest/handoff.json";

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

async function readSmoke() {
  if (!existsSync(SMOKE_RESULT_PATH)) {
    return {
      status: "not found",
      path: SMOKE_RESULT_PATH,
      note: "run npm run qa:smoke or npm run pn:quick to refresh it",
      summary: [
        "Smoke result: not found",
        `Smoke result path: ${SMOKE_RESULT_PATH}`,
        "Note: run npm run qa:smoke or npm run pn:quick to refresh it.",
      ].join("\n"),
    };
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

    return {
      ...smoke,
      passedSteps: passed,
      totalSteps: steps.length,
      path: SMOKE_RESULT_PATH,
      summary: lines.join("\n"),
    };
  } catch (error) {
    return {
      status: "unreadable",
      path: SMOKE_RESULT_PATH,
      parseError: error.message,
      summary: [
        "Smoke result: unreadable",
        `Smoke result path: ${SMOKE_RESULT_PATH}`,
        `Smoke parse error: ${error.message}`,
      ].join("\n"),
    };
  }
}

function indent(value) {
  if (!value) return "  clean";
  return value
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function buildReport({ generatedAt, branch, statusSummary, isClean, lastCommits, smokeSummary }) {
  const localQaReport = existsSync(QA_REPORT_PATH) ? resolve(QA_REPORT_PATH) : `${QA_REPORT_PATH} (not found)`;
  const localHandoffTxt = resolve(HANDOFF_TXT_PATH);
  const localHandoffJson = resolve(HANDOFF_JSON_PATH);

  return `Pixel Nations Handoff Report
Generated: ${generatedAt}

Branch: ${branch}
Working tree: ${isClean ? "clean" : "has changes"}

Git status:
${indent(statusSummary)}

Last 5 commits:
${indent(lastCommits)}

QA:
${smokeSummary}
Public QA report: ${QA_REPORT_URL}
Public handoff TXT: ${HANDOFF_TXT_URL}
Public handoff JSON: ${HANDOFF_JSON_URL}
World URL: ${WORLD_URL}
Local QA report: ${localQaReport}
Local handoff TXT: ${localHandoffTxt}
Local handoff JSON: ${localHandoffJson}

Next instruction: Upload public/qa/latest/handoff.txt to ChatGPT, paste the public handoff link, or type: raport gotowy.`;
}

async function writeHandoffFiles(report, payload) {
  await mkdir(dirname(HANDOFF_TXT_PATH), { recursive: true });
  await writeFile(HANDOFF_TXT_PATH, report + "\n", "utf8");
  await writeFile(HANDOFF_JSON_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  return `Files: wrote ${HANDOFF_TXT_PATH} and ${HANDOFF_JSON_PATH}.`;
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

    child.on("error", () => settle("Clipboard: pbcopy unavailable; use the handoff file instead."));
    child.on("close", (code) => {
      settle(code === 0 ? "Clipboard: copied to macOS clipboard." : "Clipboard: pbcopy failed; use the handoff file instead.");
    });

    child.stdin.on("error", () => settle("Clipboard: pbcopy failed; use the handoff file instead."));
    child.stdin.end(report);
  });
}

async function main() {
  const generatedAt = new Date().toISOString();
  const [branch, statusSummary, porcelain, lastCommits, smoke] = await Promise.all([
    getBranch(),
    runGit(["status", "--short", "--branch"], "unknown"),
    runGit(["status", "--porcelain"], ""),
    runGit(["log", "--oneline", "-5"], "unknown"),
    readSmoke(),
  ]);

  const payload = {
    project: "Pixel Nations",
    generatedAt,
    branch,
    isClean: porcelain.length === 0,
    git: {
      statusSummary,
      lastCommits,
    },
    qa: {
      smoke,
      publicQaReportUrl: QA_REPORT_URL,
      worldUrl: WORLD_URL,
      publicHandoffTxtUrl: HANDOFF_TXT_URL,
      publicHandoffJsonUrl: HANDOFF_JSON_URL,
      localQaReportPath: existsSync(QA_REPORT_PATH) ? resolve(QA_REPORT_PATH) : null,
      localHandoffTxtPath: resolve(HANDOFF_TXT_PATH),
      localHandoffJsonPath: resolve(HANDOFF_JSON_PATH),
    },
    nextInstruction:
      "Upload public/qa/latest/handoff.txt to ChatGPT, paste the public handoff link, or type: raport gotowy.",
  };

  const report = buildReport({
    generatedAt,
    branch,
    statusSummary,
    isClean: porcelain.length === 0,
    lastCommits,
    smokeSummary: smoke.summary,
  });

  const fileStatus = await writeHandoffFiles(report, payload);
  const clipboardStatus = await copyToClipboard(report);

  console.log(report);
  console.log("");
  console.log(fileStatus);
  console.log(clipboardStatus);
}

main().catch((error) => {
  console.error(`Failed to generate handoff report: ${error.message}`);
  process.exit(1);
});
