import { getRivalPressure, getWorldClaimedCount, type PlayAction, type PlayState } from "../lib/play-state";
import { getSampleWorldLands, getWorldSectors, getWorldSummary } from "../lib/world-engine";

export function WorldScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const claimed = getWorldClaimedCount(state);
  const pressure = getRivalPressure(state);
  const summary = getWorldSummary();
  const sectors = getWorldSectors().slice(0, 12);
  const sampleLands = getSampleWorldLands().slice(0, 8);

  return (
    <div data-qa="world-scene" className="absolute inset-0 overflow-hidden bg-[#07111a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,.18),transparent_34%),radial-gradient(circle_at_18%_70%,rgba(251,191,36,.16),transparent_28%),linear-gradient(180deg,#102235_0%,#07111a_54%,#03070b_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[82vmin] w-[82vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-100/12 bg-sky-100/5 shadow-[0_0_90px_rgba(56,189,248,.18)]" />
      <div className="absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/10" />

      {sectors.map((sector, index) => {
        const angle = (index / sectors.length) * Math.PI * 2 - Math.PI / 2;
        const radius = index < 4 ? 18 : index < 8 ? 28 : 38;
        const left = 50 + Math.cos(angle) * radius;
        const top = 52 + Math.sin(angle) * radius;
        const active = sector.id === "A-01" || sector.id === "A-02";
        return (
          <button key={sector.id} data-qa={`world-scene-sector-${sector.id}`} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-3xl border px-3 py-2 text-left shadow-2xl transition hover:scale-105 ${active ? "border-amber-200/55 bg-amber-200/20 text-amber-50" : "border-sky-100/18 bg-black/34 text-sky-50/72"}`} style={{ left: `${left}%`, top: `${top}%` }}>
            <p className="text-sm font-black md:text-base">{sector.id}</p>
            <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.12em] opacity-75">{sector.faction}</p>
            <p className="mt-1 hidden text-[10px] opacity-60 md:block">{sector.biome} · D{sector.danger} · T{sector.trade}</p>
          </button>
        );
      })}

      <div className="absolute left-3 top-[5.6rem] z-20 max-w-[330px] rounded-3xl border border-sky-100/20 bg-black/50 p-3 shadow-2xl backdrop-blur-md md:left-5 md:top-[6.4rem] md:max-w-[480px] md:p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-sky-200/65">World scene</p>
        <h2 className="mt-1 text-2xl font-black text-amber-50 md:text-4xl">{summary.lands.toLocaleString("en-US")} lands, one living atlas</h2>
        <p className="mt-2 text-xs leading-relaxed text-amber-50/68 md:text-sm">A playable atlas scene: sectors orbit the homeland, pressure rises, and expansion targets become visible map objects.</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <Metric label="Sectors" value={summary.sectors} />
          <Metric label="Claimed" value={claimed} />
          <Metric label="Rivals" value={summary.rivalSectors} />
          <Metric label="Pressure" value={`${pressure}%`} />
        </div>
      </div>

      <div className="absolute bottom-[5rem] left-3 right-3 z-20 rounded-3xl border border-sky-100/16 bg-black/54 p-3 shadow-2xl backdrop-blur-md md:bottom-[6rem] md:left-auto md:right-5 md:w-[520px] md:p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/60">Nearby generated lands</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {sampleLands.map((land) => (
            <div key={land.pnid} data-qa={`world-scene-land-${land.id}`} className="rounded-2xl border border-sky-100/12 bg-white/6 px-3 py-2">
              <p className="text-xs font-black text-amber-50 md:text-sm">{land.name}</p>
              <p className="mt-1 text-[10px] text-amber-50/55">{land.pnid} · {land.biome} · {land.role}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button data-qa="world-scene-open-map" onClick={() => dispatch({ type: "setView", view: "map" })} className="rounded-2xl border border-sky-100/20 bg-white/8 px-4 py-3 text-sm font-black text-amber-50 transition hover:bg-white/12">Sector map</button>
          <button data-qa="world-scene-open-council" onClick={() => dispatch({ type: "setView", view: "council" })} className="rounded-2xl bg-sky-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30">Council plan</button>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-sky-100/12 bg-black/28 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-sky-200/50">{label}</p>
      <p className="text-sm font-black text-amber-50 md:text-lg">{value}</p>
    </div>
  );
}
