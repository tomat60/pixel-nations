# Pixel Nations — Autonomous Batch Execution Template

Status: ACTIVE TEMPLATE  
Purpose: standard format for any future cloud/headless agent batch.

## Batch header

Batch ID: `<example: CORE_LOOP_V0_8_1>`  
Mode: `cloud supervised batch`  
Executor: `Cursor CLI/headless or approved coding agent`  
Model/mode: `<state exact model/mode>`  
MAX / high-cost mode: `OFF unless explicitly justified`  
Cost cap: `<hard dollar/time cap>`  
Expected duration: `<time box>`

## Product objective

State the player-facing outcome, not just file changes.

Example:

After claiming land, the player should understand how to found and begin developing a settlement, and should see how that path leads toward nation and empire.

## Strategic source docs

The agent must read these before implementation:

- `docs/PROJECT_CURRENT_STATE.md`
- `docs/FINAL_PRODUCT_TARGET.md`
- `docs/GAME_STRATEGY_MASTER_PLAN.md`
- `docs/IMPLEMENTATION_ROADMAP.md`
- `docs/SPRINT_DEPENDENCY_GRAPH.md`
- `docs/AGENT_EXECUTION_GOVERNANCE.md`
- `docs/AUTONOMOUS_PRODUCTION_PROTOCOL.md`
- `docs/CLOUD_HEADLESS_EXECUTION_RUNBOOK.md`

## Allowed scope

List exact files or directories.

Example:

- `app/dashboard/**`
- `app/settlement/**`
- `app/lib/**`
- `app/components/**`
- docs required by the batch

## Forbidden scope

Always include explicit forbidden actions.

Default forbidden actions:

- no crypto, NFT, wallet, mint, token, pay-to-win direction,
- no backend/database/secrets unless the batch explicitly allows it,
- no map/globe rebuild unless the batch is specifically a map sprint,
- no dependency installation unless justified in the batch plan,
- no broad visual redesign outside allowed files,
- no deleting history/docs without an archival plan,
- no new monetization implementation without legal/product review.

## Required validation

Minimum:

```bash
npm run pn:cloud-ready
npm run build
npm run qa:smoke
```

If UI changed:

```bash
npm run qa:screens
npm run qa:smoke
```

If public deploy/handoff is required:

```bash
npm run pn:handoff
npm run pn:public-check
npm run pn:report
```

## Repair budget

The agent may perform up to two focused repair attempts per failing gate.

After two failed attempts, stop and produce a blocker report with:

- failing command,
- exact error,
- attempted fixes,
- suspected cause,
- safest next options.

## Batch result format

One consolidated report only:

- objective achieved / not achieved,
- changed files,
- key gameplay/product changes,
- validation results,
- cost/time used,
- risks/debts introduced,
- exact commit/PR link if available,
- what needs user review.

## User checkpoint rule

The user should only be asked to intervene when a critical decision is needed, not for routine command execution.
