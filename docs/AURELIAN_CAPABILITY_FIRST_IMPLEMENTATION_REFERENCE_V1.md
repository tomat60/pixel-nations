# Aurelian Basin Capability-First Implementation Reference v1

Status: ACCEPTED FOR ONE BOUNDED IMPLEMENTATION REFERENCE
Date: 2026-08-17
Issue: #415
Topology authority: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
Product target: `docs/FINAL_PRODUCT_TARGET.md`

## Why this contract exists

The previous visual-target gate encouraged a free-form concept-art step that could drift beyond the assets, renderer, gameplay and production pipeline that Pixel Nations actually has. That is not useful as implementation authority.

For the next Aurelian step, implementation feasibility is part of art direction. The target must be made from techniques and assets we can really reproduce in Godot/Blender at zero additional cost.

This contract supersedes only the parts of `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md` that require a free-form image-generation target before any Godot/Blender work. Its topology, readability, river, bridge, road, palette and anti-board constraints remain qualitative guidance.

Generated concept art is moodboard/reference only and may never be used as proof that the runtime can reach that look.

## Proven technical envelope

Use only the proven production envelope unless a specific limitation is demonstrated:

- Godot 4.7.1 Standard;
- GDScript;
- GL Compatibility renderer;
- desktop-first 1280 × 720 runtime foundation;
- native desktop and web export from the same Godot project;
- deterministic Blender -> GLB -> Godot authoring/import is proven technically;
- exact-head headless import/tests/capture are proven;
- simple authored geometry, flat/PBR materials and low-poly props are preferred over expensive shaders or photoreal terrain.

## Proven zero-cost asset envelope

The already-tested KayKit CC0 source may be reused by exact pinned provenance. The previously proven subset includes:

- bridge;
- blacksmith;
- barracks;
- church;
- flag;
- two tree variants;
- two hill variants;
- two rock variants.

KayKit hex terrain pieces are not approved as visible terrain. Do not make Aurelian look like a hex board.

The bridge asset is provisional. Use it only if it can be embedded into both banks and joined to the road system. Otherwise make a simple custom low-poly bridge from basic geometry. Physical readability is more important than preserving the prefab.

No paid assets are authorized. No additional asset family should be introduced unless the bounded reference proves a named visual limitation that cannot be solved with terrain geometry, materials or the pinned CC0 set.

## Realistic visual target

The achievable target is a clean stylized low-poly strategy scene, not a cinematic fantasy landscape.

### Terrain

- one continuous irregular terrain mesh;
- broad height zones only: west shelf, north-west woodland rise, north-east ridge, south fields, lower southern marsh/coast;
- low-poly faceting is acceptable when intentional and clean;
- 5-7 restrained terrain/material families maximum;
- no photoreal displacement, no dense foliage simulation, no giant mountains outside gameplay needs;
- camera framing hides the finite mesh edge.

### River and coast

- use the locked river centerline from topology authority;
- broad shallow banks, gentle slope into water;
- simple blue-green water material;
- channel widens toward SouthMarsh / CoastOutflow;
- coast may terminate beyond the camera crop; do not build an expensive ocean system for this slice.

### Roads

Roads are gameplay information and must be more legible than decorative terrain detail.

Required visible routes:

- Greenvale -> Gilded Crossing;
- crossing -> EastRoute;
- crossing -> North Ridge;
- Greenvale -> Northgate;
- Old Road -> west landing.

Use simple terrain-conforming ribbons/meshes or shallow road cuts with enough width and contrast to remain visible from Map view.

### Gilded Crossing

The crossing must visibly read:

`road -> dry approach -> embedded ramp/abutment -> deck -> embedded ramp/abutment -> dry approach -> road`

Do not spend time on ornate bridge detail. A simple believable crossing is the target.

### Greenvale

The implementation reference needs a small readable settlement, not a finished medieval city.

Initial authored cluster:

- 3-5 buildings maximum;
- one small central clearing or road junction;
- visible road connection to the bridge;
- nearby field/work zone;
- enough spacing that individual structures read from Village view.

Use the pinned KayKit buildings as temporary production-reference props. Final building art is not being chosen in this slice.

## Gameplay-first geography

The geometry must help the player understand actions that already exist in the accepted product baseline.

### Land / claim

Greenvale is the obvious first homeland. Terrain zones must create visually understandable neighboring choices rather than equally shaped decorative regions.

### Settlement growth

Godot already preserves `CLAIM_LAND -> FOUND_SETTLEMENT -> COMPLETE_VILLAGE_ORDER` and food/timber rewards. The reference should therefore reserve stable transforms for visible settlement stages rather than baking one static finished village.

For the reference, it is enough to prove three visual states using the same scene:

1. claimed land / settlement origin;
2. founded settlement with first structures;
3. developed settlement with a visible food/work addition.

