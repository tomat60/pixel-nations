# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 8
Authority baseline SHA: `0007a6574c7779ef20b4eedfc8d93795b2f8264c`
Product baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: finish whole-game progression blockout by proving credible world scale before deeper mechanics.
Current milestone: World Scale Art Direction Recovery v2 — authored regional terrain.
Active execution issue: #575
Next allowed action: after this authority update merges, implement exactly one authored/hybrid Sector A-01 candidate through the existing Blender -> GLB -> Godot terrain pipeline. Atlas implementation remains blocked until direct regional visual PASS.

## Accepted product baseline

Full Progression Visual Grammar v2 and Full Progression Clarity & Composition v1 are accepted and merged.

Terminal results:
- `FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_PASS`
- `FULL_PROGRESSION_CLARITY_COMPOSITION_V1_PASS`

Latest accepted exact product head: `75d2372d9dd3651389bf1cb81da87bc788fe2520`
Latest merged product baseline: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`

Accepted Clarity v1 evidence includes the complete 15-frame progression matrix, input-driven motion proof, exact early-stage continuity, Foundation/persistence regressions, Web Playability and direct screenshot/motion review. The current `land -> settlement -> city -> nation -> empire` visual grammar is accepted.

## Accepted gameplay rollback baseline

First Inter-Land Coordination v1 remains the latest accepted deep-gameplay rollback point.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.
Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`
Merged gameplay rollback baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

## World-scale recovery status

Issue #573 World Scale Reveal v1 is terminal REJECT/reference only and is closed as superseded by #575.

Earlier technically valid but visually rejected world-scale representations are reference only:

1. `fffb39104fd0356450de02c2f90081e92970ac97` — isolated octagonal terrain tokens / board pieces.
2. `25b0ce9f64c7e9a26679c8f5df6ae2ca3c8c6b86` — triangulated top surfaces that did not produce a credible continuous regional/world read.
3. Recovery R1 on `agent/world-scale-regional-terrain-v2` — runtime GDScript 41x41 heightfield. Exact render head `7ef763c835cf068a0735aacf54ff7bf523c26bab`, focused run `34042485799`, artifact `9992106839`. Technical evidence passed, but direct visual review classified `WORLD_SCALE_REGIONAL_R1_REJECT` because the scene still read as a rectangular/diamond board with token-like anchors and weak geographic hierarchy.

Do not merge the rejected world-scale implementation branches. Their artifacts are reference/postmortem evidence only.

Per visual stop rules, no further cosmetic/runtime-heightfield iteration is authorized from R1.

## Binding art direction for Sector A-01

### Local / Aurelian

The accepted current local Aurelian view remains unchanged.

Role: HOW the settlement/capital exists and develops.
Detail level: highest.

### Regional / Sector A-01

This is the only spatial level authorized for the next implementation candidate.

Role: WHERE Aurelian sits in a wider region.

The uninformed first read must be: `a natural region containing our home`.

Target composition:
- one irregular continuous landmass / coastline composition fills roughly 70-85% of the frame;
- no visible rectangular, diamond or giant board edge;
- Aurelian is recognizable but subordinate, roughly 10-18% of the readable composition;
- at least five other integrated places / geographic anchors emerge from terrain rather than sit as isolated tokens;
- three clear height families: basin/lowland, rolling midland, major highland/mountain system;
- coastline/inlet and one continuous river system visibly belong to the terrain;
- at least one large forest mass and one wetland/lowland mass read from silhouette/value before labels;
- roads, borders and political markers remain absent at this proof stage;
- regional camera may differ materially from Local while preserving palette, low-poly material language and settlement identity.

Mood/reference principles:
- Against the Storm: physical 3D world + clean strategic readability; blended terrain and reduced grid emphasis;
- Manor Lords: a few large regions shaped by topography, waterways and strategic passages rather than many equal cells;
- generated recovery concept: composition/mood reference only for natural coast/highland/forest/wetland hierarchy; too painterly/detailed to be an implementation target;
- accepted Pixel Nations Aurelian scene: binding visual-language reference.

### Macro / World Atlas

BLOCKED until the authored Sector candidate passes direct review.

When later authorized, Atlas should use a separate lower-detail macro representation with a few coherent continent/large-island masses and blended internal biomes. It must not be a zoomed Sector mesh, a ring of tokens, or 100 equally visible sector cells.

## World-model semantics

