import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dismissFounderRecord } from "./qa-founder-record-helper.mjs";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const STORAGE_KEY = "pixelNations.play.v1";
const OUTPUT_DIR = "public/qa/play-latest/branches";
const VIDEO_DIR = `${OUTPUT_DIR}/videos`;
const SCREENSHOT_DIR = `${OUTPUT_DIR}/screenshots`;
const SUMMARY_PATH = `${OUTPUT_DIR}/branch-summary.json`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const branchCases = [
  {
    posture: "martial",
    escalationId: "raise-border-host",
    outcomeId: "show-of-force",
    choiceSelector: '[data-qa="standoff-choice-force"][data-standoff-decision="show-of-force"]',
  },
  {
    posture: "mercantile",
    escalationId: "seize-pass-tariffs",
    outcomeId: "lock-the-tolls",
    choiceSelector: '[data-qa="post-empire-outcome-choice"][data-outcome-id="lock-the-tolls"]',
  },
  {
    posture: "diplomatic",
    escalationId: "summon-rival-envoys",
    outcomeId: "demand-recognition",
    choiceSelector: '[data-qa="post-empire-outcome-choice"][data-outcome-id="demand-recognition"]',
  },
];

function buildSeed(escalationId) {
  return {
    selectedPlotId: "greenvale",
    ownedPlotIds: ["greenvale"],
    ownedSectorIds: ["A-01", "A-02", "A-04"],
    nationDecisionId: "trade-charter",
    frontierIntentId: "northern-pass",
    empireDeclarationId: "aurelian-compact",
    courtCaseDecisionId: "enforce-charter-law",
    rivalResponseDecisionId: "enforce-by-decree",
    conflictEscalationDecisionId: escalationId,
    standoffDecisionId: null,
    foundingCeremonySeen: true,
    season: 12,
    view: "council",
    lastEvent: "Strategic posture selected for branch QA.",
    resources: { food: 9, timber: 8, stone: 3, influence: 20 },
    completedOrders: [
      "raise-shelter",
      "gather-food",
      "cut-timber",
      "scout-nearby",
      "build-storehouse",
      "open-market",
      "form-council",
      "fortify-watch",
    ],
    settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"],
    scoutedPlotIds: ["meadowrun", "old-road", "glasswater", "wolfpine", "eastfold"],
    chronicle: [{ season: 12, title: "Strategic posture selected", body: escalationId }],
    retentionRecords: [
      { season: 1, decisionId: "grain-levy", choiceId: "authority", label: "Set the crown levy", villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
      { season: 2, decisionId: "open-roads", choiceId: "authority", label: "Fortify the border road", villageMarker: "border-watchfires", worldMarker: "fortified-road" },
      { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Patron the scribes", villageMarker: "scribe-desk", worldMarker: "law-stones" },
    ],
  };
}

async function clickDock(page, view) {
  const button = page.locator(`[data-qa="view-${view}"]`).first();
  await button.waitFor({ state: "visible", timeout: 5000 });
  await button.click({ force: true });
}

async function waitForStoredOutcome(page, outcomeId) {
  await page.waitForFunction(
    ({ key, expected }) => {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      try {
        return JSON.parse(raw).standoffDecisionId === expected;
      } catch {
        return false;
      }
    },
    { key: STORAGE_KEY, expected: outcomeId },
    { timeout: 5000 },
  );
}

async function resetStoredRun(page) {
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  await page.locator('[data-qa="aurelian-village-scene"][data-aurelian-stage="camp"]').waitFor({ state: "visible", timeout: 5000 });
  const postureStillVisible = await page.locator('[data-qa="posture-label"]').isVisible().catch(() => false);
  if (postureStillVisible) throw new Error("Posture overlay remained visible after clearing the saved run");
}

async function runBranch(browser, branchCase) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  const video = page.video();
  const screenshots = [];

  try {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.evaluate(
      ({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)),
      { key: STORAGE_KEY, state: buildSeed(branchCase.escalationId) },
    );
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await dismissFounderRecord(page, { depth: "founder-run" });

    await page.locator(`[data-qa="posture-label"][data-posture="${branchCase.posture}"]`).first().waitFor({ state: "visible", timeout: 5000 });
    await page.locator(`[data-qa="post-empire-branch"][data-posture="${branchCase.posture}"][data-outcome="none"]`).waitFor({ state: "visible", timeout: 5000 });
    const decisionShot = `${branchCase.posture}-01-decision.png`;
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${decisionShot}`, fullPage: true });
    screenshots.push(decisionShot);

    const choice = page.locator(branchCase.choiceSelector).first();
    await choice.waitFor({ state: "visible", timeout: 5000 });
    await choice.click({ force: true });
    await page.locator(`[data-qa="post-empire-outcome"][data-outcome-id="${branchCase.outcomeId}"]`).waitFor({ state: "visible", timeout: 5000 });
    await waitForStoredOutcome(page, branchCase.outcomeId);
    const choiceShot = `${branchCase.posture}-02-outcome.png`;
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${choiceShot}`, fullPage: true });
    screenshots.push(choiceShot);

    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await dismissFounderRecord(page, { depth: "founder-run" });
    await page.locator(`[data-qa="post-empire-branch"][data-posture="${branchCase.posture}"][data-outcome="${branchCase.outcomeId}"]`).waitFor({ state: "visible", timeout: 5000 });
    await page.locator(`[data-qa="post-empire-outcome"][data-outcome-id="${branchCase.outcomeId}"]`).waitFor({ state: "visible", timeout: 5000 });

    await clickDock(page, "world");
    await page.locator(`[data-qa="world-posture-signal"][data-posture="${branchCase.posture}"][data-outcome="${branchCase.outcomeId}"]`).waitFor({ state: "visible", timeout: 5000 });
    await page.locator(`[data-qa="world-posture-outcome"][data-outcome-id="${branchCase.outcomeId}"]`).waitFor({ state: "visible", timeout: 5000 });
    await sleep(250);
    const worldShot = `${branchCase.posture}-03-world-after-reload.png`;
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${worldShot}`, fullPage: true });
    screenshots.push(worldShot);

    await resetStoredRun(page);
    await sleep(250);

    return {
      posture: branchCase.posture,
      escalationId: branchCase.escalationId,
      outcomeId: branchCase.outcomeId,
      screenshots,
      status: "ok",
    };
  } finally {
    await context.close().catch(() => {});
    if (video) {
      const original = await video.path().catch(() => null);
      if (original) await rename(original, `${VIDEO_DIR}/${branchCase.posture}-continuous.webm`);
    }
  }
}

async function isAppRunning() {
  try {
    const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

function startAppIfNeeded() {
  const command = existsSync(".next")
    ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"]
    : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
  return spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" });
}

async function waitForApp() {
  const started = Date.now();
  while (Date.now() - started < 30000) {
    if (await isAppRunning()) return;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for ${APP_URL}`);
}

