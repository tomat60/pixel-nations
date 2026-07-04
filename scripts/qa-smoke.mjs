import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/latest";
const RESULT_PATH = `${OUTPUT_DIR}/smoke-result.json`;

// Maximum internal smoke duration in ms (default 12 minutes).
const SMOKE_TIMEOUT_MS = parseInt(process.env.SMOKE_TIMEOUT_MS || "720000");

class SmokeError extends Error {
  constructor(step, message) {
    super(message);
    this.name = "SmokeError";
    this.step = step;
  }
}

const result = {
  status: "RUNNING",
  generatedAt: "",
  appUrl: APP_URL,
  appSource: "",
  blockingStep: "",
  error: "",
  steps: [],
};

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
    result.steps.push({
      name,
      status: "FAIL",
      durationMs: Date.now() - startedAt,
      error: smokeError.message,
    });
    throw smokeError;
  }
}

async function expectText(page, text, stepName) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
    throw new SmokeError(stepName, `Expected visible text: ${text}`);
  });
}

async function clickButton(page, name, stepName) {
  const locator = page.getByRole("button", { name }).first();
  await locator.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
    throw new SmokeError(stepName, `Could not find button: ${name}`);
  });
  await locator.click();
}

async function readJsonState(page, key, stepName) {
  return page.evaluate((storageKey) => {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  }, key).catch((error) => {
    throw new SmokeError(stepName, `Could not read ${key}: ${error.message}`);
  });
}

async function expectStorageState(page, key, stepName, predicate, message) {
  const state = await readJsonState(page, key, stepName);
  if (!predicate(state)) {
    throw new SmokeError(stepName, `${message}. Current state: ${JSON.stringify(state)}`);
  }
}

async function closeBrowserSafely(browser) {
  if (!browser) return;

  await Promise.race([
    browser.close(),
    new Promise((resolve) => setTimeout(resolve, 3000)),
  ]).catch(() => {});
}

async function runSmoke(page) {
  await step("playable command center route", async () => {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expectText(page, "Settlement command center", "playable command center route");
    await page.locator("[data-qa='play-resource-counters']").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("playable command center route", "Playable resource counters did not render");
    });
    await page.locator("[data-qa='play-action-list']").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("playable command center route", "Playable action list did not render");
    });
    await page.locator("[data-qa='play-action-gather-food']").first().click();
    await expectText(page, "Gather Food", "playable command center route");
    await page.locator("[data-qa='play-active-queue']").getByText("Gather Food").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("playable command center route", "Gather Food did not enter the active queue");
    });
  });

  await step("open first age world shell", async () => {
    await page.goto(`${APP_URL}/world`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expectText(page, "Pixel Nations / The First Age", "open first age world shell");
    await expectText(page, "Aurelian Basin", "open first age world shell");
    await expectText(page, "Choose a land", "open first age world shell");
    await expectText(page, "Nation Charter", "open first age world shell");
  });

  await step("choose and claim first age land", async () => {
    await page.getByLabel("Select Greenvale").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("choose and claim first age land", "Could not find selectable Greenvale land marker");
    });
    await page.getByLabel("Select Greenvale").first().click();
    await expectText(page, "Greenvale", "choose and claim first age land");
    await clickButton(page, /^Claim This Land$/i, "choose and claim first age land");
    await expectStorageState(
      page,
      "pixelNations.firstAge.v1",
      "choose and claim first age land",
      (state) => state?.phase === "playing" && state?.season === 1 && state?.ownedLandIds?.includes("greenvale"),
      "First Age claim did not persist Greenvale",
    );
    await expectStorageState(
      page,
      "pixelNations.demoState.v1",
      "choose and claim first age land",
      (state) => state?.claimedLand === true && state?.claimedLandPnId === "PN-0401",
      "Compatibility settlement state did not persist claimed land PN-0401",
    );
    await expectText(page, "One order per season", "choose and claim first age land");
  });

  await step("resolve first age seasonal orders", async () => {
    await clickButton(page, /^Expand$/i, "resolve first age seasonal orders");
    await expectStorageState(
      page,
      "pixelNations.firstAge.v1",
      "resolve first age seasonal orders",
      (state) => state?.season === 2 && state?.ownedLandIds?.length >= 2 && state?.lastOrder === "expand",
      "Expand order did not advance season and territory",
    );
    await clickButton(page, /^Develop$/i, "resolve first age seasonal orders");
    await expectStorageState(
      page,
      "pixelNations.firstAge.v1",
      "resolve first age seasonal orders",
      (state) => state?.season === 3 && state?.coreLevel >= 2 && state?.lastOrder === "develop",
      "Develop order did not advance core progression",
    );
    await clickButton(page, /^Secure$/i, "resolve first age seasonal orders");
    await expectStorageState(
      page,
      "pixelNations.firstAge.v1",
      "resolve first age seasonal orders",
      (state) => state?.season === 4 && state?.stability >= 6 && state?.lastOrder === "secure",
      "Secure order did not improve stability",
    );
    await expectText(page, "Season Log", "resolve first age seasonal orders");
  });

  await step("mobile first age shell remains app-like", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${APP_URL}/world`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expectText(page, "Pixel Nations / The First Age", "mobile first age shell remains app-like");
    const metrics = await page.evaluate(() => ({
      bodyOverflow: window.getComputedStyle(document.body).overflow,
      htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    if (metrics.bodyOverflow !== "hidden" || metrics.htmlOverflow !== "hidden") {
      throw new SmokeError("mobile first age shell remains app-like", `Expected locked page overflow, got ${JSON.stringify(metrics)}`);
    }
    if (metrics.scrollHeight > metrics.innerHeight + 16) {
      throw new SmokeError("mobile first age shell remains app-like", `World shell appears vertically scrollable: ${JSON.stringify(metrics)}`);
    }
  });
}

async function main() {
  const { startedProcess, appSource } = await ensureApp();
  result.appSource = appSource;

  // Install handlers to ensure we kill started processes on CI signal termination.
  process.on("SIGINT", () => {
    if (startedProcess) startedProcess.kill();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    if (startedProcess) startedProcess.kill();
    process.exit(143);
  });
  process.on("uncaughtException", (err) => {
    console.error("uncaughtException", err);
    if (startedProcess) startedProcess.kill();
    process.exit(1);
  });

  let browser;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // Bound the overall smoke via Promise.race so we guarantee a hard internal timeout.
    await Promise.race([
      (async () => { await runSmoke(page); })(),
      new Promise((_, reject) => setTimeout(() => reject(new SmokeError("smoke timeout", "Smoke exceeded internal time limit")), SMOKE_TIMEOUT_MS)),
    ]);

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
