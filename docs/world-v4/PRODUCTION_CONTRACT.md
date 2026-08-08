# World V4 Continuity Proof Contract

World V4 replaces the rejected dashboard-like Map/World surfaces with two zooms of one canonical low-poly Aurelian geography.

## Required outputs

- `basin`: one 30-land overview of Aurelian Basin.
- `region`: one 25-sector closer view centered on Greenvale.
- For each zoom: a square 2048 master, a 2048 x 1280 desktop crop and a 780 x 1688 portrait crop.
- One projection manifest containing every irregular convex cell in world coordinates and normalized image coordinates.
- Contact sheets for masters, desktop crops and portrait crops.

## Continuity anchors

Both zooms must preserve the same river, bridge, Greenvale location, North Ridge, Eastfold and coast. Region is a true camera zoom into Basin, never a separately invented map.

## Visual rules

- Low-poly, warm isometric terrain must belong to the same visual family as Village V4.
- Cell boundaries are a subtle interaction aid, not the dominant picture.
- No rectangular 5 x 5 matrix, inspector panel, dashboard framing, labels baked into runtime art or photorealistic atlas.
- Portrait is an honest crop of the same rendered master, not a rearranged geography.
- Greenvale must be legible without turning the proof into a UI mockup.

## Acceptance gate

Technical checks prove only determinism and geometry validity. Exact native evidence must receive one of `ACCEPT CONTINUITY`, `ONE COMPOSITION CORRECTION`, or `REJECT ART DIRECTION` before runtime integration.
