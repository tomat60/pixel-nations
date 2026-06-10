export type Terrain = "coast" | "land" | "forest" | "mountain" | "desert" | "tundra";

export const TERRAIN_COLORS: Record<Terrain, string> = {
  coast: "#e8c872",
  land: "#c9a962",
  forest: "#a68b45",
  mountain: "#6b5420",
  desert: "#d4b06a",
  tundra: "#8a7d5c",
};

const CHAR_TO_TERRAIN: Record<string, Terrain> = {
  c: "coast",
  l: "land",
  f: "forest",
  m: "mountain",
  d: "desert",
  t: "tundra",
};

export const MAP_WIDTH = 120;
export const MAP_HEIGHT = 60;

// Hand-crafted continent silhouettes (l=land, .=ocean)
const NORTH_AMERICA = [
  "tttt................ttttttt..........",
  "ccllcctt..........ttccccccctt........",
  "ccllllcctt......ttccllllllcctt.......",
  ".ccllllllcct....tccllllllllllcct.....",
  ".tcclllllllcct..tccllllllllllllcct....",
  "..tccllllllllcctcclllllllllllllllcc....",
  "..cclllllllllllllllllllllllllllllcc....",
  ".tcclllllllllllllllllllllllllllllcct...",
  ".cclllllllllllllllllllllllllllllllcc...",
  "tcclllllllllllllllllllllllllllllllcct..",
  "tcclllllllllllllllllllllllllllllllcct..",
  "cclllllllllllllllllllllllllllllllllcc..",
  "cclllllllllllllllllllllllllllllllllcc..",
  "tcclllllllllllllllllllllllllllllllcct..",
  "tcclllllllllllllccllllllllllllllllcct..",
  ".cclllllllllllllc..cclllllllllllllcc...",
  ".tcclllllllllllc....cclllllllllllcct..",
  "..tcclllllllllcc.....ccllllllllllcct..",
  "...tcclllllllcc.......cclllllllcct...",
  "....tcclllllcc.........cclllllcct...",
  ".....tcclllcc...........cclllcct...",
  "......tccllcc............ccllcct...",
  ".......tcclcc.............cclcct...",
  "........tccct..............cccct...",
  ".........tcct...............ccct....",
  "..........tct................cct.....",
];

const CENTRAL_AMERICA = [
  "..tt..",
  ".tcclc",
  "tccllc",
  "cclllc",
  ".tcllc",
  "..tcl.",
  "...tc.",
];

const SOUTH_AMERICA = [
  ".....tttt....",
  "...ttcccctt..",
  "..tccllllcct.",
  ".tccllllllcct",
  ".tccllllllcct",
  "tcclllllllcct",
  "tcclllllllcct",
  "ccllllllllcct",
  "ccllllllllcct",
  "ccllllllllcct",
  "ccllllllllcct",
  "tcclllllllcct",
  "tcclllllllcct",
  ".tccllllllcct",
  ".tccllllllcct",
  "..tcclllllcct",
  "..tcclllllcct",
  "...tccllllcct",
  "....tcclllcct",
  ".....tccllcct",
  "......tcclcct",
  ".......tcccct",
  "........tccct",
  ".........tct.",
];

const GREENLAND = [
  "...ttttt...",
  "..tccllcct.",
  ".tccllllcct",
  "tccllllllcct",
  "ccllllllllcc",
  "tccllllllcct",
  ".tccllllcct",
  "..tccllcct.",
  "...tccct...",
];

const EUROPE = [
  "....ttttt....",
  "...tccllcct..",
  "..tccllllcct.",
  ".tccllllllcct",
  ".tccllllllcct",
  "tcclllllllcct",
  "tcclllllllcct",
  "tcclllllllcct",
  ".tccllllllcct",
  ".tcclllcclcct",
  "..tccllllcct.",
  "...tccllcct..",
  "....tcccct...",
];

