import {
  MAP_HEIGHT,
  MAP_WIDTH,
  parseWorldMap,
  TERRAIN_COLORS,
  type Terrain,
} from "./world-map-data";

const CELL_SIZE = 6;

type PixelWorldMapProps = {
  className?: string;
  background?: boolean;
};

export function PixelWorldMap({
  className = "",
  background = false,
}: PixelWorldMapProps) {
  const pixels = parseWorldMap();
  const width = MAP_WIDTH * CELL_SIZE;
  const height = MAP_HEIGHT * CELL_SIZE;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      className={`pixel-map ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <g>
        {pixels.map(({ x, y, terrain }) => (
          <rect
            key={`${x}-${y}`}
            x={x * CELL_SIZE}
            y={y * CELL_SIZE}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={background ? "#c9a962" : TERRAIN_COLORS[terrain as Terrain]}
            opacity={background ? 1 : terrainOpacity(terrain, x, y)}
          />
        ))}
      </g>
    </svg>
  );
}

function terrainOpacity(terrain: Terrain, x: number, y: number): number {
  const base: Record<Terrain, number> = {
    coast: 0.95,
    land: 0.85,
    forest: 0.8,
    mountain: 0.9,
    desert: 0.75,
    tundra: 0.7,
  };
  const flicker = ((x * 3 + y * 5) % 7) * 0.02;
  return Math.min(1, base[terrain] + flicker);
}
