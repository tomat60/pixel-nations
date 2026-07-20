import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { spawn, execSync } from "node:child_process";

const APP_URL = process.env.QA_APP_URL ?? "http://localhost:3000";
const OUTPUT_DIR = "public/qa/village-progression";
const VIDEO_DIR = `${OUTPUT_DIR}/videos`;
const RAW_VIDEO_DIR = `${VIDEO_DIR}/raw`;
const FRAME_DIR = `${OUTPUT_DIR}/frames`;
const SHEET_DIR = `${OUTPUT_DIR}/contact-sheets`;
const MANIFEST_PATH = `${OUTPUT_DIR}/sequence-manifest.json`;
const REPORT_PATH = `${OUTPUT_DIR}/report.html`;
const STORAGE_KEY = "pixelNations.play.v1";
const VIEWPORT = { width: 1440, height: 900 };
const FRAME_OFFSETS_MS = [100, 350, 800, 1400];

const STAGE_SELECTORS = {
  hearth: '[data-qa="village-hearth-smoke"]',
  shelter: '[data-qa="village-structure-hut"]',
  food: '[data-qa="village-food-fields"]',
  timber: '[data-qa="village-timber-yards"]',
  storehouse: '[data-qa="village-storehouse-visual"]',
  market: '[data-qa="village-market-activity"]',
  watch: '[data-qa="village-watch-visual"]',
  council: '[data-qa="village-council-visual"]',
};

