import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { plots } from "../lib/map-data";
import type { PlayAction, PlayState } from "../lib/play-state";

type MapStageProps = { state: PlayState; dispatch: (action: PlayAction) => void };
type ViewBox = { x: number; y: number; width: number; height: number };
type DragState = { active: boolean; pointerId: number | null; startX: number; startY: number; origin: ViewBox; moved: boolean; targetPlotId: string | null; raf: number | null };
type MapMode = "desktop" | "portrait";
type MapConfig = {
  mode: MapMode;
  width: number;
  height: number;
  minWidth: number;
  image: string;
  plotScaleX: number;
  plotScaleY: number;
  markerScale: number;
};

const legacyPlotSpace = { width: 1000, height: 900 };
const configs: Record<MapMode, MapConfig> = {
  desktop: {
    mode: "desktop",
    width: 1440,
    height: 900,
    minWidth: 560,
    image: "/art/aurelian-basin-map-desktop.png",
    plotScaleX: 1440 / legacyPlotSpace.width,
    plotScaleY: 900 / legacyPlotSpace.height,
    markerScale: 1,
  },
  portrait: {
    mode: "portrait",
    width: 390,
    height: 844,
    minWidth: 190,
    image: "/art/aurelian-basin-map-portrait.png",
    plotScaleX: 390 / legacyPlotSpace.width,
    plotScaleY: 844 / legacyPlotSpace.height,
    markerScale: 0.7,
  },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function MapStage({ state, dispatch }: MapStageProps) {
  const [mode, setMode] = useState<MapMode>("desktop");

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const syncMode = () => setMode(query.matches ? "portrait" : "desktop");
    syncMode();
    query.addEventListener("change", syncMode);
    return () => query.removeEventListener("change", syncMode);
  }, []);

  return <InteractiveAurelianMap key={mode} config={configs[mode]} state={state} dispatch={dispatch} />;
}

