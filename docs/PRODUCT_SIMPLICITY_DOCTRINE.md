# Pixel Nations — Product Simplicity Doctrine

This doctrine protects Pixel Nations from becoming too complex before the core fantasy is proven.

## North star

**One land can become an empire.**

Everything else is optional until that emotion lands.

## Current source of truth

The current playable game is **`/play`**.

Legacy routes are not active gameplay surfaces:

- `/world`
- `/dashboard`
- `/settlement`
- `/nation`
- `/empire`

See: `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`.

## Understandable in 10 seconds

A new visitor should grasp within **10 seconds**:

- There is a **finite world** of lands.
- They can **claim one land** and write history from it.
- That land can grow into a **settlement/city, nation, and empire**.
- The playable demo starts from **`/play`**.

If a feature cannot be explained in one breath, it is probably too early.

## Core fantasy

**One land can become an empire.**

Not: manage 47 systems, optimize yields, browse marketplaces, or juggle infrastructure.

The player is a **founder**, not an investor.

## Simple user path

The demo arc must stay obvious:

```text
claim land -> build settlement/city -> found nation -> rise into empire -> face consequence
```

Think broadly about the full game vision — **communicate simply** in the MVP. Strategy can be deep later; the **first experience must be obvious**.

## Pixel inspiration, not speculative language

The original “one tile matters” idea remains **inspiration for simplicity**:

- One land matters.
- Placement is permanent in the story.
- The first move defines the history.

Current product language must not sound like a financial or speculative land sale.

### Prefer

- Claim your first land
- Choose where your history begins
- Join the First Age
- Founder of {land}
- One land. One history.
- Enter `/play`

### Avoid

- token
- wallet
- mint
- NFT
- marketplace
- asset
- investment
- yield
- web3
- digital real estate

## MVP definition

**MVP is not a small version of the full game.**

MVP is the **smallest version of the emotion**:

> “I started with one land and created an empire.”

Ship feeling first. Systems second.

## Anti-complexity checklist

Before adding any feature, page, or system, answer **yes** to all that apply — or **cut / defer** the feature:

| # | Question |
|---|----------|
| 1 | Does this strengthen **land → settlement/city → nation → empire**? |
| 2 | Can a user understand it **without explanation**? |
| 3 | Is it **needed before first user tests**? |
| 4 | Does it preserve `/play` as source of truth? |
| 5 | Does it avoid speculative/financial framing? |
| 6 | Does it avoid pay-to-win framing? |
| 7 | Can it be done later without hurting the vertical slice? |

If (7) is “yes” and (3) is “no” → **defer**.

## How this connects to execution

- **Current route** — `/play` is the playable game.
- **Copy** — cinematic, minimal; see `docs/ONE_PAGE_PRODUCT_BRIEF.md`.
- **Agents** — no vague “improve everything” passes; see `docs/AI_COST_CONTROL_CODEX.md`.
- **Scope** — see `docs/PRODUCT_SCOPE_CUT.md` for what not to build yet.
- **Legacy route context** — see `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md` before using old `/world` docs.

## Simple first. Deep later.
