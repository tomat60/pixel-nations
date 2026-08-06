import {
  developmentOrders,
  getPhase,
  getSettlementCrewTotal,
  getSettlementForecast,
  getSettlementUnassignedCrews,
  settlementDistrictIds,
  settlementTotalCrews,
  type DevelopmentOrder,
  type OrderId,
  type PlayAction,
  type PlayState,
  type SettlementDistrictId,
  type SettlementFocusId,
} from "../lib/play-state";

const districtMeta: Record<SettlementDistrictId, { label: string; yield: string }> = {
  fields: { label: "Fields", yield: "+2 food / crew" },
  workyard: { label: "Workyard", yield: "+1 timber / crew · 3 crews add stone" },
  civic: { label: "Civic", yield: "+1 influence / crew" },
};

const focusMeta: Array<{ id: SettlementFocusId; label: string; short: string }> = [
  { id: "stores", label: "Secure Stores", short: "+2 food · stable season adds Stability" },
  { id: "construction", label: "Build Out", short: "+2 timber · +1 stone" },
  { id: "charter", label: "Write Charter", short: "+2 influence · Civic can add Stability" },
];

const advancedOrderIds: OrderId[] = ["build-storehouse", "open-market", "form-council", "fortify-watch"];

export function OrdersPanel({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  if (state.ownedPlotIds.length === 0) return null;

  const phase = getPhase(state);
  const availableOrders = developmentOrders.filter((order) => !state.completedOrders.includes(order.id));
  const nextRouteOrder = availableOrders.find((order) => order.id === "open-market" && state.completedOrders.length >= 5);
  const visibleOrders = prioritizeOrders(availableOrders, nextRouteOrder?.id).slice(0, 6);
  const citySeed = phase === "city-seed" || phase === "nation-seed";
  const stewardshipUnlocked = state.completedOrders.includes("raise-shelter");
  const crewTotal = getSettlementCrewTotal(state.settlementWorkers);
  const unassignedCrews = getSettlementUnassignedCrews(state.settlementWorkers);
  const forecast = getSettlementForecast(state);
  const latestCycle = state.settlementCycles.at(-1) ?? null;
  const cycleReady = crewTotal === settlementTotalCrews;

  return (
    <aside
      data-qa="orders-panel"
      className="absolute right-3 top-[12rem] z-20 max-h-[calc(100%-18rem)] w-[300px] overflow-y-auto overscroll-contain rounded-3xl border border-amber-100/20 bg-black/58 p-3 shadow-2xl backdrop-blur-md md:right-5 md:top-[11.8rem] md:w-[390px] md:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-200/62">Season orders</p>
          <h2 className="mt-1 text-lg font-black text-amber-50 md:text-2xl">Grow the first settlement</h2>
        </div>
        <p className="shrink-0 rounded-full border border-amber-200/20 bg-amber-200/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-amber-100">{phase}</p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
        <Stat label="Food" value={state.resources.food} />
        <Stat label="Timber" value={state.resources.timber} />
        <Stat label="Stone" value={state.resources.stone} />
        <Stat label="Influence" value={state.resources.influence} />
      </div>

      {citySeed ? (
        <div data-qa="orders-city-seed-complete" className="mt-3 rounded-2xl border border-sky-200/30 bg-sky-300/10 p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-100/65">City seed established</p>
          <p className="mt-1 text-sm font-black text-amber-50">The first settlement now has streets, council, market and defense.</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/62">Keep balancing crews, upkeep, stability and prosperity while the city prepares to found a nation.</p>
        </div>
      ) : null}

      {nextRouteOrder ? <OrderButton order={nextRouteOrder} priority cycleReady={cycleReady} dispatch={dispatch} /> : null}

      <div className="mt-3 space-y-2 pr-1">
        {visibleOrders.filter((order) => order.id !== nextRouteOrder?.id).map((order) => (
          <OrderButton key={order.id} order={order} cycleReady={cycleReady} dispatch={dispatch} />
        ))}
        {availableOrders.length === 0 && !citySeed ? (
          <p className="rounded-2xl border border-amber-100/16 bg-amber-100/8 p-3 text-sm leading-relaxed text-amber-50/68">All first-settlement projects are complete. Continue stewarding seasons, then expand toward nation and empire.</p>
        ) : null}
      </div>

      {stewardshipUnlocked ? (
        <section data-qa="settlement-stewardship" className="mt-3 rounded-3xl border border-emerald-200/24 bg-emerald-950/28 p-3 shadow-inner">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100/62">Settlement stewardship</p>
              <h3 className="mt-1 text-base font-black text-amber-50">Plan the next season</h3>
            </div>
            <div data-qa="settlement-crew-total" className="shrink-0 rounded-xl border border-emerald-100/18 bg-black/28 px-2.5 py-1.5 text-right">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-100/55">Crews</p>
              <p className="text-xs font-black text-amber-50">Assigned {crewTotal}/{settlementTotalCrews}</p>
              <p className="text-[9px] text-amber-50/55">{unassignedCrews} unassigned</p>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {settlementDistrictIds.map((districtId) => {
              const count = state.settlementWorkers[districtId];
              const meta = districtMeta[districtId];
              return (
                <div key={districtId} data-qa={`settlement-district-${districtId}`} className="rounded-2xl border border-emerald-100/14 bg-black/24 p-2 text-center">
                  <p className="text-[9px] font-black text-amber-50">{meta.label}</p>
                  <p className="mt-0.5 text-lg font-black text-amber-50">{count}</p>
                  <p className="mt-0.5 truncate text-[7px] text-amber-50/48">{meta.yield}</p>
                  <div className="mt-1.5 flex justify-center gap-1">
                    <button
                      type="button"
                      aria-label={`Remove crew from ${meta.label}`}
                      data-qa="settlement-worker-minus"
                      data-district-id={districtId}
                      disabled={count <= 0}
                      onClick={() => dispatch({ type: "adjustSettlementWorker", districtId, delta: -1 })}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-100/16 bg-black/36 text-base font-black text-amber-50 transition hover:border-amber-200/35 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      aria-label={`Assign crew to ${meta.label}`}
                      data-qa="settlement-worker-plus"
                      data-district-id={districtId}
                      disabled={unassignedCrews <= 0}
                      onClick={() => dispatch({ type: "adjustSettlementWorker", districtId, delta: 1 })}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-100/16 bg-black/36 text-base font-black text-amber-50 transition hover:border-amber-200/35 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {focusMeta.map((focus) => {
              const active = state.settlementFocusId === focus.id;
              return (
                <button
                  key={focus.id}
                  type="button"
                  data-qa="settlement-focus"
                  data-focus-id={focus.id}
                  aria-pressed={active}
                  onClick={() => dispatch({ type: "setSettlementFocus", focusId: focus.id })}
                  className={`rounded-xl border p-2 text-left transition ${active ? "border-amber-200/55 bg-amber-200/14" : "border-amber-100/12 bg-black/22 hover:border-amber-200/30"}`}
                >
                  <p className="text-[9px] font-black text-amber-50">{focus.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-[7px] leading-relaxed text-amber-50/52">{focus.short}</p>
                </button>
              );
            })}
          </div>

          <div data-qa="settlement-cycle-preview" className="mt-2 rounded-2xl border border-sky-100/18 bg-sky-950/24 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-sky-100/58">Next-cycle forecast</p>
              <p data-qa="settlement-forecast-status" className={`rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-[0.12em] ${!cycleReady ? "bg-amber-200/12 text-amber-100" : forecast.shortage ? "bg-rose-300/14 text-rose-100" : "bg-emerald-300/14 text-emerald-100"}`}>
                {!cycleReady ? "Assign crews" : forecast.shortage ? "Shortage" : "Stable"}
              </p>
            </div>
            <div className="mt-1.5 grid grid-cols-5 gap-1 text-center">
              <ForecastStat qa="settlement-forecast-food" label="Food" value={`+${forecast.food}`} />
              <ForecastStat qa="settlement-forecast-timber" label="Wood" value={`+${forecast.timber}`} />
              <ForecastStat qa="settlement-forecast-stone" label="Stone" value={`+${forecast.stone}`} />
              <ForecastStat qa="settlement-forecast-influence" label="Influence" value={`+${forecast.influence}`} />
              <ForecastStat qa="settlement-forecast-upkeep" label="Upkeep" value={`−${forecast.upkeep}`} />
            </div>
            <p className="mt-1.5 text-[9px] leading-relaxed text-amber-50/55">
              {!cycleReady
                ? `Assign ${unassignedCrews} remaining ${unassignedCrews === 1 ? "crew" : "crews"}.`
                : forecast.shortage
                  ? `Food cannot cover ${forecast.upkeep} upkeep. Stability and prosperity will fall.`
                  : `Food after upkeep: ${forecast.netFood}.`}
            </p>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
            <MiniStat qa="settlement-stability" label="Stability" value={`${state.settlementStability}/6`} />
            <MiniStat qa="settlement-prosperity" label="Prosperity" value={`${state.settlementProsperity}/12`} />
            <MiniStat label="Cycles" value={state.settlementCycles.length} />
          </div>

          <button
            type="button"
            data-qa="resolve-settlement-cycle"
            disabled={!cycleReady}
            onClick={() => dispatch({ type: "resolveSettlementCycle" })}
            className="mt-2 w-full rounded-2xl border border-emerald-100/30 bg-emerald-300 px-4 py-2.5 text-sm font-black text-emerald-950 shadow-lg shadow-black/25 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-45"
          >
            End season
          </button>

          {latestCycle ? (
            <div data-qa="settlement-cycle-record" className={`mt-2 rounded-2xl border p-2.5 ${latestCycle.shortage ? "border-rose-200/25 bg-rose-950/28" : "border-emerald-100/18 bg-black/24"}`}>
              <p className="text-[8px] font-black uppercase tracking-[0.17em] text-amber-100/52">Latest cycle · {latestCycle.cycle}</p>
              <p className="mt-1 text-[10px] font-bold leading-relaxed text-amber-50/76">{latestCycle.summary}</p>
              {latestCycle.orderId ? <p className="mt-1 text-[8px] text-amber-100/48">Project: {latestCycle.orderId}</p> : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-3 rounded-2xl border border-amber-100/12 bg-black/26 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Latest chronicle</p>
        <p className="mt-1 text-sm font-black text-amber-50">{state.chronicle[0]?.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{state.chronicle[0]?.body}</p>
      </div>
    </aside>
  );
}

function OrderButton({ order, priority = false, cycleReady, dispatch }: { order: DevelopmentOrder; priority?: boolean; cycleReady: boolean; dispatch: (action: PlayAction) => void }) {
  const advanced = advancedOrderIds.includes(order.id);
  const blocked = advanced && !cycleReady;
  const selector = priority ? "order-open-market-priority" : `order-${order.id}`;

  return (
    <button
      type="button"
      aria-label={order.label}
      data-qa={selector}
      onClick={() => dispatch({ type: "runOrder", orderId: order.id })}
      className={`w-full rounded-2xl border p-3 text-left shadow-black/20 transition ${priority ? "mt-3 border-amber-200/45 bg-amber-300 text-stone-950 shadow-lg hover:bg-amber-200" : "border-amber-100/16 bg-amber-100/8 text-amber-50 hover:border-amber-200/40 hover:bg-amber-100/14"}`}
    >
      <p className="text-sm font-black">{order.label}</p>
      <p className={`mt-1 text-xs font-semibold leading-relaxed ${priority ? "text-stone-800" : "text-amber-50/62"}`}>{order.short}</p>
      {advanced ? (
        <p className={`mt-1.5 text-[9px] font-black uppercase tracking-[0.13em] ${priority ? "text-stone-700" : blocked ? "text-amber-200/55" : "text-emerald-100/55"}`}>
          {blocked ? "Assign all crews first" : "Also resolves the planned season"}
        </p>
      ) : null}
    </button>
  );
}

function prioritizeOrders(orders: DevelopmentOrder[], priorityId?: OrderId): DevelopmentOrder[] {
  if (!priorityId) return orders;
  const priority = orders.find((order) => order.id === priorityId);
  if (!priority) return orders;
  return [priority, ...orders.filter((order) => order.id !== priorityId)];
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-amber-100/12 bg-black/28 px-1.5 py-2 md:px-2">
      <p className="truncate text-[7px] font-black uppercase tracking-[0.12em] text-amber-200/50 md:text-[8px] md:tracking-[0.16em]">{label}</p>
      <p className="text-base font-black text-amber-50 md:text-lg">{value}</p>
    </div>
  );
}

function ForecastStat({ qa, label, value }: { qa: string; label: string; value: string }) {
  return (
    <div data-qa={qa} className="min-w-0 rounded-xl border border-sky-100/10 bg-black/22 px-1 py-1.5">
      <p className="truncate text-[6px] font-black uppercase tracking-[0.08em] text-sky-100/48 md:text-[7px]">{label}</p>
      <p className="text-[10px] font-black text-amber-50 md:text-xs">{value}</p>
    </div>
  );
}

function MiniStat({ qa, label, value }: { qa?: string; label: string; value: string | number }) {
  return (
    <div data-qa={qa} className="min-w-0 rounded-xl border border-emerald-100/12 bg-black/24 px-1.5 py-2">
      <p className="truncate text-[7px] font-black uppercase tracking-[0.1em] text-emerald-100/48">{label}</p>
      <p className="mt-0.5 text-xs font-black text-amber-50">{value}</p>
    </div>
  );
}
