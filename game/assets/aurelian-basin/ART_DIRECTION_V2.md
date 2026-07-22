# Aurelian Basin Rebuild V2 — Binding Visual Contract

Status: `ART_DIRECTION_ACCEPTED_FOR_IMPLEMENTATION`

This contract replaces the visual direction of PR #288. The previous branch remains a mechanics reference only and must not be copied as scene composition.

## 1. Visual north star

Aurelian Basin is a handcrafted tabletop-scale grand-strategy diorama: one continuous geographic region with a river valley, wooded ridge, rocky shoulder, ford, roads and seven believable starting lands. It must read as a place before it reads as an interface.

The player should immediately understand: this is Sector A-01, one land can be chosen, and that land can become the origin of a settlement and eventually an empire.

Not allowed: floating hex pedestals, cylinders as terrain, box-strip rivers, neon outlines, dashboard panels dominating the scene, generic mobile-city-builder gloss or a full-screen generated painting used as gameplay.

## 2. Camera and scale

- Fixed orthographic 2.5D camera.
- Approximate pitch: 38–44 degrees downward.
- Approximate yaw: 30–38 degrees, looking from the south-east toward the north-west.
- The full basin remains visible at 1440×900 without camera movement.
- Terrain occupies roughly 72% of the frame; UI occupies no more than 18%.
- Buildings and trees are large enough to identify but never obscure land geography.

## 3. Terrain composition

Build one continuous basin, not seven separate platforms.

Required geography:
- a north-west wooded ridge;
- a central river bend and fertile meadow;
- an eastern rocky shoulder/pass;
- a southern open plain;
- one readable crossing or bridge;
- roads connecting the claimable land to at least two neighbouring lands;
- seven irregular but contiguous land regions implied by terrain, roads, rivers, ridges and vegetation.

Land boundaries must be understandable through geography first. A restrained ground-edge treatment may support interaction, but must not become a spreadsheet grid.

## 4. Land-state grammar

- Available: natural full-colour terrain with a very subtle warm-gold boundary accent.
- Hovered: slight material lift/brightness and a restrained animated edge pulse; no neon.
- Selected: clear gold boundary, raised land identity card and a small grounded marker.
- Claimable: selected state plus one concise `Claim Land` action.
- Claimed: persistent founder flag and a small first-settlement footprint; terrain remains visible.
- Locked/rival: slightly cooler/desaturated terrain with no interaction pulse.

The claim must visibly change the world, not only the UI.

## 5. Lighting, materials and palette

- Warm late-morning directional light.
- Soft readable shadows; no dramatic darkness.
- Restrained atmospheric depth, strongest at the far ridge.
- Painterly low-poly material language.

Palette:
- grass: muted olive and meadow green;
- soil/roads: ochre, warm sand and umber;
- stone: cool grey-brown;
- water: desaturated teal-blue;
- interaction accent: antique gold;
- claimed accent: deep Aurelian red with gold detail.

Black/gold belongs to UI accents, not the entire terrain.

## 6. HUD and safe zones

Geography dominates.

- Top-left: `SECTOR A-01` and `AURELIAN BASIN`, compact and cinematic.
- Bottom-right: one land card containing name, PN ID, one terrain trait and the claim action.
- No permanent table, resource bar, minimap or dashboard columns.
- UI must not cover the central river bend or the claimable land.
- Copy remains concise: `Choose where your history begins.`

## 7. Godot scene structure

Recommended structure:

```text
AurelianBasinV2
├── Environment
├── CameraRig
├── BasinTerrain
├── Water
├── Roads
├── LandRegions
│   ├── Hearthmeadow
│   ├── Northwood
│   ├── AmberFord
│   ├── Westwatch
│   ├── Sunfield
│   ├── Stonewake
│   └── Willowbank
├── Props
├── Interaction
└── HUD
```

Final visible geography must be authored from production meshes and scene composition. Primitive geometry is allowed only for invisible collision/debug helpers, never as the final terrain language.

## 8. Asset strategy and licensing

Only the pinned KayKit Medieval Hexagon Pack free tier at commit:

`84fa4e91af6a88989be7c99e0891cede11f2ca38`

License: CC0-1.0, already verified by the private asset gate.

Use only the curated classes already confirmed:
- grass/base and coast/water tiles;
- roads and sloped road pieces;
- hills/elevation pieces;
- trees and rocks;
- river crossing or bridge;
- flag/ownership marker;
- up to three small building types for the claimed-state settlement footprint.

Do not add a second pack, paid tier or unrelated generated 3D asset.

## 9. Evidence roles

- Moodboard: emotional direction only; not copied into the scene.
- Visual target: one generated concept frame used to judge composition, camera and hierarchy.
- Implementation reference: this document plus exact KayKit allowlist.
- Production assets: only verified KayKit files and Godot-authored materials/lighting.
- Acceptance evidence: exact-SHA native screenshot, raw claim-flow video and Web screenshot from the same project state.

## 10. Acceptance checklist

Pass only when all are true:
- the scene reads as a geographic basin without explanation;
- the seven lands are understandable without a visible spreadsheet grid;
- Hearthmeadow is visually discoverable and clearly claimable;
- claim creates a flag and first-settlement footprint in the world;
- camera framing is stable in native and Web;
- UI is secondary and concise;
- no primitive placeholder terrain remains visible;
- no mixed asset language;
- the screenshot is showable without apology.

## 11. Bounded implementation handoff

Implement only the first visual slice on branch `agent/aurelian-basin-rebuild-v2`.

Allowed files:
- `game/scenes/map/**`
- `game/ui/map/**`
- `game/assets/aurelian-basin/**`
- `game/project.godot`
- `game/tests/**`
- additive evidence changes in `.github/workflows/godot-ci.yml`

Reuse only the existing deterministic claim semantics and save/load behaviour. Rebuild the visible scene, camera, terrain, materials, states and HUD from zero. Import only the curated KayKit subset. Do not copy the procedural terrain construction from PR #288.

First implementation stop:
- authored continuous basin scene;
- seven land interaction regions;
- one claimable Hearthmeadow;
- claim flag and first-settlement footprint;
- native/Web build PASS;
- one exact-SHA screenshot and raw claim video.

No Village, World, economy, combat, backend, crypto or merge.

## 12. Top failure modes

1. KayKit hex pieces remain visibly tiled and the world still reads as a board/grid.
2. UI cards dominate the geography.
3. All lands look equally important and Hearthmeadow is not discoverable.
4. Claim changes text but not the physical world.
5. The result is merely cleaner than PR #288 rather than genuinely showable.
