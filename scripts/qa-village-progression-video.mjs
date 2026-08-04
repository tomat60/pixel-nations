import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { spawn, execSync } from "node:child_process";
import { chromium } from "playwright";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/village-progression";
const VIDEO_DIR = `${OUTPUT_DIR}/videos`;
const RAW_VIDEO_DIR = `${VIDEO_DIR}/raw`;
const FRAME_DIR = `${OUTPUT_DIR}/frames`;
const MANIFEST_PATH = `${OUTPUT_DIR}/sequence-manifest.json`;
const REPORT_PATH = `${OUTPUT_DIR}/report.html`;
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORT = { width: 1440, height: 900 };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

const TRANSITIONS = [
  { orderId: "raise-shelter", label: "Raise Shelter", expectedStage: "first_shelter", stageMustChange: true },
  { orderId: "gather-food", label: "Gather Food", expectedStage: "first_shelter", stageMustChange: false },
  { orderId: "cut-timber", label: "Cut Timber", expectedStage: "first_shelter", stageMustChange: false },
  { orderId: "scout-nearby", label: "Scout Nearby Land", expectedStage: "first_shelter", stageMustChange: false },
  { orderId: "build-storehouse", label: "Build Storehouse", expectedStage: "developed_settlement", stageMustChange: true },
  { orderId: "open-market", label: "Open Market Path", expectedStage: "developed_settlement", stageMustChange: false },
  { orderId: "fortify-watch", label: "Fortify Watch", expectedStage: "developed_settlement", stageMustChange: false },
  { orderId: "form-council", label: "Form Council", expectedStage: "developed_settlement", stageMustChange: false },
];

