import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/settlement-economy";
const REPORT_PATH = `${OUTPUT_DIR}/settlement-economy-result.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900, isMobile: false },
  { id: "mobile", width: 390, height: 844, isMobile: true },
];

class SettlementQaError extends Error {
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
  viewports: [],
  screenshots: [],
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function assert(condition, step, message) {
  if (!condition) throw new SettlementQaError(step, message);
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
    detached: process.platform !== "win32",
  });
  processHandle.stdout?.on("data", (data) => process.stdout.write(data));
  processHandle.stderr?.on("data", (data) => process.stderr.write(data));
  const started = Date.now();
  while (Date.now() - started < 30000) {
    if (await appRunning()) return processHandle;
    await wait(500);
  }
  throw new SettlementQaError("boot app", `Timed out waiting for ${APP_URL}`);
}

function stopApp(processHandle) {
  if (!processHandle) return;
  if (process.platform === "win32") {
    processHandle.kill("SIGTERM");
    return;
  }
  try {
    process.kill(-processHandle.pid, "SIGTERM");
  } catch {
    processHandle.kill("SIGTERM");
  }
}

async function readState(page, step) {
  await page.waitForFunction((key) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const state = JSON.parse(raw);
      return Array.isArray(state?.completedOrders) && Array.isArray(state?.settlementMarkers);
    } catch {
      return false;
    }
  }, STORAGE_KEY, { timeout: 10000 }).catch((error) => {
    throw new SettlementQaError(step, `Saved state unavailable: ${error.message}`);
  });
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY);
}

async function waitForState(page, predicateSource, args, step) {
  await page.waitForFunction(({ key, predicateSource, args }) => {
    try {
      const state = JSON.parse(window.localStorage.getItem(key) ?? "{}");
      const predicate = new Function("state", "args", `return (${predicateSource})(state, args);`);
      return Boolean(predicate(state, args));
    } catch {
      return false;
    }
  }, { key: STORAGE_KEY, predicateSource, args }, { timeout: 10000 }).catch((error) => {
    throw new SettlementQaError(step, error.message);
  });
}

async function openOrders(page, step) {
  const panel = page.locator('[data-qa="orders-panel"]');
  if (await panel.isVisible().catch(() => false)) return panel;
  const selectors = [
    '[data-qa="village-scene-open-orders-desktop"]',
    '[data-qa="village-scene-open-orders"]',
  ];
  for (const selector of selectors) {
    const button = page.locator(selector);
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 5000 });
      await panel.waitFor({ state: "visible", timeout: 7000 });
      return panel;
    }
  }
  throw new SettlementQaError(step, "No visible Issue next order control was found.");
}

async function runOrder(page, label, orderId, step) {
  await openOrders(page, `${step}: open Orders`);
  const button = page.getByRole("button", { name: label, exact: true });
  await button.waitFor({ state: "visible", timeout: 7000 });
  await button.click({ timeout: 5000 });
  await waitForState(
    page,
    "(state, args) => state.completedOrders.includes(args.orderId) && state.view === 'village'",
    { orderId },
    `${step}: persist order`,
  );
}

function expectedCycle(state, workers, focusId) {
  let food = workers.fields * 2;
  let timber = workers.workyard;
  let stone = workers.workyard >= 3 ? 1 : 0;
  let influence = workers.civic;
  if (focusId === "stores") food += 2;
  if (focusId === "construction") {
    timber += 2;
    stone += 1;
  }
  if (focusId === "charter") influence += 2;
  const upkeep = 4 + Math.floor(state.settlementMarkers.length / 2);
  const shortage = state.resources.food + food < upkeep;
  const stabilityDelta = shortage ? -2 : focusId === "stores" || (focusId === "charter" && workers.civic >= 2) ? 1 : 0;
  let prosperityDelta = -2;
  if (!shortage) {
    prosperityDelta = 1;
    if (stone > 0) prosperityDelta += 1;
    if (timber + influence >= 6) prosperityDelta += 1;
  }
  return { food, timber, stone, influence, upkeep, shortage, stabilityDelta, prosperityDelta };
}

async function assertNoHorizontalOverflow(page, panel, step) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  assert(
    Math.max(dimensions.documentWidth, dimensions.bodyWidth) <= dimensions.viewport + 4,
    step,
    `Horizontal page overflow: viewport ${dimensions.viewport}, document ${dimensions.documentWidth}, body ${dimensions.bodyWidth}.`,
  );
  const panelDimensions = await panel.evaluate((element) => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
  assert(panelDimensions.scrollWidth <= panelDimensions.clientWidth + 4, step, `Orders panel overflow: ${panelDimensions.scrollWidth}px > ${panelDimensions.clientWidth}px.`);
}

async function seedShortage(page, sourceState) {
  const shortageState = {
    ...sourceState,
    completedOrders: ["raise-shelter"],
    settlementMarkers: ["camp", "shelter"],
    settlementWorkers: { fields: 0, workyard: 6, civic: 0 },
    settlementFocusId: "construction",
    settlementCycles: [],
    settlementStability: 1,
    settlementProsperity: 1,
    resources: { food: 0, timber: 0, stone: 0, influence: 3 },
    season: 3,
    view: "orders",
    lastEvent: "Shortage QA seed.",
  };
  await page.evaluate(({ key, state }) => window.localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state: shortageState });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
  await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 10000 });
  return shortageState;
}

async function runViewport(browser, viewport) {
  const checks = [];
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
  });
  const page = await context.newPage();

  async function check(name, action) {
    try {
      await action();
      checks.push({ name, status: "PASS" });
    } catch (error) {
      checks.push({ name, status: "FAIL", error: error.message });
      throw error instanceof SettlementQaError ? error : new SettlementQaError(`${viewport.id}: ${name}`, error.message);
    }
  }

  try {
    await page.goto(`${APP_URL}/play?qa-settlement=${viewport.id}-${Date.now()}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.locator('[data-qa="aurelian-village-scene"][data-aurelian-stage="camp"]').waitFor({ state: "visible", timeout: 10000 });

    await check("Camp hides stewardship before shelter", async () => {
      await openOrders(page, `${viewport.id}: open camp Orders`);
      assert(await page.locator('[data-qa="settlement-stewardship"]').count() === 0, `${viewport.id}: camp stewardship`, "Stewardship appeared before Raise Shelter.");
    });

    await check("Raise Shelter exposes balanced defaults", async () => {
      await page.getByRole("button", { name: "Raise Shelter", exact: true }).click();
      await waitForState(page, "(state) => state.completedOrders.includes('raise-shelter') && state.view === 'village'", {}, `${viewport.id}: persist shelter`);
      const panel = await openOrders(page, `${viewport.id}: reopen Orders after shelter`);
      await panel.locator('[data-qa="settlement-stewardship"]').waitFor({ state: "visible", timeout: 7000 });
      const state = await readState(page, `${viewport.id}: read defaults`);
      assert(JSON.stringify(state.settlementWorkers) === JSON.stringify({ fields: 2, workyard: 2, civic: 2 }), `${viewport.id}: default workers`, `Unexpected workers: ${JSON.stringify(state.settlementWorkers)}`);
      assert(state.settlementFocusId === "stores", `${viewport.id}: default focus`, `Expected stores, got ${state.settlementFocusId}.`);
      assert(state.settlementCycles.length === 0 && state.settlementStability === 1 && state.settlementProsperity === 0, `${viewport.id}: default stewardship state`, "Default cycles, stability or prosperity are incorrect.");
      await panel.getByText("Assigned 6/6", { exact: true }).waitFor({ state: "visible", timeout: 5000 });
      const stores = panel.locator('[data-qa="settlement-focus"][data-focus-id="stores"]');
      assert(await stores.getAttribute("aria-pressed") === "true", `${viewport.id}: active focus`, "Secure Stores was not selected by default.");
    });

    await check("Crew controls preserve six-crew invariant and persist", async () => {
      const panel = await openOrders(page, `${viewport.id}: crew controls`);
      await panel.locator('[data-qa="settlement-worker-minus"][data-district-id="fields"]').click();
      await waitForState(page, "(state) => state.settlementWorkers.fields === 1 && state.settlementWorkers.workyard === 2 && state.settlementWorkers.civic === 2", {}, `${viewport.id}: free crew`);
      await panel.locator('[data-qa="settlement-worker-plus"][data-district-id="workyard"]').click();
      await waitForState(page, "(state) => state.settlementWorkers.fields === 1 && state.settlementWorkers.workyard === 3 && state.settlementWorkers.civic === 2", {}, `${viewport.id}: reassign crew`);
      const state = await readState(page, `${viewport.id}: read reassignment`);
      assert(state.settlementWorkers.fields + state.settlementWorkers.workyard + state.settlementWorkers.civic === 6, `${viewport.id}: crew total`, "Crew total did not remain six.");
      await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
      await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 10000 });
      const reloaded = await readState(page, `${viewport.id}: read reloaded workers`);
      assert(JSON.stringify(reloaded.settlementWorkers) === JSON.stringify({ fields: 1, workyard: 3, civic: 2 }), `${viewport.id}: worker persistence`, `Reassignment did not persist: ${JSON.stringify(reloaded.settlementWorkers)}`);
    });

    await check("Focus changes forecast and balanced plan is restored", async () => {
      const panel = await openOrders(page, `${viewport.id}: focus forecast`);
      const before = await panel.locator('[data-qa="settlement-cycle-preview"]').innerText();
      await panel.locator('[data-qa="settlement-focus"][data-focus-id="construction"]').click();
      await waitForState(page, "(state) => state.settlementFocusId === 'construction'", {}, `${viewport.id}: persist construction focus`);
      const after = await panel.locator('[data-qa="settlement-cycle-preview"]').innerText();
      assert(before !== after && after.includes("Stone") && after.includes("+2"), `${viewport.id}: construction preview`, "Construction focus did not change the deterministic forecast.");
      await panel.locator('[data-qa="settlement-focus"][data-focus-id="stores"]').click();
      await panel.locator('[data-qa="settlement-worker-minus"][data-district-id="workyard"]').click();
      await panel.locator('[data-qa="settlement-worker-plus"][data-district-id="fields"]').click();
      await waitForState(page, "(state) => state.settlementFocusId === 'stores' && state.settlementWorkers.fields === 2 && state.settlementWorkers.workyard === 2 && state.settlementWorkers.civic === 2", {}, `${viewport.id}: restore balanced plan`);
    });

    await check("Manual season applies exact production and persists", async () => {
      const panel = await openOrders(page, `${viewport.id}: manual season`);
      await assertNoHorizontalOverflow(page, panel, `${viewport.id}: pre-cycle overflow`);
      const button = panel.locator('[data-qa="resolve-settlement-cycle"]');
      await button.scrollIntoViewIfNeeded();
      const box = await button.boundingBox();
      assert(Boolean(box) && box.y < viewport.height && box.y + box.height > 0, `${viewport.id}: End season reachability`, "End season is outside the viewport after scrolling.");

      const before = await readState(page, `${viewport.id}: pre-cycle state`);
      const expected = expectedCycle(before, { fields: 2, workyard: 2, civic: 2 }, "stores");
      assert(!expected.shortage, `${viewport.id}: positive season setup`, "Balanced default unexpectedly predicts a shortage.");

      const stewardshipShot = `${OUTPUT_DIR}/${viewport.id}-stewardship.png`;
      await page.screenshot({ path: stewardshipShot, fullPage: true });
      result.screenshots.push(stewardshipShot);

      await button.click();
      await waitForState(page, "(state) => state.settlementCycles.length === 1", {}, `${viewport.id}: persist manual cycle`);
      const after = await readState(page, `${viewport.id}: post-cycle state`);
      assert(after.resources.food === before.resources.food + expected.food - expected.upkeep, `${viewport.id}: manual food`, `Expected food ${before.resources.food + expected.food - expected.upkeep}, got ${after.resources.food}.`);
      assert(after.resources.timber === before.resources.timber + expected.timber, `${viewport.id}: manual timber`, "Timber delta is incorrect.");
      assert(after.resources.stone === before.resources.stone + expected.stone, `${viewport.id}: manual stone`, "Stone delta is incorrect.");
      assert(after.resources.influence === before.resources.influence + expected.influence, `${viewport.id}: manual influence`, "Influence delta is incorrect.");
      assert(after.settlementStability === Math.min(6, before.settlementStability + 1), `${viewport.id}: manual stability`, "Stability delta is incorrect.");
      assert(after.settlementProsperity === Math.min(12, before.settlementProsperity + 1), `${viewport.id}: manual prosperity`, "Prosperity delta is incorrect.");
      assert(after.season === Math.min(12, before.season + 1), `${viewport.id}: manual season`, "Season did not advance exactly once.");
      const record = after.settlementCycles[0];
      assert(record.cycle === 1 && record.focusId === "stores" && record.shortage === false && !record.orderId, `${viewport.id}: manual record`, `Unexpected manual cycle record: ${JSON.stringify(record)}`);
      assert(after.chronicle[0]?.title === "Season resolved", `${viewport.id}: manual chronicle`, "Manual cycle was not recorded in the chronicle.");

      const postCycleShot = `${OUTPUT_DIR}/${viewport.id}-post-cycle.png`;
      await page.screenshot({ path: postCycleShot, fullPage: true });
      result.screenshots.push(postCycleShot);

      await page.reload({ waitUntil: "domcontentloaded", timeout: 10000 });
      await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 10000 });
      const reloaded = await readState(page, `${viewport.id}: reload cycle state`);
      assert(reloaded.settlementCycles.length === 1, `${viewport.id}: cycle persistence`, "Cycle record did not persist after reload.");
      assert(JSON.stringify(reloaded.resources) === JSON.stringify(after.resources), `${viewport.id}: resource persistence`, "Resources changed after reload.");
      assert(reloaded.settlementFocusId === "stores" && JSON.stringify(reloaded.settlementWorkers) === JSON.stringify({ fields: 2, workyard: 2, civic: 2 }), `${viewport.id}: plan persistence`, "Allocation or focus changed after reload.");
    });

    await check("Advanced project resolves exactly one planned season", async () => {
      await runOrder(page, "Gather Food", "gather-food", `${viewport.id}: Gather Food`);
      await runOrder(page, "Cut Timber", "cut-timber", `${viewport.id}: Cut Timber`);
      await runOrder(page, "Scout Nearby Land", "scout-nearby", `${viewport.id}: Scout Nearby Land`);
      const before = await readState(page, `${viewport.id}: pre-storehouse state`);
      const expected = expectedCycle(before, before.settlementWorkers, before.settlementFocusId);
      await runOrder(page, "Build Storehouse", "build-storehouse", `${viewport.id}: Build Storehouse`);
      const after = await readState(page, `${viewport.id}: post-storehouse state`);
      assert(after.settlementCycles.length === before.settlementCycles.length + 1, `${viewport.id}: storehouse cycle count`, "Build Storehouse did not create exactly one cycle.");
      const record = after.settlementCycles.at(-1);
      assert(record?.orderId === "build-storehouse", `${viewport.id}: storehouse record`, `Expected build-storehouse record, got ${record?.orderId}.`);
      assert(after.completedOrders.filter((id) => id === "build-storehouse").length === 1, `${viewport.id}: storehouse order once`, "Build Storehouse completed more than once.");
      assert(after.settlementMarkers.filter((id) => id === "storehouse").length === 1, `${viewport.id}: storehouse marker once`, "Storehouse marker was duplicated.");
      const cycleFood = expected.shortage ? 0 : before.resources.food + expected.food - expected.upkeep;
      assert(after.resources.food === cycleFood + 1, `${viewport.id}: storehouse food`, "Storehouse cycle + project food delta is incorrect.");
      assert(after.resources.timber === before.resources.timber + expected.timber - 2, `${viewport.id}: storehouse timber`, "Storehouse cycle + project timber delta is incorrect.");
      const expectedInfluenceAfterCycle = expected.shortage
        ? Math.max(0, before.resources.influence + expected.influence - 2)
        : before.resources.influence + expected.influence;
      assert(after.resources.influence === expectedInfluenceAfterCycle + 1, `${viewport.id}: storehouse influence`, "Storehouse cycle + project influence delta is incorrect.");
      assert(after.season === Math.min(12, before.season + 1), `${viewport.id}: storehouse season`, "Advanced project advanced the season more than once.");
    });

    await check("Seeded low-food plan causes exact shortage once", async () => {
      const sourceState = await readState(page, `${viewport.id}: source shortage seed`);
      const seeded = await seedShortage(page, sourceState);
      const panel = page.locator('[data-qa="orders-panel"]');
      await panel.locator('[data-qa="settlement-cycle-preview"]').getByText("Shortage predicted", { exact: true }).waitFor({ state: "visible", timeout: 7000 });
      await panel.locator('[data-qa="resolve-settlement-cycle"]').click();
      await waitForState(page, "(state) => state.settlementCycles.length === 1 && state.settlementCycles[0].shortage === true", {}, `${viewport.id}: persist shortage`);
      const after = await readState(page, `${viewport.id}: shortage result`);
      assert(after.resources.food === 0, `${viewport.id}: shortage food`, "Shortage did not zero food.");
      assert(after.resources.timber === 8 && after.resources.stone === 2, `${viewport.id}: shortage production`, `Expected 8 timber and 2 stone, got ${after.resources.timber}/${after.resources.stone}.`);
      assert(after.resources.influence === 1, `${viewport.id}: shortage influence`, `Expected influence 1, got ${after.resources.influence}.`);
      assert(after.settlementStability === 0 && after.settlementProsperity === 0, `${viewport.id}: shortage penalties`, `Expected stability/prosperity 0/0, got ${after.settlementStability}/${after.settlementProsperity}.`);
      assert(after.season === 4 && after.settlementCycles.length === 1, `${viewport.id}: shortage once`, "Shortage did not advance exactly one cycle and one season.");
      assert(after.chronicle[0]?.title === "Season shortage", `${viewport.id}: shortage chronicle`, "Shortage was not recorded in the chronicle.");
      assert(after.settlementCycles[0].upkeep === 5 && after.settlementCycles[0].prosperityDelta === -2 && after.settlementCycles[0].stabilityDelta === -2, `${viewport.id}: shortage record`, `Unexpected shortage record: ${JSON.stringify(after.settlementCycles[0])}`);
      await assertNoHorizontalOverflow(page, panel, `${viewport.id}: shortage overflow`);
      assert(seeded.resources.food === 0, `${viewport.id}: shortage seed integrity`, "Shortage seed was mutated unexpectedly.");
    });

    return { id: viewport.id, width: viewport.width, height: viewport.height, checks };
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
    for (const viewport of VIEWPORTS) {
      result.viewports.push(await runViewport(browser, viewport));
    }
    assert(result.viewports.length === 2, "evidence count", "Desktop and mobile results are required.");
    assert(result.screenshots.length === 4, "screenshot count", `Expected four screenshots, got ${result.screenshots.length}.`);
    await writeResult("PASS");
    console.log(`Settlement economy QA PASS. Evidence written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeResult("FAIL", error);
    console.error(`Settlement economy QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    stopApp(appProcess);
  }
  process.exit(process.exitCode ?? 0);
}

main();
