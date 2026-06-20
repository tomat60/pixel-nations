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
