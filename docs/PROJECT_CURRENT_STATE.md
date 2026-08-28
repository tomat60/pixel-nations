# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-28
Current state revision: Aurelian First Imperial Expansion v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `2cdc419634e3caf547b4e2716aa75d3265bbdca5`
Product baseline SHA: `2cdc419634e3caf547b4e2716aa75d3265bbdca5`
Current milestone: Aurelian First Imperial Expansion v1 terminally accepted
Active execution issue: #538
Next allowed action: perform exactly one bounded strategy review; if it identifies a valuable next milestone, propose it through a separate documentation-only contract PR. No product implementation is currently authorized.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire -> crisis -> rival -> frontier payoff -> first imperial expansion`

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
- North Ridge is unavailable before the completed frontier payoff;
- World identifies North Ridge as the adjacent expansion direction;
- Map requires deliberate inspection and explicit `Claim North Ridge`;
- the claim emits exactly one event and exposes no third-land or repeatable path;
- Map visibly distinguishes available, inspected and two-land claimed states;
- Village keeps Greenvale as the imperial capital administering two lands;
- World records the first two-land imperial footprint;
- Trade, Expand or Frontier identity, empire, River Surge, rival response and frontier payoff remain intact;
- Session Persistence v2 restores exactly `east_route` and `north_ridge` across native restart, Web reload and profile reopen;
- river, East Bridge, Greenvale, North Ridge, Gilded Crossing, route, landmark and cameras remain one unchanged geography;
- direct still, normal-input motion and persistence review passed without a visual correction.

Accepted exact-head evidence:

- Playable Entry run `33197402661`, artifact `9696609483`, digest `sha256:b29b4415f0d62aa98d9c2ed03c7729f590cd30d3dc86d5283e48531f0ffdd917`;
- Web Playability run `33197402739`, artifact `9696503715`, digest `sha256:89037a620d16791eb88d4232bdddbd97414827378b9914f060bb9ae3a9ccc770`;
- Session Persistence v2 run `33197402673`, artifact `9696507358`, digest `sha256:0693cc135a439762c74d2759147c27b917f4fc112f5b16ff8964e8545834e5c0`.

Issue #538 is completed. First Imperial Expansion v1 must not be reopened.

## Current authority

No further product implementation is authorized.

Exactly one bounded strategy review may choose the next valuable playable milestone. Any implementation requires a separate issue and documentation-only contract PR with explicit outcome, allowed scope, forbidden scope, evidence, failure recovery, cost policy and stop condition.

The review must preserve:

- one active product or recovery PR at a time;
- Village as HOW, Map as WHERE and World as WHY / WHICH DIRECTION;
- one physical Aurelian geography;
- the accepted two-land baseline of East Route and North Ridge;
- Greenvale as imperial capital;
- all accepted direction, empire, crisis, rival and frontier-payoff state;
- deliberate normal input and exact-head native, Web and persistence evidence;
- no third land or repeatable expansion unless a future contract explicitly authorizes it.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. Green CI is necessary but not sufficient for acceptance.
3. Directly inspect running-game images, motion and persistence artifacts.
4. Any head movement invalidates older evidence.
5. Fix deterministic failures at root cause on the same PR.
6. Rerun only the smallest failing job for isolated infrastructure failures.
7. After every merge, verify fresh `main`, checks and available deployment status before authorizing another implementation.

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
4. accepted exact-head evidence and merged PR #540;
5. issue #415 as shared-geography history and continuity guidance;
6. completed issue #538 and its contract as history only;
7. older issues, PRs, briefs and reports.

## Current stop condition

Stop with no active implementation. A later product slice requires one bounded strategy review and a separately merged documentation contract.
