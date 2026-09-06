# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 7
Authority baseline SHA: `988fe494f8c8fb8b5933d1dc880241e927a8bfe0`
Product baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: finish whole-game progression blockout by proving credible world scale before deeper mechanics.
Current milestone: World Scale Art Direction Recovery v2.
Active execution issue: #575
Next allowed action: implement exactly one Recovery Gate R1 regional Sector A-01 terrain candidate using one continuous deterministic low-resolution terrain mesh / heightfield. Atlas implementation is blocked until R1 passes direct visual review.

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

Two technically green W1 candidates failed direct visual review:

1. `fffb39104fd0356450de02c2f90081e92970ac97` rendered regional/macro geography as isolated octagonal terrain tokens and board pieces.
2. `25b0ce9f64c7e9a26679c8f5df6ae2ca3c8c6b86` removed the token layout, but its ad-hoc triangulated top surfaces did not produce a credible continuous regional/world terrain in the evidence view.

The historical branch `agent/world-scale-reveal-v1` must not merge. Green CI from those attempts is reference evidence only.

Per visual stop rules, a third implementation iteration from that art direction is forbidden.

## Binding recovery art direction

### Local / Aurelian

The accepted current local Aurelian view remains unchanged.

Role: HOW the settlement/capital exists and develops.
Detail level: highest.

### Regional / Sector A-01

This is the only spatial level currently authorized for implementation.

Role: WHERE Aurelian sits in a wider region.

Target:
- one continuous physical terrain surface fills most of the view;
- Aurelian is recognizable but simplified and occupies roughly 10-20% of the readable regional composition;
- at least five integrated non-Aurelian geographic anchors are visible: forest, highlands, coast/river mouth, marsh/lowland, ruins/frontier;
- elevation, water and vegetation create hierarchy before labels or borders;
- no visible token/cell/grid-first layout;
- no local Nation/Empire route/boundary overlay at this abstraction level;
- regional camera and abstraction may differ materially from Local while preserving visual language.

The intended uninformed read is: `this is a region containing our home`, not `the village got smaller`.

### Macro / World Atlas

BLOCKED until Recovery Gate R1 passes.

When later authorized, Atlas should use a separate lower-detail macro representation with a few coherent continent/large-island masses and blended internal biomes. It must not be a zoomed Sector mesh, a ring of tokens, or 100 equally visible sector cells.

## World-model semantics

The current canonical world model remains binding identity/reference:
- 10,000 lands;
- 100 sectors;
- 100 lands per sector;
- Sector A-01 as origin.

These values do not require literal rendering of 10,000 lands or a dominant 10x10 grid. Representation must optimize readability and game quality.

## Recovery Gate R1 - Sector only

Capture exactly:
- accepted local Aurelian reference;
- one Sector A-01 regional frame.

PASS only if:
1. Sector reads as one continuous physical region;
2. Aurelian is recognizable but clearly subordinate to the region;
3. at least five integrated non-Aurelian geographic anchors are visible;
4. coast/river/elevation/vegetation create natural hierarchy;
5. no token/cell/grid-first read remains;
6. visual relationship to Local exists without requiring literal zoom or identical geometry;
7. direct review classifies the image as a credible strategy-game regional blockout.

Green CI alone is not acceptance.

If R1 fails, stop before Atlas and reconsider terrain representation. No cosmetic iteration loop is authorized.

## R1 implementation reference

Preferred blockout representation: one deterministic low-resolution terrain mesh / heightfield.

- target roughly 33x33 to 49x49 terrain vertices;
- explicit consistent triangle winding and normals;
- deterministic height function creates basin, highlands and valleys;
- coastline/water relationship comes from terrain height/masking rather than disconnected terrain plates;
- broad biome/material regions blend across the terrain instead of creating visible equal cells;
- current Aurelian asset language may be reused for a simplified regional home landmark;
- procedural terrain/vegetation/relief remain prototype assets, not a final production terrain pipeline.

Do not use disconnected CylinderMesh/octagonal terrain tiles or one-sided ad-hoc polygon top surfaces from rejected #573.

## Allowed

- one new bounded Godot Sector A-01 terrain scene/presentation layer;
- deterministic terrain-grid generation and prototype biome coloring;
- current Aurelian assets as sparse regional landmarks;
- fixed regional camera;
- focused R1 contract and exactly two-frame evidence;
- research/direct visual comparison with proven strategy-map references.

## Forbidden

- Atlas implementation before R1 PASS;
- economy/resources/workers/timers/queues;
- combat/diplomacy/governance;
- repeatable expansion simulation;
- literal 10,000-land rendering;
- grid/dashboard final-world representation;
- broad playable controller rewrite;
- paid asset family;
- backend/multiplayer/accounts/payments;
- MAX or paid tools.

## Tool and cost policy

- Strategy, research, art direction and direct review: GPT-5.6 Sol.
- Deterministic Godot/GitHub evidence first.
- Cursor only from a precise reviewed implementation prompt if terrain-mesh code complexity materially justifies delegation.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence

1. World Scale Recovery R1 Sector proof.
2. World Scale R2 Atlas proof only after R1 PASS.
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

Only one R1 Sector terrain candidate is authorized. Atlas and deeper mechanics remain blocked until direct R1 review passes.