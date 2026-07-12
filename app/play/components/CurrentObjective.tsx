import {
  getFirstEraComplete,
  getFrontierIntent,
  getFrontierObjectiveSecured,
  getImperialTurnNumber,
  getNextRetentionDecision,
  getOwnedSectorIds,
  nationSectorThreshold,
  type PlayState,
} from "../lib/play-state";

export function CurrentObjective({
  state,
  demoComplete,
  demoOverlayDismissed,
  secondRunStarted,
  onOpenFounderRecord,
}: {
  state: PlayState;
  demoComplete: boolean;
  demoOverlayDismissed: boolean;
  secondRunStarted: boolean;
  onOpenFounderRecord: () => void;
}) {
  const objective = getCurrentObjectiveText(state);
  const placement = state.view === "council"
    ? "left-1/2 top-[6rem] w-[min(320px,calc(100%-1.5rem))] -translate-x-1/2 text-center md:left-[43%] md:top-[6.8rem]"
    : "right-3 top-[5.9rem] max-w-[210px] text-right md:right-5 md:top-[6.8rem] md:max-w-[390px]";

  return (
    <aside
      data-qa="current-objective"
      data-view={state.view}
      data-demo-complete={demoComplete ? "true" : "false"}
      className={`absolute z-40 rounded-2xl border border-amber-100/20 bg-black/58 p-2.5 shadow-xl backdrop-blur-md md:p-3 ${placement}`}
    >
      <p className="text-[8px] font-black uppercase tracking-[0.22em] text-amber-200/65 md:text-[10px] md:tracking-[0.26em]">Current objective</p>
      <p data-qa="current-objective-text" className="mt-1 text-xs font-black leading-tight text-amber-50 md:text-base">{objective}</p>
      <p className="mt-2 hidden text-[10px] font-black uppercase tracking-[0.18em] text-amber-200/50 md:block">{state.lastEvent}</p>
      {demoComplete && demoOverlayDismissed ? (
        <button
          type="button"
          data-qa="open-founder-record"
          onClick={onOpenFounderRecord}
          className="mt-2 w-full rounded-xl border border-amber-200/25 bg-amber-200/10 px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-200/18"
        >
          Founder Record
        </button>
      ) : null}
      {secondRunStarted ? <p data-qa="second-run-started" className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-100">Second history begun</p> : null}
    </aside>
  );
}

function getCurrentObjectiveText(state: PlayState): string {
  if (state.ownedPlotIds.length === 0) return "Claim one land. Your empire starts here.";
  if (state.completedOrders.length < 3) return "Issue settlement orders until the camp becomes a visible village.";

  const ownedSectors = getOwnedSectorIds(state).length;
  if (!state.nationDecisionId) {
    if (ownedSectors < nationSectorThreshold) return `Open World and claim ${nationSectorThreshold - ownedSectors} more connected sector${nationSectorThreshold - ownedSectors === 1 ? "" : "s"}.`;
    return "Open Council and choose the doctrine that founds your nation.";
  }
  if (!state.foundingCeremonySeen) return "Witness the founding, then continue into your nation's first era.";

  if (!getFirstEraComplete(state)) {
    const decision = getNextRetentionDecision(state);
    return decision ? `Resolve ${decision.title} to write the next season of your nation.` : "Complete the three first-era Council decisions.";
  }

  const frontier = getFrontierIntent(state);
  if (!frontier) return "Choose the frontier objective that will justify your future empire.";
  if (!getFrontierObjectiveSecured(state)) return `Open World and secure ${frontier.target}.`;
  if (!state.empireDeclarationId) return "Return to Council and declare the empire your nation has become.";
  if (!state.courtCaseDecisionId) return "Resolve the Charter Courts' first imperial dispute.";
  if (!state.rivalResponseDecisionId) return "Answer the Obsidian March's rejection of your ruling.";
  if (!state.conflictEscalationDecisionId) return "Choose how your empire confronts the rival: arms, trade or envoys.";
  if (!state.standoffDecisionId) return "Resolve the first outcome of your chosen imperial posture.";

  const turn = getImperialTurnNumber(state);
  if (turn < 3) return `Take Imperial Turn ${turn + 1}/3 and shape the character of your empire.`;
  return "Your first empire stands. Review its Founder Record or begin a different history.";
}
