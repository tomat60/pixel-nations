# Godot Aurelian First Empire Proclamation v1 Contract

Status: PROPOSED
Execution issue: #518
Authority baseline: `main@3f49b017d6e891734e949da51c475254c5303a2a`
Product baseline: `accf1e0687ec2f6f3ba27a6cc01a804c86da2fac`
Runtime: Godot 4.7.1, GDScript, Compatibility renderer
Cost mode: 0 USD, MAX OFF

## Purpose

The accepted First National Direction Commitment and First National Mandate give Aurelian a persistent strategic identity and one deliberate national action. Another mandate-status microstate would add little playable value.

This contract authorizes one bounded candidate that completes the first playable pass through the core fantasy:

`one land -> settlement -> city -> nation -> empire`

The slice is an explicit proclamation and identity transition over the existing Aurelian geography. It is not territorial expansion, economy, governance simulation, diplomacy, combat or a post-founding empire system.

## Required playable outcome

`World national mandate underway -> Map Aurelian homeland and active mandate -> Village Greenvale capital -> explicit Proclaim Aurelian Empire -> Village imperial capital -> Map Aurelian imperial heartland -> World first empire proclaimed`

## Binding view roles

- Village = HOW. Greenvale capital owns the explicit proclamation action and the resulting imperial-capital presentation.
- Map = WHERE. The existing Aurelian homeland becomes the imperial heartland without adding or claiming land.
- World = WHY / WHICH DIRECTION. It recognizes the first Aurelian Empire and preserves the committed Trade, Expand or Frontier identity.
- Village, Map and World remain three roles over one unchanged physical Aurelian geography.

## Starting-state contract

The proclamation is available only when all accepted prerequisites are true:

- nation founded;
- one national direction committed;
- First National Mandate started;
- current state is the accepted mandate-underway loop.

Opening or reopening Village must never proclaim the empire automatically.

## Explicit action and event

- Exact action label: `Proclaim Aurelian Empire`.
- Required event: `AURELIAN_FIRST_EMPIRE_PROCLAMATION=AURELIAN`.
- The event must occur only from deliberate normal input.
- Exactly one proclamation is allowed per persisted profile.
- Repeated input after proclamation must be idempotent.
- Proclamation must not alter the committed Trade, Expand or Frontier direction.

## Required presentation states

The implementation may name internal states differently only if the exact manifest pins the mapping. Evidence must expose these semantic outcomes:

- pre-action World: national mandate underway;
- pre-action Map: active mandate within the Aurelian homeland;
- pre-action Village: Greenvale capital with `Proclaim Aurelian Empire`;
- post-action Village: Greenvale imperial capital;
- post-action Map: Aurelian imperial heartland;
- post-action World: first Aurelian Empire proclaimed.

Each view must remain legible in its role without duplicating the complete message of another view.

## Visual scope

Use restrained procedural presentation and existing repository assets only.

The transition must be visibly meaningful at 1440 x 900:

- Village gains one coherent imperial-capital identity layer or reveal;
- Map gains one restrained imperial-heartland identity cue while all accepted loci remain fixed;
- World gains one readable empire-recognition cue that preserves the selected direction.

No new GLB, terrain, geography, asset family or broad restyle is authorized.

## Persistence contract

Session Persistence v2 must preserve:

- `nation_founded`;
- committed `national_direction`;
- `national_mandate_started`;
- one new empire-proclaimed boolean;
- imperial Village, Map and World states;
- native restart;
- Web reload;
- persistent-profile reopen.

Denied-storage fallback remains deterministic, safe and free of a falsely proclaimed empire.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Aurelian manifests;
- existing Session Persistence v2 implementation;
- existing procedural presentation helpers and repository assets;
- focused edits to the existing Playable Entry, Web Playability and Session Persistence v2 workflows only when exact evidence requires them.

## Forbidden scope

- another land, territorial ownership change or multi-land simulation;
- economy, resources, rewards, costs, taxes, production or inventory;
- population, workers, timers or queues;
- governance systems, laws, factions or diplomacy;
- combat, units, damage or military simulation;
- post-proclamation empire progression;
- backend, accounts, cloud save or multiplayer;
- new GLB, terrain, geography, asset family, paid assets or paid tools;
- broad visual polish, broad refactoring or broad CI changes;
- React, SVG or CSS rebuilding of final game surfaces;
- P12 or MAX.

## Exact-head validation

The candidate head must pass focused deterministic tests proving:

1. proclamation requires nation, direction and mandate prerequisites;
2. no proclamation occurs before explicit player input;
3. the action emits exactly one required event;
4. repeated input is idempotent;
5. normal-input navigation reaches every required cross-view state;
6. committed Trade, Expand or Frontier identity remains unchanged;
7. Session Persistence v2 restores the imperial state on native and Web;
8. denied-storage fallback never fabricates proclamation;
9. shared geography, topology coordinates and accepted transform identities remain unchanged;
10. all earlier accepted milestone tests remain green.

## Evidence gate

Exact-head evidence must include:

- World mandate underway before proclamation;
- Map mandate active before proclamation;
- Village capital with explicit proclamation HUD/action;
- Village imperial capital after normal input;
- Map imperial heartland after returning;
- World first empire proclaimed after returning;
- reopening Village without duplicate action or duplicate event;
- one normal-input proof for each Trade, Expand and Frontier identity;
- native restart, Web reload and persistent-profile reopen;
- exact manifests, logs, stills and motion evidence;
- shared-geography regression proof.

The required workflows are the existing focused Playable Entry, Web Playability and Session Persistence v2 evidence workflows. Green CI and artifact existence are necessary but not acceptance.

## Direct review and correction limit

Direct review must inspect exact-head stills, motion, state logs and persistence evidence. It must confirm:

- the proclamation reads as a major progression milestone;
- Village remains HOW, Map remains WHERE and World remains WHY / WHICH DIRECTION;
- Greenvale, East Route, North Ridge, Gilded Crossing and the wider Aurelian geography remain physically unchanged;
- the selected national direction remains readable after proclamation;
- the implementation does not imply extra territory, economy, governance, diplomacy or combat.

One bounded visual correction is allowed. Deterministic correctness recovery does not consume the visual correction when it does not broaden or restyle the candidate.

## Terminal classification

- `GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_PASS`
- `GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_CORRECTION_REQUIRED`
- `GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_REJECT`

## Merge and stop condition

Do not merge the implementation until exact-head checks, evidence and direct review all support PASS. Stop after PASS, CORRECTION_REQUIRED or REJECT. Do not broaden into another land, economy, governance simulation, diplomacy, combat or post-proclamation empire progression.

This contract authorizes exactly one active product or recovery PR after this documentation contract is accepted on `main`.
