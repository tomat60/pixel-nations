import {
  getEmpireCrisisOpen,
  getEmpireCrisisReasonLabel,
  getFirstEraComplete,
  getFrontierIntent,
  getFrontierObjectiveSecured,
  getImperialTurnNumber,
  getOwnedSectorIds,
  nationSectorThreshold,
  type PlayState,
} from "../lib/play-state";

export function CurrentObjective({
  state,
  demoComplete,
  founderRecordAvailable,
  secondRunStarted,
  onOpenFounderRecord,
}: {
  state: PlayState;
  demoComplete: boolean;
  demoOverlayDismissed: boolean;
  founderRecordAvailable: boolean;
  secondRunStarted: boolean;
  onOpenFounderRecord: () => void;
}) {
  const objective = founderRecordAvailable && !state.courtCaseDecisionId
    ? "Founder Run complete. Review the Founder Record or continue ruling through Council."
    : getCurrentObjectiveText(state);
  const placement = state.view === "council"
    ? "left-1/2 top-[4.4rem] w-[min(300px,calc(100%-1.25rem))] -translate-x-1/2 text-center md:left-[43%] md:top-[5rem]"
    : "right-2 top-[4.3rem] max-w-[190px] text-right md:right-4 md:top-[5rem] md:max-w-[320px]";

  return (
    <aside
      data-qa="current-objective"
      data-view={state.view}
      data-demo-complete={demoComplete ? "true" : "false"}
      data-founder-record-available={founderRecordAvailable ? "true" : "false"}
      data-empire-crisis={state.empireCrisisReason ?? "none"}
      data-empire-crisis-recovery={state.empireCrisisRecoveryId ?? "none"}
      className={`absolute z-40 rounded-xl border border-amber-100/18 bg-black/56 p-2 shadow-lg backdrop-blur-md md:p-2.5 ${placement}`}
    >
      <p className="text-[7px] font-black uppercase tracking-[0.2em] text-amber-200/60 md:text-[8px] md:tracking-[0.22em]">Objective</p>
      <p data-qa="current-objective-text" className="mt-0.5 text-[11px] font-black leading-tight text-amber-50 md:text-sm">{objective}</p>
      <p className="mt-1.5 hidden truncate text-[9px] font-black uppercase tracking-[0.14em] text-amber-200/45 lg:block">{state.lastEvent}</p>
      {founderRecordAvailable ? (
        <button
          type="button"
          data-qa="open-founder-record"
          onClick={onOpenFounderRecord}
          className="mt-1.5 w-full rounded-lg border border-amber-200/22 bg-amber-200/9 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-200/16"
        >
          Founder Record
        </button>
      ) : null}
      {secondRunStarted ? <p data-qa="second-run-started" className="mt-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-100">Second history begun</p> : null}
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
  if (!state.foundingCeremonySeen) return "Witness the founding, then ratify the first national charter.";

  if (!getFirstEraComplete(state)) {
    return "Open Council and ratify the first charter to bind stores, roads and law in one Founder Run step.";
  }

  const frontier = getFrontierIntent(state);
  if (!frontier) return "Choose the frontier objective that will justify your future empire.";
  if (!getFrontierObjectiveSecured(state)) return `Open World and secure ${frontier.target}.`;
  if (!state.empireDeclarationId) return "Return to Council and declare the empire your nation has become.";
  if (!state.courtCaseDecisionId) return "Founder Run complete. Continue ruling to resolve the Charter Courts' first dispute.";
  if (!state.rivalResponseDecisionId) return "Answer the Obsidian March's rejection of your ruling.";
  if (!state.conflictEscalationDecisionId) return "Choose how your empire confronts the rival: arms, trade or envoys.";
  if (!state.standoffDecisionId) return "Resolve the first outcome of your chosen imperial posture.";

  const turn = getImperialTurnNumber(state);
  if (turn < 3) return `Take Imperial Turn ${turn + 1}/3 and shape the character of your empire.`;
  if (getEmpireCrisisOpen(state)) return `Resolve the Empire Crisis: ${getEmpireCrisisReasonLabel(state.empireCrisisReason)}.`;
  if (state.postCrisisCountermoveOrigin && !state.postCrisisResponseId) return "Answer the Obsidian March's post-crisis counter-move.";
  if (state.postCrisisResponseId) return "Your first empire answered the rival counter-move. Review its Founder Record or begin another history.";
  if (state.empireCrisisRecoveryId) return "Your first empire survived its crisis. Review its Founder Record or begin another history.";
  return "Your first empire stands. Review its Founder Record or begin a different history.";
}
