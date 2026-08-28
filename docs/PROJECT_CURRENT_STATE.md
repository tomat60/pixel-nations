# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-28
Current state revision: Aurelian First Rival Countermove v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `74a4362789a407853a41a0769ac3741d2e684119`
Product baseline SHA: `74a4362789a407853a41a0769ac3741d2e684119`
Current milestone: Aurelian First Rival Countermove v1 terminally accepted
Active execution issue: none
Next allowed action: one bounded strategy review and, only if justified, a separate documentation-only contract proposal. No further product implementation is authorized.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire -> crisis -> rival -> frontier payoff`

The playable demonstration remains Sector A-01 / Aurelian Basin. Godot is the target runtime under ADR-001. Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Most recent accepted product milestone

PR #532 `Implement Godot Aurelian First Rival Countermove v1` is accepted and merged.

Terminal result: `GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_PASS`.

- accepted head: `7f207ad74c6c816473d7589eb7074238449bab9c`;
- merged product baseline: `74a4362789a407853a41a0769ac3741d2e684119`;
- issue #530 is completed;
- Obsidian March derives its countermove deterministically from the persisted River Surge response;
- `shield_greenvale` pressures the existing East Bridge;
- `keep_east_bridge_open` pressures legitimacy at existing Greenvale;
- Village offers exactly `Stand Firm` and `Negotiate Passage`;
- Map records the selected result at the pressured existing locus;
- World explains the rival move and records the first rival response;
- Trade, Expand and Frontier identity remain intact;
- Session Persistence v2 preserves the origin and one mutually exclusive response across native restart, Web reload and profile reopen;
- shared river, bridge, Greenvale, routes, landmarks and cameras are unchanged;
- direct review accepted exact-head stills, the 189-second normal-input native sequence and the 131.4-second persistence sequence;
- no bounded visual correction was required.

Accepted exact-head evidence:

- Playable Entry run `33129726607`, artifact `9669927416`, digest `sha256:5614c7b9a4e2e8bb3dd756a9d9b4ed14708d3783319388c3daed5d9f1004a099`;
- Web Playability run `33129726601`, artifact `9669864228`, digest `sha256:ff3c21b54ab235cf5bd38f926a5d8aed09a06bebdc4084f3ce0a74ec9ca7d7a3`;
- Session Persistence v2 run `33129726657`, artifact `9669860719`, digest `sha256:ea36e2d0da14b8aa0e29b37874fdef692bde830daa63f71a7da4b10ee0d9d24c`.

First Rival Countermove v1 must not be reopened.

## Accepted foundation

Do not rebuild the deterministic Aurelian Basin geography, Blender to GLB to Godot pipeline, Production Village, Map and World, normal-input decision handoff, packaged runtime, Chromium Web export, Session Persistence v2, or the accepted progression from land claim through the first rival response.

## Current authority

No new product implementation candidate is authorized.

The next allowed work is exactly one bounded strategy review of the remaining Day-90 `frontier payoff` gap. If that review selects a candidate, it must first produce a separate documentation-only contract PR with explicit playable outcome, scope, evidence, failure recovery and stop condition. Only a merged contract with healthy exact-head checks may authorize implementation.

Do not infer authorization for:

- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, randomness or a broad faction system;
- economy, resources, rewards, penalties, costs or timers;
- governance or diplomacy simulation;
- another land, ownership change, expansion or a new settlement;
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
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. accepted exact-head evidence and merged PR #532;
5. issue #415 as shared-geography history and continuity guidance;
6. completed issue #530 and its contract as historical milestone authority;
7. older issues, contracts, PRs, briefs and reports.

## Current stop condition

Stop product execution. A bounded strategy review and separate documentation-only contract are required before any frontier-payoff implementation.
