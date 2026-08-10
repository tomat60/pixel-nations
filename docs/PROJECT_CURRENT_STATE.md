# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-10
Current state revision: Aurelian Topology Lock v0.4
Authority source: this file on the current `main`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: Aurelian Shared Geography — Phase 0 topology lock
Active execution issue: #415
Active implementation PR: none
Last completed milestone: P11 / #422 / #421
Next allowed action: Produce one topology/composition board for the Aurelian Basin, review it directly, and classify it `PASS / CORRECTION REQUIRED / REJECTED`. Do not start P12 or Godot scene implementation before board PASS.

## Purpose

This file is the first and highest-priority source of current project state for every assistant, agent, automation, and new session.

Keep it short, current, and operational. Historical sprint summaries stay in issues, PRs, ADRs and archived documents.

## Current product truth

Pixel Nations is a strategy game built around:

`one land → settlement / city → nation → empire`

The full world contains 10,000 lands in a 100 × 100 structure. The current playable/demo area is Sector A-01 / Aurelian Basin.

The accepted web product preserves the full founder progression through Founder Record and one previous read-only history. P4–P11 are accepted and merged. P11 closed the bounded P10 continuity defect; it does not authorize P12 or another retention roadmap.

## Current acceptance status

- P4–P11 product work: `ACCEPTED / MERGED`.
- P11 / #422: `ACCEPTED / MERGED` as `c94423d5a9c60f1982ae2935551fc1905d46e719`.
- P11 execution issue #421: `CLOSED / COMPLETED`.
- Current `main`: product baseline `c94423d5a9c60f1982ae2935551fc1905d46e719`; documentation head may be newer.
- Vercel deployment status for the current main documentation head: `SUCCESS` when last checked by the steward.
- Public-origin HTTP checks for `/`, `/play`, and `/world`: `PASS` with 200 responses; `/world` canonicalizes to `/play`.
- Public browser-render smoke for the product baseline: `PRODUCTION UNVERIFIED` from the current control environment because the available Playwright package has no Chromium executable installed. This is missing release evidence, not evidence of an outage.
- Current Village: `MECHANICALLY ACCEPTED BENCHMARK`; preserve its nine-stage progression and rollback value.
- Current bridge and independent Village/Map/World geography: `VISUALLY REJECTED FOR FINAL DIRECTION`.
- #415 shared Aurelian geography contract: `ACTIVE — PHASE 0 TOPOLOGY LOCK`.
- Backend, accounts, payments, crypto/NFT/wallet/token, multiplayer, combat, and full economy: `OUT OF CURRENT SCOPE`.

## Runtime and visual direction

ADR-001 remains binding: Godot is the target game runtime. Next.js `/play` remains the functioning demo shell and rollback surface until replacement evidence is accepted.

Village, Map and World must use one Aurelian Basin geography with the same river, bridge, roads, Greenvale origin, North Ridge, terrain zones, landmarks and transforms. Do not resume separate React/CSS/SVG scene patching as the final visual direction.

## Current active phase

The only active product-direction task is #415 Phase 0. Produce a topology/composition board before implementation.

The board must establish:

1. one canonical top-down Aurelian Basin coordinate plane;
2. the river path, banks, shoreline/coast or outer-water boundary;
3. one bridge crossing approximately perpendicular to local river flow, with both ends on dry ground and connected approach roads;
4. Greenvale, North Ridge/highland, forest/work edge, fields/plains and the main route relationships;
5. Village, Map and World camera frames cut from the same geography;
6. a compact node/transform naming contract proving that the three views will not reauthor geography;
7. the semantic role of Village, Map and World while preserving the 10,000-land product truth.

This is a composition and topology gate, not final art. Stop after direct review. One named correction pass is allowed before rejection.

## Mandatory PR and release ownership

The user is not responsible for finding failed, drifting, or stuck PRs.

For every PR open/head change, ChatGPT/control-plane must re-fetch the live SHA, inspect authority and scope, full diff, base drift, mergeability, checks, failed logs, and required artifacts, then assign `PENDING / BLOCKED / REJECTED / READY`.

A green status alone is insufficient. Required screenshots, JSON, manifests, and videos must be opened and reviewed directly on the exact head.

After every merge, verify accepted head → merge SHA → new `main` → checks → deployment → real public routes. Localhost RC1 and pre-merge preview are not post-release proof. If the public origin cannot be fully tested, record `PRODUCTION UNVERIFIED` and the exact missing evidence.

Do not begin another product PR or merge while the current PR/release is failing, unreviewed or unresolved. Escalate to the user only for a genuine product-direction choice or authority blocker, not routine QA detection.

## Source-of-truth precedence

When sources conflict:

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially `docs/ADR_001_GODOT_DESKTOP_FIRST.md`
3. root `AGENTS.md`
4. the active execution issue named here
5. exact-head evidence and the accepted PR for the current milestone
6. operating and QA protocols
7. older issues, draft PRs, comments, sprint briefs, runbooks and historical documents

An open issue, draft PR, generated handoff or green CI run is not automatically authority.

## Allowed work now

- one #415 topology/composition board and its compact topology/transform contract;
- direct board review and at most one named correction pass;
- read-only inventory of reusable state/persistence/demo-shell code and verified asset provenance;
- control-plane documentation and release verification;
- retrying independent public browser-render checks when the environment can run a real browser.

## Blocked work now

- P12 or any further retention/onboarding/gameplay mechanics;
- Godot scene implementation before direct topology-board PASS;
- independent React/CSS/SVG Map or World rebuilding as final product art;
- product UI changes while the topology gate is unresolved;
- image generation, paid assets, paid tools, and MAX;
- backend, accounts, payments, multiplayer, combat, full economy, or crypto;
- merge from green CI alone.

## Session start gate

Before meaningful work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, the relevant ADR, root `AGENTS.md`, and #415.
3. Re-fetch live GitHub state; never trust cached PR SHA or check status.
4. State tool/model, MAX, cost, allowed scope, forbidden actions, validation, and stop condition.

## Update rule

Replace the current fields and sections in this file whenever the accepted milestone, active issue/PR, product baseline, visual acceptance, next allowed action, or major blocker changes. Do not append history.

## Current stop condition

Phase 0 ends only when the topology/composition board is directly reviewed and classified:

- `PASS`: authorize one bounded Phase 1 shared-geography proof under #415;
- `CORRECTION REQUIRED`: perform the one named correction pass and review again;
- `REJECTED`: stop the technique without product integration.

No P12 is allowed in any outcome.
