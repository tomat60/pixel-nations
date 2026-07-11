import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/play-latest";
const SCREENSHOT_DIR = `${OUTPUT_DIR}/screenshots`;
const VIDEO_DIR = `${OUTPUT_DIR}/videos`;
const REPORT_PATH = `${OUTPUT_DIR}/report.html`;
const MANIFEST_PATH = `${OUTPUT_DIR}/manifest.json`;
const INTERACTION_LOG_PATH = `${OUTPUT_DIR}/interaction-log.json`;
const viewports = [{ viewport: "desktop", width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false }];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickButtonByText(page, pattern) {
  const button = page.getByRole("button", { name: pattern }).first();
  await button.waitFor({ state: "visible", timeout: 5000 });
  await button.click();
}

async function clickDom(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 5000 });
  await locator.click({ force: true });
}

async function clickDock(page, view) {
  await clickDom(page, `[data-qa="view-${view}"]`);
}

async function readPlotStates(page) {
  return page.locator('[data-qa="village-plot"]').evaluateAll((nodes) => nodes.map((node) => `${node.getAttribute("data-qa-id")}:${node.getAttribute("data-qa-state")}`));
}

async function runOrder(page, name) {
  await clickDock(page, "village");
  await clickButtonByText(page, /Issue next order/i);
  await clickButtonByText(page, name);
  await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });
}

async function countOwnedSectors(page) {
  return page.locator('[data-qa="world-sector-tile"][data-sector-control="owned"]').count();
}

