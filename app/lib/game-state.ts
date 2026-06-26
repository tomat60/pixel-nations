import { DEFAULT_SETTLEMENT_STATE, type SettlementState } from "./settlement-state";

export type GameLand = {
  id: string;
  pnId: string;
  name: string;
  coordinates: string;
  region: string;
  terrain: string;
  resources: string[];
};

export type GameSettlement = {
  name: string;
  region: string;
  coordinates: string;
  founder: string;
  population: number;
  influence: number;
  level: string;
  focusId: string;
  focus: string;
  focusBonus: string;
  focusIdentity: string;
};

export type GameCityCore = {
  population: number;
  influence: number;
  level: string;
  identity: string;
};

export type GameTradeSeed = {
  id: string;
  name: string;
  bonus: string;
  resourceFlow: string;
  identity: string;
  population: number;
  influence: number;
  level: string;
};

export type TradeRouteCreationDestination = {
  id: string;
  name: string;
  bonus: string;
  resourceFlow: string;
  identity: string;
  population: number;
  influence: number;
  settlementLevel: string;
};

export type GameProgressionStepId =
  | "land"
  | "settlement"
  | "city-core"
  | "trade"
  | "alliance-nation"
  | "empire";

export type GameProgressionStatus = "complete" | "current" | "upcoming";

export type GameProgressionStep = {
  id: GameProgressionStepId;
  label: string;
  status: GameProgressionStatus;
};

export type WorldGameActionId = "settlement" | "city-core" | "trade";

export type WorldGameActionResult = {
  state: SettlementState;
  feedback: string;
};

export type SettlementCreationFocus = {
  id: string;
  title: string;
  bonus: string;
  identity: string;
  population: number;
  influence: number;
  settlementLevel: string;
};

export type SettlementCreationLand = {
  region: string;
  coordinates: string;
};

export type SettlementCreationInput = {
  name: string;
  focus: SettlementCreationFocus;
  land: SettlementCreationLand;
};

const MAP_FOUNDED_SETTLEMENT: Omit<GameSettlement, "name" | "region" | "coordinates" | "founder"> = {
  focusId: "map-founder",
  focus: "Founder Charter",
  focusBonus: "+ Direct map progression",
  focusIdentity: "Founded from the claimed land on the world map.",
  population: 32,
  influence: 4,
  level: "Founder Outpost",
};

const MAP_CITY_CORE: GameCityCore = {
  population: 72,
  influence: 9,
  level: "Town Hall Core",
  identity: "The claimed land now has a civic center.",
};

const MAP_TRADE_SEED: GameTradeSeed = {
  id: "iron-coast",
  name: "Iron Coast",
  bonus: "+ Iron Flow",
  resourceFlow: "Iron +15",
  identity: "Iron Coast gives the city durable material flow.",
  population: 96,
  influence: 14,
  level: "Iron Route City",
};

function stepStatus(complete: boolean, current: boolean): GameProgressionStatus {
  if (complete) return "complete";
  if (current) return "current";
  return "upcoming";
}

export function getCurrentProgressionStepId(state: SettlementState): GameProgressionStepId | "complete" {
  if (!state.claimedLand) return "land";
  if (!state.settlementFounded) return "settlement";
  if (!state.townHallBuilt) return "city-core";
  if (!state.tradeRouteEstablished) return "trade";
  if (!state.nationFounded) return "alliance-nation";
  if (!state.empireFounded) return "empire";
  return "complete";
}

