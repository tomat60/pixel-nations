# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-28
Current state revision: Aurelian North Ridge Outpost v1 proposed
Authority source: this file on the current `main`
Authority baseline SHA: `ba3238f63cb53c4c11c25697b322d5f24e75d66c`
Product baseline SHA: `2cdc419634e3caf547b4e2716aa75d3265bbdca5`
Current milestone: Aurelian North Ridge Outpost v1 authorized for exactly one bounded implementation candidate
Active execution issue: #542
Next allowed action: implement exactly one Godot Aurelian North Ridge Outpost v1 candidate under the accepted contract, then run exact-head evidence and direct review.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire -> crisis -> rival -> frontier payoff -> first imperial expansion -> first second-land use`

The playable demonstration remains Sector A-01 / Aurelian Basin. Godot is the target runtime under ADR-001. Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Most recent accepted product milestone

PR #540 `Implement Godot Aurelian First Imperial Expansion v1` is terminally accepted and merged.

Terminal result: `GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_PASS`.

- accepted head: `5dced8cc3cc0deb05a187c505b202c48796d3a53`;
- merged product baseline: `2cdc419634e3caf547b4e2716aa75d3265bbdca5`;
- East Route remains the first claimed land and North Ridge becomes the only second claimed land;
- World identifies North Ridge as the adjacent expansion direction;
- Map requires deliberate inspection and explicit `Claim North Ridge`;
- the claim emits exactly one event and exposes no third-land or repeatable path;
- Village keeps Greenvale as the imperial capital administering two lands;
- Session Persistence v2 restores exactly `east_route` and `north_ridge` across native restart, Web reload and profile reopen;
- one shared Aurelian geography and all accepted direction, empire, crisis, rival and frontier-payoff state remain intact;
- direct still, normal-input motion and persistence review passed without a visual correction.

Accepted exact-head evidence:

- Playable Entry run `33197402661`, artifact `9696609483`, digest `sha256:b29b4415f0d62aa98d9c2ed03c7729f590cd30d3dc86d5283e48531f0ffdd917`;
- Web Playability run `33197402739`, artifact `9696503715`, digest `sha256:89037a620d16791eb88d4232bdddbd97414827378b9914f060bb9ae3a9ccc770`;
- Session Persistence v2 run `33197402673`, artifact `9696507358`, digest `sha256:0693cc135a439762c74d2759147c27b917f4fc112f5b16ff8964e8545834e5c0`.

Issue #538 is completed. First Imperial Expansion v1 must not be reopened.

## Strategy decision

The empire now owns North Ridge, but ownership alone is not yet a meaningful second-land result. A third land or repeatable expansion would widen the map before the new land has any use.

The next bounded milestone therefore establishes exactly one fixed frontier outpost at the already claimed North Ridge locus. This is the first visible use of the second land, not a second settlement progression, economy, construction system or unit layer.

## Current authority

Issue #542 and `docs/GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_V1_CONTRACT.md` authorize exactly one bounded implementation candidate:

`two-land imperial footprint -> World explains why North Ridge must be held -> Map inspects claimed North Ridge -> Village exposes explicit Establish North Ridge Outpost -> Map shows one established outpost at North Ridge -> Village confirms Greenvale administers the outpost -> World records a held two-land frontier`

The candidate must:

- require the accepted North Ridge claim and exactly two owned lands;
- require deliberate normal input to inspect and establish the outpost;
- create exactly one persisted North Ridge outpost and one establishment event;
- make claimed-without-outpost and established-outpost visibly distinct;
- keep Greenvale as imperial capital administering both lands;
- preserve Trade, Expand or Frontier identity, empire, River Surge response, rival response, First Frontier Payoff and First Imperial Expansion;
- keep Village as HOW, Map as WHERE and World as WHY / WHICH DIRECTION;
- preserve river, East Bridge, Greenvale, North Ridge, Gilded Crossing, route, landmark and camera transforms;
- use restrained procedural geometry and existing materials only;
- expose no second-outpost, second-settlement, third-land or repeatable path;
- persist across native restart, Web reload and profile reopen;
- produce exact-head Playable Entry, Web Playability and Session Persistence evidence;
- receive direct still and normal-input motion review.

Green CI alone is not acceptance. One bounded visual correction maximum is allowed. Terminal classification must be exactly:

- `GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_PASS`; or
- `GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_REJECT`.

## Allowed scope

- one exact North Ridge Outpost manifest;
- exactly one fixed outpost at the existing claimed North Ridge locus;
- one explicit `Establish North Ridge Outpost` action;
- focused Godot controller, HUD and Session Persistence v2 changes;
- restrained procedural outpost cues using existing geometry and materials;
- focused tests and narrowly scoped evidence workflow changes;
- contract-linked documentation.

## Forbidden scope

- third land, land picker, procedural land generation or repeatable expansion;
- second settlement progression, city, population, workers or build queue;
- resources, costs, rewards, timers, production or economy;
- multiple outposts or repeatable construction;
- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, diplomacy, governance simulation or border conflict;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, camera, asset family, dependency, paid asset or paid tool;
- broad visual polish, public-shell work, P12 or MAX.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Green CI is necessary but not sufficient for acceptance.
4. Directly inspect running-game images, motion and persistence artifacts.
5. Preserve the accepted shared geography and GLB.
6. Any head movement invalidates older evidence.
7. Fix deterministic failures at root cause on the same PR.
8. Rerun only the smallest failing job for isolated infrastructure failures.
9. After merge, verify fresh `main`, checks and available deployment status before authorizing another implementation.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not acceptance authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. `docs/GODOT_AURELIAN_NORTH_RIDGE_OUTPOST_V1_CONTRACT.md`;
3. active execution issue #542;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PR #540;
7. issue #415 as shared-geography history and continuity guidance;
8. completed issue #538 and older contracts as history only;
9. older issues, PRs, briefs and reports.

## Current stop condition

Stop after one accepted or rejected North Ridge Outpost v1 candidate. A PASS must be recorded here before any later strategy review. A REJECT must restore the accepted First Imperial Expansion baseline and record the exact reason.
