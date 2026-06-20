# Pixel Nations Docs Map

Status: ACTIVE  
Purpose: prevent old sprint briefs, runbooks, and one-off implementation notes from acting like current project instructions.

## Start here

For every new project session, read in this order:

1. `docs/PROJECT_CURRENT_STATE.md`
2. `docs/PROJECT_OPERATING_SYSTEM.md`
3. `docs/ASSISTANT_COMMAND_PROTOCOL.md`
4. `docs/QA_GOVERNANCE_PROTOCOL.md`
5. Any known issue relevant to the current task

Then run:

```bash
npm run pn:status
```

## Active source-of-truth docs

These documents can guide current decisions:

- `PROJECT_CURRENT_STATE.md` — current accepted state, blockers, next allowed action.
- `PROJECT_OPERATING_SYSTEM.md` — workflow, cost policy, QA discipline, tool policy.
- `ASSISTANT_COMMAND_PROTOCOL.md` — how ChatGPT should turn decisions into safe commands.
- `QA_GOVERNANCE_PROTOCOL.md` — QA and evidence rules.
- `VISUAL_QA_AND_PROMPT_GATE_PROTOCOL.md` — visual/prompt gate for design-sensitive work.
- `PUBLIC_QA_CHECK_COMMAND_V0_1.md` — public QA validation command.
- `BUDGET_AND_TOOL_GOVERNANCE.md` — Cursor/model/cost policy.
- `CURSOR_TASK_TEMPLATE.md` — safe Cursor prompt template.
- `GAME_VISION_MASTER_PLAN_V0_1.md` — long-term game vision. Strategy source, not an implementation order.
- `PRODUCT_SIMPLICITY_DOCTRINE.md` — simplicity-first product doctrine.
- `VISUAL_NORTH_STAR.md` — visual direction. Does not override user confusion or known issues.

## Known issues

Known issues are active constraints, not bugs to fix without a scoped sprint:

- `MAP_GEOGRAPHY_CONTINUITY_KNOWN_ISSUE.md`
- `MOBILE_MAP_FRAMING_KNOWN_ISSUE.md`
- `MAP_VISUAL_FAILURE_ANALYSIS.md`

## Runbooks and automation docs

Runbooks explain how to operate the project. They are not product strategy unless explicitly referenced by current state:

- `LOCAL_ARTIFACT_WORKSPACE.md`
- `PROJECT_AUTOMATION_LAYER.md`
- `AI_OPS_VPS_PILOT_V0_1_RUNBOOK.md`
- `AI_OPS_GITHUB_ACTIONS_PILOT_V0_1.md`
- `CURSOR_CLI_HEADLESS_PILOT.md`
- `PUBLIC_PREVIEW_QA_PROTOCOL.md`
- `QA_HANDOFF.md`
- `QA_REPORT.md`

## Historical sprint briefs and baseline locks

These documents preserve context but should not override current state:

- `WORLD_MAP_V7_SPEC.md`
- `WORLD_MAP_V7_EXECUTION_RUNBOOK.md`
- `WORLD_MAP_V7_REVIEW_RUBRIC.md`
- `WORLD_MAP_V8_IMPLEMENTATION_BRIEF.md`
- `WORLD_MAP_V8_FINAL_DIRECTION_LOCK.md`
- `WORLD_MAP_V9_BASELINE_LOCK.md`
- `WORLD_MAP_V9_ACCEPTANCE_NOTE.md`
- `DEMO_RELEASE_BASELINE_V0_1.md`
- `PUBLIC_DEMO_READINESS_REVIEW_V0_2.md`
- `NATION_V0_2_BASELINE.md`
- `EMPIRE_V0_2_BASELINE.md`
- `EMPIRE_V0_2_IMPLEMENTATION_BRIEF.md`
- `CORE_ENGINE_V0_3_STRATEGY_BRIEF.md`
- `VISUAL_GAMEFEEL_ENGINE_V0_4_STRATEGY_BRIEF.md`
- `LIVING_MAP_LAYER_V0_5_STRATEGY_BRIEF.md`
- `LIVING_MAP_V0_5_IMPLEMENTATION_PLAN.md`
- `SETTLEMENT_NATION_EMPIRE_CONTINUITY_V0_6_STRATEGY_BRIEF.md`

