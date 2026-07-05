import { plots, starterPlotId, type Plot } from "./map-data";

export type ViewId = "map" | "orders" | "settlement" | "chronicle" | "atlas";

export type PlayState = {
  selectedPlotId: string;
  ownedPlotIds: string[];
  season: number;
  view: ViewId;
  lastEvent: string;
};

export type PlayAction =
  | { type: "select"; plotId: string }
  | { type: "claim"; plotId: string }
  | { type: "setView"; view: ViewId }
  | { type: "reset" };

export const playV1StorageKey = "pixelNations.play.v1";

export const initialPlayState: PlayState = {
  selectedPlotId: starterPlotId,
  ownedPlotIds: [],
  season: 1,
  view: "map",
  lastEvent: "Choose one land. A nation begins when the map changes.",
};

export function getSelectedPlot(state: PlayState): Plot {
  return plots.find((plot) => plot.id === state.selectedPlotId) ?? plots[0];
}

export function getPhase(state: PlayState): "unclaimed" | "settlement" {
  return state.ownedPlotIds.length === 0 ? "unclaimed" : "settlement";
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
        lastEvent: `${plot?.name ?? "A land"} raised your first banner.`,
      };
    }
    case "reset":
      return initialPlayState;
    default:
      return state;
  }
}
