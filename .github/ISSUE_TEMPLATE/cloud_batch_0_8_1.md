---
name: Cloud Batch 0.8.1 — Core Game Loop Spine
about: Assign this issue to a cloud coding agent for the next implementation batch.
title: "Cloud Batch 0.8.1 — Core Game Loop Spine"
labels: ["agent-batch", "core-loop", "production-os"]
assignees: []
---

## Agent task

Read and follow:

- `docs/FINAL_PRODUCT_TARGET.md`
- `docs/GAME_STRATEGY_MASTER_PLAN.md`
- `docs/IMPLEMENTATION_ROADMAP.md`
- `docs/SPRINT_DEPENDENCY_GRAPH.md`
- `docs/AGENT_EXECUTION_GOVERNANCE.md`
- `docs/AUTONOMOUS_PRODUCTION_PROTOCOL.md`
- `docs/HYBRID_AGENT_EXECUTION_ARCHITECTURE.md`
- `docs/AGENT_ROLE_MATRIX.md`
- `docs/CLOUD_BATCH_0_8_1_SPEC.md`

Implement the batch described in `docs/CLOUD_BATCH_0_8_1_SPEC.md`.

## Critical constraints

Do not rebuild the map/globe. Do not add backend/database/auth. Do not add crypto/NFT/wallet/token mechanics. Do not add dependencies unless you stop and justify. Do not make broad visual redesigns.

## Validation

Run:

```bash
npm run pn:cloud-ready
npm run build
npm run qa:smoke
npm run qa:screens
npm run qa:smoke
npm run pn:handoff
npm run pn:report
```

## Required PR/report

Create a branch/PR or report with:

- changed files
- player-facing summary
- validation results
- screenshots/QA evidence status
- risks and limitations
- next recommended batch

Stop after milestone-ready output or blocker. Do not continue into a new feature batch.
