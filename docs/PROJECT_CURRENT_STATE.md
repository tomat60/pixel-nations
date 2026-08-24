# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: Aurelian Visible Expansion v1 accepted, bounded strategy review required
Authority source: this file on the current `main`
Authority baseline SHA: `67ad47798189ab6ce65781599a87105fc31391a5`
Product baseline SHA: `67ad47798189ab6ce65781599a87105fc31391a5`
Current milestone: choose and authorize exactly one next bounded product milestone
Active execution issue: none
Next allowed action: one bounded strategy review, release verification and a documentation-only authority PR. No new product implementation is authorized yet.

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

Accepted GLB identity remains unchanged unless a later explicit asset milestone changes it.

## Most recent accepted product milestone

PR #484 `Implement Aurelian Visible Expansion v1` is accepted.

- terminal result: `AURELIAN_VISIBLE_EXPANSION_V1_PASS`;
- accepted head: `7527a9884aedcad00b0adcc1312444cfb326b5c8`;
- merged product baseline: `67ad47798189ab6ce65781599a87105fc31391a5`;
- shared geography and accepted GLB unchanged;
- founded Greenvale expanded from 4 visible settlement nodes to 10;
- claimed remains a single territorial marker;
- developed remains a 13-node superset;
- composition now follows the village green, crossing road and fields work edge;
- Village, Map and World framing remains one coherent Basin;
- claim, founding, Web playability and persistence contracts remain green.

Exact-head evidence:

- Playable Entry run `32675472551`, artifact `9502553750`, digest `sha256:35ad41f56fa02f595cd0ef0d8739f65501d2b9495212043053acf499cd617d0a`;
- Production Village run `32675472547`, artifact `9502545609`, digest `sha256:0600acec8ca404d3109230f0c14df9e70785f26a8a94db80d56b2fc43d9400c3`;
- Web Playability run `32675472568`, artifact `9502544910`, digest `sha256:82f6a89fc95ba68e9664f092b24867e494b83b83e0d3467d22dc6fb3b2e6c0e7`.

The first visual artifact was `CORRECTION_REQUIRED` because founded structures were too tightly piled near the bridge. The single allowed bounded correction spread the same accepted asset set along the road, village green and fields edge. Direct review then passed the claimed -> founded transition, the expanded settlement, Map/World coherence and the input-driven sequence.

## Release state

- PR exact-head guards: PASS;
- merge SHA Vercel status: SUCCESS;
- no open PR remains after #484 merge;
- public-origin HTTP is not required to classify this Godot-only product evidence and is not inferred from Vercel status.

## Current authority gate

No next product implementation is authorized.

The next milestone must be selected by one bounded strategy review and merged as an explicit contract before another product branch starts.

The review must choose one coherent next player-facing outcome, not a bundle of systems. It must define:

- player outcome;
- exact allowed scope;
- forbidden scope;
- evidence and direct-review gate;
- one correction maximum when visual;
- cost mode and stop condition.

## Allowed now

- bounded strategy review;
- documentation-only contract work;
- GitHub QA and release verification;
- read-only inspection of accepted artifacts and product gaps.

## Forbidden now

- new product implementation without a merged contract;
- economy, resources, workers, timers or production queues;
- city, nation or empire mechanics;
- multiple-land systemic expansion;
- backend, accounts, cloud save, multiplayer, combat or diplomacy;
- new paid assets or paid generation;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12;
- MAX or paid tools without a named blocker and explicit authority.

## Process acceleration rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Use focused Godot tests during iteration and full evidence at the final gate.
4. Directly inspect running-game images and motion. Green CI alone is not acceptance.
5. One bounded visual correction maximum.
6. An open PR with no meaningful progress for roughly one steward interval is P0.
7. Preserve accepted shared geography and avoid rebuilding the GLB for view-specific work.

## Tool and cost policy

- Strategy/control/direct review: GPT-5.6 Sol.
- Deterministic GitHub/Godot tooling first.
- Cursor only when materially useful as executor, GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not implementation authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. the next active issue after it is explicitly selected here;
5. accepted exact-head evidence and current operating/QA protocols;
6. historical issues, PRs, briefs and generated reports.

Issue #482 and PR #484 remain accepted provenance for Aurelian Visible Expansion v1, but they do not authorize another implementation.

## Session start gate

Before meaningful implementation:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. read the active issue named here, when one exists;
4. re-fetch live GitHub state;
5. state model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Stop product execution until one bounded strategy review selects a next milestone and its explicit contract is accepted on `main`.
