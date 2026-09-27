# World Atlas A-01 Cartographic Mass v1

Classification: `WORLD_ATLAS_A01_CARTOGRAPHIC_MASS_TARGET_PASS`

This is a bounded static art-direction target. It is not production game code or a production asset.

## Product hypothesis

At World scale, A-01 should be represented by a terrain-scale cartographic mass rather than by miniature Sector buildings or flags. The same Aurelian geography remains visible through the river systems and macro-regions.

## Required read

At both 1440x900 and 360x225, with labels hidden from the primary composition:

1. Home A-01: cobalt basin mass and Aurelian crest.
2. Important neighbor or direction: the gold route and destination sigil.
3. Large world: muted macro-regions, rivers, routes, and the wider landmass.

## Bounded correction used

The first pass read as a detached circular UI highlight. The one allowed correction replaced it with an irregular basin inlay, reduced the bright perimeter treatment, and drew the canonical river over the region so the identity remains part of the geography.

## Direct review

PASS:

- the Aurelian home is the first read without labels at thumbnail scale;
- the gold regional direction is the second read;
- the larger world remains visible;
- no tiny building or flag carries the home identity;
- the river crosses the home mass, preserving physical continuity;
- the composition is materially different from the rejected landmark and sigil-ridge approaches.

## Non-scope

No generator, runtime, gameplay, Village, economy, persistence, camera, terrain-height, engine, or asset-family change is included.

## Evidence

- `world_atlas_a01_cartographic_mass_v1.png`: 1440x900
- `world_atlas_a01_cartographic_mass_v1_thumb.png`: 360x225
- `world_atlas_a01_cartographic_mass_v1.svg`: editable source
- Issue authority: https://github.com/tomat60/pixel-nations/issues/721#issuecomment-5852726446

## Next gate

If independently accepted, the next implementation candidate may translate this composition primitive into the existing Godot World generator. It must still produce exact-head runtime screenshots at both review sizes and preserve shared Aurelian geography. This static target alone does not authorize merge of production behavior.
