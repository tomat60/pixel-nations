"use client";

import { useMemo, useState } from "react";
import { canClaimSector, expansionInfluenceCost, getClaimableSectorIds, getNationDecision, getNationReady, getOwnedSectorIds, type PlayAction, type PlayState } from "../lib/play-state";
import { buildWorldMapModel, getSectorLandSamples, type SectorKind, type WorldMapSector } from "./world-map-selectors";

type SectorControl = "owned" | "claimable" | "locked";

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

const controlClasses: Record<SectorControl, string> = {
  owned: "ring-2 ring-amber-200 border-amber-100 bg-amber-300/30",
  claimable: "ring-2 ring-lime-200/70 border-lime-200 bg-lime-300/18",
  locked: "opacity-55 saturate-75",
};

export function WorldMapScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const model = useMemo(() => buildWorldMapModel(), []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = model.sectors[selectedIndex] ?? model.sectors[0];
  const samples = useMemo(() => getSectorLandSamples(selected.index), [selected.index]);
  const ownedSectorIds = getOwnedSectorIds(state);
  const claimableSectorIds = getClaimableSectorIds(state);
  const nationReady = getNationReady(state);
  const nationDecision = getNationDecision(state);
  const selectedExpansion = canClaimSector(state, selected.id);
  const selectedControl = getSectorControl(selected.id, ownedSectorIds, claimableSectorIds);
  const nextGoal = nationDecision ? nationDecision.label : nationReady ? "Choose founding doctrine" : `${Math.max(0, 3 - ownedSectorIds.length)} more sector${3 - ownedSectorIds.length === 1 ? "" : "s"} to found a nation`;

  return (
    <section data-qa="world-map-scene" data-owned-count={ownedSectorIds.length} data-influence={state.resources.influence} data-nation-ready={nationReady ? "true" : "false"} data-nation-decision={nationDecision?.id ?? "none"} className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(56,189,248,.16),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(251,191,36,.14),transparent_26%),linear-gradient(180deg,#07111b_0%,#030708_100%)]">
      <div data-qa="world-panel" className="pointer-events-none absolute inset-0" />
      <div data-qa="expansion-hud" className="absolute left-4 right-4 top-[5.7rem] z-10 flex flex-col gap-3 md:left-6 md:right-6 md:top-[6.6rem] lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[720px] rounded-3xl border border-sky-100/18 bg-black/42 p-3 shadow-2xl backdrop-blur-md md:p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-sky-200/65">Expansion / Nation Loop v1</p>
          <h2 className="mt-1 text-2xl font-black text-amber-50 md:text-4xl">WorldMapScene · 10,000 lands</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">Claim adjacent sectors with Influence. Owned borders create the first path from one land toward nation scale.</p>
        </div>
        <div className="grid grid-cols-5 gap-1.5 text-center lg:min-w-[460px]">
          <Metric label="Owned" value={ownedSectorIds.length} />
          <Metric label="Influence" value={state.resources.influence} />
          <Metric label="Cost" value={expansionInfluenceCost} />
          <Metric label="Claimable" value={claimableSectorIds.length} />
          <Metric label="Goal" value={nextGoal} />
        </div>
      </div>

      <div className="absolute bottom-[5.2rem] left-3 right-3 top-[14.8rem] flex flex-col gap-3 overflow-y-auto pb-6 md:bottom-[6.2rem] md:left-6 md:right-6 md:top-[13.8rem] lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:overflow-hidden lg:pb-0">
        <div className="shrink-0 rounded-[2rem] border border-sky-100/16 bg-black/28 p-3 shadow-[0_30px_90px_rgba(0,0,0,.48)] backdrop-blur-sm md:p-4 lg:min-h-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/60">Generated sectors</p>
            <Legend label="Owned" tone="border-amber-200/80 bg-amber-300/20 text-amber-50" />
            <Legend label="Claimable" tone="border-lime-200/80 bg-lime-300/18 text-lime-50" />
            <Legend label="Locked" tone="border-slate-200/20 bg-slate-300/8 text-slate-100/65" />
          </div>
          <div className="grid h-[420px] grid-cols-10 grid-rows-10 gap-1.5 md:h-[520px] md:gap-2 lg:h-[calc(100%-2.8rem)] lg:min-h-[340px]">
            {model.sectors.map((sector) => (
              <SectorTile key={sector.id} sector={sector} control={getSectorControl(sector.id, ownedSectorIds, claimableSectorIds)} selected={sector.index === selected.index} onSelect={() => setSelectedIndex(sector.index)} canClaim={canClaimSector(state, sector.id).ok} />
            ))}
          </div>
        </div>

        <aside data-qa="world-sector-inspect" data-sector-control={selectedControl} className="shrink-0 rounded-[2rem] border border-amber-100/16 bg-black/48 p-3 shadow-2xl backdrop-blur-md md:p-4 lg:min-h-0 lg:overflow-auto">
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
          <div data-qa="expansion-status" data-expansion-status={selectedExpansion.ok ? "claimable" : selectedExpansion.reason ?? "blocked"} className={`mt-3 rounded-2xl border p-3 ${selectedExpansion.ok ? "border-lime-200/35 bg-lime-300/10" : "border-amber-100/14 bg-amber-100/8"}`}>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/55">Expansion status</p>
            <p className="mt-1 text-sm font-black text-amber-50">{selectedControl === "owned" ? "Inside your borders" : selectedExpansion.ok ? "Adjacent and affordable" : expansionStatusCopy(selectedExpansion.reason)}</p>
            <button data-qa="claim-sector-button" disabled={!selectedExpansion.ok} onClick={() => dispatch({ type: "claimSector", sectorId: selected.id })} className="mt-3 w-full rounded-2xl bg-lime-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-lime-100 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35">Claim sector · {expansionInfluenceCost} Influence</button>
          </div>
          {nationDecision ? <div data-qa="nation-world-effect" className="mt-3 rounded-2xl border border-emerald-200/35 bg-emerald-300/12 p-3"><p className="text-sm font-black text-amber-50">Nation doctrine active</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">{nationDecision.label}: {nationDecision.effect}</p></div> : nationReady ? <div data-qa="nation-affordance" className="mt-3 rounded-2xl border border-amber-200/35 bg-amber-300/12 p-3"><p className="text-sm font-black text-amber-50">Nation threshold reached</p><p className="mt-1 text-xs leading-relaxed text-amber-50/62">Three sectors now answer to your council. Open Council to choose the founding doctrine.</p></div> : null}
          <p className="mt-3 text-xs leading-relaxed text-amber-50/58">Land samples stay in this drawer while the world map remains visible. Neighbors: {selected.neighbors.join(", ") || "edge"}.</p>
          <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Generated land samples</p>
          <div className="mt-2 space-y-2">{samples.map((land) => <div key={land.pnid} data-qa="world-land-sample" className="rounded-2xl border border-amber-100/10 bg-amber-100/7 p-2"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-amber-50">{land.name}</p><p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/50">{land.pnid}</p></div><p className="mt-1 text-[11px] text-amber-50/55">{land.role} · {land.faction} · D{land.danger} / F{land.fertility} / T{land.trade} / I{land.influence}</p></div>)}</div>
          <button onClick={() => dispatch({ type: "setView", view: "council" })} className="mt-4 w-full rounded-2xl bg-sky-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-sky-100">Council plan</button>
        </aside>
      </div>
    </section>
  );
}

function getSectorControl(sectorId: string, owned: string[], claimable: string[]): SectorControl {
  if (owned.includes(sectorId)) return "owned";
  if (claimable.includes(sectorId)) return "claimable";
  return "locked";
}

function expansionStatusCopy(reason?: string) {
  if (reason === "no-homeland") return "Claim a homeland first";
  if (reason === "already-owned") return "Already owned";
  if (reason === "insufficient-influence") return "Need more Influence";
  if (reason === "not-adjacent") return "Locked: not adjacent";
  return "Blocked";
}

function SectorTile({ sector, control, selected, onSelect, canClaim }: { sector: WorldMapSector; control: SectorControl; selected: boolean; onSelect: () => void; canClaim: boolean }) {
  return <button type="button" data-qa="world-sector-tile" data-sector-id={sector.id} data-sector-x={sector.x} data-sector-y={sector.y} data-sector-kind={sector.kind} data-sector-control={control} data-sector-can-claim={canClaim ? "true" : "false"} data-sector-origin={sector.isOrigin ? "true" : "false"} data-sector-rival={sector.isRival ? "true" : "false"} data-sector-trade={sector.isTradeRich ? "true" : "false"} data-sector-danger={sector.isHighDanger ? "true" : "false"} aria-label={`Inspect sector ${sector.id} ${sector.name}`} onClick={onSelect} className={`relative overflow-hidden rounded-xl border p-1 text-left transition hover:scale-[1.02] hover:border-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200/80 ${kindClasses[sector.kind]} ${controlClasses[control]} ${selected ? "ring-2 ring-white" : ""}`}><span className="block text-[9px] font-black leading-none md:text-xs">{sector.id}</span><span className="mt-0.5 hidden truncate text-[8px] opacity-70 md:block">{sector.biome}</span><span className="absolute bottom-1 right-1 text-[8px] font-black opacity-70">{sector.trade}</span>{control === "claimable" ? <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-lime-200" /> : null}{sector.isHighDanger ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-300" /> : null}</button>;
}

function Legend({ label, tone }: { label: string; tone: string }) { return <span className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${tone}`}>{label}</span>; }
function Metric({ label, value }: { label: string | number; value: string | number }) { return <div className="rounded-2xl border border-sky-100/12 bg-black/30 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-[0.14em] text-sky-200/50">{label}</p><p className="truncate text-xs font-black text-amber-50 md:text-sm">{value}</p></div>; }
