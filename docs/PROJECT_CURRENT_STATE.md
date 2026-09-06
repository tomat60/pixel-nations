# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 9.1
Authority baseline SHA: `d1ff16d678b3030cba14b08a3c0f679e9f942708`
Product baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: finish the whole-game progression blockout by proving credible world scale before deeper mechanics.
Current milestone: World Scale Representation Recovery v3 - reuse-first Sector campaign-scale LOD.
Active execution issue: #575
Next allowed action: after this authority update merges, implement exactly one Sector A-01 campaign-scale candidate as a lower-detail representation of the same canonical Pixel Nations geography and visual language. Atlas implementation remains blocked until direct Sector visual PASS.

## Accepted product baseline

Full Progression Visual Grammar v2 and Full Progression Clarity & Composition v1 are accepted and merged.

Terminal results:
- `FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_PASS`
- `FULL_PROGRESSION_CLARITY_COMPOSITION_V1_PASS`

Latest accepted exact product head: `75d2372d9dd3651389bf1cb81da87bc788fe2520`
Latest merged product baseline: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`

The accepted `land -> settlement -> city -> nation -> empire` visual grammar remains unchanged by world-scale recovery work.

## Accepted gameplay rollback baseline

First Inter-Land Coordination v1 remains the latest accepted deep-gameplay rollback point.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.
Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`
Merged gameplay rollback baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

## World-scale recovery status

Issue #575 remains the single active world-scale authority.

Rejected implementations are reference only and must not merge:

1. World Scale Reveal v1 token layout - isolated polygon/board pieces.
2. World Scale Reveal v1 continuous-surface correction - technically green but not a credible physical world.
3. Runtime regional heightfield R1 at `7ef763c835cf068a0735aacf54ff7bf523c26bab` - technically green but visually a rectangular/diamond board with token-like anchors.
4. PR #578 authored Sector v1 Candidate 1 at `23422ac2b0a18f77a0c2e970bce58a7b0ace7f5c` - irregular terrain existed, but the whole landmass and large KayKit landmarks still read as a floating board with tokens.
5. PR #578 authored Sector v1 Candidate 2 at `aea5f140c9c72b0d435bec2b70dc6dc922791b6c` - exact-head run `34045309440`, artifact `9992918206`, technically PASS but terminal direct visual classification `WORLD_SCALE_AUTHORED_SECTOR_V1_REJECT`.

The Blender -> GLB -> Godot pipeline itself remains valid. The rejected representation was the combination of a bounded landmass composition and local-scale buildings used as dominant regional tokens.

No Candidate 3 from PR #578 is authorized.

## Binding continuity stack

World-scale recovery does not reset Pixel Nations art direction, topology, assets, mechanics or production method.

The following earlier accepted work remains binding input:

- PR #439 / `AURELIAN_BASIN_MOODBOARD_V1`: Northgard macro readability + Foundation geography integration + Against the Storm material/lighting discipline + Manor Lords terrain-led route logic + Dorfromantik transition economy;
- PR #445 / capability-first Aurelian reference: implementation feasibility is part of art direction, reuse proven tools/assets first, and generated concepts are reference only;
- canonical Aurelian topology: major river, Gilded Crossing, Greenvale/Aurelian home relationship, North Ridge, forest/work edge, fields, marsh/coast and route semantics remain the same world facts;
- accepted local Aurelian visual language: stylized low-poly, controlled earth/olive/moss terrain, cool forest, warmer productive land, blue-green water, warm settlement accents and blue identity cues;
- deterministic Blender -> GLB -> Godot pipeline and exact-head capture remain the default execution path;
- pinned zero-cost KayKit family remains the shared source asset family unless a named limitation is proven;
- existing gameplay semantics `claim -> settle -> grow -> scout/expand -> trade -> nation -> empire` remain untouched.

A scale change may simplify geometry, reduce prop detail and change camera/LOD. It may not invent a new visual universe, move canonical geography, replace mechanics, introduce a new asset family or discard proven production infrastructure without a demonstrated blocker.

## Research conclusion

The corrected representation decision combines the existing Pixel Nations reference stack with proven strategy-map practice.

Against the Storm provides the strongest scale-representation lesson:
- its settlement and World Map are different detail layers;
- the World Map was rebuilt as physical 3D while retaining clean strategic readability;
- later updates blended terrain, reduced rigid-grid emphasis, toned biome colors down and changed town models specifically for World Map readability.

This supports different LOD/miniatures at regional scale. It does not justify changing the underlying game identity or geography.

