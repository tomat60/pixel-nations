# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-26
Current state revision: First National Direction Commitment v1 accepted, First National Mandate v1 selected
Authority source: this file on the current `main`
Authority baseline SHA: `db264ff394f2a550d37dfc68707c9786c3801b95`
Product baseline SHA: `627d06f780266adb08e15c0d174dd4791773eef0`
Current milestone: authorize exactly one Godot Aurelian First National Mandate v1 candidate
Active execution issue: #514
Next allowed action: after this authority and contract merge with healthy exact-head checks, implement exactly one bounded First National Mandate v1 candidate.

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
- First National Direction Commitment v1.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #512 `Implement Godot Aurelian First National Direction Commitment v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_PASS`;
- accepted head: `de1faad7d346bf3b4137312e56f0ad4b9543fdae`;
- merged product baseline: `627d06f780266adb08e15c0d174dd4791773eef0`;
- World alone owns inspection and explicit commitment of Trade, Expand or Frontier;
- normal input inspects all three directions and commits Expand exactly once;
- Map remains WHERE and carries only restrained Aurelian homeland direction context;
- Village remains HOW and carries only restrained Greenvale capital direction identity;
- Greenvale, East Route, Gilded Crossing and the shared Aurelian geography remain unchanged;
- native restart, Web reload and persistent-profile reopen restore `map_aurelian_homeland:east_trade` with `national_direction=expand`;
- reopening Village restores `village_greenvale_capital` with the committed identity;
- denied-storage fallback remains `world_neutral:none`;
- no visual correction was required;
- direct still and motion review accepted the exact candidate.

Accepted exact-head evidence:

- Playable Entry run `32903860381`, artifact `9584219919`, digest `sha256:34ba7ea226e0730f12b631fbe5298f6015880596bdf71c34e3c83a2b1f5aef7b`;
- Web Playability run `32903860378`, artifact `9584173769`, digest `sha256:e7ab4f382b64e1dfb53701423fcdce8c9290c72f2872356f75781863c7a08620`;
- Session Persistence v2 run `32903860550`, artifact `9584189031`, digest `sha256:b6ebb5be3ea7132400ccf4558c4a1568e1ef635ed90a375e563f59c53ecff5cf`.

Issue #510 is completed by this accepted implementation.

## Current milestone contract

The bounded strategy review found one precise gap: the accepted Trade, Expand or Frontier commitment is persistent and readable, but it does not yet produce a deliberate player action.

Issue #514 and `docs/GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_V1_CONTRACT.md` authorize exactly one candidate with this outcome:

`World direction committed -> Map homeland context -> Village capital identity -> explicit Launch National Mandate -> Village mandate started -> Map mandate active at an existing geographic locus -> World mandate underway`

Direction bindings:

- Trade: `Dispatch Trade Delegation` on the accepted East Route;
- Expand: `Commission Basin Survey` at the existing North Ridge inside the accepted homeland;
- Frontier: `Establish Frontier Watch` at the accepted Gilded Crossing frontier edge.

One shared state machine must serve all three directions. Village owns the explicit action, Map owns the existing locus, and World owns the strategic consequence. The mandate must persist through native restart, Web reload and persistent-profile reopen.

## Current gate

This documentation contract must merge with healthy exact-head checks before product implementation starts.

After acceptance, exactly one active First National Mandate v1 product or recovery PR is authorized. Green CI alone is not product acceptance. The candidate requires direct exact-head review and one bounded visual correction maximum.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Aurelian manifests and Session Persistence v2;
- existing procedural presentation helpers and repository assets;
- focused updates to the existing Playable Entry, Web Playability and Session Persistence v2 evidence workflows when required;
- repository and evidence QA;
- correctness recovery for the accepted baseline.

## Forbidden scope

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
6. Do not begin product implementation until this contract is accepted on `main`.
7. Stop the candidate at `GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_PASS`, `GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_CORRECTION_REQUIRED` or `GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_REJECT`.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not acceptance authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. `docs/GODOT_AURELIAN_FIRST_NATIONAL_MANDATE_V1_CONTRACT.md`;
3. issue #514;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PRs;
7. operating and QA protocols;
8. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Current stop condition

Merge this documentation authority only after exact-head checks pass. Then authorize exactly one bounded First National Mandate v1 implementation candidate and stop it at direct terminal review.
