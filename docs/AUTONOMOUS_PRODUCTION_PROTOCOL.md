# Low-Touch Autonomous Production Protocol v1.1

Status: ACTIVE  
Owner: Pixel Nations production system  
Purpose: reduce human busywork while preserving product quality, cost control, and strategic direction.

## Why this exists

Pixel Nations should not require the user to spend most of their time copying terminal logs, uploading repeated checkpoint packages, or re-disciplining the workflow.

The desired operating model is:

- the user approves direction and rare critical pivots,
- ChatGPT acts as strategic/product/QA/cost gatekeeper,
- Cursor/headless agent or terminal packages execute scoped work,
- cloud execution should eventually replace local MacBook execution,
- reports should be bundled automatically,
- work should continue through non-critical steps without interrupting the user.

## Low-touch principle

The system should ask the user only at critical decision points.

A checkpoint is required only when:

1. Product direction changes materially.
2. The agent is blocked after a bounded recovery attempt.
3. A quality gate fails repeatedly and the failure is not mechanical.
4. The task risks increasing scope, cost, or architecture complexity.
5. The result is ready for human product/visual verdict.
6. A legal, monetization, crypto/payment, security, or data-risk decision appears.
7. The agent would need credentials, paid services, new infrastructure, or destructive actions.

Everything else should be handled by the execution system and summarized in the next batch report.

## Default autonomous run structure

A future cloud/headless execution run should operate in batches, not micro-checkpoints.

Each batch must include:

1. Read active rails:
   - `docs/PROJECT_CURRENT_STATE.md`
   - `docs/FINAL_PRODUCT_TARGET.md`
   - `docs/GAME_STRATEGY_MASTER_PLAN.md`
   - `docs/IMPLEMENTATION_ROADMAP.md`
   - `docs/SPRINT_DEPENDENCY_GRAPH.md`
   - `docs/AGENT_EXECUTION_GOVERNANCE.md`
   - this file

2. Confirm clean start:
   - repo clean
   - branch current
   - public QA green or explicitly known blocked

3. Execute only the current approved sprint or batch.

4. Validate:
   - build
   - smoke
   - screenshots when UI changed
   - handoff
   - public QA sync when pushed

5. Continue automatically through mechanical fixes when safe.

6. Stop only for critical gates.

7. Produce one final result package / PR summary.

## Batch size

Preferred batch size:

- small enough that review is meaningful,
- large enough that the user is not reduced to command-copying.

Default target: one visible product milestone per batch, not one tiny file change.

Examples:

- Good: “Claimed land to first meaningful settlement loop.”
- Good: “First economy choice with clear resource consequence.”
- Bad: “Rename one button and stop.”
- Bad: “Build entire final game without checkpoints.”

## Agent decision authority

The agent may decide:

- copy improvements inside approved product intent,
- small layout fixes that support the approved flow,
- implementation details inside existing architecture,
- safe refactors needed to complete the sprint,
- deterministic QA recovery steps,
- documentation updates required to preserve current state.

The agent must stop before deciding:

- new game systems not in the roadmap,
- backend/database/payment/auth architecture,
- crypto/NFT/wallet/token direction,
- major map/globe redesign,
- new dependencies or paid services,
- destructive git history changes,
- security-sensitive credential handling,
- major art direction change,
- any recurring cost increase not already approved.

## Cost policy

Cost optimization means maximizing progress per dollar without sacrificing product quality.

Allowed cost increases must satisfy at least one condition:

- they materially reduce human busywork,
- they materially improve product quality,
- they materially reduce failure/rework risk,
- they shorten wall-clock time enough to offset higher hourly cost,
- they enable off-MacBook reliability.

Cheap-but-chaotic is rejected. Expensive-without-better-output is rejected.

## Cloud execution target

The desired future state:

- local MacBook is not the primary executor,
- GitHub is source of truth,
- cloud dev environment runs build/QA/agent,
- Vercel remains public demo deploy,
- result packages are generated automatically,
- the user reviews milestone summaries, not terminal walls.

## Quality gates

Do not mistake mechanical QA for product quality.

Mechanical gates:

- build passes,
- smoke passes,
- screenshots regenerate when UI changed,
- repo clean,
- public QA sync passes.

Product gates:

- first-time user understands the next action,
- the core loop is clearer than before,
- the game feels like land → settlement/city → nation → empire,
- visual debt is named instead of hidden,
- scope did not drift into map polish unless approved.

## Failure handling

A batch may try bounded recovery without user interruption when:

- the fix is mechanical,
- the files are already in scope,
- the recovery path is deterministic,
- no strategic decision is needed.

Hard stop after:

- repeated QA failure with unclear cause,
- dirty repo that cannot be safely restored,
- build/type errors requiring architecture choice,
- public deploy mismatch lasting beyond the run limit,
- agent loop behavior,
- scope drift.

## Reporting policy

The user should receive one consolidated checkpoint report per batch, containing:

- what changed,
- what was intentionally not changed,
- validation results,
- product verdict,
- visual debt,
- cost/time notes,
- next recommended batch,
- stop reasons if blocked.

Terminal walls should be avoided. Use `npm run pn:report` or future cloud result packages.

## Relationship to final product

This protocol does not reduce ambition. It protects it.

The long-term goal remains the strongest possible Pixel Nations first playable product under current constraints:

land → settlement/city → nation → empire

The agent should not optimize for “more code.” It should optimize for a better game.
