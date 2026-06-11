"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_SETTLEMENT_STATE,
  type SettlementState,
  readSettlementState,
  writeSettlementState,
} from "../../lib/settlement-state";

type ExpansionLand = {
  id: string;
  name: string;
  type: string;
  bonus: string;
  distance: string;
};

const LANDS: ExpansionLand[] = [
  { id: "north-road", name: "North Road", type: "Trade Corridor", bonus: "+ Trade Reach", distance: "Near" },
  { id: "iron-ridge", name: "Iron Ridge", type: "Resource Land", bonus: "+ Iron Supply", distance: "Near" },
  {
    id: "amber-fields",
    name: "Amber Fields",
    type: "Food Land",
    bonus: "+ Population Growth",
    distance: "Medium",
  },
  { id: "crown-pass", name: "Crown Pass", type: "Strategic Pass", bonus: "+ Defense", distance: "Medium" },
  { id: "eastwatch", name: "Eastwatch", type: "Border Outpost", bonus: "+ Influence", distance: "Far" },
  { id: "old-ruins", name: "Old Ruins", type: "Historic Site", bonus: "+ Legacy", distance: "Far" },
];

function normalizeLandIds(names: string[]) {
  const ids = names
    .map((name) => LANDS.find((land) => land.name === name)?.id)
    .filter((value): value is string => Boolean(value));
  return ids.length > 0 ? ids.slice(0, 3) : ["north-road", "iron-ridge"];
}

export default function ExpansionCreatePage() {
  const [state, setState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);
  const [selectedLandIds, setSelectedLandIds] = useState<string[]>(["north-road", "iron-ridge"]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const next = readSettlementState();
    setState(next);
    if (next.expandedLands.length > 0) {
      setSelectedLandIds(normalizeLandIds(next.expandedLands));
    }
    if (next.bordersExpanded) setIsExpanded(true);
  }, []);

  const nationName = state.nationName || "The Aurelian Crown";
  const settlementName = state.settlementName || "Aurelia Prime";
  const selectedLands = useMemo(
    () => selectedLandIds.map((id) => LANDS.find((land) => land.id === id)?.name).filter((v): v is string => Boolean(v)),
    [selectedLandIds],
  );

  const toggleLand = (landId: string) => {
    setSelectedLandIds((current) => {
      if (current.includes(landId)) {
        if (current.length === 1) return current;
        return current.filter((id) => id !== landId);
      }
      if (current.length >= 3) return current;
      return [...current, landId];
    });
  };

  const confirmExpansion = () => {
    if (isExpanded) return;

    const nextState: SettlementState = {
      ...state,
      settlementFounded: true,
      settlementName,
      region: state.region || "Aurelia",
      coordinates: state.coordinates || "X19 / Y12",
      founder: state.founder || "You",
      townHallBuilt: true,
      tradeRouteEstablished: true,
      tradeRouteDestination: state.tradeRouteDestination || "Iron Coast",
      tradeRoutes: 1,
      regionalAllianceFormed: true,
      allianceName: state.allianceName || "Aurelian Pact",
      alliancePartners: state.alliancePartners.length > 0 ? state.alliancePartners : ["Iron Coast"],
      nationFounded: true,
      nationName,
      nationIdeology: state.nationIdeology || "Crown Rule",
      landsControlled: 8,
      population: 340,
      influence: 60,
      settlementLevel: "Capital City",
      politicalStatus: "Expanding Nation",
      bordersExpanded: true,
      expandedLands: selectedLands,
    };

    setState(nextState);
    writeSettlementState(nextState);
    setIsExpanded(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-14 text-white sm:px-10 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,98,0.09)_0%,transparent_60%)]"
      />
      <div className="relative mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="border-b border-amber-500/15 pb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">Border Expansion</p>
          <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.05] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            Choose the first lands of your nation.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            A nation becomes real when its borders reach beyond the capital.
          </p>

          <div className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Nation", nationName],
              ["Capital", settlementName],
              ["Region", state.region || "Aurelia"],
              ["Current Lands", String(state.landsControlled > 0 ? state.landsControlled : 5)],
              ["Influence", String(state.influence > 0 ? state.influence : 45)],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#08080f]/95 p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</p>
                <p className="mt-2 break-words font-[family-name:var(--font-syne)] text-base font-bold text-amber-100">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.section
              key="expansion-success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10"
            >
              <h2 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                Borders Expanded
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                {nationName} now controls its first frontier beyond the capital.
              </p>

              <div className="mt-8 border-y border-amber-500/10 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">
                  Unlocked Benefits
                </p>
                <ul className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  {["Border Control", "Regional Presence", "Strategic Lands", "Empire Path Unlocked"].map((benefit) => (
                    <li key={benefit} className="border-l border-amber-500/25 pl-4">
                      <span className="mr-2 text-amber-300">{"\u2713"}</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/nation"
                className="btn-primary mt-8 inline-flex rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
              >
                Return To Nation
              </Link>
            </motion.section>
          ) : (
            <motion.div
              key="expansion-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
            >
              <section className="border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Land Selection</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  Selected Lands: {selectedLandIds.length} / 3
                </p>

                <div className="mt-5 grid gap-3">
                  {LANDS.map((land) => {
                    const isSelected = selectedLandIds.includes(land.id);
                    return (
                      <button
                        key={land.id}
                        type="button"
                        onClick={() => toggleLand(land.id)}
                        className={`border p-4 text-left transition-colors sm:p-5 ${
                          isSelected
                            ? "border-amber-400/65 bg-amber-500/10"
                            : "border-amber-500/15 bg-[#08080f]/90 hover:border-amber-500/35"
                        }`}
                      >
                        <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-amber-100">
                          {land.name}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Type: {land.type}</p>
                        <p className="mt-2 text-sm text-zinc-300">Bonus: {land.bonus}</p>
                        <p className="mt-1 text-sm text-zinc-400">Distance: {land.distance}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <aside className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Expansion Preview</p>
                <div className="mt-6 space-y-5 border-b border-amber-500/10 pb-6">
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Expansion</span>
                    <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                      {nationName} Border Expansion
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Selected Lands</span>
                    <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-200">
                      {selectedLands.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Expected Gain</p>
                  <p className="text-sm text-zinc-300">Controlled Lands: +3</p>
                  <p className="text-sm text-zinc-300">Population: +90</p>
                  <p className="text-sm text-zinc-300">Influence: +15</p>
                  <p className="text-sm text-zinc-300">Political Status: Expanding Nation</p>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={confirmExpansion}
                    className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                  >
                    Confirm Expansion
                  </button>
                  <Link
                    href="/nation"
                    className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300"
                  >
                    Back To Nation
                  </Link>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
