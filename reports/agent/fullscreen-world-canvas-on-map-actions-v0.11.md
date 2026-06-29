# Fullscreen World Canvas and On-Map Actions v0.11

## Changed files

- `app/world/page.tsx`
- `scripts/qa-smoke.mjs`
- `reports/agent/fullscreen-world-canvas-on-map-actions-v0.11.md`

## On-map gameplay behavior

- `/world` now frames Sector A-01 as the primary playable canvas with a wider desktop layout.
- Desktop management/status panels are reduced to map HUD overlays; mobile keeps the existing detail panels as fallback.
- Unclaimed selected land shows an on-map claim card anchored to the selected tile.
- Claimed land shows a clickable map marker that opens a marker-adjacent action layer.
- Core progression and local playable-engine actions can be launched from the on-map action layer.
- Active order state is visible in the map HUD and in the marker action layer.

## Visual marker states

- Claimed land: gold core marker and selectable action anchor.
- Active order: conic progress ring around the claimed marker.
- Housing/outpost growth: small green city pixels around the marker.
- Settlement/core growth: larger core marker plus growth rings.
- Trade progress: route glow and marker trade line when trade level exists.
- Scout progress: nearby surveyed land dots from `landsSurveyed`.
- Nation progress: influence ring/aura when nation progress exists.

## Validation results

- `npm run build`: PASS.
- `npm run qa:smoke`: PASS after installing the existing Playwright Chromium browser required by the VM.
- `npm run pn:status`: ran; pre-commit output reported `PUBLIC_QA_CHECK=FAIL` because the working tree still had the scoped implementation changes.

## Product verdict

PASS. `/world` now reads more like the game surface: claim, orders, progress, marker growth, scout marks, trade, and HUD status are visible on or over the map instead of relying on a separate management card.

## Known debt

- On-map action placement is heuristic near map edges; a future pass can add collision-aware placement.
- Mobile keeps the existing fallback panels rather than a fully redesigned mobile radial menu.
- The visual marker language is still CSS/SVG prototype art, not final illustration.

## Next recommended sprint

Add a dedicated mobile on-map action tray and improve marker menu placement/animation without changing the local-only engine or route progression.
