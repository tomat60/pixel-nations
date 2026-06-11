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
  strategicValue: string;
  historicalNote: string;
  starter: boolean;
  claimed: boolean;
};

const GRID_WIDTH = 22;
const GRID_HEIGHT = 14;

const TERRAIN_RESOURCES: Record<Terrain, string[]> = {
  plains: ["Food", "Timber"],
  forest: ["Timber", "Game"],
  mountain: ["Stone", "Iron"],
  coast: ["Fish", "Salt"],
  basin: ["Clay", "Fresh Water"],
  crownland: ["Gold", "Stone"],
  ruins: ["Relics", "Stone"],
};

const TERRAIN_TONE: Record<Terrain, string> = {
  plains: "bg-[#342718]/95",
  forest: "bg-[#26321f]/95",
  mountain: "bg-[#2b3038]/95",
  coast: "bg-[#24313a]/95",
  basin: "bg-[#38241f]/95",
  crownland: "bg-[#46351c]/95",
  ruins: "bg-[#433026]/95",
};

const TERRAIN_MARK: Record<Terrain, string> = {
  plains: "after:bg-amber-200/15",
  forest: "after:bg-lime-200/15",
  mountain: "after:bg-zinc-200/20",
  coast: "after:bg-slate-200/20",
  basin: "after:bg-orange-300/15",
  crownland: "after:bg-amber-200/25",
  ruins: "after:bg-orange-200/20",
};

const REGION_BORDER: Record<Region, string> = {
  Aurelia: "border-amber-400/20",
  "North Frontier": "border-zinc-300/20",
  "Iron Coast": "border-slate-300/20",
  "Ember Basin": "border-orange-300/20",
  Crownlands: "border-amber-200/25",
};

