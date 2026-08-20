# Aurelian View Roles v1

Status: AUTHORITATIVE PRODUCT ROLE CONTRACT
Date: 2026-08-21
Scope: Village, Map, World roles on the accepted shared Aurelian Basin

## Why this exists

Village, Map and World are not three cosmetic zoom levels. They are three decision layers over one persistent geography.

The shared Blender -> GLB -> Godot world remains mandatory, but each view must answer a different player question, expose different information and support different actions.

This contract prevents a recurring failure mode: building three visually different screens that either duplicate each other or differ only by camera distance.

## External design lessons

The benchmark is conceptual, not a request to copy another game.

- Manor Lords: local settlement growth is shaped by terrain, roads and organic placement. The close view should make the place itself understandable and valuable.
- Against the Storm: settlement play is distinct from the wider world layer. The world map is for choosing where to go next, reading modifiers and planning an expedition path, while the settlement view is for making the chosen place function.
- Anno 1800: local city and production decisions feed a larger logistics, trade, expedition and expansion network. Macro decisions should exist because the local economy created capacity for them.
- Frostpunk 2: changing scale also changes the type of decision and the information density. Strategic overlays exist to answer a specific management question rather than decorate a zoomed-out city.

Pixel Nations should combine these lessons with its own fantasy:

`one land -> settlement / city -> nation -> empire`

## One world, three jobs

### 1. Village - make one place live and grow

Player question:

`What should I build, improve or prioritize inside this settlement?`

Primary actions:

- found and visibly grow Greenvale;
- place or unlock structures and local functions;
- improve local roads, work areas and production relationships;
- read settlement needs, capacity and specialization;
- later manage local defenses, civic identity and city-scale upgrades when those systems are authorized.

Primary visual information:

- buildings and their hierarchy;
- roads and paths;
- nearby fields, work zones and resources;
- bridge and local terrain relationship;
- visible settlement activity and growth;
- local problems that require local action.

Village must feel tangible. The player should care that this specific place changed because of their decisions.

Village must NOT become:

- a global diplomacy screen;
- a field of territory markers;
- a miniature World map;
- a spreadsheet that hides the settlement.

### 2. Map - choose and operate on nearby land

Player question:

`Which nearby land should I scout, claim, connect or exploit next?`

Primary actions:

- select a local land;
- scout it;
- claim it;
- inspect local resource or terrain value;
- understand adjacency, access and route consequences;
- choose the next local expansion direction;
- later support outposts, local trade links, local pressure or specialization only when separately authorized.

Primary visual information:

- local land status;
- selected / claimable / claimed / scouted distinctions;
- terrain and resource identity;
- roads, crossing and travel relationship;
- Greenvale as the local anchor;
- nearby opportunities and constraints.

Map should be terrain-first. Boundaries and markers appear because the player is making a territorial decision, not because the world is a board game.

Map must NOT become:

- a second Village builder;
- a full empire diplomacy surface;
- a dense grid of permanent outlines;
- independent geography reauthored away from the Village scene.

### 3. World - choose the direction of the nation and empire

Player question:

`Where should my nation push next, and what larger force or opportunity should I respond to?`

Primary actions for the first bounded World slice:

- read Aurelian Basin as one strategic possession / home region;
- see a small number of wider strategic directions beyond the current local-land problem;
- select one strategic objective or frontier direction;
- understand which direction represents expansion, trade opportunity, pressure or future rivalry;
- return to Map or Village to execute the consequences locally.

Later, only when separately authorized, World can host:

- other nations and empires;
- diplomacy and treaties;
- macro trade routes;
- military fronts and strategic pressure;
- national objectives;
- sector-level ownership across the 10,000-land logical world;
- empire-scale resources and policies.

Primary visual information:

- sparse strategic ownership / influence;
- major routes and fronts;
- regional objectives;
- neighboring powers or unknown directions;
- high-level consequences of local growth.

World must NOT become:

- a fake finished 10,000-land renderer before the demo needs one;
- 25 dominant buttons over scenery;
- the local Map with smaller icons;
- a place to micromanage individual buildings or fields.

