"use client";

import { useMemo, useState } from "react";

type View = "map" | "orders" | "settlement" | "nation" | "empire";
type Region = {
  id: string;
  name: string;
  terrain: string;
  mood: string;
  x: number;
  y: number;
};

const regions: Region[] = [
  { id: "greenvale", name: "Greenvale", terrain: "Plains", mood: "food + growth", x: 34, y: 49 },
  { id: "pinewatch", name: "Pinewatch", terrain: "Forest", mood: "wood + cover", x: 47, y: 35 },
  { id: "stonefall", name: "Stonefall", terrain: "Hills", mood: "stone + defense", x: 63, y: 42 },
  { id: "saltmere", name: "Saltmere", terrain: "Coast", mood: "trade + risk", x: 68, y: 63 },
  { id: "relicfen", name: "Relicfen", terrain: "Ruins", mood: "relics + unrest", x: 43, y: 67 },
];

const views: { id: View; label: string }[] = [
  { id: "map", label: "Map" },
  { id: "orders", label: "Orders" },
  { id: "settlement", label: "Settlement" },
  { id: "nation", label: "Nation" },
  { id: "empire", label: "Empire" },
];

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
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />

      <section className="relative z-10 grid h-full grid-rows-[auto_1fr_auto] p-3 md:p-6">
        <header className="flex items-center justify-between rounded-3xl border border-amber-200/20 bg-black/35 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-amber-200/70">Pixel Nations / Aurelian Basin</p>
            <h1 className="text-xl font-black tracking-tight md:text-3xl">The First Age</h1>
          </div>
          <div className="rounded-2xl border border-amber-200/20 bg-amber-100/10 px-3 py-2 text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/60">Season</p>
            <p className="text-2xl font-black">{season}/12</p>
          </div>
        </header>

        <div className="relative my-3 min-h-0 overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[#1d2d23] shadow-[0_30px_90px_rgba(0,0,0,.45)]">
          <svg viewBox="0 0 1000 720" className="absolute inset-0 h-full w-full" role="img" aria-label="Illustrated Aurelian Basin strategy map">
            <defs>
              <linearGradient id="land" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#8fbf6f" />
                <stop offset="48%" stopColor="#d6b15e" />
                <stop offset="100%" stopColor="#6c8e58" />
              </linearGradient>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000" floodOpacity="0.42" />
              </filter>
            </defs>
            <rect width="1000" height="720" fill="#183447" />
            <path d="M0 520 C 100 470 165 520 250 492 C 370 452 470 485 585 450 C 735 403 845 452 1000 390 L1000 720 L0 720 Z" fill="#0f5567" opacity="0.72" />
            <path d="M155 119 C 250 61 371 92 463 126 C 568 165 654 139 750 202 C 842 263 821 390 760 476 C 687 579 545 606 421 578 C 331 558 244 604 171 540 C 91 471 83 358 113 263 C 130 207 105 153 155 119 Z" fill="url(#land)" filter="url(#softShadow)" />
            <path d="M484 126 C 465 205 513 257 493 337 C 469 430 403 464 421 578" fill="none" stroke="#5ad7ff" strokeWidth="18" strokeLinecap="round" opacity="0.72" />
            <path d="M510 134 C 493 208 541 259 520 344 C 497 431 432 472 450 563" fill="none" stroke="#c9f5ff" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
            <path d="M603 186 L632 122 L666 196 L694 139 L730 221 Z" fill="#73614e" />
            <path d="M612 181 L632 122 L653 181 Z M682 176 L694 139 L713 202 Z" fill="#f8eed9" opacity="0.72" />
            <path d="M255 245 q33 -62 76 0 q-42 -22 -76 0Z M291 278 q35 -74 85 0 q-43 -24 -85 0Z M213 313 q39 -77 90 0 q-45 -28 -90 0Z" fill="#1f6b42" />
            <path d="M604 520 l30 -52 l31 52 l-30 35Z" fill="#836b4d" />
            <path d="M592 530 q43 -36 90 0" fill="none" stroke="#f5d78b" strokeWidth="9" strokeDasharray="12 14" opacity="0.75" />
            <path d="M309 494 C 394 438 509 429 626 455" fill="none" stroke="#3b2d1d" strokeWidth="8" strokeDasharray="12 15" opacity="0.36" />
            {regions.map((region) => {
              const active = region.id === selectedId;
              const isOwned = owned.includes(region.id);
              return (
                <g key={region.id} transform={`translate(${region.x * 10} ${region.y * 7.2})`} onClick={() => setSelectedId(region.id)} className="cursor-pointer">
                  <circle r={active ? 42 : 32} fill={isOwned ? "#f8d36d" : "#efe1b3"} opacity={active ? 0.95 : 0.75} stroke={isOwned ? "#fff4c4" : "#5b452b"} strokeWidth={active ? 6 : 3} />
                  <circle r={isOwned ? 13 : 9} fill={isOwned ? "#214c2f" : "#7b6544"} />
                  {isOwned && <path d="M-52 -50 C -10 -76 46 -66 64 -19 C 79 23 32 65 -20 60 C -67 55 -87 -15 -52 -50 Z" fill="none" stroke="#ffe39a" strokeWidth="6" opacity="0.75" />}
                </g>
              );
            })}
          </svg>

          <div className="absolute left-4 top-4 max-w-[260px] rounded-3xl border border-amber-100/20 bg-black/35 p-4 backdrop-blur-md md:left-6 md:top-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/70">Selected land</p>
            <h2 className="mt-1 text-2xl font-black">{selected.name}</h2>
            <p className="mt-1 text-sm text-amber-50/75">{selected.terrain} - {selected.mood}</p>
            <button onClick={() => setOwned((current) => current.includes(selected.id) ? current : [...current, selected.id])} className="mt-3 rounded-2xl bg-amber-300 px-4 py-2 text-sm font-black text-stone-950 shadow-lg shadow-black/30">
              {owned.includes(selected.id) ? "Owned territory" : "Claim this land"}
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-amber-100/20 bg-black/45 p-3 backdrop-blur-md md:bottom-6 md:left-auto md:right-6 md:w-[360px]">
            {view === "map" && <Panel title="World Map" body="Read terrain, claim neighboring lands, and watch one land become a nation. This is the main game surface, not a dashboard page." />}
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
