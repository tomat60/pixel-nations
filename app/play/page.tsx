"use client";

import { useMemo, useReducer } from "react";

type View = "map" | "orders" | "realm" | "chronicle" | "world";
type Terrain = "plains" | "forest" | "mountain" | "coast" | "basin" | "ruins" | "marsh";
type Parcel = {
  id: string;
  name: string;
  region: string;
  terrain: Terrain;
  resources: [string, string];
  d: string;
  cx: number;
  cy: number;
  starter?: boolean;
  rival?: boolean;
};

type OrderId = "expand" | "develop" | "secure" | "scout" | "trade";
type PlayState = {
  view: View;
  selectedId: string;
  season: number;
  owned: string[];
  scouted: string[];
  developmentLevel: number;
  influenceRadius: number;
  tradeRoute: boolean;
  chronicle: string[];
};
type PlayAction =
  | { type: "select"; parcelId: string }
  | { type: "setView"; view: View }
  | { type: "claim"; parcelId: string }
  | { type: "order"; order: OrderId };

const parcels: Parcel[] = [
  { id: "ironstrand", name: "Ironstrand", region: "Iron Coast", terrain: "coast", resources: ["Fish", "Ore"], d: "M70 248 L155 220 L206 288 L164 358 L78 345 Z", cx: 134, cy: 292, rival: true },
  { id: "westwatch", name: "Westwatch", region: "Iron Coast", terrain: "coast", resources: ["Salt", "Trade"], d: "M82 350 L164 358 L196 439 L134 505 L60 464 Z", cx: 132, cy: 421 },
  { id: "harborfen", name: "Harborfen", region: "Iron Coast", terrain: "marsh", resources: ["Reeds", "Fish"], d: "M135 506 L196 439 L278 492 L254 590 L154 595 Z", cx: 208, cy: 524 },
  { id: "northpass", name: "Northpass", region: "North Frontier", terrain: "mountain", resources: ["Stone", "Defense"], d: "M229 92 L331 70 L401 119 L361 199 L242 202 L188 144 Z", cx: 298, cy: 139, rival: true },
  { id: "frostgate", name: "Frostgate", region: "North Frontier", terrain: "mountain", resources: ["Iron", "Snowmelt"], d: "M401 119 L502 84 L589 132 L557 211 L449 219 L361 199 Z", cx: 480, cy: 155 },
  { id: "crownridge", name: "Crownridge", region: "Crownlands", terrain: "mountain", resources: ["Gold", "Stone"], d: "M589 132 L704 136 L782 208 L732 292 L615 271 L557 211 Z", cx: 663, cy: 211 },
  { id: "highmere", name: "Highmere", region: "Crownlands", terrain: "plains", resources: ["Horses", "Influence"], d: "M704 136 L820 176 L905 270 L842 344 L732 292 L782 208 Z", cx: 803, cy: 251, rival: true },
  { id: "pinewatch", name: "Pinewatch", region: "North Frontier", terrain: "forest", resources: ["Timber", "Cover"], d: "M242 202 L361 199 L390 289 L316 360 L206 288 Z", cx: 300, cy: 278 },
  { id: "elderwood", name: "Elderwood", region: "North Frontier", terrain: "forest", resources: ["Timber", "Game"], d: "M361 199 L449 219 L478 319 L390 289 Z", cx: 420, cy: 256 },
  { id: "riverbend", name: "Riverbend", region: "Aurelia", terrain: "plains", resources: ["Water", "Grain"], d: "M449 219 L557 211 L615 271 L572 368 L478 319 Z", cx: 535, cy: 287, starter: true },
  { id: "stonefall", name: "Stonefall", region: "Crownlands", terrain: "mountain", resources: ["Stone", "Ore"], d: "M615 271 L732 292 L736 396 L624 428 L572 368 Z", cx: 663, cy: 350 },
  { id: "silvermark", name: "Silvermark", region: "Crownlands", terrain: "plains", resources: ["Silver", "Influence"], d: "M732 292 L842 344 L816 464 L736 396 Z", cx: 785, cy: 378 },
  { id: "greenvale", name: "Greenvale", region: "Aurelia", terrain: "plains", resources: ["Food", "Growth"], d: "M316 360 L390 289 L478 319 L456 429 L342 455 Z", cx: 398, cy: 369, starter: true },
  { id: "newaurelia", name: "New Aurelia", region: "Aurelia", terrain: "plains", resources: ["Grain", "People"], d: "M478 319 L572 368 L552 470 L456 429 Z", cx: 514, cy: 392, starter: true },
  { id: "oldford", name: "Oldford", region: "Aurelia", terrain: "plains", resources: ["Crossing", "Trade"], d: "M456 429 L552 470 L531 568 L411 552 L342 455 Z", cx: 459, cy: 494 },
  { id: "copperfield", name: "Copperfield", region: "Aurelia", terrain: "plains", resources: ["Copper", "Grain"], d: "M196 439 L316 360 L342 455 L278 492 Z", cx: 286, cy: 431 },
  { id: "sunmeadow", name: "Sunmeadow", region: "Aurelia", terrain: "plains", resources: ["Food", "Morale"], d: "M552 470 L624 428 L736 396 L728 514 L639 587 L531 568 Z", cx: 630, cy: 501 },
  { id: "kingsroad", name: "Kingsroad", region: "Aurelia", terrain: "plains", resources: ["Roads", "Influence"], d: "M278 492 L342 455 L411 552 L352 642 L254 590 Z", cx: 337, cy: 550 },
  { id: "relicfen", name: "Relicfen", region: "Ember Basin", terrain: "ruins", resources: ["Relics", "Unrest"], d: "M411 552 L531 568 L506 676 L352 642 Z", cx: 443, cy: 616 },
  { id: "mistmarsh", name: "Mistmarsh", region: "Ember Basin", terrain: "marsh", resources: ["Herbs", "Danger"], d: "M531 568 L639 587 L620 688 L506 676 Z", cx: 570, cy: 625 },
  { id: "emberfall", name: "Emberfall", region: "Ember Basin", terrain: "basin", resources: ["Clay", "Heat"], d: "M639 587 L728 514 L842 566 L801 674 L620 688 Z", cx: 720, cy: 614, rival: true },
  { id: "goldcoast", name: "Goldcoast", region: "Iron Coast", terrain: "coast", resources: ["Trade", "Gold"], d: "M842 344 L924 420 L897 562 L842 566 L728 514 L816 464 Z", cx: 839, cy: 475 },
  { id: "saltmere", name: "Saltmere", region: "Iron Coast", terrain: "coast", resources: ["Salt", "Ships"], d: "M897 562 L930 641 L801 674 L842 566 Z", cx: 866, cy: 616 },
  { id: "ashgrove", name: "Ashgrove", region: "Ember Basin", terrain: "forest", resources: ["Charcoal", "Game"], d: "M154 595 L254 590 L352 642 L289 704 L162 690 Z", cx: 249, cy: 644 },
  { id: "redbarrow", name: "Redbarrow", region: "Ember Basin", terrain: "ruins", resources: ["Relics", "Fear"], d: "M289 704 L352 642 L506 676 L486 736 L344 752 Z", cx: 411, cy: 700, rival: true },
  { id: "lowmarket", name: "Lowmarket", region: "Aurelia", terrain: "plains", resources: ["Trade", "Food"], d: "M620 688 L801 674 L763 748 L486 736 L506 676 Z", cx: 639, cy: 708 },
  { id: "eastwatch", name: "Eastwatch", region: "Crownlands", terrain: "mountain", resources: ["Watch", "Stone"], d: "M842 344 L905 270 L960 350 L924 420 Z", cx: 908, cy: 352 },
  { id: "deepgrove", name: "Deepgrove", region: "North Frontier", terrain: "forest", resources: ["Timber", "Mystery"], d: "M188 144 L242 202 L206 288 L155 220 Z", cx: 199, cy: 215 },
  { id: "whitefalls", name: "Whitefalls", region: "North Frontier", terrain: "plains", resources: ["Water", "Faith"], d: "M502 84 L612 76 L704 136 L589 132 Z", cx: 603, cy: 110 },
  { id: "crownhold", name: "Crownhold", region: "Crownlands", terrain: "ruins", resources: ["Crown", "Legacy"], d: "M820 176 L930 238 L960 350 L905 270 Z", cx: 899, cy: 255, rival: true },
];

