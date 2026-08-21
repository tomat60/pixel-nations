# Godot Web Export Playability v1 Contract

Status: AUTHORIZED AFTER MERGE
Owner: Pixel Nations Production Steward
Authority: `docs/PROJECT_CURRENT_STATE.md` on `main`
Accepted inputs: Godot Playable Aurelian Entry v1 and Godot Aurelian Render Asset Packaging v1
Cost target: 0 USD

## Strategy decision

The smallest next risk is browser-runtime parity, not another gameplay or visual slice.

The canonical Web export now contains the accepted packaged Aurelian asset, but the repository has not yet proved that a real browser can load the exported canvas and complete the accepted player-input path. This milestone closes that single gap before any public web-shell integration is considered.

It does not deploy or replace the current Next.js `/play` rollback surface.

## Player outcome

A fresh Godot Web export served from a local static HTTP origin must open in Chromium and allow the same accepted session-local path:

`World neutral -> Trade selected -> Map East Route -> Village route context -> Map -> World`

The browser must use the normal project entry and normal keyboard input. Evidence-only Godot environment variables may not select states or drive transitions.

## Accepted identity

The candidate must preserve:

- Godot 4.7.1 Compatibility renderer;
- the packaged GLB SHA256 `04116e3d662d461f0d29ca797444193b0873f5aba6012790af7d366c63e01048`;
- the accepted Aurelian startup scene;
- the exact handoff `Direction_EastTrade -> Land_EastRouteSelected -> GreenvaleTradeRouteContext`;
- shared Village, Map and World geography;
- the current HUD and control language;
- the native Linux path as regression evidence.

## Allowed scope

Exactly one bounded implementation PR may change only what is required to prove Web export playability:

- one focused `.github/workflows/**` workflow;
- `game/tests/**` for Web export identity or state observability;
- `game/scenes/aurelian/**` only for a deterministic browser-readiness or input-observability fix that does not alter accepted visuals or gameplay;
- `game/export_presets.cfg` only if a measured Godot Web export correctness issue requires it;
- a minimal machine-readable evidence manifest.

The exported build may be served by a local static HTTP server inside CI. Playwright and Chromium already used by the repository may drive the browser.

## Forbidden scope

- `app/play/**`, Next.js routes, hosting-shell integration or public deployment;
- replacement of the current public rollback surface;
- visual polish or changes to accepted terrain, cameras, HUD, overlays or controls;
- new gameplay, reducer actions, persistence, save migration or account state;
- trade economy, production simulation, diplomacy, combat, multiplayer, backend, accounts, payments or crypto;
- P12 or a fake 10,000-land renderer;
- new dependencies, asset families, runtime network downloads or private storage;
- paid tools, MAX or image generation as implementation authority;
- mobile or portrait redesign.

## Required evidence

The focused exact-head artifact must contain:

1. exact head and Web export file manifest with SHA256 identities;
2. proof that `index.html`, `index.pck`, `index.wasm` and the accepted GLB resource are present;
3. browser console and request logs with no missing required asset, script error or uncaught runtime failure;
4. a normal browser-launch World neutral still at 1440 x 900;
5. World Trade-selected still after real keyboard input;
6. Map East Route still after real keyboard input;
7. Village route-context still after real keyboard input;
8. returned World still after the backward path;
9. one raw 20 to 35 second browser sequence using the same visible controls;
10. a machine-readable interaction manifest containing exact head, browser/runtime identity, served origin, input actions, observed state IDs and topology invariants;
11. native Godot contracts and Linux launch regression results.

Direct visual and product review is mandatory. Green CI alone is not acceptance.

## Acceptance

`GODOT_WEB_EXPORT_PLAYABILITY_PASS` only if:

- Chromium loads accepted Aurelian content from a fresh Web export;
- no evidence environment variable selects state or drives the sequence;
- real player keyboard input completes the forward and backward path;
- the eastern Trade intent survives the transitions;
- accepted World, Map, Village, HUD and shared geography remain visually unchanged;
- required browser requests and console output are healthy;
- the proof does not modify or claim public web integration;
- no new dependency, asset, persistence or gameplay scope is introduced.

## Correction and stop

One meaningful candidate is allowed.

If exact evidence reveals one bounded browser-runtime or interaction defect, exactly one evidence-backed correction is allowed on the same technique. Correctness or infrastructure repair needed only to produce the already-defined evidence does not consume that visual correction and may not add polish.

After direct exact-head review, classify only:

- `GODOT_WEB_EXPORT_PLAYABILITY_PASS`;
- `GODOT_WEB_EXPORT_PLAYABILITY_REJECT`.

Stop after terminal classification. No public integration or later product milestone is authorized by this contract.
