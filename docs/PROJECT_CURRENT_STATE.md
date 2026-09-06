# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 12.0
Authority baseline SHA: `d24f2f1ec414548a14e31b5d7dfd608320ca08ca`
Product baseline SHA: `d24f2f1ec414548a14e31b5d7dfd608320ca08ca`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: Phase B - Core Playable Loop Consolidation.
Current milestone: make one representative first session clear, satisfying and persistent from first claim to meaningful expansion.
Active execution issue: #586
Next allowed action: after this authority update merges, inspect the current playable entry/controller and state graph, then define one bounded consolidation candidate using accepted mechanics/states only. Do not add a new system to make the loop work.

## Core truth

**One land can become an empire.**

The whole progression and world-scale blockout now exists. The next bottleneck is no longer proving that the world is large. It is making the existing game understandable and satisfying as one coherent play session.

## Accepted product baselines

### Progression and clarity

Accepted:
- `FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_PASS`
- `FULL_PROGRESSION_CLARITY_COMPOSITION_V1_PASS`
- merged progression/clarity baseline: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`

The accepted visual grammar remains:

`land -> settlement -> city -> nation -> empire`

Village, Map and World remain different roles over one coherent geography:
- Village = HOW
- Map = WHERE
- World = WHY / SCALE / WHICH DIRECTION

### Regional scale

Accepted:
- `WORLD_SCALE_SECTOR_GENERATOR_V4_BLOCKOUT_PASS`
- accepted exact head: `3e4a2347829dd2b1a35bff2b5c001f23f95414d1`
- merged baseline: `6e5a9ab4ff684798f13d4de6b4f39df0b2a8ccd9`

Sector Generator v4 proves a deterministic content-production model:

`sector_spec -> Blender generator -> GLB -> Godot`

It is a blockout/system base, not production-final regional art.

### Macro-world scale

Accepted:
- `WORLD_ATLAS_BLOCKOUT_V1_PASS`
- accepted exact head: `4ffe03bd92cd70d07a5f85bb9f9522fcc6f06433`
- focused run: `34056197409`
- artifact: `9996037652`
- artifact digest: `sha256:b91f2772959355620d174ff2cc8bb1c1e4c712e18b2b10679506d61f1e00624a`
- merged baseline: `d24f2f1ec414548a14e31b5d7dfd608320ca08ca`

The Atlas proves Sector A-01 can read as a small nested origin inside a much larger physical world without a literal 10x10 sector grid or 10,000-land dashboard.

The accepted Atlas is a macro-world blockout, not production-final Atlas art.

The Atlas milestone consumed its one bounded visual correction. Do not reopen it through incremental micro-polish inside Phase B.

## World-scale lessons now binding

The world-scale phase demonstrated:
- geography must read before markers, labels or UI;
- camera/LOD may change with scale, but the physical-world identity must stay coherent;
- a finite floating-board silhouette is not acceptable as the primary world read;
- canonical Aurelian assets can be used as a source library, but source geometry must not leak into generated lower-detail LODs;
- generator/spec abstraction is preferred over hand-authoring hundreds of repeated locations;
- blockout quality and scalability are more important now than final art detail.

Historical rejected world-scale attempts remain reference only. Do not revive their representation by incremental polishing.

## Whole-product portfolio gate after Atlas

World/progression completeness is no longer the largest blocker.

The strongest next milestone is **Core Playable Loop Consolidation**, ahead of Minimal Economy Foundation and further visual/world expansion, because:
- accepted prototypes already cover claim, settlement, growth, trade, city, nation, empire, expansion and consequences;
- the product now needs one coherent experience rather than more isolated capability;
- current demo/business value increases more from clarity, pacing and satisfying consequence than from another subsystem;
- consolidating first exposes which economy/depth systems are actually needed later;
- it reduces the risk of building deeper mechanics around a confusing interaction model.

Research reinforces progressive disclosure: teach the core loop through objectives that build on each other, keep the current goal obvious, and move advanced mechanics out of the critical first path until they are relevant.

A visual/clarity pass may interrupt Phase B only if direct running-game evidence shows that visual noise prevents the player from understanding the next action or consequence. Green screenshot QA cannot override real confusion.

## Phase B target loop

Representative loop:

`claim -> develop -> choose -> see consequence -> grow -> expand`

This is a product loop, not a requirement to expose every existing prototype in one session.

The first consolidation candidate should reuse the smallest set of accepted mechanics that proves all six beats.

### Required player experience

At each beat:
1. one primary objective/action is visually obvious;
2. the player understands why that action matters;
3. action produces visible feedback in the world;
4. the next objective follows naturally from the consequence;
5. Village/Map/World navigation supports the decision instead of becoming a separate puzzle;
6. meaningful state survives the relevant transition/reload where persistence applies.

Use progressive disclosure. Do not display every future system, status panel or tutorial instruction at once.

### First-session structure

The candidate should prefer this shape unless repo preflight finds a materially simpler accepted path:
- orient the player to the starting land and immediate goal;
- claim/found and visibly develop the home;
- present one meaningful existing choice;
- show its consequence in the same geography;
- convert that consequence into visible growth/progression;
- reach one meaningful expansion payoff beyond the starting land.

The exact reused choice is selected during implementation preflight from already accepted mechanics. Do not invent a new choice system for Phase B.

## Implementation preflight before coding

Before touching runtime code:
- inspect current playable entry/controller and state graph;
- identify the shortest accepted path that already contains all six loop beats;
- identify duplicated/legacy states that can be hidden or bypassed without deleting historical prototypes;
- identify the minimum files required;
- decide whether direct deterministic editing or Cursor is safer/faster;
- define exact input sequence and evidence before implementation.

Cursor is executor, not strategist.

If Cursor is used:
- default model GPT-5.5;
- MAX OFF;
- one reviewed prompt;
- exact allowed files;
- no autonomous scope expansion.

## Phase B allowed scope

Allowed:
- sequencing and consolidation of accepted playable states;
- primary-objective clarity;
- low-friction Village/Map/World transitions;
- hiding/de-emphasizing nonessential first-session information;
- reusing accepted action/consequence visuals;
- pacing and gamefeel improvements needed to make the loop legible;
- persistence wiring for meaningful state already supported by accepted prototypes;
- one focused loop contract;
- one input-driven evidence path and direct review.

Allowed visual work is bounded to clarity/gamefeel inside the loop. It is not a new art-direction phase.

## Phase B forbidden scope

Forbidden unless a later portfolio gate explicitly reopens it:
- new resource/economy system;
- workers, timers, queues or production chains;
- combat;
- diplomacy;
- governance expansion;
- new repeatable expansion simulation;
- new World Atlas/Sector representation;
- new paid or unrelated asset family;
- backend, multiplayer, accounts or payments;
- crypto/NFT/wallet/token direction;
- MAX or paid tools.

Do not delete validated prototypes merely because the first-session path does not expose them yet.

## Phase B evidence gate

A candidate is not accepted from code or green CI alone.

Evidence must include:
- one exact-head input-driven first-session video showing the representative loop;
- a compact set of key frames covering the six beats;
- deterministic state/action log for the same run;
- focused loop contract;
- existing Foundation/Web/playable regressions;
- persistence evidence where the chosen path changes meaningful persistent state;
- direct visual/product review.

PASS only if:
1. an uninformed player can identify the next primary action at each beat without reading implementation notes;
2. the sequence feels like one game loop rather than a chain of disconnected demos;
3. every major action has visible consequence;
4. the path reaches meaningful expansion without exposing unnecessary system clutter;
5. Village/Map/World transitions are understandable and purposeful;
6. no new deep system was required to make the loop satisfying;
7. existing accepted progression/world identity remains intact.

If the candidate is technically green but still confusing, reject.

## Phase B stop condition

Authorize one complete consolidation candidate plus at most one bounded correction after direct review.

Stop and re-run the portfolio gate if:
- implementation starts inventing new mechanics to connect old mechanics;
- the first session requires more explanation instead of less;
- state/controller complexity grows faster than player-visible value;
- one bounded correction cannot make the loop readable;
- visual noise, rather than sequencing, proves to be the actual blocker.

## Tool and cost policy

- Strategy, research, scope and direct review: GPT-5.6 Sol.
- Deterministic terminal/GitHub/Godot preferred for audits, QA and small safe changes.
- Cursor only if the preflight shows it materially improves implementation speed or safety.
- Cursor default GPT-5.5, MAX OFF.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence

1. Core Playable Loop Consolidation - current.
2. Whole-product portfolio gate.
3. Minimal Economy Foundation.
4. Repeatable Expansion Loop.
5. Nation gameplay depth.
6. Empire gameplay depth and scaling.
7. Content scale, polish, UX, audio and performance.

The portfolio gate may reorder later phases when direct evidence identifies a stronger bottleneck.

## Historical references

- PR #439 Aurelian moodboard direction: accepted and binding.
- PR #445 capability-first Aurelian direction: accepted and binding.
- PR #561 Third-Land Prospect v1: terminal REJECT/reference only.
- PR #565 Full Progression Blockout v1: terminal REJECT/reference only.
- PR #569 Full Progression Visual Grammar v2: accepted and merged.
- PR #572 Full Progression Clarity & Composition v1: accepted and merged.
- Issue #573 World Scale Reveal v1: terminal REJECT, superseded.
- PR #578 authored Sector v1: terminal REJECT/reference only.
- PR #580 reuse-first Sector LOD v1: terminal REJECT/reference only.
- PR #582 Sector Generator v4: accepted blockout/system base and merged.
- PR #584 World Atlas Blockout v1: accepted blockout/system proof and merged.
- Historical React world maps: semantic/data reference only, never target Godot runtime presentation.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs;
3. root `AGENTS.md`;
4. `docs/GAME_STRATEGY_MASTER_PLAN.md`;
5. accepted exact-head evidence and merged baselines;
6. active execution issue #586 and its active product PR when one exists;
7. older issues, PRs, briefs and artifacts as history/reference only.

## Current stop condition

Runtime coding for Phase B remains blocked until this authority transition is reviewed and merged.

After merge, first action is implementation preflight: inspect the existing playable state graph and choose the shortest accepted path that proves the six-beat loop. No new mechanics before that preflight.