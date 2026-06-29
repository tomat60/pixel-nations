export type PlayableResourceKey = "food" | "materials" | "treasury" | "influence" | "stability";

export type PlayableResources = Record<PlayableResourceKey, number>;

export type PlayableActionId =
  | "gather-food"
  | "quarry-materials"
  | "build-housing"
  | "improve-fields"
  | "upgrade-core"
  | "organize-council"
  | "open-trade"
  | "scout-land";

export type PlayableActionDefinition = {
  id: PlayableActionId;
  label: string;
  shortLabel: string;
  description: string;
  durationSeconds: number;
  workerNeed: number;
  cost: Partial<PlayableResources>;
  produces: string;
};

export type QueuedPlayableAction = {
  queueId: string;
  actionId: PlayableActionId;
  label: string;
  startedAt: number;
  endsAt: number;
  durationMs: number;
};

export type PlayableLogEntry = {
  id: string;
  at: number;
  type: "action" | "event" | "system";
  title: string;
  body: string;
};

export type PlayableState = {
  version: 1;
  createdAt: number;
  updatedAt: number;
  lastTickAt: number;
  actionCounter: number;
  eventCounter: number;
  resources: PlayableResources;
  population: number;
  settlementLevel: number;
  nationProgress: number;
  fieldsLevel: number;
  quarryLevel: number;
  housingLevel: number;
  councilLevel: number;
  tradeLevel: number;
  landsSurveyed: number;
  queue: QueuedPlayableAction[];
  log: PlayableLogEntry[];
  triggeredEvents: string[];
};

const TICK_MS = 3000;
const OFFLINE_CAP_MS = 10 * 60 * 1000;
const MAX_QUEUE = 3;
const MAX_LOG = 14;

export const PLAYABLE_ACTIONS: PlayableActionDefinition[] = [
  {
    id: "gather-food",
    label: "Gather Food",
    shortLabel: "Gather",
    description: "Send workers to secure immediate supplies.",
    durationSeconds: 12,
    workerNeed: 6,
    cost: {},
    produces: "+14 food",
  },
  {
    id: "quarry-materials",
    label: "Quarry Materials",
    shortLabel: "Quarry",
    description: "Cut stone and timber for the next civic works.",
    durationSeconds: 14,
    workerNeed: 8,
    cost: { food: 4 },
    produces: "+16 materials",
  },
  {
    id: "build-housing",
    label: "Build Housing",
    shortLabel: "Housing",
    description: "Raise shelters so more founders can remain.",
    durationSeconds: 24,
    workerNeed: 12,
    cost: { food: 8, materials: 18 },
    produces: "+4 population, +1 stability",
  },
  {
    id: "improve-fields",
    label: "Improve Fields",
    shortLabel: "Fields",
    description: "Make food production stronger on every tick.",
    durationSeconds: 20,
    workerNeed: 10,
    cost: { materials: 6, treasury: 2 },
    produces: "+1 field level, +12 food",
  },
  {
    id: "upgrade-core",
    label: "Upgrade Settlement Core",
    shortLabel: "Core",
    description: "Invest in the command center that leads toward a nation.",
    durationSeconds: 35,
    workerNeed: 14,
    cost: { materials: 28, treasury: 8, influence: 4 },
    produces: "+1 settlement level, +20 nation progress",
  },
  {
    id: "organize-council",
    label: "Organize Council",
    shortLabel: "Council",
    description: "Turn founder decisions into administration.",
    durationSeconds: 18,
    workerNeed: 8,
    cost: { food: 5, treasury: 4 },
    produces: "+5 influence, +2 stability",
  },
  {
    id: "open-trade",
    label: "Open Trade",
    shortLabel: "Trade",
    description: "Convert settlement output into treasury and reach.",
    durationSeconds: 20,
    workerNeed: 9,
    cost: { materials: 10, influence: 2 },
    produces: "+14 treasury, +2 influence",
  },
  {
    id: "scout-land",
    label: "Scout Nearby Land",
    shortLabel: "Scout",
    description: "Expand the known border without creating combat systems.",
    durationSeconds: 22,
    workerNeed: 10,
    cost: { food: 6, materials: 6 },
    produces: "+6 influence, +8 nation progress",
  },
];

