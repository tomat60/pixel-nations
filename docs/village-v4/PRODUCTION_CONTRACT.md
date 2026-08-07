# Village V4 Production Contract

Village V4 fixes the owner-reported full-frame jump by making every settlement order produce one visible, persistent spatial delta in the same registered Aurelian scene.

## Required art outputs

- One opaque terrain/river/bridge base for desktop and one for portrait.
- One initial Camp layer for each composition.
- Eight order-delta layers for each composition: Shelter, Food, Timber, Scout, Storehouse, Market, Watch and Council.
- One lossless cumulative proof frame after every layer.
- One stage contact sheet and one isolated-delta contact sheet per composition.
- One native developed master and same-camera shelter proof per composition.
- Provenance, dimensions, SHA-256, camera registration and per-layer pixel bounds in a machine-readable manifest.

The two registered native compositions are:

- desktop: 2048 × 1280, matching the 1440 × 900 `/play` evidence ratio;
- portrait: 780 × 1688, matching the 390 × 844 `/play` evidence ratio.

## Binding sequence

| Visual layer | Product state |
| --- | --- |
| Camp | owned land / opening state |
| Shelter | `raise-shelter` |
| Food | `gather-food` |
| Timber | `cut-timber` |
| Scout | `scout-nearby` |
| Storehouse | `build-storehouse` |
| Market | `open-market` |
| Watch | `fortify-watch` |
| Council | `form-council` |

No two adjacent product states may reconstruct to the same frame.

## Composition rules

- Terrain, river, bridge, lighting direction and camera registration remain fixed within each composition.
- Desktop and portrait may reposition buildings independently to preserve hierarchy and safe areas.
- Growth begins from the retained camp and expands around one legible civic/market core.
- The road from the bridge must connect to the settlement at every stage.
- Food, timber and scout must read as land-use expansion, not text-only resource changes.
- Storehouse must not spawn an already complete city.
- Market, Watch and Council must add distinct silhouettes and spatial functions.
- The developed footprint must span at least 42% of frame width and 35% of frame height without becoming an edge pile.
- UI, labels, callouts, filters and presentation framing are forbidden inside runtime art.

## Layer rules

- Layers are genuine registered RGBA deltas derived from deterministic cumulative renders.
- Every new layer must contain non-empty alpha and a bounded local change.
- Compositing base plus visible layers in order must reproduce the corresponding cumulative proof pixel-for-pixel.
- Camp props remain visible; later states are additive and may not erase earlier growth.
- Runtime animation may reveal only the newly earned transparent layer. Full-frame crossfades, blur swaps and shared snapshots mapped to multiple orders are forbidden.

## Source and cost rules

- Use the pinned CC0 KayKit Medieval Hexagon source at commit `84fa4e91af6a88989be7c99e0891cede11f2ca38`.
- Verify the source archive SHA-256 `cfa7faff403c93fb90e8eeb448c78e6192782802a532bebed0bdb853b39f7028` before rendering.
- No paid assets and no image-generation call are authorized for this proof.
- Default implementation model remains GPT-5.5 without MAX; render work runs deterministically on GitHub Actions.

## Acceptance gate

A green renderer, CI run or pixel-reconstruction check proves only technical validity.

Direct review of exact native desktop and portrait evidence must return one of:

- `ACCEPT FOR LAYER INTEGRATION`;
- `ONE COMPOSITION CORRECTION`;
- `REJECT ART DIRECTION`.

At most one composition correction is allowed before the direction is re-evaluated.
