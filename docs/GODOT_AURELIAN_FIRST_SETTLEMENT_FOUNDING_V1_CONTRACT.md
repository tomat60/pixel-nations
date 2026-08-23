# Godot Aurelian First Settlement Founding v1 Contract

Status: PROPOSED
Date: 2026-08-23
Authority baseline: `main@cecf7dc4ee4635c8fea97c234ccc4e6b9bbbac40`
Active issue: #415

## Decision

Authorize exactly one bounded candidate that turns the accepted first land claim into the first explicit settlement-founding action:

`World Trade -> Map East Route claimed -> Village claimed -> Found Greenvale -> Village founded`

This is the smallest next step in the core fantasy `land -> settlement -> city -> nation -> empire`. The accepted Production Village already contains deterministic `claimed` and `founded` visual states. This milestone must connect them through one deliberate player action, not add a new visual system.

## Product semantics

- World remains `WHY`: strategic eastern Trade intent.
- Map remains `WHERE`: East Route ownership stays claimed.
- Village remains `HOW`: claimed land becomes the first settlement.
- Founding Greenvale is a deliberate player action.
- `claimed` and `founded` are distinct persisted states.
- The action may not require resources, timers, workers, production queues or economy in v1.
- Existing Aurelian geography, bridge, roads, landmarks, cameras, GLB and KayKit asset family remain unchanged.

## Required runtime path

Normal input must support at minimum:

1. `world_neutral`
2. `world_trade_selected`
3. `map_east_route_selected`
4. explicit East Route claim
5. `map_east_route_claimed`
6. `village_claimed`
7. explicit `Found Greenvale`
8. `village_founded`
9. back to claimed Map without losing founded settlement state
10. return to Village and still see `founded`

Controls may reuse the accepted keyboard language, but the HUD must make the founding action explicit. Opening Village is not founding. Claiming land is not founding.

## Persistence

Reuse Session Persistence v2 and schema version 2 if the existing payload can safely carry the new legal entry state. Do not create a parallel save helper or a new persistence namespace.

The founded state must survive:

- native restart;
- same-origin Chromium reload;
- same-profile browser reopen.

Unavailable or denied Web storage must keep the accepted safe fallback behavior.

## Allowed implementation scope

- `game/scenes/aurelian/**` for the playable state controller, manifests and accepted Village state binding;
- `game/tests/**` for founding semantics, transitions, persistence validity and shared transforms;
- existing focused Playable Entry, Web Playability and Session Persistence v2 workflows where necessary;
- at most one small focused evidence workflow only if the existing evidence cannot prove founding;
- no more than one bounded correction after the first meaningful artifact.

## Forbidden

- new terrain or GLB authoring;
- new asset family or paid asset;
- broad Village/Map/World polish;
- resource costs, timers, workers, production queues, economy or city systems;
- multiple-land expansion or scouting expansion;
- `app/play/**` or public route replacement;
- backend, account, cloud save, multiplayer, combat, diplomacy or crypto;
- P12;
- MAX or paid tools.

## Required evidence

Exact-head evidence must include:

- Village claimed still before founding;
- explicit founding-action HUD/state proof;
- Village founded still after action;
- returned claimed Map still;
- reopened founded Village still;
- one normal-input sequence showing claim -> open land -> found -> return -> reopen;
- native restart proof preserving founded;
- Web reload and same-profile reopen proof preserving founded;
- exact-head transition/state manifest, tests and artifact digests;
- regression proof that World/Map geography and East Route claim remain unchanged.

Screenshots and video require direct review. Green CI alone is not acceptance.

## Acceptance

`GODOT_AURELIAN_FIRST_SETTLEMENT_FOUNDING_PASS` only if:

1. an uninformed viewer understands that land is claimed before a settlement exists;
2. founding is a deliberate input action with clear before/after HUD language;
3. the scene visibly changes from accepted `claimed` to accepted `founded` Village state;
4. leaving Village does not erase the founded state;
5. native restart, Web reload and profile reopen preserve founded state;
6. Map still shows the East Route as claimed;
7. shared geography and accepted visual hierarchy do not regress;
8. no economy or broader progression is smuggled into the slice.

One bounded correction maximum after the first meaningful artifact. Then PASS or REJECT.

## Stop condition

After this contract is accepted on `main` and post-merge checks are healthy, implement exactly one bounded First Settlement Founding v1 candidate. Stop after direct exact-head PASS or REJECT before any city/economy/multiple-land work.

Cost target: 0 USD. MAX: OFF.
