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

type BuildingVariant = "hut" | "storehouse" | "hall";

// Shared deterministic physical-building glyph. Renders a compact timber/thatch
// structure with a shaded wall body, an overhanging gabled roof with a ridge
// line, a door, one or two windows, an optional chimney/smoke, and a soft
// lower-right cast shadow. Width/height/rotation are supplied by the caller.
function SettlementBuilding({
  variant,
  width,
  height,
  rotation = 0,
  chimney = false,
  smoke = false,
  windows = 1,
}: {
  variant: BuildingVariant;
  width: number | string;
  height: number | string;
  rotation?: number;
  chimney?: boolean;
  smoke?: boolean;
  windows?: 0 | 1 | 2;
}) {
  const wallTone = variant === "hall" ? "#6b4a2f" : variant === "storehouse" ? "#5c4128" : "#7a5a38";
  const wallShade = variant === "hall" ? "#4a3220" : variant === "storehouse" ? "#3d2d1a" : "#54391f";
  const roofTone = variant === "hall" ? "#2f3a26" : variant === "storehouse" ? "#5a4a2a" : "#7a6238";
  const roofShade = variant === "hall" ? "#1c2417" : variant === "storehouse" ? "#3c2f18" : "#4a3a20";
  const doorTone = "#241a10";
  const windowTone = "#f2c46a";

  return (
    <svg
      viewBox="0 0 60 50"
      width={width}
      height={height}
      style={{ transform: `rotate(${rotation}deg)`, overflow: "visible" }}
      aria-hidden="true"
    >
      {/* cast shadow, lower-right */}
      <ellipse cx="34" cy="45" rx="22" ry="4.5" fill="#000000" opacity="0.32" />

      {/* wall body: light plane (left) + shade plane (right) */}
      <rect x="10" y="24" width="40" height="20" fill={wallTone} />
      <rect x="30" y="24" width="20" height="20" fill={wallShade} />
      <rect x="10" y="24" width="40" height="20" fill="none" stroke="#1a120a" strokeOpacity="0.35" strokeWidth="0.6" />

      {/* overhanging pitched/gabled roof */}
      <polygon points="4,26 30,6 56,26 50,26 30,12 10,26" fill={roofTone} />
      <polygon points="30,6 56,26 50,26 30,12" fill={roofShade} />
      <line x1="30" y1="6" x2="30" y2="12" stroke="#1a1409" strokeOpacity="0.5" strokeWidth="0.8" />
      <line x1="4" y1="26" x2="56" y2="26" stroke="#1a1409" strokeOpacity="0.4" strokeWidth="0.6" />

      {/* door */}
      <rect x="26" y="33" width="8" height="11" rx="1" fill={doorTone} />

      {/* windows */}
      {windows >= 1 ? <rect x="14" y="30" width="6" height="6" rx="0.6" fill={windowTone} opacity="0.85" /> : null}
      {windows >= 2 ? <rect x="40" y="30" width="6" height="6" rx="0.6" fill={windowTone} opacity="0.85" /> : null}

      {/* optional chimney + smoke */}
      {chimney ? <rect x="40" y="10" width="4" height="10" fill="#3a2e22" /> : null}
      {chimney && smoke ? (
        <>
          <circle cx="42" cy="6" r="2.2" fill="#e7e2d8" opacity="0.4" />
          <circle cx="43.5" cy="2" r="2.8" fill="#e7e2d8" opacity="0.3" />
        </>
      ) : null}
    </svg>
  );
}

