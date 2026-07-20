import approvedScene from "../../../../docs/visual-evidence/village-v2-approved-direction.webp";
import type { PlayState } from "../../lib/play-state";
import type { VillageV2LayerId } from "./village-layer-manifest";
import { getVisibleVillageV2Layers } from "./village-layer-manifest";

const CROPPED_SCENE_CLASS =
  "pointer-events-none absolute left-[-40.18%] top-[-44.44%] h-[182.86%] w-[182.86%] max-w-none select-none object-fill transition-[filter] duration-700 ease-out";

const SCENE_FILTERS = [
  "brightness(.58) saturate(.7) contrast(1.04) blur(2px)",
  "brightness(.65) saturate(.78) contrast(1.045) blur(1.6px)",
  "brightness(.71) saturate(.84) contrast(1.05) blur(1.2px)",
  "brightness(.77) saturate(.9) contrast(1.05) blur(.8px)",
  "brightness(.82) saturate(.94) contrast(1.055) blur(.5px)",
  "brightness(.87) saturate(.98) contrast(1.055) blur(.3px)",
  "brightness(.92) saturate(1) contrast(1.055) blur(.15px)",
  "brightness(.97) saturate(1.03) contrast(1.06) blur(0)",
  "brightness(1) saturate(1.05) contrast(1.06) blur(0)",
] as const;

const STAGE_GLOWS: Record<VillageV2LayerId, string> = {
  camp: "radial-gradient(circle at 51% 71%, rgba(251,146,60,.23), transparent 17%)",
  shelter: "radial-gradient(ellipse at 25% 43%, rgba(253,186,116,.14), transparent 26%)",
  food: "radial-gradient(ellipse at 10% 22%, rgba(250,204,21,.13), transparent 24%)",
  timber: "radial-gradient(ellipse at 15% 78%, rgba(180,83,9,.13), transparent 23%)",
  storehouse: "radial-gradient(ellipse at 78% 28%, rgba(251,191,36,.13), transparent 24%)",
  market: "radial-gradient(ellipse at 81% 73%, rgba(244,114,182,.11), transparent 25%)",
  watch: "radial-gradient(circle at 90% 15%, rgba(253,224,71,.16), transparent 19%)",
  council: "radial-gradient(ellipse at 51% 37%, rgba(251,191,36,.16), transparent 33%)",
};

function StageAccent({ id }: { id: VillageV2LayerId }) {
  if (id === "camp") {
    return (
      <div className="absolute left-[51%] top-[71%] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300/10 shadow-[0_0_38px_16px_rgba(251,146,60,.18)]" />
    );
  }
  if (id === "food") {
    return (
      <div className="absolute left-[3%] top-[14%] h-[13%] w-[18%] -rotate-6 rounded-[45%] bg-[repeating-linear-gradient(100deg,transparent_0_9px,rgba(250,204,21,.11)_10px_12px)]" />
    );
  }
  if (id === "watch") {
    return (
      <div className="absolute right-[7%] top-[10%] h-3 w-3 rounded-full bg-amber-100/48 shadow-[0_0_25px_10px_rgba(253,224,71,.22)]" />
    );
  }
  if (id === "council") {
    return (
      <>
        <div className="absolute left-[43%] top-[32%] h-8 w-1 rounded-full bg-amber-100/48 shadow-[0_0_15px_rgba(251,191,36,.3)]" />
        <div className="absolute left-[43.4%] top-[32%] h-4 w-7 rounded-r-md bg-amber-300/42" />
        <div className="absolute left-[61%] top-[35%] h-7 w-1 rounded-full bg-amber-100/4" />
        <div className="absolute left-[61.4%] top-[35%] h-3.5 w-6 rounded-r-md bg-red-300/32" />
      </>
    );
  }
  return null;
}

export function VillageStageV2({ state }: { state: PlayState }) {
  const visibleLayers = getVisibleVillageV2Layers(state);
  const progress = Math.min(visibleLayers.length, SCENE_FILTERS.length - 1);
  const latestLayer = visibleLayers.at(-1);

  return (
    <div
      data-qa="village-v2-stage"
      data-visual-source-sha="4cd457ae32ce43b58daba131f78602dab960d193"
      data-visual-progress={progress}
      className="relative h-full w-full overflow-hidden bg-[#171810]"
    >
      <img
        src={approvedScene.src}
        alt=""
        draggable={false}
        loading="eager"
        decoding="sync"
        data-qa="village-v2-base"
        data-layer-id="base"
        className={CROPPED_SCENE_CLASS}
        style={{ filter: SCENE_FILTERS[progress] }}
      />

      {visibleLayers.map((layer) => (
        <div
          key={layer.id}
          data-qa="village-v2-layer"
          data-layer-id={layer.id}
          data-layer-order={layer.order}
          className="pointer-events-none absolute inset-0 [animation:village-v2-accent_650ms_cubic-bezier(.2,.78,.22,1)_both]"
          style={{ background: STAGE_GLOWS[layer.id] }}
        >
          <StageAccent id={layer.id} />
        </div>
      ))}

      {latestLayer ? (
        <div
          key={`settle-${latestLayer.id}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [animation:village-v2-settle_820ms_ease-out_both]"
          style={{ background: STAGE_GLOWS[latestLayer.id] }}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,10,7,.03),transparent_22%,transparent_76%,rgba(5,7,4,.16))] shadow-[inset_0_0_56px_rgba(5,7,4,.3)]" />

      <style>{`
        [data-qa="village-v2-stage"] + div:has([data-qa="village-credibility-layer"]) {
          opacity: .52 !important;
          filter: saturate(.88) contrast(.96);
        }
        @keyframes village-v2-accent {
          0% { opacity: 0; transform: translateY(8px) scale(.992); filter: blur(5px); }
          62% { opacity: 1; transform: translateY(-1px) scale(1.002); filter: blur(.5px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes village-v2-settle {
          0% { opacity: 0; }
          36% { opacity: .65; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
