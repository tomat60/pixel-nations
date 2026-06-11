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
    landId: getClaimedLandIdDisplay(state),
    hasClaimedLand: Boolean(state.claimedLand && state.claimedLandName),
  };
}

export function getClaimedLandIdDisplay(
  stateOrId?: Pick<SettlementState, "claimedLandId" | "claimedLandPnId"> | string,
) {
  if (!stateOrId) return "";

  if (typeof stateOrId === "string") {
    return resolveClaimedLandPnId(stateOrId);
  }

  if (stateOrId.claimedLandPnId) return stateOrId.claimedLandPnId;
  return resolveClaimedLandPnId(stateOrId.claimedLandId);
}

function resolveClaimedLandPnId(claimedLandId?: string) {
  if (!claimedLandId) return "";

  const worldMatch = claimedLandId.match(/world-tile-(\d+)/);
  if (worldMatch) return `PN-${String(401 + Number(worldMatch[1])).padStart(4, "0")}`;

  const tileMatch = claimedLandId.match(/^tile-(\d+)$/);
  if (tileMatch) return `PN-${String(1 + Number(tileMatch[1])).padStart(4, "0")}`;

  if (/^PN-\d{4}$/.test(claimedLandId)) return claimedLandId;

  return "";
}

export function getDashboardHeroTitle(state: SettlementState) {
  const land = getClaimedLandDisplay(state);

  if (state.claimedLandName) {
    return land.region ? `${land.landName}, ${land.region}` : land.landName;
  }

  if (state.empireFounded) return state.empireName || land.region;
  if (state.nationFounded) return state.nationName || land.region;
  if (state.settlementFounded) return state.settlementName || land.landName;

  return land.region;
}

export function getOriginTrait(terrain: string) {
  const normalized = terrain.toLowerCase();

  const traits: Record<string, { trait: string; advantage: string }> = {
    forest: { trait: "Timber Supply", advantage: "Early Growth" },
    mountain: { trait: "Stone & Iron", advantage: "Defensive Position" },
    coast: { trait: "Trade Reach", advantage: "Route Access" },
    plains: { trait: "Food Growth", advantage: "Expansion Potential" },
    crownland: { trait: "Legitimacy", advantage: "Political Influence" },
    crownlands: { trait: "Legitimacy", advantage: "Political Influence" },
    ruins: { trait: "Ancient Record", advantage: "Legacy Value" },
    basin: { trait: "Fresh Water", advantage: "Settlement" },
  };

  return traits[normalized] ?? { trait: "Balanced Ground", advantage: "Growth" };
}

export function getDashboardTerrainQuote(terrain: string, hasClaimedLand: boolean) {
  if (!hasClaimedLand) {
    return '"The first record has been written."';
  }

  const normalized = terrain.toLowerCase();
  const quotes: Record<string, string> = {
    forest: '"The first banner rises between timber and shadow."',
    mountain: '"The first banner rises beneath stone and iron."',
    coast: '"The first banner rises where routes will begin."',
    plains: '"The first banner rises across open fields."',
    crownland: '"The first banner rises near the old seat of power."',
    crownlands: '"The first banner rises near the old seat of power."',
    ruins: '"The first banner rises where forgotten history waits."',
    basin: '"The first banner rises where fresh water gathers."',
  };

  return quotes[normalized] ?? '"The first record has been written."';
}

export function getOriginAdvantageLine(terrain: string) {
  const { trait, advantage } = getOriginTrait(terrain);
  return `${trait} / ${advantage}`;
}

export function formatLandClaimHistory(state: SettlementState) {
  if (state.claimedLandName) return `Land claimed: ${state.claimedLandName}`;
  return "Land claimed by You";
}

export function getEmpireHeroQuote(landName: string) {
  if (landName) return `"From ${landName}, the first empire entered the history of the world."`;
  return '"The first empire has entered the history of the world."';
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
  return getOriginAdvantageLine(terrain);
}
