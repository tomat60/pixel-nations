import { canClaimSector, expansionBlockedMessage, expansionInfluenceCost, getOwnedSectorIds, homelandSectorId, nationSectorThreshold } from "./expansion-state";
import { plots, starterPlotId, type Plot } from "./map-data";
import { getSectorIndexFromId, getWorldSector } from "./world-engine";

export type ViewId = "map" | "village" | "orders" | "world" | "council";
export type OrderId = "raise-shelter" | "gather-food" | "cut-timber" | "scout-nearby" | "build-storehouse" | "open-market" | "form-council" | "fortify-watch";
export type SettlementMarker = "camp" | "shelter" | "storehouse" | "market" | "council" | "watch";
export type NationDecisionId = "trade-charter" | "border-guard" | "settler-rights";
export type RetentionDecisionId = "grain-levy" | "open-roads" | "scribe-patronage";
export type RetentionChoiceId = "authority" | "freedom";
export type FrontierIntentId = "northern-pass" | "river-gate" | "eastern-march";

export type Resources = { food: number; timber: number; stone: number; influence: number };
export type ChronicleEntry = { season: number; title: string; body: string };
export type DevelopmentOrder = { id: OrderId; label: string; short: string; requiresClaim?: boolean };
export type NationDecision = { id: NationDecisionId; label: string; short: string; effect: string };
export type RetentionChoice = { id: RetentionChoiceId; label: string; short: string; influenceDelta: number; villageMarker: string; worldMarker: string };
export type RetentionDecision = { id: RetentionDecisionId; season: number; title: string; prompt: string; choices: RetentionChoice[] };
export type RetentionRecord = { season: number; decisionId: RetentionDecisionId; choiceId: RetentionChoiceId; label: string; villageMarker: string; worldMarker: string };
export type FrontierObjective = { id: FrontierIntentId; label: string; target: string; targetSectorId: string; reason: string; result: string; secured: string };

export type PlayState = {
  selectedPlotId: string;
  ownedPlotIds: string[];
  ownedSectorIds: string[];
  nationDecisionId: NationDecisionId | null;
  frontierIntentId: FrontierIntentId | null;
  foundingCeremonySeen: boolean;
  season: number;
  view: ViewId;
  lastEvent: string;
  resources: Resources;
  completedOrders: OrderId[];
  settlementMarkers: SettlementMarker[];
  scoutedPlotIds: string[];
  chronicle: ChronicleEntry[];
  retentionRecords: RetentionRecord[];
};

export type PlayAction =
  | { type: "select"; plotId: string }
  | { type: "claim"; plotId: string }
  | { type: "claimSector"; sectorId: string }
  | { type: "foundNation"; decisionId: NationDecisionId }
  | { type: "dismissFoundingCeremony" }
  | { type: "advanceSeason"; decisionId: RetentionDecisionId; choiceId: RetentionChoiceId }
  | { type: "setFrontierIntent"; intentId: FrontierIntentId }
  | { type: "hydrate"; state: PlayState }
  | { type: "runOrder"; orderId: OrderId }
  | { type: "setView"; view: ViewId }
  | { type: "reset" };

export { canClaimSector, expansionInfluenceCost, getClaimableSectorIds, getNationReady, getOwnedSectorIds, nationSectorThreshold } from "./expansion-state";
export const playV1StorageKey = "pixelNations.play.v1";

export const nationDecisions: NationDecision[] = [
  { id: "trade-charter", label: "Trade Charter", short: "Turn border growth into a market federation.", effect: "+2 Influence now; trade sectors become the preferred next route." },
  { id: "border-guard", label: "Border Guard", short: "Bind the first sectors through watch posts and patrol rights.", effect: "Rival pressure drops; dangerous sectors become safer to inspect." },
  { id: "settler-rights", label: "Settler Rights", short: "Promise land rights so families move beyond the homeland.", effect: "+18 people; the council gains a civic founding story." },
];

