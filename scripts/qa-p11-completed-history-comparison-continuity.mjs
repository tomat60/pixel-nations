import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/p11-completed-history-comparison-continuity";
const REPORT_PATH = `${OUTPUT_DIR}/p11-completed-history-comparison-continuity-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const PREVIOUS_KEY = "pixelNations.previousFounderRecord.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
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
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, conclusion: "", blockingStep: "", error: "", viewports: [], screenshots: [] };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, step, message) { if (!condition) throw new QaError(step, message); }
async function appRunning() { try { const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; const p = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return p; await wait(500); } throw new QaError("boot app", `Timed out waiting for ${APP_URL}`); }
function stopApp(p) { if (!p) return; if (process.platform === "win32") return p.kill("SIGTERM"); try { process.kill(-p.pid, "SIGTERM"); } catch { p.kill("SIGTERM"); } }
async function readJson(page, key, step) { await page.waitForFunction((k) => Boolean(window.localStorage.getItem(k)), key, { timeout: 10000 }).catch((error) => { throw new QaError(step, `Storage unavailable: ${error.message}`); }); return page.evaluate((k) => JSON.parse(window.localStorage.getItem(k)), key); }
async function seedCompletedRun(page, { clearPrevious = false, influence = 3 } = {}) { const base = await readJson(page, STORAGE_KEY, "read fresh state"); const state = { ...base, ...COMPLETED_STATE, ownedPlotIds: [base.selectedPlotId], resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence } }; await page.evaluate(({ key, state, previousKey, clearPrevious }) => { window.localStorage.setItem(key, JSON.stringify(state)); if (clearPrevious) window.localStorage.removeItem(previousKey); }, { key: STORAGE_KEY, state, previousKey: PREVIOUS_KEY, clearPrevious }); await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 }); await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').waitFor({ state: "visible", timeout: 10000 }); }
async function snapshot(page, viewportId, stage) { const shot = `${OUTPUT_DIR}/${viewportId}-${stage}.png`; await page.screenshot({ path: shot, fullPage: false }); result.screenshots.push(shot); }
async function noHorizontalOverflow(page) { return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth && document.body.scrollWidth <= window.innerWidth); }
async function stateFingerprint(page) { const state = await readJson(page, STORAGE_KEY, "read current state fingerprint"); return JSON.stringify({ empireDeclarationId: state.empireDeclarationId, completedOrders: state.completedOrders, postCrisisResponseId: state.postCrisisResponseId, postCrisisFrontierPayoffSecured: state.postCrisisFrontierPayoffSecured, resources: state.resources, chronicle: state.chronicle }); }

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  try {
    await page.goto(`${APP_URL}/play?qa-p11-continuity=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await seedCompletedRun(page, { clearPrevious: true, influence: 3 });
    assert((await page.locator('[data-qa="founder-record-post-crisis-response"]').innerText()).trim() === "Hold North Ridge", `${viewport.id}: run1 record`, "Run-1 Founder Record missing expected final response.");
    await snapshot(page, viewport.id, "run1-completed");

    await page.locator('[data-qa="restart-run"]').click();
    await page.locator('[data-qa="open-previous-founder-record"]').waitFor({ state: "visible", timeout: 10000 });
    const previousAfterRestart = await readJson(page, PREVIOUS_KEY, `${viewport.id}: previous after restart`);
    assert(previousAfterRestart.influence === 3, `${viewport.id}: previous persisted`, "Run-1 Founder Record snapshot was not preserved after real restart.");
    await snapshot(page, viewport.id, "run2-fresh-with-previous-entry");

    await seedCompletedRun(page, { clearPrevious: false, influence: 7 });
    assert(await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').isVisible(), `${viewport.id}: current Founder Record`, "Current run-2 Founder Record is not visible.");
    const currentComparisonButton = page.locator('[data-qa="open-previous-founder-record-from-current"]');
    await currentComparisonButton.waitFor({ state: "visible", timeout: 10000 });
    assert(await noHorizontalOverflow(page), `${viewport.id}: current record overflow`, "Horizontal overflow at run-2 Founder Record.");
    await snapshot(page, viewport.id, "run2-completed-with-comparison-action");

    const beforePreviousOpen = await stateFingerprint(page);
    await currentComparisonButton.click();
    await page.locator('[data-qa="previous-founder-record-overlay"]').waitFor({ state: "visible", timeout: 10000 });
    assert((await page.locator('[data-qa="previous-founder-record-post-crisis-response"]').innerText()).trim() === "Hold North Ridge", `${viewport.id}: previous response`, "Previous record did not show the prior final response.");
    assert((await page.locator('[data-qa="previous-founder-record-frontier-payoff"]').innerText()).includes("Fortified Frontier Payoff"), `${viewport.id}: previous payoff`, "Previous record did not show the prior secured payoff.");
    assert((await page.locator('[data-qa="previous-founder-record-overlay"]').innerText()).includes("Previous history · Read only"), `${viewport.id}: read-only framing`, "Previous record is missing read-only framing.");
    await snapshot(page, viewport.id, "run2-previous-record-open");

    await page.locator('[data-qa="close-previous-founder-record"]').click();
    await page.locator('[data-qa="previous-founder-record-overlay"]').waitFor({ state: "detached", timeout: 10000 });
    assert(await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').isVisible(), `${viewport.id}: current record restored`, "Closing previous record did not return to current Founder Record.");
    assert((await stateFingerprint(page)) === beforePreviousOpen, `${viewport.id}: state isolation`, "Opening/closing previous record mutated current run state.");

    await page.locator('[data-qa="continue-ruling"]').click();
    await page.locator('[data-qa="demo-complete-overlay"]').waitFor({ state: "detached", timeout: 10000 });
    await page.locator('[data-qa="open-previous-founder-record"]').waitFor({ state: "visible", timeout: 10000 });
    await snapshot(page, viewport.id, "run2-after-continue-with-comparison-entry");

    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').waitFor({ state: "visible", timeout: 10000 });
    await page.locator('[data-qa="open-previous-founder-record-from-current"]').waitFor({ state: "visible", timeout: 10000 });
    assert((await readJson(page, PREVIOUS_KEY, `${viewport.id}: previous after reload`)).influence === 3, `${viewport.id}: previous survives reload`, "Previous snapshot did not survive reload.");
    assert((await readJson(page, STORAGE_KEY, `${viewport.id}: current after reload`)).resources.influence === 7, `${viewport.id}: current survives reload`, "Current run-2 state did not survive reload.");
    await snapshot(page, viewport.id, "run2-reload-with-comparison-action");

    await page.locator('[data-qa="restart-run"]').click();
    const replacedPrevious = await readJson(page, PREVIOUS_KEY, `${viewport.id}: replaced previous after next restart`);
    assert(replacedPrevious.influence === 7, `${viewport.id}: single snapshot replacement`, `Expected previous snapshot to be replaced by completed run 2 (influence 7), got ${replacedPrevious.influence}.`);
    assert((await readJson(page, STORAGE_KEY, `${viewport.id}: fresh run3`)).empireDeclarationId == null, `${viewport.id}: fresh next history`, "Next real restart did not begin a fresh history.");
    await page.locator('[data-qa="open-previous-founder-record"]').waitFor({ state: "visible", timeout: 10000 });
    await snapshot(page, viewport.id, "run3-fresh-with-run2-previous");

    return {
      viewport,
      status: "PASS",
      currentAndPreviousReachable: true,
      currentStateIsolated: true,
      survivesContinueRuling: true,
      survivesReload: true,
      singleSnapshotReplacedByNextCompletedHistory: true,
      horizontalOverflow: false,
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
  result.conclusion = "PASS: current and previous completed Founder Records remain independently reachable; comparison access survives Continue Ruling and reload; previous record stays read-only and isolated; the next real restart replaces the single previous snapshot with the just-completed history.";
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