const AFRICA = [
  ".....tttt.....",
  "...ttcccctt...",
  "..tccllllcct..",
  ".tccllllllcct.",
  ".tccllllllcct.",
  "tcclllllllcct.",
  "tcclllllllcct.",
  "ccllllllllcct.",
  "ccllllllllcct.",
  "ccllllllllcct.",
  "ccllllllllcct.",
  "tcclllllllcct.",
  "tcclllllllcct.",
  ".tccllllllcct.",
  ".tccllllllcct.",
  "..tcclllllcct.",
  "..tcclllllcct.",
  "...tccllllcct.",
  "....tcclllcct.",
  ".....tccllcct.",
  "......tcclcct.",
  ".......tcccct.",
  "........tcct..",
];

const ASIA = [
  "........tttttttttttttttttttttttttttttttttttttttt",
  "......ttcccccccccccccccccccccccccccccccccccccttt",
  "....ttccllllllllllllllllllllllllllllllllllllcct",
  "...tcclllllllllllllllllllllllllllllllllllllllcct",
  "..tcclllllllllllllllllllllllllllllllllllllllllcct",
  "..cclllllllllllllllllllllllllllllllllllllllllllcc",
  ".tcclllllllllllllllllllllllllllllllllllllllllllcct",
  ".cclllllllllllllllllllllllllllllllllllllllllllllcc",
  "tcclllllllllllllllllllllllllllllllllllllllllllllcct",
  "tcclllllllllllllllllllllllllllllllllllllllllllllcct",
  "cclllllllllllllllllllllllllllllllllllllllllllllllcc",
  "cclllllllllllllllllllllllllllllllllllllllllllllllcc",
  "cclllllllllllllllllllllllllllllllllllllllllllllllcc",
  "tcclllllllllllllllllllllllllllllllllllllllllllllcct",
  "tcclllllllllllllllllllllllllllllllllllllllllllllcct",
  "tcclllllllllllllllllllllllllllllccllllllllllllllcct",
  ".cclllllllllllllllllllllllllllllc..cllllllllllllcc",
  ".tccllllllllllllllllllllllllllllc...cllllllllllllcct",
  "..tcclllllllllllllllllllllllllllc....clllllllllllcct",
  "..tcclllllllllllllllllllllllllllc.....cllllllllllcct",
  "...tccllllllllllllllllllllllllllc......clllllllllcct",
  "....tcclllllllllllllllllllllllllc.......cllllllllcct",
  ".....tcclllllllllllllllllllllllc........clllllllcct",
  "......tcclllllllllllllllllllllc.........cllllllcct",
  ".......tccllllllllllllllllllllc..........clllllcct",
  "........tcclllllllllllllllllllc...........cllllcct",
  ".........tccllllllllllllllllllc............clllcct",
  "..........tcclllllllllllllllllc.............cllcct",
  "...........tccllllllllllllllllc..............clcct",
  "............tcclllllllllllllllc...............ccct",
  ".............tcclllllllllllllc................cct",
  "..............tccllllllllllllc.................ct",
  "...............tcclllllllllllc..................t",
  "................tcclllllllllc",
  ".................tccllllllllc",
  "..................tcclllllllc",
  "...................tccllllllc",
  "....................tccllllc",
  ".....................tcclllc",
  "......................tccllc",
  ".......................tcclc",
  "........................tccc",
  ".........................tcc",
  "..........................tc",
];

const INDIA = [
  "..tt..",
  ".tcclc",
  "tccllc",
  "cclllc",
  "tccllc",
  ".tcllc",
  "..tcl.",
];

const ARABIA = [
  ".tttt.",
  "tccllc",
  "cclllc",
  "cclllc",
  "tccllc",
  ".tclc.",
];

const SE_ASIA = [
  "...tttt...",
  "..tccllcct",
  ".tccllllcct",
  "tccllllllcct",
  "tccllllllcct",
  ".tccllllcct",
  "..tccllcct",
  "...tccct..",
];

const JAPAN = [
  ".t.",
  "tcl",
  "clc",
  "tcl",
  ".lc",
  "tc.",
  ".t.",
];

