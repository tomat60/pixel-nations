# Godot Aurelian Session Persistence v1 Contract

Status: AUTHORIZED AFTER MERGE
Owner: Pixel Nations Production Steward
Authority: `docs/PROJECT_CURRENT_STATE.md` on `main`
Accepted inputs: Godot Playable Aurelian Entry v1, Render Asset Packaging v1 and Web Export Playability v1
Cost target: 0 USD

## Strategy decision

The smallest remaining product risk is continuity across restart, not public web-shell integration or a broader gameplay port.

The accepted Godot entry proves a real player can choose eastern Trade and move through World, Map and Village, but its manifest still declares `session_local_only: true` and `persistence_claimed: false`. This milestone persists only that accepted decision context through normal native restart and same-origin browser reload.

It does not port the full Next.js save, economy, progression or account model.

## Player outcome

After selecting eastern Trade and moving to Map or Village, quitting and reopening the native build or reloading the same-origin Web export restores:

- the retained eastern Trade intent;
- the last accepted decision layer;
- the matching World, Map or Village presentation;
- the existing backward and forward controls.

A missing, unsupported or malformed save must recover safely to `world_neutral`.

## Persistence identity

Use one versioned, engine-neutral JSON payload under `user://`.

The v1 payload may contain only:

- schema identifier and version;
- selected strategic intent, limited to eastern Trade or none;
- current accepted entry-state ID;
- saved timestamp for evidence only.

The implementation must write atomically where the platform permits, close files before state confirmation and reject unknown schema versions or state IDs. No secret, account, payment, device fingerprint or analytics data may be stored.

## Allowed scope

Exactly one bounded implementation PR may change only:

- `game/scenes/aurelian/playable_aurelian_entry_v1.gd`;
- `game/scenes/aurelian/playable_aurelian_entry_v1_manifest.json`;
- one minimal persistence helper under `game/scenes/aurelian/**` if separation materially improves correctness;
- `game/tests/**` for schema, corruption fallback and state restoration;
- one focused `.github/workflows/**` evidence workflow;
- a minimal machine-readable evidence manifest.

Existing Godot 4.7.1 APIs, Playwright, Chromium and shell tools already used by the repository may be used. No new repository dependency is authorized.

## Forbidden scope

- `app/play/**`, Next.js routes, hosting-shell integration or public deployment;
- full web-to-Godot save migration or compatibility with the legacy localStorage schema;
- resources, orders, land ownership, settlement growth, nation, empire, crisis or economy persistence;
- cloud saves, accounts, backend, payments, multiplayer, crypto or telemetry;
- accepted terrain, cameras, HUD, overlays, controls or geography changes;
- new gameplay actions or visual polish;
- P12 or a fake 10,000-land renderer;
- new asset families, runtime network downloads, paid tools, MAX or image generation authority.

## Required evidence

The focused exact-head artifact must contain:

1. exact head, Godot version, packaged GLB identity and persistence schema manifest;
2. native clean-profile launch at `world_neutral`;
3. native real-input transition to `map_east_route` or `village_route_context`, process restart and visible restored state;
4. Chromium clean-profile launch at `world_neutral`;
5. Chromium real-input transition, same-origin reload and visible restored state;
6. corruption and unsupported-version tests proving fallback to `world_neutral`;
7. proof that backward and forward controls still work after restore;
8. World, Map and Village regression stills at 1440 x 900;
9. one raw 20 to 35 second sequence covering save, reload or restart, restore and continued input;
10. browser console and request logs with no missing required asset or uncaught runtime failure;
11. a machine-readable result containing exact head, schema version, save path class, before/reloaded state IDs, input actions and fallback results.

Evidence automation may isolate profiles and `user://` paths. It may not select the restored state through an evidence environment variable.

Direct artifact and product review is mandatory. Green CI alone is not acceptance.

## Acceptance

`GODOT_AURELIAN_SESSION_PERSISTENCE_PASS` only if:

- real player input creates the accepted persisted context;
- native restart and same-origin Chromium reload restore the same valid state;
- eastern Trade intent survives;
- the saved payload is minimal, versioned and engine-neutral;
- malformed and unsupported saves fail closed to `world_neutral`;
- the accepted interaction path, HUD and shared geography do not regress;
- no evidence variable drives the restored state;
- no public integration, full-save migration or broader gameplay scope is claimed.

## Correction and stop

One meaningful candidate is allowed.

If exact evidence reveals one bounded persistence correctness defect, exactly one evidence-backed correction is allowed on the same technique. Infrastructure repair required only to execute the already-defined evidence does not consume that correction and may not broaden scope.

After direct exact-head review, classify only:

- `GODOT_AURELIAN_SESSION_PERSISTENCE_PASS`;
- `GODOT_AURELIAN_SESSION_PERSISTENCE_REJECT`.

Stop after terminal classification. No public integration or later product milestone is authorized by this contract.
