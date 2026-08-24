# Godot Aurelian First Trade Route Connection v1 Contract

Status: PROPOSED
Date: 2026-08-24
Execution issue: #490
Authority baseline: `main@09866ea8c5111a1e4c6cf1a2708fe94db0078dfc`

## Purpose

Authorize one bounded cross-view payoff after accepted Greenvale development:

`Village developed -> Map East Route claimed -> explicit Connect East Route -> Map East Route connected -> World trade route active`

This milestone proves that Village growth changes what is possible on Map and World. It is not an economy, city or multiple-land milestone.

## Player action

The player returns from developed Greenvale to the claimed East Route and deliberately chooses `Connect East Route`.

Required event:

`AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE`

The event may be emitted only from the explicit connection action.

## Required states

- before action: `village_developed` and `map_east_route_claimed`;
- action HUD: `Connect East Route`;
- after action: `map_east_route_connected`;
- World consequence: `world_trade_route_active`;
- Map reopen: `map_east_route_connected`;
- Village reopen: `village_developed`;
- denied-storage fallback: `world_neutral:none`.

## View-role binding

- Village remains HOW: developed Greenvale supplies route capacity.
- Map remains WHERE: the player connects the claimed East Route.
- World remains WHY: eastern Trade becomes active because the route is connected.
- The same physical Aurelian Basin remains binding.

## Shared topology

Reuse the accepted route context:

- route id: `GreenvaleTradeRouteContext`;
- Greenvale origin: `[354,285]`;
- Gilded Crossing: `[515,340]`;
- existing river, bridge, roads, route anchors and north orientation remain invariant.

No route point may be reauthored independently for Village, Map or World.

## Visual boundary

Connected must be immediately distinguishable from claimed while remaining subordinate to terrain.

- claimed retains the accepted green territorial marker;
- connected adds one restrained route treatment along the existing topology;
- World active Trade reuses the accepted eastern Trade direction and adds one concise active state;
- no new terrain, GLB, asset family, geography or Village node.

One bounded visual correction maximum is allowed after the first meaningful artifact.

## Persistence

Reuse Session Persistence v2 and its current namespace.

The implementation may extend only:

- legal `map_east_route_connected` and `world_trade_route_active` entry states;
- one route-connected boolean required to restore the state;
- existing native file and Web localStorage payload validation.

Schema version remains 2 unless a deterministic compatibility failure proves that an increment is required. No parallel persistence helper, new namespace or cloud save.

## Allowed scope

- `game/scenes/aurelian/**` for bounded controller, overlays, state binding and manifests;
- `game/tests/**` for transition, persistence, event and topology contracts;
- existing Playable Entry, Web Playability and Session Persistence v2 workflows where needed;
- one small focused evidence adjustment only if existing workflows cannot prove the cross-view payoff;
- documentation and exact-head evidence manifests.

## Forbidden

- resource costs, economy, production simulation, workers, timers or queues;
- city, nation or empire progression;
- new terrain, GLB, asset family, geography or Village nodes;
- another land or multiple-land expansion;
- broad Village, Map or World polish;
- changing East Route or route topology;
- `app/play/**` or public shell changes;
- backend, accounts, multiplayer, combat, diplomacy or crypto;
- P12;
- MAX or paid tools;
- image generation as implementation authority.

## Acceptance evidence

Exact-head evidence must include:

1. developed Village before connection;
2. claimed Map before connection;
3. explicit `Connect East Route` HUD/action;
4. connected Map after action;
5. World with eastern Trade active;
6. connected Map after reopening;
7. developed Village after reopening;
8. one normal-input cross-view sequence;
9. native restart restoration;
10. same-origin Web reload restoration;
11. persistent-profile browser reopen restoration;
12. denied-storage fallback;
13. manifests and tests proving event uniqueness, persistence and shared topology;
14. direct visual review of stills and video;
15. Village, Map, World and geography regression evidence.

Green CI alone is not acceptance.

## Failure recovery

- Infra failure before product validation: rerun only the smallest failed job.
- Deterministic product or contract failure: inspect the exact log and fix the root cause on the same PR.
- No blind retry.
- One bounded visual correction maximum, then PASS or REJECT.

## Terminal classification

- `GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_PASS`, or
- `GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_REJECT`.

## Cost and stop condition

- Strategy and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot first.
- Cursor only if materially useful, GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.

Stop after direct exact-head PASS or REJECT. Do not proceed to economy, city progression or another land without a later explicit contract.
