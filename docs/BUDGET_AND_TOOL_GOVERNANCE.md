# Pixel Nations — Budget and Tool Governance

Status: ACTIVE PROJECT RULE
Date: 2026-06-19

## Current Budget Context

Cursor On-Demand was enabled with a controlled budget.
The project has used part of that budget on real quality-protection work:

- mobile map framing
- QA governance
- virtual QA protocol
- QA evidence freshness
- public QA evidence publishing

These were justified because they reduced project risk and prevented future review mistakes.

## Cursor Conservation Mode

Until explicitly changed, Pixel Nations operates in Cursor Conservation Mode.

This means:

- Cursor is blocked for strategy.
- Cursor is blocked for open-ended review.
- Cursor is blocked for vague “improve everything” tasks.
- Cursor is allowed only for scoped execution.
- MAX is OFF by default.
- GPT-5.5 Medium is the default Cursor model for implementation.
- More expensive modes require explicit justification.

## Budget Allocation Rule

Remaining Cursor/on-demand budget should be protected as:

- emergency bug/blocker reserve
- one carefully scoped gameplay/UX sprint
- small automation patches only when they reduce repeated future cost

Do not spend paid Cursor budget on tasks ChatGPT can prepare or package for free.

## What Caused Previous Waste

The main avoidable costs came from:

- sending another prompt before the acceptance matrix was complete
- relying on stale or incomplete screenshots
- allowing Cursor to fix one visible piece without checking adjacent sections
- accepting smoke PASS as stronger evidence than it really was
- not forcing one-bundle review earlier

## Optimized Workflow

Before Cursor:

1. ChatGPT defines the product decision.
2. ChatGPT defines exact file scope.
3. ChatGPT defines acceptance criteria.
4. ChatGPT defines QA artifacts required.
5. Cursor executes once.
6. Cursor stops.
7. User uploads handoff/bundle.
8. ChatGPT reviews.
9. Only then merge or continue.

## Cursor Use Gates

Cursor is allowed when all are true:

- the problem is implementation, not strategy
- the scope fits one branch
- the files are limited
- success criteria are measurable
- stop condition is clear
- MAX is OFF unless justified
- the work improves product quality, learning, or probability of success

Cursor is blocked when:

- the user asks “what should we do?”
- the task is audit/review/strategy
- the evidence is stale
- the next step is unclear
- the same bug category already failed multiple times

## Package-First Rule

When possible, prefer a ChatGPT-generated package script over a Cursor sprint for:

- merges
- handoff cleanup
- collecting audit files
- docs-only governance updates
- repeated terminal operations

This reduces mistakes and costs $0 Cursor.

## Review Before Spend

Before spending Cursor/on-demand budget, the assistant must state:

- why Cursor is needed
- why ChatGPT/package cannot do it
- expected benefit
- cost risk
- exact stop condition

## Emergency Reserve

Always keep a reserve for:

- broken main
- public demo blocker
- mobile visual blocker
- QA artifact failure
- production deploy issue

Do not spend the reserve on speculative features.

