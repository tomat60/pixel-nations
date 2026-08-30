# Godot Aurelian First Inter-Land Coordination v1 Contract

Status: PROPOSED FOR AUTHORIZATION
Execution issue: #555
Authority baseline: `main@68ca85b49602125bc4829fe71de1288eb760aefd`
Runtime: Godot 4.7.1, GDScript, Compatibility renderer
MAX: OFF
Extra spend target: 0 USD

## Product decision

North Ridge Specialization Payoff v1 proves that the chosen outpost role can be activated and persisted. The next bounded milestone must make Greenvale and North Ridge act as one two-land empire through one deliberate, branch-specific operation.

First Inter-Land Coordination v1 adds exactly one completed coordination fact. It does not add an economy, simulated units, combat, a third land, repeatable operations or a generic mission system.

## Required normal-input flow

`active North Ridge payoff -> World identifies the coordination need -> Map inspects the Greenvale to North Ridge link -> Village commits the matching operation -> Map shows the coordinated result -> Greenvale acknowledges completion -> World records a functioning two-land empire`

All reviewed transitions must use normal product input. Test helpers may prepare valid prerequisite profiles but may not replace the reviewed interaction.

## Branch behavior

### Trade Post path

Prerequisites:

- `north_ridge_specialization=trade_post`
- `north_ridge_specialization_payoff=ridge_logistics_line_open`

The only available operation is `Dispatch Ridge Convoy`.

After commitment:

- Map shows a restrained active convoy or logistics pulse between Greenvale and North Ridge.
- Village explains how Greenvale dispatches and administers the operation.
- World explains why the operation makes the two-land empire function as one network.

### Watch Post path

Prerequisites:

- `north_ridge_specialization=watch_post`
- `north_ridge_specialization_payoff=ridge_signal_lit`

The only available operation is `Raise Basin Alert`.

After commitment:

- Map shows a restrained coordinated signal response between North Ridge and Greenvale.
- Village explains how Greenvale receives and acts on the alert.
- World explains why the operation makes the two-land empire function as one defensive network.

The two outcomes must remain visually and semantically distinct. No profile may switch paths or complete both.

## Persistence contract

Session Persistence v2 stores exactly one new field:

`first_inter_land_coordination`

Allowed values:

- `ridge_convoy_dispatched`
- `basin_alert_raised`

The stored result must agree with the accepted specialization and payoff:

- `trade_post` plus `ridge_logistics_line_open` requires `ridge_convoy_dispatched`
- `watch_post` plus `ridge_signal_lit` requires `basin_alert_raised`

An older valid profile without coordination data remains incomplete and may expose the matching operation. Unknown values, cross-branch combinations, completion before payoff, duplicate completion and both-result combinations are rejected.

The result must survive:

- leaving and reopening Village, Map and World
- native restart
- Web reload
- profile reopen

## Event contract

Each profile emits exactly one terminal event:

- `AURELIAN_FIRST_INTER_LAND_COORDINATION=RIDGE_CONVOY_DISPATCHED`
- `AURELIAN_FIRST_INTER_LAND_COORDINATION=BASIN_ALERT_RAISED`

Restore and reopen must not emit another terminal event.

## View roles and geography

- Village remains HOW.
- Map remains WHERE.
- World remains WHY/WHICH DIRECTION.
- East Route and North Ridge remain the only claimed lands.
- Greenvale remains the capital.
- The established outpost, chosen specialization and activated payoff remain intact.
- One physical Aurelian Basin geography is reused across all views.
- Greenvale, North Ridge, river, bridge, routes and all accepted landmarks remain at their existing transforms.
- No separate branch geography, camera or land placement is allowed.

## Visual direction

Use restrained procedural cues on the existing geography.

Allowed examples:

- Trade path: one convoy marker, cargo pulse or route activity trace moving from Greenvale toward North Ridge.
- Watch path: one signal relay, alert pulse or coordinated beacon response between North Ridge and Greenvale.

The cue must show coordination between both accepted lands and remain readable in direct still and motion review. It may not require new assets, GLB files, terrain, cameras or broad visual polish.

## Allowed implementation surface

A bounded candidate may change only the smallest necessary set of:

- Aurelian controller and HUD flow
- Session Persistence v2
- procedural coordination cues on the existing shared geography
- one exact implementation manifest
- focused contract and regression tests
- Playable, Web and Persistence evidence capture

## Forbidden scope

- resource prices, inventory, yields, production, workers, queues or timers
- simulated units, pathfinding, combat, attacks, damage or victory states
- third land, second settlement, second outpost or repeatable expansion
- repeatable operations, random missions or a generic mission system
- changing the accepted specialization or payoff
- new terrain, GLB, camera, asset family, dependency or separate geography
- app/play/public shell, P12, MAX, paid tools or extra spend

## Evidence requirements

Exact-head evidence must cover both valid origins and prove:

1. the accepted specialization and payoff before coordination
2. World revealing only the matching operation
3. Map inspection of the unchanged Greenvale to North Ridge link
4. the explicit branch action in Village
5. one normal-input commitment
6. the visibly coordinated Map result involving both lands
7. Village acknowledging completion
8. World recording a functioning two-land empire
9. exactly one matching terminal event
10. persistence after native restart for one branch
11. persistence after Web reload and profile reopen for the other branch
12. rejection of cross-branch, duplicate, premature, unknown and both-result values
13. exactly two claimed lands, accepted prior progression and unchanged shared geography
14. no second operation, third land or repeatable path

Required exact-head workflows:

- Godot Foundation
- Playable Entry
- Web Playability
- Session Persistence v2
- standard repository guards

Green CI alone is not acceptance. Direct review must inspect stills, normal-input motion, events, manifests and persistence summaries for both branches.

## Terminal classification

At most one bounded correction is allowed.

Terminal classes:

- `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`
- `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_REJECT`

A PASS requires complete exact-head evidence and direct review of both branch-specific coordination outcomes.

## Stop condition

Stop after one accepted or rejected candidate. No economy, combat, third land, repeatable operation or broader mission system is authorized by this contract.
