# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-21
Current state revision: Production Map v1 accepted, Production World v1 authorized by view-role contract
Authority source: this file on the current `main`
Authority baseline SHA before this update: `4c4054b9c475255cb88c9cf4bcdd887f12cfedf5`
Product baseline SHA: `4c4054b9c475255cb88c9cf4bcdd887f12cfedf5`
Current milestone: lock Village / Map / World decision roles, then execute one bounded Production World v1 slice
Active execution issue: #415
Active implementation PR: authority/view-role update only until merged
Last completed milestone: PR #454 `PRODUCTION_MAP_PASS`, accepted head `2966295b92ff97692e9594f28dfa86538f2da042`, merged as `4c4054b9c475255cb88c9cf4bcdd887f12cfedf5`
Next allowed action: after this authority update merges and post-merge checks are healthy, execute exactly one bounded Production World v1 slice under `docs/AURELIAN_VIEW_ROLES_V1.md`, then stop for direct evidence review.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement / city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current demo geography is Sector A-01 / Aurelian Basin.

P4-P11 remain accepted. P11 does not authorize P12. ADR-001 remains binding: Godot is the target runtime. Next.js `/play` remains the behavioral reference / rollback shell until the Godot replacement is directly accepted for the relevant surface.

The demo does not need a fake finished 10,000-land world. It must prove the fantasy through a coherent chain of local growth, territorial expansion and strategic direction.

## Core view-role decision

Village, Map and World are not three cosmetic zoom levels.

They are three decision layers over one persistent geography:

- Village = `HOW`: make one place live and grow.
- Map = `WHERE`: choose, scout, claim and connect nearby land.
- World = `WHY / WHICH DIRECTION`: choose the larger strategic direction of the nation / empire.

The binding role and interaction contract is `docs/AURELIAN_VIEW_ROLES_V1.md`.

The same physical Aurelian Basin remains shared across all three. Camera, LOD, overlays, marker density and available interactions may change. River, bridge, Greenvale origin, roads, landmarks, topology orientation and physical geography may not.

## Accepted Aurelian foundation

Accepted implementation inputs:

