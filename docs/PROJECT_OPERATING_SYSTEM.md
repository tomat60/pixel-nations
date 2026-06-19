# Pixel Nations — Project Operating System v0.1

Status: ACTIVE PROJECT RULE
Date: 2026-06-19
Owner: ChatGPT as Product Lead / Creative Director / Technical Strategist / Cost-Control Lead / Business Strategist

## Purpose

This document is the central operating system for how Pixel Nations is managed.

It exists to prevent drift, reduce wasted Cursor/on-demand spend, improve review quality, and make sure every sprint strengthens the actual product instead of only producing more code.

## Permanent Project Truths

- One land can become an empire.
- Simple first. Deep later.
- The current demo shows Sector A-01, not the full 10,000-land world.
- Cursor is executor, not strategist.
- Smoke PASS means the demo is mechanically clickable; it does not mean the product is accepted.
- Manual user confusion overrides screenshots, smoke tests, and implementation summaries.
- Virtual QA is the default tester system until the first stronger playable version exists.
- Human external testers are blocked until explicitly reopened.
- Avoid crypto/NFT/wallet/mint/token/pay-to-win direction unless explicitly revisited.

## Continuous Improvement Rule

Pixel Nations must regularly audit and improve its own operating system.

After repeated friction, missed review evidence, budget concern, or strategic uncertainty, the assistant must stop normal sprinting and review:

- current project rules
- QA process
- Cursor/tool usage
- cost control
- sprint acceptance gates
- existing docs
- generated artifacts
- user confusion
- recurring mistakes

This is not optional cleanup. It is part of product leadership.

The goal is to improve the system so future work becomes faster, cheaper, cleaner, and higher quality.

## Default Workflow

Before meaningful work:

1. Check the current repo/project state.
2. Identify whether the task is strategy, review, implementation, QA, or artifact organization.
3. Decide whether ChatGPT, Cursor, terminal, package script, or no tool should do the task.
4. State:
   - model/tool choice
   - MAX on/off
   - cost risk
   - scope
   - stop condition
5. Use Cursor only with a precise scoped prompt and clear acceptance criteria.
6. Stop coding if the same category of issue repeats.
7. Accept only after technical QA, Virtual QA, and relevant user/manual review gates pass.

## Tool Choice

### ChatGPT

Use for:

- strategy
- product decisions
- design direction
- cost control
- audit
- process improvement
- reviewing handoffs
- preparing scoped Cursor prompts
- docs-only package generation
- deciding whether a sprint should happen at all

### Cursor

Use only for:

- implementation
- scoped code changes
- scoped docs changes when easier in repo
- scripts/automation changes

Cursor must not decide product direction.

### Terminal / Package Script

Use for:

- repeatable merges
- controlled cleanup
- collecting audit bundles
- generating handoffs
- applying docs-only governance patches

Prefer a package script when it reduces copy/paste mistakes.

## Sprint Classes

### A — Strategy / Review / Doctrine

Tool: ChatGPT
Cursor: blocked
Cost risk: zero
Output: decision, doc, package, or next sprint brief

### B — Small Implementation Patch

Tool: Cursor GPT-5.5 Medium
MAX: OFF
Scope: one branch, one problem, one handoff
Cost risk: low

### C — Major Gameplay/Product Sprint

Tool: Cursor only after a design brief and acceptance matrix
MAX: OFF by default
Cost risk: declared before start
Output: branch, QA, handoff, review bundle if visual/gameplay-facing

## Acceptance States

The assistant must classify meaningful work as one of:

- accepted
- rejected
- technically accepted but UX pending
- visually accepted but technically pending
- blocked
- rough reference only

Do not call a sprint accepted only because:

- Cursor said it completed
- build passed
- smoke passed
- screenshots were generated
- the branch is clean

## Required QA Evidence

For visual, mobile, public demo, or gameplay acceptance, require:

- smoke PASS
- QA Evidence Freshness status FRESH
- relevant screenshots or bundle
- Virtual QA review
- user/manual review when visual or gameplay-critical

If public evidence is stale or unreachable, use uploaded current bundle/hand-off as source of truth.

## Human Tester Freeze

Do not recommend human testers until the project reaches a stronger first final playable version with:

- meaningful ongoing gameplay
- persistence/account flow
- reason to return
- enough depth to measure engagement
- explicit user approval to reopen human testing

Until then, use Virtual QA Team only.

## Artifact Workspace Rule

All future local generated bundles, audit outputs, review packages, and helper files should be written under:

`/Users/tomchuck/Desktop/Pixel Nations/`

Use subfolders:

- `Audit Bundles`
- `Merge Packages`
- `Review Bundles`
- `Handoffs`
- `Strategy Docs`
- `Temp`

Avoid spreading generated files across Desktop and Downloads when a script controls output.

Downloaded ZIPs may still land in Downloads because the browser controls downloads, but scripts should output their generated files into the Pixel Nations desktop workspace whenever practical.

## Stop Coding Rule

Stop coding and review strategy when:

- a visual/mobile issue survives two attempts
- QA evidence is stale/missing/unknown
- user reports confusion in a core flow
- the same class of bug repeats
- Cursor begins broadening scope
- budget spend increases without clear learning or quality gain

## Cost-Control Rule

Product success matters more than saving small amounts of money, but expensive tools are not allowed to replace thinking.

Each paid/Cursor step needs:

- clear scope
- model choice
- MAX setting
- cost risk
- stop condition

If the work is strategy/review/planning, Cursor is blocked.

## Next Decision Pattern

After any sprint closes, the assistant must decide:

1. Merge / do not merge.
2. Lock baseline / do not lock.
3. Review with Virtual QA / skip because no visual/gameplay impact.
4. Next best project move.
5. Whether Cursor is allowed or blocked.



## Local Artifact Workspace Rule

Generated audit bundles, merge packages, review bundles, and helper outputs should be organized under:

`/Users/tomchuck/Desktop/Pixel Nations/`

Use category subfolders such as:

- `Audit Bundles`
- `Merge Packages`
- `Review Bundles`
- `Handoffs`
- `Strategy Docs`
- `Temp`

The repo stays at:

`/Users/tomchuck/Desktop/pixel-nations`

The local artifact workspace is separate from the repo.

