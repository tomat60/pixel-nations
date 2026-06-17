import { useCallback, useEffect, useState } from "react";

const DEMO_STATE_KEY = "pixelNations.demoState.v1";

export const SETTLEMENT_STORAGE_KEYS = {
  claimedLand: "claimedLand",
  claimedLandId: "claimedLandId",
  claimedLandName: "claimedLandName",
  claimedLandCoordinates: "claimedLandCoordinates",
  claimedLandRegion: "claimedLandRegion",
  claimedLandTerrain: "claimedLandTerrain",
  claimedLandPnId: "claimedLandPnId",
  claimedLandResources: "claimedLandResources",
  founderBadgeEarned: "founderBadgeEarned",
  founded: "settlementFounded",
  name: "settlementName",
  population: "population",
  influence: "influence",
  region: "region",
  coordinates: "coordinates",
  founder: "founder",
  townHallBuilt: "townHallBuilt",
  settlementLevel: "settlementLevel",
  settlementFocusId: "settlementFocusId",
  settlementFocus: "settlementFocus",
  settlementFocusBonus: "settlementFocusBonus",
  settlementFocusIdentity: "settlementFocusIdentity",
  tradeRouteEstablished: "tradeRouteEstablished",
  tradeRouteDestination: "tradeRouteDestination",
  tradeRouteId: "tradeRouteId",
  tradeRouteBonus: "tradeRouteBonus",
  tradeRouteResourceFlow: "tradeRouteResourceFlow",
  tradeRouteIdentity: "tradeRouteIdentity",
  tradeRoutes: "tradeRoutes",
  regionalAllianceFormed: "regionalAllianceFormed",
  allianceName: "allianceName",
  alliancePartners: "alliancePartners",
  allianceStrategy: "allianceStrategy",
  allianceBonus: "allianceBonus",
  allianceIdentity: "allianceIdentity",
  diplomaticReach: "diplomaticReach",
  politicalStatus: "politicalStatus",
  nationFounded: "nationFounded",
  nationName: "nationName",
  nationIdeology: "nationIdeology",
  landsControlled: "landsControlled",
  bordersExpanded: "bordersExpanded",
  expandedLands: "expandedLands",
  empireFounded: "empireFounded",
  empireName: "empireName",
  empireDoctrine: "empireDoctrine",
  cities: "cities",
} as const;

export type SettlementState = {
  claimedLand: boolean;
  claimedLandId?: string;
  claimedLandName?: string;
  claimedLandCoordinates?: string;
  claimedLandRegion?: string;
  claimedLandTerrain?: string;
  claimedLandPnId?: string;
  claimedLandResources?: string;
  founderBadgeEarned: boolean;
  settlementFounded: boolean;
  settlementName: string;
  population: number;
  influence: number;
  region: string;
  coordinates: string;
  founder: string;
  townHallBuilt: boolean;
  settlementLevel: string;
  settlementFocusId?: string;
  settlementFocus?: string;
  settlementFocusBonus?: string;
  settlementFocusIdentity?: string;
  tradeRouteEstablished: boolean;
  tradeRouteDestination: string;
  tradeRouteId?: string;
  tradeRouteBonus?: string;
  tradeRouteResourceFlow?: string;
  tradeRouteIdentity?: string;
  tradeRoutes: number;
  regionalAllianceFormed: boolean;
  allianceName: string;
  alliancePartners: string[];
  allianceStrategy?: string;
  allianceBonus?: string;
  allianceIdentity?: string;
  diplomaticReach?: number;
  politicalStatus: string;
  nationFounded: boolean;
  nationName: string;
  nationIdeology: string;
  landsControlled: number;
  bordersExpanded: boolean;
  expandedLands: string[];
  empireFounded: boolean;
  empireName: string;
  empireDoctrine: string;
  cities: number;
};

