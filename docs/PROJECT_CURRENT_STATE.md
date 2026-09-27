# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-27
Current state revision: 44.5
Authority baseline SHA: `06a38e097dd3808659aeea90236cb9e2c52991d6`
Product baseline SHA: `80d6eb079e7f7b801b988ba5a7a69da055ccaf4e`
Runtime baseline SHA: `80d6eb079e7f7b801b988ba5a7a69da055ccaf4e`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: Empire Seed Strategic Breadth Prototype — Godot production lock; Sector A-01 landmark-first identity accepted and World Cartographic Mass v1 visual target accepted for bounded runtime translation.
Current milestone: translate the accepted World A-01 Cartographic Mass v1 target into the existing Godot World generator while preserving one canonical Aurelian geography and proving readability at full and thumbnail scale.
Active execution issue: #721
Next allowed action: execute exactly one bounded Godot World production candidate that translates accepted PR #744 Cartographic Mass v1 into runtime primitives already available in the current pipeline. Preserve the canonical World geography/camera family and #736 Sector identity; no new asset family, Village/economy/deeper mechanics, engine work, generic image-generation target, or competing World candidate. Require exact-head real 1440×900 and 360×225 evidence plus direct visual review before any World acceptance.

## Binding product strategy

Issue #721 remains the canonical product-strategy lock.

The visible product goal is still:

`my village -> my land -> neighboring lands -> other settlements -> expansion -> Sector A-01 -> larger World`

Priority order:

1. Map / Sector breadth and strategic readability.
2. World / Atlas scale and physicality.
3. Scale continuity Village -> Map -> Sector -> World.
4. Only after the above is visibly usable: deeper economy, Village polish, repeatable expansion systems, combat/diplomacy/governance depth.

Issue #575 remains the current Sector representation/art-direction reference.

## Fresh production evidence

### Sector A-01 landmark-first regional sigils — terminal PASS

PR #736 was independently merged on 2026-09-24.

- accepted PR head: `0e97b0fa321995459be7f7ba92479db840c2138d`;
- merge/main SHA: `80d6eb079e7f7b801b988ba5a7a69da055ccaf4e`;
- terminal verdict: `SECTOR_A01_LANDMARK_FIRST_REGIONAL_SIGILS_V3_PASS`;
- direct-review frame: 1440×900, SHA-256 `ebe5ae866daff298f66ba4ca1d6e3ef0f4d39e497dfb938073834d165bc57766`;
- generator run: `35887145310`;
- artifact: `10763525681`, SHA-256 `c336d5891b2148fc0ede66a17816b0b59505f93bab06d0d00643d7f0f2c3e4f5`;
- Aurelian and Northwatch read as blue player areas, Eastbank as the gold frontier and High Pass as red pressure;
- relief, river, route hierarchy and one physical Aurelian geography remain intact.

This closes the Map / Sector breadth gate. Do not reopen #736.

### World Atlas A-01 landmark continuity — terminal REJECT

PR #737 received a terminal direct-review REJECT, was closed without merge, and was later reopened and merged on 2026-09-24 at `main@21c65e84582334820dee5a425d88327e48e5e3e9` without review. The merge does not convert the product verdict to PASS; the three-file delta is under bounded rollback recovery.

- final reviewed head: `3a35ce27e8a527cb81bed2082f0c567943aff4c3`;
- terminal verdict: `WORLD_ATLAS_A01_LANDMARK_CONTINUITY_REJECT / DIRECT_VISUAL_REVIEW_FAIL`;
- exact World Atlas run: `35961630422`, technically successful;
- artifact: `10793105371`, SHA-256 `9542de38357a9b27fb4502f99447611dd1edf956897ac361352c5c79897bd81b`;
- World frame SHA-256: `f15b47c17f8998a3e69142934cbb5111025ad86571978c98d27776f855aac090`;
- useful root-cause evidence: the original A-01 basin sat below the ocean plane;
- rejection reason: after uplift and one bounded landmark scale/spacing correction, A-01 remained a tiny pale/green speck cluster rather than the accepted blue landmark-first home identity; the correction changed only 16 pixels in the 1440×900 frame.

