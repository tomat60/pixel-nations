# Fable Run Protocol

Pixel Nations uses Fable as a strategy/research assistant and prompt generator. Fable runs are useful only when they actually start. The trigger has failed before when the issue title did not match the expected pattern.

## Required trigger title

Every Fable issue title must start with exactly:

```text
FABLE RUN: cursor_prompts
```

Examples:

```text
FABLE RUN: cursor_prompts next play sprint
FABLE RUN: cursor_prompts Pixel Nations moonshot lab v2 after route cleanup
FABLE RUN: cursor_prompts post-crisis frontier payoff review
```

Do not use variants such as:

```text
FABLE RUN: Pixel Nations moonshot lab
FABLE RUN: strategy
Fable run: cursor prompts
```

## Required labels

Use these labels when available:

- `fable`
- `research` or `strategy`

Labels alone are not enough. The title prefix is the critical trigger.

## Immediate verification checklist

After creating a Fable issue, verify immediately:

1. The issue exists.
2. The title starts with `FABLE RUN: cursor_prompts`.
3. A GitHub Actions bot comment appears, usually:

   ```text
   Fable run started.
   Run: https://github.com/.../actions/runs/...
   ```

4. If no bot comment appears quickly, classify the run as **trigger stalled**.
5. Do not wait hours for a non-triggered issue.
6. Do not start implementation from an unverified Fable issue.

## Known failure record

Issue #151 failed to trigger because it used:

```text
FABLE RUN: Pixel Nations moonshot lab v2 after route cleanup
```

It was closed as `not_planned` and replaced by issue #153:

```text
FABLE RUN: cursor_prompts Pixel Nations moonshot lab v2 after route cleanup
```

The replacement issue immediately produced a GitHub Actions bot comment confirming that the Fable run started.

Earlier repo history also records the same lesson in issue #112: restoring the `FABLE RUN: cursor_prompts` title pattern fixed a missed Fable response.

## Fable output policy

A Fable output is never automatic implementation authorization.

Before any Cursor/Fable/Codex implementation starts, ChatGPT/Product Lead must filter the output into a bounded sprint with:

- accepted/rejected/rough-reference classification;
- goal;
- allowed files/categories;
- forbidden actions;
- selectors/evidence;
- validation commands;
- model/tool choice;
- MAX on/off;
- cost risk;
- stop condition.

## Hard boundaries

Fable must not directly authorize:

- production code;
- branch or PR creation;
- full rewrite;
- backend/database/auth/accounts;
- multiplayer;
- full economy or combat simulator;
- crypto, NFT, wallets, minting, tokens, or pay-to-win;
- broad visual redesign detached from `/play`.

## Source of truth

For Pixel Nations Fable runs, privilege:

1. `docs/FABLE_RUN_PROTOCOL.md`
2. `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`
3. `docs/ONE_PAGE_PRODUCT_BRIEF.md`
4. `docs/PRODUCT_SIMPLICITY_DOCTRINE.md`
5. `docs/PRODUCT_SCOPE_CUT.md`
6. `docs/AI_COST_CONTROL_CODEX.md`
7. current `/play` code and active issues only as needed

Archived World Map v7 docs are visual/reference context only, not active implementation instructions.
