"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { readSettlementState, writeSettlementState } from "../lib/settlement-state";

const ownershipMapRegions = [
  { id: "north-frontier", name: "North Frontier", x: "31%", y: "22%" },
  { id: "iron-coast", name: "Iron Coast", x: "18%", y: "56%" },
  { id: "ember-basin", name: "Ember Basin", x: "55%", y: "64%" },
  { id: "aurelia", name: "Aurelia", x: "48%", y: "38%" },
  { id: "crownlands", name: "Crownlands", x: "72%", y: "31%" },
];

const regionLore: Record<string, string> = {
  Aurelia:
    "The birthplace of ambition. Many believe the first great civilization will rise here.",
  Crownlands:
    "Wealth, influence and prestige. Control of the Crownlands may shape the future balance of power.",
  "North Frontier":
    "Untamed and distant. Only the bold choose to begin at the edge of the known world.",
  "Iron Coast":
    "Built on trade and resilience. A strategic region for those who value growth over glory.",
  "Ember Basin":
    "Ancient ground marked by forgotten conflicts. Every generation returns to claim its future here.",
};

const ownershipLegend = [
  { id: "unclaimed", label: "Unclaimed" },
  { id: "claimed", label: "Claimed" },
  { id: "landmark", label: "Future Landmark" },
  { id: "founder", label: "Founder Zone" },
];

const worldStatus = [
  { id: "total-lands", label: "Total Lands", value: "10,000" },
  { id: "claimed", label: "Claimed", value: "0" },
  { id: "first-city", label: "First City", value: "Awaiting Founder" },
  { id: "first-nation", label: "First Nation", value: "Awaiting Founder" },
  { id: "first-empire", label: "First Empire", value: "Awaiting Founder" },
];

type TileState = "unclaimed" | "claimed" | "landmark" | "founder";

type OwnershipTile = {
  id: string;
  landId: string;
  x: number;
  y: number;
  state: TileState;
  region: string;
  value: string;
};

function getRegionName(x: number, y: number) {
  if (y < 7) return "North Frontier";
  if (x < 8) return "Iron Coast";
  if (x > 16 && y < 11) return "Crownlands";
  if (y > 14) return "Ember Basin";
  return "Aurelia";
}

function getTileState(x: number, y: number): TileState {
  if ((x > 9 && x < 15 && y > 8 && y < 14) || (x > 17 && x < 21 && y > 5 && y < 9)) {
    return "founder";
  }
  if ((x === 5 && y > 11 && y < 17) || (x > 13 && x < 18 && y === 16)) {
    return "landmark";
  }
  if ((x + y * 3) % 17 === 0 || (x * 5 + y) % 29 === 0) {
    return "claimed";
  }
  return "unclaimed";
}

function buildOwnershipTiles(): OwnershipTile[] {
  return Array.from({ length: 576 }, (_, index) => {
    const x = index % 24;
    const y = Math.floor(index / 24);
    const state = getTileState(x, y);
    const value =
      state === "founder"
        ? "Founder priority"
        : state === "landmark"
          ? "Strategic landmark"
          : state === "claimed"
            ? "Preview claim"
            : "Available at launch";

    return {
      id: `tile-${index}`,
      landId: `PN-${String(index + 1).padStart(4, "0")}`,
      x,
      y,
      state,
      region: getRegionName(x, y),
      value,
    };
  });
}

function tileClassName(
  tile: OwnershipTile,
  selectedTile: OwnershipTile,
  claimedTileIds: Set<string>,
) {
  const state = claimedTileIds.has(tile.id) ? "claimed" : tile.state;
  const stateClass =
    state === "founder"
      ? "bg-amber-300/45 shadow-[0_0_10px_rgba(251,191,36,0.22)]"
      : state === "landmark"
        ? "bg-amber-100/30"
        : state === "claimed"
          ? "bg-amber-700/22"
          : "bg-amber-500/[0.055]";

  const selectedClass =
    tile.id === selectedTile.id
      ? "z-10 scale-150 bg-amber-200 shadow-[0_0_22px_rgba(251,191,36,0.75)]"
      : "";

  return `${stateClass} ${selectedClass}`;
}

