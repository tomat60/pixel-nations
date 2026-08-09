import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const STORAGE_KEY = "pixelNations.play.v1";
const OUTPUT_DIR = "public/qa/p4-nation-stewardship";
const REPORT_PATH = `${OUTPUT_DIR}/p4-nation-stewardship-result.json`;
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];

class P4QaError extends Error {
  constructor(step, message) {
    super(message);
    this.step = step;
  }
}

const result = { status: "RUNNING", generatedAt: "", blockingStep: "", error: "", viewports: [] };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function assert(condition, step, message) { if (!condition) throw new P4QaError(step, message); }

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
    detached: process.platform !== "win32",
  });
  const started = Date.now();
  while (Date.now() - started < 30000) {
    if (await appRunning()) return processHandle;
    await wait(500);
  }
  throw new P4QaError("boot app", `Timed out waiting for ${APP_URL}`);
}

function stopApp(processHandle) {
  if (!processHandle) return;
  if (process.platform === "win32") return processHandle.kill("SIGTERM");
  try { process.kill(-processHandle.pid, "SIGTERM"); } catch { processHandle.kill("SIGTERM"); }
}

async function readState(page, step) {
  await page.waitForFunction((key) => Boolean(window.localStorage.getItem(key)), STORAGE_KEY, { timeout: 10000 })
    .catch((error) => { throw new P4QaError(step, `Saved state unavailable: ${error.message}`); });
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY);
}

async function waitForRetentionCount(page, count, step) {
  await page.waitForFunction(({ key, count }) => {
    try {
      const state = JSON.parse(window.localStorage.getItem(key) ?? "{}");
      return state.retentionRecords?.length === count;
    } catch {
      return false;
    }
  }, { key: STORAGE_KEY, count }, { timeout: 10000 }).catch((error) => { throw new P4QaError(step, error.message); });
}

async function seedNation(page) {
  const base = await readState(page, "read fresh state");
  const state = {
    ...base,
    ownedPlotIds: [base.selectedPlotId],
    ownedSectorIds: ["A-01", "A-02", "A-03"],
    nationDecisionId: "trade-charter",
    foundingCeremonySeen: true,
    frontierIntentId: null,
    empireDeclarationId: null,
    completedOrders: ["raise-shelter", "gather-food", "cut-timber", "scout-nearby", "build-storehouse", "open-market", "form-council", "fortify-watch"],
    settlementMarkers: ["camp", "shelter", "storehouse", "market", "council", "watch"],
    retentionRecords: [],
    settlementStability: 3,
    settlementProsperity: 3,
    resources: { ...base.resources, food: 12, timber: 8, stone: 3, influence: 10 },
    view: "council",
  };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator('[data-qa="founder-run-accelerator"][data-stewardship-decision="grain-levy"]').waitFor({ state: "visible", timeout: 10000 });
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.isMobile });
  const page = await context.newPage();
  const checks = [];

  async function check(name, action) {
    try {
      await action();
      checks.push({ name, status: "PASS" });
    } catch (error) {
      checks.push({ name, status: "FAIL", error: error.message });
      throw error instanceof P4QaError ? error : new P4QaError(`${viewport.id}: ${name}`, error.message);
    }
  }

  try {
    await page.goto(`${APP_URL}/play?qa-p4=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await seedNation(page);

    await check("explicit stewardship tradeoff is reachable", async () => {
      const authority = page.locator('[data-qa="stewardship-choice"][data-choice-id="authority"]');
      const freedom = page.locator('[data-qa="stewardship-choice"][data-choice-id="freedom"]');
      assert(await authority.isVisible(), `${viewport.id}: authority visible`, "Authority stewardship choice is not visible.");
      assert(await freedom.isVisible(), `${viewport.id}: freedom visible`, "Freedom stewardship choice is not visible.");
      assert(await authority.getAttribute("data-stability-delta") === "1", `${viewport.id}: authority stability`, "Authority must preview +1 Stability.");
      assert(await freedom.getAttribute("data-prosperity-delta") === "1", `${viewport.id}: freedom prosperity`, "Freedom must preview +1 Prosperity.");
    });

    await check("choice changes state and objective", async () => {
      await page.locator('[data-qa="stewardship-choice"][data-choice-id="authority"]').click();
      await waitForRetentionCount(page, 1, `${viewport.id}: persist first choice`);
      const state = await readState(page, `${viewport.id}: read first choice`);
      assert(state.settlementStability === 4 && state.settlementProsperity === 2, `${viewport.id}: health consequence`, `Expected 4/2 health, got ${state.settlementStability}/${state.settlementProsperity}.`);
      const objective = (await page.locator('[data-qa="current-objective-text"]').innerText()).trim();
      assert(objective.includes("Stewardship recorded:") && objective.includes("1/3"), `${viewport.id}: objective progression`, `Objective did not acknowledge stewardship: ${objective}`);
      await page.locator('[data-qa="founder-run-accelerator"][data-stewardship-decision="open-roads"]').waitFor({ state: "visible", timeout: 10000 });
    });

    await check("reload preserves stewardship and next decision", async () => {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
      await waitForRetentionCount(page, 1, `${viewport.id}: reload retention`);
      const state = await readState(page, `${viewport.id}: reload state`);
      assert(state.retentionRecords[0]?.decisionId === "grain-levy" && state.retentionRecords[0]?.choiceId === "authority", `${viewport.id}: persisted record`, "Reload lost the first stewardship record.");
      await page.locator('[data-qa="founder-run-accelerator"][data-stewardship-decision="open-roads"]').waitFor({ state: "visible", timeout: 10000 });
      const objective = (await page.locator('[data-qa="current-objective-text"]').innerText()).trim();
      assert(objective.includes("Stewardship recorded:") && objective.includes("1/3"), `${viewport.id}: persisted objective`, "Reload lost objective progression.");
    });

    const screenshot = `${OUTPUT_DIR}/${viewport.id}-p4-nation-stewardship.png`;
    await page.screenshot({ path: screenshot, fullPage: true });
    return { id: viewport.id, width: viewport.width, height: viewport.height, checks, screenshot };
  } finally {
    await context.close();
  }
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

async function main() {
  const appProcess = await ensureApp();
  let browser;
  try {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) result.viewports.push(await runViewport(browser, viewport));
    await writeResult("PASS");
    console.log(`P4 nation stewardship QA PASS. Evidence written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`P4 nation stewardship QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    stopApp(appProcess);
  }
  process.exit(process.exitCode ?? 0);
}

main();
