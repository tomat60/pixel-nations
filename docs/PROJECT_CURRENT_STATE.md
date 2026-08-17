# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-17
Current state revision: Aurelian Exact-GLB Product-Camera Render Replay Gate v1.0
Authority source: this file on the current `main`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: Exact #429 GLB product-camera render replay
Active execution issue: #415
Active implementation PR: none
Last completed milestone: PR #435 scene-specific import/composition calibration, `PASS_SCENE_COMPOSITION_ISOLATED / CLOSED WITHOUT MERGE`
Next allowed action: Execute exactly one bounded product-camera render replay under `docs/AURELIAN_PHASE1_RENDER_REPLAY_CONTRACT_V1.md`, then stop for exact-head direct visual review. This does not authorize a new Aurelian candidate or product integration.

## Purpose

This file is the first and highest-priority source of current project state for every assistant, agent, automation, and new session. Keep it short, current, and operational.

## Current product truth

Pixel Nations is a strategy game built around:

`one land → settlement / city → nation → empire`

The full world contains 10,000 lands in a 100 × 100 structure. The current playable/demo area is Sector A-01 / Aurelian Basin.

The accepted web product preserves the founder progression through Founder Record and one previous read-only history. P4-P11 are accepted and merged. P11 does not authorize P12.

ADR-001 remains binding: Godot is the target game runtime. Next.js `/play` remains the functioning demo shell and rollback surface until replacement evidence is accepted.

## Current Aurelian acceptance status

