# Aurelian Production Map v1 Contract

Status: ACCEPTED FOR ONE BOUNDED IMPLEMENTATION SLICE AFTER MERGE
Date: 2026-08-20
Issue: #415
Product baseline: `2d6b2fbc2c42042f8c83faaf7c8e4f55ee689a29`
Authority baseline: `967d03edf640bc2ea8c7d150f0342d49614b6cdc`
Depends on: accepted Production Village v1 and the accepted shared Aurelian geography

## Decision

The next milestone is Production Map v1.

Production Map v1 must expose existing land selection, claim and scout meaning on the accepted shared Aurelian Basin. It may add only restrained interaction and state presentation over the same Godot scene. It may not redraw the Map, invent a separate geography, add new gameplay, or broaden into World polish.

This milestone advances the accepted loop:

`one land -> settlement / city -> nation -> empire`

by making the land choice and its relationship to Greenvale, routes, terrain and the Gilded Crossing understandable before broader progression.

## Player outcome

From the Map camera, a player can:

1. identify Greenvale and its claimed land;
2. distinguish a selected candidate land from unselected land;
3. understand whether a visible land is claimable, claimed or scouted using existing accepted semantics;
4. understand the main routes from Greenvale through the Gilded Crossing;
5. return to the Village view without losing the shared-geography read.

No new economy, resource model, reducer action or persistence schema is authorized.

## Shared-geography invariants

The implementation must reuse the accepted Aurelian scene and transforms from PR #449 and PR #451.

The following may not move, mirror or be redrawn:

- river centerline and outflow;
- Gilded Crossing and both approaches;
- Greenvale origin;
- North Ridge;
- ForestWorkEdge;
- FieldsPlains;
- SouthMarsh;
- CoastOutflow;
- Northgate;
- primary road relationships.

Village, Map and World remain cameras and presentation layers over one geography. Map interaction overlays must be subordinate to terrain.

## Allowed implementation

- `game/scenes/aurelian/**`
- `game/tests/**` for existing selection, claim, scout, persistence and transform contracts
- `game/assets/aurelian-basin/**` only for minimal non-destructive overlay support
- one focused evidence workflow if existing workflows cannot prove the slice
- deterministic manifests required for state, transforms and evidence

Allowed behavior is limited to wiring existing accepted state semantics into the shared Godot Map presentation. A small adapter may be added only when required to consume existing state without changing its meaning.

## Forbidden

- `app/play/**` visual rebuilding
- a new Map terrain, SVG, CSS or raster geography
- moving or replacing accepted Aurelian landmarks
- broad terrain, lighting, material, bridge or Village polish
- World strategic implementation or polish
- P12, Phase 2 product expansion beyond this bounded Map slice
- new reducer actions, persistence schema, economy, combat, backend, accounts, payments, multiplayer or crypto
- new dependency or asset family without a documented blocker
- paid assets or tools
- MAX
- Fable
- image generation as implementation authority
- more than one bounded visual correction on this technique

## Required evidence from one exact head

- 1440 x 900 Map still with no selection
- 1440 x 900 Map still with one candidate land selected
- 1440 x 900 Map still showing accepted claimed and scouted distinctions
- 1440 x 900 Village regression still
- 1440 x 900 World regression still
- 15 to 30 second raw sequence covering Map selection, state distinction, Village return and World regression
- state manifest mapping every visible overlay to an existing accepted semantic
- transform manifest proving unchanged shared geography
- Godot import and existing foundation tests
- focused Production Map v1 contract test
- no script, import or renderer errors
- direct still and video review

## Acceptance

`PRODUCTION_MAP_PASS` requires all of the following:

1. Map reads as terrain first within two seconds.
2. Greenvale, river, crossing and primary routes remain easy to locate.
3. Selected, claimable, claimed and scouted states are distinguishable without turning terrain into a board or dashboard.
4. Boundaries and markers remain restrained and do not obscure roads, river, bridge or biome read.
5. Interaction uses existing accepted semantics and persistence behavior.
6. Village and World still show the same geography without regression.
7. Desktop and Web evidence are stable; portrait framing is checked if the shared runtime exposes it in this slice.
8. The result adds no new gameplay or independent Map art.

## Classification and correction limit

- `PRODUCTION_MAP_PASS`
- `PRODUCTION_MAP_CORRECTION_REQUIRED`
- `PRODUCTION_MAP_REJECT`
- `BLOCKED` only for a concrete technical or capability dependency

One bounded correction maximum after the first visually valid candidate. Correctness or infrastructure repairs that only make the declared candidate execute do not consume the visual correction.

If the corrected technique still fails, close it without merge and select a different presentation technique through a fresh contract. Do not micro-polish indefinitely.

## Execution and cost

Default executor: Cursor GPT-5.5 without MAX only after this contract and the corresponding current-state authority are merged.

Strategy, exact-head gate, artifact review and merge acceptance remain with the Production Steward.

Extra spend target: 0 USD.

## Stop condition

Stop after one exact-head evidence package is directly reviewed and classified.

Do not begin Production World, P12, broader Village polish or new mechanics before `PRODUCTION_MAP_PASS` is accepted and recorded through the normal authority PR flow.
