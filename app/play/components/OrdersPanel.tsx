import { developmentOrders, getPhase, type DevelopmentOrder, type OrderId, type PlayAction, type PlayState } from "../lib/play-state";

export function OrdersPanel({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  if (state.ownedPlotIds.length === 0) return null;

  const phase = getPhase(state);
  const availableOrders = developmentOrders.filter((order) => !state.completedOrders.includes(order.id));
  const nextRouteOrder = availableOrders.find((order) => order.id === "open-market" && state.completedOrders.length >= 5);
  const visibleOrders = prioritizeOrders(availableOrders, nextRouteOrder?.id).slice(0, 6);

  return (
    <aside data-qa="orders-panel" className="absolute right-3 top-[12rem] z-20 max-h-[calc(100%-18rem)] w-[300px] rounded-3xl border border-amber-100/20 bg-black/58 p-3 shadow-2xl backdrop-blur-md md:right-5 md:top-[11.8rem] md:w-[390px] md:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-200/62">Season orders</p>
          <h2 className="mt-1 text-lg font-black text-amber-50 md:text-2xl">Grow the first settlement</h2>
        </div>
        <p className="rounded-full border border-amber-200/20 bg-amber-200/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-amber-100">{phase}</p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
        <Stat label="Food" value={state.resources.food} />
        <Stat label="Timber" value={state.resources.timber} />
        <Stat label="Stone" value={state.resources.stone} />
        <Stat label="Influence" value={state.resources.influence} />
      </div>

      {nextRouteOrder && (
        <button data-qa="order-open-market-priority" onClick={() => dispatch({ type: "runOrder", orderId: nextRouteOrder.id })} className="mt-3 w-full rounded-2xl border border-amber-200/45 bg-amber-300 px-3 py-3 text-left text-stone-950 shadow-lg shadow-black/30 transition hover:bg-amber-200">
          <p className="text-sm font-black">{nextRouteOrder.label}</p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-stone-800">{nextRouteOrder.short}</p>
        </button>
      )}

      <div className="mt-3 max-h-[220px] space-y-2 overflow-auto pr-1 md:max-h-[300px]">
        {visibleOrders.filter((order) => order.id !== nextRouteOrder?.id).map((order) => (
          <button key={order.id} data-qa={`order-${order.id}`} onClick={() => dispatch({ type: "runOrder", orderId: order.id })} className="w-full rounded-2xl border border-amber-100/16 bg-amber-100/8 p-3 text-left transition hover:border-amber-200/40 hover:bg-amber-100/14">
            <p className="text-sm font-black text-amber-50">{order.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{order.short}</p>
          </button>
        ))}
        {availableOrders.length === 0 && (
          <p className="rounded-2xl border border-amber-100/16 bg-amber-100/8 p-3 text-sm leading-relaxed text-amber-50/68">All first-settlement orders are complete. The next sprint can expand this into city, nation and empire pressure.</p>
        )}
      </div>

      <div className="mt-3 rounded-2xl border border-amber-100/12 bg-black/26 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Latest chronicle</p>
        <p className="mt-1 text-sm font-black text-amber-50">{state.chronicle[0]?.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{state.chronicle[0]?.body}</p>
      </div>
    </aside>
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
    <div className="rounded-2xl border border-amber-100/12 bg-black/28 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/50">{label}</p>
      <p className="text-lg font-black text-amber-50">{value}</p>
    </div>
  );
}
