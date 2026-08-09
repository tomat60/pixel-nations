"use client";

import type { CSSProperties } from "react";
import type { WorldMapSector } from "./world-map-selectors";

type SectorControl = "owned" | "claimable" | "locked";
type Pressure = "none" | "active" | "contained";

type BasinPosition = { left: number; top: number };

const X_BY_COLUMN = [12, 29, 48, 69, 87];
const Y_BY_ROW = [13, 31, 50, 69, 86];
const X_DRIFT = [
  [0, 1, -2, 1, -1],
  [2, -1, 2, -2, 0],
  [-1, 2, -1, 2, -2],
  [1, -2, 2, -1, 1],
  [-2, 1, -1, 1, 0],
];
const Y_DRIFT = [
  [0, 2, -1, 1, 0],
  [-1, 1, 2, -1, 1],
  [2, -2, 1, 2, -1],
  [-1, 2, -1, 1, 0],
  [1, -1, 1, -2, 0],
];

function basinPosition(sector: WorldMapSector): BasinPosition {
  const x = Math.max(0, Math.min(4, sector.x));
  const y = Math.max(0, Math.min(4, sector.y));
  return {
    left: X_BY_COLUMN[x] + X_DRIFT[y][x],
    top: Y_BY_ROW[y] + Y_DRIFT[y][x],
  };
}

function controlFor(id: string, owned: Set<string>, claimable: Set<string>): SectorControl {
  if (owned.has(id)) return "owned";
  if (claimable.has(id)) return "claimable";
  return "locked";
}

function markerClasses(sector: WorldMapSector, control: SectorControl, selected: boolean) {
  const base = "pointer-events-auto group absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border text-left shadow-[0_10px_24px_rgba(0,0,0,.42)] transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100";
  if (selected) return `${base} border-amber-50 bg-amber-200 text-stone-950 ring-4 ring-amber-100/25 scale-110`;
  if (control === "owned") return `${base} border-amber-200/90 bg-[#8f6228] text-amber-50 hover:bg-[#a87330]`;
  if (control === "claimable") return `${base} border-lime-200/85 bg-[#314b2c] text-lime-50 hover:bg-[#3d5d35]`;
  if (sector.isRival) return `${base} border-red-200/70 bg-[#4f2927] text-red-50 hover:bg-[#60312e]`;
  if (sector.isTradeRich) return `${base} border-cyan-200/55 bg-[#244b4d] text-cyan-50 hover:bg-[#2c5a5d]`;
  if (sector.isHighDanger) return `${base} border-orange-200/50 bg-[#493229] text-orange-50 hover:bg-[#573b30]`;
  return `${base} border-slate-100/25 bg-[#23312b] text-stone-100 hover:border-stone-100/45 hover:bg-[#2b3b33]`;
}

function Road({ left, top, width, rotate }: { left: string; top: string; width: string; rotate: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute z-10 h-[5px] origin-left rounded-full bg-gradient-to-r from-amber-100/20 via-amber-200/55 to-amber-100/18 shadow-[0_0_9px_rgba(251,191,36,.12)]"
      style={{ left, top, width, transform: `rotate(${rotate}deg)` }}
    />
  );
}

function RiverSegment({ left, top, width, rotate }: { left: string; top: string; width: string; rotate: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute z-[4] h-[34px] origin-left rounded-full bg-gradient-to-b from-cyan-100/8 via-cyan-400/34 to-cyan-950/60 shadow-[0_0_24px_rgba(34,211,238,.12)] ring-1 ring-cyan-100/8 md:h-[44px]"
      style={{ left, top, width, transform: `rotate(${rotate}deg)` }}
    />
  );
}

