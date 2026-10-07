# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-10-07
Current state revision: 45.0
Authority baseline SHA: `64e2a0265bef8edf99747cf9cbf01f02c2250b6b`
Product baseline SHA: `80d6eb079e7f7b801b988ba5a7a69da055ccaf4e`
Runtime baseline SHA: `80d6eb079e7f7b801b988ba5a7a69da055ccaf4e`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: Empire Seed Strategic Breadth Prototype. Godot production remains locked; one template-first Greengate/Aurelian visual vertical slice is active before any broader systems or generator encoding.
Current milestone: transform a proven medieval Godot composition into one believable Pixel Nations Greengate/Aurelian slice, preserving the `land -> settlement/city -> nation -> empire` product model while using repo-safe assets and scale-specific representation.
Active execution issue: #721
Next allowed action: build exactly one retained working Greengate/Aurelian vertical-slice proof using template-derived strategic camera/composition and repo-safe medieval/nature assets. The proof must visibly connect a 2.5D Living Atlas World/Region frame, Sector A-01 and one coherent inhabited home settlement with road, fields, settlement density, landmark and river/terrain relationship. Use Godot plus persistent MCP, local capture and free current-format Quaternius Standard or Kenney assets; The Free Game may donate MIT/CC BY 4.0 presentation and interaction patterns with attribution/change notice, while Slavica is composition reference only and must not be redistributed without separate license clearance. Run at most two focused composition passes, review real 1440×900 and 360×225 frames plus a normal-input traversal/video, and stop or replace the asset family/art treatment if the slice still does not look like a believable game. Do not encode generators or open a product PR until direct review produces a golden frame. Unity, Cursor/MAX, generic image generation as production art, new generator-first World work, procedural representation experiments, broad infrastructure/docs and unrelated product systems remain blocked. Extra spend remains $0.

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

## Template-first visual production lock: active

Fresh #721 evidence on 2026-10-06 supersedes the open-ended `INHABITED_RELIEF_FABRIC` milestone.

- #755 was independently merged as `main@ecdf77557868efc7f3607e71445c6b86967a9e53`;
- the bounded geometric relief-fabric proof was directly rejected because its low-relief slabs, strips and cubes still read as overlaid geometry at 360×225;
- the Compatibility renderer does not support Godot Decal, so that route is closed without changing renderer or engine;
- a terrain `material_overlay` shader produced the strongest rough World reference but still read more as highlighted fields than inhabited homeland;
- repeated flag, crest, box, parcel, decal and shader-lobe representation experiments are now closed;
- the existing `campaign_map_2p5d_benchmark_v1` proved that 2.5D is the stronger World/Region family, while physical assets belong at Sector/Village scale;
- EmacEArt Slavica Free demonstrated that a transformed finished scene can immediately outperform empty procedural composition, but its assets are reference-only unless redistribution rights are separately cleared;
- The Free Game ran successfully in Godot 4.7.2 and is an eligible presentation/gameplay-pattern donor under MIT code plus CC BY 4.0 art attribution/change notice;
- Quaternius Medieval Village MegaKit Standard is the preferred CC0 production asset family, with Kenney as the proven CC0 fallback.

The locked workflow is:

`working template -> transform to Pixel Nations -> direct screenshot review -> preserve good template behavior -> retarget repo-safe assets -> integrate Pixel Nations state -> golden slice -> encode -> PR`

World/Region remains a 2.5D Living Atlas guided by `docs/visual-targets/world-map-v8/`. Sector/Village remains a physical Godot scene. Tiny 3D buildings must not carry World HOME semantics, and a third procedural representation-tuning cycle is forbidden.

Acceptance requires one coherent player-visible traversal in which Aurelian Basin is legible at World/Region scale, Sector A-01 is entered, Greengate reads instantly as inhabited, and land-to-settlement progression is visually obvious. User direct review outranks automated QA.

Classification: `TEMPLATE_FIRST_WORKFLOW_PASS / CURRENT_PN_VISUALS_INSUFFICIENT / GREENGATE_VERTICAL_SLICE_ACTIVE`.

## Authority and repository hygiene closure — terminal PASS

The World rejection reconciliation and the subsequent repository-hygiene corrections are merged.

- PR #748 accepted head: `ded748c62f3221996708081717869027b7aab525`;
- #748 merge/main SHA: `485a1669cdd117758a25fb474b5ced36189fb6ce`;
- #748 records the terminal #747 runtime rejection and removes accidental transport trace text;
- PR #750 accepted head: `84ca623dca1664c212aec8e67fde278b786d6839`;
- #750 merge/main SHA: `a72a293d3278d479197cf354a21f38f443538ba6`;
- PR #751 accepted head: `18fdbb59144146c55f7b933415205b156b766ef0`;
- #751 merge/current main SHA: `f608621bd7d55a85768d34bf5f3d71c4ad686c56`;
- #750 removes stale generated repository weight and #751 preserves required-check identities while making out-of-scope legacy evidence jobs cheap;
- PR #749 was closed without merge and has no authority effect;
- fresh `npm run pn:status` on full-history `main@f608621...`: `AUTHORITY_STATUS=PASS`;
- current-main Vercel combined status: `success`;
- no post-merge Actions run is attached to `f608621...`; production `/`, `/play` and `/world` remain `PRODUCTION UNVERIFIED` from the steward environment.

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

