import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/imperial-governance";
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];

class QaError extends Error {}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function appRunning() { try { const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; const p = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return p; await wait(500); } throw new QaError(`Timed out waiting for ${APP_URL}`); }
function stopApp(p) { if (!p) return; if (process.platform === "win32") return p.kill("SIGTERM"); try { process.kill(-p.pid, "SIGTERM"); } catch { p.kill("SIGTERM"); } }
async function removeDemoCompleteOverlay(page) { const overlay = page.locator('[data-qa="demo-complete-overlay"]'); if (await overlay.count()) await overlay.evaluateAll((nodes) => nodes.forEach((node) => node.remove())); }
async function readState(page) { await page.waitForFunction((key) => Boolean(window.localStorage.getItem(key)), STORAGE_KEY, { timeout: 10000 }); return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY); }

async function seedVisibleGovernance(page) {
  const base = await readState(page);
  const state = {
    ...base,
    ownedPlotIds: [base.selectedPlotId],
    ownedSectorIds: ["A-01", "A-02", "A-03", "A-04"],
    nationDecisionId: "trade-charter",
    foundingCeremonySeen: true,
    frontierIntentId: "northern-pass",
    empireDeclarationId: "aurelian-compact",
    courtCaseDecisionId: "enforce-charter-law",
    rivalResponseDecisionId: "enforce-by-decree",
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

async function assertRealPlayPage(page, viewportId) {
  const url = page.url();
  if (!url.startsWith(APP_URL)) throw new QaError(`${viewportId}: screenshot page left app URL: ${url}`);
  const bodyText = await page.locator("body").innerText().catch(() => "");
  if (/This page couldn.t load|Reload to try again/i.test(bodyText)) throw new QaError(`${viewportId}: browser error page would be captured as evidence.`);
  const council = page.locator('[data-qa="council-panel"]');
  await council.waitFor({ state: "visible", timeout: 10000 }).catch((error) => { throw new QaError(`${viewportId}: Council panel not visible before screenshot: ${error.message}`); });
  const choice = page.getByRole("button", { name: /Raise the Border Host|Seize the Pass Tariffs|Summon the Rival Envoys/i }).first();
  await choice.waitFor({ state: "visible", timeout: 10000 }).catch((error) => { throw new QaError(`${viewportId}: live governance choice not visible before screenshot: ${error.message}`); });
}

async function main() {
  const appProcess = await ensureApp();
  let browser;
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
      const page = await context.newPage();
      try {
        await page.goto(`${APP_URL}/play?qa-imperial-governance-visual=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
        await seedVisibleGovernance(page);
        await assertRealPlayPage(page, viewport.id);
        await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-imperial-governance.png`, fullPage: true });
      } finally { await context.close(); }
    }
    console.log("Imperial governance visual evidence validated and rewritten from live Council pages.");
  } finally {
    await browser?.close().catch(() => {});
    stopApp(appProcess);
  }
}

main().catch((error) => { console.error(`Imperial governance visual evidence FAIL: ${error.message}`); process.exit(1); });
