# Pixel Nations Docs Map

Status: ACTIVE
Updated: 2026-08-17
Purpose: prevent old sprint briefs, runbooks, generated handoffs, and open issues from acting like current instructions.

## Start here

For every new project session:

1. Run `npm run pn:status`.
2. Read `docs/PROJECT_CURRENT_STATE.md`.
3. Read the accepted ADR relevant to the task.
4. Read root `AGENTS.md`.
5. Read the active execution issue named in `PROJECT_CURRENT_STATE.md`.
6. Read any current milestone contract explicitly named by current state.
7. Read only the operating/QA documents needed for that task.

Do not begin from an old chat summary, an arbitrary open issue, `public/qa/latest`, or the most recently modified historical document.

## Authority order

When sources conflict, use this order:

1. `PROJECT_CURRENT_STATE.md`
2. accepted ADRs
3. root `AGENTS.md`
4. the active execution issue named by current state
5. current milestone contract explicitly referenced by current state
6. exact-head evidence and merged PR for the current milestone
7. active operating and QA protocols
8. historical issues, PRs, briefs, runbooks, reports, and generated evidence

A lower source cannot silently override a higher source.

## Current active chain

The current chain is intentionally explicit:

- current state: `PROJECT_CURRENT_STATE.md`
- runtime decision: `ADR_001_GODOT_DESKTOP_FIRST.md`
- agent rules: root `AGENTS.md`
- active execution issue: GitHub issue #415
- topology authority: `AURELIAN_BASIN_TOPOLOGY_V1.md`
- art-direction authority: `AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`
- accepted moodboard direction: `AURELIAN_BASIN_MOODBOARD_V1.md`
- accepted web product baseline: P11 / PR #422 / commit `c94423d5a9c60f1982ae2935551fc1905d46e719`
- current milestone: exactly one bespoke non-production Aurelian Village / Map / World visual target before any implementation reference

Older issues remain useful historical context only when a current authority explicitly references them.

## Active operating documents

These remain active as process or quality rails. They do not replace current product state:

- `PROJECT_OPERATING_SYSTEM.md`
- `ASSISTANT_COMMAND_PROTOCOL.md`
- `PROJECT_OPERATING_RULES.md`
- `QA_GOVERNANCE_PROTOCOL.md`
- `VISUAL_QA_AND_PROMPT_GATE_PROTOCOL.md`
- `AI_COST_CONTROL_CODEX.md`
- `BUDGET_AND_TOOL_GOVERNANCE.md`
- `AGENT_EXECUTION_GOVERNANCE.md`
- `AUTONOMOUS_PRODUCTION_PROTOCOL.md`

Use the narrowest relevant document. Do not read every historical strategy file before a scoped task.

## Runtime and product interpretation

- Godot is the target game runtime under ADR-001.
- Next.js `/play` is the functioning bridge, demo shell, mechanics benchmark and rollback surface until a Godot candidate passes its acceptance gates.
- P4-P11 mechanics/continuity are accepted in the web baseline.
- Current Village progression is a mechanically accepted benchmark, not authority to preserve its rejected bridge/geography.
- Current independent web Village/Map/World geography is not production-final visual authority.
- Current work is art direction only: one shared Aurelian Basin visual target under issue #415.
- Village, Map and World must be views of the same locked geography.
- No Godot/Blender Aurelian implementation is authorized before `ART_DIRECTION_PASS`.
- Do not restart broad React/SVG/CSS scene-engine development as final art.
- No P12 or unrelated feature expansion while #415 is active.

## Evidence rules

`latest` in a path or filename is not proof of freshness.

Before using generated evidence, verify:

- generated date;
- branch/ref;
- exact commit SHA;
- viewport/state;
- relation to the current milestone;
- explicit visual/product verdict where required.

`public/qa/latest/*` is a convenience output, not a permanent source of truth. `npm run pn:status` should classify it as current, stale, or unavailable.

Green CI, smoke PASS, generated screenshots, and a clean branch are regression evidence. They do not independently approve product direction or visual quality.

For the current #415 milestone, acceptance requires direct review of one bespoke Village / Map / World visual-target package against the locked topology, art-direction recovery brief and moodboard. The result must be exactly `ART_DIRECTION_PASS`, `ART_DIRECTION_CORRECTION_REQUIRED`, or `ART_DIRECTION_REJECT`. No implementation reference may start before PASS.

## Issues and pull requests

- Open does not mean active.
- Draft does not mean current.
- A brief does not mean execution happened.
- A workflow start does not mean a valid result exists.
- A Fable run is usable only after a final `VALIDATED_FABLE_OUTPUT` or another explicitly accepted result.
- A superseded issue or PR must not guide new work merely because it remains open.
- The active issue must be named in `PROJECT_CURRENT_STATE.md`.
- ChatGPT/control-plane owns PR status, exact-head review, failed-check diagnosis and post-merge verification; the user is not the fallback monitor.

## Historical material

Historical files remain valuable for provenance, lessons, rejected approaches, and recovery. Do not delete them casually.

They must not override the current chain. This includes, among other things:

- older World Map and Local Map version locks;
- Living Map / Continuity / Core Loop recovery briefs;
- old cloud-batch instructions;
- old Village SVG/CSS recovery plans;
- prior Command Room directions;
- stale QA handoffs and reports;
- rejected or rough-reference visual PRs;
- rejected Godot visual techniques, except where #415 explicitly permits reuse of behavior, licensed provenance or lessons learned.

When historical material is used, state why it is relevant and which current source authorizes its use.

## Current-state maintenance

`PROJECT_CURRENT_STATE.md` must be updated when the accepted milestone, active issue, product baseline, runtime interpretation, visual classification, blocker, or next allowed action changes.

Do not append another timeline to it. Replace the current state, while preserving the required authority header schema.

Required header fields are:

- `Status`
- `Updated`
- `Current state revision`
- `Authority baseline SHA`
- `Product baseline SHA`
- `Current milestone`
- `Active execution issue`
- `Next allowed action`

A rewrite that drops any required field is invalid even if the prose is otherwise current.

`npm run pn:status` must fail or warn clearly when:

- required authority fields are missing;
- baseline SHAs are invalid or not ancestors of the checkout;
- the current-state date is too old;
- the repository has moved materially beyond the recorded authority baseline;
- the `latest` handoff is stale.

`Pixel Nations CI` must run `npm run pn:status` on PR heads and `main` so a broken authority schema cannot merge silently.

## Handoff and report workflow

Use `npm run pn:report` when a local result package is needed.

A report package is an evidence transport mechanism. It does not become project authority unless the current state or active issue explicitly references it.
