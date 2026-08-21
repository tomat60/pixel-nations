# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-21
Current state revision: Godot Aurelian Session Persistence v2 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `00a93b12a26a10ddd87a9a5ef1a7b58d6657bfc6`
Product baseline SHA: `00a93b12a26a10ddd87a9a5ef1a7b58d6657bfc6`
Current milestone: record `GODOT_AURELIAN_SESSION_PERSISTENCE_V2_PASS` and return control to bounded strategy review
Active execution issue: #415
Active implementation PR: authority-only Session Persistence v2 acceptance record
Last completed milestone: PR #475 `GODOT_AURELIAN_SESSION_PERSISTENCE_V2_PASS`, accepted head `50f0bedf708cd0e081518b711be5fbda63b4ad9f`, merged as `00a93b12a26a10ddd87a9a5ef1a7b58d6657bfc6`
Next allowed action: after this acceptance record merges and post-merge checks are healthy, conduct exactly one bounded strategy review and accept the next milestone contract before any product implementation.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement / city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current demo geography is Sector A-01 / Aurelian Basin.

P4-P11 remain accepted. P11 does not authorize P12. ADR-001 remains binding: Godot is the target runtime. Next.js `/play` remains the behavioral reference / rollback shell until the Godot replacement is directly accepted for the relevant surface.

The demo does not need a fake finished 10,000-land world. It must prove the fantasy through a coherent chain of local growth, territorial expansion and strategic direction.

## Core view-role decision

Village, Map and World are not three cosmetic zoom levels.

They are three decision layers over one persistent geography:

- Village = `HOW`: make one place live and grow.
- Map = `WHERE`: choose, scout, claim and connect nearby land.
- World = `WHY / WHICH DIRECTION`: choose the larger strategic direction of the nation / empire.

The binding role and interaction contract is `docs/AURELIAN_VIEW_ROLES_V1.md`.

The same physical Aurelian Basin remains shared across all three. Camera, LOD, overlays, marker density and available interactions may change. River, bridge, Greenvale origin, roads, landmarks, topology orientation and physical geography may not.

## Accepted Aurelian foundation

Accepted implementation inputs:

- shared topology: `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`;
- art direction: `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`;
- moodboard direction: `docs/AURELIAN_BASIN_MOODBOARD_V1.md`;
- capability-first implementation contract: `docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`;
- Production Map v1 contract: `docs/AURELIAN_PRODUCTION_MAP_V1_CONTRACT.md`;
- Village / Map / World role contract: `docs/AURELIAN_VIEW_ROLES_V1.md`;
- Aurelian Decision Loop v1 contract: `docs/AURELIAN_DECISION_LOOP_V1_CONTRACT.md`;
- Godot Playable Aurelian Entry v1 contract: `docs/GODOT_PLAYABLE_AURELIAN_ENTRY_V1_CONTRACT.md`;
- Godot Aurelian Render Asset Packaging v1 contract: `docs/GODOT_AURELIAN_RENDER_ASSET_PACKAGING_V1_CONTRACT.md`;
- Godot Web Export Playability v1 contract: `docs/GODOT_WEB_EXPORT_PLAYABILITY_V1_CONTRACT.md`;
- Godot Aurelian Session Persistence v1 contract: `docs/GODOT_AURELIAN_SESSION_PERSISTENCE_V1_CONTRACT.md`;
- Godot Aurelian Session Persistence v2 contract: `docs/GODOT_AURELIAN_SESSION_PERSISTENCE_V2_CONTRACT.md`;
- PR #449 authored Blender terrain + KayKit + GLB + Godot integration reference: `IMPLEMENTATION_REFERENCE_PASS / PRODUCTION_VISUAL_NOT_YET_ACCEPTED`;
- PR #451: `PRODUCTION_VILLAGE_PASS`;
- PR #454: `PRODUCTION_MAP_PASS`;
- PR #457: `PRODUCTION_WORLD_PASS`;
- PR #460: `AURELIAN_DECISION_LOOP_PASS`;
- PR #463: `GODOT_PLAYABLE_AURELIAN_ENTRY_PASS`;
- PR #466: `GODOT_AURELIAN_RENDER_ASSET_PACKAGING_PASS`;
- PR #469: `GODOT_WEB_EXPORT_PLAYABILITY_PASS`.

The accepted shared-world pipeline proves:

