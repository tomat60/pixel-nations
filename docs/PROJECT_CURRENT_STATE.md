# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-19
Current state revision: Production Village v1.0
Authority source: this file on the current `main`
Authority baseline SHA: `bb38e6e80b1d757002bdde82266b29df882e9d8a`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: Production Village v1 on the accepted authored Aurelian Basin
Active execution issue: #415
Active implementation PR: none
Last completed milestone: PR #449 `IMPLEMENTATION_REFERENCE_PASS / PRODUCTION_VISUAL_NOT_YET_ACCEPTED`, merged as `bb38e6e80b1d757002bdde82266b29df882e9d8a`
Next allowed action: after this authority update is merged and post-merge checks are healthy, execute exactly one Production Village v1 slice on the accepted authored Aurelian Basin, then stop for direct visual/product review.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement / city -> nation -> empire`

The full world contains 10,000 lands in a 100 x 100 logical structure. The current demo geography is Sector A-01 / Aurelian Basin.

P4-P11 remain accepted. P11 does not authorize P12. ADR-001 remains binding: Godot is the target runtime and Next.js `/play` remains the working behavioral reference / rollback shell until the Godot replacement is directly accepted.

The first polished playable version does not need a finished 10,000-land live world or final globe renderer. It must first prove the core fantasy with one understandable player arc and visible settlement progression.

## Accepted Aurelian foundation

The following are now accepted implementation inputs:

- Phase 0 topology/composition: `PASS`.
- Shared topology authority: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`.
- Art direction: `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`.
- Moodboard direction: `docs/AURELIAN_BASIN_MOODBOARD_V1.md`.
- Capability-first implementation contract: `docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`.
- PR #449 authored Blender terrain + KayKit + GLB + Godot integration reference: `IMPLEMENTATION_REFERENCE_PASS / PRODUCTION_VISUAL_NOT_YET_ACCEPTED`.
- PR #449 accepted head: `eee84c982dd08dc294464793f595a72b1510169b`.
- PR #449 merge / current accepted foundation SHA: `bb38e6e80b1d757002bdde82266b29df882e9d8a`.
- Accepted exact-head Aurelian run: `32285837321`.
- Accepted artifact: `9377623823`.
- Artifact digest: `sha256:554e2d71e9499c737a526e350a05d0492b56a16037258a368d96cee445e49df6`.

The accepted reference proves:

- deterministic Blender 4.3.2 authoring;
- pinned KayKit CC0 source use;
- authored irregular Basin terrain;
- one GLB imported by Godot 4.7.1;
- shared Village / Map / World geometry;
- explicit topology Y -> Godot Z coordinate parity;
- deterministic Village / Map / World / Bridge still capture;
- deterministic 18 second camera sequence;
- terrain coverage guard above 6200 cells;
- exact-head Godot and project tests.

## Rejected / historical visual paths

- PR #426 primitive Godot/KayKit proof: rejected visually.
- PR #429 Blender recovery candidate: rejected visually.
- PR #432 render-path calibration: technical pass only.
- PR #435 import/composition calibration: technical pass only.
- PR #437 replay: rejected visually.
- PR #448 authored-terrain v1 integration: closed without merge after direct review found mirrored north/south camera targeting. Its authored terrain technique was preserved, but the v1 integration contract was rejected.
- Free-form generated fantasy/dashboard visuals from chat are rejected as production direction and are not implementation authority.

Do not reopen these paths unless a new documented blocker proves the accepted #449 foundation cannot support the production slice.

## Current visual truth

PR #449 is an implementation-reference pass, not a final art pass.

Known visible weaknesses are expected to be addressed only where they directly affect Production Village v1:

- Greenvale is still a static small prop cluster, not visible settlement progression;
- the Gilded Crossing bridge is technically present but not yet a strong visual landmark;
- some KayKit hill/rock landmark massing is too dominant and visually crude;
- roads and terrain-zone boundaries still read as implementation-reference geometry rather than polished production terrain;
- lighting/material balance is acceptable for implementation reference but not final production quality.

Do not spend the next sprint polishing the whole Basin. Village first.

## Production Village v1 objective

The next slice must prove that one land visibly becomes a settlement in the accepted shared Aurelian geography.

The player-facing sequence to prove is:

`claimed land -> founded settlement -> developed village`

The slice must preserve Greenvale west of the river and keep Gilded Crossing, fields/work context and the road connection readable from the Village camera.

### Required production behavior

