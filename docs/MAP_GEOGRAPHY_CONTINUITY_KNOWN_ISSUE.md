# Map Geography Continuity Known Issue v0.1

Status: ACCEPTED KNOWN ISSUE  
Owner: Product Lead / Cartography Lead / Visual QA Lead / Game UX Designer  
Severity now: MEDIUM, not blocking current local demo merge  
Severity before public confidence / wider testing: HIGH  
Created because: real user review noticed geography mismatches that screenshot smoke evidence did not protect against.

## Summary

Pixel Nations currently uses visually strong but partly placeholder map representations across the landing page, world preview, globe, playable sector, and first land selection flow.

The following issues are accepted as known limitations:

1. The WORLD section globe highlights a region that appears to be an approximate zoom target, but the playable Aurelian Basin map below does not geographically match that highlighted globe region.
2. The selected first land / tile position is not consistently anchored across map views.
3. Some selectable land/tile markers can appear on water or visually ambiguous terrain, which breaks the fantasy of claiming first land.
4. The current map and globe layers are partly illustrative / directional, not yet a unified authoritative game geography system.

## Current Product Decision

Do not spend major implementation effort on full geography consistency until the target map/game engine layer is ready.

This is accepted for the current demo only if:
- the demo remains clear that Sector A-01 / Aurelian Basin is the first playable slice,
- no UI implies fake precision that the current placeholder maps cannot support,
- selected/claimable land markers are not obviously on water in critical first-impression screenshots,
- the issue remains documented and visible to QA.

## Why This Matters

Pixel Nations depends on the fantasy that one land can become an empire. If geography feels fake or inconsistent, the player stops trusting the world.

This is not only an art issue. It affects:
- first-time player trust,
- perceived product quality,
- world believability,
- future fundraising/demo credibility,
- map-system architecture.

## Not In Scope Yet

Do not attempt a full fix through small CSS patches.

Do not:
- rebuild the full world map system,
- create the final 10,000-land geography engine,
- create procedural world generation,
- redesign all map assets,
- fake a complex GIS-like system,
- over-optimize placeholder maps before the real engine exists.

## Required Future Fix Direction

When the Living Map / target map engine work begins, Pixel Nations must establish one authoritative geography model:

- one canonical world/sector coordinate system,
- one canonical Sector A-01 / Aurelian Basin location,
- consistent transformation from globe/atlas view to region/sector view,
- land tiles generated only on valid land areas,
- water tiles excluded from claimable first-land positions,
- selected land coordinates stable across landing, world, sector, claim, settlement, nation, and empire views,
- all map overlays using the same source of truth.

## Interim QA Checklist

Until the final map engine exists, every map/landing/public-demo visual review must check:

- Is the globe highlight clearly illustrative, or does it falsely imply exact geography?
- Does the Aurelian Basin map appear disconnected from the highlighted globe area?
- Is any primary claim/select marker placed on obvious water?
- Does the same chosen land appear to jump locations between screens?
- Are labels or overlays clipped by map frames?
- Does the current screen harm the fantasy: "claim one land and grow toward empire"?

If yes, classify as:
- ACCEPTED PLACEHOLDER if not first-impression critical,
- FIX NOW if it appears in public landing first fold / world first claim / mobile first claim,
- BLOCKING if it breaks the first-time player’s trust in the demo.

## Relationship To Existing Known Issues

This extends the existing mobile map framing known issue into a broader cartography continuity concern.

Mobile framing was about viewport/crop.
This issue is about geography truth, selection consistency, and map believability.

## Current Stop Rule

Do not start broad cartography rebuild now.

Do fix small first-impression bugs when they are obvious:
- clipped labels,
- markers visibly on water,
- misleading copy that claims exact geography,
- broken frame/overlay layout.

