import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/founder-run";
const VIDEO_TMP_DIR = `${OUTPUT_DIR}/video-tmp`;
const REPORT_PATH = `${OUTPUT_DIR}/founder-run-result.json`;
const FRICTION_PATH = `${OUTPUT_DIR}/friction-report.json`;
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

const result = {
  status: "RUNNING",
  generatedAt: "",
  appUrl: APP_URL,
  blockingStep: "",
  error: "",
  viewports: [],
};

class FounderRunQaError extends Error {
  constructor(step, message) {
    super(message);
    this.step = step;
  }
}

function createTracker(viewport) {
  return {
    viewport: viewport.id,
    startedAt: Date.now(),
    interactionCount: 0,
    viewSwitches: 0,
    requiredScrolls: 0,
    longestWaitMs: 0,
    longestWaitLabel: "",
    stages: [],
    hiddenPrimaryCtas: [],
  };
}

async function appRunning() {
  try {
    const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function ensureApp() {
  if (await appRunning()) return null;
  const command = existsSync(".next")
    ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"]
    : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
  const processHandle = spawn("npm", command, {
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  processHandle.stdout?.on("data", (data) => process.stdout.write(data));
  processHandle.stderr?.on("data", (data) => process.stderr.write(data));
  const started = Date.now();
  while (Date.now() - started < 30000) {
    if (await appRunning()) return processHandle;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new FounderRunQaError("boot app", `Timed out waiting for ${APP_URL}`);
}

async function writeResult(status, error) {
  result.status = status;
  result.generatedAt = new Date().toISOString();
  if (error) {
    result.blockingStep = error.step ?? "unknown";
    result.error = error.message;
  }
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`);
  await writeFrictionReport();
}

async function writeFrictionReport() {
  const viewportReports = result.viewports.map((viewport) => ({
    id: viewport.id,
    elapsedMs: viewport.elapsedMs,
    purposefulInteractions: viewport.metrics?.interactionCount ?? 0,
    viewSwitches: viewport.metrics?.viewSwitches ?? 0,
    requiredScrolls: viewport.metrics?.requiredScrolls ?? 0,
    longestWaitMs: viewport.metrics?.longestWaitMs ?? 0,
    longestWaitLabel: viewport.metrics?.longestWaitLabel ?? "",
    hiddenPrimaryCtas: viewport.metrics?.hiddenPrimaryCtas ?? [],
  }));
  const recommendations = [];
  for (const viewport of viewportReports) {
    if (viewport.hiddenPrimaryCtas.length) {
      recommendations.push({
        severity: "CAUSES_FIRST_RUN_CONFUSION",
        viewport: viewport.id,
        problem: `Primary actions begin outside the visible viewport: ${viewport.hiddenPrimaryCtas.join(", ")}.`,
      });
    }
    if (viewport.requiredScrolls >= 3) {
      recommendations.push({
        severity: "POLISH_ONLY",
        viewport: viewport.id,
        problem: `${viewport.requiredScrolls} purposeful interactions required scrolling into view.`,
      });
    }
  }
  const deduped = recommendations.filter((item, index, items) =>
    items.findIndex((candidate) => candidate.severity === item.severity && candidate.problem === item.problem) === index,
  ).slice(0, 3);
  const report = {
    classification: result.status === "PASS" ? "EVIDENCE_READY_FOR_REVIEW" : "BLOCKED",
    generatedAt: new Date().toISOString(),
    appUrl: APP_URL,
    viewports: viewportReports,
    recommendations: deduped,
    decisionRule: "Only BLOCKS_CORE_ARC or CAUSES_FIRST_RUN_CONFUSION may open a product correction sprint. Maximum three corrections.",
  };
  await writeFile(FRICTION_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

async function measuredWait(tracker, label, action) {
  const started = Date.now();
  const value = await action();
  const elapsed = Date.now() - started;
  if (elapsed > tracker.longestWaitMs) {
    tracker.longestWaitMs = elapsed;
    tracker.longestWaitLabel = label;
  }
  return value;
}

async function isInsideViewport(locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
  }).catch(() => false);
}

async function clickLocator(locator, step, tracker, { primary = false } = {}) {
  const initiallyVisible = await isInsideViewport(locator);
  if (!initiallyVisible) {
    tracker.requiredScrolls += 1;
    if (primary && !tracker.hiddenPrimaryCtas.includes(step)) tracker.hiddenPrimaryCtas.push(step);
  }
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await measuredWait(tracker, step, () => locator.click({ timeout: 10000 })).catch((error) => {
    throw new FounderRunQaError(step, error.message);
  });
  tracker.interactionCount += 1;
}

async function openView(page, view, tracker) {
  await clickLocator(page.locator(`[data-qa="view-${view}"]`), `open ${view}`, tracker);
  tracker.viewSwitches += 1;
}

async function runOrder(page, orderId, expectedStage, tracker) {
  await openView(page, "orders", tracker);
  await clickLocator(page.locator(`[data-qa="order-${orderId}"]`), `run order ${orderId}`, tracker, { primary: true });
  await measuredWait(tracker, `wait for ${expectedStage}`, () => page.locator(`[data-qa="aurelian-village-scene"][data-aurelian-stage="${expectedStage}"]`).waitFor({
    state: "visible",
    timeout: 10000,
  }));
}

async function claimSector(page, sectorId, tracker) {
  const tile = page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"]`);
  await measuredWait(tracker, `wait for sector ${sectorId}`, () => tile.waitFor({ state: "visible", timeout: 10000 }));
  await clickLocator(tile, `select sector ${sectorId}`, tracker);
  const claimButton = page.locator('[data-qa="claim-sector-button"]');
  await measuredWait(tracker, "wait for claim sector button", () => claimButton.waitFor({ state: "visible", timeout: 10000 }));
  if (await claimButton.isDisabled()) {
    const control = await tile.getAttribute("data-sector-control");
    const eventText = await page.locator('[data-qa="current-objective-text"]').textContent().catch(() => "");
    throw new FounderRunQaError(`claim sector ${sectorId}`, `Claim button disabled. Control: ${control}. Objective: ${eventText}`);
  }
  await clickLocator(claimButton, `claim sector ${sectorId}`, tracker, { primary: true });
  await measuredWait(tracker, `wait for owned sector ${sectorId}`, () => page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"][data-sector-control="owned"]`).waitFor({
    state: "visible",
    timeout: 10000,
  }));
}

async function recordStage(page, tracker, name) {
  const objective = (await page.locator('[data-qa="current-objective-text"]').textContent().catch(() => ""))?.trim() ?? "";
  const view = await page.locator('[data-qa="current-objective"]').getAttribute("data-view").catch(() => "unknown");
  tracker.stages.push({
    name,
    elapsedMs: Date.now() - tracker.startedAt,
    interactionCount: tracker.interactionCount,
    view: view ?? "unknown",
    objective,
  });
}

async function runFounderArc(browser, viewport) {
  const videoDir = `${VIDEO_TMP_DIR}/${viewport.id}`;
  await rm(videoDir, { recursive: true, force: true });
  await mkdir(videoDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    recordVideo: { dir: videoDir },
  });
  const page = await context.newPage();
  const video = page.video();
  const checks = [];
  const tracker = createTracker(viewport);
  let runError = null;

  async function check(name, fn) {
    try {
      await fn();
      checks.push({ name, status: "PASS" });
      await recordStage(page, tracker, name);
    } catch (error) {
      checks.push({ name, status: "FAIL", error: error.message });
      throw error instanceof FounderRunQaError ? error : new FounderRunQaError(name, error.message);
    }
  }

  try {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });

    await check("fresh run opens at Aurelian Camp", async () => {
      await measuredWait(tracker, "wait for Aurelian Camp", () => page.locator('[data-qa="aurelian-village-scene"][data-aurelian-stage="camp"]').waitFor({ state: "visible", timeout: 10000 }));
    });

    await check("settlement reaches the developed stage and forms a council", async () => {
      await runOrder(page, "raise-shelter", "first_shelter", tracker);
      await runOrder(page, "cut-timber", "first_shelter", tracker);
      await runOrder(page, "scout-nearby", "first_shelter", tracker);
      await runOrder(page, "build-storehouse", "developed_settlement", tracker);
      await runOrder(page, "form-council", "developed_settlement", tracker);
    });

    await check("three connected sectors unlock the nation", async () => {
      await openView(page, "world", tracker);
      await measuredWait(tracker, "wait for World map", () => page.locator('[data-qa="world-map-scene"]').waitFor({ state: "visible", timeout: 10000 }));
      await claimSector(page, "A-02", tracker);
      await claimSector(page, "A-03", tracker);
      await openView(page, "council", tracker);
      await measuredWait(tracker, "wait for nation ready", () => page.locator('[data-qa="council-nation-ready"]').waitFor({ state: "visible", timeout: 10000 }));
    });

    await check("nation ceremony leads to one charter action", async () => {
      await clickLocator(page.locator('[data-qa="found-nation-choice"][data-decision-id="trade-charter"]'), "found trade-charter nation", tracker, { primary: true });
      await measuredWait(tracker, "wait for founding ceremony", () => page.locator('[data-qa="founding-ceremony"]').waitFor({ state: "visible", timeout: 10000 }));
      await clickLocator(page.locator('[data-qa="dismiss-founding-ceremony"]'), "dismiss founding ceremony", tracker, { primary: true });
      await measuredWait(tracker, "wait for Founder Run accelerator", () => page.locator('[data-qa="founder-run-accelerator"][data-founder-doctrine="trade-charter"]').waitFor({ state: "visible", timeout: 10000 }));
      await clickLocator(page.locator('[data-qa="ratify-founder-charter"]'), "ratify founder charter", tracker, { primary: true });
      await measuredWait(tracker, "wait for first era complete", () => page.locator('[data-qa="council-panel"][data-era-complete="true"]').waitFor({ state: "visible", timeout: 10000 }));
      const records = await page.locator('[data-qa="city-institution-card"]').count();
      if (records !== 3) throw new FounderRunQaError("ratify founder charter", `Expected 3 charter records, got ${records}`);
    });

    await check("frontier objective becomes the empire threshold", async () => {
      await measuredWait(tracker, "wait for frontier options", () => page.locator('[data-qa="frontier-objective-options"]').waitFor({ state: "visible", timeout: 10000 }));
      await clickLocator(page.locator('[data-qa="frontier-objective-choice"][data-frontier-intent="northern-pass"]'), "choose northern frontier", tracker, { primary: true });
      await openView(page, "world", tracker);
      await claimSector(page, "A-04", tracker);
      await openView(page, "council", tracker);
      await measuredWait(tracker, "wait for empire declaration options", () => page.locator('[data-qa="empire-declaration-options"]').waitFor({ state: "visible", timeout: 10000 }));
    });

    await check("empire declaration opens the first Founder Record", async () => {
      await clickLocator(page.locator('[data-qa="empire-declaration-choice"][data-empire-declaration="aurelian-compact"]'), "declare Aurelian Compact", tracker, { primary: true });
      await measuredWait(tracker, "wait for Founder Record", () => page.locator('[data-qa="demo-complete-overlay"][data-record-depth="founder-run"]').waitFor({ state: "visible", timeout: 10000 }));
      const charterRecords = await page.locator('[data-qa="founder-record-charter"]').count();
      if (charterRecords !== 3) throw new FounderRunQaError("Founder Record charter", `Expected 3 Founder Record charter entries, got ${charterRecords}`);
      await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-founder-record.png`, fullPage: true });
    });

    await check("Continue Ruling preserves deeper empire systems", async () => {
      await clickLocator(page.locator('[data-qa="continue-ruling"]'), "continue ruling", tracker, { primary: true });
      await measuredWait(tracker, "dismiss Founder Record", () => page.locator('[data-qa="demo-complete-overlay"]').waitFor({ state: "detached", timeout: 10000 }));
      await measuredWait(tracker, "wait for Charter Courts", () => page.locator('[data-qa="court-case-options"]').waitFor({ state: "visible", timeout: 10000 }));
      await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-continue-ruling.png`, fullPage: true });
    });

    await check("refresh preserves the completed core arc", async () => {
      await page.reload({ waitUntil: "domcontentloaded" });
      await measuredWait(tracker, "restore Founder Record", () => page.locator('[data-qa="demo-complete-overlay"][data-record-depth="founder-run"]').waitFor({ state: "visible", timeout: 10000 }));
      const declaration = await page.locator('[data-qa="demo-complete-overlay"]').getAttribute("data-empire-declaration");
      if (declaration !== "aurelian-compact") throw new FounderRunQaError("refresh preserves core arc", `Unexpected empire declaration: ${declaration}`);
    });

    const elapsedMs = Date.now() - tracker.startedAt;
    if (elapsedMs > 180000) throw new FounderRunQaError("Founder Run duration", `Automated Founder Run exceeded 3 minutes: ${elapsedMs}ms`);

    result.viewports.push({
      id: viewport.id,
      width: viewport.width,
      height: viewport.height,
      elapsedMs,
      checks,
      metrics: {
        interactionCount: tracker.interactionCount,
        viewSwitches: tracker.viewSwitches,
        requiredScrolls: tracker.requiredScrolls,
        longestWaitMs: tracker.longestWaitMs,
        longestWaitLabel: tracker.longestWaitLabel,
        hiddenPrimaryCtas: tracker.hiddenPrimaryCtas,
      },
      stages: tracker.stages,
    });
  } catch (error) {
    runError = error;
    throw error;
  } finally {
    await context.close();
    if (video) {
      const sourcePath = await video.path().catch(() => null);
      if (sourcePath) await copyFile(sourcePath, `${OUTPUT_DIR}/${viewport.id}-founder-run.webm`);
    }
    await writeFile(`${OUTPUT_DIR}/${viewport.id}-stage-timeline.json`, `${JSON.stringify({
      status: runError ? "FAIL" : "PASS",
      viewport,
      stages: tracker.stages,
      metrics: {
        interactionCount: tracker.interactionCount,
        viewSwitches: tracker.viewSwitches,
        requiredScrolls: tracker.requiredScrolls,
        longestWaitMs: tracker.longestWaitMs,
        longestWaitLabel: tracker.longestWaitLabel,
        hiddenPrimaryCtas: tracker.hiddenPrimaryCtas,
      },
    }, null, 2)}\n`);
  }
}

async function main() {
  const appProcess = await ensureApp();
  let browser;
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    await rm(VIDEO_TMP_DIR, { recursive: true, force: true });
    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) await runFounderArc(browser, viewport);
    await writeResult("PASS");
    console.log(`Founder Run QA PASS. Result written to ${REPORT_PATH}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`Founder Run QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    appProcess?.kill();
    await rm(VIDEO_TMP_DIR, { recursive: true, force: true }).catch(() => {});
  }
  process.exit(process.exitCode ?? 0);
}

main();
