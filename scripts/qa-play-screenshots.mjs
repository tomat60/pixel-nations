import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/play-latest";
const SCREENSHOT_DIR = `${OUTPUT_DIR}/screenshots`;
const VIDEO_DIR = `${OUTPUT_DIR}/videos`;
const REPORT_PATH = `${OUTPUT_DIR}/report.html`;
const MANIFEST_PATH = `${OUTPUT_DIR}/manifest.json`;
const INTERACTION_LOG_PATH = `${OUTPUT_DIR}/interaction-log.json`;
const GLOBAL_TIMEOUT_MS = 120_000;

const globalTimeout = setTimeout(() => {
  console.error(`Play visual QA exceeded ${GLOBAL_TIMEOUT_MS}ms global timeout.`);
  process.exit(124);
}, GLOBAL_TIMEOUT_MS);
globalTimeout.unref();

const viewports = [
  { viewport: "mobile", width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, recordVideo: true },
  { viewport: "tablet", width: 768, height: 1024, deviceScaleFactor: 1, isMobile: false, recordVideo: false },
  { viewport: "desktop", width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, recordVideo: true },
];

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

async function dragMap(page) {
  const box = await page.locator("[data-qa='map-stage']").boundingBox();
  if (!box) throw new Error("No map-stage box");
  await page.mouse.move(box.x + box.width * 0.60, box.y + box.height * 0.50);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.48, box.y + box.height * 0.58, { steps: 12 });
  await page.mouse.up();
}

