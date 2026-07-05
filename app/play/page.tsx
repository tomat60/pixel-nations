"use client";

import { useMemo, useState } from "react";

type View = "map" | "orders" | "settlement" | "nation" | "empire";
type Terrain = "plains" | "forest" | "hills" | "coast" | "ruins" | "river" | "marsh" | "road";
type Region = {
  id: string;
  name: string;
  terrain: Terrain;
  mood: string;
  d: string;
  cx: number;
  cy: number;
};

const regions: Region[] = [
  { id: "northpass", name: "Northpass", terrain: "hills", mood: "mountain gate", d: "M278 118 L383 102 L438 154 L408 229 L304 238 L232 180 Z", cx: 332, cy: 171 },
  { id: "pinewatch", name: "Pinewatch", terrain: "forest", mood: "wood + cover", d: "M408 118 L533 103 L604 164 L566 246 L431 229 L438 154 Z", cx: 505, cy: 171 },
  { id: "stonefall", name: "Stonefall", terrain: "hills", mood: "stone + defense", d: "M604 164 L724 181 L788 267 L735 346 L610 307 L566 246 Z", cx: 672, cy: 252 },
  { id: "elderwood", name: "Elderwood", terrain: "forest", mood: "timber + spirits", d: "M232 180 L304 238 L302 342 L206 391 L127 314 L153 226 Z", cx: 232, cy: 293 },
  { id: "greenvale", name: "Greenvale", terrain: "plains", mood: "food + growth", d: "M304 238 L431 229 L479 325 L408 413 L302 342 Z", cx: 383, cy: 317 },
  { id: "riverbend", name: "Riverbend", terrain: "river", mood: "water + travel", d: "M431 229 L566 246 L610 307 L553 408 L479 325 Z", cx: 520, cy: 309 },
  { id: "copperfield", name: "Copperfield", terrain: "plains", mood: "grain + ore", d: "M302 342 L408 413 L381 511 L242 513 L206 391 Z", cx: 310, cy: 430 },
  { id: "oldford", name: "Oldford", terrain: "road", mood: "crossing + trade", d: "M408 413 L553 408 L587 506 L473 594 L381 511 Z", cx: 480, cy: 489 },
  { id: "sunmeadow", name: "Sunmeadow", terrain: "plains", mood: "food + morale", d: "M553 408 L735 346 L800 456 L722 557 L587 506 Z", cx: 666, cy: 457 },
  { id: "saltmere", name: "Saltmere", terrain: "coast", mood: "coast + risk", d: "M735 346 L844 331 L910 425 L879 554 L800 456 Z", cx: 823, cy: 424 },
  { id: "relicfen", name: "Relicfen", terrain: "ruins", mood: "relics + unrest", d: "M381 511 L473 594 L430 662 L284 642 L242 513 Z", cx: 369, cy: 592 },
  { id: "mistmarsh", name: "Mistmarsh", terrain: "marsh", mood: "herbs + danger", d: "M473 594 L587 506 L722 557 L681 668 L430 662 Z", cx: 570, cy: 604 },
  { id: "goldcoast", name: "Goldcoast", terrain: "coast", mood: "trade + wealth", d: "M722 557 L879 554 L841 657 L681 668 Z", cx: 774, cy: 612 },
];

const views: { id: View; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "orders", label: "Orders" },
  { id: "settlement", label: "Settlement" },
  { id: "nation", label: "Nation" },
  { id: "empire", label: "Empire" },
];

const terrainFill: Record<Terrain, string> = {
  plains: "#caa85c",
  forest: "#3f7a45",
  hills: "#867155",
  coast: "#b98d58",
  ruins: "#8b7a6a",
  river: "#5eaa9d",
  marsh: "#667b56",
  road: "#ad8b52",
};

