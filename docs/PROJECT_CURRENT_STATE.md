# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-31
Current state revision: 2
Authority baseline SHA: `47f425aa63df156abd785958a82944e885b7bf5b`
Product baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: whole-game progression blockout before deeper mechanics.
Current milestone: Aurelian Full Progression Blockout v1.
Active execution issue: #563
Next allowed action: after this strategy-reset authority merges with healthy exact-head checks, implement exactly one bounded Full Progression Blockout v1 candidate under issue #563.

## Accepted product baseline

First Inter-Land Coordination v1 is the latest accepted product milestone and remains the rollback baseline.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.

Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`
Merged product baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Accepted evidence:

- Playable Entry: run `33342439470`, artifact `9741137826`, digest `sha256:0fd36bff43afb1dc78743f599153dc628da7778407fba5ec782d88010714ec0b`
- Web Playability: run `33342439381`, artifact `9741057440`, digest `sha256:9f8ee765190b0b6e4eb159eaa5abd646857b22ee7c7090ba2aa33b7f180275a7`
- Session Persistence v2: run `33342439433`, artifact `9741046269`, digest `sha256:d9f75167254cd0aef8dd49419e4af0f19bd6c67811611c87602bf6610f3e321c`

Direct review confirmed two persistent and mutually exclusive Trade/Watch coordination outcomes, correct Village/Map/World roles, exactly two claimed lands, one shared Aurelian geography, and persistence across native restart, Web reload and profile reopen.

## Rejected and frozen work

PR #561 `Implement Godot First Third-Land Prospect v1` is terminally rejected at head `fd4e0612caae369123b3c374486acf1d208ec908`.

Classification: `GODOT_AURELIAN_FIRST_THIRD_LAND_PROSPECT_REJECT`.

Reason: exact-head Web and Persistence evidence passed, but the required Playable normal-input sequence stopped at `world_coordinated_logistics_network` and never entered prospect reveal, inspection, survey or terminal prospect states. Static or alternate-path evidence cannot replace the missing reviewed interaction.

The rejected branch is reference material only and must not be merged.

Issue #559 and recovery issue #562 are superseded by the whole-product strategy review. Third-Land Prospect recovery is intentionally frozen during the current phase. Do not resume it unless a later portfolio review explicitly makes expansion-system work the highest-value next move.

## Whole-product strategy review

### Finding

The project proved the core fantasy and several later mechanic prototypes successfully, but milestone selection became too locally sequential after First Nation / Living Capital. The process optimized each individual PR well while the world/progression skeleton and visible stage differentiation lagged behind the growing state machine.

This is a roadmap-governance failure, not a reason to discard accepted work.

### Biggest current bottleneck

The player cannot yet see the whole promise `land -> settlement -> city -> nation -> empire` as one coherent, strongly differentiated progression across Village, Map and World.

That bottleneck is now more important than another crisis, rival, specialization, coordination or expansion micro-feature.

### Decision

Build breadth in blockout before adding more depth.

The next candidate must create a representative whole-game progression matrix on the accepted Aurelian geography:

1. `land`
2. `settlement`
3. `city`
4. `nation`
5. `empire`

across:

- Village = HOW
- Map = WHERE
- World = WHY / SCALE

Required primary evidence: **15 key 1440x900 running-game screenshots = 5 stages x 3 views**, plus one short input-driven progression video.

A reviewer who sees only the matrix must understand the stage progression without implementation notes.

## Current phase scope

### Required visible outcome

- Village must scale materially in footprint, density, civic hierarchy, paths/roads, work/field edges and capital prominence.
- Map must scale from starting land to settlement/city importance, homeland/network and imperial frontier structure.
- World must communicate increasing strategic scale while remaining geography/atlas first and UI second.
- The full 10,000-land promise should be represented structurally; this phase does not build 10,000 final production lands.
- Existing accepted mechanics may provide continuity and state, but they are not expanded during this phase.

### Allowed

- `game/scenes/aurelian/**`
- existing Aurelian assets, materials, topology and derived procedural nodes
- `game/tests/**`
- focused evidence workflow changes
- bounded camera/framing, composition, lighting, fog, hierarchy and gamefeel adjustments when they strengthen the shared progression matrix
- reuse of already-created staged village/art-target work where it matches current direction

### Forbidden

- Third-Land Prospect recovery during this phase
- new economy, resources, production, workers, queues or timers
- new combat, diplomacy or governance systems
- third-land claim or repeatable expansion system
- backend, multiplayer, accounts, payments or P12
- new asset family or paid asset without an explicit later bottleneck decision
- React/SVG/CSS rebuilding of final game surfaces
- MAX or paid tools by default

## Build sequence after this phase

The durable sequence is defined in `docs/GAME_STRATEGY_MASTER_PLAN.md`. Current intent is:

1. Full Progression Blockout
2. Core Playable Loop consolidation
3. Minimal Economy Foundation
4. Repeatable Expansion Loop
5. Nation gameplay depth using validated prototypes
6. Empire gameplay depth and scaling
7. Content scale, polish, UX, audio and performance

This is a strategy rail, not a promise to implement every listed system. A portfolio review may reorder later phases when evidence shows a different bottleneck.

## Portfolio gate

Before authorizing a new product milestone, the control-plane must identify the biggest current product bottleneck and compare the proposed work against at least the main alternatives. It must not mechanically infer the next feature from the previous state transition.

A portfolio review is mandatory after a terminal REJECT, at a major phase boundary, after repeated work in one subsystem, when user feedback says pace/clarity/visual progress is wrong, or when code/state complexity is growing faster than visible product value.

The review should be lightweight and may live in current state or the active issue; it does not require a separate PR unless authority actually changes.

## Tool and cost policy

- Strategy/control/direct review: GPT-5.6 Sol.
- Deterministic GitHub/Godot tooling first.
- Executor: Cursor GPT-5.5 without MAX only when an exact implementation contract is ready and an execution path is available.
- MAX: OFF.
- Extra spend target: 0 USD.
- Paid assets/tools require an explicit bottleneck justification.

## Acceptance gate for Full Progression Blockout v1

PASS only if:

1. one physical Aurelian geography remains coherent across all views;
2. all 15 required running-game states are captured on the exact candidate head;
3. the five progression stages are visually distinguishable without reading labels;
4. Village hierarchy and density scale materially;
5. Map reads as evolving strategy geography rather than the same picture with new labels;
6. World communicates increasing scale/frontier context;
7. accepted gameplay/persistence baseline is not regressed;
8. direct screenshot and motion review passes; green CI alone is insufficient.

At most one bounded correction is allowed after the first complete 15-frame candidate. If the visual direction is still weak, stop implementation and return to art-direction/composition review rather than micro-polishing.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`
2. accepted ADRs
3. root `AGENTS.md`
4. `docs/GAME_STRATEGY_MASTER_PLAN.md` for durable product sequencing
5. active execution issue #563
6. accepted exact-head evidence and merged product baseline
7. active operating/QA protocols
8. older issues, PRs, briefs, runbooks, reports and generated evidence as history only

## Current stop condition

Stop after one accepted or rejected Aurelian Full Progression Blockout v1 candidate. Do not resume deeper mechanics or Third-Land Prospect work from this authority.