# Vision Gameplay Slice v0.14

- Branch: `agent/vision-gameplay-slice-v0.14`
- Issue: #40

## Changed files
- `app/world/page.tsx`
- `public/qa/latest/*`
- `reports/agent/vision-gameplay-slice-v0.14.md`

## What changed
- Added a rough playable `/world` vision slice with a selected-land building placement ghost.
- Added housing, field, and quarry placement markers around the claimed land.
- Added settlement growth stage/readout and visible growth cluster markers.
- Added scout route motion, trade route motion, and first troop marker movement without combat systems.
- Expanded on-map playable actions to include fields and trade orders already present in the local engine.
- Updated the mobile-first `/world` viewport so the initial screen opens on the map canvas as the primary game surface.
- Moved longer mobile guidance/activity panels below the map-first surface and added compact in-map HUD/zoom controls.
- Kept claim flow, local storage persistence, and dashboard identity helpers unchanged.

## Evidence hooks
- `data-qa="world-building-placement-ghost"`
- `data-qa="world-placement-markers"`
- `data-qa="world-active-placement-ghost"`
- `data-qa="world-settlement-growth-stage"`
- `data-qa="world-settlement-growth-cluster"`
- `data-qa="world-scout-route-motion"`
- `data-qa="world-trade-route-motion"`
- `data-qa="world-first-troop-marker"`

## Validation
- `npm run build` — PASS
- `npm run qa:smoke` — PASS after installing missing Playwright Chromium and stopping the stale failed-smoke `next start`
- `npm run qa:screens` — PASS, 29 fresh screenshots regenerated
- `npm run qa:smoke` — PASS after screenshots
- `npm run pn:handoff` — PASS, local evidence fresh
- `npm run pn:status` — command exited 0; public QA check still reports deployed public handoff is older than local evidence

## PR status
- PR not opened per latest issue comment: "Do not open another PR or merge."
