export type StrategicEscalationId = "raise-border-host" | "seize-pass-tariffs" | "summon-rival-envoys";
export type StrategicPostureId = "martial" | "mercantile" | "diplomatic";
export type StrategicOutcomeId =
  | "show-of-force"
  | "open-talks"
  | "lock-the-tolls"
  | "open-caravan-truce"
  | "demand-recognition"
  | "offer-border-charter";

export type StrategicTone = "red" | "sky" | "purple";

export type StrategicOutcome = {
  id: StrategicOutcomeId;
  label: string;
  short: string;
  effect: string;
  worldEffect: string;
  influenceDelta: number;
  pressureDelta: number;
  pressureState: "active" | "contained";
};

export type StrategicBranch = {
  postureId: StrategicPostureId;
  escalationId: StrategicEscalationId;
  label: string;
  title: string;
  prompt: string;
  worldSignal: string;
  tone: StrategicTone;
  outcomes: StrategicOutcome[];
};

export const strategicBranches: StrategicBranch[] = [
  {
    postureId: "martial",
    escalationId: "raise-border-host",
    label: "Martial Posture",
    title: "North Ridge Standoff",
    prompt: "The Border Host reaches North Ridge. Obsidian riders hold the far stones. The first standoff can become intimidation or negotiation.",
    worldSignal: "The Border Host holds the ridge line under the Aurelian banner.",
    tone: "red",
    outcomes: [
      {
        id: "show-of-force",
        label: "Show of Force",
        short: "March banners to the ridge line and make the court ruling physically visible.",
        effect: "+2 Influence, +7 Rival Pressure; the March falls back for now, but future war pressure hardens.",
        worldEffect: "Aurelian banners hold North Ridge while Obsidian scouts withdraw beyond the pass.",
        influenceDelta: 2,
        pressureDelta: 7,
        pressureState: "contained",
      },
      {
        id: "open-talks",
        label: "Open Talks",
        short: "Invite Obsidian captains to witness the charter record before spears decide the pass.",
        effect: "+1 Influence, -8 Rival Pressure; the standoff cools into a negotiated border pause.",
        worldEffect: "Envoys stand between the host and Obsidian riders, containing the pass without a military display.",
        influenceDelta: 1,
        pressureDelta: -8,
        pressureState: "contained",
      },
    ],
  },
  {
    postureId: "mercantile",
    escalationId: "seize-pass-tariffs",
    label: "Mercantile Posture",
    title: "The Pass Tariff Crisis",
    prompt: "Aurelian toll houses now control North Ridge. Obsidian merchants demand a route before trade hardens into a permanent economic border.",
    worldSignal: "Tariff posts turn North Ridge into the empire's first economic pressure point.",
    tone: "sky",
    outcomes: [
      {
        id: "lock-the-tolls",
        label: "Lock the Tolls",
        short: "Close the imperial gates to Obsidian caravans until the March accepts Aurelian passage law.",
        effect: "+3 Influence, +6 Rival Pressure; the empire proves it can control trade, but merchants begin rerouting around the basin.",
        worldEffect: "Aurelian toll houses dominate the pass while Obsidian caravans gather beyond the closed gates.",
        influenceDelta: 3,
        pressureDelta: 6,
        pressureState: "contained",
      },
      {
        id: "open-caravan-truce",
        label: "Open a Caravan Truce",
        short: "Grant limited passage under imperial seals and turn the crisis into a controlled trade corridor.",
        effect: "+1 Influence, -6 Rival Pressure; trade resumes under Aurelian terms without a full economy simulation.",
        worldEffect: "Sealed caravans cross North Ridge under a temporary Aurelian-Obsidian trade truce.",
        influenceDelta: 1,
        pressureDelta: -6,
        pressureState: "contained",
      },
    ],
  },
  {
    postureId: "diplomatic",
    escalationId: "summon-rival-envoys",
    label: "Diplomatic Posture",
    title: "The North Ridge Envoy Summit",
    prompt: "Obsidian envoys enter the Charter Courts' shadow. The summit can demand recognition or create the first shared border rule.",
    worldSignal: "Envoys gather at North Ridge while both powers test whether law can contain the frontier.",
    tone: "purple",
    outcomes: [
      {
        id: "demand-recognition",
        label: "Demand Recognition",
        short: "Require the Obsidian March to recognize the Charter Courts ruling before any border discussion continues.",
        effect: "+2 Influence, +3 Rival Pressure; imperial legitimacy rises, but the rival signs under visible resentment.",
        worldEffect: "An Obsidian seal recognizes Aurelian law at North Ridge while rival banners remain beyond the pass.",
        influenceDelta: 2,
        pressureDelta: 3,
        pressureState: "contained",
      },
      {
        id: "offer-border-charter",
        label: "Offer a Border Charter",
        short: "Write a shared passage rule that recognizes both powers without surrendering the imperial claim.",
        effect: "+1 Influence, -9 Rival Pressure; the first diplomatic compact contains the conflict through law.",
        worldEffect: "A joint border charter marks North Ridge as a negotiated passage watched by both realms.",
        influenceDelta: 1,
        pressureDelta: -9,
        pressureState: "contained",
      },
    ],
  },
];

export function getStrategicBranchDefinition(escalationId: StrategicEscalationId | null | undefined): StrategicBranch | null {
  return strategicBranches.find((branch) => branch.escalationId === escalationId) ?? null;
}

export function getStrategicOutcomeDefinition(
  escalationId: StrategicEscalationId | null | undefined,
  outcomeId: StrategicOutcomeId | null | undefined,
): StrategicOutcome | null {
  if (!outcomeId) return null;
  return getStrategicBranchDefinition(escalationId)?.outcomes.find((outcome) => outcome.id === outcomeId) ?? null;
}
