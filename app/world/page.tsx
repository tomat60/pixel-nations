"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { claimLand as claimGameLand, type GameLand } from "../lib/game-state";
import {
  DEFAULT_SETTLEMENT_STATE,
  readSettlementState,
  type SettlementState,
  writeSettlementState,
} from "../lib/settlement-state";

type Terrain = "river" | "forest" | "hills" | "coast" | "plains" | "ruins";
type AgePhase = "choose" | "playing" | "charter";
type AgeOrder = "expand" | "develop" | "secure";

type FirstAgeLand = {
  id: string;
  pnId: string;
  name: string;
  coordinates: string;
  region: string;
  terrain: Terrain;
  x: number;
  y: number;
  resources: string[];
  advantage: string;
  risk: string;
  path: string;
  adjacent: string[];
};

type FirstAgeState = {
  phase: AgePhase;
  season: number;
  startLandId: string;
  ownedLandIds: string[];
  coreLevel: number;
  stability: number;
  food: number;
  materials: number;
  influence: number;
  lastOrder?: AgeOrder;
  log: string[];
};

const AGE_KEY = "pixelNations.firstAge.v1";
const CHARTER_TARGETS = {
  lands: 6,
  coreLevel: 3,
  stability: 5,
};

const FIRST_AGE_LANDS: FirstAgeLand[] = [
  {
    id: "greenvale",
    pnId: "PN-0401",
    name: "Greenvale",
    coordinates: "A-01 / X07 Y06",
    region: "Aurelian Basin",
    terrain: "river",
    x: 43,
    y: 49,
    resources: ["Food", "Timber", "Fresh Water"],
    advantage: "+ Fast food growth and safe first expansion.",
    risk: "Low defense. Rivals can pressure the river crossing later.",
    path: "Balanced Growth: Expand -> Develop -> Secure",
    adjacent: ["pinewatch", "sunmeadow", "oldford"],
  },
  {
    id: "pinewatch",
    pnId: "PN-0402",
    name: "Pinewatch",
    coordinates: "A-01 / X06 Y04",
    region: "North Frontier",
    terrain: "forest",
    x: 34,
    y: 33,
    resources: ["Timber", "Game", "Resin"],
    advantage: "+ Materials and strong early Develop orders.",
    risk: "Slower food growth. Expansion can stall without river lands.",
    path: "Builder Start: Develop -> Secure -> Expand",
    adjacent: ["greenvale", "stonefall", "oldford"],
  },
  {
    id: "stonefall",
    pnId: "PN-0403",
    name: "Stonefall",
    coordinates: "A-01 / X04 Y03",
    region: "North Frontier",
    terrain: "hills",
    x: 21,
    y: 27,
    resources: ["Stone", "Iron", "High Ground"],
    advantage: "+ Strong defense and durable core development.",
    risk: "Poor food. You must expand or stabilize quickly.",
    path: "Fortress Start: Secure -> Develop -> Expand",
    adjacent: ["pinewatch", "oldford"],
  },
  {
    id: "sunmeadow",
    pnId: "PN-0404",
    name: "Sunmeadow",
    coordinates: "A-01 / X09 Y07",
    region: "Aurelia",
    terrain: "plains",
    x: 55,
    y: 60,
    resources: ["Grain", "Horses", "Open Roads"],
    advantage: "+ Quick expansion and broad settlement routes.",
    risk: "Open land is hard to defend if you overexpand.",
    path: "Wide Start: Expand -> Expand -> Secure",
    adjacent: ["greenvale", "saltmere", "oldford"],
  },
  {
    id: "saltmere",
    pnId: "PN-0405",
    name: "Saltmere",
    coordinates: "A-01 / X11 Y08",
    region: "Iron Coast",
    terrain: "coast",
    x: 71,
    y: 67,
    resources: ["Salt", "Fish", "Trade Wind"],
    advantage: "+ Influence and future trade identity.",
    risk: "Coastal edge limits immediate inland control.",
    path: "Trade Start: Develop -> Expand -> Secure",
    adjacent: ["sunmeadow", "oldford", "relicfen"],
  },
  {
    id: "oldford",
    pnId: "PN-0406",
    name: "Oldford",
    coordinates: "A-01 / X08 Y05",
    region: "Aurelian Basin",
    terrain: "ruins",
    x: 49,
    y: 40,
    resources: ["Relics", "Stone", "Old Roads"],
    advantage: "+ Influence and central map pressure.",
    risk: "High competition. A greedy start becomes unstable.",
    path: "Influence Start: Secure -> Develop -> Expand",
    adjacent: ["greenvale", "pinewatch", "sunmeadow", "saltmere", "relicfen"],
  },
  {
    id: "relicfen",
    pnId: "PN-0407",
    name: "Relicfen",
    coordinates: "A-01 / X12 Y05",
    region: "Ember Basin",
    terrain: "ruins",
    x: 78,
    y: 43,
    resources: ["Relics", "Clay", "Ancient Claim"],
    advantage: "+ High influence ceiling for Charter politics.",
    risk: "Unstable ground. Secure orders matter early.",
    path: "Charter Rush: Develop -> Secure -> Develop",
    adjacent: ["oldford", "saltmere"],
  },
];