Preserve the below-ocean diagnosis as evidence. Do not continue blind scale tuning. The merged #737 delta is not an accepted World baseline and must be removed before the next product candidate.

## Recovery and QA reliability closure — terminal PASS

PR #739 and PR #740 were independently merged on 2026-09-24.

- rollback PR #739 accepted head: `bf0fcf37a905712d0803fd32b20d97c065df6263`;
- rollback merge/main SHA: `627588a0a3ce6f8d145c0838d5bc9a4d77933929`;
- #739 restored the three rejected #737 World Atlas files exactly to the accepted #736 baseline;
- QA reliability PR #740 accepted head: `5f698aecb6cd45032d200772be24c49b220f97fc`;
- QA reliability merge/main SHA: `83f88b3c76d8868172123dc28b40c827185c3508`;
- #740 changes only `scripts/qa-imperial-turn.mjs` and removes the mounted-page localStorage hydration race through deterministic preseed and seeded routes;
- exact-head Visual QA run: `36001232135`, terminal success;
- Visual QA artifact: `10808890108`, SHA-256 `7d27302b8702adb8f3df2a279e7b081bcdbb7d9889630cb2db6e018b122a6481`;
- CI, RC1, P4-P8, P10-P11 and Vercel passed on the accepted #740 head;
- resulting main Vercel status is successful;
- production `/`, `/play` and `/world` routes remain unverified because the public origin is inaccessible from the steward environment.

The rejected #737 World candidate remains rejected. The accepted product baseline remains #736; #739 and #740 close recovery and reliability only.

## World A-01 surface-anchored sigil ridge — terminal REJECT

PR #742 was closed without merge on 2026-09-25 after one bounded visual correction.

- initial exact head: `34ae8076e3d65884cdb848305ba6be62d50ef264`;
- initial World Atlas run: `36144096828`, terminal success;
- initial artifact: `10868842145`, SHA-256 `913ff0115bb9b9d400b11eba6a6131b08e626ab8e72d28bc379d09c35f00545e`;
- corrected exact head: `befa192b6fe57017605fbdb9467998c87b7405ff`;
- corrected World Atlas run: `36144504670`, terminal success;
- corrected artifact: `10868687625`, SHA-256 `1097d1a8d5b9fb466e006b063fea3d9aead049992ea0e300ebff6ffde5b920d1`;
- both real 1440x900 World frames have the same SHA-256: `6bcbc45ea5f0174f79bc135a52111c94915ffd212357924919c13cc0cdc2cd78`;
- the candidate preserved the canonical A-01 radius, World plane, camera, sea level, terrain and accepted landmark scales;
- surface anchoring, five flags, then nine brighter emissive flags produced no rendered-pixel change;
- terminal classification: `WORLD_ATLAS_A01_SURFACE_SIGIL_RIDGE_REJECT`.

Preserve the finding: existing World-scale flag geometry is below the camera's pixel visibility threshold even when surface-anchored, repeated and emissive. The next candidate must change the composition primitive rather than continue flag count, flag color, landmark scale or terrain-height tuning.

## World A-01 Cartographic Mass v1 visual target — terminal PASS

PR #744 was independently reviewed and merged on 2026-09-27.

- accepted PR head: `b08e5a9b25edd7137cf9d748ea75f0cb516c619e`;
- merge/main SHA: `06a38e097dd3808659aeea90236cb9e2c52991d6`;
- terminal verdict: `WORLD_ATLAS_A01_CARTOGRAPHIC_MASS_TARGET_PASS`;
- scope: static art-direction evidence only, no runtime/product mutation;
- evidence: editable SVG plus 1440×900 and 360×225 direct-review frames;
- accepted hierarchy: HOME A-01 -> IMPORTANT NEIGHBOR/DIRECTION -> LARGE WORLD;
- composition primitive: terrain-scale irregular cobalt home mass integrated with the canonical river, restrained macro-region masses, and a readable gold strategic route/destination;
- no tiny building or flag carries World-scale home identity.

