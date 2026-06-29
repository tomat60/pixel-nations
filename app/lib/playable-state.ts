import {
  createDefaultPlayableState,
  sanitizePlayableState,
  tickPlayableState,
  type PlayableState,
} from "./playable-engine";
import { readSettlementState } from "./settlement-state";

export const PLAYABLE_STATE_KEY = "pixelNations.playableState.v1";

export function readPlayableState(now = Date.now()): PlayableState {
  if (typeof window === "undefined") return createDefaultPlayableState(now);

  try {
    const serialized = localStorage.getItem(PLAYABLE_STATE_KEY);
    if (serialized) return tickPlayableState(sanitizePlayableState(JSON.parse(serialized), now), now);
  } catch {
    return createSeededPlayableState(now);
  }

  return createSeededPlayableState(now);
}

export function writePlayableState(state: PlayableState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAYABLE_STATE_KEY, JSON.stringify(sanitizePlayableState(state)));
}

export function clearPlayableState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAYABLE_STATE_KEY);
}

function createSeededPlayableState(now: number): PlayableState {
  const base = createDefaultPlayableState(now);

  try {
    const settlement = readSettlementState();
    const settlementLevel = settlement.empireFounded
      ? 4
      : settlement.nationFounded
        ? 3
        : settlement.townHallBuilt
          ? 2
          : 1;
    const nationProgress = settlement.nationFounded
      ? 100
      : settlement.townHallBuilt
        ? 45
        : settlement.settlementFounded
          ? 20
          : 0;

    return sanitizePlayableState(
      {
        ...base,
        resources: {
          food: Math.max(base.resources.food, settlement.food),
          materials: Math.max(base.resources.materials, settlement.materials),
          treasury: Math.max(base.resources.treasury, settlement.prosperity * 4),
          influence: Math.max(base.resources.influence, settlement.influence),
          stability: Math.max(base.resources.stability, settlement.stability),
        },
        population: Math.max(base.population, settlement.population || 0),
        settlementLevel,
        nationProgress,
        councilLevel: settlement.regionalAllianceFormed || settlement.nationFounded ? 1 : 0,
        tradeLevel: settlement.tradeRouteEstablished ? 1 : 0,
        landsSurveyed: settlement.landsControlled > 1 ? settlement.landsControlled - 1 : 0,
        log: [
          {
            id: "system-seeded",
            at: now,
            type: "system",
            title: settlement.claimedLandName ? "Origin land connected" : "Playable state created",
            body: settlement.claimedLandName
              ? `${settlement.claimedLandName} supplies the first command-center baseline.`
              : "A local-only playable settlement is ready for orders.",
          },
          ...base.log,
        ],
      },
      now,
    );
  } catch {
    return base;
  }
}