const AUSTRALIA = [
  "....tttttt....",
  "..ttcclllcctt.",
  ".tcclllllllcct",
  "tcclllllllllcct",
  "cclllllllllllcc",
  "cclllllllllllcc",
  "tcclllllllllcct",
  ".tcclllllllcct",
  "..tcclllllcct.",
  "...tcclllcct..",
  "....tcccct....",
];

const MADAGASCAR = [
  "..tt..",
  ".tcclc",
  "tccllc",
  "cclllc",
  "tccllc",
  ".tcllc",
  "..tcl.",
];

const BRITAIN = [
  "..tt..",
  ".tcllc",
  "tccllc",
  ".tcllc",
  "..tt..",
];

function overlay(
  canvas: string[][],
  patch: string[],
  offsetX: number,
  offsetY: number,
) {
  patch.forEach((row, py) => {
    const cy = offsetY + py;
    if (cy < 0 || cy >= canvas.length) return;
    [...row].forEach((cell, px) => {
      const cx = offsetX + px;
      if (cx < 0 || cx >= canvas[0].length) return;
      if (cell !== ".") canvas[cy][cx] = "l";
    });
  });
}

function isLand(cell: string) {
  return cell === "l";
}

function isOcean(cell: string) {
  return cell === ".";
}

function markCoasts(grid: string[][]): string[] {
  const height = grid.length;
  const width = grid[0].length;

  return grid.map((row, y) =>
    [...row]
      .map((cell, x) => {
        if (!isLand(cell)) return ".";

        const neighbors = [
          grid[y - 1]?.[x],
          grid[y + 1]?.[x],
          row[x - 1],
          row[x + 1],
        ];

        const touchesOcean = neighbors.some((n) => n === undefined || isOcean(n));
        return touchesOcean ? "c" : "l";
      })
      .join(""),
  );
}

function addTerrainDetail(rows: string[]): string[] {
  const height = rows.length;

  return rows.map((row, y) =>
    [...row]
      .map((cell, x) => {
        if (cell === ".") return ".";
        if (cell === "c") return "c";

        const hash = (x * 13 + y * 7) % 100;
        const latitude = y / height;

        if (latitude < 0.14) return hash < 55 ? "t" : "l";
        if (latitude < 0.22 && hash < 30) return "t";
        if (latitude > 0.55 && x > 40 && x < 75 && hash < 35) return "d";
        if (latitude > 0.62 && x > 75 && hash < 25) return "d";
        if (hash < 14) return "m";
        if (hash < 34) return "f";
        return "l";
      })
      .join(""),
  );
}

function buildCanvas(): string[] {
  const canvas: string[][] = Array.from({ length: MAP_HEIGHT }, () =>
    Array.from({ length: MAP_WIDTH }, () => "."),
  );

  // Earth-like placement on equirectangular grid
  overlay(canvas, NORTH_AMERICA, 2, 4);
  overlay(canvas, GREENLAND, 24, 1);
  overlay(canvas, CENTRAL_AMERICA, 17, 24);
  overlay(canvas, SOUTH_AMERICA, 16, 28);
  overlay(canvas, EUROPE, 44, 9);
  overlay(canvas, BRITAIN, 42, 11);
  overlay(canvas, AFRICA, 47, 18);
  overlay(canvas, ARABIA, 58, 20);
  overlay(canvas, ASIA, 52, 4);
  overlay(canvas, INDIA, 68, 20);
  overlay(canvas, SE_ASIA, 74, 24);
  overlay(canvas, JAPAN, 88, 12);
  overlay(canvas, MADAGASCAR, 56, 32);
  overlay(canvas, AUSTRALIA, 78, 36);

  const withCoasts = markCoasts(canvas);
  return addTerrainDetail(withCoasts);
}

export const WORLD_MAP = buildCanvas();

export function parseWorldMap(): { x: number; y: number; terrain: Terrain }[] {
  const pixels: { x: number; y: number; terrain: Terrain }[] = [];

  WORLD_MAP.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === ".") return;
      const terrain = CHAR_TO_TERRAIN[cell];
      if (terrain) pixels.push({ x, y, terrain });
    });
  });

  return pixels;
}
