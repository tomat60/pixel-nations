"use client";

import { useMemo, useReducer } from "react";
import { BottomDock } from "./components/BottomDock";
import { LandSheet } from "./components/LandSheet";
import { MapStage } from "./components/MapStage";
import { OrdersPanel } from "./components/OrdersPanel";
import { TopBar } from "./components/TopBar";
import { getSelectedPlot, initialPlayState, playReducer, type PlayState } from "./lib/play-state";

export default function PlayPrototypePage() {
  const [state, dispatch] = useReducer(playReducer, initialPlayState);
  const selected = useMemo(() => getSelectedPlot(state), [state]);
  const showOrders = state.ownedPlotIds.length > 0 && state.view === "orders";
  const showChronicle = state.view === "chronicle";
  const showLandSheet = !showOrders && !showChronicle;

  return (
    <main data-qa="play-shell" className="fixed inset-0 overflow-hidden bg-[#06090a] text-[#f7ead2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(250,204,21,.18),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(56,189,248,.15),transparent_32%),linear-gradient(180deg,#101711_0%,#050807_100%)]" />
      <section className="relative z-10 h-full p-2 md:p-4">
        <div data-qa="map-stage" className="relative h-full overflow-hidden rounded-[1.5rem] border border-amber-200/20 bg-[#1d2d23] shadow-[0_30px_90px_rgba(0,0,0,.45)] md:rounded-[2rem]">
          <MapStage state={state} dispatch={dispatch} />
          <TopBar state={state} />

          <div className="pointer-events-none absolute right-3 top-[5.9rem] z-20 max-w-[192px] rounded-2xl border border-amber-100/20 bg-black/42 p-2.5 text-right shadow-xl backdrop-blur-md md:right-5 md:top-[6.8rem] md:max-w-[360px] md:p-3">
            <p className="text-[8px] uppercase tracking-[0.22em] text-amber-200/65 md:text-[10px] md:tracking-[0.26em]">Map controls</p>
            <p className="mt-1 text-xs font-black leading-tight text-amber-50 md:text-base">Pinch zoom · drag pan</p>
            <p className="mt-1 text-[10px] leading-snug text-amber-50/65 md:text-xs">Use one panel at a time.</p>
            <p className="mt-2 hidden text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/55 md:block">{state.lastEvent}</p>
          </div>

          {showLandSheet ? <LandSheet selected={selected} state={state} dispatch={dispatch} /> : null}
          {showOrders ? <OrdersPanel state={state} dispatch={dispatch} /> : null}
          {showChronicle ? <ChroniclePanel state={state} /> : null}

          <BottomDock activeView={state.view} dispatch={dispatch} />
        </div>
      </section>
    </main>
  );
}

function ChroniclePanel({ state }: { state: PlayState }) {
  return (
    <div data-qa="chronicle-panel" className="absolute bottom-[4.7rem] right-3 z-20 max-h-[calc(100%-11rem)] w-[min(390px,calc(100%-1.5rem))] overflow-auto rounded-3xl border border-amber-100/20 bg-black/60 p-4 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:right-5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200/65">Chronicle</p>
      <h3 className="mt-1 text-xl font-black">What changed</h3>
      <div className="mt-3 space-y-2">
        {state.chronicle.slice(0, 5).map((entry) => (
          <article key={`${entry.season}-${entry.title}`} className="rounded-2xl border border-amber-100/12 bg-amber-100/8 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/50">Season {entry.season}</p>
            <p className="mt-1 text-sm font-black text-amber-50">{entry.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{entry.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
