# Pixel Nations — Engine Pivot Spike

## Decision

Pixel Nations keeps the existing Next.js application as the product shell, routing, HUD, persisted demo state and QA surface. React DOM, CSS and legacy SVG are no longer the preferred renderer for core game scenes.

The first bounded engine spike uses Phaser inside the existing `/play` route.

## Why Phaser first

- Browser-native and compatible with the current TypeScript/React stack.
- Provides a real scene graph, display list, cameras, input, asset loader, animation/tweens and WebGL/Canvas rendering.
- Allows one-screen migration without discarding current mechanics or rewriting the whole product.
- Free MIT-licensed framework.

Godot remains a later full-engine option if Pixel Nations moves beyond the browser-first vertical slice into a standalone deeper game. It is not the immediate migration target because it would require a separate project/export pipeline and a larger state/UI integration rewrite.

## Spike goal

Prove that one Village scene rendered by Phaser can look and behave materially better than the current React/SVG/CSS Village while consuming the same existing gameplay state.

## Exact scope

Allowed:

- `package.json` and lockfile for one Phaser dependency;
- `app/play/engine/**`;
- one bounded React mount/adapter in the current Village stage;
- a small coherent, license-verified isometric asset subset under `public/game-assets/engine-spike/**`;
- focused QA updates required to capture the spike.

Forbidden:

- reducer/state schema changes;
- persistence changes;
- order logic changes;
- Local Map or World implementation;
- Village V1 visual reuse inside the Phaser canvas;
- CSS/SVG/glow/blob substitutes for missing art;
- broad HUD, navigation or layout redesign;
- new backend, account, multiplayer or economy work.

## Required proof

The spike must show, from one fixed isometric camera:

1. coherent terrain and depth sorting;
2. at least three readable structures from one consistent asset language;
3. one real order adding a structure or district element;
4. bounded construction animation using engine objects, not a full-screen crossfade;
5. unchanged existing state and click/order flow;
6. exact-SHA desktop/mobile screenshots and raw progression video.

## Acceptance

Accept only if an uninformed viewer immediately reads a game scene rather than a dashboard, diagram or decorated webpage, and the result is clearly stronger than current Village V1.

## Timebox

- Architecture and state bridge: 45 minutes.
- First coherent scene: 75 minutes.
- QA and direct visual review: 45 minutes.

Maximum: 3 hours for the first verdict.

## Stop condition

- PASS: engine scene clearly improves depth, coherence and game readability without breaking mechanics. Continue Village migration.
- FAIL: result remains asset-poor, dashboard-like or requires broad rewrite. Close the spike without merge and evaluate a Godot micro-prototype or an external art-kit-first route.

No merge based only on green CI.