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
export type EmpireDeclarationId = "aurelian-compact" | "frontier-crown" | "basin-hegemony";
export type CourtCaseDecisionId = "enforce-charter-law" | "favor-frontier-settlers" | "protect-trade-passage";
export type RivalResponseDecisionId = "enforce-by-decree" | "offer-tribute-passage" | "summon-border-assembly";
export type ConflictEscalationDecisionId = "raise-border-host" | "seize-pass-tariffs" | "summon-rival-envoys";
export type StandoffDecisionId = "show-of-force" | "open-talks";

export type Resources = { food: number; timber: number; stone: number; influence: number };
export type ChronicleEntry = { season: number; title: string; body: string };
export type DevelopmentOrder = { id: OrderId; label: string; short: string; requiresClaim?: boolean };
export type NationDecision = { id: NationDecisionId; label: string; short: string; effect: string };
export type RetentionChoice = { id: RetentionChoiceId; label: string; short: string; influenceDelta: number; villageMarker: string; worldMarker: string };
export type RetentionDecision = { id: RetentionDecisionId; season: number; title: string; prompt: string; choices: RetentionChoice[] };
export type RetentionRecord = { season: number; decisionId: RetentionDecisionId; choiceId: RetentionChoiceId; label: string; villageMarker: string; worldMarker: string };
export type FrontierObjective = { id: FrontierIntentId; label: string; target: string; targetSectorId: string; reason: string; result: string; secured: string };
export type EmpireDeclaration = { id: EmpireDeclarationId; label: string; title: string; short: string; effect: string };
export type CourtCaseDecision = { id: CourtCaseDecisionId; label: string; short: string; effect: string; worldEffect: string; influenceDelta: number };
export type ImperialCourtCase = { id: "north-ridge-dispute"; title: string; prompt: string; decisions: CourtCaseDecision[] };
export type RivalResponseDecision = { id: RivalResponseDecisionId; label: string; short: string; effect: string; worldEffect: string; influenceDelta: number; pressureDelta: number };
export type RivalResponse = { id: "obsidian-march-rejection"; title: string; rival: string; prompt: string; decisions: RivalResponseDecision[] };
export type ConflictEscalationDecision = { id: ConflictEscalationDecisionId; label: string; short: string; effect: string; worldEffect: string; influenceDelta: number; pressureDelta: number };
export type ConflictEscalation = { id: "first-imperial-ultimatum"; title: string; prompt: string; decisions: ConflictEscalationDecision[] };
export type StandoffDecision = { id: StandoffDecisionId; label: string; short: string; effect: string; worldEffect: string; influenceDelta: number; pressureDelta: number; pressureState: "active" | "contained" };
export type BorderHostStandoff = { id: "border-host-standoff"; title: string; prompt: string; decisions: StandoffDecision[] };

