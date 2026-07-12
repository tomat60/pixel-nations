import type { StrategicPostureId } from "./strategic-branches";

export const IMPERIAL_TURN_LIMIT = 3;

export type ImperialTurnActionId =
  | "reinforce-ridge"
  | "rotate-patrols"
  | "tighten-inspections"
  | "subsidize-caravans"
  | "press-recognition"
  | "renew-border-charter";

export type ImperialPressureBand = "low" | "guarded" | "critical";

export type ImperialTurnAction = {
  id: ImperialTurnActionId;
  postureId: StrategicPostureId;
  label: string;
  short: string;
  influenceDelta: number;
  pressureDelta: number;
  worldMarker: string;
};

export const imperialTurnActions: ImperialTurnAction[] = [
  {
    id: "reinforce-ridge",
    postureId: "martial",
    label: "Reinforce the Ridge",
    short: "Raise stronger earthworks and keep the Border Host visible above North Ridge.",
    influenceDelta: 2,
    pressureDelta: 6,
    worldMarker: "Ridge forts expand under Aurelian banners.",
  },
  {
    id: "rotate-patrols",
    postureId: "martial",
    label: "Rotate the Patrols",
    short: "Keep the host ready while replacing exhausted wardens and cooling the frontier.",
    influenceDelta: 1,
    pressureDelta: -4,
    worldMarker: "Fresh patrols hold the pass without advancing the line.",
  },
  {
    id: "tighten-inspections",
    postureId: "mercantile",
    label: "Tighten Inspections",
    short: "Inspect every Obsidian caravan and turn passage control into visible imperial revenue.",
    influenceDelta: 3,
    pressureDelta: 4,
    worldMarker: "Inspection seals multiply across the North Ridge toll houses.",
  },
  {
    id: "subsidize-caravans",
    postureId: "mercantile",
    label: "Subsidize Caravans",
    short: "Spend influence to keep lawful caravans moving and lower pressure around the closed pass.",
    influenceDelta: -1,
    pressureDelta: -6,
    worldMarker: "Subsidized caravans reopen a controlled route through the ridge.",
  },
  {
    id: "press-recognition",
    postureId: "diplomatic",
    label: "Press Recognition",
    short: "Demand another public Obsidian concession while the envoy summit still commands attention.",
    influenceDelta: 2,
    pressureDelta: 2,
    worldMarker: "New recognition seals appear beside the Aurelian border charter.",
  },
  {
    id: "renew-border-charter",
    postureId: "diplomatic",
    label: "Renew the Border Charter",
    short: "Trade immediate prestige for a stronger shared rule that lowers the chance of open conflict.",
    influenceDelta: 0,
    pressureDelta: -7,
    worldMarker: "A renewed charter line marks North Ridge as a negotiated frontier.",
  },
];

export function getImperialTurnActions(postureId: StrategicPostureId | null | undefined): ImperialTurnAction[] {
  if (!postureId) return [];
  return imperialTurnActions.filter((action) => action.postureId === postureId);
}

export function getImperialTurnAction(actionId: ImperialTurnActionId | null | undefined): ImperialTurnAction | null {
  if (!actionId) return null;
  return imperialTurnActions.find((action) => action.id === actionId) ?? null;
}

export function getImperialTurnHistory(actionIds: ImperialTurnActionId[] | null | undefined): ImperialTurnAction[] {
  return (actionIds ?? []).map((actionId) => getImperialTurnAction(actionId)).filter((action): action is ImperialTurnAction => Boolean(action));
}

export function getImperialTurnPressureDelta(actionIds: ImperialTurnActionId[] | null | undefined): number {
  return getImperialTurnHistory(actionIds).reduce((total, action) => total + action.pressureDelta, 0);
}

export function getImperialPressureBand(pressure: number): ImperialPressureBand {
  if (pressure <= 35) return "low";
  if (pressure <= 55) return "guarded";
  return "critical";
}
