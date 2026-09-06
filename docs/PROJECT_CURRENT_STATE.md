# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 5
Authority baseline SHA: `89c47d92e266e4bb4a06e0e5a5cddc0b324db42c`
Runtime baseline SHA: `89c47d92e266e4bb4a06e0e5a5cddc0b324db42c`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: finish whole-game progression blockout readability before deeper mechanics.
Current milestone: Full Progression Clarity & Composition Pass v1.
Active execution issue: #570.
Next allowed action: implement one bounded Gate C1 clarity candidate for exactly six unlabeled Nation/Empire frames across Village, Map and World. Do not start economy, repeatable expansion or deeper nation/empire mechanics before C1 proves that the accepted progression can be made materially calmer and easier to parse.

## Accepted progression baseline

Full Progression Visual Grammar v2 is accepted and merged.

Terminal result: `FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_PASS`.

Accepted exact product head: `7de2e2d62356c9052402f74d983a5b19f735ebe7`
Merged runtime baseline: `89c47d92e266e4bb4a06e0e5a5cddc0b324db42c`

Accepted evidence:

- Gate A fixed-camera Village proof: PASS at `d3a1d1e72dec2a8fc443d3194a870660c3739136`.
- Gate B run `33743240878`: SUCCESS.
- Gate B artifact `9989931407`, digest `sha256:41ec216fd0db1cc24390dae5d15ca1a82b0f3e71ae6f300305bf1a3e6d5a25f0`.
- 15 fixed-camera 1440x900 frames: 5 stages x Village/Map/World.
- 12.667-second input-driven progression motion proof.
- Godot Foundation run `33743240891`: SUCCESS on accepted exact head, including import, deterministic state/persistence tests, Linux/Web export and native smoke.
- Godot Web Export Playability run `33743240871`: SUCCESS on accepted exact head, including packaged identity, canonical exports and normal browser input evidence.
- Vercel candidate status before merge: SUCCESS.

Direct review confirms that Land, Settlement, City, Nation and Empire are physically distinguishable without labels and that Map/World progression is no longer primarily camera zoom or translucent-ring semantics.

## Accepted gameplay rollback baseline

First Inter-Land Coordination v1 remains the latest accepted deep gameplay rollback point.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.

Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`
Merged gameplay rollback baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

That baseline preserves one shared Aurelian geography, Village/Map/World roles, exactly two claimed lands and persistent Trade/Watch coordination outcomes.

## Current bottleneck

The progression grammar now works structurally. The remaining blockout problem is visual hierarchy and clarity.

Direct review and owner feedback agree on the same issue:

- Nation and Empire are too visually dense;
- Map and World contain too many competing route/boundary strokes;
- capital, subordinate nodes and frontier reach do not yet have a calm enough hierarchy;
- the image can read as accumulated information rather than deliberate composition.

This is not a reason to reopen the accepted v2 progression grammar. It is the reason for issue #570.

## Binding Clarity & Composition direction

### Village

- preserve accepted physical growth and seat-of-power progression;
- group repeated buildings into clearer districts;
- keep one dominant capital/imperial focal silhouette;
- secondary structures support rather than compete with the focal point.

### Map

- one primary territorial-boundary language;
- fewer redundant/parallel boundary strokes;
- only a small number of major routes should dominate;
- minor routes/nodes must be subordinate by weight, scale and spacing;
- Nation reads as coherent homeland;
- Empire reads as a larger multi-node system without line clutter.

### World

- fewer competing long lines;
- clear capital, subordinate loci and frontier relationship;
- retain the accepted physical Nation -> Empire hierarchy;
- external reach should read through spacing and topology, not a web of equal-strength strokes;
- do not fall back to dashboard/ring-first treatment.

## Evidence gate

### Gate C1 - critical readability proof

Before any full-matrix spend, capture exactly six unlabeled fixed-camera frames:

- Nation Village
- Nation Map
- Nation World
- Empire Village
- Empire Map
- Empire World

Compare them directly against the accepted PR #569 baseline.

PASS only if:

1. clutter is materially reduced;
2. Nation and Empire remain unmistakably different;
3. the primary focal point is faster to identify;
4. physical progression remains intact;
5. no new mechanic or asset family is introduced.

If C1 fails, allow at most one bounded visual correction before stopping implementation and revisiting composition.

### Gate C2 - full continuity proof

Only after C1 passes:

- regenerate the 15-frame fixed-camera progression matrix;
- verify Land/Settlement/City remain unchanged or intentionally equivalent;
- compare accepted v2 against clarity-pass Nation/Empire;
- run focused visual grammar, Foundation and Web regressions;
- perform direct screenshot and motion review.

Green CI alone is not acceptance.

## Allowed

- bounded edits to the Full Progression v2 presentation layer;
- existing Aurelian assets and procedural presentation primitives;
- route/boundary count, thickness, hierarchy, placement and visibility;
- district grouping and composition;
- focused evidence/test updates.

## Forbidden

- Third-Land Prospect recovery;
- economy/resources/workers/timers/queues;
- combat/diplomacy/governance systems;
- repeatable expansion or third-land systems;
- new geography or paid asset family;
- broad `playable_aurelian_entry_v1.gd` rewrite;
- camera/label/UI-only progression semantics;
- backend/multiplayer/accounts/payments;
- MAX or paid tools.

## Tool and cost policy

- Strategy, art direction and direct review: GPT-5.6 Sol.
- Deterministic Godot/GitHub/self-hosted evidence first.
- Cursor only if one precise bounded prompt materially speeds implementation.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence after this phase

1. Finish progression clarity/composition blockout.
2. Core Playable Loop consolidation.
3. Minimal Economy Foundation.
4. Repeatable Expansion Loop.
5. Nation gameplay depth using validated prototypes.
6. Empire gameplay depth and scaling.
7. Content scale, polish, UX, audio and performance.

A later portfolio review may reorder phases when current evidence shows a different bottleneck.

## Historical references

- PR #565 Full Progression Blockout v1: terminal REJECT/reference only.
- PR #561 Third-Land Prospect v1: terminal REJECT/reference only.
- Issues #559 and #562 remain frozen.
- PR #569 Full Progression Visual Grammar v2: accepted and merged.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs;
3. root `AGENTS.md`;
4. `docs/GAME_STRATEGY_MASTER_PLAN.md`;
5. active execution issue #570;
6. accepted exact-head evidence and merged baselines;
7. active operating/QA protocols;
8. older issues, PRs, briefs, runbooks and reports as history/reference only.

## Current stop condition

Do not authorize deeper mechanics until Gate C1 proves Nation/Empire readability improvement. One complete clarity candidate plus at most one bounded correction is allowed before returning to art-direction review.