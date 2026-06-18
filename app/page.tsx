"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_SETTLEMENT_STATE, readSettlementState, type SettlementState } from "./lib/settlement-state";

const progression = [
  {
    step: "01",
    title: "Claim Land",
    desc: "Choose one land and plant the first banner.",
  },
  {
    step: "02",
    title: "Found Settlement",
    desc: "Turn claimed land into the first civic core.",
  },
  {
    step: "03",
    title: "Found Nation",
    desc: "Raise a capital, a banner, and a political identity.",
  },
  {
    step: "04",
    title: "Declare Empire",
    desc: "Complete the first rise from land to empire.",
  },
];

const worldScale = [
  { id: "lands", value: "10,000", label: "Finite Lands" },
  { id: "world", value: "1", label: "Persistent World" },
  { id: "territories", value: "1", label: "First Playable Sector" },
  { id: "nations", value: "4", label: "Demo Milestones" },
];

const differentiators = [
  {
    id: "player-owned-land",
    title: "One Land Matters",
    desc: "Every claimed land can become the origin of a city, nation and empire.",
  },
  {
    id: "persistent-history",
    title: "Founder Record",
    desc: "Claims, cities, nations and empires remain part of the demo history.",
  },
  {
    id: "nation-building",
    title: "Nation To Empire",
    desc: "The vertical slice follows one clear rise from city to nation to empire.",
  },
  {
    id: "emergent-politics",
    title: "Player-Made History",
    desc: "There are no scripted kingdoms. The first founders define the age.",
  },
];

const empireJourney = [
  {
    step: "01",
    title: "Claim Land",
    desc: "Claim your first land and secure your place in the world.",
    numberClass: "text-5xl sm:text-7xl",
    titleClass: "text-4xl sm:text-6xl md:text-7xl",
  },
  {
    step: "02",
    title: "Build City",
    desc: "Found the civic core that turns land into a city.",
    numberClass: "text-6xl sm:text-8xl",
    titleClass: "text-5xl sm:text-7xl md:text-8xl",
  },
  {
    step: "03",
    title: "Form Nation",
    desc: "Raise a capital and give your people one banner.",
    numberClass: "text-7xl sm:text-9xl",
    titleClass: "text-5xl sm:text-8xl md:text-9xl",
  },
  {
    step: "04",
    title: "Rule Empire",
    desc: "Complete the first demo arc and leave an imperial record.",
    numberClass: "text-7xl sm:text-9xl",
    titleClass: "text-5xl sm:text-8xl md:text-[8rem]",
  },
];

const playerWorldFeatures = [
  {
    id: "player-cities",
    title: "Founder Cities",
    desc: "Cities begin from claimed land and become the first centers of power.",
    className: "lg:col-span-7",
  },
  {
    id: "real-nations",
    title: "First Nations",
    desc: "Nations emerge when a capital and its founders choose one banner.",
    className: "lg:col-span-5 lg:translate-y-16",
  },
  {
    id: "strategic-routes",
    title: "Strategic Routes",
    desc: "Routes and regional ties give the first city a reason to grow.",
    className: "lg:col-span-5",
  },
  {
    id: "imperial-legacy",
    title: "Imperial Legacy",
    desc: "The first empire ends the opening arc and points to deeper play later.",
    className: "lg:col-span-7 lg:translate-y-12",
  },
  {
    id: "permanent-history",
    title: "Permanent History",
    desc: "Nothing resets. Every victory and defeat becomes part of the world.",
    className: "lg:col-span-12 lg:mx-auto lg:max-w-3xl",
  },
];

const onboardingSteps = [
  {
    step: "01",
    title: "Claim Land",
    desc: "Choose your place in the world.",
  },
  {
    step: "02",
    title: "Build Settlement",
    desc: "Create your first foothold.",
  },
  {
    step: "03",
    title: "Build Civic Core",
    desc: "Raise the first seat of power.",
  },
  {
    step: "04",
    title: "Found Nation",
    desc: "Turn a city into a banner.",
  },
  {
    step: "05",
    title: "Declare Empire",
    desc: "Complete the first rise.",
  },
];

