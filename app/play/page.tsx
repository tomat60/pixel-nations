"use client";

import { useMemo, useReducer } from "react";
import { parcels, terrainLine, views } from "./play-data";
import { PlayMapStage } from "./play-map";
import { getObjective, getPhase, initialPlayState, playReducer } from "./play-state";
import { Chronicle, OrderButton, Panel, StatusChip } from "./play-ui";

export default function PlayPrototypePage() {
  const [state, dispatch] = useReducer(playReducer, initialPlayState);
  const selected = useMemo(() => parcels.find((parcel) => parcel.id === state.selectedId) ?? parcels[12], [state.selectedId]);
  const capital = useMemo(() => parcels.find((parcel) => parcel.id === state.owned[0]) ?? null, [state.owned]);
  const phase = getPhase(state);
  const objective = getObjective(state, phase);

  return (
    <main data-qa="play-shell" className="fixed inset-0 overflow-hidden bg-[#06090a] text-[#f7ead2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(250,204,21,.20),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(56,189,248,.16),transparent_31%),linear-gradient(180deg,#101711_0%,#050807_100%)]" />
      <section className="relative z-10 h-full p-2 md:p-4">
        <div data-qa="map-stage" className="relative h-full overflow-hidden rounded-[1.5rem] border border-amber-200/20 bg-[#1d2d23] shadow-[0_30px_90px_rgba(0,0,0,.45)] md:rounded-[2rem]">
          <PlayMapStage state={state} phase={phase} capitalId={capital?.id} dispatch={dispatch} />

          <header className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between rounded-3xl border border-amber-200/20 bg-black/45 px-3 py-2 shadow-2xl backdrop-blur-md md:left-4 md:right-4 md:top-4 md:px-4 md:py-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.34em] text-amber-200/70 md:text-[10px] md:tracking-[0.38em]">Pixel Nations</p>
              <h1 className="text-lg font-black tracking-tight md:text-3xl">Aurelian Basin</h1>
            </div>
            <div className="hidden text-center md:block">
              <p className="text-[10px] uppercase tracking-[0.34em] text-amber-200/65">From Land to Empire</p>
              <p className="mt-1 text-sm text-amber-50/70">One fullscreen map game</p>
            </div>
            <div className="flex items-center gap-1.5 text-right md:gap-2">
              <StatusChip label="Season" value={`${state.season}/12`} />
              <StatusChip label="Lands" value={`${state.owned.length}/30`} />
            </div>
          </header>

          <div className="absolute left-3 top-[5.9rem] z-20 max-w-[172px] rounded-2xl border border-amber-100/20 bg-black/42 p-2.5 shadow-xl backdrop-blur-md md:left-5 md:top-[6.8rem] md:max-w-[286px] md:rounded-3xl md:p-4">
            <p className="text-[8px] uppercase tracking-[0.22em] text-amber-200/70 md:text-[10px] md:tracking-[0.25em]">Selected parcel</p>
            <h2 className="mt-1 text-base font-black leading-tight md:text-2xl">{selected.name}</h2>
            <p className="mt-1 text-[10px] text-amber-50/80 md:text-sm">{selected.region} - {selected.terrain}</p>
            <p className="mt-2 hidden text-xs leading-relaxed text-amber-50/65 md:block">{terrainLine[selected.terrain]}</p>
            {phase === "unclaimed" ? (
              <button data-qa="claim-button" onClick={() => dispatch({ type: "claim", parcelId: selected.id })} className="mt-2 rounded-xl bg-amber-300 px-3 py-2 text-[11px] font-black text-stone-950 shadow-lg shadow-black/30 md:mt-3 md:rounded-2xl md:px-4 md:text-sm">
                {selected.rival ? "Rival banner" : "Choose this land"}
              </button>
            ) : (
              <p className="mt-2 rounded-xl bg-amber-100/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-100 md:mt-3 md:rounded-2xl md:px-4 md:text-xs">{phase} phase</p>
            )}
          </div>

          <div className="absolute right-3 top-[5.9rem] z-20 max-w-[170px] rounded-2xl border border-amber-100/20 bg-black/38 p-2.5 text-right shadow-xl backdrop-blur-md md:right-5 md:top-[6.8rem] md:max-w-[330px] md:p-3">
            <p className="text-[8px] uppercase tracking-[0.22em] text-amber-200/65 md:text-[10px] md:tracking-[0.26em]">{objective.eyebrow}</p>
            <p className="mt-1 text-xs font-black leading-tight text-amber-50 md:text-base">{objective.title}</p>
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-amber-50/65 md:text-xs">{objective.body}</p>
            <p className="mt-2 hidden text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/55 md:block">{state.lastEvent}</p>
          </div>

          <div className="absolute bottom-[4.6rem] left-3 right-3 z-20 rounded-2xl border border-amber-100/20 bg-black/52 p-2.5 shadow-xl backdrop-blur-md md:bottom-[5.3rem] md:left-auto md:right-5 md:w-[430px] md:rounded-3xl md:p-3">
            {state.view === "map" && (
              <div>
                <div className="md:hidden">
                  <p className="text-[8px] font-black uppercase tracking-[0.22em] text-amber-200/60">Game layer</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-black">Map-first basin</p>
                    <p className="rounded-full bg-amber-300 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-stone-950">Tap land</p>
                  </div>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200/58">Claim → Orders → visible map change</p>
                </div>
                <div className="hidden md:block">
                  <Panel title="30-parcel Basin" body="Starter lands, rivals, roads, river, coast and owned influence now live on one fullscreen map." />
                </div>
              </div>
            )}
            {state.view === "orders" && (
              <div>
                <div className="md:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.22em] text-amber-200/60">Season Orders</p>
                      <h3 className="mt-1 text-sm font-black">One order. One map change.</h3>
                    </div>
                    <p className="rounded-full border border-amber-200/25 bg-amber-300/14 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-amber-100">Season {state.season}</p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <button disabled={!capital} onClick={() => dispatch({ type: "order", order: "expand" })} className="rounded-xl border border-amber-100/20 bg-amber-100/10 px-2.5 py-2 text-left text-[10px] font-black uppercase tracking-[0.14em] text-amber-50 disabled:opacity-30">Expand <span className="block pt-1 text-[8px] text-amber-200/55">+ land</span></button>
                    <button disabled={!capital} onClick={() => dispatch({ type: "order", order: "develop" })} className="rounded-xl border border-amber-100/20 bg-amber-100/10 px-2.5 py-2 text-left text-[10px] font-black uppercase tracking-[0.14em] text-amber-50 disabled:opacity-30">Develop <span className="block pt-1 text-[8px] text-amber-200/55">+ marker</span></button>
                    <button disabled={!capital} onClick={() => dispatch({ type: "order", order: "secure" })} className="rounded-xl border border-amber-100/20 bg-amber-100/10 px-2.5 py-2 text-left text-[10px] font-black uppercase tracking-[0.14em] text-amber-50 disabled:opacity-30">Secure <span className="block pt-1 text-[8px] text-amber-200/55">+ influence</span></button>
                    <button disabled={!capital} onClick={() => dispatch({ type: "order", order: "scout" })} className="rounded-xl border border-amber-100/20 bg-amber-100/10 px-2.5 py-2 text-left text-[10px] font-black uppercase tracking-[0.14em] text-amber-50 disabled:opacity-30">Scout <span className="block pt-1 text-[8px] text-amber-200/55">+ label</span></button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Panel title="Season Orders" body="Choose one order. A good order must create a visible consequence on the map this season." />
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <OrderButton label="Expand" body="Claim one safe parcel and widen the realm." result="new owned land" onClick={() => dispatch({ type: "order", order: "expand" })} disabled={!capital} />
                    <OrderButton label="Develop" body="Raise the capital marker toward a town." result="marker level up" onClick={() => dispatch({ type: "order", order: "develop" })} disabled={!capital} />
                    <OrderButton label="Secure" body="Push your influence ring across the basin." result="larger influence" onClick={() => dispatch({ type: "order", order: "secure" })} disabled={!capital} />
                    <OrderButton label="Scout" body="Reveal one more parcel and future choice." result="new map label" onClick={() => dispatch({ type: "order", order: "scout" })} disabled={!capital} />
                    <div className="sm:col-span-2">
                      <OrderButton label="Trade" body="Draw a route toward the Iron Coast once your capital can support it." result="nation pressure" onClick={() => dispatch({ type: "order", order: "trade" })} disabled={!capital || state.developmentLevel < 3} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {state.view === "realm" && <Panel title="Age Layer" body={`Phase: ${phase}. Capital marker level ${state.developmentLevel}/5. Owned parcels: ${state.owned.length}. This replaces dashboard and settlement as one in-game sheet.`} />}
            {state.view === "chronicle" && <Chronicle entries={state.chronicle} />}
            {state.view === "world" && <Panel title="World Atlas Layer" body="A-01 is only one basin in a 10,000-land world. The big game stays visible, but the demo remains one focused sector." />}
          </div>

          <nav className="absolute bottom-3 left-3 right-3 z-20 grid grid-cols-5 gap-1.5 rounded-3xl border border-amber-200/20 bg-black/45 p-1.5 backdrop-blur-md md:bottom-4 md:left-4 md:right-4 md:gap-2 md:p-2">
            {views.map((item) => (
              <button key={item.id} onClick={() => dispatch({ type: "setView", view: item.id })} className={`rounded-2xl px-1.5 py-2 text-[10px] font-black uppercase tracking-wide transition md:px-2 md:py-3 md:text-sm ${state.view === item.id ? "bg-amber-300 text-stone-950" : "bg-white/5 text-amber-50/70"}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
