# Pixel Nations — AI Ops VPS Pilot v0.1 Runbook

Status: PRE-SERVER PILOT RUNBOOK
Date: 2026-06-19
Owner: ChatGPT as Project Commander

## Executive Decision

The AI Ops server direction is accepted, but the first VPS pilot must be conservative.

The first server pilot is not a full autonomous AI worker.

The first server pilot is a read-only / safe-ops command node that can:

- clone/pull repo
- inspect current state
- run ops report
- run public QA checks where safe
- generate a daily/weekly briefing
- prepare structured evidence for ChatGPT
- reduce manual file hunting and repeated user prompting

It must not:

- run Cursor automatically
- merge to main
- spend API budget in loops
- perform broad code changes
- replace ChatGPT final project decisions

## Purpose

The VPS pilot exists to remove repetitive operational work from the user’s MacBook and create a stable project command layer.

It should improve:

- decision quality
- QA evidence freshness
- Cursor budget discipline
- handoff/report automation
- user responsiveness
- project memory quality
- ChatGPT briefing quality

## Required Before Buying Server

Server purchase remains blocked until these are true:

- `docs/AI_OPS_SERVER_ARCHITECTURE_V0_2.md` exists.
- `npm run pn:ops-report` works locally.
- `UPLOAD_THIS_OPS_REPORT.md` stable latest-file workflow works.
- Main is clean.
- Smoke is PASS.
- Evidence is FRESH.
- A live provider/pricing/security check is completed before purchase.
- User explicitly approves moving to VPS.

## Recommended Pilot Level

Start at:

# Autonomy Level 0 → Level 1

## Level 0 — Read-Only

Allowed:

- install system dependencies
- clone repo
- pull main
- read docs
- read handoff
- run git status
- create ops report if dependencies are available

Blocked:

- commits
- pushes
- Cursor
- code edits
- paid model calls unless explicitly approved

## Level 1 — Safe Ops

Allowed:

- run `npm run pn:ops-report`
- run `npm run pn:handoff` only if environment supports it safely
- run `npm run qa:public-evidence` if it does not mutate product state
- package report output
- create scheduled report logs

Blocked:

- product code changes
- branch creation
- Cursor execution
- merge
- deployment manipulation

## VPS Selection Criteria

The VPS should be cheap, boring, stable, and easy to rebuild.

Required:

- Linux
- SSH access
- Git
- Node.js LTS
- npm
- enough disk for repo and QA artifacts
- enough RAM for Node scripts
- systemd or cron
- environment variables/secrets support

Not required for pilot:

- GPU
- local LLM
- expensive CPU
- high RAM
- Kubernetes
- database
- complex dashboard

## Provider Rule

Do not lock provider or server type from memory.

Before purchase, do a live pricing/check using official provider pages.

Candidate providers may include:

- Hetzner
- DigitalOcean
- Render/Fly/Railway if a managed service is strategically better
- GitHub Actions for scheduled ops if sufficient
- Vercel scheduled functions if sufficient later

The cheapest stable option that meets pilot requirements should win.

## Security Rules

The pilot starts with minimum access.

Preferred first access:

- read-only GitHub access if possible
- no production secrets
- no deploy tokens
- no Cursor authentication
- no OpenAI API key until needed

When secrets become necessary:

- use environment variables
- never commit secrets
- least privilege
- rotate if exposed
- log access decisions

## File Layout on Server

Suggested server root:

`/opt/pixel-nations-ops/`

Suggested structure:

- `/opt/pixel-nations-ops/repo`
- `/opt/pixel-nations-ops/reports`
- `/opt/pixel-nations-ops/logs`
- `/opt/pixel-nations-ops/scripts`
- `/opt/pixel-nations-ops/env`

## Initial Server Setup — Conceptual

Do not execute until VPS is approved.

High-level steps:

1. Create VPS.
2. Create non-root deploy user.
3. Install Git and Node.js LTS.
4. Clone repo.
5. Install dependencies.
6. Run `npm run pn:ops-report`.
7. Verify report output.
8. Set scheduled report job.
9. Pull report to local or expose safe artifact.
10. Review with ChatGPT.

## Daily Report Goal

The server should produce one stable report:

`LATEST_SERVER_OPS_REPORT.md`

And one upload-ready file:

`UPLOAD_THIS_SERVER_OPS_REPORT.md`

The user should never hunt timestamped files.

## Daily Report Contents

Required:

- generated timestamp
- repo branch
- dirty/clean state
- last 10 commits
- smoke status if available
- QA evidence status if available
- public QA URL reachability if available
- stale evidence warning
- branch drift warning
- budget warning
- recommended next action
- blocked tools
- approval required items

## AI Agent Introduction Timing

Do not start with autonomous GPT agent.

Start with deterministic report scripts.

Then add API-based AI summarization only after reports are reliable.

Order:

1. deterministic server report
2. stable upload file
3. scheduled reports
4. API summarizer
5. Project Memory Agent
6. QA Evidence Agent
7. Budget Guardian
8. controlled Cursor executor

## Cursor-on-Server Timing

Cursor-on-server is blocked in v0.1 pilot.

Cursor-on-server may be considered only after:

- server reports are stable
- access/security is clear
- budget guardrails exist
- dry-run branch workflow exists
- tasks are limited to branch-only work
- user explicitly approves

## Success Criteria

The VPS pilot succeeds if it reduces manual work.

Minimum success:

- user no longer has to generate/find/upload multiple evidence files manually
- ChatGPT receives better current-state briefings
- no Cursor/API/server budget waste
- no dirty repo surprises
- report output is stable and predictable
- server can be rebuilt from runbook

## Failure Criteria

Pause or rollback if:

- setup takes too much time
- server reports are less useful than local reports
- costs grow without benefit
- secrets/security become unclear
- agent produces confusing decisions
- automation increases manual work
- Cursor automation starts drifting

## Next Step After This Runbook

After this runbook is committed and handoff is clean:

1. Do not buy server immediately.
2. Ask ChatGPT to perform live provider/pricing/security check.
3. Choose cheapest sufficient pilot option.
4. Create `AI_OPS_VPS_PILOT_SETUP_PACKAGE_V0_1`.
5. Only then set up the VPS.

## Stop Condition

This runbook is accepted when:

- committed to main
- handoff clean
- smoke PASS
- evidence FRESH
- no server purchased yet
- next step is live provider/pricing/security decision

