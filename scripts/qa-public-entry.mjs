import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://127.0.0.1:3000";
const OUTPUT_DIR = "public/qa/rc1";
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

class Rc1Error extends Error {
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
  throw new Rc1Error("boot app", `Timed out waiting for ${APP_URL}`);
}

function gitSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function waitForDecodedCamp(page, viewport) {
  const imageViewport = viewport.id === "desktop" ? "desktop" : "portrait";
  await page.waitForFunction(({ imageViewport }) => {
    const image = document.querySelector(
      `[data-qa="aurelian-stage-image"][data-aurelian-image-stage="camp"][data-aurelian-viewport="${imageViewport}"][data-aurelian-active="true"]`,
    );
    if (!(image instanceof HTMLImageElement)) return false;
    const style = window.getComputedStyle(image);
    return image.complete && image.naturalWidth > 0 && style.display !== "none" && Number.parseFloat(style.opacity || "0") > 0;
  }, { imageViewport }, { timeout: 15000 });
  await page.waitForTimeout(350);
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const checks = [];

  async function check(name, action) {
    try {
      await action();
      checks.push({ name, status: "PASS" });
    } catch (error) {
      checks.push({ name, status: "FAIL", error: error.message });
      throw error instanceof Rc1Error ? error : new Rc1Error(name, error.message);
    }
  }

  try {
    await check("fresh context has no saved game", async () => {
      await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
      const storageLength = await page.evaluate(() => window.localStorage.length);
      if (storageLength !== 0) throw new Rc1Error("fresh storage", `Expected empty localStorage, found ${storageLength} entries.`);
    });

    await check("homepage primary entry is visible", async () => {
      const playButton = page.getByRole("button", { name: "Play Demo" });
      await playButton.waitFor({ state: "visible", timeout: 10000 });
      const box = await playButton.boundingBox();
      if (!box || box.y < 0 || box.y + box.height > viewport.height) {
        throw new Rc1Error("homepage CTA", "Play Demo is not fully visible in the initial viewport.");
      }
      await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-homepage.png`, fullPage: true });
    });

    await check("feedback works without an account", async () => {
      const feedback = page.getByRole("link", { name: "Send Feedback" });
      await feedback.waitFor({ state: "visible", timeout: 10000 });
      const href = await feedback.getAttribute("href");
      if (!href?.startsWith("mailto:")) throw new Rc1Error("feedback action", `Expected mailto feedback action, got ${href ?? "missing href"}.`);
      if (!href.includes("Pixel%20Nations%20demo%20feedback")) throw new Rc1Error("feedback action", "Feedback subject is missing.");
    });

    await check("one click reaches Aurelian Camp", async () => {
      await page.getByRole("button", { name: "Play Demo" }).click();
      await page.waitForURL(/\/play(?:\?|$)/, { timeout: 10000 });
      await page.locator('[data-qa="aurelian-village-scene"][data-aurelian-stage="camp"]').waitFor({ state: "visible", timeout: 10000 });
      await page.locator('[data-qa="play-shell"]').waitFor({ state: "visible", timeout: 10000 });
      await waitForDecodedCamp(page, viewport);
      await page.waitForFunction((key) => {
        const raw = window.localStorage.getItem(key);
        if (!raw) return false;
        const value = JSON.parse(raw);
        return Array.isArray(value?.settlementMarkers) && value.settlementMarkers.includes("camp") && !value.empireDeclarationId;
      }, STORAGE_KEY);
      await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-aurelian-camp.png`, fullPage: true });
    });

    await check("Found a New Empire resets to a clean Camp", async () => {
      await page.evaluate((key) => {
        window.localStorage.setItem(key, JSON.stringify({
          ownedPlotIds: ["aurelian-basin"],
          ownedSectorIds: ["A-01", "A-02", "A-03", "A-04"],
          completedOrders: ["raise-shelter", "build-storehouse", "form-council"],
          settlementMarkers: ["camp", "shelter", "storehouse", "council"],
          scoutedPlotIds: [],
          resources: { food: 4, timber: 2, stone: 0, influence: 3 },
          nationDecisionId: "trade-charter",
          frontierIntentId: "northern-pass",
          empireDeclarationId: "aurelian-compact",
          foundingCeremonySeen: true,
          season: 8,
          view: "council",
          retentionRecords: [
            { season: 2, decisionId: "grain-levy", choiceId: "freedom", label: "Household Stores", villageMarker: "Granaries", worldMarker: "Open stores" },
            { season: 3, decisionId: "open-roads", choiceId: "freedom", label: "Open Roads", villageMarker: "Road charter", worldMarker: "Open roads" },
            { season: 4, decisionId: "scribe-patronage", choiceId: "authority", label: "Civic Record", villageMarker: "Scribe hall", worldMarker: "Written law" },
          ],
          chronicle: [],
        }));
      }, STORAGE_KEY);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator('[data-qa="demo-complete-overlay"][data-record-depth="founder-run"]').waitFor({ state: "visible", timeout: 10000 });
      await page.locator('[data-qa="restart-run"]').click();
      await page.locator('[data-qa="aurelian-village-scene"][data-aurelian-stage="camp"]').waitFor({ state: "visible", timeout: 10000 });
      await waitForDecodedCamp(page, viewport);
      await page.waitForFunction((key) => {
        const raw = window.localStorage.getItem(key);
        if (!raw) return false;
        const value = JSON.parse(raw);
        return !value.empireDeclarationId && value.view === "village" && value.settlementMarkers?.length === 1 && value.settlementMarkers[0] === "camp";
      }, STORAGE_KEY);
      await page.screenshot({ path: `${OUTPUT_DIR}/${viewport.id}-clean-restart.png`, fullPage: true });
    });

    return { id: viewport.id, width: viewport.width, height: viewport.height, checks };
  } finally {
    await context.close();
  }
}

