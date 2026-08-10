import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/p6-current-decision-visibility";
const REPORT_PATH = `${OUTPUT_DIR}/p6-current-decision-visibility-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];

const STAGES = [
  {
    id: "court",
    selector: '[data-qa="court-case-options"]',
    state: { courtCaseDecisionId: null, rivalResponseDecisionId: null, conflictEscalationDecisionId: null, standoffDecisionId: null, imperialTurnActionIds: [] },
  },
  {
    id: "rival",
    selector: '[data-qa="rival-response-options"]',
    state: { courtCaseDecisionId: "enforce-charter-law", rivalResponseDecisionId: null, conflictEscalationDecisionId: null, standoffDecisionId: null, imperialTurnActionIds: [] },
  },
  {
    id: "escalation",
    selector: '[data-qa="conflict-escalation-options"]',
    state: { courtCaseDecisionId: "enforce-charter-law", rivalResponseDecisionId: "enforce-by-decree", conflictEscalationDecisionId: null, standoffDecisionId: null, imperialTurnActionIds: [] },
  },
  {
    id: "standoff",
    selector: '[data-qa="standoff-step"]',
    state: { courtCaseDecisionId: "enforce-charter-law", rivalResponseDecisionId: "enforce-by-decree", conflictEscalationDecisionId: "raise-border-host", standoffDecisionId: null, imperialTurnActionIds: [] },
  },
  {
    id: "imperial-turn-1",
    roleName: /Reinforce the Ridge|Rotate the Patrols/i,
    state: { courtCaseDecisionId: "enforce-charter-law", rivalResponseDecisionId: "enforce-by-decree", conflictEscalationDecisionId: "raise-border-host", standoffDecisionId: "show-of-force", imperialTurnActionIds: [] },
  },
];

class QaError extends Error { constructor(step, message) { super(message); this.step = step; } }
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", viewports: [], screenshots: [] };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, step, message) { if (!condition) throw new QaError(step, message); }
async function appRunning() { try { const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; const p = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return p; await wait(500); } throw new QaError("boot app", `Timed out waiting for ${APP_URL}`); }
function stopApp(p) { if (!p) return; if (process.platform === "win32") return p.kill("SIGTERM"); try { process.kill(-p.pid, "SIGTERM"); } catch { p.kill("SIGTERM"); } }
async function readState(page, step) { await page.waitForFunction((key) => Boolean(window.localStorage.getItem(key)), STORAGE_KEY, { timeout: 10000 }).catch((error) => { throw new QaError(step, `Saved state unavailable: ${error.message}`); }); return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY); }

async function dismissFounderRecordIfPresent(page) {
  const overlay = page.locator('[data-qa="demo-complete-overlay"]');
  if (!(await overlay.count())) return;
  const continueButton = page.locator('[data-qa="continue-ruling"]');
  await continueButton.waitFor({ state: "visible", timeout: 10000 });
  await continueButton.click();
  await overlay.waitFor({ state: "detached", timeout: 10000 });
}

async function seed(page, stageState) {
  const base = await readState(page, "read fresh state");
  const state = {
    ...base,
    ownedPlotIds: [base.selectedPlotId],
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
    resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence: 10 },
    empireCrisisReason: null,
    empireCrisisRecoveryId: null,
    postCrisisCountermoveOrigin: null,
    postCrisisResponseId: null,
    postCrisisFrontierPayoffSecured: false,
    view: "council",
    ...stageState,
  };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await dismissFounderRecordIfPresent(page);
  await page.locator('[data-qa="council-panel"]').waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(450);
}

async function measure(page, viewportId, stage) {
  const target = stage.selector ? page.locator(stage.selector).first() : page.getByRole("button", { name: stage.roleName }).first();
  await target.waitFor({ state: "attached", timeout: 10000 }).catch((error) => { throw new QaError(`${viewportId}: ${stage.id} target`, error.message); });
  const objective = await page.locator('[data-qa="current-objective-text"]').innerText();

  const readMetrics = () => target.evaluate((node) => {
    const council = document.querySelector('[data-qa="council-panel"]');
    if (!(council instanceof HTMLElement)) throw new Error("Council panel missing");
    const targetRect = node.getBoundingClientRect();
    const councilRect = council.getBoundingClientRect();
    const margin = 8;
    const viewportTop = Math.max(councilRect.top + margin, margin);
    const viewportBottom = Math.min(councilRect.bottom - margin, window.innerHeight - margin);
    const viewportLeft = Math.max(councilRect.left + margin, margin);
    const viewportRight = Math.min(councilRect.right - margin, window.innerWidth - margin);
    const fullyVisible = targetRect.top >= viewportTop && targetRect.bottom <= viewportBottom && targetRect.left >= viewportLeft && targetRect.right <= viewportRight;
    const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
    return {
      council: { scrollTop: council.scrollTop, clientHeight: council.clientHeight, scrollHeight: council.scrollHeight, top: councilRect.top, bottom: councilRect.bottom },
      target: { top: targetRect.top, bottom: targetRect.bottom, left: targetRect.left, right: targetRect.right, height: targetRect.height },
      fullyVisible,
      horizontalOverflow,
      viewportHeight: window.innerHeight,
    };
  });

  const first = await readMetrics();
  await page.waitForTimeout(250);
  const second = await readMetrics();
  const scrollDriftPx = Math.abs(second.council.scrollTop - first.council.scrollTop);

  const shot = `${OUTPUT_DIR}/${viewportId}-${stage.id}.png`;
  await page.screenshot({ path: shot, fullPage: false });
  result.screenshots.push(shot);

  assert(second.fullyVisible, `${viewportId}: ${stage.id} visibility`, `Active target is not fully visible inside Council viewport (scrollTop ${second.council.scrollTop}).`);
  assert(!second.horizontalOverflow, `${viewportId}: ${stage.id} overflow`, "Horizontal page overflow detected.");
  assert(scrollDriftPx <= 2, `${viewportId}: ${stage.id} jitter`, `Council scroll drifted ${scrollDriftPx}px after settling.`);

  return { stage: stage.id, objective, initial: first, settled: second, scrollDriftPx };
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  const stages = [];
  try {
    await page.goto(`${APP_URL}/play?qa-p6-current-decision-visibility=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    for (const stage of STAGES) {
      await seed(page, stage.state);
      stages.push(await measure(page, viewport.id, stage));
    }
    return { id: viewport.id, width: viewport.width, height: viewport.height, stages };
  } finally { await context.close(); }
}

async function writeResult(status, error) {
  result.status = status;
  result.generatedAt = new Date().toISOString();
  if (error) { result.blockingStep = error.step ?? "unknown"; result.error = error.message; }
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
    for (const viewport of VIEWPORTS) result.viewports.push(await runViewport(browser, viewport));
    assert(result.viewports.length === 2, "evidence count", "Desktop and mobile results are required.");
    assert(result.viewports.every((viewport) => viewport.stages.length === STAGES.length), "stage count", "Court, Rival, Escalation, Standoff and Imperial Turn 1 evidence are required for both viewports.");
    await writeResult("PASS");
    console.log(`P6 current-decision visibility PASS. Evidence written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`P6 current-decision visibility FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    stopApp(appProcess);
  }
  process.exit(process.exitCode ?? 0);
}

main();
