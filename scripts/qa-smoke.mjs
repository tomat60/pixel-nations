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

async function clickByRole(page, role, options, stepName) {
  const locator = page.getByRole(role, options).first();
  await locator.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
    throw new SmokeError(stepName, `Could not find ${role}: ${options.name}`);
  });
  await locator.click();
}

async function clickButton(page, name, stepName) {
  await clickByRole(page, "button", { name }, stepName);
}

async function readDemoState(page, stepName) {
  return page.evaluate(() => {
    const raw = localStorage.getItem("pixelNations.demoState.v1");
    return raw ? JSON.parse(raw) : null;
  }).catch((error) => {
    throw new SmokeError(stepName, `Could not read demo state: ${error.message}`);
  });
}

async function expectState(page, stepName, predicate, message) {
  const state = await readDemoState(page, stepName);
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
  await step("unified fullscreen play prototype route", async () => {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expectText(page, "The First Age", "unified fullscreen play prototype route");
    await expectText(page, "Aurelian Basin", "unified fullscreen play prototype route");
    await expectText(page, "World Map", "unified fullscreen play prototype route");
    await clickButton(page, /^Orders$/i, "unified fullscreen play prototype route");
    await expectText(page, "Season Orders", "unified fullscreen play prototype route");
    await clickButton(page, /^Expand$/i, "unified fullscreen play prototype route");
    await expectText(page, "2/12", "unified fullscreen play prototype route");
    await clickButton(page, /^Nation$/i, "unified fullscreen play prototype route");
    await expectText(page, "Nation Layer", "unified fullscreen play prototype route");
  });

  await step("reset demo state and open /world", async () => {
    await page.goto(`${APP_URL}/world`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expectText(page, "Sector A-01 is live", "reset demo state and open /world");
  });

  await step("select a claimable Sector A-01 land", async () => {
    const sector = page.locator("[data-qa='playable-sector']").first();
    await sector.scrollIntoViewIfNeeded();
    const tile = page.getByLabel(/PN-0499/).first();
    await tile.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("select a claimable Sector A-01 land", "Could not find claimable test tile PN-0499");
    });
    await tile.click();
    await expectText(page, "Aurelia", "select a claimable Sector A-01 land");
  });

  await step("claim selected land", async () => {
    await page.locator("[data-qa='world-selected-land-map-card']").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("claim selected land", "On-map selected land card did not render");
    });
    await clickButton(page, /^Claim From Map$/i, "claim selected land");
    await clickButton(page, /^Claim Land$/i, "claim selected land");
    await expectState(
      page,
      "claim selected land",
      (state) => state?.claimedLand === true && state?.claimedLandPnId === "PN-0499",
      "Claim did not persist selected land PN-0499",
    );
    await page.locator("[data-qa='post-claim-next-step']").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("claim selected land", "Claim success step did not render after persisted claim");
    });
  });

  await step("queue playable order from world map", async () => {
    await clickButton(page, /^Return To Map$/i, "queue playable order from world map");
    await page.locator("[data-qa='world-map-top-hud']").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("queue playable order from world map", "World map HUD did not render after claim");
    });
    const onMapActionLayer = page.locator("[data-qa='world-on-map-action-layer']").first();
    if (!(await onMapActionLayer.isVisible().catch(() => false))) {
      await page.locator("[data-qa='world-claimed-land-action-anchor']").first().click();
    }
    await onMapActionLayer.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("queue playable order from world map", "On-map action layer did not open from claimed marker");
    });
    await page.locator("[data-qa='world-on-map-action-gather-food']").first().click();
    await page.locator("[data-qa='world-map-active-order']").getByText("Gather Food").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("queue playable order from world map", "Gather Food did not enter the map active order HUD");
    });
  });

  await step("world map has no primary progression route links", async () => {
    const routeLinks = await page
      .locator('a[href="/dashboard"], a[href="/settlement"], a[href="/settlement/create"], a[href="/nation"], a[href="/nation/create"], a[href="/alliance/create"], a[href="/empire"], a[href="/empire/create"]')
      .count();
    if (routeLinks > 0) {
      throw new SmokeError(
        "world map has no primary progression route links",
        `Found ${routeLinks} route link(s) on /world after claim`,
      );
    }
  });

  await step("advance core progression on world map", async () => {
    const continueOnMap = page.getByRole("button", { name: /^Continue On Map$/i }).first();
    if (await continueOnMap.isVisible().catch(() => false)) {
      await continueOnMap.click();
    } else {
      await clickButton(page, /^Return To Map$/i, "advance core progression on world map");
    }
    await page.locator("[data-qa='world-on-map-action-layer']").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("advance core progression on world map", "On-map action layer did not remain available after claim");
    });

    await page.locator("[data-qa='world-on-map-world-action-found-settlement']").first().click();
    await expectState(
      page,
      "advance core progression on world map",
      (state) => state?.settlementFounded === true,
      "Settlement was not founded from the world map",
    );

    await page.locator("[data-qa='world-on-map-world-action-build-city-core']").first().click();
    await expectState(
      page,
      "advance core progression on world map",
      (state) => state?.townHallBuilt === true,
      "City core was not built from the world map",
    );

    await page.locator("[data-qa='world-on-map-world-action-establish-trade']").first().click();
    await expectState(
      page,
      "advance core progression on world map",
      (state) => state?.tradeRouteEstablished === true && state?.tradeRouteDestination === "Iron Coast",
      "Trade seed was not established from the world map",
    );
  });

  await step("political progression stays on map as pending layer", async () => {
    const progressMessage = page.locator("[data-qa='world-on-map-progress-message']").first();
    await progressMessage.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("political progression stays on map as pending layer", "Missing on-map pending political layer message");
    });
    await progressMessage.getByText("Map Layer Pending", { exact: false }).waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new SmokeError("political progression stays on map as pending layer", "Pending layer message did not include Map Layer Pending");
    });
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