const TERRAIN_STYLE: Record<Terrain, string> = {
  river: "bg-emerald-500/20 border-emerald-300/80 text-emerald-100",
  forest: "bg-green-700/25 border-green-300/70 text-green-100",
  hills: "bg-zinc-500/20 border-zinc-300/75 text-zinc-100",
  coast: "bg-cyan-500/20 border-cyan-200/75 text-cyan-100",
  plains: "bg-amber-500/20 border-amber-200/75 text-amber-100",
  ruins: "bg-violet-500/20 border-violet-200/75 text-violet-100",
};

const ORDER_COPY: Record<AgeOrder, { title: string; subtitle: string; effect: string }> = {
  expand: {
    title: "Expand",
    subtitle: "Claim adjacent land. Grow your realm.",
    effect: "+1 land, -1 stability, costs 5 materials",
  },
  develop: {
    title: "Develop",
    subtitle: "Raise the core. Build the foundation of a nation.",
    effect: "+1 core level, costs 4 materials and 1 influence",
  },
  secure: {
    title: "Secure",
    subtitle: "Stabilize the realm before it overreaches.",
    effect: "+2 stability, +1 influence",
  },
};

function emptyAgeState(): FirstAgeState {
  return {
    phase: "choose",
    season: 0,
    startLandId: "",
    ownedLandIds: [],
    coreLevel: 0,
    stability: 5,
    food: 18,
    materials: 14,
    influence: 1,
    log: ["Choose a land. One land can become an empire."],
  };
}

function readAgeState(): FirstAgeState {
  if (typeof window === "undefined") return emptyAgeState();
  const raw = window.localStorage.getItem(AGE_KEY);
  if (!raw) return emptyAgeState();
  try {
    const parsed = JSON.parse(raw) as Partial<FirstAgeState>;
    const ownedLandIds = Array.isArray(parsed.ownedLandIds)
      ? parsed.ownedLandIds.filter((value): value is string => typeof value === "string")
      : [];
    const log = Array.isArray(parsed.log)
      ? parsed.log.filter((value): value is string => typeof value === "string")
      : [];
    return {
      phase: parsed.phase === "playing" || parsed.phase === "charter" ? parsed.phase : "choose",
      season: typeof parsed.season === "number" ? Math.min(12, Math.max(0, parsed.season)) : 0,
      startLandId: typeof parsed.startLandId === "string" ? parsed.startLandId : "",
      ownedLandIds,
      coreLevel: typeof parsed.coreLevel === "number" ? Math.min(3, Math.max(0, parsed.coreLevel)) : 0,
      stability: typeof parsed.stability === "number" ? Math.max(0, parsed.stability) : 5,
      food: typeof parsed.food === "number" ? parsed.food : 18,
      materials: typeof parsed.materials === "number" ? parsed.materials : 14,
      influence: typeof parsed.influence === "number" ? parsed.influence : 1,
      lastOrder:
        parsed.lastOrder === "expand" || parsed.lastOrder === "develop" || parsed.lastOrder === "secure"
          ? parsed.lastOrder
          : undefined,
      log: log.length ? log.slice(0, 5) : ["Choose a land. One land can become an empire."],
    };
  } catch {
    return emptyAgeState();
  }
}

