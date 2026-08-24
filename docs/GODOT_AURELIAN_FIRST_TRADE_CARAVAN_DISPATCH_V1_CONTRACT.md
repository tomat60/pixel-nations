# Godot Aurelian First Trade Caravan Dispatch v1 Contract

Status: PROPOSED
Date: 2026-08-24
Execution issue: #494
Authority baseline: `main@6bffe07dc6afab9bb4caf115992ebf1bb17e1e7e`

## Purpose

Authorize one bounded playable payoff after accepted East Route connection:

`World trade route active -> Map route connected -> Village developed -> explicit Dispatch First Caravan -> Map route in use -> World first trade underway`

This milestone proves that the player can deliberately use the connected route. It does not introduce an economy, production simulation, repeated caravans or another land.

## Player action

The player reopens developed Greenvale through the connected East Route and deliberately chooses `Dispatch First Caravan`.

Required event:

`AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE`

The event may be emitted only by the explicit dispatch action.

## Required states

- entry: `world_trade_route_active`;
- connected Map before dispatch: `map_east_route_connected`;
- Village before dispatch: `village_developed`;
- action HUD: `Dispatch First Caravan`;
- Village after action: `village_trade_dispatched`;
- Map consequence: `map_east_route_in_use`;
- World consequence: `world_first_trade_underway`;
- denied-storage fallback: `world_neutral:none`.

## View-role binding

- Village remains HOW: developed Greenvale is where the player dispatches the first caravan.
- Map remains WHERE: one token shows the dispatch on the already connected East Route.
- World remains WHY: eastern Trade is visibly underway because the route is being used.
- The same physical Aurelian Basin remains binding.

## Shared topology

Reuse the accepted route context:

- route id: `GreenvaleTradeRouteContext`;
- Greenvale origin: `[354,285]`;
- Gilded Crossing: `[515,340]`;
- existing river, bridge, roads, route anchors and north orientation remain invariant.

The caravan token must sit on the existing route segment. No route point may be reauthored independently for Village, Map or World.

## Visual boundary

The dispatch consequence must be immediately understandable while remaining subordinate to terrain.

- connected Map retains the accepted connected-route treatment;
- route in use adds exactly one restrained procedural caravan token at one fixed point on the accepted route;
- World reuses the eastern Trade direction and adds one concise underway state;
- the token is a state marker, not an animated or simulated unit;
- no new terrain, GLB, asset family, geography or Village node.

One bounded visual correction maximum is allowed after the first meaningful artifact.

## Persistence

Reuse Session Persistence v2 and its current namespace.

The implementation may extend only:

- legal `village_trade_dispatched`, `map_east_route_in_use` and `world_first_trade_underway` entry states;
- one caravan-dispatched boolean required to restore the state;
- existing native file and Web localStorage payload validation.

Schema version remains 2 unless a deterministic compatibility failure proves that an increment is required. No parallel persistence helper, new namespace or cloud save.

## Allowed scope

- `game/scenes/aurelian/**` for bounded controller, overlays, state binding and manifests;
- `game/tests/**` for transition, persistence, event and topology contracts;
- existing Playable Entry, Web Playability and Session Persistence v2 workflows where needed;
- one small focused evidence adjustment only if existing workflows cannot prove the cross-view payoff;
- documentation and exact-head evidence manifests.

## Forbidden

- prices, resources, costs, rewards, inventory or economy;
- production simulation, workers, timers, queues or repeated caravans;
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

1. World trade route active before dispatch;
2. connected Map before dispatch;
3. developed Village with explicit `Dispatch First Caravan` action;
4. Village dispatch acknowledgement after action;
5. Map with exactly one caravan token on the accepted route;
6. World with first eastern trade underway;
7. Map and Village after reopening;
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

- `GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_PASS`, or
- `GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_REJECT`.

## Cost and stop condition

- Strategy and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot first.
- Cursor only if materially useful, GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.

Stop after direct exact-head PASS or REJECT. Do not proceed to economy, repeated caravans, city progression or another land without a later explicit contract.
