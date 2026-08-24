# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: First Settlement Development v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `3cb0a3df33da606bfff45c5855a332b3ae204a22`
Product baseline SHA: `3cb0a3df33da606bfff45c5855a332b3ae204a22`
Current milestone: `GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_PASS`
Completed execution issue: #486
Next allowed action: one bounded strategy review and, if justified, a separate documentation-only contract PR. No new product implementation is authorized.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current playable demonstration is Sector A-01 / Aurelian Basin.

Godot remains the target runtime under ADR-001. Next.js `/play` remains a bridge, mechanics reference and rollback surface, not the production-final visual engine.

Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Accepted foundation

Do not rebuild these accepted capabilities:

- shared deterministic Aurelian Basin geography and Blender -> GLB -> Godot pipeline;
- Production Village `claimed / founded / developed` presentation;
- Production Map land-state presentation;
- Production World strategic-direction role;
- World -> Map -> Village decision handoff;
- normal Godot playable entry and keyboard navigation;
- packaged Aurelian render asset;
- Chromium Web export playability;
- Session Persistence v2 for native and Web;
- explicit First Land Claim;
- explicit First Settlement Founding with persisted Greenvale founded state;
- Aurelian Visible Expansion v1 composition;
- explicit First Settlement Development with persisted Greenvale developed state.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #488 `Implement Godot Aurelian First Settlement Development v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_PASS`;
- accepted head: `f48a2a8229720851bc0bb4062d5ab459c45ff635`;
- merged product baseline: `3cb0a3df33da606bfff45c5855a332b3ae204a22`;
- player path: `Village founded -> explicit Develop Greenvale -> Village developed`;
- explicit event: `AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE`;
- East Route remains claimed with eastern Trade intent unchanged;
- developed Greenvale reopens after leaving;
- native restart, same-origin Web reload and persistent-profile browser reopen restore developed;
- denied localStorage safely falls back to `world_neutral:none`;
- Village, Map and World retain one coherent Aurelian Basin.

Accepted exact-head evidence:

- Playable Entry run `32684258349`, artifact `9505159284`, digest `sha256:644eaf3a12c638c88b1e1d38aa9750f0f197ed7d629234f28baa62d4b87ee52d`;
- Web Playability run `32684258362`, artifact `9505155202`, digest `sha256:d1886c3c999361b68d134ff4d41636d80452609b85c698b845fba9a1de7cc4fd`;
- Session Persistence v2 run `32684258346`, artifact `9505151862`, digest `sha256:fa3c87cd2f945fb20e56aa75f61660b743ee6930c27e19655f5450d47d8df517`.

Direct review confirmed:

- founded Greenvale clearly exposes `Develop Greenvale`;
- explicit input produces the accepted 13-node developed settlement;
- developed is immediately distinguishable from founded;
- returning to Map preserves East Route claimed;
- reopening Village restores the same developed composition;
- native and Web persistence retain `map_east_route_claimed:east_trade:true:true`;
- denied storage retains the accepted safe fallback;
- the 50.60-second normal-input sequence covers the complete progression;
- no shared-geography regression.

The initial Web validation failure was a stale 40-second video ceiling after the sequence expanded to include founding and development. The same PR corrected only the validation range to 45-60 seconds. This was correctness recovery. No visual correction was used.

## Current gate

The First Settlement Development v1 contract is complete. No new product milestone is authorized.

Allowed:

- repository and release QA;
- closing completed issue #486 after this acceptance record is merged;
- one bounded strategy review;
- one separate documentation-only authority PR if that review selects a next milestone.

Blocked:

- any new product implementation before a fresh contract is accepted on `main`;
- resources, costs, economy, workers, timers or production queues;
- new terrain, GLB, asset family, geography or Village nodes;
- broad Village, Map or World polish;
- multiple-land expansion;
- city, nation or empire systems;
- backend, accounts, cloud save, multiplayer, combat or diplomacy;
- `app/play/**` or public shell changes;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12;
- MAX or paid tools.

## Release state

- PR #488 exact-head product evidence: PASS;
- product merge `main@3cb0a3df33da606bfff45c5855a332b3ae204a22`;
- Vercel for the product merge SHA: SUCCESS;
- no open product PR;
- public-origin route verification remains subject to the environment capability boundary and is not evidence of an outage.

## Process acceleration rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Use focused Godot tests during iteration and full evidence at the final gate.
4. Directly inspect running-game images and motion.
5. One bounded visual correction maximum for an authorized product candidate.
6. An open PR with no meaningful progress for roughly one steward interval is P0.
7. Preserve accepted shared geography and avoid rebuilding the GLB.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful as executor, GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not implementation authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. the active execution issue named by a future accepted contract;
5. accepted exact-head evidence and merged PRs;
6. operating and QA protocols;
7. historical issues, PRs, briefs and reports.

Issue #486 is completed execution provenance for First Settlement Development v1. Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful implementation:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. read the active execution issue named by this file;
4. re-fetch live GitHub state;
5. state model and tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Do not begin another product implementation until a bounded strategy review selects a milestone and a separate contract is accepted on `main`.
