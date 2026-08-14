# Aurelian Scene Import and Composition Calibration Contract v1

Status: PROPOSED
Issue: #415
Evidence source: rejected PR #429 exact head `be801c6aad0ea836210ef85929d8bc95c3152525`
Input artifact: `9222116061`
Input artifact digest: `sha256:d810b371584d1da404b1c34e64270c5d38158c74a7d775560b16fa2228cb6990`
Render-path control: PR #432 exact head `3d9845747db151e45a9dac32d9e8b7ef34b6d5a5`

## Purpose

Isolate the smallest scene, import, material, bounds, layer, or camera condition that turns the rejected PR #429 evidence black. This is a diagnostic calibration, not another Aurelian Basin candidate and not a visual correction pass.

PR #432 directly proved that Godot 4.7.1 Compatibility on Mesa llvmpipe can render the main viewport, a SubViewport, PNG readback, and movie capture at 1440x900. PR #429 therefore remains useful only as a pinned scene-specific input.

## Binding hypothesis order

The calibration must preserve one variable at a time and stop at the first failing boundary:

1. Render the accepted built-in sentinel from PR #432 in the calibration scene.
2. Download and verify artifact `9222116061`; use its exact exported GLB without Blender regeneration or geometry edits.
3. Instantiate the GLB beside the sentinel and record node count, mesh count, surface count, visibility, layers, transforms, global AABB, material classes, transparency, cull mode, shading mode, and texture references.
4. Frame the recorded global AABB with a deterministic perspective camera and render the sentinel plus GLB using an explicit unshaded diagnostic override material.
5. Render the same AABB and camera with the imported original materials.
6. Repeat steps 4 and 5 in a dedicated 1440x900 SubViewport whose texture is actively consumed by a visible TextureRect.
7. Only if perspective output is visible, repeat with the PR #429 orthographic camera contract.
8. Capture a short movie that switches among sentinel, override-material GLB, original-material GLB, and orthographic composition.

No stage may silently continue after black or empty output.

## Allowed scope

- `game/scenes/calibration/aurelian_import/**`
- `game/tests/aurelian_import_calibration/**`
- one narrow `.github/workflows/aurelian-import-calibration.yml`
- evidence manifests and this control-plane documentation

The workflow may use `actions: read` only to download the pinned same-repository artifact. Repository contents remain read-only.

## Forbidden

- Blender authoring or regeneration
- changes to the pinned GLB, topology, bridge, roads, terrain, or KayKit source
- edits to PR #429 or PR #432 branches
- any `app/play/**` change
- a new Aurelian candidate, visual polish, gameplay, integration, or Phase 2
- new dependencies, paid tools/assets, MAX, Fable, or image generation
- merge of calibration implementation into product code
- treating a green workflow or uploaded artifact as visual acceptance

Target extra spend: 0 USD.

## Required evidence

- exact input artifact ID, digest, internal GLB SHA, and calibration head SHA
- runtime and renderer manifest
- complete import log
- node, mesh, surface, material, layer, transform, and global AABB inventory
- camera and cull-mask manifests for every stage
- exact 1440x900 PNG for each stage in main viewport and SubViewport
- 6 to 12 second raw stage-switch movie at 1440x900
- pixel statistics, hashes, and stage-to-stage image deltas
- direct review of every still and representative movie frames

Every screenshot must retain the unmistakable sentinel. If the sentinel disappears, the stage is invalid rather than evidence against the GLB.

## Classification

Choose exactly one:

- `BLOCKED_ARTIFACT`: pinned evidence cannot be fetched or verified.
- `BLOCKED_IMPORT_EMPTY`: GLB imports without usable visible mesh surfaces.
- `BLOCKED_BOUNDS_OR_TRANSFORM`: inventory proves invalid, non-finite, extreme, or displaced bounds.
- `BLOCKED_CAMERA_OR_CULLING`: override material is visible only after camera, layer, cull-mask, or projection correction.
- `BLOCKED_MATERIAL_OR_TEXTURE`: override material is visible but original materials render black.
- `BLOCKED_SUBVIEWPORT_COMPOSITION`: main viewport is visible but the consumed SubViewport path is black.
- `PASS_SCENE_COMPOSITION_ISOLATED`: original materials and deterministic framing are visible in both paths, with the exact failing PR #429 composition difference identified.
- `INVALID`: provenance, stage isolation, dimensions, or required evidence is incomplete.

## Decision boundary

A technical PASS authorizes only strategy review and a later bounded recovery-contract proposal. It does not authorize another Basin candidate, reuse of #429 visuals, integration, or Phase 2.

A blocked classification must name the first failing stage and the smallest evidence-backed correction category. Do not rerun unchanged deterministic failure.

## Stop condition

Stop after one exact-head calibration artifact receives direct review and one classification above. Close the evidence PR without merge. Update `PROJECT_CURRENT_STATE.md` through a separate normal PR before any further implementation authority.
