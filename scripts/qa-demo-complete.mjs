import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const KEY = "pixelNations.play.v1";
const OUT = "public/qa/play-latest/demo-complete";
const VIDEO_DIR = `${OUT}/videos`;
const SHOT_DIR = `${OUT}/screenshots`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function completedSeed() {
  return {
    selectedPlotId: "greenvale",
    ownedPlotIds: ["greenvale"],
    ownedSectorIds: ["A-01", "A-02", "A-04"],
    nationDecisionId: "trade-charter",
    frontierIntentId: "northern-pass",
    empireDeclarationId: "aurelian-compact",
    courtCaseDecisionId: "enforce-charter-law",
    rivalResponseDecisionId: "enforce-by-decree",
    conflictEscalationDecisionId: "raise-border-host",
    standoffDecisionId: "show-of-force",
    imperialTurnActionIds: ["reinforce-ridge", "reinforce-ridge"],
    foundingCeremonySeen: true,
    season: 12,
    view: "council",
    lastEvent: "Imperial Turn 2: Reinforce the Ridge.",
    resources: { food: 9, timber: 8, stone: 3, influence: 24 },
    completedOrders: ["raise-shelter", "gather-food", "cut-timber", "scout-nearby", "build-storehouse", "open-market", "form-council", "fortify-watch"],
    settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"],
    scoutedPlotIds: ["meadowrun", "old-road", "glasswater", "wolfpine", "eastfold"],
    chronicle: [{ season: 12, title: "Imperial Turn 2", body: "Reinforce the Ridge" }],
    retentionRecords: [
      { season: 1, decisionId: "grain-levy", choiceId: "authority", label: "Set the crown levy", villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
      { season: 2, decisionId: "open-roads", choiceId: "authority", label: "Fortify the border road", villageMarker: "border-watchfires", worldMarker: "fortified-road" },
      { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Patron the scribes", villageMarker: "scribe-desk", worldMarker: "law-stones" },
    ],
  };
}

async function storedFresh(page) {
  await page.waitForFunction((key) => {
    try {
      const state = JSON.parse(window.localStorage.getItem(key) ?? "{}");
      return Array.isArray(state.ownedPlotIds) && state.ownedPlotIds.length === 0 && Array.isArray(state.imperialTurnActionIds) && state.imperialTurnActionIds.length === 0 && state.empireDeclarationId === null;
    } catch { return false; }
  }, KEY, { timeout: 5000 });
}

async function appReady() {
  try { const response = await fetch(URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; }
  catch { return false; }
}
function startApp() { const args = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; return spawn("npm", args, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); }
async function ensureApp() { if (await appReady()) return null; const child = startApp(); child.stdout?.on("data", (data) => process.stdout.write(data)); child.stderr?.on("data", (data) => process.stderr.write(data)); const started = Date.now(); while (Date.now() - started < 30000) { if (await appReady()) return child; await wait(500); } throw new Error(`Timed out waiting for ${URL}`); }
function stopApp(child) { if (!child) return; if (process.platform === "win32") return child.kill("SIGTERM"); try { process.kill(-child.pid, "SIGTERM"); } catch { child.kill("SIGTERM"); } }

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(VIDEO_DIR, { recursive: true });
  await mkdir(SHOT_DIR, { recursive: true });
  const child = await ensureApp();
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  const video = page.video();
  const evidence = [];

  try {
    await page.goto(`${URL}/play`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: KEY, state: completedSeed() });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

    await page.locator('[data-qa="current-objective-text"]').getByText(/Imperial Turn 3\/3/i).waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="imperial-turn-action"][data-action-id="reinforce-ridge"]').first().click({ force: true });
    const overlay = page.locator('[data-qa="demo-complete-overlay"]').first();
    await overlay.waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="founder-record-posture"][data-posture="martial"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="founder-record-outcome"][data-outcome="show-of-force"]').waitFor({ state: "visible", timeout: 5000 });
    if (await page.locator('[data-qa="founder-record-turn"]').count() !== 3) throw new Error("Founder Record does not contain three turns");
    await page.getByText(/Mercantile or Diplomatic/i).waitFor({ state: "visible", timeout: 5000 });
    const overlayShot = "01-founder-record.png";
    await page.screenshot({ path: `${SHOT_DIR}/${overlayShot}`, fullPage: true }); evidence.push(overlayShot);

    await page.locator('[data-qa="continue-ruling"]').click({ force: true });
    await overlay.waitFor({ state: "hidden", timeout: 5000 });
    await page.locator('[data-qa="open-founder-record"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="current-objective-text"]').getByText(/first empire stands/i).waitFor({ state: "visible", timeout: 5000 });
    const continueShot = "02-continue-ruling.png";
    await page.screenshot({ path: `${SHOT_DIR}/${continueShot}`, fullPage: true }); evidence.push(continueShot);

    await page.locator('[data-qa="open-founder-record"]').click({ force: true });
    await overlay.waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="restart-run"]').click({ force: true });
    await overlay.waitFor({ state: "hidden", timeout: 5000 });
    await page.locator('[data-qa="opening-guide"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="current-objective-text"]').getByText(/Claim one land/i).waitFor({ state: "visible", timeout: 5000 });
    await storedFresh(page);
    const restartShot = "03-post-restart-fresh.png";
    await page.screenshot({ path: `${SHOT_DIR}/${restartShot}`, fullPage: true }); evidence.push(restartShot);

    await page.locator('[data-qa="plot-greenvale"]').click({ force: true });
    await page.getByRole("button", { name: /Choose this land/i }).first().click({ force: true });
    await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="second-run-started"]').waitFor({ state: "visible", timeout: 5000 });
    const secondShot = "04-second-run-started.png";
    await page.screenshot({ path: `${SHOT_DIR}/${secondShot}`, fullPage: true }); evidence.push(secondShot);

    await writeFile(`${OUT}/demo-summary.json`, `${JSON.stringify({ generatedAt: new Date().toISOString(), evidence, status: "ok" }, null, 2)}\n`);
  } finally {
    await context.close().catch(() => {});
    const original = video ? await video.path().catch(() => null) : null;
    if (original) await rename(original, `${VIDEO_DIR}/demo-complete-replay.webm`);
    await browser.close().catch(() => {});
    stopApp(child);
  }

  if (!existsSync(`${VIDEO_DIR}/demo-complete-replay.webm`)) throw new Error("Missing demo replay video");
  console.log(`Demo-complete evidence written to ${OUT}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
