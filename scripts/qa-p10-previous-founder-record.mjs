import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/p10-previous-founder-record";
const REPORT_PATH = `${OUTPUT_DIR}/p10-previous-founder-record-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const PREVIOUS_KEY = "pixelNations.previousFounderRecord.v1";
const EXPECTED_OBJECTIVE = "Issue settlement orders until the camp becomes a visible village.";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false, orderSelector: '[data-qa="village-scene-open-orders-desktop"]' },
  { id: "mobile", width: 390, height: 844, isMobile: true, orderSelector: '[data-qa="village-scene-open-orders"]' },
];

const COMPLETED_STATE = {
  ownedSectorIds: ["A-01", "A-02", "A-03", "A-04"], nationDecisionId: "trade-charter", foundingCeremonySeen: true,
  frontierIntentId: "northern-pass", empireDeclarationId: "aurelian-compact",
  completedOrders: ["raise-shelter", "gather-food", "cut-timber", "scout-nearby", "build-storehouse", "open-market", "form-council", "fortify-watch"],
  settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"], settlementWorkers: { fields: 2, workyard: 2, civic: 2 },
  settlementFocusId: "stores", settlementStability: 3, settlementProsperity: 3,
  retentionRecords: [
    { season: 1, decisionId: "grain-levy", choiceId: "authority", label: "Set the crown levy", villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
    { season: 2, decisionId: "open-roads", choiceId: "freedom", label: "Open the market road", villageMarker: "market-caravans", worldMarker: "open-market-road" },
    { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Patron the scribes", villageMarker: "scribe-desk", worldMarker: "law-stones" },
  ],
  courtCaseDecisionId: "enforce-charter-law", rivalResponseDecisionId: "enforce-by-decree", conflictEscalationDecisionId: "raise-border-host", standoffDecisionId: "show-of-force",
  imperialTurnActionIds: ["reinforce-ridge", "reinforce-ridge", "reinforce-ridge"], empireCrisisReason: "low-influence", empireCrisisRecoveryId: "stabilize-frontier",
  postCrisisCountermoveOrigin: "stabilize-frontier", postCrisisResponseId: "hold-north-ridge", postCrisisFrontierPayoffSecured: true, view: "council",
};

class QaError extends Error { constructor(step, message) { super(message); this.step = step; } }
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", viewports: [], screenshots: [] };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, step, message) { if (!condition) throw new QaError(step, message); }
async function appRunning() { try { const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; const p = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return p; await wait(500); } throw new QaError("boot app", `Timed out waiting for ${APP_URL}`); }
function stopApp(p) { if (!p) return; if (process.platform === "win32") return p.kill("SIGTERM"); try { process.kill(-p.pid, "SIGTERM"); } catch { p.kill("SIGTERM"); } }
async function readJson(page, key, step) { await page.waitForFunction((k) => Boolean(window.localStorage.getItem(k)), key, { timeout: 10000 }).catch((error) => { throw new QaError(step, `Storage unavailable: ${error.message}`); }); return page.evaluate((k) => JSON.parse(window.localStorage.getItem(k)), key); }
async function seedCompletedRun(page) { const base = await readJson(page, STORAGE_KEY, "read fresh state"); const state = { ...base, ...COMPLETED_STATE, ownedPlotIds: [base.selectedPlotId], resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence: 3 } }; await page.evaluate(({ key, state, previousKey }) => { window.localStorage.setItem(key, JSON.stringify(state)); window.localStorage.removeItem(previousKey); }, { key: STORAGE_KEY, state, previousKey: PREVIOUS_KEY }); await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 }); await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').waitFor({ state: "visible", timeout: 10000 }); }
async function snapshot(page, viewportId, stage) { const shot = `${OUTPUT_DIR}/${viewportId}-${stage}.png`; await page.screenshot({ path: shot, fullPage: false }); result.screenshots.push(shot); }
async function visibleInViewport(locator) { return locator.evaluate((el) => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth; }); }
async function noHorizontalOverflow(page) { return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth && document.body.scrollWidth <= window.innerWidth); }
async function assertPreviousRecord(page, viewportId, stage) {
  const overlay = page.locator('[data-qa="previous-founder-record-overlay"]');
  await overlay.waitFor({ state: "visible", timeout: 10000 });
  const response = (await page.locator('[data-qa="previous-founder-record-post-crisis-response"]').innerText()).trim();
  const payoff = (await page.locator('[data-qa="previous-founder-record-frontier-payoff"]').innerText()).trim();
  assert(response === "Hold North Ridge", `${viewportId}: ${stage} response`, `Unexpected previous response: ${response}`);
  assert(payoff.includes("Fortified Frontier Payoff") && payoff.toLowerCase().includes("secured"), `${viewportId}: ${stage} payoff`, `Unexpected previous payoff: ${payoff}`);
  assert((await overlay.innerText()).toLowerCase().includes("previous history · read only"), `${viewportId}: ${stage} framing`, "Read-only previous-history framing missing.");
  assert(await visibleInViewport(page.locator('[data-qa="close-previous-founder-record"]')), `${viewportId}: ${stage} close action`, "Previous record close action is clipped/offscreen.");
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  try {
    await page.goto(`${APP_URL}/play?qa-p10-previous=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await seedCompletedRun(page);
    assert((await page.locator('[data-qa="founder-record-post-crisis-response"]').innerText()).trim() === "Hold North Ridge", `${viewport.id}: run1 record`, "Completed run-1 response missing.");
    await snapshot(page, viewport.id, "completed-run1");

    await page.locator('[data-qa="restart-run"]').click();
    await page.locator('[data-qa="second-run-started"]').waitFor({ state: "visible", timeout: 10000 });
    await page.waitForTimeout(300);
    assert((await page.locator('[data-qa="current-objective-text"]').innerText()).trim() === EXPECTED_OBJECTIVE, `${viewport.id}: run2 objective`, "Fresh run-2 objective mismatch.");
    const currentAfterRestart = await readJson(page, STORAGE_KEY, `${viewport.id}: current after restart`);
    const previousAfterRestart = await readJson(page, PREVIOUS_KEY, `${viewport.id}: previous after restart`);
    assert(currentAfterRestart.empireDeclarationId === null && currentAfterRestart.completedOrders.length === 0, `${viewport.id}: isolated current state`, "Completed run leaked into current run state.");
    assert(previousAfterRestart.postCrisisResponse?.label === "Hold North Ridge", `${viewport.id}: previous snapshot`, "Previous record snapshot missing resolved response.");
    const entry = page.locator('[data-qa="open-previous-founder-record"]');
    await entry.waitFor({ state: "visible", timeout: 10000 });
    assert(await visibleInViewport(entry), `${viewport.id}: previous entry visibility`, "Previous Founder Record entry is not initially visible.");
    assert(await noHorizontalOverflow(page), `${viewport.id}: restart overflow`, "Horizontal overflow after restart.");
    await snapshot(page, viewport.id, "run2-entry");

    const stateBeforeOpen = JSON.stringify(await readJson(page, STORAGE_KEY, `${viewport.id}: state before open`));
    await entry.click();
    await assertPreviousRecord(page, viewport.id, "first open");
    await snapshot(page, viewport.id, "previous-record-open");
    await page.locator('[data-qa="close-previous-founder-record"]').click();
    await page.locator('[data-qa="previous-founder-record-overlay"]').waitFor({ state: "detached", timeout: 10000 });
    assert(JSON.stringify(await readJson(page, STORAGE_KEY, `${viewport.id}: state after close`)) === stateBeforeOpen, `${viewport.id}: read-only isolation`, "Opening/closing previous record mutated current run state.");

    await page.locator(viewport.orderSelector).click();
    await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 10000 });
    await page.locator('[data-qa="order-raise-shelter"]').click();
    await page.waitForTimeout(300);
    const afterOrder = await readJson(page, STORAGE_KEY, `${viewport.id}: after Raise Shelter`);
    assert(afterOrder.completedOrders.includes("raise-shelter"), `${viewport.id}: run2 progress`, "Raise Shelter did not persist.");
    assert((await readJson(page, PREVIOUS_KEY, `${viewport.id}: previous after order`)).postCrisisResponse?.label === "Hold North Ridge", `${viewport.id}: previous survives order`, "Previous record changed after current run action.");

    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(300);
    const afterReload = await readJson(page, STORAGE_KEY, `${viewport.id}: after reload`);
    assert(afterReload.completedOrders.includes("raise-shelter") && afterReload.empireDeclarationId === null, `${viewport.id}: current survives reload`, "Current run-2 progress did not survive reload.");
    await page.locator('[data-qa="open-previous-founder-record"]').waitFor({ state: "visible", timeout: 10000 });
    await page.locator('[data-qa="open-previous-founder-record"]').click();
    await assertPreviousRecord(page, viewport.id, "reopen after reload");
    assert(await noHorizontalOverflow(page), `${viewport.id}: reload overflow`, "Horizontal overflow after reload/reopen.");
    await snapshot(page, viewport.id, "reloaded-previous-record");

    return { viewport, status: "PASS", currentCompletedOrdersAfterReload: afterReload.completedOrders, previousResponse: "Hold North Ridge", previousPayoff: "Fortified Frontier Payoff", currentStateIsolated: true, previousRecordPersists: true };
  } finally { await context.close(); }
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
