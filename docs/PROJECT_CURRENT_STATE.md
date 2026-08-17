# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-17
Current state revision: Capability-First Aurelian Implementation Reference v1.0
Authority source: this file on the current `main`
Authority baseline SHA: `34ca1ef9944007e090b058122e22a3915da02ded`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: One capability-constrained Aurelian Village / Map / World implementation reference
Active execution issue: #415
Active implementation PR: none
Last completed milestone: repo/authority/stall repair through #440 and #441; Aurelian topology and moodboard remain accepted reference inputs
Next allowed action: after the capability-first control-plane contract is merged, execute exactly one desktop-first shared Aurelian Godot/Blender implementation-reference candidate under `docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`, then stop for direct review.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement / city -> nation -> empire`

The full world contains 10,000 lands in a 100 x 100 logical structure. The current demo geography is Sector A-01 / Aurelian Basin.

P4-P11 remain accepted. P11 does not authorize P12. ADR-001 remains binding: Godot is the target runtime and Next.js `/play` remains the working behavioral reference / rollback shell until a Godot replacement is directly accepted.

The first polished playable version does not require a finished 10,000-land live world or final globe renderer. It must first prove the core fantasy with one understandable player arc and visible settlement progression.

## Current Aurelian evidence

- Phase 0 topology/composition: `PASS`.
- Shared topology authority: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`.
- PR #426 shared-geography primitive/KayKit proof: `REJECTED / CLOSED WITHOUT MERGE`; useful for proven Godot/KayKit pipeline only.
- PR #429 Blender -> GLB recovery candidate: `REJECTED / CLOSED WITHOUT MERGE`; deterministic Blender -> GLB -> Godot path was technically proven.
- PR #432 render-path calibration: `PASS / CLOSED WITHOUT MERGE`.
- PR #435 import/composition calibration: `PASS_SCENE_COMPOSITION_ISOLATED / CLOSED WITHOUT MERGE`.
- PR #437 exact product-camera replay: `VISUAL_REPLAY_REJECT / CLOSED WITHOUT MERGE`; do not patch or salvage the #429 GLB.
- PR #438 art-direction reset: merged.
- PR #439 moodboard direction: merged.
- PR #440 authority execution-chain repair: merged.
- PR #441 stale-QA orchestration repair: merged.
- A free-form generated fantasy/dashboard visual produced in chat on 2026-08-17 is `REJECTED AS PRODUCTION DIRECTION`; it is not a repo artifact, not implementation authority and must not be matched.

## Current design decision

The previous requirement for a free-form image-generated Village / Map / World target before any implementation is retired.

Reason: it created a foreground-tool deadlock and encouraged aspirational concept art detached from the actual engine, available zero-cost assets, gameplay semantics and production pipeline.

The new authority is:

`docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`

Implementation feasibility is now part of the visual target.

## Proven technical envelope

- Godot 4.7.1 Standard;
- GDScript;
- GL Compatibility renderer;
- desktop-first 1280 x 720 foundation;
- native desktop and web export from one Godot project;
- deterministic Blender -> GLB -> Godot authoring/import proven;
- deterministic exact-head still/video capture proven;
- zero additional paid-tool spend.

Previously proven KayKit CC0 subset may be reused by pinned provenance: bridge, blacksmith, barracks, church, flag, two trees, two hills and two rocks. KayKit hex terrain pieces remain visually rejected.

## Realistic Aurelian target

The target is a clean stylized low-poly strategy scene that can actually be reproduced with our tools.

### Village

- closest camera over the shared Aurelian scene;
- Greenvale begins as a small 3-5 building cluster with breathing room;
- road to Gilded Crossing is obvious;
- nearby field/work area is visible;
- the same stable scene supports visible claimed -> founded -> developed settlement states;
- no finished cinematic medieval city is required.

### Map

- higher camera over the same geometry;
- terrain/resource zones, river and primary routes must be readable;
- space is reserved for restrained parcel hit areas, scouting and ownership overlays;
- parcel boundaries are interaction overlays, never terrain geometry;
- Map is not a separately drawn SVG/atlas.

### World

For this vertical slice, World is the strategic Aurelian Basin context, not a fake fully rendered 10,000-land planet.

