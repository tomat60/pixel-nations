#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const workspaceRoot = process.env.PN_OPS_WORKSPACE || "/Users/tomchuck/Desktop/Pixel Nations";
const outDir =
  process.env.PN_OPS_REPORT_DIR ||
  path.join(workspaceRoot, "Audit Bundles", "Ops Reports");

mkdirSync(outDir, { recursive: true });

const now = new Date();
const safeStamp = now.toISOString().replace(/[:.]/g, "-");

const timestampedMdPath = path.join(outDir, `pixel-nations-ops-report-${safeStamp}.md`);
const timestampedJsonPath = path.join(outDir, `pixel-nations-ops-report-${safeStamp}.json`);

const latestMdPath = path.join(outDir, "LATEST_OPS_REPORT.md");
const latestJsonPath = path.join(outDir, "LATEST_OPS_REPORT.json");
const uploadMdPath = path.join(outDir, "UPLOAD_THIS_OPS_REPORT.md");
const pointerPath = path.join(outDir, "UPLOAD_THIS_FILE.txt");

function run(cmd, args = [], options = {}) {
  try {
    return execFileSync(cmd, args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    }).trim();
  } catch (error) {
    const stdout = error.stdout ? String(error.stdout) : "";
    const stderr = error.stderr ? String(error.stderr) : "";
    return `ERROR running ${cmd} ${args.join(" ")}\n${stdout}\n${stderr}`.trim();
  }
}

