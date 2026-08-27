# Godot Aurelian First Rival Countermove v1 Contract

Status: PROPOSED
Issue: #530
Authority baseline SHA: `fae57449f1dc60b0d4849872f65424227ffdab9c`
Product baseline SHA: `a4be5db1bf55baac055f9a9985d5de698dfdf75d`

## Contract

Implement exactly one bounded first rival countermove after the accepted River Surge response:

`recorded River Surge response -> World reveals derived Obsidian March countermove -> Map shows pressured existing locus -> Village explicitly chooses Stand Firm or Negotiate Passage -> Map shows selected existing-locus result -> World records first rival response`

## Entry requirements

The candidate starts only after:

- `empire_proclaimed=true`;
- `imperial_crisis=river_surge`;
- `imperial_crisis_response` is exactly `shield_greenvale` or `keep_east_bridge_open`;
- national direction is exactly Trade, Expand or Frontier;
- no rival response has been committed.

## Deterministic origin mapping

- `shield_greenvale` produces an Obsidian March countermove at the existing East Bridge.
- `keep_east_bridge_open` produces an Obsidian March legitimacy countermove at existing Greenvale.
- No random selection, third origin, new land or new locus is allowed.

## Player responses

Exactly two mutually exclusive deliberate actions are allowed:

1. `Stand Firm`
2. `Negotiate Passage`

The selected response is idempotent and permanently excludes the other response for that profile.

Required event:

`AURELIAN_FIRST_RIVAL_COUNTERMOVE_RESPONSE=STAND_FIRM|NEGOTIATE_PASSAGE`

The event emits exactly once on commitment and never on restore or view reopen.

## View roles

### Village = HOW

Village shows:

- the derived countermove and its origin;
- both response labels through normal-input inspection;
- an explicit commit action;
- the committed result after selection.

Village may not simulate combat, bargaining, costs, rewards, damage, units or timers.

### Map = WHERE

Map shows:

- exactly one pressured existing locus derived from the River Surge response;
- East Bridge for `shield_greenvale`;
- Greenvale for `keep_east_bridge_open`;
- one restrained procedural cue before commitment;
- one response-specific cue after commitment.

Map must not add new geography, ownership, land, routes or landmarks.

### World = WHY / WHICH DIRECTION

World shows:

- that Obsidian March reacted to the recorded River Surge response;
- the preserved Trade, Expand or Frontier imperial identity;
- the recorded `Stand Firm` or `Negotiate Passage` outcome;
- a restrained procedural rival cue, not a new world or faction simulation.

## Required state and persistence

Session Persistence v2 may add only the minimal fields needed to preserve:

- countermove origin derived from the existing crisis response;
- committed rival response.

The candidate must preserve:

- `national_direction`;
- `national_mandate_started`;
- `empire_proclaimed=true`;
- `imperial_crisis=river_surge`;
- the accepted `imperial_crisis_response`;
- the rival response;
- accepted entry state and view reopen behavior.

Native restart, Web reload and persistent-profile reopen must restore the same origin, response, direction and view state without duplicate event emission.

## Shared geography

The accepted `aurelian_authored_terrain_v1.glb` and all physical transforms remain unchanged:

- Greenvale origin;
- river spline and banks;
- East Bridge and both landings;
- East Route;
- North Ridge;
- Gilded Crossing;
- cameras and cross-view topology.

Only restrained procedural cues attached to existing Greenvale or East Bridge geometry are allowed.

## Required implementation evidence

Exact-head evidence must show:

1. both accepted River Surge responses entering the correct derived rival origin;
2. World countermove reveal for both origins;
3. Map pressured East Bridge and pressured Greenvale;
4. Village normal-input inspection of both response actions;
5. explicit commitment of `Stand Firm` and `Negotiate Passage`;
6. mutually exclusive committed outcomes;
7. response-specific Village, Map and World states;
8. preserved Trade, Expand and Frontier identities;
9. native restart persistence;
10. Web reload persistence;
11. persistent-profile reopen;
12. no duplicate commitment event;
13. exact manifest and focused contract tests;
14. shared-geography regression;
15. direct still and motion review.

Required workflows:

- Godot Playable Aurelian Entry V1;
- Godot Web Export Playability V1;
- Godot Aurelian Session Persistence V2;
- all standard exact-head PR guards.

Green CI alone is not acceptance. One bounded visual correction maximum.

## Allowed files

- focused files under `game/scenes/aurelian/**`;
- focused tests under `game/tests/**`;
- narrowly scoped existing Playable, Web and Persistence evidence workflows;
- one exact implementation manifest.

## Forbidden scope

- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, turns, random behavior or broad faction system;
- rewards, penalties, resources, Influence, pressure meters, costs or timers;
- diplomacy or governance simulation;
- a third origin, response or response matrix by national direction;
- frontier payoff;
- another land, ownership change, expansion or new settlement;
- new GLB, terrain, geography, asset family, dependency or paid tool;
- broad visual polish or camera redesign;
- backend, accounts, cloud save, multiplayer or Next.js product work;
- P12 or MAX.

## Terminal classification

After direct exact-head review classify the candidate exactly as:

- `GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_PASS`; or
- `GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_REJECT`.

A PASS must be recorded in `docs/PROJECT_CURRENT_STATE.md` before any frontier-payoff strategy review. A REJECT must record the exact reason and restore the accepted River Surge baseline.

## Stop condition

Stop after one accepted or rejected implementation candidate. Do not begin frontier payoff, a second rival beat or any broader system.
