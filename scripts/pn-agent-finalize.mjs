#!/usr/bin/env node
import { execSync } from "node:child_process";

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", encoding: "utf8" }).trim();
  } catch (err) {
    throw new Error(`Command failed: ${cmd}\n${err.message}`);
  }
}

try {
  // Generate report (best-effort)
  sh("node scripts/pn-agent-report.mjs");

  // Configure git for CI committing
  sh('git config user.email "github-actions[bot]@users.noreply.github.com"');
  sh('git config user.name "github-actions[bot]"');

  // Add & commit report files if any
  try { sh("git add reports/agent/*.md || true"); } catch {}
  const status = sh('git status --porcelain || true');
  if (!status) {
    console.log("No report files to commit.");
    process.exit(0);
  }

  try {
    sh('git commit -m "agent: add final report (autonomous-production-v1.3)" || true');
  } catch {}

  // Push (best-effort). If this fails due to permissions, record and exit code 2.
  try {
    sh("git push origin HEAD");
    console.log("Report pushed to origin.");
  } catch (err) {
    console.error("Push failed (likely permission issue). Report is committed locally but not pushed.");
    console.error(err.message);
    process.exitCode = 2;
  }
} catch (err) {
  console.error("Finalize failed:", err.message);
  process.exitCode = 1;
}
