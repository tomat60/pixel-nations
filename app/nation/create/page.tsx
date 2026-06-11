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
const MAX_NAME_LENGTH = 32;
const VALID_NAME_PATTERN = /^[A-Za-z\s-]+$/;

type Ideology = {
  id: string;
  title: string;
  type: string;
  bonus: string;
  style: string;
};

const IDEOLOGIES: Ideology[] = [
  {
    id: "crown-rule",
    title: "Crown Rule",
    type: "Centralized Monarchy",
    bonus: "+ Political Control",
    style: "One ruler, one banner, one destiny.",
  },
  {
    id: "free-cities",
    title: "Free Cities",
    type: "Merchant Republic",
    bonus: "+ Trade Growth",
    style: "Cities govern together through wealth and influence.",
  },
  {
    id: "iron-pact",
    title: "Iron Pact",
    type: "Military Alliance",
    bonus: "+ Defense Power",
    style: "Strength, borders and discipline define the nation.",
  },
];

function getNationNameError(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < MIN_NAME_LENGTH) {
    return `Nation name must be at least ${MIN_NAME_LENGTH} characters.`;
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Nation name must be at most ${MAX_NAME_LENGTH} characters.`;
  }
  if (!VALID_NAME_PATTERN.test(trimmed)) {
    return "Use letters, spaces, and hyphens only.";
  }
  return "";
}

export default function NationCreatePage() {
  const [settlementState, setSettlementState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);
  const [nationName, setNationName] = useState("");
  const [selectedIdeologyId, setSelectedIdeologyId] = useState(IDEOLOGIES[0].id);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFounded, setIsFounded] = useState(false);

  useEffect(() => {
    const state = readSettlementState();
    setSettlementState(state);
    if (state.nationName) setNationName(state.nationName);
    if (state.nationIdeology) {
      const matching = IDEOLOGIES.find((ideology) => ideology.title === state.nationIdeology);
      if (matching) setSelectedIdeologyId(matching.id);
    }
    if (state.nationFounded) setIsFounded(true);
  }, []);

  const settlementName = settlementState.settlementName || "Aurelia Prime";
  const allianceName = settlementState.allianceName || "Aurelian Pact";
  const influence = settlementState.influence > 0 ? settlementState.influence : 20;
  const selectedIdeology =
    IDEOLOGIES.find((ideology) => ideology.id === selectedIdeologyId) ?? IDEOLOGIES[0];
  const nationNameError = useMemo(() => getNationNameError(nationName), [nationName]);
  const showError = isSubmitted && !isFounded && Boolean(nationNameError);

  const foundNation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    const normalizedName = nationName.trim().replace(/\s+/g, " ");
    const validationError = getNationNameError(normalizedName);
    if (validationError) return;

    const nextState: SettlementState = {
      ...settlementState,
      settlementFounded: true,
      settlementName,
      region: settlementState.region || "Aurelia",
      coordinates: settlementState.coordinates || "X19 / Y12",
      founder: settlementState.founder || "You",
      townHallBuilt: true,
      tradeRouteEstablished: true,
      tradeRouteDestination: settlementState.tradeRouteDestination || "Iron Coast",
      tradeRoutes: 1,
      regionalAllianceFormed: true,
      allianceName,
      alliancePartners:
        settlementState.alliancePartners.length > 0 ? settlementState.alliancePartners : ["Iron Coast"],
      nationFounded: true,
      nationName: normalizedName,
      nationIdeology: selectedIdeology.title,
      population: 250,
      influence: 45,
      landsControlled: 5,
      settlementLevel: "Capital City",
      politicalStatus: "Nation Founder",
      bordersExpanded: false,
      expandedLands: [],
    };

    setNationName(normalizedName);
    setSettlementState(nextState);
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
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
            Found Nation
          </p>
          <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.05] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            Raise the first banner of Aurelia.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            Cities become nations when people choose one destiny.
          </p>

          <div className="mt-8 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Capital City", settlementName],
              ["Region", settlementState.region || "Aurelia"],
              ["Alliance", allianceName],
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
          {isFounded ? (
            <motion.section
              key="nation-success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10"
            >
              <h2 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                First Nation Founded
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                {nationName || "The first nation"} has become the first nation of Aurelia.
              </p>

              <div className="mt-8 border-y border-amber-500/10 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">
                  Unlocked Benefits
                </p>
                <ul className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  {[
                    "Nation Founder",
                    "Capital City",
                    "Regional Rule",
                    "Diplomatic Sovereignty",
                  ].map((benefit) => (
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
                Enter Nation
              </Link>
            </motion.section>
          ) : (
            <motion.form
              key="nation-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onSubmit={foundNation}
              className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
            >
              <section className="border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10">
                <label
                  htmlFor="nation-name"
                  className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75"
                >
                  Nation Name
                </label>
                <input
                  id="nation-name"
                  value={nationName}
                  onChange={(event) => setNationName(event.target.value)}
                  className="mt-5 w-full border border-amber-500/25 bg-[#08080f] px-5 py-4 font-[family-name:var(--font-syne)] text-xl font-bold tracking-wide text-white outline-none transition-colors focus:border-amber-400/70"
                  placeholder="The Aurelian Crown"
                  autoComplete="off"
                  maxLength={MAX_NAME_LENGTH}
                />
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  Examples: The Aurelian Crown, Ronald Dominion, First Aurelia
                </p>
                {showError ? (
                  <p className="mt-4 text-sm leading-7 text-amber-300">{nationNameError}</p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-zinc-500">
                    Use 3-32 characters with letters, spaces, or hyphens.
                  </p>
                )}

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Founding Ideology
                </p>
                <div className="mt-5 grid gap-3">
                  {IDEOLOGIES.map((ideology) => {
                    const isSelected = ideology.id === selectedIdeologyId;
                    return (
                      <button
                        key={ideology.id}
                        type="button"
                        onClick={() => setSelectedIdeologyId(ideology.id)}
                        className={`border p-4 text-left transition-colors sm:p-5 ${
                          isSelected
                            ? "border-amber-400/65 bg-amber-500/10"
                            : "border-amber-500/15 bg-[#08080f]/90 hover:border-amber-500/35"
                        }`}
                      >
                        <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-amber-100">
                          {ideology.title}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Type: {ideology.type}
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">Bonus: {ideology.bonus}</p>
                        <p className="mt-1 text-sm text-zinc-400">{ideology.style}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <aside className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Nation Preview
                </p>
                <div className="mt-6 space-y-5 border-b border-amber-500/10 pb-6">
                  {[
                    ["Nation", nationName.trim() || "Awaiting Name"],
                    ["Capital", settlementName],
                    ["Region", settlementState.region || "Aurelia"],
                    ["Founding Alliance", allianceName],
                    ["Ideology", selectedIdeology.title],
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
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Expected Gain</p>
                  <p className="text-sm text-zinc-300">Population: +110</p>
                  <p className="text-sm text-zinc-300">Influence: +25</p>
                  <p className="text-sm text-zinc-300">Controlled Lands: +4</p>
                  <p className="text-sm text-zinc-300">Political Status: First Nation</p>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                  >
                    Found Nation
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
