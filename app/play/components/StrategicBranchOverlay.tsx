import { getImperialPressureBand } from "../lib/imperial-turn";
import {
  getAvailableImperialTurnActions,
  getImperialTurnComplete,
  getImperialTurnHistory,
  getImperialTurnNumber,
  getLatestImperialTurnAction,
  getRivalPressure,
  getStrategicOutcome,
  getStrategicPosture,
  type PlayAction,
  type PlayState,
} from "../lib/play-state";

const toneClasses = {
  red: {
    panel: "border-red-200/40 bg-red-500/14",
    eyebrow: "text-red-100/70",
    accent: "text-red-100",
    button: "border-red-100/22 hover:border-red-100/55 hover:bg-red-200/12",
  },
  sky: {
    panel: "border-sky-200/40 bg-sky-500/14",
    eyebrow: "text-sky-100/70",
    accent: "text-sky-100",
    button: "border-sky-100/22 hover:border-sky-100/55 hover:bg-sky-200/12",
  },
  purple: {
    panel: "border-purple-200/40 bg-purple-500/14",
    eyebrow: "text-purple-100/70",
    accent: "text-purple-100",
    button: "border-purple-100/22 hover:border-purple-100/55 hover:bg-purple-200/12",
  },
} as const;

const pressureLayerClasses = {
  low: "bg-[radial-gradient(circle_at_78%_35%,rgba(52,211,153,.08),transparent_38%)]",
  guarded: "bg-[radial-gradient(circle_at_78%_35%,rgba(251,191,36,.11),transparent_40%)]",
  critical: "bg-[radial-gradient(circle_at_78%_35%,rgba(248,113,113,.16),transparent_44%)]",
} as const;

