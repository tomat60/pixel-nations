import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn, execSync } from "node:child_process";

export const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
export const OUTPUT_DIR = "public/qa/village-progression";
export const VIDEO_DIR = `${OUTPUT_DIR}/videos`;
export const RAW_VIDEO_DIR = `${VIDEO_DIR}/raw`;
export const FRAME_DIR = `${OUTPUT_DIR}/frames`;
export const SHEET_DIR = `${OUTPUT_DIR}/contact-sheets`;
export const MANIFEST_PATH = `${OUTPUT_DIR}/sequence-manifest.json`;
export const REPORT_PATH = `${OUTPUT_DIR}/report.html`;
export const STORAGE_KEY = "pixelNations.play.v1";
export const VIEWPORT = { width: 1440, height: 900 };
export const FRAME_OFFSETS_MS = [100, 350, 800, 1400];

export const STAGE_SELECTORS = {
  hearth: '[data-qa="village-hearth-smoke"]',
  shelter: '[data-qa="village-structure-hut"]',
  food: '[data-qa="village-food-fields"]',
  timber: '[data-qa="village-timber-yards"]',
  storehouse: '[data-qa="village-storehouse-visual"]',
  market: '[data-qa="village-market-activity"]',
  watch: '[data-qa="village-watch-visual"]',
  council: '[data-qa="village-council-visual"]',
};

export const TRANSITIONS = [
  { orderId: "raise-shelter", label: "Raise Shelter", stageKey: "shelter", expectVisibleDelta: true },
  { orderId: "gather-food", label: "Gather Food", stageKey: "food", expectVisibleDelta: true },
  { orderId: "cut-timber", label: "Cut Timber", stageKey: "timber", expectVisibleDelta: true },
  { orderId: "scout-nearby", label: "Scout Nearby Land", stageKey: null, expectVisibleDelta: false },
  { orderId: "build-storehouse", label: "Build Storehouse", stageKey: "storehouse", expectVisibleDelta: true },
  { orderId: "open-market", label: "Open Market Path", stageKey: "market", expectVisibleDelta: true },
  { orderId: "fortify-watch", label: "Fortify Watch", stageKey: "watch", expectVisibleDelta: true },
  { orderId: "form-council", label: "Form Council", stageKey: "council", expectVisibleDelta: true },
];

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
export const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export function createRunClock() {
  const started = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - started) / 1_000_000;
}

export function getCommitSha() {
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

export async function ensureApp() {
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
  while (Date.now() - startedAt < 30_000) {
    if (await appRunning()) return processHandle;
    await sleep(500);
  }
  throw new Error(`Timed out waiting for ${APP_URL}`);
}

export function stopApp(processHandle) {
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
  const buttons = page.getByRole("button", { name, exact: typeof name === "string" });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (await button.isVisible()) {
      await button.click({ timeout: 5000 });
      return;
    }
  }
  throw new Error(`${step}: no visible button matching ${String(name)}`);
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

export async function readVillageSnapshot(page) {
  const saved = await readSavedState(page);
  const plots = await page.locator('[data-qa="village-plot"]').evaluateAll((nodes) => nodes.map((node) => ({
    id: node.getAttribute("data-qa-id"),
    state: node.getAttribute("data-qa-state"),
  })));
  return {
    completedOrders: Array.isArray(saved?.completedOrders) ? saved.completedOrders : [],
    settlementMarkers: Array.isArray(saved?.settlementMarkers) ? saved.settlementMarkers : [],
    plots,
  };
}

export async function readVisibleStageCounts(page) {
  const counts = {};
  for (const [key, selector] of Object.entries(STAGE_SELECTORS)) {
    counts[key] = await page.locator(selector).evaluateAll((nodes) => nodes.filter((node) => {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    }).length);
  }
  return counts;
}

async function waitForOrderPersisted(page, orderId) {
  await page.waitForFunction(({ key, expectedOrder }) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const state = JSON.parse(raw);
      return Array.isArray(state?.completedOrders) && state.completedOrders.includes(expectedOrder);
    } catch {
      return false;
    }
  }, { key: STORAGE_KEY, expectedOrder: orderId }, { timeout: 7000 });
}

export async function claimGreenvale(page) {
  await page.goto(`${APP_URL}/play`, { waitUntil: "domcontentloaded", timeout: 15_000 });
  await page.locator('[data-qa="plot-greenvale"]').click({ timeout: 7000, force: true });
  const claimButton = page.locator('[data-qa="claim-button"]');
  await claimButton.waitFor({ state: "visible", timeout: 7000 });
  await claimButton.click({ timeout: 5000 });
  await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 7000 });
}

