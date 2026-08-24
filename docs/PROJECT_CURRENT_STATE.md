# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: First Trade Caravan Dispatch v1 contract proposed
Authority source: this file on the current `main`
Authority baseline SHA: `6bffe07dc6afab9bb4caf115992ebf1bb17e1e7e`
Product baseline SHA: `ea3fd0d3daebcfc1cc4b935bd1b46940e0b57d40`
Current milestone: authorize `GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_V1`
Active execution issue: #494
Next allowed action: merge the documentation-only contract after exact-head guards pass, then execute exactly one bounded First Trade Caravan Dispatch v1 candidate.

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
- Production Village `claimed / founded / developed`;
- Production Map land-state presentation;
- Production World strategic-direction role;
- World to Map to Village decision handoff;
- normal Godot playable entry and keyboard navigation;
- packaged Aurelian render asset;
- Chromium Web export playability;
- Session Persistence v2 for native and Web;
- explicit First Land Claim;
- explicit First Settlement Founding;
- Aurelian Visible Expansion v1;
- explicit First Settlement Development;
- explicit First Trade Route Connection with cross-view payoff.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #492 `Implement Godot Aurelian First Trade Route Connection v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_PASS`;
- accepted head: `f46d8fd3c2d073d1b984b452b884cf3a74a24bd2`;
- merged product baseline: `ea3fd0d3daebcfc1cc4b935bd1b46940e0b57d40`;
- player path: `Village developed -> Map East Route claimed -> explicit Connect East Route -> Map East Route connected -> World trade route active`;
- event: `AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE`, emitted only for explicit connection;
- native restart, Web reload and persistent-profile reopen restore `map_east_route_connected:east_trade`;
- direct review confirmed readable claimed-to-connected change, World trade payoff and no shared-geography regression.

Accepted evidence:

- Playable Entry run `32693737031`, artifact `9508178940`, digest `sha256:dee4063247bd7e1970238feb2890bf22ce3ca3b14a27abcd54e44e6acd19cb26`;
- Web Playability run `32693737059`, artifact `9508166361`, digest `sha256:65ca6568299bdb8d020fba746a72ddb27ccc4312cf337bb41bd516a8279d18c5`;
- Session Persistence v2 run `32693737054`, artifact `9508170582`, digest `sha256:435c60b79094ca9a64a97cc222544e2e2b4c27355ae63e42edddf854e283778d`.

Issue #490 is closed as completed.

## Current contract

Issue #494 and `docs/GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_V1_CONTRACT.md` propose exactly one bounded outcome:

`World trade route active -> Map route connected -> Village developed -> explicit Dispatch First Caravan -> Map route in use -> World first trade underway`

Required constraints:

- explicit action label: `Dispatch First Caravan`;
- explicit-only event: `AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE`;
- exactly one restrained procedural caravan token at a fixed point on the existing Greenvale to Gilded Crossing route;
- the token is a state marker, not an animated or simulated unit;
- Session Persistence v2 retains its namespace and schema version 2 unless a deterministic compatibility failure proves otherwise;
- one bounded visual correction maximum;
- direct exact-head artifact review is mandatory.

## Current gate

Before the contract PR merges, no product implementation is authorized.

After the documentation-only contract is accepted on `main`, exactly one bounded implementation candidate is allowed for issue #494.

Allowed:

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Playable Entry, Web Playability and Session Persistence v2 workflows where necessary;
- one small focused evidence adjustment only if existing workflows cannot prove the outcome;
- documentation and evidence manifests.

Forbidden:

- prices, resources, costs, rewards, inventory or economy;
- production simulation, workers, timers, queues or repeated caravans;
- city, nation or empire progression;
- another land or multiple-land expansion;
- new terrain, GLB, asset family, geography or Village nodes;
- broad Village, Map or World polish;
- `app/play/**` or public shell changes;
- backend, accounts, cloud save, multiplayer, combat or diplomacy;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12, MAX, paid tools or image generation authority.

## Release state

- PR #492 exact-head product evidence: PASS;
- PR #492 merge: `ea3fd0d3daebcfc1cc4b935bd1b46940e0b57d40`;
- PASS record merge: `6bffe07dc6afab9bb4caf115992ebf1bb17e1e7e`;
- Vercel for both merge SHAs: SUCCESS;
- issue #490: completed;
- issue #494: open contract authority;
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
4. active execution issue named here;
5. accepted exact-head evidence and merged PRs;
6. operating and QA protocols;
7. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful implementation:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. read issue #494;
4. re-fetch live GitHub state;
5. state model and tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Do not start product implementation before the documentation-only contract merges. After merge, stop the implementation candidate at direct exact-head `GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_PASS` or `GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_REJECT`.
