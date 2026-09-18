# ADR-001 — Godot 4 desktop-first pivot

Status: **ACCEPTED — GODOT 4 PRODUCTION ENGINE LOCKED FOR CURRENT PHASE (~90 DAYS)**  
Date: 2026-07-21  
Engine-gate update: 2026-09-18  
Decision owner: GPT-5.6 with owner mandate  
Independent review: Fable #281

> **Terminal engine-gate verdict (2026-09-18):** Issue #731 is complete. Pixel Nations remains on Godot 4 for the current phase and the engine decision is locked for approximately 90 days unless a hard engine-level technical blocker appears. The final AI-native comparison proved both live editor workflows credible on the same Sector A-01 source, but Unity did not show a material end-to-end quality/workflow advantage large enough to repay migration of accepted gameplay, persistence, QA and production architecture. Godot also completed the final corrected 1440×900 benchmark frame and a real Web export successfully. Do not reopen engine benchmarking during this lock merely for a small visual/tooling difference.

## Binding decision

Pixel Nations will move its game runtime to **Godot 4**, using **GDScript** and one pinned stable 4.x version.

Distribution priority:

1. Windows desktop / Steam-quality build.
2. macOS and Linux desktop builds.
3. Browser export of the same Godot project as a lightweight demo.
4. Native Android and iOS only after the desktop vertical slice is accepted.
5. Consoles are a later business decision and may require a certified porting provider.

The current Next.js application remains frozen as:

- the working reference implementation;
- marketing and project website;
- browser-hosting shell for a future Godot web demo;
- rollback surface until Godot reaches acceptance parity.

It is no longer the target renderer for core game scenes.

## Why

Pixel Nations is a 2D/2.5D isometric strategy game. React DOM, CSS and SVG were useful for validating the product loop, but they produced scene composition, depth, camera, lighting and animation through hand-authored web layout primitives. That approach repeatedly generated dashboard-like visuals and recreated fragments of a game engine without an editor.

Godot provides the missing scene graph, camera, tile/grid tooling, depth ordering, 2D/3D lighting, particles, animation, shaders, native input and multi-platform exports in one MIT-licensed project. Its `.gd`, `.tscn` and resource files are text-based and compatible with bounded AI-agent review.

## Rejected alternatives

### Phaser inside Next.js

Rejected as disposable bridge work. It would add a React ↔ Phaser state seam, retain code-authored scene composition and still require a later Godot migration. Issue #280 is superseded.

### Unity 6

Credible runner-up and now directly benchmarked. Unity 6000.6.1f1 + official Pipeline/Codex tooling achieved a real live-editor `inspect -> edit -> Play Mode -> 1440x900 screenshot -> one self-correction` loop on the canonical Sector A-01 source. WebGL support is installed and the final WebGL build command validated and entered the real compilation pipeline.

The migration is still rejected for the current phase because the visible result did not show a material quality advantage over Godot, while the workflow carried materially higher setup/import/compile and licensing/editor overhead. The first Unity package/script compile took about 488 seconds, the first-run Software Terms/license path added setup friction, and a WebGL build remained materially heavier than the equivalent Godot Web export. Those costs do not repay migration of the accepted Godot gameplay, persistence, tests and production runtime.

Reconsider only after the current ~90-day engine lock if a hard Godot engine-level blocker appears. Do not reopen the comparison for small visual differences, tooling novelty or speculative future advantage.

### Unreal Engine

Rejected as excessive for a small-team stylized isometric strategy game. Pipeline weight, C++/Blueprint complexity, build size and royalty model do not improve the current probability of success.

### CryEngine

Rejected because of poor fit for 2D/2.5D strategy, narrow current platform/tool ecosystem and a 5% royalty model beginning after a low annual revenue exemption.

## Runtime architecture

Primary renderer direction: **stylized 2.5D using Godot 3D nodes and an orthographic camera**, unless the first art spike proves that a pure 2D isometric pipeline is materially faster without lowering quality.

Reason: reusable 3D buildings and terrain let one coherent asset set support Village growth, camera movement, lighting, shadows, animation, Local Map landmarks and later mobile/desktop scaling. They avoid the brittle full-frame image and subtraction-layer workflow that failed in the web renderer.

Initial renderer target: **Compatibility** to preserve browser export viability. The desktop product may later use a higher renderer only after a measured decision and without creating separate art pipelines.

Code rules:

- GDScript only during the first 90 days.
- Pure deterministic game state separated from scenes.
- Engine-neutral JSON for world data, copy and save schema.
- No C# unless profiling proves a real simulation bottleneck.
- No parallel rewrite of backend, multiplayer, combat or full economy.

## Preserve and port

Preserve as authoritative:

- product doctrine and scope documents;
- current playable loop and copy;
- existing deterministic state semantics;
- world truth: 100 × 100 lands, 10,000 total, Sector A-01 demo;
- QA intent and recorded action sequence;
- current web build as rollback/reference.

Port as data and behavior, not line-for-line code:

- play state, actions, selectors and persistence schema;
- world/sector/plot data;
- objective, order, crisis, rival and frontier-payoff copy;
- claim → settlement → nation → empire progression;
- golden-path QA assertions.

Archive, do not reuse as art direction:

- VillageScene DOM/SVG/CSS visuals;
- MapStage and WorldMapScene visual primitives;
- rejected crop/filter/snapshot techniques;
- comparison fixtures as production assets.

## AI production stack

- GPT-5.6: product/architecture/creative direction, task contracts and acceptance.
- Fable: strategy, art-direction and exact-evidence review.
- Codex/Cursor: bounded GDScript, tests, import tooling and safe refactors.
- Kimi K3/Kimi Code: trial as a supplementary long-context executor on isolated branches; never product owner and never automatic merge.
- Godot MCP: one local-first, open-source plugin selected after security and undo/rollback review; use it for scene inspection, node edits, screenshots and runtime errors.
- Blender plus a controlled MCP workflow: asset cleanup, modular buildings, UV/material consistency and exports.
- AI 3D/image tools: concept and draft acceleration only; final assets must pass style, topology, license and in-engine review.

## Checkpoints

### Day 7

- pinned Godot version;
- project skeleton;
- desktop and web export spike;
- deterministic state/save proof;
- one exact action-log parity test.

### Day 14

- claimable Aurelian Basin map in Godot;
- camera/input/HUD shell;
- persistence round trip;
- exact desktop evidence.

### Day 30

- land claim → visible Village growth loop;
- one coherent licensed asset language;
- at least three real development stages;
- desktop build and browser demo from the same project;
- direct GPT-5.6 and Fable go/no-go review.

### Day 90

A new player completes the entire vertical slice without narration:

`claim → settlement → nation → empire → crisis → rival → frontier payoff`

The build must save/reload correctly and be judged visually as a coherent strategy game rather than a dashboard.

## Rollback

The current Next.js `/play` build remains deployed and unchanged until the Day-30 checkpoint passes. Godot migration can be stopped without losing the existing prototype. No old runtime files are deleted before the Day-90 acceptance milestone.

## Immediate consequence

- Freeze new gameplay and visual implementation in the web runtime.
- Close Phaser issue #280 as superseded.
- Resume production in Godot under #721, prioritizing Map -> Sector -> World breadth and strategic readability.
- Contest submission is not a priority unless explicitly reopened by the owner.
