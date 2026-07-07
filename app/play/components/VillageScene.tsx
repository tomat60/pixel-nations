import { getDevelopmentScore, getOwnedPlot, getPhase, getPopulation, type PlayAction, type PlayState, type SettlementMarker } from "../lib/play-state";

const districtPositions: Array<{ id: SettlementMarker; label: string; x: string; y: string; glyph: string }> = [
  { id: "camp", label: "Camp", x: "47%", y: "52%", glyph: "✦" },
  { id: "shelter", label: "Shelters", x: "34%", y: "55%", glyph: "⌂" },
  { id: "storehouse", label: "Storehouse", x: "57%", y: "58%", glyph: "▣" },
  { id: "market", label: "Market Path", x: "69%", y: "67%", glyph: "↔" },
  { id: "council", label: "Council Hall", x: "50%", y: "41%", glyph: "◆" },
  { id: "watch", label: "Watch", x: "27%", y: "36%", glyph: "▲" },
];

export function VillageScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const owned = getOwnedPlot(state);
  const phase = getPhase(state);
  const population = getPopulation(state);
  const score = getDevelopmentScore(state);
  const hasClaim = state.ownedPlotIds.length > 0;

  return (
    <div data-qa="village-scene" className="absolute inset-0 overflow-hidden bg-[#1b2518]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(251,191,36,.28),transparent_22%),radial-gradient(circle_at_24%_28%,rgba(34,197,94,.22),transparent_24%),radial-gradient(circle_at_78%_72%,rgba(56,189,248,.18),transparent_26%),linear-gradient(180deg,#2f482b_0%,#162315_54%,#0a100b_100%)]" />
      <div className="absolute inset-x-[-10%] bottom-[-8%] h-[54%] rounded-[50%] bg-emerald-950/55 blur-sm" />
      <div className="absolute left-[7%] top-[18%] h-[46%] w-[20%] rounded-[55%_45%_50%_50%] bg-black/18 blur-[1px]" />
      <div className="absolute right-[9%] top-[20%] h-[50%] w-[24%] rounded-[45%_55%_45%_55%] bg-black/18 blur-[1px]" />
      <div className="absolute left-[18%] top-[66%] h-16 w-[72%] -rotate-3 rounded-full border-y border-amber-100/14 bg-amber-200/10" />
      <div className="absolute left-[42%] top-[38%] h-[34%] w-[18%] rounded-[50%] border border-amber-100/12 bg-amber-100/8 shadow-[0_0_70px_rgba(251,191,36,.18)]" />

      <div className="absolute left-3 top-[5.6rem] z-20 max-w-[310px] rounded-3xl border border-amber-100/20 bg-black/48 p-3 shadow-2xl backdrop-blur-md md:left-5 md:top-[6.4rem] md:max-w-[430px] md:p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/65">Village scene</p>
        <h2 className="mt-1 text-2xl font-black text-amber-50 md:text-4xl">{owned?.name ?? "No homeland"}</h2>
        <p className="mt-2 text-xs leading-relaxed text-amber-50/68 md:text-sm">A visible settlement interior, not another data panel. Orders place buildings, paths and civic structures into this scene.</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <Metric label="Phase" value={phase} />
          <Metric label="People" value={population} />
          <Metric label="Dev" value={score} />
          <Metric label="Season" value={`${state.season}/12`} />
        </div>
      </div>

      {!hasClaim ? (
        <div className="absolute left-1/2 top-1/2 z-20 w-[min(420px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-amber-100/20 bg-black/60 p-5 text-center shadow-2xl backdrop-blur-md">
          <p className="text-lg font-black text-amber-50">Claim a homeland first.</p>
          <p className="mt-2 text-sm text-amber-50/65">The village scene becomes active after the first banner is raised on the map.</p>
          <button data-qa="village-scene-open-map" onClick={() => dispatch({ type: "setView", view: "map" })} className="mt-4 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-black text-stone-950">Return to map</button>
        </div>
      ) : null}

      {hasClaim ? districtPositions.map((district) => {
        const built = state.settlementMarkers.includes(district.id);
        return (
          <div key={district.id} data-qa={`village-scene-${district.id}`} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-3xl border px-3 py-2 text-center shadow-2xl transition ${built ? "border-amber-200/55 bg-amber-200/22 text-amber-50" : "border-white/10 bg-black/22 text-amber-50/38"}`} style={{ left: district.x, top: district.y }}>
            <p className="text-2xl font-black leading-none md:text-4xl">{district.glyph}</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] md:text-[11px]">{district.label}</p>
          </div>
        );
      }) : null}

      {hasClaim ? (
        <div className="absolute bottom-[5rem] left-3 right-3 z-20 grid grid-cols-2 gap-2 md:bottom-[6rem] md:left-auto md:right-5 md:w-[430px]">
          <button data-qa="village-scene-open-orders" onClick={() => dispatch({ type: "setView", view: "orders" })} className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-amber-200">Develop next</button>
          <button data-qa="village-scene-open-world" onClick={() => dispatch({ type: "setView", view: "world" })} className="rounded-2xl border border-amber-100/18 bg-black/44 px-4 py-3 text-sm font-black text-amber-50 backdrop-blur-md transition hover:bg-white/12">See world</button>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-100/12 bg-black/28 px-2 py-2">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/50">{label}</p>
      <p className="text-sm font-black text-amber-50 md:text-lg">{value}</p>
    </div>
  );
}