- show the full Basin, outward routes and frontier context;
- preserve Greenvale and Gilded Crossing as recognizable anchors;
- do not spend this milestone on a global 10,000-land renderer;
- later world navigation can operate on a logical sector/land data layer without requiring 10,000 detailed 3D objects.

## Gameplay-first geography

Visual geography must support accepted player decisions rather than exist only for appearance.

- Greenvale: first homeland / settlement origin;
- forest/work edge: timber/work identity;
- fields/plains: food/growth identity;
- Gilded Crossing + EastRoute: first trade story;
- North Ridge / Northgate: frontier / secure / scout story;
- marsh/coast: distinct risk/resource context;
- routes must remain visible at Map scale so expand/scout/trade choices have spatial meaning.

Do not implement full P4-P11/web reducer systems in the first visual reference. Preserve their semantics and leave clear integration surfaces.

## First implementation-reference scope

Exactly one candidate, in this order:

1. continuous terrain silhouette and macro height zones;
2. locked river + marsh/outflow;
3. readable road network;
4. physically credible Gilded Crossing with dry approaches;
5. minimal Greenvale 3-5 building cluster;
6. sparse forest/rocks/hills landmarks;
7. Village / Map / World cameras over the same geometry;
8. three deterministic settlement visual states using a capture/test driver only.

Do not polish props before geography works.

## Tool and cost policy

- Strategy/control/review: GPT-5.6 Sol.
- Implementation executor after this control-plane contract merges: Cursor GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation: blocked as implementation authority. It may only be used later as optional moodboard/reference if explicitly useful.
- Paid assets/tools: blocked unless a specific proven limitation is documented first.
- Fable: blocked for this bounded reference.

## Allowed files/categories for the implementation reference

- `game/scenes/aurelian/**`
- `game/assets/aurelian-basin/**`
- `game/tests/**` for Aurelian transform/state checks
- `game/assets/aurelian-basin/source/**` deterministic Blender source if needed
- one narrowly scoped evidence workflow if existing Godot CI cannot produce the required evidence

## Forbidden work

- matching the rejected fantasy concept image;
- photoreal/cinematic art direction;
- new paid asset families;
- patch/salvage of #429 GLB;
- `app/play/**` visual reauthoring;
- P12 / Phase 2;
- backend/accounts/payments/multiplayer/combat/full economy/crypto;
- final global 10,000-land renderer;
- production prop polish before geography passes;
- merge from green CI alone.

## Evidence / review gate

One exact head must provide:

- Village still;
- Map still;
- World/Aurelian strategic still;
- 15-30 s raw camera-switch video;
- three settlement-state stills or frames;
- transform manifest for river, bridge, roads and landmarks;
- asset/provenance manifest;
- Godot import/tests with no script/import errors.

Direct review classification:

- `IMPLEMENTATION_REFERENCE_PASS`
- `IMPLEMENTATION_REFERENCE_CORRECTION_REQUIRED`
- `IMPLEMENTATION_REFERENCE_REJECT`

One bounded correction maximum before changing technique.

## Mandatory PR/release ownership

The user is not responsible for detecting stuck PRs, failed checks, stale evidence or broken releases.

For every PR/head change, re-fetch exact head/base, ahead/behind, full diff/scope, mergeability, permissions/dependencies/secrets, checks and required evidence. Green CI alone is insufficient for visual acceptance.

After every merge verify accepted head -> merge SHA -> new `main` -> checks -> deployment -> public routes where the environment permits. If public origin cannot be resolved, record `PRODUCTION UNVERIFIED` and the exact missing evidence.

## Source-of-truth precedence

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially ADR-001
3. root `AGENTS.md`
4. active issue #415
5. `docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`
6. `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
7. `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md` for qualitative constraints not superseded by the capability-first contract
8. `docs/AURELIAN_BASIN_MOODBOARD_V1.md`
9. exact-head accepted evidence / operating protocols
10. historical issues, draft PRs and comments

## Session start gate

Before meaningful work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, the capability-first implementation reference, topology authority, ADR-001, root `AGENTS.md`, and #415.
3. Re-fetch live GitHub state.
4. State model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

The control-plane direction change stops when its PR is merged and post-merge authority/CI is healthy. Then immediately begin exactly one capability-first Aurelian implementation-reference candidate. That candidate stops for direct `IMPLEMENTATION_REFERENCE_*` classification before further polish.