const TRANSITIONS = [
  { orderId: "raise-shelter", label: "Raise Shelter", stageKey: "shelter", expectVisibleDelta: true },
  { orderId: "gather-food", label: "Gather Food", stageKey: "food", expectVisibleDelta: true },
  { orderId: "cut-timber", label: "Cut Timber", stageKey: "timber", expectVisibleDelta: true },
  { orderId: "scout-nearby", label: "Scout Nearby Land", stageKey: null, expectVisibleDelta: false },
  { orderId: "build-storehouse", label: "Build Storehouse", stageKey: "storehouse", expectVisibleDelta: true },
  { orderId: "open-market", label: "Open Market Path", stageKey: "market", expectVisibleDelta: true },
  { orderId: "fortify-watch", label: "Fortify Watch", stageKey: "watch", expectVisibleDelta: true },
  { orderId: "form-council", label: "Form Council", stageKey: "council", expectVisibleDelta: true },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function createRunClock() {
  const started = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - started) / 1_000_000;
}

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
  while (Date.now() - startedAt < 30_000) {
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

async function readVillageSnapshot(page) {
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

async function readVisibleStageCounts(page) {
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

async function claimGreenvale(page) {
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

async function captureFrame(scene, runClock, transitionIndex, slug, phase) {
  const timestampMs = runClock();
  const filename = `${String(transitionIndex).padStart(2, "0")}-${slug}-${phase}-t${String(Math.round(timestampMs)).padStart(6, "0")}.png`;
  const buffer = await scene.screenshot();
  await writeFile(`${FRAME_DIR}/${filename}`, buffer);
  return {
    phase,
    timestampMs,
    path: `frames/${filename}`,
    sha256: sha256(buffer),
    buffer,
  };
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
  const frame = await captureFrame(scen, runClock, transitionIndex, slug, `plus-${requestedOffsetMs}`);
  return { ...frame, requestedOffsetMs, measuredOffsetMs: frame.timestampMs - triggerTimestamp };
}

async function recordTransition(page, scene, runClock, transition, transitionIndex) {
  const warnings = [];
  const slug = transition.orderId;
  await sleep(700);

  const stateBefore = await readVillageSnapshot(page);
  const selectorsBefore = await readVisibleStageCounts(page);
  const beforeSettledSha256 = await captureSettledHash(page, scene);
  const beforeFrame = await captureFrame(scene, runClock, transitionIndex, slug, "before");

  const triggerTimestampMs = await triggerOrder(page, transition.label, runClock);
  const offsetFrames = [];
  for (const offset of FRAME_OFFSETS_MS) {
    offsetFrames.push(await captureAtOffset(scene, runClock, transitionIndex, slug, triggerTimestampMs, offset));
  }

  const untilSettled = triggerTimestampMs + 1500 - runClock();
  if (untilSettled > 0) await sleep(untilSettled);
  await waitForOrderPersisted(page, transition.orderId);

  const afterFrame = await captureFrame(scen, runClock, transitionIndex, slug, "after");
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
    frames: [beforeFrame, ...offsetFrames, afterFrame].map(({ buffer, ...frame }) => frame),
    frameBuffers: [beforeFrame.buffer, ...offsetFrames.map((frame) => frame.buffer), afterFrame.buffer],
  };
}

function imageDataUri(buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function createContactSheet(browser, filePath, title, rows) {
  const page = await browser.newPage({ viewport: { width: 1960, height: 1080 } });
  const htmlRows = rows.map((row) => {
    const cells = row.frameBuffers.map((buffer, index) => {
      const frame = row.frames[index];
      return `<figure><img src="${imageDataUri(buffer)}"><figcaption>${escapeHtml(frame.phase)}<br>t=${frame.timestampMs.toFixed(1)}ms</figcaption></figure>`;
    }).join("");
    return `<section><h2>${escapeHtml(row.label)} · ${escapeHtml(row.orderId)}</h2><div class="strip">${cells}</div></section>`;
  }).join("");

  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:20px;background:#070b0c;color:#f7ead2;font-family:ui-monospace,monospace}
    h1{font-size:24px;margin:0 0 20px}h2{font-size:15px;margin:18px 0 8px}
    .strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
    figure{margin:0;background:#111;border:1px solid #39413d;border-radius:6px;overflow:hidden}
    img{display:block;width:100%;height:auto}figcaption{padding:5px 7px;font-size:10px;line-height:1.35}
  </style></head><body><h1>${escapeHtml(title)}</h1>${htmlRows}</body></html>`, { waitUntil: "load" });
  await page.screenshot({ path: filePath, fullPage: true });
  await page.close();
}

function buildReport(manifest) {
  const rows = manifest.transitions.map((transition) => `<tr>
    <td>${escapeHtml(transition.label)}</td>
    <td>${escapeHtml(transition.orderId)}</td>
    <td>${transition.visibleDelta}</td>
    <td>${transition.stateDelta}</td>
    <td>${transition.selectorDelta}</td>
    <td>${transition.expectedSelectorAppeared ?? "n/a"}</td>
    <td>${transition.measuredTransitionWindowMs.toFixed(1)}ms</td>
  </tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Village progression evidence</title><style>
    body{background:#0b0f10;color:#f7ead2;font-family:sans-serif;padding:24px}a{color:#facc15}
    table{border-collapse:collapse;width:100%}th,td{border:1px solid #444;padding:7px;font-size:12px;text-align:left}
  </style></head><body><h1>Village progression evidence</h1>
  <p>Commit: <code>${escapeHtml(manifest.commitSha)}</code></p>
  <p>Run/ref: ${escapeHtml(manifest.githubRunId ?? "local")} / ${escapeHtml(manifest.githubRef ?? "unknown")}</p>
  <p>Village V2 flag: <code>${escapeHtml(manifest.villageV2Flag)}</code></p>
  <p><a href="videos/desktop-village-progression.webm">Raw continuous Playwright WebM</a> · ${manifest.video.byteSize} bytes · SHA-256 ${manifest.video.sha256}</p>
  <table><thead><tr><th>Transition</th><th>Order</th><th>Visual</th><th>State</th><th>Selector</th><th>Stage appeared</th><th>Window</th></tr></thead><tbody>${rows}</tbody></table>
  <p>Warnings: ${manifest.warnings.length ? escapeHtml(manifest.warnings.join(" | ")) : "none"}</p></body></html>`;
}

async function writeFailureManifest(identity, error, transitions, warnings) {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const manifest = {
    ...identity,
    generatedAt: new Date().toISOString(),
    status: "failed",
    blockingFailure: error instanceof Error ? error.message : String(error),
    warnings,
    transitions: transitions.map(({ frameBuffers, ...transition }) => transition),
  };
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(RAW_VIDEO_DIR, { recursive: true });
  await mkdir(FRAME_DIR, { recursive: true });
  await mkdir(SHEET_DIR, { recursive: true });

  const identity = {
    commitSha: getCommitSha(),
    githubRunId: process.env.GITHUB_RUN_ID ?? null,
    githubRef: process.env.GITHUB_REF ?? null,
    villageV2Flag: process.env.NEXT_PUBLIC_VILLAGE_V2 ?? "unset",
    appUrl: APP_URL,
    viewport: VIEWPORT,
  };
  const runClock = createRunClock();
  const transitions = [];
  const warnings = [];
  let appProcess;
  let browser;
  let context;

  try {
    appProcess = await ensureApp();
    browser = await chromium.launch();
    context = await browser.newContext({
      viewport: VIEWPORT,
      recordVideo: { dir: RAW_VIDEO_DIR, size: VIEWPORT },
    });
    const page = await context.newPage();
    const video = page.video();

    await claimGreenvale(page);
    const scene = page.locator('[data-qa="village-scene"]');
    await sleep(700);
    const campFrame = await captureFrame(scene, runClock, 0, "camp", "settled");
    const campSnapshot = await readVillageSnapshot(page);
    const campSelectors = await readVisibleStageCounts(page);

    for (let index = 0; index < TRANSITIONS.length; index += 1) {
      const result = await recordTransition(page, scene, runClock, TRANSITIONS[index], index + 1);
      transitions.push(result);
      warnings.push(...result.warnings.map((warning) => `${result.orderId}: ${warning}`));
    }

    await context.close();
    context = null;
    const rawVideoPath = await video.path();
    const finalVideoPath = `${VIDEO_DIR}/desktop-village-progression.webm`;
    await rename(rawVideoPath, finalVideoPath);
    await rm(RAW_VIDEO_DIR, { recursive: true, force: true });

    const videoBuffer = await readFile(finalVideoPath);
    const videoStats = await stat(finalVideoPath);
    await createContactSheet(browser, `${SHEET_DIR}/01-village-early.png`, "Village progression — camp through scout", [
      { label: "Initial Camp", orderId: "camp", frames: [campFrame], frameBuffers: [campFrame.buffer] },
      ...transitions.slice(0, 4),
    ]);
    await createContactSheet(browser, `${SHEET_DIR}/02-village-late.png`, "Village progression — storehouse through council", transitions.slice(4));

    const allFrameTimestamps = [campFrame.timestampMs, ...transitions.flatMap((transition) => transition.frames.map((frame) => frame.timestampMs))];
    const timestampsMonotonic = allFrameTimestamps.every((timestamp, index) => index === 0 || timestamp > allFrameTimestamps[index - 1]);
    if (!timestampsMonotonic) throw new Error("Frame timestamps are not strictly monotonic");

    const manifest = {
      ...identity,
      generatedAt: new Date().toISOString(),
      status: "passed",
      blockingFailure: null,
      video: {
        path: "videos/desktop-village-progression.webm",
        width: VIEWPORT.width,
        height: VIEWPORT.height,
        byteSize: videoStats.size,
        sha256: sha256(videoBuffer),
      },
      initialCamp: {
        frame: { phase: campFrame.phase, timestampMs: campFrame.timestampMs, path: campFrame.path, sha256: campFrame.sha256 },
        state: campSnapshot,
        selectors: campSelectors,
      },
      frameCount: 1 + transitions.reduce((sum, transition) => sum + transition.frames.length, 0),
      timestampsMonotonic,
      warnings,
      transitions: transitions.map(({ frameBuffers, ...transition }) => transition),
    };

    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    await writeFile(REPORT_PATH, buildReport(manifest));
    console.log(`Village progression evidence written to ${OUTPUT_DIR}`);
  } catch (error) {
    await writeFailureManifest(identity, error, transitions, warnings);
    console.error(error);
    process.exitCode = 1;
  } finally {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
    stopApp(appProcess);
  }
}

main();
