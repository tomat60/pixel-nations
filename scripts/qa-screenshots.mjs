import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const DEMO_STATE_KEY = "pixelNations.demoState.v1";
const OUTPUT_DIR = "public/qa/latest";
const SCREENSHOT_DIR = `${OUTPUT_DIR}/screenshots`;
const INDEX_PATH = `${OUTPUT_DIR}/index.html`;
const REPORT_PATH = `${OUTPUT_DIR}/report.html`;
const MANIFEST_PATH = `${OUTPUT_DIR}/manifest.json`;

const QA_CLAIMED_DEMO_STATE = {
  claimedLand: true,
  founderBadgeEarned: true,
  claimedLandId: "world-tile-98",
  claimedLandPnId: "PN-0499",
  claimedLandName: "Aurelia Verge",
  claimedLandCoordinates: "X22 / Y13",
  claimedLandRegion: "Aurelia",
  claimedLandTerrain: "Plains",
  claimedLandResources: "Grain, Livestock",
  settlementFounded: false,
  settlementName: "",
  population: 0,
  influence: 1,
  region: "Aurelia",
  coordinates: "X22 / Y13",
  founder: "You",
  townHallBuilt: false,
  settlementLevel: "Outpost",
  tradeRouteEstablished: false,
  tradeRouteDestination: "",
  tradeRoutes: 0,
  regionalAllianceFormed: false,
  allianceName: "",
  alliancePartners: [],
  politicalStatus: "",
  nationFounded: false,
  nationName: "",
  nationIdeology: "",
  landsControlled: 1,
  bordersExpanded: false,
  expandedLands: [],
  empireFounded: false,
  empireName: "",
  empireDoctrine: "",
  cities: 1,
};

