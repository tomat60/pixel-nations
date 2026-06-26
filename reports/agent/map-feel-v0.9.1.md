# Map Feel v0.9.1

## Changed files
- `app/world/page.tsx`
- `reports/agent/map-feel-v0.9.1.md`

## What changed
- Added a contained map response panel for selected and claimed land states.
- Added subtle selected-land overlay feedback with stable `data-qa` hooks.
- Strengthened selected/owned tile transitions without tile scaling or layout movement.
- Added small pulse/glow layers for claimed land, settlement, town hall, and trade route markers.

## Intentionally not changed
- No claim flow, persistence, routing, dashboard, landing, backend, auth, database, payment, package, or workflow changes.
- No dependencies added.
- No public QA artifacts committed.
- No map engine rewrite or full visual redesign.

## Validation results
- `npm run build` PASS after `npm ci` hydrated existing locked dependencies.
- `npm run qa:smoke` PASS after installing the missing Playwright Chromium artifact.
- `npm run pn:status` ran; it reported local changes/public QA gate block as expected during branch work.
- `npm run qa:screens` PASS; generated `public/qa/latest/*` artifacts were restored before commit.

## Product verdict
- Pass: the playable sector now gives clearer immediate feedback when land is selected or claimed, and progression markers feel more alive while staying readable and prototype-light.

## Known visual debt
- Marker animation still relies on existing global utilities, so future tuning should consolidate map motion tokens and reduced-motion behavior in one place.
- The playable sector remains grid-forward; a later sprint could improve atlas/sector terrain blending without changing interaction semantics.

## Next recommended sprint
- Map readability v0.9.2: refine terrain/route contrast and mobile marker stacking after visual review of the latest screenshot set.
