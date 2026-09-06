# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 10.0
Authority baseline SHA: `9b43f0c0412a587053d6bb600406ac4e0cfff7a2`
Product baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: finish the whole-game progression blockout by proving credible world scale before deeper mechanics.
Current milestone: World Scale Representation Recovery v4 - scalable Sector generator around the canonical Aurelian core.
Active execution issue: #575
Next allowed action: after this authority update merges, build one deterministic Sector A-01 generator proof from a data spec and current accepted assets/topology. Atlas remains blocked until direct Sector visual PASS.

## Accepted product baseline

Full Progression Visual Grammar v2 and Full Progression Clarity & Composition v1 are accepted and merged.

Terminal results:
- `FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_PASS`
- `FULL_PROGRESSION_CLARITY_COMPOSITION_V1_PASS`

Latest accepted exact product head: `75d2372d9dd3651389bf1cb81da87bc788fe2520`
Latest merged product baseline: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`

The accepted `land -> settlement -> city -> nation -> empire` visual grammar remains unchanged by world-scale work.

## Accepted gameplay rollback baseline

First Inter-Land Coordination v1 remains the latest accepted deep-gameplay rollback point.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.
Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`
Merged gameplay rollback baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

## World-scale evidence status

Issue #575 remains the single active world-scale authority.

Rejected implementations are reference only and must not merge:

1. World Scale Reveal v1 token layout - isolated board pieces.
2. World Scale Reveal v1 continuous-surface correction - technically green but not a credible physical world.
3. Runtime regional heightfield R1 at `7ef763c835cf068a0735aacf54ff7bf523c26bab` - technically green but visually a board with token-like anchors.
4. PR #578 authored Sector v1 Candidate 1 - irregular terrain existed, but the complete bounded landmass and large local buildings still read as a floating board.
5. PR #578 authored Sector v1 Candidate 2 at `aea5f140c9c72b0d435bec2b70dc6dc922791b6c` - technically PASS, terminal visual REJECT.
6. PR #580 reuse-first Sector LOD Candidate 1 at `36c75f4d353eff9e2ca16711c1def55b2891b9b0` - technically PASS, visual correction required.
7. PR #580 bounded correction at `a6809b210fedf46d6f56837c3a8af48923811ac4` - focused Sector, Foundation, Web, Pixel Nations CI and Play Visual QA all PASS, terminal visual classification `WORLD_SCALE_SECTOR_LOD_V1_REJECT`.

PR #580 is closed unmerged. No Candidate 3 from that representation is authorized.

The repeated failure is classified as:
- scale composition too small;
- terrain-generation scope too close to the local Aurelian bounds;
- settlement LOD still too dominant;
- insufficient macro relief/vegetation hierarchy.

The Blender -> GLB -> Godot pipeline, canonical Aurelian topology and KayKit source family are not the demonstrated blockers.

## Binding continuity stack

World-scale recovery does not reset Pixel Nations art direction, mechanics or production method.

Binding input remains:
- PR #439 / `AURELIAN_BASIN_MOODBOARD_V1`: Northgard macro readability + Foundation geography integration + Against the Storm material/lighting discipline + Manor Lords terrain-led route logic + Dorfromantik transition economy;
- PR #445 capability-first direction: inspect real project context, reuse proven tools/assets first, generated concepts are reference only;
- canonical Aurelian core: major river, Gilded Crossing, Greenvale/Aurelian home relationship, North Ridge, forest/work edge, fields, marsh/coast and route semantics;
- accepted local Aurelian language: stylized low-poly, earth/olive/moss terrain, cool forest, warmer productive land, blue-green water, warm settlement accents and blue identity cues;
- deterministic Blender -> GLB -> Godot pipeline and exact-head evidence;
- pinned zero-cost KayKit family;
- gameplay semantics `claim -> settle -> grow -> scout/expand -> trade -> nation -> empire`.

A scale change may simplify geometry, reduce prop detail, generate surrounding terrain and use lower-detail regional settlement miniatures. It may not rewrite the accepted Aurelian core, replace mechanics, introduce an unrelated asset family or discard the proven production pipeline without a demonstrated blocker.

## Research conclusion