const captures = [
  { filename: "mobile-home.png", route: "/", viewport: "mobile", width: 390, height: 844 },
  { filename: "mobile-landing-hero.png", route: "/", viewport: "mobile", width: 390, height: 844 },
  {
    filename: "mobile-landing-map-preview.png",
    route: "/",
    viewport: "mobile",
    width: 390,
    height: 844,
    selector: "[data-qa='landing-map-preview']",
  },
  { filename: "mobile-world.png", route: "/world", viewport: "mobile", width: 390, height: 844, fullPage: true },
  {
    filename: "mobile-world-top.png",
    route: "/world",
    viewport: "mobile",
    width: 390,
    height: 844,
    prepare: async (page) => {
      await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
      await page.waitForTimeout(300);
      await page.locator("[data-qa='mobile-claim-tray']").waitFor({ state: "hidden", timeout: 2000 });
    },
  },
  {
    filename: "mobile-world-atlas.png",
    route: "/world",
    viewport: "mobile",
    width: 390,
    height: 844,
    selector: "[data-qa='world-atlas']",
  },
  {
    filename: "mobile-world-sector.png",
    route: "/world",
    viewport: "mobile",
    width: 390,
    height: 844,
    selector: "[data-qa='playable-sector']",
  },
  {
    filename: "mobile-world-selected-land-panel.png",
    route: "/world",
    viewport: "mobile",
    width: 390,
    height: 844,
    selector: "[data-qa='selected-land-panel']",
  },
  {
    filename: "mobile-world-claim-tray.png",
    route: "/world",
    viewport: "mobile",
    width: 390,
    height: 844,
    viewportOnly: true,
    prepare: async (page) => {
      const sector = page.locator("[data-qa='playable-sector']").first();
      await sector.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const tile = page.locator("[data-qa='playable-sector'] button").nth(40);
      await tile.click();
      await page.waitForTimeout(400);
      await page.locator("[data-qa='mobile-claim-tray']").waitFor({ state: "visible", timeout: 5000 });
    },
  },
  {
    filename: "mobile-dashboard.png",
    route: "/dashboard",
    viewport: "mobile",
    width: 390,
    height: 844,
    prepare: async (page) => {
      await page.evaluate(
        ({ key, state }) => {
          localStorage.setItem(key, JSON.stringify(state));
        },
        { key: DEMO_STATE_KEY, state: QA_CLAIMED_DEMO_STATE },
      );
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(700);
    },
  },
  { filename: "mobile-settlement.png", route: "/settlement", viewport: "mobile", width: 390, height: 844 },
  { filename: "mobile-nation.png", route: "/nation", viewport: "mobile", width: 390, height: 844 },
  { filename: "mobile-empire.png", route: "/empire", viewport: "mobile", width: 390, height: 844 },
  { filename: "desktop-home.png", route: "/", viewport: "desktop", width: 1440, height: 900 },
  { filename: "desktop-world.png", route: "/world", viewport: "desktop", width: 1440, height: 900, fullPage: true },
  { filename: "desktop-world-top.png", route: "/world", viewport: "desktop", width: 1440, height: 900 },
  {
    filename: "desktop-world-atlas.png",
    route: "/world",
    viewport: "desktop",
    width: 1440,
    height: 900,
    selector: "[data-qa='world-atlas']",
  },
  {
    filename: "desktop-world-sector.png",
    route: "/world",
    viewport: "desktop",
    width: 1440,
    height: 900,
    selector: "[data-qa='playable-sector']",
  },
  {
    filename: "desktop-world-selected-land-panel.png",
    route: "/world",
    viewport: "desktop",
    width: 1440,
    height: 900,
    selector: "[data-qa='selected-land-panel']",
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
    return { startedProcess: null, appSource: "existing local app" };
  }

  const startedProcess = startAppIfNeeded();
  startedProcess.stdout?.on("data", (data) => process.stdout.write(data));
  startedProcess.stderr?.on("data", (data) => process.stderr.write(data));
  await waitForApp();
  return { startedProcess, appSource: existsSync(".next") ? "temporary next start" : "temporary next dev" };
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildReport({ generatedAt, appSource, screenshots }) {
  const routes = [...new Set(screenshots.map((item) => item.route))];
  const groups = routes
    .map((route) => {
      const routeScreenshots = screenshots.filter((shot) => shot.route === route);
      const cards = routeScreenshots
        .map(
          (shot) => `<article class="card">
            <div class="meta">
              <span>${escapeHtml(shot.viewport)}</span>
              <span>${escapeHtml(shot.route)}</span>
            </div>
            <h3>${escapeHtml(shot.filename)}</h3>
            <a href="./screenshots/${encodeURIComponent(shot.filename)}"><img src="./screenshots/${encodeURIComponent(shot.filename)}" alt="${escapeHtml(shot.filename)}" /></a>
          </article>`,
        )
        .join("\n");

      return `<section>
        <h2><code>${escapeHtml(route)}</code></h2>
        <div class="grid">${cards}</div>
      </section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pixel Nations QA Report</title>
  <style>
    :root { color-scheme: dark; --bg: #020204; --gold: #c9a962; --muted: #9ca3af; --border: rgba(201, 169, 98, 0.18); }
    body { margin: 0; background: var(--bg); color: #f8f5ed; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 1180px; margin: 0 auto; padding: 40px 20px 64px; }
    header { border-bottom: 1px solid var(--border); padding-bottom: 28px; margin-bottom: 28px; }
    h1 { margin: 0; font-size: clamp(2rem, 5vw, 4rem); letter-spacing: -0.04em; }
    h2 { margin: 0 0 16px; font-size: 1.2rem; color: #f5deb3; }
    h3 { margin: 12px 0 16px; font-size: 1rem; color: #f5deb3; }
    p, li { color: var(--muted); line-height: 1.7; }
    .eyebrow, .meta { color: var(--gold); text-transform: uppercase; letter-spacing: 0.22em; font-size: 0.72rem; font-weight: 700; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
    .card, section { border: 1px solid var(--border); background: linear-gradient(180deg, rgba(201,169,98,0.05), rgba(255,255,255,0.015)); padding: 16px; }
    section { margin-bottom: 18px; }
    .meta { display: flex; gap: 12px; flex-wrap: wrap; color: rgba(201,169,98,0.75); }
    img { width: 100%; height: auto; display: block; border: 1px solid rgba(255,255,255,0.08); background: #000; }
    code { color: #f5deb3; }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Pixel Nations QA Report</p>
      <h1>Pixel Nations QA Report</h1>
      <p>Generated: <code>${escapeHtml(generatedAt)}</code></p>
      <p>App source: <code>${escapeHtml(appSource)}</code></p>
    </header>

    <section>
      <h2>Captured Routes</h2>
      <ul>${routes.map((route) => `<li><code>${escapeHtml(route)}</code></li>`).join("")}</ul>
    </section>

    <section>
      <h2>Review Checklist</h2>
      <ul>
        <li>Landing hero</li>
        <li>World preview</li>
        <li>/world playable map</li>
        <li>Demo continuation</li>
        <li>Demo progress pages</li>
        <li>Mobile layout</li>
        <li>Modal behavior</li>
        <li>Reset modal</li>
      </ul>
    </section>

    ${groups}
  </main>
</body>
</html>`;
}

function buildIndex({ generatedAt, screenshots }) {
  const screenshotLinks = screenshots
    .map(
      (shot) =>
        `<li><a href="./screenshots/${encodeURIComponent(shot.filename)}">${escapeHtml(shot.filename)}</a> <span>${escapeHtml(
          shot.viewport,
        )} ${escapeHtml(shot.route)}</span></li>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pixel Nations QA Evidence</title>
  <style>
    :root { color-scheme: dark; --bg: #020204; --gold: #c9a962; --muted: #9ca3af; --border: rgba(201, 169, 98, 0.18); }
    body { margin: 0; background: var(--bg); color: #f8f5ed; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 900px; margin: 0 auto; padding: 40px 20px 64px; }
    header, section { border: 1px solid var(--border); background: linear-gradient(180deg, rgba(201,169,98,0.05), rgba(255,255,255,0.015)); padding: 20px; margin-bottom: 18px; }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 3.5rem); letter-spacing: -0.04em; }
    h2 { margin: 0 0 12px; color: #f5deb3; }
    p, li, span { color: var(--muted); line-height: 1.7; }
    a, code { color: #f5deb3; }
    .eyebrow { color: var(--gold); text-transform: uppercase; letter-spacing: 0.22em; font-size: 0.72rem; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Pixel Nations QA Evidence</p>
      <h1>Public QA Evidence</h1>
      <p>Generated: <code>${escapeHtml(generatedAt)}</code></p>
      <p>This page is a stable public entry point for the latest committed QA artifacts.</p>
    </header>

    <section>
      <h2>Primary Evidence</h2>
      <ul>
        <li><a href="./report.html">Visual QA report</a></li>
        <li><a href="./handoff.txt">Handoff TXT</a></li>
        <li><a href="./handoff.json">Handoff JSON</a></li>
        <li><a href="./manifest.json">Screenshot manifest</a></li>
      </ul>
    </section>

    <section>
      <h2>Screenshots</h2>
      <ul>${screenshotLinks}</ul>
    </section>
  </main>
</body>
</html>`;
}

async function gotoAndCapture(page, capture) {
  await page.setViewportSize({ width: capture.width, height: capture.height });
  await page.goto(`${APP_URL}${capture.route}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
  await page.waitForTimeout(250);

  if (capture.prepare) {
    await capture.prepare(page);
  }

  if (capture.viewportOnly) {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${capture.filename}` });
    return;
  }

  if (capture.selector) {
    const locator = page.locator(capture.selector).first();
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await locator.screenshot({ path: `${SCREENSHOT_DIR}/${capture.filename}` });
    return;
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/${capture.filename}`, fullPage: Boolean(capture.fullPage) });
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  await writeFile(`${SCREENSHOT_DIR}/.gitkeep`, "");

  const { startedProcess, appSource } = await ensureApp();
  let browser;

  try {
    browser = await chromium.launch();

    for (const capture of captures) {
      const context = await browser.newContext({
        viewport: { width: capture.width, height: capture.height },
        deviceScaleFactor: capture.viewport === "mobile" ? 3 : 1,
        isMobile: capture.viewport === "mobile",
      });
      const page = await context.newPage();
      await gotoAndCapture(page, capture);
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    if (startedProcess) startedProcess.kill();
  }

  const generatedAt = new Date().toISOString();
  const screenshots = captures.map(({ filename, route, viewport }) => ({ filename, route, viewport }));
  const manifest = {
    generatedAt,
    screenshots,
    notes: "Public QA screenshots for product/design review. Commit this folder and deploy to make /qa/latest/report.html available.",
  };

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(REPORT_PATH, buildReport({ generatedAt, appSource, screenshots }));
  await writeFile(INDEX_PATH, buildIndex({ generatedAt, screenshots }));

  console.log(`Public QA report written to ${REPORT_PATH}`);
  console.log(`Public QA index written to ${INDEX_PATH}`);
  console.log(`Public QA screenshots saved to ${SCREENSHOT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
