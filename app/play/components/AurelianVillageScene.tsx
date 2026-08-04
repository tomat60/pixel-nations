import Image, { type StaticImageData } from "next/image";
import type { PlayAction, PlayState } from "../lib/play-state";
import { getDevelopmentScore, getOwnedPlot, getPhase, getPopulation } from "../lib/play-state";
import { getAurelianSettlementStage, type AurelianSettlementStage } from "../lib/aurelian-progression";
import campDesktop from "../../../review/aurelian-staged-progression-m1/aurelian-camp-desktop.png";
import campPortrait from "../../../review/aurelian-staged-progression-m1/aurelian-camp-portrait.png";
import shelterDesktop from "../../../review/aurelian-staged-progression-m1/aurelian-first_shelter-desktop.png";
import shelterPortrait from "../../../review/aurelian-staged-progression-m1/aurelian-first_shelter-portrait.png";
import developedDesktop from "../../../review/aurelian-staged-progression-m1/aurelian-developed_settlement-desktop.png";
import developedPortrait from "../../../review/aurelian-staged-progression-m1/aurelian-developed_settlement-portrait.png";

type StageVisual = { desktop: StaticImageData; portrait: StaticImageData; label: string; alt: string };

const stageVisuals: Record<AurelianSettlementStage, StageVisual> = {
  camp: {
    desktop: campDesktop,
    portrait: campPortrait,
    label: "First camp",
    alt: "A sparse camp beside the river and low bridge in Aurelian Basin",
  },
  first_shelter: {
    desktop: shelterDesktop,
    portrait: shelterPortrait,
    label: "First shelter",
    alt: "The first shelter connected to the retained camp in Aurelian Basin",
  },
  developed_settlement: {
    desktop: developedDesktop,
    portrait: developedPortrait,
    label: "Living settlement",
    alt: "The developed Aurelian settlement with homes, market, well and civic buildings",
  },
};

const stageEntries = Object.entries(stageVisuals) as Array<[AurelianSettlementStage, StageVisual]>;

export function AurelianVillageScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const stageId = getAurelianSettlementStage(state) ?? "camp";
  const visual = stageVisuals[stageId];
  const owned = getOwnedPlot(state);
  const hasClaim = state.ownedPlotIds.length > 0;

  return (
    <section
      data-qa="aurelian-village-scene"
      data-aurelian-stage={stageId}
      className="absolute inset-0 overflow-hidden bg-[#5e6a50]"
    >
      <div data-qa="aurelian-village-stage" className="absolute inset-0">
        {stageEntries.map(([candidateId, candidate]) => {
          const isActive = candidateId === stageId;
          return (
            <Image
              key={`portrait-${candidateId}`}
              src={candidate.portrait}
              alt={isActive ? candidate.alt : ""}
              aria-hidden={!isActive}
              data-qa="aurelian-stage-image"
              data-aurelian-image-stage={candidateId}
              data-aurelian-viewport="portrait"
              data-aurelian-active={isActive ? "true" : "false"}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 1px"
              className={`pointer-events-none object-cover object-center transition-opacity duration-300 md:hidden ${isActive ? "opacity-100" : "opacity-0"}`}
            />
          );
        })}
        {stageEntries.map(([candidateId, candidate]) => {
          const isActive = candidateId === stageId;
          return (
            <Image
              key={`desktop-${candidateId}`}
              src={candidate.desktop}
              alt={isActive ? candidate.alt : ""}
              aria-hidden={!isActive}
              data-qa="aurelian-stage-image"
              data-aurelian-image-stage={candidateId}
              data-aurelian-viewport="desktop"
              data-aurelian-active={isActive ? "true" : "false"}
              fill
              priority
              sizes="(min-width: 768px) 100vw, 1px"
              className={`pointer-events-none hidden object-cover object-center transition-opacity duration-300 md:block ${isActive ? "opacity-100" : "opacity-0"}`}
            />
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-transparent to-black/26" />
      </div>

      <div className="absolute left-3 right-3 top-[5.4rem] z-10 md:left-5 md:right-5 md:top-[5.9rem]">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-100/18 bg-black/42 px-3 py-1.5 shadow-xl backdrop-blur-sm md:px-3.5 md:py-2">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-amber-200/65">Sector A-01 · Aurelian Basin</p>
            <h2 className="truncate text-base font-black text-amber-50 md:text-xl">{owned?.name ?? "Aurelian homeland"}</h2>
          </div>
          <div className="hidden shrink-0 items-center gap-3 text-right md:flex">
            <CompactStat label="Stage" value={visual.label} />
            <CompactStat label="People" value={getPopulation(state)} />
            <CompactStat label="Dev" value={getDevelopmentScore(state)} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[7.7rem] left-3 z-20 rounded-xl border border-amber-100/18 bg-black/42 px-3 py-2 shadow-xl backdrop-blur-sm md:bottom-5 md:left-5">
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-200/60">Settlement growth</p>
        <p className="mt-0.5 text-sm font-black text-amber-50">{visual.label}</p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100/60">{getPhase(state)}</p>
      </div>

      {hasClaim ? (
        <>
          <button
            data-qa="village-scene-open-orders"
            onClick={() => dispatch({ type: "setView", view: "orders" })}
            className="absolute bottom-[5.2rem] left-4 right-4 z-30 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-2xl shadow-black/40 transition hover:bg-amber-200 lg:hidden"
          >
            Issue next order
          </button>
          <div className="absolute bottom-[5.5rem] right-5 z-20 hidden max-w-[290px] rounded-3xl border border-amber-100/18 bg-black/48 p-3 shadow-2xl backdrop-blur-md lg:block">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Latest order</p>
            <p className="mt-1 text-sm font-black text-amber-50">{state.lastEvent}</p>
            <button
              data-qa="village-scene-open-orders-desktop"
              onClick={() => dispatch({ type: "setView", view: "orders" })}
              className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-200"
            >
              Issue next order
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function CompactStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/45">{label}</p>
      <p className="text-xs font-black text-amber-50">{value}</p>
    </div>
  );
}
