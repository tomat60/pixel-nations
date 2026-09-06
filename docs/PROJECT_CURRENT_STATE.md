# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-09-06
Current state revision: 9
Authority baseline SHA: `d1ff16d678b3030cba14b08a3c0f679e9f942708`
Product baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Runtime baseline SHA: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`
Gameplay rollback baseline SHA: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

Current product phase: finish the whole-game progression blockout by proving credible world scale before deeper mechanics.
Current milestone: World Scale Representation Recovery v3 - Sector campaign-map layer.
Active execution issue: #575
Next allowed action: after this authority update merges, implement exactly one Sector A-01 campaign-map candidate using a dedicated regional abstraction. Atlas implementation remains blocked until direct Sector visual PASS.

## Accepted product baseline

Full Progression Visual Grammar v2 and Full Progression Clarity & Composition v1 are accepted and merged.

Terminal results:
- `FULL_PROGRESSION_VISUAL_GRAMMAR_V2_GATE_B_PASS`
- `FULL_PROGRESSION_CLARITY_COMPOSITION_V1_PASS`

Latest accepted exact product head: `75d2372d9dd3651389bf1cb81da87bc788fe2520`
Latest merged product baseline: `d2c3d7a0dbf603b4a23d72d8fe5494e560c73147`

The accepted `land -> settlement -> city -> nation -> empire` visual grammar remains unchanged by world-scale recovery work.

## Accepted gameplay rollback baseline

First Inter-Land Coordination v1 remains the latest accepted deep-gameplay rollback point.

Terminal result: `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS`.
Accepted exact head: `0f8e5e7636a3f03ba7640801bdee399b839308ab`
Merged gameplay rollback baseline: `cf952cc055af15370bcc99a71893b8f9aa7c83ab`

## World-scale recovery status

Issue #575 remains the single active world-scale authority.

Rejected implementations are reference only and must not merge:

1. World Scale Reveal v1 token layout - isolated polygon/board pieces.
2. World Scale Reveal v1 continuous-surface correction - technically green but not a credible physical world.
3. Runtime regional heightfield R1 at `7ef763c835cf068a0735aacf54ff7bf523c26bab` - technically green but visually a rectangular/diamond board with token-like anchors.
4. PR #578 authored Sector v1 Candidate 1 at `23422ac2b0a18f77a0c2e970bce58a7b0ace7f5c` - irregular terrain existed, but the whole landmass and large KayKit landmarks still read as a floating board with tokens.
5. PR #578 authored Sector v1 Candidate 2 at `aea5f140c9c72b0d435bec2b70dc6dc922791b6c` - exact-head run `34045309440`, artifact `9992918206`, technically PASS but terminal direct visual classification `WORLD_SCALE_AUTHORED_SECTOR_V1_REJECT`.

The Blender -> GLB -> Godot pipeline itself remains valid. The rejected representation was the combination of a bounded polygon/grid-derived landmass and local-scale KayKit buildings used as regional settlement tokens.

No Candidate 3 from PR #578 is authorized.

## Research conclusion

The current representation decision follows proven strategy-map principles rather than literal local-scene continuity.

Against the Storm is the strongest product reference:
- City Builder Layer and World Map Layer are separate representations;
- its World Map was rebuilt as fully 3D terrain while retaining clean strategic readability;
- later updates blended map terrain, reduced rigid-grid emphasis, toned biome colors down, and changed World Map town models.

Total War provides a second useful principle:
- campaign provinces and settlements are strategic-map objects;
- the campaign map is not a miniature replay of local battle/city geometry.

Pixel Nations should copy these principles, never their assets or exact layouts.

## Binding representation decision

Sector A-01 is a dedicated **campaign-map layer**.

Local / Village remains the detailed physical settlement layer.
Sector is a regional strategic abstraction.
World Atlas will later be a separate macro abstraction.

Continuity is semantic and visual, not literal geometry or camera zoom.

### Sector terrain

- terrain must extend beyond the camera on every non-coastal side;
- no outer terrain mesh edge may be visible;
- the frame is a crop of a larger landscape, never a complete island, tile or board piece;
- coastline, inlet or river mouth may enter the frame as internal geography, but must not define the full outer silhouette;
- large relief chains, basin/valley, river and vegetation masses establish hierarchy before settlement markers;
- terrain color transitions support relief and may not read as visible biome cells;
- river/water must visually belong to the landscape rather than sit on top as an overlay strip;
- no grid, giant territory ring or dashboard-first treatment.

### Sector settlement language

Do not reuse local KayKit buildings as large regional map tokens.

Aurelian receives one dedicated low-detail regional capital miniature or sigil that preserves recognizable Pixel Nations identity through:
- blue-roof / blue-heraldic cue;
- capital hierarchy;
- compact settlement silhouette;
- relationship to river/basin geography.

Secondary loci use materially smaller neutral regional miniatures or POI silhouettes.

At regional scale, settlement markers support geography. They do not dominate it.

### Visual hierarchy

At thumbnail size the intended read order is:

1. terrain masses and water;
2. Aurelian capital;
3. secondary loci / frontier;
4. any supporting strategic detail.

If buildings read before geography, reject.

The uninformed read must be: `this is a wider strategic region containing our home`.

## Sector proof gate

Capture exactly:
- accepted local Aurelian reference;
- one Sector A-01 campaign-map frame.

PASS only if:
1. no visible complete land/board silhouette remains;
2. terrain extends convincingly beyond the frame;
3. macro relief, river and vegetation establish natural hierarchy;
4. Aurelian is recognizable but subordinate to the region;
5. at least five other geographic/strategic loci are readable without oversized building tokens;
6. no grid/cell/dashboard-first read remains;
7. direct review classifies the frame as a credible strategy-game regional map.

Green CI alone is not acceptance.

One complete campaign-map candidate plus at most one bounded correction is authorized. If it still fails, stop before Atlas and revisit representation again.

## Implementation boundary

Allowed after this authority update merges:
- reuse the existing deterministic Blender -> GLB -> Godot execution pipeline;
- one large continuous terrain surface whose technical edges stay outside the camera;
- dedicated campaign-scale primitive/miniature geometry authored from project-owned procedural primitives and current palette;
- existing Aurelian assets only as visual-language reference, not large regional props;
- one fixed regional camera;
- one focused contract and exactly two-frame evidence;
- research/direct visual comparison against strategy-map references.

Forbidden:
- merging or extending PR #578;
- another complete-island/polygon-board representation;
- local KayKit buildings as primary Sector settlement markers;
- Atlas before Sector PASS;
- economy/resources/workers/timers/queues;
- combat/diplomacy/governance;
- repeatable expansion simulation;
- literal 10,000-land rendering;
- broad playable controller rewrite;
- paid external asset family;
- backend/multiplayer/accounts/payments;
- MAX or paid tools.

## World-model semantics

The canonical world identity remains:
- 10,000 lands;
- 100 sectors;
- 100 lands per sector;
- Sector A-01 as origin.

These values are systemic semantics. They do not require literal rendering of 10,000 lands or 100 equal visible sector cells.

## Tool and cost policy

- Strategy, research, art direction and direct review: GPT-5.6 Sol.
- First campaign-map candidate: deterministic Blender/Godot/GitHub.
- Cursor remains blocked unless a later precisely reviewed task materially benefits from delegation.
- AI image generation is moodboard/visual-target support only, not automatic production acceptance.
- MAX OFF.
- Extra spend target: 0 USD.

## Durable build sequence

1. Sector A-01 campaign-map proof.
2. World Atlas proof only after Sector PASS.
3. Core Playable Loop Consolidation.
4. Minimal Economy Foundation.
5. Repeatable Expansion Loop.
6. Nation gameplay depth.
7. Empire gameplay depth and scaling.
8. Content scale, polish, UX, audio and performance.

A whole-product portfolio gate may reorder later phases when direct evidence identifies a stronger bottleneck.

## Historical references

- PR #561 Third-Land Prospect v1: terminal REJECT/reference only.
- PR #565 Full Progression Blockout v1: terminal REJECT/reference only.
- PR #569 Full Progression Visual Grammar v2: accepted and merged.
- PR #572 Full Progression Clarity & Composition v1: accepted and merged.
- Issue #573 World Scale Reveal v1: terminal REJECT, superseded by #575.
- PR #578 authored Sector v1: terminal REJECT/reference only, closed unmerged.
- Historical React world maps: semantic/data reference only, never target runtime presentation.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs;
3. root `AGENTS.md`;
4. `docs/GAME_STRATEGY_MASTER_PLAN.md`;
5. active execution issue #575;
6. accepted exact-head evidence and merged baselines;
7. active operating/QA protocols;
8. older issues, PRs, briefs and artifacts as history/reference only.

## Current stop condition

Implementation remains blocked until this authority update merges. After merge, exactly one Sector A-01 campaign-map candidate is authorized. Atlas and deeper mechanics remain blocked until direct Sector visual PASS.