1. One shared authored Aurelian Basin remains the source geography.
2. Greenvale has three deterministic visual states: claimed, founded, developed.
3. State changes must be visible through structure count, footprint, activity/readability and settlement hierarchy, not only labels or color changes.
4. Buildings need breathing room and a believable relation to the road and terrain.
5. Gilded Crossing must read as a real crossing connected to dry-ground approaches.
6. The nearby work/field identity must remain visible enough to explain why this place can grow.
7. Village camera composition must feel like an authored place, not a debug diorama.
8. Map and World must continue to use the same geometry, but do not polish them beyond preventing regressions in this slice.

## Scope for Production Village v1

Allowed:

- `game/assets/aurelian-basin/source/**`
- `game/assets/aurelian-basin/**`
- `game/scenes/aurelian/**`
- `game/tests/**` for Aurelian transforms, state semantics and evidence
- one narrowly scoped Aurelian evidence workflow if the existing workflow cannot prove the required states

Forbidden:

- `app/play/**` visual reauthoring;
- P12 / Phase 2;
- final 10,000-land renderer;
- new backend/accounts/payments/multiplayer/combat/full economy;
- crypto, NFT, wallet, mint, token or pay-to-win direction;
- new paid asset family or paid tool without a documented blocker;
- Fable;
- image generation as implementation authority;
- rebuilding the accepted shared Basin from scratch;
- broad Map/World polish before Village passes.

## Tool and cost policy

- Strategy/control/review: GPT-5.6 Sol.
- Default implementation executor: Cursor GPT-5.5 without MAX only after a precise scoped prompt passes review.
- Deterministic terminal/GitHub changes are preferred for audits, QA, workflow fixes and small safe patches.
- MAX: OFF.
- Extra spend target: 0 USD.
- Cursor is executor, not strategist.

## Production Village evidence gate

One exact candidate head must provide:

- claimed-state Village still;
- founded-state Village still;
- developed-state Village still;
- one bridge/crossing close crop if the Village frame does not prove the crossing clearly;
- Map still and World still from the same geometry for regression comparison;
- 15-30 s raw state/camera sequence or equivalent deterministic evidence;
- transform/state manifest proving the three Village states and stable geography;
- asset/provenance manifest if asset placement changes;
- Godot import/tests with no script/import errors;
- direct visual review.

Classification:

- `PRODUCTION_VILLAGE_PASS`
- `PRODUCTION_VILLAGE_CORRECTION_REQUIRED`
- `PRODUCTION_VILLAGE_REJECT`

One bounded correction maximum. If the same visual technique still cannot produce a convincing Village after that correction, stop coding and create a focused art-direction/design brief before another implementation sprint.

## Acceptance standard

Green CI is necessary but never sufficient.

Production Village v1 passes only if:

- the claimed -> founded -> developed progression is immediately understandable;
- Greenvale looks spatially coherent and believable enough for the demo;
- the road-to-bridge relationship is obvious;
- the bridge reads as integrated crossing infrastructure, not a prop placed over water;
- terrain and landmark hierarchy support the settlement rather than overpower it;
- the result is materially closer to a production game scene than the accepted #449 implementation reference.

User-reported confusion or visual rejection overrides screenshot-only QA.

## Mandatory PR/release ownership

The user is not responsible for detecting stuck PRs, failed checks, stale evidence or broken releases.

For every PR/head change, re-fetch exact head/base, ahead/behind, full diff/scope, mergeability, permissions/dependencies/secrets, checks and required evidence.

After every branch/PR movement or write, immediately inspect what may have gone wrong. A changed head invalidates earlier acceptance evidence until the new exact head is rechecked.

After merge verify accepted head -> merge SHA -> new `main` -> checks -> deployment -> public routes where relevant. If public origin cannot be resolved, record `PRODUCTION UNVERIFIED` and the exact missing evidence.

## Source-of-truth precedence

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially ADR-001
3. root `AGENTS.md`
4. active issue #415
5. `docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`
6. `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
7. `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md` for qualitative constraints not superseded here
8. `docs/AURELIAN_BASIN_MOODBOARD_V1.md`
9. accepted exact-head evidence and operating protocols
10. historical issues, branches and closed PRs

## Session start gate

Before meaningful product work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, ADR-001, root `AGENTS.md`, #415 and the accepted Aurelian reference/topology docs.
3. Re-fetch live GitHub state.
4. State model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

If `pn:status` returns `AUTHORITY_STATUS=FAIL` or `BLOCKED_STALE_PROJECT_STATE`, stop product work and repair authority before implementation.

## Current stop condition

This authority update stops when it is merged and post-merge authority/CI are healthy.

Then immediately begin exactly one Production Village v1 implementation slice. That slice stops for direct `PRODUCTION_VILLAGE_*` classification before any broader Map/World polish or gameplay expansion.
