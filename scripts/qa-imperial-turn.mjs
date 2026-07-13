import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const KEY = "pixelNations.play.v1";
const OUT = "public/qa/play-latest/imperial-turn";
const VIDEOS = `${OUT}/videos`;
const SHOTS = `${OUT}/screenshots`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cases = [
  { posture: "martial", escalation: "raise-border-host", outcome: "show-of-force", action: "reinforce-ridge", alternative: "rotate-patrols", bandChange: true, legacy: true },
  { posture: "mercantile", escalation: "seize-pass-tariffs", outcome: "lock-the-tolls", action: "tighten-inspections", alternative: "subsidize-caravans", bandChange: true, legacy: false },
  { posture: "diplomatic", escalation: "summon-rival-envoys", outcome: "demand-recognition", action: "press-recognition", alternative: "renew-border-charter", bandChange: false, legacy: false },
];

function seed(item) {
  const state = {
    selectedPlotId: "greenvale",
    ownedPlotIds: ["greenvale"],
    ownedSectorIds: ["A-01", "A-02", "A-04"],
    nationDecisionId: "trade-charter",
    frontierIntentId: "northern-pass",
    empireDeclarationId: "aurelian-compact",
    courtCaseDecisionId: "enforce-charter-law",
    rivalResponseDecisionId: "enforce-by-decree",
    conflictEscalationDecisionId: item.escalation,
    standoffDecisionId: item.outcome,
    imperialTurnActionIds: [],
    foundingCeremonySeen: true,
    season: 12,
    view: "council",
    lastEvent: "Imperial cycle ready.",
    resources: { food: 9, timber: 8, stone: 3, influence: 20 },
    completedOrders: ["raise-shelter", "gather-food", "cut-timber", "scout-nearby", "build-storehouse", "open-market", "form-council", "fortify-watch"],
    settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"],
    scoutedPlotIds: ["meadowrun", "old-road", "glasswater", "wolfpine", "eastfold"],
    chronicle: [{ season: 12, title: "Strategic outcome", body: item.outcome }],
    retentionRecords: [
      { season: 1, decisionId: "grain-levy", choiceId: "authority", label: "Set the crown levy", villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
      { season: 2, decisionId: "open-roads", choiceId: "authority", label: "Fortify the border road", villageMarker: "border-watchfires", worldMarker: "fortified-road" },
      { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Patron the scribes", villageMarker: "scribe-desk", worldMarker: "law-stones" },
    ],
  };
  if (item.legacy) delete state.imperialTurnActionIds;
  return state;
}

async function dock(page, view) {
  const button = page.locator(`[data-qa="view-${view}"]`).first();
  await button.waitFor({ state: "visible", timeout: 5000 });
  await button.click({ force: true });
}
async function numberAttr(locator, name) {
  const raw = await locator.getAttribute(name);
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`Invalid ${name}: ${raw}`);
  return value;
}
async function storedCount(page, count) {
  await page.waitForFunction(({ key, count }) => {
    try {
      const state = JSON.parse(window.localStorage.getItem(key) ?? "{}");
      return Array.isArray(state.imperialTurnActionIds) && state.imperialTurnActionIds.length === count;
    } catch { return false; }
  }, { key: KEY, count }, { timeout: 5000 });
}
async function clearRun(page) {
  await page.evaluate((key) => window.localStorage.removeItem(key), KEY);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator('[data-qa="opening-guide"]').waitFor({ state: "visible", timeout: 5000 });
}

async function runCase(browser, item) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: VIDEOS, size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  const video = page.video();
  const screenshots = [];
  try {
    await page.goto(`${URL}/play`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: KEY, state: seed(item) });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

    const panel = page.locator('[data-qa="imperial-turn-panel"][data-turn-count="0"]').first();
    await panel.waitFor({ state: "visible", timeout: 5000 });
    const initialInfluence = await numberAttr(panel, "data-influence");
    const initialPressure = await numberAttr(panel, "data-pressure");
    const choices = page.locator(`[data-qa="imperial-turn-action"][data-posture="${item.posture}"]`);
    if (await choices.count() !== 2) throw new Error(`${item.posture}: expected two actions`);
    await page.locator(`[data-qa="imperial-turn-action"][data-action-id="${item.action}"]`).waitFor({ state: "visible", timeout: 5000 });
    await page.locator(`[data-qa="imperial-turn-action"][data-action-id="${item.alternative}"]`).waitFor({ state: "visible", timeout: 5000 });
    const firstShot = `${item.posture}-01-decision.png`;
    await page.screenshot({ path: `${SHOTS}/${firstShot}`, fullPage: true }); screenshots.push(firstShot);

    await dock(page, "world");
    const startLayer = page.locator('[data-qa="world-imperial-pressure-layer"]').first();
    await startLayer.waitFor({ state: "visible", timeout: 5000 });
    const initialBand = await startLayer.getAttribute("data-pressure-band");
    await page.locator(`[data-qa="world-history-summary"][data-posture="${item.posture}"]`).waitFor({ state: "visible", timeout: 5000 });
    await dock(page, "council");

    const action = () => page.locator(`[data-qa="imperial-turn-action"][data-action-id="${item.action}"]`).first();
    await action().click({ force: true });
    await page.locator('[data-qa="imperial-turn-panel"][data-turn-count="1"]').waitFor({ state: "visible", timeout: 5000 });
    await action().click({ force: true });
    await page.locator('[data-qa="imperial-turn-panel"][data-turn-count="2"]').waitFor({ state: "visible", timeout: 5000 });
    await storedCount(page, 2);
    const secondShot = `${item.posture}-02-turn-two.png`;
    await page.screenshot({ path: `${SHOTS}/${secondShot}`, fullPage: true }); screenshots.push(secondShot);

    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await page.locator('[data-qa="imperial-turn-panel"][data-turn-count="2"]').waitFor({ state: "visible", timeout: 5000 });
    const reloadShot = `${item.posture}-03-reload.png`;
    await page.screenshot({ path: `${SHOTS}/${reloadShot}`, fullPage: true }); screenshots.push(reloadShot);

    await action().click({ force: true });
    await storedCount(page, 3);
    const crisisPanel = page.locator('[data-qa="empire-crisis-panel"]').first();
    if (await crisisPanel.isVisible()) {
      await page.locator('[data-qa="empire-crisis-choice"][data-crisis-recovery="stabilize-influence"]').first().click({ force: true });
      await page.locator('[data-qa="empire-crisis-resolved"][data-crisis-recovery="stabilize-influence"]').first().waitFor({ state: "visible", timeout: 5000 });
    }
    const founderRecord = page.locator(`[data-qa="demo-complete-overlay"][data-posture="${item.posture}"]`).first();
    await founderRecord.waitFor({ state: "visible", timeout: 5000 });
    if (await page.locator('[data-qa="founder-record-turn"]').count() !== 3) throw new Error(`${item.posture}: Founder Record missing turn history`);
    await page.locator('[data-qa="continue-ruling"]').click({ force: true });
    await founderRecord.waitFor({ state: "hidden", timeout: 5000 });

    const summary = page.locator('[data-qa="imperial-turn-summary"][data-turn-count="3"]').first();
    await summary.waitFor({ state: "visible", timeout: 5000 });
    if (await page.locator('[data-qa="imperial-turn-record"]').count() !== 3) throw new Error(`${item.posture}: missing turn history`);
    const finalInfluence = await numberAttr(summary, "data-influence");
    const finalPressure = await numberAttr(summary, "data-pressure");
    if (finalInfluence === initialInfluence || finalPressure === initialPressure) throw new Error(`${item.posture}: metrics did not change`);

    await dock(page, "world");
    const finalLayer = page.locator('[data-qa="world-imperial-pressure-layer"]').first();
    await finalLayer.waitFor({ state: "visible", timeout: 5000 });
    const finalBand = await finalLayer.getAttribute("data-pressure-band");
    if (await numberAttr(finalLayer, "data-pressure") !== finalPressure) throw new Error(`${item.posture}: pressure mismatch`);
    if (item.bandChange && initialBand === finalBand) throw new Error(`${item.posture}: pressure band did not change`);
    await page.locator('[data-qa="world-imperial-turn"][data-turn-count="3"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator(`[data-qa="world-imperial-action-marker"][data-action-id="${item.action}"]`).waitFor({ state: "visible", timeout: 5000 });
    await page.locator(`[data-qa="world-history-summary"][data-posture="${item.posture}"]`).waitFor({ state: "visible", timeout: 5000 });
    await wait(250);
    const worldShot = `${item.posture}-04-world.png`;
    await page.screenshot({ path: `${SHOTS}/${worldShot}`, fullPage: true }); screenshots.push(worldShot);
    await clearRun(page);

    return { posture: item.posture, action: item.action, initialInfluence, finalInfluence, initialPressure, finalPressure, initialBand, finalBand, legacy: item.legacy, screenshots, status: "ok" };
  } finally {
    await context.close().catch(() => {});
    const original = video ? await video.path().catch(() => null) : null;
    if (original) await rename(original, `${VIDEOS}/${item.posture}-imperial-turn.webm`);
  }
}