- deterministic Blender 4.3.2 authoring;
- pinned KayKit CC0 assets;
- authored irregular Aurelian terrain;
- one GLB imported by Godot 4.7.1;
- shared Village / Map / World geography;
- explicit topology-to-Godot coordinate parity;
- deterministic still / video evidence;
- exact-head Godot and project tests.

Do not rebuild this foundation for a view-specific interaction change.

## Accepted Production Village v1

PR #451 accepted result:

`claimed land -> founded settlement -> developed village`

Evidence identity:

- accepted head: `572a43313c4795574e4e93544e1e44d1c8f30610`;
- focused run: `32296769557`;
- artifact: `9381563241`;
- artifact digest: `sha256:5c693872753d62681c8fc3bedb67fb2a2dfc88099ad08699bd83c83cb738562c`;
- merge: `2d6b2fbc2c42042f8c83faaf7c8e4f55ee689a29`;
- final classification: `PRODUCTION_VILLAGE_PASS`.

Village role now means local settlement growth, structure hierarchy, work / field relationships, local roads and the tangible consequences of development.

Known future visual polish remains for materials, terrain transitions, road integration and bridge refinement. Do not reopen Village v1 as a broad polish project while World role proof is active.

## Accepted Production Map v1

PR #454 accepted result:

- claimable land distinction;
- selected land distinction;
- claimed land distinction;
- scouted land distinction;
- terrain-first presentation;
- accepted Village and World geography preserved.

Evidence identity:

- accepted head: `2966295b92ff97692e9594f28dfa86538f2da042`;
- focused run: `32347229891`;
- artifact: `9398507284`;
- artifact digest: `sha256:ea95dbca206b6e7fabf6cbe27844a2c058a057fd4b551760dfbc60b0e12c20e6`;
- merge: `4c4054b9c475255cb88c9cf4bcdd887f12cfedf5`;
- final classification: `PRODUCTION_MAP_PASS`.

Map role now means nearby territorial choice: select, scout, claim, inspect and connect land around the current settlement. It must remain terrain-first and may not become a dense permanent grid or a second Village builder.

## Accepted Production World v1

PR #457 accepted result:

- Aurelian Basin reads as the current strategic home region;
- three sparse directions communicate trade, expansion and frontier pressure with distinct shape, color, route and label language;
- neutral, selected-trade and all-directions states are legible;
- the raw sequence proves the layer relationship: `World WHY -> Map WHERE -> Village HOW`;
- accepted Village and Map geography remains unchanged.

Evidence identity:

- accepted head: `88c8ffc706d06b2fa4ff73f6d0fe961aee9a803f`;
- focused run: `32434867134`;
- artifact: `9430433706`;
- artifact digest: `sha256:0865b3d67ad2df1e01198809a8d8a4b0f88ec8127f227528f4ce2eead2dc286d`;
- merge: `5082c387fb7be436c5fc6073efc5ec88a2572850`;
- final classification: `PRODUCTION_WORLD_PASS`.

The first meaningful candidate was technically complete but visually read as a distant Map because its strategic markers were too small and abstract. The single permitted bounded correction added restrained strategic routes, labels and clearer direction glyphs. Direct review accepted the corrected exact-head stills and 22-second raw sequence.

World v1 proves the role, not a finished global renderer. Diplomacy, combat, economy expansion, P12, independent World geography and a fake 10,000-land presentation remain blocked.

## Accepted Aurelian Decision Loop v1

PR #460 accepted one retained eastern-trade intent across the three accepted decision layers:

`Direction_EastTrade -> Land_EastRouteSelected -> GreenvaleTradeRouteContext`

Evidence identity:

- accepted head: `61231a57b723dc67b27bd629f15de4455008aecf`;
- focused run: `32438354507`;
- artifact: `9431564011`;
- artifact digest: `sha256:e24d2b7373205ca8552d6541e83bbdbc40aa7d5c44302d7f977a404c8502912d`;
- merge: `aa9f703ef32db841673732102813a5fde1fac509`;
- final classification: `AURELIAN_DECISION_LOOP_PASS`.

Direct review of six 1440 x 900 stills and the raw 24-second sequence confirmed the complete handoff: World communicates the strategic Trade reason, Map carries it into the East Route land choice, and Village shows the resulting Greenvale-to-Gilded-Crossing route-capacity context. River, bridge, roads, Greenvale, landmarks and topology remain consistent. Map and Village regression evidence is clean.

