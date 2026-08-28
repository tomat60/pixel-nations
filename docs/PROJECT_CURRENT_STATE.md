# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-28
Current state revision: Aurelian First Frontier Payoff v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `f18a335b0f0b65a1c3611a3af76f189f86ae2f02`
Product baseline SHA: `f18a335b0f0b65a1c3611a3af76f189f86ae2f02`
Current milestone: Aurelian First Frontier Payoff v1 terminally accepted
Active execution issue: #534 (completed)
Next allowed action: perform at most one bounded strategy review. No further product implementation is authorized until a separate documentation-only contract is accepted and merged.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire -> crisis -> rival -> frontier payoff`

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

## Acceptance review

Direct review confirmed both normal-input paths:

1. `stand_firm -> World reveal -> Gilded Crossing pending on Map -> explicit Secure Gilded Crossing in Village -> secured Map locus -> completed World legacy`.
2. `negotiate_passage -> World reveal -> East Bridge pending on Map -> explicit Ratify East Bridge Passage in Village -> secured Map locus -> completed World legacy`.

The reviewed persistence artifact additionally proves:

- East Bridge secured survives native restart and Village reopen;
- Gilded Crossing secured survives Web reload, browser profile reopen and Village reopen;
- invalid response/payoff combinations remain rejected;
- one response produces exactly one secured payoff and one payoff event.

## Current authority

No new product implementation is authorized.

The only allowed next planning action is one bounded strategy review that may:

- inspect the completed first-run arc and remaining product gaps;
- choose one smallest valuable next milestone or decide to hold;
- propose one separate documentation-only contract;
- preserve the accepted shared geography and view-role binding.

A strategy review does not authorize code. A new executable slice requires a separate accepted authority update on `main`.

## Forbidden until new authority

- another land, ownership expansion or a new settlement;
- combat, units, attacks, damage, victory or defeat simulation;
- rival AI, randomness, turns or a broad faction system;
- resources, rewards, penalties, costs, timers, economy or pressure meters;
- diplomacy, governance or treaty simulation;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, asset family, dependency, paid asset or paid tool;
- broad visual polish, broad CI changes, public-shell work, P12 or MAX;
- any product implementation based only on an issue, branch or stale prompt.

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
2. the most recently accepted documentation-only contract, if any;
3. accepted ADRs, especially ADR-001;
4. root `AGENTS.md`;
5. accepted exact-head evidence and merged PR #536;
6. issue #415 as shared-geography history and continuity guidance;
7. completed issue #534 and older contracts as history only;
8. older issues, PRs, briefs and reports.

## Current stop condition

Stop product execution. A single bounded strategy review may propose the next documentation-only authority. Do not create an implementation branch, run product evidence or open a product PR until that authority is accepted on fresh `main`.
