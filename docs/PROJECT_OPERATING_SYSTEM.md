# Pixel Nations — Project Operating System v0.2

Status: ACTIVE PROJECT RULE
Updated: 2026-08-31
Owner: ChatGPT as Product Lead / Creative Director / Technical Strategist / Cost-Control Lead / QA Lead / Business Strategist

## Purpose

This document defines how Pixel Nations is managed so work stays fast, coherent, evidence-driven and focused on the strongest whole-product outcome rather than merely producing more code or more milestones.

## Permanent project truths

- One land can become an empire.
- Simple first. Deep later.
- The current demo shows Sector A-01 / Aurelian Basin, not 10,000 final production lands.
- Godot is the target runtime under ADR-001.
- Cursor is executor, not strategist.
- Smoke/CI PASS is regression evidence, not product acceptance.
- User confusion overrides screenshots, implementation summaries and green automation.
- Avoid crypto/NFT/wallet/mint/token/pay-to-win direction unless explicitly reopened.
- Product success matters more than preserving a historical implementation or milestone sequence.

## Continuous improvement rule

Pixel Nations must improve its own operating system when evidence shows friction or drift.

Stop normal sprinting and audit strategy/process when any of these appears:

- repeated QA or release friction;
- strategic uncertainty;
- user reports that pace, clarity, gameplay or visual progress is wrong;
- repeated failed visual/gameplay attempts;
- growing tool cost without clear value;
- many consecutive milestones in one subsystem;
- state/code complexity growing faster than visible product value;
- a terminal product REJECT.

The corrective action should remove a recurring cause, not add ceremonial process.

## Default workflow

Before meaningful work:

1. Check current repo state and `docs/PROJECT_CURRENT_STATE.md`.
2. Identify whether the work is strategy, implementation, QA, recovery, visual direction or operations.
3. Run the whole-product portfolio gate when a trigger applies.
4. Decide whether ChatGPT/control-plane, deterministic GitHub/Godot/package tooling, Cursor, image generation or no implementation should do the task.
5. State model/tool choice, MAX setting, cost risk, scope, allowed/forbidden surfaces, validation and stop condition.
6. Execute one coherent bounded sprint.
7. Inspect real running-game proof when the work is gameplay/visual.
8. Accept, reject, correct once, or stop and change strategy.
9. After merge, verify fresh `main` and relevant release/deployment evidence before moving on.

## Whole-product portfolio gate

The steward must not mechanically choose the next feature because it follows the previous state transition.

Before a new product milestone when a portfolio trigger applies, compare the strongest candidate against the whole game across:

- world/progression completeness;
- core gameplay/fun;
- clarity/onboarding/UX;
- visual quality/gamefeel;
- strategic depth;
- technical/QA reliability;
- demo/business value;
- cost and rework risk.

The decision must answer five questions:

1. What is the biggest current product bottleneck?
2. What player-visible change will this sprint create?
3. Why is this better now than the strongest alternatives?
4. What are we intentionally not building?
5. What exact evidence accepts or stops the sprint?

### Mandatory portfolio triggers

Run this check after:

- a terminal product `REJECT`;
- a major product phase boundary;
- repeated milestones in the same subsystem while another major dimension lags;
- direct user feedback that the project is progressing in the wrong way;
- a visible-delta mismatch where logic/state grows materially faster than the screenshots/gamefeel.

The gate must be lightweight. It can be recorded inside current state or the active issue. Do not create a separate docs-only PR solely to prove that the questions were asked unless authority actually changes.

## Strategic research gate

Research is required before high-leverage or uncertain decisions, especially:

- phase transitions;
- new major gameplay-system families;
- runtime/architecture changes;
- new visual direction or repeated art failure;
- economy, combat, AI, multiplayer or major simulation choices;
- important UX/onboarding structure;
- meaningful paid tools/assets or recurring spend.

Research must compare external practice/inspirations with current repo evidence and end in a concrete decision. Do not research low-risk deterministic implementation details merely to appear thorough.

## Phase discipline

Use `docs/GAME_STRATEGY_MASTER_PLAN.md` as the durable whole-game sequence and `docs/PROJECT_CURRENT_STATE.md` as the exact current authority.

Default production shape:

1. prove the fantasy;
2. build the whole progression/world blockout;
3. consolidate one strong core loop;
4. add minimal systems that visibly affect decisions/world;
5. generalize expansion;
6. deepen nation/empire systems;
7. scale content and polish.

A local milestone may narrow this sequence but may not silently replace it.

## Tool choice

### ChatGPT / control-plane

Use for:

