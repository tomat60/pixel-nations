#!/usr/bin/env node
import fs from "node:fs";

const page = fs.readFileSync("app/play/page.tsx", "utf8");
const scene = fs.readFileSync("app/play/components/AurelianVillageScene.tsx", "utf8");

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
  'aurelian-camp-desktop.png',
  'aurelian-camp-portrait.png',
  'aurelian-first_shelter-desktop.png',
  'aurelian-first_shelter-portrait.png',
  'aurelian-developed_settlement-desktop.png',
  'aurelian-developed_settlement-portrait.png',
  'data-aurelian-stage={stageId}',
  'data-qa="aurelian-village-stage"',
  'state.settlementMarkers.includes("shelter")',
  'developedMarkers.some',
  'return "developed_settlement"',
  'return "first_shelter"',
  'return "camp"',
];

const forbiddenPageTokens = [
  'import { VillageScene } from "./components/VillageScene";',
  'useReducer(playReducer, initialPlayState)',
];

for (const token of requiredPageTokens) {
  if (!page.includes(token)) throw new Error(`Missing Aurelian page integration token: ${token}`);
}
for (const token of requiredSceneTokens) {
  if (!scene.includes(token)) throw new Error(`Missing Aurelian scene token: ${token}`);
}
for (const token of forbiddenPageTokens) {
  if (page.includes(token)) throw new Error(`Forbidden legacy product-path token remains: ${token}`);
}

console.log("AURELIAN_PLAY_INTEGRATION_GUARD_OK");
