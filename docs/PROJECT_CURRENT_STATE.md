# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 11.0
Authority baseline SHA: `c9d60b86499e9d4ae33b68a4f987a4efbc0ae69e`
Product baseline SHA: `6e5a9ab4ff684798f13d4de6b4f39df0b2a8ccd9`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: finish the whole-game progression blockout by proving credible world scale before deeper mechanics.
Current milestone: World Atlas Blockout v1 - prove Sector A-01 is one small part of a much larger Pixel Nations world.
Active execution issue: #575
Next allowed action: after this authority update merges, implement exactly one World Atlas blockout candidate reusing the accepted Sector Generator v4 data/pipeline and capture one accepted Sector reference plus one Atlas frame. No deeper mechanics until the Atlas gate is resolved.

## Accepted product baselines

Accepted progression work:
- `FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_PASS`
- `FULL_PROGRESSION_CLARITY_COMPOSITION_V1_PASS`
- merged progression/clarity baseline: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`

Accepted world-scale work:
- `WORLD_SCALE_SECTOR_GENERATOR_V4_BLOCKOUT_PASS`
- accepted exact head: `3e4a2347829dd2b1a35bff2b5c001f23f95414d1`
- focused run: `34051747083`
- artifact: `9994765099`
- artifact digest: `sha256:1fe40664481aa2a1849122d4c2a833dc93e9b4762bb5c21eb5e4e5335aca4828`
- merged Sector generator baseline: `6e5a9ab4ff684798f13d4de6b4f39df0b2a8ccd9`

Sector Generator v4 is accepted as a **blockout and scalable content-production base**, not production-final art.
Regional settlement miniatures, color hierarchy and local asset readability remain later visual-polish debt.

The accepted `land -> settlement -> city -> nation -> empire` visual grammar remains binding.

## Accepted gameplay rollback baseline

First Inter-Land Coordination v1 remains the latest accepted deep-gameplay rollback point.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.
Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`.
Merged gameplay rollback baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`.

## World-scale status

Issue #575 remains the single active world-scale authority.

Rejected world-scale implementations remain reference only and must not be revived by incremental polishing:
1. World Scale Reveal v1 token/board layout.
2. World Scale Reveal v1 continuous-surface correction.
3. Runtime regional heightfield R1 at `7ef763c835cf068a0735aacf54ff7bf523c26bab`.
4. PR #578 authored Sector v1 Candidate 1.
5. PR #578 authored Sector v1 Candidate 2 at `aea5f140c9c72b0d435bec2b70dc6dc922791b6c`.
6. PR #580 reuse-first Sector LOD Candidate 1 at `36c75f4d353eff9e2ca16711c1def55b2891b9b0`.
7. PR #580 bounded correction at `a6809b210fedf46d6f56837c3a8af48923811ac4`.

The demonstrated blockers in those attempts were representation scale, composition and regional LOD readability, not Godot, Blender, canonical Aurelian topology or the KayKit source family.

Sector Generator v4 resolved the current **blockout** need by moving production to a data-driven model:

`sector_spec.json -> deterministic Blender generator -> GLB -> Godot evidence`

The generator preserves a fixed canonical Aurelian core and creates surrounding regional geography/settlement variation from a seed.
It currently proves 10 macro loci and 8 regional settlement/POI locations in A-01.
The generator already supports seed override without changing the macro topology.

## Binding continuity stack

World-scale work does not reset Pixel Nations art direction, mechanics or production method.

Binding input remains:
- PR #439 / `AURELIAN_BASIN_MOODBOARD_V1`: Northgard macro readability + Foundation geography integration + Against the Storm material/lighting discipline + Manor Lords terrain-led route logic + Dorfromantik transition economy;
- PR #445 capability-first direction: inspect the real project first, reuse proven tools/assets, generated concepts are reference only;
- canonical Aurelian core: major river, Gilded Crossing, Greenvale/Aurelian home relationship, North Ridge, forest/work edge, fields, marsh/coast and route semantics;
- accepted local Aurelian language: stylized low-poly, earth/olive/moss terrain, cool forest, warmer productive land, blue-green water, warm settlement accents and blue identity cues;
- pinned zero-cost KayKit source family;
- deterministic Blender -> GLB -> Godot production/evidence path;
- gameplay semantics `claim -> settle -> grow -> scout/expand -> trade -> nation -> empire`.

Scale changes may simplify geometry and representation. They may not rewrite the accepted core, replace mechanics, introduce an unrelated asset family or discard proven infrastructure without a demonstrated blocker.

## World model semantics

The canonical systemic world identity remains:
- 10,000 lands;
- 100 sectors;
- 100 lands per sector;
- Sector A-01 as origin.

These are simulation/content semantics, not a requirement to render 100 sectors or 10,000 equal cells literally.

## Post-Sector portfolio gate

The accepted Sector proof establishes local -> regional scale.
The largest remaining world/progression bottleneck is macro-world scale: the product still has to prove that Sector A-01 is only one small part of a larger world.

World Atlas Blockout v1 wins the next bounded milestone over Core Playable Loop Consolidation because:
- it completes the current world-scale promise with a much larger player-visible delta;
- it can reuse the accepted generator/spec model instead of inventing another system;
- it requires no economy, workers, timers or simulation;
- it has low rework risk when treated strictly as data/presentation abstraction;
- completing the scale blockout now avoids returning to world representation during deeper gameplay work.

After Atlas is resolved, run the whole-product portfolio gate again before deeper mechanics.

## Binding World Atlas representation decision

The Atlas is a **lower-detail macro LOD of the same Pixel Nations world**, not a separate visual universe and not a literal grid of sectors/lands.

The Atlas must preserve continuity through:
- the same physical-world logic and low-poly material/lighting family;
- recognizable macro river/coast/highland/forest relationships where relevant;
- A-01 represented as a small nested part of the wider world;
- the same blue/home identity language where Aurelian/A-01 needs identification;
- the same generator principle: stable large shapes, optional seeded small detail.

The Atlas may aggregate systemic sectors into larger readable geographic masses.
It must not expose a 10x10 dashboard grid or 10,000-land cell field as the primary presentation.

### Atlas visual scale target

The first proof should show one coherent macro-world frame with approximately:
- 12-20 broad geographic/strategic macro regions or masses;
- multiple large relief systems and water/coast/river structures;
- sparse strategic loci only where they improve scale comprehension;
- Sector A-01 occupying roughly 2-5% of the frame as a recognizable nested origin area;
- enough off-frame or edge-continuing geography that the world feels larger than the current viewport rather than like a floating board piece.

The exact count is a readability target, not a new simulation model.

At thumbnail size the intended read order is:
1. macro geography / world mass;
2. A-01 location within that world;
3. other strategic regions/loci;
4. supporting detail.

If cells, labels or settlement tokens read before geography, reject.

## Atlas implementation strategy

Reuse the accepted Sector Generator v4 concept rather than generating 100 full Sector GLBs.

First proof architecture:

`world_atlas_spec.json -> deterministic macro generator -> GLB -> Godot capture`

The Atlas spec may own:
- deterministic seed;
- broad world/continent/coast geometry constraints without inventing unrelated lore;
- 12-20 macro geographic masses;
- major highland/forest/water systems;
- placement/reference for A-01;
- optional sparse strategic POI/region markers.

The Atlas generator may reuse Sector/Aurelian colors, materials and source assets where appropriate, but should rely primarily on terrain/geography rather than many settlement miniatures.

Do not generate detailed Sector or local scenes for every macro region during this proof.

## First Atlas proof gate

Capture exactly:
- accepted Sector A-01 reference from the Sector Generator v4 baseline;
- one World Atlas frame.

PASS only if:
1. an uninformed viewer immediately reads `Sector A-01 is one small part of a much larger world`;
2. Atlas geography dominates before markers, labels or UI;
3. no literal 100-sector/10,000-land grid is the primary read;
4. no finite floating board silhouette dominates the composition;
5. A-01 is recognizable but clearly subordinate at roughly 2-5% of the frame;
6. the Atlas reads as the same Pixel Nations visual world at a lower detail level;
7. the output is deterministic from its spec/seed;
8. no gameplay/state change is required;
9. direct review classifies it as a credible strategy-game macro-world blockout.

Green CI alone is not acceptance.

One complete Atlas candidate plus at most one bounded correction is authorized.
If it still fails, stop and classify the failed layer as macro composition, scale abstraction or visual continuity before proposing another technique.

## Implementation boundary

Allowed after this authority update merges:
- one Atlas spec data contract;
- one deterministic macro-world generator using the existing Blender -> GLB -> Godot pattern;
- one minimal Godot presentation/capture scene;
- one focused Atlas contract;
- exactly two primary evidence frames: accepted Sector reference + Atlas;
- reuse of accepted palette/material/source family;
- data aggregation of sectors into broader readable macro regions for presentation.

Forbidden:
- literal rendering of 100 full Sector scenes or 10,000 lands;
- 10x10 dashboard/grid-first Atlas presentation;
- changing canonical Aurelian/A-01 relationships;
- replacing the accepted KayKit/Aurelian visual family without a demonstrated blocker;
- new economy/resources/workers/timers/queues;
- combat/diplomacy/governance;
- repeatable expansion simulation;
- broad playable controller rewrite;
- backend/multiplayer/accounts/payments;
- new paid/unrelated asset family;
- MAX or paid tools.

## AI-assisted production rule

For Pixel Nations visual/product work:
1. inspect current repo, accepted evidence, assets, topology and failed attempts;
2. research only when it can change a high-leverage decision;
3. define the smallest evidence-driven delta;
4. preserve unrelated accepted systems by default;
5. execute through the existing pipeline unless it is the demonstrated blocker;
6. inspect real screenshots/video directly before acceptance;
7. classify a failure before changing technique;
8. use generated imagery as mood/composition reference, never automatic implementation authority.

Cursor is executor, not strategist.

## Tool and cost policy

- Strategy, research, art direction and direct review: GPT-5.6 Sol.
- First Atlas candidate: deterministic Blender/Godot/GitHub.
- Cursor remains blocked for the first Atlas proof.
- If Cursor is later used: GPT-5.5, MAX OFF.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence

1. World Atlas Blockout v1.
2. Whole-product portfolio gate.
3. Core Playable Loop Consolidation.
4. Minimal Economy Foundation.
5. Repeatable Expansion Loop.
6. Nation gameplay depth.
7. Empire gameplay depth and scaling.
8. Content scale, polish, UX, audio and performance.

## Historical references

- PR #439 Aurelian moodboard direction: accepted and binding.
- PR #445 capability-first Aurelian direction: accepted and binding.
- PR #561 Third-Land Prospect v1: terminal REJECT/reference only.
- PR #565 Full Progression Blockout v1: terminal REJECT/reference only.
- PR #569 Full Progression Visual Grammar v2: accepted and merged.
- PR #572 Full Progression Clarity & Composition v1: accepted and merged.
- Issue #573 World Scale Reveal v1: terminal REJECT, superseded by #575.
- PR #578 authored Sector v1: terminal REJECT/reference only.
- PR #580 reuse-first Sector LOD v1: terminal REJECT/reference only.
- PR #582 Sector Generator v4: accepted blockout/system base and merged.
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

Implementation is blocked until this Atlas authority update passes review and merges.

After merge, implement exactly one World Atlas blockout candidate from a deterministic spec and capture the accepted Sector reference plus one Atlas frame. One bounded correction maximum. Deeper mechanics remain blocked until the Atlas gate is resolved and the post-Atlas whole-product portfolio gate runs.
