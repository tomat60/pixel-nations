import { canClaimSector, expansionBlockedMessage, expansionInfluenceCost, getOwnedSectorIds, homelandSectorId, nationSectorThreshold } from "./expansion-state";
import { plots, starterPlotId, type Plot } from "./map-data";
import { getSectorIndexFromId, getWorldSector } from "./world-engine";

export type ViewId = "map" | "village" | "orders" | "world" | "council";
export type OrderId = "raise-shelter" | "gather-food" | "cut-timber" | "scout-nearby" | "build-storehouse" | "open-market" | "form-council" | "fortify-watch";
export type SettlementMarker = "camp" | "shelter" | "storehouse" | "market" | "council" | "watch";
export type NationDecisionId = "trade-charter" | "border-guard" | "settler-rights";

export type Resources = { food: number; timber: number; stone: number; influence: number };
export type ChronicleEntry = { season: number; title: string; body: string };
export type DevelopmentOrder = { id: OrderId; label: string; short: string; requiresClaim?: boolean };
export type NationDecision = { id: NationDecisionId; label: string; short: string; effect: string };

export type PlayState = {
  selectedPlotId: string;
  ownedPlotIds: string[];
  ownedSectorIds: string[];
  nationDecisionId: NationDecisionId | null;
  season: number;
  view: ViewId;
  lastEvent: string;
  resources: Resources;
  completedOrders: OrderId[];
  settlementMarkers: SettlementMarker[];
  scoutedPlotIds: string[];
  chronicle: ChronicleEntry[];
};

export type PlayAction =
  | { type: "select"; plotId: string }
  | { type: "claim"; plotId: string }
  | { type: "claimSector"; sectorId: string }
  | { type: "foundNation"; decisionId: NationDecisionId }
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
  season: 1,
  view: "map",
  lastEvent: "Choose one land. A nation begins when the map changes.",
  resources: { food: 2, timber: 1, stone: 0, influence: 0 },
  completedOrders: [],
  settlementMarkers: [],
  scoutedPlotIds: [],
  chronicle: [{ season: 1, title: "The basin is charted", body: "Sector A-01 is only a small slice of the 10,000-land world." }],
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
  return 18 + state.completedOrders.length * 9 + state.settlementMarkers.length * 7 + Math.max(0, getOwnedSectorIds(state).length - 1) * 11 + (state.nationDecisionId === "settler-rights" ? 18 : 0);
}

export function getDevelopmentScore(state: PlayState) {
  return state.completedOrders.length * 8 + state.settlementMarkers.length * 6 + state.scoutedPlotIds.length * 2 + state.resources.influence * 3 + getOwnedSectorIds(state).length * 5 + (state.nationDecisionId ? 14 : 0);
}

export function getRivalPressure(state: PlayState) {
  const base = state.season >= 8 ? 28 : state.season >= 5 ? 18 : 8;
  const scoutRelief = state.completedOrders.includes("scout-nearby") ? 4 : 0;
  const defenseRelief = state.completedOrders.includes("fortify-watch") ? 8 : 0;
  const nationRelief = state.nationDecisionId === "border-guard" ? 8 : 0;
  return Math.max(0, base - scoutRelief - defenseRelief - nationRelief);
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

export function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "select": return { ...state, selectedPlotId: action.plotId, view: state.view === "village" ? "map" : state.view };
    case "setView": return { ...state, view: action.view };
    case "claim": {
      if (state.ownedPlotIds.includes(action.plotId)) return state;
      const plot = plots.find((item) => item.id === action.plotId);
      return { ...state, selectedPlotId: action.plotId, ownedPlotIds: [action.plotId], ownedSectorIds: [homelandSectorId], nationDecisionId: null, season: 2, view: "village", settlementMarkers: ["camp"], resources: { food: 3, timber: 2, stone: 0, influence: 1 }, chronicle: pushChronicle(state, "First banner raised", `${plot?.name ?? "A land"} became the first claimed homeland.`), lastEvent: `${plot?.name ?? "A land"} is claimed. Enter Village, then choose Orders.` };
    }
    case "claimSector": {
      const sector = getWorldSector(getSectorIndexFromId(action.sectorId));
      const status = canClaimSector(state, sector.id);
      if (!status.ok) return { ...state, lastEvent: expansionBlockedMessage(status.reason), view: "world" };
      const ownedSectorIds = [...status.ownedSectorIds, sector.id];
      const nationLine = ownedSectorIds.length >= nationSectorThreshold ? " The council can now choose a founding doctrine." : " Expand to 3 sectors to unlock nation scale.";
      return { ...state, ownedSectorIds, resources: { ...state.resources, influence: Math.max(0, state.resources.influence - expansionInfluenceCost) }, season: Math.min(12, state.season + 1), view: "world", chronicle: pushChronicle(state, "Sector claimed", `${sector.id} ${sector.name} joined the border ring.${nationLine}`), lastEvent: `${sector.id} claimed. Borders now hold ${ownedSectorIds.length} sectors.${nationLine}` };
    }
    case "foundNation": {
      const decision = nationDecisions.find((item) => item.id === action.decisionId);
      if (!decision) return { ...state, lastEvent: "Unknown founding decision.", view: "council" };
      if (!getOwnedSectorIds(state).length || getOwnedSectorIds(state).length < nationSectorThreshold) return { ...state, lastEvent: `Founding needs ${nationSectorThreshold} connected sectors.`, view: "council" };
      if (state.nationDecisionId) return { ...state, lastEvent: "The founding doctrine is already set.", view: "council" };
      const influenceGain = decision.id === "trade-charter" ? 2 : 0;
      return { ...state, nationDecisionId: decision.id, resources: { ...state.resources, influence: state.resources.influence + influenceGain }, season: Math.min(12, state.season + 1), view: "council", chronicle: pushChronicle(state, "Nation founded", `${decision.label} became the first doctrine binding ${getOwnedSectorIds(state).length} sectors.`), lastEvent: `Nation founded: ${decision.label}. ${decision.effect}` };
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
