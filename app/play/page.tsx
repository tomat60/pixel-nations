"use client";

import { useMemo, useReducer } from "react";
import { BottomDock } from "./components/BottomDock";
import { CouncilPanel } from "./components/CouncilPanel";
import { LandSheet } from "./components/LandSheet";
import { MapStage } from "./components/MapStage";
import { OrdersPanel } from "./components/OrdersPanel";
import { TopBar } from "./components/TopBar";
import { VillageScene } from "./components/VillageScene";
import { WorldScene } from "./components/WorldScene";
import { getSelectedPlot, initialPlayState, playReducer } from "./lib/play-state";

export default function PlayPrototypePage() {
  const [state, dispatch] = useReducer(playReducer, initialPlayState);
  const selected = useMemo(() => getSelectedPlot(state), [state]);
  const isSceneView = state.view === "village" || state.view === "world";

  return (
    <main data-qa="play-shell" className="fixed inset-0 overflow-hidden bg-[#06090a] text-[#f7ead2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(250,204,21,.18),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(56,189,248,.15),transparent_32%),linear-gradient(180deg,#101711_0%,#050807_100%)]" />
      <section className="relative z-10 h-full p-2 md:p-4">
        <div data-qa="map-stage" className="relative h-full overflow-hidden rounded-[1.5rem] border border-amber-200/20 bg-[#1d2d23] shadow-[0_30px_90px_rgba(0,0,0,.45)] md:rounded-[2rem]">
          {state.view === "village" ? <VillageScene state={state} dispatch={dispatch} /> : null}
          {state.view === "world" ? <WorldScene state={state} dispatch={dispatch} /> : null}
          {!isSceneView ? <MapStage state={state} dispatch={dispatch} /> : null}
          <TopBar state={state} />

          <div className="pointer-events-none absolute right-3 top-[5.9rem] z-20 max-w-[210px] rounded-2xl border border-amber-100/20 bg-black/42 p-2.5 text-right shadow-xl backdrop-blur-md md:right-5 md:top-[6.8rem] md:max-w-[390px] md:p-3">
            <p className="text-[8px] uppercase tracking-[0.22em] text-amber-200/65 md:text-[10px] md:tracking-[0.26em]">Game shell</p>
            <p className="mt-1 text-xs font-black leading-tight text-amber-50 md:text-base">Map · Village · Orders · World · Council</p>
            <p className="mt-2 hidden text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/55 md:block">{state.lastEvent}</p>
          </div>

          {state.view === "map" ? <LandSheet selected={selected} state={state} dispatch={dispatch} /> : null}
          {state.view === "orders" && state.ownedPlotIds.length > 0 ? <OrdersPanel state={state} dispatch={dispatch} /> : null}
          {state.view === "council" ? <CouncilPanel state={state} dispatch={dispatch} /> : null}

          <BottomDock activeView={state.view} dispatch={dispatch} />
        </div>
      </section>
    </main>
  );
}
