"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  canClaimSector,
  expansionInfluenceCost,
  getClaimableSectorIds,
  getFrontierIntent,
  getFrontierObjectiveSecured,
  getNationDecision,
  getObsidianPressureState,
  getOwnedSectorIds,
  type PlayAction,
  type PlayState,
} from "../lib/play-state";
import { WorldBasinCanvas } from "./WorldBasinCanvas";
import { WorldMapScene } from "./WorldMapScene";
import { buildWorldMapModel, type WorldMapSector } from "./world-map-selectors";

export function WorldV3BasinScene({ state, dispatch }: { state: PlayState; dispatch: (action: PlayAction) => void }) {
  const semanticSceneRef = useRef<HTMLDivElement>(null);
  const model = useMemo(() => buildWorldMapModel(), []);
  const sectors = useMemo(() => model.sectors.filter((sector) => sector.x < 5 && sector.y < 5), [model]);
  const [selectedSectorId, setSelectedSectorId] = useState(sectors[0]?.id ?? "A-01");
  const [basinReady, setBasinReady] = useState(false);

  const ownedSectorIds = getOwnedSectorIds(state);
  const claimableSectorIds = getClaimableSectorIds(state);
  const canClaimSectorIds = sectors.filter((sector) => canClaimSector(state, sector.id).ok).map((sector) => sector.id);
  const nationFounded = Boolean(getNationDecision(state));
  const frontierObjective = getFrontierIntent(state);
  const frontierObjectiveComplete = getFrontierObjectiveSecured(state);
  const obsidianPressure = getObsidianPressureState(state);
  const institutionCount = Math.min(3, state.retentionRecords.length);
  const selected = sectors.find((sector) => sector.id === selectedSectorId) ?? sectors[0];
  const selectedClaim = selected ? canClaimSector(state, selected.id) : { ok: false, reason: "missing-sector" };
  const selectedOwned = selected ? ownedSectorIds.includes(selected.id) : false;

  useLayoutEffect(() => {
    const root = semanticSceneRef.current;
    if (!root) return;
    const legacyTiles = root.querySelectorAll<HTMLElement>('[data-qa="world-sector-tile"]');
    legacyTiles.forEach((tile) => {
      tile.setAttribute("data-qa", "world-sector-tile-legacy");
      tile.style.display = "none";
    });
    setBasinReady(true);
  }, []);

  function selectSector(sector: WorldMapSector) {
    setSelectedSectorId(sector.id);
    const legacyTile = semanticSceneRef.current?.querySelector<HTMLButtonElement>(
      `[data-qa="world-sector-tile-legacy"][data-sector-id="${sector.id}"]`,
    );
    legacyTile?.click();
  }

  return (
    <div data-qa="world-v3-runtime" data-world-technique="authored-basin" className="absolute inset-0">
      <div ref={semanticSceneRef} className="absolute inset-0">
        <WorldMapScene state={state} dispatch={dispatch} />
      </div>

      {basinReady ? (
        <div
          data-qa="world-v3-basin-runtime"
          className="pointer-events-none absolute bottom-[4.9rem] left-2 right-2 top-[13rem] z-20 md:bottom-[5.8rem] md:left-3 md:right-3 md:top-[9.2rem] lg:right-[335px]"
        >
          <WorldBasinCanvas
            sectors={sectors}
            selectedSectorId={selectedSectorId}
            ownedSectorIds={ownedSectorIds}
            claimableSectorIds={claimableSectorIds}
            canClaimSectorIds={canClaimSectorIds}
            nationFounded={nationFounded}
            institutionCount={institutionCount}
            frontierTargetSectorId={frontierObjective?.targetSectorId ?? null}
            frontierObjectiveComplete={frontierObjectiveComplete}
            obsidianPressure={obsidianPressure}
            onSelect={selectSector}
          />

          {selected ? (
            <div className="pointer-events-none absolute right-3 top-3 z-50 w-[10.75rem] rounded-2xl border border-amber-100/18 bg-[#07110e]/88 p-2.5 shadow-2xl backdrop-blur-md sm:w-[13rem]">
              <p className="text-[7px] font-black uppercase tracking-[0.18em] text-amber-100/50">Selected ground</p>
              <div className="mt-1 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-amber-50">{selected.id}</p>
                  <p className="text-[9px] font-bold text-amber-50/60">{selected.name}</p>
                </div>
                <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[7px] font-black uppercase text-white/60">{selected.biome}</span>
              </div>
              <button
                type="button"
                data-qa="world-v3-claim-sector"
                disabled={!selectedClaim.ok}
                onClick={() => dispatch({ type: "claimSector", sectorId: selected.id })}
                className="pointer-events-auto mt-2 w-full rounded-xl bg-lime-200 px-2.5 py-2 text-[9px] font-black text-stone-950 shadow-md transition hover:bg-lime-100 disabled:cursor-default disabled:bg-white/10 disabled:text-white/38"
              >
                {selectedOwned ? "Inside your borders" : selectedClaim.ok ? `Claim · ${expansionInfluenceCost} Influence` : "Select adjacent frontier"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
