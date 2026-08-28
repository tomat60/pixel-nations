# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-28
Current state revision: Aurelian First Frontier Payoff v1 authorized
Authority source: this file on the current `main`
Authority baseline SHA: `7a002bbc484e46229963990f9da598106beddec2`
Product baseline SHA: `74a4362789a407853a41a0769ac3741d2e684119`
Current milestone: Aurelian First Frontier Payoff v1 authorized for exactly one bounded implementation candidate
Active execution issue: #534
Next allowed action: implement exactly one Godot Aurelian First Frontier Payoff v1 candidate under the accepted contract, then run exact-head evidence and direct review.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire -> crisis -> rival -> frontier payoff`

The playable demonstration remains Sector A-01 / Aurelian Basin. Godot is the target runtime under ADR-001. Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Most recent accepted product milestone

PR #532 `Implement Godot Aurelian First Rival Countermove v1` is terminally accepted and merged.

Terminal result: `GODOT_AURELIAN_FIRST_RIVAL_COUNTERMOVE_PASS`.

- accepted head: `7f207ad74c6c816473d7589eb7074238449bab9c`;
- merged product baseline: `74a4362789a407853a41a0769ac3741d2e684119`;
- Obsidian March derives its countermove from the persisted River Surge response;
- `shield_greenvale` pressures the existing East Bridge;
- `keep_east_bridge_open` pressures legitimacy at existing Greenvale;
- Village offers exactly `Stand Firm` and `Negotiate Passage`;
- Map and World record one mutually exclusive response;
- Trade, Expand and Frontier identity remain intact;
- Session Persistence v2 preserves the origin and response across native restart, Web reload and profile reopen;
- shared geography is unchanged;
- direct review accepted exact-head stills, normal-input motion and persistence without a visual correction.

Accepted exact-head evidence:

- Playable Entry run `33129726607`, artifact `9669927416`, digest `sha256:5614c7b9a4e2e8bb3dd756a9d9b4ed14708d3783319388c3daed5d9f1004a099`;
- Web Playability run `33129726601`, artifact `9669864228`, digest `sha256:ff3c21b54ab235cf5bd38f926a5d8aed09a06bebdc4084f3ce0a74ec9ca7d7a3`;
- Session Persistence v2 run `33129726657`, artifact `9669860719`, digest `sha256:ea36e2d0da14b8aa0e29b37874fdef692bde830daa63f71a7da4b10ee0d9d24c`.

Issue #530 is completed. First Rival Countermove v1 must not be reopened.

## Strategy decision

The accepted first-run arc now reaches a persistent rival response. The remaining Day-90 gap is one visible frontier payoff that closes the first-empire continuation arc.

The payoff is derived deterministically from the recorded rival response:

- `stand_firm` authorizes `Secure Gilded Crossing` at the existing Gilded Crossing locus;
- `negotiate_passage` authorizes `Ratify East Bridge Passage` at the existing East Bridge locus.

Only the derived action is available. This is not another choice matrix, progression tier, second land, economy, reward system, combat system or diplomacy simulation.

## Current authority

Issue #534 and `docs/GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_V1_CONTRACT.md` authorize exactly one bounded implementation candidate:

`recorded rival response -> World reveals the derived frontier payoff -> Map shows the existing payoff locus -> Village explicitly secures the derived payoff -> Map shows the secured existing locus -> World records the first empire frontier legacy complete`

The candidate must:

- derive exactly one payoff from the persisted rival response;
- preserve the River Surge response, rival response, `empire_proclaimed=true` and Trade, Expand or Frontier identity;
- require deliberate normal input for the one derived secure action;
- keep Village as HOW, Map as WHERE and World as WHY / WHICH DIRECTION;
- use restrained cues at existing Gilded Crossing or East Bridge geometry;
- preserve river, bridge, Greenvale, landmark, route and camera geography;
- make secure idempotent and reject invalid response/payoff combinations;
- persist the secured result across native restart, Web reload and profile reopen;
- produce exact-head Playable Entry, Web Playability and Session Persistence evidence;
- receive direct still and motion review.

Green CI alone is not acceptance. One bounded visual correction maximum is allowed. Terminal classification must be exactly:

- `GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_PASS`; or
- `GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_REJECT`.

## Allowed scope

- one exact First Frontier Payoff manifest;
- deterministic mapping from the two accepted rival responses;
- exactly one available secure action per response;
- focused Godot controller, HUD and Session Persistence v2 changes;
- restrained procedural cues on existing Gilded Crossing or East Bridge geometry;
- focused tests and narrowly scoped evidence workflow changes;
- contract-linked documentation.

## Forbidden scope

- another land, ownership change, border expansion or new settlement;
- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, randomness, turns or a broad faction system;
- rewards, penalties, resources, costs, timers, economy or pressure meters;
- diplomacy, governance or treaty simulation;
- a third payoff or direction-specific payoff matrix;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, asset family, dependency, paid asset or paid tool;
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
2. `docs/GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_V1_CONTRACT.md`;
3. active execution issue #534;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PR #532;
7. issue #415 as shared-geography history and continuity guidance;
8. completed issue #148 and other React-era frontier-payoff work as history only;
9. older issues, contracts, PRs, briefs and reports.

## Current stop condition

Stop after one accepted or rejected First Frontier Payoff v1 candidate. A PASS must be recorded here before any later strategy review. A REJECT must restore the accepted First Rival Countermove baseline and record the exact reason.
