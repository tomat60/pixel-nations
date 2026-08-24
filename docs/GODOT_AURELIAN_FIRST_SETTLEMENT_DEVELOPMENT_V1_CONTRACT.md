# Godot Aurelian First Settlement Development v1 Contract

Status: PROPOSED
Date: 2026-08-24
Authority baseline: `main@cdfa6065eb797afb086b330ba02edb38adb07198`
Active issue: #486

## Decision

Authorize exactly one bounded candidate that turns accepted founded Greenvale into its first explicit developed settlement state:

`Village founded -> Develop Greenvale -> Village developed`

This is the smallest coherent next step after First Land Claim, First Settlement Founding and Visible Expansion. The accepted Production Village already contains deterministic `founded` and `developed` states. This milestone connects them through one deliberate player action and persisted state. It does not add an economy, new art or another land.

## Product semantics

- World remains `WHY`: the selected eastern Trade direction remains unchanged.
- Map remains `WHERE`: East Route remains claimed before and after development.
- Village remains `HOW`: the player develops founded Greenvale.
- Development is a deliberate action. Opening Village is not development.
- `founded` and `developed` are distinct persisted states.
- Developed Greenvale must reuse the accepted 13-node Production Village state.
- No resources, costs, workers, timers, queues or economy are part of v1.
- Existing Aurelian geography, bridge, roads, landmarks, cameras, GLB and asset family remain unchanged.

## Required runtime path

Normal input must support at minimum:

1. reach or restore `village_founded`;
2. display an explicit `Develop Greenvale` action;
3. explicit input changes to `village_developed`;
4. emit `AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE` only for that action;
5. leave Village and show `map_east_route_claimed`;
6. reopen Village and show `village_developed`;
7. return through the existing Map and World navigation without losing development.

Controls should reuse the accepted keyboard language. The HUD must distinguish the available development action from the completed developed state.

## Persistence

Reuse Session Persistence v2 and its existing namespace. Extend only the legal settlement progression state needed to distinguish founded from developed.

The developed state must survive:

- native restart;
- same-origin Chromium reload;
- same-profile browser reopen.

Unavailable or denied Web storage must preserve the accepted safe fallback. Do not create a parallel save helper, new storage namespace, cloud save or unrelated schema rewrite.

## Allowed implementation scope

- `game/scenes/aurelian/**` for the bounded playable controller, state binding and manifests;
- `game/tests/**` for development semantics, transitions, persistence validity and shared topology;
- existing focused Playable Entry, Web Playability and Session Persistence v2 workflows where necessary;
- at most one small focused evidence adjustment only if existing evidence cannot prove development;
- no more than one bounded correction after the first meaningful artifact.

## Forbidden

- resources, costs, workers, timers, production queues or economy;
- new terrain, GLB, asset family, geography or Village nodes;
- broad Village, Map or World polish;
- changes to East Route claim semantics;
- multiple-land expansion;
- city, nation or empire systems;
- `app/play/**` or public route replacement;
- backend, accounts, cloud save, multiplayer, combat, diplomacy or crypto;
- P12;
- MAX or paid tools.

## Required evidence

Exact-head evidence must include:

- founded Village still before development;
- explicit development-action HUD/state proof;
- developed Village still immediately after the action;
- claimed East Route Map still after leaving;
- reopened developed Village still;
- one normal-input sequence showing founded -> develop -> Map -> reopen developed;
- native restart proof preserving developed;
- Web reload and same-profile reopen proof preserving developed;
- denied-storage fallback proof;
- exact-head transition and state manifests, tests, artifact IDs and digests;
- regression proof that World, Map, East Route claim and shared geography remain unchanged.

Screenshots and video require direct review. Green CI alone is not acceptance.

## Acceptance

`GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_PASS` only if:

1. an uninformed viewer understands that Greenvale is already founded before development;
2. development is a deliberate input action with clear HUD language;
3. the scene immediately changes from accepted `founded` to accepted `developed`;
4. the developed state is visibly distinct without adding new art;
5. leaving and reopening Village does not erase development;
6. native restart, Web reload and profile reopen preserve developed;
7. Map still shows East Route as claimed;
8. shared geography and view-role semantics do not regress;
9. no economy or broader progression is smuggled into the slice.

One bounded correction maximum after the first meaningful artifact. Then PASS or REJECT.

## Stop condition

After this contract is accepted on `main` and post-merge checks are healthy, implement exactly one bounded First Settlement Development v1 candidate. Stop after direct exact-head PASS or REJECT before any economy, city, multiple-land or broader progression work.

Cost target: 0 USD. MAX: OFF.
