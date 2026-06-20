"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import {
  formatLandClaimHistory,
  getClaimedLandDisplay,
  getEmpireHeroQuote,
} from "../lib/claimed-land";
import { getContinuitySummary } from "../lib/continuity";
import { DEFAULT_SETTLEMENT_STATE, readSettlementState, type SettlementState } from "../lib/settlement-state";

const FALLBACK = {
  empireName: "Aurelian Empire",
  settlementName: "Aurelia Prime",
  nationName: "The Aurelian Crown",
  empireDirection: "Crown Empire",
  empireDirectionBonus: "+ Imperial Legitimacy",
  empireDirectionIdentity:
    "The empire expands through law, banners, ceremonies, and controlled succession of power.",
  imperialReach: "Lawful authority across the first imperial provinces",
  allianceName: "Aurelian Pact",
  tradeRouteDestination: "Iron Coast",
  expandedLands: ["North Road", "Iron Ridge", "Amber Fields"],
};

export default function EmpirePage() {
  const [state, setState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);

  useEffect(() => {
    setState(readSettlementState());
  }, []);

  const claimedLand = useMemo(() => getClaimedLandDisplay(state), [state]);
  const continuity = useMemo(() => getContinuitySummary(state), [state]);

  const empire = useMemo(
    () => ({
      empireName: state.empireName || FALLBACK.empireName,
      settlementName: state.settlementName || FALLBACK.settlementName,
      nationName: state.nationName || FALLBACK.nationName,
      direction: state.empireDirection || state.empireDoctrine || FALLBACK.empireDirection,
      directionBonus: state.empireDirectionBonus || FALLBACK.empireDirectionBonus,
      directionIdentity: state.empireDirectionIdentity || FALLBACK.empireDirectionIdentity,
      imperialReach: state.imperialReach || FALLBACK.imperialReach,
      allianceName: state.allianceName || FALLBACK.allianceName,
      tradeRouteDestination: state.tradeRouteDestination || FALLBACK.tradeRouteDestination,
      expandedLands: state.expandedLands.length > 0 ? state.expandedLands : FALLBACK.expandedLands,
      settlementFocus: state.settlementFocus || "Balanced Charter",
      tradeRouteIdentity: state.tradeRouteIdentity || "The first route connected the capital to the wider world.",
      allianceStrategy: state.allianceStrategy || "Regional Support",
      nationIdeology: state.nationIdeology || "Crown Rule",
      nationDoctrine: state.nationDoctrine || "Civic Mandate",
      population: state.population > 0 ? state.population : 600,
      influence: state.influence > 0 ? state.influence : 100,
      landsControlled: state.landsControlled > 0 ? state.landsControlled : 15,
      cities: state.cities > 0 ? state.cities : 3,
      politicalStatus: state.politicalStatus || "Empire Founder",
      region: state.region || "Aurelia",
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
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">First Empire</p>
          <h1 className="mt-7 break-words font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.02] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            {empire.empireName}
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            {getEmpireHeroQuote(state.claimedLandName ? claimedLand.landName : "")}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-amber-200/70">
            First demo arc complete: land -&gt; settlement -&gt; nation -&gt; empire.
          </p>

          <div className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Founder", "You"],
              ["Capital", empire.settlementName],
              ["Origin Land", claimedLand.landName],
              ["Origin Nation", empire.nationName],
              ["Imperial Direction", empire.direction],
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
            ["Population", String(empire.population)],
            ["World Influence", String(empire.influence)],
            ["Lands Controlled", String(empire.landsControlled)],
            ["Cities", String(empire.cities)],
          ].map(([label, value]) => (
            <article key={label} className="bg-[#08080f]/95 p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</p>
              <p className="mt-3 break-words font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight text-amber-100 sm:text-3xl md:text-4xl">
                {value}
              </p>
            </article>
          ))}
        </motion.section>

        <motion.section
          data-qa="continuity-path-memory"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.11, ease: "easeOut" }}
          className="mt-10 border border-amber-500/20 bg-[#06060c]/88 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Continuity Verdict</p>
          <h2 className="mt-4 font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight text-amber-100 sm:text-3xl">
            {continuity.trait}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">{continuity.meaning}</p>
          <ol className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {continuity.pathSteps.map((step) => (
              <li
                key={step.id}
                className={
                  step.active
                    ? "border border-amber-400/25 bg-amber-400/[0.07] p-3"
                    : "border border-zinc-800 bg-[#08080f]/60 p-3"
                }
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">{step.label}</p>
                <p className={step.active ? "mt-2 text-xs font-bold text-amber-100" : "mt-2 text-xs text-zinc-500"}>
                  {step.value}
                </p>
              </li>
            ))}
          </ol>
        </motion.section>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
            className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Imperial Command</p>
            <div className="mt-7 space-y-5 border-b border-amber-500/10 pb-6">
              {[
                ["Political Status", empire.politicalStatus],
                ["Capital", empire.settlementName],
                ["Origin Nation", empire.nationName],
                ["Imperial Direction", empire.direction],
                ["Direction Bonus", empire.directionBonus],
                ["Imperial Reach", empire.imperialReach],
                ["Next Objective", "First Arc Complete"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-5">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{label}</span>
                  <span className="break-words text-right font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-200">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-7 border-l border-amber-500/25 pl-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Imperial Identity</p>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{empire.directionIdentity}</p>
            </div>
            <button
              type="button"
              disabled
              className="mt-9 cursor-not-allowed rounded border border-zinc-800 bg-[#08080f]/70 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-500"
            >
              Deeper World Layers Later
            </button>
            <p className="mt-4 max-w-md text-xs leading-6 text-zinc-500">
              Expansion, diplomacy, economy, and alliance systems can deepen the world after this first playable arc.
            </p>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
            className="space-y-6"
          >
            <section className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Empire Holdings</p>
              <div className="mt-6 space-y-5">
                {[
                  ["Controlled Lands", String(empire.landsControlled)],
                  ["Cities", String(empire.cities)],
                  ["Capital", empire.settlementName],
                  ["Imperial Reach", empire.imperialReach],
                  ["Victory Status", empire.politicalStatus],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-5 border-b border-amber-500/10 pb-4 last:border-b-0 last:pb-0">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{label}</span>
                    <span className="break-words text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                Why This Empire Works
              </p>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-zinc-300">
                {[
                  `Origin: ${claimedLand.landName} in ${claimedLand.region}`,
                  `Settlement focus: ${empire.settlementFocus}`,
                  `Trade route: ${empire.tradeRouteDestination} - ${empire.tradeRouteIdentity}`,
                  `Alliance: ${empire.allianceName} through ${empire.allianceStrategy}`,
                  `Nation ideology: ${empire.nationIdeology}`,
                  `Governing doctrine: ${empire.nationDoctrine}`,
                  `Imperial direction: ${empire.direction}`,
                ].map((line) => (
                  <li key={line} className="border-l border-amber-500/25 pl-4">
                    {line}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">History</p>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-zinc-300">
                <li className="border-l border-amber-500/25 pl-4">{formatLandClaimHistory(state)}</li>
                <li className="border-l border-amber-500/25 pl-4">Founder Badge earned</li>
                <li className="border-l border-amber-500/25 pl-4">{empire.settlementName} founded</li>
                <li className="border-l border-amber-500/25 pl-4">Town Hall built</li>
                <li className="border-l border-amber-500/25 pl-4">
                  Trade route established with {empire.tradeRouteDestination}
                </li>
                <li className="border-l border-amber-500/25 pl-4">
                  Regional alliance formed: {empire.allianceName}
                </li>
                <li className="border-l border-amber-500/25 pl-4">Nation founded: {empire.nationName}</li>
                <li className="border-l border-amber-500/25 pl-4">
                  Borders expanded: {empire.expandedLands.join(", ")}
                </li>
                <li className="border-l border-amber-500/25 pl-4">
                  Empire created: {empire.empireName} as a {empire.direction}
                </li>
              </ul>
            </section>
          </motion.aside>
        </div>

        <motion.section
          data-qa="end-demo-feedback"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24, ease: "easeOut" }}
          className="mt-10 border border-amber-500/25 bg-amber-500/[0.045] p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
            Demo Complete
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
            One land became an empire.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            You reached the end of the first playable Pixel Nations arc. Tell us what felt exciting,
            confusing, or missing before the world grows deeper.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:tomat6@gmail.com?subject=Pixel%20Nations%20demo%20feedback&body=I%20played%20the%20Pixel%20Nations%20demo.%0A%0AWhat%20felt%20exciting%3A%0A%0AWhat%20was%20confusing%3A%0A%0AWhat%20I%20would%20like%20next%3A%0A"
              className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
            >
              Send Feedback
            </a>
            <Link
              href="/world"
              className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300"
            >
              Revisit World
            </Link>
          </div>
        </motion.section>

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
            href="/nation"
            className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 sm:inline-flex sm:items-center sm:justify-center"
          >
            View Nation
          </Link>
          <Link
            href="/settlement"
            className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300 sm:inline-flex sm:items-center sm:justify-center"
          >
            View Settlement
          </Link>
          <Link
            href="/world"
            className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100 sm:inline-flex sm:items-center sm:justify-center"
          >
            View World
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