export function StrategicBranchOverlay({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const branch = getStrategicPosture(state);
  const outcome = getStrategicOutcome(state);

  if (!branch || (state.view !== "council" && state.view !== "world")) return null;

  const tone = toneClasses[branch.tone];
  const turnNumber = getImperialTurnNumber(state);
  const turnComplete = getImperialTurnComplete(state);
  const turnHistory = getImperialTurnHistory(state);
  const availableActions = getAvailableImperialTurnActions(state);
  const latestAction = getLatestImperialTurnAction(state);
  const pressure = getRivalPressure(state);
  const pressureBand = getImperialPressureBand(pressure);

  if (state.view === "world") {
    return (
      <>
        <div
          data-qa="world-imperial-pressure-layer"
          data-pressure-band={pressureBand}
          data-pressure={pressure}
          className={`pointer-events-none absolute inset-0 z-[5] transition duration-300 ${pressureLayerClasses[pressureBand]}`}
        />
        <aside
          data-qa="world-posture-signal"
          data-posture={branch.postureId}
          data-outcome={outcome?.id ?? "none"}
          className={`absolute bottom-[5.2rem] left-3 z-30 w-[min(390px,calc(100%-1.5rem))] rounded-3xl border p-3 shadow-2xl backdrop-blur-md md:bottom-[6.2rem] md:left-6 md:p-4 ${tone.panel}`}
        >
          <p data-qa="posture-label" data-posture={branch.postureId} className={`text-[9px] font-black uppercase tracking-[0.2em] ${tone.eyebrow}`}>
            Strategic posture · {branch.label}
          </p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-black text-amber-50">{branch.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-50/65">{branch.worldSignal}</p>
            </div>
            <div data-qa="world-imperial-turn" data-turn-count={turnNumber} className="shrink-0 rounded-2xl border border-white/14 bg-black/28 px-2.5 py-2 text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.14em] text-amber-100/55">Turn</p>
              <p className="text-sm font-black text-amber-50">{turnNumber}/3</p>
            </div>
          </div>
          {outcome ? (
            <div data-qa="world-posture-outcome" data-outcome-id={outcome.id} className="mt-3 rounded-2xl border border-white/14 bg-black/28 p-3">
              <p className={`text-sm font-black ${tone.accent}`}>{outcome.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{outcome.worldEffect}</p>
            </div>
          ) : (
            <p className="mt-3 rounded-2xl border border-white/12 bg-black/24 px-3 py-2 text-xs font-bold text-amber-50/68">Outcome pending in Council.</p>
          )}
          {latestAction ? (
            <div data-qa="world-imperial-action-marker" data-action-id={latestAction.id} className="mt-2 rounded-2xl border border-white/14 bg-black/30 p-3">
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-100/55">Latest imperial action</p>
              <p className="mt-1 text-sm font-black text-amber-50">{latestAction.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-50/60">{latestAction.worldMarker}</p>
            </div>
          ) : null}
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100/55">Rival pressure · {pressure}% · {pressureBand}</p>
        </aside>
      </>
    );
  }

  return (
    <aside
      data-qa="post-empire-branch"
      data-posture={branch.postureId}
      data-outcome={outcome?.id ?? "none"}
      className={`absolute bottom-[4.7rem] left-3 z-30 max-h-[calc(100%-10rem)] w-[min(420px,calc(100%-1.5rem))] overflow-auto rounded-3xl border p-3 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:left-5 md:p-4 ${tone.panel}`}
    >
      <p data-qa="posture-label" data-posture={branch.postureId} className={`text-[9px] font-black uppercase tracking-[0.2em] ${tone.eyebrow}`}>
        Strategic posture · {branch.label}
      </p>
      <h3 className="mt-1 text-xl font-black text-amber-50">{branch.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-amber-50/66 md:text-sm">{branch.prompt}</p>

      {outcome ? (
        <div data-qa="post-empire-outcome" data-outcome-id={outcome.id} className="mt-3 rounded-2xl border border-white/15 bg-black/28 p-3">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-100/55">Strategic foundation</p>
          <p className={`mt-1 text-sm font-black ${tone.accent}`}>{outcome.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{outcome.effect}</p>
        </div>
      ) : branch.postureId === "martial" ? (
        <div className="mt-3 rounded-2xl border border-white/12 bg-black/24 p-3">
          <p className="text-xs font-black text-amber-50">Resolve the North Ridge Standoff in the Council panel.</p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-50/55">The existing Show of Force / Open Talks choice remains the Martial branch decision.</p>
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          {branch.outcomes.map((item) => (
            <button
              key={item.id}
              type="button"
              data-qa="post-empire-outcome-choice"
              data-posture={branch.postureId}
              data-outcome-id={item.id}
              onClick={() => dispatch({ type: "resolveStandoff", decisionId: item.id })}
              className={`rounded-2xl border bg-black/24 p-3 text-left transition ${tone.button}`}
            >
              <span className="block text-sm font-black text-amber-50">{item.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-amber-50/60">{item.short}</span>
              <span className={`mt-2 block text-[11px] font-bold ${tone.accent}`}>{item.effect}</span>
            </button>
          ))}
        </div>
      )}

      {outcome && !turnComplete ? (
        <div data-qa="imperial-turn-panel" data-turn-count={turnNumber} data-next-turn={turnNumber + 1} className="mt-3 rounded-2xl border border-white/15 bg-black/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-100/55">Repeatable strategy loop</p>
              <p className="mt-1 text-sm font-black text-amber-50">Imperial Turn {turnNumber + 1}/3</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-100/55">Pressure {pressure}%</p>
          </div>
          <div className="mt-3 grid gap-2">
            {availableActions.map((action) => (
              <button
                key={action.id}
                type="button"
                data-qa="imperial-turn-action"
                data-posture={branch.postureId}
                data-action-id={action.id}
                onClick={() => dispatch({ type: "resolveImperialTurn", actionId: action.id })}
                className={`rounded-2xl border bg-black/24 p-3 text-left transition ${tone.button}`}
              >
                <span className="block text-sm font-black text-amber-50">{action.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-amber-50/60">{action.short}</span>
                <span className={`mt-2 block text-[11px] font-bold ${tone.accent}`}>{action.influenceDelta >= 0 ? "+" : ""}{action.influenceDelta} Influence · {action.pressureDelta >= 0 ? "+" : ""}{action.pressureDelta} Pressure</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {outcome && turnComplete ? (
        <div data-qa="imperial-turn-summary" data-turn-count={turnNumber} className="mt-3 rounded-2xl border border-emerald-100/20 bg-emerald-300/10 p-3">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-emerald-100/65">Imperial cycle complete</p>
          <p className="mt-1 text-sm font-black text-amber-50">Three strategic turns now define this empire.</p>
          <div className="mt-2 space-y-1.5">
            {turnHistory.map((action, index) => (
              <div key={`${action.id}-${index}`} data-qa="imperial-turn-record" data-action-id={action.id} className="rounded-xl border border-white/10 bg-black/24 px-2.5 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-100/50">Turn {index + 1}</p>
                <p className="mt-0.5 text-xs font-black text-amber-50">{action.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100/60">Final rival pressure · {pressure}%</p>
        </div>
      ) : null}
    </aside>
  );
}
