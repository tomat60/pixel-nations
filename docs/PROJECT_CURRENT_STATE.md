# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: First Trade Route Connection v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `ea3fd0d3daebcfc1cc4b935bd1b46940e0b57d40`
Product baseline SHA: `ea3fd0d3daebcfc1cc4b935bd1b46940e0b57d40`
Current milestone: record `GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_PASS`
Active execution issue: #490
Next allowed action: one bounded strategy review and, only if accepted, a separate documentation-only contract PR. No product implementation is currently authorized.

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
- explicit First Settlement Founding;
- Aurelian Visible Expansion v1 composition;
- explicit First Settlement Development;
- explicit First Trade Route Connection with cross-view payoff.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #492 `Implement Godot Aurelian First Trade Route Connection v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_PASS`;
- accepted head: `f46d8fd3c2d073d1b984b452b884cf3a74a24bd2`;
- merged product baseline: `ea3fd0d3daebcfc1cc4b935bd1b46940e0b57d40`;
- player path: `Village developed -> Map East Route claimed -> explicit Connect East Route -> Map East Route connected -> World trade route active`;
- event: `AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE`, emitted once for explicit connection;
- native restart, Web reload and persistent-profile reopen restore `map_east_route_connected:east_trade`;
- reopened Village remains developed;
- denied storage retains `world_neutral:none`;
- direct review confirmed a readable claimed-to-connected change, World trade payoff and no shared-geography regression.

Accepted exact-head evidence:

- Playable Entry run `32693737031`, artifact `9508178940`, digest `sha256:dee4063247bd7e1970238feb2890bf22ce3ca3b14a27abcd54e44e6acd19cb26`;
- Web Playability run `32693737059`, artifact `9508166361`, digest `sha256:65ca6568299bdb8d020fba746a72ddb27ccc4312cf337bb41bd516a8279d18c5`;
- Session Persistence v2 run `32693737054`, artifact `9508170582`, digest `sha256:435c60b79094ca9a64a97cc222544e2e2b4c27355ae63e42edddf854e283778d`.

Issue #490 is closed as completed.

## Current gate

No further product implementation is authorized.

The next permitted activity is exactly one bounded strategy review of the accepted playable loop. Any new milestone requires a separate documentation-only contract PR accepted on `main` before implementation begins.

The following remain blocked without a later explicit contract:

- economy, costs, production simulation, workers, timers and queues;
- city, nation or empire progression;
- another land or multiple-land expansion;
- new terrain, GLB, asset family or independent geography;
- broad Village, Map or World polish;
- `app/play/**` or public shell changes;
- backend, accounts, cloud save, multiplayer, combat or diplomacy;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12;
- MAX or paid tools;
- image generation as implementation authority.

## Release state

- PR #492 exact-head product evidence: PASS;
- PR #492 merge: `ea3fd0d3daebcfc1cc4b935bd1b46940e0b57d40`;
- Vercel for the merge SHA: SUCCESS;
- issue #490: completed;
- open product PRs after merge: none;
- public-origin route verification remains an environment capability boundary, not evidence of an outage.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Use focused Godot tests during iteration and full evidence at the final gate.
4. Directly inspect running-game images and motion.
5. One bounded visual correction maximum per milestone.
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
4. active execution issue named here, when one exists;
5. accepted exact-head evidence and merged PRs;
6. operating and QA protocols;
7. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful implementation:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. read the active execution issue named here, when one exists;
4. re-fetch live GitHub state;
5. state model and tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Do not start another product implementation. Stop after this PASS record is accepted on `main`. Resume only with one bounded strategy review and a separately accepted contract.
