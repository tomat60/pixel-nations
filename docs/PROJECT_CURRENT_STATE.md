# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-10
Current state revision: Release Steward Reset v0.2
Authority source: this file on the current `main`
Product baseline SHA: `86ef0ede57e2585b527651e3c5719d0a33c35d68`
Current milestone: P11 closure → Aurelian Shared Geography
Active execution issue: #421
Active implementation PR: #422
Next execution issue after release verification: #415
Next allowed action: Complete #422 only on its live exact head, directly review its desktop/mobile evidence, run the READY/RC1 gate, merge only on full PASS, then verify the resulting `main`, deployment, and public routes. After that, update this file to #415 and create the topology/composition board. Do not start P12.

## Purpose

This file is the first and highest-priority source of current project state for every assistant, agent, automation, and new session.

Keep it short, current, and operational. Historical sprint summaries stay in their issues, PRs, ADRs, and archived documents.

## Current product truth

Pixel Nations is a strategy game built around:

`one land → settlement / city → nation → empire`

The full world contains 10,000 lands in a 100 × 100 structure. The current playable/demo area is Sector A-01 / Aurelian Basin.

The accepted web product currently preserves the complete founder progression through Founder Record and one previous read-only history. P4–P10 are merged. P11 is the final bounded continuity closure before the visual reset resumes.

## Current acceptance status

- P4–P10 product work: `ACCEPTED / MERGED`.
- P11 / #422: `PENDING EXACT-HEAD QA AND DIRECT ARTIFACT REVIEW`.
- Current `main`: product baseline `86ef0ede57e2585b527651e3c5719d0a33c35d68`.
- Vercel status for the product baseline: `SUCCESS`.
- Independent public-origin smoke for the baseline: `PRODUCTION UNVERIFIED` from the current control environment; this is not evidence of an outage.
- Current Village: `MECHANICALLY ACCEPTED BENCHMARK`; preserve its nine-stage progression and rollback value.
- Current bridge and independent Village/Map/World geography: `VISUALLY REJECTED FOR FINAL DIRECTION`.
- #415 shared Aurelian geography contract: `ACCEPTED NEXT DIRECTION`, implementation not yet started.
- Backend, accounts, payments, crypto/NFT/wallet/token, multiplayer, combat, and full economy: `OUT OF CURRENT SCOPE`.

## Runtime and visual direction

ADR-001 remains binding: Godot is the target game runtime. Next.js `/play` remains the functioning demo shell and rollback surface until replacement evidence is accepted.

Village, Map, and World must use one Aurelian Basin geography with the same river, bridge, roads, landmarks, and transforms. Do not resume separate React/CSS/SVG scene patching as the final visual direction.

## Current active phase

Finish the already-open bounded P11 only because it closes an explicit P10 continuity defect. It does not reopen a retention roadmap.

P11 acceptance requires on one live exact head:

- CI, Play, P11, P10, P8, P7, P6, P5, and P4 checks;
- direct review of fresh desktop and mobile JSON/screenshots;
- no state mutation, action overlap, horizontal overflow, stale overlay, blank/error state, or scroll trap;
- READY-event RC1 and exact-head merge;
- post-merge `main`, deployment, and public-origin gate.

After P11 release verification:

1. Close #421.
2. Set #415 as the only active execution issue.
3. Produce one topology/composition board before Godot implementation.
4. Do not create P12 or another mechanics/retention/onboarding feature.

## Mandatory PR and release ownership

The user is not responsible for finding failed or stuck PRs.

For every PR open/head change, ChatGPT/control-plane must re-fetch the live SHA, inspect authority/scope, full diff, mergeability, checks, failed logs, and required artifacts, then assign `PENDING / BLOCKED / REJECTED / READY`.

After every merge, it must verify accepted head → merge SHA → new `main` → deployment → real public routes. Localhost RC1 and pre-merge preview are not post-release proof. If the public origin cannot be tested, record `PRODUCTION UNVERIFIED` and the exact missing evidence.

Do not begin another product PR or merge while the current PR/release is failing, unreviewed, or unresolved.

## Source-of-truth precedence

When sources conflict:

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially `docs/ADR_001_GODOT_DESKTOP_FIRST.md`
3. root `AGENTS.md`
4. the active execution issue named here
5. exact-head evidence and the accepted PR for the current milestone
6. operating and QA protocols
7. older issues, draft PRs, comments, sprint briefs, runbooks, and historical documents

An open issue, draft PR, generated handoff, or green CI run is not automatically authority.

## Allowed work now

- exact-head diagnosis and the smallest deterministic P11 test/CI correction;
- direct P11 artifact review and release verification;
- control-plane documentation fixes;
- closing superseded PR #400 without merge;
- after P11 release PASS only: the #415 topology/composition board.

## Blocked work now

- P12 or any further retention/onboarding/gameplay mechanics;
- another product PR before P11/release classification;
- Godot implementation before direct topology-board PASS;
- independent React/CSS/SVG Map or World rebuilding;
- image generation, Fable, paid assets, and MAX;
- backend, accounts, payments, multiplayer, combat, full economy, or crypto;
- merge from green CI alone.

## Session start gate

Before meaningful work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, relevant ADR, root `AGENTS.md`, and the active issue.
3. Re-fetch live GitHub state; never trust cached PR SHA or check status.
4. State tool/model, MAX, cost, allowed scope, forbidden actions, validation, and stop condition.

## Update rule

Replace the current fields/sections in this file whenever the accepted milestone, active issue/PR, product baseline, visual acceptance, next allowed action, or major blocker changes. Do not append history.

## Current stop condition

This phase ends only when #422 is either:

- `ACCEPTED / MERGED / POST-RELEASE PASS`, after which #415 becomes active; or
- `REJECTED / CLOSED` with the P10 baseline preserved and #415 explicitly activated.

No P12 is allowed in either case.
