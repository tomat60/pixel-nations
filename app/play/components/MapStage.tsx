import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { plots, terrainFill } from "../lib/map-data";
import type { PlayAction, PlayState } from "../lib/play-state";

type MapStageProps = { state: PlayState; dispatch: (action: PlayAction) => void };
type ViewBox = { x: number; y: number; width: number; height: number };
type DragState = { active: boolean; pointerId: number | null; startX: number; startY: number; origin: ViewBox; moved: boolean; targetPlotId: string | null; raf: number | null };

const world = { x: 0, y: 0, width: 1000, height: 900 };
const minWidth = 360;
const maxWidth = 1000;
const aspect = world.width / world.height;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function clampBox(box: ViewBox): ViewBox {
  const width = clamp(box.width, minWidth, maxWidth);
  const height = width / aspect;
  return { x: clamp(box.x, world.x, world.x + world.width - width), y: clamp(box.y, world.y, world.y + world.height - height), width, height };
}

function boxString(box: ViewBox) {
  return `${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.width.toFixed(1)} ${box.height.toFixed(1)}`;
}

export function MapStage({ state, dispatch }: MapStageProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const boxRef = useRef<ViewBox>({ ...world });
  const dragRef = useRef<DragState>({ active: false, pointerId: null, startX: 0, startY: 0, origin: { ...world }, moved: false, targetPlotId: null, raf: null });

  function applyBox() {
    dragRef.current.raf = null;
    svgRef.current?.setAttribute("viewBox", boxString(boxRef.current));
  }

  function scheduleBox() {
    if (dragRef.current.raf !== null) return;
    dragRef.current.raf = requestAnimationFrame(applyBox);
  }

  useEffect(() => {
    scheduleBox();
    return () => {
      if (dragRef.current.raf !== null) cancelAnimationFrame(dragRef.current.raf);
    };
  }, []);

  function clientToSvg(clientX: number, clientY: number, box = boxRef.current) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: box.x + box.width / 2, y: box.y + box.height / 2, rx: 0.5, ry: 0.5 };
    const rx = clamp((clientX - rect.left) / rect.width, 0, 1);
    const ry = clamp((clientY - rect.top) / rect.height, 0, 1);
    return { x: box.x + rx * box.width, y: box.y + ry * box.height, rx, ry };
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const current = boxRef.current;
    const focus = clientToSvg(clientX, clientY, current);
    const nextWidth = clamp(current.width / factor, minWidth, maxWidth);
    const nextHeight = nextWidth / aspect;
    boxRef.current = clampBox({ x: focus.x - focus.rx * nextWidth, y: focus.y - focus.ry * nextHeight, width: nextWidth, height: nextHeight });
    scheduleBox();
  }

  function resetOverview() {
    boxRef.current = { ...world };
    if (dragRef.current.raf !== null) {
      cancelAnimationFrame(dragRef.current.raf);
      dragRef.current.raf = null;
    }
    applyBox();
  }

  function selectPlot(plotId: string) {
    dispatch({ type: "select", plotId });
  }

  function onWheel(event: ReactWheelEvent<SVGSVGElement>) {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const factor = Math.exp(-event.deltaY * 0.006);
    zoomAt(event.clientX, event.clientY, factor);
  }

  function onPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    const target = event.target as Element;
    const plotNode = target.closest?.("[data-plot-id]") as Element | null;
    dragRef.current = { active: true, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: { ...boxRef.current }, moved: false, targetPlotId: plotNode?.getAttribute("data-plot-id") ?? null, raf: dragRef.current.raf };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
    boxRef.current = clampBox({ x: drag.origin.x - (dx / rect.width) * drag.origin.width, y: drag.origin.y - (dy / rect.height) * drag.origin.height, width: drag.origin.width, height: drag.origin.height });
    scheduleBox();
  }

  function onPointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (drag.pointerId === event.pointerId) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.active = false;
    if (!drag.moved && drag.targetPlotId) selectPlot(drag.targetPlotId);
  }

  function onPointerCancel() {
    dragRef.current.active = false;
  }

  return (
    <div className="absolute inset-0 touch-none">
      <div className="absolute left-3 top-[6.8rem] z-30 flex flex-col gap-2 md:left-5 md:top-[7.2rem]">
        <button data-qa="zoom-overview" onClick={resetOverview} className="rounded-2xl border border-amber-100/20 bg-black/48 px-3 py-2 text-xs font-black text-amber-50 shadow-xl backdrop-blur-md hover:bg-black/60">Reset view</button>
        <p className="hidden rounded-2xl border border-amber-100/15 bg-black/36 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100/58 md:block">pinch zoom · drag</p>
      </div>
      <svg ref={svgRef} viewBox="0 0 1000 900" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" role="img" aria-label="Aurelian Basin fullscreen map" onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerCancel} onPointerLeave={onPointerCancel}>
        <defs>
          <linearGradient id="seaV4" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#0d2a3a" /><stop offset="55%" stopColor="#0e4453" /><stop offset="100%" stopColor="#0a5560" /></linearGradient>
          <linearGradient id="landV4" x1="0" x2="0.7" y1="0" y2="1"><stop offset="0%" stopColor="#c7a75f" /><stop offset="45%" stopColor="#a9873f" /><stop offset="100%" stopColor="#7a6230" /></linearGradient>
          <linearGradient id="landShadeV4" x1="0" x2="0.6" y1="0" y2="1"><stop offset="0%" stopColor="#8a6f38" /><stop offset="100%" stopColor="#5a4726" /></linearGradient>
          <linearGradient id="mountainV4" x1="0" x2="0.3" y1="0" y2="1"><stop offset="0%" stopColor="#8a7a68" /><stop offset="100%" stopColor="#4a3f34" /></linearGradient>
          <linearGradient id="coastV4" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#f0e6b8" stopOpacity="0.9" /><stop offset="100%" stopColor="#f0e6b8" stopOpacity="0" /></linearGradient>
          <radialGradient id="ownedGlowV4" cx="50%" cy="42%" r="60%"><stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.55" /><stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" /></radialGradient>
          <pattern id="forestV4" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
            <rect width="26" height="26" fill="none" />
            <path d="M13 3 L20 18 L6 18 Z" fill="#1f5a3a" opacity="0.6" />
          </pattern>
          <filter id="v3SoftShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="#000000" floodOpacity="0.42" /></filter>
          <filter id="landBevelV4" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="-3" dy="-3" stdDeviation="3" floodColor="#fff3cf" floodOpacity="0.22" />
            <feDropShadow dx="4" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.35" />
          </filter>
          <filter id="ownedFocusV4" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#ffcf5c" floodOpacity="0.55" />
          </filter>
        </defs>
        <rect width="1000" height="900" fill="url(#seaV4)" />
        <g opacity="0.14">
          <circle cx="120" cy="90" r="150" fill="#7fe6ff" opacity="0.16" />
          <circle cx="860" cy="740" r="220" fill="#053040" opacity="0.32" />
        </g>
        <g data-qa="map-layer">
          <path d="M0 0 H214 C150 136 104 246 92 360 C76 510 116 692 62 900 H0 Z" fill="#0f4b5c" opacity="0.92" />
          <path d="M82 190 C162 60 328 28 492 54 C702 88 866 238 914 432 C972 666 812 842 612 884 C402 928 184 810 104 612 C42 460 24 286 82 190 Z" fill="url(#landV4)" opacity="0.9" filter="url(#v3SoftShadow)" />
          <path d="M150 194 C246 72 432 52 608 108 C782 164 878 318 872 486 C864 720 676 846 476 824 C270 800 132 650 116 480 C104 342 98 260 150 194 Z" fill="url(#landShadeV4)" opacity="0.3" />
          <path d="M82 190 C162 60 328 28 492 54 C702 88 866 238 914 432 C972 666 812 842 612 884 C402 928 184 810 104 612 C42 460 24 286 82 190 Z" fill="none" stroke="url(#coastV4)" strokeWidth="10" opacity="0.5" />
          <path d="M480 58 C430 168 520 238 486 346 C452 454 404 548 430 826" fill="none" stroke="#64d6ff" strokeWidth="20" strokeLinecap="round" opacity="0.48" />
          <path d="M512 60 C474 172 548 250 526 354 C498 476 452 580 468 828" fill="none" stroke="#d6fbff" strokeWidth="5" strokeLinecap="round" opacity="0.78" />
          <path d="M126 460 C264 410 478 412 858 646" fill="none" stroke="#3b2b19" strokeWidth="8" strokeDasharray="15 17" opacity="0.55" />
          {state.settlementMarkers.includes("market") && <path data-qa="market-route" d="M354 285 C430 390 560 510 790 640" fill="none" stroke="#fbbf24" strokeWidth="9" strokeLinecap="round" strokeDasharray="18 14" opacity="0.92" />}
          <path d="M600 150 L632 76 L672 164 L704 98 L756 220 Z" fill="url(#mountainV4)" filter="url(#landBevelV4)" />
          <path d="M610 145 L632 76 L660 145 Z M690 150 L704 98 L734 200 Z" fill="#f5ecd8" opacity="0.8" />
          <path d="M180 250 q60 -120 220 -90 q90 20 60 130 q-30 90 -180 90 q-140 0 -100 -130Z" fill="url(#forestV4)" opacity="0.55" />
          <path d="M210 276 q34 -68 80 0 q-43 -26 -80 0Z M248 330 q38 -78 92 0 q-48 -30 -92 0Z M168 374 q44 -86 100 0 q-50 -32 -100 0Z" fill="#174f35" opacity="0.9" />
          {plots.map((plot) => {
            const selected = state.selectedPlotId === plot.id;
            const owned = state.ownedPlotIds.includes(plot.id);
            const scouted = state.scoutedPlotIds.includes(plot.id);
            const baseFill = terrainFill[plot.terrain];
            const fill = owned ? "#caa24d" : plot.rival ? "#5c6a78" : !scouted && !owned ? mixCool(baseFill) : baseFill;
            const fillOpacity = owned ? 1 : scouted ? 0.94 : plot.rival ? 0.72 : plot.trade ? 0.88 : 0.66;
            return (
              <g key={plot.id} data-qa={`plot-group-${plot.id}`} data-plot-id={plot.id} onClick={(event) => { event.stopPropagation(); if (!dragRef.current.moved) selectPlot(plot.id); }} className="cursor-pointer">
                <path data-qa={`plot-${plot.id}`} data-plot-id={plot.id} d={plot.d} fill={fill} opacity={fillOpacity} stroke={selected ? "#fff4bf" : owned ? "#ffdf8a" : scouted ? "#bef264" : plot.rival ? "#94a3b8" : plot.trade ? "#7dd3fc" : "#241a10"} strokeWidth={selected ? 7 : owned ? 6 : scouted ? 4 : plot.rival || plot.trade ? 3 : 2} strokeDasharray={plot.trade && !owned ? "9 7" : undefined} filter={owned ? "url(#ownedFocusV4)" : undefined} />
                {owned && <path d={plot.d} fill="url(#ownedGlowV4)" opacity="0.9" />}
                {owned && <path d={plot.d} fill="none" stroke="#fff1a8" strokeWidth="3" opacity="0.85" />}
                {selected && <path d={plot.d} fill="none" stroke="#fffbe3" strokeWidth="12" opacity="0.34" />}
                {scouted && !owned && <path d={plot.d} fill="#bef264" opacity="0.1" stroke="#ecfccb" strokeWidth="3" strokeDasharray="8 8" />}
                {plot.rival && <path data-plot-id={plot.id} d={plot.d} fill="#334155" opacity="0.22" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="10 8" />}
                {plot.trade && !owned && <path d={plot.d} fill="#38bdf8" opacity="0.08" />}
              </g>
            );
          })}
          {plots.map((plot) => {
            const selected = state.selectedPlotId === plot.id;
            const owned = state.ownedPlotIds.includes(plot.id);
            const shouldLabel = selected || owned || plot.starter || plot.rival || plot.trade || state.scoutedPlotIds.includes(plot.id);
            const showText = selected || owned || (plot.starter && state.ownedPlotIds.length === 0);
            return (
              <g key={`${plot.id}-labels`} pointerEvents="none">
                {plot.starter && state.ownedPlotIds.length === 0 && <circle cx={plot.cx} cy={plot.cy} r={selected ? 44 : 34} fill="none" stroke="#ffe39a" strokeWidth="5" opacity="0.72" />}
                {owned && <Settlement x={plot.cx} y={plot.cy} markers={state.settlementMarkers} />}
                {owned && <Banner x={plot.cx} y={plot.cy - 42} />}
                {plot.rival && <Rival x={plot.cx} y={plot.cy - 34} />}
                {plot.trade && !owned && <Trade x={plot.cx} y={plot.cy - 34} />}
                {state.scoutedPlotIds.includes(plot.id) && !owned && <Scout x={plot.cx} y={plot.cy - 18} />}
                {showText && <><rect x={plot.cx - 60} y={plot.cy + 10} width="120" height="22" rx="11" fill="#1c130b" opacity="0.4" /><text x={plot.cx} y={plot.cy + 26} textAnchor="middle" fontSize={selected ? "16" : "13"} fontWeight="900" fill="#fff6de" stroke="#1c130b" strokeWidth="2.4" paintOrder="stroke">{plot.name}</text></>}
                {!showText && shouldLabel && <circle cx={plot.cx} cy={plot.cy + 20} r="3" fill="#fff6de" opacity="0.7" />}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function mixCool(hex: string): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return hex;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const mix = (channel: number, target: number) => Math.round(channel * 0.72 + target * 0.28);
  const nr = mix(r, 70);
  const ng = mix(g, 92);
  const nb = mix(b, 108);
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

function Settlement({ x, y, markers }: { x: number; y: number; markers: string[] }) {
  const hasStorehouse = markers.includes("storehouse");
  const hasShelter = markers.includes("shelter");
  const size = hasStorehouse ? 30 : hasShelter ? 24 : 17;
  const stage: "camp" | "shelter" | "village" = hasStorehouse ? "village" : hasShelter ? "shelter" : "camp";
  return (
    <g data-qa="settlement-marker" data-settlement-stage={stage} transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy={size * 0.7} rx={size + 12} ry={size * 0.42} fill="#0c0803" opacity="0.4" />
      {stage === "camp" && (
        <>
          <path d={`M${-size} ${size * 0.6} L0 ${-size * 0.7} L${size} ${size * 0.6} Z`} fill="#e7c98f" stroke="#3b2b19" strokeWidth="3" />
          <path d={`M${-size * 0.35} ${size * 0.6} L0 ${-size * 0.15} L${size * 0.35} ${size * 0.6} Z`} fill="#4a3018" />
          <circle cx="0" cy={size * 0.5} r="4" fill="#f59e0b" />
        </>
      )}
      {stage === "shelter" && (
        <>
          <path d={`M${-size} ${size * 0.55} L0 ${-size} L${size} ${size * 0.55} Z`} fill="#f0dfae" stroke="#3b2b19" strokeWidth="3.5" />
          <rect x={-size * 0.55} y={size * 0.02} width={size * 1.1} height={size * 0.55} fill="#7a5a34" stroke="#3b2b19" strokeWidth="2.5" />
          <rect x={-size * 0.16} y={size * 0.24} width={size * 0.32} height={size * 0.33} fill="#2c1c0f" />
          <circle cx="0" cy={-size * 0.05} r="4.5" fill="#f59e0b" />
        </>
      )}
      {stage === "village" && (
        <>
          <path d={`M${-size * 0.55} ${size * 0.5} L${-size * 0.55} ${-size * 0.2} L0 ${-size} L${size * 0.55} ${-size * 0.2} L${size * 0.55} ${size * 0.5} Z`} fill="#efe0b0" stroke="#3b2b19" strokeWidth="3.5" />
          <rect x={-size * 0.4} y={-size * 0.05} width={size * 0.8} height={size * 0.55} fill="#8a6636" stroke="#3b2b19" strokeWidth="2.5" />
          <rect x={-size * 0.14} y={size * 0.14} width={size * 0.28} height={size * 0.35} fill="#241609" />
          <circle cx="0" cy={-size * 0.28} r="5" fill="#f59e0b" />
        </>
      )}
      {markers.includes("storehouse") && <rect x="-30" y="12" width="20" height="22" rx="3" fill="#c99a52" stroke="#3b2b19" strokeWidth="3" />}
      {markers.includes("market") && (
        <g transform="translate(34 -2)">
          <path d="M-9 8 L0 -10 L9 8 Z" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="0" cy="-2" r="3" fill="#38bdf8" />
        </g>
      )}
      {markers.includes("council") && (
        <g transform="translate(-32 -6)">
          <path d="M-8 8 L-8 -6 L0 -12 L8 -6 L8 8 Z" fill="none" stroke="#facc15" strokeWidth="3" strokeLinejoin="round" />
        </g>
      )}
      {markers.includes("watch") && (
        <g transform="translate(0 -40)">
          <path d="M-8 14 L0 -14 L8 14 Z" fill="none" stroke="#fde68a" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="0" cy="-14" r="2.6" fill="#fde68a" />
        </g>
      )}
    </g>
  );
}

function Banner({ x, y }: { x: number; y: number }) { return <g transform={`translate(${x} ${y})`}><path d="M0 -20 L0 18" stroke="#fff6c7" strokeWidth="4" /><path d="M0 -20 L30 -12 L0 -4 Z" fill="#f8d36d" stroke="#fff6c7" strokeWidth="2" /></g>; }

function Rival({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.92">
      <circle r="15" fill="#334155" opacity="0.7" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M-7 6 L0 -9 L7 6 L0 1 Z" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-9 8 L9 8" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Trade({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.94">
      <circle r="14" fill="#0ea5e9" opacity="0.5" />
      <path d="M-6 4 L0 -8 L6 4 Z M-6 4 L6 4 L4 8 L-4 8 Z" fill="#e0f2fe" stroke="#0c4a6e" strokeWidth="1.4" strokeLinejoin="round" />
    </g>
  );
}

function Scout({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.9">
      <circle r="11" fill="#bef264" opacity="0.55" />
      <path d="M0 -7 L4 2 L0 -1 L-4 2 Z" fill="#1a2e05" />
      <circle cx="0" cy="5" r="1.6" fill="#1a2e05" />
    </g>
  );
}
