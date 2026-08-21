# Aurelian Decision Loop v1 Contract

Status: AUTHORIZED AFTER MERGE
Owner: Pixel Nations Production Steward
Authority: `docs/PROJECT_CURRENT_STATE.md` on `main`
Role truth: `docs/AURELIAN_VIEW_ROLES_V1.md`
Cost target: 0 USD

## Purpose

Prove one coherent player decision across the three accepted Aurelian layers:

`World WHY -> Map WHERE -> Village HOW`

This is a bounded handoff proof, not a new economy, trade, settlement or world system.

## Player question

Can the player choose the eastern trade direction in World, identify the matching East Route land in Map, and understand the relevant Greenvale road and production context in Village without losing the shared geography?

## Accepted inputs

- Production World v1 `Direction_EastTrade`: trade, eastern route opportunity.
- Production Map v1 `Land_EastRouteSelected`: selected East Route land.
- Production Village v1 developed Greenvale and its road to Gilded Crossing.
- The existing Aurelian authored terrain and topology invariants.
- Existing view switching and focused Godot evidence infrastructure.

## Required decision chain

1. World begins neutral and lets the eastern Trade direction become selected.
2. Returning to Map presents `Land_EastRouteSelected` as the nearby territorial execution target for that direction.
3. Returning to Village presents developed Greenvale with a restrained route and production focus tied to the road toward Gilded Crossing.
4. The sequence must read as one retained intent, not three unrelated showcase states.

The implementation may use a deterministic local handoff manifest and presentation controller. It must not claim persistent gameplay state or introduce a production economy.

## Shared-world invariants

The following remain physically identical across Village, Map and World:

- Aurelian authored terrain and GLB;
- Greenvale origin;
- Gilded Crossing bridge;
- river, outflow and roads;
- North Ridge, South Marsh, Coast Outflow and Northgate;
- topology orientation and topology-to-Godot transform parity.

The accepted World, Map and Village manifests remain the source for existing marker IDs and states. Do not rebuild the terrain.

## Allowed scope

Exactly one bounded implementation PR may change:

- `game/scenes/aurelian/**` for the handoff scene, controller and minimal manifest;
- `game/tests/**` for decision semantics and shared-transform assertions;
- one focused `.github/workflows/**` evidence workflow when needed.

Existing files may be reused. Village, Map and World may change only as required to present the handoff evidence. Any view-specific presentation change must remain minimal and must not reopen accepted visual polish.

## Forbidden scope

- `app/play/**` or the public web shell;
- reducer actions, persistence schema or save migration;
- a trade economy, production simulation or resource rebalance;
- diplomacy, combat, war, multiplayer, backend, accounts, payments or crypto;
- P12 or a fake 10,000-land renderer;
- independent geography for any view;
- broad Village, Map or World polish;
- new paid tools, paid assets, MAX or image generation as implementation authority.

## Exact evidence

The focused exact-head artifact must contain:

1. World neutral still.
2. World Trade-selected still.
3. Map East Route selected still.
4. Village developed route and production-context still.
5. One Map regression still proving accepted land-state language remains readable.
6. One Village regression still proving the accepted settlement progression is unchanged.
7. A raw 20 to 30 second sequence: World neutral -> select Trade -> Map East Route -> Village Greenvale context.
8. A machine-readable manifest with exact head SHA, marker IDs, handoff IDs and topology invariants.
9. Contract tests proving:
   - `Direction_EastTrade -> Land_EastRouteSelected`;
   - `Land_EastRouteSelected -> Greenvale developed / Gilded Crossing route context`;
   - all accepted shared transforms remain equal.

Direct visual and product review is mandatory. Green CI alone is not acceptance.

## Acceptance

`AURELIAN_DECISION_LOOP_PASS` only if:

- the strategic reason, nearby land choice and local settlement consequence form one immediately understandable chain;
- each transition answers a different question: WHY, WHERE, HOW;
- World does not collapse into a distant Map;
- Map does not become a second Village;
- Village does not claim a new economy or simulation;
- markers remain subordinate to the landscape;
- shared geography and accepted view results do not regress.

An uninformed reviewer should understand each transition within roughly three seconds.

## Correction and stop

One meaningful candidate is allowed.

If evidence is technically valid but one bounded presentation defect blocks the chain, exactly one evidence-backed visual correction is allowed on the same technique. After that, classify only:

- `AURELIAN_DECISION_LOOP_PASS`;
- `AURELIAN_DECISION_LOOP_REJECT`.

A correctness or infrastructure repair needed only to produce the already-defined evidence does not consume the visual correction, but it must not add polish.

Stop after direct exact-head artifact review and terminal classification. No next product milestone is authorized by this contract.
