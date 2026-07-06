"use client";

import { useRouter } from "next/navigation";

const legacyRoutes = [
  { href: "/world", label: "Legacy world" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settlement", label: "Settlement" },
  { href: "/nation", label: "Nation" },
  { href: "/empire", label: "Empire" },
];

const loopSteps = [
  {
    step: "01",
    title: "Claim one land",
    desc: "Start directly on the fullscreen Aurelian Basin map and choose your first plot.",
  },
  {
    step: "02",
    title: "Take one order",
    desc: "Pick the first visible founder order instead of leaving the player in a static landing page.",
  },
  {
    step: "03",
    title: "See consequence",
    desc: "The HUD, season clock and map state react inside one canonical play shell.",
  },
];

export default function Home() {
  const router = useRouter();

  const enterPlay = () => router.push("/play");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020204] text-zinc-100">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(2,2,4,0.04), rgba(2,2,4,0.82)), url('/assets/world-map/aurelian-basin-v1.png')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(201,169,98,0.18)_0%,rgba(2,2,4,0.18)_35%,#020204_82%)]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#020204] to-transparent" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-10">
        <header className="flex items-center justify-between border-b border-amber-500/15 pb-5">
          <a href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-85">
            <span className="flex h-9 w-9 items-center justify-center border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-300">
              PN
            </span>
            <span className="font-[family-name:var(--font-syne)] text-sm font-semibold uppercase tracking-[0.28em] text-zinc-200 sm:text-base">
              Pixel Nations
            </span>
          </a>

          <button
            type="button"
            onClick={enterPlay}
            className="rounded border border-amber-500/45 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-100 transition-colors hover:border-amber-400/70 hover:bg-amber-500/15 sm:px-5"
          >
            Play Now
          </button>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)] lg:py-20">
          <div className="max-w-4xl">
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.45em] text-amber-500/80">
              Milestone 2 Route Absorption
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl">
              Enter the world
              <br />
              <span className="bg-gradient-to-b from-amber-100 via-amber-300 to-amber-700 bg-clip-text text-transparent">
                through /play.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              The public demo now starts in the fullscreen map-first game surface. Claim land, choose one founder order and watch the first HUD and map consequences without detouring through legacy routes.
            </p>

            <div className="mt-11 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={enterPlay}
                className="rounded border border-amber-500/65 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-8 py-4 text-sm font-bold uppercase tracking-[0.22em] text-amber-100 shadow-[0_0_60px_rgba(201,169,98,0.14)] transition-all hover:border-amber-300 hover:shadow-[0_0_80px_rgba(201,169,98,0.2)]"
              >
                Claim Your First Land
              </button>
              <a
                href="#legacy-routes"
                className="rounded border border-zinc-800 bg-[#08080f]/80 px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.22em] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
              >
                View fallback routes
              </a>
            </div>
          </div>

          <aside className="border border-amber-500/20 bg-[#050509]/86 p-4 shadow-[0_32px_140px_rgba(0,0,0,0.55),0_0_80px_rgba(201,169,98,0.08)] backdrop-blur-sm sm:p-5">
            <div className="relative min-h-[420px] overflow-hidden border border-amber-500/15 bg-[#020204]">
              <img
                src="/assets/world-map/aurelian-basin-v1.png"
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,2,4,0.04),rgba(2,2,4,0.72))]" />
              <div className="absolute left-4 top-4 border border-amber-500/25 bg-[#030306]/82 px-4 py-3 backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-amber-500/80">Canonical Entry</p>
                <p className="mt-1 font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">/play</p>
              </div>
              <div className="absolute inset-x-4 bottom-4 border border-amber-500/20 bg-[#030306]/86 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">Aurelian Basin</p>
                <p className="mt-2 text-sm leading-6 text-amber-100/85">
                  Fullscreen map foundation, season HUD and first-order loop are now the front door.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="grid gap-4 border-y border-amber-500/12 py-8 md:grid-cols-3">
          {loopSteps.map((item) => (
            <article key={item.step} className="border border-amber-500/12 bg-[#06060c]/70 p-6">
              <p className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-amber-500/55">{item.step}</p>
              <h2 className="mt-5 font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-amber-100">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-500">{item.desc}</p>
            </article>
          ))}
        </section>

        <section id="legacy-routes" className="py-8">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-600">
            Legacy debug routes remain accessible, but they are no longer the primary demo path.
          </p>
          <div className="flex flex-wrap gap-3">
            {legacyRoutes.map((route) => (
              <a
                key={route.href}
                href={route.href}
                className="rounded border border-zinc-800 bg-[#06060c]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
              >
                {route.label}
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
