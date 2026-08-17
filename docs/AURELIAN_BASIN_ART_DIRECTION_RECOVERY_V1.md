# Aurelian Basin Art-Direction Recovery v1

Status: ACCEPTED FOR ART-DIRECTION WORK ONLY
Issue: #415
Product loop: land → settlement / city → nation → empire
Topology authority: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
Rejected visual evidence: #437 exact head `7d2d8b48bdd401c3f27b078573a315ae86f512ed`, run `32032319372`, artifact `9289410431`

## Purpose

Stop visual implementation churn and establish a clear, reviewable Aurelian Basin visual target before another Godot/Blender sprint.

The next implementation must not discover its art direction while coding. Moodboard, visual target, implementation reference and production asset are separate stages with separate acceptance.

## What the rejected work taught us

### #426

The first shared-geography technique proved shared transforms/cameras but failed visually because the Basin read as sparse primitive geometry rather than authored geography.

### #429 / #437

The terrain-first GLB proved deterministic Blender → GLB → Godot authoring can work technically. The black evidence was a separate exposure bug and was isolated by #435.

The truthful replay in #437 then showed that the underlying visual baseline is still unsuitable:

- pale, washed terrain with weak material hierarchy;
- river shaped like a severe cut trench instead of a natural watercourse;
- bridge sitting on large block abutments with weak road integration;
- roads disappearing at Map scale;
- settlement reading as a compact pile of props rather than a place embedded in geography;
- North Ridge, fields, marsh and coast lacking clear differentiated identities;
- harsh/dark patches and blown highlights competing with geography;
- outer water reading as a rectangular slab;
- World reading as a finite board rather than a believable Basin.

Do not salvage or patch that GLB.

## Visual north star

Aurelian Basin should feel like a **premium, authored grand-strategy diorama with tactile terrain and cartographic clarity**.

The player should understand the geography in a few seconds:

- Greenvale is protected on the west side of the river;
- the Gilded Crossing is the obvious strategic east-west bridge;
- roads visibly radiate from Greenvale and the bridge;
- North Ridge controls the north-east;
- productive fields open south of the settlement;
- wetlands lower toward the south;
- the river naturally broadens into marsh/coast and exits into water;
- zooming out reveals more of the same place, never a different map or a rectangular game board.

The target is stylized and readable, not photorealistic. It may use simplified low-poly forms, but it must not look like unintegrated asset-pack props on a flat mesh.

## Shape language

### Terrain

- One continuous irregular landform with no visible rectangular terrain edge in any accepted camera.
- Broad macro elevation before small detail.
- Greenvale on a readable low west-bank shelf.
- North Ridge as a strong but natural north-east mass, not a white mound.
- Forest/work edge on broken north-west terrain.
- Fields/plains as calmer, broader south/south-east land.
- South Marsh visibly lower and wetter before the coast transition.
- Camera framing must make the Basin feel larger than the visible crop.

### River and coast

- River must read as water first, not as a canyon cut.
- Banks should generally slope into the channel and vary naturally in width/height.
- The channel must stay continuous from north through the crossing to the south.
- It should widen toward marsh/outflow.
- Coast/outer water must extend naturally beyond the camera and never expose a cyan rectangular plane.
- Shoreline shape should be irregular enough to read as geography but simple enough to remain legible at World scale.

### Gilded Crossing

The bridge is the key geographic anchor and must read immediately as:

`west road → dry approach → embedded abutment/ramp → deck → embedded abutment/ramp → dry east road`

- Bridge width and road width must belong to the same system.
- Abutments should disappear into banks rather than stand as oversized blocks.
- Deck must clearly clear water without feeling suspended above a trench.
- Both approaches must be visibly connected at Village and Map scale.
- The crossing should feel important but not monumentally oversized.

### Roads

- Dirt/stone routes need readable width and contrast at Map scale.
- Roads conform to terrain, curve naturally and have clear destinations.
- Required network: Greenvale → west bridge landing; east landing → EastRoute; Greenvale → Northgate; bridge/east route → North Ridge; Old Road → west landing.
- Avoid hairline paths that disappear against terrain.

### Landmarks

- Greenvale: compact village with breathing room, streets/clearings and a visible relationship to road/river, not a dense stack of buildings.
- Forest/work edge: clustered canopy/woodland mass with an obvious working edge.
- North Ridge: stone/highland silhouette and elevation, visually distinct from fields.
- Fields/plains: broad productive pattern, not isolated thin stripes.
- South Marsh: wet, lower, broken ground with muted water/vegetation cues.
- Coast/outflow: a geographic transition, not a second water rectangle.

## Palette and lighting target

The rejected replay is too pale and loses structure. New target should use controlled midtone contrast.

Directional intent:

