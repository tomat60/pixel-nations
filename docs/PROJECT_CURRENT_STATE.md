# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: First Trade Route Connection v1 contract proposed
Authority source: this file on the current `main`
Authority baseline SHA: `09866ea8c5111a1e4c6cf1a2708fe94db0078dfc`
Product baseline SHA: `3cb0a3df33da606bfff45c5855a332b3ae204a22`
Current milestone: authorize exactly one Godot Aurelian First Trade Route Connection v1 candidate
Active execution issue: #490
Next allowed action: complete the documentation-only authority PR. After it is accepted on `main`, implement exactly one bounded First Trade Route Connection v1 candidate.

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

PR #488 `Implement Godot Aurelian First Settlement Development v1` is accepted.

- terminal result: `GODOT_AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT_PASS`;
- accepted head: `f48a2a8229720851bc0bb4062d5ab459c45ff635`;
- merged product baseline: `3cb0a3df33da606bfff45c5855a332b3ae204a22`;
- player path: `Village founded -> explicit Develop Greenvale -> Village developed`;
- event: `AURELIAN_FIRST_SETTLEMENT_DEVELOPMENT=GREENVALE`;
- East Route remains claimed;
- developed Greenvale persists across native restart, Web reload and profile reopen;
- denied storage retains `world_neutral:none`;
- direct review found no shared-geography regression.

Accepted exact-head evidence:

- Playable Entry run `32684258349`, artifact `9505159284`, digest `sha256:644eaf3a12c638c88b1e1d38aa9750f0f197ed7d629234f28baa62d4b87ee52d`;
- Web Playability run `32684258362`, artifact `9505155202`, digest `sha256:d1886c3c999361b68d134ff4d41636d80452609b85c698b845fba9a1de7cc4fd`;
- Session Persistence v2 run `32684258346`, artifact `9505151862`, digest `sha256:fa3c87cd2f945fb20e56aa75f61660b743ee6930c27e19655f5450d47d8df517`.

PR #489 recorded this PASS on `main@09866ea8c5111a1e4c6cf1a2708fe94db0078dfc`. Issue #486 is closed as completed.

## Bounded strategy review

The next smallest useful milestone is not city progression or economy.

The accepted Village development currently changes the local settlement but does not create a visible consequence on Map or World. The binding view-role contract requires Village growth to change what becomes possible in the wider decision loop.

The review therefore selected `Godot Aurelian First Trade Route Connection v1`:

`Village developed -> Map East Route claimed -> explicit Connect East Route -> Map East Route connected -> World trade route active`

This reuses the existing `GreenvaleTradeRouteContext` from Greenvale `[354,285]` to Gilded Crossing `[515,340]`. It adds no geography, asset family, economy or second land.

The binding implementation contract is `docs/GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_V1_CONTRACT.md`.

## Candidate requirements

The candidate must:

- restore or reach developed Greenvale;
- return to the claimed East Route;
- expose a deliberate `Connect East Route` action;
- emit `AURELIAN_FIRST_TRADE_ROUTE_CONNECTION=EAST_ROUTE` only for explicit connection;
- show `map_east_route_connected` as distinct from claimed while keeping terrain dominant;
- show `world_trade_route_active` as the strategic consequence;
- reopen Map as connected and Village as developed;
- preserve both states across native restart, Web reload and persistent-profile reopen;
- retain denied-storage fallback;
- preserve all shared topology and view-role semantics.

## Allowed after contract merge

- one bounded implementation candidate under issue #490;
- `game/scenes/aurelian/**` for controller, overlays, state binding and manifests;
- `game/tests/**` for transition, persistence, event and topology contracts;
- existing Playable Entry, Web Playability and Session Persistence v2 workflows where needed;
- one small focused evidence adjustment only if existing workflows cannot prove the cross-view payoff;
- direct review of exact-head stills, video, manifests and artifacts;
- one bounded visual correction maximum after the first meaningful artifact.

## Forbidden

- implementation before this authority PR is accepted on `main`;
- resource costs, economy, production simulation, workers, timers or queues;
- city, nation or empire progression;
- new terrain, GLB, asset family, geography or Village nodes;
- another land or multiple-land expansion;
- broad Village, Map or World polish;
- changing East Route or route topology;
- `app/play/**` or public shell changes;
- backend, accounts, cloud save, multiplayer, combat or diplomacy;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12;
- MAX or paid tools;
- image generation as implementation authority.

## Acceptance gate

Green CI alone is not acceptance.

Required exact-head evidence:

- developed Village before connection;
- claimed Map before connection;
- explicit connection HUD/action;
- connected Map after action;
- World eastern Trade active state;
- connected Map and developed Village after reopening;
- one normal-input cross-view sequence;
- native restart, Web reload and profile reopen persistence;
- denied-storage fallback;
- exact-head manifests, tests, artifacts and digests;
- direct visual review;
- Village, Map, World and shared-geography regression evidence.

Terminal classification after one bounded visual correction maximum:

- `GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_PASS`, or
- `GODOT_AURELIAN_FIRST_TRADE_ROUTE_CONNECTION_REJECT`.

## Release state

- PR #488 exact-head product evidence: PASS;
- PR #489 acceptance record: merged;
- current `main@09866ea8c5111a1e4c6cf1a2708fe94db0078dfc`;
- Vercel for current main: SUCCESS;
- no open product PR existed when this strategy review began;
- public-origin route verification remains an environment capability boundary, not evidence of an outage.

## Process acceleration rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Use focused Godot tests during iteration and full evidence at the final gate.
4. Directly inspect running-game images and motion.
5. One bounded visual correction maximum.
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
4. active issue #490;
5. accepted exact-head evidence and merged PRs;
6. operating and QA protocols;
7. historical issues, PRs, briefs and reports.

Issue #486 is completed execution provenance. Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful implementation:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. read active issue #490;
4. re-fetch live GitHub state;
5. state model and tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Do not start product implementation until the First Trade Route Connection v1 contract is accepted on `main`. Then implement exactly one bounded candidate and stop after direct exact-head PASS or REJECT.
