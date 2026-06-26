"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import {
  establishTradeRouteFromRoute,
  type TradeRouteCreationDestination,
} from "../../lib/game-state";
import {
  DEFAULT_SETTLEMENT_STATE,
  type SettlementState,
  readSettlementState,
  writeSettlementState,
} from "../../lib/settlement-state";

type Destination = TradeRouteCreationDestination & {
  type: string;
  distance: string;
};

const DESTINATIONS: Destination[] = [
  {
    id: "iron-coast",
    name: "Iron Coast",
    type: "Mining Outpost",
    bonus: "+ Iron Flow",
    distance: "Near",
    resourceFlow: "Iron +15",
    population: 96,
    influence: 14,
    settlementLevel: "Iron Route City",
    identity: "Iron Coast gives the city durable material flow and a stronger industrial base.",
  },
  {
    id: "ember-basin",
    name: "Ember Basin",
    type: "Frontier Market",
    bonus: "+ Food Exchange",
    distance: "Medium",
    resourceFlow: "Food +40",
    population: 116,
    influence: 12,
    settlementLevel: "Market Route City",
    identity: "Ember Basin feeds population growth and turns the settlement into a frontier market.",
  },
  {
    id: "crownlands",
    name: "Crownlands",
    type: "Royal Crossroad",
    bonus: "+ Influence",
    distance: "Far",
    resourceFlow: "Influence +3",
    population: 92,
    influence: 17,
    settlementLevel: "Crown Route City",
    identity: "Crownlands strengthens legitimacy and makes the city politically visible.",
  },
];

function normalizeDestination(destinationName: string) {
  return DESTINATIONS.find((destination) => destination.name === destinationName) ?? DESTINATIONS[0];
}

export default function TradeCreatePage() {
  const [settlementState, setSettlementState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);
  const [selectedDestinationId, setSelectedDestinationId] = useState(DESTINATIONS[0].id);
  const [isRouteEstablished, setIsRouteEstablished] = useState(false);

  useEffect(() => {
    const state = readSettlementState();
    setSettlementState(state);
    const selected = DESTINATIONS.find((destination) => destination.id === state.tradeRouteId) ?? normalizeDestination(state.tradeRouteDestination);
    setSelectedDestinationId(selected.id);
    setIsRouteEstablished(state.tradeRouteEstablished);
  }, []);

  const selectedDestination = useMemo(
    () => DESTINATIONS.find((destination) => destination.id === selectedDestinationId) ?? DESTINATIONS[0],
    [selectedDestinationId],
  );

  const settlementName = settlementState.settlementName || "Aurelia Prime";
  const region = settlementState.region || "Aurelia";
  const currentLevel = settlementState.settlementLevel || "City Seed";

  const confirmTradeRoute = () => {
    if (isRouteEstablished) return;

    const nextState = establishTradeRouteFromRoute(settlementState, selectedDestination);

    setSettlementState(nextState);
    writeSettlementState(nextState);
    setIsRouteEstablished(true);
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
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
            Trade Route
          </p>
          <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.05] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            Open your first trade route.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            Cities grow when roads begin to move resources.
          </p>

          <div className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-3">
            {[
              ["Origin Settlement", settlementName],
              ["Region", region],
              ["Current Level", currentLevel],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#08080f]/95 p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</p>
                <p className="mt-2 font-[family-name:var(--font-syne)] text-base font-bold text-amber-100">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {isRouteEstablished ? (
            <motion.section
              key="trade-success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10"
            >
              <h2 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                First Trade Route Established
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                {settlementName} is now connected to {selectedDestination.name}.
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-amber-200/70">
                {selectedDestination.identity}
              </p>

              <div className="mt-8 border-y border-amber-500/10 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">
                  Unlocked Benefits
                </p>
                <ul className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  {["Regional Trade", selectedDestination.resourceFlow, selectedDestination.bonus, "Diplomatic Reach"].map((benefit) => (
                    <li key={benefit} className="border-l border-amber-500/25 pl-4">
                      <span className="mr-2 text-amber-300">{"\u2713"}</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/settlement"
                className="btn-primary mt-8 inline-flex rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
              >
                Return To Settlement
              </Link>
            </motion.section>
          ) : (
            <motion.div
              key="trade-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
            >
              <section className="border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Destination Selection
                </p>
                <div className="mt-6 grid gap-3">
                  {DESTINATIONS.map((destination) => {
                    const isSelected = destination.id === selectedDestinationId;
                    return (
                      <button
                        key={destination.id}
                        type="button"
                        onClick={() => setSelectedDestinationId(destination.id)}
                        className={`border p-4 text-left transition-colors sm:p-5 ${
                          isSelected
                            ? "border-amber-400/65 bg-amber-500/10"
                            : "border-amber-500/15 bg-[#08080f]/90 hover:border-amber-500/35"
                        }`}
                      >
                        <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-amber-100">
                          {destination.name}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Type: {destination.type}
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">Bonus: {destination.bonus}</p>
                        <p className="mt-1 text-sm text-zinc-400">Distance: {destination.distance}</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">{destination.identity}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <aside className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Route Preview
                </p>

                <div className="mt-6 space-y-5 border-b border-amber-500/10 pb-6">
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Trade Route</span>
                    <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                      {settlementName} → {selectedDestination.name}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Expected Gain</p>
                  <p className="text-sm text-zinc-300">Population: {selectedDestination.population}</p>
                  <p className="text-sm text-zinc-300">Influence: {selectedDestination.influence}</p>
                  <p className="text-sm text-zinc-300">City Level: {selectedDestination.settlementLevel}</p>
                  <p className="text-sm text-zinc-300">Trade: +1 Route</p>
                  <p className="text-sm text-zinc-300">Resource Flow: {selectedDestination.resourceFlow}</p>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={confirmTradeRoute}
                    className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                  >
                    Confirm Trade Route
                  </button>
                  <Link
                    href="/settlement"
                    className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300"
                  >
                    Back To Settlement
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
