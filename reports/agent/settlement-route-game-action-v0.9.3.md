# Settlement Route Game Action v0.9.3

## Changed files

- `app/lib/game-state.ts`
- `app/settlement/create/page.tsx`
- `reports/agent/settlement-route-game-action-v0.9.3.md`

## What changed

- Added `foundSettlementFromRoute` as a named local game-state action for the settlement creation route.
- Moved the route's settlement founding state mutation out of `app/settlement/create/page.tsx`.
- Preserved the existing `SettlementState` shape, localStorage write path, settlement name validation, founder focus choices, copy, and UI.
- Kept the existing `/world` game actions intact.

## What was intentionally not changed

- No backend, database, auth, payment, package, dependency, or GitHub Actions changes.
- No visual redesign, map redesign, economy depth, AI, army, war, or diplomacy systems.
- No migration of trade, alliance, nation, empire, or other routes.
- No `public/qa/latest/*` artifacts committed.

## Validation results

- `npm run build`: PASS after restoring locked dependencies with `npm ci`.
- `npm run qa:smoke`: first attempt blocked by missing Playwright Chromium; PASS after `npx playwright install chromium`.
- `npm run pn:status`: ran; reports `PUBLIC_QA_CHECK=FAIL` because the sprint working tree has local changes and public QA handoff state is from an earlier branch.
- `npm run qa:screens`: skipped; no UI change and no suspected UI regression.

## Product verdict

PASS. A player can still create a settlement through the existing route, and the demo progression advances to the city core / Town Hall step while the route now uses a named game-state action.

## Known debt

- Other progression routes still own direct local state mutations and should migrate one route at a time.
- The local game-state layer remains a lightweight demo action layer, not a full rules engine.

## Next recommended sprint

- Route the trade creation page through a named game-state action/helper while preserving the current trade route demo behavior.
