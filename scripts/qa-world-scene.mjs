import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/world-scene";
const REPORT_PATH = `${OUTPUT_DIR}/world-scene-result.json`;
const viewports = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

class WorldQaError extends Error { constructor(step, message) { super(message); this.step = step; } }
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", viewports: [] };

async function appRunning() { try { const res = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return res.ok || res.status < 500; } catch { return false; } }
async function ensureApp() {
  if (await appRunning()) return null;
  const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
  const proc = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32" });
  proc.stdout?.on("data", (data) => process.stdout.write(data));
  proc.stderr?.on("data", (data) => process.stderr.write(data));
  const started = Date.now();
  while (Date.now() - started < 30000) { if (await appRunning()) return proc; await new Promise((resolve) => setTimeout(resolve, 500)); }
  throw new WorldQaError("boot app", `Timed out waiting for ${APP_URL}`);
}
async function writeResult(status, error) { result.status = status; result.generatedAt = new Date().toISOString(); if (error) { result.blockingStep = error.step ?? "unknown"; result.error = error.message; } await mkdir(OUTPUT_DIR, { recursive: true }); await writeFile(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`); }

async function verifyViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
  await page.locator('[data-qa="view-world"]').click({ timeout: 7000 });
  const scene = page.locator('[data-qa="world-map-scene"]');
  await scene.waitFor({ state: "visible", timeout: 7000 });

  const modelSectorCount = await scene.getAttribute("data-sector-count");
  const visibleSectorCount = await scene.getAttribute("data-visible-sector-count");
  const worldLands = await scene.getAttribute("data-world-lands");
  const landsPerSector = await scene.getAttribute("data-lands-per-sector");
  const regionalMap = await scene.getAttribute("data-regional-map");
  if (modelSectorCount !== "100") throw new WorldQaError(`${viewport.id} model sector count`, `Expected 100 model sectors, got ${modelSectorCount}`);
  if (visibleSectorCount !== "25") throw new WorldQaError(`${viewport.id} visible sector count`, `Expected 25 regional sectors, got ${visibleSectorCount}`);
  if (worldLands !== "10000" || landsPerSector !== "100") throw new WorldQaError(`${viewport.id} world scale`, `Bad scale: ${worldLands} lands / ${landsPerSector} per sector`);
  if (regionalMap !== "5x5") throw new WorldQaError(`${viewport.id} regional contract`, `Expected 5x5 regional map, got ${regionalMap}`);

  const tiles = page.locator('[data-qa="world-sector-tile"]');
  const tileCount = await tiles.count();
  if (tileCount !== 25) throw new WorldQaError(`${viewport.id} rendered regional tiles`, `Expected 25 rendered tiles, got ${tileCount}`);
  const outsideRegion = await tiles.evaluateAll((nodes) => nodes.filter((node) => Number(node.getAttribute("data-sector-x")) >= 5 || Number(node.getAttribute("data-sector-y")) >= 5).length);
  if (outsideRegion !== 0) throw new WorldQaError(`${viewport.id} regional bounds`, `${outsideRegion} rendered sectors escaped the 5x5 Aurelian window`);

  const owned = await page.locator('[data-qa="world-sector-tile"][data-sector-control="owned"]').count();
  const claimable = await page.locator('[data-qa="world-sector-tile"][data-sector-control="claimable"]').count();
  const locked = await page.locator('[data-qa="world-sector-tile"][data-sector-control="locked"]').count();
  if (owned < 1 || claimable < 1 || locked < 1) throw new WorldQaError(`${viewport.id} territorial readability`, `Expected owned/claimable/locked sectors, got ${owned}/${claimable}/${locked}`);
  await page.locator('[data-qa="world-sector-tile"][data-sector-origin="true"][data-sector-control="owned"]').waitFor({ state: "visible", timeout: 5000 });

  await page.locator('[data-qa="world-sector-tile"][data-sector-id="A-01"]').click();
  await page.locator('[data-qa="world-sector-inspect"]').waitFor({ state: "visible", timeout: 5000 });
  const localLands = await page.locator('[data-qa="sector-local-land"]').count();
  const samples = await page.locator('[data-qa="world-land-sample"]').count();
  if (localLands !== 100) throw new WorldQaError(`${viewport.id} local land grid`, `Expected 100 local lands, got ${localLands}`);
  if (samples < 3) throw new WorldQaError(`${viewport.id} land samples`, `Expected generated land samples, got ${samples}`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new WorldQaError(`${viewport.id} horizontal overflow`, `Page overflows horizontally by ${overflow}px`);

  await page.screenshot({ path: `${OUTPUT_DIR}/world-map-scene-${viewport.id}.png`, fullPage: true });
  await context.close();
  return { id: viewport.id, width: viewport.width, height: viewport.height, modelSectorCount: 100, visibleSectorCount: 25, owned, claimable, locked, localLands, samples, horizontalOverflow: overflow };
}

async function main() {
  const proc = await ensureApp();
  let browser;
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    for (const viewport of viewports) result.viewports.push(await verifyViewport(browser, viewport));
    await writeResult("PASS");
    console.log(`World V2 QA PASS. Desktop/mobile evidence written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`World V2 QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    proc?.kill();
  }
  process.exit(process.exitCode ?? 0);
}

main();
