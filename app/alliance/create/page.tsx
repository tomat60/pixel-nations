"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_SETTLEMENT_STATE,
  type SettlementState,
  readSettlementState,
  writeSettlementState,
} from "../../lib/settlement-state";

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 28;
const VALID_NAME_PATTERN = /^[A-Za-z\s-]+$/;

type AlliancePartner = {
  id: string;
  name: string;
  role: string;
  contribution: string;
  trust: string;
};

const PARTNERS: AlliancePartner[] = [
  {
    id: "iron-coast",
    name: "Iron Coast",
    role: "Industrial Partner",
    contribution: "Iron Supply",
    trust: "High",
  },
  {
    id: "ember-basin",
    name: "Ember Basin",
    role: "Frontier Market",
    contribution: "Food Network",
    trust: "Medium",
  },
  {
    id: "crownlands",
    name: "Crownlands",
    role: "Political Center",
    contribution: "Legitimacy",
    trust: "Medium",
  },
];

function getAllianceNameError(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < MIN_NAME_LENGTH) {
    return `Alliance name must be at least ${MIN_NAME_LENGTH} characters.`;
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Alliance name must be at most ${MAX_NAME_LENGTH} characters.`;
  }
  if (!VALID_NAME_PATTERN.test(trimmed)) {
    return "Use letters, spaces, and hyphens only.";
  }
  return "";
}

export default function AllianceCreatePage() {
  const [settlementState, setSettlementState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);
  const [allianceName, setAllianceName] = useState("");
  const [selectedPartners, setSelectedPartners] = useState<string[]>(["iron-coast"]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFormed, setIsFormed] = useState(false);

  useEffect(() => {
    const state = readSettlementState();
    setSettlementState(state);
    if (state.allianceName) setAllianceName(state.allianceName);
    if (state.alliancePartners.length > 0) {
      const validPartners = state.alliancePartners
        .map((name) => PARTNERS.find((partner) => partner.name === name)?.id)
        .filter((id): id is string => Boolean(id))
        .slice(0, 2);
      if (validPartners.length > 0) setSelectedPartners(validPartners);
    } else if (state.tradeRouteDestination) {
      const routePartner = PARTNERS.find((partner) => partner.name === state.tradeRouteDestination);
      if (routePartner) setSelectedPartners([routePartner.id]);
    }
    if (state.regionalAllianceFormed) setIsFormed(true);
  }, []);

  const settlementName = settlementState.settlementName || "Aurelia Prime";
  const region = settlementState.region || "Aurelia";
  const influence = settlementState.influence > 0 ? settlementState.influence : 12;
  const currentLevel = settlementState.settlementLevel || "Growing City";
  const nameError = useMemo(() => getAllianceNameError(allianceName), [allianceName]);
  const showError = isSubmitted && !isFormed && Boolean(nameError);

  const selectedPartnerNames = selectedPartners
    .map((id) => PARTNERS.find((partner) => partner.id === id)?.name)
    .filter((value): value is string => Boolean(value));

  const togglePartner = (partnerId: string) => {
    setSelectedPartners((current) => {
      if (current.includes(partnerId)) {
        if (current.length === 1) return current;
        return current.filter((id) => id !== partnerId);
      }

      if (current.length >= 2) return current;
      return [...current, partnerId];
    });
  };

  const confirmAlliance = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    const normalizedName = allianceName.trim().replace(/\s+/g, " ");
    const validationError = getAllianceNameError(normalizedName);
    if (validationError) return;

    const partnerNames = selectedPartners
      .map((id) => PARTNERS.find((partner) => partner.id === id)?.name)
      .filter((value): value is string => Boolean(value));

    const nextState: SettlementState = {
      ...settlementState,
      settlementFounded: true,
      settlementName,
      region,
      coordinates: settlementState.coordinates || "X19 / Y12",
      founder: settlementState.founder || "You",
      townHallBuilt: true,
      tradeRouteEstablished: true,
      tradeRouteDestination: settlementState.tradeRouteDestination || "Iron Coast",
      tradeRoutes: 1,
      regionalAllianceFormed: true,
      allianceName: normalizedName,
      alliancePartners: partnerNames,
      population: 140,
      influence: 20,
      settlementLevel: "Regional Power",
      politicalStatus: "Alliance Leader",
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

    setAllianceName(normalizedName);
    setSettlementState(nextState);
    writeSettlementState(nextState);
    setIsFormed(true);
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
            Regional Alliance
          </p>
          <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.05] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            Unite the first powers of Aurelia.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            Cities become stronger when their interests align.
          </p>

          <div className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Lead Settlement", settlementName],
              ["Region", region],
              ["Current Level", currentLevel],
              ["Influence", String(influence)],
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
          {isFormed ? (
            <motion.section
              key="alliance-success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10"
            >
              <h2 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                Regional Alliance Formed
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                {allianceName || "The new alliance"} now binds the first powers of Aurelia.
              </p>

              <div className="mt-8 border-y border-amber-500/10 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">
                  Unlocked Benefits
                </p>
                <ul className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  {[
                    "Regional Diplomacy",
                    "Shared Trade Network",
                    "Political Influence",
                    "Nation Founding Eligibility",
                  ].map((benefit) => (
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
            <motion.form
              key="alliance-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onSubmit={confirmAlliance}
              className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
            >
              <section className="border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10">
                <label
                  htmlFor="alliance-name"
                  className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75"
                >
                  Alliance Name
                </label>
                <input
                  id="alliance-name"
                  value={allianceName}
                  onChange={(event) => setAllianceName(event.target.value)}
                  className="mt-5 w-full border border-amber-500/25 bg-[#08080f] px-5 py-4 font-[family-name:var(--font-syne)] text-xl font-bold tracking-wide text-white outline-none transition-colors focus:border-amber-400/70"
                  placeholder="Aurelian Pact"
                  autoComplete="off"
                  maxLength={MAX_NAME_LENGTH}
                />
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  Examples: Aurelian Pact, Northern Accord, First Crown Alliance
                </p>
                {showError ? (
                  <p className="mt-4 text-sm leading-7 text-amber-300">{nameError}</p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-zinc-500">
                    Use 3-28 characters with letters, spaces, or hyphens.
                  </p>
                )}

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Member Selection
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  Select up to 2 partners
                </p>
                <div className="mt-5 grid gap-3">
                  {PARTNERS.map((partner) => {
                    const isSelected = selectedPartners.includes(partner.id);
                    return (
                      <button
                        key={partner.id}
                        type="button"
                        onClick={() => togglePartner(partner.id)}
                        className={`border p-4 text-left transition-colors sm:p-5 ${
                          isSelected
                            ? "border-amber-400/65 bg-amber-500/10"
                            : "border-amber-500/15 bg-[#08080f]/90 hover:border-amber-500/35"
                        }`}
                      >
                        <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-amber-100">
                          {partner.name}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Role: {partner.role}
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">Contribution: {partner.contribution}</p>
                        <p className="mt-1 text-sm text-zinc-400">Trust: {partner.trust}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <aside className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Alliance Preview
                </p>
                <div className="mt-6 space-y-5 border-b border-amber-500/10 pb-6">
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Alliance</span>
                    <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                      {allianceName.trim() || "Awaiting Name"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Lead City</span>
                    <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-200">
                      {settlementName}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Partners</span>
                    <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-200">
                      {selectedPartnerNames.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Expected Gain</p>
                  <p className="text-sm text-zinc-300">Influence: +8</p>
                  <p className="text-sm text-zinc-300">Population: +40</p>
                  <p className="text-sm text-zinc-300">Diplomatic Reach: +1</p>
                  <p className="text-sm text-zinc-300">Political Status: Regional Power</p>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                  >
                    Confirm Alliance
                  </button>
                  <Link
                    href="/settlement"
                    className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300"
                  >
                    Back To Settlement
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
