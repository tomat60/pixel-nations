# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-25
Current state revision: Living Capital Vertical Slice v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `b803f13931b0608f2580a5cc30db50e30fc93d01`
Product baseline SHA: `b803f13931b0608f2580a5cc30db50e30fc93d01`
Current milestone: Living Capital Vertical Slice v1 accepted, no next product implementation authorized
Active execution issue: none
Next allowed action: perform one bounded strategy review and, only if justified, propose a separate documentation contract for the next milestone.

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
- Living Capital Vertical Slice v1.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #508 `Implement Aurelian Living Capital Vertical Slice v1` is accepted and merged.

- terminal result: `AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_PASS`;
- accepted head: `916efe13369a1e878d88422d50667462f799eb4b`;
- merged product baseline: `b803f13931b0608f2580a5cc30db50e30fc93d01`;
- Greenvale capital adds a deliberate civic composition with plaza, roofed civic quarters and restrained lantern activity;
- settlement, city and capital remain visibly distinct;
- the capital transition includes a bounded reveal tween;
- the caravan visibly moves only along the accepted Greenvale to Gilded Crossing East Route;
- homeland and nation cues use restrained presentation motion;
- Village remains HOW, Map remains WHERE and World remains WHY / WHICH DIRECTION;
- shared Aurelian geography, Greenvale origin, East Route and Gilded Crossing remain unchanged;
- native restart, Web reload and persistent-profile reopen restore `map_aurelian_homeland:east_trade`;
- reopening Village restores `village_greenvale_capital`;
- denied-storage fallback remains `world_neutral:none`;
- one bounded visual correction was used to replace the rough rotating civic block treatment with static roofed quarters and restrained ambient motion;
- direct still and motion review confirmed the candidate is materially better in presentation and feel than the First Nation baseline.

Accepted exact-head evidence:

- Playable Entry run `32869824111`, artifact `9571959543`, digest `sha256:fbe02c41bfd9dd5ec606a03b83bd8932d3d4d62097bd6fd3776595f8df9b7cfb`;
- Web Playability run `32869823845`, artifact `9571685428`, digest `sha256:14195e61d97ed8c174763584511cffe54941dc54b1b13215b0cccedc01a6a6f9`;
- Session Persistence v2 run `32869826180`, artifact `9571717523`, digest `sha256:88d7af2e3497b29864d063d75f18b1eb0987a36e2aac4a4f63f57a77521aed59`.

Issue #506 is completed by this accepted implementation.

## Current gate

No additional product implementation is authorized.

The next allowed work is exactly one bounded strategy review of the accepted playable path and current experiential bottleneck. A new product slice requires a separate documentation contract accepted on `main`.

Do not infer authorization for empire progression merely because the product truth names empire as a long-term destination.

## Forbidden until a new accepted contract

- economy, resources, costs, rewards, inventory or taxes;
- population simulation, workers, timers, queues or production systems;
- another land or multi-land expansion;
- governance, laws, factions, diplomacy or combat;
- empire progression;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new paid assets or paid tools;
- a new asset family without a proven limitation of the current envelope;
- broad CI or platform refactoring;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12 or MAX.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Green CI is necessary but not sufficient for visual or product acceptance.
4. Directly inspect running-game images and motion.
5. One bounded visual correction maximum per milestone.
6. An open PR with no meaningful progress for roughly one steward interval is P0.
7. Preserve accepted shared geography and avoid rebuilding the GLB.
8. Do not begin another product implementation without a new accepted contract.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is reference or moodboard only unless a later explicit decision changes that role.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. accepted exact-head evidence and merged PRs;
5. operating and QA protocols;
6. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful work:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. re-fetch live GitHub state;
4. state model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Stop after recording the Living Capital Vertical Slice v1 PASS on `main` with healthy checks and deployment state.

Do not start another product implementation. The next decision is one bounded strategy review followed by a separate documentation contract only if the review identifies a justified next slice.
