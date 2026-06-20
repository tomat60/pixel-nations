"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import DemoObjectivePanel from "../components/DemoObjectivePanel";
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

type DevelopmentStatId =
  | "population"
  | "food"
  | "materials"
  | "influence"
  | "security"
  | "prosperity"
  | "stability";

type DevelopmentStat = {
  id: DevelopmentStatId;
  label: string;
  value: number;
  tone: string;
};

const DEVELOPMENT_STAT_META: Record<DevelopmentStatId, { label: string; tone: string }> = {
  population: { label: "Population", tone: "from-amber-300/20 to-orange-700/10" },
  food: { label: "Food", tone: "from-lime-300/20 to-emerald-800/10" },
  materials: { label: "Materials", tone: "from-stone-300/20 to-zinc-800/10" },
  influence: { label: "Influence", tone: "from-yellow-300/20 to-amber-800/10" },
  security: { label: "Security", tone: "from-sky-300/20 to-blue-900/10" },
  prosperity: { label: "Prosperity", tone: "from-orange-300/20 to-amber-900/10" },
  stability: { label: "Stability", tone: "from-violet-300/20 to-indigo-900/10" },
};

const ACTION_VISUALS: Record<
  DevelopmentActionId,
  {
    eyebrow: string;
    symbol: string;
    accent: string;
    glow: string;
    deltaLabel: string;
    meaning: string;
  }
> = {
  "build-farms": {
    eyebrow: "Fields / Growth",
    symbol: "F",
    accent: "border-lime-300/35 bg-lime-400/10 text-lime-100",
    glow: "from-lime-300/20 via-amber-500/10 to-transparent",
    deltaLabel: "+6 Food",
    meaning: "Food stores rise and new families can settle.",
  },
  "raise-watch": {
    eyebrow: "Tower / Shield",
    symbol: "W",
    accent: "border-sky-300/35 bg-sky-400/10 text-sky-100",
    glow: "from-sky-300/20 via-amber-500/10 to-transparent",
    deltaLabel: "+3 Security",
    meaning: "The frontier feels safer, but trade slows.",
  },
  "open-market": {
    eyebrow: "Routes / Coin",
    symbol: "M",
    accent: "border-orange-300/35 bg-orange-400/10 text-orange-100",
    glow: "from-orange-300/20 via-amber-500/10 to-transparent",
    deltaLabel: "+3 Prosperity",
    meaning: "Trade opens the settlement to wealth and risk.",
  },
  "civic-assembly": {
    eyebrow: "Hall / Banner",
    symbol: "C",
    accent: "border-violet-300/35 bg-violet-400/10 text-violet-100",
    glow: "from-violet-300/20 via-amber-500/10 to-transparent",
    deltaLabel: "+3 Stability",
    meaning: "A shared civic voice gives the city order.",
  },
};

function formatDelta(delta?: number) {
  if (!delta) return "";
  return `${delta > 0 ? "+" : ""}${delta}`;
}

function formatStatDelta(label: string, delta?: number) {
  const value = formatDelta(delta);
  return value ? `${value} ${label}` : "";
}

function getSettlementVitality(stats: DevelopmentStat[]) {
  const leading = [...stats].sort((a, b) => b.value - a.value)[0];

  if (!leading) {
    return {
      title: "Balanced Outpost",
      description: "The settlement is waiting for its first clear direction.",
      pulse: "Civic hearth",
      pillars: ["Growth", "Guard", "Trade"],
    };
  }

  const identityByStat: Record<DevelopmentStatId, { title: string; description: string; pulse: string; pillars: string[] }> = {
    population: {
      title: "Growing Hearth",
      description: "Families and workers are becoming the settlement's center of gravity.",
      pulse: "New roofs",
      pillars: ["Homes", "Fields", "Roads"],
    },
    food: {
      title: "Breadbasket Outpost",
      description: "Fields and stores are giving the settlement room to grow.",
      pulse: "Full granaries",
      pillars: ["Fields", "Stores", "Families"],
    },
    materials: {
      title: "Builder's Yard",
      description: "Stone, timber, and workshops define the settlement's next rise.",
      pulse: "Stacked timber",
      pillars: ["Yards", "Tools", "Walls"],
    },
    influence: {
      title: "Founder Seat",
      description: "The settlement's voice carries beyond its first streets.",
      pulse: "Raised banner",
      pillars: ["Hall", "Record", "Oath"],
    },
    security: {
      title: "Frontier Watch",
      description: "Towers and patrol paths shape the settlement's cautious strength.",
      pulse: "Lit watchfire",
      pillars: ["Tower", "Gate", "Patrol"],
    },
    prosperity: {
      title: "Market Spark",
      description: "Stalls, routes, and exchange are pulling life into the square.",
      pulse: "Open stalls",
      pillars: ["Stalls", "Coins", "Routes"],
    },
    stability: {
      title: "Civic Order",
      description: "Law, gathering, and shared ritual are binding the city together.",
      pulse: "Charter hall",
      pillars: ["Hall", "Banner", "Council"],
    },
  };

  return identityByStat[leading.id];
}

