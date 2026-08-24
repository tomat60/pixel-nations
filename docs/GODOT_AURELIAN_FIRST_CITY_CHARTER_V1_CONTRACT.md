# Godot Aurelian First City Charter v1 Contract

Status: PROPOSED
Authority issue: #498
Authority baseline SHA: `026183e364f7b411a294e11ec2f35bde78898fa0`
Product baseline SHA: `c6b6133d5271aee73ae2252af7492886a005b19b`
Cost target: 0 USD
MAX: OFF

## Outcome

Authorize exactly one bounded player progression:

`World first trade underway -> Map East Route in use -> Village developed -> explicit Charter Greenvale -> Village first city -> Map city marker -> World first city recognized`

This advances the accepted product truth from settlement to city. It does not authorize economy, population simulation, nation, empire or another land.

## Player action and event

The action label is exactly:

`Charter Greenvale`

The event is exactly:

`AURELIAN_FIRST_CITY_CHARTER=GREENVALE`

The event may be emitted only by the explicit player action. Restoring, reopening or navigating to Greenvale must not emit it.

## Required states

- pre-action World: `world_first_trade_underway`;
- pre-action Map: `map_east_route_in_use`;
- pre-action Village: developed with caravan dispatch acknowledged;
- post-action Village: `village_city_chartered`;
- post-action Map: `map_greenvale_city`;
- post-action World: `world_first_city_recognized`.

Leaving and reopening Village must preserve the city state. Map must retain the connected East Route and its in-use caravan state.

## View roles and geography

- Village = HOW: explicit charter and visible city transformation.
- Map = WHERE: one subordinate city marker at the existing Greenvale origin.
- World = WHY: Greenvale is recognized as Aurelian's first city.

The river, Gilded Crossing, Greenvale origin, route anchors, cameras and all shared topology remain unchanged.

## Visible city boundary

- the accepted 13-node developed Village remains the baseline;
- chartered Village must be a compact civic-core superset;
- reuse repository-pinned KayKit assets and existing procedural presentation only;
- the developed-to-city change must be understandable without reading the HUD;
- Map adds exactly one subordinate city marker at Greenvale;
- World changes only the accepted Greenvale and eastern Trade consequence;
- no new GLB, terrain, asset family, geography or orientation-specific layout.

One bounded visual correction maximum is allowed after the first meaningful artifact.

## Persistence

Reuse Session Persistence v2 and its existing namespace.

Extend only:

- legal chartered states;
- one `city_chartered` boolean needed for restoration.

Keep schema version 2 unless an exact deterministic compatibility failure proves an increment necessary. Do not create a parallel persistence helper, new namespace or cloud save.

Required restoration:

- native restart;
- same-origin Web reload;
- persistent-profile browser reopen;
- denied-storage fallback to `world_neutral:none`.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Playable Entry, Web Playability and Session Persistence v2 workflows where necessary;
- one small focused evidence adjustment only if existing workflows cannot prove the outcome;
- documentation and evidence manifests.

## Forbidden

- prices, resources, costs, rewards, inventory, taxes or economy;
- population simulation, workers, timers, queues or repeated actions;
- nation or empire progression;
- another land or multiple-land expansion;
- new terrain, GLB, asset family or geography;
- broad Village, Map or World polish;
- changing East Route or shared topology;
- `app/play/**` or public shell changes;
- backend, accounts, multiplayer, combat, diplomacy or crypto;
- P12, MAX, paid tools or image generation authority.

## Deterministic validation

The exact implementation head must prove:

- explicit action transition;
- explicit-only event emission;
- no event on restore or navigation;
- developed baseline retained;
- chartered civic-core superset;
- one Greenvale city marker;
- shared topology unchanged;
- Session Persistence v2 compatibility;
- normal-input cross-view path;
- native, Web reload and persistent-profile restoration;
- denied-storage fallback;
- exact-head artifact identity and digests.

## Direct review

Green CI alone is not acceptance.

Directly inspect exact-head stills and normal-input video for:

- developed Village before charter;
- explicit charter action;
- chartered Village after action;
- Map Greenvale city marker;
- World first city recognition;
- Map and Village reopen states;
- immediate developed-to-city readability;
- unchanged shared geography.

## Failure recovery

- Infrastructure failure before product validation: rerun only the smallest failed job.
- Deterministic failure: inspect the exact log and fix the root cause on the same PR.
- No blind retry.
- One bounded visual correction maximum, then PASS or REJECT.

## Terminal classification

- `GODOT_AURELIAN_FIRST_CITY_CHARTER_PASS`, or
- `GODOT_AURELIAN_FIRST_CITY_CHARTER_REJECT`.

## Stop condition

Stop after direct exact-head PASS or REJECT. Do not proceed to economy, nation, empire or another land without a later explicit contract.
