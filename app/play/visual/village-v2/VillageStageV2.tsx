import type { PlayState } from "../../lib/play-state";
import type { VillageV2LayerId } from "./village-layer-manifest";
import { getVisibleVillageV2Layers } from "./village-layer-manifest";

const SNAPSHOTS = {
  camp: "/assets/village-v2-snapshots/01-camp.webp",
  shelter: "/assets/village-v2-snapshots/02-shelter.webp",
  growth: "/assets/village-v2-snapshots/04-growth.webp",
  developed: "/assets/village-v2-snapshots/07-developed.webp",
  council: "/assets/village-v2-snapshots/08-council.webp",
} as const;

const IMAGE_CLASS =
  "pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center [image-rendering:auto]";

function getSnapshot(visibleIds: Set<VillageV2LayerId>) {
  if (visibleIds.has("council")) return SNAPSHOTS.council;
  if (visibleIds.has("storehouse") || visibleIds.has("market") || visibleIds.has("watch")) return SNAPSHOTS.developed;
  if (visibleIds.has("food") || visibleIds.has("timber")) return SNAPSHOTS.growth;
  if (visibleIds.has("shelter")) return SNAPSHOTS.shelter;
  return SNAPSHOTS.camp;
}

function ProgressAccents({ visibleIds }: { visibleIds: Set<VillageV2LayerId> }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {visibleIds.has("food") ? (
        <div
          data-visual-accent="food"
          className="absolute left-[4%] top-[12%] h-[22%] w-[25%] -rotate-6 rounded-[42%] opacity-40 [animation:village-v2-accent-in_620ms_ease-out_both]"
          style={{ background: "repeating-linear-gradient(102deg, transparent 0 10px, rgba(250,204,21,.22) 11px 13px)" }}
        />
      ) : null}
      {visibleIds.has("timber") ? (
        <div
          data-visual-accent="timber"
          className="absolute bottom-[10%] left-[8%] h-[13%] w-[20%] rounded-[50%] bg-amber-950/16 shadow-[0_0_30px_rgba(120,53,15,.22)] [animation:village-v2-accent-in_620ms_ease-out_both]"
        />
      ) : null}
      {visibleIds.has("storehouse") ? (
        <div
          data-visual-accent="storehouse"
          className="absolute right-[14%] top-[20%] h-[19%] w-[22%] rounded-[45%] bg-amber-200/6 shadow-[0_0_34px_rgba(251,191,36,.15)] [animation:village-v2-accent-in_620ms_ease-out_both]"
        />
      ) : null}
      {visibleIds.has("market") ? (
        <div data-visual-accent="market" className="absolute bottom-[16%] right-[11%] flex gap-5 [animation:village-v2-accent-in_620ms_ease-out_both]">
          {[0, 1, 2].map((item) => (
            <span key={item} className="h-2 w-2 rounded-full bg-amber-200/55 shadow-[0_0_14px_5px_rgba(251,191,36,.2)]" />
          ))}
        </div>
      ) : null}
      {visibleIds.has("watch") ? (
        <div
          data-visual-accent="watch"
          className="absolute right-[8%] top-[9%] h-3 w-3 rounded-full bg-amber-100/65 shadow-[0_0_25px_11px_rgba(253,224,71,.24)] [animation:village-v2-beacon_1.8s_ease-in-out_infinite]"
        />
      ) : null}
    </div>
  );
}

export function VillageStageV2({ state }: { state: PlayState }) {
  const visibleLayers = getVisibleVillageV2Layers(state);
  const visibleIds = new Set(visibleLayers.map((layer) => layer.id));
  const snapshot = getSnapshot(visibleIds);
  const latestLayer = visibleLayers.at(-1)?.id ?? "camp";

  return (
    <div
      data-qa="village-v2-stage"
      data-village-v2-snapshot={snapshot}
      data-village-v2-latest={latestLayer}
      className="relative h-full w-full overflow-hidden bg-[#17170f]"
    >
      <img
        key={snapshot}
        src={snapshot}
        alt=""
        draggable={false}
        loading="eager"
        decoding="sync"
        data-qa="village-v2-base"
        data-layer-id={latestLayer}
        className={`${IMAGE_CLASS} [animation:village-v2-scene-in_680ms_cubic-bezier(.2,.78,.22,1)_both]`}
      />

      <ProgressAccents visibleIds={visibleIds} />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(4,7,4,.05),transparent_24%,transparent_74%,rgba(5,7,4,.22))] shadow-[inset_0_0_54px_rgba(2,4,2,.35)]" />

      <span data-qa="village-v2-layer" data-layer-id={latestLayer} data-layer-order={visibleLayers.length} className="pointer-events-none absolute inset-0" />

      <style>{`
        [data-qa="village-v2-stage"] + div:has([data-qa="village-credibility-layer"]) {
          opacity: .01 !important;
        }
        [data-qa="village-v2-stage"] ~ [data-qa="village-plot"] {
          border-color: transparent !important;
          background: transparent !important;
        }
        [data-qa="village-v2-stage"] ~ [data-qa="village-plot"] > * {
          opacity: 0 !important;
        }
        @keyframes village-v2-scene-in {
          0% { opacity: .38; transform: scale(1.018); filter: blur(5px) brightness(.72); }
          58% { opacity: 1; transform: scale(.998); filter: blur(.5px) brightness(1.06); }
          100% { opacity: 1; transform: scale(1); filter: blur(0) brightness(1); }
        }
        @keyframes village-v2-accent-in {
          0% { opacity: 0; transform: translateY(7px) scale(.96); filter: blur(5px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes village-v2-beacon {
          0%, 100% { opacity: .6; transform: scale(.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
