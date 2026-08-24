# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: First Settlement Development v1 contract proposed
Authority source: this file on the current `main`
Authority baseline SHA: `cdfa6065eb797afb086b330ba02edb38adb07198`
Product baseline SHA: `67ad47798189ab6ce65781599a87105fc31391a5`
Current milestone: authorize exactly one Godot Aurelian First Settlement Development v1 candidate
Active execution issue: #486
Next allowed action: complete the documentation-only authority PR. After it is accepted on `main`, implement exactly one bounded First Settlement Development v1 candidate.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current playable demonstration is Sector A-01 / Aurelian Basin.

Godot remains the target runtime under ADR-001. Next.js `/play` remains a bridge, mechanics reference and rollback surface, not the production-final visual engine.

Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Accepted foundation that must be reused

Do not rebuild these accepted capabilities:

- shared deterministic Aurelian Basin geography and Blender -> GLB -> Godot pipeline;
- Production Village `claimed / founded / developed` state presentation;
- Production Map land-state presentation;
- Production World strategic-direction role;
- World -> Map -> Village decision handoff;
- normal Godot playable entry and keyboard navigation;
- packaged Aurelian render asset;
- Chromium Web export playability;
- Session Persistence v2 for native and Web;
- explicit First Land Claim flow;
- explicit First Settlement Founding flow with persisted Greenvale founded state;
- Aurelian Visible Expansion v1 composition and view framing.

Accepted GLB identity remains unchanged.

## Most recent accepted product milestone

PR #484 `Implement Aurelian Visible Expansion v1` is accepted.

- terminal result: `AURELIAN_VISIBLE_EXPANSION_V1_PASS`;
- accepted head: `7527a9884aedcad00b0adcc1312444cfb326b5c8`;
- merged product baseline: `67ad47798189ab6ce65781599a87105fc31391a5`;
- claimed remains one territorial marker;
- founded Greenvale contains 10 distributed settlement elements;
- developed Greenvale remains a 13-node superset;
- composition follows the village green, crossing road and fields work edge;
- Village, Map and World retain one coherent Basin;
- claim, founding, Web playability and persistence contracts remain green.

Accepted exact-head evidence:

- Playable Entry run `32675472551`, artifact `9502553750`, digest `sha256:35ad41f56fa02f595cd0ef0d8739f65501d2b9495212043053acf499cd617d0a`;
- Production Village run `32675472547`, artifact `9502545609`, digest `sha256:0600acec8ca404d3109230f0c14df9e70785f26a8a94db80d56b2fc43d9400c3`;
- Web Playability run `32675472568`, artifact `9502544910`, digest `sha256:82f6a89fc95ba68e9664f092b24867e494b83b83e0d3467d22dc6fb3b2e6c0e7`.

The single allowed visual correction spread the same accepted asset set along the road, village green and fields edge. Direct review passed the claimed -> founded transition, richer settlement composition, Map and World coherence and the input-driven sequence.

## Current milestone contract

The bounded strategy review selected `Godot Aurelian First Settlement Development v1`.

Player outcome:

`Village founded -> explicit Develop Greenvale -> Village developed`

The candidate must:

- reuse the accepted founded and 13-node developed Village states;
- expose a deliberate `Develop Greenvale` action;
- emit `AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE` only for explicit development;
- retain East Route as claimed;
- reopen Greenvale as developed after leaving;
- preserve developed across native restart, Web reload and persistent-profile browser reopen;
- retain denied-storage fallback behavior;
- preserve shared geography and view-role semantics.

The binding implementation contract is `docs/GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_V1_CONTRACT.md`.

## Allowed after contract merge

- one bounded implementation candidate under issue #486;
- `game/scenes/aurelian/**` for controller, state binding and manifests;
- `game/tests/**` for transition, persistence and topology contracts;
- existing focused Playable Entry, Web Playability and Session Persistence v2 workflows where needed;
- direct review of exact-head stills, video, manifests and artifacts;
- one bounded correction maximum after the first meaningful artifact.

## Forbidden

- implementation before the authority PR is accepted on `main`;
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

## Acceptance gate

Green CI alone is not acceptance.

Required exact-head evidence:

- founded Village before development;
- explicit development HUD/action;
- developed Village after action;
- claimed Map after leaving;
- developed Village after reopening;
- one normal-input sequence;
- native restart, Web reload and profile reopen persistence;
- denied-storage fallback;
- exact-head manifests, tests, artifacts and digests;
- direct visual and product review.

Terminal classification after one bounded correction maximum:

- `GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_PASS`, or
- `GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_REJECT`.

## Release state

- PR #484 exact-head product evidence: PASS;
- PR #485 recorded the accepted result;
- current `main@cdfa6065eb797afb086b330ba02edb38adb07198`;
- Vercel for current main: SUCCESS;
- no open product PR existed when this strategy review began.

## Process acceleration rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Use focused Godot tests during iteration and full evidence at the final gate.
4. Directly inspect running-game images and motion.
5. One bounded correction maximum.
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
4. active issue #486;
5. accepted exact-head evidence and current operating or QA protocols;
6. historical issues, PRs, briefs and reports.

Issue #482 is completed strategy provenance for Visible Expansion v1. Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful implementation:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. read active issue #486;
4. re-fetch live GitHub state;
5. state model and tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Do not start product implementation until the First Settlement Development v1 contract is accepted on `main`. Then implement exactly one bounded candidate and stop after direct exact-head PASS or REJECT.
