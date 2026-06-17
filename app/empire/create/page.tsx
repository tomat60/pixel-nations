"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  clearSettlementState,
  DEFAULT_SETTLEMENT_STATE,
  type SettlementState,
  readSettlementState,
  writeSettlementState,
} from "../../lib/settlement-state";

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 36;
const VALID_NAME_PATTERN = /^[A-Za-z\s-]+$/;

type ImperialDirection = {
  id: string;
  title: string;
  type: string;
  bonus: string;
  identity: string;
  reach: string;
  populationGain: number;
  influenceGain: number;
  landGain: number;
  citiesGain: number;
  victoryStatus: string;
};

const IMPERIAL_DIRECTIONS: ImperialDirection[] = [
  {
    id: "crown-empire",
    title: "Crown Empire",
    type: "Legitimacy-Led Empire",
    bonus: "+ Imperial Legitimacy",
    identity:
      "The empire expands through law, banners, ceremonies, and controlled succession of power.",
    reach: "Lawful authority across the first imperial provinces",
    populationGain: 220,
    influenceGain: 48,
    landGain: 5,
    citiesGain: 2,
    victoryStatus: "Crown Empire Founder",
  },
  {
    id: "trade-empire",
    title: "Trade Empire",
    type: "Route-Led Empire",
    bonus: "+ Imperial Trade Reach",
    identity:
      "The empire expands by making neighbors depend on its roads, markets, contracts, and resource flow.",
    reach: "Commercial dependency through routes, contracts, and resource flow",
    populationGain: 260,
    influenceGain: 42,
    landGain: 4,
    citiesGain: 2,
    victoryStatus: "Trade Empire Founder",
  },
  {
    id: "frontier-empire",
    title: "Frontier Empire",
    type: "Expansion-Led Empire",
    bonus: "+ Frontier Expansion",
    identity:
      "The empire expands through settlement pressure, secured borders, frontier ambition, and controlled risk.",
    reach: "Secured borders, settlement pressure, and controlled frontier risk",
    populationGain: 200,
    influenceGain: 38,
    landGain: 8,
    citiesGain: 2,
    victoryStatus: "Frontier Empire Founder",
  },
];

function containsAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function getRecommendedDirectionId(state: SettlementState) {
  const doctrine = `${state.nationDoctrineId ?? ""} ${state.nationDoctrine ?? ""}`.toLowerCase();
  const ideology = `${state.nationIdeology ?? ""}`.toLowerCase();
  const tradePath = [
    state.tradeRouteId,
    state.tradeRouteDestination,
    state.tradeRouteBonus,
    state.tradeRouteIdentity,
    state.tradeRouteResourceFlow,
    state.allianceStrategy,
    state.allianceBonus,
    state.allianceIdentity,
    state.settlementFocusId,
    state.settlementFocus,
  ]
    .filter(Boolean)
    .join(" ");

  if (
    doctrine.includes("trade-compact") ||
    doctrine.includes("trade compact") ||
    ideology.includes("free cities") ||
    containsAny(tradePath, ["trade", "market", "route", "commercial"])
  ) {
    return "trade-empire";
  }

  if (
    doctrine.includes("sovereign-command") ||
    doctrine.includes("sovereign command") ||
    ideology.includes("iron pact") ||
    containsAny(tradePath, ["defense", "industrial", "border", "military", "frontier"])
  ) {
    return "frontier-empire";
  }

  return "crown-empire";
}

function getEmpireOutcome(state: SettlementState, direction: ImperialDirection) {
  const basePopulation = state.population > 0 ? state.population : 340;
  const baseInfluence = state.influence > 0 ? state.influence : 55;
  const baseLands = state.landsControlled > 0 ? state.landsControlled : 7;
  const baseCities = state.cities > 0 ? state.cities : 1;

  return {
    population: basePopulation + direction.populationGain,
    influence: baseInfluence + direction.influenceGain,
    landsControlled: Math.max(10, baseLands + direction.landGain),
    cities: Math.max(3, baseCities + direction.citiesGain),
    politicalStatus: direction.victoryStatus,
  };
}

function getEmpireNameError(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < MIN_NAME_LENGTH) return `Empire name must be at least ${MIN_NAME_LENGTH} characters.`;
  if (trimmed.length > MAX_NAME_LENGTH) return `Empire name must be at most ${MAX_NAME_LENGTH} characters.`;
  if (!VALID_NAME_PATTERN.test(trimmed)) return "Use letters, spaces, and hyphens only.";
  return "";
}