function writeAgeState(state: FirstAgeState) {
  window.localStorage.setItem(AGE_KEY, JSON.stringify(state));
}

function toGameLand(land: FirstAgeLand): GameLand {
  return {
    id: land.id,
    pnId: land.pnId,
    name: land.name,
    coordinates: land.coordinates,
    region: land.region,
    terrain: land.terrain,
    resources: land.resources,
  };
}

function isCharterReady(state: FirstAgeState) {
  return (
    state.ownedLandIds.length >= CHARTER_TARGETS.lands &&
    state.coreLevel >= CHARTER_TARGETS.coreLevel &&
    state.stability >= CHARTER_TARGETS.stability
  );
}

function findNextExpansion(state: FirstAgeState, selectedLandId: string) {
  const owned = new Set(state.ownedLandIds);
  const selected = FIRST_AGE_LANDS.find((land) => land.id === selectedLandId);
  if (selected && !owned.has(selected.id)) {
    const touchesOwned = selected.adjacent.some((id) => owned.has(id));
    if (touchesOwned) return selected;
  }

  for (const ownedId of state.ownedLandIds) {
    const source = FIRST_AGE_LANDS.find((land) => land.id === ownedId);
    const targetId = source?.adjacent.find((id) => !owned.has(id));
    if (targetId) return FIRST_AGE_LANDS.find((land) => land.id === targetId) ?? null;
  }

  return null;
}

function clampLog(line: string, current: string[]) {
  return [line, ...current].slice(0, 5);
}

function updateSettlementCompatibility(base: SettlementState, age: FirstAgeState): SettlementState {
  return {
    ...base,
    settlementFounded: age.season > 0 || base.settlementFounded,
    settlementName: base.settlementName || `${base.claimedLandName || "Aurelian"} Outpost`,
    population: Math.max(base.population, 32 + age.ownedLandIds.length * 6 + age.coreLevel * 10),
    food: age.food,
    materials: age.materials,
    influence: age.influence,
    stability: age.stability,
    settlementLevel: age.coreLevel >= 3 ? "Charter Core" : age.coreLevel >= 2 ? "Growing Outpost" : "Founder Camp",
    townHallBuilt: age.coreLevel >= 3 || base.townHallBuilt,
    landsControlled: Math.max(base.landsControlled, age.ownedLandIds.length),
    bordersExpanded: age.ownedLandIds.length > 1 || base.bordersExpanded,
    expandedLands: Array.from(new Set([...(base.expandedLands ?? []), ...age.ownedLandIds])),
    latestDevelopmentAction: age.lastOrder ? ORDER_COPY[age.lastOrder].title : base.latestDevelopmentAction,
    latestDevelopmentSummary: age.log[0] ?? base.latestDevelopmentSummary,
    politicalStatus: isCharterReady(age) ? "Nation Charter Ready" : base.politicalStatus,
  };
}

