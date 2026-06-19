import { DEFAULT_SETTLEMENT_STATE, type SettlementState } from "./settlement-state";

export type DevelopmentActionId = "build-farms" | "raise-watch" | "open-market" | "civic-assembly";

type StatKey = "population" | "food" | "materials" | "influence" | "security" | "prosperity" | "stability";

type StatDelta = Partial<Record<StatKey, number>>;

export type DevelopmentAction = {
  id: DevelopmentActionId;
  title: string;
  intent: string;
  cost: string;
  effect: string;
  tradeoff: string;
  deltas: StatDelta;
  consequence: string;
};

export const DEVELOPMENT_ACTIONS: DevelopmentAction[] = [
  {
    id: "build-farms",
    title: "Build Farms",
    intent: "Feed the first families.",
    cost: "Materials -2",
    effect: "Food +6, Population +1",
    tradeoff: "Security -1",
    deltas: { materials: -2, food: 6, population: 1, security: -1 },
    consequence:
      "Farms expanded along the river edge. Food stores improved, but the watch posts are stretched thinner.",
  },
  {
    id: "raise-watch",
    title: "Raise Watch",
    intent: "Guard the frontier roads.",
    cost: "Food -2, Influence -1",
    effect: "Security +3, Stability +1",
    tradeoff: "Prosperity -1",
    deltas: { food: -2, influence: -1, security: 3, stability: 1, prosperity: -1 },
    consequence:
      "New watch posts took shape at the settlement edge. The streets feel safer, though market life slows for a cycle.",
  },
  {
    id: "open-market",
    title: "Open Market",
    intent: "Invite traders inside the walls.",
    cost: "Materials -3",
    effect: "Prosperity +3, Influence +1",
    tradeoff: "Stability -1",
    deltas: { materials: -3, prosperity: 3, influence: 1, stability: -1 },
    consequence:
      "A market square opened near the civic road. Prosperity rises, but fast trade puts new pressure on local order.",
  },
  {
    id: "civic-assembly",
    title: "Civic Assembly",
    intent: "Give settlers a shared voice.",
    cost: "Influence -2",
    effect: "Stability +3, Population +1",
    tradeoff: "Materials -1",
    deltas: { influence: -2, stability: 3, population: 1, materials: -1 },
    consequence:
      "Settlers gathered under the first civic charter. Stability improved as more families committed to the city.",
  },
];

export function getDevelopmentAction(id: DevelopmentActionId) {
  return DEVELOPMENT_ACTIONS.find((action) => action.id === id);
}

export function getSettlementDevelopmentState(state: SettlementState) {
  return {
    population: state.population > 0 ? state.population : 24,
    food: state.food,
    materials: state.materials,
    influence: state.influence > 0 ? state.influence : 4,
    security: state.security,
    prosperity: state.prosperity,
    stability: state.stability,
    developmentCycle: state.developmentCycle > 0 ? state.developmentCycle : 1,
    latestDevelopmentAction: state.latestDevelopmentAction,
    latestDevelopmentSummary: state.latestDevelopmentSummary,
  };
}

export function canApplyDevelopmentAction(state: SettlementState, action: DevelopmentAction) {
  const development = getSettlementDevelopmentState(state);
  return Object.entries(action.deltas).every(([key, delta]) => {
    if (delta >= 0) return true;
    return development[key as StatKey] + delta >= 0;
  });
}

function clampStat(value: number) {
  return Math.max(0, Math.min(999, value));
}

export function applyDevelopmentAction(state: SettlementState, actionId: DevelopmentActionId): SettlementState {
  const action = getDevelopmentAction(actionId);
  if (!action || !canApplyDevelopmentAction(state, action)) return state;

  const current = getSettlementDevelopmentState(state);
  const next = {
    ...DEFAULT_SETTLEMENT_STATE,
    ...state,
    population: current.population,
    food: current.food,
    materials: current.materials,
    influence: current.influence,
    security: current.security,
    prosperity: current.prosperity,
    stability: current.stability,
    developmentCycle: current.developmentCycle + 1,
    latestDevelopmentAction: action.title,
    latestDevelopmentSummary: action.consequence,
  };

  for (const [key, delta] of Object.entries(action.deltas)) {
    next[key as StatKey] = clampStat(next[key as StatKey] + delta);
  }

  return next;
}
