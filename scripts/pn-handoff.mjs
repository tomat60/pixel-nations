import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";

const execFileAsync = promisify(execFile);

const QA_REPORT_URL = "https://pixel-nations.vercel.app/qa/latest/report.html";
const QA_INDEX_URL = "https://pixel-nations.vercel.app/qa/latest/";
const WORLD_URL = "https://pixel-nations.vercel.app/world";
const HANDOFF_TXT_URL = "https://pixel-nations.vercel.app/qa/latest/handoff.txt";
const HANDOFF_JSON_URL = "https://pixel-nations.vercel.app/qa/latest/handoff.json";
const QA_MANIFEST_URL = "https://pixel-nations.vercel.app/qa/latest/manifest.json";

const SMOKE_RESULT_PATH = "public/qa/latest/smoke-result.json";
const QA_INDEX_PATH = "public/qa/latest/index.html";
const QA_REPORT_PATH = "public/qa/latest/report.html";
const QA_MANIFEST_PATH = "public/qa/latest/manifest.json";
const QA_SCREENSHOTS_PATH = "public/qa/latest/screenshots";
const HANDOFF_TXT_PATH = "public/qa/latest/handoff.txt";
const HANDOFF_JSON_PATH = "public/qa/latest/handoff.json";
const FRESHNESS_TOLERANCE_MS = 2 * 60 * 1000;

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

function parseTimestamp(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  return value instanceof Date ? value.toISOString() : null;
}

function isOlderThan(referenceDate, candidateDate) {
  return referenceDate.getTime() - candidateDate.getTime() > FRESHNESS_TOLERANCE_MS;
}

async function getModifiedAt(path) {
  try {
    return (await stat(path)).mtime;
  } catch {
    return null;
  }
}

async function getScreenshotsModifiedRange() {
  try {
    const entries = await readdir(QA_SCREENSHOTS_PATH, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile() && !entry.name.startsWith("."));

    if (files.length === 0) {
      return {
        exists: existsSync(QA_SCREENSHOTS_PATH),
        count: 0,
        newestModifiedAt: null,
        oldestModifiedAt: null,
      };
    }

    const modifiedDates = await Promise.all(files.map((file) => getModifiedAt(`${QA_SCREENSHOTS_PATH}/${file.name}`)));
    const validDates = modifiedDates.filter((date) => date instanceof Date);

    if (validDates.length === 0) {
      return {
        exists: true,
        count: files.length,
        newestModifiedAt: null,
        oldestModifiedAt: null,
      };
    }

    return {
      exists: true,
      count: files.length,
      newestModifiedAt: new Date(Math.max(...validDates.map((date) => date.getTime()))),
      oldestModifiedAt: new Date(Math.min(...validDates.map((date) => date.getTime()))),
    };
  } catch {
    return {
      exists: false,
      count: 0,
      newestModifiedAt: null,
      oldestModifiedAt: null,
    };
  }
}

