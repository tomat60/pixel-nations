import type { SettlementState } from "./settlement-state";

const FALLBACK_LAND = {
  landName: "Aurelia Grove",
  coordinates: "X19 / Y12",
  region: "Aurelia",
  terrain: "Plains",
};

export function getClaimedLandDisplay(state: SettlementState) {
  return {
    landName: state.claimedLandName || FALLBACK_LAND.landName,
    coordinates: state.claimedLandCoordinates || state.coordinates || FALLBACK_LAND.coordinates,
    region: state.claimedLandRegion || state.region || FALLBACK_LAND.region,
    terrain: state.claimedLandTerrain || FALLBACK_LAND.terrain,
  };
}

export function getOriginTrait(terrain: string) {
  const normalized = terrain.toLowerCase();

  const traits: Record<string, { trait: string; advantage: string }> = {
    forest: { trait: "Timber Supply", advantage: "Growth" },
    mountain: { trait: "Stone & Iron", advantage: "Defense" },
    coast: { trait: "Trade Reach", advantage: "Routes" },
    plains: { trait: "Food Growth", advantage: "Expansion" },
    crownland: { trait: "Legitimacy", advantage: "Influence" },
    crownlands: { trait: "Legitimacy", advantage: "Influence" },
    ruins: { trait: "Ancient Record", advantage: "Legacy" },
    basin: { trait: "Fresh Water", advantage: "Settlement" },
  };

  return traits[normalized] ?? { trait: "Balanced Ground", advantage: "Growth" };
}

export function formatLandClaimHistory(state: SettlementState) {
  if (state.claimedLandName) return `Land claimed: ${state.claimedLandName}`;
  return "Land claimed by You";
}

export function getDashboardOriginQuote(landName: string, region: string) {
  if (landName) return `"The first record has been written on ${landName}."`;
  return `"The first record has been written in ${region}."`;
}

export function getSettlementOriginQuote(terrain: string, region: string, landName: string) {
  const normalized = terrain.toLowerCase();

  if (landName) {
    if (normalized === "forest") return `"Built among the groves of ${landName}, the first city of ${region} begins here."`;
    if (normalized === "mountain") return `"Carved into the ridge of ${landName}, the first halls of ${region} rise here."`;
    if (normalized === "coast") return `"From the shores of ${landName}, ${region}'s first port city takes shape."`;
    if (normalized === "plains") return `"Across the open fields of ${landName}, the first city of ${region} takes root."`;
    if (normalized === "ruins") return `"Raised beside the ruins of ${landName}, a new chapter of ${region} begins."`;
    if (normalized === "crownland" || normalized === "crownlands") {
      return `"Founded on the prestige ground of ${landName}, ${region}'s first seat of power begins here."`;
    }
    return `"Built upon ${landName}, the first city of ${region} begins here."`;
  }

  return `"The first city of ${region} begins here."`;
}

export function getTerrainResourceValues(terrain: string, tradeRouteEstablished: boolean, tradeRouteDestination: string) {
  const base = { timber: 120, stone: 80, iron: 25, food: 200 };
  const normalized = terrain.toLowerCase();

  const values = { ...base };

  if (normalized === "forest") values.timber = 165;
  if (normalized === "mountain") {
    values.stone = 130;
    values.iron = 45;
  }
  if (normalized === "coast") {
    values.food = 180;
    values.iron = 30;
  }
  if (normalized === "plains") values.food = 260;
  if (normalized === "crownland" || normalized === "crownlands") {
    values.food = 220;
    values.stone = 95;
  }
  if (normalized === "ruins") values.stone = 110;
  if (normalized === "basin") values.food = 240;

  if (tradeRouteEstablished && tradeRouteDestination === "Iron Coast") values.iron = 40;
  if (tradeRouteEstablished && tradeRouteDestination === "Ember Basin") values.food = 240;

  return values;
}

export function getNationOriginQuote(landName: string, region: string) {
  if (landName) return `"Raised from ${landName}, the first banner of ${region} flies over the nation."`;
  return `"The first banner of ${region} has been raised."`;
}

export function getEmpireOriginQuote(landName: string) {
  if (landName) return `"${landName} remains the first imperial record of this reign."`;
  return `"The founding land remains the first imperial record of this reign."`;
}

export function getFounderMeaningLine(terrain: string) {
  const { trait, advantage } = getOriginTrait(terrain);
  return `${trait} / ${advantage}`;
}