const steps = [
  { id: "01-full-sector-overview", label: "Full sector overview", note: "Default view should show the full local sector, not an awkward cropped slice." },
  {
    id: "02-wheel-zoom-drag",
    label: "Wheel zoom and drag",
    note: "Trackpad/mouse wheel zoom and drag should feel like strategy-map navigation.",
    run: async (page) => {
      await page.locator("[data-qa='map-stage']").hover();
      await page.mouse.wheel(0, -520);
      await sleep(300);
      await dragMap(page);
      await sleep(350);
    },
  },
  {
    id: "03-claim-homeland",
    label: "Claim homeland",
    note: "Claim should open the post-claim order loop, not leave the player staring at the map.",
    run: async (page) => {
      await clickButtonByText(page, /Overview/i);
      await clickDom(page, "[data-qa='plot-greenvale']");
      await clickButtonByText(page, /Choose this land/i);
      await sleep(550);
    },
  },
  {
    id: "04-three-orders",
    label: "Three seasonal orders",
    note: "Video must show claim -> multiple orders -> visible settlement growth.",
    run: async (page) => {
      await clickButtonByText(page, /Raise Shelter/i);
      await sleep(250);
      await clickButtonByText(page, /Gather Food/i);
      await sleep(250);
      await clickButtonByText(page, /Cut Timber/i);
      await sleep(350);
    },
  },
  {
    id: "05-visible-map-change",
    label: "Visible map consequences",
    note: "Scout and market actions should visibly affect the map with scouted lands and a route line.",
    run: async (page) => {
      await clickButtonByText(page, /Scout Nearby Land/i);
      await sleep(350);
      await clickButtonByText(page, /Build Storehouse/i);
      await sleep(350);
      await clickButtonByText(page, /Open Market Path/i);
      await sleep(550);
    },
  },
];

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
  try {
    if (process.platform !== "win32") process.kill(-startedProcess.pid, "SIGTERM");
    else startedProcess.kill("SIGTERM");
  } catch {}
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function buildReport({ generatedAt, appSource, shots, videos, interactionLog }) {
  const videoCards = videos.map((video) => `<article class="card"><h3>${escapeHtml(video.filename)}</h3><video controls src="./videos/${encodeURIComponent(video.filename)}"></video></article>`).join("\n") || `<p class="error-text">No video evidence generated.</p>`;
  const screenshotCards = shots.map((shot) => `<article class="card ${shot.error ? "error" : ""}"><p class="meta">${escapeHtml(shot.viewport)} / ${escapeHtml(shot.stepLabel)}</p><h3>${escapeHtml(shot.filename)}</h3><p>${escapeHtml(shot.note)}</p>${shot.error ? `<p class="error-text">${escapeHtml(shot.error)}</p>` : ""}<a href="./screenshots/${encodeURIComponent(shot.filename)}"><img src="./screenshots/${encodeURIComponent(shot.filename)}" /></a></article>`).join("\n");
  const logItems = interactionLog.map((item) => `<li><code>${escapeHtml(item.viewport)}</code> / <code>${escapeHtml(item.stepId)}</code> — ${escapeHtml(item.status)}${item.error ? `: ${escapeHtml(item.error)}` : ""}</li>`).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Pixel Nations Camera Loop Recovery QA</title><style>:root{color-scheme:dark;--bg:#020204;--gold:#c9a962;--muted:#9ca3af;--border:rgba(201,169,98,.18);--bad:#f97373}body{margin:0;background:var(--bg);color:#f8f5ed;font-family:Inter,system-ui,sans-serif}main{max-width:1280px;margin:0 auto;padding:40px 20px 64px}header,.card,section{border:1px solid var(--border);background:rgba(255,255,255,.035);padding:18px;margin-bottom:18px}.error{border-color:rgba(249,115,115,.55)}h1{margin:0 0 12px;font-size:clamp(2rem,5vw,4rem);letter-spacing:-.04em}h2,h3{color:#f5deb3}p,li{color:var(--muted);line-height:1.65}.error-text{color:var(--bad)}.meta,.eyebrow{color:var(--gold);text-transform:uppercase;letter-spacing:.18em;font-size:.72rem;font-weight:800}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px}img,video{width:100%;display:block;border:1px solid rgba(255,255,255,.08);background:#000}code{color:#f5deb3}</style></head><body><main><header><p class="eyebrow">Pixel Nations /play QA</p><h1>Camera + post-claim loop recovery</h1><p>Generated: <code>${escapeHtml(generatedAt)}</code></p><p>App source: <code>${escapeHtml(appSource)}</code></p><p>This evidence must prove full overview, wheel zoom, claim, seasonal orders and visible map consequences.</p></header><section><h2>Manual verdict required</h2><ul><li>Does the map default to a useful full-sector overview?</li><li>Does wheel/trackpad zoom feel natural in video?</li><li>After claim, can the player immediately perform meaningful orders?</li><li>Do orders visibly change the settlement/map?</li></ul></section><section><h2>Videos</h2><div class="grid">${videoCards}</div></section><section><h2>Interaction log</h2><ul>${logItems}</ul></section><section><h2>Screenshots</h2><div class="grid">${screenshotCards}</div></section></main></body></html>`;
}

async function saveVideo(page, viewport) {
  const video = page.video();
  if (!video) return null;
  const videoPath = await video.path().catch(() => null);
  if (!videoPath) return null;
  await mkdir(VIDEO_DIR, { recursive: true });
  const filename = `${viewport}-camera-loop-recovery.webm`;
  await copyFile(videoPath, `${VIDEO_DIR}/${filename}`);
  return { viewport, filename };
}

async function runViewport(config) {
  const context = await chromium.launchPersistentContext("", { viewport: { width: config.width, height: config.height }, deviceScaleFactor: config.deviceScaleFactor, isMobile: config.isMobile, recordVideo: config.recordVideo ? { dir: VIDEO_DIR, size: { width: config.width, height: config.height } } : undefined });
  const page = context.pages()[0] ?? await context.newPage();
  const shots = [];
  const interactionLog = [];
  await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  for (const step of steps) {
    let error = "";
    try {
      if (step.run) await step.run(page);
      interactionLog.push({ viewport: config.viewport, stepId: step.id, status: "ok" });
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      interactionLog.push({ viewport: config.viewport, stepId: step.id, status: "warning", error });
    }
    const filename = `${config.viewport}-play-${step.id}.png`;
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${filename}`, fullPage: true });
    shots.push({ viewport: config.viewport, filename, stepId: step.id, stepLabel: step.label, note: step.note, error });
  }
  await context.close();
  const savedVideo = config.recordVideo ? await saveVideo(page, config.viewport).catch(() => null) : null;
  return { shots, interactionLog, video: savedVideo };
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
      const result = await runViewport(viewport);
      allShots.push(...result.shots);
      fullInteractionLog.push(...result.interactionLog);
      if (result.video) allVideos.push(result.video);
    }
    await writeFile(MANIFEST_PATH, `${JSON.stringify({ generatedAt, appUrl: APP_URL, appSource, screenshots: allShots, videos: allVideos }, null, 2)}\n`);
    await writeFile(INTERACTION_LOG_PATH, `${JSON.stringify(fullInteractionLog, null, 2)}\n`);
    await writeFile(REPORT_PATH, buildReport({ generatedAt, appSource, shots: allShots, videos: allVideos, interactionLog: fullInteractionLog }));
    const warnings = fullInteractionLog.filter((item) => item.status !== "ok");
    if (warnings.length) throw new Error(`Play visual QA completed with ${warnings.length} interaction warning(s). See ${INTERACTION_LOG_PATH}`);
    console.log(`Play visual QA evidence written to ${OUTPUT_DIR}`);
  } finally {
    stopApp(startedProcess);
    clearTimeout(globalTimeout);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
