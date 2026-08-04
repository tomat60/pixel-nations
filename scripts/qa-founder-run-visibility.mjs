import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/founder-run";
const RESULT_PATH = `${OUTPUT_DIR}/primary-action-visibility-result.json`;
const FRICTION_PATH = `${OUTPUT_DIR}/friction-report.json`;
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

const completedFounderRunState = {
  ownedPlotIds: ["plot-aurelian"],
  ownedSectorIds: ["A-01", "A-02", "A-03", "A-04"],
  completedOrders: ["raise-shelter", "cut-timber", "scout-nearby", "build-storehouse", "form-council"],
  settlementMarkers: ["camp", "shelter", "storehouse", "council"],
  scoutedPlotIds: [],
  nationDecisionId: "trade-charter",
  frontierIntentId: "northern-pass",
  empireDeclarationId: "aurelian-compact",
  foundingCeremonySeen: true,
  season: 4,
  view: "council",
  lastEvent: "The Aurelian Compact is declared.",
  resources: { food: 10, timber: 10, stone: 4, influence: 6 },
  retentionRecords: [
    { season: 1, decisionId: "grain-levy", choiceId: "freedom", label: "Free Household Stores", villageMarker: "commons stores", worldMarker: "shared stores marked" },
    { season: 2, decisionId: "open-roads", choiceId: "freedom", label: "Open Market Road", villageMarker: "market road", worldMarker: "trade route brightened" },
    { season: 3, decisionId: "scribe-patronage", choiceId: "authority", label: "Civic Scribes", villageMarker: "scribe house", worldMarker: "law seat visible" },
  ],
  chronicle: [{ season: 4, title: "The Aurelian Compact", body: "One land became an empire seed." }],
};

class VisibilityError extends Error {}

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
  throw new VisibilityError(`Timed out waiting for ${APP_URL}`);
}

async function fullyInsideViewport(locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
  });
}

async function validateFrictionThresholds() {
  const friction = JSON.parse(await readFile(FRICTION_PATH, "utf8"));
  const desktop = friction.viewports.find((item) => item.id === "desktop");
  const mobile = friction.viewports.find((item) => item.id === "mobile");
  if (!desktop || !mobile) throw new VisibilityError("Missing desktop or mobile friction report.");
  if (desktop.hiddenPrimaryCtas.length !== 0) {
    throw new VisibilityError(`Desktop hidden primary CTAs must be 0, got: ${desktop.hiddenPrimaryCtas.join(", ")}`);
  }
  if (mobile.hiddenPrimaryCtas.length > 1) {
    throw new VisibilityError(`Mobile hidden primary CTAs must be <= 1, got: ${mobile.hiddenPrimaryCtas.join(", ")}`);
  }
  return {
    desktopHiddenPrimaryCtas: desktop.hiddenPrimaryCtas,
    mobileHiddenPrimaryCtas: mobile.hiddenPrimaryCtas,
    desktopInteractions: desktop.purposefulInteractions,
    mobileInteractions: mobile.purposefulInteractions,
    desktopViewSwitches: desktop.viewSwitches,
    mobileViewSwitches: mobile.viewSwitches,
  };
}

async function validatePinnedRecord(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.addInitScript(({ key, state }) => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, state: completedFounderRunState });
  const page = await context.newPage();

  try {
    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded" });
    const overlay = page.locator('[data-qa="demo-complete-overlay"][data-record-depth="founder-run"]');
    await overlay.waitFor({ state: "visible", timeout: 10000 });

    const actions = page.locator('[data-qa="founder-record-actions"]');
    const continueButton = page.locator('[data-qa="continue-ruling"]');
    const restartButton = page.locator('[data-qa="restart-run"]');
    for (const [label, locator] of [["action row", actions], ["Continue Ruling", continueButton], ["Found a New Empire", restartButton]]) {
      if (!(await fullyInsideViewport(locator))) throw new VisibilityError(`${viewport.id}: ${label} is not fully visible when Founder Record opens.`);
    }

    await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-founder-record-pinned.png`, fullPage: true });
    await continueButton.click();
    await overlay.waitFor({ state: "detached", timeout: 10000 });
    await page.locator('[data-qa="court-case-options"]').waitFor({ state: "visible", timeout: 10000 });

    return {
      id: viewport.id,
      width: viewport.width,
      height: viewport.height,
      actionsVisibleOnOpen: true,
      continueRulingPreservesCourt: true,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const appProcess = await ensureApp();
  let browser;
  const result = { status: "RUNNING", generatedAt: "", friction: null, viewports: [], error: "" };

  try {
    result.friction = await validateFrictionThresholds();
    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) result.viewports.push(await validatePinnedRecord(browser, viewport));
    result.status = "PASS";
  } catch (error) {
    result.status = "FAIL";
    result.error = error.message;
    process.exitCode = 1;
  } finally {
    result.generatedAt = new Date().toISOString();
    await writeFile(RESULT_PATH, `${JSON.stringify(result, null, 2)}\n`);
    await browser?.close().catch(() => {});
    appProcess?.kill();
  }

  if (result.status === "PASS") console.log(`Founder Run visibility QA PASS. Result written to ${RESULT_PATH}`);
  else console.error(`Founder Run visibility QA FAIL: ${result.error}`);
  process.exit(process.exitCode ?? 0);
}

main();
