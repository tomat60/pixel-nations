# Godot Render-Path Calibration Contract v1

Status: PROPOSED
Scope: #415 strategy recovery after rejected PR #429
Cost mode: 0 USD, MAX OFF
Product content: NONE

## Decision

Before any further Aurelian Basin implementation candidate, isolate the black-frame failure observed in PR #429 with exactly one bounded, zero-art Godot render-path calibration.

This calibration is infrastructure evidence. It is not a Phase 1 art candidate, does not consume a visual correction pass, and cannot authorize integration by itself.

## Question to answer

Under the same GitHub Actions environment used by PR #429, where does visible output first become black?

The gate must distinguish:

1. main viewport rendering;
2. SubViewport rendering;
3. still-image capture;
4. movie capture.

## Allowed files

- `game/scenes/calibration/render_path/**`
- `game/tests/render_path_calibration/**`
- exactly one narrow workflow: `.github/workflows/godot-render-path-calibration.yml`
- this contract and `docs/PROJECT_CURRENT_STATE.md`

No other files are authorized.

## Required calibration scene

Use Godot 4.7.1 Compatibility and the same headless/llvmpipe CI class as PR #429.

The scene must contain only deterministic built-in resources:

- an unmistakable non-black WorldEnvironment or clear color;
- one large unshaded primitive mesh with a high-contrast color;
- one Camera3D with explicit transform, current state and cull mask;
- one direct light only if the unshaded material does not make it unnecessary;
- one main-viewport proof;
- one separately configured SubViewport proof.

No Blender, GLB, KayKit, external assets, Aurelian geometry, gameplay, product UI, paid tools, image generation, Fable, MAX or new dependency is allowed.

## Required assertions

The exact-head run must record and assert:

- Godot version, renderer, rendering method, display driver and GPU/CPU renderer identity;
- active camera path, transform, projection, cull mask and environment for each viewport;
- viewport size, update mode, render-target state and capture frame timing;
- nonzero visible geometry count before capture;
- exact output dimensions;
- non-black pixel count, unique-color count, variance and SHA-256 for every PNG;
- movie duration, dimensions, frame count and representative-frame statistics;
- no unexpected imported or external resource.

## Required evidence

Upload one immutable exact-head artifact containing:

- `main-viewport.png`;
- `subviewport.png`;
- a 5 to 10 second raw movie that switches or juxtaposes the two proofs;
- representative movie frames;
- `runtime.json`;
- `camera-main.json`;
- `camera-subviewport.json`;
- `capture-qa.json`;
- `SHA256SUMS.txt`;
- complete Godot stdout/stderr.

Every PNG must use an explicit 1440 by 900 viewport unless the workflow documents a smaller diagnostic capture in addition to, not instead of, the required output.

## Classification

Directly inspect all stills and representative movie frames on the exact head.

- `PASS`: main viewport, SubViewport, PNG capture and movie capture all show the expected high-contrast primitive and background with deterministic non-black statistics.
- `BLOCKED_MAIN_VIEWPORT`: main viewport proof is black. Stop and diagnose renderer/display infrastructure.
- `BLOCKED_SUBVIEWPORT`: main viewport is visible but SubViewport is black. Stop and diagnose SubViewport configuration or Compatibility behavior.
- `BLOCKED_STILL_CAPTURE`: live viewport evidence is visible but PNG output is black. Stop and diagnose frame timing/readback.
- `BLOCKED_MOVIE_CAPTURE`: stills are visible but movie frames are black. Stop and diagnose movie capture.
- `INVALID`: missing exact-head identity, missing artifact, wrong dimensions, non-deterministic output, or scope drift.

No blind rerun of an unchanged deterministic failure is allowed.

## Follow-up authority

A calibration `PASS` permits only a strategy review of whether to authorize one fresh Aurelian candidate and whether PR #429 rough-reference source/GLB/tests may be reused. It does not itself authorize that candidate.

Any blocked classification permits only the smallest render/capture infrastructure diagnosis or correction under a fresh contract update. Do not touch Aurelian art while the calibration remains blocked.

## Stop condition

Stop after one exact-head calibration artifact has been directly reviewed and classified. No Phase 1 candidate, Phase 2, integration, P12, web visual rebuild, gameplay change or product merge is allowed by this contract.
