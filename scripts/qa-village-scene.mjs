import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/village-scene";
const REPORT_PATH = `${OUTPUT_DIR}/village-scene-result.json`;

class VillageQaError extends Error {
  constructor(step, message) {
    super(message);
    this.step = step;
  }
}

const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", before: [], after: [], screenshots: [] };

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
  return page.locator('[data-qa="village-plot"]').evaluateAll((nodes) => nodes.map((node) => ({ id: node.getAttribute("data-qa-id"), state: node.getAttribute("data-qa-state") })));
}

function statesChanged(before, after) {
  const beforeById = new Map(before.map((item) => [item.id, item.state]));
  return after.some((item) => beforeById.get(item.id) !== item.state);
}

async function clickButton(page, name, step) {
  await page.getByRole("button", { name }).first().click({ timeout: 5000 }).catch(() => {
    throw new VillageQaError(step, `Could not click button: ${name}`);
  });
}

async function main() {
  const proc = await ensureApp();
  let browser;
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });

    await page.locator('[data-qa="plot-greenvale"]').click({ timeout: 5000, force: true });
    await clickButton(page, /^Choose this land$/i, "claim land");
    await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });

    result.before = await readPlotStates(page);
    if (result.before.length === 0) throw new VillageQaError("read before plots", "No village plots found before order");
    const beforeScreenshot = `${OUTPUT_DIR}/before-village-order.png`;
    await page.screenshot({ path: beforeScreenshot, fullPage: true });
    result.screenshots.push(beforeScreenshot);

    await clickButton(page, /^Issue next order$/i, "open orders from village scene");
    await clickButton(page, /^Raise Shelter$/i, "run visible build order");
    await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });

    result.after = await readPlotStates(page);
    if (result.after.length === 0) throw new VillageQaError("read after plots", "No village plots found after order");
    const afterScreenshot = `${OUTPUT_DIR}/after-village-order.png`;
    await page.screenshot({ path: afterScreenshot, fullPage: true });
    result.screenshots.push(afterScreenshot);

    if (!statesChanged(result.before, result.after)) throw new VillageQaError("verify plot state change", "Village order changed no plot data-qa-state; likely panel-only success");

    await context.close();
    await writeResult("PASS");
    console.log(`Village scene QA PASS. Result written to ${REPORT_PATH}`);
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
