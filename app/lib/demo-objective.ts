import type { SettlementState } from "./settlement-state";

export type ObjectiveStepStatus = "complete" | "current" | "upcoming";

export type ObjectiveStep = {
  id: string;
  label: string;
  detail: string;
  status: ObjectiveStepStatus;
  value?: string;
};

export type DemoObjectiveAction = {
  stepId: string;
  stepNumber: number;
  headline: string;
  description: string;
  progress: string;
  cta: string;
  href: string;
};

export type DemoObjective = {
  steps: ObjectiveStep[];
  action: DemoObjectiveAction;
  spineLine: string;
  completedCount: number;
};

const SPINE_LINE = "Land → Settlement → City Core → Trade → Alliance/Nation → Empire";

function stepStatus(complete: boolean, current: boolean): ObjectiveStepStatus {
  if (complete) return "complete";
  if (current) return "current";
  return "upcoming";
}

function resolveCurrentStepId(state: SettlementState): string {
  if (!state.claimedLand) return "land";
  if (!state.settlementFounded) return "settlement";
  if (!state.townHallBuilt) return "city-core";
  if (!state.tradeRouteEstablished) return "trade";
  if (!state.nationFounded) return "alliance-nation";
  if (!state.empireFounded) return "empire";
  return "complete";
}

function resolveAction(state: SettlementState, currentStepId: string): DemoObjectiveAction {
  const landName = state.claimedLandName || "your land";
  const settlementName = state.settlementName || "your settlement";

  if (currentStepId === "land") {
    return {
      stepId: "land",
      stepNumber: 1,
      headline: "Claim Your First Land",
      description: "Choose one parcel in Sector A-01. This land becomes the origin of your settlement, nation, and empire.",
      progress: "0 / 1 Land",
      cta: "Go To World Map",
      href: "/world",
    };
  }

  if (currentStepId === "settlement") {
    return {
      stepId: "settlement",
      stepNumber: 2,
      headline: "Found the First Settlement",
      description: `${landName} is claimed. Name your settlement and choose a founder focus — this turns land into a living place.`,
      progress: "0 / 1 Settlement",
      cta: "Found Settlement",
      href: "/settlement/create",
    };
  }

  if (currentStepId === "city-core") {
    return {
      stepId: "city-core",
      stepNumber: 3,
      headline: "Build the City Core",
      description: `${settlementName} is founded. Raise the Town Hall to turn the outpost into a city seed with civic power.`,
      progress: "0 / 1 Core Building",
      cta: "View Settlement",
      href: "/settlement#city-core",
    };
  }

  if (currentStepId === "trade") {
    return {
      stepId: "trade",
      stepNumber: 4,
      headline: "Establish a Trade Seed",
      description: "The civic core is built. Connect outward with a trade route so the city can affect the region.",
      progress: "0 / 1 Trade Route",
      cta: "Establish Trade Route",
      href: "/trade/create",
    };
  }

  if (currentStepId === "alliance-nation") {
    if (!state.regionalAllianceFormed) {
      return {
        stepId: "alliance-nation",
        stepNumber: 5,
        headline: "Form a Regional Alliance",
        description: "Trade is flowing. Seek regional partners — the alliance path leads toward founding your first nation.",
        progress: "0 / 1 Alliance",
        cta: "Form Regional Alliance",
        href: "/alliance/create",
      };
    }

    return {
      stepId: "alliance-nation",
      stepNumber: 5,
      headline: "Found the First Nation",
      description: `${state.allianceName || "Your alliance"} gives political reach. Raise a national banner and turn city choices into doctrine.`,
      progress: "0 / 1 Nation",
      cta: "Found First Nation",
      href: "/nation/create",
    };
  }

  if (currentStepId === "empire") {
    return {
      stepId: "empire",
      stepNumber: 6,
      headline: "Declare the First Empire",
      description: `${state.nationName || "Your nation"} is founded. Complete the demo arc — one land rising into empire.`,
      progress: "0 / 1 Empire",
      cta: "Declare Empire",
      href: "/empire/create",
    };
  }

  return {
    stepId: "complete",
    stepNumber: 6,
    headline: "First Demo Arc Complete",
    description: `${state.empireName || "Your empire"} is declared. One land became settlement, city, nation, and empire.`,
    progress: "Empire Founded",
    cta: "View Empire",
    href: "/empire",
  };
}

export function getDemoObjective(state: SettlementState): DemoObjective {
  const currentStepId = resolveCurrentStepId(state);

  const landDone = state.claimedLand;
  const settlementDone = state.settlementFounded;
  const cityCoreDone = state.townHallBuilt;
  const tradeDone = state.tradeRouteEstablished;
  const nationDone = state.nationFounded;
  const empireDone = state.empireFounded;

  const allianceNationValue = nationDone
    ? state.nationName || "First nation"
    : state.regionalAllianceFormed
      ? `${state.allianceName || "Alliance"} → Nation`
      : undefined;

  const steps: ObjectiveStep[] = [
    {
      id: "land",
      label: "Land",
      detail: "Claim origin parcel",
      status: stepStatus(landDone, currentStepId === "land"),
      value: state.claimedLandName || undefined,
    },
    {
      id: "settlement",
      label: "Settlement",
      detail: "Name and focus",
      status: stepStatus(settlementDone, currentStepId === "settlement"),
      value: state.settlementName || undefined,
    },
    {
      id: "city-core",
      label: "City Core",
      detail: "Build Town Hall",
      status: stepStatus(cityCoreDone, currentStepId === "city-core"),
      value: cityCoreDone ? state.settlementLevel || "City seed" : undefined,
    },
    {
      id: "trade",
      label: "Trade",
      detail: "Connect outward",
      status: stepStatus(tradeDone, currentStepId === "trade"),
      value: state.tradeRouteDestination || undefined,
    },
    {
      id: "alliance-nation",
      label: "Alliance / Nation",
      detail: "Political direction",
      status: stepStatus(nationDone, currentStepId === "alliance-nation"),
      value: allianceNationValue,
    },
    {
      id: "empire",
      label: "Empire",
      detail: "Complete the arc",
      status: stepStatus(empireDone, currentStepId === "empire"),
      value: state.empireName || undefined,
    },
  ];

  const completedCount = steps.filter((step) => step.status === "complete").length;

  return {
    steps,
    action: resolveAction(state, currentStepId),
    spineLine: SPINE_LINE,
    completedCount,
  };
}

export function getPostClaimGuidance(state: SettlementState) {
  const objective = getDemoObjective(state);
  return {
    headline: objective.action.headline,
    description: objective.action.description,
    cta: objective.action.cta,
    href: objective.action.href,
    spineLine: objective.spineLine,
  };
}
