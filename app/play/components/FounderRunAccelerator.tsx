import {
  getFirstEraComplete,
  getNationDecision,
  getNextRetentionDecision,
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
  const decision = getNextRetentionDecision(state);
  const visible = Boolean(
    nationDecision &&
      state.foundingCeremonySeen &&
      !getFirstEraComplete(state) &&
      !state.empireDeclarationId,
  );

  if (!visible || !nationDecision || !decision) return null;

  const doctrineId = nationDecision.id;
  const decisionId = decision.id;
  const recommendedChoice = charterByDoctrine[doctrineId].find((step) => step.decisionId === decisionId)?.choiceId ?? decision.choices[0]?.id;

  function chooseStewardship(choiceId: RetentionChoiceId) {
    dispatch({
      type: "advanceSeason",
      decisionId,
      choiceId,
    });
  }

  function ratifyCharter() {
    for (const step of charterByDoctrine[doctrineId]) {
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
      data-founder-doctrine={doctrineId}
      data-stewardship-decision={decisionId}
      data-stewardship-progress={state.retentionRecords.length}
      className="absolute inset-x-3 bottom-20 z-50 rounded-3xl border border-amber-200/35 bg-[linear-gradient(145deg,rgba(37,27,12,.97),rgba(4,8,9,.97))] p-4 shadow-[0_28px_90px_rgba(0,0,0,.62)] backdrop-blur-md md:inset-x-auto md:bottom-24 md:left-5 md:w-[430px]"
    >
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-200/65">Council stewardship · Season {decision.season}/3</p>
      <h2 className="mt-1 text-xl font-black text-amber-50">{decision.title}</h2>
      <p className="mt-2 text-xs leading-relaxed text-amber-50/68">{decision.prompt}</p>
      <div className="mt-3 grid gap-2">
        {decision.choices.map((choice) => {
          const stabilityDelta = choice.id === "authority" ? 1 : -1;
          const prosperityDelta = choice.id === "authority" ? -1 : 1;
          return (
            <button
              key={choice.id}
              type="button"
              data-qa="stewardship-choice"
              data-decision-id={decisionId}
              data-choice-id={choice.id}
              data-recommended={choice.id === recommendedChoice ? "true" : "false"}
              data-stability-delta={stabilityDelta}
              data-prosperity-delta={prosperityDelta}
              onClick={() => chooseStewardship(choice.id)}
              className="rounded-2xl border border-amber-100/20 bg-black/22 p-3 text-left transition hover:border-amber-200/45 hover:bg-amber-200/12"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-black text-amber-50">{choice.label}</span>
                {choice.id === recommendedChoice ? <span className="text-[8px] font-black uppercase tracking-[0.14em] text-amber-200/60">Doctrine fit</span> : null}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-amber-50/58">{choice.short}</span>
              <span className="mt-2 block text-[11px] font-black text-cyan-100/72">
                {stabilityDelta > 0 ? "+" : ""}{stabilityDelta} Stability · {prosperityDelta > 0 ? "+" : ""}{prosperityDelta} Prosperity
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-2xl border border-amber-100/12 bg-black/18 p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-100/50">Doctrine default</p>
        <p className="mt-1 text-[11px] leading-relaxed text-amber-50/52">{charterSummary[doctrineId]} Use this only to apply the doctrine's full three-season charter automatically.</p>
        <button
          type="button"
          data-qa="ratify-founder-charter"
          onClick={ratifyCharter}
          className="mt-2 w-full rounded-xl border border-amber-100/18 bg-white/6 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100/70 transition hover:bg-white/10"
        >
          Apply doctrine default
        </button>
      </div>
    </section>
  );
}
