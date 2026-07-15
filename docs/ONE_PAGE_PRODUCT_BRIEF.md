# Pixel Nations — One Page Product Brief

## What It Is

Pixel Nations is a **premium player-built strategy world** where every city, nation, and empire begins with **one claimed land**.

## Core Fantasy

**One land can become an empire.**

## Current Source of Truth

The current playable game is **`/play`**.

Legacy routes such as `/world`, `/dashboard`, `/settlement`, `/nation`, and `/empire` are no longer active product surfaces. They may exist only as compatibility redirects or archived historical context.

See: `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`.

## Simple Player Arc

1. **Claim land**
2. **Found a settlement / city seed**
3. **Create a nation**
4. **Declare an empire**
5. **Survive crisis and answer the rival**
6. **Become part of the world’s first history**

## World Truth

| Concept | Value |
|---------|-------|
| Full world grid | **100 × 100** lands |
| Total lands | **10,000** |
| Current playable demo | **Sector A-01 / Aurelian Basin** |
| Current active route | **`/play`** |

- **Sector A-01 is not the full world.**
- The **Atlas** represents the full world promise.
- The playable demo is the first bounded window into that world.

## Product Tone

- Premium
- Strategic
- Cinematic
- Concise
- Black / gold
- Atlas · kingdom map · grand strategy feeling

## Not This

Pixel Nations is **not**:

- NFT land sale
- Crypto game
- Marketplace
- Pixel ad board
- Pay-to-win strategy game
- Full simulator yet
- Generic SaaS dashboard

## Core Message

**“Choose where your history begins.”**

## Key Line

**“History will remember the first.”**

## MVP Goal

The **first few minutes** should make a player feel:

> “I chose one land, founded a settlement, created a nation, declared an empire, and saw history remember my choices.”

## Current Priority

Make **`/play`** understandable, impressive, and testable as the full vertical slice:

```text
land → settlement/city → nation → empire → crisis → rival consequence
```

Before adding new systems, protect this route from confusion, stale docs, duplicate routes, and unclear onboarding.

## Before First Tests

### Do

- Keep `/play` as the only active gameplay surface
- Make the first-run path understandable without narration
- Preserve the premium black/gold atlas tone
- Keep QA evidence and selectors current
- Improve mobile usability only when it affects the playable slice

### Do not

- Payments
- Marketplace
- Accounts
- Combat simulator
- Full economy
- Multiplayer
- Real backend ownership
- Crypto / Web3 language
- Reopen old `/world` / `/dashboard` route work unless explicitly scoped
