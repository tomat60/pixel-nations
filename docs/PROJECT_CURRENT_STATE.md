# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-18
Current state revision: 43.1
Authority baseline SHA: `a56c3182aa0d94d83905b6f42a664b0d257029fe`
Product baseline SHA: `6a67f19034beb9868b3609b9f067430bd8b863af`
Runtime baseline SHA: `6a67f19034beb9868b3609b9f067430bd8b863af`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: Empire Seed Strategic Breadth Prototype — final AI-native engine/workflow gate before Map / Sector / World production resumes.
Current milestone: choose the production engine/workflow from one symmetric AI-native Godot vs Unity benchmark, then lock that decision for the current phase and resume visible world breadth.
Active execution issue: #731
Next allowed action: run the same bounded inspect -> edit -> run -> screenshot -> self-correction task on both Godot and Unity using the fresh exact-main clones, the same Sector A-01 source and the same acceptance target. Unity live Pipeline control is verified and no longer blocks execution. Unity only wins if it is materially better end-to-end enough to repay migration; tie or small advantage keeps Godot. After the terminal engine verdict, update this file and ADR-001 before any production Map/World implementation.

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

## Engine decision status

Godot is the **production incumbent and rollback-safe runtime**, not a final engine lock while #731 is open.

ADR-001 records the accepted 2026-07 Godot pivot and remains valid for the existing production baseline. Its exclusive engine-selection conclusion is temporarily under review by #731. This does **not** authorize migration.

Decision rule:

- Unity must show a clear, material advantage in AI production speed, live-editor reliability, visible quality, iteration/recovery and Web viability.
- A tie, a small visual difference or a tooling novelty is not enough to pay back migration of accepted gameplay, persistence and QA.
- If Unity does not materially win, Godot remains the production engine.
- When #731 terminates, lock the chosen engine for at least the current phase / approximately 90 days unless a hard technical blocker appears.

## Current AI-native benchmark evidence

### Godot lane — live-editor handshake PASS

Verified on Netcup:

- Godot: 4.7.1 stable.
- MCP: `godot-editor-mcp 2026.9.17`.
- Bridge: `ws://127.0.0.1:9180`.
- Project: Pixel Nations.
- Benchmark project path: `/home/pnrunner/pn-engine-ab/godot/game/`.
- Active scene at handshake: `res://scenes/aurelian/playable_aurelian_entry_v1.tscn`.
- Existing benchmark scene found correctly: `res://scenes/aurelian/campaign_map_2p5d_benchmark_v1.tscn`.
- Codex successfully inspected the live editor through MCP without file or scene mutation.

This proves the current Godot + Codex live-editor control path exists. It does **not** yet finish the full edit/run/screenshot/self-correction lane.

### Unity lane — live-editor Pipeline handshake PASS

Verified on Netcup:

- Unity Editor: 6000.6.1f1.
- Unity Personal license: active.
- Standard Unity Editor Software Terms accepted for the authorized first run.
- Official Unity Codex plugin: `unity@unity-agent-plugin 0.1.6-beta`, installed and enabled.
- Unity Pipeline package: `com.unity.pipeline 0.7.0-exp.1`.
- URP package: `com.unity.render-pipelines.universal 17.6.0`.
- Official Unity CLI reports the Editor `ready` at `127.0.0.1:7800`.
- Pipeline enumerates 151 live Editor tools.
- A real read-only command round-trip passed: `get_authoring_root` returned `Assets`.
- A second read-only round-trip passed: `list_open_scenes` returned one loaded, active, clean scene with two roots.
- Prior non-AI-native Unity benchmark produced a real 1440x900 Sector frame, but did not show a material migration-worthy advantage.

This proves the current Unity CLI/Pipeline live-editor control path exists. It does **not** yet finish the full edit/run/screenshot/self-correction lane.

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

- public `main` baseline for the engine gate is `a56c3182aa0d94d83905b6f42a664b0d257029fe`;
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

Map and World are **not** visually accepted yet.

## Rejected representation evidence

Do not restart these as new product directions:

- #723 breadth v1 marker/network proof;
- #725 simplified marker/beam v2;
- #726 floating planar surface regions;
- #727 terrain tint/mask variant;
- generated concept-art target as a prerequisite.

#729 2.5D is useful readability evidence, not a final art lock and not sufficient by itself to settle the engine decision.

## Frozen until #731 terminates

- production engine migration;
- deeper Village polish;
- Provision / economy continuation;
- additional one-land micro-systems;
- combat/diplomacy/governance depth;
- paid assets;
- generated visual targets unless explicitly requested;
- GPT-6;
- Cursor MAX;
- broad workflow redesign unrelated to the final engine gate.

## Exact next sequence

1. Use the fresh standalone exact-main clones for both benchmark lanes:
   - `/home/pnrunner/pn-engine-gate-20260918/godot-clean`;
   - `/home/pnrunner/pn-engine-gate-20260918/unity-clean-2`.
2. Preserve existing `pn-engine-ab/evidence` as historical benchmark evidence only.
3. Keep the verified Unity CLI/Pipeline session live; do not repeat activation or first-run setup without a diagnosed need.
4. Run one symmetric AI-native task on Godot and Unity:
   `inspect -> meaningful Map/Sector edit -> run -> screenshot -> one self-correction`.
5. Compare:
   - time to first meaningful frame;
   - critique-to-rerender time;
   - mutation correctness and recovery;
   - visible product quality/readability;
   - asset/import friction;
   - Web build friction;
   - operational/licensing overhead.
6. Make one terminal engine/workflow decision under #731.
7. Update ADR-001 and this file with that verdict.
8. Resume Map / Sector / World breadth production under #721.

## Continuity rule for every new chat / agent

Before planning or coding:

1. run `npm run pn:status` on a fresh/intended checkout;
2. read this file;
3. read #721 and #731;
4. inspect the exact current ref and real benchmark evidence;
5. use #575 only for Sector representation principles;
6. treat all other old issues, briefs, reports, chats, local folders and historical docs as reference-only unless this file explicitly reactivates them.

If a source conflicts with this file or the active strategy/engine gate, the current authority wins.

Green CI is never visual/product acceptance. Owner confusion or lack of confidence in a real product frame outranks a screenshot/CI PASS.
