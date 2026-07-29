import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://127.0.0.1:3000";
const OUTPUT_DIR = "public/qa/aurelian-map-integration";
const cases = [
  { mode: "desktop", width: 1440, height: 900, expectedArt: "/art/aurelian-basin-map-desktop.png" },
  { mode: "portrait", width: 390, height: 844, expectedArt: "/art/aurelian-basin-map-portrait.png" },
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  if (await isAppRunning()) return null;
  const processHandle = startAppIfNeeded();
  processHandle.stdout?.on("data", (data) => process.stdout.write(data));
  processHandle.stderr?.on("data", (data) => process.stderr.write(data));
  await waitForApp();
  return processHandle;
}

async function captureCase(browser, testCase) {
  const context = await browser.newContext({
    viewport: { width: testCase.width, height: testCase.height },
    deviceScaleFactor: 1,
    isMobile: testCase.mode === "portrait",
    hasTouch: testCase.mode === "portrait",
  });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});

  const map = page.locator(`[data-qa="accepted-aurelian-map"][data-map-mode="${testCase.mode}"]`);
  await map.waitFor({ state: "visible", timeout: 8000 });
  const art = page.locator('[data-qa="aurelian-map-art"]');
  await art.waitFor({ state: "visible", timeout: 5000 });
  const href = await art.getAttribute("href");
  if (href !== testCase.expectedArt) throw new Error(`${testCase.mode} uses wrong art: ${href}`);

  const overflow = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  if (overflow.documentWidth > overflow.viewportWidth + 1 || overflow.bodyWidth > overflow.viewportWidth + 1) {
    throw new Error(`${testCase.mode} horizontal overflow: ${JSON.stringify(overflow)}`);
  }

  const greenvalePlot = page.locator('[data-qa="plot-greenvale"]');
  await greenvalePlot.waitFor({ state: "visible", timeout: 5000 });
  const mapMode = await map.getAttribute("data-map-mode");
  const greenvalePlotVisible = await greenvalePlot.isVisible();
  const claimButton = page.getByRole("button", { name: /Claim this land|Choose this land/i }).first();
  await claimButton.waitFor({ state: "visible", timeout: 5000 });
  await page.screenshot({ path: `${OUTPUT_DIR}/${testCase.mode}-01-first-run.png`, fullPage: false });

  await page.locator('[data-qa="plot-riverbend"]').click({ force: true });
  await page.getByText("Riverbend", { exact: true }).first().waitFor({ state: "visible", timeout: 5000 });
  await page.screenshot({ path: `${OUTPUT_DIR}/${testCase.mode}-02-riverbend-selected.png`, fullPage: false });

  await greenvalePlot.click({ force: true });
  await claimButton.click();
  await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 8000 });
  await page.screenshot({ path: `${OUTPUT_DIR}/${testCase.mode}-03-after-claim.png`, fullPage: false });

  const result = {
    mode: testCase.mode,
    viewport: [testCase.width, testCase.height],
    artHref: href,
    overflow,
    mapMode,
    greenvalePlotVisible,
    villageVisibleAfterClaim: await page.locator('[data-qa="village-scene"]').isVisible(),
  };
  await context.close();
  return result;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const appProcess = await ensureApp();
  const browser = await chromium.launch({ headless: true });
  try {
    const results = [];
    for (const testCase of cases) results.push(await captureCase(browser, testCase));
    await writeFile(`${OUTPUT_DIR}/result.json`, JSON.stringify({ classification: "PENDING_DIRECT_REVIEW", results }, null, 2) + "\n");
    console.log("AURELIAN_MAP_INTEGRATION_QA_OK");
  } finally {
    await browser.close();
    if (appProcess) {
      if (process.platform !== "win32") process.kill(-appProcess.pid, "SIGTERM");
      else appProcess.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
