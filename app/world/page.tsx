"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDemoObjective, getPostClaimGuidance } from "../lib/demo-objective";
import {
  buildCityCoreFromWorld,
  claimLand as claimGameLand,
  ensureClaimedLandIdentity,
  establishTradeSeedFromWorld,
  foundSettlementFromWorld,
  getNextWorldGameAction,
  type GameLand,
  type WorldGameActionId,
} from "../lib/game-state";
import {
  PLAYABLE_ACTIONS,
  canQueuePlayableAction,
  formatDuration,
  getCurrentObjective,
  getQueueProgress,
  getSettlementLevelLabel,
  queuePlayableAction,
  tickPlayableState,
  type PlayableActionDefinition,
  type PlayableActionId,
  type PlayableResourceKey,
  type PlayableState,
  type QueuedPlayableAction,
} from "../lib/playable-engine";
import {
  readPlayableState,
  writePlayableState,
} from "../lib/playable-state";
import {
  DEFAULT_SETTLEMENT_STATE,
  readSettlementState,
  type SettlementState,
  writeSettlementState,
} from "../lib/settlement-state";

type Terrain = "plains" | "forest" | "mountain" | "coast" | "basin" | "crownland" | "ruins";
type Region = "Aurelia" | "North Frontier" | "Iron Coast" | "Ember Basin" | "Crownlands";

type MapTile = {
  id: string;
  landId: string;
  x: number;
  y: number;
  coordinates: string;
  region: Region;
  terrain: Terrain;
  resources: string[];
  landName: string;
  cinematicLine: string;
  contextLine: string;
  founderMeaning: string;
  strategicValue: string;
  historicalNote: string;
  starter: boolean;
  landmark: boolean;
  resourceRich: boolean;
  claimed: boolean;
};

const GRID_WIDTH = 18;
const GRID_HEIGHT = 12;

const TERRAIN_RESOURCES: Record<Terrain, string[]> = {
  plains: ["Food", "Timber"],
  forest: ["Timber", "Game"],
  mountain: ["Stone", "Iron"],
  coast: ["Fish", "Salt"],
  basin: ["Clay", "Fresh Water"],
  crownland: ["Gold", "Stone"],
  ruins: ["Relics", "Stone"],
};

const TERRAIN_TINT: Record<Terrain, string> = {
  plains: "before:bg-[#6b5438]/28",
  forest: "before:bg-[#2f4a30]/34",
  mountain: "before:bg-[#4a525c]/30",
  coast: "before:bg-[#2f5a68]/32",
  basin: "before:bg-[#5a3c30]/28",
  crownland: "before:bg-[#7a6030]/36",
  ruins: "before:bg-[#5a4838]/24",
};

const TERRAIN_TILE_SURFACE: Record<Terrain, string> = {
  plains: "bg-[#2a2218]/70",
  forest: "bg-[#142018]/75",
  mountain: "bg-[#1a1e24]/72",
  coast: "bg-[#122228]/74",
  basin: "bg-[#241812]/72",
  crownland: "bg-[#2a2010]/76",
  ruins: "bg-[#221c14]/70",
};

const REGION_LABELS = [
  { id: "north-frontier", name: "North Frontier", left: "30%", top: "18%" },
  { id: "crownlands", name: "Crownlands", left: "80%", top: "24%" },
  { id: "aurelia", name: "Aurelia", left: "54%", top: "48%" },
  { id: "iron-coast", name: "Iron Coast", left: "12%", top: "68%" },
  { id: "ember-basin", name: "Ember Basin", left: "66%", top: "82%" },
];

const MAP_ROUTES = [
  "M 80 290 C 180 238 260 245 360 198 S 548 143 686 104",
  "M 148 96 C 248 148 302 182 384 254 S 512 350 640 382",
  "M 96 420 C 214 372 312 388 452 330 S 590 288 712 302",
  "M 52 180 C 168 148 286 176 398 132 S 562 88 708 118",
  "M 220 52 C 318 108 402 168 498 228 S 628 312 726 356",
];
const LIVING_MAP_ROUTE_TARGETS = [
  { id: "iron-coast", name: "Iron Coast", x: 112, y: 292, labelX: "17%", labelY: "58%" },
  { id: "ember-basin", name: "Ember Basin", x: 528, y: 382, labelX: "69%", labelY: "78%" },
  { id: "crownlands", name: "Crownlands", x: 610, y: 144, labelX: "78%", labelY: "30%" },
];

type WorldAction = {
  id: WorldGameActionId;
  eyebrow: string;
  headline: string;
  detail: string;
  cta: string;
  qa: string;
};

type PlacementMarkerKind = "housing" | "field" | "quarry";

type PlacementMarker = {
  id: string;
  kind: PlacementMarkerKind;
  label: string;
  dx: number;
  dy: number;
};

const WORLD_PLAYABLE_ACTION_IDS: PlayableActionId[] = [
  "gather-food",
  "quarry-materials",
  "build-housing",
  "improve-fields",
  "upgrade-core",
  "open-trade",
  "scout-land",
];

const WORLD_RESOURCE_LABELS: Array<{ key: PlayableResourceKey; label: string }> = [
  { key: "food", label: "Food" },
  { key: "materials", label: "Materials" },
  { key: "treasury", label: "Treasury" },
  { key: "influence", label: "Influence" },
  { key: "stability", label: "Stability" },
];

const WORLD_PLAYABLE_ACTIONS = WORLD_PLAYABLE_ACTION_IDS
  .map((actionId) => PLAYABLE_ACTIONS.find((action) => action.id === actionId))
  .filter((action): action is PlayableActionDefinition => Boolean(action));

const WORLD_PLACEMENT_MARKERS: PlacementMarker[] = [
  { id: "housing-west", kind: "housing", label: "Housing", dx: -1, dy: 0 },
  { id: "housing-south", kind: "housing", label: "Housing", dx: 0, dy: 1 },
  { id: "field-east", kind: "field", label: "Field", dx: 1, dy: 0 },
  { id: "field-southeast", kind: "field", label: "Field", dx: 1, dy: 1 },
  { id: "quarry-northwest", kind: "quarry", label: "Quarry", dx: -1, dy: -1 },
  { id: "quarry-north", kind: "quarry", label: "Quarry", dx: 0, dy: -1 },
];

const PLACEMENT_KIND_STYLES: Record<PlacementMarkerKind, string> = {
  housing: "border-emerald-200/45 bg-emerald-300/[0.11] shadow-[0_0_18px_rgba(110,231,183,0.20)]",
  field: "border-lime-200/40 bg-lime-300/[0.10] shadow-[0_0_16px_rgba(190,242,100,0.16)]",
  quarry: "border-slate-200/38 bg-slate-300/[0.10] shadow-[0_0_16px_rgba(203,213,225,0.14)]",
};


const MAP_RIVERS = [
  "M 404 38 C 388 112 420 168 386 230 S 328 330 366 430",
  "M 636 86 C 594 132 584 190 614 248 S 680 334 644 424",
  "M 118 120 C 168 188 214 248 268 312 S 348 396 412 458",
  "M 520 18 C 498 98 512 168 476 248 S 432 348 468 440",
];

const MAP_CONTOURS = [
  "M 42 86 C 146 42 292 76 366 130 S 548 188 720 138",
  "M 74 360 C 178 302 304 332 418 284 S 598 230 734 268",
  "M 216 458 C 310 392 404 406 508 374 S 646 340 722 386",
  "M 280 96 C 348 148 412 182 468 236 S 548 312 612 368",
];

const MAP_FRONTIER_LINES = [
  "M 506 0 C 498 120 512 240 504 360 S 490 420 506 484",
  "M 0 162 C 180 148 320 172 460 158 S 620 142 760 168",
  "M 0 388 C 210 362 360 398 520 372 S 660 348 760 396",
  "M 152 0 C 168 160 142 300 158 484",
];

const SECTOR_REGION_ZONES = [
  {
    id: "north-frontier",
    className:
      "left-[12%] top-[0%] h-[38%] w-[52%] border-zinc-300/10 bg-zinc-300/[0.05] shadow-[inset_0_0_40px_rgba(161,161,170,0.04)]",
    clipPath: "polygon(0 20%, 32% 0, 90% 10%, 100% 66%, 60% 98%, 8% 80%)",
  },
  {
    id: "iron-coast",
    className:
      "left-[-1%] top-[20%] h-[78%] w-[32%] border-slate-300/10 bg-slate-400/[0.06] shadow-[inset_0_0_36px_rgba(148,163,184,0.05)]",
    clipPath: "polygon(0 0, 74% 6%, 100% 46%, 74% 100%, 6% 88%, 0 40%)",
  },
  {
    id: "aurelia",
    className:
      "left-[24%] top-[26%] h-[46%] w-[52%] border-amber-400/14 bg-amber-500/[0.07] shadow-[inset_0_0_48px_rgba(251,191,36,0.06)]",
    clipPath: "polygon(8% 16%, 54% 0, 100% 22%, 86% 80%, 34% 100%, 0 62%)",
  },
  {
    id: "crownlands",
    className:
      "left-[59%] top-[4%] h-[52%] w-[38%] border-amber-200/14 bg-amber-200/[0.06] shadow-[inset_0_0_40px_rgba(253,230,138,0.05)]",
    clipPath: "polygon(14% 6%, 82% 0, 100% 40%, 76% 92%, 20% 100%, 0 48%)",
  },
  {
    id: "ember-basin",
    className:
      "left-[32%] top-[58%] h-[38%] w-[62%] border-orange-300/10 bg-orange-400/[0.06] shadow-[inset_0_0_36px_rgba(251,146,60,0.04)]",
    clipPath: "polygon(2% 26%, 40% 0, 100% 14%, 90% 84%, 40% 100%, 0 72%)",
  },
];

const TERRAIN_MASSES = [
  {
    id: "coast-band",
    className:
      "left-[-2%] top-[14%] h-[84%] w-[22%] bg-gradient-to-r from-slate-600/45 via-slate-700/20 to-transparent blur-[1px]",
    clipPath: "polygon(0 0, 88% 6%, 100% 48%, 82% 94%, 0 100%)",
  },
  {
    id: "forest-belt",
    className:
      "left-[12%] top-[4%] h-[46%] w-[48%] bg-gradient-to-br from-emerald-900/50 via-emerald-950/25 to-transparent blur-[2px]",
    clipPath: "polygon(0 24%, 44% 0, 100% 22%, 92% 100%, 8% 90%)",
  },
  {
    id: "plains-heart",
    className:
      "left-[28%] top-[30%] h-[38%] w-[44%] bg-gradient-to-b from-amber-900/42 via-amber-950/18 to-transparent blur-[1px]",
    clipPath: "polygon(6% 0, 94% 10%, 100% 86%, 44% 100%, 0 68%)",
  },
  {
    id: "ridge-line",
    className:
      "left-[54%] top-[2%] h-[48%] w-[42%] bg-gradient-to-bl from-zinc-500/38 via-zinc-800/20 to-transparent blur-[2px]",
    clipPath: "polygon(14% 0, 100% 6%, 94% 100%, 0 78%)",
  },
  {
    id: "basin-floor",
    className:
      "left-[32%] top-[58%] h-[38%] w-[62%] bg-gradient-to-t from-orange-900/42 via-orange-950/18 to-transparent blur-[2px]",
    clipPath: "polygon(0 32%, 40% 0, 100% 14%, 90% 100%, 6% 100%)",
  },
  {
    id: "mist-veil",
    className:
      "inset-[8%] bg-[radial-gradient(ellipse_at_50%_42%,rgba(201,169,98,0.08),transparent_62%)]",
    clipPath: "none",
  },
];

const STARTER_COORDS = new Set(["8,5", "9,5", "10,5", "8,6", "10,6", "11,6"]);