export function createDefaultPlayableState(now = Date.now()): PlayableState {
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    lastTickAt: now,
    actionCounter: 0,
    eventCounter: 0,
    resources: {
      food: 34,
      materials: 24,
      treasury: 12,
      influence: 3,
      stability: 7,
    },
    population: 12,
    settlementLevel: 1,
    nationProgress: 0,
    fieldsLevel: 1,
    quarryLevel: 1,
    housingLevel: 0,
    councilLevel: 0,
    tradeLevel: 0,
    landsSurveyed: 0,
    queue: [],
    log: [
      {
        id: "system-0",
        at: now,
        type: "system",
        title: "Command center online",
        body: "Resources tick locally. Queue an order to start shaping the settlement.",
      },
    ],
    triggeredEvents: [],
  };
}

export function sanitizePlayableState(raw: unknown, now = Date.now()): PlayableState {
  const fallback = createDefaultPlayableState(now);
  if (typeof raw !== "object" || raw === null) return fallback;

  const source = raw as Partial<PlayableState>;
  const resources = typeof source.resources === "object" && source.resources !== null ? source.resources : {};

  return {
    ...fallback,
    createdAt: toSafeNumber(source.createdAt, fallback.createdAt),
    updatedAt: toSafeNumber(source.updatedAt, fallback.updatedAt),
    lastTickAt: toSafeNumber(source.lastTickAt, fallback.lastTickAt),
    actionCounter: toSafeNumber(source.actionCounter, fallback.actionCounter),
    eventCounter: toSafeNumber(source.eventCounter, fallback.eventCounter),
    resources: {
      food: clamp(toSafeNumber((resources as Partial<PlayableResources>).food, fallback.resources.food), 0, 999),
      materials: clamp(
        toSafeNumber((resources as Partial<PlayableResources>).materials, fallback.resources.materials),
        0,
        999,
      ),
      treasury: clamp(
        toSafeNumber((resources as Partial<PlayableResources>).treasury, fallback.resources.treasury),
        0,
        999,
      ),
      influence: clamp(
        toSafeNumber((resources as Partial<PlayableResources>).influence, fallback.resources.influence),
        0,
        999,
      ),
      stability: clamp(
        toSafeNumber((resources as Partial<PlayableResources>).stability, fallback.resources.stability),
        0,
        20,
      ),
    },
    population: clamp(toSafeNumber(source.population, fallback.population), 1, 999),
    settlementLevel: clamp(toSafeNumber(source.settlementLevel, fallback.settlementLevel), 1, 5),
    nationProgress: clamp(toSafeNumber(source.nationProgress, fallback.nationProgress), 0, 100),
    fieldsLevel: clamp(toSafeNumber(source.fieldsLevel, fallback.fieldsLevel), 1, 8),
    quarryLevel: clamp(toSafeNumber(source.quarryLevel, fallback.quarryLevel), 1, 8),
    housingLevel: clamp(toSafeNumber(source.housingLevel, fallback.housingLevel), 0, 8),
    councilLevel: clamp(toSafeNumber(source.councilLevel, fallback.councilLevel), 0, 8),
    tradeLevel: clamp(toSafeNumber(source.tradeLevel, fallback.tradeLevel), 0, 8),
    landsSurveyed: clamp(toSafeNumber(source.landsSurveyed, fallback.landsSurveyed), 0, 12),
    queue: sanitizeQueue(source.queue),
    log: sanitizeLog(source.log),
    triggeredEvents: sanitizeStringArray(source.triggeredEvents),
  };
}

export function getPlayableAction(actionId: PlayableActionId) {
  return PLAYABLE_ACTIONS.find((action) => action.id === actionId);
}

