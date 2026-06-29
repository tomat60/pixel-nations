# Playable Engine Slice v0.10

## Changed files

- `app/lib/playable-engine.ts`
- `app/lib/playable-state.ts`
- `app/play/page.tsx`
- `app/dashboard/page.tsx`
- `scripts/qa-smoke.mjs`
- `reports/agent/playable-engine-slice-v0.10.md`

## Engine behavior

- Adds a deterministic local-only playable engine with compressed 3-second resource ticks.
- Persists state under `pixelNations.playableState.v1`.
- Caps offline catch-up to 10 minutes.
- Supports a three-order queue with short timers, costs, completion effects, and recent log entries.
- Seeds first playable state from existing settlement demo state when available without changing the old demo state key.

## Playable actions

- Gather Food
- Quarry Materials
- Build Housing
- Improve Fields
- Upgrade Settlement Core
- Organize Council
- Open Trade
- Scout Nearby Land

## Validation results

- `npm run build`: PASS
- `npm run qa:smoke`: PASS after installing missing Playwright Chromium with `npx playwright install chromium`
- `npm run pn:status`: completed; pre-commit run reported the expected dirty working tree/public QA gate while this scoped change was still uncommitted

## Product verdict

The `/play` route now feels like a rough strategy command center: resources move, actions queue, timers advance, completions create visible consequences, and the current objective stays readable.

## Known debt

- Event choices are deterministic consequences only; branch-choice event UI remains future work.
- The playable state is local-only and intentionally separate from backend, multiplayer, combat, and market systems.
- Nation founding is represented as progress/objective, not a full founding flow in this sprint.

## Next recommended sprint

Add interactive event choices and a small nation-charter completion step once the command-center loop has been tested by players.
