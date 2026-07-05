import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/play-latest";
const SCREENSHOT_DIR = `${OUTPUT_DIR}/screenshots`;
const REPORT_PATH = `${OUTPUT_DIR}/report.html`;
const MANIFEST_PATH = `${OUTPUT_DIR}/manifest.json`;

const viewports = [
  { viewport: "mobile", width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
  { viewport: "tablet", width: 768, height: 1024, deviceScaleFactor: 1, isMobile: false },
  { viewport: "desktop", width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false },
];

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
      await page.locator("[data-qa='parcel-greenvale']").click();
      await page.waitForTimeout(450);
    },
  },
  {
    id: "03-after-claim",
    label: "After claim",
    note: "The map should visibly show owned land, capital seed, influence ring, and objective should push the player to Orders.",
    run: async (page) => {
      await page.locator("[data-qa='claim-button']").click();
      await page.waitForTimeout(600);
    },
  },
  {
    id: "04-orders-open",
    label: "Orders open",
    note: "Orders should read as decision cards with clear consequences, not generic buttons.",
    run: async (page) => {
      await page.getByRole("button", { name: /Orders/i }).click();
      await page.waitForTimeout(500);
    },
  },
  {
    id: "05-after-expand",
    label: "After Expand order",
    note: "Issuing Expand should create a visible owned-parcel consequence and update latest consequence/chronicle direction.",
    run: async (page) => {
      await page.getByRole("button", { name: /Expand/i }).first().click();
      await page.waitForTimeout(650);
    },
  },
  {
    id: "06-after-develop",
    label: "After Develop order",
    note: "Develop should raise the capital marker so progression is visible on-map.",
    run: async (page) => {
      await page.getByRole("button", { name: /Develop/i }).first().click();
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
  while (Date.now() - started < 30000) {
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildReport({ generatedAt, appSource, shots }) {
  const cards = shots
    .map(
      (shot) => `<article class="card">
        <div class="meta"><span>${escapeHtml(shot.viewport)}</span><span>${escapeHtml(shot.stepLabel)}</span></div>
        <h3>${escapeHtml(shot.filename)}</h3>
        <p>${escapeHtml(shot.note)}</p>
        <a href="./screenshots/${encodeURIComponent(shot.filename)}"><img src="./screenshots/${encodeURIComponent(shot.filename)}" alt="${escapeHtml(shot.filename)}" /></a>
      </article>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pixel Nations /play QA</title>
  <style>
    :root { color-scheme: dark; --bg: #020204; --gold: #c9a962; --muted: #9ca3af; --border: rgba(201, 169, 98, 0.18); }
    body { margin: 0; background: var(--bg); color: #f8f5ed; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 1280px; margin: 0 auto; padding: 40px 20px 64px; }
    header, .card, section { border: 1px solid var(--border); background: linear-gradient(180deg, rgba(201,169,98,0.05), rgba(255,255,255,0.015)); padding: 18px; margin-bottom: 18px; }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 4rem); letter-spacing: -0.04em; }
    h2, h3 { color: #f5deb3; }
    p, li { color: var(--muted); line-height: 1.65; }
    .eyebrow, .meta { color: var(--gold); text-transform: uppercase; letter-spacing: 0.18em; font-size: .72rem; font-weight: 800; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
    img { width: 100%; height: auto; display: block; border: 1px solid rgba(255,255,255,0.08); background: #000; }
    code { color: #f5deb3; }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Pixel Nations /play Visual QA</p>
      <h1>First Minute Screenshot Evidence</h1>
      <p>Generated: <code>${escapeHtml(generatedAt)}</code></p>
      <p>App source: <code>${escapeHtml(appSource)}</code></p>
      <p>This report captures the actual /play first-minute sequence across mobile, tablet, and desktop. It does not approve art direction by itself; it creates evidence for manual visual/gameplay verdict.</p>
    </header>
    <section>
      <h2>Manual verdict required</h2>
      <ul>
        <li>Does the first screen feel like a game, not a website?</li>
        <li>Is the first clickable land obvious?</li>
        <li>After claim, is owned land/capital/influence visible without explanation?</li>
        <li>Do Orders feel like decisions with map consequences?</li>
        <li>Does the map inspire “I want to grow this land”?</li>
      </ul>
    </section>
    <div class="grid">${cards}</div>
  </main>
</body>
</html>`;
}

async function captureStep(page, viewport, step, shots) {
  if (step.run) await step.run(page);
  const filename = `${viewport.viewport}-play-${step.id}.png`;
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${filename}` });
  shots.push({ filename, viewport: viewport.viewport, stepLabel: step.label, note: step.note });
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  await writeFile(`${SCREENSHOT_DIR}/.gitkeep`, "");

  const { startedProcess, appSource } = await ensureApp();
  let browser;
  const shots = [];

  try {
    browser = await chromium.launch();
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
        isMobile: viewport.isMobile,
      });
      const page = await context.newPage();
      await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await page.locator("[data-qa='play-shell']").waitFor({ state: "visible", timeout: 8000 });
      await page.waitForTimeout(700);

      for (const step of steps) {
        await captureStep(page, viewport, step, shots);
      }
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    if (startedProcess) startedProcess.kill();
  }

  const generatedAt = new Date().toISOString();
  await writeFile(MANIFEST_PATH, `${JSON.stringify({ generatedAt, appSource, route: "/play", shots }, null, 2)}\n`);
  await writeFile(REPORT_PATH, buildReport({ generatedAt, appSource, shots }));

  console.log(`Pixel Nations /play QA report written to ${REPORT_PATH}`);
  console.log(`Pixel Nations /play screenshots saved to ${SCREENSHOT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
