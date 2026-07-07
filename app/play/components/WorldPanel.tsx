import { getRivalPressure, getWorldClaimedCount, type PlayAction, type PlayState } from "../lib/play-state";
import { getSampleWorldLands, getWorldSectors, getWorldSummary, type WorldLand } from "../lib/world-engine";

export function WorldPanel({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const claimed = getWorldClaimedCount(state);
  const pressure = getRivalPressure(state);
  const summary = getWorldSummary();
  const sectors = getWorldSectors().slice(0, 8);
  const sampleLands = getSampleWorldLands();

  return (
    <aside data-qa="world-panel" className="absolute bottom-[4.7rem] right-3 z-20 max-h-[calc(100%-10rem)] w-[min(520px,calc(100%-1.5rem))] overflow-auto rounded-3xl border border-sky-100/20 bg-black/64 p-3 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:right-5 md:p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-sky-200/65">Procedural world engine</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-amber-50 md:text-4xl">{summary.lands.toLocaleString("en-US")} lands</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">Seed {summary.seed}: sectors, land ids, topology, biomes, factions, danger, trade and influence.</p>
        </div>
        <span className="rounded-full border border-sky-200/25 bg-sky-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-100">{claimed}/{summary.lands}</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <Metric label="Sectors" value={summary.sectors} />
        <Metric label="Rivals" value={summary.rivalSectors} />
        <Metric label="Trade" value={summary.tradeSectors} />
        <Metric label="Pressure" value={`${pressure}%`} />
      </div>

      <div className="mt-4 rounded-2xl border border-sky-100/16 bg-sky-100/8 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/60">Generated sectors</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {sectors.map((sector) => (
            <div key={sector.id} data-qa={`world-sector-${sector.id}`} className="rounded-xl border border-sky-100/12 bg-black/24 p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black text-amber-50">{sector.id}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-sky-100/70">{sector.faction}</p>
              </div>
              <p className="mt-1 text-[11px] text-amber-50/55">{sector.name} · {sector.biome} · [{sector.x},{sector.y}]</p>
              <p className="mt-1 text-[10px] text-amber-50/45">D{sector.danger} / T{sector.trade} / neighbors {sector.neighbors.join(", ") || "edge"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-amber-100/14 bg-amber-100/8 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-100/60">Generated land samples</p>
        <div className="mt-2 space-y-2">
          {sampleLands.slice(0, 6).map((land) => <LandRow key={land.pnid} land={land} />)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button data-qa="world-open-map" onClick={() => dispatch({ type: "setView", view: "map" })} className="rounded-2xl border border-sky-100/20 bg-white/8 px-4 py-3 text-sm font-black text-amber-50 transition hover:bg-white/12">Sector map</button>
        <button data-qa="world-open-council" onClick={() => dispatch({ type: "setView", view: "council" })} className="rounded-2xl bg-sky-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-sky-100">Council plan</button>
      </div>
    </aside>
  );
}

function LandRow({ land }: { land: WorldLand }) {
  return (
    <div data-qa={`world-land-${land.id}`} className="rounded-xl border border-amber-100/10 bg-black/24 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-amber-50">{land.name}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/55">{land.pnid}</p>
      </div>
      <p className="mt-1 text-xs text-amber-50/55">{land.sectorId} · [{land.x},{land.y}] · {land.biome} · {land.role} · {land.faction}</p>
      <p className="mt-1 text-[10px] text-amber-50/42">D{land.danger} / F{land.fertility} / T{land.trade} / I{land.influence} / neighbors {land.neighbors.join(", ") || "edge"}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-sky-100/12 bg-black/28 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-sky-200/50">{label}</p>
      <p className="text-lg font-black text-amber-50">{value}</p>
    </div>
  );
}