This proves deterministic intent continuity, not a trade economy, persistence system or new gameplay architecture.

## Accepted Godot Playable Aurelian Entry v1

PR #463 replaced the migration-foundation diagnostic as the normal Godot project entry with one bounded session-local path:

`World neutral -> Trade selected -> Map East Route -> Village route context -> Map -> World`

Evidence identity:

- accepted head: `40444e7d06197048ef6d505c5d1a1dc752edd4f3`;
- focused run: `32442024239`;
- artifact: `9432802453`;
- artifact digest: `sha256:5492481e4b8bdba248a304a7c8b18b25ec5d8a5e66ba2dc87db99aad19516ad2`;
- merge: `caad7cf0cbc65fe3e066ca13108a0171098cd4dd`;
- final classification: `GODOT_PLAYABLE_AURELIAN_ENTRY_PASS`.

Direct review of six 1440 x 900 stills and the raw 27-second sequence confirmed that normal launch reaches Aurelian World, the HUD identifies `WHY / WHERE / HOW`, player input drives the complete forward and backward path, and eastern Trade intent survives the return to World. Accepted Village, Map, World and shared geography remain intact. Godot Foundation CI, Pixel Nations CI, RC1, Play Visual QA, P4-P8, P10-P11 and Vercel were successful on the accepted exact head.

This proves a playable Godot entry and session-local handoff only. It does not authorize persistence, trade economy, web integration, P12 or a later product slice.

## Accepted Godot Aurelian Render Asset Packaging v1

PR #466 materialized the already accepted authored Aurelian render asset so a clean checkout and canonical export no longer depend on local generated bytes.

Evidence identity:

- accepted head: `a0ba7c516b7b409beb9f3b9970eb77971bab879b`;
- focused run: `32445586573`;
- artifact: `9433974151`;
- artifact digest: `sha256:eea02f00bbec16afb433b632c8baf377673ed2b7fb934dee7816bcb51a7d2568`;
- GLB SHA256: `04116e3d662d461f0d29ca797444193b0873f5aba6012790af7d366c63e01048`;
- merge: `27c1acedda79a3451dc7f55c16a5162c1a6dd870`;
- final classification: `GODOT_AURELIAN_RENDER_ASSET_PACKAGING_PASS`.

The exact-head workflow proved clean-checkout identity, byte-identical GLB regeneration, semantic transform-manifest reproduction, Godot import, all accepted Aurelian contracts, Linux and Web export inclusion, native headless launch and normal graphical launch without evidence environment variables. Direct review accepted the 1440 x 900 normal-launch still and preserved shared Aurelian geography. No accepted geometry, presentation, interaction or web surface changed.

## Accepted Godot Web Export Playability v1

PR #469 proved that the canonical packaged Aurelian Web export is playable in a real Chromium canvas from a fresh locally served build.

Evidence identity:

- accepted head: `fe1460a9b9abc04d50e85d4257ed7e43acf0449a`;
- focused run: `32447659838`;
- artifact: `9434636457`;
- artifact digest: `sha256:82e0812ca9a056c1932df671271d723f91cad865ff86dd78b589eabcf6425f65`;
- merge: `822496de91a42babc596a8e4cc101503fbc52e14`;
- final classification: `GODOT_WEB_EXPORT_PLAYABILITY_PASS`.

Direct review of six 1440 x 900 stills and the raw 25.44-second browser sequence confirmed normal Chromium WebGL 2 launch, real keyboard control, the full forward and backward path, retained eastern Trade intent, unchanged World / Map / Village presentation and shared geography. Browser request failures, response failures and blocking runtime errors were all zero. Native contracts, Linux launch and Linux / Web exports also passed.

The first artifact exceeded the binding evidence duration and remained rough reference only. The evidence-only recovery shortened post-state stabilization waits and added a duration gate. A missing runner `ffprobe` tool caused one infrastructure failure and was repaired without changing product or visuals.

This proves local Web export playability only. It does not authorize `app/play/**` integration, public route replacement, deployment claims, persistence, economy, P12 or a later product slice.

## Rejected Godot Aurelian Session Persistence v1

PR #472 is `GODOT_AURELIAN_SESSION_PERSISTENCE_REJECT` and was closed without merge.

Evidence identity:

