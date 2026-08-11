# Aurelian Basin Phase 1 Recovery Contract v1

Status: **ACCEPTED FOR ONE BOUNDED IMPLEMENTATION CANDIDATE**  
Date: 2026-08-11  
Authority: `docs/PROJECT_CURRENT_STATE.md` + issue #415  
Replaces: the rejected primitive polygon/ribbon technique from PR #426  
Preserves: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`

## Decision

The next candidate must be materially different from PR #426.

Use one terrain-first Aurelian Basin authored as a single canonical Blender scene and exported once to Godot. Village, Map and World remain three orthographic cameras over that same imported geometry. Godot may control cameras, LOD and evidence capture; it may not procedurally redraw the terrain, river, roads or bridge as disconnected runtime ribbons and floating primitives.

This is a zero-cost implementation contract, not production acceptance.

## PR #426 postmortem

Accepted rough reference:

- one deterministic topology-to-world transform;
- one node namespace for landmarks;
- three cameras sharing one scene;
- pinned Godot and KayKit provenance;
- deterministic topology tests and exact-head artifact capture.

Rejected visible technique:

- flat polygon basin without authored landform hierarchy;
- river and roads represented as overlaid ribbons that were not legible in evidence;
- bridge asset placed without carved banks, dry landings, ramps or continuous approach roads;
- detached rectangular coast/outflow;
- sparse object placement that made camera changes read only as zoom levels;
- OS-window capture that produced 1440×810 while asserting 1440×900.

The replacement may reuse the topology data and evidence concepts. It may not reuse the rejected runtime mesh construction as the visible scene.

## Replacement technique

### One authored source scene

Create one canonical source under `game/assets/aurelian-basin/source/**`:

- deterministic Blender Python authoring script;
- generated `.blend` source or reproducible export input;
- one glTF/GLB export consumed by Godot;
- one transform/provenance manifest generated from the same source coordinates.

The script must be repeatable without paid add-ons, image generation or external services.

### Continuous terrain

The Basin must be one connected terrain mesh with intentional height hierarchy:

- Greenvale on readable west-bank low ground;
- North Ridge raised on the north-east;
- forest/work edge raised or broken on the north-west;
- fields/plains open to the south/south-east;
- South Marsh lowered before the coast;
- coast/outflow integrated into the terrain boundary.

A flat octagonal island is forbidden.

### Carved river and banks

The locked river centerline remains authoritative.

The river must be implemented as:

- a channel cut below the surrounding terrain surface;
- continuous west/east bank geometry;
- visible water nested inside the channel;
- widening and bank transition toward South Marsh and CoastOutflow;
- no detached water rectangle and no water ribbon floating on the terrain.

At each accepted centerline sample, the manifest must record terrain bank heights and water height.

### Physical bridge continuity

`Bridge_GildedCrossing` must read in the closest frame as:

`west road → dry approach → ramp → abutment → deck → abutment → ramp → dry approach → east road`

Required proof:

- deck spans the carved channel approximately east-west;
- both abutments intersect stable dry terrain;
- approach-road endpoints meet the ramps without gaps;
- bridge deck is above water and below neither bank;
- no bridge asset is accepted from transform coordinates alone.

KayKit may supply the bridge/buildings/props from the existing pinned CC0 commit. Terrain, banks and road continuity are authored specifically for the Basin.

### Roads conform to terrain

Roads must be authored as curves projected onto or slightly embedded in the terrain, then exported with the shared scene.

They must remain visible at Map scale and connect:

- Greenvale to the west bridge landing;
- east bridge landing to EastRoute;
- Greenvale to Northgate;
- bridge/east route to North Ridge;
- Old Road to the west landing.

Disconnected decorative strips are forbidden.

### Camera composition

All cameras share:

- one scene root;
- one north orientation;
- one azimuth and pitch family;
- one light/environment;
- identical landmark transforms.

Composition targets:

- Village: Greenvale plus the complete bridge and both landings occupy 70–82% of useful frame;
- Map: river, roads, Greenvale, bridge, North Ridge, Northgate, fields and marsh occupy 75–85%;
- World: the full Basin, river entry and coast outflow occupy 70–80%.

Village must establish physical bridge credibility. Map must establish route comprehension. World must establish the complete Basin silhouette and outflow. The camera presets may change framing and LOD only.

## Godot boundary

Godot imports the shared scene and owns:

- `AurelianBasin` root;
- `Camera_Village`, `Camera_Map`, `Camera_World`;
- visibility/LOD groups;
- deterministic capture controller;
- import and topology tests.

Godot must not regenerate alternate terrain, river, bridge or road geometry per camera.

Compatibility renderer remains required.

## Exact viewport capture

Evidence must render through an explicit 1440×900 `SubViewport` or equivalent off-screen target. Do not infer content size from an OS window.

The QA step must inspect actual PNG dimensions before upload. Video may use 1280×720 or 1440×900, but its native resolution, codec, frame rate and duration must be recorded.

## Allowed files

- `game/assets/aurelian-basin/source/**`
- `game/assets/aurelian-basin/export/**`
- `game/scenes/aurelian/**`
- `game/tests/**`
- one narrowly scoped deterministic evidence workflow
- transform/provenance/evidence manifests

No dependency installation is authorized.

## Forbidden

- `app/play/**` changes;
- gameplay, reducer, persistence or copy changes;
- P12, retention or onboarding work;
- separate Village/Map/World terrain;
- reuse of PR #426 primitive polygon/ribbon rendering as the visible candidate;
- hex/base tiles, floating parcels or dashboard marker fields;
- image generation or generated full-frame runtime art;
- paid assets, paid tools or MAX;
- second asset family;
- backend, auth, payments, crypto, multiplayer, combat or full economy;
- Phase 2 integration;
- merge from green CI or artifact presence alone.

## Required deterministic validation

- Blender authoring/export completes from a clean checkout;
- Godot imports the one exported scene without parse/import errors;
- existing Godot foundation tests pass;
- topology test validates canonical landmark coordinates;
- river channel is continuous from north entry to CoastOutflow;
- bridge deck, ramps, abutments and road endpoints meet within named tolerances;
- all cameras reference the same imported node paths;
- evidence PNGs are exactly 1440×900;
- manifest identifies Blender version, Godot version, renderer, source hash, export hash and exact PR head.

## Required direct evidence

- Village 1440×900 still;
- Map 1440×900 still;
- World 1440×900 still;
- bridge close-up proving banks, ramps, abutments and road joins;
- one 15–30 second raw camera-switch video;
- transform/provenance manifest;
- deterministic QA JSON;
- exact-head logs.

The review must open every still, the bridge close-up, representative video frames, JSON and manifest. It must judge landscape readability, not merely geometric consistency.

## Candidate stop condition

Produce exactly one replacement candidate, then stop.

- `PASS`: the same believable Basin, continuous river, connected bridge and route hierarchy are readable at Village, Map and World scale; only then may Phase 2 be proposed.
- `CORRECTION REQUIRED`: one named evidence-backed correction pass is allowed.
- `REJECTED`: close without merge and return #415 to strategy review.

No P12 is allowed in any outcome.
