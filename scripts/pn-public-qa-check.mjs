#!/usr/bin/env node
import { readFileSync } from "node:fs";

const PUBLIC_HANDOFF_URL = "https://pixel-nations.vercel.app/qa/latest/handoff.txt";
const PUBLIC_JSON_URL = "https://pixel-nations.vercel.app/qa/latest/handoff.json";
const PUBLIC_REPORT_URL = "https://pixel-nations.vercel.app/qa/latest/report.html";
const PUBLIC_INDEX_URL = "https://pixel-nations.vercel.app/qa/latest/";
const LOCAL_HANDOFF_PATH = "public/qa/latest/handoff.txt";

function normalizeText(value) {
  return String(value || "").replace(/\r\n/g, "\n").trim();
}

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();
  return {
    url,
    ok: response.ok,
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    text,
  };
}

function extractLine(text, prefix) {
  return text.split(/\r?\n/).find((line) => line.startsWith(prefix)) || "";
}

function extractBlock(text, start, maxLines = 8) {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) => line.trim() === start);
  if (index === -1) return [];
  return lines.slice(index, index + maxLines);
}

function diffPreview(localText, publicText) {
  const localLines = localText.split(/\r?\n/);
  const publicLines = publicText.split(/\r?\n/);
  const max = Math.max(localLines.length, publicLines.length);

  for (let i = 0; i < max; i += 1) {
    if ((localLines[i] || "") !== (publicLines[i] || "")) {
      const start = Math.max(0, i - 4);
      const end = Math.min(max, i + 8);
      return {
        line: i + 1,
        local: localLines.slice(start, end),
        public: publicLines.slice(start, end),
      };
    }
  }

  return null;
}

function printHeader(title) {
  console.log(`\n=== ${title} ===`);
}

const localHandoff = readFileSync(LOCAL_HANDOFF_PATH, "utf8");
const publicHandoff = await fetchText(PUBLIC_HANDOFF_URL);
const publicJson = await fetchText(PUBLIC_JSON_URL).catch((error) => ({ ok: false, status: "FETCH_ERROR", text: String(error) }));
const publicReport = await fetchText(PUBLIC_REPORT_URL).catch((error) => ({ ok: false, status: "FETCH_ERROR", text: String(error) }));
const publicIndex = await fetchText(PUBLIC_INDEX_URL).catch((error) => ({ ok: false, status: "FETCH_ERROR", text: String(error) }));

const localNormalized = normalizeText(localHandoff);
const publicNormalized = normalizeText(publicHandoff.text);
const exactMatch = localNormalized === publicNormalized;

const checks = [
  { label: "public handoff reachable", pass: publicHandoff.ok },
  { label: "public handoff equals local handoff", pass: exactMatch },
  { label: "public handoff working tree clean", pass: publicHandoff.text.includes("Working tree: clean") },
  { label: "public handoff smoke PASS", pass: publicHandoff.text.includes("Smoke result: PASS") },
  { label: "public handoff evidence FRESH", pass: publicHandoff.text.includes("Evidence status: FRESH") },
  { label: "public handoff has 29 screenshots or more", pass: /Screenshots count:\s*(2[9-9]|[3-9]\d+)/.test(publicHandoff.text) },
  { label: "public handoff JSON reachable", pass: publicJson.ok },
  { label: "public QA report reachable", pass: publicReport.ok },
  { label: "public QA index reachable", pass: publicIndex.ok },
];

printHeader("Public QA Check");
for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"} ${check.label}`);
}

printHeader("Local Handoff");
console.log(extractLine(localHandoff, "Generated:"));
console.log(extractLine(localHandoff, "Branch:"));
console.log(extractLine(localHandoff, "Working tree:"));
console.log(extractLine(localHandoff, "Smoke result:"));
console.log(extractLine(localHandoff, "Evidence status:"));
console.log(extractLine(localHandoff, "Screenshots count:"));
console.log(extractBlock(localHandoff, "Last 5 commits:", 7).join("\n"));

printHeader("Public Handoff");
console.log(extractLine(publicHandoff.text, "Generated:"));
console.log(extractLine(publicHandoff.text, "Branch:"));
console.log(extractLine(publicHandoff.text, "Working tree:"));
console.log(extractLine(publicHandoff.text, "Smoke result:"));
console.log(extractLine(publicHandoff.text, "Evidence status:"));
console.log(extractLine(publicHandoff.text, "Screenshots count:"));
console.log(extractBlock(publicHandoff.text, "Last 5 commits:", 7).join("\n"));

if (!exactMatch) {
  const preview = diffPreview(localHandoff, publicHandoff.text);
  printHeader("First Difference");
  console.log(`Line: ${preview?.line ?? "unknown"}`);
  console.log("\nLOCAL:");
  console.log((preview?.local || []).join("\n"));
  console.log("\nPUBLIC:");
  console.log((preview?.public || []).join("\n"));
}

printHeader("Verdict");
if (checks.every((check) => check.pass)) {
  console.log("PUBLIC_QA_CHECK=PASS");
  process.exit(0);
}

console.log("PUBLIC_QA_CHECK=FAIL");
console.log("Stop product work until public QA check passes.");
process.exit(1);
