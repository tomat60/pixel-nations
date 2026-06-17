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
const MAX_NAME_LENGTH = 36;
const VALID_NAME_PATTERN = /^[A-Za-z\s-]+$/;

type Doctrine = {
  id: string;
  title: string;
  type: string;
  bonus: string;
  style: string;
};

const DOCTRINES: Doctrine[] = [
  {
    id: "golden-crown",
    title: "Golden Crown",
    type: "Imperial Monarchy",
    bonus: "+ Rule Stability",
    style: "One empire, one throne, one world.",
  },
  {
    id: "frontier-dominion",
    title: "Frontier Dominion",
    type: "Expansionist Empire",
    bonus: "+ Border Growth",
    style: "Every frontier becomes a province.",
  },
  {
    id: "trade-imperium",
    title: "Trade Imperium",
    type: "Commercial Empire",
    bonus: "+ Economic Power",
    style: "Markets, cities and routes define imperial strength.",
  },
];

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
  const [selectedDoctrineId, setSelectedDoctrineId] = useState(DOCTRINES[0].id);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFounded, setIsFounded] = useState(false);

  useEffect(() => {
    const next = readSettlementState();
    setState(next);
    if (next.empireName) setEmpireName(next.empireName);
    if (next.empireDoctrine) {
      const match = DOCTRINES.find((doctrine) => doctrine.title === next.empireDoctrine);
      if (match) setSelectedDoctrineId(match.id);
    }
    if (next.empireFounded) setIsFounded(true);
  }, []);

  const selectedDoctrine = DOCTRINES.find((doctrine) => doctrine.id === selectedDoctrineId) ?? DOCTRINES[0];
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
      empireDoctrine: selectedDoctrine.title,
      population: 600,
      influence: 100,
      landsControlled: 15,
      cities: 3,
      settlementLevel: "Imperial Capital",
      politicalStatus: "Empire Founder",
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
                {(currentEmpireName || "The first empire")} completes the first Pixel Nations demo arc.
              </p>

              <div className="mt-8 border-y border-amber-500/10 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">Unlocked Benefits</p>
                <ul className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  {["Empire Founder", "Imperial Capital", "World Legacy", "Opening Arc Complete"].map((benefit) => (
                    <li key={benefit} className="border-l border-amber-500/25 pl-4">
                      <span className="mr-2 text-amber-300">{"\u2713"}</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/empire"
                  className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                >
                  Enter Empire
                </Link>
                <a
                  href="mailto:tomat6@gmail.com?subject=Pixel%20Nations%20demo%20feedback&body=I%20created%20an%20empire%20in%20the%20Pixel%20Nations%20demo.%0A%0AWhat%20felt%20exciting%3A%0A%0AWhat%20was%20confusing%3A%0A%0AWhat%20I%20would%20like%20next%3A%0A"
                  className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-300"
                >
                  Send Feedback
                </a>
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
                <label htmlFor="empire-name" className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
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

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">Imperial Doctrine</p>
                <div className="mt-5 grid gap-3">
                  {DOCTRINES.map((doctrine) => {
                    const isSelected = doctrine.id === selectedDoctrineId;
                    return (
                      <button
                        key={doctrine.id}
                        type="button"
                        onClick={() => setSelectedDoctrineId(doctrine.id)}
                        className={`border p-4 text-left transition-colors sm:p-5 ${
                          isSelected
                            ? "border-amber-400/65 bg-amber-500/10"
                            : "border-amber-500/15 bg-[#08080f]/90 hover:border-amber-500/35"
                        }`}
                      >
                        <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-amber-100">{doctrine.title}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Type: {doctrine.type}</p>
                        <p className="mt-2 text-sm text-zinc-300">Bonus: {doctrine.bonus}</p>
                        <p className="mt-1 text-sm text-zinc-400">{doctrine.style}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 border border-amber-500/15 bg-[#08080f]/90 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600/75">Imperial Capital</p>
                  <div className="mt-4 space-y-3 text-sm text-zinc-300">
                    <p>Capital City: {settlementName}</p>
                    <p>Capital Status: Imperial Seat</p>
                    <p>Region: {state.region || "Aurelia"}</p>
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
                    ["Doctrine", selectedDoctrine.title],
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
                  <p className="text-sm text-zinc-300">Population: +260</p>
                  <p className="text-sm text-zinc-300">Influence: +40</p>
                  <p className="text-sm text-zinc-300">Controlled Lands: +7</p>
                  <p className="text-sm text-zinc-300">Cities: +2</p>
                  <p className="text-sm text-zinc-300">Political Status: First Empire</p>
                </div>

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
