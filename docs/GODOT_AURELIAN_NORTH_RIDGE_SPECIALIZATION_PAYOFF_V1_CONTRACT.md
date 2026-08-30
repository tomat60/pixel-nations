# Godot Aurelian North Ridge Specialization Payoff v1 Contract

Status: AUTHORIZED
Issue: #551
Authority baseline: `main@5a97741123eeb663010600df497da9935c880208`

## Product outcome

Turn the accepted North Ridge specialization into one immediate, visible, persistent frontier payoff.

The player must activate the already chosen role through one deliberate action:

- Trade Post: `Open Ridge Logistics Line`
- Watch Post: `Light North Ridge Signal`

The choice is inherited from North Ridge Specialization v1. This slice does not offer a second specialization choice and does not allow switching branches.

## Required normal-input flow

`specialized North Ridge -> World reveals branch payoff -> Map inspects North Ridge -> Village commits the branch action -> visibly activated North Ridge -> Greenvale acknowledges the consequence -> World reflects the active frontier role`

All transitions must use normal product input. Test-only shortcuts may prepare profiles but may not replace the reviewed interaction.

## Branch behavior

### Trade Post

The existing Trade Post exposes `Open Ridge Logistics Line`.

After the action:

- North Ridge shows a visibly active logistics line connected to the existing outpost.
- Map communicates where the active logistics role exists.
- Village communicates how Greenvale administers the activated role.
- World communicates why the active logistics role matters to imperial direction.

### Watch Post

The existing Watch Post exposes `Light North Ridge Signal`.

After the action:

- North Ridge shows a visibly lit signal at the existing outpost.
- Map communicates where the active vigilance role exists.
- Village communicates how Greenvale administers the activated role.
- World communicates why the active vigilance role matters to imperial direction.

The two outcomes must remain visually and semantically distinct.

## Persistence contract

Session Persistence v2 stores exactly one field:

`north_ridge_specialization_payoff`

Allowed values:

- `ridge_logistics_line_open`
- `ridge_signal_lit`

The persisted value must agree with the accepted specialization:

- `trade_post` requires `ridge_logistics_line_open`
- `watch_post` requires `ridge_signal_lit`

Missing payoff data in an older valid specialization profile is treated as not yet activated. Unknown values, cross-branch combinations, duplicate activations, and activation before specialization are rejected.

The outcome must survive:

- leaving and reopening the relevant views
- native restart
- Web reload
- profile reopen

## Event contract

Each profile emits exactly one terminal event:

- `AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF=RIDGE_LOGISTICS_LINE_OPEN`
- `AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF=RIDGE_SIGNAL_LIT`

No repeated activation event is allowed after restore or reopen.

## View roles and geography

- Village is HOW.
- Map is WHERE.
- World is WHY/WHICH DIRECTION.
- East Route and North Ridge remain the only claimed lands.
- Greenvale remains the capital.
- The established North Ridge outpost and chosen specialization remain intact.
- One physical Aurelian Basin geography is reused across all views.
- No camera, terrain, landmark, or land placement may imply a second geography.

## Visual direction

Use procedural cues on the existing North Ridge outpost.

Allowed cues include:

- Trade Post: a route marker, cargo movement cue, or illuminated logistics trace.
- Watch Post: a signal flame, beacon glow, or elevated vigilance cue.

The cue must be readable in direct review and must not require new assets, GLB files, terrain, or broad visual polish.

## Allowed implementation surface

A bounded candidate may change only the smallest necessary set of:

- Aurelian controller and HUD flow
- Session Persistence v2
- procedural cue logic on the existing North Ridge outpost
- focused contract and regression tests
- Playable, Web, and Persistence evidence capture
- one manifest for this slice

## Forbidden scope

- resources, prices, production, workers, timers, economy, or inventory
- combat, patrol simulation, diplomacy system, or rival response
- a third land, second outpost, second settlement, or repeatable expansion
- changing the accepted specialization
- new GLB, terrain, geography, camera language, or broad visual polish
- app/play/public shell, P12, MAX, paid tools, or extra spend

## Evidence requirements

Exact-head evidence must include both specialization origins and prove:

1. the accepted specialization before activation
2. World revealing the matching payoff
3. Map inspection of the existing North Ridge
4. the explicit branch action in Village
5. the visibly activated branch result
6. Map retaining exactly two claimed lands
7. Greenvale acknowledging the consequence
8. World reflecting the active frontier role
9. exactly one matching event
10. persistence after native restart for one branch
11. persistence after Web reload and profile reopen for the other branch
12. rejection of cross-branch, duplicate, premature, and unknown persistence values
13. unchanged shared Aurelian Basin geography and all earlier progression

Required exact-head workflows:

- Godot Foundation
- Playable Entry
- Web Playability
- Session Persistence v2
- standard repository guards

Green CI alone is not acceptance. Direct review must inspect stills, normal-input motion, event evidence, manifests, and persistence summaries.

## Terminal classification

At most one bounded correction is allowed.

Terminal classes:

- `GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF_PASS`
- `GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF_REJECT`

A PASS requires complete exact-head evidence and direct review of both branch outcomes.