function ShelterCluster() {
  const huts: Array<{ left: number; top: number; rotation: number; w: string; h: string; smoke: boolean; back?: boolean }> = [
    { left: 24, top: 36, rotation: -8, w: "clamp(58px, 8.4vw, 88px)", h: "clamp(48px, 6.8vw, 72px)", smoke: true },
    { left: 32, top: 34, rotation: 6, w: "clamp(52px, 7.6vw, 80px)", h: "clamp(44px, 6.2vw, 66px)", smoke: true, back: true },
    { left: 34, top: 45, rotation: 11, w: "clamp(60px, 8.8vw, 94px)", h: "clamp(50px, 7.2vw, 78px)", smoke: false },
    { left: 22, top: 47, rotation: 3, w: "clamp(56px, 8vw, 84px)", h: "clamp(46px, 6.4vw, 70px)", smoke: false },
  ];
  return (
    <div data-qa="village-structure-hut" className="absolute inset-0">
      {huts.map((hut, index) => (
        <div
          key={`${hut.left}-${hut.top}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${hut.left}%`, top: `${hut.top}%`, opacity: hut.back ? 0.92 : 1, zIndex: hut.back ? 1 : 2 }}
        >
          <SettlementBuilding
            variant="hut"
            width={hut.w}
            height={hut.h}
            rotation={hut.rotation}
            chimney={hut.smoke}
            smoke={hut.smoke}
            windows={index % 2 === 0 ? 1 : 0}
          />
        </div>
      ))}
      {/* yard props: wood pile + barrel, touching the shared yard/path area */}
      <div className="absolute left-[26%] top-[52%] h-2 w-6 -translate-x-1/2 rounded-full bg-amber-900/80 shadow-md" />
      <div className="absolute left-[26%] top-[50%] h-2 w-5 -translate-x-1/2 rounded-full bg-amber-800/75 shadow-sm" />
      <div className="absolute left-[24%] top-[55%] h-3 w-2.5 -translate-x-1/2 rounded-sm bg-stone-700/80 shadow-md" />
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
    <div data-qa="village-storehouse-visual" className="absolute left-[60%] top-[32%]" style={{ width: "clamp(96px, 11vw, 132px)", height: "clamp(72px, 8.2vw, 100px)" }}>
      <SettlementBuilding variant="storehouse" width="100%" height="100%" windows={2} />
      {/* wide door already rendered by shared glyph; add crates, sacks and stacked logs beside it */}
      <div className="absolute -right-3 bottom-1 flex gap-1">
        <span className="h-3.5 w-3.5 rounded-sm bg-amber-200/85 shadow-md" />
        <span className="h-3.5 w-3.5 rounded-sm bg-stone-200/80 shadow-md" />
      </div>
      <div className="absolute -right-5 top-6 h-4 w-4 rounded-full bg-lime-200/70 shadow-md" />
      <div className="absolute -left-4 bottom-1 flex flex-col gap-0.5">
        <span className="block h-1.5 w-8 rounded-full bg-amber-900/85 shadow-sm" />
        <span className="block h-1.5 w-7 rounded-full bg-amber-800/80 shadow-sm" />
      </div>
    </div>
  );
}

