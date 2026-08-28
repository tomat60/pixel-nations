# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-28
Current state revision: Aurelian First Imperial Expansion v1 proposed
Authority source: this file on the current `main`
Authority baseline SHA: `f43921e39cb671af7e3fef73f95e6b5090c36d5b`
Product baseline SHA: `f18a335b0f0b65a1c3611a3af76f189f86ae2f02`
Current milestone: Aurelian First Imperial Expansion v1 authorized for exactly one bounded implementation candidate
Active execution issue: #538
Next allowed action: implement exactly one Godot Aurelian First Imperial Expansion v1 candidate under the accepted contract, then run exact-head evidence and direct review.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire -> crisis -> rival -> frontier payoff -> first imperial expansion`

The playable demonstration remains Sector A-01 / Aurelian Basin. Godot is the target runtime under ADR-001. Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Most recent accepted product milestone

PR #536 `Implement Godot Aurelian First Frontier Payoff v1` is terminally accepted and merged.

Terminal result: `GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_PASS`.

- accepted head: `49abd2dd5faa06ea5fb5e1065f63fbb77a8ddb19`;
- merged product baseline: `f18a335b0f0b65a1c3611a3af76f189f86ae2f02`;
- `stand_firm` deterministically derives `Secure Gilded Crossing`;
- `negotiate_passage` deterministically derives `Ratify East Bridge Passage`;
- only the payoff derived from the persisted rival response is available;
- World reveals why the payoff exists;
- Map shows the existing Gilded Crossing or East Bridge locus before and after secure;
- Village exposes one deliberate payoff action;
- pending and secured states are visibly distinct;
- Trade, Expand or Frontier identity, River Surge response and rival response remain intact;
- Session Persistence v2 preserves the exclusive payoff across native restart, Web reload and profile reopen;
- shared Aurelian geography and the accepted GLB are unchanged;
- direct still, motion and persistence review passed without a visual correction.

Accepted exact-head evidence:

- Playable Entry run `33158323315`, artifact `9680837012`, digest `sha256:fca78828af0df346e5dbbfb9d3e027939d213df0550c78b5c23778504af2cb2d`;
- Web Playability run `33158323353`, artifact `9680685000`, digest `sha256:5dbb5b51a582ecb45eefbf42374c94f1f838ee4d2697905d828adbf2bf9d241a`;
- Session Persistence v2 run `33158323384`, artifact `9680706119`, digest `sha256:18f55d761fd716640ed143a446cc994d56d03285b77cdd2442ab17f6999b5abe`.

Issue #534 is completed. First Frontier Payoff v1 must not be reopened.

## Strategy decision

The accepted first-run arc now closes coherently, but the playable product still owns only one land inside a finite 10,000-land world. Another aftermath microstate would not materially advance the game fantasy.

The next bounded milestone therefore makes the world premise playable by claiming exactly one adjacent second land at the existing North Ridge locus.

This is not a repeatable expansion system. It does not add new terrain, a third land, a second settlement, an economy or combat.

## Current authority

Issue #538 and `docs/GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_V1_CONTRACT.md` authorize exactly one bounded implementation candidate:

`completed frontier legacy -> World identifies North Ridge as the adjacent expansion direction -> Map inspects the existing North Ridge land -> explicit Claim North Ridge -> Map shows Greenvale homeland plus North Ridge claimed -> Village keeps Greenvale as imperial capital administering two lands -> World records the first two-land imperial footprint`

The candidate must:

- keep East Route claimed and Greenvale as the imperial capital;
- reveal only the existing North Ridge locus after a completed frontier payoff;
- require deliberate normal input to inspect and claim North Ridge;
- add exactly one second-land claim and no third-land path;
- preserve Trade, Expand or Frontier identity, empire proclamation, River Surge response, rival response and First Frontier Payoff;
- keep Village as HOW, Map as WHERE and World as WHY / WHICH DIRECTION;
- preserve river, bridge, Greenvale, North Ridge, Gilded Crossing, route, landmark and camera transforms;
- use restrained ownership cues on existing procedural geometry;
- make the second claim idempotent with one event;
- persist both claims across native restart, Web reload and profile reopen;
- produce exact-head Playable Entry, Web Playability and Session Persistence evidence;
- receive direct still and normal-input motion review.

Green CI alone is not acceptance. One bounded visual correction maximum is allowed. Terminal classification must be exactly:

- `GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_PASS`; or
- `GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_REJECT`.

## Allowed scope

- one exact First Imperial Expansion manifest;
- exactly one fixed adjacent second land at the existing North Ridge locus;
- one explicit `Claim North Ridge` action on Map;
- focused Godot controller, HUD and Session Persistence v2 changes;
- restrained procedural ownership cues;
- focused tests and narrowly scoped evidence workflow changes;
- contract-linked documentation.

## Forbidden scope

- third land, land picker, procedural land generation or repeatable expansion;
- settlement, city, workers, construction or economy on North Ridge;
- resources, costs, rewards, timers, population or pressure meters;
- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, diplomacy, governance simulation or border conflict;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, camera, asset family, dependency, paid asset or paid tool;
- broad visual polish, broad CI changes, public-shell work, P12 or MAX.

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
2. `docs/GODOT_AURELIAN_FIRST_IMPERIAL_EXPANSION_V1_CONTRACT.md`;
3. active execution issue #538;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PR #536;
7. issue #415 as shared-geography history and continuity guidance;
8. completed issue #534 and older contracts as history only;
9. older issues, PRs, briefs and reports.

## Current stop condition

Stop after one accepted or rejected First Imperial Expansion v1 candidate. A PASS must be recorded here before any later strategy review. A REJECT must restore the accepted First Frontier Payoff baseline and record the exact reason.