Do not implement the full web gameplay reducer in this visual PR.

### Expand / Scout

The accepted web baseline uses parcels, terrain types and scouting/expansion decisions. Map view must therefore preserve readable terrain zones and space for restrained parcel hit areas/fog later. Parcel boundaries are interaction overlays, not terrain geometry.

### Trade

EastRoute and the Gilded Crossing are the natural first trade story. The road network must make this obvious without requiring explanatory UI.

### Secure / frontier

North Ridge and Northgate provide clear future pressure/frontier anchors. They need distinct silhouettes, but no combat system is authorized.

## Village, Map and World roles

### Village

Same Aurelian scene, closest camera.

Purpose:

- see the claimed land become a settlement;
- see buildings and work/food additions appear;
- understand the road, river and bridge relationship.

No separate Village geography.

### Map

Same Aurelian scene, higher camera/LOD.

Purpose:

- choose land;
- understand terrain/resource categories;
- understand routes and neighboring opportunities;
- later support restrained parcel hit areas, scouting state and ownership state.

The Map is not an illustrated atlas and is not an SVG redraw of the world.

### World

For this vertical slice, World means the strategic Aurelian Basin context, not a fully rendered 10,000-land planet.

The final product target explicitly does not require the full 10,000-land live world or final globe/map system for the first polished playable version. Therefore:

- show the full Aurelian Basin and its outward routes/frontier context;
- keep Greenvale and the crossing recognizable anchors;
- reserve the 10,000-land truth for the logical/global data layer and later sector/world navigation;
- do not build or fake 10,000 detailed 3D lands in this milestone.

This prevents the current demo from spending months on a global renderer before the first village works.

## Camera/LOD rule

Village, Map and current World use the locked shared topology and one scene. Cameras/LOD may change:

- prop visibility;
- vegetation density;
- settlement detail;
- interaction overlays;
- material simplification.

They may not move or redraw the river, bridge, roads or major landmarks.

## First bounded implementation reference

Build exactly one desktop-first shared-scene greybox/reference.

Allowed files/categories:

- `game/scenes/aurelian/**`;
- `game/assets/aurelian-basin/**`;
- `game/tests/**` for Aurelian transform/state checks;
- one deterministic Blender source under `game/assets/aurelian-basin/source/**` if needed;
- one narrowly scoped evidence workflow if existing Godot CI cannot capture the required evidence.

Implementation order:

1. terrain silhouette and five macro height/terrain zones;
2. river + marsh/outflow;
3. roads;
4. Gilded Crossing with dry approaches;
5. minimal Greenvale 3-5 building cluster;
6. forest/rocks/hills as sparse landmarks;
7. Village / Map / World cameras;
8. three settlement visual states wired only to a deterministic test/capture driver, not new gameplay systems.

Do not polish props before geography passes.

## Forbidden in this slice

- image generation as implementation authority;
- photoreal/cinematic target matching;
- new paid assets/tools;
- MAX;
- Fable;
- new dependency families;
- `app/play/**` visual reauthoring;
- P12 / Phase 2;
- backend/accounts/payments/multiplayer/combat/full economy/crypto;
- global 10,000-land renderer;
- final production building set;
- full foliage simulation;
- terrain shader R&D unless a proven blocker appears.

## Evidence

Candidate must provide from one exact head:

- 1280 × 720 or 1440 × 900 Village still;
- same-size Map still;
- same-size World/Aurelian strategic still;
- 15-30 second raw Village -> Map -> World camera-switch video;
- transform manifest for river, bridge, roads and landmarks;
- asset/provenance manifest;
- screenshot or stills for the three settlement visual states;
- Godot import/test result;
- no script/import errors.

Direct review asks only:

1. Is this clearly one geography at all three scales?
2. Does Greenvale read as a place that can visibly grow?
3. Are river, crossing and roads believable and useful to gameplay?
4. Can Map support claim/scout/expand/trade without redrawing geography?
5. Does current World communicate wider strategic context without pretending the full 10,000-land renderer already exists?
6. Is the visual quality clean enough to iterate from using our actual tools/assets?

## Classification

- `IMPLEMENTATION_REFERENCE_PASS`: geography and visual language are feasible and clear; continue toward settlement progression polish.
- `IMPLEMENTATION_REFERENCE_CORRECTION_REQUIRED`: one bounded correction to geography/readability.
- `IMPLEMENTATION_REFERENCE_REJECT`: technique is still wrong; do not polish it.

One correction pass maximum before changing technique.

## Executor / cost

Default executor: Cursor GPT-5.5 without MAX after this contract is merged.

Extra spend target: 0 USD.

Cursor receives this contract as execution authority. Cursor may not invent a more expensive art direction.

## Stop condition

Stop after one directly reviewed exact-head implementation-reference package and classification. The goal is to get Pixel Nations back to building a real Village, not to produce another aspirational image.