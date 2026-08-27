# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-27
Current state revision: Aurelian First Rival Countermove v1 authorized
Authority source: this file on the current `main`
Authority baseline SHA: `fae57449f1dc60b0d4849872f65424227ffdab9c`
Product baseline SHA: `a4be5db1bf55baac055f9a9985d5de698dfdf75d`
Current milestone: Aurelian First Rival Countermove v1 authorized for exactly one bounded implementation candidate
Active execution issue: #530
Next allowed action: implement exactly one Godot Aurelian First Rival Countermove v1 candidate under the accepted contract, then run exact-head evidence and direct review.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire -> crisis -> rival -> frontier payoff`

The playable demonstration remains Sector A-01 / Aurelian Basin. Godot is the target runtime under ADR-001. Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Accepted foundation

Do not rebuild the deterministic Aurelian Basin geography, Blender to GLB to Godot pipeline, Production Village, Map and World, normal-input decision handoff, packaged runtime, Chromium Web export, Session Persistence v2, or the accepted progression from land claim through direction-specific first empire and River Surge Crisis v1.

## Most recent accepted product milestone

PR #528 `Implement Godot Aurelian River Surge Crisis v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_RIVER_SURGE_CRISIS_PASS`;
- accepted head: `9488154dc368016f45abd143eb31254e77989998`;
- merged product baseline: `a4be5db1bf55baac055f9a9985d5de698dfdf75d`;
- World reveals River Surge and records the chosen imperial response;
- Map shows both existing response loci before commitment and the selected locus afterward;
- Village explicitly chooses `Shield Greenvale` or `Keep East Bridge Open`;
- Trade, Expand and Frontier identities remain intact;
- Session Persistence v2 preserves both mutually exclusive outcomes across native restart, Web reload and profile reopen;
- shared geography is unchanged;
- direct review accepted exact-head stills, motion and persistence after the one allowed bounded visual correction.

Accepted exact-head evidence:

- Playable Entry run `33098586324`, artifact `9657750109`, digest `sha256:55f2647a5fc18e72b91d0f3cfea29319a1a38b5d49982ba523aaa285ab07809f`;
- Web Playability run `33098586310`, artifact `9657583208`, digest `sha256:939932e37d7f740b5dd18c835170319ccb7d2a6e6ea533a6bbb467e03c313b49`;
- Session Persistence v2 run `33098586292`, artifact `9657639928`, digest `sha256:0b2d75bbf3793305fd9e9ee64f710b59139ae75b662e246a0f73bbdd6254bef8`.

Issue #526 is completed. River Surge Crisis v1 must not be reopened.

## Strategy decision

The accepted first-run arc now reaches crisis. The next bounded Day-90 step is the first rival reaction, not another progression tier, crisis resolution, economy or combat system.

Obsidian March reacts deterministically to the persisted River Surge response:

- `shield_greenvale` produces pressure at the existing East Bridge;
- `keep_east_bridge_open` produces legitimacy pressure at existing Greenvale.

The player must deliberately choose exactly one response:

- `Stand Firm`; or
- `Negotiate Passage`.

This is one persistent rival countermove, not rival AI, combat, diplomacy simulation or a new faction system.

## Current authority

Issue #530 and `docs/GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_V1_CONTRACT.md` authorize exactly one implementation candidate:

`recorded River Surge response -> World reveals derived Obsidian March countermove -> Map shows pressured existing locus -> Village explicitly chooses Stand Firm or Negotiate Passage -> Map shows selected existing-locus result -> World records first rival response`

The candidate must:

- derive the rival origin from the accepted persisted River Surge response;
- preserve Trade, Expand or Frontier identity and `empire_proclaimed=true`;
- use deliberate normal input for exactly two mutually exclusive responses;
- keep Village as HOW, Map as WHERE and World as WHY / WHICH DIRECTION;
- preserve all accepted river, bridge, landmark and camera geography;
- persist origin and response across native restart, Web reload and profile reopen;
- produce exact-head Playable Entry, Web Playability and Session Persistence evidence;
- receive direct still and motion review.

Green CI alone is not acceptance. One bounded visual correction maximum is allowed. Terminal classification must be exactly:

- `GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_PASS`; or
- `GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_REJECT`.

## Allowed scope

- one exact First Rival Countermove manifest;
- deterministic origin mapping from the two existing River Surge responses;
- exactly two actions: Stand Firm and Negotiate Passage;
- focused Godot controller, HUD and Session Persistence v2 changes;
- restrained procedural cues on existing Greenvale or East Bridge geometry;
- focused tests and narrowly scoped evidence workflow changes;
- contract-linked documentation.

## Forbidden scope

- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, turns, randomness or broad faction system;
- rewards, penalties, resources, costs, timers, economy or pressure meters;
- diplomacy or governance simulation;
- third origin, third response or direction-specific response matrix;
- frontier payoff or further post-rival progression;
- another land, ownership change, expansion or new settlement;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, asset family, dependency, paid asset or paid tool;
- broad visual polish, broad CI changes, P12 or MAX.

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
2. `docs/GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_V1_CONTRACT.md`;
3. active execution issue #530;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PR #528;
7. issue #415 as shared-geography history and continuity guidance;
8. historical issues, contracts, PRs, briefs and reports.

## Current stop condition

Stop after one accepted or rejected First Rival Countermove v1 candidate. A PASS must be recorded here before any frontier-payoff strategy review. A REJECT must restore the accepted River Surge baseline and record the exact reason.
