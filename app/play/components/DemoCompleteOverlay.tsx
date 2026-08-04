import { strategicBranches } from "../lib/strategic-branches";
import {
  getEmpireCrisisRecovery,
  getEmpireDeclaration,
  getFounderRecordOutcomeLabel,
  getFrontierIntent,
  getImperialTurnHistory,
  getNationDecision,
  getOwnedSectorIds,
  getRivalPressure,
  getStrategicOutcome,
  getStrategicPosture,
  type PlayState,
} from "../lib/play-state";

export function DemoCompleteOverlay({
  state,
  onContinue,
  onRestart,
}: {
  state: PlayState;
  onContinue: () => void;
  onRestart: () => void;
}) {
  const empireDeclaration = getEmpireDeclaration(state);
  if (!empireDeclaration) return null;

  const posture = getStrategicPosture(state);
  const outcome = getStrategicOutcome(state);
  const turns = getImperialTurnHistory(state);

  if (!posture || !outcome || turns.length < 3) {
    return <FounderRunRecord state={state} onContinue={onContinue} onRestart={onRestart} />;
  }

  const otherPostures = strategicBranches.filter((branch) => branch.postureId !== posture.postureId);
  const pressure = getRivalPressure(state);
  const crisisRecovery = getEmpireCrisisRecovery(state);
  const finalOutcomeLabel = getFounderRecordOutcomeLabel(state);

  return (
    <section data-qa="demo-complete-overlay" data-record-depth="advanced" data-posture={posture.postureId} data-empire-crisis={state.empireCrisisReason ?? "none"} data-empire-crisis-recovery={state.empireCrisisRecoveryId ?? "none"} className="absolute inset-0 z-50 flex items-center justify-center bg-black/72 p-3 backdrop-blur-md md:p-6">
      <div className="flex max-h-[calc(100%-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-amber-200/35 bg-[radial-gradient(circle_at_18%_0%,rgba(251,191,36,.16),transparent_34%),linear-gradient(160deg,rgba(15,23,18,.98),rgba(5,8,7,.98))] shadow-[0_40px_120px_rgba(0,0,0,.72)]">
        <div data-qa="founder-record-scroll" className="min-h-0 overflow-y-auto p-4 md:p-7">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-200/65">Founder Record · First Run Complete</p>
          <h2 className="mt-2 text-3xl font-black leading-none text-amber-50 md:text-5xl">Your first empire stands.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-50/68 md:text-base">One land became a settlement, a nation and an empire. This history reflects the posture you chose; another posture creates another empire.</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-amber-100/18 bg-black/30 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/55">Empire identity</p>
              <p data-qa="founder-record-posture" data-posture={posture.postureId} className="mt-2 text-xl font-black text-amber-50">{posture.label}</p>
              <p data-qa="founder-record-outcome" data-outcome={outcome.id} className="mt-1 text-sm font-black text-amber-100">{finalOutcomeLabel}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-50/58">{outcome.worldEffect}</p>
              {crisisRecovery ? (
                <div data-qa="founder-record-crisis" data-crisis-recovery={crisisRecovery.id} className="mt-3 rounded-2xl border border-red-100/25 bg-red-500/10 p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-red-100/65">Crisis recovery</p>
                  <p className="mt-1 text-sm font-black text-amber-50">{crisisRecovery.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-50/58">{crisisRecovery.worldEffect}</p>
                </div>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <Metric label="Influence" value={state.resources.influence} />
                <Metric label="Rival pressure" value={`${pressure}%`} />
              </div>
            </div>

            <div className="rounded-3xl border border-amber-100/18 bg-black/30 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/55">Three imperial turns</p>
              <div className="mt-3 space-y-2">
                {turns.map((turn, index) => (
                  <div key={`${turn.id}-${index}`} data-qa="founder-record-turn" data-turn={index + 1} data-action-id={turn.id} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/45">Turn {index + 1}</p>
                    <p className="mt-0.5 text-sm font-black text-amber-50">{turn.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-sky-200/20 bg-sky-300/8 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/60">Your next history</p>
            <p className="mt-1 text-lg font-black text-amber-50">Try {otherPostures.map((branch) => branch.label.replace(" Posture", "")).join(" or ")}.</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/60">A different posture changes the branch outcome, Imperial Turn actions, Influence, Rival Pressure and the final World state.</p>
          </div>
        </div>

        <RecordActions onContinue={onContinue} onRestart={onRestart} />
      </div>
    </section>
  );
}

function FounderRunRecord({ state, onContinue, onRestart }: { state: PlayState; onContinue: () => void; onRestart: () => void }) {
  const empireDeclaration = getEmpireDeclaration(state);
  const nationDecision = getNationDecision(state);
  const frontier = getFrontierIntent(state);
  const sectors = getOwnedSectorIds(state);

  if (!empireDeclaration) return null;

  return (
    <section data-qa="demo-complete-overlay" data-record-depth="founder-run" data-empire-declaration={empireDeclaration.id} className="absolute inset-0 z-50 flex items-center justify-center bg-black/72 p-3 backdrop-blur-md md:p-6">
      <div className="flex max-h-[calc(100%-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-amber-200/35 bg-[radial-gradient(circle_at_18%_0%,rgba(251,191,36,.18),transparent_34%),linear-gradient(160deg,rgba(15,23,18,.99),rgba(5,8,7,.99))] shadow-[0_40px_120px_rgba(0,0,0,.72)]">
        <div data-qa="founder-record-scroll" className="min-h-0 overflow-y-auto p-4 md:p-7">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-200/65">Founder Record · Core Arc Complete</p>
          <h2 className="mt-2 text-3xl font-black leading-none text-amber-50 md:text-5xl">{empireDeclaration.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-50/68 md:text-base">One land became a living settlement, three sectors became a nation, and one secured frontier became the first seed of an empire.</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-amber-100/18 bg-black/30 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/55">Founding identity</p>
              <p data-qa="founder-record-empire" className="mt-2 text-xl font-black text-amber-50">{empireDeclaration.label}</p>
              <p data-qa="founder-record-nation" className="mt-1 text-sm font-black text-amber-100">{nationDecision?.label ?? "Aurelian Nation"}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-50/58">{empireDeclaration.effect}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <Metric label="Sectors" value={sectors.length} />
                <Metric label="Frontier" value={frontier?.target ?? "Secured"} />
              </div>
            </div>

            <div className="rounded-3xl border border-amber-100/18 bg-black/30 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/55">First national charter</p>
              <div className="mt-3 space-y-2">
                {state.retentionRecords.map((record) => (
                  <div key={`${record.decisionId}-${record.choiceId}`} data-qa="founder-record-charter" data-decision-id={record.decisionId} data-choice-id={record.choiceId} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="text-sm font-black text-amber-50">{record.label}</p>
                    <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100/45">{record.villageMarker} · {record.worldMarker}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-sky-200/20 bg-sky-300/8 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-100/60">The game continues</p>
            <p className="mt-1 text-lg font-black text-amber-50">Continue ruling to test law, rivals, escalation and imperial turns.</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/60">Those deeper systems remain intact, but they no longer block the first three-minute promise.</p>
          </div>
        </div>

        <RecordActions onContinue={onContinue} onRestart={onRestart} />
      </div>
    </section>
  );
}

function RecordActions({ onContinue, onRestart }: { onContinue: () => void; onRestart: () => void }) {
  return (
    <div data-qa="founder-record-actions" className="shrink-0 border-t border-amber-100/14 bg-black/82 p-3 shadow-[0_-18px_45px_rgba(0,0,0,.38)] backdrop-blur-md md:p-4">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" data-qa="continue-ruling" onClick={onContinue} className="rounded-2xl border border-amber-100/20 bg-white/8 px-2 py-3 text-[11px] font-black leading-tight text-amber-50 transition hover:bg-white/12 sm:px-4 sm:text-sm">Continue Ruling</button>
        <button type="button" data-qa="restart-run" onClick={onRestart} className="rounded-2xl bg-amber-300 px-2 py-3 text-[11px] font-black leading-tight text-stone-950 shadow-lg shadow-black/30 transition hover:bg-amber-200 sm:px-4 sm:text-sm">Found a New Empire</button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-amber-100/12 bg-black/28 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-[0.14em] text-amber-100/45">{label}</p><p className="mt-0.5 text-lg font-black text-amber-50">{value}</p></div>;
}
