# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-29
Current state revision: North Ridge Outpost accepted; North Ridge Specialization v1 selected
Authority source: this file on the current `main`
Authority baseline SHA: `9f184cf9d48b512ee0e4551cfd0b3d6986814c81`
Product baseline SHA: `9f184cf9d48b512ee0e4551cfd0b3d6986814c81`
Current milestone: authorize exactly one Godot Aurelian North Ridge Specialization v1 candidate
Active execution issue: #547
Next allowed action: after this transition/contract merges with healthy checks, implement one bounded North Ridge Specialization v1 candidate covering both mutually exclusive outcomes.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire`

The playable demonstration remains Sector A-01 / Aurelian Basin. The current accepted arc now proves one founded empire with exactly two claimed lands and one established frontier outpost.

Godot remains the target runtime under ADR-001. Village, Map and World remain roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Accepted foundation

Preserve and reuse:

- one shared deterministic Aurelian geography and packaged GLB;
- Greenvale progression through settlement, city, capital and living-capital presentation;
- national direction, mandate and empire progression;
- River Surge, rival countermove and frontier-payoff history;
- exactly two claimed lands: `east_route` and `north_ridge`;
- North Ridge as the first established second-land outpost;
- normal-input Godot entry and cross-view navigation;
- Session Persistence v2 across native and Web;
- existing pinned/licensed assets and procedural presentation language.

Do not rebuild accepted geography, cameras, persistence architecture or earlier progression.

## Most recent accepted product milestone

PR #546 `Implement Godot Aurelian North Ridge Outpost v1` is accepted and merged.

Terminal result: `GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_PASS`.

- accepted exact head: `f7ebca102fdb7d660761b5b4c5fc9ce5335bbb77`;
- merged product baseline: `9f184cf9d48b512ee0e4551cfd0b3d6986814c81`;
- outcome: two-land imperial footprint -> World frontier need -> Map claimed inspection -> explicit `Establish North Ridge Outpost` -> Map established outpost -> Greenvale administration -> World held frontier;
- exactly one persisted outpost exists at the accepted North Ridge locus;
- claimed and established Map states are visibly distinct;
- exactly `east_route` and `north_ridge` remain claimed;
- native restart, Web reload and same-profile reopen restore the established outpost;
- shared geography, cameras, Greenvale capital and all accepted earlier progression remain intact;
- exact-head Playable, Web, Persistence, Foundation, Pixel Nations CI and Visual QA completed successfully;
- direct still and normal-input review passed without a visual correction.

PR #546 and issue #542 are complete and must not be reopened as implementation work.

## Strategy decision

The project should not add a third land yet. North Ridge now exists as a meaningful location but still lacks a player-authored role.

The next milestone therefore deepens the second land with one mutually exclusive strategic specialization:

- `Trade Post` for logistics/trade identity;
- `Watch Post` for vigilance/frontier identity.

This creates a real decision and stronger visible differentiation without prematurely introducing economy or combat simulation.

Binding contract: `docs/GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_V1_CONTRACT.md`.

## Current authority

Issue #547 and the specialization contract authorize one candidate after this transition merges.

Required outcome:

`held frontier -> inspect established North Ridge -> choose specialization -> Commit Trade Post / Commit Watch Post -> visibly specialized North Ridge -> Greenvale administration consequence -> World frontier posture`

The candidate must:

- preserve exactly two lands and one North Ridge outpost;
- expose exactly one mutually exclusive persisted specialization choice;
- make Trade Post and Watch Post visually distinct at a glance;
- strengthen the North Ridge composition beyond the base outpost;
- preserve Village HOW, Map WHERE and World WHY roles;
- preserve all accepted empire/crisis/rival/frontier history;
- persist across native restart, Web reload and same-profile reopen;
- use existing geometry/materials/assets only;
- provide exact-head motion, still and persistence evidence.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- Session Persistence v2 extension for one specialization fact;
- existing manifests/layout/presentation helpers;
- focused Playable/Web/Persistence workflow adjustments required for evidence.

## Forbidden scope

- third land or repeatable land expansion;
- second settlement/city progression;
- resource economy, prices, production, workers, queues or timers;
- combat simulation, units, damage or victory/defeat;
- full diplomacy/governance systems;
- new terrain, geography, GLB, camera, dependency or asset family;
- backend, accounts, multiplayer;
- React/SVG/CSS final-game rebuild;
- broad unrelated infrastructure work;
- P12, MAX or paid tools.

## Process acceleration rules

1. Optimize for visible playable progress, not gate count.
2. One active product/recovery PR at a time.
3. Use one implementation PR for one coherent player outcome; do not split logically inseparable branches into separate PRs.
4. Use focused Godot tests during iteration; run full exact-head evidence at the final candidate gate.
5. Directly inspect running-game screenshots and motion; green CI alone is not acceptance.
6. Any product-head movement invalidates older product evidence.
7. Fix deterministic failures at root cause on the same PR; rerun only the smallest isolated infrastructure failure.
8. After merge, verify the merge SHA and current main before new product implementation.
9. **When a milestone already has terminal exact-head PASS, no unresolved blocker, and a verified merge, combine its PASS recording with the next bounded strategy/contract authorization in one documentation transition PR. Do not spend a separate CI cycle on a standalone acceptance-record PR unless the next direction is genuinely undecided or risky.**
10. Prefer larger vertical-slice milestones that improve at least two of: strategic choice, visible world change, gamefeel, progression readability.

## Tool and cost policy

- Strategy/control/direct review: GPT-5.6 Sol.
- Deterministic GitHub/Godot tooling first.
- Cursor as executor when materially useful: GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- No paid asset/tool without a named blocker and explicit value case.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. `docs/GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_V1_CONTRACT.md`;
3. active execution issue #547;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PR #546;
7. operating and QA protocols;
8. older issues, PRs and contracts as history only.

## Current stop condition

This transition stops when the North Ridge Outpost PASS is recorded and North Ridge Specialization v1 is authorized on `main` with healthy checks. Then implement exactly one bounded specialization candidate and stop at direct exact-head PASS or REJECT before any third land, economy or combat expansion.