async function getQaEvidenceFreshness(smoke) {
  const smokeGeneratedAt = parseTimestamp(smoke?.generatedAt);
  const [reportModifiedAt, manifestModifiedAt, screenshots] = await Promise.all([
    getModifiedAt(QA_REPORT_PATH),
    getModifiedAt(QA_MANIFEST_PATH),
    getScreenshotsModifiedRange(),
  ]);
  const warnings = [];
  let status = "FRESH";

  if (!smokeGeneratedAt) {
    status = "UNKNOWN";
    warnings.push("Smoke result is missing or has no parseable generatedAt timestamp.");
  }

  if (!reportModifiedAt) {
    status = status === "UNKNOWN" ? status : "MISSING";
    warnings.push(`${QA_REPORT_PATH} is missing.`);
  }

  if (!manifestModifiedAt) {
    status = status === "UNKNOWN" ? status : "MISSING";
    warnings.push(`${QA_MANIFEST_PATH} is missing.`);
  }

  if (!screenshots.exists || screenshots.count === 0) {
    status = status === "UNKNOWN" ? status : "MISSING";
    warnings.push(`${QA_SCREENSHOTS_PATH} is missing or empty.`);
  }

  if (screenshots.exists && screenshots.count > 0 && !screenshots.newestModifiedAt) {
    status = status === "MISSING" ? status : "UNKNOWN";
    warnings.push("Screenshot files exist, but their modified times could not be read.");
  }

  if (status === "FRESH" && isOlderThan(smokeGeneratedAt, reportModifiedAt)) {
    status = "STALE";
    warnings.push(`${QA_REPORT_PATH} is older than smoke by more than 2 minutes.`);
  }

  if (status === "FRESH" && isOlderThan(smokeGeneratedAt, screenshots.newestModifiedAt)) {
    status = "STALE";
    warnings.push(`Newest screenshot is older than smoke by more than 2 minutes.`);
  }

  return {
    status,
    smokeGeneratedAt: formatDate(smokeGeneratedAt),
    reportModifiedAt: formatDate(reportModifiedAt),
    manifestModifiedAt: formatDate(manifestModifiedAt),
    screenshotsNewestModifiedAt: formatDate(screenshots.newestModifiedAt),
    screenshotsOldestModifiedAt: formatDate(screenshots.oldestModifiedAt),
    screenshotsCount: screenshots.count,
    toleranceMinutes: FRESHNESS_TOLERANCE_MS / 60000,
    warnings,
  };
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

async function getLocalReportGeneratedAt() {
  const manifest = await readJson(QA_MANIFEST_PATH);
  const manifestGeneratedAt = parseTimestamp(manifest?.generatedAt);

  if (manifestGeneratedAt) {
    return formatDate(manifestGeneratedAt);
  }

  try {
    const report = await readFile(QA_REPORT_PATH, "utf8");
    const match = report.match(/Generated:\s*<code>([^<]+)<\/code>/);
    return formatDate(parseTimestamp(match?.[1]));
  } catch {
    return null;
  }
}

async function getPublicEvidence(generatedAt) {
  const localReportGeneratedAt = await getLocalReportGeneratedAt();

  return {
    localHandoffGeneratedAt: generatedAt,
    localReportGeneratedAt,
    expectedUrls: {
      index: QA_INDEX_URL,
      report: QA_REPORT_URL,
      handoffTxt: HANDOFF_TXT_URL,
      handoffJson: HANDOFF_JSON_URL,
      manifest: QA_MANIFEST_URL,
    },
    postDeployValidationRequired: true,
    validationNote:
      "After deploy, verify the public index, report, handoff TXT, and handoff JSON URLs are reachable and match the current QA evidence window.",
  };
}

function buildPublicEvidenceSummary(publicEvidence) {
  return [
    "Public QA Evidence:",
    `Local handoff generated: ${publicEvidence.localHandoffGeneratedAt}`,
    `Local report generated: ${publicEvidence.localReportGeneratedAt ?? "unknown"}`,
    `Public QA index: ${publicEvidence.expectedUrls.index}`,
    `Public QA report: ${publicEvidence.expectedUrls.report}`,
    `Public handoff TXT: ${publicEvidence.expectedUrls.handoffTxt}`,
    `Public handoff JSON: ${publicEvidence.expectedUrls.handoffJson}`,
    `Public manifest: ${publicEvidence.expectedUrls.manifest}`,
    `Post-deploy validation required: ${publicEvidence.postDeployValidationRequired ? "yes" : "no"}`,
    `Public evidence note: ${publicEvidence.validationNote}`,
  ].join("\n");
}

async function checkPublicEvidenceArtifacts() {
  const checks = [
    { label: "QA index", path: QA_INDEX_PATH, required: true },
    { label: "QA report", path: QA_REPORT_PATH, required: true },
    { label: "Handoff TXT", path: HANDOFF_TXT_PATH, required: true },
    { label: "Handoff JSON", path: HANDOFF_JSON_PATH, required: true },
    { label: "Manifest", path: QA_MANIFEST_PATH, required: true },
  ];

  const screenshots = await getScreenshotsModifiedRange();
  const results = await Promise.all(
    checks.map(async (check) => {
      const modifiedAt = await getModifiedAt(check.path);
      return {
        ...check,
        exists: Boolean(modifiedAt),
        modifiedAt: formatDate(modifiedAt),
      };
    }),
  );

  results.push({
    label: "Screenshots",
    path: QA_SCREENSHOTS_PATH,
    required: true,
    exists: screenshots.exists && screenshots.count > 0,
    modifiedAt: formatDate(screenshots.newestModifiedAt),
    count: screenshots.count,
  });

  const missing = results.filter((item) => item.required && !item.exists);

  console.log("Public QA evidence local artifact check:");
  for (const result of results) {
    const suffix = result.count === undefined ? "" : ` (${result.count} files)`;
    console.log(
      `${result.exists ? "PASS" : "FAIL"} ${result.label}: ${result.path}${suffix}${
        result.modifiedAt ? ` modified ${result.modifiedAt}` : ""
      }`,
    );
  }

  if (missing.length > 0) {
    console.error(`Public QA evidence check FAILED: missing ${missing.map((item) => item.path).join(", ")}`);
    process.exit(1);
  }

  console.log("Public QA evidence check PASS. Public URL reachability still requires post-deploy validation.");
}

function buildFreshnessSummary(freshness) {
  const warning = freshness.warnings.length > 0 ? freshness.warnings.join(" ") : "none";

  return [
    "QA Evidence Freshness:",
    `Smoke generated: ${freshness.smokeGeneratedAt ?? "unknown"}`,
    `Report modified: ${freshness.reportModifiedAt ?? "missing"}`,
    `Manifest modified: ${freshness.manifestModifiedAt ?? "missing"}`,
    `Screenshots newest: ${freshness.screenshotsNewestModifiedAt ?? "missing"}`,
    `Screenshots oldest: ${freshness.screenshotsOldestModifiedAt ?? "missing"}`,
    `Screenshots count: ${freshness.screenshotsCount}`,
    `Evidence status: ${freshness.status}`,
    `Evidence warning: ${warning}`,
  ].join("\n");
}

function buildFreshnessTerminalLine(freshness) {
  if (freshness.status === "FRESH") return "QA evidence status: FRESH";
  return `QA evidence status: ${freshness.status} — ${freshness.warnings.join(" ") || "review evidence freshness before visual approval"}`;
}

function indent(value) {
  if (!value) return "  clean";
  return value
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function buildReport({
  generatedAt,
  branch,
  statusSummary,
  isClean,
  lastCommits,
  smokeSummary,
  freshnessSummary,
  publicEvidenceSummary,
}) {
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

${freshnessSummary}

${publicEvidenceSummary}

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
  if (process.argv.includes("--check-public-evidence")) {
    await checkPublicEvidenceArtifacts();
    return;
  }

  const generatedAt = new Date().toISOString();
  const [branch, statusSummary, porcelain, lastCommits, smoke] = await Promise.all([
    getBranch(),
    runGit(["status", "--short", "--branch"], "unknown"),
    runGit(["status", "--porcelain"], ""),
    runGit(["log", "--oneline", "-5"], "unknown"),
    readSmoke(),
  ]);
  const qaEvidenceFreshness = await getQaEvidenceFreshness(smoke);
  const freshnessSummary = buildFreshnessSummary(qaEvidenceFreshness);
  const publicEvidence = await getPublicEvidence(generatedAt);
  const publicEvidenceSummary = buildPublicEvidenceSummary(publicEvidence);

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
      publicQaIndexUrl: QA_INDEX_URL,
      publicQaReportUrl: QA_REPORT_URL,
      worldUrl: WORLD_URL,
      publicHandoffTxtUrl: HANDOFF_TXT_URL,
      publicHandoffJsonUrl: HANDOFF_JSON_URL,
      publicManifestUrl: QA_MANIFEST_URL,
      localQaReportPath: existsSync(QA_REPORT_PATH) ? resolve(QA_REPORT_PATH) : null,
      localHandoffTxtPath: resolve(HANDOFF_TXT_PATH),
      localHandoffJsonPath: resolve(HANDOFF_JSON_PATH),
    },
    qaEvidenceFreshness,
    publicEvidence,
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
    freshnessSummary,
    publicEvidenceSummary,
  });

  const fileStatus = await writeHandoffFiles(report, payload);
  const clipboardStatus = await copyToClipboard(report);

  console.log(report);
  console.log("");
  console.log(fileStatus);
  console.log(clipboardStatus);
  console.log(buildFreshnessTerminalLine(qaEvidenceFreshness));
}

main().catch((error) => {
  console.error(`Failed to generate handoff report: ${error.message}`);
  process.exit(1);
});
