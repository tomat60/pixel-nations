import {
  getSettlementForecast,
  type PlayState,
} from "./play-state";

export type FrontierRecoveryGuidance = {
  blockedStat: "stability" | "prosperity";
  blockedLabel: string;
  objective: string;
  council: string;
  recommendedFocus: "stores" | "charter" | null;
  projectedProsperityGain: number | null;
};

function getStableProsperityGain(state: PlayState): number | null {
  const forecast = getSettlementForecast(state);
  if (!forecast.allCrewsAssigned || forecast.shortage) return null;

  let gain = 1;
  if (forecast.stone > 0) gain += 1;
  if (forecast.timber + forecast.influence >= 6) gain += 1;
  return gain;
}

export function getFrontierRecoveryGuidance(
  state: PlayState,
  missing: "stability" | "prosperity",
): FrontierRecoveryGuidance {
  const forecast = getSettlementForecast(state);

  if (missing === "stability") {
    const charterReady = state.settlementFocusId === "charter" && state.settlementWorkers.civic >= 2 && !forecast.shortage;
    const focusLabel = charterReady ? "Write Charter" : "Secure Stores";
    return {
      blockedStat: "stability",
      blockedLabel: `Stability ${state.settlementStability}/2`,
      recommendedFocus: charterReady ? "charter" : "stores",
      projectedProsperityGain: getStableProsperityGain(state),
      objective: `Recovery season: open Orders, assign all crews, choose ${focusLabel}, make the forecast Stable, then End season. A stable ${focusLabel} season adds Stability (${state.settlementStability}/2).`,
      council: `Stability ${state.settlementStability}/2 blocks the frontier. Plan a recovery season in Orders: assign all crews, choose ${focusLabel}, and only End season when the forecast reads Stable. That focus can add +1 Stability next cycle.`,
    };
  }

  const projectedProsperityGain = getStableProsperityGain(state);
  const projection = projectedProsperityGain === null
    ? "A stable season adds at least +1 Prosperity."
    : `The current stable forecast adds +${projectedProsperityGain} Prosperity.`;

  return {
    blockedStat: "prosperity",
    blockedLabel: `Prosperity ${state.settlementProsperity}/2`,
    recommendedFocus: null,
    projectedProsperityGain,
    objective: `Recovery season: open Orders, assign all crews and make the next-cycle forecast Stable before ending the season. ${projection} Prosperity is ${state.settlementProsperity}/2.`,
    council: `Prosperity ${state.settlementProsperity}/2 blocks the frontier. Use Orders to build a Stable next-cycle forecast instead of waiting. ${projection}`,
  };
}
