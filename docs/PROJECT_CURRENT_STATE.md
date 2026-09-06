# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 6
Authority baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Product baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: finish the whole-game progression blockout by proving world scale before deeper mechanics.
Current milestone: World Scale Reveal v1.
Active execution issue: #573
Next allowed action: implement one bounded Gate W1 physical scale candidate with three unlabeled views: local Aurelian, Sector A-01 and World Atlas. Do not start economy, repeatable expansion or deeper nation/empire mechanics before W1 proves that each higher spatial level contains materially new geography rather than the same Aurelian scene at a smaller scale.

## Accepted progression and clarity baseline

Full Progression Visual Grammar v2 and Full Progression Clarity & Composition v1 are accepted and merged.

Terminal results:

- `FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_PASS`
- `FULL_PROGRESSION_CLARITY_COMPOSITION_V1_PASS`

Latest accepted exact product head: `75d2372d9dd3651389bf1cb81da87bc788fe2520`
Latest merged product baseline: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`

Accepted clarity evidence:

- Gate C1 run `34037105919`: SUCCESS at `2889d4ec2aa691d5279b330fee379e88e24dab72`.
- Gate C1 artifact `9990517361`, digest `sha256:f91fbe6a6eef81bb6bb390be68bc4e1942eb6e7b1ea37f9f47801a5d6e83261b`.
- Gate C2 run `34037346659`: SUCCESS at `75d2372d9dd3651389bf1cb81da87bc788fe2520`.
- Gate C2 artifact `9990605495`, digest `sha256:2d76a83bdcafb3117b7579e6dc7a311d20dba7e5fa851f5aa7e095481ab0a228`.
- Complete 15-frame fixed-camera progression matrix plus input-driven motion proof.
- Land, Settlement and City remain bit-for-bit equal to the accepted v2 baseline.
- Nation and Empire are materially calmer while remaining visually distinct.
- Foundation and Web Playability regressions passed on the final exact head.
- Vercel candidate status passed before merge.

Direct review confirms that `land -> settlement -> city -> nation -> empire` is now structurally readable and late-stage Map/World hierarchy is sufficiently calm for the blockout to continue.

## Accepted gameplay rollback baseline

First Inter-Land Coordination v1 remains the latest accepted deep gameplay rollback point.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.

Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`
Merged gameplay rollback baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

That baseline preserves one shared Aurelian geography, Village/Map/World roles, exactly two claimed lands and persistent Trade/Watch coordination outcomes.

## Current bottleneck

The current Godot World view still reads primarily as the same Aurelian geography observed from farther away. That is no longer sufficient for the product promise.

The current world model already defines 10,000 lands as 100 sectors x 100 lands, but that scale exists mainly in data and older bridge/reference implementations. The target runtime must now show a credible physical hierarchy without rendering 10,000 individual objects.

The portfolio gate therefore places one bounded World Scale Reveal sprint before Core Playable Loop Consolidation.

## Binding World Scale direction

### Representation hierarchy

1. Local Aurelian: accepted detailed local geography and settlement/capital progression.
2. Sector A-01: a materially larger physical region in which Aurelian Basin is only one recognizable part among several geographic loci.
3. World Atlas: a coherent low-detail physical macro-world in which Sector A-01 is only one region among many.

Visual continuity matters, but the levels do not need to be literal camera zooms of identical geometry. Each level should use the detail, abstraction and camera composition appropriate to its gameplay role.

### Physical world first

- terrain masses, biome regions, rivers/coasts/highlands/forests and settlement/frontier loci carry scale;
- World should read like a physical 3D strategy board, not a dashboard;
- boundaries and labels may support orientation but cannot be the primary visual language;
- avoid a dominant 10x10 button/grid presentation;
- avoid giant abstract rings;
- preserve recognisable Aurelian identity between levels without forcing one-to-one geometry.

### Model semantics

The current canonical bridge model remains a semantic reference:

