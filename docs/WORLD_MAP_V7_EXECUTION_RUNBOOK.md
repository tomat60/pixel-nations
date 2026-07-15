# World Map v7 — Archived Runbook

**Status:** archived historical runbook.  
**Current active gameplay surface:** `/play`.  
**Do not use this file as the current Cursor/Fable handoff.**

This runbook was useful when `/world` was the active map sprint. That is no longer the current product structure. The playable game now lives on `/play`, and legacy routes redirect there.

See: `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`.

## What remains useful

The following guidance can still inform visual direction inside `/play`:

- Premium black/gold strategy tone
- Atlas / kingdom-map feeling
- Sector A-01 / Aurelian Basin as the demo window
- Honest 10,000-land world promise
- Stable tile interaction with no layout-shifting gimmicks

## What is superseded

Do not follow these old instructions for new implementation work:

- create a `sprint/world-map-v7` branch
- make `app/world/page.tsx` the primary implementation file
- treat `/world` as the player’s main route
- run a new visual-map pass detached from `/play`

## Current handoff rule

Before any new implementation sprint, define:

- product decision
- model/tool choice
- MAX on/off
- cost risk
- allowed files
- forbidden files/actions
- selectors/evidence
- validation commands
- stop condition

Default implementation surface: **`app/play/**`**.

## Validation rule

For current gameplay work, prefer:

- `npm run lint`
- `npm run build`
- `npm run qa:smoke`
- `npm run qa:expansion`
- Play Visual QA workflow
- dedicated evidence script when a new slice requires it

## Simple first. Deep later.
