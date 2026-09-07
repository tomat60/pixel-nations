# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-07
Current state revision: 12.6
Authority baseline SHA: `53d99a1cb8ae102ff7410b5032cfbe62e4ef6299`
Product baseline SHA: `d24f2f1ec414548a14e31b5d7dfd608320ca08ca`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: Phase B integrated Default First Session v3.
Current milestone: compose the proven export-safe first path and truthful optional-history persistence into one accepted player-visible session.
Active execution issue: #597
Next allowed action: implementation preflight #597 has passed. Open one draft Gate A candidate using only the twelve named files, then prove import, export-safe selectors, schema v2 semantics, evidence bounds, and all historical regressions before Gate B. Do not reopen PR #594, issue #593, PR #591, issue #589, PR #587, or issue #586.

## Whole-product portfolio gate after the Phase B reject

The terminal result on PR #587 triggered a mandatory portfolio review.

Decision: authorize exactly one `Default First Session v2` candidate under issue #589.

The largest product bottleneck remains the absence of one proven, coherent default first session. Technical reliability is the immediate enabling constraint because the rejected candidate selected different behavior in native and exported Web runtime, but a CI-only repair would create no player-visible delta.

The candidate must therefore solve both together:

- normal native and Web launch use the same default six-beat player path;
- historical full-progression regression uses an explicit export-safe path present in the built artifact, never a host environment variable as its sole selector;
- required video, six named key frames, deterministic action/state log, exact-head manifest and digests are fail-closed outputs, not optional review material;
- the player reaches a visible two-land East Route plus North Ridge payoff through accepted mechanics only.

This outranks Minimal Economy Foundation, more world/progression work, broad visual polish, and a standalone workflow repair. Those alternatives either deepen an unproven loop or add no direct player value.

Godot's official feature-tag guidance confirms that custom features can be embedded through export presets and queried inside exported projects. A dedicated regression scene or another deterministic built-runtime mechanism remains acceptable if it proves the same separation more simply.

No new economy, resources, workers, timers, queues, combat, diplomacy, governance, repeatable expansion system, Atlas/Sector representation, backend, accounts, multiplayer, payments, crypto, paid assets, or broad art pass is authorized.

Acceptance and stop conditions live in issue #589. Authorize one complete candidate and at most one bounded correction after direct review. Green CI alone is not acceptance.

## Whole-product portfolio gate after Default First Session v2

Decision: authorize exactly one `Persistence Optional History Decoupling v1` contract candidate under issue #593.

Default First Session v2 exposed a state-model contradiction rather than a sequencing or runner problem. Existing persistence fields can describe expansion and optional imperial history independently, but validation currently requires crisis, rival, and frontier-payoff completion before North Ridge expansion can be stored.

The bounded correction must make this truthful state representable:

- `imperial_expansion_target = north_ridge`;
- `first_imperial_expansion = north_ridge_claimed`;
- crisis, crisis response, rival response, and frontier payoff remain `none` when those threads were not played.

Historical full-progression saves must retain their completed optional history. Malformed combinations must remain rejected. Prefer a backward-compatible correction using existing fields. A schema migration, broad validation weakening, runtime sequencing, or player-facing change is not authorized.

This prerequisite outranks another first-session attempt because any such attempt would otherwise repeat the same invalid persistence boundary or fabricate player history. Acceptance and stop conditions live in issue #593.

## Whole-product portfolio gate after Persistence Optional History Decoupling v1

Decision: authorize exactly one integrated `Default First Session v3` candidate under issue #597.

The largest bottleneck remains the absence of one accepted coherent default first session. PR #591 proved the export-safe default/full-progression split and bounded first-path structure. PR #594 proved that schema v2 can preserve the two-land North Ridge finale while optional crisis, rival, and frontier-payoff history remains truthfully `none`. The failures were separate acceptance-boundary failures, not evidence that the target session lacks product value.

One integrated candidate now outranks:
- a standalone workflow repair, which creates no player-visible result;
- another persistence-only attempt, which still would not deliver the playable loop;
- Minimal Economy Foundation or deeper expansion, which would deepen an unaccepted first path;
- broad visual polish, because current evidence identifies sequencing, persistence, and exact-evidence reliability as the immediate constraints.

