# Alliance Route Game Action v0.9.5

## Changed files

- `app/lib/game-state.ts`
- `app/alliance/create/page.tsx`
- `reports/agent/alliance-route-game-action-v0.9.5.md`

## Discovered alliance route path

- `app/alliance/create/page.tsx`

## What changed

- Added `formAllianceFromRoute` as a named local game-state action for the alliance creation flow.
- Rewired `/alliance/create` to call the named action instead of owning the large inline progression mutation.
- Preserved existing alliance choices, copy, UI, `SettlementState` shape, and `pixelNations.demoState.v1` localStorage write path.
- Kept `/world`, `/settlement/create`, and `/trade/create` behavior untouched.

## Validation results

- `npm run build`: first attempt blocked by missing `node_modules`; PASS after restoring locked dependencies with `npm ci`.
- `npm run qa:smoke`: first attempt blocked by missing Playwright Chromium; PASS after the allowed `npx playwright install chromium`.
- `npm run pn:status`: ran with exit code 0; output reported `PUBLIC_QA_CHECK=FAIL` because the sprint working tree had local changes during implementation.
- `npm run qa:screens`: skipped; no UI change.

## Product verdict

PASS. A player can form an alliance through the existing `/alliance/create` flow, and demo progression still advances toward founding a nation while the route now uses a named game-state helper.

## Known debt

- Nation, empire, and expansion routes still own direct local state mutations.
- The local game-state layer remains a lightweight demo action layer, not a full rules engine.

## Next recommended sprint

- Route nation creation through a named game-state action/helper while preserving current alliance-to-nation progression.
