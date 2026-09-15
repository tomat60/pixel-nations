# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-15
Current state revision: 42.2
Authority baseline SHA: `f655ee4f2b5a62d528b087a0a82a4b75a08d80dc`
Product baseline SHA: `6a67f19034beb9868b3609b9f067430bd8b863af`
Runtime baseline SHA: `6a67f19034beb9868b3609b9f067430bd8b863af`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: Empire Seed Strategic Breadth Prototype — Map / Sector / World breadth first.
Current milestone: prove a coherent strategic world where Greenvale/Aurelian is visibly one home inside a wider Sector A-01 containing multiple lands and settlements, with World showing A-01 as a small part of a much larger world.
Active execution issue: #721
Next allowed action: stop repeating the rejected isolated marker/beam and planar-region overlay techniques. Reconcile the reviewed #725/#726 evidence, then run one bounded in-engine representation/renderer/asset-fit benchmark on an isolated checkout of the exact public product `main`; the isolated Netcup MCP smoke and GitHub-hosted Sector renders do not prove a live product editor cycle. Compare ways to make territory grouping follow real terrain relief while preserving the Sector v4 geography, and directly review exact frames for home -> owned area -> frontier -> one expansion direction without labels. No new production Map/World candidate before this benchmark has a credible representation decision. Village polish, economy and another one-land micro-system remain frozen.

## Reviewed Sector reference, not production acceptance

On 2026-09-15, draft PR #723 was terminally classified `EMPIRE_SEED_BREADTH_V1_REFERENCE_PASS_PRODUCT_REJECT` and closed without merge. Exact head `71163e486ab7299f53613fb4e8432a58800dfcd8`; focused [run 34995746649](https://github.com/tomat60/pixel-nations/actions/runs/34995746649); artifact `10408085564` (digest `sha256:03e6f25efbf5b38483dd742846e5d7064ee47d4cc66defba52c34b0293bea630`). Direct review of the 1440x900 image validated the broader physical Sector reuse with 10 canonical macro-loci but rejected crossing diagrammatic connection lines, weak owned/frontier hierarchy, tiny labels and missing empire-expansion read. Neither Map nor World is visually accepted. The accepted production runtime was untouched.

