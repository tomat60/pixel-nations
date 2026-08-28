# Godot Aurelian North Ridge Outpost v1 Contract

Status: PROPOSED
Issue: #542
Authority prerequisite: `GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_PASS`
Runtime: Godot 4.7.1, GDScript, Compatibility renderer
Cost mode: deterministic tooling first, MAX OFF, extra spend 0 USD

## Product decision

First Imperial Expansion v1 proves a two-land empire, but North Ridge is currently ownership without use. The next bounded milestone must turn the accepted second land into a visible, deliberate frontier result before any third-land or repeatable expansion work.

North Ridge Outpost v1 adds exactly one fixed outpost at the already claimed North Ridge locus. It does not add a second settlement progression, economy, construction system, units or repeatable building.

## Required outcome

`two-land imperial footprint -> World explains why North Ridge must be held -> Map inspects claimed North Ridge -> Village exposes explicit Establish North Ridge Outpost -> Map shows one established outpost at North Ridge -> Village confirms Greenvale administers the outpost -> World records a held two-land frontier`

## State contract

Required canonical values:

- `claimed_lands`: exactly `[east_route, north_ridge]`;
- `first_imperial_expansion`: `north_ridge_claimed`;
- `north_ridge_outpost`: empty before establishment, then `established`;
- event: `AURELIAN_NORTH_RIDGE_OUTPOST=ESTABLISHED`.

The candidate must reject:

- outpost reveal or establishment before North Ridge is claimed;
- establishment without explicit normal input;
- a duplicate establishment event;
- a second outpost or repeatable establishment;
- any third land;
- any state that drops East Route, North Ridge, national direction, empire proclamation, River Surge response, rival response or frontier payoff.

## View-role contract

### World = WHY / WHICH DIRECTION

Before establishment:

- explain that the new North Ridge claim needs a frontier presence to become held imperial ground;
- do not present another expansion target or generic construction system.

After establishment:

- record a held two-land frontier;
- preserve the selected Trade, Expand or Frontier identity and completed frontier legacy.

### Map = WHERE

Before establishment:

- keep East Route and North Ridge visibly owned;
- expose the claimed North Ridge locus for normal-input inspection;
- visibly distinguish claimed land without an outpost.

After establishment:

- show exactly one restrained outpost cue at the unchanged North Ridge transform;
- keep river, East Bridge, Greenvale, Gilded Crossing, routes and landmarks fixed;
- expose no second-outpost or third-land path.

### Village = HOW

Before establishment:

- keep Greenvale visibly identified as imperial capital;
- expose one explicit `Establish North Ridge Outpost` action after North Ridge inspection.

After establishment:

- confirm that Greenvale administers the outpost and both claimed lands;
- do not create workers, population, production, a build queue or a second settlement progression.

## Geography lock

The candidate must reuse the accepted shared Aurelian scene and existing North Ridge locus.

Forbidden geography changes:

- no new GLB or terrain;
- no moved North Ridge, Greenvale, river, East Bridge, Gilded Crossing or route;
- no new camera preset;
- no separately authored Village, Map or World geometry;
- no new landmass outside the current Aurelian Basin proof.

The outpost may use restrained procedural geometry and existing materials only. It must remain subordinate to the terrain while reading clearly before and after establishment.

## Persistence contract

Session Persistence v2 must save and restore:

- exactly the East Route and North Ridge claims;
- `first_imperial_expansion=north_ridge_claimed`;
- `north_ridge_outpost=established`;
- the selected national direction;
- empire proclamation;
- River Surge response;
- rival response;
- First Frontier Payoff.

Evidence must prove the established outpost after:

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

1. two-land imperial footprint with North Ridge claimed and no outpost;
2. World explains why North Ridge must be held;
3. Map inspects the claimed North Ridge locus;
4. Village exposes explicit `Establish North Ridge Outpost`;
5. normal-input establishment;
6. Map shows one established outpost at the unchanged North Ridge locus;
7. Village confirms Greenvale administers the outpost and both lands;
8. World records a held two-land frontier;
9. no second-outpost, second-settlement or third-land interaction;
10. normal-input motion for the complete sequence.

Exact-head Web evidence must prove the same product sequence in the Web export.

Exact-head Session Persistence v2 evidence must prove the outpost and exactly two claimed lands across native restart, Web reload and profile reopen while preserving accepted direction, crisis, rival, payoff and expansion state.

All artifacts must identify the exact candidate head and include manifests, logs, stills, motion and digests.

## Acceptance gates

The candidate passes only if direct review confirms:

- the outpost is a substantial visible transformation at North Ridge, not a text-only terminal state;
- claimed-without-outpost and established-outpost states are clearly distinct;
- Greenvale remains the capital and both accepted lands remain owned;
- North Ridge is the same physical locus before and after establishment;
- Village, Map and World retain their binding roles;
- one physical Aurelian geography remains intact;
- there is exactly one outpost event and no repeatable or third-land path;
- persistence is real and no storage seeding is used;
- all exact-head checks and artifacts are healthy.

Green CI alone is not acceptance. One bounded visual correction maximum is allowed.

## Forbidden scope

- third land, land picker or repeatable expansion;
- second settlement progression, city, population, workers or build queue;
- resources, costs, rewards, timers, production or economy;
- multiple outposts or repeatable construction;
- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, diplomacy, governance simulation or border conflict;
- backend, accounts, cloud save, multiplayer or public shell;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, camera, asset family or dependency;
- broad visual polish, broad CI work, P12 or MAX.

## Terminal classification

Exactly one result is allowed:

- `GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_PASS`; or
- `GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_REJECT`.

A PASS must be recorded in `docs/PROJECT_CURRENT_STATE.md` before later product work. A REJECT must restore the accepted First Imperial Expansion baseline and record the exact cause.

## Stop condition

Stop after one accepted or rejected candidate. No second settlement progression, multiple outpost, third land or repeatable expansion work is authorized by this contract.
