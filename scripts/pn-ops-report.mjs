#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const workspaceRoot = "/Users/tomchuck/Desktop/Pixel Nations";
const outDir = path.join(workspaceRoot, "Audit Bundles", "Ops Reports");
mkdirSync(outDir, { recursive: true });

const now = new Date();
const safeStamp = now.toISOString().replace(/[:.]/g, "-");
const mdPath = path.join(outDir, `pixel-nations-ops-report-${safeStamp}.md`);
const jsonPath = path.join(outDir, `pixel-nations-ops-report-${safeStamp}.json`);

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

function listFiles(dir, max = 200) {
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

const branch = run("git", ["branch", "--show-current"]);
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

const docsFiles = listFiles(path.join(repoRoot, "docs"), 300);
const scriptsFiles = listFiles(path.join(repoRoot, "scripts"), 120);
const qaFiles = listFiles(path.join(repoRoot, "public", "qa", "latest"), 300);

const qaEvidence = handoffJson?.qaEvidenceFreshness || null;
const publicEvidence = handoffJson?.publicQaEvidence || null;
const smokePassed = handoffJson?.qa?.smokeResult === "PASS" || smokeJson?.status === "PASS" || smokeJson?.ok === true;

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
  return "OK FOR CHATGPT REVIEW: no Cursor required. Use this ops report as current evidence before deciding next sprint.";
})();

const report = {
  generatedAt: now.toISOString(),
  repoRoot,
  workspaceRoot,
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

writeFileSync(mdPath, md);
writeFileSync(jsonPath, JSON.stringify(report, null, 2));

console.log(`Pixel Nations Ops Report`);
console.log(`Generated: ${report.generatedAt}`);
console.log(`Branch: ${branch}`);
console.log(`Working tree clean: ${isClean ? "YES" : "NO"}`);
console.log(`Smoke passed: ${smokePassed ? "YES" : "NO"}`);
console.log(`QA evidence status: ${qaEvidence?.status || "UNKNOWN"}`);
console.log(`Recommendation: ${recommendation}`);
console.log("");
console.log(`Wrote: ${mdPath}`);
console.log(`Wrote: ${jsonPath}`);

