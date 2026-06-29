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

async function clickLink(page, name, stepName) {
  await clickByRole(page, "link", { name }, stepName);
}

async function clickButton(page, name, stepName) {
  await clickByRole(page, "button", { name }, stepName);
}

async function fillInput(page, label, value, stepName) {
  const input = page.getByLabel(label).first();
  await input.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
    throw new SmokeError(stepName, `Could not find input: ${label}`);
  });
  await input.fill(value);
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

  await step("reset demo state and open /world", async () => {
    await page.goto(`${APP_URL}/world`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expectText(page, "COMMAND THE WORLD MAP", "reset demo state and open /world");
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

  await step("dashboard recognizes claimed land", async () => {
    await page.getByRole("link", { name: /^Enter Your Land$/i }).first().click();
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expectText(page, "PN-0499", "dashboard recognizes claimed land");
    const bodyText = await page.locator("body").innerText();
    if (bodyText.includes("Awaiting Claim")) {
      throw new SmokeError("dashboard recognizes claimed land", "Dashboard still shows Awaiting Claim after claim");
    }
  });

  await step("create settlement", async () => {
    await clickLink(page, /^Found Settlement$/i, "create settlement");
    await page.waitForURL("**/settlement/create", { timeout: 5000 });
    await fillInput(page, "Settlement Name", "Aurelia Prime", "create settlement");
    await clickButton(page, /^Confirm Settlement$/i, "create settlement");
    await expectText(page, "First Settlement Founded", "create settlement");
    await clickLink(page, /^Return To Dashboard$/i, "create settlement");
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expectState(page, "create settlement", (state) => state?.settlementFounded === true, "Settlement was not persisted");
  });

  await step("build settlement core and establish trade", async () => {
    await clickLink(page, /^View Settlement$/i, "build settlement core and establish trade");
    await page.waitForURL("**/settlement", { timeout: 5000 });
    await clickButton(page, /^Build Farms/i, "build settlement core and establish trade");
    await expectText(page, "Farms expanded along the river edge", "build settlement core and establish trade");
    await expectState(
      page,
      "build settlement core and establish trade",
      (state) => state?.developmentCycle === 2 && state?.food === 24 && state?.materials === 10,
      "Settlement development action was not persisted",
    );
    await clickButton(page, /^Build Town Hall$/i, "build settlement core and establish trade");
    await expectText(page, "Establish Trade Route", "build settlement core and establish trade");
    await clickLink(page, /^Establish Trade Route$/i, "build settlement core and establish trade");
    await page.waitForURL("**/trade/create", { timeout: 5000 });
    await clickButton(page, /^Confirm Trade Route$/i, "build settlement core and establish trade");
    await expectText(page, "First Trade Route Established", "build settlement core and establish trade");
    await clickLink(page, /^Return To Settlement$/i, "build settlement core and establish trade");
    await page.waitForURL("**/settlement", { timeout: 5000 });
    await expectState(
      page,
      "build settlement core and establish trade",
      (state) => state?.townHallBuilt === true && state?.tradeRouteEstablished === true,
      "Town hall/trade route state was not persisted",
    );
  });

  await step("form alliance and found nation", async () => {
    await clickLink(page, /^Form Regional Alliance$/i, "form alliance and found nation");
    await page.waitForURL("**/alliance/create", { timeout: 5000 });
    await fillInput(page, "Alliance Name", "Aurelian Pact", "form alliance and found nation");
    await clickButton(page, /^Confirm Alliance$/i, "form alliance and found nation");
    await expectText(page, "Regional Alliance Formed", "form alliance and found nation");
    await clickLink(page, /^Return To Settlement$/i, "form alliance and found nation");
    await page.waitForURL("**/settlement", { timeout: 5000 });
    await clickLink(page, /^Found First Nation$/i, "form alliance and found nation");
    await page.waitForURL("**/nation/create", { timeout: 5000 });
    await fillInput(page, "Nation Name", "The Aurelian Crown", "form alliance and found nation");
    await clickButton(page, /^Found Nation$/i, "form alliance and found nation");
    await expectText(page, "First Nation Founded", "form alliance and found nation");
    await clickLink(page, /^Enter Nation$/i, "form alliance and found nation");
    await page.waitForURL("**/nation", { timeout: 5000 });
    await expectState(page, "form alliance and found nation", (state) => state?.nationFounded === true, "Nation was not persisted");
  });

  await step("attempt empire continuation path", async () => {
    const enabledNextLinks = await page.locator('a[href="/expansion/create"], a[href="/empire/create"]').count();
    if (enabledNextLinks > 0) {
      await page.locator('a[href="/expansion/create"], a[href="/empire/create"]').first().click();
      return;
    }

    const disabledExpansion = await page.getByRole("button", { name: /Expansion Coming Soon/i }).count();
    if (disabledExpansion > 0) {
      throw new SmokeError(
        "attempt empire continuation path",
        "Nation page blocks empire continuation: found disabled 'Expansion Coming Soon' and no enabled /expansion/create or /empire/create link",
      );
    }

    throw new SmokeError(
      "attempt empire continuation path",
      "Nation page has no reachable continuation toward expansion or empire",
    );
  });

  await step("create empire", async () => {
    if (page.url().endsWith("/expansion/create")) {
      await clickButton(page, /^Confirm Expansion$/i, "create empire");
      await expectText(page, "Borders Expanded", "create empire");
      await clickLink(page, /^Return To Nation$/i, "create empire");
      await page.waitForURL("**/nation", { timeout: 5000 });
      await clickLink(page, /^Create Empire$/i, "create empire");
    }

    await page.waitForURL("**/empire/create", { timeout: 5000 });
    await fillInput(page, "Empire Name", "Aurelian Empire", "create empire");
    await clickButton(page, /^Create Empire$/i, "create empire");
    await expectText(page, "First Empire Created", "create empire");
    await clickLink(page, /^Enter Empire$/i, "create empire");
    await page.waitForURL("**/empire", { timeout: 5000 });
    await expectState(page, "create empire", (state) => state?.empireFounded === true, "Empire was not persisted");
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
    await writeResult("PASS");
    console.log(`Mechanical smoke PASS. Result written to ${RESULT_PATH}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`Mechanical smoke FAIL at ${result.blockingStep}: ${result.error}`);
    console.error(`Result written to ${RESULT_PATH}`);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (startedProcess) {
      try { startedProcess.kill(); } catch {}
    }
  }
}

main().catch(async (error) => {
  const smokeError = error instanceof SmokeError ? error : new SmokeError("smoke runner", error.message);
  await writeResult("FAIL", smokeError);
  console.error(`Mechanical smoke FAIL at ${result.blockingStep}: ${result.error}`);
  process.exit(1);
});
