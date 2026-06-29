# Agent report — World Route Consolidation v0.11.1

- Branch: `agent/world-route-consolidation-v0.11.1`
- Implementation commit: `0b5faee`
- Issue: #27

## Changed files
- `app/world/page.tsx`
- `scripts/qa-smoke.mjs`
- `reports/agent/agent-report-world-route-consolidation-v0.11.1.md`

## What changed
- Replaced primary `/world` progression links to dashboard and downstream progression routes with map-local actions.
- Kept claim success, owned-land panel, mobile tray, and continue-progress CTAs on the world map.
- Added map-level pending messaging for later political progression after the trade seed.
- Updated smoke validation to exercise claim, on-map settlement, on-map city core, on-map trade seed, and pending political map layer without leaving `/world`.
- Bounded smoke runner cleanup and explicit exit so PASS/FAIL returns correctly.

## Validation
- `npm run build` — PASS
- `npm run qa:smoke` — PASS
- `npm run pn:status` — command exited 0; internal public QA check still reports a stale pre-existing handoff state (`agent/map-interaction-foundation-v0.9`, working tree marked as changes). No public QA artifacts were committed.

## PR status
- PR not opened per issue instruction: "Do not open PR or merge."
