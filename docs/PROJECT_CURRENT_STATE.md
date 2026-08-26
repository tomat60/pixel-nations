# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-26
Current state revision: First Empire Proclamation v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `ebdc103a3f2a9ff4c8a495e9547a084ae9a6a715`
Product baseline SHA: `ebdc103a3f2a9ff4c8a495e9547a084ae9a6a715`
Current milestone: First Empire Proclamation v1 accepted; no further product implementation authorized
Active execution issue: #518 completed
Next allowed action: conduct one bounded strategy review and, only if it selects a safe next slice, propose a separate documentation contract before any product implementation.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current playable demonstration is Sector A-01 / Aurelian Basin.

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

PR #520 `Implement Godot Aurelian First Empire Proclamation v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_PASS`;
- accepted head: `864d888f5f159f59447bda099177d7b36066a213`;
- merged product baseline: `ebdc103a3f2a9ff4c8a495e9547a084ae9a6a715`;
- Village owns the explicit `Proclaim Aurelian Empire` action after a national mandate starts;
- Village becomes the Aurelian imperial capital;
- Map shows the existing homeland as the imperial heartland without changing ownership or geography;
- World recognizes the first Aurelian Empire while preserving Trade, Expand or Frontier;
- normal input emits `AURELIAN_FIRST_EMPIRE_PROCLAMATION=AURELIAN` exactly once;
- Session Persistence v2 preserves `empire_proclaimed=true` and the committed direction;
- native restart, Web reload and persistent-profile reopen restore the imperial Map and Village states;
- focused contracts, shared-geography regressions and all exact-head guards passed;
- direct still and motion review accepted the candidate after the one allowed bounded visual correction;
- the correction added procedural imperial presentation only, with no new asset, GLB or geography.

Accepted exact-head evidence:

- Playable Entry run `32976610513`, artifact `9610013150`, digest `sha256:770d8e135a8e6e961fe2a1564b9c91cf44dbeceeba387015288d7bad5dc19d0c`;
- Web Playability run `32976610533`, artifact `9609824128`, digest `sha256:93416bce16e0ad36140c2e9934af019ff79d099e09a47f883e95277f213b0002`;
- Session Persistence v2 run `32976610485`, artifact `9609855562`, digest `sha256:f1122de8633798e290659e0d228a45dc1248ae270d65f4451fbabbba877c3aba`.

Issue #518 is completed by this accepted implementation.

## Current gate

No additional product implementation is authorized.

The next permissible activity is one bounded strategy review. Any resulting product slice requires its own issue and documentation contract, merged with healthy exact-head checks before an implementation branch starts.

Green CI alone remains insufficient for visual or product acceptance.

## Allowed scope

- repository and exact-head evidence QA;
- correctness recovery for the accepted baseline;
- one bounded strategy review;
- a separate documentation-only authority proposal if the review selects a safe next slice.

## Forbidden scope

Until a new contract is accepted:

- product implementation;
- another land, territorial ownership change or multi-land simulation;
- economy, resources, costs, rewards, taxes, production or inventory;
- population, workers, timers or queues;
- governance systems, laws, factions or diplomacy;
- combat, units, damage or military simulation;
- post-proclamation empire progression;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, asset family, paid assets or paid tools;
- broad visual polish, broad CI changes or platform refactoring;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12 or MAX.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Green CI is necessary but not sufficient for visual or product acceptance.
4. Directly inspect running-game images, motion and persistence artifacts.
5. Preserve the accepted shared geography and avoid rebuilding the GLB.
6. Do not begin another product implementation until a new contract is accepted on `main`.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not acceptance authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. the latest accepted milestone contract;
3. the active execution issue named above;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PRs;
7. operating and QA protocols;
8. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Current stop condition

Stop at accepted First Empire Proclamation v1. Do not start another product slice without a fresh bounded strategy review and a separately merged documentation contract.
