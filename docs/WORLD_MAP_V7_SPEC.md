# World Map v7 — Archived Context

**Status:** archived historical spec.  
**Current active gameplay surface:** `/play`.  
**Do not use this file as the current implementation handoff.**

This document described an earlier phase where `/world` was intended to become the first major gameplay wow moment. That work helped define the atlas and premium map language, but the product has since moved to a unified `/play` route.

See: `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`.

## What remains useful

Keep these as visual and product references:

- Full world truth: **100 × 100 lands**, **10,000 total lands**
- Current demo truth: **Sector A-01 / Aurelian Basin**
- The visible demo is a window into the world, not the whole world
- Premium black/gold atlas and kingdom-map tone
- Avoid spreadsheet or dashboard vibes

## What is superseded

The following are no longer current source-of-truth instructions:

- “Make `/world` the first true gameplay wow moment”
- “Primary file: `app/world/page.tsx`”
- Dedicated `/world` claim flow work
- Dashboard, settlement, nation, and empire route continuity as separate active surfaces

Future work should improve `/play` unless a new product decision explicitly reopens a separate route.

## Current rule

If Fable, Cursor, Codex, or any agent reads this file, it must treat it as **reference only**.

Implementation prompts must start from:

- `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`
- `docs/ONE_PAGE_PRODUCT_BRIEF.md`
- current `/play` code and QA
- the active GitHub issue for the sprint

## Archived acceptance criteria

The old acceptance criteria are not deleted because they still explain what “premium atlas map” meant. They are no longer sufficient for current work.

Current acceptance depends on `/play` build, smoke, and Play Visual QA gates.
