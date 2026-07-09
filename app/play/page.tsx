"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { BottomDock } from "./components/BottomDock";
import { CouncilPanel } from "./components/CouncilPanel";
import { FoundingCeremony } from "./components/FoundingCeremony";
import { LandSheet } from "./components/LandSheet";
import { MapStage } from "./components/MapStage";
import { OrdersPanel } from "./components/OrdersPanel";
import { TopBar } from "./components/TopBar";
import { VillageScene } from "./components/VillageScene";
import { getNationDecision, getSelectedPlot, initialPlayState, playReducer, playV1StorageKey, type PlayState } from "./lib/play-state";
import { WorldMapScene } from "./world/WorldMapScene";

export default function PlayPrototypePage() {
  const [state, dispatch] = useReducer(playReducer, initialPlayState);
  const [hydrated, setHydrated] = useState(false);
  const selected = useMemo(() => getSelectedPlot(state), [state]);
  const nationDecision = useMemo(() => getNationDecision(state), [state]);
  const isVillage = state.view === "village";
  const isWorld = state.view === "world";

  useEffect(() => {
    const restored = restorePlayState();
    if (restored) dispatch({ type: "hydrate", state: restored });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(playV1StorageKey, JSON.stringify(state));
  }, [hydrated, state]);

  return (
    <main data-qa="play-shell" className="fixed inset-0 overflow-hidden bg-[#06090a] text-[#f7ead2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(250,204,21,.18),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(56,189,248,.15),transparent_32%),linear-gradient(180deg,#101711_0%,#050807_100%)]" />
      <section className="relative z-10 h-full p-2 md:p-4">
        <div data-qa="map-stage" className="relative h-full overflow-hidden rounded-[1.5rem] border border-amber-200/20 bg-[#1d2d23] shadow-[0_30px_90px_rgba(0,0,0,.45)] md:rounded-[2rem]">
          {isVillage ? <VillageScene state={state} dispatch={dispatch} /> : isWorld ? <WorldMapScene state={state} dispatch={dispatch} /> : <MapStage state={state} dispatch={dispatch} />}
          <TopBar state={state} />
          <div className="pointer-events-none absolute right-3 top-[5.9rem] z-20 max-w-[210px] rounded-2xl border border-amber-100/20 bg-black/42 p-2.5 text-right shadow-xl backdrop-blur-md md:right-5 md:top-[6.8rem] md:max-w-[390px] md:p-3">
            <p className="text-[8px] uppercase tracking-[0.22em] text-amber-200/65 md:text-[10px] md:tracking-[0.26em]">{isVillage ? "Village scene" : isWorld ? "Expansion map" : "Game shell"}</p>
            <p className="mt-1 text-xs font-black leading-tight text-amber-50 md:text-base">Map · Village · Orders · World · Council</p>
            <p className="mt-2 hidden text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/55 md:block">{state.lastEvent}</p>
          </div>
          {state.view === "map" ? <LandSheet selected={selected} state={state} dispatch={dispatch} /> : null}
          {state.view === "orders" && state.ownedPlotIds.length > 0 ? <OrdersPanel state={state} dispatch={dispatch} /> : null}
          {state.view === "council" ? <CouncilPanel state={state} dispatch={dispatch} /> : null}
          {nationDecision && !state.foundingCeremonySeen ? <FoundingCeremony state={state} decision={nationDecision} dispatch={dispatch} /> : null}
          <BottomDock activeView={state.view} dispatch={dispatch} />
        </div>
      </section>
    </main>
  );
}

function restorePlayState(): PlayState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(playV1StorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlayState>;
    if (!Array.isArray(parsed.ownedPlotIds) || !Array.isArray(parsed.completedOrders)) return null;
    return {
      ...initialPlayState,
      ...parsed,
      resources: { ...initialPlayState.resources, ...parsed.resources },
      ownedPlotIds: parsed.ownedPlotIds ?? [],
      ownedSectorIds: parsed.ownedSectorIds ?? [],
      completedOrders: parsed.completedOrders ?? [],
      settlementMarkers: parsed.settlementMarkers ?? [],
      scoutedPlotIds: parsed.scoutedPlotIds ?? [],
      chronicle: parsed.chronicle ?? initialPlayState.chronicle,
      retentionRecords: parsed.retentionRecords ?? [],
      nationDecisionId: parsed.nationDecisionId ?? null,
      foundingCeremonySeen: Boolean(parsed.foundingCeremonySeen),
    };
  } catch {
    return null;
  }
}