## World A-01 Cartographic Mass runtime translation — terminal REJECT

PR #747 was closed without merge on 2026-09-27 after its single bounded visual correction.

- initial exact head: `de18b8af0700b6cde75ba51c5692a27948d8ee61`;
- corrected and final reviewed head: `60527d5cc264d9ec97584cb7ee7fe1d3fd71cad0`;
- exact World Atlas run: `36327688161`, terminal success;
- artifact: `10934641204`, SHA-256 `1dc6ed69642e27aac1d52efefd5de9f15b7b5c95b4151dcd8356e8a9536de881`;
- real 1440×900 World frame SHA-256: `d7278e52c9c5a0546e325d62983d48ae7b25aaa16a99e681f142d2586802a4c6`;
- derived 360×225 review frame SHA-256: `98463e01b35dc30545d767b6eef78de42dd902e636d377679174243999a97cd3`;
- deterministic contracts passed with 16 macro regions, canonical A-01 origin, no literal grid, zero full Sector GLBs, unchanged gameplay, no new asset family, a 1550×1150 cartographic mass, crest and North Gate route;
- direct review failed because the cobalt treatment still read as a small soft spot instead of a broad irregular home mass, the crest collapsed to a short white mark at thumbnail scale, and the route projected left/down rather than establishing the intended north-eastern direction;
- terminal verdict: `WORLD_ATLAS_A01_CARTOGRAPHIC_MASS_RUNTIME_V1_REJECT`.

Preserve the finding: source-space radius, route destination and primitive presence do not guarantee camera-space hierarchy. The next art-direction mapping must quantify projected screen footprint and use a materially different runtime-supported composition primitive before another implementation is authorized.

## World screen-space composition mapping — pre-code PASS

Issue #721 records a production-grounded projection proof on `main@f608621bd7d55a85768d34bf5f3d71c4ad686c56`.

- runtime evidence uses `STILL_SIZE=1440×900`, `WORLD_SCALE=0.006`, orthographic camera size `50.0`, focus `[7100,4450]` and offset `[45,58,45]`;
- the legacy A-01 origin radius `330` projects to about 71×48 px at 1440×900 and 18×12 px at 360×225;
- the canonical Aurelian macro-basin radius `[1150,900]` projects to about 223×150 px at 1440×900 and 56×38 px at 360×225;
- this explains why building, flag, crest and small color-spot variants remained below the required thumbnail-scale semantic read;
- the next home primitive must carry the HOME read itself and occupy about 75–100% of the canonical macro-basin footprint;
- target footprint: about 170–220×110–150 px at 1440×900 and 42–55×28–38 px at 360×225;
- a crest or glyph may only confirm the home identity; it must not be the primary semantic carrier.

Classification: `WORLD_SCREEN_SPACE_COMPOSITION_MAPPING_PRE_CODE_PASS`.

This closes the mapping gate but does not accept a runtime representation. The next gate is one live retained-scene Godot proof at both review sizes, with direct screenshot review before generator mutation or product PR creation.

## World HOME inhabited-basin runtime proof — technique PASS, visual acceptance PENDING

PR #753 was independently merged on 2026-09-30 after the live-editor proof and exact-head checks passed.

- accepted PR head: `f5c4d6e2ccc3bae8e16ba530e4d970e4472e89c0`;
- merge/current main SHA: `1e6573a0bcfab165b995d4954289bd9d0a2072e3`;
- changed production files: `game/scenes/aurelian/world_atlas_v1.gd`, `game/tests/world_atlas_v1_test.gd` and `game/artifacts/aurelian-basin/source/world_atlas_v1_spec.json`;
- retained-scene workflow proof completed mutation, correction and two-step undo back to a pixel-identical baseline;
- the inhabited-basin primitive measures 220×140 px at 1440×900 and 55×35 px at 360×225, inside the accepted screen-space contract;
- exact-head World Atlas run: `36708862295`, terminal success;
- World Atlas artifact: `11092659613`, SHA-256 `77657e9d2276e5a6227dc12192f3891dabd1c908ca491f331c1812098e0d6677`;
- exact-head World frame SHA-256: `e2b0efd8ef745852914590e07ee7a5ed039aee90ca2957ddc06549736cabad17`;
- Godot Foundation, Web Export, CI, Visual QA, RC1, P4-P8, P10-P11 and Vercel passed on the exact head;
- post-merge Vercel status is successful; no post-merge Actions run is attached to `1e6573a...`, and production `/`, `/play` and `/world` remain `PRODUCTION UNVERIFIED` from the steward environment.