function getCommitSha() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
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
    detached: process.platform !== "win32",
  });
  processHandle.stdout?.on("data", (data) => process.stdout.write(data));
  processHandle.stderr?.on("data", (data) => process.stderr.write(data));
  const startedAt = Date.now();
  while (Date.now() - startedAt < 30000) {
    if (await appRunning()) return processHandle;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for ${APP_URL}`);
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
  throw new Error(`${step}: no visible button named ${name}`);
}

async function waitForStage(page, stage) {
  await page.locator(`[data-qa="aurelian-village-scene"][data-aurelian-stage="${stage}"]`).waitFor({
    state: "visible",
    timeout: 7000,
  });
}

async function readSavedState(page) {
  return page.evaluate((key) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, STORAGE_KEY);
}

async function currentStage(page) {
  return page.locator('[data-qa="aurelian-village-scene"]').getAttribute("data-aurelian-stage");
}

async function waitForOrderPersisted(page, orderId) {
  await page.waitForFunction(({ key, expectedOrder }) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const state = JSON.parse(raw);
      return state?.view === "village" && state?.completedOrders?.includes(expectedOrder);
    } catch {
      return false;
    }
  }, { key: STORAGE_KEY, expectedOrder: orderId }, { timeout: 7000 });
}

async function runOrder(page, label, orderId) {
  await clickVisibleButton(page, "Issue next order", `open Orders for ${label}`);
  await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 5000 });
  await clickVisibleButton(page, label, `run order ${label}`);
  await page.locator('[data-qa="aurelian-village-scene"]').waitFor({ state: "visible", timeout: 7000 });
  await waitForOrderPersisted(page, orderId);
}

async function captureFrame(page, index, slug, phase) {
  const filename = `${String(index).padStart(2, "0")}-${slug}-${phase}.png`;
  const buffer = await page.screenshot({ fullPage: true });
  await writeFile(`${FRAME_DIR}/${filename}`, buffer);
  return { path: `frames/${filename}`, sha256: sha256(buffer), byteSize: buffer.length };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildReport(manifest) {
  const rows = manifest.transitions.map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${escapeHtml(item.beforeStage)}</td><td>${escapeHtml(item.afterStage)}</td><td>${item.stageChanged}</td><td><a href="${escapeHtml(item.frame.path)}">frame</a></td></tr>`).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Aurelian Village Progression</title></head><body><main><h1>Aurelian Village progression</h1><p>Status: ${escapeHtml(manifest.status)}</p><p>Required visual sequence: camp → first_shelter → developed_settlement.</p><p><a href="./videos/desktop-village-progression.webm">Continuous desktop video</a></p><table><thead><tr><th>Order</th><th>Before</th><th>After</th><th>Stage changed</th><th>Frame</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>`;
}

async function writeFailure(identity, error, transitions) {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const manifest = {
    ...identity,
    generatedAt: new Date().toISOString(),
    status: "failed",
    blockingFailure: error instanceof Error ? error.message : String(error),
    transitions,
  };
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(RAW_VIDEO_DIR, { recursive: true });
  await mkdir(FRAME_DIR, { recursive: true });

  const identity = {
    commitSha: getCommitSha(),
    githubRunId: process.env.GITHUB_RUN_ID ?? null,
    githubRef: process.env.GITHUB_REF ?? null,
    appUrl: APP_URL,
    viewport: VIEWPORT,
  };
  const transitions = [];
  let appProcess;
  let browser;
  let context;

  try {
    appProcess = await ensureApp();
    browser = await chromium.launch();
    context = await browser.newContext({ viewport: VIEWPORT, recordVideo: { dir: RAW_VIDEO_DIR, size: VIEWPORT } });
    const page = await context.newPage();
    const video = page.video();

    await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await waitForStage(page, "camp");
    const initialFrame = await captureFrame(page, 0, "camp", "opening");
    const initialState = await readSavedState(page);

    for (let index = 0; index < TRANSITIONS.length; index += 1) {
      const transition = TRANSITIONS[index];
      const beforeStage = await currentStage(page);
      await runOrder(page, transition.label, transition.orderId);
      await waitForStage(page, transition.expectedStage);
      await sleep(250);
      const afterStage = await currentStage(page);
      const stageChanged = beforeStage !== afterStage;
      if (afterStage !== transition.expectedStage) {
        throw new Error(`${transition.orderId}: expected stage ${transition.expectedStage}, got ${afterStage}`);
      }
      if (transition.stageMustChange && !stageChanged) {
        throw new Error(`${transition.orderId}: expected Aurelian stage change from ${beforeStage}`);
      }
      if (!transition.stageMustChange && stageChanged) {
        throw new Error(`${transition.orderId}: unexpected Aurelian stage change ${beforeStage} -> ${afterStage}`);
      }
      const frame = await captureFrame(page, index + 1, transition.orderId, "after");
      transitions.push({
        index: index + 1,
        orderId: transition.orderId,
        label: transition.label,
        beforeStage,
        afterStage,
        stageChanged,
        expectedStage: transition.expectedStage,
        frame,
      });
    }

    await context.close();
    context = null;
    const rawVideoPath = await video.path();
    const finalVideoPath = `${VIDEO_DIR}/desktop-village-progression.webm`;
    await rename(rawVideoPath, finalVideoPath);
    await rm(RAW_VIDEO_DIR, { recursive: true, force: true });
    const videoBuffer = await readFile(finalVideoPath);
    const videoStats = await stat(finalVideoPath);

    const manifest = {
      ...identity,
      generatedAt: new Date().toISOString(),
      status: "passed",
      blockingFailure: null,
      requiredSequence: ["camp", "first_shelter", "developed_settlement"],
      initialCamp: {
        stage: "camp",
        frame: initialFrame,
        completedOrders: initialState?.completedOrders ?? [],
        settlementMarkers: initialState?.settlementMarkers ?? [],
      },
      video: {
        path: "videos/desktop-village-progression.webm",
        width: VIEWPORT.width,
        height: VIEWPORT.height,
        byteSize: videoStats.size,
        sha256: sha256(videoBuffer),
      },
      transitions,
    };

    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    await writeFile(REPORT_PATH, buildReport(manifest));
    console.log(`Aurelian Village progression evidence written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeFailure(identity, error, transitions);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
    stopApp(appProcess);
  }
}

main();
