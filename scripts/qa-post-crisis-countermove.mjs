import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const KEY = "pixelNations.play.v1";
const OUT = "public/qa/play-latest/post-crisis-countermove";
const VIDEO_DIR = `${OUT}/videos`;
const SHOT_DIR = `${OUT}/screenshots`;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const baseFounderSeed = {
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
  imperialTurnActionIds: ["reinforce-ridge", "reinforce-ridge", "reinforce-ridge"],
  empireCrisisReason: "rival-pressure",
  postCrisisCountermoveOrigin: null,
  postCrisisResponseId: null,
  foundingCeremonySeen: true,
  season: 12,
  view: "council",
  lastEvent: "Empire crisis resolved before the rival counter-move.",
  resources: { food: 9, timber: 8, stone: 3, influence: 24 },
  completedOrders: ["raise-shelter", "gather-food", "cut-timber", "scout-nearby", "build-storehouse", "open-market", "form-council", "fortify-watch"],
  settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"],
  scoutedPlotIds: ["meadowrun", "old-road", "glasswater", "wolfpine", "eastfold"],
  chronicle: [{ season: 12, title: "Empire crisis resolved", body: "The first empire survived and exposed the rival's next move." }],
  retentionRecords: [
    { season: 1, decisionId: "grain-levy", choiceId: "authority", label: "Set the crown levy", villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
    { season: 2, decisionId: "open-roads", choiceId: "authority", label: "Fortify the border road", villageMarker: "border-watchfires", worldMarker: "fortified-road" },
    { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Patron the scribes", villageMarker: "scribe-desk", worldMarker: "law-stones" },
  ],
};

const scenarios = [
  {
    recoveryId: "stabilize-frontier",
    origin: "stabilize-frontier",
    responseId: "hold-north-ridge",
    expectedInfluence: 23,
    prefix: "stabilize",
  },
  {
    recoveryId: "accept-concession",
    origin: "accept-concession",
    responseId: "bind-passage-tribute",
    expectedInfluence: 25,
    prefix: "concession",
  },
];

function founderSeed(recoveryId) {
  return {
    ...baseFounderSeed,
    empireCrisisRecoveryId: recoveryId,
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

async function assertStored(page, predicateSource, args, label) {
  await page.waitForFunction(({ key, predicateSource, args }) => {
    try {
      const state = JSON.parse(window.localStorage.getItem(key) ?? "{}");
      const predicate = new Function("state", "args", `return (${predicateSource})(state, args);`);
      return predicate(state, args);
    } catch { return false; }
  }, { key: KEY, predicateSource, args }, { timeout: 5000 }).catch((error) => {
    throw new Error(`${label}: ${error.message}`);
  });
}

async function runScenario(page, scenario, evidence) {
  await loadSeed(page, founderSeed(scenario.recoveryId));
  await page.locator(`[data-qa="demo-complete-overlay"][data-empire-crisis-recovery="${scenario.recoveryId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await page.locator(`[data-qa="founder-record-crisis"][data-crisis-recovery="${scenario.recoveryId}"]`).waitFor({ state: "visible", timeout: 5000 });
  const founderShot = `${scenario.prefix}-01-founder-record.png`;
  await page.screenshot({ path: `${SHOT_DIR}/${founderShot}`, fullPage: true }); evidence.push(founderShot);

  await page.locator('[data-qa="continue-ruling"]').click({ force: true });
  await page.locator('[data-qa="demo-complete-overlay"]').waitFor({ state: "hidden", timeout: 5000 });
  await page.locator(`[data-qa="post-crisis-countermove"][data-countermove-origin="${scenario.origin}"]`).waitFor({ state: "visible", timeout: 5000 });
  const responseButtons = page.locator('[data-qa="post-crisis-response"]');
  if (await responseButtons.count() !== 2) throw new Error(`${scenario.origin} did not expose exactly two responses`);
  await page.locator(`[data-qa="post-crisis-response"][data-post-crisis-response="${scenario.responseId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await page.locator('[data-qa="current-objective-text"]').getByText(/post-crisis counter-move/i).waitFor({ state: "visible", timeout: 5000 });
  await assertStored(page, "(state, args) => state.postCrisisCountermoveOrigin === args.origin && state.postCrisisResponseId === null", { origin: scenario.origin }, `${scenario.origin} pending persistence`);
  const pendingShot = `${scenario.prefix}-02-countermove-pending.png`;
  await page.screenshot({ path: `${SHOT_DIR}/${pendingShot}`, fullPage: true }); evidence.push(pendingShot);

  await page.locator(`[data-qa="post-crisis-response"][data-post-crisis-response="${scenario.responseId}"]`).click({ force: true });
  await page.locator(`[data-qa="world-post-crisis-consequence"][data-post-crisis-response="${scenario.responseId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await page.locator('[data-qa="current-objective-text"]').getByText(/answered the rival counter-move/i).waitFor({ state: "visible", timeout: 5000 });
  await assertStored(page, "(state, args) => state.postCrisisCountermoveOrigin === args.origin && state.postCrisisResponseId === args.responseId && state.resources.influence === args.expectedInfluence && Array.isArray(state.chronicle) && state.chronicle[0]?.title === 'Post-crisis counter-move'", scenario, `${scenario.origin} resolved persistence`);
  const resolvedShot = `${scenario.prefix}-03-response-resolved.png`;
  await page.screenshot({ path: `${SHOT_DIR}/${resolvedShot}`, fullPage: true }); evidence.push(resolvedShot);

  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator(`[data-qa="world-post-crisis-consequence"][data-post-crisis-response="${scenario.responseId}"]`).waitFor({ state: "visible", timeout: 5000 });
  await page.locator('[data-qa="open-founder-record"]').waitFor({ state: "visible", timeout: 5000 });
  await assertStored(page, "(state, args) => state.postCrisisCountermoveOrigin === args.origin && state.postCrisisResponseId === args.responseId", scenario, `${scenario.origin} reload persistence`);
  const reloadShot = `${scenario.prefix}-04-reload-persisted.png`;
  await page.screenshot({ path: `${SHOT_DIR}/${reloadShot}`, fullPage: true }); evidence.push(reloadShot);
}

async function assertResetClears(page, evidence) {
  await page.locator('[data-qa="open-founder-record"]').click({ force: true });
  await page.locator('[data-qa="demo-complete-overlay"]').waitFor({ state: "visible", timeout: 5000 });
  await page.locator('[data-qa="restart-run"]').click({ force: true });
  await page.locator('[data-qa="opening-guide"]').waitFor({ state: "visible", timeout: 5000 });
  await assertStored(page, "(state) => Array.isArray(state.ownedPlotIds) && state.ownedPlotIds.length === 0 && state.empireCrisisRecoveryId === null && state.postCrisisCountermoveOrigin === null && state.postCrisisResponseId === null", {}, "reset clears post-crisis state");
  const resetShot = "reset-05-new-empire-clear.png";
  await page.screenshot({ path: `${SHOT_DIR}/${resetShot}`, fullPage: true }); evidence.push(resetShot);
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
    await runScenario(page, scenarios[0], evidence);
    await runScenario(page, scenarios[1], evidence);
    await assertResetClears(page, evidence);
    await writeFile(`${OUT}/post-crisis-countermove-summary.json`, `${JSON.stringify({ generatedAt: new Date().toISOString(), evidence, status: "ok" }, null, 2)}\n`);
  } finally {
    await context.close().catch(() => {});
    const original = video ? await video.path().catch(() => null) : null;
    if (original) await rename(original, `${VIDEO_DIR}/post-crisis-countermove.webm`);
    await browser.close().catch(() => {});
    stopApp(child);
  }

  if (!existsSync(`${VIDEO_DIR}/post-crisis-countermove.webm`)) throw new Error("Missing post-crisis counter-move video");
  console.log(`Post-crisis counter-move evidence written to ${OUT}`);
}

main().catch((error) => { console.error(error); process.exit(1); });