function InteractiveAurelianMap({ config, state, dispatch }: MapStageProps & { config: MapConfig }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const world = { x: 0, y: 0, width: config.width, height: config.height };
  const aspect = config.width / config.height;
  const boxRef = useRef<ViewBox>({ ...world });
  const dragRef = useRef<DragState>({ active: false, pointerId: null, startX: 0, startY: 0, origin: { ...world }, moved: false, targetPlotId: null, raf: null });
  const ownedFilterId = `owned-focus-${config.mode}`;
  const selectionFilterId = `selection-focus-${config.mode}`;

  function clampBox(box: ViewBox): ViewBox {
    const width = clamp(box.width, config.minWidth, config.width);
    const height = width / aspect;
    return {
      x: clamp(box.x, world.x, world.x + world.width - width),
      y: clamp(box.y, world.y, world.y + world.height - height),
      width,
      height,
    };
  }

  function boxString(box: ViewBox) {
    return `${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.width.toFixed(1)} ${box.height.toFixed(1)}`;
  }

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
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return { x: box.x + box.width / 2, y: box.y + box.height / 2, rx: 0.5, ry: 0.5 };
    const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    const rx = clamp((point.x - box.x) / box.width, 0, 1);
    const ry = clamp((point.y - box.y) / box.height, 0, 1);
    return { x: point.x, y: point.y, rx, ry };
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const current = boxRef.current;
    const focus = clientToSvg(clientX, clientY, current);
    const nextWidth = clamp(current.width / factor, config.minWidth, config.width);
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

  function onWheel(event: ReactWheelEvent<SVGSVGElement>) {
    if (!event.ctrlKey) return;
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, Math.exp(-event.deltaY * 0.006));
  }

  function onPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    const target = event.target as Element;
    const plotNode = target.closest?.("[data-plot-id]") as Element | null;
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin: { ...boxRef.current },
      moved: false,
      targetPlotId: plotNode?.getAttribute("data-plot-id") ?? null,
      raf: dragRef.current.raf,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return;
    const dx = (event.clientX - drag.startX) / Math.max(Math.abs(matrix.a), 0.0001);
    const dy = (event.clientY - drag.startY) / Math.max(Math.abs(matrix.d), 0.0001);
    if (Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY) > 6) drag.moved = true;
    boxRef.current = clampBox({ x: drag.origin.x - dx, y: drag.origin.y - dy, width: drag.origin.width, height: drag.origin.height });
    scheduleBox();
  }

  function onPointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (drag.pointerId === event.pointerId && event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.active = false;
    if (!drag.moved && drag.targetPlotId) dispatch({ type: "select", plotId: drag.targetPlotId });
  }

  function onPointerCancel() {
    dragRef.current.active = false;
  }

  return (
    <div data-qa="accepted-aurelian-map" data-map-mode={config.mode} className="absolute inset-0 touch-none overflow-hidden bg-[#26342d]">
      <div className="absolute left-3 top-[6.8rem] z-30 flex flex-col gap-2 md:left-5 md:top-[7.2rem]">
        <button data-qa="zoom-overview" onClick={resetOverview} className="rounded-2xl border border-amber-100/20 bg-black/48 px-3 py-2 text-xs font-black text-amber-50 shadow-xl backdrop-blur-md transition hover:bg-black/60">Reset view</button>
        <p className="hidden rounded-2xl border border-amber-100/15 bg-black/36 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-amber-100/58 md:block">pinch zoom · drag</p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${config.width} ${config.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        role="img"
        aria-label={`Aurelian Basin ${config.mode} strategy map`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
      >
        <defs>
          <filter id={ownedFilterId} x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ffcf5c" floodOpacity="0.58" /></filter>
          <filter id={selectionFilterId} x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#fff3bf" floodOpacity="0.55" /></filter>
        </defs>

        <image data-qa="aurelian-map-art" href={config.image} x="0" y="0" width={config.width} height={config.height} preserveAspectRatio="none" />

        <g data-qa="map-layer" transform={`scale(${config.plotScaleX} ${config.plotScaleY})`}>
          {state.settlementMarkers.includes("market") && (
            <path data-qa="market-route" d="M354 285 C430 390 560 510 790 640" fill="none" stroke="#f8c75d" strokeWidth="5" strokeLinecap="round" strokeDasharray="13 12" opacity="0.72" vectorEffect="non-scaling-stroke" pointerEvents="none" />
          )}
          {plots.map((plot) => {
            const selected = state.selectedPlotId === plot.id;
            const owned = state.ownedPlotIds.includes(plot.id);
            const scouted = state.scoutedPlotIds.includes(plot.id);
            const visual = getPlotVisualState({ selected, owned, scouted, rival: Boolean(plot.rival), trade: Boolean(plot.trade) });
            return (
              <g key={plot.id} className="cursor-pointer">
                <path
                  d={plot.d}
                  fill={visual.fill}
                  stroke={visual.stroke}
                  strokeWidth={visual.strokeWidth}
                  strokeDasharray={visual.strokeDasharray}
                  opacity={visual.opacity}
                  filter={selected ? `url(#${selectionFilterId})` : owned ? `url(#${ownedFilterId})` : undefined}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
                <path
                  data-qa={`plot-${plot.id}`}
                  data-plot-id={plot.id}
                  d={plot.d}
                  fill="rgba(255,255,255,0.001)"
                  stroke="transparent"
                  strokeWidth="16"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </g>

        {plots.map((plot) => {
          const selected = state.selectedPlotId === plot.id;
          const owned = state.ownedPlotIds.includes(plot.id);
          const scouted = state.scoutedPlotIds.includes(plot.id);
          const showText = selected || owned || (plot.starter && state.ownedPlotIds.length === 0);
          const showMarker = selected || owned || scouted || plot.rival || plot.trade || (plot.starter && state.ownedPlotIds.length === 0);
          if (!showMarker) return null;
          const x = plot.cx * config.plotScaleX;
          const y = plot.cy * config.plotScaleY;
          return (
            <g key={`${plot.id}-labels`} transform={`translate(${x} ${y}) scale(${config.markerScale})`} pointerEvents="none">
              {plot.starter && state.ownedPlotIds.length === 0 && <circle r={selected ? 42 : 32} fill="none" stroke="#ffe39a" strokeWidth="4" opacity="0.76" />}
              {owned && <Settlement x={0} y={0} markers={state.settlementMarkers} />}
              {owned && <Banner x={0} y={-42} />}
              {plot.rival && <Rival x={0} y={-34} />}
              {plot.trade && !owned && <Trade x={0} y={-34} />}
              {scouted && !owned && <Scout x={0} y={-18} />}
              {showText && (
                <>
                  <rect x="-60" y="10" width="120" height="22" rx="11" fill="#100d08" opacity="0.72" />
                  <text x="0" y="26" textAnchor="middle" fontSize={selected ? "16" : "13"} fontWeight="900" fill="#fff6de" stroke="#1c130b" strokeWidth="2.4" paintOrder="stroke">{plot.name}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function getPlotVisualState({ selected, owned, scouted, rival, trade }: { selected: boolean; owned: boolean; scouted: boolean; rival: boolean; trade: boolean }) {
  if (selected) return { fill: "rgba(255,224,140,0.18)", stroke: "#fff2bd", strokeWidth: 5, strokeDasharray: undefined, opacity: 1 };
  if (owned) return { fill: "rgba(245,183,61,0.16)", stroke: "#ffd978", strokeWidth: 4, strokeDasharray: undefined, opacity: 1 };
  if (scouted) return { fill: "rgba(190,242,100,0.08)", stroke: "#d9f99d", strokeWidth: 2.5, strokeDasharray: "8 8", opacity: 0.95 };
  if (rival) return { fill: "rgba(51,65,85,0.13)", stroke: "#cbd5e1", strokeWidth: 2.25, strokeDasharray: "9 8", opacity: 0.9 };
  if (trade) return { fill: "rgba(56,189,248,0.06)", stroke: "#7dd3fc", strokeWidth: 2, strokeDasharray: "8 8", opacity: 0.82 };
  return { fill: "rgba(255,255,255,0.018)", stroke: "rgba(255,246,220,0.16)", strokeWidth: 1.25, strokeDasharray: undefined, opacity: 0.82 };
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