export default function PlayPrototypePage() {
  const [view, setView] = useState<View>("map");
  const [selectedId, setSelectedId] = useState("greenvale");
  const [season, setSeason] = useState(2);
  const [owned, setOwned] = useState(["greenvale"]);
  const selected = useMemo(() => regions.find((region) => region.id === selectedId) ?? regions[0], [selectedId]);
  const charterProgress = Math.min(100, Math.round((owned.length / 6) * 100));

  function issueOrder(order: "expand" | "develop" | "secure") {
    setSeason((current) => Math.min(12, current + 1));
    if (order === "expand") {
      const next = regions.find((region) => !owned.includes(region.id));
      if (next) setOwned((current) => [...current, next.id]);
    }
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#0c1411] text-[#f7ead2]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,.22),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(56,189,248,.16),transparent_30%),linear-gradient(180deg,#12251f_0%,#09100e_100%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />

      <section className="relative z-10 grid h-full grid-rows-[auto_1fr_auto] p-3 md:p-6">
        <header className="flex items-center justify-between rounded-3xl border border-amber-200/20 bg-black/35 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-amber-200/70">Pixel Nations / Sector A-01</p>
            <h1 className="text-xl font-black tracking-tight md:text-3xl">Aurelian Basin</h1>
          </div>
          <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/60">First Age</p>
            <p className="text-2xl font-black">{season}/12</p>
          </div>
        </header>

        <div className="relative my-3 min-h-0 overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[#1d2d23] shadow-[0_30px_90px_rgba(0,0,0,.45)]">
          <svg viewBox="0 0 1000 720" className="absolute inset-0 h-full w-full" role="img" aria-label="Aurelian Basin regional strategy map">
            <defs>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity="0.42" />
              </filter>
              <linearGradient id="sea" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#17384a" />
                <stop offset="100%" stopColor="#0f596a" />
              </linearGradient>
            </defs>
            <rect width="1000" height="720" fill="url(#sea)" />
            <path d="M0 515 C 118 458 180 517 266 489 C 388 449 480 478 596 444 C 750 399 848 452 1000 382 L1000 720 L0 720 Z" fill="#0b5264" opacity="0.8" />
            <path d="M111 202 C 171 90 306 51 451 73 C 576 92 672 116 780 188 C 916 279 947 442 882 572 C 819 699 642 710 484 694 C 330 678 186 696 104 592 C 18 482 51 314 111 202 Z" fill="#a78a4d" filter="url(#softShadow)" opacity="0.72" />

            {regions.map((region) => {
              const active = region.id === selectedId;
              const isOwned = owned.includes(region.id);
              return (
                <g key={region.id} onClick={() => setSelectedId(region.id)} className="cursor-pointer">
                  <path d={region.d} fill={terrainFill[region.terrain]} opacity={active ? 1 : 0.92} stroke={active ? "#fff2ad" : "#382a1a"} strokeWidth={active ? 6 : 3} />
                  {isOwned && <path d={region.d} fill="#f8d36d" opacity="0.2" stroke="#ffe39a" strokeWidth="7" />}
                  <circle cx={region.cx} cy={region.cy - 16} r={isOwned ? 12 : 8} fill={isOwned ? "#214c2f" : "#6c5432"} stroke="#fff2ad" strokeWidth="2" />
                  <text x={region.cx} y={region.cy + 12} textAnchor="middle" fontSize="20" fontWeight="800" fill="#24180d" stroke="#f7ead2" strokeWidth="3" paintOrder="stroke">
                    {region.name}
                  </text>
                </g>
              );
            })}

            <path d="M456 86 C 439 174 511 243 487 340 C 463 435 394 482 420 666" fill="none" stroke="#65d8ff" strokeWidth="20" strokeLinecap="round" opacity="0.68" />
            <path d="M488 91 C 468 176 539 242 517 345 C 493 441 425 490 452 665" fill="none" stroke="#d4f8ff" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
            <path d="M598 150 L632 78 L672 164 L704 104 L754 218 Z" fill="#6b5d4f" />
            <path d="M608 145 L632 78 L657 145 Z M690 150 L704 104 L732 200 Z" fill="#f8eed9" opacity="0.78" />
            <path d="M211 282 q33 -62 76 0 q-42 -22 -76 0Z M249 323 q36 -72 86 0 q-44 -26 -86 0Z M167 367 q41 -80 94 0 q-48 -28 -94 0Z" fill="#1f6b42" opacity="0.9" />
            <path d="M540 587 l30 -55 l33 55 l-31 38Z M589 592 l28 -49 l31 49 l-29 34Z" fill="#7b664f" opacity="0.9" />
            <path d="M184 474 C 309 416 499 414 782 508" fill="none" stroke="#3b2d1d" strokeWidth="8" strokeDasharray="14 16" opacity="0.42" />
          </svg>

          <div className="absolute left-4 top-4 max-w-[275px] rounded-3xl border border-amber-100/20 bg-black/38 p-4 backdrop-blur-md md:left-6 md:top-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/70">Selected land</p>
            <h2 className="mt-1 text-2xl font-black">{selected.name}</h2>
            <p className="mt-1 text-sm text-amber-50/75">{selected.terrain} - {selected.mood}</p>
            <button onClick={() => setOwned((current) => current.includes(selected.id) ? current : [...current, selected.id])} className="mt-3 rounded-2xl bg-amber-300 px-4 py-2 text-sm font-black text-stone-950 shadow-lg shadow-black/30">
              {owned.includes(selected.id) ? "Owned territory" : "Claim this land"}
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-amber-100/20 bg-black/45 p-3 backdrop-blur-md md:bottom-6 md:left-auto md:right-6 md:w-[370px]">
            {view === "map" && <Panel title="World Map" body={`Aurelian Basin now has ${regions.length} visible regions. The target is 10,000 lands later; this prototype proves the fullscreen map shell first.`} />}
            {view === "orders" && (
              <div>
                <Panel title="Season Orders" body="Issue one order. The map changes immediately and the First Age advances." />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <OrderButton label="Expand" onClick={() => issueOrder("expand")} />
                  <OrderButton label="Develop" onClick={() => issueOrder("develop")} />
                  <OrderButton label="Secure" onClick={() => issueOrder("secure")} />
                </div>
              </div>
            )}
            {view === "settlement" && <Panel title="Settlement Layer" body="Population, food, materials and town growth live as a drawer over the same map. The player never leaves the world." />}
            {view === "nation" && <Panel title="Nation Layer" body={`Charter progress ${charterProgress}%. Six lands, core level three and stable rule unlock nationhood.`} />}
            {view === "empire" && <Panel title="Empire Layer" body="Locked for later. The promise is visible now, but the demo stays simple: one basin, one founder, one age." />}
          </div>
        </div>

        <nav className="grid grid-cols-5 gap-2 rounded-3xl border border-amber-200/20 bg-black/40 p-2 backdrop-blur-md">
          {views.map((item) => (
            <button key={item.id} onClick={() => setView(item.id)} className={`rounded-2xl px-2 py-3 text-xs font-black uppercase tracking-wide transition md:text-sm ${view === item.id ? "bg-amber-300 text-stone-950" : "bg-white/5 text-amber-50/70"}`}>
              {item.label}
            </button>
          ))}
        </nav>
      </section>
    </main>
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

function OrderButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-amber-100/20 bg-amber-100/10 px-2 py-3 text-xs font-black text-amber-50 hover:bg-amber-300 hover:text-stone-950">
      {label}
    </button>
  );
}
