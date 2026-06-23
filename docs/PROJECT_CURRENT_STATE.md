# Pixel Nations Current State

Status: ACTIVE  
Updated by: Project OS Cleanup v0.1  
Purpose: one current source of truth for the next assistant session.

## Current product state

Pixel Nations is a public demo for the loop:

land → settlement / city → nation → empire

The full product vision is a 10,000-land world. The current playable/demo area is Sector A-01 / Aurelian Basin.

## Accepted current milestone

Current accepted feature baseline:

- Living Map v0.5 first-world activity layer is merged.
- Continuity v0.6 path memory is merged.
- Public QA check automation exists as `npm run pn:public-check`.
- Public QA evidence was validated after Continuity v0.6.
- ChatGPT Project Instructions were simplified to Project Instructions v2.
- Project OS Cleanup v0.1 is the current system cleanup step.

## Current product risks

- The demo may still confuse first-time players about what to click next and why each action matters.
- Map geography is still prototype-level. Routes/markers can be symbolic and do not yet represent final authoritative geography.
- Some historical sprint docs still sound active. Use `docs/README.md` and this file to determine what is current.
- Manual file/upload/Vercel instructions should be replaced by deterministic commands wherever possible.

## Current process policy

Before any implementation:

1. Run `npm run pn:status`.
2. Read this file.
3. Confirm whether Cursor is allowed.
4. Prefer deterministic terminal packages for audits, docs, QA, and small safe patches.
5. Use Cursor only after a precise prompt passes review.
6. Default Cursor model is GPT-5.5 without MAX.
7. MAX is blocked unless the task clearly justifies higher cost.

## Current QA policy

Use:

```bash
npm run pn:status
npm run pn:public-check
```

`pn:public-check` validates public evidence freshness/equality. It does not approve art direction.

Visual work still requires explicit manual visual verdict:

- ACCEPTED
- REJECTED
- VISUAL DEBT

## Next recommended product step

After Project OS Cleanup v0.1 is committed and public evidence is clean:

Demo Readiness v0.7 — Player Confusion Pass

Goal:
Review the public demo as a new player and fix only the highest-impact confusion points.

Cursor remains blocked until that audit produces a precise scoped patch or approved Cursor prompt.

## Stop condition for current cleanup

Project OS Cleanup v0.1 is complete when:

- `docs/README.md` exists and maps active vs historical docs.
- `docs/PROJECT_CURRENT_STATE.md` exists.
- `npm run pn:status` exists.
- `docs/ASSISTANT_COMMAND_PROTOCOL.md` points future sessions to `pn:status`.
- repo is clean after handoff update.

<!-- PN_REPORT_PACKAGE_WORKFLOW_CURRENT_STATE_V0_1 -->
## Current handoff workflow

Result handoffs should use:

```bash
npm run pn:report
```

The command creates `reports/outbox/pn-result-*.zip` and reveals/selects the ZIP in Finder on macOS. Upload that ZIP to ChatGPT instead of pasting large terminal output.

This workflow is process infrastructure. It does not approve gameplay, visual quality, or product clarity.
<!-- END_PN_REPORT_PACKAGE_WORKFLOW_CURRENT_STATE_V0_1 -->

<!-- PN_PRODUCTION_OS_V1_0_CURRENT_STATE -->
## Production OS v1.0 strategic rail

Production OS v1.0 is the next strategic layer after Project OS cleanup and map clarity recovery.

Active strategy rails:

- `docs/FINAL_PRODUCT_TARGET.md`
- `docs/GAME_STRATEGY_MASTER_PLAN.md`
- `docs/IMPLEMENTATION_ROADMAP.md`
- `docs/SPRINT_DEPENDENCY_GRAPH.md`
- `docs/AGENT_EXECUTION_GOVERNANCE.md`
- `docs/CLOUD_EXECUTION_PLAN.md`

Current strategic priority: build the core game loop from claimed land toward settlement/city/nation/empire. Do not let map polish consume core-loop production unless it blocks first-impression comprehension.
<!-- END_PN_PRODUCTION_OS_V1_0_CURRENT_STATE -->



<!-- PN_PRODUCTION_OS_STATUS_ALIGNMENT_V1_0_1 -->
## Production OS v1.0.1 status alignment

Production OS v1.0 is accepted as the active strategy-to-execution rail.

Current next strategic steps:

1. Keep the repo clean and public QA green.
2. Prepare Cloud Execution Plan v0.1 so future execution can move off the local MacBook.
3. Build Core Game Loop v0.8.1 only under Production OS rails.
4. Keep map/globe polish classified as visual debt unless it blocks first-impression comprehension.

