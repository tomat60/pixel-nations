import {
  getEmpireCrisisRecovery,
  getFounderRecordOutcomeLabel,
  getImperialTurnHistory,
  getPostCrisisFrontierPayoffTarget,
  getPostCrisisResponseDecision,
  getRivalPressure,
  getStrategicOutcome,
  getStrategicPosture,
  type PlayState,
} from "./play-state";

export const previousFounderRecordV1StorageKey = "pixelNations.previousFounderRecord.v1";

export type PreviousFounderRecordSnapshot = {
  version: 1;
  posture: { id: string; label: string };
  outcome: { id: string; label: string; worldEffect: string };
  crisisRecovery: { id: string; label: string; worldEffect: string } | null;
  postCrisisResponse: { id: string; label: string; short: string } | null;
  frontierPayoff: { id: string; label: string; short: string; secured: true } | null;
  turns: Array<{ id: string; label: string }>;
  influence: number;
  rivalPressure: number;
};

export function createPreviousFounderRecordSnapshot(state: PlayState): PreviousFounderRecordSnapshot | null {
  const posture = getStrategicPosture(state);
  const outcome = getStrategicOutcome(state);
  const turns = getImperialTurnHistory(state);

  if (!state.empireDeclarationId || !posture || !outcome || turns.length < 3) return null;

  const crisisRecovery = getEmpireCrisisRecovery(state);
  const postCrisisResponse = getPostCrisisResponseDecision(state);
  const frontierPayoff = state.postCrisisFrontierPayoffSecured ? getPostCrisisFrontierPayoffTarget(state) : null;

  return {
    version: 1,
    posture: { id: posture.postureId, label: posture.label },
    outcome: {
      id: outcome.id,
      label: getFounderRecordOutcomeLabel(state),
      worldEffect: outcome.worldEffect,
    },
    crisisRecovery: crisisRecovery
      ? { id: crisisRecovery.id, label: crisisRecovery.label, worldEffect: crisisRecovery.worldEffect }
      : null,
    postCrisisResponse: postCrisisResponse
      ? { id: postCrisisResponse.id, label: postCrisisResponse.label, short: postCrisisResponse.short }
      : null,
    frontierPayoff: frontierPayoff
      ? { id: frontierPayoff.id, label: frontierPayoff.label, short: frontierPayoff.short, secured: true }
      : null,
    turns: turns.slice(0, 3).map((turn) => ({ id: turn.id, label: turn.label })),
    influence: state.resources.influence,
    rivalPressure: getRivalPressure(state),
  };
}

export function parsePreviousFounderRecordSnapshot(raw: string | null): PreviousFounderRecordSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PreviousFounderRecordSnapshot>;
    if (parsed.version !== 1) return null;
    if (!parsed.posture?.id || !parsed.posture.label) return null;
    if (!parsed.outcome?.id || !parsed.outcome.label || typeof parsed.outcome.worldEffect !== "string") return null;
    if (!Array.isArray(parsed.turns) || parsed.turns.length < 3) return null;
    if (typeof parsed.influence !== "number" || typeof parsed.rivalPressure !== "number") return null;
    return parsed as PreviousFounderRecordSnapshot;
  } catch {
    return null;
  }
}
