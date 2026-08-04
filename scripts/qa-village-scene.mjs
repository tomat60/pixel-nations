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
  const command = existsSync(".next")
    ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"]
    : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
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
  }, STORAGE_KEY, { timeout: 7000 }).catch(() => {
    throw new VillageQaError(step, "Aurelian Village state was not persisted to localStorage");
  });
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY);
}

async function waitForStage(page, stage, step) {
  await page.locator(`[data-qa="aurelian-village-scene"][data-aurelian-stage="${stage}"]`).waitFor({
    state: "visible",
    timeout: 7000,
  }).catch(() => {
    throw new VillageQaError(step, `Expected Aurelian stage was not visible: ${stage}`);
  });
}

async function captureState(browser, page, name, expectedStage) {
  const step = `capture ${name}`;
  await waitForStage(page, expectedStage, step);
  await page.waitForTimeout(200);
  const state = await readSavedState(page, step);
  const actualStage = await page.locator('[data-qa="aurelian-village-scene"]').getAttribute("data-aurelian-stage");
  if (actualStage !== expectedStage) {
    throw new VillageQaError(step, `Expected stage ${expectedStage}, got ${actualStage}`);
  }

  const desktopPath = `${OUTPUT_DIR}/${name}-desktop.png`;
  await page.screenshot({ path: desktopPath, fullPage: true });

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobileContext.addInitScript(({ key, savedState }) => {
    window.localStorage.setItem(key, JSON.stringify(savedState));
  }, { key: STORAGE_KEY, savedState: state });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
  await waitForStage(mobilePage, expectedStage, `${step} mobile`);
  await mobilePage.waitForTimeout(200);

  const overflow = await mobilePage.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  if (Math.max(overflow.documentWidth, overflow.bodyWidth) > overflow.innerWidth + 4) {
    throw new VillageQaError(`${step} mobile overflow`, `Horizontal overflow: viewport ${overflow.innerWidth}px, document ${overflow.documentWidth}px, body ${overflow.bodyWidth}px`);
  }

  const mobilePath = `${OUTPUT_DIR}/${name}-mobile.png`;
  await mobilePage.screenshot({ path: mobilePath, fullPage: true });
  await mobileContext.close();

  result.screenshots.push(desktopPath, mobilePath);
  result.captures.push({
    name,
    stage: actualStage,
    completedOrders: state.completedOrders,
    settlementMarkers: state.settlementMarkers,
    desktop: desktopPath,
    mobile: mobilePath,
  });
}

async function waitForOrderPersisted(page, orderId, step) {
  await page.waitForFunction(({ key, expectedOrder }) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const state = JSON.parse(raw);
      return state?.view === "village" && state?.completedOrders?.includes(expectedOrder);
    } catch {
      return false;
    }
  }, { key: STORAGE_KEY, expectedOrder: orderId }, { timeout: 7000 }).catch(() => {
    throw new VillageQaError(step, `Order did not persist: ${orderId}`);
  });
}

async function runOrder(page, label, orderId) {
  await clickVisibleButton(page, "Issue next order", `open Orders for ${label}`);
  await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 5000 });
  await clickVisibleButton(page, label, `run order ${label}`);
  await page.locator('[data-qa="aurelian-village-scene"]').waitFor({ state: "visible", timeout: 7000 });
  await waitForOrderPersisted(page, orderId, `persist order ${label}`);
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

    await captureState(browser, page, "01-camp", "camp");

    await runOrder(page, "Raise Shelter", "raise-shelter");
    await captureState(browser, page, "02-first-shelter", "first_shelter");

    await runOrder(page, "Gather Food", "gather-food");
    await runOrder(page, "Cut Timber", "cut-timber");
    await runOrder(page, "Scout Nearby Land", "scout-nearby");
    await runOrder(page, "Build Storehouse", "build-storehouse");
    await captureState(browser, page, "03-developed-settlement", "developed_settlement");

    if (result.captures.length !== 3 || result.screenshots.length !== 6) {
      throw new VillageQaError("verify evidence count", `Expected 3 stages and 6 screenshots; got ${result.captures.length} stages and ${result.screenshots.length} screenshots`);
    }

    const stages = result.captures.map((capture) => capture.stage).join("|");
    if (stages !== "camp|first_shelter|developed_settlement") {
      throw new VillageQaError("verify stage sequence", `Unexpected Aurelian sequence: ${stages}`);
    }

    await context.close();
    await writeResult("PASS");
    console.log(`Aurelian Village QA PASS. Three stages and six screenshots written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`Aurelian Village QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    proc?.kill();
  }
  process.exit(process.exitCode ?? 0);
}

main();
