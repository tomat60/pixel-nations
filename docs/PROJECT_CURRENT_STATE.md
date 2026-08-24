# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: First City Charter v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `b747ce5579a29c0b0cb07887c57046549ea3db79`
Product baseline SHA: `b747ce5579a29c0b0cb07887c57046549ea3db79`
Current milestone: none authorized
Active execution issue: none
Next allowed action: one bounded strategy review and a separate documentation-only contract for any next product milestone.

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
- Production Village `claimed / founded / developed / city_chartered`;
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
- explicit First Trade Caravan Dispatch with cross-view payoff;
- explicit First City Charter with cross-view payoff.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #500 `Implement Godot Aurelian First City Charter v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_CITY_CHARTER_PASS`;
- accepted head: `41345833d2520b340b3934b676f55d16553e80ca`;
- merged product baseline: `b747ce5579a29c0b0cb07887c57046549ea3db79`;
- player path: `World first trade underway -> Map East Route in use -> Village developed -> explicit Charter Greenvale -> Village first city -> Map city marker -> World first city recognized`;
- event: `AURELIAN_FIRST_CITY_CHARTER=GREENVALE`, emitted only for explicit charter;
- the accepted 13-node developed settlement expands to a 19-node civic-core superset using the repository-pinned asset family;
- one subordinate city marker remains at the accepted Greenvale topology origin `[354,285]`;
- native restart, Web reload and persistent-profile reopen restore `map_greenvale_city:east_trade`;
- reopening Village restores `village_city_chartered`;
- direct review confirmed the visible city transformation, Map WHERE role, World WHY role and unchanged shared geography;
- no visual correction was required.

Accepted evidence:

- Playable Entry run `32715919643`, artifact `9516051229`, digest `sha256:42d3b90f1963d1a28161b9537dabf49e7d610f92fddf4e7634feed85272d754f`;
- Web Playability run `32715919938`, artifact `9516003998`, digest `sha256:32f44a0e37d447bc5ccf36a366e7910f10632218e1c6723b928784921d417581`;
- Session Persistence v2 run `32715919731`, artifact `9515997814`, digest `sha256:07b80890df27fb8304c5d148ebaf78c5b90be8c6355cf395ac796041cc93b59d`.

Issue #498 is completed by this accepted implementation.

## Current gate

No additional product implementation is authorized.

Allowed:

- repository QA and release verification;
- one bounded strategy review;
- one separate documentation-only contract for a selected next milestone.

Forbidden until a new contract is accepted on `main`:

- product implementation;
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

- PR #500 exact-head product evidence: PASS;
- PR #500 merge: `b747ce5579a29c0b0cb07887c57046549ea3db79`;
- exact-head Vercel preview: SUCCESS;
- merge-SHA deployment status: pending availability;
- issue #498: completed;
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
4. an active execution issue named here;
5. accepted exact-head evidence and merged PRs;
6. operating and QA protocols;
7. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful work:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. re-fetch live GitHub state;
4. state model and tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Do not start another product implementation before a bounded strategy review and a separate contract are accepted on `main`.
