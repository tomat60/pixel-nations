# Pixel Nations — Cloud Execution Plan v0.1

Status: ACTIVE PLANNING RAIL  
Purpose: move execution off the local MacBook without losing quality or cost control.

## Goal

Run Pixel Nations development, validation, and agent execution in cloud infrastructure while keeping GitHub as source of truth and ChatGPT as strategic gatekeeper.

## Recommended architecture

```text
GitHub repo
  ↓
Cloud dev environment / Codespace / VPS
  ↓
Cursor CLI or controlled coding agent
  ↓
CI build + smoke + screenshot QA
  ↓
Vercel public demo
  ↓
report ZIP / PR evidence back to ChatGPT
```

## Phase A — Strategy rails first

Before cloud execution:

- install Production OS docs
- define roadmap
- define dependency graph
- define agent governance
- verify repo clean

## Phase B — Cloud pilot

Use a low-cost cloud dev environment for one scoped task.

Pilot requirements:

- clone repo
- install dependencies
- run build
- run smoke
- run screenshot QA if browser dependencies work
- generate report artifact
- no secrets beyond required repo access

## Phase C — Agent pilot

Allow an agent to execute exactly one sprint on a branch.

Pilot requirements:

- branch name: `agent/<sprint-id>`
- no direct push to main
- stop on QA failure
- artifact report required
- cost/time limit set before run

## Phase D — Production workflow

Only after successful pilot:

- CI enforces validation
- PR review gate exists
- deploy preview exists
- cost monitoring exists
- rollback path exists

## Cost optimization rule

Do not choose the cheapest machine blindly. Choose the lowest-cost setup that completes validation quickly and reliably.

A faster machine can be cheaper if it reduces failed runs and waiting time. A bigger machine is waste if the bottleneck is unclear requirements or bad prompts.

## Current recommendation

Do not start with a long autonomous agent run. Start with:

1. Production OS docs.
2. Cloud pilot build/QA.
3. One branch-based agent sprint.
4. Review results.

## Blockers before autonomy

- no branch/PR policy yet
- no cloud cost cap documented
- no CI enforcement confirmed
- no agent rollback procedure
- current game loop still incomplete

## Success definition

Cloud execution is accepted when a cloud runner can:

- start from clean repo
- run the approved sprint
- validate results
- produce a report artifact
- stop cleanly on blocker
- avoid main branch damage
