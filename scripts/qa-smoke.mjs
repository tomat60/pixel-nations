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

async function getMapViewBox(page) {
  return page.locator("svg[aria-label='Aurelian Basin fullscreen map']").first().getAttribute("viewBox");
}

async function pinchZoom(page, selector) {
  await page.locator(selector).evaluate((node) => {
    node.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -180, clientX: 720, clientY: 450 }));
  });
}

async function dragMap(page) {
  const box = await page.locator("[data-qa='map-stage']").boundingBox();
  if (!box) throw new SmokeError("drag map after zoom", "Missing map-stage bounds");
  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.52);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.43, box.y + box.height * 0.60, { steps: 10 });
  await page.mouse.up();
}

async function runSmoke(page) {
  await step("open full sector overview", async () => {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expectText(page, "30 charted of 10,000 lands", "open full sector overview");
    await expectText(page, "Reset view", "open full sector overview");
    await expectText(page, "pinch zoom", "open full sector overview");
  });

  await step("pinch zoom changes bounded viewbox", async () => {
    const before = await getMapViewBox(page);
    await pinchZoom(page, "svg[aria-label='Aurelian Basin fullscreen map']");
    await page.waitForTimeout(350);
    const after = await getMapViewBox(page);
    if (!before || !after || before === after || !after.includes(".")) throw new SmokeError("pinch zoom changes bounded viewbox", `Expected viewBox change, before=${before}, after=${after}`);
  });

  await step("drag map after zoom changes viewbox", async () => {
    const before = await getMapViewBox(page);
    await dragMap(page);
    await page.waitForTimeout(250);
    const after = await getMapViewBox(page);
    if (!before || !after || before === after) throw new SmokeError("drag map after zoom changes viewbox", `Expected drag to change viewBox, before=${before}, after=${after}`);
  });

  await step("overview inspect rival land", async () => {
    await clickButton(page, /^Reset view$/i, "overview inspect rival land");
    await page.locator("[data-qa='plot-crownstone']").click({ timeout: 5000, force: true });
    await expectText(page, "Crownstone", "overview inspect rival land");
    await expectText(page, "PN-A01-022", "overview inspect rival land");
  });

  await step("claim homeland", async () => {
    await clickButton(page, /^Reset view$/i, "claim homeland");
    await page.locator("[data-qa='plot-greenvale']").click({ timeout: 5000, force: true });
    await clickButton(page, /^Choose this land$/i, "claim homeland");
    await expectText(page, "Grow the first settlement", "claim homeland");
    await expectText(page, "Food", "claim homeland");
  });

  await step("run five post claim orders", async () => {
    for (const order of [/Raise Shelter/i, /Gather Food/i, /Cut Timber/i, /Scout Nearby Land/i, /Build Storehouse/i]) {
      await clickButton(page, order, "run five post claim orders");
      await page.waitForTimeout(120);
    }
    await expectText(page, "5 orders complete", "run five post claim orders");
    await expectText(page, "Storehouse built", "run five post claim orders");
  });

  await step("map shows visible consequences", async () => {
    await page.locator("[data-qa='settlement-marker']").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("map shows visible consequences", "Missing settlement marker after orders");
    });
    await clickButton(page, /^Open Market Path$/i, "map shows visible consequences");
    await page.locator("[data-qa='market-route']").waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("map shows visible consequences", "Missing market route after order");
    });
  });

  await step("panel switching avoids overlap", async () => {
    await clickButton(page, /^Banner$/i, "panel switching avoids overlap");
    await page.locator("[data-qa='chronicle-panel']").waitFor({ state: "visible", timeout: 5000 });
    const ordersVisible = await page.locator("[data-qa='orders-panel']").isVisible().catch(() => false);
    if (ordersVisible) throw new SmokeError("panel switching avoids overlap", "Orders panel remained visible while Chronicle was open");
  });

  await step("play shell remains fullscreen framed", async () => {
    const shell = page.locator("[data-qa='play-shell']").first();
    await shell.waitFor({ state: "visible", timeout: 5000 });
    const position = await shell.evaluate((element) => getComputedStyle(element).position);
    const overflow = await shell.evaluate((element) => getComputedStyle(element).overflow);
    if (position !== "fixed") throw new SmokeError("play shell remains fullscreen framed", `Expected fixed shell, got ${position}`);
    if (overflow !== "hidden") throw new SmokeError("play shell remains fullscreen framed", `Expected hidden overflow, got ${overflow}`);
  });
}

async function main() {
  const { startedProcess, appSource } = await ensureApp();
  result.appSource = appSource;
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