- terrain base: muted warm earth / olive / moss rather than pale lemon;
- forest: deeper cool green with clear massing;
- fields: warmer ochre/grass values;
- ridge/rock: muted slate/stone, darker than blown white;
- water: restrained blue-green/teal, visibly distinct but not neon cyan;
- settlement: warm roofs/wood/stone as a focal accent;
- bridge/roads: warm neutral earth/stone family;
- background/horizon: subdued, never competing with the playable landform.

Lighting should give readable form without destroying map clarity:

- no clipped white terrain;
- no giant opaque shadow patches;
- soft directional shadows for elevation/trees/buildings;
- enough ambient fill that roads and terrain remain readable;
- bridge and river remain legible in both light and shadow.

Exact production color values are not locked by this brief. The visual target must establish them first.

## Camera-specific visual targets

All views show one geography and use one consistent azimuth/pitch family unless the visual target proves a small adjustment materially improves readability.

### Village

Purpose: settlement + physical crossing.

- Greenvale and bridge are both immediately visible.
- Settlement/bridge/river occupy roughly 70–82% of the useful frame.
- Road from Greenvale to the west landing is obvious.
- Bridge construction and dry approaches read physically.
- Enough surrounding terrain remains to understand forest, fields and east-bank direction.

### Map

Purpose: route network + landmark relationships.

- Useful Basin geography occupies roughly 75–85% of frame.
- River continuity and all required primary roads are readable at a glance.
- Greenvale, North Ridge, forest/work edge, fields and marsh occupy differentiated zones.
- No finite board edge becomes the dominant silhouette.

### World

Purpose: full Aurelian Basin identity.

- Basin occupies roughly 70–80% of useful frame.
- River-to-coast/outflow story is clear.
- Greenvale and bridge remain identifiable anchors even when small.
- Landform feels larger than a single flat board and coast/water continue beyond the crop.

## Four-stage visual workflow

### 1. Moodboard

Reference-only, no production assets.

Create a concise four-part moodboard covering:

1. terrain/landform readability;
2. river + integrated bridge crossing;
3. premium stylized palette/lighting;
4. grand-strategy/map-scale route readability.

Each reference must state what is being borrowed conceptually and what is explicitly not being copied. External reference imagery remains reference only.

### 2. Visual target

Create one bespoke Aurelian visual-target package showing the same designed geography across:

- Village view;
- Map view;
- World view;
- optional bridge crop if the crossing is not clear enough in Village.

This may be produced through a single controlled image-generation/design pass after the moodboard is chosen. It is a design reference, not a runtime or production asset.

The target must preserve locked Aurelian topology and landmark relationships. It may simplify detail but may not move the river, bridge or major landmark zones for aesthetic convenience.

### 3. Implementation reference

Only after `ART_DIRECTION_PASS`.

A later implementation contract may authorize a minimal Blender/Godot greybox reproducing terrain silhouette, river, coast, bridge and road readability from the visual target. It should deliberately omit prop polish until geography passes.

### 4. Production asset

Only after the implementation reference proves the visual language can be reproduced reliably. Production terrain/material/prop work starts after that separate acceptance.

## Current allowed work

- reference research and moodboard curation;
- written visual-direction refinement;
- one controlled non-production visual-target generation/design pass;
- direct visual comparison against this brief and topology authority;
- normal docs/control-plane PRs.

## Current forbidden work

- Godot or Blender Aurelian implementation;
- another GLB candidate;
- edits or salvage of #429 GLB;
- runtime generated full-frame art;
- product integration;
- `app/play/**` visual work;
- gameplay/P12/Phase 2;
- paid assets/tools, MAX or Fable;
- choosing final production assets before visual-target acceptance.

## Art-direction acceptance gate

After one coherent visual-target package, classify exactly one:

### `ART_DIRECTION_PASS`

Use only if:

- Village / Map / World clearly read as different views of one geography;
- terrain feels authored and continuous, not a board/slab;
- river and coast read naturally;
- bridge and both approaches are convincingly integrated;
- roads remain legible at Map scale;
- landmark hierarchy is immediately understandable;
- palette/lighting has controlled midtone contrast and premium strategic tone;
- the target is materially stronger than #429/#437 and clear enough for an executor to reproduce without inventing new art direction.

### `ART_DIRECTION_CORRECTION_REQUIRED`

Allow only one named, bounded correction if the overall direction is right but one specific issue prevents implementation reference work.

### `ART_DIRECTION_REJECT`

Use when style, geography readability, crossing logic or overall quality is wrong enough that implementation would again require the executor to invent design decisions.

## Stop condition

Stop before coding when the first visual-target package has been directly reviewed and classified.

No Godot/Blender Aurelian implementation is authorized until `ART_DIRECTION_PASS`. If one bounded correction still fails, reject the direction rather than starting another implementation iteration.