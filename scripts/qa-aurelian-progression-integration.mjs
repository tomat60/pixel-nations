#!/usr/bin/env node
import { readFileSync } from "node:fs";

const resolverPath = "app/play/lib/aurelian-progression.ts";
const villagePath = "app/play/components/VillageScene.tsx";
const resolver = readFileSync(resolverPath, "utf8");
const village = readFileSync(villagePath, "utf8");

const required = [
  ["three accepted stages", 'export type AurelianSettlementStage = "camp" | "first_shelter" | "developed_settlement";'],
  ["unowned land stays outside settlement view", "if (state.ownedPlotIds.length === 0)"],
  ["owned land starts at camp", 'return "camp";'],
  ["shelter marker drives the first-shelter transition", '!state.settlementMarkers.includes("shelter")'],
  ["later permanent markers drive developed settlement", 'marker === "storehouse" || marker === "market" || marker === "council" || marker === "watch"'],
  ["first shelter remains a distinct state", 'return hasDevelopedSettlement ? "developed_settlement" : "first_shelter";'],
];

let failed = false;
for (const [label, contract] of required) {
  if (!resolver.includes(contract)) {
    console.error(`FAIL: Missing ${label}: ${contract}`);
    failed = true;
  }
}

const forbiddenVillageContracts = [
  ["claim-map feature flag as Aurelian integration", "NEXT_PUBLIC_AURELIAN_CLAIM_MAP"],
  ["instant developed settlement fallback", 'const AURELIAN_STAGE = "developed_settlement"'],
];

for (const [label, contract] of forbiddenVillageContracts) {
  if (village.includes(contract)) {
    console.error(`FAIL: Forbidden ${label}: ${contract}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("PASS: Aurelian product-state contract preserves land → camp → one first shelter → developed settlement without claim-map regression.");
