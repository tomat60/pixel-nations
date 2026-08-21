# Godot Aurelian Session Persistence v2 Contract

Status: AUTHORIZED AFTER MERGE
Owner: Pixel Nations Production Steward
Authority: `docs/PROJECT_CURRENT_STATE.md` on `main`
Accepted inputs: Godot Playable Aurelian Entry v1, Render Asset Packaging v1, Web Export Playability v1 and the rejected v1 persistence evidence
Cost target: 0 USD

## Bounded strategy decision

The v1 product candidate remains rejected. Its native `user://` JSON path worked, but the required same-origin Chromium reload did not restore the saved state after a three-second post-save stabilization period.

The review isolated a platform boundary, not an accepted correction to v1:

- Godot Web mounts `/userfs` through IndexedDB when browser persistence is available.
- closing a written `FileAccess` marks the Web filesystem for synchronization;
- the engine begins that synchronization asynchronously during a later Web main-loop iteration;
- the public `JavaScriptBridge.force_fs_sync()` call has no completion result for game code;
- `OS.is_userfs_persistent()` can report false positives in some browser conditions.

A longer sleep or another blind `user://` retry is not authorized. The v2 technique uses a platform adapter with one shared versioned payload:

- native: the accepted `FileAccess` JSON technique as rough reference;
- Web: origin-scoped `window.localStorage` accessed through `JavaScriptBridge`;
- both: identical schema, state IDs, validation and safe fallback behavior.

Web Storage is synchronous and survives same-origin reloads. This is a distinct technique from the rejected IndexedDB-backed `user://` path.

## Source basis

Reviewed on 2026-08-21:

- Godot Web export persistence limits: https://docs.godotengine.org/en/latest/tutorials/export/exporting_for_web.html#using-cookies-for-data-persistence
- Godot `OS.is_userfs_persistent()`: https://docs.godotengine.org/en/latest/classes/class_os.html#class-os-method-is-userfs-persistent
- Godot `JavaScriptBridge`: https://docs.godotengine.org/en/latest/classes/class_javascriptbridge.html
- Godot Web filesystem synchronization source: https://github.com/godotengine/godot/blob/master/platform/web/os_web.cpp
- Godot Web IDBFS bridge source: https://github.com/godotengine/godot/blob/master/platform/web/js/libs/library_godot_os.js
- Web Storage behavior: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
- `window.localStorage` persistence and exceptions: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## Player outcome

After selecting eastern Trade and reaching Map or Village:

- native process restart restores the retained intent and accepted decision layer;
- same-origin Chromium reload restores the same context;
- Chromium close and reopen with the same browser profile restores the same context;
- forward and backward controls continue to work;
- unavailable, denied, malformed or unsupported storage safely falls back to `world_neutral`.

## Persistence identity

Use one minimal payload:

- schema: `pixel_nations.aurelian_session`;
- version: `2`;
- selected intent: `none` or `east_trade`;
- accepted entry-state ID;
- evidence timestamp only.

Use one namespaced Web key: `pixel_nations.aurelian_session.v2`.

The Web adapter must feature-detect storage by an actual bounded write, read and remove probe. Browser exceptions, unavailable `JavaScriptBridge`, quota errors and invalid values must return a structured failure and fall back safely. The adapter may not use cookies, IndexedDB internals, custom HTML, environment-driven state, network calls or unescaped dynamic JavaScript.

Payload serialization must be safe for JavaScript transport. Any evaluated bridge code must use fixed code plus an encoded payload or correctly escaped JSON string. No player-controlled value may become executable code.

## Allowed scope

Exactly one bounded implementation PR may change only:

- `game/scenes/aurelian/playable_aurelian_entry_v1.gd`;
- `game/scenes/aurelian/playable_aurelian_entry_v1_manifest.json`;
- one minimal platform persistence adapter under `game/scenes/aurelian/**`;
- `game/tests/**` for schema, transport encoding, denial, corruption and restoration;
- one focused `.github/workflows/**` evidence workflow;
- one minimal machine-readable evidence manifest.

Existing Godot 4.7.1 APIs, Playwright, Chromium and repository shell tools may be used. No new dependency is authorized.

## Forbidden scope

- reuse or modification of the rejected PR #472 branch;
- another `user://` Web candidate or timing-only retry;
- `app/play/**`, custom Web shell, public routes or deployment integration;
- legacy Next.js localStorage migration or key compatibility;
- resources, orders, land ownership, settlement growth, economy or full-save persistence;
- cloud saves, accounts, backend, payments, multiplayer, crypto or telemetry;
- accepted terrain, cameras, HUD, overlays, controls or geography changes;
- new gameplay actions, visual polish, P12 or fake full-world work;
- paid tools, MAX, image generation authority or new asset families.

## Required evidence

The focused exact-head artifact must contain:

1. exact head, Godot 4.7.1 identity, packaged GLB identity and schema manifest;
2. native clean-profile launch, input-driven save, process restart, restore and continued input;
3. Chromium clean-profile launch and explicit storage capability result;
4. input-driven save with a positive adapter acknowledgement before reload;
5. immediate same-origin reload after that acknowledgement and restored `map_east_route:east_trade`;
6. Chromium close and reopen with the same persistent profile and the same restored state;
7. continuation to `village_route_context`, then backward navigation;
8. denial or unavailable-storage fallback to `world_neutral`;
9. malformed and unsupported-version fallback tests;
10. checks for quote, slash, newline and Unicode transport safety;
11. World, Map and Village regression stills at 1440 x 900;
12. one raw 20 to 35 second browser sequence covering save acknowledgement, reload, restore and continued input;
13. browser console, request and response logs with no uncaught runtime failure;
14. a machine-readable result with exact head, platform adapter, key or path class, capability result, save acknowledgement, before and restored states, profile-reopen state and fallback results.

The evidence may isolate native and Chromium profiles. It may clear only the namespaced v2 key at clean-profile setup. It may not inject the restored state through environment variables, Playwright storage seeding or direct browser script.

Direct artifact review is mandatory. Green CI alone is not acceptance.

## Acceptance

`GODOT_AURELIAN_SESSION_PERSISTENCE_V2_PASS` only if:

- native restart, same-origin Chromium reload and same-profile browser reopen restore the same valid context;
- the Web adapter acknowledges a synchronous successful write before reload;
- eastern Trade intent and accepted navigation survive;
- unavailable or invalid storage fails closed to `world_neutral`;
- the payload is minimal, versioned and transport-safe;
- accepted presentation, input semantics and shared geography do not regress;
- no evidence mechanism seeds or selects the restored state;
- no public integration or broader gameplay persistence is claimed.

## Correction and stop

One meaningful v2 candidate is allowed.

If exact evidence reveals one bounded adapter correctness defect, exactly one evidence-backed correction is allowed on this technique. Infrastructure repair required only to execute the defined evidence does not consume that correction and may not broaden scope.

After direct exact-head review, classify only:

- `GODOT_AURELIAN_SESSION_PERSISTENCE_V2_PASS`;
- `GODOT_AURELIAN_SESSION_PERSISTENCE_V2_REJECT`.

Stop after terminal classification. No public integration or later milestone is authorized by this contract.