The next Sector should not be another hand-authored zoom-out of the existing local topology.

Useful comparable patterns:
- Manor Lords presents a whole playable landscape through a small number of meaningful regions defined by topography and river structure;
- Northgard uses meaningful colonizable zones and strategic expansion measured in a low-teens number of territories rather than hundreds of visible cells;
- Foundation generates large organic maps from a small family of topography archetypes plus parameters;
- Against the Storm uses a separate world-map detail layer while preserving a physical 3D world and blending away rigid map separation;
- Townscaper's procedural lesson is useful for production: large shapes should remain predictable while small shapes can vary substantially.

This supports a data-driven Sector generator with a fixed canonical core and generated surrounding content.

## Binding representation decision v4

Sector A-01 remains the same Pixel Nations world at regional scale.

The canonical Aurelian core is fixed.
The surrounding Sector is generated deterministically from a Sector spec.
The generator is a content-production system, not a new gameplay mechanic.

The systemic world identity remains:
- 10,000 lands;
- 100 sectors;
- 100 lands per sector;
- Sector A-01 as origin.

These values are simulation/content semantics. Sector presentation groups them into larger readable geographic structures and does not render 100 equal visible land cells.

### Sector visual scale target

Target one Sector frame containing:
- 8-12 macro geographic/strategic loci or regions;
- 6-9 settlement/POI miniatures maximum;
- Aurelian capital/home occupying about 3-6% of the frame;
- at least two large relief masses;
- one dominant river system;
- at least two major vegetation/land-use masses;
- enough off-camera terrain that the frame clearly implies a larger world beyond the viewport.

The macro loci are presentation/grouping units, not a replacement for the 100-land systemic model.

At thumbnail size the intended read order is:
1. terrain masses and water;
2. Aurelian home/capital;
3. secondary loci/frontier;
4. supporting strategic detail.

If settlement geometry reads before geography, reject.

### A-01 macro profile

Sector A-01 uses a Basin / Fluvial profile.

The fixed canonical core remains:
- Aurelian/Greenvale home basin;
- main river and Gilded Crossing relationship;
- North Ridge role;
- forest/work edge role;
- productive fields/plains role;
- marsh/coast role;
- current route/frontier semantics.

The generator may extend new surrounding geography outside the accepted local bounds while preserving all canonical core relationships.

### Sector generator architecture

Build one deterministic pipeline:

`sector_spec.json -> Blender generator -> GLB -> Godot capture`

The Sector spec owns:
- seed;
- topography profile;
- canonical-core transform/reference;
- macro relief/forest/water constraints;
- secondary-locus archetype assignments;
- settlement seeds;
- optional route/POI parameters.

Large predictable shapes:
- canonical Aurelian core;
- main river basin;
- major relief chains;
- coast/marsh role;
- forest/productive-land masses;
- macro route graph.

Seeded variable detail:
- secondary relief variation;
- tree clusters;
- field clusters;
- road wiggle and minor branches;
- settlement composition;
- settlement rotation/spacing;
- minor POI/decorative placement.

The same seed must reproduce the same Sector output.

### Regional settlement archetypes

Authorize a small reusable archetype library derived only from current KayKit/Aurelian language:
- capital/home;
- river-crossing village;
- forest-edge village;
- productive-plain village;
- ridge/frontier outpost;
- marsh/coastal hamlet or POI.

Each regional settlement is a 3-7 piece LOD miniature, not a full local village.

Variation may come from:
- weighted KayKit source selection;
- deterministic rotation;
- spacing jitter;
- roof/identity role;
- small prop/tree/field cluster differences.

Aurelian keeps the strongest blue/home hierarchy.
Secondary settlements remain smaller and more neutral.

Detailed local settlement scenes are not generated for every visible regional miniature during this proof. A detailed local version can be generated or loaded only when a location becomes gameplay-relevant later.

## AI-assisted production rule

AI is used as a project-grounded planner, researcher, evaluator and bounded executor.

The operating pattern is:
1. inspect current repo, accepted art direction, topology, assets and failed evidence;
2. make the smallest evidence-driven plan;
3. preserve unrelated accepted systems by default;
4. execute through the existing pipeline;
5. render real runtime evidence;
6. classify failure before changing technique;
7. use AI-generated images only as mood/composition references, never automatic implementation authority.

