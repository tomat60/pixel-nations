# Pixel Nations Docs Map

Status: ACTIVE
Updated: 2026-08-31
Purpose: keep agents on the current product state and durable whole-game strategy without reloading stale milestone history.

## Start here

For every new project session:

1. Run `npm run pn:status` when a checkout is available.
2. Read `docs/PROJECT_CURRENT_STATE.md`.
3. Read the accepted ADR relevant to the task.
4. Read root `AGENTS.md`.
5. If choosing/changing product direction, read `docs/GAME_STRATEGY_MASTER_PLAN.md`.
6. Read the active execution issue named in `PROJECT_CURRENT_STATE.md`.
7. Read only the operating/QA documents needed for the scoped task.

Do not begin from an old chat summary, an arbitrary open issue, `public/qa/latest`, or the most recently modified historical document.

## Authority order

When sources conflict, use this order:

1. `PROJECT_CURRENT_STATE.md`
2. accepted ADRs
3. root `AGENTS.md`
4. `GAME_STRATEGY_MASTER_PLAN.md` for durable whole-product direction and sequencing
5. active execution issue named by current state
6. exact-head evidence and merged PR for the current milestone
7. active operating and QA protocols
8. historical issues, PRs, briefs, runbooks, reports and generated evidence

A lower source cannot silently override a higher source.

## Important rule: do not duplicate the current milestone here

This file is a navigation map, not a second project-status document.

The active issue number, current milestone, product baseline, accepted head and next allowed action must live only in `PROJECT_CURRENT_STATE.md`. Historical milestone-specific guidance in older docs remains provenance, not current authority unless current state explicitly references it.

The durable build sequence belongs in `GAME_STRATEGY_MASTER_PLAN.md`, not in individual milestone briefs.

## Durable product/runtime interpretation

- Core fantasy: `one land -> settlement -> city -> nation -> empire`.
- Full logical world: 100 x 100 lands / 10,000 total.
- Current demonstration geography: Sector A-01 / Aurelian Basin.
- Godot is the target runtime under ADR-001.
- Next.js `/play` is a functioning bridge, mechanics reference and rollback surface, not production-final visual authority.
- Village, Map and World are views over one persistent physical geography.
- Village = HOW, Map = WHERE, World = WHY / SCALE / WHICH DIRECTION.
- Do not restart independent React/SVG/CSS geography as the final direction.
- No crypto, NFT, wallet, mint, token or pay-to-win direction unless explicitly reopened.

## Durable strategy documents

- `GAME_STRATEGY_MASTER_PLAN.md` — active whole-game production sequence and portfolio rules.
- `GAME_VISION_MASTER_PLAN_V0_1.md` — useful original Living Atlas vision; its old phase numbering is historical when it conflicts with the active strategy/current state.
- `ONE_PAGE_PRODUCT_BRIEF.md` — historical early brief; do not use its old `/play`-centric milestone sequencing as current authority.

This distinction prevents an older but still useful vision file from silently steering current implementation order.

## Active operating documents

Use the narrowest relevant document. Do not read every process file before a scoped implementation.

- `PROJECT_OPERATING_SYSTEM.md`
- `ASSISTANT_COMMAND_PROTOCOL.md`
- `PROJECT_OPERATING_RULES.md`
- `QA_GOVERNANCE_PROTOCOL.md`
- `VISUAL_QA_AND_PROMPT_GATE_PROTOCOL.md`
- `AI_COST_CONTROL_CODEX.md`
- `BUDGET_AND_TOOL_GOVERNANCE.md`
- `AGENT_EXECUTION_GOVERNANCE.md`
- `AUTONOMOUS_PRODUCTION_PROTOCOL.md`

These are rails, not milestone authority.

## Whole-product portfolio gate

A locally valid next feature is not automatically the best next project move.

When a trigger in `AGENTS.md` / `PROJECT_OPERATING_SYSTEM.md` fires, the steward must compare the next milestone against the biggest current bottleneck across progression/world, gameplay, UX, visuals/gamefeel, strategic depth, technical reliability and demo value.

The review should be lightweight and live in current state or the active issue. Do not create process ceremony merely to prove that a review happened.

## Evidence rules

`latest` in a path or filename is not proof of freshness.

Before relying on generated evidence, verify:

- branch/ref;
- exact commit SHA;
- viewport/state;
- relation to the active milestone;
- explicit visual/product verdict where required.

Green CI, smoke PASS and uploaded screenshots are regression evidence. They do not independently approve product direction or visual quality.

For visual/gamefeel work, prefer proof from the running game: deterministic headless captures, screenshots, short raw video and direct inspection. Compile success alone is not product proof.

## Issues and pull requests

- Open does not mean active.
- Draft does not mean current.
- A workflow start does not mean a valid result exists.
- The active issue must be named in `PROJECT_CURRENT_STATE.md`.
- ChatGPT/control-plane owns PR status, exact-head review, failed-check diagnosis and post-merge verification; the user is not the fallback monitor.
- Prefer one meaningful scoped product PR over a chain of tiny milestone PRs when the changes form one coherent visible outcome.
- Parallel agents/worktrees are allowed for genuinely isolated work or independent review, but overlapping edits to the same system should stay serialized.

## Current-state maintenance

`PROJECT_CURRENT_STATE.md` must be updated when the accepted milestone, active issue, product baseline, visual classification, blocker, phase or next allowed action changes.

Do not append a long timeline. Replace the current state while preserving at least:

- `Status`
- `Updated`
- `Current state revision`
- `Authority baseline SHA`
- `Product baseline SHA`
- `Current product phase`
- `Current milestone`
- `Active execution issue`
- `Next allowed action`

`npm run pn:status` is a structural/freshness check, not a substitute for semantic project ownership. A syntactically valid current-state file can still be stale if the milestone/phase changed and the file was not updated.

## Historical material

Historical files remain useful for provenance, lessons, rejected approaches and recovery. Do not delete them casually, but do not load them by default.

When historical material is used, state why it is relevant and which current authority permits it.

Rejected branches/candidates are reference only unless a later portfolio review explicitly reopens them.

## Key paths

| Area | Path |
|---|---|
| Current project authority | `docs/PROJECT_CURRENT_STATE.md` |
| Whole-game strategy | `docs/GAME_STRATEGY_MASTER_PLAN.md` |
| Runtime ADR | `docs/ADR_001_GODOT_DESKTOP_FIRST.md` |
| Agent rules | `AGENTS.md` |
| Project operating system | `docs/PROJECT_OPERATING_SYSTEM.md` |
| Godot project | `game/**` |
| Current playable bridge | `app/play/**` |
| Operating rules | `docs/PROJECT_OPERATING_RULES.md` |
| QA governance | `docs/QA_GOVERNANCE_PROTOCOL.md` |
| Cost controls | `docs/AI_COST_CONTROL_CODEX.md` |
| Status gate | `scripts/pn-status.mjs` |

## Reporting

Reports should state the exact branch/head, changed files, validation actually run, evidence actually inspected, acceptance classification, unverified items and the next allowed action.