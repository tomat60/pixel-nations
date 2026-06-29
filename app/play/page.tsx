"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  PLAYABLE_ACTIONS,
  canQueuePlayableAction,
  formatDuration,
  getCurrentObjective,
  getQueueProgress,
  getSettlementLevelLabel,
  queuePlayableAction,
  tickPlayableState,
  type PlayableActionDefinition,
  type PlayableResourceKey,
  type PlayableState,
} from "../lib/playable-engine";
import { clearPlayableState, readPlayableState, writePlayableState } from "../lib/playable-state";

const resourceLabels: Array<{ key: PlayableResourceKey; label: string }> = [
  { key: "food", label: "Food" },
  { key: "materials", label: "Materials" },
  { key: "treasury", label: "Treasury" },
  { key: "influence", label: "Influence" },
  { key: "stability", label: "Stability" },
];

export default function PlayPage() {
  const [state, setState] = useState<PlayableState | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const current = Date.now();
    const loaded = readPlayableState(current);
    writePlayableState(loaded);
    setState(loaded);
    setNow(current);

    const interval = window.setInterval(() => {
      const tickNow = Date.now();
      setNow(tickNow);
      setState((currentState) => {
        if (!currentState) return currentState;
        const next = tickPlayableState(currentState, tickNow);
        writePlayableState(next);
        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const objective = useMemo(() => (state ? getCurrentObjective(state) : "Loading command center."), [state]);
  const activeOrder = state?.queue[0];

  function queueAction(action: PlayableActionDefinition) {
    const actionNow = Date.now();
    setNow(actionNow);
    setState((currentState) => {
      if (!currentState) return currentState;
      const next = queuePlayableAction(currentState, action.id, actionNow);
      writePlayableState(next);
      return next;
    });
  }

  function resetPlayableState() {
    clearPlayableState();
    const resetAt = Date.now();
    const next = readPlayableState(resetAt);
    writePlayableState(next);
    setNow(resetAt);
    setState(next);
  }

  if (!state) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-12 text-white sm:px-10 sm:py-16">
        <section className="mx-auto max-w-4xl border border-amber-500/15 bg-[#08080f]/90 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
            Playable Command Center
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-syne)] text-4xl font-extrabold text-amber-100">
            Loading local settlement engine
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main data-qa="play-command-center" className="min-h-screen bg-[#050505] px-6 py-10 text-white sm:px-10 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-amber-500/15 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
              Playable Engine Slice / Local Clock
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={resetPlayableState}
                className="rounded border border-zinc-800 bg-[#08080f]/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
              >
                Reset Play State
              </button>
            </div>
          </div>

          <h1 className="mt-7 max-w-4xl font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight text-amber-100 sm:text-5xl md:text-6xl">
            Settlement command center
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">
            A local-only strategy loop: resources tick, orders finish on short timers, and events change the
            settlement.
          </p>
        </header>

        <section className="mt-8 border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.12] to-[#08080f] p-5 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/70">Current Objective</p>
          <p className="mt-3 text-xl font-semibold text-amber-100">{objective}</p>
        </section>

        <section data-qa="play-resource-counters" className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-6">
          <ResourceCard label="Population" value={state.population} />
          {resourceLabels.map((resource) => (
            <ResourceCard key={resource.key} label={resource.label} value={state.resources[resource.key]} />
          ))}
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="border border-amber-500/15 bg-[#06060c]/85 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Orders
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-extrabold text-amber-100">
                  Choose the next settlement action
                </h2>
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-600">{state.queue.length}/3 queued</p>
            </div>

            <div data-qa="play-action-list" className="mt-6 grid gap-3 md:grid-cols-2">
              {PLAYABLE_ACTIONS.map((action) => {
                const enabled = canQueuePlayableAction(state, action.id);
                return (
                  <article key={action.id} className="border border-zinc-800 bg-[#08080f]/90 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">
                          {action.label}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{action.description}</p>
                      </div>
                      <span className="shrink-0 border border-amber-500/15 bg-amber-500/[0.06] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/75">
                        {action.durationSeconds}s
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                      <p>Cost: {formatCost(action.cost)}</p>
                      <p>Result: {action.produces}</p>
                    </div>
                    <button
                      type="button"
                      data-qa={`play-action-${action.id}`}
                      disabled={!enabled}
                      onClick={() => queueAction(action)}
                      className={
                        enabled
                          ? "btn-primary mt-5 w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                          : "mt-5 w-full cursor-not-allowed rounded border border-zinc-800 bg-zinc-950/75 px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-600"
                      }
                    >
                      {enabled ? "Queue Order" : "Needs Resources"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="grid gap-6">
            <section data-qa="play-active-queue" className="border border-amber-500/15 bg-[#06060c]/85 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Active Queue</p>
              {activeOrder ? (
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-[family-name:var(--font-syne)] text-2xl font-extrabold text-amber-100">
                      {activeOrder.label}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                      {formatDuration(activeOrder.endsAt - now)}
                    </p>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-900">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-700 to-amber-300 transition-[width]"
                      style={{ width: `${getQueueProgress(activeOrder, now)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-7 text-zinc-400">No active order. Queue an action to move the clock.</p>
              )}

              {state.queue.length > 1 ? (
                <ol className="mt-5 space-y-2 border-t border-zinc-800 pt-4">
                  {state.queue.slice(1).map((queued) => (
                    <li key={queued.queueId} className="flex items-center justify-between gap-3 text-sm text-zinc-400">
                      <span>{queued.label}</span>
                      <span className="text-xs text-zinc-600">queued</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </section>

            <section className="border border-amber-500/15 bg-[#06060c]/85 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Settlement Status</p>
              <div className="mt-5 grid grid-cols-2 gap-px border border-amber-500/10 bg-amber-500/10">
                <StatusTile label="Level" value={getSettlementLevelLabel(state.settlementLevel)} />
                <StatusTile label="Nation Progress" value={`${state.nationProgress}/100`} />
                <StatusTile label="Fields" value={state.fieldsLevel} />
                <StatusTile label="Quarry" value={state.quarryLevel} />
                <StatusTile label="Council" value={state.councilLevel} />
                <StatusTile label="Trade" value={state.tradeLevel} />
              </div>
            </section>

            <section data-qa="play-event-log" className="border border-amber-500/15 bg-[#06060c]/85 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Recent Log</p>
              <ol className="mt-5 space-y-3">
                {state.log.slice(0, 6).map((entry) => (
                  <li key={entry.id} className="border border-zinc-800 bg-[#08080f]/80 p-3">
                    <p className="text-sm font-semibold text-amber-100">{entry.title}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{entry.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ResourceCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="bg-[#08080f]/95 p-4 sm:p-5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</p>
      <p className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-extrabold text-amber-100">{value}</p>
    </article>
  );
}

function StatusTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#08080f]/95 p-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function formatCost(cost: Partial<Record<PlayableResourceKey, number>>) {
  const entries = Object.entries(cost);
  if (entries.length === 0) return "none";
  return entries.map(([key, value]) => `${value} ${key}`).join(", ");
}
