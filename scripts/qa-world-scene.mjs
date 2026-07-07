import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/world-scene";
const REPORT_PATH = `${OUTPUT_DIR}/world-scene-result.json`;

class WorldQaError extends Error { constructor(step, message) { super(message); this.step = step; } }
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", counts: {}, inspected: [] };

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
async function clickButton(page, name, step) { await page.getByRole("button", { name }).first().click({ timeout: 5000 }).catch(() => { throw new WorldQaError(step, `Could not click button: ${name}`); }); }

async function main() {
  const proc = await ensureApp();
  let browser;
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
    await clickButton(page, /^World$/i, "open world scene");
    await page.locator('[data-qa="world-map-scene"]').waitFor({ state: "visible", timeout: 5000 });

    const tiles = page.locator('[data-qa="world-sector-tile"]');
    const tileCount = await tiles.count();
    if (tileCount !== 100) throw new WorldQaError("count sector tiles", `Expected 100 world-sector-tile nodes, got ${tileCount}`);

    const counts = await tiles.evaluateAll((nodes) => nodes.reduce((acc, node) => {
      const kind = node.getAttribute("data-sector-kind") ?? "missing";
      acc[kind] = (acc[kind] ?? 0) + 1;
      if (node.getAttribute("data-sector-origin") === "true") acc.originAttr = (acc.originAttr ?? 0) + 1;
      if (node.getAttribute("data-sector-rival") === "true") acc.rivalAttr = (acc.rivalAttr ?? 0) + 1;
      if (node.getAttribute("data-sector-trade") === "true") acc.tradeAttr = (acc.tradeAttr ?? 0) + 1;
      if (node.getAttribute("data-sector-danger") === "true") acc.dangerAttr = (acc.dangerAttr ?? 0) + 1;
      return acc;
    }, {}));
    result.counts = counts;
    if ((counts.originAttr ?? 0) !== 1) throw new WorldQaError("origin sector", `Expected one origin sector, got ${counts.originAttr ?? 0}`);
    if ((counts.rivalAttr ?? 0) < 1) throw new WorldQaError("rival sectors", "Expected at least one rival sector");
    if ((counts.tradeAttr ?? 0) < 1) throw new WorldQaError("trade sectors", "Expected at least one trade-rich sector");
    if ((counts.dangerAttr ?? 0) < 1) throw new WorldQaError("danger sectors", "Expected at least one high-danger sector");

    const inspect = page.locator('[data-qa="world-sector-inspect"]');
    await inspect.waitFor({ state: "visible", timeout: 5000 });
    await tiles.nth(0).click();
    await tiles.nth(44).click();
    await tiles.nth(99).click();
    const sampleCount = await page.locator('[data-qa="world-land-sample"]').count();
    if (sampleCount < 3) throw new WorldQaError("land samples", `Expected generated land samples, got ${sampleCount}`);
    const stillVisible = await page.locator('[data-qa="world-sector-tile"]').count();
    if (stillVisible !== 100) throw new WorldQaError("grid remains visible", "Sector grid disappeared during inspection");
    result.inspected = [0, 44, 99];
    await page.screenshot({ path: `${OUTPUT_DIR}/world-map-scene.png`, fullPage: true });
    await context.close();
    await writeResult("PASS");
    console.log(`World scene QA PASS. Result written to ${REPORT_PATH}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`World scene QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    proc?.kill();
  }
  process.exit(process.exitCode ?? 0);
}

main();
