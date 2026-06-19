# Visual Prompt QA Gate Protocol v0.1

Status: ACTIVE  
Owner: Product Lead / Prompt QA Lead / Visual QA Lead / Frontend Layout Lead / First-Time Tester Proxy  
Created after: landing map frame clipping fix created a new visual regression where the map image bled outside its frame.

## Why This Exists

Pixel Nations cannot afford repeated visual Cursor loops. Screenshot evidence and smoke tests are not enough when a bug is about layout, framing, clipping, art direction, or first impression.

A user screenshot complaint is not an automatic Cursor sprint. It is a diagnosis gate.

## Required Flow For Visual/Layout Bugs

1. Identify the exact visible artifact.
2. Classify it:
   - layout bug,
   - clipping/overflow bug,
   - visual polish issue,
   - content/copy issue,
   - gameplay clarity issue,
   - geography/cartography continuity issue.
3. Name the primary bug and secondary observations separately.
4. Define what must not change.
5. Define hard layout invariants.
6. Prefer deterministic patch packages over Cursor.
7. Use Cursor only when a direct patch is unsafe or the exact implementation is too broad.
8. Before merge, require real visual review, not only smoke/screenshot generation.

## Prompt QA Checklist Before Cursor

Every Cursor prompt for visual work must answer:

- What exact artifact is being fixed?
- What files/components are likely responsible?
- What must not change?
- What layout invariants must remain true?
- What viewports must be checked?
- What regression risks are forbidden?
- What evidence proves success?
- What is the stop condition?
- Is Cursor allowed to be creative? Default answer: no.

## Visual QA Checklist Before Merge

For landing/map/public-demo UI, inspect:

- no text clipped by a frame,
- no image pixels bleeding outside the intended frame,
- border surrounds the full image/card coherently,
- overlay labels are readable and safely inset,
- desktop first fold looks production-quality,
- mobile first fold has no crop/overflow regression,
- screenshot bundle includes the affected screen,
- real-browser user view is accepted when available.

## Cursor Budget Rule

Cursor is blocked for visual bugfixes until:
- diagnosis is complete,
- prompt has passed Prompt QA,
- direct patch has been considered first,
- rollback path is known,
- expected spend is justified.

Reserve at least 20% of the monthly Cursor budget for emergency/project-critical work.
