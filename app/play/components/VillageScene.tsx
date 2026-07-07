import type { PlayAction, PlayState, SettlementMarker } from "../lib/play-state";
import { getDevelopmentScore, getOwnedPlot, getPhase, getPopulation } from "../lib/play-state";

type VillagePlotId = "camp" | "shelter" | "storehouse" | "market" | "council" | "watch" | "fields" | "road";
type PlotState = "empty" | "building" | "built";

type VillagePlot = {
  id: VillagePlotId;
  marker?: SettlementMarker;
  label: string;
  hint: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const villagePlots: VillagePlot[] = [
  { id: "camp", marker: "camp", label: "Campfire Core", hint: "first people gathered", x: 38, y: 49, w: 18, h: 13 },
  { id: "shelter", marker: "shelter", label: "Shelter Row", hint: "homes protect the first families", x: 20, y: 34, w: 20, h: 14 },
  { id: "storehouse", marker: "storehouse", label: "Storehouse", hint: "surplus becomes permanent", x: 59, y: 32, w: 20, h: 15 },
  { id: "market", marker: "market", label: "Market Path", hint: "trade reaches the Old Road", x: 62, y: 60, w: 25, h: 12 },
  { id: "council", marker: "council", label: "Council Hall", hint: "laws and city plans begin", x: 40, y: 22, w: 20, h: 14 },
  { id: "watch", marker: "watch", label: "Watch Post", hint: "rivals see a defended border", x: 77, y: 17, w: 13, h: 17 },
  { id: "fields", label: "Food Terraces", hint: "food orders fill the terraces", x: 13, y: 60, w: 22, h: 17 },
  { id: "road", label: "Village Road", hint: "paths bind districts together", x: 42, y: 67, w: 26, h: 9 },
];

export function VillageScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const owned = getOwnedPlot(state);
  const phase = getPhase(state);
  const population = getPopulation(state);
  const score = getDevelopmentScore(state);
  const hasClaim = state.ownedPlotIds.length > 0;

  return (
    <section data-qa="village-scene" className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(251,191,36,.20),transparent_34%),linear-gradient(180deg,#162015_0%,#07100d_100%)]">
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <div className="absolute left-[6%] top-[13%] h-[28%] w-[28%] rounded-full bg-emerald-700/18 blur-3xl" />
        <div className="absolute right-[8%] top-[14%] h-[22%] w-[24%] rounded-full bg-sky-500/12 blur-3xl" />
        <div className="absolute bottom-[7%] left-[18%] h-[26%] w-[52%] rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="absolute left-4 right-4 top-[5.7rem] z-10 flex items-start justify-between gap-3 md:left-6 md:right-6 md:top-[6.6rem]">
        <div className="max-w-[560px] rounded-3xl border border-amber-100/18 bg-black/42 p-3 shadow-2xl backdrop-blur-md md:p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/65">Village scene</p>
          <h2 className="mt-1 text-2xl font-black text-amber-50 md:text-4xl">{owned?.name ?? "No homeland"}</h2>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/65 md:text-sm">Orders must change the land below, not just the sidebar. Build the first visible districts here.</p>
        </div>
        <div className="hidden grid-cols-3 gap-2 text-center md:grid">
          <Metric label="Phase" value={phase} />
          <Metric label="People" value={population} />
          <Metric label="Dev" value={score} />
        </div>
      </div>

      <div className="absolute bottom-[5.2rem] left-3 right-3 top-[12.2rem] z-0 md:bottom-[6.2rem] md:left-6 md:right-6 md:top-[13.6rem]">
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-amber-100/18 bg-[#263f25] shadow-[0_30px_90px_rgba(0,0,0,.45)]">
          <VillageGround />
          <VillageRoads />
          {villagePlots.map((plot) => <VillagePlotNode key={plot.id} plot={plot} state={state} />)}
          {!hasClaim ? <UnclaimedOverlay dispatch={dispatch} /> : null}
        </div>
      </div>

      {hasClaim ? (
        <div className="absolute bottom-[5.5rem] right-5 z-20 hidden max-w-[280px] rounded-3xl border border-amber-100/18 bg-black/48 p-3 shadow-2xl backdrop-blur-md lg:block">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Latest order</p>
          <p className="mt-1 text-sm font-black text-amber-50">{state.lastEvent}</p>
          <button data-qa="village-scene-open-orders" onClick={() => dispatch({ type: "setView", view: "orders" })} className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-200">Issue next order</button>
        </div>
      ) : null}
    </section>
  );
}

function VillagePlotNode({ plot, state }: { plot: VillagePlot; state: PlayState }) {
  const built = plot.marker ? state.settlementMarkers.includes(plot.marker) : plot.id === "fields" ? state.completedOrders.includes("gather-food") : state.completedOrders.includes("open-market");
  const building = !built && plot.marker ? plannedSoon(plot.marker, state) : false;
  const qaState: PlotState = built ? "built" : building ? "building" : "empty";

  return (
    <div data-qa="village-plot" data-qa-id={plot.id} data-qa-state={qaState} className={`absolute rounded-[1.2rem] border p-2 shadow-xl transition-all duration-300 ${qaState === "built" ? "border-amber-100/55 bg-amber-200/22 shadow-amber-950/40" : qaState === "building" ? "border-amber-200/35 bg-amber-100/12" : "border-amber-100/10 bg-black/18"}`} style={{ left: `${plot.x}%`, top: `${plot.y}%`, width: `${plot.w}%`, height: `${plot.h}%` }}>
      <div className="relative h-full w-full">
        {renderVillageIcon(plot.id, qaState)}
        <div className="absolute inset-x-0 bottom-0 rounded-xl bg-black/32 px-2 py-1 backdrop-blur-sm">
          <p className="truncate text-[10px] font-black text-amber-50 md:text-xs">{plot.label}</p>
          <p className="hidden truncate text-[9px] text-amber-50/55 md:block">{qaState === "built" ? plot.hint : qaState === "building" ? "planned next" : "empty plot"}</p>
        </div>
      </div>
    </div>
  );
}

function plannedSoon(marker: SettlementMarker, state: PlayState) {
  if (marker === "shelter") return state.settlementMarkers.includes("camp") && !state.completedOrders.includes("raise-shelter");
  if (marker === "storehouse") return state.completedOrders.includes("cut-timber") && !state.completedOrders.includes("build-storehouse");
  if (marker === "market") return state.completedOrders.includes("build-storehouse") && !state.completedOrders.includes("open-market");
  if (marker === "council") return state.completedOrders.includes("open-market") && !state.completedOrders.includes("form-council");
  if (marker === "watch") return state.completedOrders.includes("scout-nearby") && !state.completedOrders.includes("fortify-watch");
  return false;
}

function renderVillageIcon(id: VillagePlotId, state: PlotState) {
  const opacity = state === "empty" ? "opacity-25" : state === "building" ? "opacity-60" : "opacity-100";
  if (id === "camp") return <div className={`absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/80 shadow-[0_0_30px_rgba(251,146,60,.8)] ${opacity}`} />;
  if (id === "shelter") return <div className={`absolute left-1/2 top-1/2 h-12 w-16 -translate-x-1/2 -translate-y-1/2 rounded-b-lg bg-stone-200/80 before:absolute before:-top-5 before:left-1 before:h-8 before:w-14 before:rotate-45 before:bg-amber-700/80 ${opacity}`} />;
  if (id === "storehouse") return <div className={`absolute left-1/2 top-1/2 h-12 w-16 -translate-x-1/2 -translate-y-1/2 rounded-md bg-yellow-700/85 outline outline-4 outline-yellow-200/40 ${opacity}`} />;
  if (id === "market") return <div className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1 ${opacity}`}><span className="h-10 w-4 rounded-t-full bg-sky-300/80" /><span className="h-10 w-4 rounded-t-full bg-amber-300/80" /><span className="h-10 w-4 rounded-t-full bg-emerald-300/80" /></div>;
  if (id === "council") return <div className={`absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-xl border-4 border-amber-100/70 bg-amber-500/45 ${opacity}`} />;
  if (id === "watch") return <div className={`absolute left-1/2 top-1/2 h-16 w-7 -translate-x-1/2 -translate-y-1/2 bg-amber-900/90 before:absolute before:-top-4 before:left-[-10px] before:h-5 before:w-12 before:bg-amber-200/75 ${opacity}`} />;
  if (id === "fields") return <div className={`absolute inset-3 rounded-xl bg-[repeating-linear-gradient(90deg,rgba(251,191,36,.55)_0_8px,rgba(22,101,52,.45)_8px_16px)] ${opacity}`} />;
  return <div className={`absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-amber-200/60 ${opacity}`} />;
}

function VillageGround() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_50%,rgba(180,134,64,.42),transparent_36%),radial-gradient(circle_at_18%_74%,rgba(22,101,52,.50),transparent_26%),radial-gradient(circle_at_82%_26%,rgba(20,83,45,.55),transparent_24%)]" />
      <div className="absolute left-[7%] top-[8%] h-[84%] w-[86%] rounded-[45%] border border-amber-100/10 bg-amber-950/12" />
      <div className="absolute right-[4%] top-[12%] h-[34%] w-[8%] rounded-full bg-sky-300/20 blur-sm" />
    </div>
  );
}

function VillageRoads() {
  return (
    <div className="absolute inset-0 opacity-75">
      <div className="absolute left-[27%] top-[55%] h-[4%] w-[52%] -rotate-6 rounded-full bg-amber-200/24" />
      <div className="absolute left-[47%] top-[28%] h-[45%] w-[4%] rotate-3 rounded-full bg-amber-200/20" />
      <div className="absolute left-[34%] top-[44%] h-[3%] w-[36%] rotate-[24deg] rounded-full bg-amber-200/16" />
    </div>
  );
}

function UnclaimedOverlay({ dispatch }: { dispatch: (action: PlayAction) => void }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 p-6 text-center backdrop-blur-sm">
      <div className="max-w-[420px] rounded-3xl border border-amber-100/20 bg-black/60 p-5 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200/65">No village yet</p>
        <h3 className="mt-2 text-2xl font-black text-amber-50">Claim a land first</h3>
        <p className="mt-2 text-sm leading-relaxed text-amber-50/65">A visible village scene appears after the first banner is raised.</p>
        <button onClick={() => dispatch({ type: "setView", view: "map" })} className="mt-4 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-stone-950">Return to map</button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-100/14 bg-black/38 px-3 py-2 shadow-xl backdrop-blur-md">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/50">{label}</p>
      <p className="text-base font-black text-amber-50">{value}</p>
    </div>
  );
}