export type PlayState = {
  selectedPlotId: string;
  ownedPlotIds: string[];
  ownedSectorIds: string[];
  nationDecisionId: NationDecisionId | null;
  frontierIntentId: FrontierIntentId | null;
  empireDeclarationId: EmpireDeclarationId | null;
  courtCaseDecisionId: CourtCaseDecisionId | null;
  rivalResponseDecisionId: RivalResponseDecisionId | null;
  conflictEscalationDecisionId: ConflictEscalationDecisionId | null;
  standoffDecisionId: StandoffDecisionId | null;
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
  | { type: "declareEmpire"; declarationId: EmpireDeclarationId }
  | { type: "resolveCourtCase"; decisionId: CourtCaseDecisionId }
  | { type: "resolveRivalResponse"; decisionId: RivalResponseDecisionId }
  | { type: "resolveConflictEscalation"; decisionId: ConflictEscalationDecisionId }
  | { type: "resolveStandoff"; decisionId: StandoffDecisionId }
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

export const empireDeclarations: EmpireDeclaration[] = [
  { id: "aurelian-compact", label: "Aurelian Compact", title: "The Aurelian Compact", short: "Bind city, frontier and nation into one imperial charter.", effect: "Empire seed formed through civic legitimacy." },
  { id: "frontier-crown", label: "Frontier Crown", title: "The Frontier Crown", short: "Crown the secured pass as the first imperial mandate.", effect: "Empire seed formed through expansion legitimacy." },
  { id: "basin-hegemony", label: "Basin Hegemony", title: "The Basin Hegemony", short: "Declare the basin a protected imperial sphere.", effect: "Empire seed formed through territorial legitimacy." },
];

export const imperialCourtCases: ImperialCourtCase[] = [{
  id: "north-ridge-dispute",
  title: "North Ridge Passage Dispute",
  prompt: "The Charter Courts receive their first case: settlers, pass wardens and caravan brokers all claim rights over A-04 North Ridge.",
  decisions: [
    { id: "enforce-charter-law", label: "Enforce Charter Law", short: "The court makes one imperial record override local patronage.", effect: "+2 Influence; legitimacy rises because the charter settles the first border dispute.", worldEffect: "North Ridge becomes a lawful imperial passage before the first conflict system.", influenceDelta: 2 },
    { id: "favor-frontier-settlers", label: "Favor Frontier Settlers", short: "The court grants settlement rights to families who held the pass first.", effect: "+1 Influence; frontier families become loyal but older wardens resent the ruling.", worldEffect: "North Ridge becomes a settler-first route and future expansion pressure rises.", influenceDelta: 1 },
    { id: "protect-trade-passage", label: "Protect Trade Passage", short: "The court keeps the route open for caravans and market agents.", effect: "+1 Influence; prosperity has priority over local control.", worldEffect: "North Ridge becomes a protected trade corridor for future prosperity systems.", influenceDelta: 1 },
  ],
}];

export const rivalResponses: RivalResponse[] = [{
  id: "obsidian-march-rejection",
  title: "Obsidian March Rejection",
  rival: "The Obsidian March",
  prompt: "The Obsidian March rejects the Charter Courts ruling and sends riders to contest North Ridge before the law becomes permanent.",
  decisions: [
    { id: "enforce-by-decree", label: "Enforce by Decree", short: "Send imperial writs and wardens to prove the court has teeth.", effect: "+2 Influence, +8 Rival Pressure; the empire makes its first hard conflict signal.", worldEffect: "North Ridge is marked as a lawful border under active rival challenge.", influenceDelta: 2, pressureDelta: 8 },
    { id: "offer-tribute-passage", label: "Offer Tribute Passage", short: "Pay for safe passage and delay open conflict.", effect: "-2 Influence, -6 Rival Pressure; peace is bought but the rival learns the court can be bargained with.", worldEffect: "North Ridge stays open through tribute, turning the first conflict into an economic pressure point.", influenceDelta: -2, pressureDelta: -6 },
    { id: "summon-border-assembly", label: "Summon Border Assembly", short: "Call settlers, wardens and merchants to publicly defend the ruling.", effect: "+1 Influence, -3 Rival Pressure; legitimacy becomes the weapon before armies move.", worldEffect: "North Ridge becomes a public legitimacy test watched by neighboring powers.", influenceDelta: 1, pressureDelta: -3 },
  ],
}];

export const conflictEscalations: ConflictEscalation[] = [{
  id: "first-imperial-ultimatum",
  title: "The First Imperial Ultimatum",
  prompt: "After Enforce by Decree, the Obsidian March waits to see whether the Aurelian Empire chooses arms, tariffs, or envoys.",
  decisions: [
    { id: "raise-border-host", label: "Raise the Border Host", short: "Muster wardens and levy banners at North Ridge before the first battle system exists.", effect: "+1 Influence, +12 Rival Pressure; war-prep becomes the next visible frontier layer.", worldEffect: "A border host musters at North Ridge, turning the conflict into military readiness without simulating battle yet.", influenceDelta: 1, pressureDelta: 12 },
    { id: "seize-pass-tariffs", label: "Seize the Pass Tariffs", short: "Answer the March through toll houses, caravan controls and pressure on trade.", effect: "+3 Influence, +4 Rival Pressure; economic coercion becomes the first conflict lever.", worldEffect: "Tariff posts turn North Ridge into an economic choke point watched by rival merchants.", influenceDelta: 3, pressureDelta: 4 },
    { id: "summon-rival-envoys", label: "Summon the Rival Envoys", short: "Force the rival into public law before soldiers decide the pass.", effect: "+2 Influence, -5 Rival Pressure; diplomacy and law delay open war.", worldEffect: "Envoys are summoned to the pass, keeping the conflict inside imperial legitimacy for now.", influenceDelta: 2, pressureDelta: -5 },
  ],
}];

export const borderHostStandoffs: BorderHostStandoff[] = [{
  id: "border-host-standoff",
  title: "North Ridge Standoff",
  prompt: "The Border Host reaches North Ridge. Obsidian riders hold the far stones. The first standoff can become intimidation or negotiation.",
  decisions: [
    { id: "show-of-force", label: "Show of Force", short: "March banners to the ridge line and make the court ruling physically visible.", effect: "+2 Influence, +7 Rival Pressure; the March falls back for now, but future war pressure hardens.", worldEffect: "Aurelian banners hold North Ridge while Obsidian scouts withdraw beyond the pass.", influenceDelta: 2, pressureDelta: 7, pressureState: "contained" },
    { id: "open-talks", label: "Open Talks", short: "Invite Obsidian captains to witness the charter record before spears decide the pass.", effect: "+1 Influence, -8 Rival Pressure; the standoff cools into a negotiated border pause.", worldEffect: "Envoys stand between the host and Obsidian riders, containing the pass without a military display.", influenceDelta: 1, pressureDelta: -8, pressureState: "contained" },
  ],
}];

export const retentionDecisions: RetentionDecision[] = [
  { id: "grain-levy", season: 1, title: "Grain Levy", prompt: "The first harvest can fund the crown or keep families loyal.", choices: [
    { id: "authority", label: "Set the crown levy", short: "+2 Influence; banners mark the granary district.", influenceDelta: 2, villageMarker: "granary-levy", worldMarker: "crown-supply-line" },
    { id: "freedom", label: "Protect free stores", short: "+1 Influence; village stores become a civic commons.", influenceDelta: 1, villageMarker: "free-stores", worldMarker: "commons-route" },
  ] },
  { id: "open-roads", season: 2, title: "Border Roads", prompt: "The new border can harden into posts or open into trade roads.", choices: [
    { id: "authority", label: "Fortify the border road", short: "+1 Influence; watch fires mark the border.", influenceDelta: 1, villageMarker: "border-watchfires", worldMarker: "fortified-road" },
    { id: "freedom", label: "Open the market road", short: "+2 Influence; caravans mark the first open route.", influenceDelta: 2, villageMarker: "market-caravans", worldMarker: "open-market-road" },
  ] },
  { id: "scribe-patronage", season: 3, title: "Scribes or Foundries", prompt: "The first era needs memory and tools. Choose the institution people will see first.", choices: [
    { id: "authority", label: "Patron the scribes", short: "+1 Influence; a chronicle desk records the nation.", influenceDelta: 1, villageMarker: "scribe-desk", worldMarker: "law-stones" },
    { id: "freedom", label: "Fund the foundries", short: "+2 Influence; workshop smoke shows productive momentum.", influenceDelta: 2, villageMarker: "foundry-smoke", worldMarker: "workshop-road" },
  ] },
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
  empireDeclarationId: null,
  courtCaseDecisionId: null,
  rivalResponseDecisionId: null,
  conflictEscalationDecisionId: null,
  standoffDecisionId: null,
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

export function getSelectedPlot(state: PlayState): Plot { return plots.find((plot) => plot.id === state.selectedPlotId) ?? plots[0]; }
export function getOwnedPlot(state: PlayState): Plot | undefined { return plots.find((plot) => state.ownedPlotIds.includes(plot.id)); }
export function getNationDecision(state: PlayState) { return nationDecisions.find((decision) => decision.id === state.nationDecisionId) ?? null; }
export function getFrontierIntent(state: PlayState) { return frontierObjectives.find((objective) => objective.id === state.frontierIntentId) ?? null; }
export function getFrontierObjectiveSecured(state: PlayState) { const objective = getFrontierIntent(state); return Boolean(objective && getOwnedSectorIds(state).includes(objective.targetSectorId)); }
export function getEmpireDeclaration(state: PlayState) { return empireDeclarations.find((declaration) => declaration.id === state.empireDeclarationId) ?? null; }
export function getImperialCourtCase(state: PlayState) { return state.empireDeclarationId ? imperialCourtCases[0] : null; }
export function getCourtCaseDecision(state: PlayState) { const courtCase = getImperialCourtCase(state); return courtCase?.decisions.find((decision) => decision.id === state.courtCaseDecisionId) ?? null; }
export function getCourtCaseReady(state: PlayState) { return Boolean(getImperialCourtCase(state) && !state.courtCaseDecisionId); }
export function getRivalResponse(state: PlayState) { return state.courtCaseDecisionId ? rivalResponses[0] : null; }
export function getRivalResponseDecision(state: PlayState) { const response = getRivalResponse(state); return response?.decisions.find((decision) => decision.id === state.rivalResponseDecisionId) ?? null; }
export function getRivalResponseReady(state: PlayState) { return Boolean(getRivalResponse(state) && !state.rivalResponseDecisionId); }
export function getConflictEscalation(state: PlayState) { return state.rivalResponseDecisionId ? conflictEscalations[0] : null; }
export function getConflictEscalationDecision(state: PlayState) { const escalation = getConflictEscalation(state); return escalation?.decisions.find((decision) => decision.id === state.conflictEscalationDecisionId) ?? null; }
export function getConflictEscalationReady(state: PlayState) { return Boolean(getConflictEscalation(state) && !state.conflictEscalationDecisionId); }
export function getBorderHostStandoff(state: PlayState) { return state.conflictEscalationDecisionId === "raise-border-host" ? borderHostStandoffs[0] : null; }
export function getStandoffDecision(state: PlayState) { const standoff = getBorderHostStandoff(state); return standoff?.decisions.find((decision) => decision.id === state.standoffDecisionId) ?? null; }
export function getStandoffReady(state: PlayState) { return Boolean(getBorderHostStandoff(state) && !state.standoffDecisionId); }
export function getObsidianPressureState(state: PlayState): "none" | "active" | "contained" { if (getStandoffDecision(state)) return getStandoffDecision(state)?.pressureState ?? "contained"; if (state.conflictEscalationDecisionId === "raise-border-host") return "active"; return "none"; }
export function getEmpireReady(state: PlayState) { return Boolean(getFirstEraComplete(state) && state.nationDecisionId && getFrontierObjectiveSecured(state)); }
export function getNextRetentionDecision(state: PlayState) { if (!state.nationDecisionId || !state.foundingCeremonySeen) return null; return retentionDecisions.find((decision) => !state.retentionRecords.some((record) => record.decisionId === decision.id)) ?? null; }
export function getFirstEraComplete(state: PlayState) { return state.retentionRecords.length >= retentionDecisions.length; }
export function getPhase(state: PlayState): "unclaimed" | "camp" | "hamlet" | "village" | "city-seed" | "nation-seed" { if (state.ownedPlotIds.length === 0) return "unclaimed"; if (state.nationDecisionId) return "nation-seed"; if (state.completedOrders.includes("form-council") && state.completedOrders.includes("open-market") && state.completedOrders.includes("fortify-watch")) return "city-seed"; if (state.completedOrders.includes("form-council") || state.completedOrders.length >= 6) return "village"; if (state.completedOrders.length >= 3) return "hamlet"; return "camp"; }
export function getPopulation(state: PlayState) { if (state.ownedPlotIds.length === 0) return 0; return 18 + state.completedOrders.length * 9 + state.settlementMarkers.length * 7 + Math.max(0, getOwnedSectorIds(state).length - 1) * 11 + (state.nationDecisionId === "settler-rights" ? 18 : 0) + state.retentionRecords.length * 5 + (state.courtCaseDecisionId === "favor-frontier-settlers" ? 9 : 0); }
export function getDevelopmentScore(state: PlayState) { return state.completedOrders.length * 8 + state.settlementMarkers.length * 6 + state.scoutedPlotIds.length * 2 + state.resources.influence * 3 + getOwnedSectorIds(state).length * 5 + (state.nationDecisionId ? 14 : 0) + state.retentionRecords.length * 7 + (state.frontierIntentId ? 6 : 0) + (getFrontierObjectiveSecured(state) ? 10 : 0) + (state.empireDeclarationId ? 18 : 0) + (state.courtCaseDecisionId ? 9 : 0) + (state.rivalResponseDecisionId ? 12 : 0) + (state.conflictEscalationDecisionId ? 14 : 0) + (state.standoffDecisionId ? 16 : 0); }
export function getRivalPressure(state: PlayState) { const base = state.season >= 8 ? 28 : state.season >= 5 ? 18 : 8; const scoutRelief = state.completedOrders.includes("scout-nearby") ? 4 : 0; const defenseRelief = state.completedOrders.includes("fortify-watch") ? 8 : 0; const nationRelief = state.nationDecisionId === "border-guard" ? 8 : 0; const retentionRelief = state.retentionRecords.some((record) => record.worldMarker === "fortified-road") ? 4 : 0; const objectiveRelief = getFrontierObjectiveSecured(state) ? 3 : 0; const empireRelief = state.empireDeclarationId ? 4 : 0; const courtRelief = state.courtCaseDecisionId === "enforce-charter-law" ? 4 : 0; const rivalChallenge = state.courtCaseDecisionId ? 16 : 0; const rivalDecision = getRivalResponseDecision(state); const escalationDecision = getConflictEscalationDecision(state); const standoffDecision = getStandoffDecision(state); return Math.max(0, base + rivalChallenge + (rivalDecision?.pressureDelta ?? 0) + (escalationDecision?.pressureDelta ?? 0) + (standoffDecision?.pressureDelta ?? 0) - scoutRelief - defenseRelief - nationRelief - retentionRelief - objectiveRelief - empireRelief - courtRelief); }
export function getWorldClaimedCount(state: PlayState) { return getOwnedSectorIds(state).length; }

function hasOrder(state: PlayState, orderId: OrderId) { return state.completedOrders.includes(orderId); }
function pushChronicle(state: PlayState, title: string, body: string): ChronicleEntry[] { return [{ season: state.season + 1, title, body }, ...state.chronicle].slice(0, 10); }
function addMarker(markers: SettlementMarker[], marker: SettlementMarker): SettlementMarker[] { return markers.includes(marker) ? markers : [...markers, marker]; }

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
  return { retentionRecords: [...state.retentionRecords, record], resources: { ...state.resources, influence: state.resources.influence + choice.influenceDelta }, chronicle: pushChronicle(state, decision.title, `${choice.label}: ${choice.short}`), lastEvent: `Season ${decision.season} resolved: ${choice.label}.` };
}

export function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case "hydrate": return { ...initialPlayState, ...action.state, resources: { ...initialPlayState.resources, ...action.state.resources }, retentionRecords: action.state.retentionRecords ?? [], frontierIntentId: action.state.frontierIntentId ?? null, empireDeclarationId: action.state.empireDeclarationId ?? null, courtCaseDecisionId: action.state.courtCaseDecisionId ?? null, rivalResponseDecisionId: action.state.rivalResponseDecisionId ?? null, conflictEscalationDecisionId: action.state.conflictEscalationDecisionId ?? null, standoffDecisionId: action.state.standoffDecisionId ?? null };
    case "select": return { ...state, selectedPlotId: action.plotId, view: state.view === "village" ? "map" : state.view };
    case "setView": return { ...state, view: action.view };
    case "claim": {
      if (state.ownedPlotIds.includes(action.plotId)) return state;
      const plot = plots.find((item) => item.id === action.plotId);
      return { ...state, selectedPlotId: action.plotId, ownedPlotIds: [action.plotId], ownedSectorIds: [homelandSectorId], nationDecisionId: null, frontierIntentId: null, empireDeclarationId: null, courtCaseDecisionId: null, rivalResponseDecisionId: null, conflictEscalationDecisionId: null, standoffDecisionId: null, foundingCeremonySeen: false, season: 2, view: "village", settlementMarkers: ["camp"], resources: { food: 3, timber: 2, stone: 0, influence: 1 }, chronicle: pushChronicle(state, "First banner raised", `${plot?.name ?? "A land"} became the first claimed homeland.`), retentionRecords: [], lastEvent: `${plot?.name ?? "A land"} is claimed. Enter Village, then choose Orders.` };
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
      return { ...state, nationDecisionId: decision.id, frontierIntentId: null, empireDeclarationId: null, courtCaseDecisionId: null, rivalResponseDecisionId: null, conflictEscalationDecisionId: null, standoffDecisionId: null, foundingCeremonySeen: false, resources: { ...state.resources, influence: state.resources.influence + influenceGain }, season: Math.min(12, state.season + 1), view: "council", retentionRecords: [], chronicle: pushChronicle(state, "Nation founded", `${decision.label} became the first doctrine binding ${getOwnedSectorIds(state).length} sectors.`), lastEvent: `Nation founded: ${decision.label}. ${decision.effect}` };
    }
    case "dismissFoundingCeremony": return state.nationDecisionId ? { ...state, foundingCeremonySeen: true, view: "council", lastEvent: "The first nation stands. Advance Season to write its first era." } : state;
    case "advanceSeason": { const result = resolveRetentionDecision(state, action.decisionId, action.choiceId); if (!result) return { ...state, lastEvent: "No available nation season decision.", view: "council" }; return { ...state, ...result, season: Math.min(12, state.season + 1), view: "council" }; }
    case "setFrontierIntent": {
      if (!getFirstEraComplete(state)) return { ...state, view: "council", lastEvent: "Finish the first era before setting a frontier objective." };
      if (state.frontierIntentId) return { ...state, view: "council", lastEvent: "The next frontier objective is already recorded." };
      const objective = frontierObjectives.find((item) => item.id === action.intentId);
      if (!objective) return { ...state, view: "council", lastEvent: "Unknown frontier objective." };
      return { ...state, frontierIntentId: objective.id, empireDeclarationId: null, courtCaseDecisionId: null, rivalResponseDecisionId: null, conflictEscalationDecisionId: null, standoffDecisionId: null, view: "council", chronicle: pushChronicle(state, "Frontier objective recorded", `${objective.label}: ${objective.result}`), lastEvent: `Frontier objective recorded: ${objective.target}.` };
    }
    case "declareEmpire": {
      if (!getEmpireReady(state)) return { ...state, view: "council", lastEvent: "Secure the frontier objective before declaring an empire." };
      if (state.empireDeclarationId) return { ...state, view: "council", lastEvent: "The empire declaration is already recorded." };
      const declaration = empireDeclarations.find((item) => item.id === action.declarationId);
      if (!declaration) return { ...state, view: "council", lastEvent: "Unknown empire declaration." };
      return { ...state, empireDeclarationId: declaration.id, courtCaseDecisionId: null, rivalResponseDecisionId: null, conflictEscalationDecisionId: null, standoffDecisionId: null, view: "council", chronicle: pushChronicle(state, "Empire declared", `${declaration.title}: ${declaration.effect}`), lastEvent: `Empire declared: ${declaration.title}.` };
    }
    case "resolveCourtCase": {
      const courtCase = getImperialCourtCase(state);
      if (!courtCase) return { ...state, view: "council", lastEvent: "Declare the empire before hearing court cases." };
      if (state.courtCaseDecisionId) return { ...state, view: "council", lastEvent: "The first court case is already resolved." };
      const decision = courtCase.decisions.find((item) => item.id === action.decisionId);
      if (!decision) return { ...state, view: "council", lastEvent: "Unknown court ruling." };
      return { ...state, courtCaseDecisionId: decision.id, rivalResponseDecisionId: null, conflictEscalationDecisionId: null, standoffDecisionId: null, resources: { ...state.resources, influence: state.resources.influence + decision.influenceDelta }, season: Math.min(12, state.season + 1), view: "council", chronicle: pushChronicle(state, courtCase.title, `${decision.label}: ${decision.effect}`), lastEvent: `Court case resolved: ${decision.label}.` };
    }
    case "resolveRivalResponse": {
      const response = getRivalResponse(state);
      if (!response) return { ...state, view: "council", lastEvent: "Resolve the court case before rivals can answer." };
      if (state.rivalResponseDecisionId) return { ...state, view: "council", lastEvent: "The first rival response is already answered." };
      const decision = response.decisions.find((item) => item.id === action.decisionId);
      if (!decision) return { ...state, view: "council", lastEvent: "Unknown rival response." };
      return { ...state, rivalResponseDecisionId: decision.id, conflictEscalationDecisionId: null, standoffDecisionId: null, resources: { ...state.resources, influence: Math.max(0, state.resources.influence + decision.influenceDelta) }, season: Math.min(12, state.season + 1), view: "council", chronicle: pushChronicle(state, response.title, `${decision.label}: ${decision.effect}`), lastEvent: `Rival response answered: ${decision.label}.` };
    }
    case "resolveConflictEscalation": {
      const escalation = getConflictEscalation(state);
      if (!escalation) return { ...state, view: "council", lastEvent: "Answer the rival response before issuing an ultimatum." };
      if (state.conflictEscalationDecisionId) return { ...state, view: "council", lastEvent: "The first imperial ultimatum is already recorded." };
      const decision = escalation.decisions.find((item) => item.id === action.decisionId);
      if (!decision) return { ...state, view: "council", lastEvent: "Unknown conflict escalation." };
      return { ...state, conflictEscalationDecisionId: decision.id, standoffDecisionId: null, resources: { ...state.resources, influence: Math.max(0, state.resources.influence + decision.influenceDelta) }, season: Math.min(12, state.season + 1), view: "council", chronicle: pushChronicle(state, escalation.title, `${decision.label}: ${decision.effect}`), lastEvent: `Conflict escalation chosen: ${decision.label}.` };
    }
    case "resolveStandoff": {
      const standoff = getBorderHostStandoff(state);
      if (!standoff) return { ...state, view: "council", lastEvent: "Raise the Border Host before resolving the standoff." };
      if (state.standoffDecisionId) return { ...state, view: "council", lastEvent: "The North Ridge standoff is already resolved." };
      const decision = standoff.decisions.find((item) => item.id === action.decisionId);
      if (!decision) return { ...state, view: "council", lastEvent: "Unknown standoff decision." };
      return { ...state, standoffDecisionId: decision.id, resources: { ...state.resources, influence: Math.max(0, state.resources.influence + decision.influenceDelta) }, season: Math.min(12, state.season + 1), view: "council", chronicle: pushChronicle(state, standoff.title, `${decision.label}: ${decision.effect}`), lastEvent: `Standoff outcome: ${decision.label}.` };
    }
    case "runOrder": { const result = orderResult(state, action.orderId); if (!result) return { ...state, lastEvent: "That order is already resolved or needs a claimed land." }; return { ...state, ...result, season: Math.min(12, state.season + 1), completedOrders: [...state.completedOrders, action.orderId], view: "village" }; }
    case "reset": return initialPlayState;
    default: return state;
  }
}