export default function WorldPage() {
  const [selectedLandId, setSelectedLandId] = useState(FIRST_AGE_LANDS[0].id);
  const [ageState, setAgeState] = useState<FirstAgeState>(() => emptyAgeState());
  const [settlementState, setSettlementState] = useState<SettlementState>(DEFAULT_SETTLEMENT_STATE);

  useEffect(() => {
    const loadedSettlement = readSettlementState();
    const loadedAge = readAgeState();
    setSettlementState(loadedSettlement);
    setAgeState(loadedAge);
    const focusLandId = loadedAge.startLandId || loadedSettlement.claimedLandId || FIRST_AGE_LANDS[0].id;
    if (FIRST_AGE_LANDS.some((land) => land.id === focusLandId)) setSelectedLandId(focusLandId);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  const selectedLand = useMemo(
    () => FIRST_AGE_LANDS.find((land) => land.id === selectedLandId) ?? FIRST_AGE_LANDS[0],
    [selectedLandId],
  );
  const ownedSet = useMemo(() => new Set(ageState.ownedLandIds), [ageState.ownedLandIds]);
  const charterReady = isCharterReady(ageState);
  const currentObjective =
    ageState.phase === "choose"
      ? "Choose a land and plant your first banner."
      : charterReady
        ? "Charter fulfilled. Your nation can be founded."
        : "Issue one order this season.";

  const claimSelectedLand = () => {
    const claimed = claimGameLand(settlementState, toGameLand(selectedLand));
    const nextAge: FirstAgeState = {
      phase: "playing",
      season: 1,
      startLandId: selectedLand.id,
      ownedLandIds: [selectedLand.id],
      coreLevel: 1,
      stability: selectedLand.terrain === "hills" ? 6 : selectedLand.terrain === "ruins" ? 4 : 5,
      food: selectedLand.resources.includes("Food") || selectedLand.resources.includes("Grain") ? 24 : 18,
      materials: selectedLand.resources.includes("Stone") || selectedLand.resources.includes("Timber") ? 18 : 14,
      influence: selectedLand.terrain === "ruins" || selectedLand.terrain === "coast" ? 3 : 1,
      log: [`${selectedLand.name} claimed. The First Age begins.`],
    };
    const compatible = updateSettlementCompatibility(claimed, nextAge);
    writeSettlementState(compatible);
    writeAgeState(nextAge);
    setSettlementState(compatible);
    setAgeState(nextAge);
  };

  const runOrder = (order: AgeOrder) => {
    if (ageState.phase !== "playing" || ageState.season >= 12) return;

    let next: FirstAgeState = {
      ...ageState,
      season: Math.min(12, ageState.season + 1),
      lastOrder: order,
    };
    let line = "";

    if (order === "expand") {
      const target = findNextExpansion(ageState, selectedLandId);
      if (target && ageState.materials >= 5) {
        next = {
          ...next,
          ownedLandIds: Array.from(new Set([...ageState.ownedLandIds, target.id])),
          materials: ageState.materials - 5,
          food: ageState.food + (target.terrain === "river" || target.terrain === "plains" ? 4 : 2),
          stability: Math.max(0, ageState.stability - 1),
          log: clampLog(`Expanded into ${target.name}. Territory grows, stability tightens.`, ageState.log),
        };
        line = `Expanded into ${target.name}.`;
      } else {
        next = {
          ...next,
          influence: ageState.influence + 1,
          log: clampLog("Expansion scouts found no safe claim. Influence +1.", ageState.log),
        };
        line = "No safe expansion. Influence gained.";
      }
    }

    if (order === "develop") {
      const canDevelop = ageState.coreLevel < 3 && ageState.materials >= 4;
      next = {
        ...next,
        coreLevel: canDevelop ? Math.min(3, ageState.coreLevel + 1) : ageState.coreLevel,
        materials: canDevelop ? ageState.materials - 4 : ageState.materials + 1,
        influence: canDevelop ? Math.max(0, ageState.influence - 1) : ageState.influence,
        food: ageState.food + 1,
        log: clampLog(
          canDevelop ? "Developed the core. The realm can support deeper rule." : "Not enough material to develop. Stockpiles +1.",
          ageState.log,
        ),
      };
      line = canDevelop ? "Core developed." : "Development delayed.";
    }

    if (order === "secure") {
      next = {
        ...next,
        stability: ageState.stability + 2,
        influence: ageState.influence + 1,
        log: clampLog("Secured borders and local loyalties. Stability +2.", ageState.log),
      };
      line = "Realm secured.";
    }

    if (isCharterReady(next)) {
      next = {
        ...next,
        phase: "charter",
        log: clampLog("Nation Charter fulfilled. A people can become a nation.", next.log),
      };
    }

    const compatible = updateSettlementCompatibility(settlementState, next);
    writeSettlementState(compatible);
    writeAgeState(next);
    setSettlementState(compatible);
    setAgeState(next);
    if (line && order === "expand") {
      const target = findNextExpansion(next, selectedLandId);
      if (target) setSelectedLandId(target.id);
    }
  };

  const resetAge = () => {
    const next = emptyAgeState();
    window.localStorage.removeItem(AGE_KEY);
    setAgeState(next);
    setSelectedLandId(FIRST_AGE_LANDS[0].id);
  };

  return (
    <main className="fixed inset-0 h-[100dvh] w-[100dvw] overflow-hidden bg-[#020204] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_78%_72%,rgba(34,197,94,0.1),transparent_30%)]" />
      <section className="relative z-10 grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-2 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-4 lg:grid-cols-[minmax(0,1fr)_390px] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-4">
        <header className="rounded-xl border border-amber-400/20 bg-[#050509]/86 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400/80">Pixel Nations / The First Age</p>
              <h1 className="mt-1 font-[family-name:var(--font-syne)] text-xl font-extrabold text-amber-100 sm:text-3xl">Aurelian Basin</h1>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{currentObjective}</p>
            </div>
            <div className="flex shrink-0 gap-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
              <Link href="/" className="rounded border border-zinc-700/80 bg-black/35 px-3 py-2 hover:border-amber-400/50">Home</Link>
              <button type="button" onClick={resetAge} className="rounded border border-zinc-700/80 bg-black/35 px-3 py-2 hover:border-amber-400/50">Reset</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] sm:text-xs">
            <HudChip label="Season" value={ageState.phase === "choose" ? "Choose" : `${ageState.season}/12`} />
            <HudChip label="Lands" value={`${ageState.ownedLandIds.length}/${CHARTER_TARGETS.lands}`} />
            <HudChip label="Core" value={`${ageState.coreLevel}/${CHARTER_TARGETS.coreLevel}`} />
            <HudChip label="Stability" value={`${ageState.stability}/${CHARTER_TARGETS.stability}`} />
            <HudChip label="Influence" value={String(ageState.influence)} />
          </div>
        </header>

        <article className="relative min-h-0 overflow-hidden rounded-xl border border-amber-400/15 bg-[#07100b]/72 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(20,83,45,0.55),rgba(12,74,110,0.32)_42%,rgba(120,53,15,0.44))]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:54px_54px]" />
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M10 74 C24 60 34 68 45 50 S70 35 88 20" stroke="rgba(125,211,252,0.5)" strokeWidth="1.2" fill="none" />
            <path d="M8 22 C22 32 35 26 48 38 S67 62 92 58" stroke="rgba(245,158,11,0.34)" strokeWidth="0.7" fill="none" strokeDasharray="2 2" />
          </svg>

          {FIRST_AGE_LANDS.map((land) => {
            const owned = ownedSet.has(land.id);
            const selected = land.id === selectedLand.id;
            const adjacent = !owned && land.adjacent.some((id) => ownedSet.has(id));
            return (
              <button
                key={land.id}
                type="button"
                onClick={() => setSelectedLandId(land.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-[0_12px_38px_rgba(0,0,0,0.5)] transition ${TERRAIN_STYLE[land.terrain]} ${owned ? "ring-4 ring-amber-300/45" : ""} ${selected ? "scale-110 ring-2 ring-white/80" : ""} ${adjacent ? "animate-pulse" : ""}`}
                style={{ left: `${land.x}%`, top: `${land.y}%` }}
                aria-label={`Select ${land.name}`}
              >
                {owned ? "⚑" : adjacent ? "+" : "•"} {land.name}
              </button>
            );
          })}

          <div className="absolute bottom-2 left-2 right-2 rounded-xl border border-amber-400/20 bg-[#040407]/86 p-3 backdrop-blur lg:hidden">
            <LandPanel land={selectedLand} owned={ownedSet.has(selectedLand.id)} adjacent={selectedLand.adjacent.some((id) => ownedSet.has(id))} />
          </div>
        </article>

        <aside className="min-h-0 overflow-hidden rounded-xl border border-amber-400/15 bg-[#050509]/90 p-3 shadow-[0_18px_70px_rgba(0,0,0,0.45)] lg:row-span-1 lg:overflow-y-auto">
          <div className="hidden lg:block">
            <LandPanel land={selectedLand} owned={ownedSet.has(selectedLand.id)} adjacent={selectedLand.adjacent.some((id) => ownedSet.has(id))} />
          </div>

          {ageState.phase === "choose" ? (
            <button type="button" onClick={claimSelectedLand} className="mt-3 w-full rounded-lg border border-amber-300/70 bg-amber-400 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_14px_40px_rgba(245,158,11,0.24)]">
              Claim This Land
            </button>
          ) : (
            <div className="mt-3 grid gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400/75">One order per season</p>
              {(["expand", "develop", "secure"] as AgeOrder[]).map((order) => (
                <button
                  key={order}
                  type="button"
                  onClick={() => runOrder(order)}
                  disabled={ageState.phase === "charter" || ageState.season >= 12}
                  className="rounded-lg border border-amber-400/15 bg-[#0b0d12]/92 p-3 text-left transition hover:border-amber-300/55 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span className="block text-sm font-black uppercase tracking-[0.18em] text-amber-100">{ORDER_COPY[order].title}</span>
                  <span className="mt-1 block text-xs text-zinc-400">{ORDER_COPY[order].subtitle}</span>
                  <span className="mt-1 block text-[11px] text-amber-300/80">{ORDER_COPY[order].effect}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 rounded-lg border border-amber-400/15 bg-black/24 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400/75">Nation Charter</p>
            <CharterRow label="Own 6 lands" done={ageState.ownedLandIds.length >= CHARTER_TARGETS.lands} value={`${ageState.ownedLandIds.length}/${CHARTER_TARGETS.lands}`} />
            <CharterRow label="Core level 3" done={ageState.coreLevel >= CHARTER_TARGETS.coreLevel} value={`${ageState.coreLevel}/${CHARTER_TARGETS.coreLevel}`} />
            <CharterRow label="Stability 5+" done={ageState.stability >= CHARTER_TARGETS.stability} value={`${ageState.stability}/${CHARTER_TARGETS.stability}`} />
            {charterReady ? <p className="mt-3 rounded border border-emerald-300/35 bg-emerald-400/12 p-2 text-xs font-bold text-emerald-100">Charter fulfilled. Your first nation is ready to be founded.</p> : null}
          </div>

          <div className="mt-3 rounded-lg border border-zinc-700/60 bg-black/28 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">Season Log</p>
            <div className="mt-2 grid gap-1 text-xs text-zinc-300">
              {ageState.log.map((line, index) => (
                <p key={`${line}-${index}`} className={index === 0 ? "text-amber-100" : "text-zinc-500"}>{line}</p>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function HudChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-amber-400/15 bg-black/28 px-2 py-1.5">
      <p className="text-[8px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-0.5 font-[family-name:var(--font-syne)] text-sm font-extrabold text-amber-100">{value}</p>
    </div>
  );
}

function LandPanel({ land, owned, adjacent }: { land: FirstAgeLand; owned: boolean; adjacent: boolean }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Selected Land</p>
          <h2 className="mt-1 font-[family-name:var(--font-syne)] text-xl font-extrabold text-amber-100">{land.name}</h2>
          <p className="text-xs text-zinc-500">{land.pnId} / {land.coordinates}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${TERRAIN_STYLE[land.terrain]}`}>{land.terrain}</span>
      </div>
      <div className="mt-3 grid gap-2 text-xs">
        <p className="text-emerald-200"><span className="text-zinc-500">Advantage:</span> {land.advantage}</p>
        <p className="text-red-200"><span className="text-zinc-500">Risk:</span> {land.risk}</p>
        <p className="text-amber-200"><span className="text-zinc-500">First path:</span> {land.path}</p>
        <p className="text-zinc-400"><span className="text-zinc-500">Resources:</span> {land.resources.join(" / ")}</p>
        <p className="text-zinc-500">{owned ? "Owned by you." : adjacent ? "Adjacent to your realm. Expand can claim it." : "Unclaimed frontier land."}</p>
      </div>
    </div>
  );
}

function CharterRow({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
      <span className={done ? "text-emerald-200" : "text-zinc-400"}>{done ? "✓" : "○"} {label}</span>
      <span className="font-bold text-amber-100">{value}</span>
    </div>
  );
}
