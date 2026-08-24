# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: First City Charter v1 contract proposed
Authority source: this file on the current `main`
Authority baseline SHA: `026183e364f7b411a294e11ec2f35bde78898fa0`
Product baseline SHA: `c6b6133d5271aee73ae2252af7492886a005b19b`
Current milestone: authorize `GODOT_AURELIAN_FIRST_CITY_CHARTER_V1`
Active execution issue: #498
Next allowed action: merge the documentation-only contract after exact-head guards pass, then execute exactly one bounded First City Charter v1 candidate.

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
- explicit First Trade Route Connection with cross-view payoff;
- explicit First Trade Caravan Dispatch with cross-view payoff.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #496 `Implement Godot Aurelian First Trade Caravan Dispatch v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH_PASS`;
- accepted head: `d20e7368fcacfc79287b182abecd5f3a49600dd7`;
- merged product baseline: `c6b6133d5271aee73ae2252af7492886a005b19b`;
- player path: `World trade route active -> Map route connected -> Village developed -> explicit Dispatch First Caravan -> Map route in use -> World first trade underway`;
- event: `AURELIAN_FIRST_TRADE_CARAVAN_DISPATCH=EAST_ROUTE`, emitted only for explicit dispatch;
- one fixed gold and red procedural token marks the route at `[435,313]`;
- native restart, Web reload and persistent-profile reopen restore `map_east_route_in_use:east_trade`;
- denied localStorage safely falls back to `world_neutral:none`;
- direct review confirmed readable route-in-use and first-trade-underway payoff with no shared-geography regression;
- the one allowed visual correction removed a colliding label and strengthened the static token.

Accepted evidence:

- Playable Entry run `32705747920`, artifact `9512302338`, digest `sha256:c909726472bec15daa154dbf3e3fd582c47ae4bf76ebfc5a5432236898d37013`;
- Web Playability run `32705747882`, artifact `9512263732`, digest `sha256:be60ac3b974b6f0aa140b3194c718f57ae1ddb46757e7994c0d32096771b7cba`;
- Session Persistence v2 run `32705747829`, artifact `9512280852`, digest `sha256:ea26856174040aa582f707183217f62ff3d91a92f507301501b70f6d6315ddef`.

Issue #494 is completed.

## Current contract

Issue #498 and `docs/GODOT_AURELIAN_FIRST_CITY_CHARTER_V1_CONTRACT.md` propose exactly one bounded outcome:

`World first trade underway -> Map East Route in use -> Village developed -> explicit Charter Greenvale -> Village first city -> Map city marker -> World first city recognized`

Required constraints:

- explicit action label: `Charter Greenvale`;
- explicit-only event: `AURELIAN_FIRST_CITY_CHARTER=GREENVALE`;
- chartered Village is a compact civic-core superset of the accepted 13-node developed baseline;
- repository-pinned KayKit asset family only;
- exactly one subordinate Greenvale city marker on Map;
- Session Persistence v2 retains its namespace and schema version 2 unless deterministic compatibility failure proves otherwise;
- one bounded visual correction maximum;
- direct exact-head artifact review is mandatory.

## Current gate

Before the contract PR merges, no product implementation is authorized.

After the documentation-only contract is accepted on `main`, exactly one bounded implementation candidate is allowed for issue #498.

Allowed:

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Playable Entry, Web Playability and Session Persistence v2 workflows where necessary;
- one small focused evidence adjustment only if existing workflows cannot prove the outcome;
- documentation and evidence manifests.

Forbidden:

- prices, resources, costs, rewards, inventory, taxes or economy;
- population simulation, workers, timers, queues or repeated actions;
- nation or empire progression;
- another land or multiple-land expansion;
- new terrain, GLB, asset family or geography;
- broad Village, Map or World polish;
- `app/play/**` or public shell changes;
- backend, accounts, cloud save, multiplayer, combat or diplomacy;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12, MAX, paid tools or image generation authority.

## Release state

- PR #496 exact-head product evidence: PASS;
- PR #496 merge: `c6b6133d5271aee73ae2252af7492886a005b19b`;
- merge-SHA Vercel: SUCCESS;
- issue #494: completed;
- issue #498: open contract authority;
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

Before meaningful work:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. read issue #498;
4. re-fetch live GitHub state;
5. state model and tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Do not start product implementation before the documentation-only First City Charter v1 contract merges. After merge, stop the implementation candidate at direct exact-head `GODOT_AURELIAN_FIRST_CITY_CHARTER_PASS` or `GODOT_AURELIAN_FIRST_CITY_CHARTER_REJECT`.
