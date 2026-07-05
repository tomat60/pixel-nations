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
  lastEvent: "No banner yet. Pick a land and begin the realm.",
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
      title: "Pick a homeland",
      body: "Choose one glowing starter land. This parcel becomes the seed of your empire.",
    };
  }
  if (state.view !== "orders") {
    return {
      eyebrow: "Next click",
      title: "Open Orders",
      body: "Your banner is planted. Use Orders to make the map change this season.",
    };
  }
  if (state.owned.length < 3) {
    return {
      eyebrow: "First age order",
      title: "Expand or Scout",
      body: "Take a neighboring parcel or reveal more of the basin. Growth must be visible.",
    };
  }
  if (state.developmentLevel < 4) {
    return {
      eyebrow: "Build the capital",
      title: "Develop",
      body: "Raise the capital marker. A camp should become a settlement, then a nation seed.",
    };
  }
  if (phase !== "empire") {
    return {
      eyebrow: "Nation pressure",
      title: "Secure or Trade",
      body: "Strengthen influence or draw a route. The realm should start feeling political.",
    };
  }
  return {
    eyebrow: "Empire promise",
    title: "The next age is calling",
    body: "The demo stops at the promise. Deeper systems come only after this loop feels excellent.",
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

    const claimLine = `Banner planted at ${parcel.name}. This land is now the capital seed.`;
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
      }, `${next.name} joins the realm. A new parcel lights up under your banner.`);
    }

    if (action.order === "develop") {
      return withChronicle({
        ...advanced,
        developmentLevel: Math.min(5, advanced.developmentLevel + 1),
        influenceRadius: Math.min(130, advanced.influenceRadius + 8),
      }, "The capital marker rises. Camp becomes settlement pressure.");
    }

    if (action.order === "secure") {
      return withChronicle({
        ...advanced,
        influenceRadius: Math.min(150, advanced.influenceRadius + 16),
      }, "Watchfires widen your influence ring across the basin.");
    }

    if (action.order === "scout") {
      const nextScout = parcels.find((parcel) => !advanced.scouted.includes(parcel.id));
      if (!nextScout) return withChronicle(advanced, "Your scouts already know the whole basin prototype.");
      return withChronicle({
        ...advanced,
        scouted: [...advanced.scouted, nextScout.id],
      }, `${nextScout.name} is revealed. The map gives you one more decision.`);
    }

    if (action.order === "trade") {
      return withChronicle({
        ...advanced,
        tradeRoute: true,
        developmentLevel: Math.max(advanced.developmentLevel, 4),
      }, "A trade route burns toward the Iron Coast. Nationhood is now visible.");
    }
  }

  return state;
}
