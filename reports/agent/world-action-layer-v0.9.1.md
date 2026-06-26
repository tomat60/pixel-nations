# World Action Layer v0.9.1

## Changed files

- `app/world/page.tsx`
- `reports/agent/world-action-layer-v0.9.1.md`

## What changed

- Added a map-context action layer on `/world` after land is claimed.
- Added direct map actions for:
  - Found first settlement
  - Build city core
  - Establish trade seed
- Actions write the shared local demo state used by dashboard, settlement, trade, and objective panels.
- Added stable QA hooks:
  - `data-qa="world-action-layer"`
  - `data-qa="world-action-found-settlement"`
  - `data-qa="world-action-build-city-core"`
  - `data-qa="world-action-establish-trade"`
  - `data-qa="world-action-feedback"`

## What was intentionally not changed

- No backend, database, auth, payment, package, dependency, or GitHub Actions changes.
- No full map/globe engine rewrite.
- No landing, dashboard, settlement, nation, or empire redesign.
- No generated `public/qa/latest/*` artifacts committed.

## Validation results

- `npm run build`: PASS
- `npm run qa:smoke`: PASS after installing missing Playwright Chromium
- `npm run pn:status`: ran; reports dirty tree before commit and stale public QA handoff state
- `npm run qa:screens`: PASS; generated artifacts restored before commit

## Product verdict

PASS. A claimed land can now progress settlement -> city core -> trade from the world/map context with immediate map feedback.

## Known debt

- Map actions use fixed demo defaults rather than a richer player choice flow.
- `pn:status` depends on handoff/public QA state outside this sprint scope.

## Next recommended sprint

- Add a lightweight map-context action for alliance/nation progression after trade is established.
