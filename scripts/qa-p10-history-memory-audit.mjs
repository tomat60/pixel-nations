import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/p10-history-memory-audit";
const REPORT_PATH = `${OUTPUT_DIR}/p10-history-memory-audit-result.json`;
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
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", conclusion: "", viewports: [], screenshots: [] };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, step, message) { if (!condition) throw new QaError(step, message); }
async function appRunning() { try { const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; const p = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return p; await wait(500); } throw new QaError("boot app", `Timed out waiting for ${APP_URL}`); }
function stopApp(p) { if (!p) return; if (process.platform === "win32") return p.kill("SIGTERM"); try { process.kill(-p.pid, "SIGTERM"); } catch { p.kill("SIGTERM"); } }
async function readState(page, step) { await page.waitForFunction((key) => Boolean(window.localStorage.getItem(key)), STORAGE_KEY, { timeout: 10000 }).catch((error) => { throw new QaError(step, `Saved state unavailable: ${error.message}`); }); return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY); }
async function pixelStorage(page) { return page.evaluate(() => Object.fromEntries(Object.keys(window.localStorage).filter((key) => key.startsWith("pixelNations.")).map((key) => [key, window.localStorage.getItem(key)]))); }
async function seedCompletedRun(page) {
  const base = await readState(page, "read fresh state");
  const state = { ...base, ...COMPLETED_STATE, ownedPlotIds: [base.selectedPlotId], resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence: 3 } };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').waitFor({ state: "visible", timeout: 10000 });
}
async function snapshot(page, viewportId, stage) { const shot = `${OUTPUT_DIR}/${viewportId}-${stage}.png`; await page.screenshot({ path: shot, fullPage: false }); result.screenshots.push(shot); }
async function historySurface(page) {
  return page.evaluate(() => {
    const qa = Array.from(document.querySelectorAll('[data-qa]')).map((node) => node.getAttribute('data-qa')).filter(Boolean);
    return {
      founderRecordButton: document.querySelectorAll('[data-qa="open-founder-record"]').length,
      founderOverlay: document.querySelectorAll('[data-qa="demo-complete-overlay"]').length,
      finalLegacy: document.querySelectorAll('[data-qa="founder-record-final-legacy"]').length,
      qaMatchingHistory: qa.filter((value) => /founder|history|archive|legacy/i.test(value)),
      bodyMentionsOldEmpire: /Hold North Ridge|Fortified Frontier Payoff|Your first empire stands/i.test(document.body.innerText),
    };
  });
}
async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  try {
    await page.goto(`${APP_URL}/play?qa-p10-history=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await seedCompletedRun(page);
    const beforeStorage = await pixelStorage(page);
    const before = {
      response: (await page.locator('[data-qa="founder-record-post-crisis-response"]').innerText()).trim(),
      payoff: (await page.locator('[data-qa="founder-record-frontier-payoff"]').innerText()).trim(),
      storageKeys: Object.keys(beforeStorage).sort(),
    };
    assert(before.response === "Hold North Ridge", `${viewport.id}: completed record response`, `Unexpected response ${before.response}`);
    assert(before.payoff.includes("Fortified Frontier Payoff") && before.payoff.toLowerCase().includes("secured"), `${viewport.id}: completed record payoff`, `Unexpected payoff ${before.payoff}`);
    await snapshot(page, viewport.id, "completed-run-record");

    await page.locator('[data-qa="restart-run"]').click();
    await page.locator('[data-qa="second-run-started"]').waitFor({ state: "visible", timeout: 10000 });
    await page.waitForTimeout(300);
    assert((await page.locator('[data-qa="current-objective-text"]').innerText()).trim() === EXPECTED_OBJECTIVE, `${viewport.id}: replay objective`, "Fresh replay objective mismatch.");
    const afterRestartState = await readState(page, `${viewport.id}: restart state`);
    const afterRestartStorage = await pixelStorage(page);
    const afterRestartSurface = await historySurface(page);
    assert(afterRestartState.empireDeclarationId === null, `${viewport.id}: current record reset`, "Current play state still contains completed empire declaration.");
    assert(afterRestartSurface.founderRecordButton === 0 && afterRestartSurface.founderOverlay === 0 && afterRestartSurface.finalLegacy === 0, `${viewport.id}: prior record access after restart`, `Prior Founder Record still has a UI surface: ${JSON.stringify(afterRestartSurface)}`);
    await snapshot(page, viewport.id, "after-restart-no-history");

    await page.locator(viewport.orderSelector).click();
    await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 10000 });
    await page.locator('[data-qa="order-raise-shelter"]').click();
    await page.waitForTimeout(300);
    const afterOrderState = await readState(page, `${viewport.id}: after first order state`);
    const afterOrderSurface = await historySurface(page);
    assert(afterOrderState.completedOrders.includes("raise-shelter"), `${viewport.id}: minimal run2 progress`, "Raise Shelter was not persisted.");
    assert(afterOrderSurface.founderRecordButton === 0 && afterOrderSurface.founderOverlay === 0 && afterOrderSurface.finalLegacy === 0, `${viewport.id}: prior record access after progress`, `Prior Founder Record became accessible after minimal run2 progress: ${JSON.stringify(afterOrderSurface)}`);
    assert(!afterOrderSurface.bodyMentionsOldEmpire, `${viewport.id}: stale old history copy`, "Run-1 legacy text is still visible after minimal run2 progress.");
    await snapshot(page, viewport.id, "run2-first-order-no-history");

    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(300);
    const reloadedState = await readState(page, `${viewport.id}: reload state`);
    const reloadedStorage = await pixelStorage(page);
    const reloadedSurface = await historySurface(page);
    assert(reloadedState.completedOrders.includes("raise-shelter") && reloadedState.empireDeclarationId === null, `${viewport.id}: reload fresh run`, "Reload did not preserve fresh second-history progress.");
    assert(reloadedSurface.founderRecordButton === 0 && reloadedSurface.founderOverlay === 0 && reloadedSurface.finalLegacy === 0, `${viewport.id}: prior record access after reload`, `Prior Founder Record is accessible after reload: ${JSON.stringify(reloadedSurface)}`);
    assert(!reloadedSurface.bodyMentionsOldEmpire, `${viewport.id}: old history after reload`, "Run-1 legacy text reappeared after reload.");
    await snapshot(page, viewport.id, "after-reload-no-history");

    const samePixelKeys = JSON.stringify(Object.keys(afterRestartStorage).sort()) === JSON.stringify(Object.keys(reloadedStorage).sort());
    return {
      viewport,
      status: "PASS",
      before,
      afterRestart: { storageKeys: Object.keys(afterRestartStorage).sort(), surface: afterRestartSurface },
      afterFirstOrder: { surface: afterOrderSurface, completedOrders: afterOrderState.completedOrders },
      afterReload: { storageKeys: Object.keys(reloadedStorage).sort(), surface: reloadedSurface, completedOrders: reloadedState.completedOrders },
      storageKeySetStable: samePixelKeys,
      priorHistoryDiscoverable: false,
    };
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
  result.conclusion = "Completed run-1 Founder Record is not discoverable after Found a New Empire, after first run-2 order, or after reload; the same current-run storage path persists the new history.";
} catch (error) {
  result.status = "FAIL";
  result.blockingStep = error instanceof QaError ? error.step : "unknown";
  result.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  result.generatedAt = new Date().toISOString();
  await mkdir(OUTPUT_DIR, { recursive: true, force: true });
  await writeFile(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`);
  if (browser) await browser.close();
  stopApp(server);
}
console.log(JSON.stringify(result, null, 2));
