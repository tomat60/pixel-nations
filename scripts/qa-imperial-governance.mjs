import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/imperial-governance";
const REPORT_PATH = `${OUTPUT_DIR}/imperial-governance-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];

const COURT = [
  { label: "Enforce Charter Law", id: "enforce-charter-law", influence: 12, stability: 4, prosperity: 3 },
  { label: "Favor Frontier Settlers", id: "favor-frontier-settlers", influence: 11, stability: 2, prosperity: 4 },
  { label: "Protect Trade Passage", id: "protect-trade-passage", influence: 11, stability: 3, prosperity: 4 },
];
const RIVAL = [
  { label: "Enforce by Decree", id: "enforce-by-decree", influence: 12, stability: 4, prosperity: 2 },
  { label: "Offer Tribute Passage", id: "offer-tribute-passage", influence: 8, stability: 2, prosperity: 4 },
  { label: "Summon Border Assembly", id: "summon-border-assembly", influence: 11, stability: 4, prosperity: 3 },
];
const ESCALATION = [
  { label: "Raise the Border Host", id: "raise-border-host", influence: 11, stability: 4, prosperity: 2 },
  { label: "Seize the Pass Tariffs", id: "seize-pass-tariffs", influence: 13, stability: 3, prosperity: 4 },
  { label: "Summon the Rival Envoys", id: "summon-rival-envoys", influence: 12, stability: 3, prosperity: 4 },
];

class QaError extends Error { constructor(step, message) { super(message); this.step = step; } }
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", viewports: [], screenshots: [] };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, step, message) { if (!condition) throw new QaError(step, message); }
async function appRunning() { try { const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; const p = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return p; await wait(500); } throw new QaError("boot app", `Timed out waiting for ${APP_URL}`); }
function stopApp(p) { if (!p) return; if (process.platform === "win32") return p.kill("SIGTERM"); try { process.kill(-p.pid, "SIGTERM"); } catch { p.kill("SIGTERM"); } }
async function readState(page, step) { await page.waitForFunction((key) => Boolean(window.localStorage.getItem(key)), STORAGE_KEY, { timeout: 10000 }).catch((error) => { throw new QaError(step, `Saved state unavailable: ${error.message}`); }); return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY); }
async function waitForState(page, predicateSource, step) { await page.waitForFunction(({ key, predicateSource }) => { try { const state = JSON.parse(window.localStorage.getItem(key) ?? "{}"); const predicate = new Function("state", `return (${predicateSource})(state);`); return Boolean(predicate(state)); } catch { return false; } }, { key: STORAGE_KEY, predicateSource }, { timeout: 10000 }).catch((error) => { throw new QaError(step, error.message); }); }
async function removeDemoCompleteOverlay(page) { const overlay = page.locator('[data-qa="demo-complete-overlay"]'); if (await overlay.count()) await overlay.evaluateAll((nodes) => nodes.forEach((node) => node.remove())); }

async function seed(page, stage) {
  const base = await readState(page, "read fresh state");
  const state = {
    ...base,
    ownedPlotIds: [base.selectedPlotId],
    ownedSectorIds: ["A-01", "A-02", "A-03", "A-04"],
    nationDecisionId: "trade-charter",
    foundingCeremonySeen: true,
    frontierIntentId: "northern-pass",
    empireDeclarationId: "aurelian-compact",
    courtCaseDecisionId: stage === "court" ? null : "enforce-charter-law",
    rivalResponseDecisionId: stage === "escalation" ? "enforce-by-decree" : null,
    conflictEscalationDecisionId: null,
    standoffDecisionId: null,
    imperialTurnActionIds: [],
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
    view: "council",
  };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await removeDemoCompleteOverlay(page);
}

async function clickChoice(page, choice, field, viewportId, stage) {
  const button = page.getByRole("button", { name: new RegExp(choice.label, "i") }).first();
  await button.waitFor({ state: "visible", timeout: 10000 });
  const text = await button.innerText();
  assert(text.includes("Stability") || text.includes("Prosperity"), `${viewportId}: ${stage} preview ${choice.id}`, `Choice does not preview national-health consequence: ${text}`);
  await button.click();
  await waitForState(page, `(state) => state.${field} === "${choice.id}"`, `${viewportId}: ${stage} persist ${choice.id}`);
  let state = await readState(page, `${viewportId}: ${stage} state ${choice.id}`);
  assert(state.resources.influence === choice.influence, `${viewportId}: ${choice.id} influence`, `Expected Influence ${choice.influence}, got ${state.resources.influence}`);
  assert(state.settlementStability === choice.stability, `${viewportId}: ${choice.id} stability`, `Expected Stability ${choice.stability}, got ${state.settlementStability}`);
  assert(state.settlementProsperity === choice.prosperity, `${viewportId}: ${choice.id} prosperity`, `Expected Prosperity ${choice.prosperity}, got ${state.settlementProsperity}`);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  state = await readState(page, `${viewportId}: ${stage} reload ${choice.id}`);
  assert(state[field] === choice.id && state.resources.influence === choice.influence && state.settlementStability === choice.stability && state.settlementProsperity === choice.prosperity, `${viewportId}: ${choice.id} reload persistence`, "Governance consequence did not persist through reload.");
}

async function assertNoHorizontalOverflow(page, step) { const dims = await page.evaluate(() => ({ viewport: window.innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth })); assert(Math.max(dims.documentWidth, dims.bodyWidth) <= dims.viewport + 4, step, `Horizontal overflow: viewport ${dims.viewport}, document ${dims.documentWidth}, body ${dims.bodyWidth}`); }

async function runViewport(browser, viewport) {
  const checks = [];
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  async function check(name, action) { try { await action(); checks.push({ name, status: "PASS" }); } catch (error) { checks.push({ name, status: "FAIL", error: error.message }); throw error instanceof QaError ? error : new QaError(`${viewport.id}: ${name}`, error.message); } }
  try {
    await page.goto(`${APP_URL}/play?qa-imperial-governance=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    for (const choice of COURT) {
      await seed(page, "court");
      await check(`court ${choice.id}`, () => clickChoice(page, choice, "courtCaseDecisionId", viewport.id, "court"));
    }
    for (const choice of RIVAL) {
      await seed(page, "rival");
      await check(`rival ${choice.id}`, () => clickChoice(page, choice, "rivalResponseDecisionId", viewport.id, "rival"));
    }
    for (const choice of ESCALATION) {
      await seed(page, "escalation");
      await check(`escalation ${choice.id}`, () => clickChoice(page, choice, "conflictEscalationDecisionId", viewport.id, "escalation"));
    }
    await seed(page, "escalation");
    await page.getByRole("button", { name: /Raise the Border Host/i }).first().click();
    await waitForState(page, '(state) => state.conflictEscalationDecisionId === "raise-border-host"', `${viewport.id}: later flow`);
    await check("later strategic flow remains reachable", async () => {
      const state = await readState(page, `${viewport.id}: later flow state`);
      assert(state.courtCaseDecisionId && state.rivalResponseDecisionId && state.conflictEscalationDecisionId, `${viewport.id}: later flow`, "Court → Rival → Escalation continuity broke.");
    });
    await check("no horizontal overflow", async () => {
      await assertNoHorizontalOverflow(page, `${viewport.id}: overflow`);
      const shot = `${OUTPUT_DIR}/${viewport.id}-imperial-governance.png`;
      await page.screenshot({ path: shot, fullPage: true });
      result.screenshots.push(shot);
    });
    return { id: viewport.id, width: viewport.width, height: viewport.height, checks };
  } finally { await context.close(); }
}

async function writeResult(status, error) { result.status = status; result.generatedAt = new Date().toISOString(); if (error) { result.blockingStep = error.step ?? "unknown"; result.error = error.message; } await mkdir(OUTPUT_DIR, { recursive: true }); await writeFile(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`); }
async function main() { const appProcess = await ensureApp(); let browser; try { await rm(OUTPUT_DIR, { recursive: true, force: true }); await mkdir(OUTPUT_DIR, { recursive: true }); browser = await chromium.launch(); for (const viewport of VIEWPORTS) result.viewports.push(await runViewport(browser, viewport)); assert(result.viewports.length === 2, "evidence count", "Desktop and mobile results are required."); assert(result.screenshots.length === 2, "screenshot count", `Expected two screenshots, got ${result.screenshots.length}.`); await writeResult("PASS"); console.log(`Imperial governance QA PASS. Evidence written to ${OUTPUT_DIR}`); } catch (error) { await writeResult("FAIL", error); console.error(`Imperial governance QA FAIL at ${result.blockingStep}: ${result.error}`); process.exitCode = 1; } finally { await browser?.close().catch(() => {}); stopApp(appProcess); } process.exit(process.exitCode ?? 0); }
main();
