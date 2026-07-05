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
    label: "Initial /play load",
    note: "The player should immediately understand this is Aurelian Basin, one fullscreen map game, and that glowing starter lands are clickable.",
  },
  {
    id: "02-selected-starter",
    label: "Starter selected",
    note: "Selecting a starter should update the selected parcel panel and make the next action obvious.",
    run: async (page) => {
      await dispatchDomClick(page, "[data-qa='parcel-greenvale']");
      await page.waitForTimeout(450);
    },
  },
  {
    id: "03-after-claim",
    label: "After claim",
    note: "The map should visibly show owned land, capital seed, influence ring, and objective should push the player to Orders.",
    run: async (page) => {
      await clickButtonByText(page, /claim this land|choose this land/);
      await page.waitForTimeout(600);
    },
  },
  {
    id: "04-orders-open",
    label: "Orders open",
    note: "Orders should read as decision cards with clear consequences, not generic buttons.",
    run: async (page) => {
      await clickButtonByText(page, /orders/);
      await page.waitForTimeout(500);
    },
  },
  {
    id: "05-after-expand",
    label: "After Expand order",
    note: "Issuing Expand should create a visible owned-parcel consequence and update latest consequence/chronicle direction.",
    run: async (page) => {
      await clickButtonByText(page, /expand/);
      await page.waitForTimeout(650);
    },
  },
  {
    id: "06-after-develop",
    label: "After Develop order",
    note: "Develop should raise the capital marker so progression is visible on-map.",
    run: async (page) => {
      await clickButtonByText(page, /develop/);
      await page.waitForTimeout(650);
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
  if (await isAppRunning()) {
    return { startedProcess: null, appSource: "existing app" };
  }

  const startedProcess = startAppIfNeeded();
  startedProcess.stdout?.on("data", (data) => process.stdout.write(data));
  startedProcess.stderr?.on("data", (data) => process.stderr.write(data));
  await waitForApp();
  return { startedProcess, appSource: existsSync(".next") ? "temporary next start" : "temporary next dev" };
}

function stopApp(startedProcess) {
  if (!startedProcess) return;

  try {
    if (process.platform !== "win32") {
      process.kill(-startedProcess.pid, "SIGTERM");
    } else {
      startedProcess.kill("SIGTERM");
    }
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
    ? videos
        .map(
          (video) => `<article class="card">
            <div class="meta"><span>${escapeHtml(video.viewport)}</span><span>first-minute video</span></div>
            <h3>${escapeHtml(video.filename)}</h3>
            <video controls src="./videos/${encodeURIComponent(video.filename)}"></video>
          </article>`,
        )
        .join("\n")
    : `<p class="error-text">No video evidence generated.</p>`;

  const screenshotCards = shots
    .map(
      (shot) => `<article class="card ${shot.error ? "error" : ""}">
        <div class="meta"><span>${escapeHtml(shot.viewport)}</span><span>${escapeHtml(shot.stepLabel)}</span></div>
        <h3>${escapeHtml(shot.filename)}</h3>
        <p>${escapeHtml(shot.note)}</p>
        ${shot.error ? `<p class="error-text"><strong>Interaction warning:</strong> ${escapeHtml(shot.error)}</p>` : ""}
        <a href="./screenshots/${encodeURIComponent(shot.filename)}"><img src="./screenshots/${encodeURIComponent(shot.filename)}" alt="${escapeHtml(shot.filename)}" /></a>
      </article>`,
    )
    .join("\n");

  const logItems = interactionLog
    .map(
      (item) => `<li><code>${escapeHtml(item.viewport)}</code> / <code>${escapeHtml(item.stepId)}</code> — ${escapeHtml(item.status)}${item.error ? `: ${escapeHtml(item.error)}` : ""}</li>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pixel Nations /play QA</title>
  <style>
    :root { color-scheme: dark; --bg: #020204; --gold: #c9a962; --muted: #9ca3af; --border: rgba(201, 169, 98, 0.18); --bad: #f97373; }
    body { margin: 0; background: var(--bg); color: #f8f5ed; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 1280px; margin: 0 auto; padding: 40px 20px 64px; }
    header, .card, section { border: 1px solid var(--border); background: linear-gradient(180deg, rgba(201,169,98,0.05), rgba(255,255,255,0.015)); padding: 18px; margin-bottom: 18px; }
    .card.error { border-color: rgba(249, 115, 115, .55); }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 4rem); letter-spacing: -0.04em; }
    h2, h3 { color: #f5deb3; }
    p, li { color: var(--muted); line-height: 1.65; }
    .error-text { color: var(--bad); }
    .eyebrow, .meta { color: var(--gold); text-transform: uppercase; letter-spacing: 0.18em; font-size: .72rem; font-weight: 800; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
    img, video { width: 100%; height: auto; display: block; border: 1px solid rgba(255,255,255,0.08); background: #000; }
    code { color: #f5deb3; }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Pixel Nations /play Visual QA</p>
      <h1>First Minute Gameplay Evidence</h1>
      <p>Generated: <code>${escapeHtml(generatedAt)}</code></p>
      <p>App source: <code>${escapeHtml(appSource)}</code></p>
      <p>This report captures /play with video, screenshots, and interaction warnings. Video is required for motion/game-feel; screenshots are required for layout/composition.</p>
    </header>
    <section>
      <h2>Manual verdict required</h2>
      <ul>
        <li>Does the first screen feel like a game, not a website?</li>
        <li>Is the first clickable land obvious without explanation?</li>
        <li>After claim, are owned land/capital/influence visible on-map?</li>
        <li>Do Orders feel like decisions with consequences?</li>
        <li>Do motion, timing, and transitions support the fantasy of land → empire?</li>
      </ul>
    </section>
    <section>
      <h2>Gameplay videos</h2>
      <div class="grid">${videoCards}</div>
    </section>
    <section>
      <h2>Interaction log</h2>
      <ul>${logItems}</ul>
    </section>
    <section>
      <h2>Screenshots</h2>
      <div class="grid">${screenshotCards}</div>
    </section>
  </main>
</body>
</html>`;
}

async function captureStep(page, viewport, step, shots, interactionLog) {
  let error = null;
  try {
    if (step.run) await timeoutPromise(`${viewport.viewport} ${step.id}`, step.run(page), 10_000);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  const filename = `${viewport.viewport}-play-${step.id}${error ? "-warning" : ""}.png`;
  await timeoutPromise(`Screenshot ${filename}`, page.screenshot({ path: `${SCREENSHOT_DIR}/${filename}` }), 8_000);

  shots.push({ filename, viewport: viewport.viewport, stepId: step.id, stepLabel: step.label, note: step.note, error });
  interactionLog.push({ viewport: viewport.viewport, stepId: step.id, label: step.label, status: error ? "warning" : "ok", error });
}

async function saveVideo(page, viewport, videos) {
  if (!viewport.recordVideo) return;
  const video = page.video();
  if (!video) return;

  const sourcePath = await video.path();
  const filename = `${viewport.viewport}-first-minute.webm`;
  await copyFile(sourcePath, `${VIDEO_DIR}/${filename}`);
  videos.push({ viewport: viewport.viewport, filename });
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });
  await writeFile(`${SCREENSHOT_DIR}/.gitkeep`, "");
  await writeFile(`${VIDEO_DIR}/.gitkeep`, "");

  const { startedProcess, appSource } = await ensureApp();
  let browser;
  const shots = [];
  const videos = [];
  const interactionLog = [];

  try {
    browser = await chromium.launch();
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
        isMobile: viewport.isMobile,
        recordVideo: viewport.recordVideo ? { dir: VIDEO_DIR, size: { width: viewport.width, height: viewport.height } } : undefined,
      });
      context.setDefaultTimeout(8_000);
      const page = await context.newPage();
      await timeoutPromise(`${viewport.viewport} goto /play`, page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" }), 12_000);
      await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
      await page.locator("[data-qa='play-shell']").waitFor({ state: "visible", timeout: 8_000 });
      await page.waitForTimeout(700);

      for (const step of steps) {
        await captureStep(page, viewport, step, shots, interactionLog);
      }

      await context.close();
      await saveVideo(page, viewport, videos);
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    stopApp(startedProcess);
  }

  const generatedAt = new Date().toISOString();
  await writeFile(INTERACTION_LOG_PATH, `${JSON.stringify(interactionLog, null, 2)}\n`);
  await writeFile(MANIFEST_PATH, `${JSON.stringify({ generatedAt, appSource, route: "/play", shots, videos, interactionLog }, null, 2)}\n`);
  await writeFile(REPORT_PATH, buildReport({ generatedAt, appSource, shots, videos, interactionLog }));

  console.log(`Pixel Nations /play QA report written to ${REPORT_PATH}`);
  console.log(`Pixel Nations /play screenshots saved to ${SCREENSHOT_DIR}`);
  console.log(`Pixel Nations /play videos saved to ${VIDEO_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
