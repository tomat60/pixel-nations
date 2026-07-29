# Pixel Nations — Manual Blender Aurelian Basin Session

Status: `GUIDED INTERACTIVE AUTHORING / COST 0 PLN / MAX OFF`

This session creates one manually composed Aurelian Basin master. It is not a procedural layout pass and must not reuse the rejected PR #311 composition.

## Product target

The frame must communicate one clear route:

`open southern land → road → river crossing → blacksmith → commons → rear church landmark`

The scene supports the core fantasy **one land can become an empire**. It is a static art-direction frame only.

## Locked inputs

- KayKit Medieval Hexagon Pack 1.0 commit: `84fa4e91af6a88989be7c99e0891cede11f2ca38`
- License: CC0-1.0
- Expected source archive SHA-256: `cfa7faff403c93fb90e8eeb448c78e6192782802a532bebed0bdb853b39f7028`
- Accepted blueprint head: `3c61f8ade5e582da9798ce8a6f1bc9ac69ecebe2`
- Uniform imported asset scale: `11.71437541`
- Primary silhouette overlap cap: `30%`
- Minimum separation: home↔home `14 m`, home↔primary `18 m`, primary↔primary `22 m`
- Road width `5 m`; bridge deck `6 m`; clear span `27 m`

## Asset source

Download the exact pinned archive in a browser:

`https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0/archive/84fa4e91af6a88989be7c99e0891cede11f2ca38.zip`

Do not substitute a newer commit during this session.

## Curated roles

Use only this KayKit family:

- church: `building_church_red.gltf`
- blacksmith: `building_blacksmith_red.gltf`
- barracks: `building_barracks_blue.gltf`
- home A: `building_home_A_green.gltf`
- home B: `building_home_B_yellow.gltf`
- market: `building_market_yellow.gltf`
- well: `building_well_blue.gltf`
- crossing: `building_bridge_A.gltf`
- trees: `tree_single_A.gltf`, `tree_single_B.gltf`
- rocks: `rock_single_C.gltf`, `rock_single_E.gltf`

Color variants remain one asset family. Red roofs must not dominate the frame.

## Clean file rule

Start from a new Blender file. Do **not** open either rejected `.blend` as the production base. The four images in `references/rejected/` are failure references only.

Create these collections:

- `00_REFERENCE`
- `10_TERRAIN`
- `20_RIVER_BANKS`
- `30_ROAD_CROSSING`
- `40_SETTLEMENT_DESKTOP`
- `50_SETTLEMENT_PORTRAIT`
- `90_CAMERAS_LIGHTS`

Save immediately as:

`pixel-nations-aurelian-basin-manual-v01.blend`

## Milestone 1 — terrain silhouette only

Do not import buildings yet.

1. Create one terrain plane large enough to exceed the desktop camera on every side.
2. Shape three readable land masses within one continuous surface:
   - northwest wooded ridge;
   - eastern rocky shoulder;
   - southern open plain.
3. Carve a recessed river bend through the terrain. No separate floating terrain sheets.
4. Set a provisional orthographic desktop camera using the blueprint as a guide.
5. Keep all terrain boundaries outside the camera frame.

Required screenshots:

- `M1-desktop-camera.png` — desktop camera view;
- `M1-top-view.png` — top view with camera bounds visible;
- `M1-outliner.png` — collections and object names visible.

Stop after these three screenshots. Do not add bridge, road, buildings, trees or rocks before direct review.

### Milestone 1 acceptance

- no rectangular board edge inside the camera;
- one continuous basin surface;
- river bend readable without color labels;
- southern approach has enough empty space;
- ridge and eastern shoulder frame the settlement area without forming walls;
- camera has a clear lower-left approach and rear-right landmark zone.

## Later milestones

2. River material, natural banks, road and proportional official crossing.
3. Desktop hierarchy: blacksmith approach, commons, homes/market/well, barracks flank, rear church.
4. Independent portrait collection and camera; never crop the desktop arrangement.
5. Neutral lighting and material review.
6. Only after direct approval: GLB export and Godot 4.7.1 proof.

## Forbidden during the manual pass

- Python or GDScript object placement;
- importing the rejected procedural layout as a base;
- gameplay, HUD, backend or GameState changes;
- second asset family;
- merge, deployment, payment or MAX;
- adding detail before the current milestone is accepted.

## Visual stop rules

Stop and correct the composition immediately when any of these appear:

- visible terrain rectangle;
- giant wall-like bridge;
- road that disappears before reaching the settlement;
- church blocking the commons;
- more than 30% overlap between primary silhouettes;
- portrait behaving like a distant overview or a desktop crop;
- yellow-white wash or clipped materials.
