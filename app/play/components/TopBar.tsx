import type { PlayState } from "../lib/play-state";

export function TopBar({ state }: { state: PlayState }) {
  return (
    <header className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between rounded-3xl border border-amber-200/20 bg-black/48 px-3 py-2 shadow-2xl backdrop-blur-md md:left-5 md:right-5 md:top-5 md:px-5 md:py-3">
      <div>
        <p className="text-[9px] uppercase tracking-[0.34em] text-amber-200/70 md:text-[10px] md:tracking-[0.38em]">Pixel Nations</p>
        <h1 className="text-lg font-black tracking-tight md:text-3xl">Aurelian Basin</h1>
      </div>
      <div className="hidden text-center md:block">
        <p className="text-[10px] uppercase tracking-[0.34em] text-amber-200/65">Sector A-01</p>
        <p className="mt-1 text-sm text-amber-50/70">One land can become an empire</p>
      </div>
      <div className="flex items-center gap-1.5 text-right md:gap-2">
        <HudChip label="Season" value={`${state.season}/12`} />
        <HudChip label="Lands" value={`${state.ownedPlotIds.length}/24`} />
      </div>
    </header>
  );
}

function HudChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 px-2 py-1.5 md:px-3 md:py-2">
      <p className="text-[8px] uppercase tracking-[0.2em] text-amber-200/60 md:text-[10px] md:tracking-[0.22em]">{label}</p>
      <p className="text-base font-black md:text-xl">{value}</p>
    </div>
  );
}
