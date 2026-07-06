import { useEffect, useRef } from "react";
import { plots, terrainFill } from "../lib/map-data";
import type { PlayAction, PlayState } from "../lib/play-state";

type MapStageProps = {
  state: PlayState;
  dispatch: (action: PlayAction) => void;
};

type Camera = {
  x: number;
  y: number;
  zoom: number;
  dragging: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  raf: number | null;
};

const minZoom = 0.86;
const maxZoom = 2.2;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function MapStage({ state, dispatch }: MapStageProps) {
  const layerRef = useRef<SVGGElement | null>(null);
  const cameraRef = useRef<Camera>({ x: 0, y: 0, zoom: minZoom, dragging: false, startX: 0, startY: 0, originX: 0, originY: 0, raf: null });

  function applyCamera() {
    const camera = cameraRef.current;
    camera.raf = null;
    const reach = Math.max(0, camera.zoom - minZoom);
    camera.x = clamp(camera.x, -260 * reach, 260 * reach);
    camera.y = clamp(camera.y, -220 * reach, 220 * reach);
    layerRef.current?.setAttribute("transform", `translate(${camera.x.toFixed(1)} ${camera.y.toFixed(1)}) scale(${camera.zoom.toFixed(3)})`);
  }

  function scheduleCamera() {
    if (cameraRef.current.raf !== null) return;
    cameraRef.current.raf = requestAnimationFrame(applyCamera);
  }

  useEffect(() => {
    scheduleCamera();
    return () => {
      if (cameraRef.current.raf !== null) cancelAnimationFrame(cameraRef.current.raf);
    };
  }, []);

  function setZoom(nextZoom: number) {
    const camera = cameraRef.current;
    camera.zoom = clamp(nextZoom, minZoom, maxZoom);
    if (camera.zoom <= minZoom + 0.02) {
      camera.x = 0;
      camera.y = 0;
    }
    scheduleCamera();
  }

  function startDrag(clientX: number, clientY: number) {
    const camera = cameraRef.current;
    camera.dragging = true;
    camera.startX = clientX;
    camera.startY = clientY;
    camera.originX = camera.x;
    camera.originY = camera.y;
  }

  function moveDrag(clientX: number, clientY: number) {
    const camera = cameraRef.current;
    if (!camera.dragging) return;
    camera.x = camera.originX + (clientX - camera.startX) / camera.zoom;
    camera.y = camera.originY + (clientY - camera.startY) / camera.zoom;
    scheduleCamera();
  }

  function endDrag() {
    cameraRef.current.dragging = false;
  }

  function wheelZoom(deltaY: number) {
    setZoom(cameraRef.current.zoom + (deltaY < 0 ? 0.16 : -0.16));
  }

  return (
    <div className="absolute inset-0 touch-none">
      <div className="absolute left-3 top-[6.8rem] z-30 flex flex-col gap-2 md:left-5 md:top-[7.2rem]">
        <button data-qa="zoom-overview" onClick={() => setZoom(minZoom)} className="rounded-2xl border border-amber-100/20 bg-black/48 px-3 py-2 text-xs font-black text-amber-50 shadow-xl backdrop-blur-md hover:bg-black/60">Overview</button>
        <button data-qa="zoom-local" onClick={() => setZoom(1.35)} className="rounded-2xl border border-amber-100/20 bg-black/48 px-3 py-2 text-xs font-black text-amber-50 shadow-xl backdrop-blur-md hover:bg-black/60">Local</button>
        <button data-qa="zoom-detail" onClick={() => setZoom(2.05)} className="rounded-2xl border border-amber-100/20 bg-black/48 px-3 py-2 text-xs font-black text-amber-50 shadow-xl backdrop-blur-md hover:bg-black/60">Detail</button>
        <p className="hidden rounded-2xl border border-amber-100/15 bg-black/36 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100/58 md:block">wheel zoom</p>
      </div>

      <svg
        viewBox="0 0 1000 900"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Aurelian Basin fullscreen map"
        onWheel={(event) => { event.preventDefault(); wheelZoom(event.deltaY); }}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); startDrag(event.clientX, event.clientY); }}
        onPointerMove={(event) => moveDrag(event.clientX, event.clientY)}
        onPointerUp={(event) => { event.currentTarget.releasePointerCapture(event.pointerId); endDrag(); }}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <defs>
          <linearGradient id="seaV3" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#123447" />
            <stop offset="100%" stopColor="#0b5a68" />
          </linearGradient>
          <filter id="v3SoftShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="#000000" floodOpacity="0.42" />
          </filter>
        </defs>

        <rect width="1000" height="900" fill="url(#seaV3)" />
        <g ref={layerRef}>
          <path d="M0 0 H214 C150 136 104 246 92 360 C76 510 116 692 62 900 H0 Z" fill="#0f4b5c" opacity="0.92" />
          <path d="M82 190 C162 60 328 28 492 54 C702 88 866 238 914 432 C972 666 812 842 612 884 C402 928 184 810 104 612 C42 460 24 286 82 190 Z" fill="#a98b4d" opacity="0.48" filter="url(#v3SoftShadow)" />
          <path d="M150 194 C246 72 432 52 608 108 C782 164 878 318 872 486 C864 720 676 846 476 824 C270 800 132 650 116 480 C104 342 98 260 150 194 Z" fill="#78613d" opacity="0.22" />
          <path d="M480 58 C430 168 520 238 486 346 C452 454 404 548 430 826" fill="none" stroke="#64d6ff" strokeWidth="20" strokeLinecap="round" opacity="0.48" />
          <path d="M512 60 C474 172 548 250 526 354 C498 476 452 580 468 828" fill="none" stroke="#d6fbff" strokeWidth="5" strokeLinecap="round" opacity="0.78" />
          <path d="M126 460 C264 410 478 412 858 646" fill="none" stroke="#3b2b19" strokeWidth="8" strokeDasharray="15 17" opacity="0.55" />
          {state.settlementMarkers.includes("market") && <path data-qa="market-route" d="M354 285 C430 390 560 510 790 640" fill="none" stroke="#fbbf24" strokeWidth="9" strokeLinecap="round" strokeDasharray="18 14" opacity="0.92" />}
          <path d="M600 150 L632 76 L672 164 L704 98 L756 220 Z" fill="#685847" />
          <path d="M610 145 L632 76 L660 145 Z M690 150 L704 98 L734 200 Z" fill="#f5ecd8" opacity="0.8" />
          <path d="M210 276 q34 -68 80 0 q-43 -26 -80 0Z M248 330 q38 -78 92 0 q-48 -30 -92 0Z M168 374 q44 -86 100 0 q-50 -32 -100 0Z" fill="#174f35" opacity="0.9" />

          {plots.map((plot) => {
            const selected = state.selectedPlotId === plot.id;
            const owned = state.ownedPlotIds.includes(plot.id);
            const scouted = state.scoutedPlotIds.includes(plot.id);
            return (
              <g key={plot.id} data-qa={`plot-${plot.id}`} onClick={(event) => { event.stopPropagation(); dispatch({ type: "select", plotId: plot.id }); }} className="cursor-pointer">
                <path d={plot.d} fill={terrainFill[plot.terrain]} opacity={owned ? 0.98 : scouted ? 0.96 : 0.82} stroke={selected ? "#fff4bf" : owned ? "#ffe39a" : scouted ? "#bef264" : plot.rival ? "#cbd5e1" : plot.trade ? "#7dd3fc" : "#2f2214"} strokeWidth={selected ? 7 : owned ? 5 : scouted ? 4 : plot.rival || plot.trade ? 3 : 2.2} strokeDasharray={plot.trade && !owned ? "9 7" : undefined} />
                {selected && <path d={plot.d} fill="none" stroke="#fffbe3" strokeWidth="12" opacity="0.34" />}
                {owned && <path d={plot.d} fill="#f8d36d" opacity="0.22" stroke="#fff1a8" strokeWidth="6" />}
                {scouted && !owned && <path d={plot.d} fill="#bef264" opacity="0.16" stroke="#ecfccb" strokeWidth="4" strokeDasharray="8 8" />}
                {plot.rival && <path d={plot.d} fill="#64748b" opacity="0.18" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="10 8" />}
              </g>
            );
          })}

          {plots.map((plot) => {
            const selected = state.selectedPlotId === plot.id;
            const owned = state.ownedPlotIds.includes(plot.id);
            const shouldLabel = selected || owned || plot.starter || plot.rival || plot.trade || state.scoutedPlotIds.includes(plot.id);
            return (
              <g key={`${plot.id}-labels`} pointerEvents="none">
                {plot.starter && state.ownedPlotIds.length === 0 && <circle cx={plot.cx} cy={plot.cy} r={selected ? 44 : 34} fill="none" stroke="#ffe39a" strokeWidth="5" opacity="0.72" />}
                {owned && <Settlement x={plot.cx} y={plot.cy} markers={state.settlementMarkers} />}
                {owned && <Banner x={plot.cx} y={plot.cy - 42} />}
                {plot.rival && <Rival x={plot.cx} y={plot.cy - 34} />}
                {plot.trade && !owned && <Trade x={plot.cx} y={plot.cy - 34} />}
                {state.scoutedPlotIds.includes(plot.id) && !owned && <Scout x={plot.cx} y={plot.cy - 18} />}
                {shouldLabel && <><rect x={plot.cx - 62} y={plot.cy + 10} width="124" height="24" rx="12" fill="#f7ead2" opacity="0.34" /><text x={plot.cx} y={plot.cy + 27} textAnchor="middle" fontSize={selected ? "17" : "14"} fontWeight="900" fill="#24180d" stroke="#f7ead2" strokeWidth="2" paintOrder="stroke">{plot.name}</text></>}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function Settlement({ x, y, markers }: { x: number; y: number; markers: string[] }) {
  const size = markers.includes("storehouse") ? 29 : markers.includes("shelter") ? 23 : 18;
  return <g data-qa="settlement-marker" transform={`translate(${x} ${y})`}><circle r={size + 8} fill="#3b2b19" opacity="0.62" /><path d={`M${-size} ${size * 0.62} L0 ${-size} L${size} ${size * 0.62} Z`} fill="#f7ead2" stroke="#3b2b19" strokeWidth="4" />{markers.includes("storehouse") && <rect x="-28" y="10" width="56" height="24" rx="4" fill="#d6a85c" stroke="#3b2b19" strokeWidth="3" />}{markers.includes("market") && <circle cx="38" cy="-4" r="10" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="3" />}{markers.includes("council") && <rect x="-10" y="-34" width="20" height="20" rx="3" fill="#facc15" stroke="#fff7ad" strokeWidth="2" />}{markers.includes("watch") && <path d="M-44 -18 L-34 -48 L-24 -18 Z" fill="#a16207" stroke="#fde68a" strokeWidth="2" />}<circle cx="0" cy="7" r="5" fill="#f59e0b" /></g>;
}

function Banner({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 -20 L0 18" stroke="#fff6c7" strokeWidth="4" /><path d="M0 -20 L30 -12 L0 -4 Z" fill="#f8d36d" stroke="#fff6c7" strokeWidth="2" /></g>;
}

function Rival({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 -24 L0 18" stroke="#cbd5e1" strokeWidth="4" /><path d="M0 -24 L30 -16 L0 -8 Z" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="2" /><text x="15" y="-31" textAnchor="middle" fontSize="10" fontWeight="900" fill="#e2e8f0">RIVAL</text></g>;
}

function Trade({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><circle cx="0" cy="-10" r="13" fill="#0ea5e9" opacity="0.76" /><text x="0" y="-6" textAnchor="middle" fontSize="14" fontWeight="900" fill="#e0f2fe">TR</text></g>;
}

function Scout({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><circle r="12" fill="#bef264" opacity="0.82" /><text x="0" y="4" textAnchor="middle" fontSize="13" fontWeight="900" fill="#1a2e05">?</text></g>;
}
