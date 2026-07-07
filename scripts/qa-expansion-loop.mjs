import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/expansion-loop";
const REPORT_PATH = `${OUTPUT_DIR}/expansion-loop-result.json`;
const result = { status: "RUNNING", generatedAt: "", appUrl: APP_URL, blockingStep: "", error: "", checks: [] };
class ExpansionQaError extends Error { constructor(step, message) { super(message); this.step = step; } }

async function appRunning() { try { const res = await fetch(APP_URL, { signal: AbortSignal.timeout(1500) }); return res.ok || res.status < 500; } catch { return false; } }
async function ensureApp() { if (await appRunning()) return null; const command = existsSync(".next") ? ["run", "start", "--", "-p", "3000", "-H", "127.0.0.1"] : ["run", "dev", "--", "-p", "3000", "-H", "127.0.0.1"]; const proc = spawn("npm", command, { stdio: "pipe", shell: process.platform === "win32" }); proc.stdout?.on("data", (data) => process.stdout.write(data)); proc.stderr?.on("data", (data) => process.stderr.write(data)); const started = Date.now(); while (Date.now() - started < 30000) { if (await appRunning()) return proc; await new Promise((resolve) => setTimeout(resolve, 500)); } throw new ExpansionQaError("boot app", `Timed out waiting for ${APP_URL}`); }
async function writeResult(status, error) { result.status = status; result.generatedAt = new Date().toISOString(); if (error) { result.blockingStep = error.step ?? "unknown"; result.error = error.message; } await mkdir(OUTPUT_DIR, { recursive: true }); await writeFile(REPORT_PATH, `${JSON.stringify(result, null, 2)}\n`); }
async function check(name, fn) { try { await fn(); result.checks.push({ name, status: "PASS" }); } catch (err) { const error = err instanceof ExpansionQaError ? err : new ExpansionQaError(name, err.message); result.checks.push({ name, status: "FAIL", error: error.message }); throw error; } }
async function clickButton(page, name, step) { await page.getByRole("button", { name }).first().click({ timeout: 5000 }).catch(() => { throw new ExpansionQaError(step, `Could not click button: ${name}`); }); }
async function openWorld(page) { await clickButton(page, /^World$/i, "open world"); await page.locator('[data-qa="world-map-scene"]').waitFor({ state: "visible", timeout: 5000 }); }
async function runOrder(page, name) { await clickButton(page, /^Village$/i, "open village"); await clickButton(page, /^Issue next order$/i, "open orders"); await clickButton(page, name, "run order"); await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 }); }
async function selectSector(page, sectorId) { await page.locator(`[data-qa="world-sector-tile"][data-sector-id="${sectorId}"]`).click({ timeout: 5000 }); }
async function countState(page, state) { return page.locator(`[data-qa="world-sector-tile"][data-expansion-state="${state}"]`).count(); }
async function expandSelected(page) { await page.locator('[data-qa="expand-sector"]').click({ timeout: 5000 }); await page.waitForTimeout(200); }

async function main() {
  const proc = await ensureApp(); let browser;
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    browser = await chromium.launch();
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });

    await check("fresh world has 100 sectors", async () => { await openWorld(page); const tiles = await page.locator('[data-qa="world-sector-tile"]').count(); if (tiles !== 100) throw new ExpansionQaError("fresh world has 100 sectors", `Expected 100 sectors, got ${tiles}`); });

    await check("adjacent expansion needs influence", async () => { await clickButton(page, /^Map$/i, "open map"); await page.locator('[data-qa="plot-greenvale"]').click({ timeout: 5000, force: true }); await clickButton(page, /^Choose this land$/i, "claim homeland"); await openWorld(page); await selectSector(page, "A-02"); const state = await page.locator('[data-qa="world-sector-inspect"]').getAttribute("data-expansion-state"); if (state !== "claimable") throw new ExpansionQaError("adjacent expansion needs influence", `Expected claimable sector, got ${state}`); const disabled = await page.locator('[data-qa="expand-sector"]').isDisabled(); if (!disabled) throw new ExpansionQaError("adjacent expansion needs influence", "Expand button should be disabled before enough Influence"); });

    await check("first expansion increases owned sectors", async () => { await runOrder(page, /^Raise Shelter$/i); await openWorld(page); const beforeOwned = await countState(page, "owned"); await selectSector(page, "A-02"); await expandSelected(page); const afterOwned = await countState(page, "owned"); if (afterOwned !== beforeOwned + 1) throw new ExpansionQaError("first expansion increases owned sectors", `Owned count did not grow: ${beforeOwned} -> ${afterOwned}`); await page.screenshot({ path: `${OUTPUT_DIR}/after-first-expansion.png`, fullPage: true }); });

    await check("distant sector stays locked", async () => { await selectSector(page, "J-10"); const state = await page.locator('[data-qa="world-sector-inspect"]').getAttribute("data-expansion-state"); if (state !== "locked") throw new ExpansionQaError("distant sector stays locked", `Expected locked, got ${state}`); });

    await check("third sector unlocks nation in council", async () => { await runOrder(page, /^Scout Nearby Land$/i); await runOrder(page, /^Build Storehouse$/i); await openWorld(page); await selectSector(page, "B-01"); await expandSelected(page); const owned = await countState(page, "owned"); if (owned < 3) throw new ExpansionQaError("third sector unlocks nation in council", `Expected 3 owned sectors, got ${owned}`); await clickButton(page, /^Council plan$/i, "open council"); await page.locator('[data-qa="council-nation-ready"]').waitFor({ state: "visible", timeout: 5000 }); await page.screenshot({ path: `${OUTPUT_DIR}/nation-ready.png`, fullPage: true }); });

    await writeResult("PASS"); console.log(`Expansion loop QA PASS. Result written to ${REPORT_PATH}`);
  } catch (error) { await writeResult("FAIL", error); console.error(`Expansion loop QA FAIL at ${result.blockingStep}: ${result.error}`); process.exitCode = 1; } finally { await browser?.close().catch(() => {}); proc?.kill(); }
  process.exit(process.exitCode ?? 0);
}
main();