export function WorldOwnershipMapSection() {
  const ownershipTiles = useMemo(() => buildOwnershipTiles(), []);
  const initialTile = ownershipTiles.find((tile) => tile.state === "founder") ?? ownershipTiles[0];
  const [selectedTile, setSelectedTile] = useState<OwnershipTile>(initialTile);
  const [claimedTileIds, setClaimedTileIds] = useState<Set<string>>(new Set());
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const selectedStatus = claimedTileIds.has(selectedTile.id)
    ? "Claimed"
    : selectedTile.state === "founder"
      ? "Founder Zone"
      : selectedTile.state === "landmark"
        ? "Future Landmark"
        : selectedTile.state === "claimed"
          ? "Claimed"
          : "Unclaimed";

  const selectedLandName = `${selectedTile.region} ${selectedTile.landId}`;
  const claimedCount = claimedTileIds.size;
  const displayWorldStatus = worldStatus.map((item) =>
    item.id === "claimed" ? { ...item, value: String(claimedCount) } : item,
  );

  const findLand = () => {
    const nextTile =
      ownershipTiles.find((tile) => tile.state === "unclaimed" && tile.region === "Aurelia") ??
      ownershipTiles.find((tile) => tile.state === "unclaimed");

    if (nextTile) setSelectedTile(nextTile);
  };

  const openClaimModal = () => {
    setClaimSuccess(false);
    setIsClaimModalOpen(true);
  };

  const claimSelectedLand = () => {
    setClaimedTileIds((current) => new Set(current).add(selectedTile.id));
    const state = readSettlementState();
    writeSettlementState({
      ...state,
      claimedLand: true,
      founderBadgeEarned: true,
    });
    setClaimSuccess(true);
  };

  return (
    <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-34 sm:px-10 sm:py-48">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,98,0.075)_0%,transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[52%] h-[620px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-900/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600/75">
            World Ownership Map
          </p>

          <h2 className="mx-auto mt-8 max-w-5xl font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-7xl">
            10,000 lands.
            <br />
            <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-700/65 bg-clip-text text-transparent">
              One history.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
            Preview the unclaimed world before the first banners are raised.
          </p>
        </div>

        <div className="relative mt-20 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent lg:block"
          />
          <div className="group/map relative overflow-hidden rounded-sm border border-amber-500/15 bg-[#050509]/85 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-6">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(2,2,4,0.76)_100%)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(201,169,98,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.45)_1px,transparent_1px)] [background-size:20px_20px]"
            />
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[360px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/8 blur-3xl transition-opacity duration-500 group-hover/map:opacity-80"
            />

            <div className="relative">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/10 pb-4">
                <div className="text-left">
                  <p className="font-[family-name:var(--font-syne)] text-sm font-bold uppercase tracking-[0.3em] text-amber-200/80">
                    World Preview
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-600">
                    10,000 lands waiting to be claimed
                  </p>
                </div>

                <button
                  type="button"
                  onClick={findLand}
                  className="btn-primary rounded border border-amber-500/45 bg-amber-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-amber-100"
                >
                  Claim Your Place
                </button>
              </div>

              <div className="relative aspect-square overflow-hidden bg-[#030306] p-2 sm:p-3">
                <div className="grid h-full w-full grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
                  {ownershipTiles.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      aria-label={`${tile.landId}, ${tile.region}, ${
                        claimedTileIds.has(tile.id) ? "claimed" : tile.state
                      }`}
                      onClick={() => setSelectedTile(tile)}
                      className={`aspect-square transition-all duration-200 hover:z-10 hover:scale-150 hover:bg-amber-200 hover:shadow-[0_0_18px_rgba(251,191,36,0.55)] focus-visible:z-10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-amber-300 ${tileClassName(tile, selectedTile, claimedTileIds)}`}
                    />
                  ))}
                </div>

                {ownershipMapRegions.map((region) => (
                  <div
                    key={region.id}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: region.x, top: region.y }}
                  >
                    <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 animate-world-marker-pulse" />
                    <span className="relative block h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.75)]" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap border-l border-amber-500/35 bg-[#030306]/75 py-1 pl-2 font-[family-name:var(--font-syne)] text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-200/80 backdrop-blur-sm sm:text-[10px]">
                      {region.name}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
                {ownershipLegend.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 ${
                        item.id === "founder"
                          ? "bg-amber-300/70"
                          : item.id === "landmark"
                            ? "bg-amber-100/45"
                            : item.id === "claimed"
                              ? "bg-amber-700/45"
                              : "bg-amber-500/15"
                      }`}
                    />
                    <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="relative border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] lg:self-start">
            <div
              aria-hidden
              className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent"
            />
            <p className="font-[family-name:var(--font-syne)] text-sm font-bold uppercase tracking-[0.3em] text-amber-200/80">
              World Status
            </p>
            <div className="mt-7 space-y-5">
              {displayWorldStatus.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-6 border-b border-amber-500/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                    {item.label}
                  </span>
                  <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-8 border-t border-amber-500/10 pt-6 text-xs font-semibold uppercase tracking-[0.26em] text-amber-600/70">
              World Milestones
            </p>
            <div className="mt-5 space-y-5">
              {displayWorldStatus.slice(2).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-6 border-b border-amber-500/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {item.label}
                  </span>
                  <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-amber-500/10 pt-6">
              <p className="text-xs uppercase tracking-[0.26em] text-amber-600/70">
                Selected Land
              </p>
              <p className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100">
                {selectedTile.region}
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {regionLore[selectedTile.region]}
              </p>

              <div className="mt-7 space-y-3 border-t border-amber-500/10 pt-5 text-xs">
                <div className="flex justify-between gap-5">
                  <span className="uppercase tracking-[0.2em] text-zinc-700">
                    Grid
                  </span>
                  <span className="text-right text-zinc-500">
                    X{selectedTile.x + 1} / Y{selectedTile.y + 1}
                  </span>
                </div>
                <div className="flex justify-between gap-5">
                  <span className="uppercase tracking-[0.2em] text-zinc-700">
                    Current Status
                  </span>
                  <span className="text-right capitalize text-zinc-500">
                    {selectedStatus}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={openClaimModal}
                className="btn-primary mt-7 w-full rounded border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
              >
                Start Here
              </button>
            </div>

            <p className="mt-8 text-sm leading-7 text-zinc-500">
              The world is untouched. The first cities, nations and empires have
              yet to be founded.
            </p>
          </aside>
        </div>

        <div className="mx-auto mt-14 max-w-3xl border-y border-amber-500/10 py-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-600/70">
            0 claimed today. 10,000 chances remain.
          </p>
          <p className="mt-4 text-base leading-8 text-zinc-500 sm:text-lg">
            The map begins empty.
            <br />
            <span className="text-zinc-400">
              Its future belongs to the players.
            </span>
          </p>
        </div>
      </div>

      {isClaimModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-land-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-2xl overflow-hidden border border-amber-500/20 bg-[#06060c] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.7),0_0_90px_rgba(201,169,98,0.12)] sm:p-10">
            <div
              aria-hidden
              className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/45 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-700/10 blur-3xl"
            />

            <div className="relative">
              {claimSuccess ? (
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
                    Founder Record Created
                  </p>
                  <h3
                    id="claim-land-title"
                    className="mt-6 font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl"
                  >
                    Congratulations.
                  </h3>
                  <p className="mx-auto mt-6 max-w-md text-base leading-8 text-zinc-400">
                    You are now the founder of {selectedTile.region}.
                  </p>
                  <p className="mx-auto mt-8 border-y border-amber-500/15 py-5 font-[family-name:var(--font-syne)] text-xl font-bold uppercase tracking-[0.25em] text-amber-100">
                    Founder Badge Earned.
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
                    id="claim-land-title"
                    className="mt-5 font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight text-amber-100 sm:text-5xl"
                  >
                    {selectedLandName}
                  </h3>

                  <div className="mt-7 grid gap-px overflow-hidden border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2">
                    {[
                      ["Grid Coordinates", `X${selectedTile.x + 1} / Y${selectedTile.y + 1}`],
                      ["Region", selectedTile.region],
                      ["Status", selectedStatus],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-[#08080f]/95 p-4">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                          {label}
                        </p>
                        <p className="mt-2 font-[family-name:var(--font-syne)] text-base font-bold text-zinc-200">
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
                        "First owner of the land",
                        "Can build first settlement",
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
                    <span className="text-xs uppercase tracking-[0.28em] text-zinc-600">
                      Claim Cost
                    </span>
                    <span className="font-[family-name:var(--font-syne)] text-2xl font-extrabold text-amber-100">
                      0.01 ETH
                    </span>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={claimSelectedLand}
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
    </section>
  );
}