const steps = [
  { id: "01-map-overview", label: "Map overview", note: "The player starts on the 30-land sector map." },
  { id: "02-claim-enters-village-scene", label: "Claim enters VillageScene", note: "Claiming a land must replace the map with a spatial VillageScene.", run: async (page) => {
    await clickButtonByText(page, /Reset view/i);
    await clickDom(page, "[data-qa='plot-greenvale']");
    await clickButtonByText(page, /Choose this land/i);
    await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });
    const count = await page.locator('[data-qa="village-plot"]').count();
    if (count < 6) throw new Error(`Expected visible village plots, got ${count}`);
    await sleep(450);
  } },
  { id: "03-village-after-shelter-order", label: "Village after shelter", note: "Raise Shelter must visibly change at least one village plot state.", run: async (page) => {
    const before = (await readPlotStates(page)).join("|");
    await clickButtonByText(page, /Issue next order/i);
    await clickButtonByText(page, /Raise Shelter/i);
    await page.locator('[data-qa="village-plot"][data-qa-id="shelter"][data-qa-state="built"]').waitFor({ state: "visible", timeout: 5000 });
    const after = (await readPlotStates(page)).join("|");
    if (!before || before === after) throw new Error("Village plot states did not change");
    await sleep(450);
  } },
  { id: "04-world-expansion-ready", label: "Expansion map ready", note: "World shows owned, claimable and locked sectors after enough Influence exists.", run: async (page) => {
    await clickDock(page, "world");
    await page.locator('[data-qa="world-map-scene"]').waitFor({ state: "visible", timeout: 5000 });
    const sectors = await page.locator('[data-qa="world-sector-tile"]').count();
    if (sectors !== 100) throw new Error(`Expected 100 world sector tiles, got ${sectors}`);
    await page.locator('[data-qa="world-sector-tile"][data-sector-control="owned"]').first().waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-sector-tile"][data-sector-control="claimable"]').first().click();
    const disabled = await page.locator('[data-qa="claim-sector-button"]').isDisabled();
    if (disabled) throw new Error("Claimable sector should be affordable after Raise Shelter grants enough Influence");
    await sleep(450);
  } },
  { id: "05-world-expansion-after", label: "Expansion map after", note: "Claiming a sector increases owned territory.", run: async (page) => {
    await runOrder(page, /Scout Nearby Land/i);
    await clickDock(page, "world");
    const beforeOwned = await countOwnedSectors(page);
    await page.locator('[data-qa="world-sector-tile"][data-sector-control="claimable"]').first().click();
    await clickButtonByText(page, /Claim sector/i);
    const afterOwned = await countOwnedSectors(page);
    if (afterOwned <= beforeOwned) throw new Error(`Owned sectors did not grow: ${beforeOwned} -> ${afterOwned}`);
    await sleep(450);
  } },
  { id: "06-council-section", label: "Council section", note: "Council tracks expansion and nation progress before founding.", run: async (page) => {
    await clickButtonByText(page, /Council plan/i);
    await page.locator('[data-qa="council-panel"]').waitFor({ state: "visible", timeout: 5000 });
    await sleep(450);
  } },
  { id: "07-founding-ceremony", label: "Founding ceremony", note: "After the third sector and doctrine choice, a visible founding ceremony must appear exactly when the nation is founded.", run: async (page) => {
    await runOrder(page, /Open Market Path/i);
    await clickDock(page, "world");
    const beforeOwned = await countOwnedSectors(page);
    if (beforeOwned < 2) throw new Error(`Expected at least 2 owned sectors before final founding claim, got ${beforeOwned}`);
    await page.locator('[data-qa="world-sector-tile"][data-sector-control="claimable"]').first().click();
    await clickButtonByText(page, /Claim sector/i);
    await page.locator('[data-qa="world-map-scene"][data-owned-count="3"]').waitFor({ state: "visible", timeout: 5000 });
    await clickButtonByText(page, /Council plan/i);
    await page.locator('[data-qa="council-nation-ready"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="found-nation-choice"][data-decision-id="trade-charter"]').click();
    await page.locator('[data-qa="founding-ceremony"]').waitFor({ state: "visible", timeout: 5000 });
    await page.getByText(/The First Nation Rises/i).waitFor({ state: "visible", timeout: 5000 });
    await sleep(450);
  } },
  { id: "08-founded-aftermath-after-dismiss", label: "Founded aftermath after dismiss", note: "Dismissing the ceremony must leave persistent Council and World founded-state visuals.", run: async (page) => {
    await clickDom(page, '[data-qa="dismiss-founding-ceremony"]');
    await page.locator('[data-qa="founding-ceremony"]').waitFor({ state: "hidden", timeout: 5000 });
    await page.locator('[data-qa="council-nation-founded"]').waitFor({ state: "visible", timeout: 5000 });
    await clickDock(page, "world");
    await page.locator('[data-qa="nation-world-banner"]').waitFor({ state: "visible", timeout: 5000 });
    const foundedOwned = await page.locator('[data-qa="world-sector-tile"][data-nation-founded-owned="true"]').count();
    if (foundedOwned < 3) throw new Error(`Expected at least 3 founded owned sectors, got ${foundedOwned}`);
    await sleep(450);
  } },
  { id: "09-founded-state-after-reload", label: "Founded state after reload", note: "Reload must preserve the founded nation while not replaying the dismissed ceremony.", run: async (page) => {
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await page.locator('[data-qa="founding-ceremony"]').waitFor({ state: "hidden", timeout: 5000 });
    const replayed = await page.locator('[data-qa="founding-ceremony"]').isVisible().catch(() => false);
    if (replayed) throw new Error("Founding ceremony replayed after dismissal and reload");
    await clickDock(page, "council");
    await page.locator('[data-qa="council-nation-founded"]').waitFor({ state: "visible", timeout: 5000 });
    await clickDock(page, "world");
    await page.locator('[data-qa="nation-world-banner"]').waitFor({ state: "visible", timeout: 5000 });
    await sleep(450);
  } },
  { id: "10-retention-season-panel", label: "Retention season panel", note: "After founding dismissal, the first retention season decision must be visible.", run: async (page) => {
    await clickDock(page, "council");
    await page.locator('[data-qa="season-decision-panel"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="season-decision-panel"][data-season-decision="grain-levy"]').waitFor({ state: "visible", timeout: 5000 });
    const choices = await page.locator('[data-qa="season-choice"]').count();
    if (choices < 2) throw new Error(`Expected at least 2 season choices, got ${choices}`);
    await sleep(450);
  } },
  { id: "11-first-era-complete", label: "First era complete", note: "The player can resolve three deterministic post-founding season decisions and record one next expansion objective.", run: async (page) => {
    await clickDock(page, "council");
    const expectedDecisions = ["grain-levy", "open-roads", "scribe-patronage"];
    for (let index = 0; index < expectedDecisions.length; index += 1) {
      const decisionId = expectedDecisions[index];
      await page.locator(`[data-qa="season-decision-panel"][data-season-decision="${decisionId}"]`).waitFor({ state: "visible", timeout: 5000 });
      await page.locator(`[data-qa="season-choice"][data-decision-id="${decisionId}"]`).first().click();
      await page.locator(`[data-qa="council-panel"][data-retention-count="${index + 1}"]`).waitFor({ state: "visible", timeout: 5000 });
    }
    await page.locator('[data-qa="first-era-complete"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="rival-frontier-seed"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="frontier-objective-options"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="frontier-objective-choice"][data-frontier-intent="northern-pass"]').click();
    await page.locator('[data-qa="council-panel"][data-frontier-intent="northern-pass"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="frontier-objective-recorded"][data-frontier-intent="northern-pass"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="city-institutions-seed"]').waitFor({ state: "visible", timeout: 5000 });
    const records = await page.locator('[data-qa="retention-record"]').count();
    if (records < 3) throw new Error(`Expected at least 3 retention records, got ${records}`);
    const institutions = await page.locator('[data-qa="city-institution-card"]').count();
    if (institutions < 3) throw new Error(`Expected at least 3 city institution cards, got ${institutions}`);
    await sleep(450);
  } },
  { id: "12-retention-state-after-reload", label: "Rival response after reload", note: "Reload preserves empire, mandate, court ruling, rival response, and world conflict markers.", run: async (page) => {
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await clickDock(page, "council");
    await page.locator('[data-qa="council-panel"][data-retention-count="3"][data-era-complete="true"][data-city-institutions="true"][data-frontier-intent="northern-pass"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="first-era-complete"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="rival-frontier-seed"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="frontier-objective-recorded"][data-frontier-intent="northern-pass"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="city-institutions-seed"]').waitFor({ state: "visible", timeout: 5000 });
    const records = await page.locator('[data-qa="retention-record"]').count();
    if (records < 3) throw new Error(`Expected at least 3 persisted retention records, got ${records}`);
    const institutions = await page.locator('[data-qa="city-institution-card"]').count();
    if (institutions < 3) throw new Error(`Expected at least 3 persisted city institution cards, got ${institutions}`);
    await clickDock(page, "world");
    await page.locator('[data-qa="world-map-scene"][data-retention-count="3"][data-frontier-intent="northern-pass"][data-frontier-target-sector="A-04"][data-frontier-objective-complete="false"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-frontier-objective-banner"][data-frontier-intent="northern-pass"][data-frontier-target-sector="A-04"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-sector-tile"][data-frontier-objective="true"][data-sector-id="A-04"][data-sector-control="claimable"]').click();
    await clickButtonByText(page, /Claim sector/i);
    await page.locator('[data-qa="world-map-scene"][data-frontier-intent="northern-pass"][data-frontier-target-sector="A-04"][data-frontier-objective-complete="true"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-frontier-objective-complete"][data-frontier-intent="northern-pass"][data-frontier-target-sector="A-04"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-sector-tile"][data-frontier-objective="true"][data-sector-id="A-04"][data-sector-control="owned"][data-frontier-objective-complete="true"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-frontier-objective-marker"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-frontier-objective-signal"][data-frontier-intent="northern-pass"][data-frontier-target-sector="A-04"][data-frontier-complete="true"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-retention-effects"]').waitFor({ state: "visible", timeout: 5000 });
    const markers = await page.locator('[data-qa="world-retention-marker"]').count();
    if (markers < 3) throw new Error(`Expected at least 3 world retention markers, got ${markers}`);
    await clickDock(page, "council");
    await page.locator('[data-qa="council-panel"][data-frontier-secured="true"][data-empire-ready="true"][data-empire-declaration="none"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="empire-declaration-options"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="empire-declaration-choice"][data-empire-declaration="aurelian-compact"]').click();
    await page.locator('[data-qa="council-panel"][data-empire-declaration="aurelian-compact"][data-empire-consequence="order"][data-imperial-mandate="charter-courts"][data-court-case-ready="true"][data-court-case-decision="none"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="empire-declaration-recorded"][data-empire-declaration="aurelian-compact"][data-imperial-mandate="charter-courts"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="imperial-mandate-seed"][data-imperial-mandate="charter-courts"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="court-case-options"][data-court-case="north-ridge-dispute"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="court-case-choice"][data-court-case-decision="enforce-charter-law"]').click();
    await page.locator('[data-qa="council-panel"][data-court-case-decision="enforce-charter-law"][data-rival-response-ready="true"][data-rival-response-decision="none"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="court-case-recorded"][data-court-case="north-ridge-dispute"][data-court-case-decision="enforce-charter-law"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="rival-response-options"][data-rival-response="obsidian-march-rejection"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="rival-response-choice"][data-rival-response-decision="enforce-by-decree"]').click();
    await page.locator('[data-qa="council-panel"][data-rival-response-decision="enforce-by-decree"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="rival-response-recorded"][data-rival-response="obsidian-march-rejection"][data-rival-response-decision="enforce-by-decree"]').waitFor({ state: "visible", timeout: 5000 });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await clickDock(page, "council");
    await page.locator('[data-qa="council-panel"][data-empire-ready="true"][data-empire-declaration="aurelian-compact"][data-imperial-mandate="charter-courts"][data-court-case-decision="enforce-charter-law"][data-rival-response-decision="enforce-by-decree"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="court-case-recorded"][data-court-case="north-ridge-dispute"][data-court-case-decision="enforce-charter-law"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="rival-response-recorded"][data-rival-response="obsidian-march-rejection"][data-rival-response-decision="enforce-by-decree"]').waitFor({ state: "visible", timeout: 5000 });
    await clickDock(page, "world");
    await page.locator('[data-qa="world-map-scene"][data-empire-declaration="aurelian-compact"][data-imperial-mandate="charter-courts"][data-court-case="north-ridge-dispute"][data-court-case-decision="enforce-charter-law"][data-rival-response="obsidian-march-rejection"][data-rival-response-decision="enforce-by-decree"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-empire-banner"][data-empire-declaration="aurelian-compact"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-imperial-mandate-banner"][data-imperial-mandate="charter-courts"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-court-case-banner"][data-court-case-decision="enforce-charter-law"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-court-ruling"][data-court-case="north-ridge-dispute"][data-court-case-decision="enforce-charter-law"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-rival-response-banner"][data-rival-response-decision="enforce-by-decree"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="world-rival-response"][data-rival-response="obsidian-march-rejection"][data-rival-response-decision="enforce-by-decree"]').waitFor({ state: "visible", timeout: 5000 });
    await sleep(450);
  } },
];

