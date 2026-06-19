# Pixel Nations — AI Ops Server Architecture v0.2

Status: STRATEGY LOCK / PRE-IMPLEMENTATION ARCHITECTURE
Date: 2026-06-19
Owner: ChatGPT as Project Commander

## Executive Decision

Pixel Nations should move toward a server-side AI Operations Command Center.

However, we will not jump directly into full autonomy.

The correct path is:

1. Local ops-report foundation.
2. Stable upload/latest files.
3. Server architecture lock.
4. Cheap VPS pilot.
5. Read-only/server-side reporting.
6. Safe operations automation.
7. Controlled Cursor execution.
8. Merge automation only with explicit gate approval.

## Why This Exists

The user should not be forced to:

- repeatedly remind ChatGPT to think strategically
- search manually for newest files
- paste long command outputs
- decide which AI/tool should act
- police Cursor budget alone
- manually track QA freshness
- manage repetitive handoffs

The system must increasingly automate this operational burden.

## Product Principle

Automation exists to improve project quality and decision quality.

Automation must not create uncontrolled coding, uncontrolled spending, or uncontrolled merges.

## Target System Name

Pixel Nations AI Operations Command Center

Short name:

PN Ops Command

## Core Architecture

User
→ ChatGPT Project Commander
→ PN Ops Command Server
→ Project Memory / QA / Budget / Sprint / Cursor / Merge agents
→ GitHub / Vercel / QA Evidence / Cursor CLI

## Relationship Between ChatGPT and Server Agent

The server agent does not get magical direct access to the ChatGPT app conversation.

Instead, it uses shared project memory:

- repo docs
- handoff files
- ops reports
- decision logs
- QA reports
- public evidence
- sprint briefs
- command protocols

The agent helps ChatGPT by producing structured briefings.

ChatGPT remains Project Commander for product/game/strategy decisions.

## Mutual Improvement Rule

The server agent must audit ChatGPT’s process.

ChatGPT must audit the server agent’s process.

Both must look for:

- repeated user frustration
- unnecessary manual work
- weak QA evidence
- stale reports
- unclear tool choice
- repeated Cursor spend
- unclear stop conditions
- drift from game vision
- missing project doctrine

When either side detects a process failure, the next step should be a process improvement, not another blind sprint.

## Agent Roles

## 1. Project Memory Agent

Responsibilities:

- read and summarize docs/
- maintain decision log
- detect contradictions
- surface outdated strategy docs
- remind ChatGPT of project truths

Blocked from:

- editing product code
- merging branches
- spending money

## 2. QA Evidence Agent

Responsibilities:

- inspect handoff.txt/json
- inspect QA freshness
- check smoke result
- check public QA evidence
- detect stale or missing screenshots
- prepare QA brief

Blocked from:

- accepting visual/gameplay work alone
- overriding manual user feedback

## 3. Budget Guardian

Responsibilities:

- block Cursor unless scoped
- enforce MAX OFF by default
- track paid model/tool risk
- preserve budget reserve
- require stop condition before execution

Blocked from:

- approving its own spend
- running paid tools automatically

## 4. Sprint Planner

Responsibilities:

- propose next best sprint
- compare alternatives
- draft Cursor prompts from locked briefs
- align work with game vision

Blocked from:

- choosing final strategy alone
- broadening scope during implementation

## 5. Cursor Executor

Responsibilities:

- run approved tasks through Cursor CLI/headless later
- operate only on branch
- produce changed files summary
- run QA commands
- stop on errors/scope expansion

Blocked from:

- editing main directly
- repeated autonomous retries
- running without clear prompt
- running without budget gate

## 6. Merge Gatekeeper

Responsibilities:

- verify clean branch
- verify smoke PASS
- verify evidence FRESH
- verify review status
- prepare merge package or controlled merge

Blocked from:

- merging without explicit approval
- ignoring stale evidence
- treating smoke PASS as product acceptance

## 7. Report Agent

Responsibilities:

- create daily/weekly ops brief
- create upload-ready latest report
- summarize blockers
- list recommended next decision