async function triggerOrder(page, label, runClock) {
  await clickVisibleButton(page, "Issue next order", `open Orders for ${label}`);
  await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 5000 });
  const triggerTimestamp = runClock();
  await clickVisibleButton(page, label, `run order ${label}`);
  await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 5000 });
  return triggerTimestamp;
}

export async function captureFrame(scene, runClock, transitionIndex, slug, phase) {
  const timestampMs = runClock();
  const filename = `${String(transitionIndex).padStart(2, "0")}-${slug}-${phase}-t${String(Math.round(timestampMs)).padStart(6, "0")}.png`;
  const buffer = await scene.screenshot();
  await mkdir(FRAME_DIR, { recursive: true });
  await writeFile(`${FRAME_DIR}/${filename}`, buffer);
  return { phase, timestampMs, path: `frames/${filename}`, sha256: sha256(buffer), buffer };
}

async function captureSettledHash(page, scene) {
  const style = await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
  });
  await sleep(80);
  const buffer = await scene.screenshot();
  await style.evaluate((node) => node.remove()).catch(() => {});
  await sleep(40);
  return sha256(buffer);
}

async function captureAtOffset(scene, runClock, transitionIndex, slug, triggerTimestamp, requestedOffsetMs) {
  const remaining = triggerTimestamp + requestedOffsetMs - runClock();
  if (remaining > 0) await sleep(remaining);
  const frame = await captureFrame(scene, runClock, transitionIndex, slug, `plus-${requestedOffsetMs}`);
  return { ...frame, requestedOffsetMs, measuredOffsetMs: frame.timestampMs - triggerTimestamp };
}

export async function recordTransition(page, scene, runClock, transition, transitionIndex) {
  const warnings = [];
  await sleep(700);
  const stateBefore = await readVillageSnapshot(page);
  const selectorsBefore = await readVisibleStageCounts(page);
  const beforeSettledSha256 = await captureSettledHash(page, scene);
  const beforeFrame = await captureFrame(scene, runClock, transitionIndex, transition.orderId, "before");

  const triggerTimestampMs = await triggerOrder(page, transition.label, runClock);
  const offsetFrames = [];
  for (const offset of FRAME_OFFSETS_MS) {
    offsetFrames.push(await captureAtOffset(scene, runClock, transitionIndex, transition.orderId, triggerTimestampMs, offset));
  }

  const untilSettled = triggerTimestampMs + 1500 - runClock();
  if (untilSettled > 0) await sleep(untilSettled);
  await waitForOrderPersisted(page, transition.orderId);
  const afterFrame = await captureFrame(scene, runClock, transitionIndex, transition.orderId, "after");
  const afterSettledSha256 = await captureSettledHash(page, scene);
  const stateAfter = await readVillageSnapshot(page);
  const selectorsAfter = await readVisibleStageCounts(page);

  const visibleDelta = beforeSettledSha256 !== afterSettledSha256;
  const stateDelta = JSON.stringify(stateBefore) !== JSON.stringify(stateAfter);
  const selectorDelta = JSON.stringify(selectorsBefore) !== JSON.stringify(selectorsAfter);
  const expectedSelectorAppeared = transition.stageKey
    ? selectorsAfter[transition.stageKey] > selectorsBefore[transition.stageKey]
    : null;

  if (transition.expectVisibleDelta && !visibleDelta) {
    throw new Error(`${transition.orderId}: expected a settled Village image delta but normalized hashes are identical`);
  }
  if (transition.expectVisibleDelta && !expectedSelectorAppeared) {
    throw new Error(`${transition.orderId}: expected visible selector ${transition.stageKey} did not increase`);
  }
  if (!transition.expectVisibleDelta && visibleDelta && !selectorDelta) {
    warnings.push("Scout changed the normalized Village image without changing tracked stage selectors; review as possible ambient or unrelated delta.");
  }

  const framesWithBuffers = [beforeFrame, ...offsetFrames, afterFrame];
  return {
    transitionIndex,
    orderId: transition.orderId,
    label: transition.label,
    triggerTimestampMs,
    settledTimestampMs: afterFrame.timestampMs,
    measuredTransitionWindowMs: afterFrame.timestampMs - triggerTimestampMs,
    expectedVisibleDelta: transition.expectVisibleDelta,
    expectedStageKey: transition.stageKey,
    visibleDelta,
    stateDelta,
    selectorDelta,
    expectedSelectorAppeared,
    beforeSettledSha256,
    afterSettledSha256,
    stateBefore,
    stateAfter,
    selectorsBefore,
    selectorsAfter,
    warnings,
    frames: framesWithBuffers.map(({ buffer, ...frame }) => frame),
    frameBuffers: framesWithBuffers.map((frame) => frame.buffer),
  };
}
