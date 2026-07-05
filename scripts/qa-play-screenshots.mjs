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

function timeoutPromise(label, promise, timeoutMs = 8_000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)),
  ]);
}

async function dispatchDomClick(page, selector) {
  const clicked = await timeoutPromise(
    `DOM click ${selector}`,
    page.evaluate((targetSelector) => {
      const element = document.querySelector(targetSelector);
      if (!element) return false;
      element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    }, selector),
    3_000,
  );
  if (!clicked) throw new Error(`Could not find ${selector}`);
}

async function clickButtonByText(page, pattern) {
  const clicked = await timeoutPromise(
    `Button click ${pattern}`,
    page.evaluate((source) => {
      const regex = new RegExp(source, "i");
      const buttons = Array.from(document.querySelectorAll("button"));
      const button = buttons.find((item) => regex.test(item.textContent ?? ""));
      if (!button) return false;
      button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      return true;
    }, pattern.source),
    3_000,
  );
  if (!clicked) throw new Error(`Could not find button matching ${pattern}`);
}

const steps = [
  {
    id: "01-initial-map",
    label: "Initial fullscreen map",
    note: "The player should immediately read this as a fullscreen game map, not a dashboard.",
  },
  {
    id: "02-selected-riverbend",
    label: "Organic plot selected",
    note: "Selecting another land should update the land sheet and selected ring.",
    run: async (page) => {
      await dispatchDomClick(page, "[data-qa='plot-riverbend']");
      await page.waitForTimeout(450);
    },
  },
  {
    id: "03-after-claim",
    label: "After claim",
    note: "Claim should create a visible owned banner/outline and update season/land counts.",
    run: async (page) => {
      await clickButtonByText(page, /choose this land/);
      await page.waitForTimeout(600);
    },
  },
  {
    id: "04-layer-preview",
    label: "Layer preview stays over map",
    note: "A non-map layer should remain a light overlay, keeping the map as the game surface.",
    run: async (page) => {
      await clickButtonByText(page, /settlement/);
      await page.waitForTimeout(500);
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
  while (Date.now() - started < 30_000) {
    if (await isAppRunning()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
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
  try {
    if (process.platform !== "win32") process.kill(-startedProcess.pid, "SIGTERM");
    else startedProcess.kill("SIGTERM");
  } catch {}
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildReport({ generatedAt, appSource, shots, videos, interactionLog }) {
  const videoCards = videos.length
    ? videos.map((video) => `<article class="card"><div class="meta"><span>${escapeHtml(video.viewport)}</span><span>milestone video</span></div><h3>${escapeHtml(video.filename)}</h3><video controls src="./videos/${encodeURIComponent(video.filename)}"></video></article>`).join("\n")
    : `<p class="error-text">No video evidence generated.</p>`;

  const screenshotCards = shots.map((shot) => `<article class="card ${shot.error ? "error" : ""}"><div class="meta"><span>${escapeHtml(shot.viewport)}</span><span>${escapeHtml(shot.stepLabel)}</span></div><h3>${escapeHtml(shot.filename)}</h3><p>${escapeHtml(shot.note)}</p>${shot.error ? `<p class="error-text"><strong>Interaction warning:</strong> ${escapeHtml(shot.error)}</p>` : ""}<a href="./screenshots/${encodeURIComponent(shot.filename)}"><img src="./screenshots/${encodeURIComponent(shot.filename)}" alt="${escapeHtml(shot.filename)}" /></a></article>`).join("\n");

  const logItems = interactionLog.map((item) => `<li><code>${escapeHtml(item.viewport)}</code> / <code>${escapeHtml(item.stepId)}</code> — ${escapeHtml(item.status)}${item.error ? `: ${escapeHtml(item.error)}` : ""}</li>`).join("\n");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Pixel Nations /play Milestone QA</title><style>:root{color-scheme:dark;--bg:#020204;--gold:#c9a962;--muted:#9ca3af;--border:rgba(201,169,98,.18);--bad:#f97373}body{margin:0;background:var(--bg);color:#f8f5ed;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1280px;margin:0 auto;padding:40px 20px 64px}header,.card,section{border:1px solid var(--border);background:linear-gradient(180deg,rgba(201,169,98,.05),rgba(255,255,255,.015));padding:18px;margin-bottom:18px}.card.error{border-color:rgba(249,115,115,.55)}h1{margin:0 0 12px;font-size:clamp(2rem,5vw,4rem);letter-spacing:-.04em}h2,h3{color:#f5deb3}p,li{color:var(--muted);line-height:1.65}.error-text{color:var(--bad)}.eyebrow,.meta{color:var(--gold);text-transform:uppercase;letter-spacing:.18em;font-size:.72rem;font-weight:800}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px}img,video{width:100%;height:auto;display:block;border:1px solid rgba(255,255,255,.08);background:#000}code{color:#f5deb3}</style></head><body><main><header><p class="eyebrow">Pixel Nations /play Visual QA</p><h1>Fullscreen Map Milestone Evidence</h1><p>Generated: <code>${escapeHtml(generatedAt)}</code></p><p>App source: <code>${escapeHtml(appSource)}</code></p><p>This report captures Milestone 1 only: fullscreen map, plot selection, claim, and lightweight layer overlay.</p></header><section><h2>Manual verdict required</h2><ul><li>Does the first screen feel like a game map, not a dashboard?</li><li>Are organic land plots clear and clickable?</li><li>After claim, is owned land visibly marked on the map?</li><li>Does the UI remain HUD-like instead of taking over the map?</li></ul></section><section><h2>Gameplay videos</h2><div class="grid">${videoCards}</div></section><section><h2>Interaction log</h2><ul>${logItems}</ul></section><section><h2>Screenshots</h2><div class="grid">${screenshotCards}</div></section></main></body></html>`;
}

async function saveVideo(page, viewport) {
  const video = page.video();
  if (!video) return null;
  const videoPath = await video.path().catch(() => null);
  if (!videoPath) return null;
  await mkdir(VIDEO_DIR, { recursive: true });
  const filename = `${viewport}-fullscreen-map-milestone.webm`;
  await copyFile(videoPath, `${VIDEO_DIR}/${filename}`);
  return { viewport, filename };
}

async function runViewport(config) {
  const context = await chromium.launchPersistentContext("", {
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: config.deviceScaleFactor,
    isMobile: config.isMobile,
    recordVideo: config.recordVideo ? { dir: VIDEO_DIR, size: { width: config.width, height: config.height } } : undefined,
  });

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

    const manifest = { generatedAt, appUrl: APP_URL, appSource, screenshots: allShots, videos: allVideos };
    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
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
