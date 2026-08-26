# Godot Aurelian First National Mandate v1 Contract

Status: PROPOSED
Execution issue: #514
Authority baseline: `main@db264ff394f2a550d37dfc68707c9786c3801b95`
Product baseline: `627d06f780266adb08e15c0d174dd4791773eef0`
Runtime: Godot 4.7.1, GDScript, Compatibility renderer
Cost mode: 0 USD, MAX OFF

## Purpose

The accepted First National Direction Commitment lets the player inspect and persist Trade, Expand or Frontier, but the committed choice changes identity and context only. This contract authorizes one bounded candidate that turns the committed direction into the first deliberate national mandate action.

The slice is one shared state machine with three direction-specific presentations. It does not introduce economy, territorial expansion, governance, diplomacy, combat or empire progression.

## Required playable outcome

`World direction committed -> Map homeland context -> Village capital identity -> explicit Launch National Mandate -> Village mandate started -> Map mandate active at an existing geographic locus -> World mandate underway`

## Direction bindings

The selected and persisted national direction determines the exact action and existing locus:

- `trade`: `Dispatch Trade Delegation`, using the accepted East Route;
- `expand`: `Commission Basin Survey`, using the existing North Ridge inside the accepted Aurelian homeland;
- `frontier`: `Establish Frontier Watch`, using the accepted Gilded Crossing frontier edge.

These are visible activity and identity cues only. They do not create resources, rewards, population, units, territory or another land.

## Binding view roles

- Village = HOW. Greenvale capital owns the explicit direction-specific action and the mandate-started state.
- Map = WHERE. It shows the active mandate at exactly one existing accepted geographic locus.
- World = WHY / WHICH DIRECTION. It shows the committed direction and the mandate underway.
- Village, Map and World remain three cameras and roles over one unchanged physical Aurelian geography.

## State and input contract

- A mandate can start only after `national_direction` is committed.
- Opening or reopening Village never starts a mandate automatically.
- The action must be explicit, direction-specific and available through normal input.
- Exactly one mandate can be started for the persisted profile.
- A repeated action after start must not emit another event or change direction.
- Required event: `AURELIAN_FIRST_NATIONAL_MANDATE=TRADE|EXPAND|FRONTIER`.
- The accepted national-direction inspection and commitment behavior must remain intact.

## Persistence contract

Session Persistence v2 must preserve:

- committed `national_direction`;
- `national_mandate_started`;
- direction-specific Village, Map and World states;
- native restart;
- Web reload;
- persistent-profile reopen.

Denied-storage fallback remains deterministic, safe and free of a falsely started mandate.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Aurelian manifests;
- existing Session Persistence v2 implementation;
- existing procedural presentation helpers and repository assets;
- focused edits to the existing Playable Entry, Web Playability and Session Persistence v2 workflows only when exact evidence requires them.

## Forbidden scope

- economy, resources, rewards, costs, taxes, production or inventory;
- population, workers, timers or queues;
- claiming another land, changing ownership or multi-land simulation;
- governance, laws, factions or diplomacy;
- combat, units, damage or military simulation;
- empire progression;
- backend, accounts, cloud save or multiplayer;
- new GLB, terrain, geography, paid assets or paid tools;
- broad visual polish, broad refactoring or broad CI changes;
- React, SVG or CSS rebuilding of final game surfaces;
- P12 or MAX.

## Exact-head validation

The candidate head must pass focused deterministic tests proving:

1. all three committed directions map to the correct action, event and existing locus;
2. no mandate exists before explicit player input;
3. exactly one mandate event is emitted;
4. a repeated action is idempotent;
5. normal-input navigation reaches the action and every required cross-view state;
6. the accepted national-direction behavior remains intact;
7. shared geography and accepted transform identities remain unchanged;
8. denied-storage fallback remains safe.

## Evidence gate

Exact-head evidence must include:

- claimed accepted starting state with an already committed direction and no mandate;
- explicit direction-specific Village HUD/action;
- Village mandate started after normal input;
- the correct existing Map locus after returning;
- World mandate underway after returning;
- reopening Village without duplicate action or duplicate event;
- one normal-input sequence for each Trade, Expand and Frontier binding;
- native restart, Web reload and persistent-profile reopen;
- exact manifests, logs, stills and motion evidence;
- shared-geography regression proof.

The required workflows are the existing focused Playable Entry, Web Playability and Session Persistence v2 evidence workflows. Green CI and artifact existence are necessary but not acceptance.

## Direct review and correction limit

Direct review must inspect exact-head stills, motion, state logs and persistence evidence. Review must confirm immediate readability of HOW, WHERE and WHY while Greenvale, East Route, North Ridge, Gilded Crossing and the wider Aurelian geography remain physically unchanged.

One bounded visual correction is allowed. Correctness recovery for deterministic bugs does not consume the visual correction if it does not broaden or restyle the candidate.

## Terminal classification

- `GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_PASS`
- `GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_CORRECTION_REQUIRED`
- `GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_REJECT`

## Merge and stop condition

Do not merge the implementation until exact-head checks, evidence and direct review all support PASS. Stop after PASS, CORRECTION_REQUIRED or REJECT. Do not broaden into economy, second-land expansion, governance, combat or empire progression.

This contract authorizes exactly one active product or recovery PR after this documentation contract is accepted on `main`.