export default function EmpireCreatePage() {
  const [state, setState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);
  const [empireName, setEmpireName] = useState("");
  const [selectedDirectionId, setSelectedDirectionId] = useState(IMPERIAL_DIRECTIONS[0].id);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFounded, setIsFounded] = useState(false);

  useEffect(() => {
    const next = readSettlementState();
    setState(next);
    if (next.empireName) setEmpireName(next.empireName);
    if (next.empireDirectionId) {
      const match = IMPERIAL_DIRECTIONS.find((direction) => direction.id === next.empireDirectionId);
      if (match) {
        setSelectedDirectionId(match.id);
      }
    } else {
      setSelectedDirectionId(getRecommendedDirectionId(next));
    }
    if (!next.empireDirectionId && next.empireDoctrine) {
      const match = IMPERIAL_DIRECTIONS.find((direction) => direction.title === next.empireDoctrine);
      if (match) {
        setSelectedDirectionId(match.id);
      }
    }
    if (next.empireFounded) setIsFounded(true);
  }, []);

  const recommendedDirectionId = getRecommendedDirectionId(state);
  const selectedDirection =
    IMPERIAL_DIRECTIONS.find((direction) => direction.id === selectedDirectionId) ??
    IMPERIAL_DIRECTIONS.find((direction) => direction.id === recommendedDirectionId) ??
    IMPERIAL_DIRECTIONS[0];
  const expectedOutcome = getEmpireOutcome(state, selectedDirection);
  const currentEmpireName = state.empireName || empireName;
  const nationName = state.nationName || "The Aurelian Crown";
  const settlementName = state.settlementName || "Aurelia Prime";
  const allianceName = state.allianceName || "Aurelian Pact";
  const nameError = useMemo(() => getEmpireNameError(empireName), [empireName]);
  const showError = isSubmitted && !isFounded && Boolean(nameError);

  const createEmpire = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    const normalizedName = empireName.trim().replace(/\s+/g, " ");
    const validationError = getEmpireNameError(normalizedName);
    if (validationError) return;

    const finalOutcome = getEmpireOutcome(state, selectedDirection);

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
      allianceName,
      alliancePartners: state.alliancePartners.length > 0 ? state.alliancePartners : ["Iron Coast"],
      nationFounded: true,
      nationName,
      nationIdeology: state.nationIdeology || "Crown Rule",
      bordersExpanded: true,
      expandedLands: state.expandedLands.length > 0 ? state.expandedLands : ["North Road", "Iron Ridge", "Amber Fields"],
      empireFounded: true,
      empireName: normalizedName,
      empireDoctrine: selectedDirection.title,
      empireDirectionId: selectedDirection.id,
      empireDirection: selectedDirection.title,
      empireDirectionBonus: selectedDirection.bonus,
      empireDirectionIdentity: selectedDirection.identity,
      imperialReach: selectedDirection.reach,
      population: finalOutcome.population,
      influence: finalOutcome.influence,
      landsControlled: finalOutcome.landsControlled,
      cities: finalOutcome.cities,
      settlementLevel: "Imperial Capital",
      politicalStatus: finalOutcome.politicalStatus,
    };

    setEmpireName(normalizedName);
    setState(nextState);
    writeSettlementState(nextState);
    setIsFounded(true);
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
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">Create Empire</p>
          <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.05] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            Declare the first empire of the demo arc.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            This completes the path: land to settlement, settlement to nation, nation to empire.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-amber-200/70">
            Deeper expansion, diplomacy, economy, and alliance layers can come later.
          </p>

          <div className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Nation", nationName],
              ["Capital", settlementName],
              ["Region", state.region || "Aurelia"],
              ["Controlled Lands", String(state.landsControlled > 0 ? state.landsControlled : 8)],
              ["Influence", String(state.influence > 0 ? state.influence : 60)],
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
          {isFounded ? (
            <motion.section
              key="empire-success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10"
            >
              <h2 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                First Empire Created
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                {(currentEmpireName || "The first empire")} completes the first Pixel Nations demo arc as a{" "}
                {state.empireDirection || selectedDirection.title}.
              </p>
              <p className="mt-4 max-w-2xl border-l border-amber-500/25 pl-4 text-sm leading-7 text-zinc-500">
                Your empire has already been founded. You can enter it, review the imperial direction choice,
                or reset the local demo path to experience the decision again.
              </p>

              <div className="mt-8 border-y border-amber-500/10 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">Unlocked Benefits</p>
                <ul className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  {[
                    state.empireDirection || selectedDirection.title,
                    state.empireDirectionBonus || selectedDirection.bonus,
                    "Imperial Capital",
                    "Opening Arc Complete",
                  ].map((benefit) => (
                    <li key={benefit} className="border-l border-amber-500/25 pl-4">
                      <span className="mr-2 text-amber-300">{"\u2713"}</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/empire"
                  className="btn-primary inline-flex rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100 sm:items-center sm:justify-center"
                >
                  Enter Empire
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setIsFounded(false);
                  }}
                  className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300"
                >
                  Review Imperial Direction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearSettlementState();
                    window.location.href = "/world";
                  }}
                  className="rounded border border-amber-500/20 bg-amber-500/5 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-200/80 transition-colors hover:border-amber-500/45 hover:bg-amber-500/10"
                >
                  Start Fresh Demo Path
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.form
              key="empire-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onSubmit={createEmpire}
              className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
            >
              <section className="border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
                  Step 1 — Name Your Empire
                </p>
                <label htmlFor="empire-name" className="mt-4 block text-sm font-semibold text-amber-100">
                  Empire Name
                </label>
                <input
                  id="empire-name"
                  value={empireName}
                  onChange={(event) => setEmpireName(event.target.value)}
                  className="mt-5 w-full border border-amber-500/25 bg-[#08080f] px-5 py-4 font-[family-name:var(--font-syne)] text-xl font-bold tracking-wide text-white outline-none transition-colors focus:border-amber-400/70"
                  placeholder="Aurelian Empire"
                  autoComplete="off"
                  maxLength={MAX_NAME_LENGTH}
                />
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  Examples: Aurelian Empire, The First Crown, Golden Dominion
                </p>
                {showError ? (
                  <p className="mt-4 text-sm leading-7 text-amber-300">{nameError}</p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-zinc-500">
                    Use 3-36 characters with letters, spaces, or hyphens.
                  </p>
                )}

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Step 2 — Choose First Imperial Direction
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  This is the first strategic identity of your empire. The recommendation comes from your
                  nation, doctrine, route, alliance, and founder path.
                </p>
                <div className="mt-5 grid gap-3">
                  {IMPERIAL_DIRECTIONS.map((direction) => {
                    const isSelected = direction.id === selectedDirectionId;
                    const isRecommended = direction.id === recommendedDirectionId;
                    return (
                      <button
                        key={direction.id}
                        type="button"
                        onClick={() => setSelectedDirectionId(direction.id)}
                        className={`border p-4 text-left transition-colors sm:p-5 ${
                          isSelected
                            ? "border-amber-400/65 bg-amber-500/10"
                            : "border-amber-500/15 bg-[#08080f]/90 hover:border-amber-500/35"
                        }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-amber-100">
                            {direction.title}
                          </p>
                          {isRecommended ? (
                            <span className="w-fit border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
                              Recommended by your path
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Type: {direction.type}
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">Bonus: {direction.bonus}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-400">{direction.identity}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 border border-amber-500/15 bg-[#08080f]/90 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600/75">
                    Step 3 — Expected Imperial Identity
                  </p>
                  <p className="mt-4 text-sm leading-7 text-amber-100/80">{selectedDirection.identity}</p>
                  <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                    <p>Imperial Reach: {selectedDirection.reach}</p>
                    <p>Victory Status: {expectedOutcome.politicalStatus}</p>
                    <p>World Influence: {expectedOutcome.influence}</p>
                    <p>Controlled Lands: {expectedOutcome.landsControlled}</p>
                  </div>
                </div>
              </section>

              <aside className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Empire Preview</p>
                <div className="mt-6 space-y-5 border-b border-amber-500/10 pb-6">
                  {[
                    ["Empire", empireName.trim() || "Awaiting Name"],
                    ["Capital", settlementName],
                    ["Origin Nation", nationName],
                    ["Imperial Direction", selectedDirection.title],
                    ["Direction Bonus", selectedDirection.bonus],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-5">
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{label}</span>
                      <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Expected Outcome</p>
                  <p className="text-sm text-zinc-300">Population: {expectedOutcome.population}</p>
                  <p className="text-sm text-zinc-300">World Influence: {expectedOutcome.influence}</p>
                  <p className="text-sm text-zinc-300">Controlled Lands: {expectedOutcome.landsControlled}</p>
                  <p className="text-sm text-zinc-300">Cities: {expectedOutcome.cities}</p>
                  <p className="text-sm text-zinc-300">Victory Status: {expectedOutcome.politicalStatus}</p>
                </div>
                <p className="mt-6 text-xs leading-6 text-zinc-500">
                  {selectedDirection.identity} This direction becomes the empire identity shown after founding.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                  >
                    Create Empire
                  </button>
                  <Link
                    href="/nation"
                    className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300"
                  >
                    Back To Nation
                  </Link>
                </div>
              </aside>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
