# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-26
Current state revision: First National Mandate v1 accepted, First Empire Proclamation v1 selected
Authority source: this file on the current `main`
Authority baseline SHA: `3f49b017d6e891734e949da51c475254c5303a2a`
Product baseline SHA: `accf1e0687ec2f6f3ba27a6cc01a804c86da2fac`
Current milestone: authorize exactly one Godot Aurelian First Empire Proclamation v1 candidate
Active execution issue: #518
Next allowed action: after this authority and contract merge with healthy exact-head checks, implement exactly one bounded First Empire Proclamation v1 candidate.

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
- Village owns one explicit direction-bound action;
- Map shows activity at the accepted East Route, North Ridge or Gilded Crossing locus;
- World shows the selected mandate underway;
- one shared state machine serves Trade, Expand and Frontier;
- native restart, Web reload and persistent-profile reopen preserve `national_direction=expand` and `national_mandate_started=true`;
- direct still and motion review accepted all three variants;
- no visual correction was required.

Accepted exact-head evidence:

- Playable Entry run `32929608710`, artifact `9592886223`, digest `sha256:1af5b1824ccd217f5d7dd67eeb013ed0ae524f458635e6e45d7ba8ebc4f417ba`;
- Web Playability run `32929608603`, artifact `9592815442`, digest `sha256:6deb7e6bb23659f31984c78857aef12008d4e26ae292717883e96234a2b4be4a`;
- Session Persistence v2 run `32929608577`, artifact `9592813105`, digest `sha256:50be7d1e356f25430c3c9a3402fa209452c55ac202374d6fac98963c5b913af6`.

Issue #514 is completed.

## Current milestone contract

The bounded strategy review rejected another mandate microstate and selected the first major completion of the core fantasy.

Issue #518 and `docs/GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_V1_CONTRACT.md` authorize exactly one candidate with this outcome:

`World national mandate underway -> Map Aurelian homeland and active mandate -> Village Greenvale capital -> explicit Proclaim Aurelian Empire -> Village imperial capital -> Map Aurelian imperial heartland -> World first empire proclaimed`

The proclamation preserves the committed Trade, Expand or Frontier identity. It changes national status and presentation only. It does not add a second land, territorial ownership, economy, governance simulation, diplomacy or combat.

## Current gate

This documentation contract must merge with healthy exact-head checks before product implementation starts.

After acceptance, exactly one active First Empire Proclamation v1 product or recovery PR is authorized. Green CI alone is not product acceptance. The candidate requires direct exact-head review and one bounded visual correction maximum.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Aurelian manifests and Session Persistence v2;
- existing procedural presentation helpers and repository assets;
- focused updates to the existing Playable Entry, Web Playability and Session Persistence v2 evidence workflows when required;
- repository and evidence QA;
- correctness recovery for the accepted baseline.

## Forbidden scope

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
6. Do not begin product implementation until this contract is accepted on `main`.
7. Stop the candidate at PASS, CORRECTION_REQUIRED or REJECT.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not acceptance authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. `docs/GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_V1_CONTRACT.md`;
3. issue #518;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PRs;
7. operating and QA protocols;
8. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Current stop condition

Merge this documentation authority only after exact-head checks pass. Then authorize exactly one bounded First Empire Proclamation v1 implementation candidate and stop it at direct terminal review.
