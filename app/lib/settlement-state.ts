export const SETTLEMENT_STORAGE_KEYS = {
  founded: "settlementFounded",
  name: "settlementName",
  population: "population",
  influence: "influence",
  region: "region",
  coordinates: "coordinates",
  founder: "founder",
  townHallBuilt: "townHallBuilt",
  settlementLevel: "settlementLevel",
  tradeRouteEstablished: "tradeRouteEstablished",
  tradeRouteDestination: "tradeRouteDestination",
  tradeRoutes: "tradeRoutes",
  regionalAllianceFormed: "regionalAllianceFormed",
  allianceName: "allianceName",
  alliancePartners: "alliancePartners",
  politicalStatus: "politicalStatus",
} as const;

export type SettlementState = {
  settlementFounded: boolean;
  settlementName: string;
  population: number;
  influence: number;
  region: string;
  coordinates: string;
  founder: string;
  townHallBuilt: boolean;
  settlementLevel: string;
  tradeRouteEstablished: boolean;
  tradeRouteDestination: string;
  tradeRoutes: number;
  regionalAllianceFormed: boolean;
  allianceName: string;
  alliancePartners: string[];
  politicalStatus: string;
};

export const DEFAULT_SETTLEMENT_STATE: SettlementState = {
  settlementFounded: false,
  settlementName: "",
  population: 0,
  influence: 1,
  region: "Aurelia",
  coordinates: "X19 / Y12",
  founder: "You",
  townHallBuilt: false,
  settlementLevel: "Outpost",
  tradeRouteEstablished: false,
  tradeRouteDestination: "",
  tradeRoutes: 0,
  regionalAllianceFormed: false,
  allianceName: "",
  alliancePartners: [],
  politicalStatus: "",
};

export function readSettlementState(): SettlementState {
  if (typeof window === "undefined") {
    return DEFAULT_SETTLEMENT_STATE;
  }

  const settlementFounded = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.founded) === "true";
  const settlementName = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.name) ?? "";
  const populationRaw = Number(localStorage.getItem(SETTLEMENT_STORAGE_KEYS.population));
  const influenceRaw = Number(localStorage.getItem(SETTLEMENT_STORAGE_KEYS.influence));
  const region = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.region) ?? DEFAULT_SETTLEMENT_STATE.region;
  const coordinates =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.coordinates) ?? DEFAULT_SETTLEMENT_STATE.coordinates;
  const founder = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.founder) ?? DEFAULT_SETTLEMENT_STATE.founder;
  const townHallBuilt = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.townHallBuilt) === "true";
  const settlementLevel =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.settlementLevel) ??
    DEFAULT_SETTLEMENT_STATE.settlementLevel;
  const tradeRouteEstablished =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.tradeRouteEstablished) === "true";
  const tradeRouteDestination =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.tradeRouteDestination) ??
    DEFAULT_SETTLEMENT_STATE.tradeRouteDestination;
  const tradeRoutesRaw = Number(localStorage.getItem(SETTLEMENT_STORAGE_KEYS.tradeRoutes));
  const regionalAllianceFormed =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.regionalAllianceFormed) === "true";
  const allianceName =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.allianceName) ??
    DEFAULT_SETTLEMENT_STATE.allianceName;
  const alliancePartnersRaw = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.alliancePartners);
  const politicalStatus =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.politicalStatus) ??
    DEFAULT_SETTLEMENT_STATE.politicalStatus;

  let alliancePartners: string[] = [];
  if (alliancePartnersRaw) {
    try {
      const parsed = JSON.parse(alliancePartnersRaw);
      if (Array.isArray(parsed)) {
        alliancePartners = parsed.filter((value): value is string => typeof value === "string");
      }
    } catch {
      alliancePartners = [];
    }
  }

  return {
    settlementFounded,
    settlementName,
    population: Number.isFinite(populationRaw) ? populationRaw : 0,
    influence: Number.isFinite(influenceRaw) ? influenceRaw : 1,
    region,
    coordinates,
    founder,
    townHallBuilt,
    settlementLevel,
    tradeRouteEstablished,
    tradeRouteDestination,
    tradeRoutes: Number.isFinite(tradeRoutesRaw) ? tradeRoutesRaw : 0,
    regionalAllianceFormed,
    allianceName,
    alliancePartners,
    politicalStatus,
  };
}

export function writeSettlementState(state: SettlementState) {
  if (typeof window === "undefined") return;

  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.founded, String(state.settlementFounded));
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.name, state.settlementName);
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.population, String(state.population));
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.influence, String(state.influence));
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.region, state.region);
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.coordinates, state.coordinates);
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.founder, state.founder);
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.townHallBuilt, String(state.townHallBuilt));
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.settlementLevel, state.settlementLevel);
  localStorage.setItem(
    SETTLEMENT_STORAGE_KEYS.tradeRouteEstablished,
    String(state.tradeRouteEstablished),
  );
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.tradeRouteDestination, state.tradeRouteDestination);
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.tradeRoutes, String(state.tradeRoutes));
  localStorage.setItem(
    SETTLEMENT_STORAGE_KEYS.regionalAllianceFormed,
    String(state.regionalAllianceFormed),
  );
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.allianceName, state.allianceName);
  localStorage.setItem(
    SETTLEMENT_STORAGE_KEYS.alliancePartners,
    JSON.stringify(state.alliancePartners),
  );
  localStorage.setItem(SETTLEMENT_STORAGE_KEYS.politicalStatus, state.politicalStatus);
}