## The transition loop

The three views should form one decision loop:

1. World tells the player WHY expansion matters and which broader direction is valuable.
2. Map tells the player WHERE to act locally and which land is the best next move.
3. Village tells the player HOW the settlement converts land, resources and routes into real growth.
4. Village growth creates capacity that changes what is possible on Map and World.

Example demo loop:

`World: eastern trade opportunity -> Map: scout and claim East Route land -> Village: expand Greenvale production / road capacity -> Map: route becomes useful -> World: new strategic option becomes available`

This is more important than adding more visual detail to any single screen.

## Shared geography rule

The accepted authored Aurelian Basin remains one physical scene.

Shared and invariant across views:

- river;
- Gilded Crossing transform;
- Greenvale origin;
- roads and route anchors;
- North Ridge;
- fields / work context;
- coast / outflow;
- north orientation;
- topology-to-Godot coordinate mapping.

Allowed to change by view:

- camera distance and framing;
- LOD and detail visibility;
- interaction surfaces;
- overlays;
- label density;
- strategic markers;
- UI hierarchy.

The view may change the meaning presented to the player, never the physical geography.

## Information-density rule

Closer view = more physical detail, fewer abstract symbols.

Farther view = less physical detail, more strategic abstraction.

Therefore:

- Village: buildings > terrain landmarks > local overlays.
- Map: terrain / routes > land states > buildings.
- World: strategic regions / routes / objectives > local land states > individual buildings.

## Production World v1 - next bounded target

Production Map v1 has passed and merged. The next implementation slice is not broad World polish. It is one test of the World view's unique job.

The first World slice should prove three things only:

1. Aurelian Basin reads as the player's current strategic home region.
2. Three sparse strategic directions are legible around it, for example trade, expansion and pressure / unknown frontier.
3. Selecting one direction communicates a strategic intent without changing the underlying geography or pretending the full 10,000-land world is rendered.

No new diplomacy system, combat system, economy rewrite or P12 is authorized by this contract.

### Required World v1 evidence

- neutral World still;
- World still with one strategic direction selected;
- World still showing the three direction types distinctly but sparsely;
- Village regression still;
- Map regression still;
- 15-30 second raw sequence showing neutral -> selected direction -> return to Map / Village framing;
- exact-head manifests / tests proving shared geography and World marker semantics;
- direct visual and product review.

### World v1 acceptance

PASS only if:

- a new viewer can explain what the World view is for without being told it is merely a zoom level;
- strategic direction is understandable in about two seconds;
- markers remain subordinate to the landscape;
- Aurelian Basin still reads as the same place seen in Village and Map;
- no fake global completion is implied;
- switching World -> Map -> Village feels like moving from WHY -> WHERE -> HOW.

Classification:

- `PRODUCTION_WORLD_PASS`
- `PRODUCTION_WORLD_CORRECTION_REQUIRED`
- `PRODUCTION_WORLD_REJECT`

One bounded correction maximum.

## Process acceleration rules

To keep the project moving:

1. Do not rebuild shared terrain for a view-specific interaction change.
2. Each milestone must alter one decision layer only. Other two views are regression evidence.
3. Use focused Godot evidence workflows per view instead of making the full web QA the visual iteration loop.
4. Do not restart successful exact-head jobs because PR metadata changed if branch protection does not require it.
5. Infra failures before product tests get the smallest-job recovery, not a new product commit.
6. Direct artifact review happens immediately after a focused run succeeds.
7. One meaningful candidate, one bounded correction, then PASS or REJECT.
8. Public web verification is tracked separately when a Godot-only slice does not modify the public web shell.

## Tool and cost boundary

- Strategy and review: GPT-5.6 Sol.
- Deterministic Godot / Blender / GitHub implementation path first.
- Cursor only as a scoped executor when it materially speeds implementation.
- Cursor default if used: GPT-5.5, MAX OFF.
- Extra spend target: 0 USD.
- No new paid asset family.
- No image generation as implementation authority.
