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
  'getAurelianSettlementStage',
  'getAurelianVillageV4Stage',
  'base-terrain.webp',
  'stage-01-camp.webp',
  'stage-02-shelter.webp',
  'stage-03-food.webp',
  'stage-04-timber.webp',
  'stage-05-scout.webp',
  'stage-06-storehouse.webp',
  'stage-07-market.webp',
  'stage-08-watch.webp',
  'stage-09-council.webp',
  'data-aurelian-stage={legacyStageId}',
  'data-aurelian-v4-stage={v4StageId}',
  'data-aurelian-v4-layer-count={activeIndex + 1}',
  'data-qa="aurelian-village-stage"',
  'data-qa={qa}',
  'data-aurelian-v4-image-stage={stage}',
  'data-aurelian-active={active ? "true" : "false"}',
  'index <= activeIndex',
  'priority',
  'opacity-100',
  'opacity-0',
];

const requiredResolverTokens = [
  'export type AurelianSettlementStage = "camp" | "first_shelter" | "developed_settlement"',
  'export type AurelianVillageV4Stage = "camp" | "shelter" | "food" | "timber" | "scout" | "storehouse" | "market" | "watch" | "council"',
  'aurelianVillageV4Stages',
  'orderId: "raise-shelter"',
  'orderId: "gather-food"',
  'orderId: "cut-timber"',
  'orderId: "scout-nearby"',
  'orderId: "build-storehouse"',
  'orderId: "open-market"',
  'orderId: "fortify-watch"',
  'orderId: "form-council"',
  'getAurelianVillageV4Stage',
  'state.completedOrders.includes(stage.orderId)',
];

const forbiddenPageTokens = [
  'import { VillageScene } from "./components/VillageScene";',
  'useReducer(playReducer, initialPlayState)',
];
const forbiddenSceneTokens = [
  'aurelian-camp-desktop.png',
  'aurelian-developed_settlement-desktop.png',
  'function getAurelianStageId',
  'developedMarkers.some',
];

for (const token of requiredPageTokens) {
  if (!page.includes(token)) throw new Error(`Missing Aurelian page integration token: ${token}`);
}
for (const token of requiredSceneTokens) {
  if (!scene.includes(token)) throw new Error(`Missing Village V4 scene token: ${token}`);
}
for (const token of requiredResolverTokens) {
  if (!resolver.includes(token)) throw new Error(`Missing Village V4 resolver token: ${token}`);
}
for (const token of forbiddenPageTokens) {
  if (page.includes(token)) throw new Error(`Forbidden legacy product-path token remains: ${token}`);
}
for (const token of forbiddenSceneTokens) {
  if (scene.includes(token)) throw new Error(`Forbidden Village V4 presentation regression remains: ${token}`);
}

console.log("AURELIAN_PLAY_INTEGRATION_GUARD_OK");