- rejected head: `accddcf88fd7ede177194bc7fd35dfe660136a9b`;
- focused run: `32450779968`;
- artifact: `9435664456`;
- artifact digest: `sha256:5424a0e98b100c8d715769924a778f19e4bb497c08bb0bfc64a5f19bc59f8b05`;
- final classification: `GODOT_AURELIAN_SESSION_PERSISTENCE_REJECT`.

The native path is accepted only as rough technical reference: schema and fallback tests pass, Linux and Web exports contain the helper, native restart restores `map_east_route:east_trade`, and input continues to `village_route_context`. Directly reviewed native stills preserve accepted Village, Map, World and shared geography.

The binding same-origin Chromium requirement failed. The exact browser sequence reached `world_neutral -> world_trade_selected -> map_east_route`, then reload returned to `world_neutral` instead of restoring `map_east_route:east_trade`. Pre-product Xvfb failures were repaired only in the evidence workflow. The one bounded product correction was already used for deterministic GDScript correctness, so no further product correction or merge is authorized on this technique.

## Accepted Godot Aurelian Session Persistence v2

PR #475 accepted one shared versioned persistence schema with distinct platform adapters:

- native uses atomic JSON through `FileAccess`;
- Web uses synchronous, origin-scoped `window.localStorage` through guarded `JavaScriptBridge`;
- unavailable or denied Web storage falls back safely to `world_neutral`;
- only eastern Trade intent and the playable Aurelian entry state are persisted.

Evidence identity:

- accepted head: `50f0bedf708cd0e081518b711be5fbda63b4ad9f`;
- focused run: `32458183117`;
- artifact: `9438041876`;
- artifact digest: `sha256:78c3db5b66a273424740427331d9d64d849a9cc079064776b580ab083cfdec48`;
- merge: `00a93b12a26a10ddd87a9a5ef1a7b58d6657bfc6`;
- final classification: `GODOT_AURELIAN_SESSION_PERSISTENCE_V2_PASS`.

Direct review of eight 1440 x 900 stills and the raw 30.32-second sequence confirmed native restart, same-origin Chromium reload and same-profile browser reopen all restore `map_east_route:east_trade`, then real input continues to `village_route_context`. The denied-storage case returns safely to `world_neutral`. Accepted Village, Map, World and shared geography remain unchanged.

One exact-head Web playability run completed all product and browser steps but rejected a valid 35.68-second recording against a brittle 35-second evidence ceiling. The bounded recovery changed only that validator ceiling to 40 seconds. The next exact-head run passed; no product or visual correction was consumed.

This proves local per-device session persistence only. Account, cloud save, cross-origin continuity, legacy migration, economy, public Web integration and P12 remain blocked.

## Completed bounded Web persistence strategy review

The review classified the rejected Web `user://` technique as an asynchronous durability boundary, not a candidate for another timing retry. Godot Web uses IndexedDB-backed IDBFS, schedules synchronization after persistent `FileAccess` writes and exposes no game-code completion result for the asynchronous flush. The rejected browser evidence already waited three seconds after the final state save, so a longer blind delay would not be a deterministic recovery.

A distinct v2 technique is viable without touching `app/play/**`, public routes or accepted visuals. The accepted contract is `docs/GODOT_AURELIAN_SESSION_PERSISTENCE_V2_CONTRACT.md`: native keeps the versioned `FileAccess` JSON path, while Web uses synchronous, origin-scoped `window.localStorage` through a guarded `JavaScriptBridge` adapter. Both adapters share one minimal schema and safe fallback behavior.

The v1 branch and IndexedDB-backed `user://` Web technique remain rejected and may not be reused.

## Next bounded milestone

After this acceptance record is accepted on `main` and post-merge checks are healthy, conduct exactly one bounded strategy review to select and contract the next smallest milestone.

No product implementation is authorized until that new contract is merged. Allowed work is strategy, documentation and repository QA. P12, economy expansion, account or cloud save, public route replacement, broad visual polish, backend, multiplayer, combat, MAX and paid tools remain blocked.

## Product interaction hierarchy

The views must feed each other:

1. World creates a strategic reason to expand.
2. Map chooses the nearby land that executes that direction.
3. Village converts land / resources / routes into settlement growth.
4. Village growth unlocks new Map and World options later.

This feedback loop is more important than additional decoration on any single view.

## Visual information hierarchy

Closer view = more physical detail and fewer abstract symbols.

Farther view = less physical detail and more strategic abstraction.

Therefore:

- Village: buildings > terrain landmarks > local overlays.
- Map: terrain / routes > land states > buildings.
- World: strategic directions / routes / objectives > local land states > individual buildings.

