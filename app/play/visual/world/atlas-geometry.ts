export type AtlasPoint = { x: number; y: number };

export type AtlasTerritory = {
  index: number;
  id: string;
  points: AtlasPoint[];
  path: string;
};

// Seed module for the guarded World Atlas implementation run.
// The executor will replace this placeholder with deterministic geometry.
export function buildAtlasGeometry(): AtlasTerritory[] {
  return [];
}