export function canQueuePlayableAction(state: PlayableState, actionId: PlayableActionId) {
  const action = getPlayableAction(actionId);
  if (!action) return false;
  if (state.queue.length >= MAX_QUEUE) return false;

  return (Object.entries(action.cost) as Array<[PlayableResourceKey, number]>).every(
    ([resource, amount]) => state.resources[resource] >= amount,
  );
}

export function queuePlayableAction(state: PlayableState, actionId: PlayableActionId, now = Date.now()) {
  let next = tickPlayableState(state, now);
  const action = getPlayableAction(actionId);

  if (!action || !canQueuePlayableAction(next, actionId)) return next;

  const workerDelayMs = next.population < action.workerNeed ? 5000 : 0;
  const resources = applyResourceDelta(next.resources, invertCost(action.cost));
  const previousEndsAt = next.queue.reduce((latest, queued) => Math.max(latest, queued.endsAt), now);
  const startedAt = Math.max(now, previousEndsAt);
  const durationMs = action.durationSeconds * 1000 + workerDelayMs;
  const queued: QueuedPlayableAction = {
    queueId: `order-${next.actionCounter + 1}`,
    actionId,
    label: action.label,
    startedAt,
    endsAt: startedAt + durationMs,
    durationMs,
  };

  next = {
    ...next,
    actionCounter: next.actionCounter + 1,
    resources,
    queue: [...next.queue, queued],
    updatedAt: now,
  };

  if (workerDelayMs > 0) {
    next = pushLog(
      {
        ...next,
        resources: applyResourceDelta(next.resources, { stability: -1 }),
      },
      now,
      "event",
      "Worker shortage",
      `${action.shortLabel} needs more hands. The order was delayed and stability slipped.`,
    );
  }

  return pushLog(next, now, "action", "Order queued", `${action.label} will complete shortly.`);
}

export function tickPlayableState(state: PlayableState, now = Date.now()) {
  let next = sanitizePlayableState(state, now);
  const elapsedMs = Math.max(0, Math.min(now - next.lastTickAt, OFFLINE_CAP_MS));
  const tickCount = Math.floor(elapsedMs / TICK_MS);

  if (tickCount > 0) {
    next = applyPassiveTicks(next, tickCount, next.lastTickAt + tickCount * TICK_MS);
  }

  const completed = next.queue.filter((queued) => queued.endsAt <= now);
  if (completed.length > 0) {
    next = completed.reduce((current, queued) => completeQueuedAction(current, queued, queued.endsAt), next);
    next = { ...next, queue: next.queue.filter((queued) => queued.endsAt > now), updatedAt: now };
  }

  return applyThresholdEvents(next, now);
}

export function getCurrentObjective(state: PlayableState) {
  if (state.population < 16) return "Grow population to 16 by gathering food and building housing.";
  if (state.settlementLevel < 2) return "Upgrade the settlement core to turn the outpost into a town.";
  if (state.resources.influence < 10) return "Build influence through council orders, trade, and scouting.";
  if (state.nationProgress < 100) return "Reach 100 nation progress by strengthening the core and borders.";
  return "Nation charter ready: keep stability high while the next sprint unlocks founding.";
}

export function getSettlementLevelLabel(level: number) {
  if (level >= 4) return "Capital Core";
  if (level >= 3) return "Civic Town";
  if (level >= 2) return "Village Core";
  return "Outpost";
}

export function getQueueProgress(queued: QueuedPlayableAction, now = Date.now()) {
  if (now <= queued.startedAt) return 0;
  return clamp(((now - queued.startedAt) / queued.durationMs) * 100, 0, 100);
}

