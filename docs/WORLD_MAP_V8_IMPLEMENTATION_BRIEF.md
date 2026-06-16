# Pixel Nations — World Map v8 Implementation Brief

## Purpose

World Map v8 is not a cosmetic cleanup.

It is the first implementation attempt after formal art direction.

The goal is to move the map away from a grid-first prototype and toward the Pixel Nations Visual North Star:

> A beautiful, living strategic atlas where one small land can begin an empire.

This document is the bridge between creative direction and Cursor execution.

Cursor must not invent a new visual identity.

Cursor must implement a narrow version of this direction.

## Required Reading Before Implementation

Before any World Map v8 work, read:

- `docs/VISUAL_NORTH_STAR.md`
- `docs/DESIGN_DEPARTMENT.md`
- `docs/MAP_VISUAL_FAILURE_ANALYSIS.md`
- `docs/WORLD_MAP_ART_DIRECON_BRIEF.md`
- `docs/MAP_REFERENCE_BOARD.md`
- `docs/WORLD_MAP_V7_SPEC.md`
- `docs/WORLD_MAP_V7_EXECUTION_RUNBOOK.md`
- `scripts/qa-smoke.mjs`
- current `/world` route implementation

## Core Direction

The map is not a grid with decoration.

The map is a world with playable land hidden inside it.

Priority order:

1. World
2. Region
3. Land
4. UI
5. Data

If the grid is the first thing a user sees, v8 fails.

If the UI panels dominate the map, v8 fails.

If the map looks more like a crypto land board than a living atlas, v8 fails.

## Product Goal

The user should feel:

> I want to enter this world.

Then:

> I want to claim this land.

Then:

> This small land could become the beginning of an empire.

World Map v8 must serve both beginners and strategy veterans.

Beginners need beauty, clarity, and a simple first action.

Veterans need signs of seriousness, scale, borders, terrain, and future depth.

## Scope

World Map v8 may improve:

- visual hierarchy of the world map
- terrain feeling
- land/water separation
- Aurelian Basin identity
- sector framing
- selected land state
- owned/claimable land states
- first-claim emotional presentation
- small supporting copy around the map
- mobile readability
- layout stability

World Map v8 must preserve:

- existing vertical slice
- current smoke QA path
- ability to claim land
- path from land to dashboard
- route structure
- core demo copy about 10,000 lands and current first playable sector
- Aurelian Basin / Sector A-01 clarity

## Hard Prohibitions

Do not add:

- backend
- auth
- payments
- wallet
- crypto
- NFT
- marketplace
- multiplayer
- combat
- diplomacy
- economy systems
- procedural generation
- large new data model
- new routes unrelated to the map
- new gameplay mechanics

Do not redesign:

- the full product
- settlement/nation/empire flow
- project structure
- QA tooling
- onboarding architecture

Do not remove smoke test selectors or break the existing QA flow.

## Visual Goals

### 1. Reduce Grid Dominance

The current grid impression must be reduced.

The grid may remain functional, but it should no longer be the main visual object.

Use:

- softer borders
- terrain-led cells
- lower contrast tile lines
- stronger background world shape
- selected/hover states that feel integrated
- fewer loud geometric effects

Avoid:

- spreadsheet cells
- hard bright outlines
- equal visual weight for every tile
- tile borders stronger than terrain
- synthetic admin-panel energy

## 2. Make Aurelian Basin Feel Like a Place

Aurelian Basin should feel like the first playable frontier.

It should not feel like a random test board.

Add or strengthen:

- regional identity
- terrain variation
- subtle landmark feeling
- basin/coast/river/mountain logic if feasible
- copy that reinforces “first playable frontier”
- visual framing that makes it feel like a selected region inside a er world

Do not overbuild lore.

The region should feel evocative, not overwritten.

## 3. Preserve Sector A-01 Clarity

A-01 is a sector code.

It is not a chess coordinate.

It is not the whole world.

It is the first playable frontier within the larger 10,000-land world.

The UI should make this clear without long explanation.

Preferred language:

> Sector A-01 — First playable frontier

or:

> Aurelian Basin · Sector A-01

Avoid language that implies the whole world is only one grid.

## 4. Ownership Visual Language

Ownership should be readable but restrained.

Preferred:

- subtle glow
- muted territorial wash
- small marker
- civic light
- crest-like accent
- selected land focus
- quiet border change

Avoid:

- bright green/red/blue blocks
- loud heatmap colors
- crypto dashboard look
- pulsing everywhere
- ownership colors that destroy terrain beauty

