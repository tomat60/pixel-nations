import { chromium } from "playwright";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import {
  APP_URL, OUTPUT_DIR, VIDEO_DIR, RAW_VIDEO_DIR, FRAME_DIR, SHEET_DIR, MANIFEST_PATH, REPORT_PATH,
  VIEWPORT, TRANSITIONS, sleep, sha256, createRunClock, getCommitSha, ensureApp, stopApp,
  claimGreenvale, captureFrame, readVillageSnapshot, readVisibleStageCounts, recordTransition,
} from "./qa-village-progression-lib.mjs";
import { createContactSheet, buildReport } from "./qa-village-progression-report.mjs";

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
    context = await browser.newContext({ viewport: VIEWPORT, recordVideo: { dir: RAW_VIDEO_DIR, size: VIEWPORT } });
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

    const timestamps = [campFrame.timestampMs, ...transitions.flatMap((transition) => transition.frames.map((frame) => frame.timestampMs))];
    const timestampsMonotonic = timestamps.every((timestamp, index) => index === 0 || timestamp > timestamps[index - 1]);
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
