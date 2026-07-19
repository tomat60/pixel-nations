import type { PlayAction, ViewId } from "../lib/play-state";

const views: Array<{ id: ViewId; label: string }> = [
  { id: "map", label: "Map" },
  { id: "village", label: "Village" },
  { id: "orders", label: "Orders" },
  { id: "world", label: "World" },
  { id: "council", label: "Council" },
];

export function BottomDock({ activeView, dispatch }: { activeView: ViewId; dispatch: (action: PlayAction) => void }) {
  return (
    <nav className="absolute bottom-2 left-2 right-2 z-20 grid grid-cols-5 gap-1 rounded-2xl border border-amber-200/18 bg-black/48 p-1 shadow-xl backdrop-blur-md md:bottom-4 md:left-4 md:right-4 md:gap-1.5 md:p-1.5">
      {views.map((item) => (
        <button
          key={item.id}
          data-qa={`view-${item.id}`}
          onClick={() => dispatch({ type: "setView", view: item.id })}
          className={`rounded-xl px-1 py-1.5 text-[9px] font-black uppercase tracking-wide transition md:px-2 md:py-2 md:text-xs ${activeView === item.id ? "bg-amber-300 text-stone-950 shadow-md ring-1 ring-amber-100/70" : "bg-white/4 text-amber-50/68 hover:bg-white/10"}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
