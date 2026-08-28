# Godot Aurelian First Imperial Expansion v1 Contract

Status: PROPOSED
Issue: #538
Authority prerequisite: `GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_PASS`
Runtime: Godot 4.7.1, GDScript, Compatibility renderer
Cost mode: deterministic tooling first, MAX OFF, extra spend 0 USD

## Product decision

The accepted first-run arc proves how one land becomes an empire and resolves its first frontier consequence. The next bounded milestone must make the finite 10,000-land world premise playable.

First Imperial Expansion v1 adds exactly one second-land claim at the existing North Ridge locus. It does not add new terrain, a repeatable expansion system or gameplay on the second land.

## Required outcome

`completed frontier legacy -> World identifies North Ridge as the adjacent expansion direction -> Map inspects the existing North Ridge land -> explicit Claim North Ridge -> Map shows Greenvale homeland plus North Ridge claimed -> Village keeps Greenvale as imperial capital administering two lands -> World records the first two-land imperial footprint`

## State contract

Required canonical values:

- `first_frontier_payoff`: `secure_gilded_crossing` or `ratify_east_bridge_passage`;
- `imperial_expansion_target`: empty before reveal, then `north_ridge`;
- `claimed_lands`: `[east_route]` before claim, then exactly `[east_route, north_ridge]`;
- `first_imperial_expansion`: empty before claim, then `north_ridge_claimed`;
- event: `AURELIAN_FIRST_IMPERIAL_EXPANSION=NORTH_RIDGE`.

The candidate must reject:

- North Ridge reveal before a secured First Frontier Payoff;
- a claim without explicit normal input;
- a duplicate North Ridge claim event;
- any third land;
- any state that drops the accepted East Route claim;
- any expansion state that changes the persisted national direction, River Surge response, rival response or frontier payoff.

## View-role contract

### World = WHY / WHICH DIRECTION

Before expansion:

- explain that the completed frontier legacy opens North Ridge as the first adjacent expansion direction;
- do not present a general land picker or multiple candidates.

After expansion:

- record a first two-land imperial footprint;
- preserve Trade, Expand or Frontier identity and the accepted frontier legacy.

### Map = WHERE

Before claim:

- keep East Route visibly owned;
- reveal exactly one eligible adjacent land at the existing North Ridge locus;
- allow normal-input inspection;
- expose the explicit `Claim North Ridge` action.

After claim:

- show East Route and North Ridge as two distinct owned lands;
- keep river, bridge, Greenvale, Gilded Crossing, routes and landmarks fixed;
- expose no third-land path.

### Village = HOW

After claim:

- keep Greenvale visibly identified as imperial capital;
- communicate that the capital administers two lands;
- do not create a settlement, construction site, workers or production at North Ridge.

## Geography lock

The candidate must reuse the accepted shared Aurelian scene and existing North Ridge locus.

Forbidden geography changes:

- no new GLB or terrain;
- no moved North Ridge, Greenvale, river, East Bridge, Gilded Crossing or route;
- no new camera preset;
- no separately authored Village, Map or World geometry;
- no new landmass outside the current Aurelian Basin proof.

A restrained ownership ring, flag, tint or procedural marker may be added at the existing North Ridge transform if it remains subordinate to the terrain.

## Persistence contract

Session Persistence v2 must save and restore:

- the original East Route claim;
- `imperial_expansion_target=north_ridge`;
- `claimed_lands=[east_route,north_ridge]`;
- `first_imperial_expansion=north_ridge_claimed`;
- the selected national direction;
- empire proclamation;
- River Surge response;
- rival response;
- First Frontier Payoff.

Evidence must prove the two-land state after:

- native restart;
- Web reload;
- browser profile reopen;
- leaving and reopening Map;
- leaving and reopening Village.

No evidence path may seed storage directly.

## Required implementation scope

One candidate may change only what is necessary in:

- the existing Aurelian controller and procedural HUD/cues;
- Session Persistence v2;
- one exact implementation manifest;
- focused contract tests;
- narrowly scoped Playable Entry, Web Playability and Session Persistence evidence.

No new dependency, paid tool or asset is authorized.

## Evidence contract

Exact-head Playable Entry evidence must show:

1. completed frontier legacy with only East Route owned;
2. World identifies North Ridge as the one adjacent direction;
3. Map shows North Ridge available at its existing locus;
4. normal-input inspection;
5. explicit `Claim North Ridge`;
6. Map with East Route and North Ridge owned;
7. Village with Greenvale still the capital administering two lands;
8. World with the first two-land imperial footprint;
9. no third-land interaction;
10. normal-input motion for the complete sequence.

Exact-head Web evidence must prove the same product sequence in the Web export.

Exact-head Session Persistence v2 evidence must prove both original and second claims across native restart, Web reload and profile reopen while preserving the accepted direction, crisis, rival and payoff state.

All artifacts must identify the exact candidate head and include manifests, logs, stills, motion and digests.

## Acceptance gates

The candidate passes only if direct review confirms:

- the second-land claim is a substantial visible change, not a text-only terminal state;
- Greenvale homeland and North Ridge ownership are both readable on Map;
- North Ridge is the same physical locus before and after claim;
- Village, Map and World retain their binding roles;
- one physical Aurelian geography remains intact;
- there is exactly one second-land claim and no third-land path;
- persistence is real and no storage seeding is used;
- all exact-head checks and artifacts are healthy.

Green CI alone is not acceptance. One bounded visual correction maximum is allowed.

## Forbidden scope

- third land or repeatable expansion;
- settlement, city, workers, construction or economy on North Ridge;
- resources, costs, rewards, timers, population or pressure meters;
- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, diplomacy, governance simulation or border conflict;
- backend, accounts, cloud save, multiplayer or public shell;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, camera, asset family or dependency;
- broad visual polish, broad CI work, P12 or MAX.

## Terminal classification

Exactly one result is allowed:

- `GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_PASS`; or
- `GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_REJECT`.

A PASS must be recorded in `docs/PROJECT_CURRENT_STATE.md` before later product work. A REJECT must restore the accepted First Frontier Payoff baseline and record the exact cause.

## Stop condition

Stop after one accepted or rejected candidate. No third land, settlement on North Ridge or repeatable expansion work is authorized by this contract.