async function ensureApp() {
  if (await isAppRunning()) return null;
  const processRef = startAppIfNeeded();
  processRef.stdout?.on("data", (data) => process.stdout.write(data));
  processRef.stderr?.on("data", (data) => process.stderr.write(data));
  await waitForApp();
  return processRef;
}

function stopApp(processRef) {
  if (!processRef) return;
  if (process.platform === "win32") {
    processRef.kill("SIGTERM");
    return;
  }
  try {
    process.kill(-processRef.pid, "SIGTERM");
  } catch {
    processRef.kill("SIGTERM");
  }
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(VIDEO_DIR, { recursive: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  const appProcess = await ensureApp();
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const branchCase of branchCases) results.push(await runBranch(browser, branchCase));
    const expectedVideos = branchCases.map((item) => `${item.posture}-continuous.webm`);
    for (const filename of expectedVideos) {
      if (!existsSync(`${VIDEO_DIR}/${filename}`)) throw new Error(`Missing branch video: ${filename}`);
    }
    await writeFile(
      SUMMARY_PATH,
      `${JSON.stringify({ generatedAt: new Date().toISOString(), appUrl: APP_URL, results, videos: expectedVideos }, null, 2)}\n`,
    );
    console.log(`Branch evidence written to ${OUTPUT_DIR}`);
  } finally {
    await browser.close().catch(() => {});
    stopApp(appProcess);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