Direct review confirms a materially stronger inhabited HOME read than the empty or marker-led baseline, but the visible result remains a rough blockout: box-like settlement pieces, flat cultivated plates and weak higher-level hierarchy. Green exact-head evidence and the merge do not convert that frame into terminal visual acceptance.

Classification: `LIVE_EDITOR_WORKFLOW_PASS / INHABITED_BASIN_TECHNIQUE_PASS / WORLD_VISUAL_ACCEPTANCE_PENDING`.

Continue only in the same retained World scene and preserve the proven macro-basin footprint. Encode a new generator state only after a clearly stronger 1440×900 and 360×225 golden frame. If two focused retained-scene passes still read as boxes and plates rather than a coherent inhabited homeland, reject the primitive and revisit art direction instead of continuing parameter tuning.

## World HOME retained-scene composition follow-up — terminal REJECT

Issue #721 records the two allowed focused retained-scene passes completed on 2026-10-03 after PR #754 reconciled the visual gate.

- both passes used the same retained Godot scene; no generator mutation and no product PR were created;
- baseline 1440×900 frame SHA-256: `4fdffcdc957ee9492e94ac5296835b041656757d22a94c464201d80cf301f262`;
- pass 1 reduced plate dominance but still read as a ring of boxes around water;
- pass 2 formed three settlement clusters and broken patchwork field groups but still read primarily as blue BoxMesh buildings and thin land-use strips, especially at 360×225;
- the rejected pass was not encoded;
- the retained scene was restored from checkpoint;
- restored 1440×900 frame SHA-256: `4fdffcdc957ee9492e94ac5296835b041656757d22a94c464201d80cf301f262`, pixel-identical to baseline.

Classification: `INHABITED_BASIN_BOX_PLATE_REALIZATION_REJECT / LIVE_WORKFLOW_HEALTHY / ART_DIRECTION_RESET_REQUIRED`.

The #753 macro-basin screen-space finding remains useful, but isolated box buildings and rectangular parcel plates are terminally rejected as the visible grammar for World HOME. Do not make a third tuning pass.

The authorized replacement direction is `INHABITED_RELIEF_FABRIC`: continuous, irregular terrain-following inhabited land first; integrated road/field/roof texture second; 2–4 sparse existing silhouettes only as secondary confirmation. The hierarchy must read inhabited HOME basin first, river/route direction second and larger World geography third. One retained-scene proof at 1440×900 and 360×225 is allowed. Generator mutation and a product PR remain blocked until direct review finds a stronger golden frame. If the fabric collapses to an overlay/blob or fails to read clearly as inhabited HOME, stop implementation and revisit representation.

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

Sector A-01 breadth is visually accepted at product baseline `80d6eb079e7f7b801b988ba5a7a69da055ccaf4e`. The rejected #737 runtime delta was removed by #739. World / Atlas runtime is **not yet visually accepted**; PR #744 remains accepted static art-direction evidence, while its first bounded runtime translation in #747 is terminally rejected.

## Rejected representation evidence

Do not restart these as new product directions:

- #723 breadth v1 marker/network proof;
- #725 simplified marker/beam v2;
- #726 floating planar surface regions;
- #727 terrain tint/mask variant;
- #737 World A-01 uplift plus scale/spacing tuning as a final representation; retain only its below-ocean root-cause evidence;
- #747 Cartographic Mass runtime color-spot, crest-size and route-point tuning; retain its camera-space pixel-footprint finding;
- the #753 inhabited-basin box/plate realization and its two focused retained-scene composition passes; retain only the macro-basin footprint and healthy live-workflow findings;
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
4. Treat #744 as accepted static art-direction evidence and #747 as its terminally rejected first runtime translation.
5. Treat the issue #721 screen-space composition mapping as `PRE_CODE_PASS`; do not repeat the mapping exercise.
6. Treat #753 as a healthy live-editor and macro-basin footprint finding, not as World visual acceptance.
7. Treat the two post-#754 retained-scene box/plate passes as terminal `INHABITED_BASIN_BOX_PLATE_REALIZATION_REJECT / ART_DIRECTION_RESET_REQUIRED`; do not make a third tuning pass.
8. Run exactly one retained-scene `INHABITED_RELIEF_FABRIC` proof at 1440×900 and 360×225, preserving canonical geography, camera, large-world read and the accepted target footprint.
9. Require continuous terrain-following habitation fabric and road/field/roof macro texture to carry HOME; use sparse existing silhouettes only as secondary confirmation.
10. Directly review both real frames before generator mutation or a product PR. If the fabric reads as an overlay/blob or not clearly inhabited, stop implementation and revisit representation.
11. Do not retry Cartographic Mass color-spot sizing, crest sizing, route-point tuning, flags, landmark scale, terrain-height tuning or box/parcel parameter tuning.
12. After World acceptance, verify Village -> Map -> Sector -> World continuity with real user-facing frames.
13. Keep Village/economy/deeper mechanics frozen until the broader world reads clearly.
14. Own every PR through exact-head CI and visible post-merge verification.

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
