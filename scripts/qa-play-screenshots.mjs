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
const STORAGE_KEY = "pixelNations.play.v1";
const viewports = [
  { viewport: "desktop", width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false },
  { viewport: "mobile", width: 390, height: 844, deviceScaleFactor: 1, isMobile: true },
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickVisibleButton(page, name, step) {
  const buttons = page.getByRole("button", { name, exact: true });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (await button.isVisible()) {
      await button.click({ timeout: 5000 });
      return;
    }
  }
  throw new Error(`${step}: no visible button named ${name}`);
}

async function clickDock(page, view) {
  const target = page.locator(`[data-qa="view-${view}"]`).first();
  await target.waitFor({ state: "visible", timeout: 5000 });
  await target.click({ force: true });
}

async function waitForStage(page, stage) {
  await page.locator(`[data-qa="aurelian-village-scene"][data-aurelian-stage="${stage}"]`).waitFor({
    state: "visible",
    timeout: 7000,
  });
}

async function waitForOrderPersisted(page, orderId) {
  await page.waitForFunction(({ key, expectedOrder }) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const state = JSON.parse(raw);
      return Array.isArray(state?.completedOrders) && state.completedOrders.includes(expectedOrder);
    } catch {
      return false;
    }
  }, { key: STORAGE_KEY, expectedOrder: orderId }, { timeout: 7000 });
}

async function runOrder(page, label, orderId) {
  await clickDock(page, "village");
  await clickVisibleButton(page, "Issue next order", `open Orders for ${label}`);
  await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 5000 });
  await clickVisibleButton(page, label, `run order ${label}`);
  await page.locator('[data-qa="aurelian-village-scene"]').waitFor({ state: "visible", timeout: 7000 });
  await waitForOrderPersisted(page, orderId);
}

const steps = [
  {
    id: "01-aurelian-camp-opening",
    label: "Aurelian camp opening",
    note: "The playable demo opens on the owned Aurelian camp, not the claim map.",
    run: async (page) => {
      await waitForStage(page, "camp");
    },
  },
  {
    id: "02-first-shelter",
    label: "First shelter",
    note: "Raise Shelter changes the same registered scene to exactly one connected shelter.",
    run: async (page) => {
      await runOrder(page, "Raise Shelter", "raise-shelter");
      await waitForStage(page, "first_shelter");
    },
  },
  {
    id: "03-developed-settlement",
    label: "Developed settlement",
    note: "Food, timber, scouting and Storehouse advance the same scene to the accepted living settlement.",
    run: async (page) => {
      await runOrder(page, "Gather Food", "gather-food");
      await runOrder(page, "Cut Timber", "cut-timber");
      await runOrder(page, "Scout Nearby Land", "scout-nearby");
      await runOrder(page, "Build Storehouse", "build-storehouse");
      await waitForStage(page, "developed_settlement");
    },
  },
  {
    id: "04-world-navigation",
    label: "World navigation",
    note: "The World view remains reachable after settlement progression.",
    run: async (page) => {
      await clickDock(page, "world");
      await page.locator('[data-qa="world-map-scene"]').waitFor({ state: "visible", timeout: 7000 });
    },
  },
  {
    id: "05-council-navigation",
    label: "Council navigation",
    note: "The Council view remains reachable without resetting settlement progress.",
    run: async (page) => {
      await clickDock(page, "council");
      await page.locator('[data-qa="council-panel"]').waitFor({ state: "visible", timeout: 7000 });
    },
  },
];

async function withTimeout(label, fn, timeoutMs = 35000) {
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
  const command = existsSync(".next")
    ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"]
    : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
  return spawn("npm", command, {
    stdio: "pipe",
    shell: process.platform === "win32",
    detached: process.platform !== "win32",
  });
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
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildReport({ generatedAt, appSource, shots, interactionLog, videos }) {
  const items = shots
    .map((shot) => `<li>${escapeHtml(shot.viewport)} / ${escapeHtml(shot.stepLabel)} — ${shot.error ? `FAIL: ${escapeHtml(shot.error)}` : "ok"}</li>`)
    .join("\n");
  const logItems = interactionLog
    .map((item) => `<li>${escapeHtml(item.viewport)} / ${escapeHtml(item.stepId)} — ${escapeHtml(item.status)}${item.error ? `: ${escapeHtml(item.error)}` : ""}</li>`)
    .join("\n");
  const videoItems = videos
    .map((video) => `<li><a href="./videos/${escapeHtml(video.filename)}">${escapeHtml(video.viewport)} continuous Playwright video</a></li>`)
    .join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Pixel Nations Aurelian Gameplay QA</title></head><body><main><h1>Aurelian playable opening evidence</h1><p>Generated: ${escapeHtml(generatedAt)}</p><p>App source: ${escapeHtml(appSource)}</p><h2>Required sequence</h2><p>Camp → First Shelter → Developed Settlement → World → Council</p><h2>Continuous videos</h2><ul>${videoItems}</ul><h2>Interaction log</h2><ul>${logItems}</ul><h2>Screenshots</h2><ul>${items}</ul></main></body></html>`;
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
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    for (const step of steps) {
      let error = "";
      try {
        await withTimeout(step.id, () => step.run(page));
        interactionLog.push({ viewport: config.viewport, stepId: step.id, status: "ok" });
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        interactionLog.push({ viewport: config.viewport, stepId: step.id, status: "failure", error });
      }
      const filename = `${config.viewport}-play-${step.id}.png`;
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${filename}`, fullPage: true, timeout: 10000 });
      shots.push({ viewport: config.viewport, filename, stepId: step.id, stepLabel: step.label, note: step.note, error });
      if (error) break;
    }
  } finally {
    await context.close().catch(() => {});
    if (video) {
      const originalVideoPath = await video.path().catch(() => null);
      if (originalVideoPath) {
        const filename = `${config.viewport}-play-continuous.webm`;
        await rename(originalVideoPath, `${VIDEO_DIR}/${filename}`);
        videos.push({ viewport: config.viewport, filename, kind: "continuous-playwright-video" });
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
    const failures = fullInteractionLog.filter((item) => item.status !== "ok");
    if (failures.length) throw new Error(`Aurelian play visual QA completed with ${failures.length} failure(s). See ${INTERACTION_LOG_PATH}`);
    if (allVideos.length !== viewports.length) throw new Error(`Expected ${viewports.length} continuous videos, got ${allVideos.length}`);
    console.log(`Aurelian play visual QA evidence written to ${OUTPUT_DIR}`);
  } finally {
    stopApp(startedProcess);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
