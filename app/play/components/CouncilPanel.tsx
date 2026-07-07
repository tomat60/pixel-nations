import { getDevelopmentScore, getPhase, getPopulation, getRivalPressure, type PlayAction, type PlayState } from "../lib/play-state";

const roadmap = [
  { label: "Land", detail: "claim one homeland", done: (state: PlayState) => state.ownedPlotIds.length > 0 },
  { label: "Settlement", detail: "raise shelter + storehouse", done: (state: PlayState) => state.settlementMarkers.includes("shelter") && state.settlementMarkers.includes("storehouse") },
  { label: "Village", detail: "market + council + watch", done: (state: PlayState) => state.settlementMarkers.includes("market") && state.settlementMarkers.includes("council") && state.settlementMarkers.includes("watch") },
  { label: "City", detail: "next sprint: districts, workers, laws", done: () => false },
  { label: "Nation", detail: "future: borders, diplomacy, army", done: () => false },
  { label: "Empire", detail: "future: sectors, guilds, world pressure", done: () => false },
];

export function CouncilPanel({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const phase = getPhase(state);
  const pressure = getRivalPressure(state);
  const score = getDevelopmentScore(state);
  const population = getPopulation(state);
  const completed = roadmap.filter((item) => item.done(state)).length;

  return (
    <aside data-qa="council-panel" className="absolute bottom-[4.7rem] right-3 z-20 max-h-[calc(100%-10rem)] w-[min(500px,calc(100%-1.5rem))] overflow-auto rounded-3xl border border-amber-100/20 bg-black/66 p-3 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:right-5 md:p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/65">Council chamber</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-amber-50 md:text-4xl">From land to empire</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">This screen makes the strategy visible: grow one land, stabilize a village, answer rivals, then expand toward nation-scale play.</p>
        </div>
        <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">{completed}/6</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <Metric label="Phase" value={phase} />
        <Metric label="People" value={population} />
        <Metric label="Dev" value={score} />
        <Metric label="Rivals" value={`${pressure}%`} />
      </div>

      <div className="mt-4 space-y-2">
        {roadmap.map((item) => {
          const done = item.done(state);
          return (
            <div key={item.label} data-qa={`roadmap-${item.label.toLowerCase()}`} className={`rounded-2xl border p-3 ${done ? "border-emerald-200/30 bg-emerald-300/10" : "border-amber-100/12 bg-white/5"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-amber-50">{item.label}</p>
                <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${done ? "text-emerald-100" : "text-amber-100/45"}`}>{done ? "done" : "next"}</p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{item.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-100/14 bg-amber-100/8 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Latest chronicle</p>
        <p className="mt-1 text-sm font-black text-amber-50">{state.chronicle[0]?.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{state.chronicle[0]?.body}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button data-qa="council-open-orders" onClick={() => dispatch({ type: "setView", view: "orders" })} className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-amber-200">Issue orders</button>
        <button data-qa="council-open-village" onClick={() => dispatch({ type: "setView", view: "village" })} className="rounded-2xl border border-amber-100/18 bg-white/8 px-4 py-3 text-sm font-black text-amber-50 transition hover:bg-white/12">Enter village</button>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-100/12 bg-black/28 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/50">{label}</p>
      <p className="text-sm font-black text-amber-50 md:text-base">{value}</p>
    </div>
  );
}
