"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { DEFAULT_SETTLEMENT_STATE, readSettlementState, type SettlementState } from "../lib/settlement-state";

const FALLBACK = {
  nationName: "The Aurelian Crown",
  settlementName: "Aurelia Prime",
  region: "Aurelia",
  ideology: "Crown Rule",
  tradeRouteDestination: "Iron Coast",
  allianceName: "Aurelian Pact",
};

export default function NationPage() {
  const [state, setState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);

  useEffect(() => {
    setState(readSettlementState());
  }, []);

  const nation = useMemo(
    () => ({
      nationName: state.nationName || FALLBACK.nationName,
      settlementName: state.settlementName || FALLBACK.settlementName,
      region: state.region || FALLBACK.region,
      ideology: state.nationIdeology || FALLBACK.ideology,
      tradeRouteDestination: state.tradeRouteDestination || FALLBACK.tradeRouteDestination,
      allianceName: state.allianceName || FALLBACK.allianceName,
      population: state.population > 0 ? state.population : 250,
      influence: state.influence > 0 ? state.influence : 45,
      landsControlled: state.landsControlled > 0 ? state.landsControlled : 5,
      politicalStatus: state.politicalStatus || "Nation Founder",
    }),
    [state],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] px-6 py-12 text-white sm:px-10 sm:py-16">
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
            First Nation
          </p>
          <h1 className="mt-7 font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.02] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            {nation.nationName}
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            &quot;The first banner of Aurelia has been raised.&quot;
          </p>

          <div className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Founder", "You"],
              ["Capital", nation.settlementName],
              ["Region", nation.region],
              ["Ideology", nation.ideology],
              ["Status", "Founded"],
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

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          className="mt-10 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            ["Population", String(nation.population)],
            ["Influence", String(nation.influence)],
            ["Lands Controlled", String(nation.landsControlled)],
            ["Cities", "1"],
          ].map(([label, value]) => (
            <article key={label} className="bg-[#08080f]/95 p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</p>
              <p className="mt-3 break-words font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight text-amber-100 sm:text-3xl md:text-4xl">
                {value}
              </p>
            </article>
          ))}
        </motion.section>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
            className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Government</p>
            <div className="mt-7 space-y-5 border-b border-amber-500/10 pb-6">
              {[
                ["Political Status", nation.politicalStatus],
                ["Capital", nation.settlementName],
                ["Founding Alliance", nation.allianceName],
                ["Ideology", nation.ideology],
                ["Next Objective", "Expand Borders"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-5">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{label}</span>
                  <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-200">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled
              className="mt-9 cursor-not-allowed rounded border border-zinc-800 bg-[#08080f]/70 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-500"
            >
              Expansion Coming Soon
            </button>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
            className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">History</p>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-zinc-300">
              <li className="border-l border-amber-500/25 pl-4">Land claimed by You</li>
              <li className="border-l border-amber-500/25 pl-4">Founder Badge earned</li>
              <li className="border-l border-amber-500/25 pl-4">{nation.settlementName} founded</li>
              <li className="border-l border-amber-500/25 pl-4">Town Hall built</li>
              <li className="border-l border-amber-500/25 pl-4">
                Trade route established with {nation.tradeRouteDestination}
              </li>
              <li className="border-l border-amber-500/25 pl-4">
                Regional alliance formed: {nation.allianceName}
              </li>
              <li className="border-l border-amber-500/25 pl-4">Nation founded: {nation.nationName}</li>
            </ul>
          </motion.aside>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26, ease: "easeOut" }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/dashboard"
            className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 sm:inline-flex sm:items-center sm:justify-center"
          >
            Back To Dashboard
          </Link>
          <Link
            href="/settlement"
            className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 sm:inline-flex sm:items-center sm:justify-center"
          >
            View Settlement
          </Link>
          <Link
            href="/"
            className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100 sm:inline-flex sm:items-center sm:justify-center"
          >
            View World
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
