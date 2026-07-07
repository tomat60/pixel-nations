import type { PlayState } from "../lib/play-state";
import { getSectorIndexFromId, getSectorNeighborIds } from "../lib/world-engine";

export const homelandSectorId = "A-01";
export const expansionInfluenceCost = 2;
export const nationSectorThreshold = 3;
export type ExpansionBlockReason = "no-homeland" | "already-owned" | "insufficient-influence" | "not-adjacent";

export function getOwnedSectorIds(state: PlayState): string[] {
  const legacy = (state as PlayState & { ownedSectorIds?: string[] }).ownedSectorIds;
  if (legacy?.length) return legacy;
  return state.ownedPlotIds.length > 0 ? [homelandSectorId] : [];
}

export function getClaimableSectorIds(state: PlayState): string[] {
  const owned = getOwnedSectorIds(state);
  if (!owned.length) return [];
  const ownedSet = new Set(owned);
  const neighbors = owned.flatMap((id) => getSectorNeighborIds(getSectorIndexFromId(id)));
  return Array.from(new Set(neighbors)).filter((id) => !ownedSet.has(id));
}

export function getClaimedExpansionIds(state: PlayState): string[] {
  return state.scoutedPlotIds.filter((id) => id.startsWith("sector:")).map((id) => id.replace("sector:", ""));
}

export function buildOwnedSectorIds(state: PlayState): string[] {
  const base = getOwnedSectorIds(state);
  return Array.from(new Set([...base, ...getClaimedExpansionIds(state)]));
}

export function canExpandToSector(state: PlayState, sectorId: string) {
  const owned = buildOwnedSectorIds(state);
  const claimable = getClaimableSectorIds({ ...state, ownedSectorIds: owned } as PlayState & { ownedSectorIds: string[] });
  if (state.ownedPlotIds.length === 0) return { ok: false, reason: "no-homeland" as ExpansionBlockReason, owned, claimable };
  if (owned.includes(sectorId)) return { ok: false, reason: "already-owned" as ExpansionBlockReason, owned, claimable };
  if (!claimable.includes(sectorId)) return { ok: false, reason: "not-adjacent" as ExpansionBlockReason, owned, claimable };
  if (state.resources.influence < expansionInfluenceCost) return { ok: false, reason: "insufficient-influence" as ExpansionBlockReason, owned, claimable };
  return { ok: true, owned, claimable };
}

export function isNationReady(state: PlayState) {
  return buildOwnedSectorIds(state).length >= nationSectorThreshold;
}

export function expansionBlockedCopy(reason?: ExpansionBlockReason) {
  if (reason === "no-homeland") return "Claim a homeland before expanding.";
  if (reason === "already-owned") return "This sector is already inside your border.";
  if (reason === "not-adjacent") return "Expansion must start from an adjacent sector.";
  if (reason === "insufficient-influence") return `Expansion needs ${expansionInfluenceCost} Influence.`;
  return "Expansion blocked.";
}
