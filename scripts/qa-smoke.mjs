import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/latest";
const RESULT_PATH = `${OUTPUT_DIR}/smoke-result.json`;
const SMOKE_TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT_MS || "720000");

class SmokeError extends Error {
  constructor(step, message) {
    super(message);
    this.name = "SmokeError";
    this.step = step;
  }
}

const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, appSource: "", blockingStep: "", error: "", steps: [] };

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
  throw new SmokeError("boot app", `Timed out waiting for ${APP_URL}`);
}

function startAppIfNeeded() {
  const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
  return spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32" });
}

async function ensureApp() {
  if (await isAppRunning()) return { startedProcess: null, appSource: "existing local app" };
  const startedProcess = startAppIfNeeded();
  startedProcess.stdout?.on("data", (data) => process.stdout.write(data));
  startedProcess.stderr?.on("data", (data) => process.stderr.write(data));
  await waitForApp();
  return { startedProcess, appSource: existsSync(".next") ? "temporary next start" : "temporary next dev" };
}

async function writeResult(status, error) {
  result.status = status;
  result.generatedAt = new Date().toISOString();
  if (error) {
    result.blockingStep = error.step ?? "unknown";
    result.error = error.message;
  }
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(RESULT_PATH, `${JSON.stringify(result, null, 2)}\n`);
}

async function step(name, action) {
  const startedAt = Date.now();
  try {
    await action();
    result.steps.push({ name, status: "PASS", durationMs: Date.now() - startedAt });
  } catch (error) {
    const smokeError = error instanceof SmokeError ? error : new SmokeError(name, error.message);
    result.steps.push({ name, status: "FAIL", durationMs: Date.now() - startedAt, error: smokeError.message });
    throw smokeError;
  }
}

async function expectText(page, text, stepName) {
  const locator = page.getByText(text, { exact: false });
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const count = await locator.count().catch(() => 0);
    for (let index = 0; index < count; index += 1) {
      if (await locator.nth(index).isVisible().catch(() => false)) return;
    }
    await page.waitForTimeout(100);
  }
  throw new SmokeError(stepName, `Expected visible text: ${text}`);
}

async function clickButton(page, name, stepName) {
  const locator = page.getByRole("button", { name }).first();
  await locator.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
    throw new SmokeError(stepName, `Could not find button: ${name}`);
  });
  await locator.click();
}

async function closeBrowserSafely(browser) {
  if (!browser) return;
  await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 3000))]).catch(() => {});
}

async function runSmoke(page) {
  await step("open sector map with world scale", async () => {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expectText(page, "Pixel Nations", "open sector map with world scale");
    await expectText(page, "Aurelian Basin", "open sector map with world scale");
    await expectText(page, "30 charted of 10,000 lands", "open sector map with world scale");
    await expectText(page, "0/30", "open sector map with world scale");
  });

  await step("zoom and inspect far rival land", async () => {
    await clickButton(page, /^Near$/i, "zoom and inspect far rival land");
    await page.locator("[data-qa='plot-crownstone']").click({ timeout: 5000 });
    await expectText(page, "Crownstone", "zoom and inspect far rival land");
    await expectText(page, "PN-A01-022", "zoom and inspect far rival land");
    await expectText(page, "Rival", "zoom and inspect far rival land");
  });

  await step("return to starter and claim camp", async () => {
    await clickButton(page, /^Sector$/i, "return to starter and claim camp");
    await page.locator("[data-qa='plot-greenvale']").click({ timeout: 5000 });
    await clickButton(page, /^Choose this land$/i, "return to starter and claim camp");
    await expectText(page, "2/12", "return to starter and claim camp");
    await expectText(page, "1/30", "return to starter and claim camp");
    await expectText(page, "first camp founded", "return to starter and claim camp");
  });

  await step("bottom panels stay inside play shell", async () => {
    await clickButton(page, /^Settlement$/i, "bottom panels stay inside play shell");
    await expectText(page, "Still on the map", "bottom panels stay inside play shell");
    await clickButton(page, /^Map$/i, "bottom panels stay inside play shell");
    await expectText(page, "Map, camera, claim", "bottom panels stay inside play shell");
  });

  await step("play shell remains fullscreen framed", async () => {
    const shell = page.locator("[data-qa='play-shell']").first();
    await shell.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("play shell remains fullscreen framed", "Missing play shell QA marker");
    });
    const position = await shell.evaluate((element) => getComputedStyle(element).position);
    const overflow = await shell.evaluate((element) => getComputedStyle(element).overflow);
    if (position !== "fixed") throw new SmokeError("play shell remains fullscreen framed", `Expected fixed shell, got ${position}`);
    if (overflow !== "hidden") throw new SmokeError("play shell remains fullscreen framed", `Expected hidden overflow, got ${overflow}`);
  });
}

async function main() {
  const { startedProcess, appSource } = await ensureApp();
  result.appSource = appSource;
  process.on("SIGINT", () => { if (startedProcess) startedProcess.kill(); process.exit(130); });
  process.on("SIGTERM", () => { if (startedProcess) startedProcess.kill(); process.exit(143); });
  process.on("uncaughtException", (err) => { console.error("uncaughtException", err); if (startedProcess) startedProcess.kill(); process.exit(1); });
  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await Promise.race([(async () => { await runSmoke(page); })(), new Promise((_, reject) => setTimeout(() => reject(new SmokeError("smoke timeout", "Smoke exceeded internal time limit")), SMOKE_TIMEOUT_MS))]);
    await context.close();
    await closeBrowserSafely(browser);
    browser = null;
    await writeResult("PASS");
    console.log(`Mechanical smoke PASS. Result written to ${RESULT_PATH}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`Mechanical smoke FAIL at ${result.blockingStep}: ${result.error}`);
    console.error(`Result written to ${RESULT_PATH}`);
    process.exitCode = 1;
  } finally {
    await closeBrowserSafely(browser);
    if (startedProcess) {
      try { startedProcess.kill(); } catch {}
    }
  }
  process.exit(process.exitCode ?? 0);
}

main().catch(async (error) => {
  const smokeError = error instanceof SmokeError ? error : new SmokeError("smoke runner", error.message);
  await writeResult("FAIL", smokeError);
  console.error(`Mechanical smoke FAIL at ${result.blockingStep}: ${result.error}`);
  process.exit(1);
});
