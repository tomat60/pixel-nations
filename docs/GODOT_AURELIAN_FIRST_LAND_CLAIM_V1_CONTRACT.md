# Godot Aurelian First Land Claim v1 Contract

Status: PROPOSED
Date: 2026-08-21
Authority baseline SHA: `db606951f10a2b0c8b1ddff0212a8b8bdd951093`
Active issue: #415

## Decision

Authorize exactly one bounded candidate that turns the accepted Aurelian decision loop into its first explicit land claim:

`World Trade -> Map East Route selected -> claim East Route -> Map East Route claimed -> Village claimed`

This is the smallest missing product truth after playable entry and persistence. The current Godot path opens Village directly from a selected Map route, so it proves layer navigation but does not yet prove that the player claims land.

## Product semantics

- World remains `WHY`: choose eastern Trade.
- Map remains `WHERE`: select East Route, then explicitly claim it.
- Village remains `HOW`: open the claimed land and show the accepted `claimed` Village state.
- Claiming is a player action, not a timer, evidence variable or automatic transition.
- `selected` and `claimed` are distinct persisted states.
- The existing river, bridge, Greenvale, East Route, landmarks, transforms and cameras remain shared and unchanged.

## Required runtime path

Normal input must support:

1. `world_neutral`
2. `world_trade_selected`
3. `map_east_route_selected`
4. `map_east_route_claimed`
5. `village_claimed`
6. back to `map_east_route_claimed`
7. back to `world_trade_selected`

Controls must make the decision explicit:

- World: accept selects Trade; right opens Map.
- Map selected: accept claims East Route; left returns to World.
- Map claimed: right opens Village; left returns to World.
- Village claimed: left returns to claimed Map.

The HUD must say `Claim East Route` before the action and identify East Route as claimed afterward. It may not describe opening Village as the claim itself.

## Persistence

Reuse the accepted Session Persistence v2 adapters and schema version.

The existing `entry_state` field may add the new claim states. `selected_intent` remains `east_trade`. No new save namespace, schema version, migration framework or parallel persistence helper is authorized.

The accepted adapters must preserve `map_east_route_claimed:east_trade` across:

- native restart;
- same-origin Chromium reload;
- same-profile browser reopen.

Unavailable or denied Web storage must retain the accepted safe `world_neutral:none` fallback.

## Allowed implementation scope

- `game/scenes/aurelian/**` for the playable state controller, manifests and existing Map/Village presentation binding;
- `game/tests/**` for claim semantics, transitions, shared transforms and persistence validity;
- exactly one focused `Godot Aurelian First Land Claim V1` evidence workflow if required;
- no more than one bounded correction after the first meaningful artifact.

Reuse the accepted authored GLB, Production Map v1 overlays, Production Village v1 states, playable entry and Session Persistence v2 adapters. Do not rebuild terrain or assets.

## Forbidden

- `app/play/**` or public route changes;
- new asset families, generated production imagery or paid tools;
- resource costs, production timers, workers, orders or economy;
- multiple claimable lands, scouting expansion or broad Map polish;
- settlement founding or developed progression beyond the accepted `claimed` presentation;
- account, cloud save, backend, multiplayer, combat, diplomacy or crypto;
- P12, fake 10,000-land rendering, MAX or unrelated dependencies;
- evidence-only state injection as product proof.

## Required evidence

Exact-head evidence must include:

- World neutral still;
- World Trade-selected still;
- Map East Route selected still;
- Map East Route claimed still;
- Village claimed still;
- returned claimed Map still;
- one 20 to 30 second raw sequence driven by normal input;
- native restart proof from claimed Map;
- same-origin Web reload and same-profile browser reopen proof from claimed Map;
- denied-storage fallback proof;
- exact-head result manifest, transition manifest, tests and artifact digest;
- Village, Map and World shared-geography regression assertions.

Screenshots and video must be directly reviewed. Green CI alone is not acceptance.

## Acceptance

`GODOT_AURELIAN_FIRST_LAND_CLAIM_PASS` only if:

1. an uninformed viewer can distinguish selected land from claimed land immediately;
2. claiming is a deliberate input action with clear before and after HUD language;
3. the claimed state survives native restart, Web reload and browser reopen;
4. opening Village shows the accepted claimed-land consequence, not developed route capacity;
5. returning to Map preserves the claimed presentation;
6. World Trade intent remains legible;
7. shared geography and accepted Village, Map and World presentation do not regress;
8. no economy, new geography or public-shell scope is smuggled into the slice.

If the first meaningful artifact fails visually, allow one named bounded correction. After that, classify PASS or REJECT and stop this technique.

## Recovery and stop condition

- Infrastructure failure before product validation: diagnose the exact step and rerun only the smallest applicable job.
- Deterministic code or contract failure: fix the root cause on the same PR.
- Never blind-rerun an unchanged failure.
- Do not open or implement a later milestone before this candidate reaches PASS or REJECT and the result is recorded on `main`.

Cost target: 0 USD. MAX: OFF.
