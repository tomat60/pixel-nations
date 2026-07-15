import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const KEY = "pixelNations.play.v1";
const OUT = "public/qa/play-latest/empire-crisis";
const VIDEO_DIR = `${OUT}/videos`;
const SHOT_DIR = `${OUT}/screenshots`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const baseSeed = {
  selectedPlotId: "greenvale",
  ownedPlotIds: ["greenvale"],
  ownedSectorIds: ["A-01", "A-02", "A-04"],
  nationDecisionId: "trade-charter",
  frontierIntentId: "northern-pass",
  empireDeclarationId: "aurelian-compact",
  courtCaseDecisionId: "enforce-charter-law",
  foundingCeremonySeen: true,
  season: 12,
  view: "council",
  resources: { food: 9, timber: 8, stone: 3, influence: 24 },
  completedOrders: ["raise-shelter", "gather-food", "cut-timber", "scout-nearby", "build-storehouse", "open-market", "form-council", "fortify-watch"],
  settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"],
  scoutedPlotIds: ["meadowrun", "old-road", "glasswater", "wolfpine", "eastfold"],
  chronicle: [{ season: 12, title: "Imperial Turn 2", body: "Two turns are already recorded." }],
  retentionRecords: [
    { season: 1, decisionId: "grain-levy", choiceId: "authority", label: "Set the crown levy", villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
    { season: 2, decisionId: "open-roads", choiceId: "authority", label: "Fortify the border road", villageMarker: "border-watchfires", worldMarker: "fortified-road" },
    { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Patron the scribes", villageMarker: "scribe-desk", worldMarker: "law-stones" },
  ],
  empireCrisisReason: null,
  empireCrisisRecoveryId: null,
  postCrisisCountermoveOrigin: null,
  postCrisisResponseId: null,
};

function crisisSeed() {
  return {
    ...baseSeed,
    rivalResponseDecisionId: "enforce-by-decree",
    conflictEscalationDecisionId: "raise-border-host",
    standoffDecisionId: "show-of-force",
    imperialTurnActionIds: ["reinforce-ridge", "reinforce-ridge"],
    lastEvent: "Imperial Turn 2: Reinforce the Ridge.",
  };
}

function safeSeed() {
  return {
    ...baseSeed,
    rivalResponseDecisionId: "summon-border-assembly",
    conflictEscalationDecisionId: "summon-rival-envoys",
    standoffDecisionId: "offer-border-charter",
    imperialTurnActionIds: ["renew-border-charter", "renew-border-charter"],
    lastEvent: "Imperial Turn 2: Renew the Border Charter.",
  };
}

async function appReady() {
  try { const response = await fetch(URL, { signal: AbortSignal.timeout(1500) }); return response.ok || response.status < 500; }
  catch { return false; }
}
function startApp() { const args = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; return spawn("npm", args, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" }); }
async function ensureApp() { if (await appReady()) return null; const child = startApp(); child.stdout?.on("data", (data) => process.stdout.write(data)); child.stderr?.on("data", (data) => process.stderr.write(data)); const started = Date.now(); while (Date.now() - started < 30000) { if (await appReady()) return child; await wait(500); } throw new Error(`Timed out waiting for ${URL}`); }
function stopApp(child) { if (!child) return; if (process.platform === "win32") return child.kill("SIGTERM"); try { process.kill(-child.pid, "SIGTERM"); } catch { child.kill("SIGTERM"); } }

async function loadSeed(page, state) {
  await page.goto(`${URL}/play?qa-preseed=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: KEY, state });
  await page.goto(`${URL}/play?qa-seed=${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
}

async function assertStoredRecovery(page, expected) {
  await page.waitForFunction(({ key, expected }) => {
    try {
      const state = JSON.parse(window.localStorage.getItem(key) ?? "{}");
      return state.empireCrisisRecoveryId === expected;
    } catch { return false; }
  }, { key: KEY, expected }, { timeout: 5000 });
}

async function triggerCrisisAndRecover(page, recoveryId, screenshotName) {
  await loadSeed(page, crisisSeed());
  await page.locator('[data-qa="current-objective-text"]').getByText(/Imperial Turn 3\/3/i).waitFor({ state: "visible", timeout: 5000 });
  await page.locator('[data-qa="imperial-turn-action"][data-action-id="reinforce-ridge"]').first().click({ force: true });
  await page.locator('[data-qa="empire-crisis-panel"][data-crisis-reason="rival-pressure"]').waitFor({ state: "visible", timeout: 5000 });
  if (await page.locator('[data-qa="demo-complete-overlay"]').count() !== 0) throw new Error("Founder Record appeared before crisis recovery");
  await page.locator(`[data-qa="empire-crisis-choice"][data-crisis-recovery="${recoveryId}"]`).click({ force: true });
  await page.locator(`[data-qa="empire-crisis-resolved"][data-crisis-recovery="${recoveryId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await page.locator(`[data-qa="demo-complete-overlay"][data-empire-crisis-recovery="${recoveryId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await page.locator(`[data-qa="founder-record-crisis"][data-crisis-recovery="${recoveryId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await assertStoredRecovery(page, recoveryId);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator(`[data-qa="demo-complete-overlay"][data-empire-crisis-recovery="${recoveryId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await page.locator(`[data-qa="founder-record-crisis"][data-crisis-recovery="${recoveryId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await page.screenshot({ path: `${SHOT_DIR}/${screenshotName}`, fullPage: true });
}

async function assertSafeBypass(page) {
  await loadSeed(page, safeSeed());
  await page.locator('[data-qa="imperial-turn-action"][data-action-id="renew-border-charter"]').first().click({ force: true });
  await page.locator('[data-qa="demo-complete-overlay"][data-empire-crisis="none"]').waitFor({ state: "visible", timeout: 5000 });
  if (await page.locator('[data-qa="empire-crisis-panel"]').count() !== 0) throw new Error("Safe path incorrectly triggered an empire crisis");
  await page.screenshot({ path: `${SHOT_DIR}/01-safe-bypass.png`, fullPage: true });
}

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
    await assertSafeBypass(page); evidence.push("01-safe-bypass.png");
    await triggerCrisisAndRecover(page, "stabilize-frontier", "02-crisis-stabilized.png"); evidence.push("02-crisis-stabilized.png");
    await triggerCrisisAndRecover(page, "accept-concession", "03-crisis-concession.png"); evidence.push("03-crisis-concession.png");
    await writeFile(`${OUT}/empire-crisis-summary.json`, `${JSON.stringify({ generatedAt: new Date().toISOString(), evidence, status: "ok" }, null, 2)}\n`);
  } finally {
    await context.close().catch(() => {});
    const original = video ? await video.path().catch(() => null) : null;
    if (original) await rename(original, `${VIDEO_DIR}/empire-crisis-recovery.webm`);
    await browser.close().catch(() => {});
    stopApp(child);
  }

  if (!existsSync(`${VIDEO_DIR}/empire-crisis-recovery.webm`)) throw new Error("Missing empire crisis recovery video");
  console.log(`Empire crisis evidence written to ${OUT}`);
}

main().catch((error) => { console.error(error); process.exit(1); });