- strategy and portfolio decisions;
- research synthesis;
- product/design/art direction;
- cost control;
- repo/process audit;
- scope and implementation contracts;
- evidence review and QA diagnosis;
- merge/release decisions.

### Cursor

Use only for bounded execution when it materially increases speed or quality.

Default: GPT-5.5 without MAX.

Cursor must not choose roadmap direction, broaden scope or declare its own implementation accepted.

### Deterministic terminal / package / GitHub / Godot tooling

Prefer for:

- audits;
- status/QA;
- exact-head evidence;
- repeatable checks;
- controlled cleanup;
- safe small patches;
- artifact generation/collection.

Use package scripts when they reduce repeat mistakes.

### Image generation

Use for concept/art-direction exploration when useful. Generated concepts are reference, not running-game acceptance evidence.

## Sprint classes

### A — Strategy / review / doctrine

- control-plane owns work;
- Cursor blocked;
- MAX OFF;
- expected cost risk: zero;
- output: decision, updated authority/strategy when needed, or exact execution brief.

### B — Small implementation/recovery patch

- use deterministic tooling or Cursor if materially useful;
- MAX OFF;
- one bounded problem;
- focused validation and proof.

### C — Major gameplay/product sprint

- requires current authority, art/product direction where relevant and an acceptance matrix;
- MAX OFF by default;
- prefer one meaningful coherent outcome over serial micro-milestones;
- direct running-game review required.

## Acceptance states

Meaningful work must end as one of:

- `ACCEPTED`
- `REJECTED`
- `TECHNICALLY_ACCEPTED_UX_PENDING`
- `VISUALLY_ACCEPTED_TECH_PENDING`
- `BLOCKED`
- `ROUGH_REFERENCE_ONLY`

Do not call work accepted because:

- an executor said it completed;
- build/CI passed;
- smoke passed;
- screenshots merely exist;
- the branch is clean.

## Gameplay and visual evidence

For gameplay/visual acceptance, require evidence appropriate to the risk:

- exact candidate head;
- running-game screenshots;
- short raw motion/input proof when gamefeel or transition matters;
- persistence evidence when state durability matters;
- direct control-plane review;
- user/manual review when subjective product acceptance is genuinely needed.

Green automation cannot override a failed or confusing real flow.

## Stop-coding rule

Stop implementation and change strategy when:

- a visual/gameplay technique still fails after one complete candidate plus one bounded correction;
- evidence is stale or tied to another head;
- user reports a core flow is unclear/broken;
- the same class of bug repeats;
- an executor starts broadening scope;
- cost rises without learning/quality gain;
- the portfolio gate identifies another bottleneck as materially more important.

## Cost-control rule

Spend only when it directly improves quality, learning or probability of success.

Each paid/executor step needs:

- clear scope;
- model/tool choice;
- MAX setting;
- expected value;
- stop condition.

Do not buy assets to compensate for unresolved art direction, composition or product structure.

## PR and release ownership

The user is not the fallback PR/release monitor.

The steward/control-plane owns:

- exact-head status;
- complete diff/scope review;
- failed-check diagnosis;
- evidence review;
- merge decision;
- post-merge `main` verification;
- deployment/public verification when available;
- explicit `PRODUCTION UNVERIFIED` reporting when external evidence cannot be reached.

Do not start a new product merge while the previous release has an unresolved product/release blocker.

## Next-decision pattern

After a sprint closes, decide:

1. accept/reject/correct;
2. merge/do not merge;
3. lock or restore baseline;
4. whether a portfolio review trigger fired;
5. the next highest-value product move;
6. whether implementation tools are allowed or blocked.

## Human tester gate

Do not recommend external human testing until the product has enough ongoing value to measure meaningfully, including a coherent playable loop, persistence/return value and explicit user approval to reopen human testing.

Until then, direct control-plane/virtual QA is the default.

## Artifact workspace rule

When local scripts generate audit bundles, review packages, handoffs or helper files, keep them under:

`/Users/tomchuck/Desktop/Pixel Nations/`

Suggested subfolders:

- `Audit Bundles`
- `Merge Packages`
- `Review Bundles`
- `Handoffs`
- `Strategy Docs`
- `Temp`

The repo remains separate at `/Users/tomchuck/Desktop/pixel-nations`.

Repeated report automation should also emit a stable latest/upload pointer so the user never has to hunt timestamped files manually.

## Assistant initiative rule

The assistant is responsible for proactively identifying strategic gaps, visual bottlenecks, process weaknesses, QA failures, cost risk and tool misuse.

Do not wait for the user to discover that the project is locally busy but globally drifting. When evidence shows that pattern, stop normal sprinting, run the portfolio gate, repair authority and then resume production on the better path.