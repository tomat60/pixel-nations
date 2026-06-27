# Trade Route Game Action v0.9.4

## Changed files

- `app/lib/game-state.ts`
- `app/trade/create/page.tsx`
- `reports/agent/trade-route-game-action-v0.9.4.md`

## Discovered trade route file path

- `app/trade/create/page.tsx`

## What changed

- Added `establishTradeRouteFromRoute` as a named local game-state action for the trade route creation flow.
- Rewired `/trade/create` to call the named action instead of owning the large inline progression mutation.
- Preserved existing destination choices, copy, UI, `SettlementState` shape, and `pixelNations.demoState.v1` localStorage write path.
- Kept `/world` actions and `/settlement/create` behavior untouched.

## What was intentionally not changed

- No backend, database, auth, payment, package, dependency, or GitHub Actions changes.
- No visual redesign, map redesign, economy simulation depth, or broad route migration.
- No alliance, nation, empire, or expansion route migration.
- No `public/qa/latest/*` artifacts committed.

## Validation results

- `npm run build`: PASS after restoring locked dependencies with `npm ci`.
- `npm run qa:smoke`: first attempt blocked by missing Playwright Chromium; PASS after the allowed `npx playwright install chromium`.
- `npm run pn:status`: ran with exit code 0; output reported `PUBLIC_QA_CHECK=FAIL` because the sprint working tree had local changes during implementation.
- `npm run qa:screens`: skipped; no UI change.

## Product verdict

PASS. A player can establish trade through the existing `/trade/create` flow, and demo progression still advances toward alliance/nation while the route now uses a named game-state helper.

## Known debt

- Later alliance, nation, empire, and expansion routes still own direct local state mutations.
- The local game-state layer remains a lightweight demo action layer, not a full rules engine.

## Next recommended sprint

- Route alliance creation through a named game-state action/helper while preserving current alliance-to-nation progression.