Blocked from:

- executing implementation tasks

## Autonomy Levels

## Level 0 — Read-Only

Allowed:

- clone/pull repo
- read docs
- read handoffs
- create ops report
- summarize project status

Blocked:

- code changes
- commits
- Cursor
- merge
- spending

## Level 1 — Safe Ops

Allowed:

- run pn:handoff
- run pn:ops-report
- run QA public evidence check
- generate reports
- package logs

Blocked:

- product code changes
- Cursor execution
- merge

## Level 2 — Branch-Only Maintenance

Allowed:

- create branch
- docs-only patches
- QA/reporting script patches
- automation improvements
- commit to branch

Blocked:

- main merge
- gameplay code
- paid Cursor without approval

## Level 3 — Controlled Cursor Execution

Allowed only after explicit approval:

- run Cursor headless for a precise task
- commit to branch
- run QA
- stop on scope creep

Blocked:

- repeated loops
- broad feature work
- direct main edits

## Level 4 — Merge Preparation

Allowed:

- prepare merge package
- verify gates
- recommend merge

Blocked:

- autonomous merge to main without explicit approval

## Level 5 — Autonomous Merge

Status: BLOCKED INDEFINITELY

This level is not allowed until the project has mature tests, mature server ops, stable review gates, and explicit user approval.

## Server Placement

A cheap VPS may be useful later.

The server does not need GPU.

The server should run:

- Node.js
- Git
- GitHub CLI if useful
- Playwright dependencies if needed
- Cursor CLI/headless later
- cron/systemd timers
- small API/service layer
- encrypted secrets

Provider and pricing must be checked live before purchase.

No provider or server size is locked by this document.

## Secrets and Access

Server secrets must be minimal.

Possible secrets later:

- GitHub token with least privilege
- OpenAI API key with strict budget
- Vercel token if needed
- Cursor auth if CLI/headless requires it

Rules:

- never hardcode secrets
- never commit secrets
- use environment variables
- keep readonly permissions where possible
- rotate if exposed
- log decisions, not secrets

## Required Files / Future Repo Additions

Future implementation may add:

- `scripts/pn-ops-report.mjs` — already exists
- `scripts/pn-server-ops-report.mjs`
- `scripts/pn-public-evidence-check.mjs`
- `ops/`
- `ops/agent-prompts/`
- `ops/command-log/`
- `ops/policies/`
- `docs/AI_OPS_SERVER_RUNBOOK.md`

Do not add these until v0.2 strategy is accepted.

## First Server Pilot Scope

The first VPS pilot should be read-only / safe ops only.

Allowed:

- pull repo
- run status
- run pn:ops-report
- run pn:handoff if environment supports it
- check public URLs
- write daily ops report
- expose or send a report file

Blocked:

- Cursor execution
- code writing
- merge
- direct deploy manipulation
- expensive model loops

## Daily Ops Brief Format

The server should produce:

- current branch
- working tree status
- last commits
- smoke status
- QA freshness
- public QA status
- latest known blocker
- cost risk
- suggested next action
- what is blocked
- what requires ChatGPT decision

## Cursor-on-Server Rule

Cursor can be moved to server later through Cursor CLI/headless if stable.

But Cursor is not the first thing to automate.

Order:

1. automate evidence
2. automate reporting
3. automate briefing
4. automate safe docs/script maintenance
5. only then automate Cursor execution

## Cost Rule

Server spend must be justified by reducing:

- manual time
- repeated prompts
- Cursor waste
- stale QA mistakes
- bad sprint setup

If server ops creates more work than it removes, pause.

## Next Best Step After This Doc

Do not buy server yet.

Next step should be:

`AI_OPS_VPS_PILOT_V0_1_RUNBOOK`

Only after:

- ops-report v0.2 stable upload workflow is accepted
- this architecture is committed
- public QA and handoff remain clean
- user confirms continuing toward VPS pilot

## Stop Condition

This architecture is accepted when:

- committed to main
- handoff clean
- no Cursor cost used
- next VPS step remains blocked pending explicit decision

