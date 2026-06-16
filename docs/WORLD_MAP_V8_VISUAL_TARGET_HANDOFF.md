# Pixel Nations — World Map v8 Visual Target Handoff

## Purpose

This document translates the accepted World Map v8 visual target candidates into implementation guidance.

The generated images are visual references, not production assets.

Cursor must not copy them literally.

Cursor must implement the direction, hierarchy, mood, and state behavior within the current Pixel Nations demo scope.

## Visual Target Pack v1 Status

The visual target pack has four accepted candidate directions:

1. Desktop World / Region Map — accepted.
2. Selected Land / First Claim Focus — accepted.
3. Owned / Settlement Land State — accepted with scope reduction.
4. Mobile Composition — accepted with simplification.

These images confirm that the locked direction has visual potential.

## Locked Direction

World Map v8 should follow:

- 70% Living Atlas
- 20% Frontier
- 10% Grand Strategy Atlas

The map should feel like:

> A beautiful living strategic atlas where playable land is hidden inside a world worth entering.

## Image 1 Translation — Desktop World / Region Map

### Use

Use this as the main target for:
- world-first impression,
- terrain depth,
- region identity,
- atmospheric framing,
- premium UI mood,
- Aurelian Basin as a real place.

### Implement

- terrain-led map composition,
- subtle land divisions,
- Aurelian Basin / Sector A-01 framing,
- calm dark UI frame,
- clear claim path,
- reduced grid dominance,
- believable terrain regions.

### Do Not Copy Literally

- excessive detail,
- decorative icons,
- too many labels,
- exact UI text,
- exact resource counters,
- visual density that would harm performance or mobile.

## Image 2 Translation — Selected Land / First Claim Focus

### Use

Use this as the target for selected land behavior and claim tray hierarchy.

### Implement

- selected land as a meaningful story moment,
- soft border or ,
- terrain visible under selected state,
- clear claim CTA,
- selected land information panel,
- calm ceremonial feeling.

### Scope Reduction

The selected glow should be more restrained than the image.

The selected land must not feel like:
- a magic shield,
- a casino reward,
- a spreadsheet cell,
- an overpowered animation.

## Image 3 Translation — Owned / Settlement Land State

### Use

Use this as emotional target for land after ownership.

### Implement

- owned land feels alive,
- small civic seed,
- warm light,
- subtle settlement marker,
- restrained ownership boundary,
- sense of progression from land to settlement.

### Scope Reduction

Do not implement full city-builder systems.

Do not add:
- production/hour systems,
- building management systems,
- population systems,
- levels,
- economy mechanics,
- extra routes.

The image defines feeling, not mechanics.

## Image 4 Translation — Mobile Composition

### Use

Use this as mobile hierarchy reference.

### Implement

- map still feels pre on mobile,
- selected/owned land remains clear,
- bottom or floating panel supports the main action,
- CTA remains obvious,
- no horizontal overflow,
- no tiny unreadable labels,
- map remains the hero.

### Scope Reduction

Do not add unnecessary nav items such as Army or advanced systems.

Do not squeeze desktop UI into mobile.

Mobile must be simpler than the image.

## Implementation Guardrails

Cursor must preserve:

- current route structure,
- current smoke QA path,
- land claim flow,
- dashboard transition,
- Aurelian Basin / Sector A-01 clarity,
- 10,000-land world framing,
- demo simplicity.

Cursor must not add:

- backend,
- auth,
- payments,
- wallet,
- crypto,
- NFT,
- marketplace,
- multiplayer,
- combat,
- diplomacy,
- economy systems,
- procedural generation,
- large data model changes.

## What v8 Should Actually Change

World Map v8 may change:

- map visual hierarchy,
- terrain and atmosphere,
- grid/tile styling,
- selected land state,
- owned/claimable/unclaimed styling,
- claim panel hierarchy,
- mobile layout clarity,
- small supporting copy.

World Map v8 should not change:

- gameplay systems,
- product scope,
- settlement/nation/empire mechanics,
- QA architecture,
- repo architecture.

## Acceptance Decision Before Cursor

World Map v8 implementation is now allowed only as one controlled sprint if Cursor receives:

- Visual North Star,
- Design Department rules,
- Map Visual Failure Analysis,
- World Map Art Direction Brief,
- Map Reference Board,
- World Map v8 Implementation Brief,
- World Map v8 Final Direction Lock,
- this Visual Target Handoff.

## Human Review Rule

A World Map v8 sprint cannot be called successful only because screenshots pass.

It succeeds only if the user reaction is meaningfully better.

Manual reaction overrides screenshot QA.

If the map still feels weak, stop coding and return to design review.

## Success Definition

World Map v8 succeeds if:

- first impression is a world, not a grid,
- Aurelian Basin feels like a real frontier,
- selected land feels meaningful,
- owned land begins to feel alive,
- mobile remains usable,
- claim flow still works,
- smoke QA passes,
- the result feels closer to a legendary strategic atlas.

The target is not better tiles.

The target is a stronger world.
