import { getRivalPressure, getWorldClaimedCount, type PlayAction, type PlayState } from "../lib/play-state";

const lanes = [
  { label: "Sector A-01", value: "30 charted", note: "Aurelian Basin playable demo slice", active: true },
  { label: "A-02 Northfold", value: "locked", note: "future rival frontier", active: false },
  { label: "B-17 Ash March", value: "distant", note: "future empire pressure", active: false },
  { label: "World Grid", value: "10,000 lands", note: "guilds, rivals, capitals, trade roads", active: true },
];

const rivals = [
  { name: "Crownstone", posture: "watching", threat: "border influence" },
  { name: "Iron Coast", posture: "arming", threat: "trade pressure" },
  { name: "Crowmere", posture: "raiding", threat: "frontier raids" },
];

export function WorldPanel({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const claimed = getWorldClaimedCount(state);
  const pressure = getRivalPressure(state);

  return (
    <aside data-qa="world-panel" className="absolute bottom-[4.7rem] right-3 z-20 max-h-[calc(100%-10rem)] w-[min(470px,calc(100%-1.5rem))] overflow-auto rounded-3xl border border-sky-100/20 bg-black/64 p-3 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:right-5 md:p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-sky-200/65">World view</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-amber-50 md:text-4xl">10,000 lands</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">The demo is one sector. The game direction is a world of lands, guild territories, rivals, trade roads and empire borders.</p>
        </div>
        <span className="rounded-full border border-sky-200/25 bg-sky-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-100">{claimed}/10000</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric label="Claimed" value={claimed} />
        <Metric label="Charted" value="30" />
        <Metric label="Pressure" value={`${pressure}%`} />
      </div>

      <div className="mt-4 space-y-2">
        {lanes.map((lane) => (
          <div key={lane.label} className={`rounded-2xl border p-3 ${lane.active ? "border-sky-100/28 bg-sky-100/10" : "border-amber-100/10 bg-white/5 opacity-70"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-amber-50">{lane.label}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-100/75">{lane.value}</p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{lane.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-red-200/18 bg-red-500/10 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-100/70">Rival pressure</p>
        <div className="mt-2 space-y-2">
          {rivals.map((rival) => (
            <div key={rival.name} className="flex items-center justify-between gap-3 rounded-xl bg-black/22 px-3 py-2">
              <div>
                <p className="text-sm font-black text-amber-50">{rival.name}</p>
                <p className="text-xs text-amber-50/55">{rival.threat}</p>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-100/75">{rival.posture}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button data-qa="world-open-map" onClick={() => dispatch({ type: "setView", view: "map" })} className="rounded-2xl border border-sky-100/20 bg-white/8 px-4 py-3 text-sm font-black text-amber-50 transition hover:bg-white/12">Sector map</button>
        <button data-qa="world-open-council" onClick={() => dispatch({ type: "setView", view: "council" })} className="rounded-2xl bg-sky-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-sky-100">Council plan</button>
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-sky-100/12 bg-black/28 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-sky-200/50">{label}</p>
      <p className="text-xl font-black text-amber-50">{value}</p>
    </div>
  );
}
