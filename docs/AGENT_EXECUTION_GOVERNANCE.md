# Pixel Nations — Agent Execution Governance v1.0

Status: ACTIVE EXECUTION RAIL  
Purpose: define how Cursor/headless/cloud agents may work without creating chaos or uncontrolled cost.

## Core principle

Agents execute approved strategy. They do not invent product direction.

## Default agent role

The agent may:

- inspect repo state
- implement a scoped sprint
- run validation
- create a report ZIP
- stop with blocker evidence

The agent may not:

- rewrite product strategy
- change monetization direction
- introduce crypto/NFT/wallet/token systems
- add paid services/secrets without approval
- bypass QA gates
- push broken main
- continue after repeated failure

## Model policy

Default Cursor model:

- GPT-5.5
- MAX OFF

MAX may be used only when:

- architecture/debug complexity justifies it
- scope is already frozen
- expected value exceeds cost risk
- stop condition is explicit

## Branch policy

Preferred future cloud workflow:

1. agent works on branch `agent/<sprint-id>`
2. agent opens PR or produces patch report
3. CI validates
4. ChatGPT reviews report
5. main merge happens only after acceptance

Until this is implemented, main branch work must be limited to small deterministic packages with clean gates.

## Required preflight

Before any agent run:

- read `docs/PROJECT_CURRENT_STATE.md`
- read `docs/README.md`
- read this document
- run `npm run pn:status`
- confirm current sprint from `docs/IMPLEMENTATION_ROADMAP.md`
- confirm dependencies from `docs/SPRINT_DEPENDENCY_GRAPH.md`

## Required output

Every agent run must produce:

- changed files list
- summary of implemented goal
- build result
- smoke result
- screenshot QA result if UI changed
- public QA result if deployed
- git status
- commit hash or patch files
- blocker list if not complete
- `pn-result-*.zip` or equivalent report package

## Cost control tiers

### Tier 0 — deterministic local script

Use for docs, simple patches, reports, cleanup, small UI copy.

### Tier 1 — Cursor GPT-5.5 without MAX

Use for scoped implementation when repo understanding matters.

### Tier 2 — Cursor MAX or expensive agent run

Use only for complex architecture/debugging after scope freeze.

### Tier 3 — cloud continuous agent

Use only after CI, branch policy, cost caps, and rollback are in place.

## Failure policy

After two failures in the same category:

- stop producing more patches
- create a failure analysis
- simplify the workflow
- decide whether the task belongs to terminal, Cursor, or no tool

## Human review policy

The user should not need to paste walls of terminal output or manually copy prompts. The preferred handoff is always a generated ZIP or PR/report artifact.

## Cloud execution readiness

Before moving work off MacBook:

- cloud environment selected
- secrets policy defined
- billing cap or budget alert configured
- CI validates build/smoke/screenshots
- agent branch policy exists
- report artifact workflow exists

No autonomous “build the whole game” run is allowed until these gates exist.
