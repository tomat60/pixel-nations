# Aurelian Basin Shared Topology v1

Status: **ACCEPTED — PHASE 0 TOPOLOGY PASS**  
Date: 2026-08-10  
Authority: `docs/PROJECT_CURRENT_STATE.md` + issue #415  
Purpose: one canonical geography for Village, Map and World before Godot implementation.

## Decision

Village, Map and World are not separate authored landscapes. They are camera/LOD presentations of one `AurelianBasin` scene.

The accepted Phase 0 topology preserves useful semantic relationships from the current playable data while explicitly rejecting the mutually inconsistent river/bridge geography of the current web Village, Map and World visuals.

This document is topology and composition authority, **not final art**.

## Canonical coordinate plane

- root: `AurelianBasin`
- authoring plane: `1000 × 900`
- origin: north-west `(0,0)`
- positive X: east
- positive Y: south
- implementation may scale units for Godot, but every shared landmark must use one deterministic transform from this plane.

## Canonical landmarks

| Node | X | Y | Role |
|---|---:|---:|---|
| `GreenvaleOrigin` | 354 | 285 | founder settlement origin |
| `Bridge_GildedCrossing` | 515 | 340 | only primary river crossing in the proof |
| `NorthRidge` | 700 | 205 | highland/frontier landmark |
| `ForestWorkEdge` | 245 | 205 | timber/work edge |
| `FieldsPlains` | 405 | 505 | food/open-growth terrain |
| `OldRoadJunction` | 425 | 405 | west approach / local route junction |
| `EastRoute` | 760 | 410 | eastern trade/frontier route |
| `SouthMarsh` | 365 | 690 | wetland transition |
| `CoastOutflow` | 610 | 875 | river exit to outer water/coast |
| `Northgate` | 445 | 65 | route toward the wider world |

These positions are shared transforms. Camera presets may hide or simplify nodes but may not move, mirror, redraw or independently replace them.

## River contract

Canonical river centerline control points:

```text
(505,0)
(500,105)
(520,215)
(505,315)
(525,430)
(505,555)
(535,680)
(580,800)
(610,900)
```

Meaning:

- river enters from the northern basin;
- passes east of Greenvale;
- remains a continuous landscape feature through local, map and strategic views;
- flows toward the southern coast / outer-water boundary;
- bank width, water width, material and LOD may change with scale, but centerline topology does not.

## Bridge contract

`Bridge_GildedCrossing` center: `(515,340)`.

Deck endpoints:

```text
west landing: (455,340)
east landing: (575,340)
```

The local river direction is approximately north-south at the crossing, so the deck runs approximately east-west and perpendicular to local flow.

Mandatory physical read:

`west road → dry-ground approach → ramp/abutment → deck → abutment/ramp → dry-ground east approach → east road`

The bridge must never read as a dam, wall, isolated prefab or object sitting parallel to the river.

### Approach routes

West / Greenvale approach:

```text
(354,285) → (420,315) → (455,340)
```

East approach:

```text
(575,340) → (650,375) → (760,410)
```

## Primary route relationships

### Old Road

```text
(210,520) → (310,470) → (425,405) → (455,340)
```

### East Trade Route

```text
(575,340) → (650,375) → (760,410) → (910,455)
```

### North Ridge Route

```text
(575,340) → (625,300) → (665,250) → (700,205)
```

### Northgate Route

```text
(354,285) → (390,210) → (420,130) → (445,65)
```

## Terrain relationships

The Phase 1 proof must read spatially as:

- Greenvale on the **west side of the river**, close enough to the crossing for Village framing;
- forest/work edge **north-west** of Greenvale;
- North Ridge/highland **north-east** across the river;
- fields/plains **south / south-east** of Greenvale;
- eastern farms beyond the bridge/east route;
- marsh transition farther south;
- river reaching the southern coast/outer water.

Exact terrain mesh contours are art-direction work. These relative relationships are locked.

