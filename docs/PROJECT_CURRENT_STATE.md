# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-31
Current state revision: 4
Authority baseline SHA: `62772203cb12157db205f866c48be82789ab009b`
Product baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: whole-game progression blockout before deeper mechanics.
Current milestone: authorize Full Progression Visual Grammar v2 and then build exactly one stronger progression candidate.
Active execution issue: #567
Next allowed action: after this authority transition merges with healthy exact-head checks, implement one bounded v2 candidate under #567. The first implementation gate is a five-frame unlabeled fixed-camera Village strip; do not spend on the full 15-frame matrix until that strip clearly reads `land -> settlement -> city -> nation -> empire`.

## Accepted product baseline

First Inter-Land Coordination v1 remains the latest accepted product milestone and rollback baseline.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.

Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`
Merged product baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Accepted evidence:

- Playable Entry run `33342439470`, artifact `9741137826`
- Web Playability run `33342439381`, artifact `9741057440`
- Session Persistence v2 run `33342439433`, artifact `9741046269`

The accepted baseline preserves one shared Aurelian geography, Village/Map/World roles, two claimed lands and persistent Trade/Watch coordination outcomes.

## Rejected reference candidate

PR #565 `Implement Godot Aurelian Full Progression Blockout v1` is terminally rejected at exact head `76eea912f112818b1036ea9977cbc5bef6853bf1` and is closed without merge.

Classification: `GODOT_AURELIAN_FULL_PROGRESSION_BLOCKOUT_V1_REJECT`.

Exact-head deterministic evidence passed in run `33401226854`, artifact `9761347657`, digest `sha256:d6b8e273e520604e20431bcd300f08542a2e8fd7d42b29027d4bffed2b8c2ae0`. The artifact contains all 15 required 1440x900 frames and a 12.77-second input-driven progression recording.

Direct review rejected the candidate because:

1. City, Nation and Empire Village states remained variants of the same base silhouette and read mainly as progressively larger central blocks.
2. Map and World progression read primarily as camera zoom plus translucent discs/rings instead of materially evolving homeland, network and imperial frontier geography.
3. A reviewer without labels could not reliably identify all five stages.

The first complete candidate received its one allowed bounded correction and remained below the visual acceptance gate. PR #565 is reference only and must not be reopened or merged.

PR #561 Third-Land Prospect is also terminally rejected/reference only. Issues #559 and #562 remain frozen. Do not resume deeper expansion work during this phase.

## Art-direction reset decision

The technical progression-atlas pipeline is proven. The bottleneck is now the **visual grammar of growth**.

The next candidate must make progression visible through physical world changes rather than primarily through camera distance, text, colored rings or generic central blocks.

Research principles adopted for v2:

- strategy-scale geography should remain a physical readable world, not become a dashboard;
- later settlement tiers need stronger density, civic hierarchy and monumental forms;
- the seat of power should be an unmistakable visual proof of political scale;
- inspiration is used as a design principle only, never as copied assets or layouts.

Binding detailed art direction and implementation scope live in issue #567.

## Binding visual grammar v2

### Cross-stage invariant

Within each view family, keep camera framing substantially stable across all five stages. The world itself must change enough that zoom cannot fake progression.

### Land

- mostly untouched Aurelian terrain;
- one small claim/camp identity cue;
- no urban silhouette or national territory treatment.

### Settlement

- compact organic cluster;
- village green / crossing-road relationship;
- footpaths and first field/work edge;
- low skyline and small footprint.

### City

- materially larger footprint than Settlement;
- multiple connected neighborhood blocks;
- primary roads/avenues and civic square;
- clearly stronger/taller civic landmark;
- denser residential/work edges.

### Nation

- Greenvale becomes a capital, not merely a larger city;
- distinct capital district / ceremonial axis / standards or monument language using the existing asset envelope and procedural composition;
- visible regional network and subordinate strategic nodes;
- Map shows a coherent homeland area and routes rather than a single disc;
- World shows Aurelian as a readable political region anchored to geography.

### Empire

- unmistakable imperial-capital silhouette and expanded physical footprint;
- dominant seat-of-power composition from existing modular/pinned assets or procedural primitives;
- satellite district/outpost/network context visible in the same frame;
- Map shows multiple controlled nodes/province-like areas and connected frontier structure;
- World shows a materially larger sphere of power and external frontier pressure;
- empire may not be identifiable only because of a label, color ring or camera distance.

## View roles

- Village = HOW: footprint, density, roads, civic hierarchy, neighborhoods, work/field edge and capital/imperial skyline.
- Map = WHERE: settlement anchors, routes, homeland/province footprint and frontier structure. Markers are supporting information only.
- World = WHY / SCALE: sphere of power, connected regions/frontiers and strategic geography. Preserve atlas-first composition.

## Implementation architecture

Preferred implementation:

- preserve the accepted shared Aurelian geography and GLB;
- reuse the existing production Village -> Map -> World inheritance where useful;
- build v2 stage composition in one bounded progression presentation layer;
- do not touch `playable_aurelian_entry_v1.gd` unless a concrete missing API is proven;
- do not add a new asset family by default;
- use deterministic Godot capture for rapid visual review.

## Two-step evidence gate

### Gate A - early silhouette proof

Before building the full matrix, capture exactly five unlabeled Village frames at one fixed camera:

`land -> settlement -> city -> nation -> empire`

PASS only if an uninformed reviewer can order and distinguish all five states from physical silhouette/footprint/hierarchy alone.

If City/Nation/Empire collapse into the same silhouette, reject early and change composition. Do not spend on Map/World or full regression yet.

### Gate B - complete progression atlas

Only after Gate A passes, produce:

- 15 exact-head 1440x900 screenshots = 5 stages x 3 views;
- unlabeled contact sheet;
- fixed-camera-per-view comparison sheet;
- short normal-input progression video;
- focused shared-geography and Godot regressions;
- final accepted gameplay/persistence regression before merge.

PASS only if:

1. all five stages are distinguishable without labels;
2. Village hierarchy and footprint scale materially;
3. Map reads as evolving physical strategic geography, not static terrain plus glyphs;
4. World communicates increasing political scale/frontier context;
5. one shared physical geography remains coherent;
6. accepted gameplay/persistence baseline is not regressed;
7. direct screenshot and motion review passes; green CI alone is insufficient.

At most one bounded correction is allowed after the first complete Gate B candidate. Gate A may be iterated cheaply before Gate B because its purpose is specifically to prevent expensive weak full-matrix runs.

## Allowed

- `game/scenes/aurelian/**`
- existing pinned/licensed Aurelian asset envelope
- existing procedural/derived presentation nodes
- procedural roads, plazas, territory surfaces, standards and presentation primitives
- `game/tests/**`
- one focused evidence workflow
- bounded shared lighting/framing changes

## Forbidden

- Third-Land Prospect recovery
- economy/resources/workers/timers/queues
- combat/diplomacy/governance systems
- third-land or repeatable expansion systems
- backend/multiplayer/accounts/payments/P12
- React/SVG/CSS final-game rebuild
- independent geography
- broad main-controller rewrite
- new paid assets/tools or MAX
- using camera zoom, labels or translucent rings as the primary progression delta

## Tool and cost policy

- Strategy/art direction/direct review: GPT-5.6 Sol
- Deterministic GitHub/Godot tooling first
- Executor: GPT-5.5/Codex-class bounded implementation when this authority merges
- MAX: OFF
- Extra spend target: 0 USD

## Durable build sequence after this phase

1. Full Progression Blockout with accepted visual grammar
2. Core Playable Loop consolidation
3. Minimal Economy Foundation
4. Repeatable Expansion Loop
5. Nation gameplay depth using validated prototypes
6. Empire gameplay depth and scaling
7. Content scale, polish, UX, audio and performance

A later portfolio review may reorder phases when current evidence shows a different bottleneck.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`
2. accepted ADRs
3. root `AGENTS.md`
4. `docs/GAME_STRATEGY_MASTER_PLAN.md`
5. active execution issue #567
6. accepted exact-head evidence and merged product baseline
7. active operating/QA protocols
8. older issues, PRs, briefs, runbooks and reports as history/reference only

## Current stop condition

Merge this authority transition only if it leaves #567 as the single active product direction and does not weaken existing exact-head/release/persistence guards.

After merge, implement Gate A first. Do not authorize deeper mechanics or a full Gate B run until the five-frame fixed-camera Village silhouette proof passes direct review.