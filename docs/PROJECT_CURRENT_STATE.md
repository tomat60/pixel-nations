# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-27
Current state revision: Aurelian River Surge Crisis v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `a4be5db1bf55baac055f9a9985d5de698dfdf75d`
Product baseline SHA: `a4be5db1bf55baac055f9a9985d5de698dfdf75d`
Current milestone: Aurelian River Surge Crisis v1 completed
Active execution issue: #526
Next allowed action: one bounded strategy review and, only if justified, one separate documentation-only authority contract. No product implementation is currently authorized.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire -> crisis -> rival -> frontier payoff`

The playable demonstration remains Sector A-01 / Aurelian Basin. Godot is the target runtime under ADR-001. Village, Map and World are three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Accepted foundation

Do not rebuild the accepted deterministic Aurelian Basin geography, Blender to GLB to Godot pipeline, Production Village, Map and World, normal-input decision handoff, packaged runtime, Chromium Web export, Session Persistence v2, or the accepted progression from land claim through direction-specific first empire.

## Most recent accepted product milestone

PR #528 `Implement Godot Aurelian River Surge Crisis v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_RIVER_SURGE_CRISIS_PASS`;
- accepted head: `9488154dc368016f45abd143eb31254e77989998`;
- merged product baseline: `a4be5db1bf55baac055f9a9985d5de698dfdf75d`;
- World reveals River Surge and records the chosen imperial response;
- Map shows both existing response loci before commitment and the selected locus afterward;
- Village provides the explicit mutually exclusive choice `Shield Greenvale` or `Keep East Bridge Open`;
- Trade, Expand and Frontier identities remain intact;
- Session Persistence v2 preserves the chosen response across native restart, Web reload and profile reopen;
- the accepted river, Greenvale, East Bridge, landmarks, cameras and shared geography remain unchanged;
- no new asset, GLB, land, economy, governance, combat, P12 or MAX was introduced;
- direct review accepted stills, motion and persistence after the one allowed bounded visual correction.

Accepted exact-head evidence:

- Playable Entry run `33098586324`, artifact `9657750109`, digest `sha256:55f2647a5fc18e72b91d0f3cfea29319a1a38b5d49982ba523aaa285ab07809f`;
- Web Playability run `33098586310`, artifact `9657583208`, digest `sha256:939932e37d7f740b5dd18c835170319ccb7d2a6e6ea533a6bbb467e03c313b49`;
- Session Persistence v2 run `33098586292`, artifact `9657639928`, digest `sha256:0b2d75bbf3793305fd9e9ee64f710b59139ae75b662e246a0f73bbdd6254bef8`.

Issue #526 is completed by this accepted implementation.

## Current authority

No further product implementation is authorized.

The next allowed step is one bounded strategy review. Any executable successor requires a new issue and a separate documentation-only authority contract merged to `main` before implementation begins.

River Surge Crisis v1 is terminally accepted and must not be reopened. A successor must preserve:

- Village = HOW, Map = WHERE, World = WHY / WHICH DIRECTION;
- one physical Aurelian geography;
- both persistent River Surge response outcomes;
- the accepted direction-specific empire identity;
- exact-head evidence, direct review and one active product or recovery PR.

## Forbidden without new authority

- crisis resolution, rewards, penalties, costs, timers, damage or failure simulation;
- rival, frontier payoff or further post-crisis progression;
- another land or ownership change;
- economy, resources, population, workers or queues;
- governance, diplomacy, combat or units;
- backend, accounts, cloud save or multiplayer;
- new GLB, terrain, geography, asset family, dependency, paid asset or paid tool;
- P12 or MAX.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Green CI is necessary but not sufficient for acceptance.
4. Directly inspect running-game images, motion and persistence artifacts.
5. Preserve the accepted shared geography and GLB.
6. Any head movement invalidates older evidence.
7. Fix deterministic failures at root cause on the same PR.
8. Rerun only the smallest failing job for isolated infrastructure failures.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not acceptance authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. root `AGENTS.md`;
3. accepted ADRs, especially ADR-001;
4. accepted exact-head evidence and merged PR #528;
5. issue #415 as shared-geography history and continuity guidance;
6. historical issues, contracts, PRs, briefs and reports.

## Current stop condition

Stop. River Surge Crisis v1 is accepted. Do not begin another implementation until a bounded strategy review and a new authority contract explicitly authorize it.