export const frontierObjectives: FrontierObjective[] = [
  { id: "northern-pass", label: "Chart the Northern Pass", target: "A-04 North Ridge", targetSectorId: "A-04", reason: "Push beyond the first border ring and secure the safest route out of the basin.", result: "Sets the next expansion intent toward a mountain pass.", secured: "The northern pass is now inside Aurelian borders." },
  { id: "river-gate", label: "Secure the River Gate", target: "B-03 Glasswater Gate", targetSectorId: "B-03", reason: "Turn the river crossing into the next civic frontier objective.", result: "Sets the next expansion intent toward the river approach.", secured: "The river gate is now held as a civic frontier crossing." },
  { id: "eastern-march", label: "Open the Eastern March", target: "B-04 Eastfold Road", targetSectorId: "B-04", reason: "Extend the market road into a named frontier march for future empire growth.", result: "Sets the next expansion intent toward the eastern trade road.", secured: "The eastern march is now open for future empire growth." },
];

export const retentionDecisions: RetentionDecision[] = [
  {
    id: "grain-levy",
    season: 1,
    title: "Grain Levy",
    prompt: "The first harvest can fund the crown or keep families loyal.",
    choices: [
      { id: "authority", label: "Set the crown levy", short: "+2 Influence; banners mark the granary district.", influenceDelta: 2, villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
      { id: "freedom", label: "Protect free stores", short: "+1 Influence; village stores become a civic commons.", influenceDelta: 1, villageMarker: "free-stores", worldMarker: "commons-route" },
    ],
  },
  {
    id: "open-roads",
    season: 2,
    title: "Border Roads",
    prompt: "The new border can harden into posts or open into trade roads.",
    choices: [
      { id: "authority", label: "Fortify the border road", short: "+1 Influence; watch fires mark the border.", influenceDelta: 1, villageMarker: "border-watchfires", worldMarker: "fortified-road" },
      { id: "freedom", label: "Open the market road", short: "+2 Influence; caravans mark the first open route.", influenceDelta: 2, villageMarker: "market-caravans", worldMarker: "open-market-road" },
    ],
  },
  {
    id: "scribe-patronage",
    season: 3,
    title: "Scribes or Foundries",
    prompt: "The first era needs memory and tools. Choose the institution people will see first.",
    choices: [
      { id: "authority", label: "Patron the scribes", short: "+1 Influence; a chronicle desk records the nation.", influenceDelta: 1, villageMarker: "scribe-desk", worldMarker: "law-stones" },
      { id: "freedom", label: "Fund the foundries", short: "+2 Influence; workshop smoke shows productive momentum.", influenceDelta: 2, villageMarker: "foundry-smoke", worldMarker: "workshop-road" },
    ],
  },
];

export const developmentOrders: DevelopmentOrder[] = [
  { id: "raise-shelter", label: "Raise Shelter", short: "Turn the first camp into a protected home base." },
  { id: "gather-food", label: "Gather Food", short: "Secure food so the settlement can survive the next season." },
  { id: "cut-timber", label: "Cut Timber", short: "Collect timber for buildings and palisades." },
  { id: "scout-nearby", label: "Scout Nearby Land", short: "Reveal the safest next expansion around the homeland." },
  { id: "build-storehouse", label: "Build Storehouse", short: "Make resources persistent and show settlement growth." },
  { id: "open-market", label: "Open Market Path", short: "Mark the Old Road as the first trade route." },
  { id: "form-council", label: "Form Council", short: "Create the civic core that can become a nation." },
  { id: "fortify-watch", label: "Fortify Watch", short: "Add a defensive watch marker near the homeland." },
];

export const initialPlayState: PlayState = {
  selectedPlotId: starterPlotId,
  ownedPlotIds: [],
  ownedSectorIds: [],
  nationDecisionId: null,
  frontierIntentId: null,
  foundingCeremonySeen: false,
  season: 1,
  view: "map",
  lastEvent: "Choose one land. A nation begins when the map changes.",
  resources: { food: 2, timber: 1, stone: 0, influence: 0 },
  completedOrders: [],
  settlementMarkers: [],
  scoutedPlotIds: [],
  chronicle: [{ season: 1, title: "The basin is charted", body: "Sector A-01 is only a small slice of the 10,000-land world." }],
  retentionRecords: [],
};

export function getSelectedPlot(state: PlayState): Plot {
  return plots.find((plot) => plot.id === state.selectedPlotId) ?? plots[0];
}

export function getOwnedPlot(state: PlayState): Plot | undefined {
  return plots.find((plot) => plot.id === state.ownedPlotIds[0]);
}

export function getNationDecision(state: PlayState) {
  return nationDecisions.find((decision) => decision.id === state.nationDecisionId) ?? null;
}

export function getFrontierIntent(state: PlayState) {
  return frontierObjectives.find((objective) => objective.id === state.frontierIntentId) ?? null;
}

export function getFrontierObjectiveSecured(state: PlayState) {
  const objective = getFrontierIntent(state);
  return Boolean(objective && getOwnedSectorIds(state).includes(objective.targetSectorId));
}

export function getNextRetentionDecision(state: PlayState) {
  if (!state.nationDecisionId || !state.foundingCeremonySeen) return null;
  return retentionDecisions.find((decision) => !state.retentionRecords.some((record) => record.decisionId === decision.id)) ?? null;
}

export function getFirstEraComplete(state: PlayState) {
  return state.retentionRecords.length >= retentionDecisions.length;
}

export function getPhase(state: PlayState): "unclaimed" | "camp" | "hamlet" | "village" | "city-seed" | "nation-seed" {
  if (state.ownedPlotIds.length === 0) return "unclaimed";
  if (state.nationDecisionId) return "nation-seed";
  if (state.completedOrders.includes("form-council") && state.completedOrders.includes("open-market") && state.completedOrders.includes("fortify-watch")) return "city-seed";
  if (state.completedOrders.includes("form-council") || state.completedOrders.length >= 6) return "village";
  if (state.completedOrders.length >= 3) return "hamlet";
  return "camp";
}

export function getPopulation(state: PlayState) {
  if (state.ownedPlotIds.length === 0) return 0;
  return 18 + state.completedOrders.length * 9 + state.settlementMarkers.length * 7 + Math.max(0, getOwnedSectorIds(state).length - 1) * 11 + (state.nationDecisionId === "settler-rights" ? 18 : 0) + state.retentionRecords.length * 5;
}

export function getDevelopmentScore(state: PlayState) {
  return state.completedOrders.length * 8 + state.settlementMarkers.length * 6 + state.scoutedPlotIds.length * 2 + state.resources.influence * 3 + getOwnedSectorIds(state).length * 5 + (state.nationDecisionId ? 14 : 0) + state.retentionRecords.length * 7 + (state.frontierIntentId ? 6 : 0) + (getFrontierObjectiveSecured(state) ? 10 : 0);
}

export function getRivalPressure(state: PlayState) {
  const base = state.season >= 8 ? 28 : state.season >= 5 ? 18 : 8;
  const scoutRelief = state.completedOrders.includes("scout-nearby") ? 4 : 0;
  const defenseRelief = state.completedOrders.includes("fortify-watch") ? 8 : 0;
  const nationRelief = state.nationDecisionId === "border-guard" ? 8 : 0;
  const retentionRelief = state.retentionRecords.some((record) => record.worldMarker === "fortified-road") ? 4 : 0;
  const objectiveRelief = getFrontierObjectiveSecured(state) ? 3 : 0;
  return Math.max(0, base - scoutRelief - defenseRelief - nationRelief - retentionRelief - objectiveRelief);
}

export function getWorldClaimedCount(state: PlayState) {
  return getOwnedSectorIds(state).length;
}

function hasOrder(state: PlayState, orderId: OrderId) {
  return state.completedOrders.includes(orderId);
}

function pushChronicle(state: PlayState, title: string, body: string): ChronicleEntry[] {
  return [{ season: state.season + 1, title, body }, ...state.chronicle].slice(0, 10);
}

function addMarker(markers: SettlementMarker[], marker: SettlementMarker): SettlementMarker[] {
  return markers.includes(marker) ? markers : [...markers, marker];
}

function orderResult(state: PlayState, orderId: OrderId): Partial<PlayState> | null {
  if (state.ownedPlotIds.length === 0 || hasOrder(state, orderId)) return null;
  switch (orderId) {
    case "raise-shelter": return { resources: { ...state.resources, timber: Math.max(0, state.resources.timber - 1), influence: state.resources.influence + 1 }, settlementMarkers: addMarker(state.settlementMarkers, "shelter"), chronicle: pushChronicle(state, "Shelter raised", "The first camp became a visible home base inside the village view."), lastEvent: "Shelter raised. Enter Village to see the first district." };
    case "gather-food": return { resources: { ...state.resources, food: state.resources.food + 3 }, chronicle: pushChronicle(state, "Food stores secured", "Food stores can now support more people and longer seasonal planning."), lastEvent: "Food secured. Population can grow." };
    case "cut-timber": return { resources: { ...state.resources, timber: state.resources.timber + 3 }, chronicle: pushChronicle(state, "Timber cut", "Timber unlocks early buildings and palisades inside the village."), lastEvent: "Timber cut. Building choices are stronger." };
    case "scout-nearby": return { scoutedPlotIds: ["meadowrun", "old-road", "glasswater", "wolfpine"].filter((id) => !state.scoutedPlotIds.includes(id)).concat(state.scoutedPlotIds), resources: { ...state.resources, influence: state.resources.influence + 1 }, chronicle: pushChronicle(state, "Nearby lands scouted", "Scouts marked the expansion ring and revealed where rivals may pressure the basin."), lastEvent: "Scouting opened the expansion ring." };
    case "build-storehouse": return { resources: { food: state.resources.food + 1, timber: Math.max(0, state.resources.timber - 2), stone: state.resources.stone, influence: state.resources.influence + 1 }, settlementMarkers: addMarker(state.settlementMarkers, "storehouse"), chronicle: pushChronicle(state, "Storehouse built", "The settlement can hold surplus and starts to look permanent."), lastEvent: "Storehouse built. Village permanence rises." };
    case "open-market": return { resources: { ...state.resources, influence: state.resources.influence + 2 }, settlementMarkers: addMarker(state.settlementMarkers, "market"), scoutedPlotIds: Array.from(new Set([...state.scoutedPlotIds, "old-road", "glasswater", "eastfold"])), chronicle: pushChronicle(state, "Market path opened", "The first trade route connects the settlement to the wider world economy."), lastEvent: "Market path opened. World view now has a trade lane." };
    case "form-council": return { resources: { ...state.resources, influence: state.resources.influence + 3 }, settlementMarkers: addMarker(state.settlementMarkers, "council"), chronicle: pushChronicle(state, "Council formed", "The civic core can now set goals toward village, city, nation and empire."), lastEvent: "Council formed. Strategy view unlocked." };
    case "fortify-watch": return { resources: { ...state.resources, timber: Math.max(0, state.resources.timber - 1), stone: state.resources.stone + 1, influence: state.resources.influence + 1 }, settlementMarkers: addMarker(state.settlementMarkers, "watch"), chronicle: pushChronicle(state, "Watch fortified", "A watch marker warns rivals that the homeland is defended."), lastEvent: "Watch fortified. Rival pressure falls." };
    default: return null;
  }
}

function resolveRetentionDecision(state: PlayState, decisionId: RetentionDecisionId, choiceId: RetentionChoiceId): Partial<PlayState> | null {
  if (!state.nationDecisionId || !state.foundingCeremonySeen) return null;
  if (state.retentionRecords.some((record) => record.decisionId === decisionId)) return null;
  const decision = getNextRetentionDecision(state);
  if (!decision || decision.id !== decisionId) return null;
  const choice = decision.choices.find((item) => item.id === choiceId);
  if (!choice) return null;
  const record: RetentionRecord = { season: decision.season, decisionId: decision.id, choiceId: choice.id, label: choice.label, villageMarker: choice.villageMarker, worldMarker: choice.worldMarker };
  return {
    retentionRecords: [...state.retentionRecords, record],
    resources: { ...state.resources, influence: state.resources.influence + choice.influenceDelta },
    chronicle: pushChronicle(state, decision.title, `${choice.label}: ${choice.short}`),
    lastEvent: `Season ${decision.season} resolved: ${choice.label}.`,
  };
}

export function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "hydrate": return { ...initialPlayState, ...action.state, resources: { ...initialPlayState.resources, ...action.state.resources }, retentionRecords: action.state.retentionRecords ?? [], frontierIntentId: action.state.frontierIntentId ?? null };
    case "select": return { ...state, selectedPlotId: action.plotId, view: state.view === "village" ? "map" : state.view };
    case "setView": return { ...state, view: action.view };
    case "claim": {
      if (state.ownedPlotIds.includes(action.plotId)) return state;
      const plot = plots.find((item) => item.id === action.plotId);
      return { ...state, selectedPlotId: action.plotId, ownedPlotIds: [action.plotId], ownedSectorIds: [homelandSectorId], nationDecisionId: null, frontierIntentId: null, foundingCeremonySeen: false, season: 2, view: "village", settlementMarkers: ["camp"], resources: { food: 3, timber: 2, stone: 0, influence: 1 }, chronicle: pushChronicle(state, "First banner raised", `${plot?.name ?? "A land"} became the first claimed homeland.`), retentionRecords: [], lastEvent: `${plot?.name ?? "A land"} is claimed. Enter Village, then choose Orders.` };
    }
    case "claimSector": {
      const sector = getWorldSector(getSectorIndexFromId(action.sectorId));
      const status = canClaimSector(state, sector.id);
      if (!status.ok) return { ...state, lastEvent: expansionBlockedMessage(status.reason), view: "world" };
      const ownedSectorIds = [...status.ownedSectorIds, sector.id];
      const nationLine = ownedSectorIds.length >= nationSectorThreshold ? " The council can now choose a founding doctrine." : " Expand to 3 sectors to unlock nation scale.";
      const objective = getFrontierIntent(state);
      const objectiveSecured = Boolean(objective && objective.targetSectorId === sector.id);
      const chronicleTitle = objectiveSecured ? "Frontier objective secured" : "Sector claimed";
      const chronicleBody = objectiveSecured && objective ? `${objective.target} joined the border ring. ${objective.secured}` : `${sector.id} ${sector.name} joined the border ring.${nationLine}`;
      const lastEvent = objectiveSecured && objective ? `Frontier objective secured: ${objective.target}.` : `${sector.id} claimed. Borders now hold ${ownedSectorIds.length} sectors.${nationLine}`;
      return { ...state, ownedSectorIds, resources: { ...state.resources, influence: Math.max(0, state.resources.influence - expansionInfluenceCost) }, season: Math.min(12, state.season + 1), view: "world", chronicle: pushChronicle(state, chronicleTitle, chronicleBody), lastEvent };
    }
    case "foundNation": {
      const decision = nationDecisions.find((item) => item.id === action.decisionId);
      if (!decision) return { ...state, lastEvent: "Unknown founding decision.", view: "council" };
      if (!getOwnedSectorIds(state).length || getOwnedSectorIds(state).length < nationSectorThreshold) return { ...state, lastEvent: `Founding needs ${nationSectorThreshold} connected sectors.`, view: "council" };
      if (state.nationDecisionId) return { ...state, lastEvent: "The founding doctrine is already set.", view: "council" };
      const influenceGain = decision.id === "trade-charter" ? 2 : 0;
      return { ...state, nationDecisionId: decision.id, frontierIntentId: null, foundingCeremonySeen: false, resources: { ...state.resources, influence: state.resources.influence + influenceGain }, season: Math.min(12, state.season + 1), view: "council", retentionRecords: [], chronicle: pushChronicle(state, "Nation founded", `${decision.label} became the first doctrine binding ${getOwnedSectorIds(state).length} sectors.`), lastEvent: `Nation founded: ${decision.label}. ${decision.effect}` };
    }
    case "dismissFoundingCeremony": return state.nationDecisionId ? { ...state, foundingCeremonySeen: true, view: "council", lastEvent: "The first nation stands. Advance Season to write its first era." } : state;
    case "advanceSeason": {
      const result = resolveRetentionDecision(state, action.decisionId, action.choiceId);
      if (!result) return { ...state, lastEvent: "No available nation season decision.", view: "council" };
      return { ...state, ...result, season: Math.min(12, state.season + 1), view: "council" };
    }
    case "setFrontierIntent": {
      if (!getFirstEraComplete(state)) return { ...state, view: "council", lastEvent: "Finish the first era before setting a frontier objective." };
      if (state.frontierIntentId) return { ...state, view: "council", lastEvent: "The next frontier objective is already recorded." };
      const objective = frontierObjectives.find((item) => item.id === action.intentId);
      if (!objective) return { ...state, view: "council", lastEvent: "Unknown frontier objective." };
      return { ...state, frontierIntentId: objective.id, view: "council", chronicle: pushChronicle(state, "Frontier objective recorded", `${objective.label}: ${objective.result}`), lastEvent: `Frontier objective recorded: ${objective.target}.` };
    }
    case "runOrder": {
      const result = orderResult(state, action.orderId);
      if (!result) return { ...state, lastEvent: "That order is already resolved or needs a claimed land." };
      return { ...state, ...result, season: Math.min(12, state.season + 1), completedOrders: [...state.completedOrders, action.orderId], view: "village" };
    }
    case "reset": return initialPlayState;
    default: return state;
  }
}
