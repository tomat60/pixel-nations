import type { Parcel } from "./play-data";
import type { Objective, Phase } from "./play-state";

export function ObjectiveRibbon({ objective, lastEvent }: { objective: Objective; lastEvent: string }) {
  return (
    <div data-qa="objective-ribbon" className="mt-3 grid gap-2 rounded-3xl border border-amber-200/25 bg-black/50 p-3 shadow-xl shadow-black/25 backdrop-blur-md lg:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-2xl border border-amber-100/15 bg-amber-100/8 p-3">
        <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200/70">{objective.eyebrow}</p>
        <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-black md:text-xl">{objective.title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-amber-50/72">{objective.body}</p>
          </div>
          <p className="rounded-full border border-amber-200/25 bg-amber-300/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">Next click matters</p>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[9px] font-black uppercase tracking-wide text-amber-50/55">
          <LoopPip label="Land" active />
          <LoopPip label="Claim" active={objective.title !== "Choose one starter land"} />
          <LoopPip label="Orders" active={objective.title !== "Choose one starter land" && objective.title !== "Open Orders"} />
          <LoopPip label="Map change" active={objective.eyebrow !== "First decision" && objective.eyebrow !== "Next action"} />
        </div>
      </div>
      <div className="rounded-2xl border border-amber-100/15 bg-black/28 p-3">
        <p className="text-[10px] uppercase tracking-[0.26em] text-amber-200/65">Latest consequence</p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-amber-50/82">{lastEvent}</p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-amber-200/55">Every season must leave a mark on the map.</p>
      </div>
    </div>
  );
}

function LoopPip({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`rounded-full border px-2 py-1 ${active ? "border-amber-300/45 bg-amber-300/20 text-amber-50" : "border-white/10 bg-white/[0.04] text-amber-50/35"}`}>
      {label}
    </div>
  );
}

export function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/60">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

export function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/70">Game layer</p>
      <h3 className="mt-1 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-amber-50/75">{body}</p>
    </div>
  );
}

export function Chronicle({ entries }: { entries: string[] }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/70">Chronicle</p>
      <h3 className="mt-1 text-xl font-black">Your age is written</h3>
      <ol className="mt-2 max-h-32 space-y-1 overflow-hidden text-xs leading-relaxed text-amber-50/75">
        {entries.map((entry) => <li key={entry}>{entry}</li>)}
      </ol>
    </div>
  );
}

export function OrderButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={onClick} className={`rounded-2xl border px-2 py-3 text-[10px] font-black uppercase tracking-wide transition ${disabled ? "cursor-not-allowed border-white/5 bg-white/5 text-white/25" : "border-amber-100/20 bg-amber-100/10 text-amber-50 hover:bg-amber-300 hover:text-stone-950"}`}>
      {label}
    </button>
  );
}

export function CoreLoopRail({ selected, phase, ownedCount, onClaim, isRival }: { selected: Parcel; phase: Phase; ownedCount: number; onClaim: () => void; isRival: boolean }) {
  return (
    <aside className="hidden min-h-0 overflow-hidden rounded-[1.75rem] border border-amber-200/20 bg-black/42 p-4 shadow-2xl backdrop-blur-md xl:block">
      <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/70">The core loop</p>
      <div className="mt-4 space-y-3">
        <LoopStep n="1" title="Choose your land" body="Strategic start with visible tradeoffs." active={phase === "unclaimed"} />
        <LoopStep n="2" title="Claim your land" body="Your banner becomes the capital." active={ownedCount > 0} />
        <LoopStep n="3" title="Issue orders" body="One meaningful order per season." active={ownedCount > 0} />
        <LoopStep n="4" title="Map consequences" body="Every choice changes the world." active={ownedCount > 1} />
      </div>
      <div className="mt-4 rounded-3xl border border-amber-100/15 bg-amber-100/8 p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200/65">Selected parcel</p>
        <h2 className="mt-1 text-2xl font-black">{selected.name}</h2>
        <p className="mt-1 text-sm text-amber-50/75">{selected.region} - {selected.terrain}</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-50/60">{selected.resources.join(" / ")}</p>
        {phase === "unclaimed" ? (
          <button data-qa="claim-button" onClick={onClaim} className="mt-4 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30">
            {isRival ? "Rival banner here" : "Choose this land"}
          </button>
        ) : (
          <p className="mt-4 rounded-2xl bg-amber-100/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-amber-100">{phase} phase</p>
        )}
      </div>
    </aside>
  );
}

export function LayerStack({ phase, ownedCount, developmentLevel }: { phase: Phase; ownedCount: number; developmentLevel: number }) {
  return (
    <aside className="hidden min-h-0 overflow-hidden rounded-[1.75rem] border border-amber-200/20 bg-black/42 p-4 shadow-2xl backdrop-blur-md xl:block">
      <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/70">One fullscreen map game</p>
      <div className="mt-4 rounded-3xl border border-amber-100/15 bg-amber-100/8 p-4">
        <h3 className="text-lg font-black">Layers, not pages</h3>
        <p className="mt-2 text-xs leading-relaxed text-amber-50/65">Settlement, Nation and Empire remain on this same map. The player never leaves the world.</p>
      </div>
      <div className="mt-4 space-y-3">
        <LayerNote title="Settlement" value={phase === "unclaimed" ? "Locked" : `Level ${developmentLevel}`} body="Your city and its first lands." />
        <LayerNote title="Nation" value={developmentLevel >= 4 ? "Emerging" : `${Math.min(ownedCount, 6)}/6 lands`} body="Your realm becomes political." />
        <LayerNote title="Empire" value={developmentLevel >= 5 ? "Foreshadowed" : "Later"} body="Your legacy spans generations." />
      </div>
    </aside>
  );
}

function LoopStep({ n, title, body, active }: { n: string; title: string; body: string; active: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${active ? "border-amber-300/45 bg-amber-300/12" : "border-white/10 bg-white/[0.04]"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200/70">{n}. {title}</p>
      <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{body}</p>
    </div>
  );
}

function LayerNote({ title, value, body }: { title: string; value: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black">{title}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">{value}</p>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-amber-50/62">{body}</p>
    </div>
  );
}