function MarketActivity() {
  const stalls = [
    { left: 65, top: 63, tone: "#c9a24a", tone2: "#8a6c2e" },
    { left: 73, top: 68, tone: "#5c8f7a", tone2: "#3a5c4e" },
    { left: 80, top: 62, tone: "#b25c4a", tone2: "#7a3a2e" },
  ];
  return (
    <div data-qa="village-market-activity" className="absolute inset-0">
      {stalls.map((stall) => (
        <div key={`${stall.left}-${stall.top}`} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${stall.left}%`, top: `${stall.top}%` }}>
          <svg viewBox="0 0 34 30" width="clamp(36px, 4.2vw, 52px)" height="clamp(30px, 3.6vw, 44px)" style={{ overflow: "visible" }} aria-hidden="true">
            <ellipse cx="18" cy="27" rx="13" ry="2.4" fill="#000" opacity="0.28" />
            {/* posts */}
            <rect x="6" y="10" width="1.8" height="16" fill="#3a2a18" />
            <rect x="26" y="10" width="1.8" height="16" fill="#2c2013" />
            {/* two-tone striped awning */}
            <polygon points="3,10 31,10 27,3 7,3" fill={stall.tone} />
            <polygon points="14,10 24,10 22,3 16,3" fill={stall.tone2} />
            {/* small goods table */}
            <rect x="9" y="19" width="16" height="4" fill="#5a4028" />
            <rect x="10" y="16.5" width="3" height="2.5" fill="#d8b46a" />
            <rect x="14.5" y="16.5" width="3" height="2.5" fill="#8fae4a" />
            <rect x="19" y="16.5" width="3" height="2.5" fill="#c96b4a" />
          </svg>
        </div>
      ))}
      {/* compact cart with two wheels and a few crates/barrels along the existing road */}
      <div className="absolute left-[70%] top-[73%] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 40 22" width="clamp(34px, 3.6vw, 44px)" height="clamp(18px, 2vw, 24px)" style={{ overflow: "visible" }} aria-hidden="true">
          <ellipse cx="20" cy="20" rx="15" ry="1.8" fill="#000" opacity="0.25" />
          <rect x="6" y="7" width="24" height="7" rx="0.8" fill="#5a4028" />
          <rect x="8" y="3" width="5" height="4" fill="#c9a24a" />
          <rect x="14" y="2.5" width="5" height="4.5" fill="#8fae4a" />
          <circle cx="12" cy="17" r="3.6" fill="none" stroke="#2c2013" strokeWidth="1.4" />
          <circle cx="24" cy="17" r="3.6" fill="none" stroke="#2c2013" strokeWidth="1.4" />
        </svg>
      </div>
    </div>
  );
}

function CouncilPresence() {
  return (
    <div data-qa="village-council-visual" className="absolute left-[40%] top-[19%]" style={{ width: "clamp(128px, 14.8vw, 170px)", height: "clamp(96px, 11.2vw, 128px)" }}>
      <SettlementBuilding variant="hall" width="100%" height="100%" windows={2} chimney smoke />
      {/* banner pole, taller than storehouse/huts, dominant landmark */}
      <div className="absolute left-1/2 top-[-1.4rem] h-6 w-[3px] -translate-x-1/2 bg-amber-100/80" />
      <div className="absolute left-[calc(50%+1px)] top-[-1.4rem] h-3.5 w-5 rounded-r-sm bg-emerald-300/85 shadow-md" />
    </div>
  );
}

function WatchDefense() {
  return (
    <div data-qa="village-watch-visual" className="absolute left-[78%] top-[15%]" style={{ width: "clamp(58px, 6.8vw, 78px)", height: "clamp(94px, 11vw, 124px)" }}>
      <svg viewBox="0 0 36 62" width="100%" height="100%" style={{ overflow: "visible" }} aria-hidden="true">
        <ellipse cx="18" cy="58" rx="13" ry="3" fill="#000" opacity="0.3" />
        {/* four timber supports */}
        <rect x="4" y="24" width="2.4" height="32" fill="#3a2a18" />
        <rect x="12" y="24" width="2.4" height="32" fill="#2c2013" />
        <rect x="22" y="24" width="2.4" height="32" fill="#2c2013" />
        <rect x="30" y="24" width="2.4" height="32" fill="#3a2a18" />
        {/* cross braces / ladder */}
        <line x1="4" y1="46" x2="14.4" y2="38" stroke="#4a3620" strokeWidth="1.4" />
        <line x1="14.4" y1="46" x2="4" y2="38" stroke="#4a3620" strokeWidth="1.4" />
        <line x1="10" y1="30" x2="10" y2="54" stroke="#4a3620" strokeWidth="1" />
        <line x1="8" y1="34" x2="12" y2="34" stroke="#4a3620" strokeWidth="1" />
        <line x1="8" y1="42" x2="12" y2="42" stroke="#4a3620" strokeWidth="1" />
        <line x1="8" y1="50" x2="12" y2="50" stroke="#4a3620" strokeWidth="1" />
        {/* platform */}
        <rect x="2" y="20" width="32" height="5" fill="#5a4028" />
        <rect x="2" y="20" width="32" height="5" fill="none" stroke="#1a1409" strokeOpacity="0.4" strokeWidth="0.5" />
        {/* roof */}
        <polygon points="0,20 18,6 36,20" fill="#3a4a2c" />
        <polygon points="18,6 36,20 30,20" fill="#26301c" />
        <line x1="18" y1="6" x2="18" y2="20" stroke="#141a0e" strokeOpacity="0.5" strokeWidth="0.8" />
        {/* short palisade segments */}
        <rect x="-6" y="50" width="2" height="10" fill="#3a2a18" />
        <rect x="-2" y="48" width="2" height="12" fill="#4a3620" />
        <rect x="38" y="49" width="2" height="11" fill="#4a3620" />
        <rect x="42" y="51" width="2" height="9" fill="#3a2a18" />
      </svg>
      {/* small warm fire basket / beacon */}
      <div className="absolute left-[52%] top-[8%] h-2 w-2 -translate-x-1/2 rounded-full bg-orange-400/90 shadow-[0_0_10px_rgba(251,146,60,.7)]" />
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

// Compact deterministic geometry constants (Village Run A). Constants only;
// no procedural/random generation. Kept readable for later extraction.

// Irregular warm clearing outline (world-space 0-100 coordinates).
const CLEARING_OUTLINE =
  "M18,40 C14,32 18,22 28,18 C36,12 48,10 58,14 C68,10 80,14 86,24 " +
  "C92,32 90,44 84,50 C90,58 88,70 78,76 C70,84 56,86 46,82 " +
  "C34,86 20,80 16,68 C10,60 12,48 18,40 Z";

// Two overlapping continuous canopy masses (upper-left forest edge) plus one
// smaller accent mass, replacing repeated circle/triangle clumps.
const CANOPY_MASS_A = "M0,0 L0,46 C10,40 16,30 14,20 C20,16 26,8 22,0 Z";
const CANOPY_MASS_B = "M0,18 C8,28 6,40 0,50 L0,70 C14,64 22,52 20,38 C26,32 28,22 22,14 Z";
const CANOPY_ACCENT = "M0,58 C10,62 16,72 12,84 L0,100 Z";

// Compact ridge mass, confined to the upper-right corner.
const RIDGE_BASE = "M80,20 L86,4 L92,10 L96,2 L100,8 L100,22 L82,24 Z";
const RIDGE_HIGHLIGHT = "M82,22 L87,12 L90,16 L93,10 L96,16 L96,24 Z";
const RIDGE_SHADE = "M84,18 L88,10 L90,14 Z";

// Perimeter stream, right / lower-right, kept away from the civic core.
const STREAM_PATH = "M100,22 C94,32 91,45 89,58 C87,72 84,86 78,100";

// Irregular adjoining lower-left field polygons (world-space).
const FIELD_POLY_A = "13,60 30,58 33,68 24,74 12,72 Z";
const FIELD_POLY_B = "24,74 33,68 36,78 30,86 18,84 Z";
const FIELD_POLY_C = "13,72 24,74 18,84 8,80 Z";

// Short furrow segments per field polygon (kept inside bounds visually).
const FIELD_FURROWS_A: Array<[number, number, number, number]> = [
  [16, 64, 27, 62],
  [15, 68, 28, 66],
  [17, 71, 26, 69],
];
const FIELD_FURROWS_B: Array<[number, number, number, number]> = [
  [26, 76, 33, 74],
  [24, 80, 32, 78],
];
const FIELD_FURROWS_C: Array<[number, number, number, number]> = [
  [11, 76, 20, 76],
  [10, 79, 19, 79],
];

// Two main curved trunks: lower-entry/market trunk terminates at hearth;
// civic trunk connects hearth to the council forecourt. Only these paths
// may touch the hearth point.
const HEARTH = { x: 47, y: 47 };
const LOWER_TRUNK = `M20,100 C30,86 34,70 38,58 Q42,52 ${HEARTH.x},${HEARTH.y}`;
const LOWER_TRUNK_MARKET_BRANCH = "M38,58 C48,60 60,62 68,66";
const CIVIC_TRUNK = `M${HEARTH.x},${HEARTH.y} Q48,38 50,29`;

// Fixed trunk join / waypoint constants.
const WAYPOINT_LOWER_MID = { x: 38, y: 58 };
const WAYPOINT_MARKET_JOIN = { x: 68, y: 66 };

// District spur paths, curving into a trunk waypoint rather than the hearth.
const SPUR_SHELTER = "M27,41 Q32,50 38,58";
const SPUR_FIELDS = "M22,66 Q28,66 30,58";
const SPUR_STOREHOUSE = "M68,40 Q60,52 38,58";
const SPUR_MARKET = "M74,66 Q71,66 68,66";
const SPUR_WATCH = "M84,24 Q66,26 50,29";

function VillageGround() {
  // Deterministic terrain built from a small set of reusable SVG shapes.
  const tufts = [
    [24, 52], [30, 66], [50, 72], [64, 55], [70, 70], [34, 30], [56, 24], [20, 44], [66, 34], [44, 62], [28, 40], [72, 46],
  ];
  const stones = [[91, 30], [88, 44], [84, 58], [80, 70]];
  const groundMarks = [
    [40, 44], [54, 50], [46, 60], [60, 42], [36, 55], [58, 62],
  ];

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
        <clipPath id="vg-clearing-clip"><path d={CLEARING_OUTLINE} /></clipPath>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#vg-light)" />
      <rect x="0" y="0" width="100" height="100" fill="url(#vg-shadow)" />

      {/* one irregular warm meadow / worn-earth clearing, no rounded panel edge */}
      <path d={CLEARING_OUTLINE} fill="#6a5a2c" opacity="0.4" />
      <path d={CLEARING_OUTLINE} fill="#7a6a34" opacity="0.18" />
      <g clipPath="url(#vg-clearing-clip)" opacity="0.5">
        {groundMarks.map(([x, y], i) => (
          <ellipse key={`mark-${i}`} cx={x} cy={y} rx={1.1} ry={0.5} fill="#4a3d1f" opacity="0.35" />
        ))}
      </g>

      {/* continuous canopy masses running off the upper-left edge */}
      <path d={CANOPY_MASS_A} fill="#0e1a0d" opacity="0.84" />
      <path d={CANOPY_MASS_B} fill="#16240f" opacity="0.78" />
      <path d={CANOPY_ACCENT} fill="#0a140a" opacity="0.7" />
      {/* sparse edge tree accents */}
      <circle cx="24" cy="10" r="2.6" fill="#16240f" opacity="0.6" />
      <circle cx="10" cy="58" r="2.2" fill="#16240f" opacity="0.55" />
      <circle cx="30" cy="86" r="2" fill="#0e1a0d" opacity="0.5" />

      {/* compact ridge mass upper-right, confined to x:78-100 / y:0-24 */}
      <path d={RIDGE_BASE} fill="#4b463f" opacity="0.82" />
      <path d={RIDGE_HIGHLIGHT} fill="#3a362f" opacity="0.6" />
      <path d={RIDGE_SHADE} fill="#5a554b" opacity="0.55" />

      {/* stream routed along the right / lower-right perimeter, avoiding the settlement core */}
      <path
        d={STREAM_PATH}
        fill="none"
        stroke="#0e2530"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d={STREAM_PATH}
        fill="none"
        stroke="#4fa4c9"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d={STREAM_PATH}
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
  const shelterActive = state.settlementMarkers.includes("shelter");
  const fieldsActive = state.completedOrders.includes("gather-food");
  const storehouseActive = state.settlementMarkers.includes("storehouse");
  const marketActive = state.settlementMarkers.includes("market");
  const councilActive = state.settlementMarkers.includes("council");
  const watchActive = state.settlementMarkers.includes("watch");

  // Layered dirt render: broad dark under-stroke + narrower warm stroke,
  // optional rut highlight. Trunks wider than spurs. Inactive full routes
  // are omitted rather than shown as faint hub lines.
  function DirtPath({ d, active, trunk }: { d: string; active: boolean; trunk?: boolean }) {
    if (!active && !trunk) return null;
    const underW = trunk ? 6.2 : 3.4;
    const dirtW = trunk ? 3.6 : 1.9;
    const rutW = trunk ? 1 : 0.6;
    const opacityScale = active ? 1 : 0.32;
    return (
      <g opacity={opacityScale}>
        <path d={d} fill="none" stroke="#2a1f12" strokeWidth={underW} strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        <path d={d} fill="none" stroke="#8a6a3c" strokeWidth={dirtW} strokeLinecap="round" strokeLinejoin="round" opacity="0.72" />
        <path d={d} fill="none" stroke="#c9a866" strokeWidth={rutW} strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      </g>
    );
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {/* the only two paths permitted to touch the hearth */}
      <DirtPath d={LOWER_TRUNK} active trunk />
      <DirtPath d={CIVIC_TRUNK} active={councilActive} trunk />
      {marketActive || activeRoad ? <DirtPath d={LOWER_TRUNK_MARKET_BRANCH} active={marketActive || activeRoad} trunk /> : null}

      {/* spurs join a trunk waypoint rather than reaching the hearth directly */}
      <DirtPath d={SPUR_SHELTER} active={shelterActive} />
      <DirtPath d={SPUR_FIELDS} active={fieldsActive} />
      <DirtPath d={SPUR_STOREHOUSE} active={storehouseActive} />
      <DirtPath d={SPUR_MARKET} active={marketActive} />
      <DirtPath d={SPUR_WATCH} active={watchActive} />
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