The existing Pixel Nations moodboard remains broader and binding:
- Northgard for macro terrain readability without board segmentation;
- Foundation for organic river/bridge/settlement integration;
- Against the Storm for physical stylized strategy readability;
- Manor Lords for landscape- and route-led settlement logic;
- Dorfromantik for economical biome transitions without tile language.

Total War is only a secondary representation reference for the principle that campaign-scale settlements can use strategic abstractions. It is not a new art-direction target.

## Binding representation decision

Sector A-01 is a **campaign-scale LOD of the same canonical Pixel Nations geography**, not a separate world or replacement mechanic.

Local / Village remains the detailed physical settlement layer.
Sector shows the same world facts at regional strategic scale.
World Atlas will later use a further lower-detail macro LOD only after Sector passes.

Continuity requirements are stronger than simple color matching:
- canonical geographic relationships remain stable;
- major river/water direction remains stable;
- Aurelian remains in the same basin/home relationship;
- major highland, forest, productive land and marsh/coast roles remain stable;
- route/frontier semantics remain stable even when roads are temporarily hidden in the terrain-only proof;
- visual palette, lighting family, heraldry and shape language remain Pixel Nations;
- settlement geometry may simplify to a regional miniature but must visually derive from the existing Aurelian language.

### Sector terrain

- terrain must extend beyond the camera on every non-coastal side;
- no outer terrain mesh edge may be visible;
- the frame is a crop of a larger landscape, never a complete island, tile or board piece;
- coastline, inlet or river mouth may enter the frame as geography, but must not define a floating outer silhouette;
- large relief chains, basin/valley, river and vegetation masses establish hierarchy before settlement markers;
- terrain transitions must use the accepted moodboard logic rather than visible biome cells;
- river/water must visually belong to the landscape rather than sit on top as an overlay strip;
- no grid, giant territory ring or dashboard-first treatment.

### Sector settlement language

Do not place unchanged local KayKit buildings at regional scale as oversized tokens.

Instead, derive a lower-detail Aurelian regional miniature from the existing visual language:
- same blue roof/heraldic identity cue;
- same capital hierarchy;
- same relationship to basin/river geography;
- compact silhouette appropriate to the camera distance.

KayKit remains the common source family and may be simplified, clustered, hidden by LOD or compositionally reduced. It is not abandoned.

Secondary loci use materially smaller neutral regional miniatures or POI silhouettes from the same shape/material family. No new paid or unrelated asset family is authorized.

At regional scale, settlement markers support geography. They do not dominate it.

### Visual hierarchy

At thumbnail size the intended read order is:

1. terrain masses and water;
2. Aurelian capital;
3. secondary loci / frontier;
4. supporting strategic detail.

If buildings read before geography, reject.

The uninformed read must be: `this is a wider strategic region containing our existing home`.

## Mandatory continuity preflight before implementation

Before writing the next Sector candidate, the executor must inspect the current repo and state, in the PR/issue thread, a compact reuse matrix with exactly these categories:

- topology/geography reused;
- visual language/palette reused;
- existing assets reused or LOD-simplified;
- pipeline/tools reused;
- gameplay/state untouched;
- the one representation delta being introduced;
- why that delta is required by direct evidence from rejected candidates.

If more than the representation/LOD delta changes, implementation is blocked and the portfolio gate must re-open.

This preflight is the agent equivalent of project-grounded Plan mode: inspect real project context first, then execute a bounded delta.

## Sector proof gate

Capture exactly:
- accepted local Aurelian reference;
- one Sector A-01 campaign-scale frame.

PASS only if:
1. the frame reads as a wider region of the same Pixel Nations world, not a new game style;
2. no visible complete land/board silhouette remains;
3. terrain extends convincingly beyond the frame;
4. macro relief, river and vegetation establish natural hierarchy;
5. Aurelian is recognizable but subordinate to the region;
6. at least five other geographic/strategic loci are readable without oversized building tokens;
7. no grid/cell/dashboard-first read remains;
8. canonical Aurelian relationships are preserved;
9. direct review classifies the frame as a credible strategy-game regional blockout.

Green CI alone is not acceptance.

One complete campaign-scale candidate plus at most one bounded correction is authorized. If it still fails, stop before Atlas and diagnose the failed layer explicitly as composition, LOD, asset readability or terrain authoring before proposing any new technique.

## Implementation boundary

Allowed after this authority update merges:
- reuse the existing deterministic Blender -> GLB -> Godot execution pipeline;
- reuse canonical Aurelian topology and semantic anchors;
- reuse the accepted palette/material/lighting family;
- reuse the pinned KayKit source family through appropriate regional LOD/simplification;
- one large continuous terrain surface whose technical edges stay outside the camera;
- one fixed regional camera;
- one focused contract and exactly two-frame evidence;
- direct visual comparison against the full accepted Pixel Nations moodboard stack, not one reference game in isolation.