const REGION_LABELS = [
  { id: "north-frontier", name: "North Frontier", left: "29%", top: "17%" },
  { id: "crownlands", name: "Crownlands", left: "75%", top: "22%" },
  { id: "aurelia", name: "Aurelia", left: "50%", top: "48%" },
  { id: "iron-coast", name: "Iron Coast", left: "17%", top: "66%" },
  { id: "ember-basin", name: "Ember Basin", left: "58%", top: "82%" },
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

function getRegion(x: number, y: number): Region {
  if (x >= 15 && y <= 5) return "Crownlands";
  if (y <= 3 || (x <= 7 && y <= 5)) return "North Frontier";
  if (x <= 4 && y >= 5) return "Iron Coast";
  if (y >= 10 || (x >= 10 && y >= 8)) return "Ember Basin";
  return "Aurelia";
}

function getTerrain(x: number, y: number, region: Region): Terrain {
  if ((x === 9 && y === 6) || (x === 13 && y === 9) || (x === 17 && y === 4)) return "ruins";
  if (x <= 2 || (region === "Iron Coast" && x <= 5 && y % 2 === 0)) return "coast";
  if (y <= 1 || x >= 20) return "coast";
  if (region === "Crownlands") return x > 17 && y < 4 ? "crownland" : "mountain";
  if (region === "North Frontier") return y < 3 || (x + y) % 4 === 0 ? "mountain" : "forest";
  if (region === "Iron Coast") return x <= 4 ? "coast" : "forest";
  if (region === "Ember Basin") return (x + y) % 3 === 0 ? "basin" : "plains";
  if ((x >= 7 && x <= 9 && y >= 3 && y <= 7) || (x === 12 && y === 5)) return "forest";
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
    const starter = !claimed && region === "Aurelia" && (terrain === "plains" || terrain === "forest");

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
      strategicValue: getStrategicValue(terrain, starter, claimed),
      historicalNote: getHistoricalNote(region, terrain, claimed),
      starter,
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
  const owner = ownedByYou ? "You" : selectedTile.claimed ? "Rival Founder" : "None";
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

        <section className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="relative overflow-hidden border border-amber-500/15 bg-[#050509]/90 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.6)] sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,98,0.06),transparent_54%)]"
            />
            <div className="relative">
              <div className="flex flex-col justify-between gap-3 border-b border-amber-500/10 pb-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
                    Playable Sector
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-zinc-600">
                    Inspect terrain. Choose carefully.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  <span className="border border-amber-500/15 px-2 py-1">216 lands</span>
                  <span className="border border-amber-500/15 px-2 py-1">5 regions</span>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto pb-2">
                <div className="relative min-w-[760px] overflow-hidden border border-amber-500/20 bg-[#030306] p-3 shadow-[inset_0_0_60px_rgba(0,0,0,0.55)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-3 border border-amber-500/10"
                  />
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]"
                    viewBox="0 0 760 484"
                    preserveAspectRatio="none"
                  >
                    {MAP_RIVERS.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(148,163,184,0.24)"
                        strokeWidth="2"
                      />
                    ))}
                    {MAP_ROUTES.map((path) => (
                      <path
                        key={path}
                        d={path}
                        fill="none"
                        stroke="rgba(201,169,98,0.22)"
                        strokeDasharray="5 7"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                  {REGION_LABELS.map((label) => (
                    <span
                      key={label.id}
                      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 border border-amber-500/15 bg-[#030306]/70 px-2 py-1 font-[family-name:var(--font-syne)] text-[9px] font-bold uppercase tracking-[0.22em] text-amber-100/55 backdrop-blur-sm"
                      style={{ left: label.left, top: label.top }}
                    >
                      {label.name}
                    </span>
                  ))}
                  <div className="relative z-10 grid grid-cols-[repeat(22,minmax(0,1fr))] gap-px">
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
                          className={`relative aspect-square overflow-hidden border transition-colors duration-200 after:absolute after:left-1/2 after:top-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full ${
                            TERRAIN_TONE[tile.terrain]
                          } ${TERRAIN_MARK[tile.terrain]} ${REGION_BORDER[tile.region]} ${
                            tile.x === 0 || tile.x === GRID_WIDTH - 1 || tile.y === 0 || tile.y === GRID_HEIGHT - 1
                              ? "opacity-70"
                              : ""
                          } ${
                            isSelected
                              ? "border-amber-200/90 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.55),inset_0_0_16px_rgba(251,191,36,0.16)]"
                              : "hover:border-amber-300/45"
                          } ${
                            tileOwnedByYou
                              ? "border-amber-200/80 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.4)]"
                              : tileUnavailable
                                ? "opacity-50"
                                : ""
                          }`}
                        >
                          {tile.starter && !tileClaimed ? (
                            <span className="pointer-events-none absolute right-0.5 top-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300/80 shadow-[0_0_10px_rgba(251,191,36,0.45)]" />
                          ) : null}
                          {tileOwnedByYou ? (
                            <span className="absolute inset-0 flex items-center justify-center bg-amber-500/10 text-[8px] font-bold uppercase tracking-[0.2em] text-amber-100">
                              You
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="border border-amber-500/15 bg-[#06060c]/90 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] lg:sticky lg:top-6 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Selected Land</p>
            <p className="mt-3 break-words font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100">
              {selectedTile.landName}
            </p>
            <p className="mt-4 border-l border-amber-500/30 pl-4 text-sm leading-7 text-zinc-400">
              {selectedTile.cinematicLine}
            </p>

            <div className="mt-6 space-y-4 border-t border-amber-500/10 pt-5 text-sm">
              {[
                ["Land ID", selectedTile.landId],
                ["Coordinates", selectedTile.coordinates],
                ["Region", selectedTile.region],
                ["Terrain", toTerrainLabel(selectedTile.terrain)],
                ["Resources", selectedTile.resources.join(", ")],
                ["Owner / Status", `${owner} / ${status}`],
                ["Strategic Value", selectedTile.strategicValue],
                ["Historical Note", selectedTile.historicalNote],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-2 border-b border-amber-500/10 pb-3 sm:grid-cols-[120px_1fr]">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{label}</span>
                  <span className="break-words font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-200 sm:text-right">
                    {value}
                  </span>
                </div>
              ))}
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
