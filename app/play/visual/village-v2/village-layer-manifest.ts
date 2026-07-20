import type { PlayState } from "../../lib/play-state";

export type VillageV2LayerId =
  | "camp"
  | "shelter"
  | "food"
  | "timber"
  | "storehouse"
  | "market"
  | "watch"
  | "council";

export type VillageV2LayerDefinition = {
  id: VillageV2LayerId;
  src: string;
  qaStage: string;
  order: number;
};

export const VILLAGE_V2_BASE_ASSET = "/assets/village-v2/base-terrain.webp";

export const VILLAGE_V2_LAYER_DEFINITIONS: readonly VillageV2LayerDefinition[] = [
  { id: "camp", src: "/assets/village-v2/stage-01-camp.webp", qaStage: "camp", order: 1 },
  { id: "shelter", src: "/assets/village-v2/stage-02-shelter.webp", qaStage: "shelter", order: 2 },
  { id: "food", src: "/assets/village-v2/stage-03-food.webp", qaStage: "food", order: 3 },
  { id: "timber", src: "/assets/village-v2/stage-04-timber.webp", qaStage: "timber", order: 4 },
  { id: "storehouse", src: "/assets/village-v2/stage-05-storehouse.webp", qaStage: "storehouse", order: 5 },
  { id: "market", src: "/assets/village-v2/stage-06-market.webp", qaStage: "market", order: 6 },
  { id: "watch", src: "/assets/village-v2/stage-07-watch.webp", qaStage: "watch", order: 7 },
  { id: "council", src: "/assets/village-v2/stage-08-council.webp", qaStage: "council", order: 8 },
];

function isLayerVisible(id: VillageV2LayerId, state: PlayState): boolean {
  switch (id) {
    case "camp":
      return state.ownedPlotIds.length > 0;
    case "shelter":
      return state.settlementMarkers.includes("shelter");
    case "food":
      return state.completedOrders.includes("gather-food");
    case "timber":
      return state.completedOrders.includes("cut-timber");
    case "storehouse":
      return state.settlementMarkers.includes("storehouse");
    case "market":
      return state.settlementMarkers.includes("market");
    case "watch":
      return state.settlementMarkers.includes("watch");
    case "council":
      return state.settlementMarkers.includes("council");
    default:
      return false;
  }
}

export function getVisibleVillageV2Layers(state: PlayState): VillageV2LayerDefinition[] {
  return VILLAGE_V2_LAYER_DEFINITIONS.filter((layer) => isLayerVisible(layer.id, state)).sort(
    (a, b) => a.order - b.order,
  );
}