Project context is mandatory before execution. Cursor is executor, not strategist.

## First v4 proof gate

The first implementation after this authority merges is a generator proof, not a finished content system.

Capture exactly:
- accepted local Aurelian reference;
- one generated Sector A-01 frame;
- optional one compact generator manifest/spec summary in evidence, not as gameplay UI.

PASS only if:
1. the frame reads immediately as a much larger region of the same Pixel Nations world;
2. no finite terrain/board edge is visible;
3. 8-12 macro loci/regions are readable through geography and strategic composition;
4. 6-9 settlement/POI miniatures maximum remain subordinate to terrain;
5. Aurelian is recognizable at about 3-6% of the frame;
6. the river, major relief and vegetation masses dominate the first read;
7. the accepted Aurelian core relationships are preserved;
8. the output is deterministic from the Sector spec/seed;
9. the generator can produce at least three visibly different settlement-miniature arrangements by changing only the seed, without changing the canonical Aurelian core;
10. direct review classifies the frame as a credible strategy-game regional blockout and a scalable production base.

Green CI alone is not acceptance.

One complete v4 generator candidate plus at most one bounded correction is authorized.

If it fails, stop before Atlas and classify whether the failure is scale target, generator constraints, terrain art, settlement archetypes or camera/composition. Do not silently invent another representation.

## Implementation boundary

Allowed after this authority merges:
- one `sector_spec` data contract;
- one deterministic Sector generator using the existing Blender -> GLB -> Godot path;
- extension of terrain outside the accepted local Aurelian bounds;
- 8-12 generated macro loci/regions around the canonical core;
- the six regional settlement archetypes above;
- existing KayKit source family and accepted materials/palette;
- one fixed Sector camera for the proof;
- one focused contract;
- exactly two primary visual evidence frames plus deterministic generator evidence;
- seed-only generation checks for settlement variation.

Forbidden:
- reopening or extending PR #580;
- changing the canonical Aurelian core relationships;
- literal 100-land or 10,000-land visual grids;
- hand-authoring every surrounding village individually;
- generating full local scenes for all regional villages during this proof;
- new paid/unrelated asset family;
- new economy/resources/workers/timers/queues;
- combat/diplomacy/governance;
- repeatable expansion simulation;
- broad playable controller rewrite;
- Atlas before Sector PASS;
- backend/multiplayer/accounts/payments;
- MAX or paid tools.

## Tool and cost policy

- Strategy, research, art direction and direct review: GPT-5.6 Sol.
- First v4 generator candidate: deterministic Blender/Godot/GitHub.
- Cursor remains blocked until the exact generator contract and implementation prompt are reviewed.
- If Cursor is later used: GPT-5.5, MAX OFF.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence

1. Sector A-01 generator proof.
2. World Atlas proof only after Sector PASS.
3. Core Playable Loop Consolidation.
4. Minimal Economy Foundation.
5. Repeatable Expansion Loop.
6. Nation gameplay depth.
7. Empire gameplay depth and scaling.
8. Content scale, polish, UX, audio and performance.

A whole-product portfolio gate may reorder later phases when direct evidence identifies a stronger bottleneck.

## Historical references

- PR #439 Aurelian moodboard direction: accepted and binding.
- PR #445 capability-first Aurelian direction: accepted and binding.
- PR #561 Third-Land Prospect v1: terminal REJECT/reference only.
- PR #565 Full Progression Blockout v1: terminal REJECT/reference only.
- PR #569 Full Progression Visual Grammar v2: accepted and merged.
- PR #572 Full Progression Clarity & Composition v1: accepted and merged.
- Issue #573 World Scale Reveal v1: terminal REJECT, superseded by #575.
- PR #578 authored Sector v1: terminal REJECT/reference only, closed unmerged.
- PR #580 reuse-first Sector LOD v1: terminal REJECT/reference only, closed unmerged.
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

Implementation is blocked until this v4 authority update passes review and merges.

After merge, the first action is the Sector generator spec/preflight, then exactly one generated A-01 proof candidate. Atlas and deeper mechanics remain blocked until direct Sector visual PASS.
