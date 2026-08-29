# Godot Aurelian North Ridge Specialization v1 Contract

Status: PROPOSED FOR AUTHORIZATION
Execution issue: #547
Runtime: Godot 4.7.1 / existing Aurelian shared geography
MAX: OFF
Extra spend target: 0 USD

## Product outcome

Deepen the established North Ridge outpost into the first meaningful second-land strategic choice without adding a third land or a broad new system.

Player path:

`held two-land frontier -> inspect established North Ridge -> choose specialization -> explicit Commit Trade Post / Commit Watch Post -> visibly specialized North Ridge -> Greenvale administration acknowledges choice -> World reflects frontier posture`

The choice is mutually exclusive and persisted:

- `Trade Post`: logistics/trade identity, stronger route/activity presentation;
- `Watch Post`: vigilance/frontier identity, stronger lookout/signal presentation.

## Required behavior

1. North Ridge outpost must already be established.
2. Player deliberately selects exactly one specialization.
3. Selection is explicit and produces exactly one specialization event.
4. Trade Post and Watch Post are visually distinct at a glance.
5. Map shows the specialized North Ridge at the same accepted locus.
6. Village/Greenvale administration acknowledges the selected frontier role.
7. World reflects the selected frontier posture without becoming a dashboard.
8. Choice persists across native restart, Web reload and same-profile reopen.
9. Exactly two lands remain owned: `east_route` and `north_ridge`.
10. Existing Greenvale capital, empire, crisis/rival/frontier history and shared geography remain intact.

## Visual direction

Use the existing low-poly/procedural language and pinned materials. Do not create a new art family.

Trade Post should read through restrained logistics cues: route-facing staging, cargo/marker rhythm, activity emphasis.

Watch Post should read through vertical lookout/signal cues: stronger silhouette, beacon/standard rhythm, frontier vigilance emphasis.

Both outcomes must improve North Ridge composition over the base outpost state.

## Allowed files

- `game/scenes/aurelian/**`
- `game/tests/**`
- Session Persistence v2 implementation
- existing manifests/layout/presentation helpers
- existing focused Playable/Web/Persistence evidence workflows when required

## Forbidden

- third land, land picker or repeatable expansion
- second settlement/city progression
- resource economy, costs, rewards, production, workers, queues or timers
- combat simulation, units, attacks, damage or victory/defeat
- full diplomacy or governance system
- new terrain, GLB, cameras, dependency or asset family
- backend, accounts, multiplayer, P12, MAX or paid tools
- broad unrelated infrastructure changes

## Execution model

Use one implementation PR and the fast proof-driven loop:

`implement -> focused Godot tests -> run/capture -> direct visual/gamefeel review -> at most one bounded correction -> final exact-head gate`

Do not create separate PRs for Trade Post and Watch Post. They are one player choice and one milestone.

## Evidence

Final exact head must provide:

- established unspecialized North Ridge;
- specialization choice/action evidence;
- Trade Post result;
- Watch Post result;
- Greenvale administration consequence;
- World posture consequence;
- normal-input/deterministic motion proof;
- native/Web persistence proof;
- regression proof for exactly two lands and accepted progression.

Green CI is necessary but not sufficient.

## Acceptance

Terminal classification:

- `GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_PASS`
- `GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_REJECT`

PASS requires both branches to be understandable and visually distinct without explanation.

## Stop condition

Stop after one accepted or rejected candidate. One bounded correction maximum. If the two outcomes remain visually weak after that correction, change the presentation/art strategy rather than micro-polishing.
