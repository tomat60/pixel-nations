import type { SettlementState } from "./settlement-state";

type ContinuityStep = {
  id: string;
  label: string;
  value: string;
  active: boolean;
};

type ContinuitySignal = {
  label: string;
  value: string;
};

export type ContinuitySummary = {
  trait: string;
  subtitle: string;
  meaning: string;
  recommendation: string;
  pathSteps: ContinuityStep[];
  signals: ContinuitySignal[];
};

function pickRealmTrait(state: SettlementState) {
  const focus = `${state.settlementFocusId || ""} ${state.settlementFocus || ""}`.toLowerCase();
  const route = `${state.tradeRouteId || ""} ${state.tradeRouteDestination || ""} ${state.tradeRouteBonus || ""}`.toLowerCase();
  const alliance = `${state.allianceStrategy || ""} ${state.allianceBonus || ""}`.toLowerCase();
  const doctrine = `${state.nationDoctrineId || ""} ${state.nationDoctrine || ""}`.toLowerCase();
  const direction = `${state.empireDirectionId || ""} ${state.empireDirection || ""}`.toLowerCase();

  if ((focus.includes("growth") || focus.includes("civic")) && route.includes("iron")) {
    return {
      trait: "Industrial Frontier",
      subtitle: "Growth, iron, and civic order are pulling the realm outward.",
      meaning: "Your first city did not just grow. It found a durable supply line and began turning settlement pressure into national strength.",
    };
  }

  if (route.includes("ember")) {
    return {
      trait: "Expanding Hearthland",
      subtitle: "Food, families, and basin routes make the realm feel settled before it expands.",
      meaning: "Your path is becoming a grounded homeland: strong enough to welcome people, feed them, and then organize them.",
    };
  }

  if (route.includes("crown") || alliance.includes("market") || doctrine.includes("free")) {
    return {
      trait: "Diplomatic Market Realm",
      subtitle: "Trade and political legitimacy are doing more work than raw force.",
      meaning: "Your realm is learning to turn routes, partners, and institutions into power.",
    };
  }

  if (focus.includes("defense") || alliance.includes("industrial") || doctrine.includes("iron") || direction.includes("command")) {
    return {
      trait: "Ordered Frontier State",
      subtitle: "Security, discipline, and hard borders define the rise from land to nation.",
      meaning: "Your path favors control: the first land becomes safe, the city becomes structured, and the nation becomes harder to break.",
    };
  }

  if (state.empireFounded) {
    return {
      trait: "Founding Empire",
      subtitle: "The first arc is complete: one land has become an empire.",
      meaning: "Your choices now read as a complete origin story, not isolated screens.",
    };
  }

  if (state.nationFounded) {
    return {
      trait: "Rising Nation",
      subtitle: "Your settlement, route, and alliance have become a political identity.",
      meaning: "The realm has enough memory to justify its first national direction.",
    };
  }

  if (state.tradeRouteEstablished) {
    return {
      trait: "Connected Settlement",
      subtitle: "The city has made its first external connection.",
      meaning: "The land is no longer only a claim. It is becoming a place that other places must react to.",
    };
  }

  return {
    trait: state.settlementFounded ? "First City Path" : "Unwritten Origin",
    subtitle: state.settlementFounded
      ? "The first settlement has a direction, but the wider realm is still forming."
      : "Claim land and found a settlement to begin the path.",
    meaning: state.settlementFounded
      ? "Your next choices should make the city feel like the start of something larger."
      : "The world is waiting for its first meaningful player-made history.",
  };
}

function getRecommendation(state: SettlementState) {
  if (!state.claimedLand) return "Claim land to create your origin.";
  if (!state.settlementFounded) return "Found a settlement so the land has people, purpose, and memory.";
  if (!state.townHallBuilt) return "Build the Town Hall to turn the settlement into a civic center.";
  if (!state.tradeRouteEstablished) return "Create a trade route so the city can affect the region.";
  if (!state.regionalAllianceFormed) return "Form a regional alliance to give the city political reach.";
  if (!state.nationFounded) return "Found the nation so earlier city choices become doctrine.";
  if (!state.empireFounded) return "Declare empire to complete the first land-to-empire arc.";
  return "First arc complete. Future systems should deepen geography, diplomacy, economy, and rival powers.";
}

export function getContinuitySummary(state: SettlementState): ContinuitySummary {
  const trait = pickRealmTrait(state);

  const pathSteps: ContinuityStep[] = [
    {
      id: "land",
      label: "Land",
      value: state.claimedLandName || "Unclaimed",
      active: state.claimedLand,
    },
    {
      id: "settlement",
      label: "Settlement",
      value: state.settlementFounded ? state.settlementName || "First city" : "Not founded",
      active: state.settlementFounded,
    },
    {
      id: "trade",
      label: "Trade",
      value: state.tradeRouteEstablished ? state.tradeRouteDestination || "Regional route" : "No route",
      active: state.tradeRouteEstablished,
    },
    {
      id: "alliance",
      label: "Alliance",
      value: state.regionalAllianceFormed ? state.allianceName || "Regional pact" : "No pact",
      active: state.regionalAllianceFormed,
    },
    {
      id: "nation",
      label: "Nation",
      value: state.nationFounded ? state.nationName || "First nation" : "Not founded",
      active: state.nationFounded,
    },
    {
      id: "empire",
      label: "Empire",
      value: state.empireFounded ? state.empireName || "First empire" : "Not declared",
      active: state.empireFounded,
    },
  ];

  const signals: ContinuitySignal[] = [
    { label: "Origin", value: state.claimedLandName || state.claimedLandRegion || "Awaiting claim" },
    { label: "Focus", value: state.settlementFocus || "No city focus yet" },
    { label: "Route", value: state.tradeRouteEstablished ? state.tradeRouteDestination || "Regional route" : "No trade route yet" },
    { label: "Doctrine", value: state.nationFounded ? state.nationDoctrine || state.nationIdeology || "Nation founded" : "No nation yet" },
  ];

  if (state.empireFounded) {
    signals.push({ label: "Imperial Direction", value: state.empireDirection || state.empireDoctrine || "Empire founded" });
  }

  return {
    ...trait,
    recommendation: getRecommendation(state),
    pathSteps,
    signals,
  };
}
