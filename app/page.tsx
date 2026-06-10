import { PixelWorldMap } from "./components/PixelWorldMap";

const navLinks = ["Explore", "Nations", "World Map"];

const progression = [
  {
    step: "01",
    title: "Claim Land",
    desc: "Choose your territory and plant the first banner.",
  },
  {
    step: "02",
    title: "Build Cities",
    desc: "Turn claimed land into strongholds of power.",
  },
  {
    step: "03",
    title: "Create Nations",
    desc: "Unite cities beneath one banner and one destiny.",
  },
  {
    step: "04",
    title: "Rule Empires",
    desc: "Project power across the world and shape history.",
  },
];

const worldScale = [
  { id: "lands", value: "10,000", label: "Finite Lands" },
  { id: "world", value: "1", label: "Persistent World" },
  { id: "territories", value: "100%", label: "Player-Owned Territory" },
  { id: "nations", value: "∞", label: "Player-Created Nations" },
];

export default function Home() {
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
            {navLinks.map((link) => (
              <li key={link}>
                <a href="#" className="nav-link text-sm font-medium text-zinc-500">
                  {link}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#"
            className="rounded border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-sm font-medium text-amber-300/90 transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-200"
          >
            Login
          </a>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative flex min-h-[calc(100vh-65px)] flex-col items-center justify-center overflow-hidden px-6 py-16 sm:px-10">
          {/* Subtle world map background */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 scale-125 opacity-[0.075]">
              <PixelWorldMap background className="h-full w-full" />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020204_70%)]" />
          </div>

          <div className="animate-fade-up relative z-10 flex max-w-4xl flex-col items-center text-center">
            <h1 className="font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[0.92] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              PIXEL
              <br />
              <span className="bg-gradient-to-b from-amber-100 via-amber-200/90 to-amber-600/70 bg-clip-text text-transparent">
                NATIONS
              </span>
            </h1>

            <p className="animate-fade-up animation-delay-200 mt-8 flex max-w-lg flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-zinc-500 sm:text-base">
              <span>Claim land.</span>
              <span>Build cities.</span>
              <span>Create nations.</span>
              <span>Rule empires.</span>
            </p>

            <div className="animate-fade-up animation-delay-400 mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <button
                type="button"
                className="btn-primary w-full rounded border border-amber-500/50 bg-gradient-to-b from-amber-500/25 to-amber-800/15 px-10 py-3.5 text-sm font-bold uppercase tracking-widest text-amber-100 sm:w-auto sm:px-12 sm:text-base"
              >
                Claim Your Land
              </button>

              <button
                type="button"
                className="btn-secondary w-full rounded border border-zinc-800 bg-[#08080f]/80 px-10 py-3.5 text-sm font-semibold uppercase tracking-widest text-zinc-400 sm:w-auto sm:px-12 sm:text-base"
              >
                View the World
              </button>
            </div>
          </div>
        </section>

        {/* Progression */}
        <section className="relative border-t border-amber-500/10 bg-[#030306]/80 px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center sm:mb-20">
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

        {/* World scale */}
        <section className="relative overflow-hidden border-t border-amber-500/10 bg-[#020204] px-6 py-28 sm:px-10 sm:py-40">
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
              Pixel Nations is not a game you play and leave behind. Every land
              is owned. Every nation is founded by a player. Every empire that
              rises and falls becomes part of a history that never resets.
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
              History shaped by players.
            </p>
          </div>
        </section>

        {/* World status */}
        <section className="px-6 py-16 sm:px-10 sm:py-20">
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

        {/* Lore */}
        <section className="border-t border-amber-500/10 px-6 pb-20 pt-4 sm:px-10 sm:pb-28">
          <div className="claim-card mx-auto max-w-3xl rounded border border-amber-500/15 bg-[#06060c]/70 px-8 py-12 text-center backdrop-blur-sm sm:px-14 sm:py-16">
            <div className="mx-auto mb-8 flex w-20 items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/50" />
              <span className="font-[family-name:var(--font-syne)] text-xs tracking-[0.4em] text-amber-600/60">
                ◆
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>

            <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl md:text-3xl">
              Every land has an owner.
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-zinc-600 sm:text-base">
              10,000 lands are waiting to be claimed by explorers, nations and
              future empires.
            </p>

            <button
              type="button"
              className="btn-primary mt-8 rounded border border-amber-500/40 bg-amber-500/10 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-amber-200"
            >
              Claim Your Land
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