export function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${seconds}s`;
}

function applyPassiveTicks(state: PlayableState, tickCount: number, lastTickAt: number): PlayableState {
  const foodGain = tickCount * Math.max(1, 2 + state.fieldsLevel - Math.floor(state.population / 10));
  const materialsGain = tickCount * Math.max(1, state.quarryLevel);
  const treasuryGain = tickCount * state.tradeLevel;
  const influenceGain = Math.floor((tickCount * Math.max(0, state.councilLevel)) / 3);
  const populationGain = state.resources.food + foodGain > state.population * 4 ? Math.floor(tickCount / 6) : 0;

  let next: PlayableState = {
    ...state,
    population: clamp(state.population + populationGain, 1, 999),
    resources: applyResourceDelta(state.resources, {
      food: foodGain,
      materials: materialsGain,
      treasury: treasuryGain,
      influence: influenceGain,
    }),
    lastTickAt,
    updatedAt: lastTickAt,
  };

  if (populationGain > 0) {
    next = pushLog(
      next,
      lastTickAt,
      "event",
      "Founders arrive",
      `${populationGain} new founders joined after steady supplies reached the settlement.`,
    );
  }

  return next;
}

function completeQueuedAction(state: PlayableState, queued: QueuedPlayableAction, now: number): PlayableState {
  switch (queued.actionId) {
    case "gather-food":
      return pushLog(
        { ...state, resources: applyResourceDelta(state.resources, { food: 14 }) },
        now,
        "action",
        "Food gathered",
        "Granaries gained enough supplies to support the next order.",
      );
    case "quarry-materials":
      return pushLog(
        { ...state, resources: applyResourceDelta(state.resources, { materials: 16 }) },
        now,
        "action",
        "Materials quarried",
        "Stone and timber reached the build yards.",
      );
    case "build-housing":
      return pushLog(
        {
          ...state,
          population: clamp(state.population + 4, 1, 999),
          housingLevel: clamp(state.housingLevel + 1, 0, 8),
          resources: applyResourceDelta(state.resources, { stability: 1 }),
        },
        now,
        "action",
        "Housing raised",
        "More families can remain inside the first settlement ring.",
      );
    case "improve-fields":
      return pushLog(
        {
          ...state,
          fieldsLevel: clamp(state.fieldsLevel + 1, 1, 8),
          resources: applyResourceDelta(state.resources, { food: 12 }),
        },
        now,
        "action",
        "Fields improved",
        "Food ticks are stronger from this point forward.",
      );
    case "upgrade-core":
      return pushLog(
        {
          ...state,
          settlementLevel: clamp(state.settlementLevel + 1, 1, 5),
          nationProgress: clamp(state.nationProgress + 20, 0, 100),
          resources: applyResourceDelta(state.resources, { stability: 1 }),
        },
        now,
        "action",
        "Settlement core upgraded",
        "The civic center now carries more of the future nation.",
      );
    case "organize-council":
      return pushLog(
        {
          ...state,
          councilLevel: clamp(state.councilLevel + 1, 0, 8),
          nationProgress: clamp(state.nationProgress + 10, 0, 100),
          resources: applyResourceDelta(state.resources, { influence: 5, stability: 2 }),
        },
        now,
        "action",
        "Council organized",
        "Administration improved and local influence rose.",
      );
    case "open-trade":
      return pushLog(
        {
          ...state,
          tradeLevel: clamp(state.tradeLevel + 1, 0, 8),
          resources: applyResourceDelta(state.resources, { treasury: 14, influence: 2 }),
        },
        now,
        "action",
        "Trade opened",
        "Revenue began moving through the settlement gate.",
      );
    case "scout-land":
      return pushLog(
        {
          ...state,
          landsSurveyed: clamp(state.landsSurveyed + 1, 0, 12),
          nationProgress: clamp(state.nationProgress + 8, 0, 100),
          resources: applyResourceDelta(state.resources, { influence: 6, stability: -1 }),
        },
        now,
        "action",
        "Nearby land scouted",
        "Border knowledge expanded, but the edge feels less settled.",
      );
  }
}

function applyThresholdEvents(state: PlayableState, now: number): PlayableState {
  let next = state;

  if (next.fieldsLevel >= 2 && !next.triggeredEvents.includes("good-harvest")) {
    next = pushEvent(
      { ...next, resources: applyResourceDelta(next.resources, { food: 20 }) },
      now,
      "good-harvest",
      "Good harvest",
      "Improved fields produced a surplus for the command center.",
    );
  }

  if (next.tradeLevel >= 1 && !next.triggeredEvents.includes("trade-opportunity")) {
    next = pushEvent(
      { ...next, resources: applyResourceDelta(next.resources, { treasury: 10, influence: 1 }) },
      now,
      "trade-opportunity",
      "Trade opportunity",
      "A caravan deal added treasury and made the settlement better known.",
    );
  }

  if (next.landsSurveyed >= 2 && next.resources.influence >= 8 && !next.triggeredEvents.includes("border-dispute")) {
    next = pushEvent(
      { ...next, resources: applyResourceDelta(next.resources, { stability: -2, influence: 3 }) },
      now,
      "border-dispute",
      "Border dispute",
      "The outer claims drew resistance. Influence rose, but stability paid the cost.",
    );
  }

  if ((next.population >= 18 || next.settlementLevel >= 2) && !next.triggeredEvents.includes("founders-rally")) {
    next = pushEvent(
      {
        ...next,
        population: clamp(next.population + 2, 1, 999),
        resources: applyResourceDelta(next.resources, { influence: 3 }),
      },
      now,
      "founders-rally",
      "Founders rally",
      "The settlement's growth convinced more founders to join the banner.",
    );
  }

  return next;
}

function pushEvent(state: PlayableState, now: number, eventId: string, title: string, body: string) {
  return pushLog(
    { ...state, eventCounter: state.eventCounter + 1, triggeredEvents: [...state.triggeredEvents, eventId] },
    now,
    "event",
    title,
    body,
  );
}

function pushLog(state: PlayableState, at: number, type: PlayableLogEntry["type"], title: string, body: string) {
  const entry: PlayableLogEntry = {
    id: `${type}-${state.eventCounter}-${state.actionCounter}-${at}`,
    at,
    type,
    title,
    body,
  };

  return { ...state, log: [entry, ...state.log].slice(0, MAX_LOG), updatedAt: at };
}

function invertCost(cost: Partial<PlayableResources>) {
  return Object.fromEntries(
    (Object.entries(cost) as Array<[PlayableResourceKey, number]>).map(([key, value]) => [key, -value]),
  ) as Partial<PlayableResources>;
}

function applyResourceDelta(resources: PlayableResources, delta: Partial<PlayableResources>) {
  return {
    food: clamp(resources.food + (delta.food ?? 0), 0, 999),
    materials: clamp(resources.materials + (delta.materials ?? 0), 0, 999),
    treasury: clamp(resources.treasury + (delta.treasury ?? 0), 0, 999),
    influence: clamp(resources.influence + (delta.influence ?? 0), 0, 999),
    stability: clamp(resources.stability + (delta.stability ?? 0), 0, 20),
  };
}

function sanitizeQueue(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Partial<QueuedPlayableAction> => typeof item === "object" && item !== null)
    .map((item, index) => {
      const action = typeof item.actionId === "string" ? getPlayableAction(item.actionId as PlayableActionId) : null;
      if (!action) return null;

      return {
        queueId: typeof item.queueId === "string" ? item.queueId : `restored-${index}`,
        actionId: action.id,
        label: typeof item.label === "string" ? item.label : action.label,
        startedAt: toSafeNumber(item.startedAt, 0),
        endsAt: toSafeNumber(item.endsAt, 0),
        durationMs: Math.max(1000, toSafeNumber(item.durationMs, action.durationSeconds * 1000)),
      };
    })
    .filter((item): item is QueuedPlayableAction => item !== null)
    .slice(0, MAX_QUEUE);
}

function sanitizeLog(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Partial<PlayableLogEntry> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : `restored-log-${index}`,
      at: toSafeNumber(item.at, 0),
      type: item.type === "action" || item.type === "event" || item.type === "system" ? item.type : "system",
      title: typeof item.title === "string" ? item.title : "Restored report",
      body: typeof item.body === "string" ? item.body : "A previous command-center entry was restored.",
    }))
    .slice(0, MAX_LOG);
}

function sanitizeStringArray(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

function toSafeNumber(value: unknown, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}
