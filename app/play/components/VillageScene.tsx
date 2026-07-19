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

// Module-level deterministic visual-ownership policy (Fable #209).
// Physical helpers (CampLife, ShelterCluster, StorehouseSupplies, MarketActivity,
// CouncilPresence, WatchDefense, FoodFields, VillageRoads) are the sole owners of
// built visuals. VillagePlotNode never renders a built icon and only shows a
// compact micro-label for plots that need one once built.
const villagePlotVisualPolicy: Record<VillagePlotId, { builtLabel: boolean }> = {
  camp: { builtLabel: false },
  shelter: { builtLabel: false },
  storehouse: { builtLabel: true },
  market: { builtLabel: true },
  council: { builtLabel: true },
  watch: { builtLabel: true },
  fields: { builtLabel: true },
  road: { builtLabel: false },
};

function getPlotVisualPresentation(plotId: VillagePlotId, qaState: PlotState) {
  const policy = villagePlotVisualPolicy[plotId];
  const showBuiltLabel = qaState === "built" && policy.builtLabel;
  return { showBuiltLabel };
}

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
    <section data-qa="village-scene" className="absolute inset-0 overflow-hidden bg-[#0b120c]">
      <div className="absolute left-3 right-3 top-[5.4rem] z-10 md:left-5 md:right-5 md:top-[5.9rem]">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-100/14 bg-black/38 px-3 py-1.5 shadow-xl backdrop-blur-sm md:px-3.5 md:py-2">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-amber-200/60">Village</p>
            <h2 className="truncate text-base font-black text-amber-50 md:text-xl">{owned?.name ?? "No homeland"}</h2>
          </div>
          <div className="hidden shrink-0 items-center gap-3 text-right md:flex">
            <CompactStat label="Phase" value={phase} />
            <CompactStat label="People" value={population} />
            <CompactStat label="Dev" value={score} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[7.6rem] left-1.5 right-1.5 top-[8.4rem] z-0 md:bottom-[8.2rem] md:left-2.5 md:right-2.5 md:top-[9.3rem] lg:bottom-[5rem]">
        <div className="relative h-full w-full overflow-hidden rounded-[1rem] border border-amber-100/10 shadow-[0_20px_60px_rgba(0,0,0,.4)]">
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
  const { showBuiltLabel } = getPlotVisualPresentation(plot.id, qaState);
  return (
    <div
      data-qa="village-plot"
      data-qa-id={plot.id}
      data-qa-state={qaState}
      className={`absolute transition-all duration-300 ${
        qaState === "built"
          ? "pointer-events-none"
          : qaState === "building"
            ? "rounded-[0.6rem] border border-dashed border-amber-200/35 pointer-events-none"
            : "pointer-events-none opacity-0"
      }`}
      style={{ left: `${plot.x}%`, top: `${plot.y}%`, width: `${plot.w}%`, height: `${plot.h}%` }}
    >
      <div className="relative h-full w-full">
        {qaState === "building" ? (
          <div className="absolute inset-x-0 bottom-0 rounded-md bg-black/24 px-1.5 py-0.5">
            <p className="truncate text-[8px] font-black text-amber-50/75">{plot.label} · planned</p>
          </div>
        ) : null}
        {showBuiltLabel ? (
          <div className="absolute inset-x-0 bottom-0 z-[2] rounded-md bg-black/24 px-1.5 py-0.5 opacity-0">
            <p className="truncate text-[9px] font-black text-amber-50/90">{plot.label}</p>
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
  const developmentValue = Math.max(0, Math.min(100, getDevelopmentScore(state)));

  return (
    <div data-qa="village-credibility-layer" className="pointer-events-none absolute inset-0 z-[1]">
      <div data-qa="village-ownership-flag" className="absolute left-[47%] top-[48%] h-8 w-1 rounded-full bg-amber-100 shadow-[0_0_18px_rgba(251,191,36,.45)]">
        <div className="absolute left-1 top-0 h-4 w-7 rounded-r-md bg-amber-300/90 shadow-lg" />
      </div>
      <CampLife peopleCount={peopleCount} development={developmentValue} />
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

function CampLife({ peopleCount, development }: { peopleCount: number; development: number }) {
  const people = [
    [44, 55], [48, 58], [52, 54], [41, 61], [57, 59], [36, 52], [62, 64], [31, 45], [68, 51], [46, 42], [53, 69], [73, 33],
  ].slice(0, peopleCount);
  const glowScale = 0.85 + Math.min(1, development / 100) * 0.5;
  return (
    <>
      <div className="absolute left-[47%] top-[47%]">
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <div
            data-qa="village-hearth-smoke"
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/16 blur-xl"
            style={{ transform: `translate(-50%, -50%) scale(${glowScale})` }}
          />
          <div className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/40" />
          <div
            className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/45 shadow-[0_0_30px_rgba(251,146,60,.55)]"
            style={{ transform: `translate(-50%, -50%) scale(${glowScale})` }}
          />
          <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/85 shadow-[0_0_18px_rgba(251,146,60,.7)]" />
          <div className="absolute left-1/2 top-[42%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/70" />
          <div className="absolute left-[58%] top-[38%] h-5 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-sm" />
        </div>
      </div>
      {people.map(([left, top], index) => (
        <span
          key={`${left}-${top}`}
          data-qa="village-population"
          data-person-index={index}
          className="absolute h-3 w-2 -translate-x-1/2 -translate-y-full"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-100 shadow-[0_0_6px_rgba(254,243,199,.5)]" />
          <span className="absolute left-1/2 top-1.5 h-1.5 w-2 -translate-x-1/2 rounded-b-full bg-amber-100/85" />
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

function VillageGround() {
  // Deterministic terrain built from a small set of reusable SVG shapes.
  const forestClumps = [
    [3, 4, 5], [8, 2, 4], [14, 5, 6], [20, 3, 4], [26, 6, 5], [33, 4, 4],
    [2, 12, 4], [2, 20, 5], [2, 28, 4], [2, 36, 6], [2, 44, 4], [4, 52, 5],
    [6, 60, 4], [3, 68, 5],
  ];
  const clearingBlobs = [
    [46, 46, 30, 22], [38, 58, 24, 18], [58, 40, 22, 16],
  ];
  const tufts = [
    [24, 52], [30, 66], [50, 72], [64, 55], [70, 70], [34, 30], [56, 24], [20, 44], [66, 34], [44, 62], [28, 40], [72, 46],
  ];
  const stones = [[91, 30], [88, 44], [84, 58], [80, 70]];

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* base clearing wash, warm upper-left light / lower-right shadow */}
      <defs>
        <radialGradient id="vg-light" cx="22%" cy="18%" r="85%">
          <stop offset="0%" stopColor="#3c4a26" />
          <stop offset="55%" stopColor="#2c3a1f" />
          <stop offset="100%" stopColor="#131c10" />
        </radialGradient>
        <linearGradient id="vg-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#vg-light)" />
      <rect x="0" y="0" width="100" height="100" fill="url(#vg-shadow)" />

      {/* warm ochre clearing around the settlement, irregular */}
      {clearingBlobs.map(([cx, cy, rx, ry], i) => (
        <ellipse key={`clear-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="#6a5a2c" opacity={0.34 - i * 0.05} />
      ))}
      <ellipse cx="48" cy="52" rx="34" ry="26" fill="#7a6a34" opacity="0.22" />

      {/* dark forest mass running off upper-left edge */}
      {forestClumps.map(([cx, cy, r], i) => (
        <g key={`forest-${i}`}>
          <circle cx={cx} cy={cy + r * 0.3} r={r} fill="#0e1a0d" opacity={0.82} />
          <circle cx={cx} cy={cy} r={r * 0.72} fill="#16240f" opacity={0.78} />
          <path d={`M${cx},${cy - r} L${cx - r * 0.55},${cy + r * 0.35} L${cx + r * 0.55},${cy + r * 0.35} Z`} fill="#0a140a" opacity={0.7} />
        </g>
      ))}

      {/* compact ridgeline mass upper-right, confined to x:78-100 / y:0-24 */}
      <polygon points="80,20 86,4 92,10 96,2 100,8 100,22 82,24" fill="#4b463f" opacity="0.82" />
      <polygon points="82,22 87,12 90,16 93,10 96,16 96,24" fill="#3a362f" opacity="0.6" />
      <polygon points="84,18 88,10 90,14" fill="#5a554b" opacity="0.55" />
      <polygon points="90,20 94,12 97,18" fill="#5a554b" opacity="0.5" />

      {/* stream routed along the right / lower-right perimeter, avoiding the settlement core */}
      <path
        d="M100,22 C94,32 91,45 89,58 C87,72 84,86 78,100"
        fill="none"
        stroke="#0e2530"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M100,22 C94,32 91,45 89,58 C87,72 84,86 78,100"
        fill="none"
        stroke="#4fa4c9"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M100,22 C94,32 91,45 89,58 C87,72 84,86 78,100"
        fill="none"
        stroke="#bfe7f5"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.4"
      />
      {stones.map(([x, y], i) => (
        <ellipse key={`stone-${i}`} cx={x} cy={y} rx={1.6} ry={1.1} fill="#8a8375" opacity="0.7" />
      ))}

      {/* terrain tufts / patches to remove flat-green read */}
      {tufts.map(([x, y], i) => (
        <ellipse key={`tuft-${i}`} cx={x} cy={y} rx={2.4} ry={1.3} fill="#8ca24a" opacity="0.32" />
      ))}
    </svg>
  );
}

function VillageRoads({ state }: { state: PlayState }) {
  const activeRoad = state.completedOrders.includes("open-market") || state.settlementMarkers.includes("storehouse");
  const hearth = { x: 47, y: 47 };
  const nodes: Array<{ id: string; x: number; y: number; active: boolean }> = [
    { id: "shelter", x: 27, y: 41, active: state.settlementMarkers.includes("shelter") },
    { id: "fields", x: 22, y: 66, active: state.completedOrders.includes("gather-food") },
    { id: "storehouse", x: 68, y: 40, active: state.settlementMarkers.includes("storehouse") },
    { id: "market", x: 74, y: 66, active: state.settlementMarkers.includes("market") },
    { id: "council", x: 50, y: 29, active: state.settlementMarkers.includes("council") },
    { id: "watch", x: 84, y: 24, active: state.settlementMarkers.includes("watch") },
  ];

  function pathFor(node: { x: number; y: number }) {
    const midX = (hearth.x + node.x) / 2 + (node.x > hearth.x ? -3 : 3);
    const midY = (hearth.y + node.y) / 2 + (node.y > hearth.y ? -2 : 2);
    return `M${hearth.x},${hearth.y} Q${midX},${midY} ${node.x},${node.y}`;
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {/* main road entering from bottom, converging at hearth */}
      <path
        d={`M43,100 Q45,75 ${hearth.x},${hearth.y}`}
        fill="none"
        stroke="#d8b46a"
        strokeWidth={activeRoad ? 3.4 : 2.2}
        strokeLinecap="round"
        opacity={activeRoad ? 0.55 : 0.3}
      />
      {nodes.map((node) => (
        <path
          key={node.id}
          d={pathFor(node)}
          fill="none"
          stroke="#d8b46a"
          strokeWidth={node.active ? 2.2 : 1.1}
          strokeLinecap="round"
          opacity={node.active ? 0.48 : 0.18}
        />
      ))}
    </svg>
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

function CompactStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="leading-tight">
      <p className="text-[7px] font-black uppercase tracking-[0.16em] text-amber-200/50">{label}</p>
      <p className="text-xs font-black text-amber-50">{value}</p>
    </div>
  );
}
