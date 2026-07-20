import approvedScene from "../../../../docs/visual-evidence/village-v2-approved-direction.webp";
import type { PlayState } from "../../lib/play-state";
import type { VillageV2LayerId } from "./village-layer-manifest";
import { getVisibleVillageV2Layers } from "./village-layer-manifest";

const CROPPED_SCENE_CLASS =
  "pointer-events-none absolute left-[-40.18%] top-[-44.44%] h-[182.86%] w-[182.86%] max-w-none select-none object-fill";

const LAYER_MASKS: Record<VillageV2LayerId, string> = {
  camp: "circle(18% at 50% 53%)",
  shelter: "ellipse(29% 27% at 27% 50%)",
  food: "ellipse(24% 23% at 22% 20%)",
  timber: "ellipse(24% 22% at 19% 79%)",
  storehouse: "ellipse(27% 24% at 76% 28%)",
  market: "ellipse(27% 22% at 77% 78%)",
  watch: "ellipse(21% 21% at 89% 15%)",
  council: "inset(0)",
};

const QA_MARKERS: Record<VillageV2LayerId, { selector: string; left: string; top: string }> = {
  camp: { selector: "village-hearth-smoke", left: "50%", top: "53%" },
  shelter: { selector: "village-structure-hut", left: "27%", top: "50%" },
  food: { selector: "village-food-fields", left: "22%", top: "20%" },
  timber: { selector: "village-timber-yards", left: "19%", top: "79%" },
  storehouse: { selector: "village-storehouse-visual", left: "76%", top: "28%" },
  market: { selector: "village-market-activity", left: "77%", top: "78%" },
  watch: { selector: "village-watch-visual", left: "89%", top: "15%" },
  council: { selector: "village-council-visual", left: "50%", top: "38%" },
};

export function VillageStageV2({ state }: { state: PlayState }) {
  const visibleLayers = getVisibleVillageV2Layers(state);
  const latestLayer = visibleLayers.at(-1);

  return (
    <div
      data-qa="village-v2-stage"
      data-visual-source-sha="4cd457ae32ce43b58daba131f78602dab960d193"
      className="relative h-full w-full overflow-hidden bg-[#171810]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={approvedScene.src}
          alt=""
          draggable={false}
          loading="eager"
          decoding="sync"
          data-qa="village-v2-base"
          data-layer-id="base"
          className={`${CROPPED_SCENE_CLASS} scale-[1.015] blur-[11px] brightness-[0.36] saturate-[0.58] contrast-[1.08]`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_53%,rgba(245,158,11,.12),transparent_34%),linear-gradient(to_bottom,rgba(11,18,12,.06),rgba(7,10,7,.28))]" />
      </div>

      {visibleLayers.map((layer, index) => {
        const marker = QA_MARKERS[layer.id];
        return (
          <div key={layer.id}>
            <div
              data-qa="village-v2-layer"
              data-layer-id={layer.id}
              data-layer-order={layer.order}
              className="absolute inset-0 overflow-hidden [animation:village-v2-reveal_760ms_cubic-bezier(.2,.78,.22,1)_both]"
              style={{
                clipPath: LAYER_MASKS[layer.id],
                animationDelay: `${Math.min(index, 4) * 35}ms`,
              }}
            >
              <img
                src={approvedScene.src}
                alt=""
                draggable={false}
                loading="eager"
                decoding="sync"
                className={`${CROPPED_SCENE_CLASS} brightness-[0.98] saturate-[1.04] contrast-[1.04]`}
              />
            </div>
            <span
              data-qa={marker.selector}
              aria-hidden="true"
              className="pointer-events-none absolute z-[2] h-0.5 w-0.5 bg-amber-100/10"
              style={{ left: marker.left, top: marker.top }}
            />
          </div>
        );
      })}

      {latestLayer ? (
        <div
          key={`settle-${latestLayer.id}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [animation:village-v2-settle_900ms_ease-out_both]"
          style={{ clipPath: LAYER_MASKS[latestLayer.id] }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_53%,rgba(251,191,36,.14),transparent_28%)]" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_70px_rgba(5,7,4,.48)]" />

      <style>{`
        @keyframes village-v2-reveal {
          0% { opacity: 0; filter: blur(7px) brightness(.62) saturate(.7); }
          58% { opacity: .94; filter: blur(1px) brightness(1.12) saturate(1.06); }
          100% { opacity: 1; filter: blur(0) brightness(1) saturate(1); }
        }
        @keyframes village-v2-settle {
          0% { opacity: 0; }
          34% { opacity: .9; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
