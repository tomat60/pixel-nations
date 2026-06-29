# World Map Gameplay Integration v0.10.1

## Changed files

- `app/world/page.tsx`
- `scripts/qa-smoke.mjs`
- `reports/agent/world-map-gameplay-integration-v0.10.1.md`

## Map gameplay behavior

- `/world` now reads, ticks, and persists the local playable engine state on a one-second clock.
- Claimed land displays a compact world HUD with resources, population, objective, active order timer/progress, and latest consequence.
- The owned land marker now responds to playable state: settlement level expands influence, housing adds growth rings/outpost, scouting adds nearby map marks, trade level reveals route pressure, and nation progress adds an influence ring.
- Existing claim flow, route progression, and `/play` remain intact.

## Actions exposed on world

- Gather Food
- Quarry Materials
- Build Housing
- Upgrade Settlement Core
- Scout Nearby Land

## Validation results

- `npm run build`: PASS after installing existing locked dependencies with `npm ci`.
- `npm run qa:smoke`: PASS after installing the missing Playwright Chromium browser with `npx playwright install chromium`.
- `npm run pn:status`: completed with exit code 0 after commit; internal `PUBLIC_QA_CHECK=FAIL` remains because the existing public handoff reports `Working tree: has changes` for `agent/map-interaction-foundation-v0.9`.

## Product verdict

Accepted for scoped map-first integration if validation passes: `/world` now exposes engine resources, queue state, direct map orders, and visible map consequences without turning into a full redesign.

## Known debt

- `/world` and `/play` still use separate UI layouts over the same local engine; a future pass can centralize shared HUD/action rendering if duplication grows.
- Settlement route progression and playable engine progression are connected visually on `/world`, but not fully reconciled into one canonical progression model.
- Public QA handoff status is stale/outside this sprint and still reports a dirty working tree despite this feature branch being clean after commit.

## Next recommended sprint

- Add a small world-state selector module that formalizes marker derivation across `/world`, `/play`, and future dashboard surfaces.
