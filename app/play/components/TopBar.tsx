import { chartedLands, worldLands } from "../lib/map-data";
import type { PlayState } from "../lib/play-state";

export function TopBar({ state }: { state: PlayState }) {
  return (
    <header className="absolute left-2 right-2 top-2 z-20 flex items-center justify-between gap-2 rounded-2xl border border-amber-200/20 bg-black/48 px-2.5 py-1.5 shadow-xl backdrop-blur-md md:left-4 md:right-4 md:top-4 md:px-4 md:py-2">
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-[0.28em] text-amber-200/70 md:text-[9px] md:tracking-[0.32em]">Pixel Nations</p>
        <h1 className="truncate text-base font-black tracking-tight md:text-2xl">Aurelian Basin</h1>
      </div>
      <div className="hidden min-w-0 flex-1 px-4 text-center lg:block">
        <p className="truncate text-[9px] uppercase tracking-[0.26em] text-amber-200/60">Sector A-01 · {chartedLands} charted of {worldLands.toLocaleString()} lands</p>
        <p className="mt-0.5 truncate text-xs text-amber-50/62">Local village ring · wider rivals · {state.completedOrders.length} orders complete</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-right md:gap-1.5">
        <HudChip label="Season" value={`${state.season}/12`} />
        <HudChip label="Orders" value={`${state.completedOrders.length}/8`} />
        <HudChip label="Claimed" value={`${state.ownedPlotIds.length}/${chartedLands}`} />
      </div>
    </header>
  );
}

function HudChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[48px] rounded-xl border border-amber-200/18 bg-amber-100/8 px-1.5 py-1 text-center md:min-w-[62px] md:px-2.5 md:py-1.5">
      <p className="text-[7px] uppercase tracking-[0.14em] text-amber-200/55 md:text-[8px] md:tracking-[0.18em]">{label}</p>
      <p className="text-sm font-black leading-none md:text-lg">{value}</p>
    </div>
  );
}
