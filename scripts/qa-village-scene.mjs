import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/village-scene";
const REPORT_PATH = `${OUTPUT_DIR}/village-scene-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";

class VillageQaError extends Error {
  constructor(step, message) {
    super(message);
    this.step = step;
  }
}

const result = {
  status: "RUNNING",
  generatedAt: "",
  appUrl: APP_URL,
  blockingStep: "",
  error: "",
  before: [],
  after: [],
  captures: [],
  screenshots: [],
};

async function appRunning() {
  try {
    const res = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function ensureApp() {
  if (await appRunning()) return null;
  const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
  const proc = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32" });
  proc.stdout?.on("data", (data) => process.stdout.write(data));
  proc.stderr?.on("data", (data) => process.stderr.write(data));
  const started = Date.now();
  while (Date.now() - started < 30000) {
    if (await appRunning()) return proc;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new VillageQaError("boot app", `Timed out waiting for ${APP_URL}`);
}

async function writeResult(status, error) {
  result.status = status;
  result.generatedAt = new Date().toISOString();
  if (error) {
    result.blockingStep = error.step ?? "unknown";
    result.error = error.message;
  }
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`);
}

async function readPlotStates(page) {
  return page.locator('[data-qa="village-plot"]').evaluateAll((nodes) => nodes.map((node) => ({
    id: node.getAttribute("data-qa-id"),
    state: node.getAttribute("data-qa-state"),
  })));
}

function statesChanged(before, after) {
  const beforeById = new Map(before.map((item) => [item.id, item.state]));
  return after.some((item) => beforeById.get(item.id) !== item.state);
}

async function clickVisibleButton(page, name, step) {
  const buttons = page.getByRole("button", { name, exact: true });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (await button.isVisible()) {
      await button.click({ timeout: 5000 });
      return;
    }
  }
  throw new VillageQaError(step, `Could not find a visible button: ${name}`);
}

async function readSavedState(page, step) {
  await page.waitForFunction((key) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const state = JSON.parse(raw);
      return state?.view === "village" && Array.isArray(state?.completedOrders);
    } catch {
      return false;
    }
  }, STORAGE_KEY, { timeout: 5000 }).catch(() => {
    throw new VillageQaError(step, "Village state was not persisted to localStorage");
  });

  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY);
}

async function assertSelectors(page, selectors, step) {
  for (const selector of selectors) {
    await page.locator(selector).waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new VillageQaError(step, `Expected visible selector missing: ${selector}`);
    });
  }
}

async function captureState(browser, page, name, requiredSelectors) {
  const step = `capture ${name}`;
  await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });
  await assertSelectors(page, requiredSelectors, step);
  await page.waitForTimeout(150);

  const state = await readSavedState(page, step);
  const plotStates = await readPlotStates(page);
  if (plotStates.length === 0) throw new VillageQaError(step, "No Village plot state nodes found");

  const desktopPath = `${OUTPUT_DIR}/${name}-desktop.png`;
  await page.screenshot({ path: desktopPath });

  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  await mobileContext.addInitScript(({ key, savedState }) => {
    window.localStorage.setItem(key, JSON.stringify(savedState));
  }, { key: STORAGE_KEY, savedState: state });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
  await mobilePage.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });
  await assertSelectors(mobilePage, requiredSelectors, `${step} mobile`);
  await mobilePage.waitForTimeout(150);

  const overflow = await mobilePage.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  if (Math.max(overflow.documentWidth, overflow.bodyWidth) > overflow.innerWidth + 4) {
    throw new VillageQaError(`${step} mobile overflow`, `Horizontal overflow: viewport ${overflow.innerWidth}px, document ${overflow.documentWidth}px, body ${overflow.bodyWidth}px`);
  }

  const mobilePath = `${OUTPUT_DIR}/${name}-mobile.png`;
  await mobilePage.screenshot({ path: mobilePath });
  await mobileContext.close();

  result.screenshots.push(desktopPath, mobilePath);
  result.captures.push({
    name,
    completedOrders: state.completedOrders,
    settlementMarkers: state.settlementMarkers,
    plotStates,
    desktop: desktopPath,
    mobile: mobilePath,
  });

  return plotStates;
}

async function runOrder(page, label, orderId) {
  await clickVisibleButton(page, "Issue next order", `open Orders for ${label}`);
  await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 5000 });
  await clickVisibleButton(page, label, `run order ${label}`);
  await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });
  await page.waitForFunction(({ key, expectedOrder }) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const state = JSON.parse(raw);
      return state?.view === "village" && state?.completedOrders?.includes(expectedOrder);
    } catch {
      return false;
    }
  }, { key: STORAGE_KEY, expectedOrder: orderId }, { timeout: 5000 }).catch(() => {
    throw new VillageQaError(`persist order ${label}`, `Order did not persist: ${orderId}`);
  });
}

async function main() {
  const proc = await ensureApp();
  let browser;
  try {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });

    await page.locator('[data-qa="plot-greenvale"]').click({ timeout: 5000, force: true });
    const claimButton = page.locator('[data-qa="claim-button"]');
    await claimButton.waitFor({ state: "visible", timeout: 5000 }).catch(() => {
      throw new VillageQaError("claim land", "Claim button did not become visible");
    });
    await claimButton.click({ timeout: 5000 });
    await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });

    result.before = await captureState(browser, page, "01-camp", [
      '[data-qa="village-hearth-smoke"]',
      '[data-qa="village-ownership-flag"]',
    ]);

    await runOrder(page, "Raise Shelter", "raise-shelter");
    await captureState(browser, page, "02-shelter", [
      '[data-qa="village-hearth-smoke"]',
      '[data-qa="village-structure-hut"]',
    ]);

    await runOrder(page, "Gather Food", "gather-food");
    await runOrder(page, "Cut Timber", "cut-timber");
    await runOrder(page, "Scout Nearby Land", "scout-nearby");
    await runOrder(page, "Build Storehouse", "build-storehouse");
    await runOrder(page, "Open Market Path", "open-market");
    await runOrder(page, "Fortify Watch", "fortify-watch");
    await captureState(browser, page, "03-developed", [
      '[data-qa="village-structure-hut"]',
      '[data-qa="village-food-fields"]',
      '[data-qa="village-timber-yards"]',
      '[data-qa="village-storehouse-visual"]',
      '[data-qa="village-market-activity"]',
      '[data-qa="village-watch-visual"]',
    ]);

    await runOrder(page, "Form Council", "form-council");
    result.after = await captureState(browser, page, "04-city-seed", [
      '[data-qa="village-structure-hut"]',
      '[data-qa="village-food-fields"]',
      '[data-qa="village-storehouse-visual"]',
      '[data-qa="village-market-activity"]',
      '[data-qa="village-watch-visual"]',
      '[data-qa="village-council-visual"]',
    ]);

    if (!statesChanged(result.before, result.after)) {
      throw new VillageQaError("verify full Village progression", "Village orders changed no plot data-qa-state; likely panel-only success");
    }
    if (result.captures.length !== 4 || result.screenshots.length !== 8) {
      throw new VillageQaError("verify evidence count", `Expected 4 states and 8 screenshots; got ${result.captures.length} states and ${result.screenshots.length} screenshots`);
    }

    await context.close();
    await writeResult("PASS");
    console.log(`Village scene QA PASS. Four progression states and eight screenshots written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`Village scene QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    proc?.kill();
  }
  process.exit(process.exitCode ?? 0);
}

main();
