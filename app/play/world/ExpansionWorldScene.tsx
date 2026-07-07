"use client";

import { useMemo, useState } from "react";
import { canClaimSector, expansionInfluenceCost, getClaimableSectorIds, getOwnedSectorIds, type PlayAction, type PlayState } from "../lib/play-state";
import { buildWorldMapModel, getSectorLandSamples, type WorldMapSector } from "./world-map-selectors";

type TileState = "owned" | "claimable" | "locked";

export function ExpansionWorldScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const model = useMemo(() => buildWorldMapModel(), []);
  const owned = getOwnedSectorIds(state);
  const claimable = getClaimableSectorIds(state);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = model.sectors[selectedIndex] ?? model.sectors[0];
  const selectedState = getTileState(selected.id, owned, claimable);
  const status = canClaimSector(state, selected.id);
  const samples = useMemo(() => getSectorLandSamples(selected.index), [selected.index]);

  return (
    <section data-qa="world-map-scene" className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(251,191,36,.14),transparent_26%),linear-gradient(180deg,#07111b_0%,#030708_100%)]">
      <div className="absolute left-6 right-6 top-[6.6rem] z-10 flex items-start justify-between gap-4">
        <div className="max-w-[720px] rounded-3xl border border-sky-100/18 bg-black/42 p-4 shadow-2xl backdrop-blur-md">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-sky-200/65">Expansion loop v1</p>
          <h2 className="mt-1 text-4xl font-black text-amber-50">WorldMapScene · borders grow</h2>
          <p className="mt-1 text-sm leading-relaxed text-amber-50/65">Use the world map: adjacent sectors become targets, Influence pays expansion, and 3 sectors unlock nation scale.</p>
        </div>
        <div className="grid min-w-[430px] grid-cols-5 gap-2 text-center">
          <Metric label="Owned" value={owned.length} />
          <Metric label="Reach" value={claimable.length} />
          <Metric label="Influence" value={state.resources.influence} />
          <Metric label="Cost" value={expansionInfluenceCost} />
          <Metric label="Nation" value="3 sectors" />
        </div>
      </div>

      <div className="absolute bottom-[6.2rem] left-6 right-6 top-[13.8rem] grid grid-cols-[minmax(0,1fr)_360px] gap-3">
        <div className="min-h-0 rounded-[2rem] border border-sky-100/16 bg-black/28 p-4 shadow-[0_30px_90px_rgba(0,0,0,.48)] backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <Badge label="owned" tone="border-amber-200/70 bg-amber-300/20 text-amber-50" />
            <Badge label="claimable" tone="border-emerald-200/70 bg-emerald-300/16 text-emerald-50" />
            <Badge label="locked" tone="border-slate-100/20 bg-white/5 text-slate-200/70" />
          </div>
          <div className="grid h-[calc(100%-2.6rem)] min-h-[340px] grid-cols-10 grid-rows-10 gap-2">
            {model.sectors.map((sector) => <SectorTile key={sector.id} sector={sector} selected={sector.index === selected.index} state={getTileState(sector.id, owned, claimable)} onSelect={() => setSelectedIndex(sector.index)} />)}
          </div>
        </div>

        <aside data-qa="world-sector-inspect" data-expansion-state={selectedState} className="min-h-0 overflow-auto rounded-[2rem] border border-amber-100/16 bg-black/48 p-4 shadow-2xl backdrop-blur-md">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/60">Sector inspect</p>
          <h3 className="mt-2 text-3xl font-black text-amber-50">{selected.id}</h3>
          <p className="mt-1 text-sm font-black text-amber-100/80">{selected.name}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center"><Metric label="Biome" value={selected.biome} /><Metric label="Danger" value={selected.danger} /><Metric label="Trade" value={selected.trade} /></div>
          <div className="mt-3 rounded-2xl border border-amber-100/12 bg-amber-100/8 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/55">Expansion status</p>
            <p className="mt-1 text-sm font-black text-amber-50">{selectedState === "owned" ? "Inside your borders" : selectedState === "claimable" ? "Adjacent target" : "Beyond current reach"}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/60">Owned sectors: {owned.length}. Influence: {state.resources.influence}. Neighbors: {selected.neighbors.join(", ") || "edge"}.</p>
            <button data-qa="expand-sector" disabled={!status.ok} onClick={() => dispatch({ type: "claimSector", sectorId: selected.id })} className="mt-3 w-full rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition enabled:hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35">Expand sector</button>
          </div>
          <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Generated land samples</p>
          <div className="mt-2 space-y-2">
            {samples.slice(0, 4).map((land) => <div key={land.pnid} data-qa="world-land-sample" className="rounded-2xl border border-amber-100/10 bg-amber-100/7 p-2"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-amber-50">{land.name}</p><p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/50">{land.pnid}</p></div><p className="mt-1 text-[11px] text-amber-50/55">{land.role} · {land.faction} · D{land.danger} / F{land.fertility} / T{land.trade}</p></div>)}
          </div>
          <button onClick={() => dispatch({ type: "setView", view: "council" })} className="mt-4 w-full rounded-2xl bg-sky-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-sky-100">Council plan</button>
        </aside>
      </div>
    </section>
  );
}

function getTileState(sectorId: string, owned: string[], claimable: string[]): TileState { if (owned.includes(sectorId)) return "owned"; if (claimable.includes(sectorId)) return "claimable"; return "locked"; }
function SectorTile({ sector, selected, state, onSelect }: { sector: WorldMapSector; selected: boolean; state: TileState; onSelect: () => void }) {
  const style = state === "owned" ? "outline outline-2 outline-amber-200" : state === "claimable" ? "outline outline-2 outline-emerald-200/75" : "opacity-70";
  return <button type="button" data-qa="world-sector-tile" data-sector-id={sector.id} data-expansion-state={state} data-sector-origin={sector.isOrigin ? "true" : "false"} aria-label={`Inspect sector ${sector.id}`} onClick={onSelect} className={`relative overflow-hidden rounded-xl border border-sky-100/18 bg-sky-400/10 p-1 text-left text-sky-50 transition hover:scale-[1.02] ${style} ${selected ? "ring-2 ring-amber-200" : ""}`}><span className="block text-xs font-black leading-none">{sector.id}</span><span className="mt-0.5 block truncate text-[8px] opacity-70">{sector.biome}</span>{state === "owned" ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-200" /> : null}{state === "claimable" ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-200" /> : null}</button>;
}
function Badge({ label, tone }: { label: string; tone: string }) { return <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${tone}`}>{label}</span>; }
function Metric({ label, value }: { label: string | number; value: string | number }) { return <div className="rounded-2xl border border-sky-100/12 bg-black/30 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-[0.14em] text-sky-200/50">{label}</p><p className="truncate text-sm font-black text-amber-50">{value}</p></div>; }
