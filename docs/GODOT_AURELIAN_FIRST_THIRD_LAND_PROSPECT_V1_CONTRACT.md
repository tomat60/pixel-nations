# Godot Aurelian First Third-Land Prospect v1 Contract

Status: PROPOSED FOR AUTHORIZATION
Execution issue: #559
Authority baseline: `main@cf952cc055af15370bcc99a71893b8f9aa7c83ab`
Runtime: Godot 4.7.1, GDScript, Compatibility renderer
MAX: OFF
Extra spend target: 0 USD

## Product decision

First Inter-Land Coordination v1 proves that Greenvale and North Ridge can operate as one persistent two-land system. The next bounded milestone may reveal and survey exactly one existing prospect beyond those claimed lands.

The accepted coordination branch determines the only available prospect:

- `ridge_convoy_dispatched` permits `Survey South Marsh`.
- `basin_alert_raised` permits `Survey Northgate`.

This milestone does not claim a third land. It adds one branch-specific, persistent prospect using existing Aurelian topology.

## Required normal-input flow

`completed two-land coordination -> World identifies one branch-specific direction -> Map inspects the existing prospect transform -> Village commissions the matching survey -> Map records one surveyed prospect -> Greenvale acknowledges the report -> World records the next imperial direction`

All reviewed transitions must use normal product input. Test helpers may prepare valid prerequisite profiles but may not replace the reviewed interaction.

## Branch behavior

### Trade network path

Prerequisite:

- `first_inter_land_coordination=ridge_convoy_dispatched`

The only available action is `Survey South Marsh`.

After commitment:

- Map shows one restrained surveyed-prospect cue at the accepted `SouthMarsh` transform.
- Village explains how Greenvale commissions and receives the survey.
- World explains why South Marsh is the next possible imperial direction.

### Watch network path

Prerequisite:

- `first_inter_land_coordination=basin_alert_raised`

The only available action is `Survey Northgate`.

After commitment:

- Map shows one restrained surveyed-prospect cue at the accepted `Northgate` transform.
- Village explains how Greenvale commissions and receives the survey.
- World explains why Northgate is the next possible imperial direction.

The outcomes are mutually exclusive. No profile may reveal, survey or retain both prospects.

## Persistence contract

Session Persistence v2 stores exactly one new field:

`first_third_land_prospect`

Allowed values:

- `south_marsh_surveyed`
- `northgate_surveyed`

An older valid profile without prospect data remains incomplete and may expose the matching survey. Unknown values, cross-branch combinations, completion before coordination, duplicate completion and both-result combinations are rejected.

The result must survive leaving and reopening all views, native restart, Web reload and profile reopen.

## Event contract

Each profile emits exactly one terminal event:

- `AURELIAN_FIRST_THIRD_LAND_PROSPECT=SOUTH_MARSH_SURVEYED`
- `AURELIAN_FIRST_THIRD_LAND_PROSPECT=NORTHGATE_SURVEYED`

Restore and reopen must not emit another terminal event.

## View roles and geography

- Village remains HOW.
- Map remains WHERE.
- World remains WHY/WHICH DIRECTION.
- East Route and North Ridge remain the only claimed lands.
- Greenvale remains the capital.
- The established outpost, specialization, payoff and coordination result remain intact.
- `SouthMarsh=[365,690]` and `Northgate=[445,65]` remain at their accepted transforms.
- One physical Aurelian Basin geography is reused across all views.
- No branch-specific geography, camera or land placement is allowed.

## Visual direction

Use restrained procedural cues on existing topology:

- South Marsh may use one cyan survey ring, reed-edge pulse or report marker.
- Northgate may use one pale survey ring, gate beacon or ridge-line marker.

A prospect must read as surveyed but unclaimed. It may not use the claimed-land hex, settlement, outpost or ownership presentation.

## Allowed implementation surface

A bounded candidate may change only the smallest necessary set of:

- Aurelian controller and HUD flow
- Session Persistence v2
- procedural prospect cues on existing geography
- one exact implementation manifest
- focused contract and regression tests
- Playable, Web and Persistence evidence capture

## Forbidden scope

- claiming South Marsh or Northgate
- any third settlement, second outpost or repeatable exploration
- resources, prices, inventory, yields, production, workers, queues or timers
- simulated units, pathfinding, combat, attacks, damage or victory states
- new terrain, GLB, camera, asset family, dependency or separate geography
- backend, multiplayer, app/play/public shell, P12, MAX, paid tools or extra spend

## Evidence requirements

Exact-head evidence must cover both valid origins and prove:

1. the accepted coordination result before prospect reveal
2. World revealing only the matching direction
3. Map inspection at the unchanged prospect transform
4. the explicit survey action in Village
5. one normal-input commitment
6. one visibly surveyed but unclaimed Map prospect
7. Village acknowledging the report
8. World recording the next imperial direction
9. exactly one matching terminal event
10. persistence after native restart for one branch
11. persistence after Web reload and profile reopen for the other branch
12. rejection of cross-branch, duplicate, premature, unknown and both-result values
13. exactly two claimed lands, accepted prior progression and unchanged shared geography
14. no land claim, settlement, outpost or repeatable survey

Required workflows:

- Godot Foundation
- Playable Entry
- Web Playability
- Session Persistence v2
- standard repository guards

Green CI alone is not acceptance. Direct review must inspect stills, normal-input motion, events, manifests and persistence summaries for both branches.

## Terminal classification

At most one bounded correction is allowed.

Terminal classes:

- `GODOT_AURELIAN_FIRST_THIRD_LAND_PROSPECT_PASS`
- `GODOT_AURELIAN_FIRST_THIRD_LAND_PROSPECT_REJECT`

## Stop condition

Stop after one accepted or rejected candidate. No third-land claim or broader expansion system is authorized by this contract.
