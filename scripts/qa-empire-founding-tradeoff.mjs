import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/empire-founding-tradeoff";
const REPORT_PATH = `${OUTPUT_DIR}/empire-founding-tradeoff-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];
const DECLARATIONS = [
  { id: "aurelian-compact", effect: "+1 Stability; civic consolidation strengthens the imperial charter.", influence: 10, stability: 4, prosperity: 3 },
  { id: "frontier-crown", effect: "+2 Influence, -1 Stability; outward mobilization trades cohesion for reach.", influence: 12, stability: 2, prosperity: 3 },
  { id: "basin-hegemony", effect: "+1 Prosperity, -1 Influence; organized prosperity spends political capital.", influence: 9, stability: 3, prosperity: 4 },
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
async function seedEmpireReady(page, influence = 10) {
  const base = await readState(page, "read fresh state");
  const seed = {
    ...base,
    ownedPlotIds: [base.selectedPlotId],
    ownedSectorIds: ["A-01", "A-02", "A-03", "A-04"],
    nationDecisionId: "trade-charter",
    foundingCeremonySeen: true,
    frontierIntentId: "northern-pass",
    empireDeclarationId: null,
    courtCaseDecisionId: null,
    rivalResponseDecisionId: null,
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
    resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence },
    view: "council",
  };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state: seed });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator('[data-qa="empire-declaration-options"]').waitFor({ state: "visible", timeout: 10000 });
}
async function assertNoHorizontalOverflow(page, step) { const dims = await page.evaluate(() => ({ viewport: window.innerWidth, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth })); assert(Math.max(dims.documentWidth, dims.bodyWidth) <= dims.viewport + 4, step, `Horizontal overflow: viewport ${dims.viewport}, document ${dims.documentWidth}, body ${dims.bodyWidth}`); }
async function runViewport(browser, viewport) {
  const checks = [];
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  async function check(name, action) { try { await action(); checks.push({ name, status: "PASS" }); } catch (error) { checks.push({ name, status: "FAIL", error: error.message }); throw error instanceof QaError ? error : new QaError(`${viewport.id}: ${name}`, error.message); } }
  try {
    await page.goto(`${APP_URL}/play?qa-empire-tradeoff=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    for (const declaration of DECLARATIONS) {
      await seedEmpireReady(page, 10);
      await check(`${declaration.id} previews and applies exact consequence`, async () => {
        const choice = page.locator(`[data-qa="empire-declaration-choice"][data-empire-declaration="${declaration.id}"]`);
        await choice.scrollIntoViewIfNeeded();
        const copy = await choice.innerText();
        assert(copy.includes(declaration.effect), `${viewport.id}: ${declaration.id} preview`, `Missing exact preview: ${declaration.effect}`);
        await choice.click();
        await waitForState(page, `(state) => state.empireDeclarationId === "${declaration.id}"`, `${viewport.id}: ${declaration.id} persist`);
        let state = await readState(page, `${viewport.id}: ${declaration.id} state`);
        assert(state.resources.influence === declaration.influence, `${viewport.id}: ${declaration.id} influence`, `Expected Influence ${declaration.influence}, got ${state.resources.influence}.`);
        assert(state.settlementStability === declaration.stability, `${viewport.id}: ${declaration.id} stability`, `Expected Stability ${declaration.stability}, got ${state.settlementStability}.`);
        assert(state.settlementProsperity === declaration.prosperity, `${viewport.id}: ${declaration.id} prosperity`, `Expected Prosperity ${declaration.prosperity}, got ${state.settlementProsperity}.`);
        assert(state.lastEvent.includes(declaration.effect), `${viewport.id}: ${declaration.id} lastEvent`, "lastEvent does not record the founding consequence.");
        assert(state.chronicle?.[0]?.body?.includes(declaration.effect), `${viewport.id}: ${declaration.id} chronicle`, "Chronicle does not record the founding consequence.");
        await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
        state = await readState(page, `${viewport.id}: ${declaration.id} reload`);
        assert(state.empireDeclarationId === declaration.id && state.settlementStability === declaration.stability && state.settlementProsperity === declaration.prosperity && state.resources.influence === declaration.influence, `${viewport.id}: ${declaration.id} reload persistence`, "Empire founding consequence did not persist through reload.");
        await page.locator('[data-qa="court-case-options"]').waitFor({ state: "visible", timeout: 7000 });
      });
    }
    await seedEmpireReady(page, 0);
    await check("Basin Hegemony clamps Influence at zero", async () => {
      await page.locator('[data-qa="empire-declaration-choice"][data-empire-declaration="basin-hegemony"]').click();
      await waitForState(page, '(state) => state.empireDeclarationId === "basin-hegemony"', `${viewport.id}: basin zero clamp`);
      const state = await readState(page, `${viewport.id}: basin zero state`);
      assert(state.resources.influence === 0, `${viewport.id}: basin zero clamp`, `Influence fell below zero: ${state.resources.influence}.`);
    });
    await check("Empire founding tradeoff has no horizontal overflow", async () => {
      await assertNoHorizontalOverflow(page, `${viewport.id}: overflow`);
      const shot = `${OUTPUT_DIR}/${viewport.id}-empire-founding-tradeoff.png`;
      await page.screenshot({ path: shot, fullPage: true });
      result.screenshots.push(shot);
    });
    return { id: viewport.id, width: viewport.width, height: viewport.height, checks };
  } finally { await context.close(); }
}
async function writeResult(status, error) { result.status = status; result.generatedAt = new Date().toISOString(); if (error) { result.blockingStep = error.step ?? "unknown"; result.error = error.message; } await mkdir(OUTPUT_DIR, { recursive: true }); await writeFile(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`); }
async function main() { const appProcess = await ensureApp(); let browser; try { await rm(OUTPUT_DIR, { recursive: true, force: true }); await mkdir(OUTPUT_DIR, { recursive: true }); browser = await chromium.launch(); for (const viewport of VIEWPORTS) result.viewports.push(await runViewport(browser, viewport)); assert(result.viewports.length === 2, "evidence count", "Desktop and mobile results are required."); assert(result.screenshots.length === 2, "screenshot count", `Expected two screenshots, got ${result.screenshots.length}.`); await writeResult("PASS"); console.log(`Empire founding tradeoff QA PASS. Evidence written to ${OUTPUT_DIR}`); } catch (error) { await writeResult("FAIL", error); console.error(`Empire founding tradeoff QA FAIL at ${result.blockingStep}: ${result.error}`); process.exitCode = 1; } finally { await browser?.close().catch(() => {}); stopApp(appProcess); } process.exit(process.exitCode ?? 0); }
main();