The canonical world model remains semantic identity/reference:
- 10,000 lands;
- 100 sectors;
- 100 lands per sector;
- Sector A-01 as origin.

These values do not require literal rendering of 10,000 lands or a dominant 10x10 grid. Representation must optimize readability and game quality.

## Next recovery gate — authored Sector proof

Capture exactly:
- accepted local Aurelian reference;
- one authored Sector A-01 regional frame.

PASS only if:
1. Sector reads as one continuous natural physical region;
2. Aurelian is recognizable but clearly subordinate;
3. at least five integrated non-Aurelian geographic anchors are visible;
4. coast/river/elevation/vegetation create the visual hierarchy before markers or labels;
5. no token/cell/grid/board-first read remains;
6. visual relationship to Local exists without requiring literal zoom or identical geometry;
7. direct review classifies the image as a credible strategy-game regional blockout.

Green CI alone is not acceptance.

One complete authored candidate plus at most one bounded correction is allowed. If it still fails, stop before Atlas and revisit art direction/terrain representation again.

## Authored implementation reference

Do not make another runtime GDScript heightfield candidate.

Reuse the proven repository terrain pipeline in `game/assets/aurelian-basin/source/aurelian_authored_terrain_v1.py` as the implementation technique reference:
- deterministic Blender/Python source generation;
- irregular authored terrain outline / coastline;
- broad authored relief and material regions;
- river/water geometry integrated with terrain composition;
- existing pinned KayKit asset family only;
- export one Sector GLB;
- consume that GLB from a minimal Godot evidence scene;
- generated/procedural geography remains blockout quality and does not commit the project to a final production terrain pipeline.

This is an authored/hybrid blockout, not a production-world tooling sprint.

## Allowed

- one deterministic Blender/Python Sector A-01 source script derived from the accepted authored-terrain technique;
- one exported Sector GLB;
- existing pinned KayKit / accepted Aurelian asset family only;
- one minimal Godot evidence scene/presentation layer and fixed regional camera;
- focused contract and exactly two-frame evidence;
- AI image generation for moodboards/composition variants only;
- research/direct visual comparison with proven strategy-map references.

## Forbidden

- another runtime GDScript terrain/heightfield iteration;
- Atlas implementation before regional PASS;
- economy/resources/workers/timers/queues;
- combat/diplomacy/governance;
- repeatable expansion simulation;
- literal 10,000-land rendering;
- grid/dashboard final-world representation;
- broad playable controller rewrite;
- new paid asset family;
- backend/multiplayer/accounts/payments;
- MAX or paid tools.

## Tool and cost policy

- Strategy, research, art direction and direct review: GPT-5.6 Sol.
- Deterministic Blender/Godot/GitHub evidence first.
- Cursor only from a precise reviewed implementation prompt if authored-terrain code complexity materially justifies delegation.
- AI generation is reference/ideation, not automatic production acceptance.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence

1. Authored Sector A-01 regional proof.
2. World Scale Atlas proof only after regional PASS.
3. Core Playable Loop Consolidation.
4. Minimal Economy Foundation.
5. Repeatable Expansion Loop.
6. Nation gameplay depth.
7. Empire gameplay depth and scaling.
8. Content scale, polish, UX, audio and performance.

A later whole-product portfolio gate may reorder phases when direct evidence shows a stronger bottleneck.

## Historical references

- PR #565 Full Progression Blockout v1: terminal REJECT/reference only.
- PR #561 Third-Land Prospect v1: terminal REJECT/reference only.
- PR #569 Full Progression Visual Grammar v2: accepted and merged.
- PR #572 Full Progression Clarity & Composition v1: accepted and merged.
- Issue #570: completed.
- Issue #573: terminal REJECT/not planned, superseded by #575.
- Branch `agent/world-scale-reveal-v1`: rejected reference only, do not merge.
- Branch `agent/world-scale-regional-terrain-v2`: R1 visual REJECT/reference only, do not merge.
- Historical React world-map implementations are data-model/reference only; dashboard/grid presentation is not target runtime direction.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs;
3. root `AGENTS.md`;
4. `docs/GAME_STRATEGY_MASTER_PLAN.md`;
5. active execution issue #575;
6. accepted exact-head evidence and merged baselines;
7. active operating/QA protocols;
8. older issues, PRs, briefs, runbooks and reports as history/reference only.

## Current stop condition

Only one authored Sector A-01 candidate is authorized after this authority update merges. Atlas and deeper mechanics remain blocked until direct regional review passes.