# World Map v7 — Product Spec

**Status:** Target spec for `/world` playable sector quality.  
**Benchmark:** World Atlas section (keep mostly intact).  
**Problem:** Playable sector is functional but still reads as a flat grid / editor, not a living strategic world.

---

## Product goal

`/world` must become the **first true “wow” gameplay moment** in the demo.

The player should feel:

1. The **full world** is vast and finite (100 × 100 = **10,000 lands**).
2. The **visible map** is an honest first window — not the entire world pretending to be 10,000 tiles.
3. The **playable sector** feels like **the Atlas came alive** — same premium black/gold kingdom-map language, not a separate spreadsheet.

---

## World scale (must stay honest)

| Concept | Value | UI copy guidance |
|---------|-------|------------------|
| Full world grid | 100 × 100 | Atlas: “100 × 100 lands” |
| Total lands | 10,000 | “10,000 lands” / “finite lands” |
| Playable sector | Sector A-01 | “Starting sector” / “Aurelian Basin” |
| Visible clickable lands | 216 (18 × 12) | “216 visible lands” |

**Do not** pretend the visible 18×12 grid equals all 10,000 lands.  
**Do** make clear this sector is the first playable window into the larger world.

---

## Visual direction

**Feel:** atlas / kingdom map / tactical world — premium strategy game.  
**Not:** pixel spreadsheet, raw square table, crypto dashboard, NFT grid.

### Playable sector layers (target)

Stack these visually **under** clickable tiles:

1. **Terrain masses** — soft organic shapes (coast, forest, plains, ridge, basin), blurred edges, atlas-like color masses.
2. **Region overlays** — clipped zone shapes with subtle borders and inset glow (North Frontier, Iron Coast, Aurelia, Crownlands, Ember Basin).
3. **Roads / routes** — dashed gold paths suggesting trade and movement.
4. **Rivers** — cool slate strokes, meandering, not grid-aligned.
5. **Frontier lines** — subtle sector boundary / political edge cues.
6. **Ownership grid** — grid still visible enough for land ownership and selection, but softened (not harsh spreadsheet lines).
7. **Interaction layer** — clickable tiles on top; markers for founder / landmark / resource-rich lands.

### Tile interaction rules (hard constraints)

- **No hover scale**
- **No selected scale**
- **No breakout animations** — tiles must not escape their grid cell or shift layout
- **Selected land** — contained premium highlight (border + inset glow); feels important, not loud
- **Founder lands** — contained glow / dot / border; no huge map-covering pulse
- **Claimed / unavailable** — readable but subdued

### Mobile

- **No page-level horizontal overflow** — map may scroll inside its container (`overflow-x-auto` on map wrapper only).
- **Claim tray and modal** must remain accessible; tray must not cover essential map controls.
- Selected tile border/glow may use subtle contained animation on mobile only; never scale tiles.

---

## Copy requirements

### Atlas (keep strong; minor clarity OK)

- Full world: **100 × 100 lands**, **10,000** finite lands.
- Highlight **Sector A-01** as the demo starting sector on the atlas viewport.

### Playable sector

- **Sector A-01** / **Starting sector**
- **216 visible lands** (not 10,000 on this grid)
- **Aurelian Basin** (sector name)
- One line clarifying: first playable window into the 10,000-land world

Tone: cinematic, minimal, strategic — no crypto wording.

---

## Claim flow (do not break)

- Tile click → selected land panel (+ mobile sticky tray when applicable)
- **CLAIM THIS LAND** → modal → `writeSettlementState` with full land identity
- Persist: `claimedLandId`, `claimedLandPnId`, `claimedLandName`, `claimedLandCoordinates`, `claimedLandRegion`, `claimedLandTerrain`, `claimedLandResources` (if supported)
- Dashboard must read claimed land consistently (Land ID as PN-xxxx, not “Awaiting Claim” after claim)
- Demo-safe: no wallet, no chain, no mint language

---

## Acceptance criteria

1. `/world` looks **meaningfully** better — not a ~5% color polish.
2. Playable sector **no longer feels like a spreadsheet**.
3. Atlas and playable sector **feel like the same world** (shared visual language).
4. **Tile selection** works on desktop and mobile.
5. **Claim flow** works end-to-end (modal, persistence, dashboard).
6. **Land identity persists** correctly after claim.
7. **Dashboard** reads claimed land consistently (ID, name, region, terrain).
8. **Mobile** remains usable (no page overflow; tray/modal accessible).
9. **No crypto wording** introduced.
10. **`npm run build` passes** after code changes.

---

## Preferred implementation scope

| File | When to touch |
|------|----------------|
| `app/world/page.tsx` | Primary — map layers, copy, tile styling, mobile layout |
| `app/lib/claimed-land.ts` | Only if display/persistence helpers need adjustment |
| `app/lib/settlement-state.ts` | Only if new persisted fields required |
| `app/globals.css` | Only for map-specific utilities (e.g. sector canvas, contained animations) |

**Do not touch** landing page, demo progression pages, or unrelated routes unless required for routing compatibility.

**QA:** Run `npm run build` and `npm run qa:screens` when UI changes; commit `public/qa/latest/` if screenshots regenerated.

---

## Out of scope for map-only passes

- Landing page redesign
- Dashboard / settlement / nation / empire redesign
- Backend, auth, wallet
- New demo progression steps or routes
- Pretending 216 tiles = 10,000 lands

---

## Reference: current architecture

- **Atlas:** `data-qa="world-atlas"` — full-world impression, sector viewport highlight.
- **Playable sector:** `data-qa="playable-sector"` — 18×12 interactive grid.
- **Side panel:** `data-qa="selected-land-panel"` — desktop sticky; full panel on mobile below map.
- **Mobile tray:** `data-qa="mobile-claim-tray"` — quick claim layer; same `openClaimModal()` as panel.