- Phase 0 topology/composition board: `PASS` after direct review.
- Shared topology authority: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`.
- PR #426 first shared-geography technique: `REJECTED / CLOSED WITHOUT MERGE`.
- PR #429 terrain-first Blender to one GLB recovery candidate at `be801c6aad0ea836210ef85929d8bc95c3152525`: `REJECTED / CLOSED WITHOUT MERGE` because all four captured stills and its 18 second movie were black. Its deterministic authoring/export/import/topology evidence remains rough technical reference only.
- PR #432 zero-art render-path calibration at `3d9845747db151e45a9dac32d9e8b7ef34b6d5a5`: `PASS / CLOSED WITHOUT MERGE`. Godot 4.7.1 Compatibility on Mesa llvmpipe can render main viewport, SubViewport, PNG readback and movie capture.
- PR #435 scene import/composition calibration at `34c05e857b7c7e36e796025e6d104eaf98d96ba7`: `PASS_SCENE_COMPOSITION_ISOLATED / CLOSED WITHOUT MERGE` after direct still, movie, inventory, camera, hash and provenance review.
- #435 exact run: `32030900002`.
- #435 exact artifact: `9288859851`, digest `sha256:8bd3e7120d9a926d7e5171959392c825c60c8432dfd16d5abf19cf41759939f5`.
- Pinned #429 source artifact: `9222116061`, digest `sha256:d810b371584d1da404b1c34e64270c5d38158c74a7d775560b16fa2228cb6990`.
- Pinned #429 GLB SHA256: `2014fadc94cbc6a53f30c097788036775c878b6e6540d30d108ddb40c8b903e7`.
- #435 inventory proves 62 meshes, 67 surfaces and finite global AABB. The exact GLB is visible with original materials in deterministic perspective framing, in the main viewport, in a dedicated 1440×900 SubViewport, in its actively consumed TextureRect path, and in orthographic comparison.
- Exact black-output cause isolated: #429 `game/scenes/aurelian/aurelian_phase1_recovery.gd` explicitly set `environment.tonemap_exposure = 0.0`. Its rejected artifact stills are literal all-zero RGB frames. The same exact GLB renders visibly in #435 with normal exposure. Therefore the previous black evidence is not evidence that the GLB itself is empty or unrenderable.
- This diagnostic PASS does NOT visually accept #429 composition, art quality, bridge, roads, terrain, Village, Map or World.
- Shared Aurelian geography implementation remains `BLOCKED` pending truthful product-camera replay and direct review. Phase 2 remains blocked.
- Current Village web shell remains `MECHANICALLY ACCEPTED BENCHMARK`; preserve its nine-stage progression and rollback value.
- Current independent web bridge / Village / Map / World geography remains `VISUALLY REJECTED FOR FINAL DIRECTION`.

## Active phase

The only active task is one exact-GLB product-camera render replay under `docs/AURELIAN_PHASE1_RENDER_REPLAY_CONTRACT_V1.md`.

The replay must use the exact pinned #429 GLB without Blender regeneration or GLB edits and must reproduce the intended #429 Village / Map / World / Bridge camera contract with normal exposure. Its purpose is to reveal the first truthful product-camera images of that existing scene before spending on another art implementation.

If the replay is visually rejected, do not patch the scene repeatedly. Stop and authorize a fresh art-direction/recovery contract. If it is materially salvageable, authorize a separate bounded salvage contract. The replay itself never integrates product code.

## Required shared geography truth

1. one continuous Aurelian Basin terrain;
2. the locked canonical river path and readable banks/shoreline;
3. `Bridge_GildedCrossing` with dry-ground west/east landings and connected roads;
4. Greenvale west of the river;
5. forest/work edge north-west of Greenvale;
6. North Ridge/highland north-east across the river;
7. fields/plains south / south-east of Greenvale;
8. southern marsh transition and coast/outer-water outflow;
9. `Camera_Village`, `Camera_Map`, and `Camera_World` cut from the same scene and transforms.

## Tool / cost policy now

- Strategy, review and control plane: GPT-5.6 Sol.
- Replay executor: deterministic GitHub Actions + Godot 4.7.1 Compatibility.
- Cursor: blocked for this replay unless fresh authority later requires it.
- Blender / KayKit regeneration: blocked.
- MAX: OFF.
- Paid assets/tools, Fable and image generation: blocked.
- Target extra spend: 0 USD.

## Mandatory PR and release ownership

The user is not responsible for finding failed, drifting, or stuck PRs.

For every PR open/head change, control-plane must re-fetch the live SHA, inspect authority and scope, full diff, base drift, mergeability, checks, failed logs and required artifacts, then assign `PENDING / BLOCKED / REJECTED / READY`.

A green status alone is insufficient. Required screenshots, JSON, manifests and videos must be opened and reviewed directly on the exact head.

After every merge, verify accepted head → merge SHA → new `main` → checks → deployment → real public routes as applicable. Localhost or preview is not post-release proof. If public origin cannot be fully tested, record `PRODUCTION UNVERIFIED` and the exact missing evidence.

Do not begin another product PR or merge while the current PR/release is failing, unreviewed or unresolved. Escalate to the user only for a genuine product-direction or subjective visual acceptance choice, not routine QA detection.

## Source-of-truth precedence

When sources conflict:

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially `docs/ADR_001_GODOT_DESKTOP_FIRST.md`
3. root `AGENTS.md`
4. active issue named here
5. `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
6. exact-head evidence and accepted PR for the current milestone
7. operating and QA protocols
8. older issues, draft PRs, comments and historical documents

## Allowed work now

- exactly one product-camera render replay under `docs/AURELIAN_PHASE1_RENDER_REPLAY_CONTRACT_V1.md`;
- exact-head direct review of Village / Map / World / Bridge stills, movie, manifests, hashes, logs and QA JSON;
- release verification for accepted control-plane merges.

## Blocked work now

- any new Blender or Aurelian art candidate;
- edits to the pinned #429 GLB;
- P12 or further gameplay/retention/onboarding mechanics;
- product integration or Phase 2;
- independent React/CSS/SVG Map or World rebuilding as final product art;
- `app/play/**` visual changes;
- paid tooling/assets, MAX, Fable or image generation;
- backend, accounts, payments, multiplayer, combat, full economy or crypto;
- merge from green CI alone.

## Session start gate

Before meaningful work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, the replay contract, `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`, ADR-001, root `AGENTS.md`, and #415.
3. Re-fetch live GitHub state; never trust cached PR SHA or check status.
4. State model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Stop the replay after one exact-head artifact receives direct review and one classification under its contract. No new Aurelian candidate, integration, P12, Phase 2, paid tooling, MAX or image generation is authorized by the replay itself.