async function appReady() {
  try { const response = await fetch(URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; }
  catch { return false; }
}
function startApp() { const args = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; return spawn("npm", args, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); }
async function ensureApp() { if (await appReady()) return null; const child = startApp(); child.stdout?.on("data", (data) => process.stdout.write(data)); child.stderr?.on("data", (data) => process.stderr.write(data)); const started = Date.now(); while (Date.now() - started < 30000) { if (await appReady()) return child; await wait(500); } throw new Error(`Timed out waiting for ${URL}`); }
function stopApp(child) { if (!child) return; if (process.platform === "win32") return child.kill("SIGTERM"); try { process.kill(-child.pid, "SIGTERM"); } catch { child.kill("SIGTERM"); } }

async function main() {
  await rm(OUT, { recursive: true, force: true }); await mkdir(VIDEOS, { recursive: true }); await mkdir(SHOTS, { recursive: true });
  const child = await ensureApp(); const browser = await chromium.launch(); const results = [];
  try {
    for (const item of cases) results.push(await runCase(browser, item));
    const videos = cases.map((item) => `${item.posture}-imperial-turn.webm`);
    for (const file of videos) if (!existsSync(`${VIDEOS}/${file}`)) throw new Error(`Missing video ${file}`);
    await writeFile(`${OUT}/turn-summary.json`, `${JSON.stringify({ generatedAt: new Date().toISOString(), results, videos }, null, 2)}\n`);
    console.log(`Imperial-turn evidence written to ${OUT}`);
  } finally { await browser.close().catch(() => {}); stopApp(child); }
}
main().catch((error) => { console.error(error); process.exit(1); });