async function writePackages(result) {
  const checkedOutSha = gitSha();
  const sourceSha = process.env.RC1_SOURCE_SHA ?? checkedOutSha;
  const runId = process.env.GITHUB_RUN_ID ?? "local";
  const manifest = {
    classification: result.status === "PASS" ? "RC1_ENTRY_ACCEPTED" : "RC1_BLOCKED",
    generatedAt: new Date().toISOString(),
    sourceSha,
    checkedOutSha,
    runId,
    appUrl: APP_URL,
    publicUrl: process.env.RC1_PUBLIC_URL ?? "PENDING_VERIFIED_VERCEL_PREVIEW",
    viewports: VIEWPORTS,
    requiredEvidence: [
      "desktop-homepage.png",
      "desktop-aurelian-camp.png",
      "desktop-clean-restart.png",
      "mobile-homepage.png",
      "mobile-aurelian-camp.png",
      "mobile-clean-restart.png",
      "public-entry-result.json",
    ],
    knownVisualLimitations: [
      "Only Aurelian Village is the current temporary visual direction.",
      "The desktop bridge and final Village composition still require a future approved art-direction pass.",
      "World, Council and other non-Village screens are functional but not broadly visually approved.",
    ],
    nonGoals: [
      "No new gameplay system, backend, account, payment, multiplayer, combat or economy layer.",
      "No broad visual redesign or Aurelian V3 implementation in RC1.",
      "No telemetry service or persistent tester tracking.",
    ],
  };

  const playtest = `# Pixel Nations RC1 external playtest\n\n## Tester instruction\n\nBuild an empire.\n\nDo not give the tester additional gameplay instructions before play.\n\n## After play\n\n1. Where did you feel confused or unsure what to do?\n2. What was the strongest or most satisfying moment?\n3. What did you expect to happen next?\n\n## Owner observation\n\nRecord whether the tester entered the demo, reached the first shelter, formed a nation, declared an empire, hesitated, abandoned, or requested help.\n\nPublic build: ${manifest.publicUrl}\nSource: ${sourceSha}\n`;

  const observations = [
    "tester_id,device,entered_demo,reached_shelter,formed_nation,declared_empire,completion_time,hesitation_point,abandonment_point,help_requested,strongest_moment,expected_next,notes",
    ",,,,,,,,,,,,",
  ].join("\n");

  await writeFile(`${OUTPUT_DIR}/release-manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(`${OUTPUT_DIR}/external-playtest.md`, playtest);
  await writeFile(`${OUTPUT_DIR}/observation-sheet.csv`, `${observations}\n`);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const result = { status: "RUNNING", generatedAt: "", blockingStep: "", error: "", viewports: [] };
  const appProcess = await ensureApp();
  let browser;
  try {
    browser = await chromium.launch();
    for (const viewport of VIEWPORTS) result.viewports.push(await runViewport(browser, viewport));
    result.status = "PASS";
    console.log("Pixel Nations RC1 public entry QA PASS.");
  } catch (error) {
    result.status = "FAIL";
    result.blockingStep = error.step ?? "unknown";
    result.error = error.message;
    console.error(`Pixel Nations RC1 public entry QA FAIL at ${result.blockingStep}: ${result.error}`);
    process.exitCode = 1;
  } finally {
    result.generatedAt = new Date().toISOString();
    await writeFile(`${OUTPUT_DIR}/public-entry-result.json`, `${JSON.stringify(result, null, 2)}\n`);
    await writePackages(result);
    await browser?.close().catch(() => {});
    appProcess?.kill();
  }
  process.exit(process.exitCode ?? 0);
}

main();
