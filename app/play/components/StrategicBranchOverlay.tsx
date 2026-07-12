import { getStrategicOutcome, getStrategicPosture, type PlayAction, type PlayState } from "../lib/play-state";

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

export function StrategicBranchOverlay({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const branch = getStrategicPosture(state);
  const outcome = getStrategicOutcome(state);

  if (!branch || (state.view !== "council" && state.view !== "world")) return null;

  const tone = toneClasses[branch.tone];

  if (state.view === "world") {
    return (
      <aside
        data-qa="world-posture-signal"
        data-posture={branch.postureId}
        data-outcome={outcome?.id ?? "none"}
        className={`absolute bottom-[5.2rem] left-3 z-30 w-[min(390px,calc(100%-1.5rem))] rounded-3xl border p-3 shadow-2xl backdrop-blur-md md:bottom-[6.2rem] md:left-6 md:p-4 ${tone.panel}`}
      >
        <p data-qa="posture-label" data-posture={branch.postureId} className={`text-[9px] font-black uppercase tracking-[0.2em] ${tone.eyebrow}`}>
          Strategic posture · {branch.label}
        </p>
        <p className="mt-1 text-lg font-black text-amber-50">{branch.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-50/65">{branch.worldSignal}</p>
        {outcome ? (
          <div data-qa="world-posture-outcome" data-outcome-id={outcome.id} className="mt-3 rounded-2xl border border-white/14 bg-black/28 p-3">
            <p className={`text-sm font-black ${tone.accent}`}>{outcome.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{outcome.worldEffect}</p>
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-white/12 bg-black/24 px-3 py-2 text-xs font-bold text-amber-50/68">Outcome pending in Council.</p>
        )}
      </aside>
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
          <p className={`text-sm font-black ${tone.accent}`}>{outcome.label}</p>
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
    </aside>
  );
}
