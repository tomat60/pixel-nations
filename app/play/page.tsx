"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { BottomDock } from "./components/BottomDock";
import { CouncilPanel } from "./components/CouncilPanel";
import { CurrentObjective } from "./components/CurrentObjective";
import { DemoCompleteOverlay } from "./components/DemoCompleteOverlay";
import { FoundingCeremony } from "./components/FoundingCeremony";
import { LandSheet } from "./components/LandSheet";
import { MapStage } from "./components/MapStage";
import { OrdersPanel } from "./components/OrdersPanel";
import { PostCrisisCountermovePanel } from "./components/PostCrisisCountermovePanel";
import { StrategicBranchOverlay } from "./components/StrategicBranchOverlay";
import { TopBar } from "./components/TopBar";
import { VillageScene } from "./components/VillageScene";
import {
  getEmpireCrisisOpen,
  getImperialTurnComplete,
  getNationDecision,
  getPostCrisisCountermoveReady,
  getPostCrisisFrontierPayoffTarget,
  getPostCrisisResponseDecision,
  getSelectedPlot,
  initialPlayState,
  playReducer,
  playV1StorageKey,
  type PlayState,
} from "./lib/play-state";
import { WorldMapScene } from "./world/WorldMapScene";

export default function PlayPrototypePage() {
  const [state, dispatch] = useReducer(playReducer, initialPlayState);
  const [hydrated, setHydrated] = useState(false);
  const [demoOverlayDismissed, setDemoOverlayDismissed] = useState(false);
  const [founderRecordReopened, setFounderRecordReopened] = useState(false);
  const [restartedRun, setRestartedRun] = useState(false);
  const selected = useMemo(() => getSelectedPlot(state), [state]);
  const nationDecision = useMemo(() => getNationDecision(state), [state]);
  const isVillage = state.view === "village";
  const isWorld = state.view === "world";
  const crisisOpen = getEmpireCrisisOpen(state);
  const founderRecordReady = Boolean(state.empireDeclarationId && getImperialTurnComplete(state) && !crisisOpen);
  const postCrisisStarted = Boolean(state.postCrisisCountermoveOrigin);
  const postCrisisReady = getPostCrisisCountermoveReady(state);
  const postCrisisResponse = getPostCrisisResponseDecision(state);
  const postCrisisFrontierPayoffTarget = useMemo(() => getPostCrisisFrontierPayoffTarget(state), [state]);
  const postCrisisFrontierPayoffSecured = state.postCrisisFrontierPayoffSecured;
  const demoComplete = founderRecordReady && !postCrisisStarted;
  const showFounderRecord = founderRecordReopened || (demoComplete && !demoOverlayDismissed);
  const showOpeningGuide = hydrated && state.view === "map" && state.ownedPlotIds.length === 0;
  const secondRunStarted = restartedRun && state.ownedPlotIds.length > 0;

  useEffect(() => {
    const restored = restorePlayState();
    if (restored) dispatch({ type: "hydrate", state: restored });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(playV1StorageKey, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!founderRecordReady) {
      setDemoOverlayDismissed(false);
      setFounderRecordReopened(false);
    }
  }, [founderRecordReady]);

  function restartRun() {
    dispatch({ type: "reset" });
    setDemoOverlayDismissed(false);
    setFounderRecordReopened(false);
    setRestartedRun(true);
  }

  function openFounderRecord() {
    dispatch({ type: "setView", view: "council" });
    setFounderRecordReopened(true);
  }

  function continueRuling() {
    dispatch({ type: "beginPostCrisisCountermove" });
    setDemoOverlayDismissed(true);
  }

  function continueFounderRecord() {
    if (founderRecordReopened || postCrisisStarted) {
      setFounderRecordReopened(false);
      setDemoOverlayDismissed(true);
      return;
    }

    continueRuling();
  }

  return (
    <main data-qa="play-shell" className="fixed inset-0 overflow-hidden bg-[#06090a] text-[#f7ead2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(250,204,21,.18),transparent_30%),radial-gradient(circle_at_78%_22%,rgba(56,189,248,.15),transparent_32%),linear-gradient(180deg,#101711_0%,#050807_100%)]" />
      <section className="relative z-10 h-full p-2 md:p-4">
        <div data-qa="map-stage" className="relative h-full overflow-hidden rounded-[1.5rem] border border-amber-200/20 bg-[#1d2d23] shadow-[0_30px_90px_rgba(0,0,0,.45)] md:rounded-[2rem]">
          {isVillage ? <VillageScene state={state} dispatch={dispatch} /> : isWorld ? <WorldMapScene state={state} dispatch={dispatch} /> : <MapStage state={state} dispatch={dispatch} />}
          <TopBar state={state} />
          <CurrentObjective state={state} demoComplete={demoComplete} demoOverlayDismissed={demoOverlayDismissed} founderRecordAvailable={founderRecordReady} secondRunStarted={secondRunStarted} onOpenFounderRecord={openFounderRecord} />
          {showOpeningGuide ? <OpeningGuide selectedName={selected.name} /> : null}
          {state.view === "map" ? <LandSheet selected={selected} state={state} dispatch={dispatch} /> : null}
          {state.view === "orders" && state.ownedPlotIds.length > 0 ? <OrdersPanel state={state} dispatch={dispatch} /> : null}
          {state.view === "council" ? <CouncilPanel state={state} dispatch={dispatch} /> : null}
          <StrategicBranchOverlay state={state} dispatch={dispatch} />
          {nationDecision && !state.foundingCeremonySeen ? <FoundingCeremony state={state} decision={nationDecision} dispatch={dispatch} /> : null}
          {hydrated && state.view === "council" && postCrisisReady && state.postCrisisCountermoveOrigin ? (
            <div className="absolute inset-x-3 bottom-20 z-40 md:inset-x-auto md:left-5 md:right-5 md:bottom-24">
              <PostCrisisCountermovePanel
                origin={state.postCrisisCountermoveOrigin}
                onRespond={(responseId) => dispatch({ type: "resolvePostCrisisResponse", responseId })}
              />
            </div>
          ) : null}
          {hydrated && state.view === "council" && postCrisisResponse ? (
            <section
              data-qa="world-post-crisis-consequence"
              data-post-crisis-response={state.postCrisisResponseId ?? "none"}
              className="absolute bottom-20 left-3 right-3 z-30 rounded-3xl border border-sky-200/25 bg-slate-950/88 p-4 shadow-2xl backdrop-blur-md md:left-auto md:right-5 md:w-[420px]"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/60">World consequence</p>
              <p className="mt-1 text-lg font-black text-amber-50">{postCrisisResponse.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-50/65">{postCrisisResponse.worldEffect}</p>
            </section>
          ) : null}
          {hydrated && state.view === "council" && postCrisisFrontierPayoffTarget ? (
            <section
              data-qa="post-crisis-frontier-target"
              data-frontier-payoff-origin={postCrisisFrontierPayoffTarget.id}
              className="absolute bottom-20 left-3 right-3 z-30 rounded-3xl border border-emerald-200/25 bg-slate-950/88 p-4 shadow-2xl backdrop-blur-md md:left-auto md:right-5 md:w-[420px]"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-100/60">Frontier payoff</p>
              <p className="mt-1 text-lg font-black text-amber-50">{postCrisisFrontierPayoffTarget.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-50/65">{postCrisisFrontierPayoffTarget.short}</p>
              {postCrisisFrontierPayoffSecured ? (
                <p data-qa="post-crisis-frontier-secured" className="mt-3 rounded-2xl border border-emerald-200/35 bg-emerald-300/12 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-100">
                  Secured
                </p>
              ) : (
                <button
                  type="button"
                  data-qa="secure-post-crisis-frontier"
                  onClick={() => dispatch({ type: "securePostCrisisFrontierPayoff" })}
                  className="mt-3 w-full rounded-2xl bg-emerald-200 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-emerald-100"
                >
                  Secure frontier payoff
                </button>
              )}
            </section>
          ) : null}
          {hydrated && state.view === "council" && showFounderRecord ? <DemoCompleteOverlay state={state} onContinue={continueFounderRecord} onRestart={restartRun} /> : null}
          <BottomDock activeView={state.view} dispatch={dispatch} />
        </div>
      </section>
    </main>
  );
}

function OpeningGuide({ selectedName }: { selectedName: string }) {
  return (
    <section data-qa="opening-guide" className="pointer-events-none absolute left-3 right-3 top-[10.8rem] z-20 rounded-3xl border border-amber-100/20 bg-black/46 p-3 shadow-2xl backdrop-blur-md md:left-5 md:right-auto md:top-[12.2rem] md:w-[390px] md:p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/65">Start here</p>
      <h2 className="mt-1 text-xl font-black text-amber-50 md:text-2xl">One land can become an empire.</h2>
      <p className="mt-2 text-xs leading-relaxed text-amber-50/68 md:text-sm">You are viewing Sector A-01, the Aurelian Basin. Choose a land, raise the first settlement, then expand toward a nation.</p>
      <div className="mt-3 grid gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-amber-100/70 md:text-xs">
        <p>1 · Select {selectedName}</p>
        <p>2 · Press “Claim this land”</p>
        <p>3 · Build the first village order</p>
      </div>
    </section>
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
      empireCrisisReason: parsed.empireCrisisReason ?? null,
      empireCrisisRecoveryId: parsed.empireCrisisRecoveryId ?? null,
      foundingCeremonySeen: Boolean(parsed.foundingCeremonySeen),
    };
  } catch {
    return null;
  }
}
