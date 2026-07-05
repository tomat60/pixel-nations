import { plots, terrainFill } from "../lib/map-data";
import type { PlayAction, PlayState } from "../lib/play-state";

type MapStageProps = {
  state: PlayState;
  dispatch: (action: PlayAction) => void;
};

export function MapStage({ state, dispatch }: MapStageProps) {
  return (
    <svg viewBox="0 0 1000 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label="Aurelian Basin fullscreen map">
      <defs>
        <linearGradient id="seaV1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#123447" />
          <stop offset="100%" stopColor="#0b5a68" />
        </linearGradient>
        <filter id="v1SoftShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="#000000" floodOpacity="0.42" />
        </filter>
      </defs>

      <rect width="1000" height="900" fill="url(#seaV1)" />
      <path d="M0 0 H214 C150 136 104 246 92 360 C76 510 116 692 62 900 H0 Z" fill="#0f4b5c" opacity="0.92" />
      <path d="M82 190 C162 60 328 28 492 54 C702 88 866 238 914 432 C972 666 812 842 612 884 C402 928 184 810 104 612 C42 460 24 286 82 190 Z" fill="#a98b4d" opacity="0.48" filter="url(#v1SoftShadow)" />
      <path d="M150 194 C246 72 432 52 608 108 C782 164 878 318 872 486 C864 720 676 846 476 824 C270 800 132 650 116 480 C104 342 98 260 150 194 Z" fill="#78613d" opacity="0.22" />

      {plots.map((plot) => {
        const selected = state.selectedPlotId === plot.id;
        const owned = state.ownedPlotIds.includes(plot.id);
        return (
          <g key={plot.id} data-qa={`plot-${plot.id}`} onClick={() => dispatch({ type: "select", plotId: plot.id })} className="cursor-pointer">
            <path d={plot.d} fill={terrainFill[plot.terrain]} opacity={owned ? 0.98 : 0.84} stroke={selected ? "#fff4bf" : owned ? "#ffe39a" : plot.rival ? "#cbd5e1" : "#2f2214"} strokeWidth={selected ? 7 : owned ? 5 : 2.2} />
            {selected && <path d={plot.d} fill="none" stroke="#fffbe3" strokeWidth="12" opacity="0.34" />}
            {owned && <path d={plot.d} fill="#f8d36d" opacity="0.22" stroke="#fff1a8" strokeWidth="6" />}
            {plot.rival && <path d={plot.d} fill="#64748b" opacity="0.18" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="10 8" />}
          </g>
        );
      })}

      <path d="M480 58 C430 168 520 238 486 346 C452 454 404 548 430 826" fill="none" stroke="#64d6ff" strokeWidth="20" strokeLinecap="round" opacity="0.48" />
      <path d="M512 60 C474 172 548 250 526 354 C498 476 452 580 468 828" fill="none" stroke="#d6fbff" strokeWidth="5" strokeLinecap="round" opacity="0.78" />
      <path d="M126 460 C264 410 478 412 858 646" fill="none" stroke="#3b2b19" strokeWidth="8" strokeDasharray="15 17" opacity="0.55" />
      <path d="M600 150 L632 76 L672 164 L704 98 L756 220 Z" fill="#685847" />
      <path d="M610 145 L632 76 L660 145 Z M690 150 L704 98 L734 200 Z" fill="#f5ecd8" opacity="0.8" />
      <path d="M210 276 q34 -68 80 0 q-43 -26 -80 0Z M248 330 q38 -78 92 0 q-48 -30 -92 0Z M168 374 q44 -86 100 0 q-50 -32 -100 0Z" fill="#174f35" opacity="0.9" />
      <g opacity="0.92">
        <rect x="456" y="574" width="42" height="42" rx="5" fill="#6d5c4c" />
        <path d="M462 590 H492 M470 574 V616 M486 578 V614" stroke="#e8dcc9" strokeWidth="4" opacity="0.65" />
      </g>

      {plots.map((plot) => {
        const selected = state.selectedPlotId === plot.id;
        const owned = state.ownedPlotIds.includes(plot.id);
        const shouldLabel = selected || owned || plot.starter || plot.rival;
        return (
          <g key={`${plot.id}-labels`} pointerEvents="none">
            {plot.starter && state.ownedPlotIds.length === 0 && <circle cx={plot.cx} cy={plot.cy} r={selected ? 44 : 34} fill="none" stroke="#ffe39a" strokeWidth="5" opacity="0.72" />}
            {owned && <Banner x={plot.cx} y={plot.cy - 34} />}
            {plot.rival && <Rival x={plot.cx} y={plot.cy - 34} />}
            {shouldLabel && (
              <>
                <rect x={plot.cx - 58} y={plot.cy + 10} width="116" height="24" rx="12" fill="#f7ead2" opacity="0.34" />
                <text x={plot.cx} y={plot.cy + 27} textAnchor="middle" fontSize={selected ? "17" : "14"} fontWeight="900" fill="#24180d" stroke="#f7ead2" strokeWidth="2" paintOrder="stroke">{plot.name}</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Banner({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -20 L0 18" stroke="#fff6c7" strokeWidth="4" />
      <path d="M0 -20 L30 -12 L0 -4 Z" fill="#f8d36d" stroke="#fff6c7" strokeWidth="2" />
    </g>
  );
}

function Rival({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -24 L0 18" stroke="#cbd5e1" strokeWidth="4" />
      <path d="M0 -24 L30 -16 L0 -8 Z" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="2" />
      <text x="15" y="-31" textAnchor="middle" fontSize="10" fontWeight="900" fill="#e2e8f0">RIVAL</text>
    </g>
  );
}
