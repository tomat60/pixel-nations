"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DEFAULT_SETTLEMENT_STATE, clearSettlementState, readSettlementState } from "../lib/settlement-state";

const territoryOverview = [
  { id: "region", label: "Region", value: "Aurelia" },
  { id: "coordinates", label: "Coordinates", value: "X19 / Y12" },
  { id: "land-tier", label: "Land Tier", value: "Frontier" },
  { id: "status", label: "Status", value: "Claimed" },
  { id: "owner-since", label: "Owner Since", value: "June 2026" },
];

const founderBenefits = [
  "Founder Badge",
  "Historical Record",
  "Settlement Rights",
  "Nation Founder Eligibility",
];

export default function DashboardPage() {
  const router = useRouter();
  const [settlementState, setSettlementState] = useState(DEFAULT_SETTLEMENT_STATE);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    setSettlementState(readSettlementState());
  }, []);

  const founderStats = useMemo(
    () => [
      {
        id: "lands-owned",
        label: "Lands Owned",
        value: String(settlementState.landsControlled > 0 ? settlementState.landsControlled : 1),
      },
      {
        id: "settlements",
        label: "Settlements",
        value: settlementState.empireFounded ? String(settlementState.cities > 0 ? settlementState.cities : 3) : settlementState.settlementFounded ? "1" : "0",
      },
      { id: "population", label: "Population", value: String(settlementState.population) },
      { id: "influence", label: "Influence", value: String(settlementState.influence) },
    ],
    [settlementState],
  );

  const worldMilestones = useMemo(
    () => [
      {
        id: "first-city",
        label: "First City",
        value: settlementState.settlementFounded
          ? settlementState.settlementName || "Awaiting Founder"
          : "Awaiting Founder",
      },
      ...(settlementState.settlementFounded
        ? [{ id: "first-city-founder", label: "Founder", value: "You" }]
        : []),
      {
        id: "first-nation",
        label: "First Nation",
        value: settlementState.nationFounded ? settlementState.nationName || "Awaiting Founder" : "Awaiting Founder",
      },
      ...(settlementState.nationFounded ? [{ id: "first-nation-founder", label: "Founder", value: "You" }] : []),
      {
        id: "first-empire",
        label: "First Empire",
        value: settlementState.empireFounded ? settlementState.empireName || "Awaiting Founder" : "Awaiting Founder",
      },
      ...(settlementState.empireFounded ? [{ id: "first-empire-founder", label: "Founder", value: "You" }] : []),
    ],
    [settlementState],
  );

  const nextMilestone = settlementState.settlementFounded
    ? settlementState.empireFounded
      ? {
          title: "Rule the World",
          progress: "Empire Founded",
          cta: "View Empire",
          href: "/empire",
        }
      : settlementState.nationFounded
        ? {
            title: settlementState.bordersExpanded ? "Create Empire" : "Expand Borders",
            progress: settlementState.bordersExpanded ? "0 / 1 Empire" : "0 / 1 Expansion",
            cta: "View Nation",
            href: "/nation",
          }
        : settlementState.regionalAllianceFormed
          ? {
              title: "Found the First Nation",
              progress: "0 / 1 Nation",
              cta: "View Settlement",
              href: "/settlement",
            }
          : settlementState.tradeRouteEstablished
            ? {
                title: "Form Regional Alliance",
                progress: "0 / 1 Alliance",
                cta: "View Settlement",
                href: "/settlement",
              }
            : {
                title: "Build Your City",
                progress: settlementState.townHallBuilt ? "0 / 1 Trade Route" : "0 / 1 Core Building",
                cta: "View Settlement",
                href: "/settlement",
              }
    : {
        title: "Found the First Settlement",
        progress: "0 / 1 Settlement",
        cta: "Found Settlement",
        href: "/settlement/create",
      };

  const founderTitle = settlementState.empireFounded
    ? settlementState.empireName || "Aurelia"
    : settlementState.nationFounded
      ? settlementState.nationName || "Aurelia"
      : "Aurelia";

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white sm:px-10 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-amber-500/15 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
              Founder Dashboard
            </p>
            <Link
              href="/#world-preview"
              className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400"
            >
              Back To World
            </Link>
          </div>

          <h1 className="mt-8 break-words font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight text-amber-100 sm:text-5xl md:text-6xl">
            {`Founder of ${founderTitle}`}
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-zinc-500">
            Land ID
          </p>
          <p className="mt-2 font-[family-name:var(--font-syne)] text-xl font-bold uppercase tracking-[0.2em] text-white sm:text-2xl">
            Aurelia PN-0283
          </p>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg">
            &quot;The first record has been written.&quot;
          </p>
        </header>

        <section className="mt-10 grid gap-px border border-amber-500/15 bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-4">
          {founderStats.map((stat) => (
            <article key={stat.id} className="bg-[#08080f]/95 p-5 sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">{stat.label}</p>
              <p className="mt-3 font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight text-amber-100">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
              Territory Overview
            </p>
            <div className="mt-6 space-y-5">
              {territoryOverview.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-5 border-b border-amber-500/10 pb-4 last:border-b-0 last:pb-0"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{item.label}</span>
                  <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-zinc-200">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
              Founder Benefits
            </p>
            <ul className="mt-6 space-y-4">
              {founderBenefits.map((benefit) => (
                <li key={benefit} className="border-l border-amber-500/25 pl-4 text-sm leading-7 text-zinc-300">
                  <span className="mr-2 text-amber-300">{"\u2713"}</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-10 border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
            Your Next Milestone
          </p>
          <h2 className="mt-6 font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {nextMilestone.title}
          </h2>
          <div className="mt-6 flex flex-col gap-7">
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">
              Progress: {nextMilestone.progress}
            </p>
            <Link
              href={nextMilestone.href}
              className="btn-primary inline-flex w-fit rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
            >
              {nextMilestone.cta}
            </Link>
          </div>
        </section>

        <section className="mt-10 border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">World Milestones</p>
          <div className="mt-6 space-y-5">
            {worldMilestones.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-5 border-b border-amber-500/10 pb-4 last:border-b-0 last:pb-0"
              >
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">{item.label}</span>
                <span className="text-right font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 border-t border-amber-500/10 pt-8">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="rounded border border-zinc-800 bg-[#08080f]/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {isResetConfirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg border border-amber-500/20 bg-[#06060c] p-7 shadow-[0_30px_120px_rgba(0,0,0,0.7)] sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600/75">
              Reset Demo
            </p>
            <p className="mt-5 text-base leading-8 text-zinc-300">
              This clears your demo progress on this device.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  clearSettlementState();
                  setIsResetConfirmOpen(false);
                  router.push("/");
                }}
                className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100 sm:flex-1"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-400 sm:flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
