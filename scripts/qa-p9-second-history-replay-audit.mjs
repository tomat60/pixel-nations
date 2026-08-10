import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/p9-second-history-replay-audit";
const REPORT_PATH = `${OUTPUT_DIR}/p9-second-history-replay-audit-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const EXPECTED_OBJECTIVE = "Issue settlement orders until the camp becomes a visible village.";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false, orderSelector: '[data-qa="village-scene-open-orders-desktop"]' },
  { id: "mobile", width: 390, height: 844, isMobile: true, orderSelector: '[data-qa="village-scene-open-orders"]' },
];

const COMPLETED_STATE = {
  ownedSectorIds: ["A-01", "A-02", "A-03", "A-04"],
  nationDecisionId: "trade-charter",
  foundingCeremonySeen: true,
  frontierIntentId: "northern-pass",
  empireDeclarationId: "aurelian-compact",
  completedOrders: ["raise-shelter", "gather-food", "cut-timber", "scout-nearby", "build-storehouse", "open-market", "form-council", "fortify-watch"],
  settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"],
  settlementWorkers: { fields: 2, workyard: 2, civic: 2 },
  settlementFocusId: "stores",
  settlementStability: 3,
  settlementProsperity: 3,
  retentionRecords: [
    { season: 1, decisionId: "grain-levy", choiceId: "authority", label: "Set the crown levy", villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
    { season: 2, decisionId: "open-roads", choiceId: "freedom", label: "Open the market road", villageMarker: "market-caravans", worldMarker: "open-market-road" },
    { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Patron the scribes", villageMarker: "scribe-desk", worldMarker: "law-stones" },
  ],
  courtCaseDecisionId: "enforce-charter-law",
  rivalResponseDecisionId: "enforce-by-decree",
  conflictEscalationDecisionId: "raise-border-host",
  standoffDecisionId: "show-of-force",
  imperialTurnActionIds: ["reinforce-ridge", "reinforce-ridge", "reinforce-ridge"],
  empireCrisisReason: "low-influence",
  empireCrisisRecoveryId: "stabilize-frontier",
  postCrisisCountermoveOrigin: "stabilize-frontier",
  postCrisisResponseId: "hold-north-ridge",
  postCrisisFrontierPayoffSecured: true,
  view: "council",
};

class QaError extends Error { constructor(step, message) { super(message); this.step = step; } }
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", viewports: [], screenshots: [] };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, step, message) { if (!condition) throw new QaError(step, message); }
async function appRunning() { try { const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; const p = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return p; await wait(500); } throw new QaError("boot app", `Timed out waiting for ${APP_URL}`); }
function stopApp(p) { if (!p) return; if (process.platform === "win32") return p.kill("SIGTERM"); try { process.kill(-p.pid, "SIGTERM"); } catch { p.kill("SIGTERM"); } }
async function readState(page, step) { await page.waitForFunction((key) => Boolean(window.localStorage.getItem(key)), STORAGE_KEY, { timeout: 10000 }).catch((error) => { throw new QaError(step, `Saved state unavailable: ${error.message}`); }); return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY); }
async function seedCompletedRun(page) {
  const base = await readState(page, "read fresh state");
  const state = { ...base, ...COMPLETED_STATE, ownedPlotIds: [base.selectedPlotId], resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence: 3 } };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').waitFor({ state: "visible", timeout: 10000 });
  await page.locator('[data-qa="founder-record-frontier-payoff"][data-secured="true"]').waitFor({ state: "attached", timeout: 10000 });
}
function stateIsFreshReplay(state) {
  return state.view === "village" &&
    Array.isArray(state.ownedPlotIds) && state.ownedPlotIds.length === 1 &&
    Array.isArray(state.completedOrders) && state.completedOrders.length === 0 &&
    Array.isArray(state.settlementMarkers) && state.settlementMarkers.length === 1 && state.settlementMarkers[0] === "camp" &&
    !state.empireDeclarationId && !state.empireCrisisReason && !state.empireCrisisRecoveryId &&
    !state.postCrisisCountermoveOrigin && !state.postCrisisResponseId && state.postCrisisFrontierPayoffSecured === false;
}
async function snapshot(page, viewportId, stage) {
  const shot = `${OUTPUT_DIR}/${viewportId}-${stage}.png`;
  await page.screenshot({ path: shot, fullPage: false });
  result.screenshots.push(shot);
}
async function inspectFreshReplay(page, viewport, stage, expectSecondRunMarker) {
  const objective = page.locator('[data-qa="current-objective-text"]');
  const village = page.locator('[data-qa="aurelian-village-scene"]');
  const orderControl = page.locator(viewport.orderSelector);
  await village.waitFor({ state: "visible", timeout: 10000 });
  await objective.waitFor({ state: "visible", timeout: 10000 });
  assert((await objective.innerText()).trim() === EXPECTED_OBJECTIVE, `${viewport.id}: ${stage} objective`, `Unexpected objective: ${await objective.innerText()}`);
  assert((await page.locator('[data-qa="demo-complete-overlay"]').count()) === 0, `${viewport.id}: ${stage} founder overlay`, "Completed Founder Record remained mounted.");
  assert((await page.locator('[data-qa="founder-record-final-legacy"]').count()) === 0, `${viewport.id}: ${stage} stale legacy`, "Final legacy remained mounted after replay reset.");
  assert((await page.locator('[data-qa="council-panel"]').count()) === 0, `${viewport.id}: ${stage} stale council`, "Council panel remained mounted after replay reset.");
  assert((await page.locator('[data-qa="world-v3-basin-scene"]').count()) === 0, `${viewport.id}: ${stage} stale world`, "World scene remained mounted after replay reset.");
  const markerCount = await page.locator('[data-qa="second-run-started"]').count();
  assert(expectSecondRunMarker ? markerCount === 1 : markerCount === 0, `${viewport.id}: ${stage} second-run marker`, `Expected second-run marker=${expectSecondRunMarker}, found ${markerCount}.`);
  await orderControl.waitFor({ state: "visible", timeout: 10000 });
  const visible = await orderControl.evaluate((element) => { const r = element.getBoundingClientRect(); return r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth; });
  assert(visible, `${viewport.id}: ${stage} first action`, "Issue next order is not fully inside the browser viewport.");
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!horizontalOverflow, `${viewport.id}: ${stage} overflow`, "Horizontal overflow detected.");
  const state = await readState(page, `${viewport.id}: ${stage} persisted state`);
  assert(stateIsFreshReplay(state), `${viewport.id}: ${stage} persisted state`, `Persisted state is not a fresh replay: ${JSON.stringify({ view: state.view, ownedPlotIds: state.ownedPlotIds, completedOrders: state.completedOrders, settlementMarkers: state.settlementMarkers, empireDeclarationId: state.empireDeclarationId, empireCrisisReason: state.empireCrisisReason, empireCrisisRecoveryId: state.empireCrisisRecoveryId, postCrisisCountermoveOrigin: state.postCrisisCountermoveOrigin, postCrisisResponseId: state.postCrisisResponseId, postCrisisFrontierPayoffSecured: state.postCrisisFrontierPayoffSecured })}`);
  await snapshot(page, viewport.id, stage);
  return { objective: (await objective.innerText()).trim(), state: { view: state.view, ownedPlotIds: state.ownedPlotIds, completedOrders: state.completedOrders, settlementMarkers: state.settlementMarkers, empireDeclarationId: state.empireDeclarationId, empireCrisisReason: state.empireCrisisReason, empireCrisisRecoveryId: state.empireCrisisRecoveryId, postCrisisCountermoveOrigin: state.postCrisisCountermoveOrigin, postCrisisResponseId: state.postCrisisResponseId, postCrisisFrontierPayoffSecured: state.postCrisisFrontierPayoffSecured }, firstActionVisible: visible, horizontalOverflow };
}
async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  try {
    await page.goto(`${APP_URL}/play?qa-p9-replay=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await seedCompletedRun(page);
    assert(await page.locator('[data-qa="restart-run"]').isVisible(), `${viewport.id}: restart action`, "Found a New Empire is not visible in final Founder Record.");
    await snapshot(page, viewport.id, "before-restart");
    await page.locator('[data-qa="restart-run"]').click();
    await page.locator('[data-qa="second-run-started"]').waitFor({ state: "visible", timeout: 10000 });
    await page.waitForTimeout(300);
    const immediate = await inspectFreshReplay(page, viewport, "after-restart", true);

    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(300);
    const reloaded = await inspectFreshReplay(page, viewport, "after-reload", false);

    const orderControl = page.locator(viewport.orderSelector);
    await orderControl.click();
    await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 10000 });
    assert((await page.locator('[data-qa="order-raise-shelter"]').count()) === 1, `${viewport.id}: first order`, "Raise Shelter is not available as the first settlement order.");
    await snapshot(page, viewport.id, "orders-opened");

    return { viewport, status: "PASS", immediate, reloaded, firstOrderReachable: true };
  } finally {
    await context.close();
  }
}

let server = null;
let browser = null;
try {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  server = await ensureApp();
  browser = await chromium.launch({ headless: true });
  for (const viewport of VIEWPORTS) result.viewports.push(await runViewport(browser, viewport));
  result.status = "PASS";
} catch (error) {
  result.status = "FAIL";
  result.blockingStep = error instanceof QaError ? error.step : "unknown";
  result.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  result.generatedAt = new Date().toISOString();
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`);
  if (browser) await browser.close();
  stopApp(server);
}

console.log(JSON.stringify(result, null, 2));
