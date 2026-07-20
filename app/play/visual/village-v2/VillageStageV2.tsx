import type { PlayState } from "../../lib/play-state";
import { VILLAGE_V2_BASE_ASSET, getVisibleVillageV2Layers } from "./village-layer-manifest";

const LAYER_IMAGE_CLASS =
  "pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[50%_50%] lg:object-[50%_50%] max-lg:object-[50%_46%]";

export function VillageStageV2({ state }: { state: PlayState }) {
  const visibleLayers = getVisibleVillageV2Layers(state);

  return (
    <div data-qa="village-v2-stage" className="relative h-full w-full overflow-hidden bg-[#0b120c]">
      <img
        src={VILLAGE_V2_BASE_ASSET}
        alt=""
        draggable={false}
        data-qa="village-v2-base"
        data-layer-id="base"
        className={LAYER_IMAGE_CLASS}
      />
      {visibleLayers.map((layer) => (
        <img
          key={layer.id}
          src={layer.src}
          alt=""
          draggable={false}
          data-qa="village-v2-layer"
          data-layer-id={layer.id}
          data-layer-order={layer.order}
          className={LAYER_IMAGE_CLASS}
        />
      ))}
    </div>
  );
}
