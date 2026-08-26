# Godot Aurelian Directional Empire Identity v1 Contract

Status: PROPOSED
Execution issue: #522
Authority baseline: `main@8fe1436ee6824606304d2c4bb55c06b85636c2ee`
Product baseline: `ebdc103a3f2a9ff4c8a495e9547a084ae9a6a715`
Runtime: Godot 4.7.1, GDScript, Compatibility renderer
Cost mode: 0 USD, MAX OFF

## Purpose

The accepted First Empire Proclamation completes the linear core fantasy:

`one land -> settlement -> city -> nation -> empire`

The accepted Trade, Expand or Frontier direction survives proclamation, but the next highest-value slice is not another post-proclamation state. It is one bounded payoff that makes the existing strategic commitment materially visible at the empire endpoint.

This contract authorizes exactly one implementation candidate for a direction-specific imperial identity over the accepted Aurelian geography. It does not authorize another land, territorial growth, economy, governance, diplomacy, combat or further empire progression.

## Required playable outcome

`committed Trade / Expand / Frontier -> mandate underway -> explicit Proclaim Aurelian Empire -> direction-specific imperial capital -> direction-specific imperial heartland -> direction-specific first empire identity`

## Binding view roles

- Village = HOW. Greenvale imperial capital owns one restrained, readable direction-specific civic or activity cue.
- Map = WHERE. The existing imperial heartland preserves the committed direction at its already accepted locus.
- World = WHY / WHICH DIRECTION. The first Aurelian Empire visibly carries the committed Trade, Expand or Frontier identity.
- Village, Map and World remain three roles over one unchanged physical Aurelian Basin.

## Starting-state contract

The candidate must reuse the accepted progression and state:

- nation founded;
- one direction committed;
- corresponding First National Mandate underway;
- `empire_proclaimed=false` before deliberate proclamation;
- accepted First Empire Proclamation action and event.

No direction-specific imperial cue may appear before the player commits a direction and proclaims the empire.

## Existing action and event

- Exact action label remains `Proclaim Aurelian Empire`.
- Required event remains `AURELIAN_FIRST_EMPIRE_PROCLAMATION=AURELIAN`.
- The event occurs only from deliberate normal input.
- Exactly one proclamation is allowed per persisted profile.
- Repeated input remains idempotent.
- The committed direction must not change during proclamation or restore.

## Direction identity manifest

One exact-head manifest must pin all three outcomes.

### Trade

- Village: a restrained trade-standard or civic-market activity cue integrated into the accepted imperial capital.
- Map: East Route remains the active direction locus within the imperial heartland.
- World: the empire emblem or strategic presentation uses the accepted Trade identity and color relationship.
- No new route, economy, goods, reward or caravan simulation.

### Expand

- Village: a restrained survey, planning or expansion-standard cue integrated into the accepted imperial capital.
- Map: North Ridge remains the active direction locus within the imperial heartland.
- World: the empire emblem or strategic presentation uses the accepted Expand identity and color relationship.
- No claim, second land, ownership change, construction queue or territorial simulation.

### Frontier

- Village: a restrained watch-standard or frontier-civic cue integrated into the accepted imperial capital.
- Map: Gilded Crossing remains the active direction locus within the imperial heartland.
- World: the empire emblem or strategic presentation uses the accepted Frontier identity and color relationship.
- No units, combat, damage, fortification system or military simulation.

## Visual acceptance boundary

The three outcomes must be distinguishable in direct evidence without relying only on HUD prose.

Required:

- one clear direction-specific cue in each view;
- restrained procedural presentation that remains subordinate to the shared terrain;
- accepted imperial-capital, heartland and empire hierarchy remains readable;
- existing river, bridge, roads, Greenvale origin, East Route, North Ridge and Gilded Crossing transforms remain unchanged;
- no new asset, GLB, terrain, camera geography or independent per-view world.

Rejected:

- label-only differentiation;
- recoloring the entire scene;
- debug markers, oversized rings or dashboard cards dominating the landscape;
- moving or inventing geography to accommodate a direction;
- generic imperial presentation that looks identical for all three directions.

## Persistence contract

Session Persistence v2 must preserve:

- `empire_proclaimed=true`;
- exactly one committed direction;
- the matching direction-specific Village, Map and World outcome;
- accepted imperial state after native restart;
- accepted imperial state after Web reload;
- accepted imperial state after persistent-profile reopen.

Restore must never change direction, emit the proclamation event again or duplicate the cue.

## Required evidence

Exact-head evidence must include:

1. normal-input Trade sequence from committed mandate through proclamation;
2. normal-input Expand sequence from committed mandate through proclamation;
3. normal-input Frontier sequence from committed mandate through proclamation;
4. pre-action Village, Map and World states for each direction;
5. post-action direction-specific imperial capital, heartland and World identity for each direction;
6. leaving and reopening Village after proclamation;
7. native restart restore;
8. Web reload restore;
9. persistent-profile reopen restore;
10. shared-geography regression and exact manifest validation;
11. stills plus motion evidence sufficient for direct product review.

The three direction variants may share deterministic setup helpers, but acceptance evidence must come from normal player input at the decision and proclamation boundaries.

## Allowed implementation scope

- `game/scenes/aurelian/**`;
- focused Godot controller and HUD changes required by this contract;
- exact manifest under the existing Aurelian manifest area;
- focused tests under `game/tests/**`;
- Session Persistence v2 fixtures and checks;
- narrowly scoped updates to the existing Playable Entry, Web Playability and Session Persistence evidence workflows;
- contract-linked documentation.

## Forbidden scope

- any progression after first empire proclamation;
- another land, ownership change or multi-land simulation;
- economy, resources, costs, rewards, taxes, production or inventory;
- population, workers, timers, queues or simulation;
- governance systems, laws, factions or diplomacy;
- combat, units, damage or military systems;
- backend, accounts, cloud save or multiplayer;
- new GLB, terrain, geography, asset family, dependency, paid asset or paid tool;
- React, SVG or CSS rebuilding of final game surfaces;
- broad visual polish, broad CI changes or platform refactoring;
- P12 or MAX.

## Validation and acceptance

Required before acceptance:

- focused manifest and controller tests;
- all exact-head repository guards;
- Playable Entry exact-head artifact;
- Web Playability exact-head artifact;
- Session Persistence v2 exact-head artifact;
- direct still and motion review of Trade, Expand and Frontier;
- direct confirmation that the shared geography is unchanged.

Green CI alone is not product acceptance. One bounded visual correction maximum is allowed. After that correction, classify exactly one terminal result:

- `GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_PASS`; or
- `GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_REJECT`.

## Failure recovery

- Deterministic failures must be fixed at root cause on the same PR and exact head.
- Infrastructure failure before product execution may rerun only the smallest failing job.
- Do not blind-rerun unchanged deterministic failures.
- Any head movement invalidates older artifacts and requires exact-head evidence refresh.
- Scope pressure must narrow or reject the candidate, not broaden it.

## Stop condition

Stop after one accepted or rejected Directional Empire Identity v1 candidate. A PASS must be recorded in `docs/PROJECT_CURRENT_STATE.md` before any later product strategy review. A REJECT must restore the accepted First Empire Proclamation baseline and close issue #522 with the exact reason.
