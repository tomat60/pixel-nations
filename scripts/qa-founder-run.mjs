import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/founder-run";
const REPORT_PATH = `${OUTPUT_DIR}/founder-run-result.json`;
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

const result = {
  status: "RUNNING",
  generatedAt: "",
  appUrl: APP_URL,
  blockingStep: "",
  error: "",
  viewports: [],
};

class FounderRunQaError extends Error {
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
  throw new FounderRunQaError("boot app", `Timed out waiting for ${APP_URL}`);
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

async function clickLocator(locator, step) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.click({ timeout: 10000 }).catch((error) => {
    throw new FounderRunQaError(step, error.message);
  });
}

async function openView(page, view) {
  await clickLocator(page.locator(`[data-qa="view-${view}"]`), `open ${view}`);
}

async function runOrder(page, orderId, expectedStage) {
  await openView(page, "orders");
  await clickLocator(page.locator(`[data-qa="order-${orderId}"]`), `run order ${orderId}`);
  await page.locator(`[data-qa="aurelian-village-scene"][data-aurelian-stage="${expectedStage}"]`).waitFor({
    state: "visible",
    timeout: 10000,
  });
}

async function claimSector(page, sectorId) {
  await page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"]`).waitFor({ state: "visible", timeout: 10000 });
  await clickLocator(page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"]`), `select sector ${sectorId}`);
  const claimButton = page.locator('[data-qa="claim-sector-button"]');
  await claimButton.waitFor({ state: "visible", timeout: 10000 });
  if (await claimButton.isDisabled()) {
    const control = await page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"]`).getAttribute("data-sector-control");
    const eventText = await page.locator('[data-qa="current-objective-text"]').textContent().catch(() => "");
    throw new FounderRunQaError(`claim sector ${sectorId}`, `Claim button disabled. Control: ${control}. Objective: ${eventText}`);
  }
  await clickLocator(claimButton, `claim sector ${sectorId}`);
  await page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"][data-sector-control="owned"]`).waitFor({
    state: "visible",
    timeout: 10000,
  });
}

async function runFounderArc(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const checks = [];
  const startedAt = Date.now();

  async function check(name, fn) {
    try {
      await fn();
      checks.push({ name, status: "PASS" });
    } catch (error) {
      checks.push({ name, status: "FAIL", error: error.message });
      throw error instanceof FounderRunQaError ? error : new FounderRunQaError(name, error.message);
    }
  }

  try {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });

    await check("fresh run opens at Aurelian Camp", async () => {
      await page.locator('[data-qa="aurelian-village-scene"][data-aurelian-stage="camp"]').waitFor({ state: "visible", timeout: 10000 });
    });

    await check("settlement reaches the developed stage and forms a council", async () => {
      await runOrder(page, "raise-shelter", "first_shelter");
      await runOrder(page, "cut-timber", "first_shelter");
      await runOrder(page, "scout-nearby", "first_shelter");
      await runOrder(page, "build-storehouse", "developed_settlement");
      await runOrder(page, "form-council", "developed_settlement");
    });

    await check("three connected sectors unlock the nation", async () => {
      await openView(page, "world");
      await page.locator('[data-qa="world-map-scene"]').waitFor({ state: "visible", timeout: 10000 });
      await claimSector(page, "A-02");
      await claimSector(page, "A-03");
      await openView(page, "council");
      await page.locator('[data-qa="council-nation-ready"]').waitFor({ state: "visible", timeout: 10000 });
    });

    await check("nation ceremony leads to one charter action", async () => {
      await clickLocator(page.locator('[data-qa="found-nation-choice"][data-decision-id="trade-charter"]'), "found trade-charter nation");
      await page.locator('[data-qa="founding-ceremony"]').waitFor({ state: "visible", timeout: 10000 });
      await clickLocator(page.locator('[data-qa="dismiss-founding-ceremony"]'), "dismiss founding ceremony");
      await page.locator('[data-qa="founder-run-accelerator"][data-founder-doctrine="trade-charter"]').waitFor({ state: "visible", timeout: 10000 });
      await clickLocator(page.locator('[data-qa="ratify-founder-charter"]'), "ratify founder charter");
      await page.locator('[data-qa="council-panel"][data-era-complete="true"]').waitFor({ state: "visible", timeout: 10000 });
      const records = await page.locator('[data-qa="city-institution-card"]').count();
      if (records !== 3) throw new FounderRunQaError("ratify founder charter", `Expected 3 charter records, got ${records}`);
    });

    await check("frontier objective becomes the empire threshold", async () => {
      await page.locator('[data-qa="frontier-objective-options"]').waitFor({ state: "visible", timeout: 10000 });
      await clickLocator(page.locator('[data-qa="frontier-objective-choice"][data-frontier-intent="northern-pass"]'), "choose northern frontier");
      await openView(page, "world");
      await claimSector(page, "A-04");
      await openView(page, "council");
      await page.locator('[data-qa="empire-declaration-options"]').waitFor({ state: "visible", timeout: 10000 });
    });

    await check("empire declaration opens the first Founder Record", async () => {
      await clickLocator(page.locator('[data-qa="empire-declaration-choice"][data-empire-declaration="aurelian-compact"]'), "declare Aurelian Compact");
      await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="founder-run"]').waitFor({ state: "visible", timeout: 10000 });
      const charterRecords = await page.locator('[data-qa="founder-record-charter"]').count();
      if (charterRecords !== 3) throw new FounderRunQaError("Founder Record charter", `Expected 3 Founder Record charter entries, got ${charterRecords}`);
      await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-founder-record.png`, fullPage: true });
    });

    await check("Continue Ruling preserves deeper empire systems", async () => {
      await clickLocator(page.locator('[data-qa="continue-ruling"]'), "continue ruling");
      await page.locator('[data-qa="demo-complete-overlay"]').waitFor({ state: "detached", timeout: 10000 });
      await page.locator('[data-qa="court-case-options"]').waitFor({ state: "visible", timeout: 10000 });
      await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-continue-ruling.png`, fullPage: true });
    });

    await check("refresh preserves the completed core arc", async () => {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="founder-run"]').waitFor({ state: "visible", timeout: 10000 });
      const declaration = await page.locator('[data-qa="demo-complete-overlay"]').getAttribute("data-empire-declaration");
      if (declaration !== "aurelian-compact") throw new FounderRunQaError("refresh preserves core arc", `Unexpected empire declaration: ${declaration}`);
    });

    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs > 180000) throw new FounderRunQaError("Founder Run duration", `Automated Founder Run exceeded 3 minutes: ${elapsedMs}ms`);

    result.viewports.push({ id: viewport.id, width: viewport.width, height: viewport.height, elapsedMs, checks });
  } finally {
    await context.close();
  }
}

async function main() {
  const appProcess = await ensureApp();
  let browser;
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) await runFounderArc(browser, viewport);
    await writeResult("PASS");
    console.log(`Founder Run QA PASS. Result written to ${REPORT_PATH}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`Founder Run QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    appProcess?.kill();
  }
  process.exit(process.exitCode ?? 0);
}

main();
