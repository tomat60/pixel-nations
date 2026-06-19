# Known Issue — Mobile Landing and Playable Map Framing

Status: OPEN QUALITY RISK
Date reported: 2026-06-17
Reported by: manual tester / user observation
Severity: High for first impression

## Summary

A first-time tester noticed that the map on the main/landing page is cropped on mobile.

Observed symptoms:

- The map is visible but does not sit cleanly inside its frame.
- Some text or UI near the map appears clipped.
- The target playable tile-selection map appears only partially visible by default.
- The map can be moved, which is good, but the default mobile framing still feels poor.
- The issue damages first impression.

## Product Interpretation

This is not just a CSS bug.

This is a first-impression product issue because Pixel Nations sells the fantasy of a beautiful strategic world map. If the first mobile view feels cropped or accidental, the public demo loses credibility.

## Decision

Do not start another major visual map rebuild by default.

But before declaring the public demo polished, the team must perform a dedicated Mobile Map Framing Review.

Possible future solutions may include:

- better default mobile crop
- responsive map fit mode
- zoom controls
- pan/zoom affordance
- tap to expand map mode
- separate mobile composition
- redesigned map frame
- clearer tile-selection viewport

The final decision should be made by Product Lead + UX Director + Mobile QA Lead + Design Department.

## Acceptance Criteria

The issue is resolved only when:

- mobile landing map looks intentionally framed
- playable map default view is understandable
- important text is not clipped
- first-time tester does not immediately call it broken/cropped
- manual mobile review accepts it

## Do Not Forget

Manual tester feedback overrides screenshot approval.

## Related Known Issue

See also `docs/MAP_GEOGRAPHY_CONTINUITY_KNOWN_ISSUE.md`.

Mobile crop/framing issues must be reviewed together with broader cartography continuity:
- does the map/frame clip labels,
- does the selected land remain believable,
- does any claim marker appear on obvious water,
- does the globe/sector/land relationship still make sense to a first-time player.