## Cleanup policy

Do not delete history casually. Historical documents are useful as context, but they must not pretend to be current instructions.

Preferred cleanup order:

1. Add current-state and docs-map clarity.
2. Add one deterministic status command.
3. Mark or archive historical docs only when repeated confusion appears.
4. Avoid large doc moves unless there is a clear repeated failure.

<!-- PN_REPORT_PACKAGE_WORKFLOW_V0_1 -->
## Result Package Workflow

Use this command whenever a result needs to be handed back to ChatGPT:

```bash
npm run pn:report
```

It writes a timestamped package to `reports/outbox/`, creates a ZIP, and reveals/selects the ZIP in Finder by default. Upload the ZIP instead of pasting terminal output or selecting the unpacked folder contents.

Optional:

```bash
npm run pn:report -- --open-folder
npm run pn:report -- --no-open
```

Use `--open-folder` only when you intentionally want the folder view instead of ZIP selection. Use `--no-open` for CI/headless runs.
<!-- END_PN_REPORT_PACKAGE_WORKFLOW_V0_1 -->

<!-- PN_PRODUCTION_OS_V1_0 -->
## Production OS v1.0 strategy rails

These documents define the current strategy-to-execution system. They are active source-of-truth rails and should be read before major implementation or agent/cloud work:

- `FINAL_PRODUCT_TARGET.md` — target for the first strong playable version.
- `GAME_STRATEGY_MASTER_PLAN.md` — product pillars, core loop, map strategy, monetization guardrails.
- `IMPLEMENTATION_ROADMAP.md` — phase order from current demo to first final playable version.
- `SPRINT_DEPENDENCY_GRAPH.md` — what must be complete before each sprint can start.
- `AGENT_EXECUTION_GOVERNANCE.md` — how Cursor/headless/cloud agents may execute work.
- `CLOUD_EXECUTION_PLAN.md` — migration path away from local MacBook execution.
<!-- END_PN_PRODUCTION_OS_V1_0 -->


<!-- PN_LOW_TOUCH_AUTONOMOUS_RAILS_V1_1 -->
## Low-touch autonomous production rail

`AUTONOMOUS_PRODUCTION_PROTOCOL.md` is an active source-of-truth rail for future cloud/headless agent execution.

Purpose:

- reduce user copy/paste busywork,
- prefer batch execution over micro-checkpoints,
- require user checkpoints only at critical product/cost/quality/security decisions,
- stop agent loops before they waste time or budget,
- preserve quality gates while allowing more autonomous execution.

This does not authorize a single unbounded “build the whole game” run. It authorizes bounded autonomous batches under Production OS rails.
<!-- END_PN_LOW_TOUCH_AUTONOMOUS_RAILS_V1_1 -->

<!-- PN_CLOUD_HEADLESS_BOOTSTRAP_V0_1 -->
## Cloud/headless execution bootstrap

Active cloud/headless execution docs:

- `CLOUD_HEADLESS_EXECUTION_RUNBOOK.md` — how future work moves away from local MacBook execution.
- `AUTONOMOUS_BATCH_EXECUTION_TEMPLATE.md` — standard format for low-touch agent batches.

Active automation files:

- `.devcontainer/devcontainer.json` — reproducible cloud dev environment.
- `.github/workflows/pn-ci.yml` — GitHub CI build/smoke validation.
- `scripts/pn-cloud-readiness.mjs` — readiness gate for cloud/headless execution.

This bootstrap does not authorize unbounded autonomous work. It prepares controlled cloud batches under Production OS and Low-Touch Autonomous rails.
<!-- END_PN_CLOUD_HEADLESS_BOOTSTRAP_V0_1 -->
