import { plots, starterPlotId, type Plot } from "./map-data";

export type ViewId = "map" | "orders" | "settlement" | "chronicle" | "atlas";
export type OrderId = "raise-shelter" | "gather-food" | "cut-timber" | "scout-nearby" | "build-storehouse" | "open-market" | "form-council" | "fortify-watch";
export type SettlementMarker = "camp" | "shelter" | "storehouse" | "market" | "council" | "watch";

export type Resources = {
  food: number;
  timber: number;
  stone: number;
  influence: number;
};

export type ChronicleEntry = {
  season: number;
  title: string;
  body: string;
};

export type DevelopmentOrder = {
  id: OrderId;
  label: string;
  short: string;
  requiresClaim?: boolean;
};

export type PlayState = {
  selectedPlotId: string;
  ownedPlotIds: string[];
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
  | { type: "runOrder"; orderId: OrderId }
  | { type: "setView"; view: ViewId }
  | { type: "reset" };

export const playV1StorageKey = "pixelNations.play.v1";

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

export function getPhase(state: PlayState): "unclaimed" | "camp" | "hamlet" | "civic-core" {
  if (state.ownedPlotIds.length === 0) return "unclaimed";
  if (state.completedOrders.includes("form-council")) return "civic-core";
  if (state.completedOrders.length >= 3) return "hamlet";
  return "camp";
}

function hasOrder(state: PlayState, orderId: OrderId) {
  return state.completedOrders.includes(orderId);
}

function pushChronicle(state: PlayState, title: string, body: string): ChronicleEntry[] {
  return [{ season: state.season + 1, title, body }, ...state.chronicle].slice(0, 8);
}

function addMarker(markers: SettlementMarker[], marker: SettlementMarker): SettlementMarker[] {
  return markers.includes(marker) ? markers : [...markers, marker];
}

function orderResult(state: PlayState, orderId: OrderId): Partial<PlayState> | null {
  if (state.ownedPlotIds.length === 0 || hasOrder(state, orderId)) return null;

  switch (orderId) {
    case "raise-shelter":
      return {
        resources: { ...state.resources, timber: Math.max(0, state.resources.timber - 1), influence: state.resources.influence + 1 },
        settlementMarkers: addMarker(state.settlementMarkers, "shelter"),
        chronicle: pushChronicle(state, "Shelter raised", "The first camp became a visible home base on the claimed land."),
        lastEvent: "Shelter raised. The camp now looks like a real settlement seed.",
      };
    case "gather-food":
      return {
        resources: { ...state.resources, food: state.resources.food + 3 },
        chronicle: pushChronicle(state, "Food stores secured", "The people gathered enough food to survive and plan beyond the first camp."),
        lastEvent: "Food secured. The settlement can support another season.",
      };
    case "cut-timber":
      return {
        resources: { ...state.resources, timber: state.resources.timber + 3 },
        chronicle: pushChronicle(state, "Timber cut", "Wood from nearby groves is ready for buildings, routes and defenses."),
        lastEvent: "Timber cut. Building choices are now stronger.",
      };
    case "scout-nearby":
      return {
        scoutedPlotIds: ["meadowrun", "old-road", "glasswater", "wolfpine"].filter((id) => !state.scoutedPlotIds.includes(id)).concat(state.scoutedPlotIds),
        resources: { ...state.resources, influence: state.resources.influence + 1 },
        chronicle: pushChronicle(state, "Nearby lands scouted", "Scouts marked the first expansion ring around the homeland."),
        lastEvent: "Nearby lands scouted. Expansion targets are now highlighted.",
      };
    case "build-storehouse":
      return {
        resources: { food: state.resources.food + 1, timber: Math.max(0, state.resources.timber - 2), stone: state.resources.stone, influence: state.resources.influence + 1 },
        settlementMarkers: addMarker(state.settlementMarkers, "storehouse"),
        chronicle: pushChronicle(state, "Storehouse built", "The settlement can hold surplus and starts to look permanent."),
        lastEvent: "Storehouse built. The settlement visibly grows.",
      };
    case "open-market":
      return {
        resources: { ...state.resources, influence: state.resources.influence + 2 },
        settlementMarkers: addMarker(state.settlementMarkers, "market"),
        scoutedPlotIds: Array.from(new Set([...state.scoutedPlotIds, "old-road", "glasswater", "eastfold"])),
        chronicle: pushChronicle(state, "Market path opened", "A first route line connects the homeland toward the Old Road."),
        lastEvent: "Market path opened. A trade route appears on the map.",
      };
    case "form-council":
      return {
        resources: { ...state.resources, influence: state.resources.influence + 3 },
        settlementMarkers: addMarker(state.settlementMarkers, "council"),
        chronicle: pushChronicle(state, "Council formed", "The people now have a civic core: the first step from settlement toward nation."),
        lastEvent: "Council formed. This is no longer only a camp.",
      };
    case "fortify-watch":
      return {
        resources: { ...state.resources, timber: Math.max(0, state.resources.timber - 1), stone: state.resources.stone + 1, influence: state.resources.influence + 1 },
        settlementMarkers: addMarker(state.settlementMarkers, "watch"),
        chronicle: pushChronicle(state, "Watch fortified", "A watch marker warns rivals that the homeland is defended."),
        lastEvent: "Watch fortified. The claimed land looks defended.",
      };
    default:
      return null;
  }
}

export function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "select":
      return { ...state, selectedPlotId: action.plotId };
    case "setView":
      return { ...state, view: action.view };
    case "claim": {
      if (state.ownedPlotIds.includes(action.plotId)) return state;
      const plot = plots.find((item) => item.id === action.plotId);
      return {
        ...state,
        selectedPlotId: action.plotId,
        ownedPlotIds: [action.plotId],
        season: 2,
        view: "orders",
        settlementMarkers: ["camp"],
        resources: { food: 3, timber: 2, stone: 0, influence: 1 },
        chronicle: pushChronicle(state, "First banner raised", `${plot?.name ?? "A land"} became the first claimed homeland.`),
        lastEvent: `${plot?.name ?? "A land"} raised your first banner. Choose a seasonal order next.`,
      };
    }
    case "runOrder": {
      const result = orderResult(state, action.orderId);
      if (!result) return { ...state, lastEvent: "That order is already resolved or needs a claimed land." };
      return {
        ...state,
        ...result,
        season: Math.min(12, state.season + 1),
        completedOrders: [...state.completedOrders, action.orderId],
        view: "orders",
      };
    }
    case "reset":
      return initialPlayState;
    default:
      return state;
  }
}