## Camera presets

All three cameras point into the same shared scene. The rectangles below are authoring-plane framing targets, not final Godot pixel viewports.

### `Camera_Village`

Approximate frame: `(155,135) → (625,505)`.

Purpose:

- settlement growth and local infrastructure;
- must include Greenvale, the bridge, forest/work edge and fields/plains;
- bridge must remain geographically credible at the closest scale;
- no separate portrait geography: portrait changes camera framing only.

### `Camera_Map`

Approximate frame: `(70,55) → (900,790)`.

Purpose:

- Sector A-01 / local-land selection and route comprehension;
- terrain first, interaction second;
- must preserve Greenvale, bridge, North Ridge, Northgate and southern wetland relationship;
- plot boundaries may appear later as restrained interaction surfaces, never as the terrain source.

### `Camera_World`

Frame: full `(0,0) → (1000,900)` basin plane for the current proof.

Purpose:

- strategic Aurelian view with sparse ownership, pressure, frontier and objective signals;
- same geography and transforms as Village/Map;
- no 25-button marker field and no dashboard-first composition;
- the product truth remains a 100 × 100 / 10,000-land world; the current demo does not need to draw 10,000 visible tiles to communicate that truth.

## Godot shared-node contract

Phase 1 scene graph must keep these transforms under one root:

```text
AurelianBasin
├── Terrain
├── River
├── Bridge_GildedCrossing
├── Roads
├── GreenvaleOrigin
├── NorthRidge
├── ForestWorkEdge
├── FieldsPlains
├── SouthMarsh
├── CoastOutflow
├── Camera_Village
├── Camera_Map
└── Camera_World
```

LOD/state groups may change visibility and detail. They must not create alternate river, bridge, road or landmark transforms for a specific screen/orientation.

## Semantic screen roles

- **Village**: `one land → visible settlement growth`.
- **Map**: local land, routes, selection and claim context inside Sector A-01.
- **World**: strategic pressure/ownership context and the sense that this local history exists inside the finite 10,000-land world.

The views may expose different information. They may not depict different geography.

## Phase 0 direct review

Verdict: **PASS**.

Reasons:

1. one canonical coordinate plane exists;
2. one river has a continuous north-to-south/coast topology;
3. the bridge crosses approximately perpendicular to local flow;
4. both bridge ends land on dry-ground approach routes;
5. Greenvale, North Ridge, forest/work edge, fields/plains, marsh and outer-water relation are explicit;
6. Village, Map and World are camera presets over the same geometry;
7. node names/transforms prevent orientation- or screen-specific reauthoring;
8. the topology preserves useful gameplay semantics without preserving rejected web art.

Minor label density in the schematic review board is irrelevant to topology acceptance; it is not production UI/art.

## Phase 1 authorization

One bounded desktop-first Godot continuity proof under issue #415 is now allowed.

Allowed implementation scope remains the #415 Phase 1 scope:

- `game/scenes/aurelian/**`
- `game/assets/aurelian-basin/**`
- `game/tests/**`
- narrowly scoped evidence/export workflow if needed
- transform/provenance manifest required for evidence

Still forbidden:

- web visual reauthoring under `app/play/**`;
- gameplay/reducer/persistence expansion;
- P12;
- backend/accounts/payments/multiplayer/combat/full economy/crypto;
- separate Village/Map/World geography;
- image-generation-as-runtime-art;
- paid assets/tools before a named limitation is proven;
- merge based on green CI alone.

## Phase 1 evidence / stop condition

Produce exactly one shared-scene candidate and then stop for review with:

- desktop Village still;
- desktop Map still;
- desktop World still;
- 15–30 s raw camera-switch video;
- transform manifest showing the same river, bridge and landmark transforms for all three cameras;
- exact head SHA and native viewport/export identity;
- build/import/test result.

One named correction pass maximum. If the same shared-geography technique still fails direct visual review after that correction, reject it before product integration.
