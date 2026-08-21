# Godot Aurelian Render Asset Packaging v1 Contract

Status: AUTHORIZED AFTER MERGE
Owner: Pixel Nations Production Steward
Authority: `docs/PROJECT_CURRENT_STATE.md` on `main`
Accepted visual input: PR #463 `GODOT_PLAYABLE_AURELIAN_ENTRY_PASS`
Cost target: 0 USD

## Purpose

Make the accepted authored Aurelian render asset available to a clean Godot checkout and exported runtime without relying on an evidence workflow having run first.

PR #463 proved the player-facing entry after its focused workflow deterministically rebuilt the accepted GLB. The clean Foundation export intentionally retained a headless-safe path when that generated render asset was absent. This contract closes only that packaging gap. It does not reopen the accepted Village, Map, World, Decision Loop or Playable Entry presentation.

## Player outcome

A clean checkout and canonical Godot export must contain the accepted Aurelian Basin render asset required by the normal startup scene. A normal graphical launch with no evidence environment variables must enter Aurelian World instead of failing asset loading or using a diagnostic fallback.

## Accepted identity

The packaged asset must be derived from the existing accepted pipeline only:

- Blender 4.3.2;
- pinned KayKit commit `84fa4e91af6a88989be7c99e0891cede11f2ca38`;
- existing `game/assets/aurelian-basin/source/aurelian_authored_terrain_v1.py`;
- existing topology and transform contracts;
- existing Godot 4.7.1 Compatibility import path.

No geometry, transform, material, camera, overlay or interaction change is authorized.

## Allowed scope

Exactly one bounded implementation PR may change only what is required to materialize and package the accepted render asset:

- `game/assets/aurelian-basin/export/**` for the accepted derived GLB, manifest and import metadata when required;
- `.gitattributes` or existing ignore rules only when required for a repository-safe binary path;
- `game/tests/**` for clean-checkout asset identity and startup contracts;
- existing Godot Foundation or one focused packaging workflow for deterministic generation, digest verification, export and graphical launch evidence;
- minimal documentation of the canonical zero-cost generation command.

The implementation may choose a committed derived GLB or another repository-executable packaging path only if a clean checkout can launch and export without private storage, runtime downloads or a previously executed evidence workflow.

## Forbidden scope

- changes to accepted Aurelian geometry or presentation;
- new asset families, paid assets or image generation;
- Village, Map, World, HUD or interaction polish;
- `app/play/**`, public web integration or route changes;
- gameplay, persistence, save migration, economy, diplomacy, combat, multiplayer, backend, accounts, payments or crypto;
- P12, fake 10,000-land rendering, MAX or paid tools;
- runtime network download of the render asset;
- private artifact or owner-machine dependency.

## Exact evidence

The exact-head artifact must contain:

1. proof from a clean checkout that the startup render asset exists before evidence capture;
2. SHA-256 identity for the packaged GLB and transform manifest;
3. deterministic provenance linking the bytes to the pinned Blender, KayKit and source-script inputs;
4. Godot import and all existing Aurelian contract tests;
5. Linux and Web export proofs showing the asset is included;
6. one graphical normal-launch still with no evidence environment variables;
7. one native graphical launch smoke from the exported Linux build;
8. regression evidence showing the normal World entry matches the accepted PR #463 geography and HUD;
9. exact-head logs and manifest.

Green CI alone is insufficient. The graphical still must be reviewed directly.

## Acceptance

`GODOT_AURELIAN_RENDER_ASSET_PACKAGING_PASS` only if:

- a clean checkout launches accepted Aurelian content without first running Blender manually or an evidence workflow;
- Linux and Web exports contain the required render asset;
- the native graphical export launches successfully;
- packaged asset provenance is deterministic and public-repo reproducible;
- accepted Aurelian geography and presentation are unchanged;
- no runtime download, private storage, new asset family or wider product scope is introduced.

## Correction and stop

One meaningful candidate is allowed. Correctness or infrastructure repairs may only make the defined packaging evidence run. If direct evidence reveals one bounded packaging defect, one correction is allowed. No visual polish is authorized.

After direct exact-head review, classify only:

- `GODOT_AURELIAN_RENDER_ASSET_PACKAGING_PASS`;
- `GODOT_AURELIAN_RENDER_ASSET_PACKAGING_REJECT`.

Stop after terminal classification. No later product milestone is authorized by this contract.
