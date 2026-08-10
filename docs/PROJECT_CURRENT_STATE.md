# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-10
Current state revision: Release Steward Reset v0.3
Authority source: this file on the current `main`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: Aurelian Shared Geography
Active execution issue: #415
Active implementation PR: none
Last completed milestone: P11 / #422 / #421
Next allowed action: Produce one topology/composition board for shared Aurelian Basin geography across Village, Map and World. Do not create P12. Do not implement Godot, image generation or independent Map/World React/CSS/SVG mockups before direct topology-board PASS.

## Purpose

This file is the first and highest-priority source of current project state for every assistant, agent, automation, and new session.

Keep it short, current, and operational. Historical sprint summaries stay in issues, PRs, ADRs and archived documents.

## Current product truth

Pixel Nations is a strategy game built around:

`one land → settlement / city → nation → empire`

The full world contains 10,000 lands in a 100 × 100 structure. The current playable/demo area is Sector A-01 / Aurelian Basin.

The accepted web product preserves the full founder progression through Founder Record and one previous read-only history. P4–P11 are merged. P11 closed the final bounded continuity defect before the visual reset resumes.

## Current acceptance status

- P4–P11 product work: `ACCEPTED / MERGED`.
- P11 / #422: `ACCEPTED / MERGED` at `c94423d5a9c60f1982ae2935551fc1905d46e719`.
- #421: `COMPLETED`.
- Current `main`: product baseline `c94423d5a9c60f1982ae2935551fc1905d46e719`.
- Vercel status for the product baseline: `SUCCESS`.
- Public-origin HTTP smoke for `/`, `/play`, `/world`: `PASS` with 200 responses; `/world` canonicalizes to `/play`.
- Public browser-render smoke for the product baseline: `PRODUCTION UNVERIFIED` from the current control environment because the available Playwright package has no Chromium executable installed. This is not evidence of an outage.
- Current Village: `MECHANICALLY ACCEPTED BENCHMARK`; preserve its nine-stage progression and rollback value.
- Current bridge and independent Village/Map/World geography: `VISUALLY REJECTED FOR FINAL DIRECTION`.
- #415 shared Aurelian geography contract: `ACTIVE NEXT DIRECTION`.
- Backend, accounts, payments, crypto/NFT/wallet/token, multiplayer, combat, and full economy: `OUT OF CURRENT SCOPE`.

## Runtime and visual direction

ADR-001 remains binding: Godot is the target game runtime. Next.js `/play` remains the functioning demo shell and rollback surface until replacement evidence is accepted.

Village, Map and World must use one Aurelian Basin geography with the same river, bridge, roads, landmarks and transforms. Do not resume separate React/CSS/SVG scene patching as the final visual direction.

## Current active phase

#415 is now the only active execution issue.

The required next artifact is one topology/composition board that defines shared Aurelian Basin geography before implementation. It must resolve the Map/World quality problem without changing the accepted Village mechanics benchmark.

Topology-board acceptance must directly evaluate:

- one consistent river, bridge, road network, ridge/frontier and landmark set;
- how Village, Map and World read from the same geography instead of separate scenes;
- desktop-first composition and camera/framing;
- explicit rejection of the old independent bridge/geography direction;
- no P12 mechanics, onboarding or retention scope.

## Mandatory PR and release ownership

The user is not responsible for finding failed or stuck PRs.

For every PR open/head change, ChatGPT/control-plane must re-fetch the live SHA, inspect authority/scope, full diff, mergeability, checks, failed logs and required artifacts, then assign `PENDING / BLOCKED / REJECTED / READY`.

After every merge, it must verify accepted head → merge SHA → new `main` → deployment → real public routes. Localhost RC1 and pre-merge preview are not post-release proof. If the public origin cannot be fully tested, record `PRODUCTION UNVERIFIED` and the exact missing evidence.

Do not begin another product PR or merge while the current PR/release is failing, unreviewed or unresolved.

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

- #415 topology/composition board only;
- control-plane documentation fixes;
- issue/PR cleanup that does not merge product code;
- production/public-origin verification when the environment can run a real browser.

## Blocked work now

- P12 or any further retention/onboarding/gameplay mechanics;
- Godot implementation before direct topology-board PASS;
- independent React/CSS/SVG Map or World rebuilding;
- image generation, Fable, paid assets, and MAX;
- backend, accounts, payments, multiplayer, combat, full economy, or crypto;
- merge from green CI alone.

## Session start gate

Before meaningful work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, relevant ADR, root `AGENTS.md`, and #415.
3. Re-fetch live GitHub state; never trust cached PR SHA or check status.
4. State tool/model, MAX, cost, allowed scope, forbidden actions, validation, and stop condition.

## Update rule

Replace the current fields/sections in this file whenever the accepted milestone, active issue/PR, product baseline, visual acceptance, next allowed action, or major blocker changes. Do not append history.

## Current stop condition

This phase ends only when #415 has a directly reviewed `PASS` topology/composition board and the next implementation target is explicitly authorized.

No P12 is allowed.
