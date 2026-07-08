import { getOwnedPlot, getOwnedSectorIds, type NationDecision, type PlayAction, type PlayState } from "../lib/play-state";

export function FoundingCeremony({ state, decision, dispatch }: { state: PlayState; decision: NationDecision; dispatch: (action: PlayAction) => void }) {
  const capital = getOwnedPlot(state)?.name ?? "Aurelian Basin";
  const sectors = getOwnedSectorIds(state);

  return (
    <div data-qa="founding-ceremony" className="absolute inset-0 z-40 flex items-center justify-center bg-black/72 px-3 py-8 backdrop-blur-sm">
      <section className="relative w-[min(720px,100%)] overflow-hidden rounded-[2rem] border border-amber-200/40 bg-[radial-gradient(circle_at_20%_0%,rgba(251,191,36,.22),transparent_38%),linear-gradient(180deg,rgba(32,24,12,.98),rgba(4,7,8,.98))] p-5 text-center shadow-[0_40px_120px_rgba(0,0,0,.7)] md:p-8">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[1.8rem] border border-amber-100/35 bg-amber-300/12 shadow-[0_0_54px_rgba(251,191,36,.26)]">
          <svg viewBox="0 0 100 120" aria-hidden="true" className="h-20 w-20 drop-shadow-2xl">
            <path d="M50 5 85 20v34c0 27-14 47-35 61C29 101 15 81 15 54V20L50 5Z" className="fill-amber-200/90" />
            <path d="M50 16 74 27v25c0 20-9 35-24 47-15-12-24-27-24-47V27l24-11Z" className="fill-stone-950" />
            <path d="M50 30c8 10 15 20 15 31 0 14-8 24-15 29-7-5-15-15-15-29 0-11 7-21 15-31Z" className="fill-amber-300" />
            <path d="M50 43v34" className="stroke-stone-950" strokeWidth="7" strokeLinecap="round" />
            <path d="M39 58h22" className="stroke-stone-950" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </div>

        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-amber-200/70">Founding ceremony</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-amber-50 md:text-5xl">The First Nation Rises</h2>
        <p className="mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-amber-50/72 md:text-base">{decision.label} now binds the homeland, the council and the border ring into one political story.</p>

        <div className="mt-5 grid gap-2 text-left md:grid-cols-3">
          <FoundingMetric label="Capital" value={capital} />
          <FoundingMetric label="Controlled sectors" value={sectors.join(" · ")} />
          <FoundingMetric label="Doctrine" value={decision.label} />
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200/30 bg-emerald-300/10 p-4 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/70">First law</p>
          <p className="mt-1 text-sm font-black text-amber-50">{decision.effect}</p>
          <p className="mt-2 text-xs leading-relaxed text-amber-50/58">The world map will now mark your owned sectors as founded territory. The Council keeps this doctrine as the run's national identity.</p>
        </div>

        <button data-qa="dismiss-founding-ceremony" type="button" onClick={() => dispatch({ type: "dismissFoundingCeremony" })} className="mt-6 rounded-2xl bg-amber-300 px-6 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/35 transition hover:bg-amber-200">Enter the nation age</button>
      </section>
    </div>
  );
}

function FoundingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-amber-100/16 bg-black/30 p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/55">{label}</p>
      <p className="mt-1 text-sm font-black text-amber-50">{value}</p>
    </div>
  );
}
