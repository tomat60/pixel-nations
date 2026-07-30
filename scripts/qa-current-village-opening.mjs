import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import {
  APP_URL,
  ensureApp,
  stopApp,
  claimGreenvale,
  readVillageSnapshot,
  readVisibleStageCounts,
  sleep,
} from "./qa-village-progression-lib.mjs";

const OUTPUT = "public/qa/current-village-opening";
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const OFFSETS = [100, 350, 800, 1400];
const STORAGE_KEY = "pixelNations.play.v1";

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");
const commitSha = () => {
  try { return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim(); }
  catch { return "unknown"; }
};

async function clickVisible(page, name) {
  const buttons = page.getByRole("button", { name, exact: true });
  for (let index = 0; index < await buttons.count(); index += 1) {
    const button = buttons.nth(index);
    if (await button.isVisible()) {
      await button.click({ timeout: 5000 });
      return;
    }
  }
  throw new Error(`No visible button: ${name}`);
}

async function waitForShelter(page) {
  await page.waitForFunction(({ key }) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return false;
      const state = JSON.parse(raw);
      return Array.isArray(state.completedOrders) && state.completedOrders.includes("raise-shelter")
        && Array.isArray(state.settlementMarkers) && state.settlementMarkers.includes("shelter");
    } catch { return false; }
  }, { key: STORAGE_KEY }, { timeout: 8000 });
}

async function captureScene(scene, name) {
  const buffer = await scene.screenshot();
  const path = `${OUTPUT}/${name}`;
  await writeFile(path, buffer);
  return { path: name, bytes: buffer.length, sha256: sha256(buffer), buffer };
}

async function runShelterOrder(page) {
  await clickVisible(page, "Issue next order");
  await page.locator('[data-qa="orders-panel"]').waitFor({ state: "visible", timeout: 6000 });
  const triggerTime = performance.now();
  await clickVisible(page, "Raise Shelter");
  await page.locator('[data-qa="village-scene"]').waitFor({ state: "visible", timeout: 6000 });
  return triggerTime;
}

async function desktopAudit(browser) {
  const rawVideoDir = `${OUTPUT}/raw-video`;
  await mkdir(rawVideoDir, { recursive: true });
  const context = await browser.newContext({ viewport: DESKTOP, recordVideo: { dir: rawVideoDir, size: DESKTOP } });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const video = page.video();
  await claimGreenvale(page);
  const scene = page.locator('[data-qa="village-scene"]');
  await scene.waitFor({ state: "visible", timeout: 7000 });
  await sleep(500);

  const stateBefore = await readVillageSnapshot(page);
  const selectorsBefore = await readVisibleStageCounts(page);
  const frames = [];
  frames.push(await captureScene(scene, "desktop-00-camp.png"));

  const triggerTime = await runShelterOrder(page);
  for (const offset of OFFSETS) {
    const remaining = triggerTime + offset - performance.now();
    if (remaining > 0) await sleep(remaining);
    frames.push(await captureScene(scene, `desktop-01-shelter-plus-${offset}.png`));
  }
  await waitForShelter(page);
  await sleep(250);
  frames.push(await captureScene(scene, "desktop-02-shelter-settled.png"));
  const stateAfter = await readVillageSnapshot(page);
  const selectorsAfter = await readVisibleStageCounts(page);

  await context.close();
  const rawPath = await video.path();
  const finalVideo = `${OUTPUT}/desktop-camp-to-shelter.webm`;
  await rename(rawPath, finalVideo);
  await rm(rawVideoDir, { recursive: true, force: true });
  const videoBuffer = await readFile(finalVideo);
  const videoStats = await stat(finalVideo);

  if (!stateAfter.completedOrders.includes("raise-shelter") || !stateAfter.settlementMarkers.includes("shelter")) {
    throw new Error("Shelter order did not persist");
  }
  if ((selectorsAfter.shelter ?? 0) <= (selectorsBefore.shelter ?? 0)) {
    throw new Error(`Shelter selector did not appear: before=${selectorsBefore.shelter} after=${selectorsAfter.shelter}`);
  }

  return {
    viewport: DESKTOP,
    frames: frames.map(({ buffer, ...frame }) => frame),
    frameBuffers: frames.map((frame) => frame.buffer),
    stateBefore,
    stateAfter,
    selectorsBefore,
    selectorsAfter,
    video: { path: "desktop-camp-to-shelter.webm", bytes: videoStats.size, sha256: sha256(videoBuffer) },
  };
}

async function mobileAudit(browser) {
  const context = await browser.newContext({ viewport: MOBILE, isMobile: true, hasTouch: true });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  await claimGreenvale(page);
  const scene = page.locator('[data-qa="village-scene"]');
  await scene.waitFor({ state: "visible", timeout: 7000 });
  await sleep(500);
  const camp = await captureScene(scene, "mobile-00-camp.png");
  await runShelterOrder(page);
  await waitForShelter(page);
  await sleep(300);
  const shelter = await captureScene(scene, "mobile-01-shelter-settled.png");
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  if (overflow.document > overflow.viewport + 1 || overflow.body > overflow.viewport + 1) {
    throw new Error(`Mobile horizontal overflow: ${JSON.stringify(overflow)}`);
  }
  await context.close();
  return {
    viewport: MOBILE,
    frames: [camp, shelter].map(({ buffer, ...frame }) => frame),
    frameBuffers: [camp.buffer, shelter.buffer],
    overflow,
  };
}

async function contactSheet(browser, desktop, mobile) {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 } });
  const cells = [
    ["DESKTOP CAMP", desktop.frameBuffers[0]],
    ["DESKTOP +350MS", desktop.frameBuffers[2]],
    ["DESKTOP SHELTER", desktop.frameBuffers.at(-1)],
    ["MOBILE CAMP", mobile.frameBuffers[0]],
    ["MOBILE SHELTER", mobile.frameBuffers[1]],
  ];
  const html = cells.map(([label, buffer]) => `<figure><figcaption>${label}</figcaption><img src="data:image/png;base64,${buffer.toString("base64")}" /></figure>`).join("");
  await page.setContent(`<style>body{margin:0;background:#11170f;color:#f3dfb4;font:700 18px sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:18px}figure{margin:0;background:#080b08;padding:12px}figcaption{margin-bottom:8px}img{display:block;width:100%;height:430px;object-fit:contain;background:#050705}</style>${html}`);
  await page.screenshot({ path: `${OUTPUT}/contact-sheet.png`, fullPage: true });
  await page.close();
}

async function main() {
  await rm(OUTPUT, { recursive: true, force: true });
  await mkdir(OUTPUT, { recursive: true });
  const app = await ensureApp();
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await desktopAudit(browser);
    const mobile = await mobileAudit(browser);
    await contactSheet(browser, desktop, mobile);
    const manifest = {
      classification: "PENDING_DIRECT_VISUAL_REVIEW",
      commitSha: commitSha(),
      githubRunId: process.env.GITHUB_RUN_ID ?? null,
      githubRef: process.env.GITHUB_REF ?? null,
      villageV2Flag: process.env.NEXT_PUBLIC_VILLAGE_V2 ?? "unset",
      desktop: { ...desktop, frameBuffers: undefined },
      mobile: { ...mobile, frameBuffers: undefined },
    };
    await writeFile(`${OUTPUT}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log("CURRENT_VILLAGE_OPENING_AUDIT_OK");
  } finally {
    await browser.close();
    stopApp(app);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