export default function Home() {
  const router = useRouter();
  const [demoState, setDemoState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);

  useEffect(() => {
    setDemoState(readSettlementState());
  }, []);

  const hasDemoProgress = useMemo(
    () =>
      demoState.claimedLand ||
      demoState.settlementFounded ||
      demoState.nationFounded ||
      demoState.empireFounded,
    [demoState],
  );

  const demoProgressMessage = useMemo(() => {
    if (demoState.empireFounded) return "Empire founded. Continue from your empire.";
    if (demoState.nationFounded) return "Nation founded. Continue your rise.";
    if (demoState.settlementFounded) return "Settlement founded. Continue building.";
    if (demoState.claimedLand) return "Land claimed. Continue your demo.";
    return null;
  }, [demoState]);

  const handleStartDemo = useCallback(() => {
    if (demoState.empireFounded) {
      router.push("/empire");
      return;
    }
    if (demoState.nationFounded) {
      router.push("/nation");
      return;
    }
    if (demoState.settlementFounded) {
      router.push("/settlement");
      return;
    }
    if (demoState.claimedLand) {
      router.push("/dashboard");
      return;
    }
    router.push("/world");
  }, [demoState, router]);

  const stats = [
    { id: "lands", value: "10,000", label: "Lands" },
    { id: "first-city", value: "First City", label: "Awaits" },
    { id: "first-nation", value: "First Nation", label: "Awaits" },
    { id: "first-empire", value: "First Empire", label: "Awaits" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020204]">
      {/* Navigation */}
      <header className="animate-fade-up relative z-30 border-b border-[var(--border-subtle)] bg-[#020204]/95">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <a
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <span className="flex h-8 w-8 items-center justify-center border border-amber-500/35 bg-amber-500/10 transition-colors group-hover:border-amber-500/55 group-hover:bg-amber-500/15">
              <span className="font-[family-name:var(--font-syne)] text-xs font-bold text-amber-400">
                PN
              </span>
            </span>
            <span className="font-[family-name:var(--font-syne)] text-sm font-semibold tracking-widest text-zinc-200 sm:text-base">
              PIXEL NATIONS
            </span>
            <span className="hidden items-center gap-1.5 rounded border border-amber-500/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/70 sm:inline-flex">
              Pre-Alpha
            </span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            <li>
              <a href="#player-progression" className="nav-link text-sm font-medium text-zinc-500">
                Explore
              </a>
            </li>
            <li>
              <a href="#player-destiny" className="nav-link text-sm font-medium text-zinc-500">
                Nations
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={() => router.push("/world")}
                className="nav-link text-sm font-medium text-zinc-500"
              >
                World Map
              </button>
            </li>
          </ul>

          <button
            type="button"
            onClick={handleStartDemo}
            className="rounded border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-sm font-medium text-amber-300/90 transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-200"
          >
            Start Demo
          </button>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden px-6 py-18 sm:px-10 sm:py-24">
          {/* Aurelian Basin v9 world-map background */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.34]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(2,2,4,0.02), rgba(2,2,4,0.54)), url('/assets/world-map/aurelian-basin-v1.png')",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,2,4,0.2)_0%,#020204_74%)]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#020204] to-transparent" />
          </div>

          <div className="animate-fade-up relative z-10 flex max-w-5xl flex-col items-center text-center">
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.45em] text-amber-600/80">
              Pixel Nations
            </p>

            <h1 className="font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              History begins
              <br />
              <span className="bg-gradient-to-b from-amber-100 via-amber-200/90 to-amber-600/70 bg-clip-text text-transparent">
                with one land.
              </span>
            </h1>

            <p className="animate-fade-up animation-delay-200 mt-8 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
              A finite world of 10,000 lands is opening. Claim your first land,
              found a settlement, raise a nation and declare the first empire.
            </p>

            <div className="animate-fade-up animation-delay-400 mt-12 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={handleStartDemo}
                className="btn-primary w-full rounded border border-amber-500/60 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-10 py-4 text-sm font-bold uppercase tracking-widest text-amber-100 shadow-[0_0_48px_rgba(201,169,98,0.1)] sm:w-auto sm:px-12 sm:text-base"
              >
                Claim Your First Land
              </button>

              <button
                type="button"
                onClick={() => router.push("/world")}
                className="btn-secondary w-full rounded border border-zinc-800 bg-[#08080f]/80 px-10 py-4 text-sm font-semibold uppercase tracking-widest text-zinc-400 sm:w-auto sm:px-12 sm:text-base"
              >
                Preview Sector A-01
              </button>
            </div>

            <div className="mt-6 space-y-1 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-600/70">
                Playable MVP Demo
              </p>
              <p className="text-sm leading-6 text-zinc-500">
                Start by claiming one land. The demo then guides you through settlement, nation, and empire.
              </p>
              {hasDemoProgress && demoProgressMessage ? (
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
                  {demoProgressMessage}
                </p>
              ) : null}
            </div>

            <div className="animate-fade-up animation-delay-600 mt-16 w-full max-w-4xl border-y border-amber-500/15 py-6">
              <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
                <div>
                  <p className="font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
                    10,000
                  </p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-600">
                    Total Lands
                  </p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
                    0
                  </p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-600">
                    Claimed
                  </p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
                    10,000
                  </p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-600">
                    Available
                  </p>
                </div>
                <div>
                  <p className="font-[family-name:var(--font-syne)] text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
                    Forever
                  </p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-600">
                    Ownership
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progression */}
        <section
          id="player-progression"
          className="relative border-t border-amber-500/10 bg-[#030306]/80 px-6 py-28 sm:px-10 sm:py-36"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-18 text-center sm:mb-22">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/70">
                Player Progression
              </p>
              <h2 className="mt-5 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                From lone explorer to world ruler.
              </h2>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="absolute left-8 top-0 h-full w-px bg-gradient-to-b from-amber-500/0 via-amber-500/55 to-amber-500/0 lg:left-0 lg:right-0 lg:top-14 lg:mx-auto lg:h-px lg:w-[82%]"
              />

              <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-10">
                {progression.map((item) => (
                  <div
                    key={item.step}
                    className="progression-card group relative pl-22 lg:pl-0 lg:pt-24"
                  >
                    <div className="absolute left-0 top-0 flex h-16 w-16 items-center justify-center border border-amber-500/35 bg-[#08080f] text-amber-300 shadow-[0_0_32px_rgba(201,169,98,0.1)] lg:left-1/2 lg:top-0 lg:h-20 lg:w-20 lg:-translate-x-1/2">
                      <span className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-widest lg:text-2xl">
                        {item.step}
                      </span>
                    </div>

                    <div className="rounded border border-amber-500/15 bg-[#08080f]/70 p-8 transition-colors group-hover:border-amber-500/30 group-hover:bg-amber-500/[0.035] lg:min-h-60 lg:p-9 lg:text-center">
                      <h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-amber-100 sm:text-3xl lg:text-2xl">
                        {item.title}
                      </h3>
                      <p className="mt-6 text-sm leading-7 text-zinc-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Player-created world */}
        <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-30 sm:px-10 sm:py-42">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,98,0.08)_0%,transparent_58%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-900/8 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-600/75">
                Why This World Lasts
              </p>

              <h2 className="mt-8 font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.03] tracking-tight text-white sm:text-6xl md:text-7xl">
                No NPCs.
                <br />
                <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-700/70 bg-clip-text text-transparent">
                  No scripted kingdoms.
                </span>
              </h2>

              <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
                Everything that matters is created by players.
              </p>
            </div>

            <div className="mt-22 grid grid-cols-1 gap-7 lg:grid-cols-12 lg:gap-9">
              {playerWorldFeatures.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`group relative min-h-64 overflow-hidden border border-amber-500/12 bg-[#06060c]/70 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:bg-amber-500/[0.03] hover:shadow-[0_24px_80px_rgba(0,0,0,0.35),0_0_40px_rgba(201,169,98,0.05)] sm:p-10 ${feature.className}`}
                >
                  <div
                    aria-hidden
                    className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent transition-all duration-300 group-hover:via-amber-400/40"
                  />
                  <div
                    aria-hidden
                    className="absolute right-8 top-8 font-[family-name:var(--font-syne)] text-5xl font-extrabold text-amber-500/[0.06] transition-colors duration-300 group-hover:text-amber-500/[0.1]"
                  >
                    0{index + 1}
                  </div>

                  <div className="relative flex h-full max-w-xl flex-col justify-between">
                    <div>
                      <h3 className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-amber-100 transition-colors duration-300 group-hover:text-amber-50 sm:text-4xl">
                        {feature.title}
                      </h3>
                      <p className="mt-7 text-base leading-8 text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
                        {feature.desc}
                      </p>
                    </div>

                    <div
                      aria-hidden
                      className="mt-12 h-px w-20 bg-gradient-to-r from-amber-500/45 to-transparent transition-all duration-300 group-hover:w-36 group-hover:from-amber-400/70"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* World scale */}
        <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-30 sm:px-10 sm:py-42">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,98,0.07)_0%,transparent_55%)]"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-600/70">
              One World. Forever.
            </p>

            <h2 className="mx-auto mt-8 max-w-4xl font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              A persistent world,{" "}
              <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-600/70 bg-clip-text text-transparent">
                shaped by its players.
              </span>
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
              Pixel Nations begins with a simple promise: one land can become a city,
              a nation, and an empire. The first demo arc records that rise without
              pretending the whole world is finished.
            </p>

            <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-x-8 gap-y-14 sm:gap-x-12 lg:grid-cols-4">
              {worldScale.map((fact) => (
                <div key={fact.id} className="flex flex-col items-center">
                  <span className="font-[family-name:var(--font-syne)] text-4xl font-extrabold tracking-tight text-amber-100 sm:text-5xl md:text-6xl">
                    {fact.value}
                  </span>
                  <span className="mt-4 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-600 sm:text-xs">
                    {fact.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-20 max-w-xl text-sm uppercase tracking-[0.3em] text-amber-600/60">
              Written by players.
            </p>
          </div>
        </section>

        {/* Scarcity */}
        <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-30 sm:px-10 sm:py-42">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-700/8 blur-3xl"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-600/75">
              Only 10,000 Lands
            </p>

            <h2 className="mx-auto mt-8 max-w-4xl font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl md:text-7xl">
              A finite world.
              <br />
              <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-700/70 bg-clip-text text-transparent">
                Infinite ambition.
              </span>
            </h2>

            <div className="mx-auto mt-10 max-w-2xl space-y-6 text-base leading-8 text-zinc-500 sm:text-lg">
              <p>
                Every land in Pixel Nations can only be claimed once. There are
                no resets. No new continents. No second worlds.
              </p>
              <p>
                Early founders set the record. Later arrivals inherit the world they shaped.
              </p>
            </div>

            <div className="relative mx-auto mt-20 max-w-3xl border-y border-amber-500/20 py-14 sm:mt-24 sm:py-18">
              <div
                aria-hidden
                className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/35 to-transparent"
              />
              <div
                aria-hidden
                className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/25 to-transparent"
              />

              <p className="font-[family-name:var(--font-syne)] text-6xl font-extrabold leading-none tracking-tight text-amber-100 sm:text-8xl md:text-9xl">
                10,000
              </p>
              <p className="mt-5 font-[family-name:var(--font-syne)] text-2xl font-bold uppercase tracking-[0.45em] text-amber-500/80 sm:text-4xl">
                Lands
              </p>
              <p className="mt-4 font-[family-name:var(--font-syne)] text-xl font-bold uppercase tracking-[0.55em] text-zinc-500 sm:text-3xl">
                Forever
              </p>
            </div>

            <p className="mx-auto mt-14 max-w-xl text-base leading-8 text-zinc-500 sm:text-lg">
              When every land has an owner,
              <br />
              <span className="text-zinc-400">
                the frontier disappears forever.
              </span>
            </p>
          </div>
        </section>

        {/* Differentiators */}
        <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#030306] px-6 py-30 sm:px-10 sm:py-42">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,98,0.06)_0%,transparent_62%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-600/75">
                Why Pixel Nations
              </p>

              <h2 className="mt-8 font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
                Not another strategy game.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
                A world that belongs to its players.
              </p>
            </div>

            <div className="mt-22 grid grid-cols-1 gap-px overflow-hidden border border-amber-500/12 bg-amber-500/8 md:grid-cols-2">
              {differentiators.map((feature) => (
                <div
                  key={feature.id}
                  className="group relative min-h-72 bg-[#06060c]/92 p-8 transition-all duration-300 hover:bg-amber-500/[0.03] sm:p-10 lg:p-12"
                >
                  <div
                    aria-hidden
                    className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent transition-all duration-300 group-hover:via-amber-400/35"
                  />

                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-amber-100 transition-colors duration-300 group-hover:text-amber-50 sm:text-3xl">
                        {feature.title}
                      </h3>
                      <p className="mt-6 max-w-md text-sm leading-7 text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400 sm:text-base">
                        {feature.desc}
                      </p>
                    </div>

                    <div
                      aria-hidden
                      className="mt-12 h-px w-16 bg-gradient-to-r from-amber-500/45 to-transparent transition-all duration-300 group-hover:w-28 group-hover:from-amber-400/70"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* First era */}
        <section
          id="player-destiny"
          className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-34 sm:px-10 sm:py-48"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-700/7 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600/75">
              A World at Day One
            </p>

            <h2 className="mx-auto mt-10 max-w-5xl font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-6xl md:text-8xl">
              The first players
              <br />
              <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-700/65 bg-clip-text text-transparent">
                will shape everything.
              </span>
            </h2>

            <div className="mx-auto mt-18 max-w-2xl space-y-5 text-base leading-8 text-zinc-500 sm:text-lg">
              <p>The first explorers will claim the most valuable land.</p>
              <p>Early cities will become capitals.</p>
              <p>New nations will raise the first banners.</p>
              <p>Rising empires will write history.</p>
            </div>

            <div className="mx-auto mt-22 max-w-2xl border-y border-amber-500/15 py-10">
              <p className="font-[family-name:var(--font-syne)] text-2xl font-bold leading-tight tracking-tight text-zinc-200 sm:text-4xl">
                Latecomers inherit the world.
                <br />
                <span className="text-amber-200/90">Pioneers create it.</span>
              </p>
            </div>
          </div>
        </section>

        <section
          id="world-preview"
          className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-28 sm:px-10 sm:py-44"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(201,169,98,0.1)_0%,transparent_58%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-[-14rem] top-1/2 hidden h-[760px] w-[760px] -translate-y-1/2 rounded-full border border-amber-500/8 bg-[radial-gradient(circle_at_35%_35%,rgba(201,169,98,0.12)_0%,rgba(201,169,98,0.035)_34%,rgba(2,2,4,0.72)_72%,rgba(2,2,4,0.96)_100%)] shadow-[0_0_150px_rgba(201,169,98,0.08)] lg:block"
          />
          <div className="relative mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(520px,1fr)] lg:items-center xl:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600/75">
                World Preview
              </p>
              <h2 className="mt-7 max-w-4xl font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-7xl">
                The first frontier
                <br />
                <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-700/65 bg-clip-text text-transparent">
                  is already visible.
                </span>
              </h2>
              <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
                Aurelian Basin is Sector A-01: the first playable slice of a finite world of 10,000 lands.
                The full claim interaction lives on the world map.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/world")}
                  className="btn-primary rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-7 py-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-100"
                >
                  Enter Sector A-01
                </button>
                <button
                  type="button"
                  onClick={handleStartDemo}
                  className="btn-secondary rounded border border-zinc-800 bg-[#08080f]/80 px-7 py-3 text-xs font-bold uppercase tracking-[0.24em] text-zinc-400"
                >
                  Start Demo
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden border border-amber-500/25 bg-[#050509]/90 p-3 shadow-[0_40px_150px_rgba(0,0,0,0.68),0_0_120px_rgba(201,169,98,0.12)]">
              <div className="relative aspect-[4/3] min-h-[300px] overflow-hidden bg-[#030306] sm:min-h-[420px] lg:min-h-[520px]">
                <img
                  src="/assets/world-map/aurelian-basin-v1.png"
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-contain opacity-95 sm:object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,2,4,0.04),rgba(2,2,4,0.48))]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(2,2,4,0.72)_100%)]" />
                <div className="absolute left-4 top-4 border border-amber-500/25 bg-[#030306]/78 px-3 py-2 backdrop-blur-sm">
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-amber-500/80">
                    Sector A-01
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-syne)] text-sm font-bold text-amber-100">
                    Aurelian Basin
                  </p>
                </div>
                <div className="absolute bottom-4 right-4 border border-amber-500/15 bg-[#030306]/72 px-3 py-2 text-right backdrop-blur-sm">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                    Explore Sector A-01
                  </p>
                  <p className="mt-1 text-xs font-semibold text-amber-100/80">
                    Claim one land. Begin an empire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Empire journey */}
        <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-34 sm:px-10 sm:py-48">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-900/8 blur-3xl"
          />

          <div className="relative mx-auto max-w-5xl">
            <div className="mb-24 text-center sm:mb-32">
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-amber-600/75">
                Player Destiny
              </p>
              <h2 className="mx-auto mt-8 max-w-4xl font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl md:text-7xl">
                From one tile
                <br />
                <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-700/65 bg-clip-text text-transparent">
                  to an empire.
                </span>
              </h2>
            </div>

            <div className="space-y-20 sm:space-y-26">
              {empireJourney.map((item, index) => (
                <div
                  key={item.step}
                  className={`relative flex flex-col gap-8 ${
                    index % 2 === 0
                      ? "items-start text-left"
                      : "items-start text-left md:items-end md:text-right"
                  }`}
                >
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-4 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_28px_rgba(251,191,36,0.45)] md:block"
                  />

                  <div className="max-w-2xl">
                    <div className="mb-7 flex items-center gap-5 md:gap-7">
                      <span
                        className={`font-[family-name:var(--font-syne)] font-extrabold leading-none tracking-tight text-amber-500/55 ${item.numberClass}`}
                      >
                        {item.step}
                      </span>
                      <span className="h-px w-20 bg-gradient-to-r from-amber-500/55 to-transparent md:w-32" />
                    </div>

                    <h3
                      className={`font-[family-name:var(--font-syne)] font-extrabold uppercase leading-none tracking-tight text-amber-100 ${item.titleClass}`}
                    >
                      {item.title}
                    </h3>

                    <p className="mt-8 max-w-xl text-base leading-8 text-zinc-500 sm:text-lg">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* World status */}
        <section className="border-t border-amber-500/10 px-6 py-20 sm:px-10 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="animate-border-glow grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-amber-500/25 bg-amber-500/10 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="stat-card flex flex-col items-center justify-center bg-[#06060c]/95 px-5 py-10 sm:py-12"
                >
                  <span
                    className={`font-[family-name:var(--font-syne)] text-center font-bold tracking-tight text-amber-50 ${
                      stat.value === "10,000"
                        ? "text-2xl sm:text-3xl md:text-4xl"
                        : "text-base sm:text-lg md:text-xl"
                    }`}
                  >
                    {stat.value}
                  </span>
                  <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-600 sm:text-xs">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Onboarding roadmap */}
        <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-30 sm:px-10 sm:py-42">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,98,0.07)_0%,transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[58%] h-[420px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-900/8 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl md:text-7xl">
                Your first day in
                <br />
                <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-700/70 bg-clip-text text-transparent">
                  Pixel Nations.
                </span>
              </h2>

              <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
                The journey from founder to empire starts with a single land.
              </p>
            </div>

            <div className="relative mt-22">
              <div
                aria-hidden
                className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-500/35 to-transparent lg:left-0 lg:right-0 lg:top-16 lg:mx-auto lg:h-px lg:w-[88%]"
              />

              <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-8">
                {onboardingSteps.map((item, index) => (
                  <div
                    key={item.step}
                    className={`group relative pl-18 lg:pl-0 ${
                      index % 2 === 1 ? "lg:pt-28" : "lg:pt-0"
                    }`}
                  >
                    <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/35 bg-[#07070d] shadow-[0_0_32px_rgba(201,169,98,0.08)] transition-all duration-300 group-hover:border-amber-400/55 group-hover:shadow-[0_0_42px_rgba(201,169,98,0.16)] lg:left-1/2 lg:top-10 lg:-translate-x-1/2">
                      <span className="font-[family-name:var(--font-syne)] text-xs font-bold tracking-widest text-amber-300">
                        {item.step}
                      </span>
                    </div>

                    <div className="relative lg:mt-28">
                      <div
                        aria-hidden
                        className="mb-7 h-px w-16 bg-gradient-to-r from-amber-500/50 to-transparent transition-all duration-300 group-hover:w-24 group-hover:from-amber-400/75 lg:mx-auto"
                      />

                      <h3 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-amber-100 transition-colors duration-300 group-hover:text-amber-50 lg:text-center">
                        {item.title}
                      </h3>
                      <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400 lg:mx-auto lg:text-center">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-34 sm:px-10 sm:py-52">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,98,0.11)_0%,transparent_58%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-10 flex w-28 items-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/50" />
              <span className="font-[family-name:var(--font-syne)] text-xs tracking-[0.45em] text-amber-500/70">
                ◆
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>

            <h2 className="font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-7xl md:text-8xl">
              History will remember
              <br />
              <span className="bg-gradient-to-b from-amber-100 via-amber-300/90 to-amber-700/70 bg-clip-text text-transparent">
                the first.
              </span>
            </h2>

            <div className="mx-auto mt-12 max-w-2xl space-y-3 text-lg leading-8 text-zinc-500 sm:text-xl">
              <p>The first borders.</p>
              <p>The first crowns.</p>
              <p>The first legends.</p>
              <p className="pt-5 text-zinc-300">They have not been built yet.</p>
            </div>

            <div className="mt-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleStartDemo}
                className="btn-primary w-full rounded border border-amber-500/65 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-12 py-4 text-sm font-bold uppercase tracking-widest text-amber-100 shadow-[0_0_60px_rgba(201,169,98,0.12)] sm:w-auto sm:text-base"
              >
                Claim Your First Land
              </button>

              <button
                type="button"
                onClick={() => router.push("/world")}
                className="btn-secondary w-full rounded border border-zinc-800 bg-[#08080f]/80 px-12 py-4 text-sm font-semibold uppercase tracking-widest text-zinc-400 sm:w-auto sm:text-base"
              >
                View First Sector
              </button>

              <a
                href="mailto:tomat6@gmail.com?subject=Pixel%20Nations%20demo%20feedback&body=I%20visited%20the%20Pixel%20Nations%20demo.%0A%0AWhat%20felt%20exciting%3A%0A%0AWhat%20was%20confusing%3A%0A%0AWhat%20I%20would%20like%20next%3A%0A"
                className="w-full rounded border border-amber-500/20 bg-[#08080f]/55 px-12 py-4 text-center text-sm font-semibold uppercase tracking-widest text-amber-200/75 transition-colors hover:border-amber-500/35 hover:text-amber-100 sm:w-auto sm:text-base"
              >
                Send Feedback
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
