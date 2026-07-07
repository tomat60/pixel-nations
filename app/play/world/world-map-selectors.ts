import { LANDS_PER_SECTOR, SECTOR_COUNT, WORLD_SEED, getWorldLand, getWorldSectors, type WorldLand, type WorldSector } from "../lib/world-engine";

export type SectorKind = "origin" | "rival" | "danger" | "trade" | "frontier";

export type WorldMapSector = WorldSector & {
  kind: SectorKind;
  isOrigin: boolean;
  isRival: boolean;
  isTradeRich: boolean;
  isHighDanger: boolean;
};

export type WorldMapModel = {
  seed: string;
  sectors: WorldMapSector[];
  counts: Record<SectorKind, number>;
};

export function classifySector(sector: WorldSector): SectorKind {
  if (sector.faction === "player") return "origin";
  if (!["free", "player"].includes(sector.faction)) return "rival";
  if (sector.danger >= 60) return "danger";
  if (sector.trade >= 60) return "trade";
  return "frontier";
}

export function buildWorldMapModel(): WorldMapModel {
  const sectors = getWorldSectors().map((sector) => {
    const kind = classifySector(sector);
    return {
      ...sector,
      kind,
      isOrigin: kind === "origin",
      isRival: kind === "rival",
      isTradeRich: sector.trade >= 60,
      isHighDanger: sector.danger >= 60,
    } satisfies WorldMapSector;
  });

  const counts = sectors.reduce<Record<SectorKind, number>>((acc, sector) => {
    acc[sector.kind] += 1;
    return acc;
  }, { origin: 0, rival: 0, danger: 0, trade: 0, frontier: 0 });

  return { seed: WORLD_SEED, sectors, counts };
}

export function getSectorLandSamples(sectorIndex: number): WorldLand[] {
  const safeIndex = Math.max(0, Math.min(SECTOR_COUNT - 1, sectorIndex));
  const start = safeIndex * LANDS_PER_SECTOR + 1;
  return [0, 1, 2, 17, 41, 76].map((offset) => getWorldLand(start + offset));
}

export function assertWorldMapModel(model = buildWorldMapModel()) {
  const has100Sectors = model.sectors.length === SECTOR_COUNT;
  const hasValidCoordinates = model.sectors.every((sector) => sector.x >= 0 && sector.x < 10 && sector.y >= 0 && sector.y < 10);
  const hasOrigin = model.counts.origin === 1;
  const hasRivals = model.counts.rival > 0;
  const hasTradeOrDanger = model.sectors.some((sector) => sector.isTradeRich || sector.isHighDanger);
  return { has100Sectors, hasValidCoordinates, hasOrigin, hasRivals, hasTradeOrDanger, ok: has100Sectors && hasValidCoordinates && hasOrigin && hasRivals && hasTradeOrDanger };
}