This target is implementation-grounded rather than a generic concept image: its visible elements map to the existing World terrain mesh/material path, route geometry, region masks/material treatment and simple Godot sigil/decal primitives. It authorizes one bounded runtime translation under #721, not a new asset family or broad redesign.

## Engine decision status

Godot 4 is the **production engine for the current phase**.

Issue #731 reached a terminal verdict on 2026-09-18: keep Godot and lock the engine decision for approximately 90 days unless a hard engine-level technical blocker appears.

Decision evidence:

- both Godot and Unity completed credible AI-native editor-control loops on the same canonical Sector A-01 source;
- Unity's official Pipeline workflow is strong and achieved live inspect/edit/Play/screenshot/self-correction;
- Unity did not produce a material visible-quality advantage over the corrected Godot result;
- Unity carried materially higher first-run/package/import/compile and licensing/editor overhead;
- Godot completed the corrected 1440x900 benchmark capture in the existing architecture and exported the real Web preset successfully with exit code 0;
- migration would discard or port accepted Godot gameplay, persistence, tests and production integration without a demonstrated payoff.

Do not reopen engine benchmarking during the lock for a tie, a small visual difference or tooling novelty. Reopen only for a hard technical blocker that is inherent to Godot and materially threatens the product.

## Current AI-native benchmark evidence

### Godot lane — terminal PASS

Verified on a fresh standalone checkout from exact gate baseline `a56c3182aa0d94d83905b6f42a664b0d257029fe`:

- Godot 4.7.1 stable;
- `godot-editor-mcp 2026.09.17`;
- fresh project path: `/home/pnrunner/pn-engine-gate-20260918/godot-clean/game/`;
- dedicated bridge: `ws://127.0.0.1:9280`;
- bridge connection to the live fresh Editor: PASS;
- project inspection and campaign scene open through MCP: PASS;
- meaningful `PrimaryCorridor` readability mutation through MCP script tooling: PASS;
- parse validation: PASS;
- real 1440x900 benchmark capture: PASS;
- exactly one self-correction: PASS;
- corrected capture runtime: about 5.8 seconds;
- Godot Web export using the repository `Web` preset: PASS, exit code 0, producing `index.html`, JS, PCK and WASM.

One infrastructure correction was required: the viewport capture cannot complete under the chosen `--headless` invocation, so the same deterministic capture was rerun through the existing Xvfb display. This is recorded as workflow evidence, not a product defect.

### Unity lane — credible PASS, migration threshold NOT MET

Verified on Netcup:

- Unity Editor 6000.6.1f1, Personal license active;
- official `unity@unity-agent-plugin 0.1.6-beta`;
- `com.unity.pipeline 0.7.0-exp.1`;
- URP 17.6.0;
- live Pipeline endpoint: ready on port 7800;
- command surface: 151 editor commands;
- canonical Sector source spec SHA-256 matched the fresh Godot source exactly;
- live hierarchy inspection: PASS;
- live meaningful `PrimaryExpansion` edit: PASS;
- Play Mode: PASS;
- real 1440x900 frame: PASS;
- exactly one self-correction: PASS;
- WebGLSupport module: installed;
- WebGL build dry-run: valid with no validation errors;
- real WebGL build entered the Unity Bee/IL2CPP compilation pipeline.

Negative workflow evidence:

- first package/script compile took about 488 seconds;
- first-run Software Terms/license handling added setup overhead;
- the WebGL build path remained materially heavier than the Godot Web export within the benchmark timebox;
- the resulting visual/workflow advantage was not material enough to repay migration.

Terminal verdict: **KEEP GODOT**.

## Direct Netcup control — PASS

Remote Desktop Commander is paired and online on device:

`pixel-nations-godot-01`

Verified:

- device status: online;
- ping: PASS;
- direct terminal: PASS as user `pnrunner`;
- Remote Desktop Commander: 0.2.51;
- supported Node runtime for Commander: 22.12.0;
- filesystem access is restricted to `/home/pnrunner` and `/tmp`;
- destructive/admin commands including sudo, mount, reboot and disk tools remain blocked.

Use Commander for the inner benchmark/editor loop. GitHub Actions remains a regression/merge path, not the default mechanism for every shell command.

