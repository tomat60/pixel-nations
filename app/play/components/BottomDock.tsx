import type { PlayAction, ViewId } from "../lib/play-state";

const views: Array<{ id: ViewId; label: string }> = [
  { id: "map", label: "Map" },
  { id: "orders", label: "Orders" },
  { id: "settlement", label: "Settlement" },
  { id: "chronicle", label: "Banner" },
  { id: "atlas", label: "Atlas" },
];

export function BottomDock({ activeView, dispatch }: { activeView: ViewId; dispatch: (action: PlayAction) => void }) {
  return (
    <nav className="absolute bottom-3 left-3 right-3 z-20 grid grid-cols-5 gap-1.5 rounded-3xl border border-amber-200/20 bg-black/48 p-1.5 shadow-2xl backdrop-blur-md md:bottom-5 md:left-5 md:right-5 md:gap-2 md:p-2">
      {views.map((item) => (
        <button key={item.id} onClick={() => dispatch({ type: "setView", view: item.id })} className={`rounded-2xl px-1.5 py-2 text-[10px] font-black uppercase tracking-wide transition md:px-2 md:py-3 md:text-sm ${activeView === item.id ? "bg-amber-300 text-stone-950" : "bg-white/5 text-amber-50/70 hover:bg-white/10"}`}>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
