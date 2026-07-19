import type { PlayAction, PlayState, RetentionRecord, SettlementMarker } from "../lib/play-state";
import { getDevelopmentScore, getOwnedPlot, getPhase, getPopulation } from "../lib/play-state";

type VillagePlotId = "camp" | "shelter" | "storehouse" | "market" | "council" | "watch" | "fields" | "road";
type PlotState = "empty" | "building" | "built";

type VillagePlot = { id: VillagePlotId; marker?: SettlementMarker; label: string; hint: string; x: number; y: number; w: number; h: number };
type InstitutionVisual = { label: string; district: string; marker: string; x: number; y: number; emoji: string; tone: string };

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

function getInstitutionVisuals(records: RetentionRecord[]): InstitutionVisual[] {
  return records.slice(0, 3).map((record) => {
    if (record.decisionId === "grain-levy") {
      return record.choiceId === "authority"
        ? { label: "Granary Authority", district: "Granary District", marker: "levy stewards", x: 58, y: 25, emoji: "◧", tone: "border-yellow-100/70 bg-yellow-300/24 text-yellow-50" }
        : { label: "Commons Stores", district: "Civic Commons", marker: "free household stores", x: 28, y: 55, emoji: "◫", tone: "border-lime-100/70 bg-lime-300/20 text-lime-50" };
    }
    if (record.decisionId === "open-roads") {
      return record.choiceId === "authority"
        ? { label: "Border Road Ward", district: "Guard Road", marker: "road wardens", x: 72, y: 48, emoji: "◆", tone: "border-red-100/65 bg-red-300/18 text-red-50" }
        : { label: "Open Market Road", district: "Market Street", marker: "caravan brokers", x: 66, y: 67, emoji: "◇", tone: "border-sky-100/70 bg-sky-300/20 text-sky-50" };
    }
    return record.choiceId === "authority"
      ? { label: "Scribe House", district: "Law Hall", marker: "civic scribes", x: 44, y: 18, emoji: "✦", tone: "border-purple-100/70 bg-purple-300/20 text-purple-50" }
      : { label: "First Foundries", district: "Workshop Row", marker: "foundry crews", x: 52, y: 71, emoji: "✹", tone: "border-orange-100/70 bg-orange-300/20 text-orange-50" };
  });
}

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

      <div className="absolute left-4 right-4 top-[5.7rem] z-10 flex items-center justify-between gap-2 md:left-6 md:right-6 md:top-[6.2rem]">
        <div className="flex max-w-[70%] items-center gap-2 rounded-2xl border border-amber-100/18 bg-black/42 px-3 py-2 shadow-2xl backdrop-blur-md">
          <p className="truncate text-sm font-black text-amber-50 md:text-lg">{owned?.name ?? "No homeland"}</p>
          <p className="hidden shrink-0 truncate text-[10px] font-black uppercase tracking-[0.14em] text-amber-200/55 md:block">
            {phase} · {population} people · dev {score}
          </p>
        </div>
      </div>

      <div className="absolute bottom-[8.8rem] left-3 right-3 top-[9.4rem] z-0 md:bottom-[9.3rem] md:left-6 md:right-6 md:top-[10.2rem] lg:bottom-[6.2rem]">
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-amber-100/18 bg-[#263f25] shadow-[0_30px_90px_rgba(0,0,0,.45)]">
          <VillageGround />
          <VillageRoads state={state} />
          {hasClaim ? <SettlementCredibilityLayer state={state} /> : null}
          {villagePlots.map((plot) => <VillagePlotNode key={plot.id} plot={plot} state={state} />)}
          {!hasClaim ? <UnclaimedOverlay dispatch={dispatch} /> : null}
        </div>
      </div>

      {hasClaim ? (
        <>
          <button data-qa="village-scene-open-orders" onClick={() => dispatch({ type: "setView", view: "orders" })} className="absolute bottom-[5.2rem] left-4 right-4 z-30 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-2xl shadow-black/40 transition hover:bg-amber-200 lg:hidden">Issue next order</button>
          <div className="absolute bottom-[5.5rem] right-5 z-20 hidden max-w-[280px] rounded-3xl border border-amber-100/18 bg-black/48 p-3 shadow-2xl backdrop-blur-md lg:block">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Latest order</p>
            <p className="mt-1 text-sm font-black text-amber-50">{state.lastEvent}</p>
            <button data-qa="village-scene-open-orders-desktop" onClick={() => dispatch({ type: "setView", view: "orders" })} className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-200">Issue next order</button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function VillagePlotNode({ plot, state }: { plot: VillagePlot; state: PlayState }) {
  const built = plot.marker ? state.settlementMarkers.includes(plot.marker) : plot.id === "fields" ? state.completedOrders.includes("gather-food") : state.completedOrders.includes("open-market");
  const building = !built && plot.marker ? plannedSoon(plot.marker, state) : false;
  const qaState: PlotState = built ? "built" : building ? "building" : "empty";
  return (
    <div
      data-qa="village-plot"
      data-qa-id={plot.id}
      data-qa-state={qaState}
      className={`absolute transition-all duration-300 ${
        qaState === "built"
          ? "rounded-xl"
          : qaState === "building"
            ? "rounded-xl border border-dashed border-amber-200/30"
            : "opacity-[0.06]"
      }`}
      style={{ left: `${plot.x}%`, top: `${plot.y}%`, width: `${plot.w}%`, height: `${plot.h}%` }}
    >
      <div className="relative h-full w-full">
        {renderVillageIcon(plot.id, qaState)}
        {qaState === "built" ? (
          <div className="absolute inset-x-0 bottom-0 mx-auto w-fit max-w-[92%] rounded-md bg-black/38 px-1.5 py-0.5 backdrop-blur-sm">
            <p className="truncate text-[9px] font-black text-amber-50">{plot.label}</p>
          </div>
        ) : qaState === "building" ? (
          <div className="absolute inset-x-0 bottom-0 mx-auto w-fit max-w-[85%] rounded-md bg-black/28 px-1.5 py-0.5 backdrop-blur-sm">
            <p className="truncate text-[8px] font-black uppercase tracking-[0.1em] text-amber-100/75">planned</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SettlementCredibilityLayer({ state }: { state: PlayState }) {
  const hasShelter = state.settlementMarkers.includes("shelter");
  const hasFood = state.completedOrders.includes("gather-food");
  const hasTimber = state.completedOrders.includes("cut-timber");
  const hasStorehouse = state.settlementMarkers.includes("storehouse");
  const hasMarket = state.settlementMarkers.includes("market");
  const hasCouncil = state.settlementMarkers.includes("council");
  const hasWatch = state.settlementMarkers.includes("watch");
  const institutionVisuals = getInstitutionVisuals(state.retentionRecords);
  const peopleCount = Math.min(12, 3 + state.completedOrders.length + Math.max(0, state.settlementMarkers.length - 1));

  return (
    <div data-qa="village-credibility-layer" className="pointer-events-none absolute inset-0 z-[1]">
      <div data-qa="village-ownership-flag" className="absolute left-[47%] top-[48%] h-8 w-1 rounded-full bg-amber-100 shadow-[0_0_18px_rgba(251,191,36,.45)]">
        <div className="absolute left-1 top-0 h-4 w-7 rounded-r-md bg-amber-300/90 shadow-lg" />
      </div>
      <CampLife peopleCount={peopleCount} developmentScore={getDevelopmentScore(state)} />
      {hasShelter ? <ShelterCluster /> : null}
      {hasFood ? <FoodFields /> : null}
      {hasTimber ? <TimberAndFences /> : null}
      {hasStorehouse ? <StorehouseSupplies /> : null}
      {hasMarket ? <MarketActivity /> : null}
      {hasCouncil ? <CouncilPresence /> : null}
      {hasWatch ? <WatchDefense /> : null}
      {institutionVisuals.length > 0 ? <InstitutionDistrictLayer institutions={institutionVisuals} /> : null}
    </div>
  );
}

function CampLife({ peopleCount, developmentScore }: { peopleCount: number; developmentScore: number }) {
  const people = [
    [44, 55], [48, 58], [52, 54], [41, 61], [57, 59], [36, 52], [62, 64], [31, 45], [68, 51], [46, 42], [53, 69], [73, 33],
  ].slice(0, peopleCount);
  const glowScale = Math.min(1.6, 1 + developmentScore / 220);
  return (
    <>
      <div className="absolute left-[47%] top-[47%] h-20 w-20 -translate-x-1/2 -translate-y-1/2">
        <div
          data-qa="village-hearth-smoke"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/16 blur-xl"
          style={{ height: `${56 * glowScale}px`, width: `${56 * glowScale}px` }}
        />
        <div className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-stone-400/70 bg-stone-700/60 shadow-inner" />
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/45 shadow-[0_0_30px_rgba(251,146,60,.55)]" />
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/90 shadow-[0_0_16px_rgba(251,146,60,.7)]" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-[65%] rounded-full bg-yellow-100/95" />
        <div className="absolute left-1/2 top-1/2 h-6 w-3 -translate-x-1/2 -translate-y-[150%] rounded-full bg-white/10 blur-sm" />
      </div>
      {people.map(([left, top], index) => (
        <span key={`${left}-${top}`} data-qa="village-population" data-person-index={index} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${left}%`, top: `${top}%` }}>
          <span className="block h-1.5 w-1.5 rounded-full bg-amber-100 shadow-[0_0_6px_rgba(254,243,199,.5)]" />
          <span className="mt-[1px] block h-2 w-2.5 rounded-b-full rounded-t-sm bg-amber-200/90" />
        </span>
      ))}
    </>
  );
}

function ShelterCluster() {
  const huts = [
    [23, 38, "rotate-[-8deg]"], [29, 36, "rotate-[5deg]"], [34, 43, "rotate-[10deg]"], [19, 45, "rotate-[3deg]"],
  ];
  return (
    <div data-qa="village-structure-hut" className="absolute inset-0">
      {huts.map(([left, top, rotate]) => (
        <div key={`${left}-${top}`} className={`absolute h-10 w-14 ${rotate}`} style={{ left: `${left}%`, top: `${top}%` }}>
          <div className="absolute bottom-0 h-7 w-14 rounded-b-lg border border-amber-100/40 bg-stone-200/85 shadow-lg" />
          <div className="absolute left-1 top-0 h-8 w-12 rotate-45 rounded-sm bg-amber-800/90 shadow-md" />
          <div className="absolute left-6 top-4 h-4 w-3 rounded-t-sm bg-black/35" />
          <div className="absolute -top-4 left-6 h-6 w-4 rounded-full bg-stone-100/24 blur-sm" />
        </div>
      ))}
    </div>
  );
}

function FoodFields() {
  const rows = [0, 1, 2, 3, 4, 5];
  return (
    <div data-qa="village-food-fields" className="absolute left-[13%] top-[61%] h-[17%] w-[23%] rounded-2xl border border-lime-100/35 bg-lime-400/8 shadow-[0_0_24px_rgba(132,204,22,.16)]">
      {rows.map((row) => <span key={row} className="absolute left-[8%] right-[8%] h-1.5 rounded-full bg-lime-200/45" style={{ top: `${14 + row * 13}%` }} />)}
      <span className="absolute left-[16%] top-[18%] h-3 w-3 rounded-full bg-amber-200/80" />
      <span className="absolute left-[68%] top-[62%] h-3 w-3 rounded-full bg-amber-200/80" />
    </div>
  );
}

function TimberAndFences() {
  return (
    <div data-qa="village-timber-yards" className="absolute inset-0">
      <div className="absolute left-[55%] top-[42%] flex gap-1">
        {[0, 1, 2, 3].map((item) => <span key={item} className="block h-3 w-10 rounded-full bg-amber-900/85 shadow-md" />)}
      </div>
      <div className="absolute left-[18%] top-[32%] h-[2px] w-[27%] rotate-[-9deg] bg-amber-200/35" />
      <div className="absolute left-[66%] top-[28%] h-[2px] w-[19%] rotate-[18deg] bg-amber-200/35" />
    </div>
  );
}

function StorehouseSupplies() {
  return (
    <div data-qa="village-storehouse-visual" className="absolute left-[61%] top-[35%] h-14 w-20 rounded-xl border border-amber-100/45 bg-yellow-800/90 shadow-[0_18px_34px_rgba(0,0,0,.34)]">
      <div className="absolute -top-4 left-2 h-7 w-16 rotate-45 rounded-sm bg-yellow-950/90" />
      <div className="absolute bottom-2 left-3 flex gap-1">
        <span className="h-4 w-4 rounded-sm bg-amber-200/80" />
        <span className="h-4 w-4 rounded-sm bg-stone-200/80" />
        <span className="h-4 w-4 rounded-sm bg-lime-200/70" />
      </div>
    </div>
  );
}

function MarketActivity() {
  return (
    <div data-qa="village-market-activity" className="absolute inset-0">
      <div className="absolute left-[49%] top-[68%] h-3 w-[35%] rotate-[-7deg] rounded-full bg-amber-200/45 shadow-[0_0_18px_rgba(251,191,36,.16)]" />
      <div className="absolute left-[66%] top-[63%] flex gap-1">
        <span className="h-10 w-4 rounded-t-full bg-sky-300/85" />
        <span className="h-10 w-4 rounded-t-full bg-amber-300/85" />
        <span className="h-10 w-4 rounded-t-full bg-emerald-300/85" />
      </div>
      <span className="absolute left-[78%] top-[66%] h-3 w-7 rounded-full bg-stone-200/65" />
      <span className="absolute left-[72%] top-[69%] h-3 w-7 rounded-full bg-amber-100/65" />
    </div>
  );
}

function CouncilPresence() {
  return (
    <div data-qa="village-council-visual" className="absolute left-[43%] top-[24%] h-16 w-16 rounded-2xl border-4 border-amber-100/70 bg-amber-500/45 shadow-[0_0_36px_rgba(251,191,36,.22)]">
      <div className="absolute -top-5 left-1/2 h-6 w-1 -translate-x-1/2 bg-amber-100" />
      <div className="absolute -top-6 left-[52%] h-4 w-7 rounded-r-md bg-emerald-300/85" />
      <div className="absolute inset-x-2 bottom-2 h-2 rounded-full bg-black/28" />
    </div>
  );
}

function WatchDefense() {
  return (
    <div data-qa="village-watch-visual" className="absolute left-[80%] top-[18%] h-20 w-10">
      <div className="absolute bottom-0 left-3 h-16 w-5 bg-amber-950/95 shadow-lg" />
      <div className="absolute left-0 top-0 h-6 w-11 rounded-sm bg-amber-200/80" />
      <div className="absolute left-3 top-6 h-12 w-[2px] rotate-[-18deg] bg-amber-100/45" />
      <div className="absolute left-7 top-6 h-12 w-[2px] rotate-[18deg] bg-amber-100/45" />
      <span className="absolute -right-8 top-8 h-2 w-8 rounded-full bg-red-200/50" />
    </div>
  );
}

function InstitutionDistrictLayer({ institutions }: { institutions: InstitutionVisual[] }) {
  return (
    <div data-qa="village-institution-layer" data-institution-count={institutions.length} className="absolute inset-0">
      {institutions.map((institution) => (
        <div key={institution.label} data-qa="village-institution-marker" data-institution-label={institution.label} data-institution-district={institution.district} className={`absolute w-32 rounded-2xl border px-2 py-1.5 shadow-[0_14px_28px_rgba(0,0,0,.34)] backdrop-blur-sm ${institution.tone}`} style={{ left: `${institution.x}%`, top: `${institution.y}%` }}>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl border border-white/25 bg-black/32 text-sm">{institution.emoji}</span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black">{institution.label}</p>
              <p className="truncate text-[8px] font-black uppercase tracking-[0.12em] opacity-70">{institution.district}</p>
            </div>
          </div>
          <p className="mt-1 truncate text-[8px] font-bold opacity-75">{institution.marker}</p>
        </div>
      ))}
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

function VillageRoads({ state }: { state: PlayState }) {
  const activeRoad = state.completedOrders.includes("open-market") || state.settlementMarkers.includes("storehouse");
  return (
    <div className="absolute inset-0 opacity-75">
      <div className={`absolute left-[27%] top-[55%] h-[4%] w-[52%] -rotate-6 rounded-full ${activeRoad ? "bg-amber-200/42 shadow-[0_0_20px_rgba(251,191,36,.18)]" : "bg-amber-200/24"}`} />
      <div className={`absolute left-[47%] top-[28%] h-[45%] w-[4%] rotate-3 rounded-full ${state.settlementMarkers.includes("council") ? "bg-amber-200/34" : "bg-amber-200/20"}`} />
      <div className={`absolute left-[34%] top-[44%] h-[3%] w-[36%] rotate-[24deg] rounded-full ${state.settlementMarkers.includes("shelter") ? "bg-amber-200/30" : "bg-amber-200/16"}`} />
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
