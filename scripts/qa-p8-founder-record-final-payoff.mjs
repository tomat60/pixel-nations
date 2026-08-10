import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/p8-founder-record-final-payoff";
const REPORT_PATH = `${OUTPUT_DIR}/p8-founder-record-final-payoff-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];

const COMMON_STATE = {
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
  view: "council",
};

const STAGES = [
  {
    id: "before-response",
    state: { postCrisisResponseId: null, postCrisisFrontierPayoffSecured: false },
    expectResponse: false,
    expectPayoff: false,
  },
  {
    id: "response-unresolved-payoff",
    state: { postCrisisResponseId: "hold-north-ridge", postCrisisFrontierPayoffSecured: false },
    expectResponse: true,
    expectPayoff: false,
  },
  {
    id: "payoff-secured",
    state: { postCrisisResponseId: "hold-north-ridge", postCrisisFrontierPayoffSecured: true },
    expectResponse: true,
    expectPayoff: true,
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

async function seed(page, stageState) {
  const base = await readState(page, "read fresh state");
  const state = {
    ...base,
    ...COMMON_STATE,
    ownedPlotIds: [base.selectedPlotId],
    resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence: 2 },
    ...stageState,
  };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]').waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(300);
}

async function inspectOverlay(page, viewportId, stageId, expectations, reopened = false) {
  const suffix = reopened ? "-reopened" : "";
  const overlay = page.locator('[data-qa="demo-complete-overlay"][data-record-depth="advanced"]');
  const scroll = page.locator('[data-qa="founder-record-scroll"]');
  const actions = page.locator('[data-qa="founder-record-actions"]');
  const response = page.locator('[data-qa="founder-record-post-crisis-response"]');
  const payoff = page.locator('[data-qa="founder-record-frontier-payoff"]');
  const continueButton = page.locator('[data-qa="continue-ruling"]');
  const restartButton = page.locator('[data-qa="restart-run"]');

  await overlay.waitFor({ state: "visible", timeout: 10000 });
  assert((await response.count()) > 0 === expectations.expectResponse, `${viewportId}: ${stageId}${suffix} response`, `Expected response visible=${expectations.expectResponse}.`);
  assert((await payoff.count()) > 0 === expectations.expectPayoff, `${viewportId}: ${stageId}${suffix} payoff`, `Expected payoff visible=${expectations.expectPayoff}.`);

  if (expectations.expectResponse) {
    assert((await response.innerText()).trim() === "Hold North Ridge", `${viewportId}: ${stageId}${suffix} response label`, `Unexpected response label: ${await response.innerText()}`);
  }
  if (expectations.expectPayoff) {
    assert((await payoff.getAttribute("data-secured")) === "true", `${viewportId}: ${stageId}${suffix} secured state`, "Secured payoff block did not declare secured=true.");
    assert((await payoff.innerText()).includes("Fortified Frontier Payoff"), `${viewportId}: ${stageId}${suffix} payoff label`, `Unexpected payoff block: ${await payoff.innerText()}`);
  }

  assert(await continueButton.isVisible(), `${viewportId}: ${stageId}${suffix} continue action`, "Continue Ruling is not visible.");
  assert(await restartButton.isVisible(), `${viewportId}: ${stageId}${suffix} restart action`, "Found a New Empire is not visible.");

  const metrics = await page.evaluate(() => {
    const overlay = document.querySelector('[data-qa="demo-complete-overlay"]');
    const scroll = document.querySelector('[data-qa="founder-record-scroll"]');
    const actions = document.querySelector('[data-qa="founder-record-actions"]');
    if (!(overlay instanceof HTMLElement) || !(scroll instanceof HTMLElement) || !(actions instanceof HTMLElement)) return null;
    const overlayRect = overlay.getBoundingClientRect();
    const actionsRect = actions.getBoundingClientRect();
    return {
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      overlay: { top: overlayRect.top, bottom: overlayRect.bottom, height: overlayRect.height },
      scroll: { scrollTop: scroll.scrollTop, clientHeight: scroll.clientHeight, scrollHeight: scroll.scrollHeight },
      actions: { top: actionsRect.top, bottom: actionsRect.bottom, height: actionsRect.height, fullyVisible: actionsRect.top >= 0 && actionsRect.bottom <= window.innerHeight },
    };
  });
  assert(metrics, `${viewportId}: ${stageId}${suffix} metrics`, "Founder Record metrics unavailable.");
  assert(!metrics.horizontalOverflow, `${viewportId}: ${stageId}${suffix} overflow`, "Horizontal page overflow detected.");
  assert(metrics.actions.fullyVisible, `${viewportId}: ${stageId}${suffix} footer clipping`, "Founder Record action footer is clipped.");
  assert(metrics.scroll.clientHeight > 0 && metrics.scroll.scrollHeight >= metrics.scroll.clientHeight, `${viewportId}: ${stageId}${suffix} scroll`, "Founder Record scroll area is invalid.");

  const shot = `${OUTPUT_DIR}/${viewportId}-${stageId}${suffix}.png`;
  await page.screenshot({ path: shot, fullPage: false });
  result.screenshots.push(shot);

  if (expectations.expectResponse) {
    await response.scrollIntoViewIfNeeded();
    if (expectations.expectPayoff) await payoff.scrollIntoViewIfNeeded();
    const detailShot = `${OUTPUT_DIR}/${viewportId}-${stageId}${suffix}-legacy.png`;
    await page.screenshot({ path: detailShot, fullPage: false });
    result.screenshots.push(detailShot);
  }

  return metrics;
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  const stages = [];
  try {
    await page.goto(`${APP_URL}/play?qa-p8-founder-record=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    for (const stage of STAGES) {
      await seed(page, stage.state);
      const metrics = await inspectOverlay(page, viewport.id, stage.id, stage);
      stages.push({ stage: stage.id, metrics });
    }

    await seed(page, STAGES[2].state);
    await page.locator('[data-qa="continue-ruling"]').click();
    await page.locator('[data-qa="demo-complete-overlay"]').waitFor({ state: "detached", timeout: 10000 });
    const opener = page.locator('[data-qa="open-founder-record"]');
    await opener.waitFor({ state: "visible", timeout: 10000 });
    await opener.click();
    const reopenedMetrics = await inspectOverlay(page, viewport.id, "payoff-secured", STAGES[2], true);
    stages.push({ stage: "payoff-secured-reopened", metrics: reopenedMetrics });

    return { viewport, status: "PASS", stages };
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