The binding [art-direction target in #721](https://github.com/tomat60/pixel-nations/issues/721#issuecomment-5684369828) asks for one corrected Sector frame: home/core -> grouped owned area -> one readable frontier and expansion route -> a distinct neutral site, readable in about two seconds without tiny labels. Preserve canonical Greenvale west of the river, Crossing, North Ridge and terrain continuity; no new art universe or gameplay/economy state. This authorized the single composition/LOD correction recorded below; it has since failed direct visual review. Do not treat the target as authorization for another marker/beam attempt.

## Subsequent visual stop: v2 and planar regions

On 2026-09-15, correction PR #725 (head `b3ea0ccbc2fdf4a2a0d34a05a5cbec97ffc233f3`) produced a real Sector frame in [run 35009894410](https://github.com/tomat60/pixel-nations/actions/runs/35009894410), artifact `10413351963` (digest `sha256:a8b1732cf6e786ff6ff9994f4ae0be78d30e92738236d9fbce633ffb46a6b42a`). Direct review found improved home/frontier hierarchy, but circles, discs, route beams and labels still dominated. The same marker/beam technique was stopped, PR closed without merge.

Changed-technique PR #726 was then terminally rejected and closed without merge. Initial exact-head deterministic parse failure came from a duplicate inherited `STILL_SIZE` constant; the one-line fix on the same PR reached head `6f3fef479005572c5193d2b0135c7f43cc24d842`. [Focused run 35015504121](https://github.com/tomat60/pixel-nations/actions/runs/35015504121), artifact `10415725650` (digest `sha256:049b3d9de1318560d96922eb9825603b211716f6d8ca68f929182cd0492d31ee`), produced a reviewed 1440x900 frame. Irregular region outlines and a single corridor preserved the shared geography but still read as an overlay: fixed-height translucent meshes failed to form readable owned/frontier terrain masses across relief; pale borders and the bright line competed with the home. The two-second hierarchy remained label-dependent. No gameplay/runtime production scenes were changed.

This is a representation/LOD failure, not a CI or input-state failure. Do not run v3/v4 polygon-overlay variants, generated concept art or Village/economy work. The next gate is a small in-engine terrain-conformal representation benchmark with real frames and an explicit stop/decision; the World scale layer remains unaccepted. Issue #721 stays the canonical product authority.

## Canonical strategy lock

Issue #721 is the current binding product-strategy lock. If an older issue, report, handoff, Command Room comment, or historical section conflicts with #721, #721 wins.

The next player-visible proof must communicate:

`my village -> my land -> neighboring lands -> other settlements -> expansion -> Sector A-01 -> larger World`

Target breadth for the first rough-but-real proof:

- approximately 12 readable lands/territories in Sector A-01;
- Greenvale/Aurelian clearly nested as the player's home;
- at least one additional player-owned or claimable settlement site;
- at least one neutral or rival/other-player-style settlement site;
- readable ownership, routes/frontiers and expansion relationships;
- Map/Sector rendered as a dedicated campaign-map representation, not a miniaturized Village;
- World showing A-01 as a small origin inside a much larger physical world.

Production-final art, real multiplayer, full economy and literal rendering of all 10,000 lands are not required for this proof.

## Frozen until the breadth proof is reviewed

- further Village visual polishing unless a regression blocks the breadth prototype;
- Aurelian Provision / Minimal Economy continuation from #715/#719;
- additional Frontier Capacity iterations;
- new one-land micro-systems;
- combat, diplomacy, governance depth or repeatable economy systems;
- broad QA/workflow redesign;
- migration away from Godot without benchmark evidence;
- crypto, NFT, wallet, mint, token or pay-to-win direction.

Issue #719 is terminally rejected/closed and is not active authority.

## Accepted product/runtime baseline

### Default First Session v6

The accepted first session proves the normal-input native/Web loop:

`claim -> develop -> choose -> consequence -> grow -> expand`

It ends with the visible East Route + North Ridge two-land footprint and truthful persistence. Preserve this behavior unless the active breadth prototype needs a narrow adapter.

### Input Release Boundary v3

Repeated physical inputs are accepted and stable. Do not reopen input-release work without a new demonstrated regression.

### View LOD Contract v2

Village / Map / World roles are accepted structurally:

- `Village = HOW` — local lived development and full local detail;
- `Map = WHERE` — strategic geography, ownership, routes and expansion;
- `World = WHY / direction` — macro scale and long-term ambition.

This is a representation contract, not final visual acceptance of Map or World.

### Aurelian Frontier Capacity v2

PR #712 merged as `6a67f19034beb9868b3609b9f067430bd8b863af`. Trade Post / Watch Post continuation and derived Frontier Capacity are accepted behavior. They are not the next product priority.

### Sector / World Atlas history

Earlier Sector and Atlas work proved scale concepts but did not finish the player-visible world.

World Atlas v1 is a macro-world blockout/reference, not production-final World art. Previous Sector attempts correctly failed when they read as a finite board, weak heightfield, overlaid river, or miniaturized local settlement tokens.

Issue #575 remains the active representation reference for Sector A-01:

- Sector is a campaign-map layer;
- terrain extends beyond the camera on non-coastal sides;
- relief, river, forest and basin hierarchy lead before labels/tokens;
- Aurelian remains semantically recognizable but is not a literal scaled Village;
- use dedicated low-detail regional settlement miniatures/sigils;
- no grid/card/dashboard-first read;
- river belongs to terrain;
- first thumbnail read should be terrain masses -> Aurelian -> secondary loci.

## Execution model

Primary production loop for the current milestone:

`strategy/art direction -> live Godot agent/editor -> run -> screenshot/video -> direct review -> one bounded correction -> CI/regression`

Use Netcup + private `pixel-nations-ops` as the primary cloud execution path when healthy. The owner Mac is optional and must not block production.

CI is a final regression/merge gate. It must not be the inner visual iteration loop.

Tool policy:

- GPT-5.6 Sol: current Product Lead / strategy / direct review; sufficient for this milestone;
- GPT-6: OFF for now; reserve for a high-value architecture or cross-engine decision only if the Godot live-agent benchmark fails or future 10,000-land data architecture materially warrants it;
- Godot live editor/MCP: preferred for scene iteration after current health/version/security verification;
- Codex/Cursor: bounded executor after the visual target and file scope are explicit;
- MAX: OFF by default;
- new paid assets/tools: blocked unless they materially improve quality, speed or probability of success.

## Process correction

Do not recreate the previous failure mode of serial `portfolio gate -> authority PR -> preflight -> micro-change -> reconciliation` loops for ordinary product work.

For normal bounded iterations:

1. inspect current evidence and relevant references;
2. make one product/art-direction decision;
3. implement one meaningful player-visible slice;
4. inspect the real runtime directly;
5. allow at most one root-cause correction;
6. run full regression/CI only after the candidate is visually/product credible;
7. merge or reject.

Green CI alone is never product or visual acceptance.

## Continuity rule for every new chat / Work session / agent

Before planning or coding:

1. run `npm run pn:status` when a checkout is available;
2. read this file;
3. read active issue #721;
4. read the relevant accepted ADR and issue #575 for Sector representation work;
5. inspect the current exact repo/branch state and current evidence;
6. treat all older issues as historical unless this file or #721 explicitly reactivates them.

Do not infer current priority from the most recent narrow feature, the oldest open issue, an old Fable/Cursor directive, or stale `public/qa/latest` evidence.

## Active supporting work

- #721 — canonical product strategy and Empire Seed Strategic Breadth Prototype.
- #575 — Sector A-01 campaign-map representation/art-direction reference.
- #290 — Netcup Godot cloud worker / live editor-MCP execution infrastructure.
- #79 — persistent AI Command Room, subordinate to this file and #721.

No other historical issue is active product authority unless explicitly named here.

## Success / stop condition

The next major owner-facing evidence must contain real screenshots/video where an uninformed viewer can see multiple lands and settlements and understand that the current Village belongs to a wider strategic world.

The first rough breadth proof and its one marker/beam correction were visually insufficient; the changed planar-region treatment also failed. Stop iterating either overlay technique. Use a bounded terrain-conformal representation/renderer benchmark on the accepted geography before choosing another implementation. If the live Godot editor cannot produce a credible frame on the exact public checkout, document that tool limit rather than claiming production acceptance from a GitHub-hosted still.

Historical milestone details remain available in Git history, merged PRs and issue threads. This file is intentionally current-only so future sessions cannot mistake old sequencing decisions for active strategy.
