"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_SETTLEMENT_STATE,
  readSettlementState,
  writeSettlementState,
} from "../../lib/settlement-state";

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 24;
const VALID_NAME_PATTERN = /^[A-Za-z\s-]+$/;

function getNameError(value: string) {
  const trimmed = value.trim();

  if (trimmed.length < MIN_NAME_LENGTH) {
    return `Settlement name must be at least ${MIN_NAME_LENGTH} characters.`;
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Settlement name must be at most ${MAX_NAME_LENGTH} characters.`;
  }
  if (!VALID_NAME_PATTERN.test(trimmed)) {
    return "Use letters, spaces, and hyphens only.";
  }

  return "";
}

export default function SettlementCreatePage() {
  const [settlementName, setSettlementName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFounded, setIsFounded] = useState(false);

  useEffect(() => {
    const existingState = readSettlementState();
    if (existingState.settlementFounded) {
      setSettlementName(existingState.settlementName);
      setIsFounded(true);
    }
  }, []);

  const validationError = useMemo(() => getNameError(settlementName), [settlementName]);
  const showError = isSubmitted && !isFounded && Boolean(validationError);

  const confirmSettlement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    const normalizedName = settlementName.trim().replace(/\s+/g, " ");
    const error = getNameError(normalizedName);

    if (error) return;

    setSettlementName(normalizedName);
    writeSettlementState({
      ...DEFAULT_SETTLEMENT_STATE,
      claimedLand: true,
      founderBadgeEarned: true,
      settlementFounded: true,
      settlementName: normalizedName,
      population: 24,
      influence: 3,
      region: "Aurelia",
      coordinates: "X19 / Y12",
      founder: "You",
      townHallBuilt: false,
      settlementLevel: "Outpost",
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
    });
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
              Found Settlement
            </p>
            <Link
              href="/dashboard"
              className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
            >
              Back To Dashboard
            </Link>
          </div>

          <h1 className="mt-8 max-w-3xl font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[1.05] tracking-tight text-amber-100 sm:text-6xl md:text-7xl">
            Name your first settlement.
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            Every empire begins with a first city.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {isFounded ? (
            <motion.section
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-10 border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
                Settlement Confirmed
              </p>
              <h2 className="mt-6 font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                First Settlement Founded
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                History records the founding of {settlementName}.
              </p>

              <div className="mt-8 border-y border-amber-500/10 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600/75">
                  Unlocked Benefits
                </p>
                <ul className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  {[
                    "City Founder",
                    "Historical Record",
                    "Population Tracking",
                    "Trade Route Eligibility",
                  ].map((benefit) => (
                    <li key={benefit} className="border-l border-amber-500/25 pl-4">
                      <span className="mr-2 text-amber-300">{"\u2713"}</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/dashboard"
                className="btn-primary mt-8 inline-flex rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
              >
                Return To Dashboard
              </Link>
            </motion.section>
          ) : (
            <motion.form
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onSubmit={confirmSettlement}
              className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]"
            >
              <section className="border border-amber-500/20 bg-[#06060c]/90 p-7 shadow-[0_30px_120px_rgba(0,0,0,0.6),0_0_90px_rgba(201,169,98,0.08)] sm:p-10">
                <label
                  htmlFor="settlement-name"
                  className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75"
                >
                  Settlement Name
                </label>
                <input
                  id="settlement-name"
                  value={settlementName}
                  onChange={(event) => setSettlementName(event.target.value)}
                  className="mt-5 w-full border border-amber-500/25 bg-[#08080f] px-5 py-4 font-[family-name:var(--font-syne)] text-xl font-bold tracking-wide text-white outline-none transition-colors focus:border-amber-400/70"
                  placeholder="Aurelia Prime"
                  autoComplete="off"
                  maxLength={MAX_NAME_LENGTH}
                />
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  Examples: Aurelia Prime, Nova Crown, Emberhold
                </p>
                {showError ? (
                  <p className="mt-4 text-sm leading-7 text-amber-300">{validationError}</p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-zinc-500">
                    Use 3-24 characters with letters, spaces, or hyphens.
                  </p>
                )}

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100 sm:flex-1"
                  >
                    Confirm Settlement
                  </button>
                  <Link
                    href="/dashboard"
                    className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-400 sm:flex-1"
                  >
                    Back To Dashboard
                  </Link>
                </div>
              </section>

              <aside className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
                  Settlement Preview
                </p>
                <div className="mt-6 space-y-5">
                  {[
                    ["Settlement Name", settlementName.trim() || "Awaiting Name"],
                    ["Region", "Aurelia"],
                    ["Coordinates", "X19 / Y12"],
                    ["Founder", "You"],
                    ["Status", "Ready to Found"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 border-b border-amber-500/10 pb-4 last:border-b-0 last:pb-0"
                    >
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{label}</span>
                      <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </aside>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
