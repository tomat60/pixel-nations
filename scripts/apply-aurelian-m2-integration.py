#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "app/play/page.tsx"
COMPONENT = ROOT / "app/play/components/AurelianVillageScene.tsx"
GUARD = ROOT / "scripts/qa-aurelian-play-integration.mjs"
PACKAGE = ROOT / "package.json"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


page = PAGE.read_text()
page = replace_once(
    page,
    'import { VillageScene } from "./components/VillageScene";',
    'import { AurelianVillageScene } from "./components/AurelianVillageScene";',
    "Village scene import",
)
page = replace_once(
    page,
    'import { WorldMapScene } from "./world/WorldMapScene";\n\nexport default function PlayPrototypePage() {',
    'import { WorldMapScene } from "./world/WorldMapScene";\n\n'
    'const aurelianInitialPlayState: PlayState = {\n'
    '  ...initialPlayState,\n'
    '  ownedPlotIds: [initialPlayState.selectedPlotId],\n'
    '  settlementMarkers: ["camp"],\n'
    '  view: "village",\n'
    '  lastEvent: "The first camp stands in Aurelian Basin. Raise one shelter to begin the settlement.",\n'
    '  chronicle: [{ season: 1, title: "The first camp", body: "One claimed land now holds the beginning of an empire." }],\n'
    '};\n\n'
    'export default function PlayPrototypePage() {',
    "Aurelian initial state insertion",
)
page = replace_once(
    page,
    'const [state, dispatch] = useReducer(playReducer, initialPlayState);',
    'const [state, dispatch] = useReducer(playReducer, aurelianInitialPlayState);',
    "Reducer initial state",
)
page = replace_once(
    page,
    'dispatch({ type: "reset" });',
    'dispatch({ type: "hydrate", state: aurelianInitialPlayState });',
    "Restart behavior",
)
page = replace_once(
    page,
    '{isVillage ? <VillageScene state={state} dispatch={dispatch} /> : isWorld ? <WorldMapScene state={state} dispatch={dispatch} /> : <MapStage state={state} dispatch={dispatch} />}',
    '{isVillage ? <AurelianVillageScene state={state} dispatch={dispatch} /> : isWorld ? <WorldMapScene state={state} dispatch={dispatch} /> : <MapStage state={state} dispatch={dispatch} />}',
    "Playable scene switch",
)
page = replace_once(
    page,
    '    if (!Array.isArray(parsed.ownedPlotIds) || !Array.isArray(parsed.completedOrders)) return null;\n    return {',
    '    if (!Array.isArray(parsed.ownedPlotIds) || !Array.isArray(parsed.completedOrders)) return null;\n'
    '    const isLegacyEmptyRun = parsed.ownedPlotIds.length === 0 && parsed.completedOrders.length === 0;\n'
    '    if (isLegacyEmptyRun) return aurelianInitialPlayState;\n'
    '    return {',
    "Legacy empty-run migration",
)
PAGE.write_text(page)

