import type { OrderId, PlayState } from "./play-state";

export type AurelianSettlementStage = "camp" | "first_shelter" | "developed_settlement";
export type AurelianVillageV4Stage = "camp" | "shelter" | "food" | "timber" | "scout" | "storehouse" | "market" | "watch" | "council";

type V4StageDefinition = { id: AurelianVillageV4Stage; orderId: OrderId | null; label: string };

export const aurelianVillageV4Stages: V4StageDefinition[] = [
  { id: "camp", orderId: null, label: "First camp" },
  { id: "shelter", orderId: "raise-shelter", label: "First shelter" },
  { id: "food", orderId: "gather-food", label: "Food secured" },
  { id: "timber", orderId: "cut-timber", label: "Timber works" },
  { id: "scout", orderId: "scout-nearby", label: "Scout roads" },
  { id: "storehouse", orderId: "build-storehouse", label: "Storehouse district" },
  { id: "market", orderId: "open-market", label: "Market core" },
  { id: "watch", orderId: "fortify-watch", label: "Fortified watch" },
  { id: "council", orderId: "form-council", label: "Civic council" },
];

/**
 * Legacy three-stage semantic contract retained for existing gameplay QA and
 * save compatibility. Village V4 rendering uses the additive resolver below.
 */
export function getAurelianSettlementStage(state: Pick<PlayState, "ownedPlotIds" | "settlementMarkers">): AurelianSettlementStage | null {
  if (state.ownedPlotIds.length === 0) {
    return null;
  }

  if (!state.settlementMarkers.includes("shelter")) {
    return "camp";
  }

  const hasDevelopedSettlement = state.settlementMarkers.some((marker) =>
    marker === "storehouse" || marker === "market" || marker === "council" || marker === "watch",
  );

  return hasDevelopedSettlement ? "developed_settlement" : "first_shelter";
}

/**
 * Runtime-only visual resolver for the accepted Village V4 additive art.
 * It derives presentation exclusively from existing completed orders: no new
 * reducer field, migration or gameplay semantic is introduced.
 */
export function getAurelianVillageV4Stage(state: Pick<PlayState, "ownedPlotIds" | "completedOrders">): AurelianVillageV4Stage | null {
  if (state.ownedPlotIds.length === 0) return null;

  let active: AurelianVillageV4Stage = "camp";
  for (const stage of aurelianVillageV4Stages) {
    if (stage.orderId && state.completedOrders.includes(stage.orderId)) active = stage.id;
  }
  return active;
}