function readJsonMaybe(filePath) {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readTextMaybe(filePath, maxChars = 12000) {
  try {
    if (!existsSync(filePath)) return "";
    const text = readFileSync(filePath, "utf8");
    return text.length > maxChars ? `${text.slice(0, maxChars)}\n\n[truncated]` : text;
  } catch {
    return "";
  }
}

function listFiles(dir, max = 240) {
  try {
    if (!existsSync(dir)) return [];
    const results = [];
    const walk = (current) => {
      for (const item of readdirSync(current)) {
        const full = path.join(current, item);
        const rel = path.relative(repoRoot, full);
        const st = statSync(full);
        if (st.isDirectory()) {
          walk(full);
        } else {
          results.push(rel);
          if (results.length >= max) return;
        }
      }
    };
    walk(dir);
    return results.sort();
  } catch {
    return [];
  }
}

const branch = run("git", ["branch", "--show-current"]) || process.env.GITHUB_REF_NAME || "unknown";
const status = run("git", ["status", "--short", "--branch"]);
const isClean = !run("git", ["status", "--porcelain"]);
const recentCommits = run("git", ["log", "--oneline", "-20"]);
const remote = run("git", ["remote", "-v"]);
const packageJson = readJsonMaybe(path.join(repoRoot, "package.json"));
const packageScripts = packageJson?.scripts || {};

const handoffTxtPath = path.join(repoRoot, "public", "qa", "latest", "handoff.txt");
const handoffJsonPath = path.join(repoRoot, "public", "qa", "latest", "handoff.json");
const smokeJsonPath = path.join(repoRoot, "public", "qa", "latest", "smoke-result.json");

const handoffText = readTextMaybe(handoffTxtPath);
const handoffJson = readJsonMaybe(handoffJsonPath);
const smokeJson = readJsonMaybe(smokeJsonPath);

const docsFiles = listFiles(path.join(repoRoot, "docs"), 320);
const scriptsFiles = listFiles(path.join(repoRoot, "scripts"), 160);
const qaFiles = listFiles(path.join(repoRoot, "public", "qa", "latest"), 320);

const qaEvidence = handoffJson?.qaEvidenceFreshness || null;
const publicEvidence = handoffJson?.publicQaEvidence || null;
const smokePassed =
  handoffJson?.qa?.smokeResult === "PASS" ||
  smokeJson?.status === "PASS" ||
  smokeJson?.ok === true ||
  /Smoke result:\s*PASS/.test(handoffText);

const risks = [];
if (!isClean) risks.push("Working tree is not clean.");
if (!smokePassed) risks.push("Smoke result is not clearly PASS.");
if (qaEvidence?.status && qaEvidence.status !== "FRESH") risks.push(`QA evidence is ${qaEvidence.status}.`);
if (!qaEvidence) risks.push("QA evidence freshness data missing from handoff JSON.");
if (publicEvidence?.postDeployValidationRequired) risks.push("Public QA evidence says post-deploy validation is required.");
if (!existsSync(handoffTxtPath)) risks.push("handoff.txt missing.");
if (!existsSync(handoffJsonPath)) risks.push("handoff.json missing.");

const recommendation = (() => {
  if (!isClean) return "STOP: clean or commit/revert current repo changes before any strategic or Cursor work.";
  if (!smokePassed) return "STOP: smoke is not PASS. Fix QA before strategy/implementation.";
  if (qaEvidence?.status && qaEvidence.status !== "FRESH") return "STOP: QA evidence is not fresh.";
  return "OK FOR CHATGPT REVIEW: no Cursor required. Upload UPLOAD_THIS_OPS_REPORT.md when asked for an ops report.";
})();

const ciContext = {
  isGitHubActions: process.env.GITHUB_ACTIONS === "true",
  workflow: process.env.GITHUB_WORKFLOW || null,
  runId: process.env.GITHUB_RUN_ID || null,
  runNumber: process.env.GITHUB_RUN_NUMBER || null,
  actor: process.env.GITHUB_ACTOR || null,
  refName: process.env.GITHUB_REF_NAME || null,
  sha: process.env.GITHUB_SHA || null,
};

const report = {
  generatedAt: now.toISOString(),
  repoRoot,
  workspaceRoot,
  outDir,
  ciContext,
  reportPaths: {
    uploadThisMarkdown: uploadMdPath,
    latestMarkdown: latestMdPath,
    latestJson: latestJsonPath,
    timestampedMarkdown: timestampedMdPath,
    timestampedJson: timestampedJsonPath
  },
  branch,
  isClean,
  status,
  recentCommits,
  remote,
  packageScripts,
  handoff: {
    txtPath: handoffTxtPath,
    jsonPath: handoffJsonPath,
    generatedAt: handoffJson?.generatedAt || null,
    branch: handoffJson?.git?.branch || null,
    isClean: handoffJson?.git?.isClean ?? null,
  },
  qa: {
    smokePassed,
    qaEvidenceFreshness: qaEvidence,
    publicQaEvidence: publicEvidence,
  },
  files: {
    docs: docsFiles,
    scripts: scriptsFiles,
    qaLatest: qaFiles,
  },
  risks,
  recommendation,
};

const md = `# Pixel Nations Ops Report

Generated: ${report.generatedAt}

## Upload Instruction

Upload this file to ChatGPT when asked for the current ops report:

\`${uploadMdPath}\`

This stable filename always points to the newest generated ops report. You no longer need to search for the latest timestamped file.

## Execution Context

- GitHub Actions: **${ciContext.isGitHubActions ? "YES" : "NO"}**
- Workflow: \`${ciContext.workflow || "local"}\`
- Run ID: \`${ciContext.runId || "local"}\`
- Actor: \`${ciContext.actor || "local"}\`
- SHA: \`${ciContext.sha || "local"}\`

## Executive Status

- Repo: \`${repoRoot}\`
- Branch: \`${branch}\`
- Working tree clean: **${isClean ? "YES" : "NO"}**
- Smoke passed: **${smokePassed ? "YES" : "NO"}**
- QA evidence status: **${qaEvidence?.status || "UNKNOWN"}**
- Public QA post-deploy validation required: **${publicEvidence?.postDeployValidationRequired ? "YES" : "NO/UNKNOWN"}**

## Recommendation

${recommendation}

## Risks

${risks.length ? risks.map((risk) => `- ${risk}`).join("\n") : "- No blocking risks detected by ops report."}

## Git Status

\`\`\`
${status}
\`\`\`

## Recent Commits

\`\`\`
${recentCommits}
\`\`\`

## Package Scripts

\`\`\`json
${JSON.stringify(packageScripts, null, 2)}
\`\`\`

## QA Evidence Freshness

\`\`\`json
${JSON.stringify(qaEvidence, null, 2)}
\`\`\`

## Public QA Evidence

\`\`\`json
${JSON.stringify(publicEvidence, null, 2)}
\`\`\`

## Handoff Preview

\`\`\`
${handoffText}
\`\`\`

## Docs Files

${docsFiles.map((file) => `- ${file}`).join("\n")}

## Scripts Files

${scriptsFiles.map((file) => `- ${file}`).join("\n")}

## QA Latest Files

${qaFiles.map((file) => `- ${file}`).join("\n")}
`;

writeFileSync(timestampedMdPath, md);
writeFileSync(timestampedJsonPath, JSON.stringify(report, null, 2));
writeFileSync(latestMdPath, md);
writeFileSync(latestJsonPath, JSON.stringify(report, null, 2));
writeFileSync(uploadMdPath, md);
writeFileSync(pointerPath, `${uploadMdPath}\n`);

console.log("Pixel Nations Ops Report");
console.log(`Generated: ${report.generatedAt}`);
console.log(`Branch: ${branch}`);
console.log(`Working tree clean: ${isClean ? "YES" : "NO"}`);
console.log(`Smoke passed: ${smokePassed ? "YES" : "NO"}`);
console.log(`QA evidence status: ${qaEvidence?.status || "UNKNOWN"}`);
console.log(`Recommendation: ${recommendation}`);
console.log("");
console.log("UPLOAD THIS FILE TO CHATGPT:");
console.log(uploadMdPath);
console.log("");
console.log(`Stable latest MD: ${latestMdPath}`);
console.log(`Stable latest JSON: ${latestJsonPath}`);
console.log(`Timestamped MD: ${timestampedMdPath}`);
console.log(`Timestamped JSON: ${timestampedJsonPath}`);
console.log(`Pointer file: ${pointerPath}`);

