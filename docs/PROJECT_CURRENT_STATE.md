# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-26
Current state revision: First National Mandate v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `accf1e0687ec2f6f3ba27a6cc01a804c86da2fac`
Product baseline SHA: `accf1e0687ec2f6f3ba27a6cc01a804c86da2fac`
Current milestone: First National Mandate v1 accepted; no further product implementation authorized
Active execution issue: #514
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
- Production Village progression through claimed, founded, developed, city and capital;
- Production Map land, route, city and homeland presentation;
- Production World strategic-direction and nation role;
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
- First National Mandate v1.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #516 `Implement Godot Aurelian First National Mandate v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_PASS`;
- accepted head: `579a3d2030f40bbdc5c20de32146d1cbc2b007d9`;
- merged product baseline: `accf1e0687ec2f6f3ba27a6cc01a804c86da2fac`;
- Village owns one explicit direction-bound action: Trade dispatches a delegation, Expand commissions a basin survey, and Frontier establishes a watch;
- Map shows the resulting activity at the accepted East Route, North Ridge or Gilded Crossing locus;
- World shows the selected mandate underway for Aurelian;
- one shared state machine serves Trade, Expand and Frontier without changing territorial ownership or geography;
- normal Web input commits Expand and starts `Commission Basin Survey` exactly once;
- native restart, Web reload and persistent-profile reopen preserve `national_direction=expand` and `national_mandate_started=true`;
- reopening Map restores `map_national_mandate_active` and reopening Village restores `village_national_mandate_started`;
- focused contracts, shared-geography regressions and all exact-head guards passed;
- direct still and motion review accepted all three direction variants;
- no visual correction was required.

Accepted exact-head evidence:

- Playable Entry run `32929608710`, artifact `9592886223`, digest `sha256:1af5b1824ccd217f5d7dd67eeb013ed0ae524f458635e6e45d7ba8ebc4f417ba`;
- Web Playability run `32929608603`, artifact `9592815442`, digest `sha256:6deb7e6bb23659f31984c78857aef12008d4e26ae292717883e96234a2b4be4a`;
- Session Persistence v2 run `32929608577`, artifact `9592813105`, digest `sha256:50be7d1e356f25430c3c9a3402fa209452c55ac202374d6fac98963c5b913af6`.

Issue #514 is completed by this accepted implementation.

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
- economy, resources, costs, rewards, taxes, production or inventory;
- population, workers, timers or queues;
- another land, territorial ownership change or multi-land simulation;
- governance, laws, factions or diplomacy;
- combat, units, damage or military simulation;
- empire progression;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, paid assets or paid tools;
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

Stop at accepted First National Mandate v1. Do not start another product slice without a fresh bounded strategy review and a separately merged documentation contract.