Forbidden:
- merging or extending PR #578;
- another complete-island/polygon-board representation;
- changing canonical Aurelian geography for composition convenience;
- abandoning KayKit/accepted Aurelian visual language without a proven blocker;
- unchanged local buildings as primary regional tokens;
- new mechanics or state semantics;
- Atlas before Sector PASS;
- economy/resources/workers/timers/queues;
- combat/diplomacy/governance;
- repeatable expansion simulation;
- literal 10,000-land rendering;
- broad playable controller rewrite;
- paid external asset family;
- backend/multiplayer/accounts/payments;
- MAX or paid tools.

## AI-assisted game-development operating lesson

For Pixel Nations visual/product work, the specialist workflow is:

1. Ground in current project state, accepted references, assets, topology, mechanics and failed evidence.
2. Plan the smallest delta that addresses the demonstrated failure.
3. Preserve all unrelated accepted systems and assets by default.
4. Execute through the existing production pipeline unless it is the proven blocker.
5. Validate with real runtime/screenshots/video and technical tests.
6. Classify the failure before changing technique: composition, implementation, representation/LOD, asset readability or core direction.
7. Use evaluator feedback to refine the bounded candidate, not to silently rewrite the product direction.
8. Escalate to a strategic/art-direction reset only when the evidence shows the current binding direction itself is the blocker.

This follows the same principle as agent harness engineering: when an agent drifts, improve grounding and constraints instead of repeatedly asking it to try harder or invent a new approach.

## QA note from authority head

On PR #579 exact head `859786124cab6cccba8a8e35ccb067eb930694a8`, Pixel Nations CI, bounded smoke and continuity workflows passed. `Play Visual QA` failed only in the existing post-crisis-countermove scenario because the expected `demo-complete-overlay` selector did not become visible before timeout. All earlier evidence-generation steps passed. This failure is separate from the docs-only art-direction change and must be tracked as a gameplay QA/harness issue rather than hidden or used as evidence for/against Sector representation.

## World-model semantics

The canonical world identity remains:
- 10,000 lands;
- 100 sectors;
- 100 lands per sector;
- Sector A-01 as origin.

These values are systemic semantics. They do not require literal rendering of 10,000 lands or 100 equal visible sector cells.

## Tool and cost policy

- Strategy, research, art direction and direct review: GPT-5.6 Sol.
- First campaign-scale candidate: deterministic Blender/Godot/GitHub.
- Cursor remains blocked until the continuity preflight and implementation prompt are reviewed.
- If Cursor is later used: GPT-5.5, MAX OFF.
- AI image generation is moodboard/composition support only, never automatic implementation authority.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence

1. Sector A-01 campaign-scale proof.
2. World Atlas proof only after Sector PASS.
3. Core Playable Loop Consolidation.
4. Minimal Economy Foundation.
5. Repeatable Expansion Loop.
6. Nation gameplay depth.
7. Empire gameplay depth and scaling.
8. Content scale, polish, UX, audio and performance.

A whole-product portfolio gate may reorder later phases when direct evidence identifies a stronger bottleneck.

## Historical references

- PR #439 Aurelian moodboard direction: accepted and still binding reference input.
- PR #445 capability-first Aurelian direction: accepted and still binding process/feasibility input.
- PR #561 Third-Land Prospect v1: terminal REJECT/reference only.
- PR #565 Full Progression Blockout v1: terminal REJECT/reference only.
- PR #569 Full Progression Visual Grammar v2: accepted and merged.
- PR #572 Full Progression Clarity & Composition v1: accepted and merged.
- Issue #573 World Scale Reveal v1: terminal REJECT, superseded by #575.
- PR #578 authored Sector v1: terminal REJECT/reference only, closed unmerged.
- Historical React world maps: semantic/data reference only, never target runtime presentation.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs;
3. root `AGENTS.md`;
4. `docs/GAME_STRATEGY_MASTER_PLAN.md`;
5. active execution issue #575;
6. accepted exact-head evidence and merged baselines;
7. accepted reference docs including #439 and #445;
8. active operating/QA protocols;
9. older issues, PRs, briefs and artifacts as history/reference only.

## Current stop condition

Implementation remains blocked until this corrected authority update passes review and merges. After merge, the first action is the mandatory continuity preflight, not coding. Exactly one Sector A-01 campaign-scale candidate is then authorized. Atlas and deeper mechanics remain blocked until direct Sector visual PASS.