export function getGameProgression(state: SettlementState): GameProgressionStep[] {
  const currentStepId = getCurrentProgressionStepId(state);

  return [
    {
      id: "land",
      label: "Land",
      status: stepStatus(state.claimedLand, currentStepId === "land"),
    },
    {
      id: "settlement",
      label: "Settlement",
      status: stepStatus(state.settlementFounded, currentStepId === "settlement"),
    },
    {
      id: "city-core",
      label: "City Core",
      status: stepStatus(state.townHallBuilt, currentStepId === "city-core"),
    },
    {
      id: "trade",
      label: "Trade",
      status: stepStatus(state.tradeRouteEstablished, currentStepId === "trade"),
    },
    {
      id: "alliance-nation",
      label: "Alliance / Nation",
      status: stepStatus(state.nationFounded, currentStepId === "alliance-nation"),
    },
    {
      id: "empire",
      label: "Empire",
      status: stepStatus(state.empireFounded, currentStepId === "empire"),
    },
  ];
}

export function claimLand(state: SettlementState, land: GameLand): SettlementState {
  return {
    ...state,
    claimedLand: true,
    founderBadgeEarned: true,
    claimedLandId: land.id,
    claimedLandPnId: land.pnId,
    claimedLandName: land.name,
    claimedLandCoordinates: land.coordinates,
    claimedLandRegion: land.region,
    claimedLandTerrain: land.terrain,
    claimedLandResources: land.resources.join(", "),
    region: land.region,
    coordinates: land.coordinates,
  };
}

export function ensureClaimedLandIdentity(state: SettlementState, fallbackLand: GameLand): SettlementState {
  if (!state.claimedLand || state.claimedLandId) return state;
  return claimLand(state, fallbackLand);
}

export function getMapSettlementName(state: SettlementState) {
  if (state.settlementName) return state.settlementName;
  const region = state.claimedLandRegion || state.region || "Aurelia";
  const firstRegionWord = region.split(" ")[0] || "Aurelia";
  return `${firstRegionWord} Outpost`;
}

export function getNextWorldGameAction(state: SettlementState): WorldGameActionId | null {
  if (!state.claimedLand) return null;
  if (!state.settlementFounded) return "settlement";
  if (!state.townHallBuilt) return "city-core";
  if (!state.tradeRouteEstablished) return "trade";
  return null;
}

function landRegion(state: SettlementState) {
  return state.claimedLandRegion || state.region || "Aurelia";
}

function landCoordinates(state: SettlementState) {
  return state.claimedLandCoordinates || state.coordinates || "X19 / Y12";
}

