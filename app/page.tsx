"use client";

import { useRouter } from "next/navigation";

const arc = [
  { step: "01", title: "Raise the first camp", desc: "Begin with one land already under your banner." },
  { step: "02", title: "Build a settlement", desc: "Turn the camp into a living civic core." },
  { step: "03", title: "Found a nation", desc: "Expand your borders and write the first charter." },
  { step: "04", title: "Declare an empire", desc: "Secure the frontier, rule, and face what follows." },
];

export default function Home() {
  const router = useRouter();
  const enterPlay = () => router.push("/play");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020204] text-zinc-100">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(251,191,36,.14),transparent_32%),radial-gradient(circle_at_80%_22%,rgba(56,189,248,.08),transparent_34%),linear-gradient(180deg,#06090a_0%,#020204_100%)]" />
      <div aria-hidden className="absolute inset-0 opacity-[0.28]" style={{ backgroundImage: "linear-gradient(180deg, rgba(2,2,4,0.08), rgba(2,2,4,0.72)), url('/assets/world-map/aurelian-basin-v1.png')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,2,4,.28)_42%,#020204_78%)]" />

      <header className="relative z-10 border-b border-amber-200/10 bg-black/24 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/25 bg-amber-200/10 text-xs font-black text-amber-200">PN</span>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-100">Pixel Nations</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-100/45">Pre-alpha · Sector A-01</p>
            </div>
          </a>
          <button type="button" onClick={enterPlay} className="rounded-2xl border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-200/16">
            Play
          </button>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl flex-col justify-center px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-amber-200/65">Aurelian Basin · playable vertical slice</p>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-tight text-white md:text-7xl lg:text-8xl">
            One land can become an empire.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
            Begin at Aurelian Camp, raise a settlement, expand into a nation, declare an empire, and discover what your first decisions set in motion.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              data-qa="primary-play-demo"
              onClick={enterPlay}
              className="rounded-2xl border border-amber-200/55 bg-gradient-to-b from-amber-300/24 to-amber-800/14 px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-amber-50 shadow-[0_0_60px_rgba(251,191,36,.10)] transition hover:border-amber-100/70 hover:bg-amber-200/16"
            >
              Play Demo
            </button>
            <a href="mailto:tomat6@gmail.com?subject=Pixel%20Nations%20demo%20feedback&body=I%20visited%20the%20Pixel%20Nations%20demo.%0A%0AWhat%20felt%20exciting%3A%0A%0AWhat%20was%20confusing%3A%0A%0AWhat%20I%20would%20like%20next%3A%0A" className="rounded-2xl border border-white/10 bg-black/36 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-zinc-300 transition hover:border-amber-100/25 hover:text-amber-100">
              Send Feedback
            </a>
          </div>
        </div>

        <div className="mt-16 grid gap-3 md:grid-cols-4">
          {arc.map((item) => (
            <article key={item.step} className="rounded-3xl border border-amber-100/12 bg-black/42 p-5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200/45">{item.step}</p>
              <h2 className="mt-3 text-xl font-black text-amber-50">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{item.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-sky-200/12 bg-slate-950/52 p-5 backdrop-blur-md md:max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-100/55">Playable now</p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            This pre-alpha proves the complete first journey from one camp to an empire. Your progress is saved in this browser, and you can found a new empire whenever you want a clean run.
          </p>
        </div>
      </section>
    </main>
  );
}
