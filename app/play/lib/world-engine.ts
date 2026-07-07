export const WORLD_SEED = "AURELIAN-001";
export const WORLD_LANDS = 10000;
export const SECTOR_COUNT = 100;
export const LANDS_PER_SECTOR = 100;

export type WorldBiome = "basin" | "forest" | "coast" | "highland" | "marsh" | "steppe" | "ruins" | "riverlands";
export type WorldFaction = "free" | "player" | "crownstone" | "iron-coast" | "crowmere" | "stormcap" | "veil-harbor";
export type WorldLandRole = "homeland" | "frontier" | "trade" | "rival-border" | "resource" | "wild" | "ruin";

export type WorldLand = {
  id: number;
  pnid: string;
  sectorId: string;
  name: string;
  biome: WorldBiome;
  faction: WorldFaction;
  role: WorldLandRole;
  danger: number;
  fertility: number;
  trade: number;
  influence: number;
  x: number;
  y: number;
};

export type WorldSector = {
  id: string;
  index: number;
  name: string;
  biome: WorldBiome;
  faction: WorldFaction;
  danger: number;
  trade: number;
  lands: number;
};

const biomes: WorldBiome[] = ["basin", "forest", "coast", "highland", "marsh", "steppe", "ruins", "riverlands"];
const factions: WorldFaction[] = ["free", "crownstone", "iron-coast", "crowmere", "stormcap", "veil-harbor"];
const roles: WorldLandRole[] = ["wild", "frontier", "resource", "trade", "rival-border", "ruin"];
const names = ["Aurelian", "Northfold", "Ash", "Glass", "Wolf", "Old", "Red", "Iron", "Storm", "Crown", "Crow", "Veil", "Salt", "Green", "Moon", "River"];
const endings = ["Basin", "Reach", "March", "Harbor", "Pines", "Road", "Field", "Coast", "Cap", "Stone", "Mere", "Hollow", "Wind", "Ford", "Gate", "Run"];

function hashNumber(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: T[], seed: string): T {
  return items[hashNumber(seed) % items.length];
}

function score(seed: string, min = 0, max = 100) {
  const span = max - min;
  return min + (hashNumber(seed) % (span + 1));
}

function sectorId(index: number) {
  const row = String.fromCharCode(65 + Math.floor(index / 10));
  const col = String((index % 10) + 1).padStart(2, "0");
  return `${row}-${col}`;
}

function landPnid(id: number) {
  return `PN-${String(id).padStart(5, "0")}`;
}

function landName(id: number) {
  const a = names[hashNumber(`${WORLD_SEED}:name-a:${id}`) % names.length];
  const b = endings[hashNumber(`${WORLD_SEED}:name-b:${id}`) % endings.length];
  return `${a} ${b}`;
}

export function getWorldSector(index: number): WorldSector {
  const safeIndex = Math.max(0, Math.min(SECTOR_COUNT - 1, index));
  const id = sectorId(safeIndex);
  const biome = safeIndex === 0 ? "basin" : pick(biomes, `${WORLD_SEED}:sector-biome:${safeIndex}`);
  const faction = safeIndex === 0 ? "player" : pick(factions, `${WORLD_SEED}:sector-faction:${safeIndex}`);
  return {
    id,
    index: safeIndex,
    name: safeIndex === 0 ? "Aurelian Basin" : `${pick(names, `${id}:n`)} ${pick(endings, `${id}:e`)}`,
    biome,
    faction,
    danger: safeIndex === 0 ? 12 : score(`${id}:danger`, 8, 82),
    trade: safeIndex === 0 ? 42 : score(`${id}:trade`, 5, 88),
    lands: LANDS_PER_SECTOR,
  };
}

export function getWorldLand(id: number): WorldLand {
  const safeId = Math.max(1, Math.min(WORLD_LANDS, id));
  const sectorIndex = Math.floor((safeId - 1) / LANDS_PER_SECTOR);
  const localIndex = (safeId - 1) % LANDS_PER_SECTOR;
  const sector = getWorldSector(sectorIndex);
  const playerCore = sectorIndex === 0 && localIndex < 3;
  const tradeLane = localIndex % 17 === 0 || localIndex === 12;
  const rivalBorder = sector.faction !== "free" && localIndex % 9 === 0;
  const role: WorldLandRole = playerCore ? "homeland" : tradeLane ? "trade" : rivalBorder ? "rival-border" : pick(roles, `${WORLD_SEED}:role:${safeId}`);
  const faction: WorldFaction = playerCore ? "player" : role === "rival-border" ? sector.faction : sector.faction === "player" ? "free" : sector.faction;
  return {
    id: safeId,
    pnid: landPnid(safeId),
    sectorId: sector.id,
    name: safeId === 1 ? "Greenvale" : landName(safeId),
    biome: sector.biome,
    faction,
    role,
    danger: role === "homeland" ? 4 : score(`${safeId}:danger`, 0, 100),
    fertility: score(`${safeId}:fertility`, 0, 100),
    trade: role === "trade" ? score(`${safeId}:trade`, 55, 100) : score(`${safeId}:trade`, 0, 70),
    influence: role === "rival-border" ? score(`${safeId}:influence`, 45, 100) : score(`${safeId}:influence`, 0, 85),
    x: localIndex % 10,
    y: Math.floor(localIndex / 10),
  };
}

export function getWorldSectors() {
  return Array.from({ length: SECTOR_COUNT }, (_, index) => getWorldSector(index));
}

export function getSampleWorldLands() {
  return [1, 2, 3, 18, 101, 244, 501, 1301, 4004, 7777, 10000].map(getWorldLand);
}

export function getWorldSummary() {
  const sectors = getWorldSectors();
  const rivalSectors = sectors.filter((sector) => !["free", "player"].includes(sector.faction)).length;
  const tradeSectors = sectors.filter((sector) => sector.trade >= 60).length;
  const highDangerSectors = sectors.filter((sector) => sector.danger >= 60).length;
  return {
    seed: WORLD_SEED,
    lands: WORLD_LANDS,
    sectors: SECTOR_COUNT,
    landsPerSector: LANDS_PER_SECTOR,
    rivalSectors,
    tradeSectors,
    highDangerSectors,
    firstSector: getWorldSector(0),
  };
}