export const DEFAULT_SETTLEMENT_STATE: SettlementState = {
  claimedLand: false,
  claimedLandId: "",
  claimedLandName: "",
  claimedLandCoordinates: "",
  claimedLandRegion: "",
  claimedLandTerrain: "",
  claimedLandPnId: "",
  claimedLandResources: "",
  founderBadgeEarned: false,
  settlementFounded: false,
  settlementName: "",
  population: 0,
  influence: 1,
  region: "Aurelia",
  coordinates: "X19 / Y12",
  founder: "You",
  townHallBuilt: false,
  settlementLevel: "Outpost",
  settlementFocusId: "",
  settlementFocus: "",
  settlementFocusBonus: "",
  settlementFocusIdentity: "",
  tradeRouteEstablished: false,
  tradeRouteDestination: "",
  tradeRouteId: "",
  tradeRouteBonus: "",
  tradeRouteResourceFlow: "",
  tradeRouteIdentity: "",
  tradeRoutes: 0,
  regionalAllianceFormed: false,
  allianceName: "",
  alliancePartners: [],
  allianceStrategy: "",
  allianceBonus: "",
  allianceIdentity: "",
  diplomaticReach: 0,
  politicalStatus: "",
  nationFounded: false,
  nationName: "",
  nationIdeology: "",
  landsControlled: 1,
  bordersExpanded: false,
  expandedLands: [],
  empireFounded: false,
  empireName: "",
  empireDoctrine: "",
  cities: 1,
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function toSafeNumber(value: unknown, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function resolveClaimedLandPnId(claimedLandId?: string, claimedLandPnId?: string) {
  if (claimedLandPnId) return claimedLandPnId;
  if (!claimedLandId) return "";

  const worldMatch = claimedLandId.match(/world-tile-(\d+)/);
  if (worldMatch) return `PN-${String(401 + Number(worldMatch[1])).padStart(4, "0")}`;

  const tileMatch = claimedLandId.match(/^tile-(\d+)$/);
  if (tileMatch) return `PN-${String(1 + Number(tileMatch[1])).padStart(4, "0")}`;

  if (/^PN-\d{4}$/.test(claimedLandId)) return claimedLandId;

  return "";
}

function normalizeClaimedLandState(state: SettlementState): SettlementState {
  if (!state.claimedLand) return state;

  const claimedLandPnId = resolveClaimedLandPnId(state.claimedLandId, state.claimedLandPnId);
  if (!claimedLandPnId || claimedLandPnId === state.claimedLandPnId) return state;

  return { ...state, claimedLandPnId };
}

function sanitizeState(raw: unknown): SettlementState {
  const source = typeof raw === "object" && raw !== null ? (raw as Partial<SettlementState>) : {};

  return {
    ...DEFAULT_SETTLEMENT_STATE,
    claimedLand: source.claimedLand === true,
    claimedLandId: typeof source.claimedLandId === "string" ? source.claimedLandId : "",
    claimedLandName: typeof source.claimedLandName === "string" ? source.claimedLandName : "",
    claimedLandCoordinates:
      typeof source.claimedLandCoordinates === "string" ? source.claimedLandCoordinates : "",
    claimedLandRegion: typeof source.claimedLandRegion === "string" ? source.claimedLandRegion : "",
    claimedLandTerrain: typeof source.claimedLandTerrain === "string" ? source.claimedLandTerrain : "",
    claimedLandPnId: typeof source.claimedLandPnId === "string" ? source.claimedLandPnId : "",
    claimedLandResources:
      typeof source.claimedLandResources === "string" ? source.claimedLandResources : "",
    founderBadgeEarned: source.founderBadgeEarned === true,
    settlementFounded: source.settlementFounded === true,
    settlementName: typeof source.settlementName === "string" ? source.settlementName : "",
    population: toSafeNumber(source.population, DEFAULT_SETTLEMENT_STATE.population),
    influence: toSafeNumber(source.influence, DEFAULT_SETTLEMENT_STATE.influence),
    region: typeof source.region === "string" ? source.region : DEFAULT_SETTLEMENT_STATE.region,
    coordinates:
      typeof source.coordinates === "string" ? source.coordinates : DEFAULT_SETTLEMENT_STATE.coordinates,
    founder: typeof source.founder === "string" ? source.founder : DEFAULT_SETTLEMENT_STATE.founder,
    townHallBuilt: source.townHallBuilt === true,
    settlementLevel:
      typeof source.settlementLevel === "string"
        ? source.settlementLevel
        : DEFAULT_SETTLEMENT_STATE.settlementLevel,
    settlementFocusId:
      typeof source.settlementFocusId === "string"
        ? source.settlementFocusId
        : DEFAULT_SETTLEMENT_STATE.settlementFocusId,
    settlementFocus:
      typeof source.settlementFocus === "string"
        ? source.settlementFocus
        : DEFAULT_SETTLEMENT_STATE.settlementFocus,
    settlementFocusBonus:
      typeof source.settlementFocusBonus === "string"
        ? source.settlementFocusBonus
        : DEFAULT_SETTLEMENT_STATE.settlementFocusBonus,
    settlementFocusIdentity:
      typeof source.settlementFocusIdentity === "string"
        ? source.settlementFocusIdentity
        : DEFAULT_SETTLEMENT_STATE.settlementFocusIdentity,
    tradeRouteEstablished: source.tradeRouteEstablished === true,
    tradeRouteDestination:
      typeof source.tradeRouteDestination === "string"
        ? source.tradeRouteDestination
        : DEFAULT_SETTLEMENT_STATE.tradeRouteDestination,
    tradeRouteId:
      typeof source.tradeRouteId === "string"
        ? source.tradeRouteId
        : DEFAULT_SETTLEMENT_STATE.tradeRouteId,
    tradeRouteBonus:
      typeof source.tradeRouteBonus === "string"
        ? source.tradeRouteBonus
        : DEFAULT_SETTLEMENT_STATE.tradeRouteBonus,
    tradeRouteResourceFlow:
      typeof source.tradeRouteResourceFlow === "string"
        ? source.tradeRouteResourceFlow
        : DEFAULT_SETTLEMENT_STATE.tradeRouteResourceFlow,
    tradeRouteIdentity:
      typeof source.tradeRouteIdentity === "string"
        ? source.tradeRouteIdentity
        : DEFAULT_SETTLEMENT_STATE.tradeRouteIdentity,
    tradeRoutes: toSafeNumber(source.tradeRoutes, DEFAULT_SETTLEMENT_STATE.tradeRoutes),
    regionalAllianceFormed: source.regionalAllianceFormed === true,
    allianceName: typeof source.allianceName === "string" ? source.allianceName : "",
    alliancePartners: isStringArray(source.alliancePartners) ? source.alliancePartners : [],
    allianceStrategy: typeof source.allianceStrategy === "string" ? source.allianceStrategy : "",
    allianceBonus: typeof source.allianceBonus === "string" ? source.allianceBonus : "",
    allianceIdentity: typeof source.allianceIdentity === "string" ? source.allianceIdentity : "",
    diplomaticReach: toSafeNumber(source.diplomaticReach, DEFAULT_SETTLEMENT_STATE.diplomaticReach ?? 0),
    politicalStatus: typeof source.politicalStatus === "string" ? source.politicalStatus : "",
    nationFounded: source.nationFounded === true,
    nationName: typeof source.nationName === "string" ? source.nationName : "",
    nationIdeology: typeof source.nationIdeology === "string" ? source.nationIdeology : "",
    landsControlled: toSafeNumber(source.landsControlled, DEFAULT_SETTLEMENT_STATE.landsControlled),
    bordersExpanded: source.bordersExpanded === true,
    expandedLands: isStringArray(source.expandedLands) ? source.expandedLands : [],
    empireFounded: source.empireFounded === true,
    empireName: typeof source.empireName === "string" ? source.empireName : "",
    empireDoctrine: typeof source.empireDoctrine === "string" ? source.empireDoctrine : "",
    cities: toSafeNumber(source.cities, DEFAULT_SETTLEMENT_STATE.cities),
  };
}

function readLegacyState(): SettlementState {
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
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.allianceName) ?? DEFAULT_SETTLEMENT_STATE.allianceName;
  const alliancePartnersRaw = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.alliancePartners);
  const politicalStatus =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.politicalStatus) ?? DEFAULT_SETTLEMENT_STATE.politicalStatus;
  const nationFounded = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.nationFounded) === "true";
  const nationName =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.nationName) ?? DEFAULT_SETTLEMENT_STATE.nationName;
  const nationIdeology =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.nationIdeology) ?? DEFAULT_SETTLEMENT_STATE.nationIdeology;
  const landsControlledRaw = Number(localStorage.getItem(SETTLEMENT_STORAGE_KEYS.landsControlled));
  const bordersExpanded = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.bordersExpanded) === "true";
  const expandedLandsRaw = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.expandedLands);
  const empireFounded = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.empireFounded) === "true";
  const empireName =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.empireName) ?? DEFAULT_SETTLEMENT_STATE.empireName;
  const empireDoctrine =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.empireDoctrine) ?? DEFAULT_SETTLEMENT_STATE.empireDoctrine;
  const citiesRaw = Number(localStorage.getItem(SETTLEMENT_STORAGE_KEYS.cities));
  const claimedLand = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.claimedLand) === "true";
  const claimedLandId =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.claimedLandId) ?? DEFAULT_SETTLEMENT_STATE.claimedLandId;
  const claimedLandName =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.claimedLandName) ?? DEFAULT_SETTLEMENT_STATE.claimedLandName;
  const claimedLandCoordinates =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.claimedLandCoordinates) ??
    DEFAULT_SETTLEMENT_STATE.claimedLandCoordinates;
  const claimedLandRegion =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.claimedLandRegion) ??
    DEFAULT_SETTLEMENT_STATE.claimedLandRegion;
  const claimedLandTerrain =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.claimedLandTerrain) ??
    DEFAULT_SETTLEMENT_STATE.claimedLandTerrain;
  const claimedLandPnId =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.claimedLandPnId) ??
    DEFAULT_SETTLEMENT_STATE.claimedLandPnId;
  const claimedLandResources =
    localStorage.getItem(SETTLEMENT_STORAGE_KEYS.claimedLandResources) ??
    DEFAULT_SETTLEMENT_STATE.claimedLandResources;
  const founderBadgeEarned = localStorage.getItem(SETTLEMENT_STORAGE_KEYS.founderBadgeEarned) === "true";

  let alliancePartners: string[] = [];
  if (alliancePartnersRaw) {
    try {
      const parsed = JSON.parse(alliancePartnersRaw);
      if (Array.isArray(parsed)) alliancePartners = parsed.filter((value): value is string => typeof value === "string");
    } catch {
      alliancePartners = [];
    }
  }

  let expandedLands: string[] = [];
  if (expandedLandsRaw) {
    try {
      const parsed = JSON.parse(expandedLandsRaw);
      if (Array.isArray(parsed)) expandedLands = parsed.filter((value): value is string => typeof value === "string");
    } catch {
      expandedLands = [];
    }
  }

  return sanitizeState({
    claimedLand,
    claimedLandId,
    claimedLandName,
    claimedLandCoordinates,
    claimedLandRegion,
    claimedLandTerrain,
    claimedLandPnId,
    claimedLandResources,
    founderBadgeEarned,
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
    nationFounded,
    nationName,
    nationIdeology,
    landsControlled: Number.isFinite(landsControlledRaw) ? landsControlledRaw : 1,
    bordersExpanded,
    expandedLands,
    empireFounded,
    empireName,
    empireDoctrine,
    cities: Number.isFinite(citiesRaw) ? citiesRaw : 1,
  });
}

export function readSettlementState(): SettlementState {
  if (typeof window === "undefined") return DEFAULT_SETTLEMENT_STATE;

  try {
    const serialized = localStorage.getItem(DEMO_STATE_KEY);
    if (serialized) return normalizeClaimedLandState(sanitizeState(JSON.parse(serialized)));
  } catch {
    return normalizeClaimedLandState(readLegacyState());
  }

  return normalizeClaimedLandState(readLegacyState());
}

export function writeSettlementState(state: SettlementState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(normalizeClaimedLandState(sanitizeState(state))));
}

export function clearSettlementState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_STATE_KEY);
  Object.values(SETTLEMENT_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function useSettlementDemoState() {
  const [state, setState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);

  useEffect(() => {
    setState(readSettlementState());
  }, []);

  const commitState = useCallback(
    (next: SettlementState) => {
      setState(next);
      writeSettlementState(next);
    },
    [],
  );

  const patchState = useCallback(
    (patch: Partial<SettlementState>) => {
      setState((current) => {
        const next = sanitizeState({ ...current, ...patch });
        writeSettlementState(next);
        return next;
      });
    },
    [],
  );

  return { state, setState: commitState, patchState };
}
