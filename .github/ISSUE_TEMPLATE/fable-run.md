---
name: Fable run
description: Start a controlled Fable research or cursor prompt run
title: "FABLE RUN: cursor_prompts "
labels: ["fable", "research", "strategy"]
assignees: []
---

## Purpose

<!-- Describe the Fable research/prompt objective. Keep this no-code unless an implementation sprint was already approved. -->

## Source-of-truth order

Read/privilege these first:

1. `docs/FABLE_RUN_PROTOCOL.md`
2. `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`
3. `docs/ONE_PAGE_PRODUCT_BRIEF.md`
4. `docs/PRODUCT_SIMPLICITY_DOCTRINE.md`
5. `docs/PRODUCT_SCOPE_CUT.md`
6. `docs/AI_COST_CONTROL_CODEX.md`
7. Current `/play` code and active issues only as needed

Archived World Map v7 docs are visual/reference context only. They are not current implementation instructions.

## Required trigger check

This issue title must start with:

```text
FABLE RUN: cursor_prompts
```

After creation, immediately verify that a GitHub Actions bot comment appears:

```text
Fable run started.
Run: https://github.com/.../actions/runs/...
```

If no bot comment appears quickly, classify the issue as trigger-stalled. Do not wait passively.

## Scope

- Mode: research / strategy / prompt synthesis
- Production code: blocked unless explicitly approved elsewhere
- Branch/PR creation: blocked unless explicitly approved elsewhere
- MAX: off by default
- Cost risk: bounded

## Required output

Return a structured report with:

1. Executive verdict
2. Accepted ideas
3. Rejected ideas
4. Rough references
5. Next bounded sprint recommendation
6. Allowed files/categories for any future implementation
7. Forbidden actions
8. Required selectors/evidence
9. Validation commands
10. Stop condition

## Hard boundaries

Do not propose:

- crypto, NFT, wallets, minting, tokens, or pay-to-win;
- backend/database/auth/accounts;
- multiplayer;
- full economy simulator;
- full combat simulator;
- broad visual rewrite detached from `/play`;
- production code in this run;
- new packages;
- full rewrite.