Markers must remain subordinate to the physical world.

## Rejected / historical visual paths

Do not reopen without a new documented blocker:

- #426 primitive Godot/KayKit proof: rejected;
- #429 Blender recovery candidate: rejected;
- #437 replay: rejected;
- #447 procedural capability reference: rejected visually;
- #448 authored-terrain v1 integration: rejected after mirrored coordinate targeting;
- independent React / SVG / CSS Village / Map / World geography: rejected;
- free-form generated fantasy/dashboard visuals as production authority: rejected.

## Process acceleration rules

1. One active product / recovery PR at a time.
2. Do not rebuild shared terrain for view-specific UI / interaction changes.
3. One milestone changes one decision layer. The other two are regression evidence.
4. Use focused Godot workflows for visual iteration instead of the full web QA loop.
5. Green CI is necessary but never visual acceptance.
6. Directly review artifacts immediately after the focused run succeeds.
7. One meaningful candidate, one bounded correction, then PASS or REJECT.
8. Infra failures before product tests get the smallest-job recovery, not a new product commit.
9. Do not restart successful exact-head checks merely because PR metadata changed if protection does not require it.
10. Public web verification is tracked separately when a Godot-only slice does not modify the public web shell.
11. User-reported confusion / rejection overrides screenshot-only QA.

## Release state

The previous environment could not resolve the public production origin directly, so some earlier comments recorded `PRODUCTION UNVERIFIED`. This is a capability boundary, not evidence of an outage.

For PR #454 exact head, all repo-side checks including Production Map V1, Pixel Nations CI, Play Visual QA, Godot Foundation, RC1 and P4-P11 were successful before merge. Vercel status for merge SHA `4c4054b9c475255cb88c9cf4bcdd887f12cfedf5` is `success`.

Do not block a Godot-only visual milestone indefinitely on unavailable external HTTP evidence when it does not modify the public web shell. Keep the missing public-origin evidence explicit and separate.

## Tool and cost policy

- Strategy / control / direct review: GPT-5.6 Sol.
- Deterministic GitHub / Godot / Blender path first.
- Cursor only when it materially speeds a scoped implementation task.
- Default Cursor model if used: GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- No new paid tool or asset family without a named blocker and explicit value case.

## Mandatory PR / release ownership

The user is not responsible for detecting stuck PRs, failed checks, stale evidence or broken releases.

For every PR / head change:

- fetch exact head / base;
- verify ahead / behind;
- verify changed-file scope;
- verify mergeability;
- inspect exact-head workflows;
- inspect required artifacts directly;
- classify `PENDING / BLOCKED / REJECTED / READY`.

After every write or branch / PR movement, refetch immediately.

After merge, verify accepted head -> merge SHA -> new `main` -> repo checks -> deployment status where relevant.

## Source-of-truth precedence

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially ADR-001
3. root `AGENTS.md`
4. active issue #415
5. `docs/AURELIAN_VIEW_ROLES_V1.md`
6. `docs/AURELIAN_PRODUCTION_MAP_V1_CONTRACT.md`
7. `docs/AURELIAN_CAPABILITY_FIRST_IMPLEMENTATION_REFERENCE_V1.md`
8. `docs/AURELIAN_BASIN_TOPOLOGY_V1.md`
9. `docs/AURELIAN_BASIN_ART_DIRECTION_RECOVERY_V1.md`
10. `docs/AURELIAN_BASIN_MOODBOARD_V1.md`
11. accepted exact-head evidence and operating protocols
12. historical issues, branches and closed PRs

## Session start gate

Before meaningful product work:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, ADR-001, root `AGENTS.md`, #415 and `docs/AURELIAN_VIEW_ROLES_V1.md`.
3. Re-fetch live GitHub state.
4. State model / tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

If `pn:status` returns `AUTHORITY_STATUS=FAIL` or `BLOCKED_STALE_PROJECT_STATE`, stop product work and repair authority first.

## Current stop condition

This authority update stops when the Session Persistence v2 contract is accepted on `main` and post-merge state is healthy.

After that, exactly one bounded v2 implementation candidate is authorized. Stop after direct exact-head classification as `GODOT_AURELIAN_SESSION_PERSISTENCE_V2_PASS` or `GODOT_AURELIAN_SESSION_PERSISTENCE_V2_REJECT`. Public integration and later milestones remain blocked.
