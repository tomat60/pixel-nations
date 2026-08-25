# Godot Aurelian First National Direction Commitment v1 Contract

Status: PROPOSED
Issue: #510
Authority baseline SHA: `10a13f434982483bb3f47fd0d11bcaa64d84fc87`
Product baseline SHA: `b803f13931b0608f2580a5cc30db50e30fc93d01`

## Strategy decision

The accepted playable path now reaches a founded nation and a living Greenvale capital, but every milestone still follows one linear chain. The next bounded slice must introduce meaningful agency rather than another automatic "first X" state or another cosmetic microstate.

Reuse the three accepted World directions, Trade, Expand and Frontier, as the first persistent national commitment. This is a choice of identity and strategic intent only. It does not simulate its later economic, territorial, civic or military consequences.

## Required player outcome

`World first nation founded -> inspect Trade / Expand / Frontier -> explicit Commit Aurelian Direction -> World direction committed -> Map homeland reflects the commitment -> Village capital reflects the commitment`

## Binding view roles

- World = WHY / WHICH DIRECTION. World owns inspection, selection and commitment.
- Map = WHERE. Map preserves the accepted homeland and shows only a restrained geographic context cue for the committed direction.
- Village = HOW. Village preserves Greenvale capital and shows only a restrained identity cue for the committed direction.
- All three views remain projections of one physical Aurelian geography.

Map and Village must not become secondary direction selectors.

## State and input semantics

1. The decision is available only after the accepted Aurelian nation and Greenvale capital states.
2. Before commitment, normal input allows inspection of exactly three existing choices: `trade`, `expand` and `frontier`.
3. Commitment requires a deliberate, explicit player action.
4. Exactly one value is persisted as `national_direction_committed`.
5. Commitment cannot silently grant resources, territory, laws, units or production.
6. Reopening World, Map and Village reflects the same committed value.
7. Native restart, Web reload and persistent-profile reopen restore it.
8. Denied-storage fallback remains deterministic and safe.
9. The accepted pre-nation sequence and existing persistence fields remain compatible.

## Presentation envelope

The three directions must be distinguishable through existing procedural presentation, labels, color, glyphs or standards. The treatment must remain restrained and legible.

- Trade may emphasize the accepted East Route context.
- Expand may point outward without claiming or rendering a second land.
- Frontier may emphasize the existing frontier direction without creating combat or territorial simulation.
- No cue may imply a system or payoff that does not exist.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Aurelian manifests, camera and layout definitions;
- the existing Session Persistence v2 schema;
- existing procedural helpers and repository assets;
- focused updates to Playable Entry, Web Playability and Session Persistence evidence workflows only when required.

## Forbidden scope

- economy, resources, costs, rewards, inventory, taxes or production;
- population, workers, timers or queues;
- another land, territorial expansion or multi-land simulation;
- governance, laws, factions, diplomacy or combat;
- empire progression;
- new GLB, terrain, geography or paid assets;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- broad CI or platform refactoring;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12, MAX or paid tools.

## Execution model

Use one serialized product PR and the proof-driven loop:

`implement -> focused Godot test -> deterministic capture -> direct still and motion review -> one bounded correction -> final exact-head gate`

Do not split the visible outcome into multiple product PRs unless a hard dependency makes it unavoidable.

## Exact-head evidence

The candidate must provide:

1. founded nation and living capital before commitment;
2. World inspection evidence for Trade, Expand and Frontier;
3. explicit commitment HUD or action;
4. one committed World state;
5. Map evidence with unchanged homeland geography and restrained direction context;
6. Village evidence with unchanged Greenvale capital and restrained direction identity;
7. normal-input leave and reopen sequence;
8. native restart restoration;
9. Web reload restoration;
10. persistent-profile reopen restoration;
11. focused contract tests and exact-head manifests;
12. shared-geography regression;
13. direct still and motion review.

Green CI is necessary but not sufficient.

## Terminal classification

- `GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_PASS`
- `GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_CORRECTION_REQUIRED`
- `GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_REJECT`

One bounded visual correction maximum after the first meaningful candidate.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not acceptance authority.

## Stop condition

This documentation contract stops when it is accepted on `main` with healthy exact-head and post-merge state.

Then authorize exactly one bounded implementation candidate and stop it at direct exact-head PASS, CORRECTION_REQUIRED or REJECT before any economy, second land, governance, combat or empire work.
