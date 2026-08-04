import {
  getFirstEraComplete,
  getNationDecision,
  type NationDecisionId,
  type PlayAction,
  type PlayState,
  type RetentionChoiceId,
  type RetentionDecisionId,
} from "../lib/play-state";

type CharterStep = {
  decisionId: RetentionDecisionId;
  choiceId: RetentionChoiceId;
};

const charterByDoctrine: Record<NationDecisionId, CharterStep[]> = {
  "trade-charter": [
    { decisionId: "grain-levy", choiceId: "freedom" },
    { decisionId: "open-roads", choiceId: "freedom" },
    { decisionId: "scribe-patronage", choiceId: "authority" },
  ],
  "border-guard": [
    { decisionId: "grain-levy", choiceId: "authority" },
    { decisionId: "open-roads", choiceId: "authority" },
    { decisionId: "scribe-patronage", choiceId: "authority" },
  ],
  "settler-rights": [
    { decisionId: "grain-levy", choiceId: "freedom" },
    { decisionId: "open-roads", choiceId: "freedom" },
    { decisionId: "scribe-patronage", choiceId: "freedom" },
  ],
};

const charterSummary: Record<NationDecisionId, string> = {
  "trade-charter": "Open stores and roads under a written civic charter.",
  "border-guard": "Bind supplies, roads and records to frontier authority.",
  "settler-rights": "Protect household stores, open roads and chartered workshops.",
};

export function FounderRunAccelerator({
  state,
  dispatch,
}: {
  state: PlayState;
  dispatch: (action: PlayAction) => void;
}) {
  const nationDecision = getNationDecision(state);
  const visible = Boolean(
    nationDecision &&
      state.foundingCeremonySeen &&
      !getFirstEraComplete(state) &&
      !state.empireDeclarationId,
  );

  if (!visible || !nationDecision) return null;

  function ratifyCharter() {
    for (const step of charterByDoctrine[nationDecision.id]) {
      dispatch({
        type: "advanceSeason",
        decisionId: step.decisionId,
        choiceId: step.choiceId,
      });
    }
  }

  return (
    <section
      data-qa="founder-run-accelerator"
      data-founder-doctrine={nationDecision.id}
      className="absolute inset-x-3 bottom-20 z-50 rounded-3xl border border-amber-200/35 bg-[linear-gradient(145deg,rgba(37,27,12,.97),rgba(4,8,9,.97))] p-4 shadow-[0_28px_90px_rgba(0,0,0,.62)] backdrop-blur-md md:inset-x-auto md:bottom-24 md:left-5 md:w-[430px]"
    >
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-200/65">Founder Run · First charter</p>
      <h2 className="mt-1 text-xl font-black text-amber-50">Ratify the nation in one decisive act.</h2>
      <p className="mt-2 text-xs leading-relaxed text-amber-50/68">
        {charterSummary[nationDecision.id]} The existing three first-era laws will be written into the chronicle together, then the frontier opens.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px] font-black uppercase tracking-[0.12em] text-amber-100/70">
        <span className="rounded-xl border border-amber-100/14 bg-white/6 px-2 py-2">Stores</span>
        <span className="rounded-xl border border-amber-100/14 bg-white/6 px-2 py-2">Roads</span>
        <span className="rounded-xl border border-amber-100/14 bg-white/6 px-2 py-2">Law</span>
      </div>
      <button
        type="button"
        data-qa="ratify-founder-charter"
        onClick={ratifyCharter}
        className="mt-4 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/35 transition hover:bg-amber-200"
      >
        Ratify the first charter
      </button>
    </section>
  );
}