const views: { id: View; label: string }[] = [
  { id: "orders", label: "Orders" },
  { id: "map", label: "Map" },
  { id: "realm", label: "Age" },
  { id: "chronicle", label: "Banner" },
  { id: "world", label: "Profile" },
];

const initialPlayState: PlayState = {
  view: "map",
  selectedId: "greenvale",
  season: 1,
  owned: [],
  scouted: ["greenvale", "newaurelia", "riverbend"],
  developmentLevel: 0,
  influenceRadius: 38,
  tradeRoute: false,
  chronicle: ["The basin waits. Choose the first land."],
};

const terrainFill: Record<Terrain, string> = {
  plains: "#c8a55c",
  forest: "#3f7a45",
  mountain: "#81705c",
  coast: "#bd8d58",
  basin: "#9d5f3f",
  ruins: "#897666",
  marsh: "#667b56",
};

const terrainLine: Record<Terrain, string> = {
  plains: "Fields, room to grow, easy to defend badly.",
  forest: "Timber, cover, and secrets under the canopy.",
  mountain: "Stone, hard borders, and slow expansion.",
  coast: "Trade winds, wealth, and open danger.",
  basin: "Heat, clay, old fires, and heavy consequences.",
  ruins: "Power left behind by somebody who failed first.",
  marsh: "Useful, dangerous, and never fully still.",
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function withChronicle(state: PlayState, line: string): PlayState {
  return {
    ...state,
    chronicle: [`Season ${state.season}: ${line}`, ...state.chronicle].slice(0, 8),
  };
}

function playReducer(state: PlayState, action: PlayAction): PlayState {
  if (action.type === "select") return { ...state, selectedId: action.parcelId };
  if (action.type === "setView") return { ...state, view: action.view };

  if (action.type === "claim") {
    const parcel = parcels.find((item) => item.id === action.parcelId);
    if (!parcel) return state;
    if (parcel.rival) return withChronicle(state, `${parcel.name} already flies a rival banner.`);
    return {
      ...state,
      selectedId: parcel.id,
      season: 2,
      owned: [parcel.id],
      scouted: unique([...state.scouted, parcel.id]),
      developmentLevel: 1,
      influenceRadius: 48,
      chronicle: [`Season 1: Banner planted at ${parcel.name}. Campfires mark the first claim.`, "The basin waits. Choose the first land."],
    };
  }

  if (action.type === "order") {
    const capital = parcels.find((parcel) => parcel.id === state.owned[0]);
    if (!capital) return state;
    const advanced = { ...state, season: Math.min(12, state.season + 1) };

    if (action.order === "expand") {
      const next = parcels.find((parcel) => !advanced.owned.includes(parcel.id) && !parcel.rival);
      if (!next) return withChronicle(advanced, "No open neighboring claim is ready this season.");
      return withChronicle({
        ...advanced,
        owned: unique([...advanced.owned, next.id]),
        scouted: unique([...advanced.scouted, next.id]),
        influenceRadius: Math.min(120, advanced.influenceRadius + 10),
      }, `${next.name} accepts your border stones. The realm grows.`);
    }

    if (action.order === "develop") {
      return withChronicle({
        ...advanced,
        developmentLevel: Math.min(5, advanced.developmentLevel + 1),
        influenceRadius: Math.min(130, advanced.influenceRadius + 8),
      }, "Roofs rise around the banner. The settlement marker changes on the map.");
    }

    if (action.order === "secure") {
      return withChronicle({
        ...advanced,
        influenceRadius: Math.min(150, advanced.influenceRadius + 16),
      }, "Watchfires mark the roads. Your influence ring strengthens.");
    }

    if (action.order === "scout") {
      const nextScout = parcels.find((parcel) => !advanced.scouted.includes(parcel.id));
      if (!nextScout) return withChronicle(advanced, "Your scouts already know the whole basin prototype.");
      return withChronicle({
        ...advanced,
        scouted: [...advanced.scouted, nextScout.id],
      }, `${nextScout.name} is scouted. A new label appears on the map.`);
    }

    if (action.order === "trade") {
      return withChronicle({
        ...advanced,
        tradeRoute: true,
        developmentLevel: Math.max(advanced.developmentLevel, 4),
      }, "A trade route burns bright toward the Iron Coast. Nationhood feels possible.");
    }
  }

  return state;
}

export default function PlayPrototypePage() {
  const [state, dispatch] = useReducer(playReducer, initialPlayState);
  const selected = useMemo(() => parcels.find((parcel) => parcel.id === state.selectedId) ?? parcels[12], [state.selectedId]);
  const capital = useMemo(() => parcels.find((parcel) => parcel.id === state.owned[0]) ?? null, [state.owned]);
  const phase = state.owned.length === 0 ? "unclaimed" : state.developmentLevel >= 5 ? "empire" : state.developmentLevel >= 4 ? "nation" : "settlement";

  return (
    <main data-qa="play-shell" className="fixed inset-0 overflow-hidden bg-[#06090a] text-[#f7ead2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(250,204,21,.20),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(56,189,248,.16),transparent_31%),linear-gradient(180deg,#101711_0%,#050807_100%)]" />
      <section className="relative z-10 grid h-full grid-rows-[auto_1fr_auto] p-3 md:p-5">
        <header className="flex items-center justify-between rounded-3xl border border-amber-200/20 bg-black/45 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-amber-200/70">Pixel Nations</p>
            <h1 className="text-xl font-black tracking-tight md:text-3xl">Aurelian Basin</h1>
          </div>
          <div className="hidden text-center md:block">
            <p className="text-[10px] uppercase tracking-[0.34em] text-amber-200/65">From Land to Empire</p>
            <p className="mt-1 text-sm text-amber-50/70">One fullscreen map game</p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <StatusChip label="Season" value={`${state.season}/12`} />
            <StatusChip label="Lands" value={`${state.owned.length}/30`} />
          </div>
        </header>

        <div className="my-3 grid min-h-0 gap-3 xl:grid-cols-[282px_minmax(0,1fr)_282px]">
          <CoreLoopRail selected={selected} phase={phase} ownedCount={state.owned.length} onClaim={() => dispatch({ type: "claim", parcelId: selected.id })} isRival={Boolean(selected.rival)} />

          <div data-qa="map-stage" className="relative min-h-0 overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[#1d2d23] shadow-[0_30px_90px_rgba(0,0,0,.45)]">
            <svg viewBox="0 0 1000 760" className="absolute inset-0 h-full w-full" role="img" aria-label="Aurelian Basin 30 parcel strategy map">
              <defs>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity="0.42" />
                </filter>
                <linearGradient id="sea" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#16374a" />
                  <stop offset="100%" stopColor="#0d5868" />
                </linearGradient>
              </defs>
              <rect width="1000" height="760" fill="url(#sea)" />
              <path d="M0 530 C 110 468 190 520 276 489 C 408 441 520 472 620 438 C 776 385 862 444 1000 374 L1000 760 L0 760 Z" fill="#0b5264" opacity="0.78" />
              <path d="M86 210 C 167 70 322 43 482 64 C 628 83 777 123 898 267 C 1017 409 931 632 802 716 C 673 799 411 755 256 731 C 101 707 25 591 39 451 C 48 356 48 276 86 210 Z" fill="#a78a4d" filter="url(#softShadow)" opacity="0.48" />

              {parcels.map((parcel) => {
                const active = parcel.id === state.selectedId;
                const isOwned = state.owned.includes(parcel.id);
                const isScouted = state.scouted.includes(parcel.id) || isOwned || parcel.starter;
                return (
                  <g key={parcel.id} data-qa={`parcel-${parcel.id}`} onClick={() => dispatch({ type: "select", parcelId: parcel.id })} className="cursor-pointer">
                    <path d={parcel.d} fill={terrainFill[parcel.terrain]} opacity={isScouted ? 0.92 : 0.46} stroke={active ? "#fff2ad" : "#382a1a"} strokeWidth={active ? 6 : 2.3} />
                    {parcel.rival && <path d={parcel.d} fill="#5f6670" opacity="0.28" stroke="#cbd5e1" strokeWidth="2" />}
                    {parcel.starter && phase === "unclaimed" && <circle cx={parcel.cx} cy={parcel.cy} r="36" fill="none" stroke="#ffe39a" strokeWidth="5" opacity="0.6" />}
                    {isOwned && <path d={parcel.d} fill="#f8d36d" opacity="0.20" stroke="#ffe39a" strokeWidth="6" />}
                    {capital?.id === parcel.id && (
                      <>
                        <circle cx={parcel.cx} cy={parcel.cy} r={state.influenceRadius} fill="#f8d36d" opacity="0.13" stroke="#ffe39a" strokeWidth="4" />
                        <DevelopmentMarker x={parcel.cx} y={parcel.cy - 18} level={state.developmentLevel} />
                      </>
                    )}
                    {parcel.rival && <RivalBanner x={parcel.cx} y={parcel.cy - 22} />}
                    {isScouted && (
                      <text x={parcel.cx} y={parcel.cy + 24} textAnchor="middle" fontSize="16" fontWeight="800" fill="#24180d" stroke="#f7ead2" strokeWidth="3" paintOrder="stroke">
                        {parcel.name}
                      </text>
                    )}
                  </g>
                );
              })}

              <path d="M470 78 C 438 170 520 244 487 344 C 461 433 397 512 430 724" fill="none" stroke="#65d8ff" strokeWidth="18" strokeLinecap="round" opacity="0.58" />
              <path d="M506 81 C 478 177 548 244 526 350 C 501 464 438 536 468 724" fill="none" stroke="#d4f8ff" strokeWidth="5" strokeLinecap="round" opacity="0.78" />
              <path d="M138 444 C 302 399 520 408 866 612" fill="none" stroke="#3b2d1d" strokeWidth="8" strokeDasharray="14 16" opacity={phase === "unclaimed" ? 0.22 : 0.54} />
              {state.tradeRoute && capital && <path d={`M${capital.cx} ${capital.cy} C 530 420 650 466 866 612`} fill="none" stroke="#ffe39a" strokeWidth="7" strokeDasharray="18 12" opacity="0.88" />}
              <path d="M598 145 L632 75 L672 162 L704 100 L754 216 Z" fill="#6b5d4f" />
              <path d="M608 141 L632 75 L657 141 Z M690 148 L704 100 L732 198 Z" fill="#f8eed9" opacity="0.78" />
              <path d="M212 275 q33 -62 76 0 q-42 -22 -76 0Z M248 323 q36 -72 86 0 q-44 -26 -86 0Z M168 366 q41 -80 94 0 q-48 -28 -94 0Z" fill="#1f6b42" opacity="0.9" />
            </svg>

            <div className="absolute left-4 top-4 max-w-[286px] rounded-3xl border border-amber-100/20 bg-black/40 p-4 backdrop-blur-md xl:hidden">
              <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/70">Selected parcel</p>
              <h2 className="mt-1 text-2xl font-black">{selected.name}</h2>
              <p className="mt-1 text-sm text-amber-50/80">{selected.region} - {selected.terrain}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-50/65">{terrainLine[selected.terrain]}</p>
              {phase === "unclaimed" ? (
                <button data-qa="claim-button" onClick={() => dispatch({ type: "claim", parcelId: selected.id })} className="mt-3 rounded-2xl bg-amber-300 px-4 py-2 text-sm font-black text-stone-950 shadow-lg shadow-black/30">
                  {selected.rival ? "Rival banner here" : "Claim this land"}
                </button>
              ) : (
                <p className="mt-3 rounded-2xl bg-amber-100/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-100">{phase} phase</p>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-amber-100/20 bg-black/48 p-3 backdrop-blur-md md:bottom-6 md:left-auto md:right-6 md:w-[390px]">
              {state.view === "map" && <Panel title="30-parcel Basin" body="This is now a real authored sector prototype: starter lands, rival banners, scouted labels, roads, river, coast, mountains, ruins and owned influence on the map." />}
              {state.view === "orders" && (
                <div>
                  <Panel title="Season Orders" body="Every order changes a visible map state: land, marker, influence ring, scouting label, or trade route." />
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    <OrderButton label="Expand" onClick={() => dispatch({ type: "order", order: "expand" })} disabled={!capital} />
                    <OrderButton label="Develop" onClick={() => dispatch({ type: "order", order: "develop" })} disabled={!capital} />
                    <OrderButton label="Secure" onClick={() => dispatch({ type: "order", order: "secure" })} disabled={!capital} />
                    <OrderButton label="Scout" onClick={() => dispatch({ type: "order", order: "scout" })} disabled={!capital} />
                    <OrderButton label="Trade" onClick={() => dispatch({ type: "order", order: "trade" })} disabled={!capital || state.developmentLevel < 3} />
                  </div>
                </div>
              )}
              {state.view === "realm" && <Panel title="Age Layer" body={`Phase: ${phase}. Capital marker level ${state.developmentLevel}/5. Owned parcels: ${state.owned.length}. This replaces dashboard and settlement as one in-game sheet.`} />}
              {state.view === "chronicle" && <Chronicle entries={state.chronicle} />}
              {state.view === "world" && <Panel title="World Atlas Layer" body="A-01 is only one basin in a 10,000-land world. The big game stays visible, but the demo remains one focused sector." />}
            </div>
          </div>

          <LayerStack phase={phase} ownedCount={state.owned.length} developmentLevel={state.developmentLevel} />
        </div>

        <nav className="grid grid-cols-5 gap-2 rounded-3xl border border-amber-200/20 bg-black/45 p-2 backdrop-blur-md">
          {views.map((item) => (
            <button key={item.id} onClick={() => dispatch({ type: "setView", view: item.id })} className={`rounded-2xl px-2 py-3 text-xs font-black uppercase tracking-wide transition md:text-sm ${state.view === item.id ? "bg-amber-300 text-stone-950" : "bg-white/5 text-amber-50/70"}`}>
              {item.label}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}

function CoreLoopRail({ selected, phase, ownedCount, onClaim, isRival }: { selected: Parcel; phase: string; ownedCount: number; onClaim: () => void; isRival: boolean }) {
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

function LayerStack({ phase, ownedCount, developmentLevel }: { phase: string; ownedCount: number; developmentLevel: number }) {
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
      <div className="mt-4 rounded-3xl border border-amber-100/15 bg-black/30 p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200/65">Product target</p>
        <p className="mt-2 text-sm font-bold leading-relaxed">A premium strategy shell: one living world, clear choices, visible consequences, no page hopping.</p>
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

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/60">{label}</p>
      <p className="text-xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/70">Game layer</p>
      <h3 className="mt-1 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-amber-50/75">{body}</p>
    </div>
  );
}

function Chronicle({ entries }: { entries: string[] }) {
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

function OrderButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={onClick} className={`rounded-2xl border px-2 py-3 text-[10px] font-black uppercase tracking-wide ${disabled ? "border-white/5 bg-white/5 text-white/25" : "border-amber-100/20 bg-amber-100/10 text-amber-50 hover:bg-amber-300 hover:text-stone-950"}`}>
      {label}
    </button>
  );
}

function DevelopmentMarker({ x, y, level }: { x: number; y: number; level: number }) {
  const symbols = ["⚑", "⛺", "⌂", "▣", "♜", "♛"];
  return (
    <g data-qa={`dev-marker-level-${level}`} transform={`translate(${x} ${y})`}>
      <circle r="22" fill="#f8d36d" stroke="#fff6c7" strokeWidth="4" />
      <text y="8" textAnchor="middle" fontSize="25" fontWeight="900" fill="#24180d">{symbols[level]}</text>
    </g>
  );
}

function RivalBanner({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -22 L0 18" stroke="#cbd5e1" strokeWidth="4" />
      <path d="M0 -22 L28 -14 L0 -6 Z" fill="#94a3b8" />
    </g>
  );
}
