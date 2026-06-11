"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  plains: "before:bg-[#4a3828]/18",
  forest: "before:bg-[#2d4228]/22",
  mountain: "before:bg-[#3a4048]/20",
  coast: "before:bg-[#2a4550]/22",
  basin: "before:bg-[#4a3028]/18",
  crownland: "before:bg-[#5a4828]/24",
  ruins: "before:bg-[#4a3828]/16",
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
];

const MAP_RIVERS = [
  "M 404 38 C 388 112 420 168 386 230 S 328 330 366 430",
  "M 636 86 C 594 132 584 190 614 248 S 680 334 644 424",
];

const MAP_CONTOURS = [
  "M 42 86 C 146 42 292 76 366 130 S 548 188 720 138",
  "M 74 360 C 178 302 304 332 418 284 S 598 230 734 268",
  "M 216 458 C 310 392 404 406 508 374 S 646 340 722 386",
];

const SECTOR_REGION_ZONES = [
  {
    id: "north-frontier",
    className: "left-[14%] top-[2%] h-[36%] w-[50%] border-zinc-400/12 bg-zinc-400/[0.07]",
    clipPath: "polygon(0 18%, 34% 0, 88% 12%, 100% 68%, 62% 96%, 10% 78%)",
  },
  {
    id: "iron-coast",
    className: "left-[0%] top-[22%] h-[74%] w-[30%] border-slate-400/12 bg-slate-500/[0.08]",
    clipPath: "polygon(0 0, 72% 8%, 100% 48%, 72% 98%, 8% 86%, 0 42%)",
  },
  {
    id: "aurelia",
    className: "left-[26%] top-[28%] h-[44%] w-[50%] border-amber-400/16 bg-amber-500/[0.09]",
    clipPath: "polygon(10% 18%, 56% 0, 100% 24%, 84% 78%, 36% 100%, 0 64%)",
  },
  {
    id: "crownlands",
    className: "left-[61%] top-[6%] h-[50%] w-[36%] border-amber-200/16 bg-amber-300/[0.08]",
    clipPath: "polygon(16% 8%, 80% 0, 100% 42%, 78% 90%, 22% 100%, 0 50%)",
  },
  {
    id: "ember-basin",
    className: "left-[34%] top-[60%] h-[36%] w-[60%] border-orange-300/12 bg-orange-400/[0.07]",
    clipPath: "polygon(4% 24%, 42% 0, 98% 16%, 88% 82%, 42% 100%, 0 74%)",
  },
];

