import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const STORAGE_KEY = "pixelNations.play.v1";
const OUTPUT_DIR = "public/qa/p5-frontier-recovery-guidance";
const REPORT_PATH = `${OUTPUT_DIR}/p5-frontier-recovery-guidance-result.json`;
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];
const PATHS = [
  { id: "low-stability", missing: "stability", stability: 1, prosperity: 2, focus: "stores", expectedLever: "Secure Stores" },
  { id: "low-prosperity", missing: "prosperity", stability: 2, prosperity: 1, focus: "construction", expectedLever: "Stable" },
];

class P5QaError extends Error {
  constructor(step, message) {
    super(message);
    this.step = step;
  }
}

const result = { status: "RUNNING", generatedAt: "", blockingStep: "", error: "", cases: [] };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, step, message) { if (!condition) throw new P5QaError(step, message); }

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
  const handle = spawn("npm", command, {
    stdio: "pipe",
    shell: process.platform === "win32",
    detached: process.platform !== "win32",
  });
  const started = Date.now();
  while (Date.now() - started < 30000) {
    if (await appRunning()) return handle;
    await wait(500);
  }
  throw new P5QaError("boot app", `Timed out waiting for ${APP_URL}`);
}

function stopApp(handle) {
  if (!handle) return;
  if (process.platform === "win32") return handle.kill("SIGTERM");
  try { process.kill(-handle.pid, "SIGTERM"); } catch { handle.kill("SIGTERM"); }
}

async function readState(page, step) {
  await page.waitForFunction((key) => Boolean(window.localStorage.getItem(key)), STORAGE_KEY, { timeout: 10000 })
    .catch((error) => { throw new P5QaError(step, `Saved state unavailable: ${error.message}`); });
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY);
}

