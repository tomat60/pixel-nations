# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-17
Current state revision: Aurelian Moodboard Direction v1.1
Authority source: this file on the current `main`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: Bespoke Aurelian Basin visual target before implementation reference
Active execution issue: #415
Active implementation PR: none
Last completed milestone: Aurelian moodboard direction selected under `docs/AURELIAN_BASIN_MOODBOARD_V1.md`
Next allowed action: Produce exactly one bespoke non-production Aurelian visual-target package from the accepted moodboard and `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`, then stop for direct visual review. No Godot/Blender Aurelian implementation is authorized before `ART_DIRECTION_PASS`.

## Product truth

Pixel Nations is a strategy game built around:

`one land → settlement / city → nation → empire`

The full world contains 10,000 lands in a 100 × 100 structure. The current demo geography is Sector A-01 / Aurelian Basin.

P4-P11 remain accepted. P11 does not authorize P12. ADR-001 remains binding: Godot is the target runtime and Next.js `/play` remains the working rollback/demo shell until a Godot visual replacement is directly accepted.

## Current Aurelian evidence

- Phase 0 topology/composition board: `PASS`.
- Shared topology authority: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`.
- PR #426 first shared-geography technique: `REJECTED / CLOSED WITHOUT MERGE`.
- PR #429 Blender → one GLB candidate: `REJECTED / CLOSED WITHOUT MERGE`.
- PR #432 zero-art render-path calibration: `PASS / CLOSED WITHOUT MERGE`.
- PR #435 scene-specific import/composition calibration: `PASS_SCENE_COMPOSITION_ISOLATED / CLOSED WITHOUT MERGE`; #429 black output was isolated to `environment.tonemap_exposure = 0.0` and the GLB was proven renderable.
- PR #437 exact-GLB product-camera replay: `VISUAL_REPLAY_REJECT / CLOSED WITHOUT MERGE` after direct Village / Map / World / Bridge and movie review.
- #437 exact head: `7d2d8b48bdd401c3f27b078573a315ae86f512ed`.
- #437 run: `32032319372`.
- #437 artifact: `9289410431`, digest `sha256:5f1b7658d5ef02622b7d15fd6e20a4500d2488fd38d04e55dca0bb319840b9a4`.
- Do not patch or salvage the #429 GLB again.
- PR #438 merged the art-direction reset and blocked further Aurelian implementation until the design target is accepted.
- `docs/AURELIAN_BASIN_MOODBOARD_V1.md` now locks the reference direction before visual-target generation.

## Accepted moodboard direction

The target blends concepts, not assets:

- **Northgard**: macro terrain/region readability without sector boundaries or board segmentation;
- **Foundation**: organic river, bridge landing and terrain-led settlement integration;
- **Against the Storm**: premium stylized 3D massing, midtone material hierarchy and strategic readability without storm-dark mood or tiles;
- **Manor Lords**: terrain-led road hierarchy and settlement growth without photorealism;
- **Dorfromantik**: economical readable biome transitions without hexes, tiles or puzzle-board silhouette.

Combined target:

**Northgard readability + Foundation geography integration + Against the Storm material/lighting discipline + Manor Lords route logic + Dorfromantik transition economy.**

It must still look like Pixel Nations, not a collage of reference games.

## Visual-target requirements

The next and only active visual task is one bespoke non-production package showing the same locked Aurelian geography as:

1. **Village**: Greenvale + river + Gilded Crossing, obvious connected west road and dry bridge approaches;
2. **Map**: primary route network and differentiated Greenvale / forest / North Ridge / fields / marsh zones;
3. **World**: coherent full Basin identity with continuous river widening into natural marsh/coast/outflow;
4. optional bridge crop only if Village cannot prove crossing construction clearly enough.

Non-negotiable geography:

- Greenvale west of river;
- ForestWorkEdge north-west;
- North Ridge north-east across river;
- FieldsPlains south/south-east;
- South Marsh lower south;
- Gilded Crossing near canonical `[515,340]`, east-west;
- one continuous canonical river north → crossing → marsh → coast/outflow;
- Village / Map / World are one geography and one camera family.

Visual language:

- premium authored grand-strategy diorama;
- stylized, tactile and continuous, not photorealistic or tile-based;
- natural sloped river banks, no trench/canyon read;
- bridge reads west road → dry approach → embedded ramp/abutment → deck → embedded ramp/abutment → dry east road;
- roads clearly legible at Map scale;
- no visible rectangular board edge or cyan outer-water slab;
- muted warm earth / olive / moss terrain, deeper forest, warmer fields, slate rock, restrained blue-green water, warm settlement accents;
- controlled midtones, no pale blowout or giant dark shadow patches;
- no UI, labels, hexes, region borders, floating parcels or dashboard markers.

## Art-direction gate

After the first visual target, classify exactly one:

- `ART_DIRECTION_PASS`: clear enough to author a separate bounded implementation-reference contract;
- `ART_DIRECTION_CORRECTION_REQUIRED`: overall direction is correct but one named bounded visual correction is required; only one correction pass allowed;
- `ART_DIRECTION_REJECT`: direction is wrong enough that implementation would require the executor to invent design decisions.

The visual target is a design reference only, never a runtime or production asset.

## Tool and cost policy now

- Strategy/control/review: GPT-5.6 Sol.
- Visual target: one controlled image-generation/design pass is allowed as non-production reference.
- Cursor: blocked until `ART_DIRECTION_PASS` and a precise implementation-reference contract are merged.
- Godot/Blender Aurelian implementation: blocked.
- MAX: OFF.
- Paid tools/assets and Fable: blocked.
- Target extra spend: 0 USD.

## Mandatory PR/release ownership

The user is not responsible for finding failed, drifting or stuck PRs.

For every PR/head change, re-fetch exact head/base, ahead/behind, full diff/scope, mergeability, permissions/dependencies/secrets, checks and required evidence. Green CI alone is insufficient for visual acceptance.

After every merge verify accepted head → merge SHA → new `main` → checks → deployment → public routes where the environment permits. If public origin cannot be resolved, record `PRODUCTION UNVERIFIED` and the exact missing evidence.

## Source-of-truth precedence

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially ADR-001
3. root `AGENTS.md`
4. active issue #415
5. `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
6. `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`
7. `docs/AURELIAN_BASIN_MOODBOARD_V1.md`
8. exact-head accepted evidence / operating protocols
9. historical issues, draft PRs and comments

## Allowed work now

- exactly one bespoke Aurelian non-production visual target;
- direct visual-target review and at most one named correction if justified;
- normal control-plane/release verification.

## Blocked work now

- any Aurelian Godot/Blender implementation or new GLB candidate;
- any patch/salvage of #429;
- product integration or Phase 2;
- P12 or further gameplay/retention/onboarding work;
- independent web Map/World rebuilding as final product art;
- `app/play/**` visual changes;
- paid tools/assets, MAX or Fable;
- backend/accounts/payments/multiplayer/combat/full economy/crypto;
- merge from green CI alone.

## Session start gate

Before meaningful work:

1. Read this file, art-direction recovery, moodboard, topology authority, ADR-001, root `AGENTS.md`, and #415.
2. Re-fetch live GitHub state.
3. State model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Stop when the first bespoke visual-target package receives direct review and is classified `ART_DIRECTION_PASS`, `ART_DIRECTION_CORRECTION_REQUIRED`, or `ART_DIRECTION_REJECT`. Do not code another Aurelian scene before `ART_DIRECTION_PASS`.