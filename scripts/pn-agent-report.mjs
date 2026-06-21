#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const reportsDir = "reports/agent";
await mkdir(reportsDir, { recursive: true });

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch (e) {
    return "";
  }
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const branch = process.env.GITHUB_REF ? process.env.GITHUB_REF.replace(/^refs\/heads\//, "") : (sh("git rev-parse --abbrev-ref HEAD") || "unknown");
const sha = sh("git rev-parse --short HEAD") || "unknown";
const changed = (sh("git diff --name-only origin/main...HEAD || git show --name-only --pretty=\"\" HEAD || true") || "").split("\n").filter(Boolean);
const smokeResult = (() => {
  try {
    return JSON.parse(sh(`cat public/qa/latest/smoke-result.json 2>/dev/null || echo '{}'`));
  } catch {
    return {};
  }
})();

const ciStatus = {
  github_run_id: process.env.GITHUB_RUN_ID || "",
  github_workflow: process.env.GITHUB_WORKFLOW || "",
};

const prUrl = process.env.PR_URL || "";

const reportPath = path.join(reportsDir, `agent-report-${timestamp}.md`);

const md = [
  `# Agent final report — Autonomous Production v1.3`,
  ``,
  `- Generated: ${new Date().toISOString()}`,
  `- Branch: ${branch}`,
  `- Commit: ${sha}`,
  `- PR: ${prUrl || "none"}`,
  `- CI workflow: ${ciStatus.github_workflow || "unknown"} run ${ciStatus.github_run_id || ""}`,
  ``,
  `## Validation summary`,
  `- Mechanical smoke status: ${smokeResult.status ?? "unknown"}`,
  `- Smoke blocking step: ${smokeResult.blockingStep ?? "n/a"}`,
  `- Smoke error: ${smokeResult.error ?? "n/a"}`,
  ``,
  `## Changed files`,
  ...(changed.length ? changed.map((f) => `- ${f}`) : ["- none detected (or git fetch required)"]),
  ``,
  `## Risks`,
  `- Requires Actions write permission (GITHUB_TOKEN) to commit and push reports back to the branch.`,
  `- If a workflow runs from a fork or with restricted permissions, agent finalize push will fail.`,
  ``,
  `## Next recommended step for PR #1`,
  `- Do NOT merge PR #1 yet. Re-run this updated pipeline against PR #1 with workflow_dispatch and validation=core to confirm long-running behavior. If PR #1 contains gameplay changes, do not modify gameplay here.`,
  ``,
  `---`,
  ``,
  `Raw smoke summary (if available):`,
  "```json",
  JSON.stringify(smokeResult, null, 2),
  "```",
].join("\n");

await writeFile(reportPath, md + "\n");
console.log(`Wrote report: ${reportPath}`);
