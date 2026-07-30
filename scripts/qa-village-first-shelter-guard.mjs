#!/usr/bin/env node
import { readFileSync } from "node:fs";

const sourcePath = "app/play/components/VillageScene.tsx";
const source = readFileSync(sourcePath, "utf8");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

const shelterClusterMatch = source.match(/function\s+ShelterCluster\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);

if (!shelterClusterMatch) {
  fail("ShelterCluster() was not found. The first-shelter visual gate cannot prove the opening progression.");
  process.exit();
}

const shelterClusterBody = shelterClusterMatch[1];
const hutsArrayMatch = shelterClusterBody.match(/const\s+huts\s*:[\s\S]*?=\s*\[([\s\S]*?)\];/);

if (!hutsArrayMatch) {
  pass("ShelterCluster() no longer uses a static huts array; manual visual review still required.");
  process.exit();
}

const hutsArrayBody = hutsArrayMatch[1];
const hutCount = (hutsArrayBody.match(/\bleft\s*:/g) ?? []).length;

if (hutCount > 1) {
  fail(`ShelterCluster() currently defines ${hutCount} huts. The first shelter order must render one readable home first, then add more homes only after later progression. Fix this in component logic, not global CSS/nth-child/path selectors.`);
} else {
  pass(`ShelterCluster() defines ${hutCount} hut; first-shelter component gate passed.`);
}
