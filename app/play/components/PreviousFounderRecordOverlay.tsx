"use client";

import type { PreviousFounderRecordSnapshot } from "../lib/previous-founder-record";

export function PreviousFounderRecordOverlay({
  record,
  onClose,
}: {
  record: PreviousFounderRecordSnapshot;
  onClose: () => void;
}) {
  return (
    <section
      data-qa="previous-founder-record-overlay"
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/72 p-3 backdrop-blur-md md:p-6"
    >
      <div className="flex max-h-[calc(100%-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-amber-200/35 bg-[radial-gradient(circle_at_18%_0%,rgba(251,191,36,.16),transparent_34%),linear-gradient(160deg,rgba(15,23,18,.98),rgba(5,8,7,.98))] shadow-[0_40px_120px_rgba(0,0,0,.72)]">
        <div data-qa="previous-founder-record-scroll" className="min-h-0 overflow-y-auto p-4 md:p-7">
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-200/65">Previous history · Read only</p>
          <h2 className="mt-2 text-3xl font-black leading-none text-amber-50 md:text-5xl">Previous Founder Record</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-50/68 md:text-base">
            The last completed empire is preserved for comparison. It cannot change the history you are ruling now.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-amber-100/18 bg-black/30 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/55">Empire identity</p>
              <p data-qa="previous-founder-record-posture" data-posture={record.posture.id} className="mt-2 text-xl font-black text-amber-50">{record.posture.label}</p>
              <p data-qa="previous-founder-record-outcome" data-outcome={record.outcome.id} className="mt-1 text-sm font-black text-amber-100">{record.outcome.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-50/58">{record.outcome.worldEffect}</p>

              {record.crisisRecovery ? (
                <div data-qa="previous-founder-record-crisis" data-crisis-recovery={record.crisisRecovery.id} className="mt-3 rounded-2xl border border-red-100/25 bg-red-500/10 p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-red-100/65">Crisis recovery</p>
                  <p className="mt-1 text-sm font-black text-amber-50">{record.crisisRecovery.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-50/58">{record.crisisRecovery.worldEffect}</p>
                </div>
              ) : null}

              {record.postCrisisResponse ? (
                <div data-qa="previous-founder-record-final-legacy" data-response-id={record.postCrisisResponse.id} className="mt-3 rounded-2xl border border-sky-100/22 bg-sky-300/8 p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.16em] text-sky-100/65">Final frontier legacy</p>
                  <p data-qa="previous-founder-record-post-crisis-response" className="mt-1 text-sm font-black text-amber-50">{record.postCrisisResponse.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-50/58">{record.postCrisisResponse.short}</p>
                  {record.frontierPayoff ? (
                    <div data-qa="previous-founder-record-frontier-payoff" data-payoff-id={record.frontierPayoff.id} data-secured="true" className="mt-2 rounded-xl border border-emerald-100/20 bg-emerald-300/8 px-3 py-2">
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-emerald-100/60">Secured</p>
                      <p className="mt-0.5 text-sm font-black text-amber-50">{record.frontierPayoff.label}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-amber-50/55">{record.frontierPayoff.short}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <Metric label="Influence" value={record.influence} />
                <Metric label="Rival pressure" value={`${record.rivalPressure}%`} />
              </div>
            </div>

            <div className="rounded-3xl border border-amber-100/18 bg-black/30 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/55">Three imperial turns</p>
              <div className="mt-3 space-y-2">
                {record.turns.map((turn, index) => (
                  <div key={`${turn.id}-${index}`} data-qa="previous-founder-record-turn" data-turn={index + 1} data-action-id={turn.id} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-100/45">Turn {index + 1}</p>
                    <p className="mt-0.5 text-sm font-black text-amber-50">{turn.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div data-qa="previous-founder-record-actions" className="shrink-0 border-t border-amber-100/14 bg-black/82 p-3 shadow-[0_-18px_45px_rgba(0,0,0,.38)] backdrop-blur-md md:p-4">
          <button type="button" data-qa="close-previous-founder-record" onClick={onClose} className="w-full rounded-2xl border border-amber-100/20 bg-white/8 px-4 py-3 text-sm font-black text-amber-50 transition hover:bg-white/12">
            Return to current history
          </button>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-amber-100/12 bg-black/28 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-[0.14em] text-amber-100/45">{label}</p><p className="mt-0.5 text-lg font-black text-amber-50">{value}</p></div>;
}