function resetPoliticalArc(state: SettlementState): SettlementState {
  return {
    ...state,
    regionalAllianceFormed: false,
    allianceName: "",
    alliancePartners: [],
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
}

function resetTradeSeed(state: SettlementState): SettlementState {
  return {
    ...state,
    tradeRouteEstablished: false,
    tradeRouteDestination: "",
    tradeRouteId: "",
    tradeRouteBonus: "",
    tradeRouteResourceFlow: "",
    tradeRouteIdentity: "",
    tradeRoutes: 0,
  };
}

export function foundSettlementFromWorld(state: SettlementState): WorldGameActionResult {
  const nextState = resetPoliticalArc(
    resetTradeSeed({
      ...state,
      claimedLand: true,
      founderBadgeEarned: true,
      settlementFounded: true,
      settlementName: getMapSettlementName(state),
      population: Math.max(state.population, MAP_FOUNDED_SETTLEMENT.population),
      influence: Math.max(state.influence, MAP_FOUNDED_SETTLEMENT.influence),
      region: landRegion(state),
      coordinates: landCoordinates(state),
      founder: state.founder || "You",
      townHallBuilt: false,
      settlementLevel: MAP_FOUNDED_SETTLEMENT.level,
      settlementFocusId: state.settlementFocusId || MAP_FOUNDED_SETTLEMENT.focusId,
      settlementFocus: state.settlementFocus || MAP_FOUNDED_SETTLEMENT.focus,
      settlementFocusBonus: state.settlementFocusBonus || MAP_FOUNDED_SETTLEMENT.focusBonus,
      settlementFocusIdentity: MAP_FOUNDED_SETTLEMENT.focusIdentity,
    }),
  );

  return {
    state: nextState,
    feedback: "Settlement founded on the claimed land.",
  };
}

export function foundSettlementFromRoute(
  state: SettlementState,
  input: SettlementCreationInput,
): SettlementState {
  const baseState = {
    ...DEFAULT_SETTLEMENT_STATE,
    ...state,
  };

  return resetPoliticalArc(
    resetTradeSeed({
      ...baseState,
      claimedLand: true,
      founderBadgeEarned: true,
      settlementFounded: true,
      settlementName: input.name,
      population: input.focus.population,
      influence: input.focus.influence,
      region: input.land.region,
      coordinates: input.land.coordinates,
      founder: "You",
      townHallBuilt: false,
      settlementLevel: input.focus.settlementLevel,
      settlementFocusId: input.focus.id,
      settlementFocus: input.focus.title,
      settlementFocusBonus: input.focus.bonus,
      settlementFocusIdentity: input.focus.identity,
    }),
  );
}

export function buildCityCoreFromWorld(state: SettlementState): WorldGameActionResult {
  const nextState = resetPoliticalArc(
    resetTradeSeed({
      ...state,
      settlementFounded: true,
      settlementName: getMapSettlementName(state),
      population: Math.max(state.population, MAP_CITY_CORE.population),
      influence: Math.max(state.influence, MAP_CITY_CORE.influence),
      region: landRegion(state),
      coordinates: landCoordinates(state),
      founder: state.founder || "You",
      townHallBuilt: true,
      settlementLevel: MAP_CITY_CORE.level,
      settlementFocusIdentity: MAP_CITY_CORE.identity,
    }),
  );

  return {
    state: nextState,
    feedback: "City core built on the world map.",
  };
}

export function establishTradeSeedFromWorld(state: SettlementState): WorldGameActionResult {
  const nextState = {
    ...resetPoliticalArc({
      ...state,
      settlementFounded: true,
      settlementName: getMapSettlementName(state),
      population: Math.max(state.population, MAP_TRADE_SEED.population),
      influence: Math.max(state.influence, MAP_TRADE_SEED.influence),
      region: landRegion(state),
      coordinates: landCoordinates(state),
      founder: state.founder || "You",
      townHallBuilt: true,
      settlementLevel: MAP_TRADE_SEED.level,
      tradeRouteEstablished: true,
      tradeRouteDestination: MAP_TRADE_SEED.name,
      tradeRouteId: MAP_TRADE_SEED.id,
      tradeRouteBonus: MAP_TRADE_SEED.bonus,
      tradeRouteResourceFlow: MAP_TRADE_SEED.resourceFlow,
      tradeRouteIdentity: MAP_TRADE_SEED.identity,
      tradeRoutes: 1,
    }),
    alliancePartners: [MAP_TRADE_SEED.name],
  };

  return {
    state: nextState,
    feedback: "Trade seed established toward Iron Coast.",
  };
}

export function establishTradeRouteFromRoute(
  state: SettlementState,
  destination: TradeRouteCreationDestination,
): SettlementState {
  return {
    ...resetPoliticalArc({
      ...state,
      settlementFounded: true,
      settlementName: state.settlementName || "Aurelia Prime",
      region: state.region || DEFAULT_SETTLEMENT_STATE.region,
      coordinates: state.coordinates || DEFAULT_SETTLEMENT_STATE.coordinates,
      founder: state.founder || DEFAULT_SETTLEMENT_STATE.founder,
      townHallBuilt: true,
      tradeRouteEstablished: true,
      tradeRouteDestination: destination.name,
      tradeRouteId: destination.id,
      tradeRouteBonus: destination.bonus,
      tradeRouteResourceFlow: destination.resourceFlow,
      tradeRouteIdentity: destination.identity,
      tradeRoutes: 1,
      population: destination.population,
      influence: destination.influence,
      settlementLevel: destination.settlementLevel,
    }),
    alliancePartners: [destination.name],
  };
}