export function WorldBasinCanvas({
  sectors,
  selectedSectorId,
  ownedSectorIds,
  claimableSectorIds,
  canClaimSectorIds,
  nationFounded,
  institutionCount,
  frontierTargetSectorId,
  frontierObjectiveComplete,
  obsidianPressure,
  onSelect,
}: {
  sectors: WorldMapSector[];
  selectedSectorId: string;
  ownedSectorIds: string[];
  claimableSectorIds: string[];
  canClaimSectorIds: string[];
  nationFounded: boolean;
  institutionCount: number;
  frontierTargetSectorId: string | null;
  frontierObjectiveComplete: boolean;
  obsidianPressure: Pressure;
  onSelect: (sector: WorldMapSector) => void;
}) {
  const owned = new Set(ownedSectorIds);
  const claimable = new Set(claimableSectorIds);
  const canClaim = new Set(canClaimSectorIds);

  return (
    <div
      data-qa="world-basin-canvas"
      data-world-technique="authored-basin-markers"
      className="relative h-[470px] overflow-hidden rounded-[2rem] border border-sky-100/12 bg-[#07110e] shadow-[inset_0_0_110px_rgba(0,0,0,.72),0_24px_60px_rgba(0,0,0,.28)] sm:h-[560px] md:h-[640px] lg:h-[calc(100%-2.5rem)] lg:min-h-[520px]"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_18%,rgba(186,150,72,.22),transparent_27%),radial-gradient(ellipse_at_72%_26%,rgba(63,109,75,.34),transparent_35%),radial-gradient(ellipse_at_54%_73%,rgba(42,99,89,.28),transparent_34%),linear-gradient(155deg,#17281d_0%,#0c1c17_48%,#071310_100%)]" />
      <div aria-hidden="true" className="absolute -left-[8%] top-[8%] h-[48%] w-[48%] rotate-[-10deg] rounded-[48%_52%_44%_56%] border border-amber-100/8 bg-[radial-gradient(ellipse_at_55%_48%,rgba(140,108,55,.30),rgba(38,62,43,.06)_68%,transparent_72%)]" />
      <div aria-hidden="true" className="absolute right-[-12%] top-[6%] h-[46%] w-[55%] rotate-[8deg] rounded-[54%_46%_58%_42%] border border-emerald-100/8 bg-[radial-gradient(ellipse_at_42%_55%,rgba(42,86,59,.42),rgba(21,47,35,.10)_68%,transparent_73%)]" />
      <div aria-hidden="true" className="absolute bottom-[-13%] left-[14%] h-[47%] w-[66%] rotate-[2deg] rounded-[50%] border border-cyan-100/5 bg-[radial-gradient(ellipse_at_50%_40%,rgba(42,91,82,.30),rgba(13,40,34,.08)_65%,transparent_72%)]" />

      <RiverSegment left="-8%" top="69%" width="31%" rotate={-10} />
      <RiverSegment left="18%" top="63%" width="30%" rotate={8} />
      <RiverSegment left="44%" top="67%" width="27%" rotate={-13} />
      <RiverSegment left="68%" top="59%" width="41%" rotate={-7} />

      <div aria-hidden="true" className="absolute bottom-[5%] left-[-3%] z-[3] h-[18%] w-[108%] rotate-[-2deg] bg-[linear-gradient(180deg,transparent,rgba(5,33,35,.55)_36%,rgba(2,22,27,.82))]" />
      <div aria-hidden="true" className="absolute right-[4%] top-[9%] z-[5] h-[25%] w-[22%] rotate-[14deg] rounded-[46%] bg-[repeating-linear-gradient(120deg,rgba(108,132,111,.12)_0_8px,rgba(18,46,34,.04)_8px_18px)] opacity-80" />
      <div aria-hidden="true" className="absolute left-[35%] top-[18%] z-[5] h-[22%] w-[18%] -rotate-[8deg] rounded-[48%] bg-[repeating-linear-gradient(60deg,rgba(158,130,77,.11)_0_7px,rgba(26,51,37,.03)_7px_17px)]" />

      <Road left="13%" top="16%" width="25%" rotate={14} />
      <Road left="13%" top="16%" width="18%" rotate={48} />
      <Road left="30%" top="34%" width="23%" rotate={22} />
      <Road left="47%" top="51%" width="25%" rotate={-8} />
      <Road left="48%" top="51%" width="20%" rotate={45} />
      <Road left="69%" top="70%" width="18%" rotate={-42} />

      <div data-qa="world-basin-capital-aura" aria-hidden="true" className="absolute left-[5%] top-[5%] z-[6] h-[24%] w-[23%] rounded-full bg-[radial-gradient(circle,rgba(245,194,92,.26),rgba(245,194,92,.07)_45%,transparent_72%)] blur-[2px]" />

      <div className="pointer-events-none absolute left-4 top-4 z-40 max-w-[14rem] rounded-2xl border border-amber-100/12 bg-black/30 px-3 py-2 backdrop-blur-md">
        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-amber-100/55">Aurelian Basin</p>
        <p className="mt-0.5 text-xs font-black text-amber-50">Terrain, roads and pressure first</p>
        <p className="mt-1 text-[9px] leading-snug text-amber-50/48">Sector state rides on the landscape instead of defining its shape.</p>
      </div>

      {sectors.map((sector) => {
        const position = basinPosition(sector);
        const control = controlFor(sector.id, owned, claimable);
        const selected = sector.id === selectedSectorId;
        const objective = sector.id === frontierTargetSectorId;
        const obsidian = obsidianPressure !== "none" && sector.id === "A-04";
        const style: CSSProperties = { left: `${position.left}%`, top: `${position.top}%` };

        return (
          <button
            key={sector.id}
            type="button"
            data-qa="world-sector-tile"
            data-world-marker="true"
            data-sector-id={sector.id}
            data-sector-x={sector.x}
            data-sector-y={sector.y}
            data-sector-kind={sector.kind}
            data-sector-control={control}
            data-sector-can-claim={canClaim.has(sector.id) ? "true" : "false"}
            data-sector-origin={sector.isOrigin ? "true" : "false"}
            data-sector-rival={sector.isRival ? "true" : "false"}
            data-sector-trade={sector.isTradeRich ? "true" : "false"}
            data-sector-danger={sector.isHighDanger ? "true" : "false"}
            data-nation-founded-owned={nationFounded && control === "owned" ? "true" : "false"}
            data-institution-capital={institutionCount > 0 && sector.isOrigin && control === "owned" ? "true" : "false"}
            data-frontier-objective={objective ? "true" : "false"}
            data-frontier-objective-complete={objective && frontierObjectiveComplete ? "true" : "false"}
            data-obsidian-pressure={obsidian ? obsidianPressure : "none"}
            aria-label={`Inspect sector ${sector.id} ${sector.name}`}
            onClick={() => onSelect(sector)}
            className={`${markerClasses(sector, control, selected)} h-[42px] min-w-[42px] px-2.5 md:h-[48px] md:min-w-[48px] md:px-3`}
            style={style}
          >
            <span className="block text-[9px] font-black leading-none md:text-[10px]">{sector.id}</span>
            <span className="mt-0.5 hidden max-w-[72px] truncate text-[7px] font-bold leading-none opacity-65 md:block">{sector.biome}</span>
            {sector.isOrigin ? <span className="absolute -right-1.5 -top-2 rounded-full border border-amber-100/40 bg-amber-100 px-1.5 py-0.5 text-[7px] font-black uppercase text-stone-900">Capital</span> : null}
            {objective ? <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-orange-100/40 bg-orange-950/85 px-1.5 py-0.5 text-[6px] font-black uppercase tracking-[0.1em] text-orange-100">Frontier</span> : null}
            {obsidian ? <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border border-red-100/70 bg-red-500 shadow-[0_0_12px_rgba(248,113,113,.75)]" /> : null}
          </button>
        );
      })}

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-40 flex items-end justify-between gap-3">
        <div className="rounded-xl border border-cyan-100/10 bg-black/25 px-2.5 py-1.5 text-[8px] font-bold text-cyan-50/60 backdrop-blur-sm">River corridor · southern basin</div>
        <div className="hidden rounded-xl border border-stone-100/10 bg-black/25 px-2.5 py-1.5 text-[8px] font-bold text-stone-100/55 backdrop-blur-sm sm:block">25 strategic markers · 100-sector world model preserved</div>
      </div>
    </div>
  );
}
