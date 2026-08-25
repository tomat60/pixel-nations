# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-25
Current state revision: Living Capital Vertical Slice v1 accepted, First National Direction Commitment v1 selected
Authority source: this file on the current `main`
Authority baseline SHA: `10a13f434982483bb3f47fd0d11bcaa64d84fc87`
Product baseline SHA: `b803f13931b0608f2580a5cc30db50e30fc93d01`
Current milestone: authorize exactly one Godot Aurelian First National Direction Commitment v1 candidate
Active execution issue: #510
Next allowed action: after this authority update and `docs/GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_V1_CONTRACT.md` merge with healthy checks, implement exactly one bounded candidate.

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
- one bounded visual correction was used;
- direct still and motion review confirmed the accepted candidate.

Accepted exact-head evidence:

- Playable Entry run `32869824111`, artifact `9571959543`, digest `sha256:fbe02c41bfd9dd5ec606a03b83bd8932d3d4d62097bd6fd3776595f8df9b7cfb`;
- Web Playability run `32869823845`, artifact `9571685428`, digest `sha256:14195e61d97ed8c174763584511cffe54941dc54b1b13215b0cccedc01a6a6f9`;
- Session Persistence v2 run `32869826180`, artifact `9571717523`, digest `sha256:88d7af2e3497b29864d063d75f18b1eb0987a36e2aac4a4f63f57a77521aed59`.

Issue #506 is completed by this accepted implementation.

## Current milestone: First National Direction Commitment v1

Binding execution issue: #510.
Binding contract: `docs/GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_V1_CONTRACT.md`.

The bounded strategy review found that the accepted playable experience is visually stronger but still one linear chain. The next slice introduces the first persistent post-nation choice by reusing the accepted World directions instead of adding another automatic milestone or cosmetic microstate.

Required outcome:

`World first nation founded -> inspect Trade / Expand / Frontier -> explicit Commit Aurelian Direction -> World direction committed -> Map homeland reflects the commitment -> Village capital reflects the commitment`

Binding rules:

1. World alone owns direction inspection, selection and commitment.
2. Exactly one of Trade, Expand or Frontier is committed.
3. Map remains WHERE and preserves the accepted homeland and geography.
4. Village remains HOW and preserves Greenvale capital.
5. Cross-view cues are restrained identity and context only.
6. Commitment does not simulate economy, territory, governance, diplomacy or combat.
7. Native restart, Web reload and persistent-profile reopen preserve the committed direction.
8. The complete accepted pre-nation path remains intact.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Aurelian manifests, layout and camera definitions;
- existing Session Persistence v2 schema;
- existing procedural presentation helpers and repository assets;
- focused changes to the three existing evidence workflows only when required.

## Forbidden scope

- economy, resources, costs, rewards, inventory, taxes or production;
- population, workers, timers or queues;
- another land, territorial expansion or multi-land simulation;
- governance, laws, factions, diplomacy or combat;
- empire progression;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, paid assets or paid tools;
- broad CI or platform refactoring;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12 or MAX.

## Execution and evidence

Use one serialized product PR:

`implement -> focused Godot test -> deterministic capture -> direct still and motion review -> one bounded correction -> final exact-head gate`

Exact-head evidence must show all three inspectable World directions, explicit commitment, one committed World state, unchanged Map geography, unchanged Greenvale capital, cross-view cues, normal-input reopening and native, Web and profile persistence.

Green CI is necessary but not sufficient. Direct review decides acceptance.

Terminal classification:

- `GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_PASS`
- `GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_CORRECTION_REQUIRED`
- `GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_REJECT`

One bounded visual correction maximum.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Use focused Godot tests during iteration and full evidence at the final gate.
4. Directly inspect running-game images and motion.
5. One bounded visual correction maximum per milestone.
6. An open PR with no meaningful progress for roughly one steward interval is P0.
7. Preserve accepted shared geography and avoid rebuilding the GLB.
8. Do not begin economy, second-land, governance, combat or empire work.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not acceptance authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. active execution issue #510;
5. `docs/GODOT_AURELIAN_FIRST_NATIONAL_DIRECTION_COMMITMENT_V1_CONTRACT.md`;
6. accepted exact-head evidence and merged PRs;
7. operating and QA protocols;
8. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful work:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001, root `AGENTS.md`, issue #510 and the current contract;
3. re-fetch live GitHub state;
4. state model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

This authority update stops when this current-state revision and the First National Direction Commitment v1 contract are accepted on `main` with healthy post-merge state.

Then implement exactly one bounded candidate and stop after direct exact-head PASS, CORRECTION_REQUIRED or REJECT before any economy, second-land, governance, combat or empire work.
