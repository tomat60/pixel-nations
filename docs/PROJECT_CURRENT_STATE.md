# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-17
Current state revision: Aurelian Art-Direction Recovery Gate v1.0
Authority source: this file on the current `main`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: Aurelian Basin art-direction reset before another implementation sprint
Active execution issue: #415
Active implementation PR: none
Last completed milestone: PR #437 exact-GLB product-camera replay, `VISUAL_REPLAY_REJECT / CLOSED WITHOUT MERGE`
Next allowed action: Complete the bounded art-direction recovery package defined by `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`, then stop for direct visual-target review. No Godot/Blender Aurelian implementation is authorized before that gate passes.

## Product truth

Pixel Nations is a strategy game built around:

`one land → settlement / city → nation → empire`

The full world contains 10,000 lands in a 100 × 100 structure. The current demo geography is Sector A-01 / Aurelian Basin.

P4-P11 remain accepted. P11 does not authorize P12. ADR-001 remains binding: Godot is the target runtime and Next.js `/play` remains the working rollback/demo shell until a Godot visual replacement is directly accepted.

## Current Aurelian evidence

- Phase 0 topology/composition board: `PASS`.
- Shared topology authority: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`.
- PR #426 first shared-geography technique: `REJECTED / CLOSED WITHOUT MERGE`.
- PR #429 terrain-first Blender → one GLB candidate: `REJECTED / CLOSED WITHOUT MERGE`; its original visual evidence was black.
- PR #432 zero-art render-path calibration: `PASS / CLOSED WITHOUT MERGE`; Godot 4.7.1 Compatibility + Mesa llvmpipe can render main viewport, SubViewport, PNG readback and movie capture.
- PR #435 scene-specific import/composition calibration: `PASS_SCENE_COMPOSITION_ISOLATED / CLOSED WITHOUT MERGE`; #429 black output was isolated to `environment.tonemap_exposure = 0.0`. The exact GLB itself is non-empty and renderable.
- PR #437 exact-GLB product-camera replay at `7d2d8b48bdd401c3f27b078573a315ae86f512ed`: `VISUAL_REPLAY_REJECT / CLOSED WITHOUT MERGE` after direct Village / Map / World / Bridge and movie review.
- #437 exact run: `32032319372`.
- #437 artifact: `9289410431`, digest `sha256:5f1b7658d5ef02622b7d15fd6e20a4500d2488fd38d04e55dca0bb319840b9a4`.
- Pinned source artifact: `9222116061` from #429 head `be801c6aad0ea836210ef85929d8bc95c3152525`.
- Pinned GLB SHA256: `2014fadc94cbc6a53f30c097788036775c878b6e6540d30d108ddb40c8b903e7`.

## Why the exact #429 visual baseline is rejected

The replay fixed the black-output bug and showed the real scene. The result is not a suitable baseline for further patching:

- the river reads as a narrow cut trench with severe banks instead of a natural Basin watercourse;
- the bridge spans the channel but heavy block abutments and weak road joins make it read as a placed prop rather than an integrated crossing;
- Map does not make the required road network legible;
- World reads as a finite terrain board/slab rather than one believable Basin;
- southern outer water reads as an attached cyan slab rather than an integrated coast/outflow;
- Greenvale is a small dense prop cluster while North Ridge, fields/plains, marsh and coast lack a clear spatial/visual hierarchy;
- washed highlights and large dark/shadow regions flatten or obscure terrain readability;
- camera continuity is technically correct, but the shared geography is not visually strong enough to salvage.

These are structural art-direction, terrain and composition failures, not one bounded technical correction. Do not patch this GLB again.

## Active phase

The only active Aurelian work is the art-direction recovery package under `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`.

It must explicitly separate:

1. **Moodboard**: external references used only to establish terrain, river/bridge, palette/lighting and map-readability direction.
2. **Visual target**: one bespoke Aurelian Basin concept showing a consistent Village / Map / World family. This is a design target, not a production asset.
3. **Implementation reference**: a later bounded greybox/prototype proving the chosen visual language can be reproduced in Godot/Blender.
4. **Production asset**: only after the visual target and implementation reference are accepted.

No implementation sprint may skip directly from old #429 assets to production.

## Non-negotiable geography truth

1. one continuous Aurelian Basin terrain;
2. the locked canonical river path with readable natural banks/shoreline;
3. `Bridge_GildedCrossing` with dry west/east approaches, embedded abutments and visibly connected roads;
4. Greenvale west of the river;
5. forest/work edge north-west;
6. North Ridge/highland north-east across the river;
7. fields/plains south / south-east;
8. southern marsh transition and integrated coast/outflow;
9. Village / Map / World must be camera/LOD views of one geography, never separate scenes.

## Tool and cost policy now

- Strategy/control/review: GPT-5.6 Sol.
- Art-direction package: web/reference research plus text design brief; one visual-target generation pass may be authorized by the art-direction brief, but it is not production art.
- Cursor: blocked until a visual target is accepted and a precise implementation contract exists.
- Godot/Blender Aurelian implementation: blocked.
- MAX: OFF.
- Paid tools/assets and Fable: blocked.
- Target extra spend: 0 USD.

## Mandatory PR/release ownership

The user is not responsible for finding failed, drifting or stuck PRs.

For every PR/head change, re-fetch exact head/base, ahead/behind, full diff/scope, mergeability, permissions/dependencies/secrets, checks and required artifacts. Green CI alone is insufficient for visual acceptance.

After every merge verify accepted head → merge SHA → new `main` → checks → deployment → public routes where the environment permits. If public origin cannot be resolved, record `PRODUCTION UNVERIFIED` and the exact missing evidence instead of guessing.

Do not begin another product implementation PR while an active PR/release is unresolved.

## Source-of-truth precedence

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially ADR-001
3. root `AGENTS.md`
4. active issue #415
5. `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
6. accepted current art-direction contract / exact-head evidence
7. operating and QA protocols
8. historical issues, draft PRs and comments

## Allowed work now

- bounded art-direction recovery under `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`;
- reference/moodboard research;
- one non-production Aurelian visual target if authorized by that brief;
- direct visual-target review;
- normal control-plane/release verification.

## Blocked work now

- any new Aurelian Blender/Godot implementation or candidate;
- any patch to the #429 GLB;
- product integration or Phase 2;
- P12 or further gameplay/retention/onboarding work;
- independent web Map/World rebuilding as final product art;
- `app/play/**` visual changes;
- paid tools/assets, MAX or Fable;
- backend/accounts/payments/multiplayer/combat/full economy/crypto;
- merge from green CI alone.

## Session start gate

Before meaningful work:

1. Read this file, `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`, topology authority, ADR-001, root `AGENTS.md`, and #415.
2. Re-fetch live GitHub state.
3. State model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Stop art-direction work when one coherent visual target package receives direct review and is classified `ART_DIRECTION_PASS`, `ART_DIRECTION_CORRECTION_REQUIRED`, or `ART_DIRECTION_REJECT`. Do not code another Aurelian scene before `ART_DIRECTION_PASS`.