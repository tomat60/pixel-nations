# Godot Aurelian River Surge Crisis v1 Contract

Status: PROPOSED
Execution issue: #526
Authority baseline: `main@60e1a53f5a7f063d8304f68ea4e8518a100e08dc`
Product baseline: `bcd97f7970856551d91fa325609761eb542c32c1`
Runtime: Godot 4.7.1, GDScript, Compatibility renderer
Cost mode: 0 USD, MAX OFF

## Purpose

The accepted first-run fantasy reaches a direction-specific Aurelian Empire. ADR-001 then calls for a crisis before any rival or frontier payoff. The next slice must add a consequential player decision, not another automatic visual upgrade.

This contract authorizes exactly one River Surge crisis candidate on the accepted Aurelian geography. It does not authorize crisis simulation, resolution, rewards, economy, combat, governance, another land or broader post-empire progression.

## Required playable outcome

`direction-specific first empire -> World reveals River Surge crisis -> Map shows Greenvale and East Bridge response loci -> Village explicitly chooses Shield Greenvale or Keep East Bridge Open -> Map shows the chosen response at the existing locus -> World records the first imperial crisis response`

## Binding view roles

- Village = HOW. Greenvale imperial capital presents the explicit response choice and shows the selected response as civic action.
- Map = WHERE. Greenvale and East Bridge are the only response loci on the unchanged Aurelian geography.
- World = WHY / WHICH DIRECTION. The empire faces the crisis and records its response while retaining Trade, Expand or Frontier identity.
- Village, Map and World remain three roles over one physical Aurelian Basin.

## Starting-state contract

The candidate starts only after:

- `empire_proclaimed=true`;
- exactly one committed direction remains active;
- the matching direction-specific imperial identity is visible;
- no crisis response has been recorded.

No crisis or response cue may appear before empire proclamation. The crisis must not change the committed direction, land ownership, geography or accepted imperial identity.

## Crisis and response contract

The crisis is one deterministic `River Surge` bound to the existing river.

Exactly two mutually exclusive responses are allowed:

1. `Shield Greenvale`
   - response locus: existing Greenvale capital;
   - presentation: restrained procedural flood-defense or civic-response cue around the accepted capital footprint;
   - no building replacement, resource cost or population simulation.

2. `Keep East Bridge Open`
   - response locus: existing East Bridge and its accepted dry-ground landings;
   - presentation: restrained procedural bridge-access or river-control cue;
   - no bridge transform change, new route, goods or caravan simulation.

The player must choose through deliberate normal input in Village. Selection is final for the persisted profile and repeated input is idempotent.

Required event:

`AURELIAN_FIRST_IMPERIAL_CRISIS_RESPONSE=SHIELD_GREENVALE|KEEP_EAST_BRIDGE_OPEN`

The event emits exactly once and never emits during restore.

## Visual acceptance boundary

Required:

- River Surge reads from the existing river in World and Map without moving the spline or banks;
- both candidate response loci are legible on Map before commitment;
- the chosen response is physically distinguishable in Village and Map without relying only on HUD text;
- World confirms the selected imperial response and preserves the direction-specific empire identity;
- accepted imperial-capital, heartland and empire hierarchy remains readable;
- river, bridge, roads, Greenvale origin, East Route, North Ridge and Gilded Crossing transforms remain unchanged.

Rejected:

- a generic alert card with no world-space cue;
- oversized markers, full-scene recoloring or dashboard presentation;
- six direction-by-response variants;
- damage, destruction, failure, depletion or simulated flooding;
- invented geography or a rebuilt GLB.

## Persistence contract

Session Persistence v2 must preserve:

- `empire_proclaimed=true`;
- the committed Trade, Expand or Frontier direction;
- `imperial_crisis=river_surge`;
- exactly one response: `shield_greenvale` or `keep_east_bridge_open`;
- the matching Village, Map and World result after native restart;
- the matching result after Web reload;
- the matching result after persistent-profile reopen.

Restore must not duplicate cues, change the response, change direction or emit the response event again.

## Required evidence

Exact-head evidence must include:

1. pre-crisis direction-specific empire state;
2. World River Surge reveal;
3. Map with Greenvale and East Bridge response loci;
4. normal-input `Shield Greenvale` choice;
5. normal-input `Keep East Bridge Open` choice from a clean profile;
6. post-choice Village, Map and World states for both responses;
7. leaving and reopening Village and Map;
8. native restart restore for both responses;
9. Web reload restore for both responses;
10. persistent-profile reopen restore for both responses;
11. committed-direction preservation for Trade, Expand and Frontier;
12. exact manifest and shared-geography regression;
13. stills plus motion evidence sufficient for direct review.

Deterministic setup may reach the accepted empire baseline, but both response commitments must use normal player input.

## Allowed implementation scope

- `game/scenes/aurelian/**`;
- focused Godot controller and HUD changes required by this contract;
- one exact River Surge manifest under the existing Aurelian manifest area;
- focused tests under `game/tests/**`;
- Session Persistence v2 fixtures and checks;
- narrowly scoped updates to existing Playable Entry, Web Playability and Session Persistence workflows;
- contract-linked documentation.

## Forbidden scope

- crisis resolution, reward, penalty, cost, timer or failure state;
- a third response or direction-specific response matrix;
- rival, frontier payoff or further post-crisis progression;
- another land, ownership change or multi-land simulation;
- economy, resources, taxes, production, inventory, population, workers or queues;
- governance systems, laws, factions or diplomacy;
- combat, units, damage or military simulation;
- backend, accounts, cloud save or multiplayer;
- new GLB, terrain, geography, asset family, dependency, paid asset or paid tool;
- React, SVG or CSS rebuilding of final game surfaces;
- broad visual polish, broad CI changes or platform refactoring;
- P12 or MAX.

## Validation and acceptance

Required before acceptance:

- focused crisis manifest, controller and persistence tests;
- all exact-head repository guards;
- Playable Entry exact-head artifact;
- Web Playability exact-head artifact;
- Session Persistence v2 exact-head artifact;
- direct still and motion review of both responses;
- direct confirmation that all three directional identities and shared geography remain intact.

Green CI alone is not acceptance. One bounded visual correction maximum is allowed. Then classify exactly one terminal result:

- `GODOT_AURELIAN_RIVER_SURGE_CRISIS_PASS`; or
- `GODOT_AURELIAN_RIVER_SURGE_CRISIS_REJECT`.

## Failure recovery

- Fix deterministic failures at root cause on the same PR and exact head.
- For infrastructure failure before product execution, rerun only the smallest failing job.
- Never blind-rerun an unchanged deterministic failure.
- Any head movement invalidates older artifacts.
- Scope pressure must narrow or reject the candidate, not broaden it.

## Stop condition

Stop after one accepted or rejected River Surge Crisis v1 candidate. A PASS must be recorded in `docs/PROJECT_CURRENT_STATE.md` before any rival or frontier strategy review. A REJECT must restore the Directional Empire Identity baseline and close issue #526 with the exact reason.
