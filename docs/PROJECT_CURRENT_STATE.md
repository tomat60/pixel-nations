# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-07
Current state revision: Visual Reset v0.2
Authority baseline SHA: 7f855c9860954de50406503d3f3b5f1bbe2c64a3
Product baseline SHA: 7f855c9860954de50406503d3f3b5f1bbe2c64a3
Current milestone: Village V4 layered growth proof
Active execution issue: #396
Next allowed action: Produce and directly review one deterministic Village V4 art proof with an opaque terrain base, an initial Camp layer, and eight genuine order-delta layers in registered desktop and portrait compositions. Do not integrate runtime art before this proof passes.

## Purpose

This file is the first and highest-priority source of current project state for every assistant, agent, and new session.

It must stay short, current, and operational. Historical sprint summaries belong in their original issues, PRs, ADRs, and archived strategy documents.

## Current product truth

Pixel Nations is a strategy game built around:

`one land → settlement / city → nation → empire`

The full world contains 10,000 lands in a 100 × 100 structure. The current playable/demo area is Sector A-01 / Aurelian Basin.

The real `/play` product path on `main` preserves the eight settlement orders and later nation/empire continuity. Its current Village renderer exposes only three flattened visual states:

`camp → first shelter → developed settlement`

Exact-head video review proved that Gather Food, Cut Timber and Scout Nearby Land leave the shelter image unchanged, Build Storehouse swaps the whole frame to the completed settlement, and the remaining orders leave that image unchanged again.

## Current acceptance status

- Gameplay/state continuity through P5: `ACCEPTED AS WORKING BASELINE`.
- Current three-frame Aurelian Village composition: `OWNER_REJECTED`.
- World V2 rectangular regional map: `OWNER_REJECTED`.
- World V3 irregular-SVG technique from closed PR #397: `REJECTED UNMERGED`.
- Production Village V4 art: `NOT YET ACCEPTED`.
- Production World V4 art: `NOT YET STARTED`.
- Current Next.js `/play` route: functioning product bridge, demo shell, and rollback surface.
- Godot: strategic target runtime under accepted ADR-001.
- React/SVG scene rebuilding as the final art direction: `BLOCKED`.
- Backend, accounts, payments, crypto/NFT/wallet/token, multiplayer, combat, and full economy: `OUT OF CURRENT SCOPE`.

## Runtime interpretation

ADR-001 remains binding: Godot is the target game runtime.

The current Next.js `/play` implementation may host accepted, Godot-compatible Aurelian art layers as a bounded bridge while it preserves working gameplay, persistence, QA, public demonstration, and rollback capability.

The same generated art files must be consumable by both the web bridge and the Godot art target. Do not create a second web-only visual world.

## Current active phase

Issue #396 is the active visual-reset authority.

Exact reviewed evidence:

- Play Visual QA run: `31221809166`
- exact PR head: `0b607ab83fef64227b4f005a4f11e27e75e74492`
- artifact: `9010693147`
- artifact digest: `sha256:26fde85d09086ed92c332b7a735274671372da56ca9f8740720cb97706d55312`
- World V3 decision: `REJECT TECHNIQUE`
- Village progression decision: `FAIL — NON-PROGRESSIVE THREE-FRAME SWAP`

The active order is:

1. Produce the Village V4 art proof.
2. Review exact native desktop and portrait evidence; allow at most one correction.
3. Integrate only after visual acceptance.
4. Build World V4 in the same isometric terrain, material and lighting grammar.

Council/P6 and other scope expansion remain paused until both visual blockers pass direct review.

## Village V4 proof contract

The proof must contain one opaque terrain base plus nine cumulative transparent layers:

`camp, shelter, food, timber, scout, storehouse, market, watch, council`

Camp is the visible initial state. Each of the eight settlement orders must add a persistent spatial trace. No order may map to an unchanged art state.

Desktop and portrait use separately composed but identically sequenced registered cameras. The developed footprint must grow around a civic/market core, connect visibly to the bridge, and occupy a meaningful share of buildable land.

## Source-of-truth precedence

When documents or issues conflict, use this order:

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially `docs/ADR_001_GODOT_DESKTOP_FIRST.md`
3. root `AGENTS.md`
4. active issue #396
5. exact-head evidence for the current milestone
6. operating and QA protocols
7. older issues, briefs, runbooks, and historical documents

An open issue, draft PR, generated handoff, green CI run, or stale `public/qa/latest` directory is not automatically current authority.

## Allowed work now

- deterministic Blender/KayKit Village V4 art-target source;
- registered desktop and portrait proof renders;
- transparent layer extraction and pixel-reconstruction validation;
- exact evidence manifests, contact sheets, provenance, and license checks;
- authority/documentation fixes tied to #396;
- one evidence-backed composition correction after direct review.

## Blocked work now

- runtime integration before Village V4 art acceptance;
- additional three-frame or full-frame-swap progression;
- full-frame blur/crossfade presented as construction;
- World V4 implementation before the Village V4 visual grammar is accepted;
- more work on the rejected World V3 SVG grid;
- Council/P6 expansion, broad product redesign, paid assets, or image generation without a new explicit decision;
- gameplay, reducer, persistence, routing, backend, account, payment, multiplayer, combat, or economy expansion;
- merge from green CI alone without direct product/visual acceptance.

## Session start gate

Before meaningful work:

1. Run `npm run pn:status`.
2. Read this file.
3. Read the accepted ADR relevant to the task.
4. Read `AGENTS.md`.
5. Read issue #396 and the Village V4 production contract.
6. Confirm allowed files, forbidden actions, validation, cost mode, and stop condition.

## Update rule

Update this file in the same PR, or in an immediate bounded follow-up, when the accepted milestone, active issue, product baseline, runtime decision, visual classification, next action, or major blocker changes.

## Current stop condition

Stop the art-proof phase after direct review returns one of:

- `ACCEPT FOR LAYER INTEGRATION`;
- `ONE COMPOSITION CORRECTION`;
- `REJECT ART DIRECTION`.

Do not spend the single correction on QA polish or renderer mechanics. It is reserved for an evidence-backed composition failure.