Agent/Cursor execution remains blocked until a reviewed execution spec exists with:

- scope and allowed files,
- forbidden actions,
- validation commands,
- cost mode and stop condition,
- failure recovery path,
- required result ZIP.
<!-- END_PN_PRODUCTION_OS_STATUS_ALIGNMENT_V1_0_1 -->

<!-- PN_LOW_TOUCH_AUTONOMOUS_CURRENT_STATE_V1_1 -->
## Low-touch autonomous production direction

The user wants fewer micro-checkpoints and less manual report/command copying.

Active direction:

- move toward cloud/headless execution away from the local MacBook,
- use larger autonomous batches with strict stop conditions,
- checkpoint the user only for critical product, cost, quality, security, or scope decisions,
- preserve Production OS rails and public QA gates,
- avoid unbounded “build everything” prompts.

Next strategic step remains Cloud Execution Plan v0.1, but it must now optimize for low-touch batch execution and exception-based user checkpoints.
<!-- END_PN_LOW_TOUCH_AUTONOMOUS_CURRENT_STATE_V1_1 -->

<!-- PN_CLOUD_HEADLESS_CURRENT_STATE_V0_1 -->
## Cloud/headless execution bootstrap v0.1

The project is moving away from local MacBook micro-execution toward controlled cloud/headless batches.

Current active infrastructure target:

- GitHub remains source of truth.
- Cloud dev environment should use `.devcontainer/devcontainer.json`.
- GitHub Actions should run build/smoke validation through `.github/workflows/pn-ci.yml`.
- Future agent runs should use `docs/AUTONOMOUS_BATCH_EXECUTION_TEMPLATE.md`.
- Future cloud/headless operations should follow `docs/CLOUD_HEADLESS_EXECUTION_RUNBOOK.md`.

Next intended production step after this bootstrap:

1. Confirm CI/devcontainer readiness.
2. Prepare the first low-touch cloud/headless batch spec.
3. Execute Core Game Loop v0.8.1 as a bounded batch, not as local micro-patches.

User checkpoints should be minimized and reserved for critical product, cost, quality, security, or scope decisions.
<!-- END_PN_CLOUD_HEADLESS_CURRENT_STATE_V0_1 -->

## Hybrid Agent Rails v1.2

Current execution strategy: combine GitHub-native agents/Actions for governance and PR workflow with Cursor CLI/headless as the preferred scoped implementation executor in cloud environments. The next implementation batch is Cloud Batch 0.8.1 — Core Game Loop Spine. Local MacBook execution is fallback only.

<!-- PN_PIPELINE_V1_3_CURRENT_STATE -->
## Production pipeline v1.3 accepted

Status: ACCEPTED / MERGED TO MAIN

PR #3 — Autonomous Production Pipeline v1.3 — is merged into `main`.

Accepted production capability now includes:

- GitHub Actions CI split into build, bounded smoke, and manual screenshot QA.
- Durable agent reports under `reports/agent/`.
- Smoke result gate for mechanical CI recovery.
- AM/PM low-touch review protocol.
- Branch/PR workflow as the default production path.

This resolves the immediate pipeline blocker that prevented safe continuation of Core Game Loop v0.8.1.

## Current active product priority

The next product sprint is:

Core Loop Recovery v0.8.1.1

Goal:
Recover the gameplay/core-loop work from PR #1 onto the fresh `main` after PR #3, while preserving the accepted pipeline and excluding stale workflow changes.

Current PR #1 status:

- PR #1 remains a historical gameplay batch/draft.
- It is stale after PR #3 and must not be merged directly.
- It should be used as a source/reference for gameplay/core-loop files only.

Allowed next work:

- restore the objective spine and core-loop gameplay clarity,
- keep the player path land → settlement/city → nation → empire understandable,
- validate with build, bounded smoke, and PR CI.

Forbidden next work:

- workflow rewrites,
- map/globe polish unless a severe comprehension blocker appears,
- backend/database/auth/payment/crypto/wallet/token/NFT,
- new dependencies unless separately justified.

## User involvement model

The user remains product owner and creative/product reviewer, but should not be used as terminal operator or micro-click executor except where tool permissions or safeguards make a click unavoidable.

Default operating mode:

- ChatGPT leads strategy, QA, scope, cost, and tool choice.
- Cursor/agent executes only scoped prompts.
- GitHub remains source of truth.
- User reviews milestone outcomes, product feel, and direction at low frequency.
- Non-blocking polish notes may be collected and fixed at a later consolidation point if they do not block further product development.
<!-- END_PN_PIPELINE_V1_3_CURRENT_STATE -->