- 10,000 lands;
- 100 sectors;
- 100 lands per sector;
- Sector A-01 as the origin sector.

These numbers constrain world identity and future systems. They do not require the final World view to display 10,000 literal tiles or 100 equally visible cells.

## Evidence gate

### Gate W1 - three-frame physical scale proof

Before transitions, interactions or broader QA, capture exactly three unlabeled 1440x900 frames:

- local Aurelian reference;
- Sector A-01 regional view;
- World Atlas macro view.

PASS only if:

1. an uninformed reviewer can order the three images local -> sector -> world without labels;
2. each higher level introduces materially new physical geography rather than shrinking the same terrain;
3. Aurelian occupies no more than roughly one quarter of the Sector A-01 visual footprint;
4. Sector A-01 includes at least four distinct non-Aurelian regional anchors;
5. the World Atlas contains many regional masses beyond A-01 and does not read as a spreadsheet/grid-first UI;
6. the three levels feel visually related despite different abstraction levels.

If W1 fails, allow at most one bounded visual correction before stopping implementation and revisiting art direction.

### Gate W2 - hierarchy and continuity proof

Only after W1 passes:

- capture input-driven local -> Sector A-01 -> World Atlas transition proof;
- verify accepted Aurelian progression/geography remains unchanged;
- bind the hierarchy semantically to the 100-sector / 10,000-land world model without rendering 10,000 objects;
- run focused Godot, Foundation and Web regressions;
- perform direct screenshot and motion review.

Green CI alone is not acceptance.

## Allowed

- deterministic procedural Godot geography for Sector A-01 and macro World Atlas blockout;
- reuse of accepted Aurelian terrain and current asset language;
- low-detail terrain/biome primitives consistent with the existing visual grammar;
- dedicated sector/world cameras and bounded transitions;
- focused scene, test and evidence workflow;
- read-only use of current world-model constants as semantic reference.

## Forbidden

- economy/resources/workers/timers/queues;
- combat/diplomacy/governance systems;
- repeatable expansion simulation;
- 10,000 individually rendered lands;
- full procedural-content production pipeline;
- React/SVG/CSS as final-game World map;
- broad `playable_aurelian_entry_v1.gd` rewrite;
- new paid asset family;
- backend/multiplayer/accounts/payments;
- MAX or paid tools.

## Tool and cost policy

- Strategy, art direction, research and direct review: GPT-5.6 Sol.
- Deterministic Godot/GitHub/self-hosted evidence first.
- Cursor only from one reviewed bounded prompt if it materially speeds terrain composition.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence after this phase

1. World Scale Reveal v1.
2. Core Playable Loop Consolidation.
3. Minimal Economy Foundation.
4. Repeatable Expansion Loop.
5. Nation gameplay depth using validated prototypes.
6. Empire gameplay depth and scaling.
7. Content scale, polish, UX, audio and performance.

A later portfolio review may reorder phases when direct product evidence shows a stronger bottleneck.

## Historical references

- PR #565 Full Progression Blockout v1: terminal REJECT/reference only.
- PR #561 Third-Land Prospect v1: terminal REJECT/reference only.
- Issues #559 and #562 remain frozen.
- PR #569 Full Progression Visual Grammar v2: accepted and merged.
- PR #572 Full Progression Clarity & Composition v1: accepted and merged.
- Issue #570: completed by PR #572.
- Historical React world-map branches are reference only; their data-model concepts may be reused, their dashboard/grid presentation may not be treated as target runtime direction.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs;
3. root `AGENTS.md`;
4. `docs/GAME_STRATEGY_MASTER_PLAN.md`;
5. active execution issue #573;
6. accepted exact-head evidence and merged baselines;
7. active operating/QA protocols;
8. older issues, PRs, briefs, runbooks and reports as history/reference only.

## Current stop condition

Do not authorize deeper mechanics until Gate W1 proves a credible three-level physical world hierarchy. One complete W1 candidate plus at most one bounded visual correction is allowed before returning to art-direction review.