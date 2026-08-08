import Image, { type StaticImageData } from "next/image";
import type { PlayAction, PlayState } from "../lib/play-state";
import { getDevelopmentScore, getOwnedPlot, getPhase, getPopulation } from "../lib/play-state";
import {
  aurelianVillageV4Stages,
  getAurelianSettlementStage,
  getAurelianVillageV4Stage,
  type AurelianVillageV4Stage,
} from "../lib/aurelian-progression";

import desktopBase from "../../../game/art_target/village_v4_reauthor/desktop/base-terrain.webp";
import desktopCamp from "../../../game/art_target/village_v4_reauthor/desktop/stage-01-camp.webp";
import desktopShelter from "../../../game/art_target/village_v4_reauthor/desktop/stage-02-shelter.webp";
import desktopFood from "../../../game/art_target/village_v4_reauthor/desktop/stage-03-food.webp";
import desktopTimber from "../../../game/art_target/village_v4_reauthor/desktop/stage-04-timber.webp";
import desktopScout from "../../../game/art_target/village_v4_reauthor/desktop/stage-05-scout.webp";
import desktopStorehouse from "../../../game/art_target/village_v4_reauthor/desktop/stage-06-storehouse.webp";
import desktopMarket from "../../../game/art_target/village_v4_reauthor/desktop/stage-07-market.webp";
import desktopWatch from "../../../game/art_target/village_v4_reauthor/desktop/stage-08-watch.webp";
import desktopCouncil from "../../../game/art_target/village_v4_reauthor/desktop/stage-09-council.webp";

import portraitBase from "../../../game/art_target/village_v4_reauthor/portrait/base-terrain.webp";
import portraitCamp from "../../../game/art_target/village_v4_reauthor/portrait/stage-01-camp.webp";
import portraitShelter from "../../../game/art_target/village_v4_reauthor/portrait/stage-02-shelter.webp";
import portraitFood from "../../../game/art_target/village_v4_reauthor/portrait/stage-03-food.webp";
import portraitTimber from "../../../game/art_target/village_v4_reauthor/portrait/stage-04-timber.webp";
import portraitScout from "../../../game/art_target/village_v4_reauthor/portrait/stage-05-scout.webp";
import portraitStorehouse from "../../../game/art_target/village_v4_reauthor/portrait/stage-06-storehouse.webp";
import portraitMarket from "../../../game/art_target/village_v4_reauthor/portrait/stage-07-market.webp";
import portraitWatch from "../../../game/art_target/village_v4_reauthor/portrait/stage-08-watch.webp";
import portraitCouncil from "../../../game/art_target/village_v4_reauthor/portrait/stage-09-council.webp";

type V4Layer = { id: AurelianVillageV4Stage; desktop: StaticImageData; portrait: StaticImageData };

const v4Layers: V4Layer[] = [
  { id: "camp", desktop: desktopCamp, portrait: portraitCamp },
  { id: "shelter", desktop: desktopShelter, portrait: portraitShelter },
  { id: "food", desktop: desktopFood, portrait: portraitFood },
  { id: "timber", desktop: desktopTimber, portrait: portraitTimber },
  { id: "scout", desktop: desktopScout, portrait: portraitScout },
  { id: "storehouse", desktop: desktopStorehouse, portrait: portraitStorehouse },
  { id: "market", desktop: desktopMarket, portrait: portraitMarket },
  { id: "watch", desktop: desktopWatch, portrait: portraitWatch },
  { id: "council", desktop: desktopCouncil, portrait: portraitCouncil },
];

export function AurelianVillageScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const legacyStageId = getAurelianSettlementStage(state) ?? "camp";
  const v4StageId = getAurelianVillageV4Stage(state) ?? "camp";
  const activeIndex = Math.max(0, v4Layers.findIndex((layer) => layer.id === v4StageId));
  const activeLayers = v4Layers.slice(0, activeIndex + 1);
  const stageLabel = aurelianVillageV4Stages.find((stage) => stage.id === v4StageId)?.label ?? "First camp";
  const owned = getOwnedPlot(state);
  const hasClaim = state.ownedPlotIds.length > 0;

  return (
    <section
      data-qa="aurelian-village-scene"
      data-aurelian-stage={legacyStageId}
      data-aurelian-v4-stage={v4StageId}
      data-aurelian-v4-layer-count={activeLayers.length}
      className="absolute inset-0 overflow-hidden bg-[#5e6a50]"
    >
      <div data-qa="aurelian-village-stage" className="absolute inset-0">
        <VillageArtImage src={portraitBase} viewport="portrait" qa="aurelian-v4-base" priority />
        <VillageArtImage src={desktopBase} viewport="desktop" qa="aurelian-v4-base" priority />

        {activeLayers.map((layer, index) => (
          <VillageArtImage
            key={`portrait-${layer.id}`}
            src={layer.portrait}
            viewport="portrait"
            qa="aurelian-v4-layer"
            stage={layer.id}
            priority={index === activeLayers.length - 1}
          />
        ))}
        {activeLayers.map((layer, index) => (
          <VillageArtImage
            key={`desktop-${layer.id}`}
            src={layer.desktop}
            viewport="desktop"
            qa="aurelian-v4-layer"
            stage={layer.id}
            priority={index === activeLayers.length - 1}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/16 via-transparent to-black/24" />
      </div>

      <div className="absolute left-3 right-3 top-[5.4rem] z-10 md:left-5 md:right-5 md:top-[5.9rem]">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-100/18 bg-black/42 px-3 py-1.5 shadow-xl backdrop-blur-sm md:px-3.5 md:py-2">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-amber-200/65">Sector A-01 · Aurelian Basin</p>
            <h2 className="truncate text-base font-black text-amber-50 md:text-xl">{owned?.name ?? "Aurelian homeland"}</h2>
          </div>
          <div className="hidden shrink-0 items-center gap-3 text-right md:flex">
            <CompactStat label="Stage" value={stageLabel} />
            <CompactStat label="People" value={getPopulation(state)} />
            <CompactStat label="Dev" value={getDevelopmentScore(state)} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[7.7rem] left-3 z-20 rounded-xl border border-amber-100/18 bg-black/42 px-3 py-2 shadow-xl backdrop-blur-sm md:bottom-5 md:left-5">
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-200/60">Settlement growth</p>
        <p className="mt-0.5 text-sm font-black text-amber-50">{stageLabel}</p>
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

function VillageArtImage({
  src,
  viewport,
  qa,
  stage,
  priority,
}: {
  src: StaticImageData;
  viewport: "desktop" | "portrait";
  qa: string;
  stage?: AurelianVillageV4Stage;
  priority?: boolean;
}) {
  const portrait = viewport === "portrait";
  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      data-qa={qa}
      data-aurelian-v4-image-stage={stage}
      data-aurelian-viewport={viewport}
      data-aurelian-active="true"
      fill
      priority={priority}
      sizes={portrait ? "(max-width: 767px) 100vw, 1px" : "(min-width: 768px) 100vw, 1px"}
      className={`pointer-events-none object-cover object-center ${portrait ? "md:hidden" : "hidden md:block"}`}
    />
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
