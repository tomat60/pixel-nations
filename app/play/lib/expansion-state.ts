import type { PlayState } from "./play-state";
import { getSectorIndexFromId, getSectorNeighborIds } from "./world-engine";

export const homelandSectorId = "A-01";
export const expansionInfluenceCost = 2;
export const nationSectorThreshold = 3;

export type ExpansionBlockReason = "no-homeland" | "already-owned" | "insufficient-influence" | "not-adjacent";

export type ExpansionStatus = {
  ok: boolean;
  reason?: ExpansionBlockReason;
  cost: number;
  ownedSectorIds: string[];
  claimableSectorIds: string[];
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
  if (ownedSectorIds.includes(sectorId)) return { ok: false, reason: "already-owned", cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
  if (!claimableSectorIds.includes(sectorId)) return { ok: false, reason: "not-adjacent", cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
  if (state.resources.influence < expansionInfluenceCost) return { ok: false, reason: "insufficient-influence", cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
  return { ok: true, cost: expansionInfluenceCost, ownedSectorIds, claimableSectorIds };
}

export function expansionBlockedMessage(reason?: ExpansionBlockReason) {
  if (reason === "no-homeland") return "Claim a homeland before expanding sectors.";
  if (reason === "already-owned") return "That sector is already inside your borders.";
  if (reason === "insufficient-influence") return `Expansion needs ${expansionInfluenceCost} Influence.`;
  if (reason === "not-adjacent") return "Expansion must start from an adjacent sector.";
  return "Expansion is blocked.";
}

export function getNationReady(state: PlayState) {
  return getOwnedSectorIds(state).length >= nationSectorThreshold;
}
