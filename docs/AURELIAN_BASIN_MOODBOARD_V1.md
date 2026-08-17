# Aurelian Basin Moodboard Direction v1

Status: ACCEPTED AS REFERENCE DIRECTION
Issue: #415
Art-direction authority: `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`
Purpose: lock the visual ideas to borrow before producing one bespoke Aurelian visual target. These references are moodboard only, never production assets.

## Selection principle

We are not choosing one game to imitate. Aurelian Basin needs a controlled blend:

- strategic landform clarity from Northgard;
- organic river/bridge/settlement logic from Foundation;
- premium stylized 3D massing and midtone palette discipline from Against the Storm;
- terrain-led road growth from Manor Lords;
- soft readable biome transitions from Dorfromantik, without any tile language.

The visual target must remain recognizably Pixel Nations and preserve the locked Aurelian topology.

## 1. Terrain and landform readability

### Primary reference: Northgard

Official reference family: Northgard game page / official screenshots.

Borrow conceptually:

- strong macro landform silhouettes that remain readable from strategic camera height;
- simplified, chunky natural forms rather than noisy micro-detail;
- clear visual grouping of settlement, forest, high ground and open productive terrain;
- high information density without photorealism.

Do not copy:

- explicit territory/sector boundaries;
- board-game region segmentation;
- Viking-specific props, architecture or palette;
- isolated tile/zone logic.

Aurelian application:

- North Ridge should read as one strong north-east mass;
- ForestWorkEdge should read as a coherent north-west woodland mass;
- Greenvale, fields and marsh should each have distinct macro texture/value without borders.

## 2. River, bridge and settlement integration

### Primary reference: Foundation

Official reference family: Polymorph Games Foundation press kit and official Fluvial map documentation.

Borrow conceptually:

- broad natural river corridors with land shaped around the water rather than a trench cut into a flat board;
- bridges whose end pieces visibly attach to land and function as genuine movement links;
- organic urbanism, with routes and settlement growth responding to terrain;
- gentle rolling terrain that allows roads, farms and buildings to feel embedded rather than placed on top.

Do not copy:

- exact bridge pieces or medieval building designs;
- Foundation's brighter pastoral tone as-is;
- procedural settlement sprawl that would weaken Pixel Nations' authored strategic composition.

Aurelian application:

- Gilded Crossing must visually terminate into dry west/east approaches;
- bridge width, road width and approach geometry must belong to one system;
- Greenvale should grow around its route to the west landing rather than sit as a dense building pile;
- river banks should mostly slope and vary naturally, with local reinforcement only near the bridge.

## 3. Premium stylized palette, lighting and physical-world feel

### Primary reference: Against the Storm

Official reference family: Eremite Games settlement screenshots and 3D World Map redesign.

Borrow conceptually:

- cohesive stylized material families with controlled midtone contrast;
- physical 3D terrain that still reads instantly as strategy space;
- clear separation of terrain, vegetation, roads, buildings and water through value/material hierarchy;
- roads that blend into terrain instead of looking like detached ribbons;
- authored atmosphere without sacrificing gameplay readability.

Do not copy:

- storm-dark survival mood;
- tile/grid presentation;
- dense fantasy clutter;
- glowing magical accents or UI language.

Aurelian application:

- muted earth/olive/moss terrain;
- deeper cool forest mass;
- warmer ochre fields;
- slate/stone ridge;
- restrained blue-green river/coast;
- warm settlement/bridge accents;
- soft directional shadows plus enough ambient fill to preserve roads and terrain hierarchy.

## 4. Road hierarchy and terrain-led settlement growth

### Primary reference: Manor Lords

Official reference family: Manor Lords store/press screenshots and developer description of gridless growth following landscape and trade routes.

Borrow conceptually:

- major routes visibly influence where settlement elements sit;
- roads curve with terrain and connect meaningful destinations;
- village composition has breathing room and follows landscape logic;
- fields/open land read as broad productive zones instead of decorative stripes.

Do not copy:

- photorealism;
- historical simulation density;
- late-medieval Franconian architecture;
- natural-camera realism that would weaken the cleaner strategic diorama view.

Aurelian application:

- Greenvale → west bridge approach is the primary visual spine;
- east landing → EastRoute remains visible at Map scale;
- Northgate, Old Road and North Ridge connections read as secondary hierarchy, not equally strong spaghetti paths;
- settlement clearings and buildings orient around roads rather than being scattered independently.

## 5. Biome transitions and friendly shape economy

### Secondary reference: Dorfromantik

Official reference family: Dorfromantik store screenshots.

Borrow conceptually:

- simple, friendly, readable landscape shapes;
- clean transitions between forest, fields, settlement and water;
- restrained detail that remains attractive from a high camera;
- coherent color blocking at strategic scale.

Do not copy:

- hexagons;
- tile boundaries;
- puzzle-board silhouette;
- pastel brightness that would make Pixel Nations too toy-like.

Aurelian application:

- use transition logic, not tile logic;
- fields should dissolve naturally into plains/marsh;
- forest edge should feather into Greenvale/open land;
- marsh should transition into coast/outflow without a hard material rectangle.

## Combined Aurelian target

The intended blend is:

**Northgard readability + Foundation geography integration + Against the Storm material/lighting discipline + Manor Lords route logic + Dorfromantik transition economy.**

It must NOT look like a collage of those games.

The final visual target should feel:

- premium rather than cute;
- stylized rather than realistic;
- tactile rather than flat;
- authored rather than procedural;
- continuous rather than tile-based;
- strategically readable rather than decorative.

## Topology lock for visual target

The visual target may not move major geography for aesthetics:

- Greenvale remains west of the river;
- ForestWorkEdge remains north-west;
- North Ridge remains north-east across the river;
- FieldsPlains remain south/south-east;
- South Marsh remains lower south;
- Gilded Crossing remains the east-west crossing around `[515,340]`;
- the canonical river remains continuous north → bridge → marsh → coast/outflow;
- Village / Map / World show the same geography with a consistent camera family.

## Visual-target instructions

Produce one bespoke non-production design package showing:

1. Village view: settlement + river + Gilded Crossing, with obvious west-road connection and dry approaches;
2. Map view: full primary road network and differentiated landmark zones;
3. World view: coherent Basin silhouette and natural southern outflow/coast;
4. optional bridge crop only if the Village view cannot prove the crossing construction clearly enough.

No UI, labels, hexes, borders, floating parcels, dashboard markers or visible board edge.

No implementation code should be written from this moodboard alone. The next gate is the bespoke visual target and direct review under `ART_DIRECTION_PASS / ART_DIRECTION_CORRECTION_REQUIRED / ART_DIRECTION_REJECT`.