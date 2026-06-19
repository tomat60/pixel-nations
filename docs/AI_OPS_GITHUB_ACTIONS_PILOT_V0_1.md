# Pixel Nations — GitHub Actions Ops Pilot v0.1

Status: REMOTE OPS PILOT / NO SERVER PURCHASE
Date: 2026-06-19

## Executive Decision

Before buying a VPS, Pixel Nations should test a cheaper and simpler remote automation path:

# GitHub Actions Ops Report Pilot

This is not the final server-side AI command center.

This is a low-risk remote ops pilot that can run outside the user’s MacBook and generate an upload-ready ops report.

## Why GitHub Actions First

GitHub Actions can run repo automation remotely without buying or maintaining a VPS.

For the current need — current repo status, QA handoff summary, ops report artifacts — GitHub Actions is enough for a first remote pilot.

This reduces:

- MacBook dependence
- manual terminal use
- file hunting
- repeated state-check prompts
- premature server spend

## Scope

This pilot adds:

- `.github/workflows/pn-ops-report.yml`
- CI-compatible `scripts/pn-ops-report.mjs` output paths
- manual workflow trigger only

## Manual Trigger Only

The workflow starts as `workflow_dispatch` only.

It does not run automatically on a schedule yet.

Reason:

- avoid surprise cost
- avoid noisy artifacts
- validate one manual remote run first
- keep control before scheduling

## What The Workflow Does

1. Checkout repo.
2. Setup Node.js.
3. Install dependencies.
4. Run `npm run pn:ops-report`.
5. Upload report artifact.

## Output Artifact

GitHub Actions artifact:

`pixel-nations-ops-report`

Expected files include:

- `UPLOAD_THIS_OPS_REPORT.md`
- `LATEST_OPS_REPORT.md`
- `LATEST_OPS_REPORT.json`
- timestamped report files

## Allowed

- read repo
- install dependencies
- run deterministic ops report
- upload artifact

## Blocked

- Cursor CLI
- code changes
- commits
- pushes
- merge
- deploy changes
- API model loops
- secrets
- schedule automation until accepted

## Relationship To VPS Plan

This does not replace VPS forever.

It delays VPS purchase until proven necessary.

VPS becomes relevant later for:

- persistent command daemon
- Cursor-on-server
- scheduled multi-step ops
- server-side agent memory
- private dashboards
- self-hosted runners

## Acceptance Criteria

Accepted if:

- workflow appears in GitHub Actions
- manual run succeeds
- artifact contains `UPLOAD_THIS_OPS_REPORT.md`
- report is usable by ChatGPT
- no product code changes
- no Cursor cost
- no server cost

## Stop Condition

After this pilot is committed:

1. User runs the GitHub Action manually once.
2. User downloads/upload artifact report or provides result.
3. ChatGPT decides whether to schedule it, keep manual, or move to VPS setup.

