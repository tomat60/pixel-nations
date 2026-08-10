import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/p11-completed-history-comparison-audit";
const REPORT_PATH = `${OUTPUT_DIR}/p11-completed-history-comparison-audit-result.json`;
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
async function seedCompletedRun(page, { clearPrevious = false } = {}) { const base = await readJson(page, STORAGE_KEY, "read fresh state"); const state = { ...base, ...COMPLETED_STATE, ownedPlotIds: [base.selectedPlotId], resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence: 3 } }; await page.evaluate(({ key, state, previousKey, clearPrevious }) => { window.localStorage.setItem(key, JSON.stringify(state)); if (clearPrevious) window.localStorage.removeItem(previousKey); }, { key: STORAGE_KEY, state, previousKey: PREVIOUS_KEY, clearPrevious }); await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 }); await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').waitFor({ state: "visible", timeout: 10000 }); }
async function snapshot(page, viewportId, stage) { const shot = `${OUTPUT_DIR}/${viewportId}-${stage}.png`; await page.screenshot({ path: shot, fullPage: false }); result.screenshots.push(shot); }
async function noHorizontalOverflow(page) { return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth && document.body.scrollWidth <= window.innerWidth); }

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  try {
    await page.goto(`${APP_URL}/play?qa-p11-comparison=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await seedCompletedRun(page, { clearPrevious: true });
    assert((await page.locator('[data-qa="founder-record-post-crisis-response"]').innerText()).trim() === "Hold North Ridge", `${viewport.id}: run1 record`, "Run-1 Founder Record missing expected final response.");
    await snapshot(page, viewport.id, "run1-completed");

    await page.locator('[data-qa="restart-run"]').click();
    await page.locator('[data-qa="open-previous-founder-record"]').waitFor({ state: "visible", timeout: 10000 });
    const previousAfterRestart = await readJson(page, PREVIOUS_KEY, `${viewport.id}: previous after restart`);
    assert(previousAfterRestart.postCrisisResponse?.label === "Hold North Ridge", `${viewport.id}: previous persisted`, "Previous Founder Record was not persisted after real restart.");
    await snapshot(page, viewport.id, "run2-fresh-with-previous-entry");

    // Preserve the real run-1 snapshot, but advance the active second history to its own completed Founder Record.
    await seedCompletedRun(page, { clearPrevious: false });
    const previousWhileRun2Complete = await readJson(page, PREVIOUS_KEY, `${viewport.id}: previous while run2 complete`);
    assert(previousWhileRun2Complete.postCrisisResponse?.label === "Hold North Ridge", `${viewport.id}: previous still stored`, "Previous Founder Record storage disappeared when run 2 completed.");
    assert(await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').isVisible(), `${viewport.id}: current Founder Record`, "Current run-2 Founder Record is not visible.");
    const entryCountAtCurrentRecord = await page.locator('[data-qa="open-previous-founder-record"]').count();
    assert(entryCountAtCurrentRecord === 0, `${viewport.id}: comparison gap at current record`, `Expected current implementation to hide previous-record entry when founderRecordReady; found ${entryCountAtCurrentRecord}.`);
    assert(await noHorizontalOverflow(page), `${viewport.id}: current record overflow`, "Horizontal overflow at run-2 Founder Record.");
    await snapshot(page, viewport.id, "run2-completed-previous-hidden");

    await page.locator('[data-qa="continue-ruling"]').click();
    await page.locator('[data-qa="demo-complete-overlay"]').waitFor({ state: "detached", timeout: 10000 });
    const entryCountAfterContinue = await page.locator('[data-qa="open-previous-founder-record"]').count();
    assert(entryCountAfterContinue === 0, `${viewport.id}: comparison gap after Continue Ruling`, `Previous-record entry unexpectedly available after current Founder Record dismissed: ${entryCountAfterContinue}.`);
    await snapshot(page, viewport.id, "run2-completed-after-continue-previous-hidden");

    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(300);
    assert((await readJson(page, PREVIOUS_KEY, `${viewport.id}: previous after reload`)).postCrisisResponse?.label === "Hold North Ridge", `${viewport.id}: previous survives reload`, "Previous snapshot did not survive reload.");
    assert(await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').isVisible(), `${viewport.id}: current record after reload`, "Current Founder Record did not restore after reload.");
    const entryCountAfterReload = await page.locator('[data-qa="open-previous-founder-record"]').count();
    assert(entryCountAfterReload === 0, `${viewport.id}: comparison gap after reload`, `Previous-record entry unexpectedly available after reload: ${entryCountAfterReload}.`);
    await snapshot(page, viewport.id, "run2-completed-reload-previous-hidden");

    return {
      viewport,
      status: "PASS",
      previousSnapshotPersists: true,
      currentFounderRecordVisible: true,
      previousEntryAtCompletedRun2: entryCountAtCurrentRecord,
      previousEntryAfterContinueRuling: entryCountAfterContinue,
      previousEntryAfterReload: entryCountAfterReload,
      comparisonAvailableAtCompletedRun2: false,
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
  result.conclusion = "CONFIRMED_GAP: the previous Founder Record remains persisted but its entry disappears as soon as the active second history reaches founderRecordReady, preventing completed-history comparison before the next restart replaces the snapshot.";
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