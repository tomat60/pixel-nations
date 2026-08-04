import type { PlayState } from "./play-state";

export type AurelianSettlementStage = "camp" | "first_shelter" | "developed_settlement";

/**
 * Product-level visual contract for the accepted Aurelian progression.
 *
 * The scene must begin at camp after land ownership, reveal exactly one shelter
 * after the shelter order, and remain on the accepted developed composition for
 * every later settlement state. Rendering details stay outside the state engine.
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
