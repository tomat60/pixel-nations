# Pixel Nations — AI Cost Control Codex

Production operating manual for AI/model usage on this project. **The main rule: no vague agent iterations.**

If a task cannot be stated with goal, files, acceptance criteria, and QA level — stop and write the spec first.

## Current source of truth

The active playable game lives on **`/play`**.

Agents must not infer product direction from legacy routes such as `/world`, `/dashboard`, `/settlement`, `/nation`, or `/empire`. Those routes are compatibility or archived context unless a later product decision explicitly reopens them.

See: `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`.

## Roles

### ChatGPT — Product Lead / Creative Director / Cost-Control Lead / Prompt Architect

ChatGPT owns:

- Product strategy and visual direction
- Scope definition before any Cursor/Fable run
- Prompt architecture: model, MAX, files, policies
- Cost-control decisions and stop rules
- Deciding whether Fable output is accepted, rejected, or rough reference

ChatGPT does **not** replace the human decision-maker. It prepares and filters handoffs the human can approve.

### Cursor — Executor, not strategist

Cursor owns:

- Implementing a scoped handoff in named files
- Running validation only per policy
- Reporting changed files, build status, QA status, and commit hash

Cursor does **not** own:

- Redefining product direction mid-task
- Broad repo exploration without a prompt
- Reopening legacy routes as active surfaces
- Repeated cosmetic loops until something “feels better”

### Fable / frontier moonshot — Strategic board, not production authority

Fable may be used for high-level direction, critique, roadmap options, or a no-code moonshot.

Fable does **not** own:

- Production implementation
- Merge authority
- Broad rewrites
- Spending more tokens because context is unclear

If Fable receives stale or contradictory repo context, fix the source-of-truth docs before rerunning.

### Human

Final approval on scope, merges to `main`, and meaningful spending decisions.

## Forbidden prompt types

Do **not** send these to Cursor, Fable, or any executor without rewriting:

| Bad prompt | Why it fails |
|------------|--------------|
| “Improve map” | No acceptance criteria; invites endless polish |
| “Make it better” | No measurable outcome |
| “Check everything” | Expensive audit; unrelated diffs |
| “Fix what you see” | Agent becomes strategist; scope explodes |
| “Build the whole game” | Produces overbuild, rewrite pressure, and token burn |

If you catch yourself writing one of these, stop and use the allowed task format.

## Allowed task format

Every implementation prompt should include:

```text
Model: [e.g. Cursor GPT-5.5 / standard agent / local]
MAX Mode: [ON | OFF — default OFF]

Goal:
[One sentence outcome]

Files in scope:
- path/to/file

Files out of scope:
- [explicit list]

Requirements:
- [numbered, testable]

Acceptance criteria:
- [numbered, verifiable]

Build policy: [required | skip — docs-only]
QA policy: [smoke | play visual QA | dedicated evidence | skip]
Commit policy: [branch only | draft PR | no commit]

Final report:
- changed files, what changed, build, QA, commit hash
```

## Model selection matrix

| Tier | Tool | Best for | Avoid |
|------|------|----------|-------|
| **ChatGPT / manual** | Human + ChatGPT | Strategy, specs, prompt design, cost decisions | Letting it drive unscoped implementation runs |
| **Cursor / standard agent** | Default executor | Scoped UI, bugfixes, docs, single-feature passes | Vague “make it better” loops |
| **Local AI** | Local models | Docs drafts, repo Q&A, tiny patches, analysis | Large multi-file refactors without review |
| **Cursor GPT / Codex / frontier** | Higher-cost models | Hard debugging, complex logic, one-shot critical fixes | Routine polish, broad exploration |
| **Fable / frontier moonshot** | Artifact-only strategic board | Directional breakthroughs, product deadlocks, architecture critique | Routine implementation, repeated reruns, merge authority |

**Default:** standard model with MAX **OFF**.

Escalate only when the handoff is clear and the cheaper path already failed once with a concrete blocker.

## Bounded moonshot exception

Use a frontier moonshot when cautious micro-iterations are unlikely to discover the product answer.

Allowed only when all are true:

1. The blocker is strategic, not cosmetic: core fun, play direction, first-session loop, or architecture of a major surface.
2. The run is artifact-only or branch/draft-only, with no merge/write authority over production code.
3. The prompt includes rich context, hard constraints, rejection criteria, and an explicit decision line.
4. Cost is capped before the run.
5. The output can be rejected without damaging `main`.
6. The active source of truth is named before the run: currently `/play`.

Rule of thumb: **bounded moonshot > endless cautious micro-iterations** when the project is stuck on what the game should be, not how many pixels to move.

Do not stack repeated expensive attempts. One strong moonshot, then product-lead synthesis, then one scoped implementation sprint.

## MAX Mode policy

- **Default: OFF**
- Turn **ON** only for:
  - difficult debugging with reproduction steps
  - complex cross-file logic where scope is already frozen
  - one bounded attempt — not an open-ended “try until good”

If MAX ON still yields weak output, **stop and fix the spec**.

## Build policy

| Change type | `npm run build` |
|-------------|-----------------|
| Code, config, UI, routing | **Required** before merge |
| Docs-only | **Skip** |
| Mixed docs + code | **Required** |

## QA policy

| Change type | QA |
|-------------|----|
| `/play` gameplay, state, route, or UI | **Play Visual QA + relevant script** |
| Mechanical gameplay sanity | **`npm run qa:smoke`** |
| Expansion/world-in-play logic | **`npm run qa:expansion`** |
| Docs-only | **Skip** |
| Logic-only with no visual change | **Smoke or dedicated test if risk exists** |

Do not modify `public/qa/**` unless QA was intentionally run.

## Commit policy

| Rule | Detail |
|------|--------|
| **Experiments** | Use branches or draft PRs; do not push weak WIP to `main` |
| **`main` stability** | `main` should build and represent a shippable demo state |
| **Code commits** | Only after appropriate validation passes before merge |
| **Docs-only commits** | Allowed without build, but still reviewed for contradictions |
| **Push** | Only when prompt explicitly asks or release is ready |

## Stop rules

Stop the agent run immediately if:

1. Too many files changed beyond scope
2. Cosmetic-only result when meaningful progress was requested
3. New dependencies without approval
4. Weak output would require another vague pass
5. Agent redesigns product direction without scope
6. Agent reopens legacy routes or ignores `/play` source of truth
7. Cost grows because the repo context is contradictory

## Simple first. Deep later.