async function withTimeout(label, fn, timeoutMs = 20000) {
  let timer;
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function isAppRunning() {
  try {
    const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function waitForApp() {
  const started = Date.now();
  while (Date.now() - started < 30000) {
    if (await isAppRunning()) return;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for ${APP_URL}`);
}

function startAppIfNeeded() {
  const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
  return spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32", detached: process.platform !== "win32" });
}

async function ensureApp() {
  if (await isAppRunning()) return { startedProcess: null, appSource: "existing app" };
  const startedProcess = startAppIfNeeded();
  startedProcess.stdout?.on("data", (data) => process.stdout.write(data));
  startedProcess.stderr?.on("data", (data) => process.stderr.write(data));
  await waitForApp();
  return { startedProcess, appSource: existsSync(".next") ? "temporary next start" : "temporary next dev" };
}

function stopApp(startedProcess) {
  if (!startedProcess) return;
  if (process.platform === "win32") {
    startedProcess.kill("SIGTERM");
    return;
  }
  try {
    process.kill(-startedProcess.pid, "SIGTERM");
  } catch {
    startedProcess.kill("SIGTERM");
  }
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function buildReport({ generatedAt, appSource, shots, interactionLog, videos }) {
  const items = shots.map((shot) => `<li>${escapeHtml(shot.stepLabel)} — ${shot.error ? `WARNING: ${escapeHtml(shot.error)}` : "ok"}</li>`).join("\n");
  const logItems = interactionLog.map((item) => `<li>${escapeHtml(item.viewport)} / ${escapeHtml(item.stepId)} — ${escapeHtml(item.status)}${item.error ? `: ${escapeHtml(item.error)}` : ""}</li>`).join("\n");
  const videoItems = videos.map((video) => `<li><a href="./videos/${escapeHtml(video.filename)}">${escapeHtml(video.viewport)} continuous Playwright video</a> — real browser recording of the scripted run, not a screenshot slideshow.</li>`).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Pixel Nations Gameplay QA</title></head><body><main><h1>Playable loop evidence</h1><p>Generated: ${escapeHtml(generatedAt)}</p><p>App source: ${escapeHtml(appSource)}</p><h2>Continuous video</h2><p>The videos below are native Playwright browser recordings of the full scripted run. Screenshots remain checkpoint evidence; they are not treated as smoothness or gamefeel proof.</p><ul>${videoItems}</ul><h2>Verdict checklist</h2><ul><li>Owned territory visibly grows</li><li>Expansion uses Influence</li><li>Council reflects expansion progress</li><li>Founding ceremony appears after doctrine choice</li><li>Dismissed ceremony does not replay after reload</li><li>Retention season panel appears after founding</li><li>Three post-founding season decisions can be resolved</li><li>City institutions seed appears after First Era completion</li><li>One frontier objective can be recorded</li><li>Recorded frontier objective appears on the world map</li><li>Recorded frontier objective can be claimed and marked complete</li><li>Empire declaration can be recorded after objective payoff</li><li>Empire declaration persists on Council and World after reload</li><li>First imperial mandate appears on Council and World after reload</li><li>First imperial court case can be resolved</li><li>Court ruling persists on Council and World after reload</li><li>First rival response can be answered</li><li>Rival response persists on Council and World after reload</li><li>First era completion, city institutions, frontier objective, empire declaration, imperial mandate, court ruling, rival response, and world consequence markers persist after reload</li></ul><h2>Interaction log</h2><ul>${logItems}</ul><h2>Screenshots</h2><ul>${items}</ul></main></body></html>`;
}

async function runViewport(config) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: config.deviceScaleFactor,
    isMobile: config.isMobile,
    recordVideo: { dir: VIDEO_DIR, size: { width: config.width, height: config.height } },
  });
  const page = await context.newPage();
  const video = page.video();
  const shots = [];
  const interactionLog = [];
  const videos = [];
  try {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    for (const step of steps) {
      let error = "";
      try {
        if (step.run) await withTimeout(step.id, () => step.run(page));
        interactionLog.push({ viewport: config.viewport, stepId: step.id, status: "ok" });
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        interactionLog.push({ viewport: config.viewport, stepId: step.id, status: "warning", error });
      }
      const filename = `${config.viewport}-play-${step.id}.png`;
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${filename}`, fullPage: true, timeout: 10000 });
      shots.push({ viewport: config.viewport, filename, stepId: step.id, stepLabel: step.label, note: step.note, error });
    }
  } finally {
    await context.close().catch(() => {});
    if (video) {
      const originalVideoPath = await video.path().catch(() => null);
      if (originalVideoPath) {
        const filename = `${config.viewport}-play-continuous.webm`;
        await rename(originalVideoPath, `${VIDEO_DIR}/${filename}`).catch(async () => {
          const fallbackFilename = `${config.viewport}-play-continuous-${Date.now()}.webm`;
          await rename(originalVideoPath, `${VIDEO_DIR}/${fallbackFilename}`);
          videos.push({ viewport: config.viewport, filename: fallbackFilename, kind: "continuous-playwright-video" });
        });
        if (!videos.some((item) => item.viewport === config.viewport)) videos.push({ viewport: config.viewport, filename, kind: "continuous-playwright-video" });
      }
    }
    await browser.close().catch(() => {});
  }
  return { shots, interactionLog, videos };
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });
  const { startedProcess, appSource } = await ensureApp();
  const generatedAt = new Date().toISOString();
  const allShots = [];
  const allVideos = [];
  const fullInteractionLog = [];
  try {
    for (const viewport of viewports) {
      const item = await runViewport(viewport);
      allShots.push(...item.shots);
      allVideos.push(...item.videos);
      fullInteractionLog.push(...item.interactionLog);
    }
    await writeFile(MANIFEST_PATH, `${JSON.stringify({ generatedAt, appUrl: APP_URL, appSource, screenshots: allShots, videos: allVideos }, null, 2)}\n`);
    await writeFile(INTERACTION_LOG_PATH, `${JSON.stringify(fullInteractionLog, null, 2)}\n`);
    await writeFile(REPORT_PATH, buildReport({ generatedAt, appSource, shots: allShots, interactionLog: fullInteractionLog, videos: allVideos }));
    const warnings = fullInteractionLog.filter((item) => item.status !== "ok");
    if (warnings.length) throw new Error(`Play visual QA completed with ${warnings.length} interaction warning(s). See ${INTERACTION_LOG_PATH}`);
    if (!allVideos.length) throw new Error(`Play visual QA did not produce a continuous video. Expected at least one file in ${VIDEO_DIR}`);
    console.log(`Play visual QA evidence written to ${OUTPUT_DIR}`);
  } finally {
    stopApp(startedProcess);
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
