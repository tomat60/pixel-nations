import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync, spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/latest";
const RESULT_PATH = `${OUTPUT_DIR}/smoke-result.json`;
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", steps: [] };
class SmokeError extends Error { constructor(step, message) { super(message); this.step = step; } }
async function appRunning() { try { const res = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return res.ok || res.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; if (!existsSync(".next")) execFileSync("npm", ["run", "build"], { stdio: "inherit", shell: process.platform === "win32" }); const command = ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"]; const proc = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32" }); proc.stdout?.on("data", (data) => process.stdout.write(data)); proc.stderr?.on("data", (data) => process.stderr.write(data)); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return proc; await new Promise((resolve) => setTimeout(resolve, 500)); } throw new SmokeError("boot app", `Timed out waiting for ${APP_URL}`); }
async function writeResult(status, error) { result.status = status; result.generatedAt = new Date().toISOString(); if (error) { result.blockingStep = error.step ?? "unknown"; result.error = error.message; } await mkdir(OUTPUT_DIR, { recursive: true }); await writeFile(RESULT_PATH, `${JSON.stringify(result, null, 2)}\n`); }
async function step(name, fn) { const started = Date.now(); try { await fn(); result.steps.push({ name, status: "PASS", durationMs: Date.now() - started }); } catch (err) { const error = err instanceof SmokeError ? err : new SmokeError(name, err.message); result.steps.push({ name, status: "FAIL", durationMs: Date.now() - started, error: error.message }); throw error; } }
async function clickView(page, id, stepName) { await page.locator(`[data-qa="view-${id}"]`).click({ timeout: 5000 }).catch(() => { throw new SmokeError(stepName, `Could not open ${id} view`); }); }

async function runSmoke(page) {
  await step("open current Aurelian shell", async () => {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
    await page.locator('[data-qa="play-shell"]').waitFor({ state: "visible", timeout: 5000 });
    for (const id of ["map", "village", "orders", "world", "council"]) await page.locator(`[data-qa="view-${id}"]`).waitFor({ state: "visible", timeout: 5000 });
  });

  await step("Aurelian Village is the real owned-land scene", async () => {
    await clickView(page, "village", "Aurelian Village is the real owned-land scene");
    const village = page.locator('[data-qa="aurelian-village-scene"]');
    await village.waitFor({ state: "visible", timeout: 5000 });
    if (await village.getAttribute("data-aurelian-stage") !== "camp") throw new SmokeError("Aurelian Village is the real owned-land scene", "Fresh Aurelian run did not begin at camp");
  });

  await step("World preserves 100-sector model through a 25-sector region", async () => {
    await clickView(page, "world", "World preserves 100-sector model through a 25-sector region");
    const scene = page.locator('[data-qa="world-map-scene"]');
    await scene.waitFor({ state: "visible", timeout: 5000 });
    const sectors = await page.locator('[data-qa="world-sector-tile"]').count();
    if (sectors !== 25) throw new SmokeError("World preserves 100-sector model through a 25-sector region", `Expected 25 rendered regional sectors, got ${sectors}`);
    if (await scene.getAttribute("data-world-lands") !== "10000") throw new SmokeError("World preserves 100-sector model through a 25-sector region", "World land count is not 10,000");
    if (await scene.getAttribute("data-sector-count") !== "100") throw new SmokeError("World preserves 100-sector model through a 25-sector region", "Sector model count is not 100");
    if (await scene.getAttribute("data-visible-sector-count") !== "25") throw new SmokeError("World preserves 100-sector model through a 25-sector region", "Visible regional sector count is not 25");
    if (await scene.getAttribute("data-lands-per-sector") !== "100") throw new SmokeError("World preserves 100-sector model through a 25-sector region", "Lands-per-sector count is not 100");
    await page.locator('[data-qa="world-sector-tile"][data-sector-origin="true"][data-sector-control="owned"]').waitFor({ state: "visible", timeout: 5000 });
    await page.locator('[data-qa="sector-land-scale-card"][data-land-count="100"]').waitFor({ state: "visible", timeout: 5000 });
  });

  await step("Council remains reachable", async () => {
    await clickView(page, "council", "Council remains reachable");
    await page.locator('[data-qa="council-panel"]').waitFor({ state: "visible", timeout: 5000 });
    await page.getByText("From land to empire", { exact: false }).first().waitFor({ state: "visible", timeout: 5000 });
  });
}

async function main() {
  const proc = await ensureApp();
  let browser;
  try {
    browser = await chromium.launch();
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await runSmoke(page);
    await writeResult("PASS");
    console.log(`Mechanical smoke PASS. Result written to ${RESULT_PATH}`);
  } catch (err) {
    await writeResult("FAIL", err);
    console.error(`Mechanical smoke FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    proc?.kill();
  }
  process.exit(process.exitCode ?? 0);
}
main();
