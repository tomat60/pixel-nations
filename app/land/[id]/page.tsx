import Link from "next/link";
import type { Metadata } from "next";

type LandStatus = "Unclaimed" | "Claimed";

type Land = {
  id: string;
  name: string;
  coordinates: string;
  owner: string;
  status: LandStatus;
  region: string;
  climate: string;
  resources: string[];
  nearbyCities: string[];
  historicalNotes: string[];
  strategicValue: string;
};

const lands: Land[] = [
  {
    id: "aurelia-0412",
    name: "Aurelia Gate",
    coordinates: "X12 / Y18",
    owner: "Unclaimed",
    status: "Unclaimed",
    region: "Aurelia",
    climate: "Temperate highland",
    resources: ["Stone", "Grain", "Freshwater", "Gold Veins"],
    nearbyCities: ["No cities founded", "Eastern road planned"],
    historicalNotes: [
      "Surveyors marked Aurelia Gate as a natural crossing between fertile valleys and defensive ridges.",
      "Its first owner may control the earliest route into the heartland.",
    ],
    strategicValue: "Founder-grade land with strong settlement potential.",
  },
  {
    id: "iron-coast-0098",
    name: "Harbor of Veyr",
    coordinates: "X06 / Y14",
    owner: "House Marrow",
    status: "Claimed",
    region: "Iron Coast",
    climate: "Cold maritime",
    resources: ["Iron", "Salt", "Timber", "Deepwater Harbor"],
    nearbyCities: ["Veyr Watch", "Blackwake Anchorage"],
    historicalNotes: [
      "The first coastal trade posts formed around protected inlets and iron-rich cliffs.",
      "Control of this coastline may decide the early balance of maritime power.",
    ],
    strategicValue: "Trade-focused territory with defensive shoreline access.",
  },
  {
    id: "ember-basin-0721",
    name: "Ashen Hollow",
    coordinates: "X17 / Y21",
    owner: "Unclaimed",
    status: "Unclaimed",
    region: "Ember Basin",
    climate: "Dry volcanic basin",
    resources: ["Obsidian", "Sulfur", "Clay", "Ancient Ruins"],
    nearbyCities: ["No cities founded", "Ruined causeway nearby"],
    historicalNotes: [
      "Old survey maps describe buried foundations beneath the basin floor.",
      "Whoever settles here may inherit both danger and forgotten advantage.",
    ],
    strategicValue: "Rare resource land suited for ambitious early builders.",
  },
];

function getLand(id: string) {
  return lands.find((land) => land.id === id) ?? lands[0];
}

export function generateStaticParams() {
  return lands.map((land) => ({ id: land.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const land = getLand(id);

  return {
    title: `${land.name} | Pixel Nations`,
    description: `${land.name} is a ${land.status.toLowerCase()} land in ${land.region}.`,
  };
}

export default async function LandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const land = getLand(id);
  const isUnclaimed = land.status === "Unclaimed";

  return (
    <main className="min-h-screen overflow-hidden bg-[#020204] text-white">
      <section className="relative px-6 py-8 sm:px-10 lg:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,98,0.12)_0%,transparent_52%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-80 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-amber-700/8 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <header className="flex items-center justify-between border-b border-amber-500/10 pb-6">
            <Link
              href="/"
              className="group flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <span className="flex h-9 w-9 items-center justify-center border border-amber-500/35 bg-amber-500/10">
                <span className="font-[family-name:var(--font-syne)] text-xs font-bold text-amber-400">
                  PN
                </span>
              </span>
              <span className="font-[family-name:var(--font-syne)] text-sm font-semibold tracking-widest text-zinc-200">
                PIXEL NATIONS
              </span>
            </Link>

            <Link
              href="/"
              className="hidden text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600 transition-colors hover:text-amber-300 sm:block"
            >
              Back To World
            </Link>
          </header>

          <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14 lg:py-18">
            <div>
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="border border-amber-500/25 bg-amber-500/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-400/90">
                  Land Detail
                </span>
                {isUnclaimed ? (
                  <span className="border border-amber-400/35 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200">
                    Founder Opportunity
                  </span>
                ) : null}
              </div>

              <h1 className="font-[family-name:var(--font-syne)] text-5xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl">
                {land.name}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-500 sm:text-lg">
                {land.strategicValue}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-amber-500/15 bg-amber-500/10 sm:grid-cols-4">
                {[
                  ["Grid", land.coordinates],
                  ["Status", land.status],
                  ["Region", land.region],
                  ["Owner", land.owner],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#06060c]/95 p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-600">
                      {label}
                    </p>
                    <p className="mt-3 font-[family-name:var(--font-syne)] text-lg font-bold text-amber-100">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 overflow-hidden border border-amber-500/15 bg-[#050509]/80 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.45),0_0_80px_rgba(201,169,98,0.06)] sm:p-6">
                <div className="relative aspect-[16/9] overflow-hidden bg-[#030306]">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(201,169,98,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.45)_1px,transparent_1px)] [background-size:28px_28px]"
                  />
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-[320px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl"
                  />
                  <div className="absolute inset-6 grid grid-cols-12 gap-1 sm:inset-10">
                    {Array.from({ length: 96 }, (_, index) => {
                      const isSelected = index === 53;
                      const isRoute = [39, 40, 41, 52, 54, 65].includes(index);

                      return (
                        <span
                          key={index}
                          className={`transition-transform ${
                            isSelected
                              ? "scale-110 bg-amber-200 shadow-[0_0_28px_rgba(251,191,36,0.65)]"
                              : isRoute
                                ? "bg-amber-500/20"
                                : "bg-amber-500/[0.06]"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="mx-auto block h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.8)]" />
                    <p className="mt-3 border-l border-amber-500/35 bg-[#030306]/75 px-3 py-1 font-[family-name:var(--font-syne)] text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">
                      Selected Land
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="relative border border-amber-500/15 bg-[#06060c]/85 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.45)] lg:self-start">
              <div
                aria-hidden
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent"
              />

              <p className="font-[family-name:var(--font-syne)] text-sm font-bold uppercase tracking-[0.3em] text-amber-200/80">
                Claim Status
              </p>
              <p className="mt-5 text-sm leading-7 text-zinc-500">
                {isUnclaimed
                  ? "This land has no owner. Its first claim will define its origin story."
                  : "This land already belongs to a player. Future access must come through diplomacy, trade or conquest."}
              </p>

              <button
                type="button"
                className="btn-primary mt-7 w-full rounded border border-amber-500/55 bg-gradient-to-b from-amber-400/25 to-amber-800/15 px-6 py-4 text-sm font-bold uppercase tracking-widest text-amber-100 shadow-[0_0_48px_rgba(201,169,98,0.1)]"
              >
                Claim Land
              </button>

              <div className="mt-8 space-y-6 border-t border-amber-500/10 pt-7">
                <DetailGroup title="Climate" items={[land.climate]} />
                <DetailGroup title="Resources" items={land.resources} />
                <DetailGroup title="Nearby Cities" items={land.nearbyCities} />
              </div>
            </aside>
          </div>

          <section className="grid gap-8 border-t border-amber-500/10 py-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:py-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600/75">
                Historical Notes
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                Before the first banner.
              </h2>
            </div>

            <div className="space-y-5">
              {land.historicalNotes.map((note) => (
                <p key={note} className="text-base leading-8 text-zinc-500">
                  {note}
                </p>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function DetailGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-600">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="border border-amber-500/15 bg-amber-500/[0.035] px-3 py-1.5 text-xs text-zinc-400"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