The candidate may update the historical Session Persistence v2 video upper runtime bound from 240 to 300 seconds, but must preserve the 110-second minimum, all 105 exact frames, every state/event assertion, native/Web/profile checks, manifests, and hashes. This evidence correction is part of the initial contract, not a later correction.

No schema migration, fabricated history, new mechanic, economy, third land, asset, terrain, world expansion, or broad controller rewrite is authorized. Acceptance and stop conditions live in issue #597.

## Latest terminal result

PR #594 `Phase B: decouple optional history from expansion persistence` is rejected and closed without merge.

Terminal classification: `GODOT_AURELIAN_PERSISTENCE_OPTIONAL_HISTORY_DECOUPLING_V1_REJECT`.

Rejected exact head: `3a5605a760d69267c70d6ecde220a7b4c1629ea4`.

Accepted exact-head evidence:
- focused run `34105718572`: PASS;
- focused artifact `10012312431`, digest `sha256:adf25b547a27fce65c3a237532887e84d1eaf9aba67934508bd1e99c6eb6c800`;
- direct artifact review confirmed schema v2, exactly East Route plus North Ridge, and crisis, crisis response, rival response, and frontier payoff remaining `none` after native restart, Web reload, and Web profile reopen;
- Foundation, Web Playability, CI, Visual QA, and P4 through P11 continuity passed.

Terminal blocker:
- Session Persistence v2 run `34105718341`: FAIL at exact-evidence validation;
- artifact `10012573346`, digest `sha256:a9b6ac11fde0e7045ea4699afce3668096cea94daba994dd70dd2ddbe1792fca`;
- all product tests, exports, native restart, Web reload, and profile reopen steps passed;
- the artifact contains all 105 required 1440x900 frames and the correct restored final-state manifest;
- the input-driven video is `253.280000` seconds, outside the accepted `110..240` bound.

The one authorized deterministic correction was consumed by aligning the stale imperial-expansion regression with the independent-history contract. A second correction or retry was not authorized. Acceptance condition 5 remained false.

Issue #593 is closed as `not planned`. Main and all accepted product/runtime baselines remain unchanged.

## Previous terminal result

PR #587 `Phase B: bound first playable session to North Ridge expansion` is rejected and closed without merge.

Terminal classification: `GODOT_AURELIAN_CORE_PLAYABLE_LOOP_CONSOLIDATION_REJECT`.

Rejected exact head: `b8352db71b8b6bd2bbb39a02e111700342089d99`.

Accepted exact-head checks:
- Core Playable Loop contract run `34077508580`: PASS, contract-only, no artifact;
- Godot Foundation run `34077508545`: PASS, artifact `10002589235`, digest `sha256:4276b16ab31fd71612d45daedfed61e153117a45501d7e197b93e90ddbb932d2`;
- Playable Entry run `34077508547`: PASS, artifact `10002818669`, digest `sha256:087961f4d7cf04ac2554256a3dde887b638f5f6ed78ffe15345a471321c15b14`;
- Pixel Nations CI, Play Visual QA, P4 through P11 continuity, and Vercel: PASS.

Terminal blockers:
- Web Playability run `34077508572`: FAIL, artifact `10002657500`, digest `sha256:d0c89e4431b02a628934f3761269d3b8e8c58c7582361cf04a721dc558ed44af`;
- Session Persistence v2 run `34077508515`: native PASS, Web reload/profile proof FAIL, artifact `10002679889`, digest `sha256:051a64f638ebc3c7a4be3a252f73bc091a5ec0f2350542cf8b079c39900be96b`;
- the bounded correction could not pass the full-progression selector into exported Web runtime;
- required default first-session video, six-beat keyframes and deterministic action/state log were not produced.

The one authorized bounded correction was consumed. Green contract or generic CI does not override missing product evidence or failed Web regressions.

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

1. Integrated Default First Session v3 - current.
2. Minimal Economy Foundation.
3. Repeatable Expansion Loop.
4. Nation gameplay depth.
5. Empire gameplay depth and scaling.
6. Content scale, polish, UX, audio and performance.

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
6. the active execution issue and its product PR when one exists;
7. older issues, PRs, briefs and artifacts as history/reference only.

## Current stop condition

Runtime coding outside issue #597 is blocked.

Implementation preflight #597 passed with exactly twelve named files, schema v2, existing mechanics, and the explicit evidence budget. One draft Gate A candidate is authorized with one fresh bounded correction allowance.
