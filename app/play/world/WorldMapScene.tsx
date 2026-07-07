"use client";

import { useMemo, useState } from "react";
import type { PlayAction, PlayState } from "../lib/play-state";
import { buildWorldMapModel, getSectorLandSamples, type SectorKind, type WorldMapSector } from "./world-map-selectors";

const kindLabels: Record<SectorKind, string> = {
  origin: "Player origin",
  rival: "Rival realm",
  danger: "High danger",
  trade: "Trade-rich",
  frontier: "Frontier",
};

const kindClasses: Record<SectorKind, string> = {
  origin: "border-amber-200 bg-amber-300/30 text-amber-50 shadow-[0_0_28px_rgba(251,191,36,.35)]",
  rival: "border-slate-100/60 bg-slate-300/18 text-slate-50",
  danger: "border-red-300/60 bg-red-500/16 text-red-50",
  trade: "border-sky-200/60 bg-sky-400/16 text-sky-50",
  frontier: "border-emerald-100/20 bg-emerald-400/10 text-emerald-50",
};

export function WorldMapScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const model = useMemo(() => buildWorldMapModel(), []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = model.sectors[selectedIndex] ?? model.sectors[0];
  const samples = useMemo(() => getSectorLandSamples(selected.index), [selected.index]);

  return (
    <section data-qa="world-map-scene" className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(251,191,36,.14),transparent_26%),linear-gradient(180deg,#07111b_0%,#030708_100%)]">
      <div data-qa="world-panel" className="absolute inset-0" />
      <div className="absolute left-4 right-4 top-[5.7rem] z-10 flex flex-col gap-3 md:left-6 md:right-6 md:top-[6.6rem] lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[720px] rounded-3xl border border-sky-100/18 bg-black/42 p-3 shadow-2xl backdrop-blur-md md:p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-sky-200/65">Procedural world engine</p>
          <h2 className="mt-1 text-2xl font-black text-amber-50 md:text-4xl">WorldMapScene · 10,000 lands</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">Generated sectors are now visible as a map scene. Inspect a sector without losing the world grid.</p>
        </div>
        <div className="grid grid-cols-5 gap-1.5 text-center lg:min-w-[420px]">
          <Metric label="Seed" value={model.seed} />
          <Metric label="Sectors" value={model.sectors.length} />
          <Metric label="Rivals" value={model.counts.rival} />
          <Metric label="Trade" value={model.sectors.filter((sector) => sector.isTradeRich).length} />
          <Metric label="Danger" value={model.sectors.filter((sector) => sector.isHighDanger).length} />
        </div>
      </div>

      <div className="absolute bottom-[5.2rem] left-3 right-3 top-[14.8rem] grid gap-3 md:bottom-[6.2rem] md:left-6 md:right-6 md:top-[13.8rem] lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-h-0 rounded-[2rem] border border-sky-100/16 bg-black/28 p-3 shadow-[0_30px_90px_rgba(0,0,0,.48)] backdrop-blur-sm md:p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/60">Generated sectors</p>
            <Legend kind="origin" />
            <Legend kind="rival" />
            <Legend kind="danger" />
            <Legend kind="trade" />
            <Legend kind="frontier" />
          </div>
          <div className="grid h-[calc(100%-2.8rem)] min-h-[340px] grid-cols-10 grid-rows-10 gap-1.5 md:gap-2">
            {model.sectors.map((sector) => (
              <SectorTile key={sector.id} sector={sector} selected={sector.index === selected.index} onSelect={() => setSelectedIndex(sector.index)} />
            ))}
          </div>
        </div>

        <aside data-qa="world-sector-inspect" className="min-h-0 overflow-auto rounded-[2rem] border border-amber-100/16 bg-black/48 p-3 shadow-2xl backdrop-blur-md md:p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/60">Sector inspect</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-amber-50">{selected.id}</h3>
              <p className="mt-1 text-sm font-black text-amber-100/80">{selected.name}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${kindClasses[selected.kind]}`}>{kindLabels[selected.kind]}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Metric label="Biome" value={selected.biome} />
            <Metric label="Danger" value={selected.danger} />
            <Metric label="Trade" value={selected.trade} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-amber-50/58">Generated land samples remain inside the inspect drawer while the world map stays visible. Neighbors: {selected.neighbors.join(", ") || "edge"}.</p>
          <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Generated land samples</p>
          <div className="mt-2 space-y-2">
            {samples.map((land) => (
              <div key={land.pnid} data-qa="world-land-sample" className="rounded-2xl border border-amber-100/10 bg-amber-100/7 p-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-amber-50">{land.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/50">{land.pnid}</p>
                </div>
                <p className="mt-1 text-[11px] text-amber-50/55">{land.role} · {land.faction} · D{land.danger} / F{land.fertility} / T{land.trade} / I{land.influence}</p>
              </div>
            ))}
          </div>
          <button onClick={() => dispatch({ type: "setView", view: "council" })} className="mt-4 w-full rounded-2xl bg-sky-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-sky-100">Council plan</button>
        </aside>
      </div>
    </section>
  );
}

function SectorTile({ sector, selected, onSelect }: { sector: WorldMapSector; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      data-qa="world-sector-tile"
      data-sector-id={sector.id}
      data-sector-x={sector.x}
      data-sector-y={sector.y}
      data-sector-kind={sector.kind}
      data-sector-origin={sector.isOrigin ? "true" : "false"}
      data-sector-rival={sector.isRival ? "true" : "false"}
      data-sector-trade={sector.isTradeRich ? "true" : "false"}
      data-sector-danger={sector.isHighDanger ? "true" : "false"}
      aria-label={`Inspect sector ${sector.id} ${sector.name}`}
      onClick={onSelect}
      className={`relative overflow-hidden rounded-xl border p-1 text-left transition hover:scale-[1.02] hover:border-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200/80 ${kindClasses[sector.kind]} ${selected ? "ring-2 ring-amber-200" : ""}`}
    >
      <span className="block text-[9px] font-black leading-none md:text-xs">{sector.id}</span>
      <span className="mt-0.5 hidden truncate text-[8px] opacity-70 md:block">{sector.biome}</span>
      <span className="absolute bottom-1 right-1 text-[8px] font-black opacity-70">{sector.trade}</span>
      {sector.isHighDanger ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-300" /> : null}
      {sector.isTradeRich ? <span className="absolute bottom-1 left-1 h-2 w-2 rounded-full bg-sky-200" /> : null}
    </button>
  );
}

function Legend({ kind }: { kind: SectorKind }) {
  return <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${kindClasses[kind]}`}>{kindLabels[kind]}</span>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-sky-100/12 bg-black/30 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-sky-200/50">{label}</p>
      <p className="truncate text-xs font-black text-amber-50 md:text-sm">{value}</p>
    </div>
  );
}
