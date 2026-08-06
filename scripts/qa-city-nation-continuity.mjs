import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/city-nation-continuity";
const REPORT_PATH = `${OUTPUT_DIR}/result.json`;
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

class QaError extends Error {
  constructor(step, message) {
    super(message);
    this.step = step;
  }
}

async function appRunning() {
  try {
    const response = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function ensureApp() {
  if (await appRunning()) return null;
  const command = existsSync(".next")
    ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"]
    : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"];
  const processHandle = spawn("npm", command, {
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  processHandle.stdout?.on("data", (data) => process.stdout.write(data));
  processHandle.stderr?.on("data", (data) => process.stderr.write(data));
  const started = Date.now();
  while (Date.now() - started < 30000) {
    if (await appRunning()) return processHandle;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new QaError("boot app", `Timed out waiting for ${APP_URL}`);
}

async function click(locator, step) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.click({ timeout: 10000 }).catch((error) => {
    throw new QaError(step, error.message);
  });
}

async function openView(page, view) {
  await click(page.locator(`[data-qa="view-${view}"]`), `open ${view}`);
}

async function runOrder(page, orderId) {
  await openView(page, "orders");
  const standard = page.locator(`[data-qa="order-${orderId}"]`);
  const priority = page.locator(`[data-qa="order-${orderId}-priority"]`);
  const locator = await priority.count() ? priority : standard;
  await click(locator, `run order ${orderId}`);
}

async function claimSector(page, sectorId) {
  const tile = page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"]`);
  await tile.waitFor({ state: "visible", timeout: 10000 });
  await click(tile, `select sector ${sectorId}`);
  const claimButton = page.locator('[data-qa="claim-sector-button"]');
  await claimButton.waitFor({ state: "visible", timeout: 10000 });
  if (await claimButton.isDisabled()) {
    throw new QaError(`claim sector ${sectorId}`, "Claim sector button is disabled");
  }
  await click(claimButton, `claim sector ${sectorId}`);
  await page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"][data-sector-control="owned"]`).waitFor({
    state: "visible",
    timeout: 10000,
  });
}

async function expectVisible(page, selector, step) {
  await page.locator(selector).waitFor({ state: "visible", timeout: 10000 }).catch((error) => {
    throw new QaError(step, error.message);
  });
}

async function expectHidden(page, selector, step) {
  const visible = await page.locator(selector).isVisible().catch(() => false);
  if (visible) throw new QaError(step, `${selector} must not be visible`);
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const checks = [];

  async function check(name, action) {
    try {
      await action();
      checks.push({ name, status: "PASS" });
    } catch (error) {
      checks.push({ name, status: "FAIL", error: error.message });
      throw error instanceof QaError ? error : new QaError(name, error.message);
    }
  }

  try {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
    await expectVisible(page, '[data-qa="aurelian-village-scene"][data-aurelian-stage="camp"]', "fresh camp");

    await check("nation remains blocked before City Seed", async () => {
      await runOrder(page, "raise-shelter");
      await runOrder(page, "cut-timber");
      await runOrder(page, "scout-nearby");
      await runOrder(page, "build-storehouse");
      await runOrder(page, "form-council");
      await openView(page, "council");
      await expectVisible(page, '[data-qa="city-readiness-checklist"]', "city readiness checklist");
      await expectHidden(page, '[data-qa="council-nation-ready"]', "nation blocked before City Seed");
    });

    await check("Open Market Path and Fortify Watch establish City Seed", async () => {
      await runOrder(page, "open-market");
      await runOrder(page, "fortify-watch");
      await openView(page, "council");
      await expectVisible(page, '[data-qa="city-seed-milestone"]', "City Seed milestone");
      const checklist = page.locator('[data-qa="city-readiness-checklist"]');
      if (await checklist.isVisible().catch(() => false)) {
        const pending = await checklist.locator('[data-city-requirement-complete="false"]').count();
        if (pending !== 0) throw new QaError("City Seed readiness", `${pending} city requirements remain incomplete`);
      }
      await expectHidden(page, '[data-qa="council-nation-ready"]', "nation blocked until three sectors");
    });

    await check("three connected sectors unlock unchanged Nation doctrine choices", async () => {
      await openView(page, "world");
      await claimSector(page, "A-02");
      await claimSector(page, "A-03");
      await openView(page, "council");
      await expectVisible(page, '[data-qa="council-nation-ready"]', "nation readiness");
      const doctrineChoices = await page.locator('[data-qa="found-nation-choice"]').count();
      if (doctrineChoices !== 3) throw new QaError("nation doctrine choices", `Expected 3 doctrine choices, got ${doctrineChoices}`);
    });

    await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}.png`, fullPage: true });
    return { id: viewport.id, width: viewport.width, height: viewport.height, checks };
  } finally {
    await context.close();
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const appProcess = await ensureApp();
  let browser;
  const report = {
    status: "RUNNING",
    generatedAt: "",
    appUrl: APP_URL,
    blockingStep: "",
    error: "",
    viewports: [],
  };

  try {
    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) report.viewports.push(await runViewport(browser, viewport));
    report.status = "PASS";
    console.log(`City/Nation continuity QA PASS. Result written to ${REPORT_PATH}`);
  } catch (error) {
    report.status = "FAIL";
    report.blockingStep = error.step ?? "unknown";
    report.error = error.message;
    console.error(`City/Nation continuity QA FAIL at ${report.blockingStep}: ${report.error}`);
    process.exitCode = 1;
  } finally {
    report.generatedAt = new Date().toISOString();
    await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
    await browser?.close().catch(() => {});
    appProcess?.kill();
  }
}

main();
