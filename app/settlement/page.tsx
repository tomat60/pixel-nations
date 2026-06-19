"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import {
  formatLandClaimHistory,
  getClaimedLandDisplay,
  getSettlementOriginQuote,
  getTerrainResourceValues,
} from "../lib/claimed-land";
import {
  DEVELOPMENT_ACTIONS,
  applyDevelopmentAction,
  canApplyDevelopmentAction,
  getSettlementDevelopmentState,
  type DevelopmentActionId,
} from "../lib/settlement-development";
import {
  DEFAULT_SETTLEMENT_STATE,
  type SettlementState,
  readSettlementState,
  writeSettlementState,
} from "../lib/settlement-state";

const FALLBACK_SETTLEMENT = {
  settlementName: "Aurelia Prime",
  population: 24,
  influence: 3,
  region: "Aurelia",
  coordinates: "X19 / Y12",
  founder: "You",
  settlementLevel: "Outpost",
  tradeRouteDestination: "Iron Coast",
  allianceName: "Aurelian Pact",
  nationName: "The Aurelian Crown",
  empireName: "Aurelian Empire",
};

const STARTING_RESOURCES = [
  { id: "timber", label: "Timber", value: "120" },
  { id: "stone", label: "Stone", value: "80" },
  { id: "iron", label: "Iron", value: "25" },
  { id: "food", label: "Food", value: "200" },
];

function getTownHallOutcome(focusId?: string) {
  if (focusId === "growth") {
    return {
      population: 92,
      influence: 8,
      settlementLevel: "Growth City Seed",
      identity: "The civic core turns the growth charter into organized expansion.",
    };
  }

  if (focusId === "trade") {
    return {
      population: 76,
      influence: 11,
      settlementLevel: "Market City Seed",
      identity: "The civic core turns the trade charter into coordinated routes and resource flow.",
    };
  }

  if (focusId === "defense") {
    return {
      population: 72,
      influence: 12,
      settlementLevel: "Fortified City Seed",
      identity: "The civic core turns the defense charter into a stable frontier seat.",
    };
  }

  return {
    population: 64,
    influence: 7,
    settlementLevel: "City Seed",
    identity: "The civic core gives the settlement its first organized center of power.",
  };
}

