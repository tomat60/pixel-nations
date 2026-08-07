import type { OrderId, PlayState } from "./play-state";
import { getSectorIndexFromId, getSectorNeighborIds } from "./world-engine";

export const homelandSectorId = "A-01";
export const expansionInfluenceCost = 2;
export const nationSectorThreshold = 3;
export const citySettlementCycleThreshold = 3;
export const cityStabilityThreshold = 3;
export const cityProsperityThreshold = 3;

export type ExpansionBlockReason = "no-homeland" | "city-not-ready" | "already-owned" | "insufficient-influence" | "not-adjacent";

export type ExpansionStatus = {
  ok: boolean;
  reason?: ExpansionBlockReason;
  cost: number;
  ownedSectorIds: string[];
  claimableSectorIds: string[];
};

export type CityReadinessRequirementId =
  | "open-market"
  | "form-council"
  | "fortify-watch"
  | "settlement-cycles"
  | "stability"
  | "prosperity";

export type CityReadinessRequirement = {
  id: CityReadinessRequirementId;
  label: string;
  complete: boolean;
  current?: number;
  target?: number;
  orderId?: OrderId;
};

export type CityReadiness = {
  ready: boolean;
  requirements: CityReadinessRequirement[];
  nextRequirement: CityReadinessRequirement | null;
};

export function getOwnedSectorIds(state: PlayState): string[] {
  const legacyOwned = (state as PlayState & { ownedSectorIds?: string[] }).ownedSectorIds;
  if (legacyOwned?.length) return legacyOwned;
  return state.ownedPlotIds.length > 0 ? [homelandSectorId] : [];
}

export function getClaimableSectorIds(state: PlayState): string[] {
  const owned = getOwnedSectorIds(state);
  if (!owned.length) return [];
  const ownedSet = new Set(owned);
  const neighbors = owned.flatMap((sectorId) => getSectorNeighborIds(getSectorIndexFromId(sectorId)));
  return Array.from(new Set(neighbors)).filter((sectorId) => !ownedSet.has(sectorId));
}

export function canClaimSector(state: PlayState, sectorId: string): ExpansionStatus {
  const ownedSectorIds = getOwnedSectorIds(state);
  const claimableSectorIds = getClaimableSectorIds(state);
  if (state.ownedPlotIds.length === 0) return { ok: false, reason: "no-homeland", cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
  if (!getCityReadiness(state).ready) return { ok: false, reason: "city-not-ready", cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
  if (ownedSectorIds.includes(sectorId)) return { ok: false, reason: "already-owned", cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
  if (!claimableSectorIds.includes(sectorId)) return { ok: false, reason: "not-adjacent", cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
  if (state.resources.influence < expansionInfluenceCost) return { ok: false, reason: "insufficient-influence", cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
  return { ok: true, cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
}

export function expansionBlockedMessage(reason?: ExpansionBlockReason) {
  if (reason === "no-homeland") return "Claim a homeland before expanding sectors.";
  if (reason === "city-not-ready") return "Build a functioning City Seed before expanding into connected sectors.";
  if (reason === "already-owned") return "That sector is already inside your borders.";
  if (reason === "insufficient-influence") return `Expansion needs ${expansionInfluenceCost} Influence.`;
  if (reason === "not-adjacent") return "Expansion must start from an adjacent sector.";
  return "Expansion is blocked.";
}

export function getCityReadiness(state: PlayState): CityReadiness {
  const completedOrders = new Set(state.completedOrders);
  const requirements: CityReadinessRequirement[] = [
    {
      id: "open-market",
      label: "Open Market Path",
      complete: completedOrders.has("open-market"),
      orderId: "open-market",
    },
    {
      id: "form-council",
      label: "Form Council",
      complete: completedOrders.has("form-council"),
      orderId: "form-council",
    },
    {
      id: "fortify-watch",
      label: "Fortify Watch",
      complete: completedOrders.has("fortify-watch"),
      orderId: "fortify-watch",
    },
    {
      id: "settlement-cycles",
      label: "Complete 3 settlement cycles",
      complete: state.settlementCycles.length >= citySettlementCycleThreshold,
      current: state.settlementCycles.length,
      target: citySettlementCycleThreshold,
    },
    {
      id: "stability",
      label: "Reach Stability 3",
      complete: state.settlementStability >= cityStabilityThreshold,
      current: state.settlementStability,
      target: cityStabilityThreshold,
    },
    {
      id: "prosperity",
      label: "Reach Prosperity 3",
      complete: state.settlementProsperity >= cityProsperityThreshold,
      current: state.settlementProsperity,
      target: cityProsperityThreshold,
    },
  ];

  return {
    ready: requirements.every((requirement) => requirement.complete),
    requirements,
    nextRequirement: requirements.find((requirement) => !requirement.complete) ?? null,
  };
}

export function getNationReady(state: PlayState) {
  return getCityReadiness(state).ready && getOwnedSectorIds(state).length >= nationSectorThreshold;
}
