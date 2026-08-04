#!/usr/bin/env node
import fs from "node:fs";

const page = fs.readFileSync("app/play/page.tsx", "utf8");
const scene = fs.readFileSync("app/play/components/AurelianVillageScene.tsx", "utf8");
const resolver = fs.readFileSync("app/play/lib/aurelian-progression.ts", "utf8");

const requiredPageTokens = [
  'import { AurelianVillageScene } from "./components/AurelianVillageScene";',
  'const aurelianInitialPlayState: PlayState = {',
  'ownedPlotIds: [initialPlayState.selectedPlotId]',
  'settlementMarkers: ["camp"]',
  'view: "village"',
  'useReducer(playReducer, aurelianInitialPlayState)',
  '<AurelianVillageScene state={state} dispatch={dispatch} />',
  'dispatch({ type: "hydrate", state: aurelianInitialPlayState })',
  'if (isLegacyEmptyRun) return aurelianInitialPlayState',
];

const requiredSceneTokens = [
  'getAurelianSettlementStage, type AurelianSettlementStage',
  'aurelian-camp-desktop.png',
  'aurelian-camp-portrait.png',
  'aurelian-first_shelter-desktop.png',
  'aurelian-first_shelter-portrait.png',
  'aurelian-developed_settlement-desktop.png',
  'aurelian-developed_settlement-portrait.png',
  'data-aurelian-stage={stageId}',
  'data-qa="aurelian-village-stage"',
  'const stageId = getAurelianSettlementStage(state) ?? "camp"',
  'const stageEntries = Object.entries(stageVisuals) as Array<[AurelianSettlementStage, StageVisual]>',
  'data-qa="aurelian-stage-image"',
  'data-aurelian-image-stage={candidateId}',
  'data-aurelian-active={isActive ? "true" : "false"}',
  'priority',
  'opacity-100',
  'opacity-0',
];

const requiredResolverTokens = [
  'export type AurelianSettlementStage = "camp" | "first_shelter" | "developed_settlement"',
  'if (state.ownedPlotIds.length === 0)',
  'if (!state.settlementMarkers.includes("shelter"))',
  'return "camp"',
  'return hasDevelopedSettlement ? "developed_settlement" : "first_shelter"',
];

const forbiddenPageTokens = [
  'import { VillageScene } from "./components/VillageScene";',
  'useReducer(playReducer, initialPlayState)',
];
const forbiddenSceneTokens = [
  'function getAurelianStageId',
  'developedMarkers.some',
  'src={visual.portrait}',
  'src={visual.desktop}',
];

for (const token of requiredPageTokens) {
  if (!page.includes(token)) throw new Error(`Missing Aurelian page integration token: ${token}`);
}
for (const token of requiredSceneTokens) {
  if (!scene.includes(token)) throw new Error(`Missing Aurelian scene token: ${token}`);
}
for (const token of requiredResolverTokens) {
  if (!resolver.includes(token)) throw new Error(`Missing Aurelian resolver token: ${token}`);
}
for (const token of forbiddenPageTokens) {
  if (page.includes(token)) throw new Error(`Forbidden legacy product-path token remains: ${token}`);
}
for (const token of forbiddenSceneTokens) {
  if (scene.includes(token)) throw new Error(`Forbidden Aurelian presentation regression remains: ${token}`);
}

console.log("AURELIAN_PLAY_INTEGRATION_GUARD_OK");