## Checkout / stale-data guard

Do not trust a directory name as proof of freshness.

As of 2026-09-18:

- final engine-gate source baseline is `a56c3182aa0d94d83905b6f42a664b0d257029fe`;
- the old local checkout formerly named `/home/pnrunner/pixel-nations-live` was stale at `9db4716...` and contained editor-generated local changes;
- it has been moved to `/home/pnrunner/archive/pixel-nations-live.STALE-2026-09-18` and must not be used as project authority;
- the existing `/home/pnrunner/pn-engine-ab` workspace contains useful benchmark evidence but its original Git worktree/object-alternate wiring depended on that stale checkout;
- create/use fresh standalone clones from the intended exact ref for subsequent benchmark mutations.

GitHub `main` + this current-state file + the active issues are authority. Local caches, old worktrees, reports and `latest` folders are evidence/reference only.

## Accepted production/runtime baseline

Preserve:

- Default First Session v6:
  `claim -> develop -> choose -> consequence -> grow -> expand`;
- truthful persistence and player identity;
- Input Release Boundary v3;
- View roles:
  - Village = HOW;
  - Map = WHERE;
  - World = WHY / scale / direction;
- Aurelian Frontier Capacity v2 behavior at product baseline `6a67f19034beb9868b3609b9f067430bd8b863af`.

Sector A-01 breadth is visually accepted at product baseline `80d6eb079e7f7b801b988ba5a7a69da055ccaf4e`. The rejected #737 runtime delta was removed by #739. World / Atlas runtime is **not yet visually accepted**; PR #744 is an accepted static implementation target only.

## Rejected representation evidence

Do not restart these as new product directions:

- #723 breadth v1 marker/network proof;
- #725 simplified marker/beam v2;
- #726 floating planar surface regions;
- #727 terrain tint/mask variant;
- #737 World A-01 uplift plus scale/spacing tuning as a final representation; retain only its below-ocean root-cause evidence;
- generated concept-art target as a prerequisite.

#729 2.5D is useful readability evidence, not a final art lock and not sufficient by itself to settle the engine decision.

## Still frozen during the breadth sprint

Until Map / Sector / World breadth is visibly usable:

- deeper Village polish;
- Provision / economy continuation;
- additional one-land micro-systems;
- combat/diplomacy/governance depth;
- paid assets;
- generated visual targets unless explicitly requested;
- GPT-6;
- Cursor MAX;
- broad workflow redesign unrelated to the active #721 breadth work.

## Exact next sequence

1. Treat #731 as terminal and ADR-001 as the engine lock.
2. Treat #736 as the accepted Map / Sector breadth baseline; do not reopen it.
3. Treat #737 and #742 as terminal World representation rejections; retain only their useful root-cause evidence.
4. Treat #744 as the accepted static World Cartographic Mass v1 implementation target; do not reopen generic moodboard generation.
5. Translate that target once into the existing Godot World generator using current runtime primitives and one canonical Aurelian geography.
6. Require exact-head real 1440×900 and 360×225 evidence plus direct review before any World runtime acceptance.
7. If the runtime translation fails materially after one bounded correction, stop implementation and revise the production-grounded art-direction mapping rather than tune landmark/flag scale again.
8. After World acceptance, verify Village -> Map -> Sector -> World continuity with real user-facing frames.
9. Keep Village/economy/deeper mechanics frozen until the broader world reads clearly.
10. Own every PR through exact-head CI and visible post-merge verification.

## Continuity rule for every new chat / agent

Before planning or coding:

1. run `npm run pn:status` on a fresh/intended checkout;
2. read this file;
3. read #721 and ADR-001; treat #731 as terminal benchmark evidence;
4. inspect the exact current ref and real benchmark evidence;
5. use #575 only for Sector representation principles;
6. treat all other old issues, briefs, reports, chats, local folders and historical docs as reference-only unless this file explicitly reactivates them.

If a source conflicts with this file or the active strategy/engine gate, the current authority wins.

Green CI is never visual/product acceptance. Owner confusion or lack of confidence in a real product frame outranks a screenshot/CI PASS.
