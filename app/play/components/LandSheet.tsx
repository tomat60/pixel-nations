import { roleLine, terrainLine, type Plot } from "../lib/map-data";
import { getPhase, type PlayAction, type PlayState } from "../lib/play-state";

export function LandSheet({ selected, state, dispatch }: { selected: Plot; state: PlayState; dispatch: (action: PlayAction) => void }) {
  const phase = getPhase(state);
  const owned = state.ownedPlotIds.includes(selected.id);

  return (
    <aside className="absolute bottom-[4.7rem] left-3 right-3 z-20 rounded-3xl border border-amber-100/20 bg-black/55 p-3 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:left-5 md:right-auto md:w-[380px] md:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/65">{selected.pnid} · {selected.role}</p>
          <h2 className="mt-1 text-xl font-black md:text-3xl">{selected.name}</h2>
          <p className="mt-1 text-xs text-amber-50/72 md:text-sm">{selected.region} - {selected.terrain}</p>
        </div>
        {owned ? <Tag label={phase} tone="gold" /> : selected.rival ? <Tag label="Rival" tone="slate" /> : selected.trade ? <Tag label="Route" tone="blue" /> : null}
      </div>

      {phase === "unclaimed" ? <p className="mt-3 rounded-2xl border border-amber-200/25 bg-amber-300/12 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-100">First move: claim one land, then build a village.</p> : null}
      <p className="mt-2 text-xs leading-relaxed text-amber-50/66 md:text-sm">{terrainLine[selected.terrain]}</p>
      <p className="mt-2 text-xs leading-relaxed text-amber-100/78 md:text-sm">{roleLine[selected.role]}</p>
      <p className="mt-2 text-xs leading-relaxed text-amber-50/66 md:text-sm">{selected.strategicValue}</p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200/55">{selected.resources.join(" / ")}</p>

      {phase === "unclaimed" ? (
        <button data-qa="claim-button" onClick={() => dispatch({ type: "claim", plotId: selected.id })} className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-amber-200">
          Claim this land
        </button>
      ) : owned ? (
        <p className="mt-3 rounded-2xl border border-amber-100/20 bg-amber-100/10 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-amber-100">{state.completedOrders.length} orders complete · settlement is changing on map</p>
      ) : (
        <p className="mt-3 rounded-2xl border border-amber-100/20 bg-amber-100/10 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-amber-100">inspect target · claim already chosen</p>
      )}
    </aside>
  );
}

function Tag({ label, tone }: { label: string; tone: "gold" | "slate" | "blue" }) {
  const toneClass = tone === "gold" ? "bg-amber-300 text-stone-950" : tone === "blue" ? "bg-sky-200/20 text-sky-100 border border-sky-100/30" : "bg-slate-200/14 text-slate-100 border border-slate-200/30";
  return <p className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${toneClass}`}>{label}</p>;
}
