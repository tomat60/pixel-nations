# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-23
Current state revision: First Settlement Founding accepted, Aurelian Visible Expansion v1 selected
Authority source: this file on the current `main`
Authority baseline SHA: `21c3a28dc904d63d109fcdc5393e55c4be4d4b4d`
Product baseline SHA: `33394c20457ffa66a6cd72479001ef0c89d8dbd2`
Current milestone: implement exactly one Aurelian Visible Expansion v1 candidate
Active execution issue: #482
Next allowed action: after this authority alignment merges with healthy checks, implement one visibly larger and richer Aurelian Basin / Greenvale candidate on the existing shared Godot geography.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current playable demonstration is Sector A-01 / Aurelian Basin.

Godot remains the target runtime under ADR-001. Next.js `/play` remains a bridge, mechanics reference and rollback surface, not the production-final visual engine.

The demo must prove the fantasy through one understandable player arc before broad systems expansion.

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
- explicit First Settlement Founding flow with persisted Greenvale founded state.

Most recent accepted product milestone:

- PR #480 `Implement Godot First Settlement Founding v1`;
- accepted head `a75fb8eb1b859eedf2b68b4922a70471cd741487`;
- merged product baseline `33394c20457ffa66a6cd72479001ef0c89d8dbd2`;
- final result: `GODOT_AURELIAN_FIRST_SETTLEMENT_FOUNDING_PASS`.

Latest accepted process cleanup:

- PR #481 `Skip legacy web evidence on Godot-only PRs`;
- merged authority baseline `21c3a28dc904d63d109fcdc5393e55c4be4d4b4d`.

Accepted GLB identity remains unchanged unless a later explicit asset milestone changes it.

## Current milestone: Aurelian Visible Expansion v1

Binding execution issue: #482.

The bottleneck is now visible product progress. The next candidate must make the current game materially richer without adding another broad gameplay system.

Target outcome:

1. Greenvale reads as a believable founded settlement, not a few props on empty ground.
2. The immediate settlement area gains clearer structure using the existing asset envelope: paths/roads, fields or work edge, natural anchors and stronger composition.
3. Village framing improves so founding has a stronger visual payoff.
4. Map framing shows Greenvale embedded in a wider local geography.
5. World framing suggests an Aurelian Basin that continues beyond one small patch.
6. Village, Map and World remain views of the same persistent physical geography.
7. The accepted land-claim and settlement-founding loop remains intact.
8. No new economy, worker, timer, city, nation or empire system is required for this milestone.

## Execution model

Use a proof-driven iteration loop:

`spec -> implement -> run Godot -> capture screenshot/video -> inspect -> one bounded repair -> final gate`

During implementation:

- prefer fast headless/import/state tests;
- reuse the existing deterministic capture harness;
- do not rebuild a second QA or scene framework;
- do not wait for every legacy Web evidence suite on Godot-only changes;
- do not split one visible outcome into multiple tiny milestone PRs unless a real technical dependency requires it;
- one executor may implement while a separate reviewer/control-plane inspects the resulting exact head.

Full visual/persistence/regression evidence is required at the final candidate gate, not after every small edit.

## Allowed scope

Allowed for the implementation candidate:

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Aurelian manifests, layout and camera definitions;
- existing licensed/pinned assets already in the repository;
- minimal focused Godot QA workflow adjustment only if needed to prove the candidate.

## Forbidden scope

Do not broaden into:

- new paid assets or paid generation;
- a new asset family without proving the existing envelope is insufficient;
- React/SVG/CSS rebuilding of final game surfaces;
- economy, resource costs, workers, timers or production queues;
- city, nation or empire mechanics;
- multiple-land systemic expansion;
- backend, accounts, cloud save, multiplayer, combat or diplomacy;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- broad CI/platform refactoring inside the visual implementation PR.

## Visual acceptance gate

The exact candidate head must provide evidence that is visibly different from the current founding baseline:

- claimed/pre-founding Greenvale;
- founded Greenvale;
- expanded settlement and immediate environment composition;
- Map view showing Greenvale in wider local geography;
- World view showing coherent Aurelian context;
- one short input-driven or deterministic capture sequence;
- focused tests proving accepted claim/founding/persistence behavior did not regress.

Green CI is necessary but not sufficient. Direct image/video review decides visual acceptance.

Terminal classification:

- `AURELIAN_VISIBLE_EXPANSION_V1_PASS`
- `AURELIAN_VISIBLE_EXPANSION_V1_CORRECTION_REQUIRED`
- `AURELIAN_VISIBLE_EXPANSION_V1_REJECT`

One bounded correction maximum after the first meaningful visual artifact. If it remains weak, change art/level-design strategy instead of micro-polishing.

## Process acceleration rules

1. Optimize for visible playable progress, not number of gates passed.
2. One meaningful product PR at a time, but research/review/QA may run in parallel when they do not edit the same files.
3. Keep implementation tasks roughly reviewable in one sitting; batch related visual changes that produce one coherent outcome.
4. Use focused Godot tests during iteration and expensive/full evidence at final gate.
5. Directly inspect the running-game result; compile success is not product proof.
6. User-reported confusion or visual rejection overrides screenshot-only automation.
7. An open PR with no progress for roughly one steward interval is P0 and must be diagnosed.
8. Small continuous cleanup is preferred over multi-day infrastructure detours.

## Tool and cost policy

- Strategy/control/direct review: GPT-5.6 Sol.
- Executor when useful: Cursor GPT-5.5 without MAX.
- MAX: OFF unless a named blocker justifies it.
- Deterministic GitHub/Godot tooling first.
- Blender only when the shared authored asset itself must change.
- Extra spend target: 0 USD.

## Mandatory PR/release ownership

For every candidate PR/head change:

- verify exact head/base, diff, changed files and mergeability;
- inspect failed jobs rather than blind-rerunning;
- directly inspect required screenshot/video artifacts;
- classify `PENDING / BLOCKED / REJECTED / READY`.

After merge, verify accepted head -> merge SHA -> new `main` and the relevant post-merge state. If production/public evidence cannot be reached, report exactly what remains unverified.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. active issue #482;
5. accepted exact-head evidence and current operating/QA protocols;
6. historical issues, PRs, briefs and generated reports.

Historical issue #415 remains useful provenance for the shared-geography reset, but it is no longer the active execution authority.

## Session start gate

Before meaningful implementation:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001, root `AGENTS.md` and issue #482;
3. re-fetch live GitHub state;
4. state model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

This authority alignment stops when the current-state update is merged and healthy.

Then implement exactly one Aurelian Visible Expansion v1 candidate and stop for direct visual/product review before adding economy, city, nation, empire or another broad system.
