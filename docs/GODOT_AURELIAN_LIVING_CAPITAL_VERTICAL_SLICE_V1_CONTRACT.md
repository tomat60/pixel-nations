# Godot Aurelian Living Capital Vertical Slice v1 Contract

Status: PROPOSED
Execution issue: #506
Runtime: Godot 4.7.1
Executor: Cursor GPT-5.5 if used
MAX: OFF
Extra spend target: 0 USD

## Outcome

Produce one materially richer and more alive Aurelian capital vertical slice on the accepted shared geography while preserving the complete accepted progression through First Nation Founding.

This milestone is intentionally experiential, not systemic. It improves presentation, motion, gamefeel, readability and spatial density before deeper empire mechanics.

## Product target

The candidate must improve the existing accepted state rather than rebuild it:

- Greenvale capital reads as a deliberate civic center, not a sparse prototype cluster;
- settlement, city and capital are visually distinguishable at a glance;
- at least one accepted progression transition gains visible motion/reveal payoff;
- trade reads as activity rather than only a static marker;
- Village / Map / World framing is improved while remaining one geography;
- national identity is clearer without turning World or Map into a dashboard;
- input feedback makes consequence and state change easier to understand.

## Allowed scope

- `game/scenes/aurelian/**`
- `game/tests/**`
- existing Aurelian manifests, layout and camera definitions
- existing pinned/licensed assets already in the repository
- procedural presentation helpers inside the existing Godot scene system
- tween/animation/camera presentation tied to already accepted states
- one minimal focused workflow change only if required to capture or validate this candidate

## Forbidden scope

- economy, resource costs, rewards, inventory or taxes
- population simulation, workers, timers, queues or production systems
- another land or multi-land expansion
- governance, laws, diplomacy, factions or combat
- empire progression
- backend, accounts, cloud save or multiplayer
- React/SVG/CSS rebuilding of production game surfaces
- new paid assets, paid tools, MAX or paid image generation
- a new asset family unless the current asset envelope is proven insufficient
- broad CI/platform refactoring inside the product PR

## Execution loop

Use the short proof-driven loop during implementation:

1. implement one meaningful candidate;
2. run fast Godot import/state tests;
3. run the real scene or deterministic capture;
4. inspect screenshots and short motion evidence directly;
5. apply at most one bounded visual/gamefeel correction;
6. run full exact-head regression, persistence and Web evidence only on the final candidate.

Do not split this outcome into multiple tiny product PRs unless a hard dependency makes that unavoidable.

## Required evidence

The exact candidate head must include:

- settlement-state visual reference;
- city-state visual reference;
- capital-state visual reference;
- Map view with preserved geography and clearer nation/capital context;
- World view with preserved strategic role and clearer national presence;
- one short input-driven or deterministic motion capture demonstrating the improved transition/gamefeel;
- focused regression proving claim, founding, city, nation and persistence semantics remain intact;
- exact head identity for all accepted evidence.

## Acceptance

Green CI is necessary but not sufficient. Direct image/video review decides the product result.

Terminal classification:

- `AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_PASS`
- `AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_CORRECTION_REQUIRED`
- `AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_REJECT`

One bounded correction maximum after the first meaningful visual candidate.

## Stop condition

Stop before any empire, second-land, economy or governance implementation. PASS only when the candidate is materially better than the current First Nation baseline in both presentation and feel, while preserving the accepted core loop.