## 5. First Claim Moment

Claiming land should feel like a small ceremony.

Not a casino reward.

Not a form submission.

Not a spreadsheet stateange.

It should imply:

> History begins here.

Implementation may include:

- gentle transition
- soft highlight
- claim tray copy improvement
- selected land framing
- civic seed marker
- subtle light or aura
- short emotional confirmation

Keep it restrained and performant.

## 6. UI Relationship to Map

The UI is a command layer over the world.

It should guide without dominating.

Improve if needed:

- panel hierarchy
- CTA clarity
- explanation order
- mobile tray readability
- selected land information
- “claim land” action clarity

Avoid:

- too many cards
- heavy borders everywhere
- generic SaaS dashboard feeling
- form-first presentation
- excessive copy
- map hidden behind UI

## 7. Mobile Requirements

Mobile must remain usable.

World Map v8 must not introduce:

- horizontal overflow
- tiny unreadable controls
- panel overlap that hides the main action
- hover-only interactions
- large performance-heavy animation
- layout shift during selection

Mobile does not need full desktop visual riss.

It needs clarity, atmosphere, and working claim flow.

## Acceptance Rubric

World Map v8 must be evaluated manually and mechanically.

Mechanical QA is necessary but not sufficient.

### Mechanical Requirements

- `npm run build` passes
- `npm run qa:smoke` passes
- `npm run qa:screens` passes
- `npm run pn:handoff` works
- no route regressions
- no horizontal overflow introduced
- land → dashboard path still works

### Visual Requirements

Score each category 0–3.

0 = fail  
1 = weak  
2 = acceptable  
3 = strong

World Map v8 must score:

- First Impression: 3/3
- Every other category: at least 2/3

### Categories

#### 1. First Impression

Does it look like a world before it looks like a grid?

#### 2. Landmass / Region Credibility

Does the map feel intentionally designed rather than random orceholder?

#### 3. Aurelian Basin Identity

Does the first playable frontier feel like a memorable region?

#### 4. Sector Clarity

Does Aurelian Basin / A-01 feel like a sector within a larger world?

#### 5. Selectable Land Clarity

Can the player understand what is claimable without the grid dominating?

#### 6. Ownership Readability

Can owned, selected, and claimable states be understood without loud status colors?

#### 7. Strategic Fantasy Feeling

Does claiming land feel like beginning history?

#### 8. Beginner Attraction

Would a non-strategy player be visually curious enough to click?

#### 9. Veteran Respect

Would a strategy veteran sense future depth rather than shallow decoration?

#### 10. Mobile Survival

Does the experience remain understandable on mobile?

#### 11. Legend Test

Could this visual direction become iconic if developed further?

## Stop Conditions

Stop implementation immediately if:

- smoke QA breaks and cannot be fixed quickly
- map becomes more complex but not more beautiful
- grid still dominates after the pass
- mobile becomes confusing
- Cursor starts redesigning unrelated product areas
- implementation requires large architecture changes
- result looks like improved prototype but not a stronger direction
- user reaction is still “this does not feel good”

If a stop condition triggers, do not continue coding.

Return to Design Department review.

## Implementation Strategy

World Map v8 should be one focused sprint.

It should not attempt to solve the entire future map system.

Recommended approach:

1. Preserve existing mechanics.
2. Identify current map component structure.
3. Reduce grid visual dominance.
4. Improve terrain/world feeling.
5. Improve Aurelian Basin framing.
6. Improve selected/owned/claimable state styling.
7. Improve claim tray copy or hierarchy only if needed.
8. Verify desktop and mobile.
9. Run build, smoke, screenshots, handoff.
10. Stop.

## Cursor Execution Rules

Cursor should use:

- Cursor UI
- GPT-5.5 Medium or GPT-5.3 Codex
- MAX OFF byault
- one focused implementation sprint only

Cursor must not be asked:

> Make the map better.

Cursor should be asked:

> Implement World Map v8 according to Visual North Star, Map Reference Board, and this implementation brief, with strict scope limits and smoke QA preservation.

## Success Definition

World Map v8 succeeds only if:

- a new user sees a world first, not a grid
- the first land feels emotionally meaningful
- Aurelian Basin feels like a real first frontier
- the claim action remains obvious
- the demo path still works
- mobile survives
- the result feels closer to a legendary strategic atlas

The correct outcome is not:

> better tiles

The correct outcome is:

> a stronger world.