COMPONENT.write_text('''import Image, { type StaticImageData } from "next/image";
import type { PlayAction, PlayState } from "../lib/play-state";
import { getDevelopmentScore, getOwnedPlot, getPhase, getPopulation } from "../lib/play-state";
import campDesktop from "../../../review/aurelian-staged-progression-m1/aurelian-camp-desktop.png";
import campPortrait from "../../../review/aurelian-staged-progression-m1/aurelian-camp-portrait.png";
import shelterDesktop from "../../../review/aurelian-staged-progression-m1/aurelian-first_shelter-desktop.png";
import shelterPortrait from "../../../review/aurelian-staged-progression-m1/aurelian-first_shelter-portrait.png";
import developedDesktop from "../../../review/aurelian-staged-progression-m1/aurelian-developed_settlement-desktop.png";
import developedPortrait from "../../../review/aurelian-staged-progression-m1/aurelian-developed_settlement-portrait.png";

type AurelianStageId = "camp" | "first_shelter" | "developed_settlement";
type StageVisual = { desktop: StaticImageData; portrait: StaticImageData; label: string; alt: string };

const stageVisuals: Record<AurelianStageId, StageVisual> = {
  camp: {
    desktop: campDesktop,
    portrait: campPortrait,
    label: "First camp",
    alt: "A sparse camp beside the river and low bridge in Aurelian Basin",
  },
  first_shelter: {
    desktop: shelterDesktop,
    portrait: shelterPortrait,
    label: "First shelter",
    alt: "The first shelter connected to the retained camp in Aurelian Basin",
  },
  developed_settlement: {
    desktop: developedDesktop,
    portrait: developedPortrait,
    label: "Living settlement",
    alt: "The developed Aurelian settlement with homes, market, well and civic buildings",
  },
};

export function getAurelianStageId(state: PlayState): AurelianStageId {
  const developedMarkers = ["storehouse", "market", "council", "watch"] as const;
  if (developedMarkers.some((marker) => state.settlementMarkers.includes(marker))) return "developed_settlement";
  if (state.settlementMarkers.includes("shelter")) return "first_shelter";
  return "camp";
}

export function AurelianVillageScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const stageId = getAurelianStageId(state);
  const visual = stageVisuals[stageId];
  const owned = getOwnedPlot(state);
  const hasClaim = state.ownedPlotIds.length > 0;

  return (
    <section
      data-qa="aurelian-village-scene"
      data-aurelian-stage={stageId}
      className="absolute inset-0 overflow-hidden bg-[#5e6a50]"
    >
      <div data-qa="aurelian-village-stage" className="absolute inset-0">
        <Image
          src={visual.portrait}
          alt={visual.alt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 1px"
          className="object-cover object-center md:hidden"
        />
        <Image
          src={visual.desktop}
          alt={visual.alt}
          fill
          priority
          sizes="(min-width: 768px) 100vw, 1px"
          className="hidden object-cover object-center md:block"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-transparent to-black/26" />
      </div>

      <div className="absolute left-3 right-3 top-[5.4rem] z-10 md:left-5 md:right-5 md:top-[5.9rem]">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-100/18 bg-black/42 px-3 py-1.5 shadow-xl backdrop-blur-sm md:px-3.5 md:py-2">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-amber-200/65">Sector A-01 · Aurelian Basin</p>
            <h2 className="truncate text-base font-black text-amber-50 md:text-xl">{owned?.name ?? "Aurelian homeland"}</h2>
          </div>
          <div className="hidden shrink-0 items-center gap-3 text-right md:flex">
            <CompactStat label="Stage" value={visual.label} />
            <CompactStat label="People" value={getPopulation(state)} />
            <CompactStat label="Dev" value={getDevelopmentScore(state)} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[7.7rem] left-3 z-20 rounded-xl border border-amber-100/18 bg-black/42 px-3 py-2 shadow-xl backdrop-blur-sm md:bottom-5 md:left-5">
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-200/60">Settlement growth</p>
        <p className="mt-0.5 text-sm font-black text-amber-50">{visual.label}</p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100/60">{getPhase(state)}</p>
      </div>

      {hasClaim ? (
        <>
          <button
            data-qa="village-scene-open-orders"
            onClick={() => dispatch({ type: "setView", view: "orders" })}
            className="absolute bottom-[5.2rem] left-4 right-4 z-30 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 shadow-2xl shadow-black/40 transition hover:bg-amber-200 lg:hidden"
          >
            Issue next order
          </button>
          <div className="absolute bottom-5 right-5 z-20 hidden max-w-[290px] rounded-3xl border border-amber-100/18 bg-black/48 p-3 shadow-2xl backdrop-blur-md lg:block">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-200/55">Latest order</p>
            <p className="mt-1 text-sm font-black text-amber-50">{state.lastEvent}</p>
            <button
              data-qa="village-scene-open-orders-desktop"
              onClick={() => dispatch({ type: "setView", view: "orders" })}
              className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-200"
            >
              Issue next order
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

function CompactStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-amber-200/45">{label}</p>
      <p className="text-xs font-black text-amber-50">{value}</p>
    </div>
  );
}
''')

GUARD.write_text('''#!/usr/bin/env node
import fs from "node:fs";

const page = fs.readFileSync("app/play/page.tsx", "utf8");
const scene = fs.readFileSync("app/play/components/AurelianVillageScene.tsx", "utf8");

const requiredPageTokens = [
  'import { AurelianVillageScene } from "./components/AurelianVillageScene";',
  'const aurelianInitialPlayState: PlayState = {',
  'ownedPlotIds: [initialPlayState.selectedPlotId]',
  'settlementMarkers: ["camp"]',
  'view: "village"',
  'useReducer(playReducer, aurelianInitialPlayState)',
  '<AurelianVillageScene state={state} dispatch={dispatch} />',
  'dispatch({ type: "hydrate", state: aurelianInitialPlayState })',
  'if (isLegacyEmptyRun) return aurelianInitialPlayState',
];

const requiredSceneTokens = [
  'aurelian-camp-desktop.png',
  'aurelian-camp-portrait.png',
  'aurelian-first_shelter-desktop.png',
  'aurelian-first_shelter-portrait.png',
  'aurelian-developed_settlement-desktop.png',
  'aurelian-developed_settlement-portrait.png',
  'data-aurelian-stage={stageId}',
  'data-qa="aurelian-village-stage"',
  'state.settlementMarkers.includes("shelter")',
  'developedMarkers.some',
  'return "developed_settlement"',
  'return "first_shelter"',
  'return "camp"',
];

const forbiddenPageTokens = [
  'import { VillageScene } from "./components/VillageScene";',
  'useReducer(playReducer, initialPlayState)',
];

for (const token of requiredPageTokens) {
  if (!page.includes(token)) throw new Error(`Missing Aurelian page integration token: ${token}`);
}
for (const token of requiredSceneTokens) {
  if (!scene.includes(token)) throw new Error(`Missing Aurelian scene token: ${token}`);
}
for (const token of forbiddenPageTokens) {
  if (page.includes(token)) throw new Error(`Forbidden legacy product-path token remains: ${token}`);
}

console.log("AURELIAN_PLAY_INTEGRATION_GUARD_OK");
''')

package = json.loads(PACKAGE.read_text())
scripts = package.setdefault("scripts", {})
scripts["qa:aurelian:play"] = "node scripts/qa-aurelian-play-integration.mjs"
finish = scripts.get("pn:finish", "")
if "npm run qa:aurelian:play" not in finish:
    finish = finish.replace("npm run build &&", "npm run build && npm run qa:aurelian:play &&", 1)
scripts["pn:finish"] = finish
PACKAGE.write_text(json.dumps(package, indent=2) + "\n")

print("AURELIAN_M2_INTEGRATION_APPLIED")