- shared topology: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`;
- art direction: `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`;
- moodboard direction: `docs/AURELIAN_BASIN_MOODBOARD_V1.md`;
- capability-first implementation contract: `docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`;
- Production Map v1 contract: `docs/AURELIAN_PRODUCTION_MAP_V1_CONTRACT.md`;
- Village / Map / World role contract: `docs/AURELIAN_VIEW_ROLES_V1.md`;
- PR #449 authored Blender terrain + KayKit + GLB + Godot integration reference: `IMPLEMENTATION_REFERENCE_PASS / PRODUCTION_VISUAL_NOT_YET_ACCEPTED`;
- PR #451: `PRODUCTION_VILLAGE_PASS`;
- PR #454: `PRODUCTION_MAP_PASS`.

The accepted shared-world pipeline proves:

- deterministic Blender 4.3.2 authoring;
- pinned KayKit CC0 assets;
- authored irregular Aurelian terrain;
- one GLB imported by Godot 4.7.1;
- shared Village / Map / World geography;
- explicit topology-to-Godot coordinate parity;
- deterministic still / video evidence;
- exact-head Godot and project tests.

Do not rebuild this foundation for a view-specific interaction change.

## Accepted Production Village v1

PR #451 accepted result:

`claimed land -> founded settlement -> developed village`

Evidence identity:

- accepted head: `572a43313c4795574e4e93544e1e44d1c8f30610`;
- focused run: `32296769557`;
- artifact: `9381563241`;
- artifact digest: `sha256:5c693872753d62681c8fc3bedb67fb2a2dfc88099ad08699bd83c83cb738562c`;
- merge: `2d6b2fbc2c42042f8c83faaf7c8e4f55ee689a29`;
- final classification: `PRODUCTION_VILLAGE_PASS`.

Village role now means local settlement growth, structure hierarchy, work / field relationships, local roads and the tangible consequences of development.

Known future visual polish remains for materials, terrain transitions, road integration and bridge refinement. Do not reopen Village v1 as a broad polish project while World role proof is active.

## Accepted Production Map v1

PR #454 accepted result:

- claimable land distinction;
- selected land distinction;
- claimed land distinction;
- scouted land distinction;
- terrain-first presentation;
- accepted Village and World geography preserved.

Evidence identity:

- accepted head: `2966295b92ff97692e9594f28dfa86538f2da042`;
- focused run: `32347229891`;
- artifact: `9398507284`;
- artifact digest: `sha256:ea95dbca206b6e7fabf6cbe27844a2c058a057fd4b551760dfbc60b0e12c20e6`;
- merge: `4c4054b9c475255cb88c9cf4bcdd887f12cfedf5`;
- final classification: `PRODUCTION_MAP_PASS`.

Map role now means nearby territorial choice: select, scout, claim, inspect and connect land around the current settlement. It must remain terrain-first and may not become a dense permanent grid or a second Village builder.

## Next bounded milestone: Production World v1

The next slice must prove that World has a unique strategic job and is not merely a farther Map camera.

Player question:

`Where should my nation push next, and what larger opportunity or pressure should I respond to?`

Production World v1 must prove only:

1. Aurelian Basin reads as the player's current strategic home region.
2. Three sparse strategic directions are legible around it, representing distinct high-level intents such as trade, expansion and pressure / unknown frontier.
3. Selecting one direction communicates strategic intent without changing the underlying shared geography.
4. Returning to Map and Village makes the layer relationship understandable:
   `World WHY -> Map WHERE -> Village HOW`.

Do not imply that the full 10,000-land world is already rendered.

### Allowed World v1 scope

- `game/scenes/aurelian/**`;
- `game/tests/**` for World semantics, shared transforms and evidence;
- one focused Production World evidence workflow if needed;
- minimal manifests required to prove marker meaning and shared geography.

### Forbidden in World v1

- P12 / Phase 2 gameplay expansion;
- new diplomacy engine;
- combat / war simulation;
- economy rewrite;
- backend, accounts, payments or multiplayer;
- crypto / NFT / wallet / mint / token / pay-to-win direction;
- final 10,000-land renderer;
- independent World geography;
- broad Village or Map polish;
- new paid asset family;
- image generation as implementation authority;
- MAX.

### Required World v1 evidence

- neutral World still;
- selected-strategic-direction still;
- still showing all three strategic direction types distinctly but sparsely;
- accepted Village regression still;
- accepted Map regression still;
- 15-30 second raw sequence: neutral World -> select direction -> return to Map / Village framing;
- exact-head manifest / tests proving shared geography and marker semantics;
- direct visual and product review.

Classification:

- `PRODUCTION_WORLD_PASS`;
- `PRODUCTION_WORLD_CORRECTION_REQUIRED`;
- `PRODUCTION_WORLD_REJECT`.

One bounded correction maximum.

## Product interaction hierarchy

The views must feed each other:

1. World creates a strategic reason to expand.
2. Map chooses the nearby land that executes that direction.
3. Village converts land / resources / routes into settlement growth.
4. Village growth unlocks new Map and World options later.

This feedback loop is more important than additional decoration on any single view.

## Visual information hierarchy

Closer view = more physical detail and fewer abstract symbols.

Farther view = less physical detail and more strategic abstraction.

Therefore:

- Village: buildings > terrain landmarks > local overlays.
- Map: terrain / routes > land states > buildings.
- World: strategic directions / routes / objectives > local land states > individual buildings.

Markers must remain subordinate to the physical world.

## Rejected / historical visual paths

Do not reopen without a new documented blocker:

- #426 primitive Godot/KayKit proof: rejected;
- #429 Blender recovery candidate: rejected;
- #437 replay: rejected;
- #447 procedural capability reference: rejected visually;
- #448 authored-terrain v1 integration: rejected after mirrored coordinate targeting;
- independent React / SVG / CSS Village / Map / World geography: rejected;
- free-form generated fantasy/dashboard visuals as production authority: rejected.

## Process acceleration rules

1. One active product / recovery PR at a time.
2. Do not rebuild shared terrain for view-specific UI / interaction changes.
3. One milestone changes one decision layer. The other two are regression evidence.
4. Use focused Godot workflows for visual iteration instead of the full web QA loop.
5. Green CI is necessary but never visual acceptance.
6. Directly review artifacts immediately after the focused run succeeds.
7. One meaningful candidate, one bounded correction, then PASS or REJECT.
8. Infra failures before product tests get the smallest-job recovery, not a new product commit.
9. Do not restart successful exact-head checks merely because PR metadata changed if protection does not require it.
10. Public web verification is tracked separately when a Godot-only slice does not modify the public web shell.
11. User-reported confusion / rejection overrides screenshot-only QA.

## Release state

The previous environment could not resolve the public production origin directly, so some earlier comments recorded `PRODUCTION UNVERIFIED`. This is a capability boundary, not evidence of an outage.

For PR #454 exact head, all repo-side checks including Production Map V1, Pixel Nations CI, Play Visual QA, Godot Foundation, RC1 and P4-P11 were successful before merge. Vercel status for merge SHA `4c4054b9c475255cb88c9cf4bcdd887f12cfedf5` is `success`.

Do not block a Godot-only visual milestone indefinitely on unavailable external HTTP evidence when it does not modify the public web shell. Keep the missing public-origin evidence explicit and separate.

## Tool and cost policy

- Strategy / control / direct review: GPT-5.6 Sol.
- Deterministic GitHub / Godot / Blender path first.
- Cursor only when it materially speeds a scoped implementation task.
- Default Cursor model if used: GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- No new paid tool or asset family without a named blocker and explicit value case.

## Mandatory PR / release ownership

The user is not responsible for detecting stuck PRs, failed checks, stale evidence or broken releases.

For every PR / head change:

- fetch exact head / base;
- verify ahead / behind;
- verify changed-file scope;
- verify mergeability;
- inspect exact-head workflows;
- inspect required artifacts directly;
- classify `PENDING / BLOCKED / REJECTED / READY`.

After every write or branch / PR movement, refetch immediately.

After merge, verify accepted head -> merge SHA -> new `main` -> repo checks -> deployment status where relevant.

## Source-of-truth precedence

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially ADR-001
3. root `AGENTS.md`
4. active issue #415
5. `docs/AURELIAN_VIEW_ROLES_V1.md`
6. `docs/AURELIAN_PRODUCTION_MAP_V1_CONTRACT.md`
7. `docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`
8. `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
9. `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`
10. `docs/AURELIAN_BASIN_MOODBOARD_V1.md`
11. accepted exact-head evidence and operating protocols
12. historical issues, branches and closed PRs

## Session start gate

Before meaningful product work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, ADR-001, root `AGENTS.md`, #415 and `docs/AURELIAN_VIEW_ROLES_V1.md`.
3. Re-fetch live GitHub state.
4. State model / tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

If `pn:status` returns `AUTHORITY_STATUS=FAIL` or `BLOCKED_STALE_PROJECT_STATE`, stop product work and repair authority first.

## Current stop condition

This authority update stops when it is merged and post-merge state is healthy.

Then execute exactly one bounded Production World v1 slice. Stop for direct `PRODUCTION_WORLD_*` classification before P12, broader Village / Map polish or any fake full-world renderer.
