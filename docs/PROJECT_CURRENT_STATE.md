# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-14
Current state revision: Aurelian Shared Geography Phase 1 Recovery Rejected v0.8
Authority source: this file on the current `main`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: Aurelian Shared Geography Phase 1 recovery rejected, strategy review
Active execution issue: #415
Active implementation PR: none
Last completed milestone: PR #429 Phase 1 recovery candidate — REJECTED / CLOSED WITHOUT MERGE
Next allowed action: Strategy review in #415 only. Diagnose why the accepted recovery candidate produced black Godot evidence after its single correction pass, preserve the accepted rough-reference source/export/manifests, and require fresh authority before any further implementation candidate. No Phase 2, P12, web visual replacement, paid tooling, MAX or image generation.

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
- P11 / #422: `ACCEPTED / MERGED` as product baseline `c94423d5a9c60f1982ae2935551fc1905d46e719`.
- #415 Phase 0 topology/composition board: `PASS` after direct review.
- Shared topology authority: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`.
- #415 Phase 1 candidate / PR #426 at `9c30232307578e8c0481ef7d191d0c0f522c4cbc`: `REJECTED / CLOSED WITHOUT MERGE` after direct still, manifest and 18 s video review.
- #415 replacement technique contract: `CONSUMED` by PR #429 under `docs/AURELIAN_BASIN_PHASE1_RECOVERY_CONTRACT_V1.md`.
- #415 Phase 1 recovery candidate / PR #429 at `be801c6aad0ea836210ef85929d8bc95c3152525`: `REJECTED / CLOSED WITHOUT MERGE`. Deterministic source/export, one GLB, manifests, import and topology contracts are accepted only as rough reference. All four 1440×900 stills and reviewed 18 s video frames were black after the single allowed correction pass.
- #415 shared Aurelian geography contract: `BLOCKED / RETURNED TO STRATEGY REVIEW`; Phase 2 remains blocked.
- Current Village: `MECHANICALLY ACCEPTED BENCHMARK`; preserve its nine-stage progression and rollback value.
- Current bridge and independent web Village/Map/World geography: `VISUALLY REJECTED FOR FINAL DIRECTION`.
- Vercel deployment status for the last checked current-main documentation head: `SUCCESS`.
- Public-origin HTTP checks for `/`, `/play`, and `/world`: last recorded `PASS` with 200 responses; `/world` canonicalizes to `/play`.
- Public browser-render smoke remains `PRODUCTION UNVERIFIED` from the current control environment because a runnable browser executable has not been available there. This is missing evidence, not evidence of an outage.
- Backend, accounts, payments, crypto/NFT/wallet/token, multiplayer, combat, and full economy: `OUT OF CURRENT SCOPE`.

## Runtime and visual direction

ADR-001 remains binding: Godot is the target game runtime. Next.js `/play` remains the functioning demo shell and rollback surface until replacement evidence is accepted.

Village, Map and World must use one `AurelianBasin` geography with the same river, bridge, roads, Greenvale origin, North Ridge, terrain zones, landmarks and transforms. The three views are camera/LOD presentations of that shared scene, never separately authored geography.

The accepted Phase 0 topology intentionally preserves useful gameplay-semantic relationships while rejecting the contradictory river/bridge placement of the current independent web visuals.

## Current active phase

The only active product-direction task is #415 strategy review after the rejected Phase 1 recovery candidate.

PR #426 proved mechanical shared transforms but failed the required visual result. PR #429 then implemented the terrain-first Blender to one GLB to Godot recovery technique. Its exact-head run completed Blender authoring/export, pinned asset provenance, one GLB import, foundation tests, recovery contract tests, four still captures and an 18 second movie, but deterministic visual QA failed because every still was identical black output. Direct review of all stills and representative video frames confirmed no visible landscape. The single allowed visual correction pass did not change that result.

Do not iterate PR #426 or PR #429 implementation branches. Preserve PR #429 deterministic source/export/manifests only as rough reference. A new implementation candidate requires a fresh strategy decision and explicit authority recorded in this file.

Required shared geography:

1. one continuous Aurelian Basin terrain;
2. the locked canonical river path and readable banks/shoreline;
3. `Bridge_GildedCrossing` with dry-ground west/east landings and connected roads;
4. Greenvale west of the river;
5. forest/work edge north-west of Greenvale;
6. North Ridge/highland north-east across the river;
7. fields/plains south / south-east of Greenvale;
8. southern marsh transition and coast/outer-water outflow;
9. `Camera_Village`, `Camera_Map`, and `Camera_World` cut from the same scene and transforms.

## Phase 1 execution contract

### Tool / cost

- Strategy/review: GPT-5.6 Sol.
- Executor: GPT-5.5/Codex-class bounded implementation through Cursor only after a precise prompt is reviewed.
- MAX: OFF.
- Paid assets/tools: blocked.
- Image generation as production/runtime art: blocked.
- Target extra spend for first proof: 0 USD.

### Allowed files

- `game/scenes/aurelian/**`
- `game/assets/aurelian-basin/**`
- `game/tests/**`
- narrowly scoped evidence/export workflow only if required
- transform/provenance manifest required to prove shared geometry

### Forbidden

- `app/play/**` visual rebuilding;
- reducer/state/persistence/gameplay changes;
- P12 or further retention/onboarding mechanics;
- backend, accounts, payments, multiplayer, combat, full economy, crypto;
- separate Village/Map/World terrain or orientation-specific geography;
- full-frame generated image as runtime art;
- mixed unverified asset packs;
- paid assets or MAX without a separately proven need;
- merge based only on CI or screenshot presence.

### Required evidence

- desktop Village still;
- desktop Map still;
- desktop World still;
- one 15–30 second raw video switching among the three cameras;
- transform manifest proving identical river, bridge and landmark transforms;
- exact head SHA, Godot version, renderer and native viewport/export identity;
- import/build/tests.

Direct evidence review must answer whether an uninformed viewer reads one believable strategy-game landscape and whether the bridge is physically credible at Village scale.

One named evidence-backed correction pass is allowed. Do not micro-polish repeatedly.

## Mandatory PR and release ownership

The user is not responsible for finding failed, drifting, or stuck PRs.

For every PR open/head change, ChatGPT/control-plane must re-fetch the live SHA, inspect authority and scope, full diff, base drift, mergeability, checks, failed logs, and required artifacts, then assign `PENDING / BLOCKED / REJECTED / READY`.

A green status alone is insufficient. Required screenshots, JSON, manifests, and videos must be opened and reviewed directly on the exact head.

After every merge, verify accepted head → merge SHA → new `main` → checks → deployment → real public routes as applicable. Localhost RC1 and pre-merge preview are not post-release proof. If the public origin cannot be fully tested, record `PRODUCTION UNVERIFIED` and the exact missing evidence.

Do not begin another product PR or merge while the current PR/release is failing, unreviewed or unresolved. Escalate to the user only for a genuine product-direction choice or authority blocker, not routine QA detection.

## Source-of-truth precedence

When sources conflict:

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially `docs/ADR_001_GODOT_DESKTOP_FIRST.md`
3. root `AGENTS.md`
4. the active execution issue named here
5. `docs/AURELIAN_BASIN_TOPOLOGY_V1.md` for shared-geography transforms/composition
6. exact-head evidence and the accepted PR for the current milestone
7. operating and QA protocols
8. older issues, draft PRs, comments, sprint briefs, runbooks and historical documents

An open issue, draft PR, generated handoff or green CI run is not automatically authority.

## Allowed work now

- strategy review in #415 based on exact-head PR #429 logs and artifacts;
- read-only diagnosis of the black Godot render path and inventory of the accepted rough-reference Blender source, GLB, manifests and tests;
- a bounded strategy or recovery contract update through a normal branch and PR;
- control-plane documentation and release verification.

## Blocked work now

- P12 or any further retention/onboarding/gameplay mechanics;
- any additional Godot candidate without a fresh accepted strategy contract;
- product integration or Phase 2 before direct PASS of the recovery candidate;
- independent React/CSS/SVG Map or World rebuilding as final product art;
- product UI changes unrelated to Phase 1 evidence;
- image generation as runtime art, paid assets, paid tools, and MAX;
- backend, accounts, payments, multiplayer, combat, full economy, or crypto;
- merge from green CI alone.

## Session start gate

Before meaningful work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`, the relevant ADR, root `AGENTS.md`, and #415.
3. Re-fetch live GitHub state; never trust cached PR SHA or check status.
4. State tool/model, MAX, cost, allowed scope, forbidden actions, validation, and stop condition.

## Update rule

Replace the current fields and sections in this file whenever the accepted milestone, active issue/PR, product baseline, visual acceptance, next allowed action, or major blocker changes. Do not append history.

## Current stop condition

PR #426 and PR #429 remain `REJECTED / CLOSED WITHOUT MERGE`. Their implementation techniques are stopped.

The current stop condition is strategy review in #415. No implementation candidate, Phase 2, integration or product merge is authorized until a fresh strategy contract is accepted into this file through a normal PR.

No P12, independent web visual rebuild, paid tooling, MAX, or image generation is allowed.
