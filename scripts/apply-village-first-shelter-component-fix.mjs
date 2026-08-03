#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const path = "app/play/components/VillageScene.tsx";
let source = await readFile(path, "utf8");

const alreadyApplied =
  source.includes('function ShelterCluster({ homeCount }: { homeCount: number })') &&
  source.includes('data-home-count={visibleHuts.length}') &&
  source.includes('huts.slice(0, Math.max(1, Math.min(homeCount, huts.length)))') &&
  source.includes('<ShelterCluster homeCount={shelterHomeCount} />');

if (alreadyApplied) {
  console.log("VILLAGE_FIRST_SHELTER_COMPONENT_PATCH_ALREADY_APPLIED");
  process.exit(0);
}

const layerNeedle = `  const hasWatch = state.settlementMarkers.includes("watch");\n  const institutionVisuals = getInstitutionVisuals(state.retentionRecords);`;
const layerReplacement = `  const hasWatch = state.settlementMarkers.includes("watch");\n  const shelterHomeCount = hasStorehouse\n    ? 4\n    : hasFood && hasTimber\n      ? 3\n      : hasFood || hasTimber\n        ? 2\n        : 1;\n  const institutionVisuals = getInstitutionVisuals(state.retentionRecords);`;

const callNeedle = `{hasShelter ? <ShelterCluster /> : null}`;
const callReplacement = `{hasShelter ? <ShelterCluster homeCount={shelterHomeCount} /> : null}`;

const signatureNeedle = `function ShelterCluster() {`;
const signatureReplacement = `function ShelterCluster({ homeCount }: { homeCount: number }) {`;

const beforeReturnNeedle = `  ];\n  return (\n    <div data-qa="village-structure-hut" className="absolute inset-0">\n      {huts.map((hut, index) => (`;
const beforeReturnReplacement = `  ];\n  const visibleHuts = huts.slice(0, Math.max(1, Math.min(homeCount, huts.length)));\n  return (\n    <div data-qa="village-structure-hut" data-home-count={visibleHuts.length} className="absolute inset-0">\n      {visibleHuts.map((hut, index) => (`;

const yardNeedle = `      {/* yard props: wood pile + barrel, touching the shared yard/path area */}\n      <div className="absolute left-[26%] top-[52%] h-2 w-6 -translate-x-1/2 rounded-full bg-amber-900/80 shadow-md" />\n      <div className="absolute left-[26%] top-[50%] h-2 w-5 -translate-x-1/2 rounded-full bg-amber-800/75 shadow-sm" />\n      <div className="absolute left-[24%] top-[55%] h-3 w-2.5 -translate-x-1/2 rounded-sm bg-stone-700/80 shadow-md" />`;
const yardReplacement = `      {visibleHuts.length > 1 ? (\n        <>\n          {/* yard props arrive with the second home, keeping the first-shelter frame readable */}\n          <div className="absolute left-[26%] top-[52%] h-2 w-6 -translate-x-1/2 rounded-full bg-amber-900/80 shadow-md" />\n          <div className="absolute left-[26%] top-[50%] h-2 w-5 -translate-x-1/2 rounded-full bg-amber-800/75 shadow-sm" />\n          <div className="absolute left-[24%] top-[55%] h-3 w-2.5 -translate-x-1/2 rounded-sm bg-stone-700/80 shadow-md" />\n        </>\n      ) : null}`;

const replacements = [
  [layerNeedle, layerReplacement, "derive shelterHomeCount"],
  [callNeedle, callReplacement, "pass shelterHomeCount"],
  [signatureNeedle, signatureReplacement, "accept homeCount"],
  [beforeReturnNeedle, beforeReturnReplacement, "slice visible huts and expose QA count"],
  [yardNeedle, yardReplacement, "defer yard props"],
];

for (const [needle, replacement, label] of replacements) {
  const count = source.split(needle).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${count}`);
  }
  source = source.replace(needle, replacement);
}

if (source.includes("function ShelterCluster()")) throw new Error("old ShelterCluster signature remains");
if (!source.includes('data-home-count={visibleHuts.length}')) throw new Error("data-home-count contract missing");
if (!source.includes("huts.slice(0, Math.max(1, Math.min(homeCount, huts.length)))")) throw new Error("progressive hut slice missing");

await writeFile(path, source);
console.log("VILLAGE_FIRST_SHELTER_COMPONENT_PATCH_APPLIED");
