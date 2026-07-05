import { parcels, type OrderId, type View } from "./play-data";

export type Phase = "unclaimed" | "settlement" | "nation" | "empire";

export type PlayState = {
  view: View;
  selectedId: string;
  season: number;
  owned: string[];
  scouted: string[];
  developmentLevel: number;
  influenceRadius: number;
  tradeRoute: boolean;
  chronicle: string[];
  lastEvent: string;
};

export type PlayAction =
  | { type: "select"; parcelId: string }
  | { type: "setView"; view: View }
  | { type: "claim"; parcelId: string }
  | { type: "order"; order: OrderId };

export type Objective = {
  eyebrow: string;
  title: string;
  body: string;
};

export const initialPlayState: PlayState = {
  view: "map",
  selectedId: "greenvale",
  season: 1,
  owned: [],
  scouted: ["greenvale", "newaurelia", "riverbend"],
  developmentLevel: 0,
  influenceRadius: 38,
  tradeRoute: false,
  chronicle: ["The basin waits. Choose the first land."],
  lastEvent: "No banner yet. The first decision is still yours.",
};

export function getPhase(state: PlayState): Phase {
  if (state.owned.length === 0) return "unclaimed";
  if (state.developmentLevel >= 5) return "empire";
  if (state.developmentLevel >= 4) return "nation";
  return "settlement";
}

export function getObjective(state: PlayState, phase: Phase): Objective {
  if (state.owned.length === 0) {
    return {
      eyebrow: "First decision",
      title: "Choose one starter land",
      body: "Click a glowing starter parcel, read the tradeoff, then plant your first banner.",
    };
  }
  if (state.view !== "orders") {
    return {
      eyebrow: "Next action",
      title: "Open Orders",
      body: "The world changes when you issue a seasonal order from the bottom dock.",
    };
  }
  if (state.owned.length < 3) {
    return {
      eyebrow: "Grow the realm",
      title: "Expand or Scout",
      body: "Add territory or reveal the basin. The map should visibly react to your choice.",
    };
  }
  if (state.developmentLevel < 4) {
    return {
      eyebrow: "Build toward nationhood",
      title: "Develop the capital",
      body: "Raise the marker level until the settlement starts feeling political.",
    };
  }
  if (phase !== "empire") {
    return {
      eyebrow: "Declare your path",
      title: "Secure trade and influence",
      body: "Use trade or security to turn the settlement layer into a nation layer.",
    };
  }
  return {
    eyebrow: "Future promise",
    title: "Empire is visible, not built yet",
    body: "This prototype stops at the promise. Deeper systems come after the first loop is excellent.",
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function withChronicle(state: PlayState, line: string): PlayState {
  return {
    ...state,
    lastEvent: line,
    chronicle: [`Season ${state.season}: ${line}`, ...state.chronicle].slice(0, 8),
  };
}

export function playReducer(state: PlayState, action: PlayAction): PlayState {
  if (action.type === "select") return { ...state, selectedId: action.parcelId };
  if (action.type === "setView") return { ...state, view: action.view };

  if (action.type === "claim") {
    const parcel = parcels.find((item) => item.id === action.parcelId);
    if (!parcel) return state;
    if (parcel.rival) return withChronicle(state, `${parcel.name} already flies a rival banner.`);

    const claimLine = `Banner planted at ${parcel.name}. Campfires mark the first claim.`;
    return {
      ...state,
      selectedId: parcel.id,
      season: 2,
      owned: [parcel.id],
      scouted: unique([...state.scouted, parcel.id]),
      developmentLevel: 1,
      influenceRadius: 48,
      lastEvent: claimLine,
      chronicle: [`Season 1: ${claimLine}`, "The basin waits. Choose the first land."],
    };
  }

  if (action.type === "order") {
    const capital = parcels.find((parcel) => parcel.id === state.owned[0]);
    if (!capital) return state;
    const advanced: PlayState = { ...state, view: "orders", season: Math.min(12, state.season + 1) };

    if (action.order === "expand") {
      const next = parcels.find((parcel) => !advanced.owned.includes(parcel.id) && !parcel.rival);
      if (!next) return withChronicle(advanced, "No open neighboring claim is ready this season.");
      return withChronicle({
        ...advanced,
        owned: unique([...advanced.owned, next.id]),
        scouted: unique([...advanced.scouted, next.id]),
        influenceRadius: Math.min(120, advanced.influenceRadius + 10),
      }, `${next.name} accepts your border stones. The realm grows.`);
    }

    if (action.order === "develop") {
      return withChronicle({
        ...advanced,
        developmentLevel: Math.min(5, advanced.developmentLevel + 1),
        influenceRadius: Math.min(130, advanced.influenceRadius + 8),
      }, "Roofs rise around the banner. The settlement marker changes on the map.");
    }

    if (action.order === "secure") {
      return withChronicle({
        ...advanced,
        influenceRadius: Math.min(150, advanced.influenceRadius + 16),
      }, "Watchfires mark the roads. Your influence ring strengthens.");
    }

    if (action.order === "scout") {
      const nextScout = parcels.find((parcel) => !advanced.scouted.includes(parcel.id));
      if (!nextScout) return withChronicle(advanced, "Your scouts already know the whole basin prototype.");
      return withChronicle({
        ...advanced,
        scouted: [...advanced.scouted, nextScout.id],
      }, `${nextScout.name} is scouted. A new label appears on the map.`);
    }

    if (action.order === "trade") {
      return withChronicle({
        ...advanced,
        tradeRoute: true,
        developmentLevel: Math.max(advanced.developmentLevel, 4),
      }, "A trade route burns bright toward the Iron Coast. Nationhood feels possible.");
    }
  }

  return state;
}
