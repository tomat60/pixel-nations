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

const requiredContracts = [
  ["home-count derivation", "const shelterHomeCount = hasStorehouse"],
  ["four-home storehouse state", "? 4"],
  ["three-home food and timber state", ": hasFood && hasTimber"],
  ["three-home value", "? 3"],
  ["two-home food or timber state", ": hasFood || hasTimber"],
  ["two-home value", "? 2"],
  ["single-home fallback", ": 1;"],
  ["progression passed to ShelterCluster", "<ShelterCluster homeCount={shelterHomeCount} />"],
  ["typed ShelterCluster input", "function ShelterCluster({ homeCount }: { homeCount: number })"],
  ["bounded visible hut slice", "const visibleHuts = huts.slice(0, Math.max(1, Math.min(homeCount, huts.length)));"],
  ["runtime QA home count", "data-home-count={visibleHuts.length}"],
  ["visible hut rendering", "{visibleHuts.map((hut, index) => ("],
  ["yard props deferred until second home", "{visibleHuts.length > 1 ? ("],
];

for (const [label, contract] of requiredContracts) {
  if (!source.includes(contract)) {
    fail(`Missing ${label}: ${contract}`);
  }
}

const forbiddenContracts = [
  ["legacy unparameterized call", "<ShelterCluster />"],
  ["legacy unparameterized component", "function ShelterCluster()"],
  ["unconditional hut rendering", "{huts.map((hut, index) => ("],
];

for (const [label, contract] of forbiddenContracts) {
  if (source.includes(contract)) {
    fail(`Forbidden ${label} remains: ${contract}`);
  }
}

if (process.exitCode) {
  process.exit();
}

pass("Village shelter progression contract is staged 1 → 2 → 3 → 4 homes with yard props deferred until the second home.");