function DevelopmentActionVisual({ actionId }: { actionId: DevelopmentActionId }) {
  const visual = ACTION_VISUALS[actionId];

  return (
    <div className="relative min-h-24 overflow-hidden border border-amber-500/10 bg-[#050509]/90 p-4">
      <div aria-hidden className={`absolute inset-0 bg-gradient-to-br ${visual.glow}`} />
      <div className="relative flex items-center justify-between gap-4">
        <div className={`grid size-14 place-items-center border ${visual.accent}`}>
          <span className="font-[family-name:var(--font-syne)] text-2xl font-extrabold">{visual.symbol}</span>
        </div>
        <div className="flex flex-1 items-end justify-end gap-1.5">
          <span className="h-5 w-2 bg-amber-200/30" />
          <span className="h-8 w-2 bg-amber-200/45" />
          <span className="h-12 w-2 bg-amber-200/65" />
          <span className="h-7 w-2 bg-amber-200/35" />
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-500/15 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100">
          {visual.eyebrow}
        </span>
        <span className="rounded-full border border-amber-500/15 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
          {visual.deltaLabel}
        </span>
      </div>
    </div>
  );
}

function StatDeltaBadge({ label, delta }: { label: string; delta?: number }) {
  if (!delta) return null;

  const isPositive = delta > 0;
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
        isPositive
          ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
          : "border-orange-300/25 bg-orange-400/10 text-orange-100"
      }`}
    >
      {formatStatDelta(label, delta)}
    </span>
  );
}

function SettlementStatGrid({
  stats,
  latestDeltas,
  cycle,
}: {
  stats: DevelopmentStat[];
  latestDeltas: Partial<Record<DevelopmentStatId, number>>;
  cycle: number;
}) {
  return (
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const delta = latestDeltas[stat.id];
        const changed = Boolean(delta);

        return (
          <article
            key={`${stat.id}-${changed ? cycle : "idle"}`}
            className={`relative overflow-hidden border p-4 transition-all duration-300 ${
              changed
                ? "border-amber-300/45 bg-amber-500/[0.08] shadow-[0_0_34px_rgba(201,169,98,0.13)] animate-border-glow"
                : "border-amber-500/10 bg-[#08080f]/85"
            }`}
          >
            <div aria-hidden className={`absolute inset-0 bg-gradient-to-br ${stat.tone} opacity-70`} />
            <div className="relative flex min-h-24 flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
                <StatDeltaBadge label={stat.label} delta={delta} />
              </div>
              <p className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-amber-100">
                {stat.value}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SettlementVitalityPreview({
  vitality,
  latestActionId,
}: {
  vitality: ReturnType<typeof getSettlementVitality>;
  latestActionId?: DevelopmentActionId;
}) {
  const latestVisual = latestActionId ? ACTION_VISUALS[latestActionId] : null;

  return (
    <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="overflow-hidden border border-amber-500/15 bg-[#08080f]/90 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">
          Settlement Vitality
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {vitality.pillars.map((pillar, index) => (
            <div
              key={pillar}
              className={`min-h-24 border border-amber-500/10 bg-amber-500/[0.04] p-3 ${
                index === 1 ? "shadow-[0_0_34px_rgba(201,169,98,0.1)]" : ""
              }`}
            >
              <div
                aria-hidden
                className={`mx-auto h-10 w-8 border border-amber-300/25 bg-gradient-to-b ${
                  latestVisual?.glow ?? "from-amber-300/20 via-amber-500/10 to-transparent"
                }`}
              />
              <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                {pillar}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 border border-amber-500/10 bg-black/20 p-3">
          <span className="size-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.65)]" />
          <span className="text-xs uppercase tracking-[0.2em] text-amber-100">{vitality.pulse}</span>
        </div>
      </section>

      <section className="border border-amber-500/15 bg-[#08080f]/90 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">
          Current Character
        </p>
        <h3 className="mt-4 font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight text-amber-100">
          {vitality.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-zinc-400">{vitality.description}</p>
        {latestVisual ? (
          <p className="mt-4 border-l border-amber-400/35 pl-4 text-sm leading-7 text-amber-100/80">
            Latest shift: {latestVisual.meaning}
          </p>
        ) : (
          <p className="mt-4 border-l border-amber-500/20 pl-4 text-sm leading-7 text-zinc-500">
            Choose an action to give the settlement a visible direction.
          </p>
        )}
      </section>
    </div>
  );
}

function ConsequenceBanner({
  actionTitle,
  summary,
  deltas,
}: {
  actionTitle: string;
  summary: string;
  deltas: Partial<Record<DevelopmentStatId, number>>;
}) {
  const deltaEntries = Object.entries(deltas).filter(([, delta]) => Boolean(delta)) as [
    DevelopmentStatId,
    number,
  ][];

  return (
    <div className="mt-7 overflow-hidden border border-amber-400/30 bg-amber-500/[0.055] shadow-[0_0_60px_rgba(201,169,98,0.1)]">
      <div className="border-b border-amber-500/15 bg-gradient-to-r from-amber-500/15 via-amber-500/[0.04] to-transparent p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500/85">
          Latest Consequence
        </p>
        <h3 className="mt-3 font-[family-name:var(--font-syne)] text-2xl font-extrabold tracking-tight text-amber-100">
          {actionTitle || "Awaiting First Development Order"}
        </h3>
      </div>
      <div className="p-5">
        <p className="text-sm leading-7 text-zinc-300">
          {summary || "No development action has been taken yet. Choose one action to shape how this settlement grows."}
        </p>
        {deltaEntries.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {deltaEntries.map(([id, delta]) => (
              <StatDeltaBadge key={id} label={DEVELOPMENT_STAT_META[id].label} delta={delta} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

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
  const latestDevelopmentAction = useMemo(
    () => DEVELOPMENT_ACTIONS.find((action) => action.title === developmentState.latestDevelopmentAction),
    [developmentState.latestDevelopmentAction],
  );

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

  const developmentStats: DevelopmentStat[] = [
    { id: "population", value: developmentState.population, ...DEVELOPMENT_STAT_META.population },
    { id: "food", value: developmentState.food, ...DEVELOPMENT_STAT_META.food },
    { id: "materials", value: developmentState.materials, ...DEVELOPMENT_STAT_META.materials },
    { id: "influence", value: developmentState.influence, ...DEVELOPMENT_STAT_META.influence },
    { id: "security", value: developmentState.security, ...DEVELOPMENT_STAT_META.security },
    { id: "prosperity", value: developmentState.prosperity, ...DEVELOPMENT_STAT_META.prosperity },
    { id: "stability", value: developmentState.stability, ...DEVELOPMENT_STAT_META.stability },
  ];
  const latestDeltas = (latestDevelopmentAction?.deltas ?? {}) as Partial<Record<DevelopmentStatId, number>>;
  const settlementVitality = getSettlementVitality(developmentStats);

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
            Your settlement grows into a city core, then trade, alliance, nation, and empire. Each step builds on the last.
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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: "easeOut" }}
          className="mt-10"
        >
          <DemoObjectivePanel state={settlementState} variant="compact" eyebrow="Settlement / Objective Spine" />
        </motion.div>

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

            <SettlementStatGrid
              stats={developmentStats}
              latestDeltas={latestDeltas}
              cycle={developmentState.developmentCycle}
            />

            <SettlementVitalityPreview
              vitality={settlementVitality}
              latestActionId={latestDevelopmentAction?.id}
            />

            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {DEVELOPMENT_ACTIONS.map((action) => {
                const canApply = canApplyDevelopmentAction(settlementState, action);
                const isLatest = latestDevelopmentAction?.id === action.id;

                return (
                  <button
                    key={action.id}
                    type="button"
                    aria-label={action.title}
                    onClick={() => runDevelopmentAction(action.id)}
                    disabled={!canApply}
                    className={`group overflow-hidden border text-left transition-all duration-300 ${
                      canApply
                        ? isLatest
                          ? "border-amber-300/60 bg-amber-500/[0.08] shadow-[0_0_44px_rgba(201,169,98,0.14)]"
                          : "border-amber-500/20 bg-[#08080f]/90 hover:-translate-y-1 hover:border-amber-400/60 hover:bg-amber-500/10"
                        : "cursor-not-allowed border-zinc-800 bg-[#08080f]/60 opacity-60"
                    }`}
                  >
                    <DevelopmentActionVisual actionId={action.id} />
                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-amber-100">
                            {action.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">{action.intent}</p>
                        </div>
                        {isLatest ? (
                          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100">
                            Latest
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.16em] sm:grid-cols-3">
                        <p className="border border-amber-500/10 bg-black/20 p-3 text-zinc-500">Cost: {action.cost}</p>
                        <p className="border border-amber-500/10 bg-amber-500/[0.04] p-3 text-amber-200/75">
                          Effect: {action.effect}
                        </p>
                        <p className="border border-amber-500/10 bg-black/20 p-3 text-zinc-500">
                          Tradeoff: {action.tradeoff}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(action.deltas).map(([id, delta]) => (
                          <StatDeltaBadge
                            key={id}
                            label={DEVELOPMENT_STAT_META[id as DevelopmentStatId].label}
                            delta={delta}
                          />
                        ))}
                      </div>
                      {!canApply ? (
                        <p className="mt-4 text-sm leading-6 text-amber-300">
                          Not enough stored resources for this cycle.
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <ConsequenceBanner
              actionTitle={developmentState.latestDevelopmentAction}
              summary={developmentState.latestDevelopmentSummary}
              deltas={latestDeltas}
            />
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
            id="city-core"
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