async function seedRecoveryState(page, pathCase) {
  const base = await readState(page, "read fresh state");
  const state = {
    ...base,
    ownedPlotIds: [base.selectedPlotId],
    ownedSectorIds: ["A-01", "A-02", "A-03"],
    nationDecisionId: "trade-charter",
    foundingCeremonySeen: true,
    frontierIntentId: null,
    empireDeclarationId: null,
    completedOrders: ["raise-shelter", "gather-food", "cut-timber", "scout-nearby", "build-storehouse", "open-market", "form-council", "fortify-watch"],
    settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"],
    retentionRecords: [
      { season: 1, decisionId: "grain-levy", choiceId: "authority", label: "Granary Authority", villageMarker: "Granary Authority", worldMarker: "Crown stores" },
      { season: 2, decisionId: "open-roads", choiceId: "freedom", label: "Open Market Road", villageMarker: "Open Market Road", worldMarker: "Open road" },
      { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Scribe House", villageMarker: "Scribe House", worldMarker: "Council record" },
    ],
    settlementWorkers: { fields: 2, workyard: 2, civic: 2 },
    settlementFocusId: pathCase.focus,
    settlementCycles: [],
    settlementStability: pathCase.stability,
    settlementProsperity: pathCase.prosperity,
    resources: { ...base.resources, food: 24, timber: 12, stone: 6, influence: 12 },
    view: "council",
  };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator('[data-qa="nation-health-readiness"][data-frontier-ready="false"]').waitFor({ state: "visible", timeout: 10000 });
}

async function waitForCycle(page, step) {
  await page.waitForFunction((key) => {
    try {
      const state = JSON.parse(window.localStorage.getItem(key) ?? "{}");
      return Array.isArray(state.settlementCycles) && state.settlementCycles.length >= 1;
    } catch {
      return false;
    }
  }, STORAGE_KEY, { timeout: 10000 }).catch((error) => { throw new P5QaError(step, error.message); });
}

async function runCase(browser, viewport, pathCase) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  let clickCount = 0;
  try {
    await page.goto(`${APP_URL}/play?qa-p5=${viewport.id}-${pathCase.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await seedRecoveryState(page, pathCase);

    const objectiveText = (await page.locator('[data-qa="current-objective-text"]').innerText()).trim();
    const councilText = (await page.locator('[data-qa="nation-health-readiness"]').innerText()).trim();
    assert(objectiveText.includes("Recovery season:"), `${viewport.id}/${pathCase.id}: objective guidance`, `Objective is not an actionable recovery plan: ${objectiveText}`);
    assert(objectiveText.includes(pathCase.expectedLever), `${viewport.id}/${pathCase.id}: objective lever`, `Objective does not name expected lever ${pathCase.expectedLever}: ${objectiveText}`);
    assert(councilText.includes(pathCase.expectedLever), `${viewport.id}/${pathCase.id}: council lever`, `Council does not name expected lever ${pathCase.expectedLever}: ${councilText}`);
    assert(!councilText.includes("until the blocked value reaches 2"), `${viewport.id}/${pathCase.id}: passive council copy removed`, `Council still presents passive End season guidance: ${councilText}`);

    const beforeScreenshot = `${OUTPUT_DIR}/${viewport.id}-${pathCase.id}-guidance.png`;
    await page.screenshot({ path: beforeScreenshot, fullPage: true });

    await page.locator('[data-qa="council-open-orders"]').click(); clickCount += 1;
    await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 10000 });
    if (pathCase.missing === "stability") {
      await page.locator('[data-qa="settlement-focus"][data-focus-id="stores"]').click(); clickCount += 1;
    }
    const forecastStatus = (await page.locator('[data-qa="settlement-forecast-status"]').innerText()).trim();
    assert(forecastStatus.toLowerCase() === "stable", `${viewport.id}/${pathCase.id}: stable forecast`, `Expected Stable forecast, got ${forecastStatus}.`);

    const before = await readState(page, `${viewport.id}/${pathCase.id}: before cycle`);
    await page.locator('[data-qa="resolve-settlement-cycle"]').click(); clickCount += 1;
    await waitForCycle(page, `${viewport.id}/${pathCase.id}: cycle persisted`);
    const after = await readState(page, `${viewport.id}/${pathCase.id}: after cycle`);
    const stabilityDelta = after.settlementStability - before.settlementStability;
    const prosperityDelta = after.settlementProsperity - before.settlementProsperity;
    assert(after.settlementStability >= 2 && after.settlementProsperity >= 2, `${viewport.id}/${pathCase.id}: frontier ready`, `Expected health >=2/2 after <=1 stable cycle, got ${after.settlementStability}/${after.settlementProsperity}.`);

    await page.evaluate((key) => {
      const state = JSON.parse(window.localStorage.getItem(key));
      state.view = "council";
      window.localStorage.setItem(key, JSON.stringify(state));
    }, STORAGE_KEY);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.locator('[data-qa="nation-health-readiness"][data-frontier-ready="true"]').waitFor({ state: "visible", timeout: 10000 });

    const afterScreenshot = `${OUTPUT_DIR}/${viewport.id}-${pathCase.id}-ready.png`;
    await page.screenshot({ path: afterScreenshot, fullPage: true });
    return {
      viewport: viewport.id,
      path: pathCase.id,
      blockedStat: pathCase.missing,
      before: { stability: before.settlementStability, prosperity: before.settlementProsperity },
      after: { stability: after.settlementStability, prosperity: after.settlementProsperity },
      deltas: { stability: stabilityDelta, prosperity: prosperityDelta },
      stableCycles: 1,
      clickCount,
      objectiveText,
      councilText,
      screenshots: [beforeScreenshot, afterScreenshot],
      status: "PASS",
    };
  } finally {
    await context.close();
  }
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
}

async function main() {
  const appProcess = await ensureApp();
  let browser;
  try {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) {
      for (const pathCase of PATHS) result.cases.push(await runCase(browser, viewport, pathCase));
    }
    await writeResult("PASS");
    console.log(`P5 frontier recovery guidance QA PASS. Evidence written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`P5 frontier recovery guidance QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    stopApp(appProcess);
  }
  process.exit(process.exitCode ?? 0);
}

main();