const ATLAS_REGIONS = [
  {
    id: "north-frontier",
    name: "North Frontier",
    className: "left-[12%] top-[6%] h-[32%] w-[50%] border-zinc-300/12 bg-zinc-300/[0.055]",
    clipPath: "polygon(8% 26%, 42% 4%, 88% 18%, 98% 64%, 58% 94%, 14% 76%)",
  },
  {
    id: "crownlands",
    name: "Crownlands",
    className: "left-[58%] top-[10%] h-[34%] w-[34%] border-amber-200/18 bg-amber-300/[0.07]",
    clipPath: "polygon(18% 10%, 78% 4%, 96% 42%, 74% 88%, 26% 96%, 4% 48%)",
  },
  {
    id: "aurelia",
    name: "Aurelia",
    className: "left-[32%] top-[34%] h-[36%] w-[38%] border-amber-400/18 bg-amber-500/[0.06]",
    clipPath: "polygon(14% 18%, 62% 2%, 96% 34%, 76% 82%, 32% 96%, 4% 62%)",
  },
  {
    id: "iron-coast",
    name: "Iron Coast",
    className: "left-[8%] top-[45%] h-[42%] w-[32%] border-slate-300/14 bg-slate-300/[0.055]",
    clipPath: "polygon(10% 4%, 82% 20%, 92% 72%, 48% 98%, 4% 82%, 0 28%)",
  },
  {
    id: "ember-basin",
    name: "Ember Basin",
    className: "left-[42%] top-[66%] h-[27%] w-[44%] border-orange-300/14 bg-orange-300/[0.055]",
    clipPath: "polygon(8% 22%, 46% 2%, 94% 18%, 86% 74%, 44% 98%, 2% 72%)",
  },
];

const ATLAS_LABELS = [
  { id: "north-frontier", name: "North Frontier", left: "31%", top: "20%" },
  { id: "crownlands", name: "Crownlands", left: "76%", top: "27%" },
  { id: "aurelia", name: "Aurelia", left: "51%", top: "51%" },
  { id: "iron-coast", name: "Iron Coast", left: "22%", top: "70%" },
  { id: "ember-basin", name: "Ember Basin", left: "63%", top: "80%" },
];

const ATLAS_LAND_MARKS = Array.from({ length: 260 }, (_, index) => {
  const left = 4 + ((index * 37) % 92);
  const top = 5 + ((index * 53) % 88);
  const emphasis = (index * 11) % 17 === 0;
  const dimmed = (index * 7) % 9 === 0;

  return {
    id: `atlas-land-${index}`,
    left: `${left}%`,
    top: `${top}%`,
    opacity: emphasis ? 0.75 : dimmed ? 0.18 : 0.36,
    size: emphasis ? 3 : 2,
  };
});

function getRegion(x: number, y: number): Region {
  if (x >= 13 && y <= 4) return "Crownlands";
  if (y <= 2 || (x <= 6 && y <= 4)) return "North Frontier";
  if (x <= 3 && y >= 3) return "Iron Coast";
  if (y >= 9 || (x >= 9 && y >= 7)) return "Ember Basin";
  return "Aurelia";
}

function getTerrain(x: number, y: number, region: Region): Terrain {
  if ((x === 7 && y === 5) || (x === 11 && y === 8) || (x === 14 && y === 4)) return "ruins";
  if (x <= 1 || (region === "Iron Coast" && x <= 3)) return "coast";
  if (y === 0 || x === GRID_WIDTH - 1) return "coast";
  if (region === "Crownlands") return x >= 15 && y <= 3 ? "crownland" : "mountain";
  if (region === "North Frontier") return y <= 1 || x + y < 7 ? "mountain" : "forest";
  if (region === "Iron Coast") return y >= 8 ? "coast" : "forest";
  if (region === "Ember Basin") return y >= 10 || x >= 12 ? "basin" : "plains";
  if ((x >= 5 && x <= 8 && y >= 3 && y <= 6) || (x >= 9 && x <= 11 && y === 4)) return "forest";
  return "plains";
}

function toTerrainLabel(terrain: Terrain) {
  return terrain.charAt(0).toUpperCase() + terrain.slice(1);
}

function getLandName(region: Region, terrain: Terrain) {
  const suffix: Record<Terrain, string> = {
    plains: "Field",
    forest: "Grove",
    mountain: "Ridge",
    coast: "Shore",
    basin: "Basin",
    crownland: "Court",
    ruins: "Ruins",
  };
  const regionBase = region === "North Frontier" ? "Frontier" : region.replace(" ", "");
  return `${regionBase} ${suffix[terrain]}`;
}

function getCinematicLine(region: Region, terrain: Terrain) {
  if (terrain === "forest") return "A quiet forest clearing where the first banner could rise.";
  if (terrain === "mountain") return "A hard ridge overlooking the roads of future kingdoms.";
  if (terrain === "coast") return "A cold shore where trade could one day reach the world.";
  if (terrain === "basin") return "A sheltered basin waiting for walls, fields and memory.";
  if (terrain === "crownland") return "Prestige land close to the old seats of power.";
  if (terrain === "ruins") return "Broken stone and buried records mark this forgotten ground.";
  if (region === "Aurelia") return "Open land at the heart of the first age.";
  return "Unwritten ground on the edge of a rising world.";
}

function getContextLine(region: Region, terrain: Terrain, starter: boolean) {
  if (starter) return "A strong first settlement site near the first trade road.";
  if (terrain === "coast") return "A future port position on the edge of continental routes.";
  if (terrain === "mountain") return "A defensive holdfast above contested frontier passes.";
  if (terrain === "crownland") return "A prestige claim near the old political center.";
  if (terrain === "basin") return "A resource pocket likely to matter when borders expand.";
  if (terrain === "ruins") return "A risky claim with relic value and future conflict potential.";
  if (region === "Aurelia") return "Central ground with clean expansion paths into nearby regions.";
  return "Frontier land with room to grow into a regional power.";
}

function getFounderMeaning(starter: boolean, terrain: Terrain, region: Region, claimed: boolean) {
  if (claimed) return "Another founder has already written their name into this ground.";
  if (starter) return "Your banner here becomes the first permanent mark on this land.";
  if (terrain === "ruins") return "A bold founder could turn buried history into future leverage.";
  if (terrain === "crownland") return "Claiming here signals ambition before the world has even formed.";
  if (terrain === "coast") return "Whoever holds this shore may one day shape trade beyond the sector.";
  if (region === "Aurelia") return "This choice sets the tone for everything that follows in Aurelia.";
  return "Every founder begins somewhere. This land could become your first chapter.";
}

function getStrategicValue(terrain: Terrain, starter: boolean, claimed: boolean) {
  if (claimed) return "Already controlled by another founder.";
  if (starter) return "Ideal first settlement land.";
  if (terrain === "mountain") return "Strong defensive position with mineral output.";
  if (terrain === "coast") return "Best for early trade and naval reach.";
  if (terrain === "crownland") return "High prestige territory with political leverage.";
  if (terrain === "ruins") return "High-risk site with relic potential.";
  return "Balanced growth potential for expansion.";
}

function getHistoricalNote(region: Region, terrain: Terrain, claimed: boolean) {
  if (claimed) return "A rival banner already marks this ground.";
  if (terrain === "ruins") return "No city has stood here since the old world fell.";
  if (region === "Aurelia") return "No city has ever stood here.";
  return `No lasting record has been written in ${region}.`;
}

function buildTiles(): MapTile[] {
  return Array.from({ length: GRID_WIDTH * GRID_HEIGHT }, (_, index) => {
    const x = index % GRID_WIDTH;
    const y = Math.floor(index / GRID_WIDTH);
    const region = getRegion(x, y);
    const terrain = getTerrain(x, y, region);
    const coordinates = `X${x + 14} / Y${y + 8}`;
    const landId = `PN-${String(401 + index).padStart(4, "0")}`;
    const claimed = (x * 7 + y * 11) % 23 === 0;
    const starter = !claimed && STARTER_COORDS.has(`${x},${y}`);
    const landmark = terrain === "ruins";
    const resourceRich = terrain === "crownland" || terrain === "coast" || terrain === "basin";

    return {
      id: `world-tile-${index}`,
      landId,
      x,
      y,
      coordinates,
      region,
      terrain,
      resources: TERRAIN_RESOURCES[terrain],
      landName: getLandName(region, terrain),
      cinematicLine: getCinematicLine(region, terrain),
      contextLine: getContextLine(region, terrain, starter),
      founderMeaning: getFounderMeaning(starter, terrain, region, claimed),
      strategicValue: getStrategicValue(terrain, starter, claimed),
      historicalNote: getHistoricalNote(region, terrain, claimed),
      starter,
      landmark,
      resourceRich,
      claimed,
    };
  });
}

function getTileSvgCenter(tile: Pick<MapTile, "x" | "y">) {
  return {
    x: ((tile.x + 0.5) / GRID_WIDTH) * 760,
    y: ((tile.y + 0.5) / GRID_HEIGHT) * 484,
  };
}

function getTileCssCenter(tile: Pick<MapTile, "x" | "y">) {
  return {
    left: `${((tile.x + 0.5) / GRID_WIDTH) * 100}%`,
    top: `${((tile.y + 0.5) / GRID_HEIGHT) * 100}%`,
  };
}

function getOffsetTileCssCenter(tile: Pick<MapTile, "x" | "y">, dx: number, dy: number) {
  return getTileCssCenter({
    x: Math.min(GRID_WIDTH - 1, Math.max(0, tile.x + dx)),
    y: Math.min(GRID_HEIGHT - 1, Math.max(0, tile.y + dy)),
  });
}

function getOnMapMenuTransform(tile: Pick<MapTile, "x" | "y">) {
  if (tile.y <= 2) return "translate(-50%, 2.25rem)";
  if (tile.x >= GRID_WIDTH - 4) return "translate(calc(-100% - 1.25rem), -50%)";
  if (tile.x <= 3) return "translate(1.25rem, -50%)";
  return "translate(-50%, calc(-100% - 1.75rem))";
}

function getLivingMapRouteTarget(routeId?: string, destination?: string) {
  const normalizedRoute = (routeId || "").toLowerCase();
  const normalizedDestination = (destination || "").toLowerCase();

  return (
    LIVING_MAP_ROUTE_TARGETS.find(
      (target) => normalizedRoute === target.id || normalizedDestination === target.name.toLowerCase(),
    ) ?? null
  );
}

function toGameLand(tile: MapTile): GameLand {
  return {
    id: tile.id,
    pnId: tile.landId,
    name: tile.landName,
    coordinates: tile.coordinates,
    region: tile.region,
    terrain: toTerrainLabel(tile.terrain),
    resources: tile.resources,
  };
}

function buildLivingMapRoutePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const controlX = (from.x + to.x) / 2;
  const controlY = Math.min(from.y, to.y) - 72;
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${controlX.toFixed(1)} ${controlY.toFixed(1)}, ${controlX.toFixed(1)} ${((controlY + to.y) / 2).toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

function buildScoutPatrolPath(from: { x: number; y: number }) {
  const scoutX = Math.min(720, from.x + 96);
  const scoutY = Math.max(54, from.y - 62);
  const returnX = Math.max(40, from.x - 74);
  const returnY = Math.min(444, from.y + 54);
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${scoutX.toFixed(1)} ${scoutY.toFixed(1)}, ${scoutX.toFixed(1)} ${returnY.toFixed(1)}, ${returnX.toFixed(1)} ${returnY.toFixed(1)} S ${from.x.toFixed(1)} ${scoutY.toFixed(1)}, ${from.x.toFixed(1)} ${from.y.toFixed(1)}`;
}

function getInfluenceRadius(state: SettlementState) {
  if (state.empireFounded) return 88;
  if (state.nationFounded) return 72;
  if (state.settlementFounded) return 54;
  if (state.claimedLand) return 38;
  return 0;
}

function getPlayableInfluenceRadius(state: PlayableState | null) {
  if (!state) return 0;
  return Math.min(88, 38 + state.settlementLevel * 7 + state.tradeLevel * 4 + state.landsSurveyed * 2);
}

function getWorldMarkerStage(playableState: PlayableState | null, demoState: SettlementState) {
  if (!demoState.claimedLand) return "Unclaimed";
  if (!playableState) {
    if (demoState.nationFounded) return "Nation Influence";
    if (demoState.tradeRouteEstablished) return "Trade City";
    if (demoState.townHallBuilt) return "City Core";
    if (demoState.settlementFounded) return "Outpost";
    return "Claimed Land";
  }

  if (playableState.nationProgress >= 100 || demoState.nationFounded) return "Nation Influence";
  if (playableState.tradeLevel > 0 || demoState.tradeRouteEstablished) return "Trade Route";
  if (playableState.settlementLevel >= 3) return "Town Core";
  if (playableState.settlementLevel >= 2 || demoState.townHallBuilt) return "Village Core";
  if (playableState.housingLevel > 0 || demoState.settlementFounded) return "Outpost";
  return "Claimed Land";
}

function getWorldRecentConsequence(playableState: PlayableState | null, fallback: string) {
  const latest = playableState?.log[0];
  if (!latest) return fallback;
  return `${latest.title}: ${latest.body}`;
}

function getWorldOrderLabel(activeOrder?: QueuedPlayableAction) {
  return activeOrder ? activeOrder.label : "No active order";
}

function getWorldActivitySummary(demoState: SettlementState, playableState: PlayableState | null) {
  if (demoState.tradeRouteEstablished) return `Trade route visible: ${demoState.tradeRouteDestination || "Regional route"}`;
  if (playableState && playableState.tradeLevel > 0) return `Trade pressure visible: level ${playableState.tradeLevel}`;
  if (playableState && playableState.landsSurveyed > 0) {
    return `Scout marks visible: ${playableState.landsSurveyed} nearby lands surveyed`;
  }
  if (playableState && playableState.settlementLevel > 1) {
    return `${getSettlementLevelLabel(playableState.settlementLevel)} visible on your claimed land`;
  }
  if (demoState.townHallBuilt) return "City core visible on your claimed land";
  if (demoState.settlementFounded) return "Settlement marker visible on your claimed land";
  if (demoState.claimedLand) return "Claimed land marker visible";
  return "Choose land to wake the map";
}

function getActiveMapLayer(demoState: SettlementState, playableState: PlayableState | null) {
  if (demoState.tradeRouteEstablished) return "Claim + settlement + city core + trade";
  if (playableState && playableState.tradeLevel > 0) return "Claim + core + trade pressure";
  if (playableState && playableState.landsSurveyed > 0) return "Claim + core + surveyed frontier";
  if (playableState && playableState.settlementLevel > 1) return "Claim + upgraded core";
  if (demoState.townHallBuilt) return "Claim + settlement + city core";
  if (demoState.settlementFounded) return "Claim + settlement";
  if (demoState.claimedLand) return "Claim marker";
  return "Selection";
}

function getSettlementGrowthStage(playableState: PlayableState | null, demoState: SettlementState) {
  if (demoState.tradeRouteEstablished || (playableState && playableState.tradeLevel > 0)) return "Trade outpost";
  if (demoState.townHallBuilt || (playableState && playableState.settlementLevel >= 2)) return "Village core";
  if (demoState.settlementFounded || (playableState && playableState.housingLevel > 0)) return "First homes";
  if (demoState.claimedLand) return "Camp stake";
  return "Placement preview";
}

function getVisiblePlacementMarkers(playableState: PlayableState | null) {
  if (!playableState) return WORLD_PLACEMENT_MARKERS.slice(0, 3);

  const housingCount = Math.min(2, playableState.housingLevel);
  const fieldCount = Math.min(2, playableState.fieldsLevel);
  const quarryCount = Math.min(2, playableState.quarryLevel);

  return [
    ...WORLD_PLACEMENT_MARKERS.filter((marker) => marker.kind === "housing").slice(0, housingCount),
    ...WORLD_PLACEMENT_MARKERS.filter((marker) => marker.kind === "field").slice(0, fieldCount),
    ...WORLD_PLACEMENT_MARKERS.filter((marker) => marker.kind === "quarry").slice(0, quarryCount),
  ];
}

function getActivePlacementGhost(activeOrder?: QueuedPlayableAction): PlacementMarker | null {
  if (!activeOrder) return null;
  if (activeOrder.actionId === "build-housing") return WORLD_PLACEMENT_MARKERS[0];
  if (activeOrder.actionId === "improve-fields") return WORLD_PLACEMENT_MARKERS[2];
  if (activeOrder.actionId === "quarry-materials") return WORLD_PLACEMENT_MARKERS[4];
  if (activeOrder.actionId === "upgrade-core") {
    return { id: "core-ghost", kind: "housing", label: "Core Ghost", dx: 0, dy: 0 };
  }
  return null;
}

function getWorldAction(state: SettlementState): WorldAction | null {
  const nextAction = getNextWorldGameAction(state);
  if (nextAction === "settlement") {
    return {
      id: "settlement",
      eyebrow: "Map Action / Settlement",
      headline: "Found first settlement",
      detail: "Turn your claimed land into a living place.",
      cta: "Found Settlement",
      qa: "world-action-found-settlement",
    };
  }

  if (nextAction === "city-core") {
    return {
      id: "city-core",
      eyebrow: "Map Action / City Core",
      headline: "Build city core",
      detail: "Raise the Town Hall on your claimed land.",
      cta: "Build City Core",
      qa: "world-action-build-city-core",
    };
  }

  if (nextAction === "trade") {
    return {
      id: "trade",
      eyebrow: "Map Action / Trade",
      headline: "Establish trade seed",
      detail: "Connect the city core to the first regional route.",
      cta: "Establish Trade Seed",
      qa: "world-action-establish-trade",
    };
  }

  return null;
}

export default function WorldPage() {
  const tiles = useMemo(() => buildTiles(), []);
  const [demoState, setDemoState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);
  const [selectedTileId, setSelectedTileId] = useState<string>(tiles[0].id);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [mobileMapZoom, setMobileMapZoom] = useState(1);
  const [worldActionFeedback, setWorldActionFeedback] = useState("");
  const [playableState, setPlayableState] = useState<PlayableState | null>(null);
  const [playableNow, setPlayableNow] = useState(0);
  const [onMapActionsOpen, setOnMapActionsOpen] = useState(false);

  useEffect(() => {
    const state = readSettlementState();
    let normalizedState = state;

    if (state.claimedLand && !state.claimedLandId) {
      const fallbackTile = tiles.find((tile) => tile.starter && !tile.claimed) ?? tiles[0];
      normalizedState = ensureClaimedLandIdentity(state, toGameLand(fallbackTile));
      writeSettlementState(normalizedState);
    }

    setDemoState(normalizedState);

    if (normalizedState.claimedLandId) {
      const claimedTile = tiles.find((tile) => tile.id === normalizedState.claimedLandId);
      if (claimedTile) {
        setSelectedTileId(claimedTile.id);
        setOnMapActionsOpen(true);
        return;
      }
    }

    const starterTile = tiles.find((tile) => tile.starter && !tile.claimed);
    if (starterTile) setSelectedTileId(starterTile.id);
  }, [tiles]);

  useEffect(() => {
    const current = Date.now();
    const loaded = readPlayableState(current);
    writePlayableState(loaded);
    setPlayableState(loaded);
    setPlayableNow(current);

    const interval = window.setInterval(() => {
      const tickNow = Date.now();
      setPlayableNow(tickNow);
      setPlayableState((currentState) => {
        if (!currentState) return currentState;
        const next = tickPlayableState(currentState, tickNow);
        writePlayableState(next);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const hasProgress = useMemo(
    () =>
      demoState.claimedLand ||
      demoState.settlementFounded ||
      demoState.nationFounded ||
      demoState.empireFounded,
    [demoState],
  );

  const selectedTile =
    tiles.find((tile) => tile.id === selectedTileId) ??
    tiles.find((tile) => tile.starter && !tile.claimed) ??
    tiles[0];
  const selectedTileMapPosition = getTileCssCenter(selectedTile);

  const ownedByYou = demoState.claimedLand && demoState.claimedLandId === selectedTile.id;
  const isUnavailable = selectedTile.claimed && !ownedByYou;
  const status = ownedByYou ? "Owned by You" : selectedTile.claimed ? "Claimed" : "Unclaimed";
  const mobileTrayStatus = ownedByYou
    ? "Your claimed land"
    : isUnavailable
      ? "Already claimed"
      : selectedTile.starter && !selectedTile.claimed
        ? "Unclaimed founder land"
        : "Unclaimed land";
  const demoObjective = useMemo(() => getDemoObjective(demoState), [demoState]);
  const postClaimGuidance = useMemo(() => getPostClaimGuidance(demoState), [demoState]);
  const claimedTile = demoState.claimedLandId
    ? tiles.find((tile) => tile.id === demoState.claimedLandId) ?? null
    : null;
  const claimedTileCenter = claimedTile ? getTileSvgCenter(claimedTile) : null;
  const claimedTileMapPosition = claimedTile ? getTileCssCenter(claimedTile) : null;
  const influenceRadius = getInfluenceRadius(demoState);
  const worldAction = useMemo(() => getWorldAction(demoState), [demoState]);
  const activePlayableOrder = playableState?.queue[0];
  const activeOrderProgress = activePlayableOrder ? getQueueProgress(activePlayableOrder, playableNow) : 0;
  const routeTarget =
    demoState.tradeRouteEstablished || (playableState && playableState.tradeLevel > 0)
      ? getLivingMapRouteTarget(demoState.tradeRouteId || "iron-coast", demoState.tradeRouteDestination || "Iron Coast")
      : null;
  const routePath = claimedTileCenter && routeTarget ? buildLivingMapRoutePath(claimedTileCenter, routeTarget) : "";
  const scoutPatrolPath = claimedTileCenter ? buildScoutPatrolPath(claimedTileCenter) : "";
  const currentPlayableObjective = playableState
    ? getCurrentObjective(playableState)
    : "Claim land to start the local settlement clock.";
  const worldMarkerStage = getWorldMarkerStage(playableState, demoState);
  const settlementGrowthStage = getSettlementGrowthStage(playableState, demoState);
  const playableInfluenceRadius = getPlayableInfluenceRadius(playableState);
  const combinedInfluenceRadius = Math.max(influenceRadius, demoState.claimedLand ? playableInfluenceRadius : 0);
  const recentConsequence = getWorldRecentConsequence(
    playableState,
    worldActionFeedback || "No world consequence yet.",
  );
  const visibleGrowthRingCount = playableState
    ? Math.min(4, Math.max(0, playableState.settlementLevel - 1) + Math.min(2, playableState.housingLevel))
    : 0;
  const visiblePlacementMarkers = getVisiblePlacementMarkers(playableState);
  const activePlacementGhost = getActivePlacementGhost(activePlayableOrder);
  const onMapPlayableActions = WORLD_PLAYABLE_ACTIONS.slice(0, 7);
  const worldActivitySummary = getWorldActivitySummary(demoState, playableState);
  const activeMapLayer = getActiveMapLayer(demoState, playableState);

  const selectedLandPanelRef = useRef<HTMLElement>(null);
  const playableSectorRef = useRef<HTMLElement>(null);
  const [hasUserSelectedTile, setHasUserSelectedTile] = useState(false);
  const [mobileTrayDismissed, setMobileTrayDismissed] = useState(false);
  const [selectedPanelInView, setSelectedPanelInView] = useState(false);
  const [playableSectorInView, setPlayableSectorInView] = useState(false);

  const selectTile = (tileId: string) => {
    setSelectedTileId(tileId);
    setHasUserSelectedTile(true);
    if (demoState.claimedLandId !== tileId) setOnMapActionsOpen(false);
  };

  const fitMobileMap = () => setMobileMapZoom(1);
  const zoomMobileMapIn = () => setMobileMapZoom((current) => Math.min(1.5, current + 0.25));
  const zoomMobileMapOut = () => setMobileMapZoom((current) => Math.max(1, current - 0.25));
  const mobileMapControls = [
    { label: "Fit", action: fitMobileMap },
    { label: "Zoom Out", action: zoomMobileMapOut },
    { label: "Zoom In", action: zoomMobileMapIn },
  ];

  const focusWorldMap = () => {
    if (claimedTile) {
      setSelectedTileId(claimedTile.id);
      setHasUserSelectedTile(true);
      setOnMapActionsOpen(true);
    }

    setWorldActionFeedback(
      demoState.claimedLand
        ? "Progress continues from your claimed land on the world map."
        : "Choose a land in Sector A-01 to begin.",
    );
    playableSectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeClaimModalToMap = () => {
    setIsClaimModalOpen(false);
    window.setTimeout(focusWorldMap, 0);
  };

  useEffect(() => {
    setMobileTrayDismissed(false);
  }, [selectedTileId]);

  useEffect(() => {
    const panel = selectedLandPanelRef.current;
    const sector = playableSectorRef.current;
    if (!panel || !sector) return;

    const panelObserver = new IntersectionObserver(
      ([entry]) => setSelectedPanelInView(entry.isIntersecting),
      { threshold: 0.12, rootMargin: "0px 0px -72px 0px" },
    );
    const sectorObserver = new IntersectionObserver(
      ([entry]) => setPlayableSectorInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "0px 0px -80px 0px" },
    );

    panelObserver.observe(panel);
    sectorObserver.observe(sector);

    return () => {
      panelObserver.disconnect();
      sectorObserver.disconnect();
    };
  }, []);

  const showMobileClaimTray =
    hasUserSelectedTile &&
    playableSectorInView &&
    !mobileTrayDismissed &&
    !selectedPanelInView &&
    !isClaimModalOpen;

  const openClaimModal = () => {
    setClaimSuccess(false);
    setIsClaimModalOpen(true);
  };

  const claimLand = () => {
    const nextState = claimGameLand(demoState, toGameLand(selectedTile));

    writeSettlementState(nextState);
    setDemoState(nextState);
    setOnMapActionsOpen(true);
    setClaimSuccess(true);
    setWorldActionFeedback("Land claimed. Settlement action ready.");
  };

  const runWorldAction = () => {
    if (!worldAction || !demoState.claimedLand) return;

    const result =
      worldAction.id === "settlement"
        ? foundSettlementFromWorld(demoState)
        : worldAction.id === "city-core"
          ? buildCityCoreFromWorld(demoState)
          : establishTradeSeedFromWorld(demoState);

    writeSettlementState(result.state);
    setDemoState(result.state);
    setWorldActionFeedback(result.feedback);
  };

  const queueWorldPlayableAction = (action: PlayableActionDefinition) => {
    const actionNow = Date.now();
    setPlayableNow(actionNow);
    setPlayableState((currentState) => {
      const next = queuePlayableAction(currentState ?? readPlayableState(actionNow), action.id, actionNow);
      writePlayableState(next);
      setWorldActionFeedback(`${action.label} queued from the world map.`);
      return next;
    });
  };

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-[#020204] px-0 py-0 pb-28 text-white sm:px-5 sm:py-5 lg:min-h-screen lg:px-6 lg:py-6 lg:pb-10">
      <div className="mx-auto flex max-w-[1800px] flex-col">
        <header className="order-2 mx-3 mt-6 border border-amber-500/12 bg-[#050509]/80 p-4 sm:mx-0 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-600/75">World Map</p>
          <h1 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl md:text-5xl">
            Sector A-01 is live.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Claim land, grow the marker, and launch orders from the first playable window into the 10,000-land world.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.26em] text-amber-500/75">
            Full world: 10,000 lands. Playable frontier: Aurelian Basin.
          </p>
          {hasProgress ? (
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-amber-300/80">
              Demo progress found. Continue your rise.
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="btn-secondary w-full rounded border border-zinc-800 bg-[#08080f]/80 px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 sm:w-auto"
            >
              Back To Landing
            </Link>
            {hasProgress ? (
              <button
                type="button"
                onClick={focusWorldMap}
                className="btn-primary w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100 sm:w-auto"
              >
                Continue On Map
              </button>
            ) : null}
          </div>
        </header>

        <section
          data-qa="first-60-guidance"
          className="order-3 mx-3 mt-6 grid gap-3 border border-amber-500/15 bg-amber-500/[0.035] p-4 text-sm text-zinc-400 sm:mx-0 sm:grid-cols-3 sm:p-5"
        >
          {demoState.claimedLand ? (
            <>
              <div className="border-l border-amber-500/25 pl-4 sm:col-span-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">
                  Demo Spine Active
                </p>
                <p className="mt-2 font-[family-name:var(--font-syne)] text-base font-bold text-amber-100">
                  {postClaimGuidance.headline}
                </p>
                <p className="mt-1 leading-6">{postClaimGuidance.description}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {postClaimGuidance.spineLine}
                </p>
              </div>
              {[
                ["Land", demoState.claimedLandName || "Claimed", "complete"],
                ["Settlement", demoState.settlementFounded ? demoState.settlementName || "Founded" : "Next", demoState.settlementFounded ? "complete" : "current"],
                ["Empire", demoState.empireFounded ? demoState.empireName || "Founded" : "Future promise", demoState.empireFounded ? "complete" : "upcoming"],
              ].map(([label, value, tone]) => (
                <div key={label} className="border-l border-amber-500/25 pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">{label}</p>
                  <p
                    className={`mt-2 font-[family-name:var(--font-syne)] text-base font-bold ${
                      tone === "complete" ? "text-emerald-100" : tone === "current" ? "text-amber-100" : "text-zinc-500"
                    }`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </>
          ) : (
            [
              ["1", "Select land", "Click an available cell in Sector A-01."],
              ["2", "Claim it", "Confirm the demo claim to mark your founder record."],
              ["3", "Build upward", "Use on-map actions from your claimed land."],
            ].map(([step, title, copy]) => (
              <div key={title} className="border-l border-amber-500/25 pl-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">
                  Step {step}
                </p>
                <p className="mt-2 font-[family-name:var(--font-syne)] text-base font-bold text-amber-100">
                  {title}
                </p>
                <p className="mt-1 leading-6">{copy}</p>
              </div>
            ))
          )}
        </section>

        <section
          id="world-atlas"
          data-qa="world-atlas"
          className="order-4 mx-3 mt-6 overflow-hidden border border-amber-500/15 bg-[#050509]/90 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.5)] sm:mx-0 sm:mt-8 sm:p-6"
        >
          <div className="mb-5 grid gap-5 border-b border-amber-500/10 pb-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
                World Atlas
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
                The full world beyond A-01.
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                The atlas holds 10,000 lands across a 100 x 100 world. Sector A-01 is the playable window above.
              </p>
              <a
                href="#playable-sector"
                className="mt-4 inline-flex rounded border border-amber-500/35 bg-amber-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100 transition-colors hover:border-amber-300/60"
              >
                Return To Sector A-01
              </a>
            </div>
            <div className="grid grid-cols-1 gap-px border border-amber-500/10 bg-amber-500/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:grid-cols-3">
              <div className="bg-[#08080f]/95 p-3">
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">10,000</p>
                <p className="mt-1">finite lands</p>
              </div>
              <div className="bg-[#08080f]/95 p-3">
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">100 x 100</p>
                <p className="mt-1">world grid</p>
              </div>
              <div className="bg-[#08080f]/95 p-3">
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">A-01</p>
                <p className="mt-1">sector code</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-amber-500/20 bg-[#030306] p-2 shadow-[inset_0_0_90px_rgba(0,0,0,0.72)] sm:p-4">
            <div
              aria-hidden
              className="absolute inset-3 hidden opacity-[0.26] [background-image:linear-gradient(rgba(201,169,98,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.5)_1px,transparent_1px)] [background-size:1%_1%]"
            />
            <div
              aria-hidden
              className="absolute inset-3 hidden opacity-[0.18] [background-image:linear-gradient(rgba(201,169,98,0.75)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.75)_1px,transparent_1px)] [background-size:10%_10%]"
            />
            <div
              aria-hidden
              className="absolute inset-3 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(2,2,4,0.78)_100%)]"
            />
            <div className="relative aspect-[4/3] overflow-hidden bg-[#030306] sm:aspect-[16/9] sm:min-h-[420px] lg:min-h-[560px]">
              <img
                src="/assets/world-map/aurelian-basin-v1.png"
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-contain object-center opacity-95 sm:object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,2,4,0.10),rgba(2,2,4,0.46))]" />
              {false && ATLAS_REGIONS.map((region) => (
                <div
                  key={region.id}
                  className={`absolute border ${region.className}`}
                  style={{ clipPath: region.clipPath }}
                />
              ))}

              {false && ATLAS_LAND_MARKS.map((mark) => (
                <span
                  key={mark.id}
                  className="pointer-events-none absolute rounded-[1px] bg-amber-100/70 shadow-[0_0_8px_rgba(251,191,36,0.18)]"
                  style={{
                    left: mark.left,
                    top: mark.top,
                    height: `${mark.size}px`,
                    width: `${mark.size}px`,
                    opacity: mark.opacity,
                  }}
                />
              ))}

              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
                viewBox="0 0 1000 562"
                preserveAspectRatio="none"
              >
                <path
                  d="M 132 352 C 278 278 396 322 512 238 S 732 126 876 152"
                  fill="none"
                  stroke="rgba(201,169,98,0.2)"
                  strokeDasharray="8 10"
                  strokeWidth="3"
                />
                <path
                  d="M 196 122 C 320 176 394 224 508 312 S 660 420 838 390"
                  fill="none"
                  stroke="rgba(201,169,98,0.16)"
                  strokeDasharray="4 9"
                  strokeWidth="2"
                />
                <path
                  d="M 546 44 C 496 148 532 230 482 324 S 422 432 486 520"
                  fill="none"
                  stroke="rgba(148,163,184,0.22)"
                  strokeWidth="3"
                />
                <path
                  d="M 716 84 C 648 162 636 238 696 318 S 734 428 680 520"
                  fill="none"
                  stroke="rgba(148,163,184,0.16)"
                  strokeWidth="2"
                />
              </svg>

              {ATLAS_LABELS.map((label) => (
                <span
                  key={label.id}
                  className="pointer-events-none absolute hidden -translate-x-1/2 -translate-y-1/2 border border-amber-500/15 bg-[#030306]/75 px-2 py-1 font-[family-name:var(--font-syne)] text-[9px] font-bold uppercase tracking-[0.22em] text-amber-100/70 backdrop-blur-sm sm:block sm:text-[10px]"
                  style={{ left: label.left, top: label.top }}
                >
                  {label.name}
                </span>
              ))}

              <div className="absolute left-[43%] top-[42%] h-[28%] w-[28%] border border-amber-200/90 bg-amber-300/[0.04] shadow-[0_0_46px_rgba(251,191,36,0.26),inset_0_0_22px_rgba(251,191,36,0.1)]">
                <span className="absolute left-1 top-1 border border-amber-500/30 bg-[#030306]/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-amber-200/85 sm:hidden">
                  A-01
                </span>
                <span className="absolute -top-8 left-0 hidden whitespace-nowrap border border-amber-500/30 bg-[#030306]/90 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-amber-200/85 sm:block">
                  Aurelian Basin / A-01
                </span>
                <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.85)]" />
              </div>

              <div className="absolute inset-x-3 bottom-3 hidden border border-amber-500/15 bg-[#030306]/80 p-3 backdrop-blur-sm sm:left-3 sm:right-auto sm:block sm:max-w-xs">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">
                  Demo Origin
                </p>
                <p className="mt-2 whitespace-normal break-words text-xs leading-6 text-zinc-400">
                  The glowing square shows where Sector A-01 sits inside the full world.
                </p>
              </div>
            </div>
            <div className="mt-2 border border-amber-500/15 bg-[#030306]/86 p-3 sm:hidden">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">
                Demo Origin
              </p>
              <p className="mt-2 text-xs leading-6 text-zinc-400">
                The glowing square is context only. Your game screen is the Sector A-01 grid above.
              </p>
            </div>
          </div>
        </section>

        <section className="order-1 grid min-h-[100svh] gap-0 lg:min-h-[calc(100vh-3rem)] lg:gap-4">
          <article
            ref={playableSectorRef}
            id="playable-sector"
            data-qa="playable-sector"
            className="relative flex h-[100svh] min-h-[100svh] flex-col overflow-hidden border-b border-amber-500/18 bg-[#050509]/90 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-[0_30px_120px_rgba(0,0,0,0.68)] sm:h-auto sm:min-h-0 sm:border sm:p-4 lg:block lg:min-h-[calc(100vh-3rem)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(201,169,98,0.1),transparent_34%),radial-gradient(ellipse_at_88%_76%,rgba(201,169,98,0.05),transparent_40%)]"
            />
            <div className="relative flex min-h-0 flex-1 flex-col lg:block">
              <div className="shrink-0 border border-amber-500/12 bg-[#030306]/78 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.38)] backdrop-blur-md sm:flex sm:flex-col sm:justify-between sm:gap-3 sm:border-b sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0 lg:hidden">
                <div className="max-w-xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-amber-600/80 sm:text-[10px] sm:tracking-[0.28em]">
                    Sector A-01 is live / App Shell
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-syne)] text-xl font-extrabold tracking-tight text-amber-100 sm:mt-2 sm:text-2xl">
                    Aurelian Basin
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-400 sm:mt-3 sm:text-sm sm:leading-7">
                    216 visible lands. Pick a cell, then act from the map.
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[9px] uppercase tracking-[0.16em] text-zinc-500 sm:flex sm:flex-wrap sm:gap-2 sm:text-[10px] sm:tracking-[0.2em]">
                  <span className="border border-amber-500/15 bg-[#08080f]/80 px-2.5 py-1.5 text-amber-100/80">
                    216 visible lands
                  </span>
                  <span className="border border-amber-500/15 bg-[#08080f]/80 px-2.5 py-1.5">
                    10,000 total world lands
                  </span>
                  <span className="border border-amber-500/15 bg-[#08080f]/80 px-2.5 py-1.5">
                    Sector code: A-01
                  </span>
                  <span className="border border-amber-500/15 bg-[#08080f]/80 px-2.5 py-1.5">
                    Claim one land
                  </span>
                </div>
              </div>

              <div
                data-qa="sector-orientation-note"
                className="mt-2 shrink-0 border border-amber-500/12 bg-[#08080f]/78 p-2 text-xs leading-5 text-zinc-500 sm:mt-5 sm:p-3 sm:text-sm sm:leading-7 lg:hidden"
              >
                <span className="font-[family-name:var(--font-syne)] text-xs font-bold uppercase tracking-[0.24em] text-amber-100/80">
                  Touch Map
                </span>
                <p className="mt-1 sm:mt-2">
                  Tap a visible cell. The bottom tray keeps claim and map actions within thumb reach.
                </p>
              </div>

              {demoState.claimedLand ? (
                <div
                  data-qa="world-activity-panel"
                  className="mt-2 max-h-[30svh] shrink-0 overflow-y-auto border border-amber-500/12 bg-[#08080f]/78 p-3 sm:mt-5 sm:max-h-none lg:hidden"
                >
                  <div
                    data-qa="world-playable-hud"
                    className="grid gap-3 border border-amber-500/12 bg-[#030306]/70 p-3"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/75">
                          World HUD / Local Clock
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-100/90">{currentPlayableObjective}</p>
                      </div>
                      <div className="shrink-0 border border-amber-500/15 bg-amber-500/[0.06] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                        <span className="block text-amber-100/80">Marker Stage</span>
                        <span className="mt-1 block normal-case tracking-normal">{worldMarkerStage}</span>
                      </div>
                    </div>
                    <div className="grid gap-px border border-amber-500/10 bg-amber-500/10 sm:grid-cols-3 lg:grid-cols-6">
                      <div className="bg-[#08080f]/95 p-3">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Population</p>
                        <p className="mt-2 font-[family-name:var(--font-syne)] text-xl font-extrabold text-amber-100">
                          {playableState?.population ?? "-"}
                        </p>
                      </div>
                      {WORLD_RESOURCE_LABELS.map((resource) => (
                        <div key={resource.key} className="bg-[#08080f]/95 p-3">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">{resource.label}</p>
                          <p className="mt-2 font-[family-name:var(--font-syne)] text-xl font-extrabold text-amber-100">
                            {playableState?.resources[resource.key] ?? "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div data-qa="world-active-order" className="border border-amber-500/10 bg-[#08080f]/82 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/75">
                            Active Order
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                            {activePlayableOrder ? formatDuration(activePlayableOrder.endsAt - playableNow) : "Idle"}
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-amber-100/90">
                          {getWorldOrderLabel(activePlayableOrder)}
                        </p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-950">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-800 to-amber-300 transition-[width]"
                            style={{ width: `${activePlayableOrder ? getQueueProgress(activePlayableOrder, playableNow) : 0}%` }}
                          />
                        </div>
                        {playableState && playableState.queue.length > 1 ? (
                          <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                            {playableState.queue.length - 1} more queued
                          </p>
                        ) : null}
                      </div>
                      <div data-qa="world-recent-consequence" className="border border-amber-500/10 bg-[#08080f]/82 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/75">
                          Recent Consequence
                        </p>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{recentConsequence}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:grid-cols-3">
                    <div>
                      <span className="block text-amber-100/80">World Activity</span>
                      <span className="mt-1 block normal-case tracking-normal text-zinc-400">{worldActivitySummary}</span>
                    </div>
                    <div>
                      <span className="block text-amber-100/80">Your Land</span>
                      <span className="mt-1 block normal-case tracking-normal text-zinc-400">
                        {claimedTile?.landName || demoState.claimedLandName || "Claimed land"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-amber-100/80">Map Layer</span>
                      <span className="mt-1 block normal-case tracking-normal text-zinc-400">{activeMapLayer}</span>
                    </div>
                  </div>
                  <div
                    data-qa="world-action-layer"
                    className="mt-4 flex flex-col gap-3 border-t border-amber-500/10 pt-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/75">
                        {worldAction ? worldAction.eyebrow : "Next Objective"}
                      </p>
                      <p className="mt-1 normal-case tracking-normal text-sm text-amber-100/90">
                        {worldAction ? worldAction.headline : demoObjective.action.headline}
                      </p>
                      <p className="mt-1 text-xs normal-case tracking-normal text-zinc-500">
                        {worldAction ? worldAction.detail : demoObjective.action.description}
                      </p>
                      {worldActionFeedback ? (
                        <p
                          data-qa="world-action-feedback"
                          className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/80"
                        >
                          {worldActionFeedback}
                        </p>
                      ) : null}
                    </div>
                    {worldAction ? (
                      <button
                        type="button"
                        data-qa={worldAction.qa}
                        onClick={runWorldAction}
                        className="btn-primary shrink-0 rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100"
                      >
                        {worldAction.cta}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        data-qa="world-action-map-message"
                        className="shrink-0 cursor-not-allowed rounded border border-zinc-800 bg-zinc-950/70 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600"
                        title={`${demoObjective.action.headline}: ${demoObjective.action.description}`}
                      >
                        Map Layer Pending
                      </button>
                    )}
                  </div>
                  <div
                    data-qa="world-map-action-list"
                    className="mt-4 grid gap-3 border-t border-amber-500/10 pt-4 md:grid-cols-2 xl:grid-cols-5"
                  >
                    {WORLD_PLAYABLE_ACTIONS.map((action) => {
                      const currentPlayableState = playableState;
                      const enabled = currentPlayableState
                        ? canQueuePlayableAction(currentPlayableState, action.id)
                        : false;
                      return (
                        <article key={action.id} className="border border-zinc-800 bg-[#030306]/72 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                                {action.label}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-zinc-500">{action.produces}</p>
                            </div>
                            <span className="shrink-0 text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                              {action.durationSeconds}s
                            </span>
                          </div>
                          <button
                            type="button"
                            data-qa={`world-playable-action-${action.id}`}
                            disabled={!enabled}
                            onClick={() => queueWorldPlayableAction(action)}
                            className={
                              enabled
                                ? "btn-primary mt-3 w-full rounded border border-amber-500/45 bg-gradient-to-b from-amber-400/20 to-amber-800/12 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-100"
                                : "mt-3 w-full cursor-not-allowed rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600"
                            }
                          >
                            {enabled ? "Queue On Map" : "Needs Resources"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-2 flex shrink-0 flex-wrap items-center justify-between gap-2 border border-amber-500/10 bg-[#08080f]/70 p-2 sm:hidden">
                <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                  Map pane only: drag inside to inspect cells.
                </p>
                <div className="flex gap-1.5">
                  {mobileMapControls.map(({ label, action }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={action}
                      className="rounded border border-amber-500/18 bg-[#030306]/80 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-100/75"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 min-h-0 flex-1 overflow-auto overscroll-contain pb-2 sm:mt-4 lg:mt-0 lg:min-h-0">
                <div
                  className="world-sector-canvas relative min-h-[58svh] w-full min-w-[620px] overflow-hidden border border-amber-500/25 bg-cover bg-center bg-no-repeat p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_0_90px_rgba(0,0,0,0.68)] transition-[width] duration-200 sm:min-h-[620px] sm:min-w-[680px] sm:p-3 lg:min-h-[calc(100vh-5rem)] lg:min-w-[980px]"
                  style={{
                    width: `${Math.round(mobileMapZoom * 100)}%`,
                    backgroundImage:
                      "linear-gradient(180deg, rgba(2,2,4,0.08), rgba(2,2,4,0.42)), url('/assets/world-map/aurelian-basin-v1.png')",
                  }}
                >
                  <div aria-hidden className="world-sector-noise pointer-events-none absolute inset-0 z-[1]" />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(2,2,4,0.72)_100%)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-2 z-[3] border border-amber-500/10 shadow-[inset_0_0_22px_rgba(201,169,98,0.05)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-3 z-[24] h-5 w-5 border-l border-t border-amber-200/35"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute right-3 top-3 z-[24] h-5 w-5 border-r border-t border-amber-200/35"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-3 left-3 z-[24] h-5 w-5 border-b border-l border-amber-200/35"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute bottom-3 right-3 z-[24] h-5 w-5 border-b border-r border-amber-200/35"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-3 z-[4] bg-[radial-gradient(ellipse_at_52%_48%,rgba(201,169,98,0.12),transparent_58%)]"
                  />
                  {false && TERRAIN_MASSES.map((mass) => (
                    <div
                      key={mass.id}
                      aria-hidden
                      className={`pointer-events-none absolute z-[5] ${mass.className}`}
                      style={{ clipPath: mass.clipPath }}
                    />
                  ))}
                  {false && SECTOR_REGION_ZONES.map((zone) => (
                    <div
                      key={zone.id}
                      aria-hidden
                      className={`pointer-events-none absolute z-[7] border ${zone.className}`}
                      style={{ clipPath: zone.clipPath }}
                    />
                  ))}
                  <div
                    data-qa="world-map-top-hud"
                    className="pointer-events-none absolute left-5 right-5 top-5 z-[29] hidden grid-cols-[minmax(0,1fr)_auto] gap-3 lg:grid"
                  >
                    <div className="border border-amber-500/18 bg-[#030306]/78 p-3 shadow-[0_16px_54px_rgba(0,0,0,0.42)] backdrop-blur-md">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/75">
                            Sector A-01 is live / 216 visible lands
                          </p>
                          <p className="mt-1 font-[family-name:var(--font-syne)] text-xl font-extrabold tracking-tight text-amber-100">
                            Aurelian Basin
                          </p>
                        </div>
                        <div className="border border-amber-500/15 bg-amber-500/[0.06] px-3 py-2 text-right text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                          <span className="block text-amber-100/80">Full world</span>
                          <span className="mt-1 block">10,000 lands</span>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-amber-500/10 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/75">
                          Objective / {worldMarkerStage}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-amber-100/90">
                          {currentPlayableObjective}
                        </p>
                        <div className="mt-3 grid gap-px border border-amber-500/10 bg-amber-500/10 text-[9px] uppercase tracking-[0.16em] text-zinc-500 sm:grid-cols-6">
                          <div className="bg-[#08080f]/95 p-2">
                            <span className="block">Pop</span>
                            <span className="mt-1 block font-[family-name:var(--font-syne)] text-base font-bold text-amber-100">
                              {playableState?.population ?? "-"}
                            </span>
                          </div>
                          {WORLD_RESOURCE_LABELS.map((resource) => (
                            <div key={resource.key} className="bg-[#08080f]/95 p-2">
                              <span className="block">{resource.label}</span>
                              <span className="mt-1 block font-[family-name:var(--font-syne)] text-base font-bold text-amber-100">
                                {playableState?.resources[resource.key] ?? "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div
                      data-qa="world-map-active-order"
                      className="w-80 border border-amber-500/18 bg-[#030306]/78 p-3 shadow-[0_16px_54px_rgba(0,0,0,0.42)] backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/75">
                            Active Order
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                            {activePlayableOrder ? formatDuration(activePlayableOrder.endsAt - playableNow) : "Idle"}
                          </p>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-amber-100/90">
                          {getWorldOrderLabel(activePlayableOrder)}
                        </p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-950">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-800 to-amber-300 transition-[width]"
                            style={{ width: `${activeOrderProgress}%` }}
                          />
                        </div>
                        <div className="mt-3 border-t border-amber-500/10 pt-3 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                          <span className="block text-amber-100/80">Map Layer</span>
                          <span className="mt-1 block normal-case tracking-normal text-zinc-400">{activeMapLayer}</span>
                        </div>
                        <div className="mt-3 border-t border-amber-500/10 pt-3 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                          <span className="block text-amber-100/80">Growth Stage</span>
                          <span data-qa="world-settlement-growth-stage" className="mt-1 block normal-case tracking-normal text-zinc-400">
                            {settlementGrowthStage}
                          </span>
                        </div>
                      </div>
                    </div>
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute inset-3 z-[8] h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]"
                    viewBox="0 0 760 484"
                    preserveAspectRatio="none"
                  >
                    {MAP_CONTOURS.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(245,222,179,0.12)"
                        strokeWidth="2"
                      />
                    ))}
                    {MAP_FRONTIER_LINES.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(201,169,98,0.18)"
                        strokeDasharray="2 11"
                        strokeLinecap="round"
                        strokeWidth="1.5"
                      />
                    ))}
                    {MAP_RIVERS.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(148,163,184,0.32)"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                      />
                    ))}
                    {MAP_ROUTES.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(201,169,98,0.32)"
                        strokeDasharray="5 7"
                        strokeLinecap="round"
                        strokeWidth="2"
                      />
                    ))}
                    {claimedTileCenter && combinedInfluenceRadius > 0 ? (
                      <g data-qa="world-owned-influence" opacity="0.92">
                        <circle
                          cx={claimedTileCenter.x}
                          cy={claimedTileCenter.y}
                          r={combinedInfluenceRadius}
                          fill="rgba(251,191,36,0.08)"
                          stroke="rgba(251,191,36,0.24)"
                          strokeDasharray="4 8"
                          strokeWidth="1.5"
                        />
                        <circle
                          className="animate-pulse"
                          cx={claimedTileCenter.x}
                          cy={claimedTileCenter.y}
                          r={Math.max(12, combinedInfluenceRadius * 0.42)}
                          fill="rgba(251,191,36,0.14)"
                        />
                        {playableState && playableState.nationProgress > 0 ? (
                          <circle
                            data-qa="world-nation-progress-ring"
                            cx={claimedTileCenter.x}
                            cy={claimedTileCenter.y}
                            r={Math.min(96, 32 + playableState.nationProgress * 0.45)}
                            fill="none"
                            stroke="rgba(253,230,138,0.2)"
                            strokeDasharray="1 9"
                            strokeLinecap="round"
                            strokeWidth="2"
                          />
                        ) : null}
                      </g>
                    ) : null}
                    {routePath && routeTarget ? (
                      <g data-qa="world-trade-route" opacity="0.96">
                        <path
                          d={routePath}
                          fill="none"
                          stroke="rgba(251,191,36,0.72)"
                          strokeDasharray="9 10"
                          strokeLinecap="round"
                          strokeWidth="3"
                        />
                        <path
                          className="animate-pulse"
                          d={routePath}
                          fill="none"
                          stroke="rgba(253,230,138,0.3)"
                          strokeLinecap="round"
                          strokeWidth="7"
                        />
                        <circle cx={routeTarget.x} cy={routeTarget.y} r="7" fill="rgba(253,230,138,0.75)" />
                        <circle data-qa="world-trade-route-motion" r="4.5" fill="rgba(253,230,138,0.92)">
                          <animateMotion dur="5.5s" repeatCount="indefinite" path={routePath} />
                        </circle>
                      </g>
                    ) : null}
                    {claimedTileCenter && scoutPatrolPath ? (
                      <g data-qa="world-scout-route-motion" opacity="0.88">
                        <path
                          d={scoutPatrolPath}
                          fill="none"
                          stroke="rgba(165,243,252,0.28)"
                          strokeDasharray="3 9"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                        <circle r="3.5" fill="rgba(165,243,252,0.9)">
                          <animateMotion dur="6.2s" repeatCount="indefinite" path={scoutPatrolPath} />
                        </circle>
                        <g data-qa="world-first-troop-marker">
                          <animateMotion dur="7.4s" repeatCount="indefinite" path={scoutPatrolPath} />
                          <circle r="6" fill="rgba(251,191,36,0.82)" stroke="rgba(254,243,199,0.72)" strokeWidth="1.5" />
                          <path d="M 0 -8 L 0 -17 L 9 -13 L 0 -10" fill="rgba(253,230,138,0.78)" />
                        </g>
                      </g>
                    ) : null}
                  </svg>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-3 z-[9] opacity-[0.045] [background-image:linear-gradient(rgba(201,169,98,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.55)_1px,transparent_1px)] [background-size:calc(100%/18)_calc(100%/12)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-3 z-[10] border border-amber-500/18"
                  />
                  {REGION_LABELS.map((label) => (
                    <span
                      key={label.id}
                      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 border border-amber-500/14 bg-[#030306]/60 px-2 py-0.5 font-[family-name:var(--font-syne)] text-[8px] font-bold uppercase tracking-[0.2em] text-amber-100/55 backdrop-blur-sm sm:text-[9px]"
                      style={{ left: label.left, top: label.top }}
                    >
                      {label.name}
                    </span>
                  ))}
                  {routeTarget ? (
                    <span
                      data-qa="world-trade-route-label"
                      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 border border-amber-400/24 bg-[#030306]/76 px-2 py-1 font-[family-name:var(--font-syne)] text-[8px] font-bold uppercase tracking-[0.18em] text-amber-100/75 backdrop-blur-sm"
                      style={{ left: routeTarget.labelX, top: routeTarget.labelY }}
                    >
                      Route - {routeTarget.name}
                    </span>
                  ) : null}
                  {!demoState.claimedLand && !isUnavailable ? (
                    <div className="pointer-events-none absolute inset-3 z-[21]" aria-hidden>
                      <span
                        data-qa="world-building-placement-ghost"
                        className="absolute h-11 w-11 -translate-x-1/2 -translate-y-[74%] border border-dashed border-amber-100/58 bg-amber-300/[0.08] shadow-[0_0_24px_rgba(251,191,36,0.26),inset_0_0_14px_rgba(251,191,36,0.12)]"
                        style={selectedTileMapPosition}
                      >
                        <span className="absolute bottom-1.5 left-1/2 h-3 w-6 -translate-x-1/2 border border-amber-100/42 bg-[#130d04]/82" />
                        <span className="absolute bottom-4 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-amber-100/52 bg-amber-200/14" />
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap border border-amber-500/18 bg-[#030306]/78 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.16em] text-amber-100/70">
                          Hall Ghost
                        </span>
                      </span>
                    </div>
                  ) : null}
                  {claimedTileMapPosition ? (
                    <div className="pointer-events-none absolute inset-3 z-[21]" aria-hidden>
                      {playableState && playableState.landsSurveyed > 0 ? (
                        <div data-qa="world-surveyed-land-markers" className="absolute inset-0">
                          {tiles
                            .filter(
                              (tile) =>
                                claimedTile &&
                                Math.abs(tile.x - claimedTile.x) + Math.abs(tile.y - claimedTile.y) <=
                                  Math.min(4, playableState.landsSurveyed + 1) &&
                                tile.id !== claimedTile.id,
                            )
                            .slice(0, playableState.landsSurveyed * 2)
                            .map((tile) => (
                              <span
                                key={tile.id}
                                className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/40 bg-cyan-200/40 shadow-[0_0_10px_rgba(165,243,252,0.24)]"
                                style={getTileCssCenter(tile)}
                              />
                            ))}
                        </div>
                      ) : null}
                      <div data-qa="world-placement-markers" className="absolute inset-0">
                        {visiblePlacementMarkers.map((marker) => (
                          <span
                            key={marker.id}
                            className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 border ${PLACEMENT_KIND_STYLES[marker.kind]}`}
                            style={claimedTile ? getOffsetTileCssCenter(claimedTile, marker.dx, marker.dy) : claimedTileMapPosition}
                          >
                            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/80" />
                            <span className="absolute -bottom-4 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[7px] font-bold uppercase tracking-[0.14em] text-amber-100/60 sm:block">
                              {marker.label}
                            </span>
                          </span>
                        ))}
                      </div>
                      {activePlacementGhost && claimedTile ? (
                        <span
                          data-qa="world-active-placement-ghost"
                          className={`absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-pulse border border-dashed ${PLACEMENT_KIND_STYLES[activePlacementGhost.kind]}`}
                          style={getOffsetTileCssCenter(claimedTile, activePlacementGhost.dx, activePlacementGhost.dy)}
                        >
                          <span className="absolute inset-1 border border-amber-100/24" />
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap border border-amber-500/18 bg-[#030306]/82 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.14em] text-amber-100/72">
                            {activePlacementGhost.label}
                          </span>
                        </span>
                      ) : null}
                      {visibleGrowthRingCount > 0 ? (
                        <div data-qa="world-growth-rings" className="absolute inset-0">
                          {Array.from({ length: visibleGrowthRingCount }, (_, index) => (
                            <span
                              key={index}
                              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/25 bg-emerald-300/[0.03]"
                              style={{
                                ...claimedTileMapPosition,
                                height: `${34 + index * 11}px`,
                                width: `${34 + index * 11}px`,
                              }}
                            />
                          ))}
                        </div>
                      ) : null}
                      <span
                        data-qa="world-settlement-growth-cluster"
                        className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/12 bg-amber-300/[0.025]"
                        style={claimedTileMapPosition}
                      >
                        <span className="absolute -right-2 top-1 h-3 w-3 rounded-sm border border-emerald-200/30 bg-emerald-300/12" />
                        <span className="absolute bottom-1 left-0 h-2.5 w-5 border border-lime-200/24 bg-lime-300/10" />
                        <span className="absolute -top-1 left-2 h-2.5 w-2.5 rotate-45 border border-slate-200/24 bg-slate-300/10" />
                      </span>
                      <span
                        data-qa="world-claimed-land-marker"
                        className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/70 bg-amber-400/18 shadow-[0_0_22px_rgba(251,191,36,0.42),inset_0_0_10px_rgba(251,191,36,0.2)]"
                        style={claimedTileMapPosition}
                      >
                        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100 shadow-[0_0_12px_rgba(253,230,138,0.9)]" />
                      </span>
                      {demoState.settlementFounded ? (
                        <span
                          data-qa="world-settlement-marker"
                          className="absolute h-8 w-8 -translate-x-1/2 -translate-y-[72%] border border-emerald-200/55 bg-emerald-300/12 shadow-[0_0_20px_rgba(110,231,183,0.22),inset_0_0_14px_rgba(110,231,183,0.14)]"
                          style={claimedTileMapPosition}
                        >
                          <span className="absolute bottom-1 left-1/2 h-2.5 w-5 -translate-x-1/2 border border-emerald-100/45 bg-[#07120d]/90" />
                          <span className="absolute bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-emerald-100/55 bg-emerald-200/18" />
                        </span>
                      ) : null}
                      {playableState && playableState.housingLevel > 0 && !demoState.settlementFounded ? (
                        <span
                          data-qa="world-outpost-marker"
                          className="absolute h-7 w-7 -translate-x-1/2 -translate-y-[70%] border border-emerald-200/45 bg-emerald-300/10 shadow-[0_0_18px_rgba(110,231,183,0.18),inset_0_0_12px_rgba(110,231,183,0.1)]"
                          style={claimedTileMapPosition}
                        >
                          <span className="absolute bottom-1 left-1/2 h-2 w-4 -translate-x-1/2 border border-emerald-100/35 bg-[#07120d]/90" />
                          <span className="absolute bottom-2.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-emerald-100/45 bg-emerald-200/14" />
                        </span>
                      ) : null}
                      {demoState.townHallBuilt ? (
                        <span
                          data-qa="world-town-hall-marker"
                          className="absolute h-10 w-10 -translate-x-1/2 -translate-y-[88%] border border-amber-100/70 bg-amber-300/14 shadow-[0_0_28px_rgba(251,191,36,0.34),inset_0_0_16px_rgba(251,191,36,0.16)]"
                          style={claimedTileMapPosition}
                        >
                          <span className="absolute bottom-1.5 left-1/2 h-3 w-5 -translate-x-1/2 border border-amber-100/55 bg-[#130d04]/95" />
                          <span className="absolute bottom-4 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-amber-100/65 bg-amber-200/18" />
                          <span className="absolute left-1/2 top-1 h-2.5 w-px -translate-x-1/2 bg-amber-100/80" />
                        </span>
                      ) : null}
                      {playableState && playableState.settlementLevel >= 2 && !demoState.townHallBuilt ? (
                        <span
                          data-qa="world-playable-core-marker"
                          className="absolute h-9 w-9 -translate-x-1/2 -translate-y-[84%] border border-amber-100/58 bg-amber-300/12 shadow-[0_0_24px_rgba(251,191,36,0.28),inset_0_0_14px_rgba(251,191,36,0.14)]"
                          style={claimedTileMapPosition}
                        >
                          <span className="absolute bottom-1.5 left-1/2 h-2.5 w-5 -translate-x-1/2 border border-amber-100/45 bg-[#130d04]/95" />
                          <span className="absolute bottom-3.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-l border-t border-amber-100/55 bg-amber-200/16" />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  {claimedTileMapPosition && claimedTile ? (
                    <div className="pointer-events-none absolute inset-3 z-[30]">
                      <button
                        type="button"
                        data-qa="world-claimed-land-action-anchor"
                        onClick={() => {
                          setSelectedTileId(claimedTile.id);
                          setHasUserSelectedTile(true);
                          setOnMapActionsOpen((open) => !open);
                        }}
                        className="pointer-events-auto absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/75 bg-[#130d04]/88 p-1 shadow-[0_0_34px_rgba(251,191,36,0.46),inset_0_0_18px_rgba(251,191,36,0.22)] transition-[border-color,box-shadow] hover:border-amber-50 hover:shadow-[0_0_44px_rgba(251,191,36,0.58),inset_0_0_20px_rgba(251,191,36,0.26)]"
                        style={claimedTileMapPosition}
                        aria-label={`Open map actions for ${claimedTile.landName}`}
                        aria-expanded={onMapActionsOpen}
                      >
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(rgba(251,191,36,0.96) ${activeOrderProgress * 3.6}deg, rgba(251,191,36,0.13) 0deg)`,
                          }}
                        />
                        <span className="absolute inset-[5px] rounded-full border border-black/80 bg-[#050509]" />
                        <span className="absolute inset-[9px] rounded-full border border-amber-200/45 bg-amber-400/20" />
                        <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100 shadow-[0_0_14px_rgba(253,230,138,0.95)]" />
                        {playableState && playableState.housingLevel > 0 ? (
                          <>
                            <span className="absolute left-[13px] top-[17px] h-1.5 w-1.5 rounded-sm bg-emerald-200/80 shadow-[0_0_8px_rgba(110,231,183,0.45)]" />
                            <span className="absolute bottom-[15px] right-[13px] h-1.5 w-1.5 rounded-sm bg-emerald-200/80 shadow-[0_0_8px_rgba(110,231,183,0.45)]" />
                          </>
                        ) : null}
                        {playableState && playableState.settlementLevel >= 2 ? (
                          <span className="absolute left-1/2 top-[11px] h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-amber-100/70 bg-amber-200/35" />
                        ) : null}
                        {playableState && playableState.tradeLevel > 0 ? (
                          <span className="absolute bottom-[8px] left-1/2 h-px w-8 -translate-x-1/2 bg-amber-200/80 shadow-[0_0_10px_rgba(251,191,36,0.68)]" />
                        ) : null}
                      </button>

                      {onMapActionsOpen ? (
                        <div
                          data-qa="world-on-map-action-layer"
                          className="pointer-events-auto absolute w-[min(21rem,calc(100vw-3rem))] border border-amber-500/28 bg-[#030306]/92 p-3 text-left shadow-[0_24px_90px_rgba(0,0,0,0.72),0_0_44px_rgba(201,169,98,0.12)] backdrop-blur-md"
                          style={{
                            ...claimedTileMapPosition,
                            transform: getOnMapMenuTransform(claimedTile),
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/75">
                                {worldMarkerStage}
                              </p>
                              <p className="mt-1 font-[family-name:var(--font-syne)] text-lg font-extrabold leading-tight text-amber-100">
                                {claimedTile.landName}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-zinc-400">{worldActivitySummary}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOnMapActionsOpen(false)}
                              className="shrink-0 rounded border border-amber-500/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500 hover:border-amber-400/40 hover:text-amber-100"
                              aria-label="Close on-map actions"
                            >
                              Close
                            </button>
                          </div>

                          <div className="mt-3 border border-amber-500/12 bg-[#08080f]/82 p-2">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-500/75">
                                Active Order
                              </p>
                              <p className="text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                                {activePlayableOrder ? formatDuration(activePlayableOrder.endsAt - playableNow) : "Idle"}
                              </p>
                            </div>
                            <p className="mt-1 text-xs font-semibold text-amber-100/90">
                              {getWorldOrderLabel(activePlayableOrder)}
                            </p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-950">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-800 to-amber-300 transition-[width]"
                                style={{ width: `${activeOrderProgress}%` }}
                              />
                            </div>
                          </div>

                          {worldAction ? (
                            <button
                              type="button"
                              data-qa={`world-on-map-${worldAction.qa}`}
                              onClick={runWorldAction}
                              className="btn-primary mt-3 w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-100"
                            >
                              {worldAction.cta}
                            </button>
                          ) : (
                            <div
                              data-qa="world-on-map-progress-message"
                              className="mt-3 border border-amber-500/15 bg-amber-500/[0.045] p-3"
                            >
                              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-500/75">
                                Map Layer Pending
                              </p>
                              <p className="mt-1 text-xs leading-5 text-zinc-400">
                                {demoObjective.action.headline} remains recorded here until the next political map layer opens.
                              </p>
                            </div>
                          )}

                          <div className="mt-3 grid gap-2">
                            {onMapPlayableActions.map((action) => {
                              const enabled = playableState ? canQueuePlayableAction(playableState, action.id) : false;

                              return (
                                <button
                                  key={action.id}
                                  type="button"
                                  data-qa={`world-on-map-action-${action.id}`}
                                  disabled={!enabled}
                                  onClick={() => queueWorldPlayableAction(action)}
                                  className={
                                    enabled
                                      ? "btn-primary flex items-center justify-between gap-2 rounded border border-amber-500/35 bg-amber-500/[0.08] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100"
                                      : "flex cursor-not-allowed items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600"
                                  }
                                >
                                  <span>{action.label}</span>
                                  <span className="font-normal text-zinc-500">{enabled ? "Queue" : "Needs resources"}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="pointer-events-none absolute inset-3 z-[30]">
                      <div
                        data-qa="world-selected-land-map-card"
                        className="pointer-events-none absolute w-[min(19rem,calc(100vw-3rem))] border border-amber-500/24 bg-[#030306]/90 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.68)] backdrop-blur-md"
                        style={{
                          ...selectedTileMapPosition,
                          transform: getOnMapMenuTransform(selectedTile),
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/75">
                          Selected Land
                        </p>
                        <p className="mt-1 font-[family-name:var(--font-syne)] text-base font-extrabold leading-tight text-amber-100">
                          {selectedTile.landName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                          {selectedTile.landId} / {toTerrainLabel(selectedTile.terrain)}
                        </p>
                        <button
                          type="button"
                          disabled={isUnavailable}
                          onClick={openClaimModal}
                          className={
                            isUnavailable
                              ? "pointer-events-auto mt-3 w-full cursor-not-allowed rounded border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600"
                              : "btn-primary pointer-events-auto mt-3 w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-100"
                          }
                        >
                          {isUnavailable ? "Already Claimed" : "Claim From Map"}
                        </button>
                      </div>
                    </div>
                  )}
                  <div data-qa="sector-claimable-grid" className="relative z-[12] grid grid-cols-[repeat(18,minmax(0,1fr))] gap-px bg-transparent p-px">
                    {tiles.map((tile) => {
                      const tileOwnedByYou = demoState.claimedLandId === tile.id && demoState.claimedLand;
                      const tileClaimed = tile.claimed || tileOwnedByYou;
                      const tileUnavailable = tile.claimed && !tileOwnedByYou;
                      const isSelected = selectedTile.id === tile.id;

                      return (
                        <button
                          key={tile.id}
                          type="button"
                          onClick={() => selectTile(tile.id)}
                          aria-label={`${tile.landId}, ${tile.region}, ${toTerrainLabel(tile.terrain)}`}
                          data-qa={
                            tileOwnedByYou
                              ? "world-owned-land-tile"
                              : tileUnavailable
                                ? "world-claimed-land-tile"
                                : "world-neutral-land-tile"
                          }
                          data-map-state={tileOwnedByYou ? "owned" : tileUnavailable ? "claimed" : "neutral"}
                          data-land-id={tile.landId}
                          className={`relative aspect-square overflow-hidden border border-white/[0.025] transition-[border-color,box-shadow,background-color] duration-200 before:pointer-events-none before:absolute before:inset-0 before:opacity-90 before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.04),transparent_42%)] ${TERRAIN_TILE_SURFACE[tile.terrain]} ${TERRAIN_TINT[tile.terrain]} ${
                            tile.x === 0 || tile.x === GRID_WIDTH - 1 || tile.y === 0 || tile.y === GRID_HEIGHT - 1
                              ? "opacity-[0.72]"
                              : ""
                          } ${
                            isSelected
                              ? "z-[14] border-amber-100/95 shadow-[inset_0_0_18px_rgba(251,191,36,0.28),inset_0_0_0_1px_rgba(251,191,36,0.18),0_0_0_1px_rgba(251,191,36,0.42)]"
                              : "hover:border-amber-300/40 hover:bg-black/15"
                          } ${
                            tileOwnedByYou
                              ? "border-amber-100/90 bg-amber-400/20 shadow-[inset_0_0_20px_rgba(251,191,36,0.28),inset_0_0_0_1px_rgba(253,230,138,0.22),0_0_18px_rgba(251,191,36,0.24)]"
                              : tileUnavailable
                                ? "opacity-[0.42] saturate-[0.48] shadow-[inset_0_0_0_1px_rgba(113,113,122,0.26),inset_0_0_16px_rgba(0,0,0,0.42)]"
                                : ""
                          } ${
                            tile.starter && !tileClaimed
                              ? "shadow-[inset_0_0_12px_rgba(251,191,36,0.14)]"
                              : ""
                          }`}
                        >
                          {tile.starter && !tileClaimed ? (
                            <>
                              <span className="pointer-events-none absolute inset-[2px] border border-amber-300/18" />
                              <span className="pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                            </>
                          ) : null}
                          {!tile.starter && tile.landmark && !tileClaimed ? (
                            <span className="pointer-events-none absolute right-1 top-1 h-1 w-1 rotate-45 bg-orange-200/80 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                          ) : null}
                          {!tile.starter && !tile.landmark && tile.resourceRich && !tileClaimed ? (
                            <span className="pointer-events-none absolute right-1 top-1 h-1 w-1 rounded-full bg-cyan-200/70" />
                          ) : null}
                          {isSelected ? (
                            <span
                              aria-hidden
                              className="pointer-events-none absolute inset-0 bg-amber-300/[0.06] animate-world-tile-selected-glow"
                            />
                          ) : null}
                          {tileOwnedByYou ? (
                            <>
                              <span className="absolute inset-0 flex items-center justify-center bg-amber-500/14 text-[7px] font-bold uppercase tracking-[0.18em] text-amber-100">
                                You
                              </span>
                              <span className="pointer-events-none absolute inset-[3px] border border-amber-100/35" />
                            </>
                          ) : null}
                          {tileUnavailable ? (
                            <span className="pointer-events-none absolute inset-x-1 top-1 h-px bg-zinc-300/35 shadow-[0_3px_0_rgba(212,212,216,0.18)]" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative z-20 mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border border-amber-500/10 bg-[#030306]/82 p-2 text-[8px] uppercase tracking-[0.14em] text-zinc-500 backdrop-blur-sm sm:grid-cols-5 sm:p-3 sm:text-[9px] sm:tracking-[0.18em]">
                    {[
                      ["Founder", "h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"],
                      ["Resources", "h-1 w-1 rounded-full bg-cyan-200/70"],
                      ["Landmark", "h-1 w-1 rotate-45 bg-orange-200/80"],
                      ["Grid", "h-px w-3 bg-amber-400/40"],
                      ["Routes", "h-px w-3 bg-slate-300/60"],
                      ["Ghost", "h-2 w-2 border border-dashed border-amber-100/60 bg-amber-300/10"],
                      ...(demoState.claimedLand
                        ? [
                            ["Owned", "h-2 w-2 rounded-full border border-amber-300/60 bg-amber-300/24"],
                            ["Housing", "h-2 w-2 border border-emerald-200/45 bg-emerald-300/16"],
                            ["Fields", "h-2 w-2 border border-lime-200/40 bg-lime-300/14"],
                            ["Quarry", "h-2 w-2 border border-slate-200/38 bg-slate-300/14"],
                            ["Troop", "h-2 w-2 rounded-full border border-amber-100/70 bg-amber-300/70"],
                          ]
                        : []),
                      ...(demoState.settlementFounded
                        ? [["Settlement", "h-2 w-2 border border-emerald-200/60 bg-emerald-300/20"]]
                        : []),
                      ...(demoState.townHallBuilt
                        ? [["City Core", "h-2 w-2 border border-amber-100/70 bg-amber-200/24"]]
                        : []),
                      ...(demoState.tradeRouteEstablished
                        ? [["Trade", "h-px w-4 bg-amber-300/80"]]
                        : []),
                    ].map(([label, swatch]) => (
                      <div key={label} className="flex min-w-0 items-center gap-1.5">
                        <span className={swatch} />
                        <span className="truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside
            ref={selectedLandPanelRef}
            id="selected-land-panel"
            data-qa="selected-land-panel"
            className="border border-amber-500/15 bg-[#06060c]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-6 lg:sticky lg:top-6 lg:self-start"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Step 1 / Selected Land</p>
            <p className="mt-3 break-words font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100">
              {selectedTile.landName}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-zinc-600">
              {status}
            </p>
            <p className="mt-4 border-l border-amber-500/30 pl-4 text-sm leading-7 text-zinc-400">
              {selectedTile.cinematicLine}
            </p>

            <div className="mt-5 space-y-3 border-t border-amber-500/10 pt-5 text-sm">
              {[
                ["Region", selectedTile.region],
                ["Terrain", toTerrainLabel(selectedTile.terrain)],
                ["Resources", selectedTile.resources.join(", ")],
                ["Strategic Value", selectedTile.strategicValue],
                ["Historical Note", selectedTile.historicalNote],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1.5 border-b border-amber-500/10 pb-3 sm:grid-cols-[110px_1fr]">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{label}</span>
                  <span className="break-words font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-200 sm:text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 border border-amber-500/15 bg-amber-500/[0.04] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">
                Why This Land Matters
              </p>
              <p className="mt-3 text-sm leading-6 text-amber-100/80">{selectedTile.founderMeaning}</p>
              <p className="mt-3 text-xs leading-6 text-zinc-500">{selectedTile.contextLine}</p>
            </div>

            <div
              data-qa="selected-land-next-step"
              className="mt-5 border border-amber-500/15 bg-[#08080f]/80 p-4 text-sm leading-6 text-zinc-400"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">Next Step</p>
              <p className="mt-2">
                {ownedByYou
                  ? postClaimGuidance.description
                  : isUnavailable
                    ? "This parcel is already claimed in the preview. Pick another unclaimed cell in Sector A-01."
                    : "Claim this land, then use on-map actions to begin the settlement spine."}
              </p>
            </div>

            <div className="mt-6">
              {ownedByYou ? (
                <button
                  type="button"
                  onClick={focusWorldMap}
                  className="btn-primary block w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                >
                  Open Map Actions
                </button>
              ) : isUnavailable ? (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded border border-zinc-800 bg-[#08080f]/70 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-500"
                >
                  Already Claimed
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openClaimModal}
                  className="btn-primary w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                >
                  Claim This Land
                </button>
              )}
            </div>
          </aside>
        </section>
      </div>

      {showMobileClaimTray ? (
        <div
          data-qa="mobile-claim-tray"
          className="fixed inset-x-3 bottom-3 z-40 box-border max-w-[calc(100vw-1.5rem)] border border-amber-500/25 bg-[#06060c]/96 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-16px_48px_rgba(0,0,0,0.7),0_0_40px_rgba(201,169,98,0.08)] backdrop-blur-md lg:hidden"
        >
          <div className="mx-auto w-full max-w-lg">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-amber-500/25" aria-hidden />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="break-words font-[family-name:var(--font-syne)] text-sm font-extrabold leading-tight tracking-tight text-amber-100 sm:text-base">
                  {selectedTile.landName}
                </p>
                <p className="mt-1 break-words text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {selectedTile.region} · {toTerrainLabel(selectedTile.terrain)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                  <span className="border border-amber-500/15 bg-amber-500/[0.06] px-2 py-1 text-amber-100/75">
                    {selectedTile.landId}
                  </span>
                  <span className="border border-amber-500/15 bg-[#08080f]/80 px-2 py-1">
                    {mobileTrayStatus}
                  </span>
                  {ownedByYou ? (
                    <span className="border border-emerald-300/20 bg-emerald-300/[0.06] px-2 py-1 text-emerald-100/75">
                      Actions ready
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileTrayDismissed(true)}
                aria-label="Dismiss quick claim tray"
                className="shrink-0 rounded border border-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:border-amber-500/25 hover:text-zinc-300"
              >
                Dismiss
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {ownedByYou ? (
                <>
                  {worldAction ? (
                    <button
                      type="button"
                      onClick={runWorldAction}
                      className="btn-primary w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100"
                    >
                      {worldAction.cta}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded border border-zinc-800 bg-[#08080f]/70 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                    >
                      Map Layer Pending
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={focusWorldMap}
                    className="btn-secondary block w-full rounded border border-amber-500/20 bg-[#08080f]/80 px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100/75"
                  >
                    Open Map Actions
                  </button>
                </>
              ) : isUnavailable ? (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded border border-zinc-800 bg-[#08080f]/70 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"
                >
                  Already Claimed
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openClaimModal}
                  className="btn-primary w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100"
                >
                  Claim This Land
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isClaimModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="world-claim-title"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-6 py-6 backdrop-blur-sm sm:items-center"
        >
          <div className="relative my-auto w-full max-w-2xl overflow-hidden border border-amber-500/20 bg-[#06060c] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.7),0_0_90px_rgba(201,169,98,0.12)] sm:p-10">
            <div className="relative">
              {claimSuccess ? (
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
                    Founder Record Created
                  </p>
                  <h3
                    id="world-claim-title"
                    className="mt-6 font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl"
                  >
                    Land Claimed.
                  </h3>
                  <p className="mx-auto mt-6 max-w-md text-base leading-8 text-zinc-400">
                    You now control {selectedTile.landName}. Continue on the world map to grow the marker toward settlement and empire.
                  </p>
                  <div
                    data-qa="post-claim-next-step"
                    className="mx-auto mt-6 max-w-md border border-amber-500/15 bg-amber-500/[0.045] p-4 text-left text-sm leading-7 text-zinc-400"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">
                      Step 2 / {postClaimGuidance.headline}
                    </p>
                    <p className="mt-2">{postClaimGuidance.description}</p>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      {postClaimGuidance.spineLine}
                    </p>
                  </div>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={closeClaimModalToMap}
                      className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                    >
                      Continue On Map
                    </button>
                    <button
                      type="button"
                      onClick={closeClaimModalToMap}
                      className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-400"
                    >
                      Return To Map
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
                    Step 2 / Confirm First Claim
                  </p>
                  <h3
                    id="world-claim-title"
                    className="mt-5 break-words font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight text-amber-100 sm:text-5xl"
                  >
                    {selectedTile.landName}
                  </h3>
                  <div className="mt-7 grid gap-px overflow-hidden border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2">
                    {[
                      ["Land ID", selectedTile.landId],
                      ["Region", selectedTile.region],
                      ["Coordinates", selectedTile.coordinates],
                      ["Terrain", toTerrainLabel(selectedTile.terrain)],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-[#08080f]/95 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</p>
                        <p className="mt-2 break-words font-[family-name:var(--font-syne)] text-base font-bold text-zinc-200">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">
                      Founder Benefits
                    </p>
                    <ul className="mt-5 grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                      {[
                        "First owner of this land",
                        "Can found the first settlement",
                        "Permanent historical record",
                        "Founder badge",
                      ].map((benefit) => (
                        <li key={benefit} className="border-l border-amber-500/25 pl-4">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-y border-amber-500/15 py-5">
                    <span className="text-xs uppercase tracking-[0.28em] text-zinc-600">Demo Claim</span>
                    <span className="font-[family-name:var(--font-syne)] text-2xl font-extrabold text-amber-100">
                      Free
                    </span>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={claimLand}
                      className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.24em] text-amber-100 sm:flex-1"
                    >
                      Claim Land
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsClaimModalOpen(false)}
                      className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.24em] text-zinc-400 sm:flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