const TERRAIN_MASSES = [
  {
    id: "coast-band",
    className: "left-[0%] top-[18%] h-[78%] w-[16%] bg-gradient-to-r from-slate-700/35 to-transparent",
    clipPath: "polygon(0 0, 100% 8%, 100% 92%, 0 100%)",
  },
  {
    id: "forest-belt",
    className: "left-[18%] top-[8%] h-[38%] w-[42%] bg-gradient-to-br from-emerald-950/40 to-transparent",
    clipPath: "polygon(0 20%, 48% 0, 100% 28%, 88% 100%, 12% 88%)",
  },
  {
    id: "plains-heart",
    className: "left-[32%] top-[34%] h-[32%] w-[38%] bg-gradient-to-b from-amber-950/30 to-transparent",
    clipPath: "polygon(8% 0, 92% 12%, 100% 88%, 48% 100%, 0 72%)",
  },
  {
    id: "ridge-line",
    className: "left-[58%] top-[4%] h-[44%] w-[38%] bg-gradient-to-bl from-zinc-700/35 to-transparent",
    clipPath: "polygon(18% 0, 100% 8%, 92% 100%, 0 82%)",
  },
  {
    id: "basin-floor",
    className: "left-[38%] top-[64%] h-[30%] w-[54%] bg-gradient-to-t from-orange-950/35 to-transparent",
    clipPath: "polygon(0 28%, 44% 0, 100% 18%, 92% 100%, 8% 100%)",
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

function getContinueRoute(state: SettlementState) {
  if (state.empireFounded) return "/empire";
  if (state.nationFounded) return "/nation";
  if (state.settlementFounded) return "/settlement";
  if (state.claimedLand) return "/dashboard";
  return "/world";
}

export default function WorldPage() {
  const tiles = useMemo(() => buildTiles(), []);
  const [demoState, setDemoState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);
  const [selectedTileId, setSelectedTileId] = useState<string>(tiles[0].id);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    const state = readSettlementState();
    let normalizedState = state;

    if (state.claimedLand && !state.claimedLandId) {
      const fallbackTile = tiles.find((tile) => tile.starter && !tile.claimed) ?? tiles[0];
      normalizedState = {
        ...state,
        claimedLandId: fallbackTile.id,
        claimedLandName: fallbackTile.landName,
        claimedLandCoordinates: fallbackTile.coordinates,
        claimedLandRegion: fallbackTile.region,
        claimedLandTerrain: toTerrainLabel(fallbackTile.terrain),
      };
      writeSettlementState(normalizedState);
    }

    setDemoState(normalizedState);

    if (normalizedState.claimedLandId) {
      const claimedTile = tiles.find((tile) => tile.id === normalizedState.claimedLandId);
      if (claimedTile) {
        setSelectedTileId(claimedTile.id);
        return;
      }
    }

    const starterTile = tiles.find((tile) => tile.starter && !tile.claimed);
    if (starterTile) setSelectedTileId(starterTile.id);
  }, [tiles]);

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

  const ownedByYou = demoState.claimedLand && demoState.claimedLandId === selectedTile.id;
  const isUnavailable = selectedTile.claimed && !ownedByYou;
  const status = ownedByYou ? "Owned by You" : selectedTile.claimed ? "Claimed" : "Unclaimed";
  const continueRoute = getContinueRoute(demoState);

  const openClaimModal = () => {
    setClaimSuccess(false);
    setIsClaimModalOpen(true);
  };

  const claimLand = () => {
    const nextState: SettlementState = {
      ...demoState,
      claimedLand: true,
      founderBadgeEarned: true,
      claimedLandId: selectedTile.id,
      claimedLandName: selectedTile.landName,
      claimedLandCoordinates: selectedTile.coordinates,
      claimedLandRegion: selectedTile.region,
      claimedLandTerrain: toTerrainLabel(selectedTile.terrain),
      region: selectedTile.region,
      coordinates: selectedTile.coordinates,
    };

    writeSettlementState(nextState);
    setDemoState(nextState);
    setClaimSuccess(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020204] px-5 py-8 text-white sm:px-10 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-amber-500/15 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-600/75">World Map</p>
          <h1 className="mt-5 font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            CHOOSE YOUR FIRST LAND
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-400 sm:mt-5 sm:text-lg">
            Choose the land where your history begins.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.26em] text-amber-500/75">
            10,000 lands. One first move.
          </p>
          {hasProgress ? (
            <p className="mt-4 text-xs uppercase tracking-[0.22em] text-amber-300/80">
              Demo progress found. Continue your rise.
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="btn-secondary w-full rounded border border-zinc-800 bg-[#08080f]/80 px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 sm:w-auto"
            >
              Back To Landing
            </Link>
            {hasProgress ? (
              <Link
                href={continueRoute}
                className="btn-primary w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100 sm:w-auto"
              >
                Continue Demo
              </Link>
            ) : null}
          </div>
        </header>

        <section
          id="world-atlas"
          data-qa="world-atlas"
          className="mt-6 overflow-hidden border border-amber-500/15 bg-[#050509]/90 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.5)] sm:mt-8 sm:p-6"
        >
          <div className="mb-5 grid gap-5 border-b border-amber-500/10 pb-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
                World Atlas
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-5xl">
                100 x 100 lands.
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                100 x 100 lands. One world. One history.
              </p>
              <p className="mt-2 text-sm leading-7 text-amber-200/70">
                The world is finite. Your first tile is permanent.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-px border border-amber-500/10 bg-amber-500/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              <div className="bg-[#08080f]/95 p-3">
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">10,000</p>
                <p className="mt-1">finite lands</p>
              </div>
              <div className="bg-[#08080f]/95 p-3">
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">100 x 100</p>
                <p className="mt-1">world grid</p>
              </div>
              <div className="bg-[#08080f]/95 p-3">
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">Sector A-01</p>
                <p className="mt-1">starting sector</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-amber-500/20 bg-[#030306] p-3 shadow-[inset_0_0_90px_rgba(0,0,0,0.72)] sm:p-4">
            <div
              aria-hidden
              className="absolute inset-3 opacity-[0.26] [background-image:linear-gradient(rgba(201,169,98,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.5)_1px,transparent_1px)] [background-size:1%_1%]"
            />
            <div
              aria-hidden
              className="absolute inset-3 opacity-[0.18] [background-image:linear-gradient(rgba(201,169,98,0.75)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.75)_1px,transparent_1px)] [background-size:10%_10%]"
            />
            <div
              aria-hidden
              className="absolute inset-3 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(2,2,4,0.78)_100%)]"
            />
            <div className="relative aspect-[16/9] min-h-[260px] overflow-hidden sm:min-h-[420px] lg:min-h-[560px]">
              {ATLAS_REGIONS.map((region) => (
                <div
                  key={region.id}
                  className={`absolute border ${region.className}`}
                  style={{ clipPath: region.clipPath }}
                />
              ))}

              {ATLAS_LAND_MARKS.map((mark) => (
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
                className="pointer-events-none absolute inset-0 h-full w-full"
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
                  Sector A-01
                </span>
                <span className="absolute -top-8 left-0 hidden whitespace-nowrap border border-amber-500/30 bg-[#030306]/90 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-amber-200/85 sm:block">
                  Aurelian Starting Sector
                </span>
                <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.85)]" />
              </div>

              <div className="absolute bottom-3 left-3 max-w-xs border border-amber-500/15 bg-[#030306]/80 p-3 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">
                  Demo Origin
                </p>
                <p className="mt-2 text-xs leading-6 text-zinc-400">
                  The highlighted sector is where the demo begins.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article
            id="playable-sector"
            data-qa="playable-sector"
            className="relative overflow-hidden border border-amber-500/15 bg-[#050509]/90 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.6)] sm:p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,98,0.06),transparent_54%)]"
            />
            <div className="relative">
              <div className="flex flex-col justify-between gap-4 border-b border-amber-500/10 pb-5 sm:flex-row sm:items-end">
                <div className="max-w-xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600/80">
                    Starting Sector
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight text-amber-100 sm:text-3xl">
                    Aurelian Basin
                  </p>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    This is the first playable sector of a 10,000-land world.
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-600">
                    Choose a highlighted founder land to begin.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <span className="border border-amber-500/15 bg-[#08080f]/80 px-2.5 py-1.5 text-amber-100/80">
                    216 visible lands
                  </span>
                  <span className="border border-amber-500/15 bg-[#08080f]/80 px-2.5 py-1.5">
                    10,000 total world lands
                  </span>
                  <span className="border border-amber-500/15 bg-[#08080f]/80 px-2.5 py-1.5">
                    Sector A-01
                  </span>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto pb-2">
                <div className="relative min-w-[680px] overflow-hidden border border-amber-500/20 bg-[#080a0c] p-3 shadow-[inset_0_0_80px_rgba(0,0,0,0.65)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-3 bg-[radial-gradient(ellipse_at_52%_48%,rgba(201,169,98,0.08),transparent_58%)]"
                  />
                  {TERRAIN_MASSES.map((mass) => (
                    <div
                      key={mass.id}
                      aria-hidden
                      className={`pointer-events-none absolute ${mass.className}`}
                      style={{ clipPath: mass.clipPath }}
                    />
                  ))}
                  {SECTOR_REGION_ZONES.map((zone) => (
                    <div
                      key={zone.id}
                      aria-hidden
                      className={`pointer-events-none absolute border ${zone.className}`}
                      style={{ clipPath: zone.clipPath }}
                    />
                  ))}
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]"
                    viewBox="0 0 760 484"
                    preserveAspectRatio="none"
                  >
                    {MAP_CONTOURS.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(245,222,179,0.1)"
                        strokeWidth="2"
                      />
                    ))}
                    {MAP_RIVERS.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(148,163,184,0.28)"
                        strokeWidth="2.5"
                      />
                    ))}
                    {MAP_ROUTES.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(201,169,98,0.28)"
                        strokeDasharray="5 7"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-3 z-[6] opacity-[0.22] [background-image:linear-gradient(rgba(201,169,98,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.45)_1px,transparent_1px)] [background-size:calc(100%/18)_calc(100%/12)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-3 z-[6] border border-amber-500/12"
                  />
                  {REGION_LABELS.map((label) => (
                    <span
                      key={label.id}
                      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 border border-amber-500/12 bg-[#030306]/55 px-2 py-0.5 font-[family-name:var(--font-syne)] text-[8px] font-bold uppercase tracking-[0.2em] text-amber-100/45 backdrop-blur-sm sm:text-[9px]"
                      style={{ left: label.left, top: label.top }}
                    >
                      {label.name}
                    </span>
                  ))}
                  <div className="relative z-10 grid grid-cols-[repeat(18,minmax(0,1fr))] gap-0">
                    {tiles.map((tile) => {
                      const tileOwnedByYou = demoState.claimedLandId === tile.id && demoState.claimedLand;
                      const tileClaimed = tile.claimed || tileOwnedByYou;
                      const tileUnavailable = tile.claimed && !tileOwnedByYou;
                      const isSelected = selectedTile.id === tile.id;

                      return (
                        <button
                          key={tile.id}
                          type="button"
                          onClick={() => setSelectedTileId(tile.id)}
                          aria-label={`${tile.landId}, ${tile.region}, ${toTerrainLabel(tile.terrain)}`}
                          className={`relative aspect-square overflow-hidden border border-white/[0.04] bg-black/10 transition-[border-color,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-0 ${TERRAIN_TINT[tile.terrain]} ${
                            tile.x === 0 || tile.x === GRID_WIDTH - 1 || tile.y === 0 || tile.y === GRID_HEIGHT - 1
                              ? "opacity-75"
                              : ""
                          } ${
                            isSelected
                              ? "z-[12] border-amber-200/90 shadow-[inset_0_0_14px_rgba(251,191,36,0.22),0_0_0_1px_rgba(251,191,36,0.35)]"
                              : "hover:border-amber-300/35 hover:bg-black/20"
                          } ${
                            tileOwnedByYou
                              ? "border-amber-200/75 shadow-[inset_0_0_10px_rgba(251,191,36,0.18)]"
                              : tileUnavailable
                                ? "opacity-40"
                                : ""
                          }`}
                        >
                          {tile.starter && !tileClaimed ? (
                            <span className="pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                          ) : null}
                          {!tile.starter && tile.landmark && !tileClaimed ? (
                            <span className="pointer-events-none absolute right-1 top-1 h-1 w-1 rotate-45 bg-orange-200/80 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                          ) : null}
                          {!tile.starter && !tile.landmark && tile.resourceRich && !tileClaimed ? (
                            <span className="pointer-events-none absolute right-1 top-1 h-1 w-1 rounded-full bg-cyan-200/70" />
                          ) : null}
                          {tileOwnedByYou ? (
                            <span className="absolute inset-0 flex items-center justify-center bg-amber-500/10 text-[7px] font-bold uppercase tracking-[0.18em] text-amber-100">
                              You
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative z-20 mt-3 grid gap-2 border border-amber-500/10 bg-[#030306]/80 p-3 text-[9px] uppercase tracking-[0.18em] text-zinc-500 sm:grid-cols-4">
                    {[
                      ["Founder land", "h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"],
                      ["Resource-rich", "h-1 w-1 rounded-full bg-cyan-200/70"],
                      ["Landmark", "h-1 w-1 rotate-45 bg-orange-200/80"],
                      ["Command grid", "h-px w-3 bg-amber-400/40"],
                    ].map(([label, swatch]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className={swatch} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside
            id="selected-land-panel"
            data-qa="selected-land-panel"
            className="border border-amber-500/15 bg-[#06060c]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-6 lg:sticky lg:top-6 lg:self-start"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Selected Land</p>
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
                Founder Meaning
              </p>
              <p className="mt-3 text-sm leading-6 text-amber-100/80">{selectedTile.founderMeaning}</p>
              <p className="mt-3 text-xs leading-6 text-zinc-500">{selectedTile.contextLine}</p>
            </div>

            <div className="mt-6">
              {ownedByYou ? (
                <Link
                  href="/dashboard"
                  className="btn-primary block w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                >
                  Enter Your Land
                </Link>
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
                    You now control {selectedTile.landName}.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                      href="/dashboard"
                      className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                    >
                      Enter Your Land
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsClaimModalOpen(false)}
                      className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-400"
                    >
                      Return To Map
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
                    Confirm Land Claim
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
