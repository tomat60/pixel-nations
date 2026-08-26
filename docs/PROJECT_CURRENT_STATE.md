# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-26
Current state revision: Directional Empire Identity v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `bcd97f7970856551d91fa325609761eb542c32c1`
Product baseline SHA: `bcd97f7970856551d91fa325609761eb542c32c1`
Current milestone: Directional Empire Identity v1 accepted; no further product implementation authorized
Active execution issue: #522
Next allowed action: conduct one bounded strategy review and, only if it selects a safe next slice, propose a separate documentation contract before any product implementation.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current playable demonstration remains Sector A-01 / Aurelian Basin.

Godot remains the target runtime under ADR-001. Next.js `/play` remains a bridge, mechanics reference and rollback surface.

Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Accepted foundation

Do not rebuild these accepted capabilities:

- shared deterministic Aurelian Basin geography and Blender to GLB to Godot pipeline;
- Production Village progression through claimed, founded, developed, city, capital and imperial capital;
- Production Map land, route, city, homeland and imperial heartland presentation;
- Production World strategic-direction, nation and first-empire role;
- World to Map to Village decision handoff;
- normal Godot playable entry and keyboard navigation;
- packaged Aurelian render asset;
- Chromium Web export playability;
- Session Persistence v2 for native and Web;
- explicit First Land Claim;
- explicit First Settlement Founding;
- Aurelian Visible Expansion v1;
- explicit First Settlement Development;
- explicit First Trade Route Connection;
- explicit First Trade Caravan Dispatch;
- explicit First City Charter;
- explicit First Nation Founding;
- Living Capital Vertical Slice v1;
- First National Direction Commitment v1;
- First National Mandate v1;
- First Empire Proclamation v1.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #524 `Implement Godot Directional Empire Identity v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_PASS`;
- accepted head: `478bc1a56e2dcd95ebf453c17f5d24004540b2c9`;
- merged product baseline: `bcd97f7970856551d91fa325609761eb542c32c1`;
- Trade, Expand and Frontier now have separate procedural physical glyphs in Village, Map and World;
- Village identifies the direction-specific imperial capital;
- Map preserves the unchanged Aurelian geography while binding Trade to East Route, Expand to North Ridge and Frontier to Gilded Crossing;
- World recognizes a direction-specific first Aurelian Empire;
- Session Persistence v2 preserves `empire_proclaimed=true` and the committed direction;
- direct review accepted all nine final Village, Map and World stills;
- normal-input evidence completed the full commitment, mandate and proclamation sequence for all three directions;
- no visual correction, new asset, GLB or geography was required.

Accepted exact-head evidence:

- Playable Entry run `33009988927`, artifact `9622374839`, digest `sha256:796712858ff2a8591088b8c2f8c4914cb77b35b94f369efd26489f0b27389726`;
- Web Playability run `33009988868`, artifact `9622268120`, digest `sha256:8ad49a5b8b457b3c6edfa72cf8cca7ca9ac6752ddbe36b3e3c5efe6326232471`;
- Session Persistence v2 run `33009988889`, artifact `9622265401`, digest `sha256:85220753998df80245deeed81f370b2b0b59b6bbfc408046fd6fef5d6c43f85d`.

Issue #522 is completed by this accepted implementation.

## Strategy decision

The first-run fantasy and its direction-specific empire payoff are complete.

No later product slice is selected. The next permitted activity is one bounded strategy review. It may propose a separate documentation-only contract, but it may not authorize implementation by itself.

## Current authority

Directional Empire Identity v1 is terminally accepted.

There is no active product implementation authority. Any later executable slice requires a new issue and a separate documentation-only contract merged with healthy exact-head checks.

Green CI alone remains insufficient for future visual or product acceptance.

## Allowed scope

- one bounded strategy review;
- repository and evidence inspection;
- a separate documentation-only contract proposal if the review selects a safe slice;
- authority maintenance required to keep this file current.

## Forbidden scope

- any product implementation before a new contract is merged;
- progression after first empire proclamation without a new explicit strategy decision;
- another land, territorial ownership change or multi-land simulation;
- economy, resources, costs, rewards, taxes, production or inventory;
- population, workers, timers or queues;
- governance systems, laws, factions or diplomacy;
- combat, units, damage or military simulation;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, asset family, dependency, paid asset or paid tool;
- broad visual polish, broad CI changes or platform refactoring;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12 or MAX.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Green CI is necessary but not sufficient for visual or product acceptance.
4. Directly inspect running-game images, motion and persistence artifacts.
5. Preserve the accepted shared geography and avoid rebuilding the GLB.
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
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. accepted exact-head evidence and merged PR #524;
5. operating and QA protocols;
6. historical issues, contracts, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance. Issue #522 and its contract are completed historical authority.

## Current stop condition

Do not start product implementation from this state. Stop after recording the accepted Directional Empire Identity v1 result. The next allowed activity is one bounded strategy review and, only if justified, a separate documentation contract.