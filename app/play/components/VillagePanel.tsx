import { getDevelopmentScore, getOwnedPlot, getPhase, getPopulation, type PlayAction, type PlayState, type SettlementMarker } from "../lib/play-state";

const districts: Array<{ id: SettlementMarker; label: string; empty: string; built: string }> = [
  { id: "camp", label: "Campfire Core", empty: "No banner yet", built: "first people gathered" },
  { id: "shelter", label: "Shelter Row", empty: "raise shelter", built: "homes protected" },
  { id: "storehouse", label: "Storehouse", empty: "build storehouse", built: "surplus stored" },
  { id: "market", label: "Market Path", empty: "open market path", built: "trade lane active" },
  { id: "council", label: "Council Hall", empty: "form council", built: "laws and plans" },
  { id: "watch", label: "Watch Post", empty: "fortify watch", built: "defense online" },
];

export function VillagePanel({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const owned = getOwnedPlot(state);
  const phase = getPhase(state);
  const population = getPopulation(state);
  const score = getDevelopmentScore(state);
  const hasClaim = state.ownedPlotIds.length > 0;

  return (
    <aside data-qa="village-panel" className="absolute bottom-[4.7rem] left-3 right-3 z-20 max-h-[calc(100%-10rem)] overflow-auto rounded-3xl border border-amber-100/20 bg-black/62 p-3 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:left-5 md:right-auto md:w-[470px] md:p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/65">Village interior</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-amber-50 md:text-4xl">{owned?.name ?? "No homeland"}</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">This is where one land becomes a village, then a city core, then a nation capital.</p>
        </div>
        <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">{phase}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric label="People" value={population} />
        <Metric label="Dev" value={score} />
        <Metric label="Season" value={`${state.season}/12`} />
      </div>

      {!hasClaim ? (
        <div className="mt-4 rounded-2xl border border-amber-100/16 bg-amber-100/8 p-4">
          <p className="text-sm font-black text-amber-50">Choose a land on the map first.</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/62">The village interior appears after the first banner is raised.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {districts.map((district) => {
              const built = state.settlementMarkers.includes(district.id);
              return (
                <div key={district.id} data-qa={`district-${district.id}`} className={`rounded-2xl border p-3 ${built ? "border-amber-200/35 bg-amber-200/14" : "border-amber-100/12 bg-white/5"}`}>
                  <p className="text-sm font-black text-amber-50">{district.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{built ? district.built : district.empty}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button data-qa="village-open-orders" onClick={() => dispatch({ type: "setView", view: "orders" })} className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-amber-200">Develop next</button>
            <button data-qa="village-open-world" onClick={() => dispatch({ type: "setView", view: "world" })} className="rounded-2xl border border-amber-100/18 bg-white/8 px-4 py-3 text-sm font-black text-amber-50 transition hover:bg-white/12">See world</button>
          </div>
        </>
      )}
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-100/12 bg-black/28 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/50">{label}</p>
      <p className="text-xl font-black text-amber-50">{value}</p>
    </div>
  );
}
