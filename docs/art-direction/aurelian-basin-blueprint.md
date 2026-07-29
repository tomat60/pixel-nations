# Aurelian Basin Art-Direction Blueprint

Status: `BLUEPRINT_CANDIDATE`  
Scope: composition contract only. No engine scene, production asset, gameplay, merge, or deployment.

## Locked reference

- KayKit source commit `84fa4e91af6a88989be7c99e0891cede11f2ca38`, CC0.
- Uniform import scale `11.71437541`.
- Measured AABBs: home `11.9134 × 10.8944 × 12.3774`; blacksmith `16.9667 × 11.5399 × 16.5434`; church `16.2448 × 19.2706 × 17.0604`.
- Neutral lighting: background `#9aa9a2`; ambient `#d7d0bf` at `0.48`; directional `#fff1d4` at `1.05`, rotation `[-48,-32,0]`; Filmic exposure `0.92`.

## Global rules

1. Terrain continues beyond every visible edge. Never reveal a rectangular slab or floating board.
2. Primary silhouettes may overlap by at most 30%.
3. Minimum center-to-center separation: home↔home 14 m; home↔primary 18 m; primary↔primary 22 m.
4. Buildings ground to terrain within 0.05 world units; opaque pads are forbidden.
5. Road width is 5 m. River clear width is 3.8× road width. Bank depth is 0.55× road width.
6. Bridge deck width is 6 m, clear span 27 m, with two compact supports and 2.2 m abutment depth. It must read as a crossing, never a slab.
7. Value hierarchy uses three groups: terrain, settlement, founder accent. Founder red/gold may occupy at most 8% of frame; visible red roofs at most 35%.

## Desktop — 1440×900

Retain camera position `[39,34,45]`, target `[0,3,0]`, orthographic size `30`.

Composition flows lower-left approach → crossing → blacksmith → commons → church landmark. Hearthmeadow occupies the right two-thirds. The church sits rear-right as the tallest landmark without blocking the commons. The barracks anchors the frontier flank. Homes, market and well wrap the commons with 18–22 m separation.

Safe margins are 5% horizontal and 6% vertical. Terrain exceeds the frame by at least 4% horizontally and 8% vertically. The road remains visibly continuous from the lower approach through the crossing into the commons.

## Portrait — 390×844

Portrait is an independent vertical composition, not a crop. Camera proposal: position `[31,42,57]`, target `[0,4,4]`, orthographic size `52`.

Use four vertical bands:
- 70–98%: approach;
- 54–72%: crossing;
- 30–55%: commons and primary buildings;
- 7–31%: church landmark.

The route is approach → crossing → blacksmith → commons → church. Blacksmith occupies the left approach shoulder; homes/market/well step to the right of the commons; barracks holds the upper-left flank; church remains upper-right. Omit secondary house clusters, large rock groups, long fence runs and nonessential market stalls.

## Implementation handoff

Use `aurelian-basin-blueprint.json` as the authoritative numerical contract. SVGs are visual references for layout and occlusion. Before any new Godot frame:

1. Instantiate terrain larger than camera bounds.
2. Place river, banks and road first.
3. Validate bridge proportions and road continuity.
4. Place primary buildings using the spacing rules.
5. Check silhouette overlap before secondary props.
6. Use separate desktop and portrait cameras.
7. Capture both outputs before adding decoration.

Any deviation from camera, spacing, overlap, terrain occupancy or crossing ratios requires a written reason in the implementation PR.
