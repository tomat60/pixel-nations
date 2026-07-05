import { terrainLine, type Plot } from "../lib/map-data";
import { getPhase, type PlayAction, type PlayState } from "../lib/play-state";

export function LandSheet({ selected, state, dispatch }: { selected: Plot; state: PlayState; dispatch: (action: PlayAction) => void }) {
  const phase = getPhase(state);

  return (
    <aside className="absolute bottom-[4.7rem] left-3 right-3 z-20 rounded-3xl border border-amber-100/20 bg-black/55 p-3 shadow-2xl backdrop-blur-md md:bottom-[5.7rem] md:left-5 md:right-auto md:w-[360px] md:p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-amber-200/65">Selected land</p>
      <h2 className="mt-1 text-xl font-black md:text-3xl">{selected.name}</h2>
      <p className="mt-1 text-xs text-amber-50/72 md:text-sm">{selected.region} - {selected.terrain}</p>
      <p className="mt-2 text-xs leading-relaxed text-amber-50/66 md:text-sm">{terrainLine[selected.terrain]}</p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200/55">{selected.resources.join(" / ")}</p>

      {phase === "unclaimed" ? (
        <button data-qa="claim-button" onClick={() => dispatch({ type: "claim", plotId: selected.id })} className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-black/30 transition hover:bg-amber-200">
          Choose this land
        </button>
      ) : (
        <p className="mt-3 rounded-2xl border border-amber-100/20 bg-amber-100/10 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-amber-100">settlement phase</p>
      )}
    </aside>
  );
}
