# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-11
Current state revision: Aurelian Shared Geography Phase 1 Rejection v0.6
Authority source: this file on the current `main`
Product baseline SHA: `c94423d5a9c60f1982ae2935551fc1905d46e719`
Current milestone: Aurelian Shared Geography — Phase 1 technique recovery
Active execution issue: #415
Active implementation PR: none
Last completed milestone: #415 Phase 0 topology lock — PASS
Next allowed action: Under #415, perform a read-only postmortem of rejected PR #426 and define one materially different shared-geography implementation contract. No second Godot candidate, Phase 2 integration, P12, or web visual replacement is authorized before that contract is directly reviewed.

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
- #415 shared Aurelian geography contract: `ACTIVE — PHASE 1 TECHNIQUE RECOVERY`; implementation and Phase 2 integration are blocked.
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

The only active product-direction task is #415 Phase 1 technique recovery.

PR #426 proved mechanical shared transforms but failed the required visual result: the continuous river and connected roads were not legible, the bridge read as a floating isolated prefab, the coast/outflow was detached, and Village/Map/World were sparse zoom levels rather than one believable Basin. Its dedicated run also failed because captured stills were 1440×810 instead of the asserted 1440×900.

Do not iterate the rejected primitive polygon/ribbon technique. The next artifact is a read-only postmortem plus one materially different implementation contract; it is not another scene candidate.

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

- read-only postmortem of PR #426 exact-head evidence;
- one materially different #415 implementation contract addressing continuous terrain, visible river/banks, connected bridge approaches and camera occupancy;
- direct review of that contract before any second scene candidate;
- read-only inventory/reuse of verified state, behavior and licensed asset provenance where #415 allows it;
- control-plane documentation and release verification.

## Blocked work now

- P12 or any further retention/onboarding/gameplay mechanics;
- any second Godot scene candidate before the replacement implementation contract is directly accepted;
- product integration or Phase 2 after the rejected Phase 1 candidate;
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

The first Phase 1 candidate is `REJECTED`; PR #426 is closed without merge and the primitive polygon/ribbon technique is stopped before product integration.

Technique recovery stops after one replacement implementation contract is directly reviewed and classified:

- `ACCEPTED`: authorize one new bounded Phase 1 candidate using the materially different contract;
- `CORRECTION REQUIRED`: revise the contract once, without scene implementation;
- `REJECTED`: keep Godot candidate work blocked and return to #415 strategy review.

No Phase 2, P12, independent web visual rebuild, paid tooling, MAX, or image generation is allowed in any outcome.