export default function SettlementPage() {
  const [settlementState, setSettlementState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);

  useEffect(() => {
    setSettlementState(readSettlementState());
  }, []);

  const claimedLand = useMemo(() => getClaimedLandDisplay(settlementState), [settlementState]);
  const developmentState = useMemo(() => getSettlementDevelopmentState(settlementState), [settlementState]);

  const displaySettlement = useMemo(
    () => ({
      settlementName: settlementState.settlementName || FALLBACK_SETTLEMENT.settlementName,
      population:
        settlementState.population > 0 ? settlementState.population : FALLBACK_SETTLEMENT.population,
      influence:
        settlementState.influence > 0 ? settlementState.influence : FALLBACK_SETTLEMENT.influence,
      region: settlementState.region || FALLBACK_SETTLEMENT.region,
      coordinates: settlementState.coordinates || FALLBACK_SETTLEMENT.coordinates,
      founder: settlementState.founder || FALLBACK_SETTLEMENT.founder,
      settlementLevel: settlementState.settlementLevel || FALLBACK_SETTLEMENT.settlementLevel,
      settlementFocusId: settlementState.settlementFocusId || "",
      settlementFocus: settlementState.settlementFocus || "Balanced Charter",
      settlementFocusBonus: settlementState.settlementFocusBonus || "Balanced starting growth",
      settlementFocusIdentity:
        settlementState.settlementFocusIdentity ||
        "A flexible settlement keeping growth, trade, and defense open.",
      townHallBuilt: settlementState.townHallBuilt,
      tradeRouteEstablished: settlementState.tradeRouteEstablished,
      tradeRouteDestination:
        settlementState.tradeRouteDestination || FALLBACK_SETTLEMENT.tradeRouteDestination,
      tradeRouteBonus: settlementState.tradeRouteBonus || "",
      tradeRouteResourceFlow: settlementState.tradeRouteResourceFlow || "",
      tradeRouteIdentity: settlementState.tradeRouteIdentity || "",
      regionalAllianceFormed: settlementState.regionalAllianceFormed,
      allianceName: settlementState.allianceName || FALLBACK_SETTLEMENT.allianceName,
      allianceStrategy: settlementState.allianceStrategy || "",
      allianceBonus: settlementState.allianceBonus || "",
      allianceIdentity: settlementState.allianceIdentity || "",
      diplomaticReach: settlementState.diplomaticReach ?? 0,
      nationFounded: settlementState.nationFounded,
      nationName: settlementState.nationName || FALLBACK_SETTLEMENT.nationName,
      landsControlled: settlementState.landsControlled > 0 ? settlementState.landsControlled : 1,
      empireFounded: settlementState.empireFounded,
      empireName: settlementState.empireName || FALLBACK_SETTLEMENT.empireName,
    }),
    [settlementState],
  );

  const buildTownHall = () => {
    if (displaySettlement.townHallBuilt) return;

    const townHallOutcome = getTownHallOutcome(displaySettlement.settlementFocusId);

    const nextState: SettlementState = {
      ...settlementState,
      settlementFounded: true,
      settlementName: displaySettlement.settlementName,
      population: townHallOutcome.population,
      influence: townHallOutcome.influence,
      region: displaySettlement.region,
      coordinates: displaySettlement.coordinates,
      founder: displaySettlement.founder,
      townHallBuilt: true,
      settlementLevel: townHallOutcome.settlementLevel,
      settlementFocusIdentity: townHallOutcome.identity,
      tradeRouteEstablished: false,
      tradeRouteDestination: "",
      tradeRoutes: 0,
      regionalAllianceFormed: false,
      allianceName: "",
      alliancePartners: [],
      politicalStatus: "",
      nationFounded: false,
      nationName: "",
      nationIdeology: "",
      landsControlled: 1,
      bordersExpanded: false,
      expandedLands: [],
      empireFounded: false,
      empireName: "",
      empireDoctrine: "",
      cities: 1,
    };

    setSettlementState(nextState);
    writeSettlementState(nextState);
  };

  const runDevelopmentAction = (actionId: DevelopmentActionId) => {
    const nextState = applyDevelopmentAction(settlementState, actionId);
    setSettlementState(nextState);
    writeSettlementState(nextState);
  };

  const development = displaySettlement.empireFounded
    ? {
        stage: "Imperial Capital",
        objective: "Rule the World",
        progress: "Empire Founded",
        cta: "View Empire",
        disabled: false,
        href: "/empire",
      }
    : displaySettlement.nationFounded
      ? {
          stage: "Capital City",
          objective: "Declare Empire",
          progress: "Nation Founded",
          cta: "View Nation",
          disabled: false,
          href: "/nation",
        }
      : displaySettlement.regionalAllianceFormed
        ? {
            stage: "Regional Power",
            objective: "Found the First Nation",
            progress: "0 / 1 Nation",
            cta: "Found First Nation",
            disabled: false,
            href: "/nation/create",
          }
      : displaySettlement.tradeRouteEstablished
        ? {
            stage: "Growing City",
            objective: "Form Regional Alliance",
            progress: "0 / 1 Alliance",
            cta: "Form Regional Alliance",
            disabled: false,
            href: "/alliance/create",
          }
        : displaySettlement.townHallBuilt
          ? {
              stage: "City Seed",
              objective: "Establish Trade Route",
              progress: "0 / 1 Trade Route",
              cta: "Establish Trade Route",
              disabled: false,
              href: "/trade/create",
            }
          : {
              stage: "Outpost",
              objective: "Build the civic core",
              progress: "0 / 1 Core Building",
              cta: "Build Town Hall",
              disabled: false,
              href: "",
            };

  const resourceValues = getTerrainResourceValues(
    claimedLand.terrain,
    displaySettlement.tradeRouteEstablished,
    displaySettlement.tradeRouteDestination,
  );

  const originQuote = getSettlementOriginQuote(
    claimedLand.terrain,
    claimedLand.region,
    claimedLand.landName,
  );

  const resourceCards = STARTING_RESOURCES.map((resource) => ({
    ...resource,
    value: String(resourceValues[resource.id as keyof typeof resourceValues]),
  }));

  const statCards = [
    { id: "population", label: "Population", value: String(displaySettlement.population) },
    { id: "influence", label: "Influence", value: String(displaySettlement.influence) },
    { id: "lands", label: "Lands Controlled", value: String(displaySettlement.landsControlled) },
    { id: "level", label: "Level", value: displaySettlement.settlementLevel },
  ];

  const developmentStats = [
    { id: "population", label: "Population", value: String(developmentState.population) },
    { id: "food", label: "Food", value: String(developmentState.food) },
    { id: "materials", label: "Materials", value: String(developmentState.materials) },
    { id: "influence", label: "Influence", value: String(developmentState.influence) },
    { id: "security", label: "Security", value: String(developmentState.security) },
    { id: "prosperity", label: "Prosperity", value: String(developmentState.prosperity) },
    { id: "stability", label: "Stability", value: String(developmentState.stability) },
  ];

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
            First Settlement
          </p>
          <h1 className="mt-7 break-words font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.02] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            {displaySettlement.settlementName}
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">{originQuote}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-amber-200/70">
            This city is the civic heart of your claimed land. Build its core, connect outward, then raise a nation.
          </p>

          <div className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Founder", displaySettlement.founder],
              ["Origin Land", claimedLand.landName],
              ["Region", claimedLand.region],
              ["Terrain", claimedLand.terrain],
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

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          className="mt-10 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat) => (
            <article key={stat.id} className="bg-[#08080f]/95 p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">{stat.label}</p>
              <p className="mt-3 break-words font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight text-amber-100 sm:text-3xl md:text-4xl">
                {stat.value}
              </p>
            </article>
          ))}
        </motion.section>

        <motion.section
          data-qa="settlement-founder-focus"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
          className="mt-10 border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
            Founder Focus
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
            {displaySettlement.settlementFocus}
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.22em] text-amber-200/70">
            {displaySettlement.settlementFocusBonus}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            {displaySettlement.settlementFocusIdentity}
          </p>
        </motion.section>

        {settlementState.settlementFounded ? (
          <motion.section
            data-qa="settlement-development"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
            className="mt-10 border border-amber-500/20 bg-[#06060c]/90 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45),0_0_80px_rgba(201,169,98,0.06)] sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Settlement Development
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
                  Cycle {developmentState.developmentCycle}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                  Choose one local development action. The result is saved on this device and the demo path remains open.
                </p>
              </div>
              {development.href ? (
                <Link
                  href={development.href}
                  className="btn-secondary w-full rounded border border-zinc-800 bg-[#08080f]/80 px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:w-auto"
                >
                  Continue Path
                </Link>
              ) : (
                <p className="max-w-xs border border-amber-500/10 bg-[#08080f]/75 p-4 text-xs leading-6 text-zinc-500">
                  Build the Town Hall below when you are ready to continue the guided demo path.
                </p>
              )}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {developmentStats.map((stat) => (
                <article key={stat.id} className="border border-amber-500/10 bg-[#08080f]/85 p-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">{stat.label}</p>
                  <p className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-extrabold text-amber-100">
                    {stat.value}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {DEVELOPMENT_ACTIONS.map((action) => {
                const canApply = canApplyDevelopmentAction(settlementState, action);

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => runDevelopmentAction(action.id)}
                    disabled={!canApply}
                    className={`border p-5 text-left transition-colors ${
                      canApply
                        ? "border-amber-500/20 bg-[#08080f]/90 hover:border-amber-400/60 hover:bg-amber-500/10"
                        : "cursor-not-allowed border-zinc-800 bg-[#08080f]/60 opacity-60"
                    }`}
                  >
                    <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-amber-100">
                      {action.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{action.intent}</p>
                    <div className="mt-4 space-y-2 text-xs uppercase tracking-[0.18em]">
                      <p className="text-zinc-500">Cost: {action.cost}</p>
                      <p className="text-amber-200/75">Effect: {action.effect}</p>
                      <p className="text-zinc-500">Tradeoff: {action.tradeoff}</p>
                    </div>
                    {!canApply ? (
                      <p className="mt-4 text-sm leading-6 text-amber-300">
                        Not enough stored resources for this cycle.
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 border-l border-amber-500/30 bg-amber-500/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600/75">
                Latest Consequence
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                {developmentState.latestDevelopmentSummary ||
                  "No development action has been taken yet. Choose one action to shape how this settlement grows."}
              </p>
            </div>
          </motion.section>
        ) : null}

        {displaySettlement.tradeRouteEstablished ? (
          <motion.section
            data-qa="settlement-trade-route"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
            className="mt-10 border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
              First Trade Route
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
              {displaySettlement.tradeRouteDestination}
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-amber-200/70">
              {displaySettlement.tradeRouteResourceFlow || displaySettlement.tradeRouteBonus}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              {displaySettlement.tradeRouteIdentity || "The city now has its first external connection."}
            </p>
          </motion.section>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
            className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
              City Path
            </p>

            <div className="mt-7 space-y-5 border-b border-amber-500/10 pb-6">
              <div className="flex items-start justify-between gap-5">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Current Stage</span>
                <span className="text-right font-[family-name:var(--font-syne)] text-base font-bold text-amber-100">
                  {development.stage}
                </span>
              </div>
              <div className="flex items-start justify-between gap-5">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Next Objective</span>
                <span className="text-right font-[family-name:var(--font-syne)] text-base font-bold text-zinc-200">
                  {development.objective}
                </span>
              </div>
              <div className="flex items-start justify-between gap-5">
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Progress</span>
                <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-300">
                  {development.progress}
                </span>
              </div>
            </div>

            {development.href ? (
              <Link
                href={development.href}
                className="btn-primary mt-9 inline-flex rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
              >
                {development.cta}
              </Link>
            ) : (
              <button
                type="button"
                onClick={buildTownHall}
                disabled={development.disabled}
                className={`mt-9 rounded border px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] ${
                  development.disabled
                    ? "cursor-not-allowed border-zinc-800 bg-[#08080f]/70 text-zinc-500"
                    : "btn-primary border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 text-amber-100"
                }`}
              >
                {development.cta}
              </button>
            )}
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
            className="space-y-6"
          >
            <section className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                Resources
              </p>
              <div className="mt-6 space-y-5">
                {resourceCards.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-start justify-between gap-5 border-b border-amber-500/10 pb-4 last:border-b-0 last:pb-0"
                  >
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{resource.label}</span>
                    <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                      {resource.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">History</p>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-zinc-300">
                <li className="border-l border-amber-500/25 pl-4">{formatLandClaimHistory(settlementState)}</li>
                <li className="border-l border-amber-500/25 pl-4">Founder Badge earned</li>
                <li className="border-l border-amber-500/25 pl-4">
                  {displaySettlement.settlementName} founded
                </li>
                <li className="border-l border-amber-500/25 pl-4">
                  Founder focus chosen: {displaySettlement.settlementFocus}
                </li>
                {displaySettlement.townHallBuilt ? (
                  <li className="border-l border-amber-500/25 pl-4">Town Hall built</li>
                ) : null}
                {displaySettlement.tradeRouteEstablished ? (
                  <>
                    <li className="border-l border-amber-500/25 pl-4">
                      Trade route established with {displaySettlement.tradeRouteDestination}
                    </li>
                    <li className="border-l border-amber-500/25 pl-4">
                      Route effect: {displaySettlement.tradeRouteResourceFlow || displaySettlement.tradeRouteBonus || "External connection"}
                    </li>
                  </>
                ) : null}
                {displaySettlement.regionalAllianceFormed ? (
                  <>
                    <li className="border-l border-amber-500/25 pl-4">
                      Regional alliance formed: {displaySettlement.allianceName}
                    </li>
                    <li className="border-l border-amber-500/25 pl-4">
                      Alliance strategy: {displaySettlement.allianceStrategy || "Regional support"}
                    </li>
                  </>
                ) : null}
                {displaySettlement.nationFounded ? (
                  <li className="border-l border-amber-500/25 pl-4">
                    Nation founded: {displaySettlement.nationName}
                  </li>
                ) : null}
                {displaySettlement.empireFounded ? (
                  <li className="border-l border-amber-500/25 pl-4">
                    Empire created: {displaySettlement.empireName}
                  </li>
                ) : null}
              </ul>
            </section>
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
