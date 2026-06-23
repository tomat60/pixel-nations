# Agent report — Core Loop Recovery v0.8.1.1 start

- Branch: `agent/core-loop-recovery-v0.8.1.1-clean3`
- Source reference: PR #1 / `batch/core-loop-0.8.1`
- Base: current `main` after Production Pipeline v1.3 and current-state doc alignment

## Decision

Recover gameplay/core-loop changes only. Do not carry stale workflow changes from PR #1.

## Allowed gameplay source files

- `app/lib/demo-objective.ts`
- `app/components/DemoObjectivePanel.tsx`
- `app/dashboard/page.tsx`
- `app/settlement/page.tsx`
- `app/world/page.tsx`
- `app/page.tsx`

## Forbidden carry-over

- `.github/workflows/pn-ci.yml` from PR #1
- old CI stabilizer report files from PR #1
- backend/database/auth/payment/crypto/wallet/token/NFT
- map/globe polish unless it blocks comprehension

## Stop condition

Open a clean recovery PR with current pipeline preserved, then validate via GitHub CI.