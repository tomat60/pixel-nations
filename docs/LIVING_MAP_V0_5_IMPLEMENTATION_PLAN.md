# Living Map v0.5 — Implementation Plan

Status: EXECUTION PLAN / NOT YET IMPLEMENTATION  
Owner: Product Lead / Game Designer / Cartography Lead / UX Director / Frontend Lead / Visual QA Lead / Prompt QA Lead / Cost-Control Lead  
Depends on: `docs/LIVING_MAP_LAYER_V0_5_STRATEGY_BRIEF.md`  
Cost posture: zero-Cursor first. Cursor remains blocked until this plan is reviewed.

## Decision

The first implementation slice for Living Map v0.5 should be:

> Trade Route Visibility + Owned Land Influence Pulse + Minimal Map Legend

This is the best first slice because it connects existing gameplay choices to visible world consequences without building the final 10,000-land geography engine.

## Why This Slice

Pixel Nations already has state for:

- claimed land,
- settlement founded,
- trade route established,
- trade route destination,
- alliance formed,
- nation founded,
- empire founded.

v0.5 should not add major new simulation. It should visually express the state that already exists.

## Source Areas To Inspect / Likely Change

These are the expected files based on current project structure and previous debug outputs.

### Primary

- `app/world/page.tsx`
  - playable sector map,
  - tile selection,
  - claimed / unclaimed states,
  - mobile claim tray,
  - best primary location for route/influence visual feedback.

- `app/lib/settlement-state.ts`
  - persistent local demo state,
  - state fields such as `claimedLandId`, `tradeRouteEstablished`, `tradeRouteDestination`, `tradeRoutes`, `allianceName`, `nationFounded`, `empireFounded`.

- `scripts/qa-screenshots.mjs`
  - must include screenshots for affected map states,
  - must support visual-gate evidence.

### Secondary

- `app/trade/create/page.tsx`
  - creates `tradeRouteEstablished`,
  - writes `tradeRouteDestination`,
  - source of the route target identity.

- `app/alliance/create/page.tsx`
  - writes alliance state,
  - may later feed diplomatic link visuals.

- `app/nation/create/page.tsx`
  - writes nation doctrine/name,
  - may later feed influence visuals.

- `app/nation/page.tsx`
  - reads nation state,
  - useful for ensuring world state remains coherent.

- `app/empire/page.tsx` or `app/empire/create/page.tsx` if present
  - empire state may later expand influence visuals.

- `app/page.tsx`
  - landing preview only if the public landing map must show simplified route/influence teaser.
  - For v0.5 first implementation, avoid touching landing unless necessary.

## Implementation Shape

### 1. World Map State Derivation

Add a small derived world-activity model in or near `app/world/page.tsx`.

Example conceptual fields:

- `hasClaimedLand`
- `hasSettlement`
- `hasTradeRoute`
- `tradeRouteDestination`
- `hasAlliance`
- `hasNation`
- `hasEmpire`

Do not create a new backend. Do not create a complex data engine yet.

### 2. Trade Route Visual

When `tradeRouteEstablished === true`, render one route line on the playable sector map.

Recommended behavior:

- route starts from owned/selected claimed land,
- route points toward symbolic destination direction,
- route is visibly different for Iron Coast / Ember Basin / Crownlands,
- route should be subtle: amber line, low opacity, maybe a slow pulse,
- route must not imply exact geography if the target is symbolic.

Preferred labels:

- `Trade Route: Iron Coast`
- `Trade Route: Ember Basin`
- `Trade Route: Crownlands`

Avoid:

- multiple fake routes,
- thick neon lines,
- misleading exact city positions,
- route crossing UI panels.

### 3. Owned Land Influence Pulse

When `claimedLand === true`, show a subtle influence/presence pulse around the claimed tile.

Intensity can increase by milestone:

- claimed land: small pulse,
- settlement founded: stronger but still restrained,
- nation founded: broader influence ring,
- empire founded: dignified strategic aura.

Keep it CSS-light.

### 4. Minimal Legend

Add a small map legend or chips near the playable map:

- Your land
- Unclaimed
- Claimed
- Trade route
- Influence

The legend must not crowd mobile.

### 5. Visual Copy / Explanation

Add one short explanatory line near the map if needed:

> Your decisions now leave visible traces on Sector A-01.

Keep it low-key and premium.

## Data Mapping

### Trade Destinations

Use existing trade destination values from `app/trade/create/page.tsx`:

- Iron Coast
- Ember Basin
- Crownlands

For v0.5, these can map to symbolic route targets inside Aurelian Basin.

Do not create final geographic truth yet. Use language like “route direction” or “regional route” if needed.

### Claim Tile

Use `claimedLandId` from settlement state to identify the owned tile.

If there is no claimed land:

- do not render influence pulse,
- do not render route,
- show normal claimable sector.

If there is claimed land but tile lookup fails:

- fallback to existing starter tile behavior,
- do not crash.

## Visual Invariants

These must hold:

- no text clipped by map frames,
- no route/overlay bleeds outside map container,
- no marker on obvious water for primary claimed tile,
- no layout shift hiding claim CTA,
- mobile claim tray remains usable,
- playable sector remains readable,
- no new landing hero/frame changes unless explicitly scoped.

## QA Requirements

Before merge:

- build PASS,
- smoke PASS,
- screenshot QA PASS,
- `pn:visual-gate` runs,
- handoff evidence FRESH,
- review bundle includes:
  - desktop world,
  - desktop world sector,
  - mobile world,
  - mobile world sector,
  - mobile world claim tray,
  - route/influence state after trade if supported,
  - landing screenshots only if landing touched.

Visual verdict must be explicit:

- Visual QA verdict: ACCEPTED / REJECTED / VISUAL DEBT
- Public evidence: FRESH / STALE / NOT REQUIRED
- Known issues updated: YES / NO / NOT REQUIRED

## Public Preview Rule

If v0.5 affects public-facing visuals significantly, use public QA evidence or a preview before merge.

Do not rely on user screenshots as the normal QA path.

## Cost Strategy

Cursor remains blocked initially.

Preferred sequence:

1. Create source collector for exact map/state files.
2. Assistant inspects files.
3. Assistant prepares deterministic patch if safe.
4. Run patch locally.
5. Review bundle.
6. Only if deterministic patch is unsafe, use one Prompt-QA-approved Cursor prompt.

## Cursor Permission

Cursor is not yet allowed.

Cursor may become allowed only after:

- exact source files are confirmed,
- implementation patch scope is too broad for safe package,
- Prompt QA passes,
- MAX OFF,
- model selected manually in Cursor UI,
- stop condition is limited to one branch and one implementation slice.

## Proposed Branch Name

If implementation begins:

`sprint/living-map-v0-5-first-world-activity`

## Recommended Next Artifact

Before implementation, create a source/evidence collector:

`pixel-nations-living-map-v0-5-source-inspection-bundle.zip`

It should collect:

- `app/world/page.tsx`
- `app/lib/settlement-state.ts`
- `app/trade/create/page.tsx`
- `app/alliance/create/page.tsx`
- `app/nation/create/page.tsx`
- `app/nation/page.tsx`
- empire files if present
- `scripts/qa-screenshots.mjs`
- current QA screenshots/report/handoff
- package scripts

Then assistant decides deterministic patch vs Cursor.

## Stop Rule

Stop immediately if implementation drifts into:

- full geography engine,
- map asset replacement,
- broad landing redesign,
- social/multiplayer systems,
- backend persistence,
- visual polish loop,
- Cursor exploration.
