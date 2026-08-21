# Godot Playable Aurelian Entry v1 Contract

Status: AUTHORIZED AFTER MERGE
Owner: Pixel Nations Production Steward
Authority: `docs/PROJECT_CURRENT_STATE.md` on `main`
Accepted visual inputs: Production Village v1, Production Map v1, Production World v1 and Aurelian Decision Loop v1
Cost target: 0 USD

## Purpose

Turn the accepted Aurelian Decision Loop from an evidence-only scene into the real playable entry of the Godot project.

The current `game/project.godot` still starts `res://scenes/bootstrap/bootstrap.tscn`, which is a migration-foundation diagnostic panel. The accepted Aurelian Basin exists, but a normal player launch does not enter it.

This milestone proves one small playable runtime handoff. It is not a web integration, save migration, economy or full vertical slice.

## Player outcome

A normal Godot launch, without evidence environment variables, must:

1. enter the Aurelian Basin in neutral World view;
2. let the player select the eastern Trade direction;
3. let the player continue to Map with East Route selected;
4. let the player continue to Village with the Greenvale-to-Gilded-Crossing route context;
5. let the player move back through Village -> Map -> World without losing the current local intent;
6. expose a small readable control prompt and current decision-layer identity.

The flow remains session-local. It must not claim durable persistence or an implemented trade economy.

## Accepted inputs

- `game/scenes/aurelian/aurelian_decision_loop_v1.tscn` and its accepted presentation controller.
- Exact handoff identity:
  `Direction_EastTrade -> Land_EastRouteSelected -> GreenvaleTradeRouteContext`.
- Existing Production Village, Map and World scenes, manifests, cameras and shared geography.
- Existing deterministic `GameState` semantics and foundation tests as regression boundaries only.
- `docs/AURELIAN_VIEW_ROLES_V1.md`.

## Runtime rules

- The normal project entry must reach accepted Aurelian content.
- Player input, not frame number or evidence-only environment configuration, must drive the accepted forward and back transitions.
- A minimal runtime shell may route startup and display controls, layer identity and the retained eastern-trade intent.
- Existing environment-driven capture modes may remain for deterministic QA, but they may not be the only way the playable flow works.
- The project must retain a headless-safe validation path.
- Shared terrain and accepted visual sources must not be rebuilt.

## Allowed scope

Exactly one bounded implementation PR may change:

- `game/project.godot` only if required to change the normal startup scene or input map;
- `game/scenes/bootstrap/**` only for minimal startup routing or foundation regression support;
- `game/scenes/aurelian/**` for the playable entry shell, input controller and minimal runtime HUD;
- `game/tests/**` for player-driven transition, startup and shared-transform contracts;
- one focused `.github/workflows/**` evidence workflow when needed.

No other product surface is authorized.

## Forbidden scope

- `app/play/**`, public routes or web-shell integration;
- new reducer actions, persistence schema, save migration or account state;
- trade economy, resource simulation, production rebalance or settlement-system expansion;
- diplomacy, combat, war, multiplayer, backend, accounts, payments or crypto;
- P12 or a fake 10,000-land renderer;
- independent Village, Map or World geography;
- broad visual polish of accepted views;
- new dependencies or asset families;
- paid tools, MAX or image generation as implementation authority.

## Required controls

The candidate must provide one deterministic, documented control path:

- World: select Trade;
- continue to Map;
- continue to Village;
- back to Map;
- back to World.

Keyboard controls are sufficient for v1 if they are visible on screen, direct and consistent. Mouse support is allowed only if it remains bounded and does not require a new interaction framework.

## Exact evidence

The focused exact-head artifact must contain:

1. a normal-launch still proving the project starts in Aurelian World, not the foundation panel;
2. World neutral still with visible controls and layer identity;
3. World Trade-selected still;
4. Map East Route selected still;
5. Village route-context still;
6. returned World still after the backward path;
7. one raw 20 to 35 second sequence driven by the same input actions exposed to the player:
   `launch -> select Trade -> Map -> Village -> Map -> World`;
8. a machine-readable interaction manifest containing exact head, startup scene, input actions, state IDs and topology invariants;
9. tests proving:
   - normal startup resolves to the playable Aurelian entry;
   - forward and backward transitions are input-driven;
   - the accepted handoff IDs remain exact;
   - all accepted shared transforms remain equal;
   - the foundation state reducer and headless validation remain healthy.

Direct visual and product review is mandatory. Green CI alone is not acceptance.

## Acceptance

`GODOT_PLAYABLE_AURELIAN_ENTRY_PASS` only if:

- a normal launch reaches accepted Aurelian content;
- a new player can identify World, Map and Village roles from the small runtime shell;
- the full forward and backward path works without evidence-only environment variables;
- the eastern Trade intent visibly survives the transitions;
- controls are understandable without narration;
- accepted Village, Map, World and shared geography do not regress;
- no unimplemented economy, persistence or wider world capability is implied.

## Correction and stop

One meaningful candidate is allowed.

If technically valid evidence reveals one bounded interaction or presentation defect, exactly one evidence-backed correction is allowed on the same technique. A correctness or infrastructure repair needed only to produce the already-defined evidence does not consume that visual correction and may not add polish.

After direct exact-head review, classify only:

- `GODOT_PLAYABLE_AURELIAN_ENTRY_PASS`;
- `GODOT_PLAYABLE_AURELIAN_ENTRY_REJECT`.

Stop after terminal classification. No later product milestone is authorized by this contract.
