import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const latestDir = path.join(root, "public", "qa", "latest");

const requiredFiles = [
  "handoff.txt",
  "handoff.json",
  "manifest.json",
  "smoke-result.json",
  "report.html",
];

const recommendedScreenshots = [
  "desktop-landing-map-preview.png",
  "mobile-landing-hero.png",
  "desktop-world.png",
  "mobile-world.png",
];

function exists(relativePath) {
  return fs.existsSync(path.join(latestDir, relativePath));
}

function readJson(relativePath) {
  const full = path.join(latestDir, relativePath);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function statusLine(label, ok, detail = "") {
  return `${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`;
}

const lines = [];
let failed = false;

lines.push("# Pixel Nations Visual Gate Report");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");

for (const file of requiredFiles) {
  const ok = exists(file);
  if (!ok) failed = true;
  lines.push(statusLine(`required file: ${file}`, ok));
}

lines.push("");

const smokePath = path.join(latestDir, "smoke-result.json");
if (fs.existsSync(smokePath)) {
  try {
    const smoke = readJson("smoke-result.json");
    const ok = smoke.ok === true || smoke.status === "PASS" || smoke.result === "PASS";
    if (!ok) failed = true;
    lines.push(statusLine("smoke result", ok, JSON.stringify({ ok: smoke.ok, status: smoke.status, result: smoke.result })));
  } catch (error) {
    failed = true;
    lines.push(statusLine("smoke result readable", false, error.message));
  }
}

lines.push("");

for (const shot of recommendedScreenshots) {
  const ok = exists(path.join("screenshots", shot));
  if (!ok) failed = true;
  lines.push(statusLine(`recommended screenshot: ${shot}`, ok));
}

lines.push("");
lines.push("## Manual Visual Verdict Required");
lines.push("");
lines.push("This script does not approve art direction. It only verifies evidence exists.");
lines.push("");
lines.push("Before merge, the assistant must explicitly state:");
lines.push("- Visual QA verdict: ACCEPTED / REJECTED / VISUAL DEBT");
lines.push("- Public evidence status: FRESH / STALE / NOT REQUIRED");
lines.push("- Known issues updated: YES / NO / NOT REQUIRED");
lines.push("");

const outDir = path.join(root, "public", "qa", "latest");
fs.writeFileSync(path.join(outDir, "visual-gate-report.md"), `${lines.join("\n")}\n`);

console.log(lines.join("\n"));

if (failed) {
  process.exitCode = 1;
}
