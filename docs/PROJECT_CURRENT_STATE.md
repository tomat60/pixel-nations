# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-25
Current state revision: First Nation Founding accepted, Living Capital Vertical Slice v1 selected
Authority source: this file on the current `main`
Authority baseline SHA: `20293fa6d83b55c886536875566d15fb89c0164b`
Product baseline SHA: `20293fa6d83b55c886536875566d15fb89c0164b`
Current milestone: authorize exactly one Godot Aurelian Living Capital Vertical Slice v1 candidate
Active execution issue: #506
Next allowed action: after this authority update and `docs/GODOT_AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_CONTRACT.md` merge with healthy checks, implement exactly one bounded Living Capital Vertical Slice v1 candidate.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current playable demonstration is Sector A-01 / Aurelian Basin.

Godot remains the target runtime under ADR-001. Next.js `/play` remains a bridge, mechanics reference and rollback surface.

Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Accepted foundation

Do not rebuild these accepted capabilities:

- shared deterministic Aurelian Basin geography and Blender to GLB to Godot pipeline;
- Production Village `claimed / founded / developed / city_chartered`;
- Production Map land-state presentation;
- Production World strategic-direction role;
- World to Map to Village decision handoff;
- normal Godot playable entry and keyboard navigation;
- packaged Aurelian render asset;
- Chromium Web export playability;
- Session Persistence v2 for native and Web;
- explicit First Land Claim;
- explicit First Settlement Founding;
- Aurelian Visible Expansion v1;
- explicit First Settlement Development;
- explicit First Trade Route Connection with cross-view payoff;
- explicit First Trade Caravan Dispatch with cross-view payoff;
- explicit First City Charter with cross-view payoff;
- explicit First Nation Founding with cross-view payoff.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #504 `Implement Godot Aurelian First Nation Founding v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_NATION_FOUNDING_PASS`;
- accepted head: `4bda75d73f5b15aa10358672b4e7c3c15ccdd9b7`;
- merged product baseline: `20293fa6d83b55c886536875566d15fb89c0164b`;
- player path: `World first city recognized -> explicit Found Aurelian Nation -> World first nation founded -> Map Aurelian homeland -> Village Greenvale capital`;
- event: `AURELIAN_FIRST_NATION_FOUNDING=AURELIAN`, emitted only for explicit founding;
- World preserves strategic directions and adds one bounded Aurelian emblem;
- Map preserves the accepted single-land topology, East Route and caravan while adding one homeland cue and Greenvale capital marker;
- Village preserves the accepted 19-node city and adds exactly three bounded civic standards;
- native restart, Web reload and persistent-profile reopen restore `map_aurelian_homeland:east_trade`;
- reopening Village restores `village_greenvale_capital`;
- denied-storage fallback remains `world_neutral:none`;
- direct review confirmed visible city-to-nation progression, correct view roles and unchanged shared geography.

Accepted evidence:

- Playable Entry run `32726753368`, artifact `9519982639`;
- Web Playability run `32726753303`, artifact `9519881895`;
- Session Persistence v2 run `32726753309`, accepted rerun artifact `9520087645`.

Issue #502 is completed by this accepted implementation.

## Current milestone: Living Capital Vertical Slice v1

Binding execution issue: #506.
Binding contract: `docs/GODOT_AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_CONTRACT.md`.

The bottleneck is no longer missing progression states. It is experiential quality: the accepted progression is mechanically coherent, but presentation, motion, density and gamefeel are not yet at the desired product level.

The next candidate must improve both presentation and feel without adding a broad new system.

Required product outcome:

1. Greenvale capital reads as a deliberate civic center rather than a sparse prototype cluster.
2. Settlement, city and capital are visually distinguishable at a glance.
3. At least one accepted progression transition gains visible motion or reveal payoff.
4. Existing trade activity reads as activity rather than only a static marker.
5. Village, Map and World framing improves while preserving one shared physical geography.
6. Aurelian national identity becomes clearer without turning Map or World into a dashboard.
7. Input/state feedback makes the consequence of the player's action easier to understand.
8. The complete accepted path through land, settlement, city and nation remains intact and persistent.

## Allowed scope

- `game/scenes/aurelian/**`;
- `game/tests/**`;
- existing Aurelian manifests, layout and camera definitions;
- existing pinned/licensed assets already in the repository;
- procedural presentation helpers in the existing Godot scene system;
- tween/animation/camera presentation tied to already accepted states;
- one minimal focused workflow adjustment only if required to prove the candidate.

## Forbidden scope

- economy, resources, costs, rewards, inventory or taxes;
- population simulation, workers, timers, queues or production systems;
- another land or multi-land expansion;
- governance, laws, factions, diplomacy or combat;
- empire progression;
- backend, accounts, cloud save or multiplayer;
- React/SVG/CSS rebuilding of final game surfaces;
- new paid assets or paid tools;
- a new asset family without a proven limitation of the current envelope;
- broad CI/platform refactoring inside the product PR;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12 or MAX.

## Execution model

Use the proof-driven loop:

`implement -> fast Godot test -> run/capture -> direct visual review -> one bounded correction -> final exact-head gate`

During iteration, prefer focused Godot import/state tests and deterministic captures. Full persistence, Web and broad regression evidence is required at the final candidate gate, not after every small edit.

Do not split this visible outcome into multiple tiny product PRs unless a hard dependency requires it.

## Evidence and acceptance

The exact candidate head must provide:

- settlement-state visual reference;
- city-state visual reference;
- capital-state visual reference;
- Map view with preserved geography and clearer capital/nation context;
- World view with preserved strategic role and clearer national presence;
- one short motion capture demonstrating improved transition/gamefeel;
- focused tests proving accepted claim/founding/city/nation/persistence semantics did not regress.

Green CI is necessary but not sufficient. Direct screenshot/video review decides acceptance.

Terminal classification:

- `AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_PASS`
- `AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_CORRECTION_REQUIRED`
- `AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_REJECT`

One bounded correction maximum after the first meaningful visual candidate.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Use focused Godot tests during iteration and full evidence at the final gate.
4. Directly inspect running-game images and motion.
5. One bounded visual correction maximum per milestone.
6. An open PR with no meaningful progress for roughly one steward interval is P0.
7. Preserve accepted shared geography and avoid rebuilding the GLB.
8. Continue learning from effective AI game-development workflows, but adopt only practices that improve Pixel Nations quality, speed or cost without adding unnecessary orchestration.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is reference/moodboard only unless a later explicit decision changes that role.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. active execution issue #506;
5. `docs/GODOT_AURELIAN_LIVING_CAPITAL_VERTICAL_SLICE_V1_CONTRACT.md`;
6. accepted exact-head evidence and merged PRs;
7. operating and QA protocols;
8. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful work:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001, root `AGENTS.md`, issue #506 and the current contract;
3. re-fetch live GitHub state;
4. state model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

This authority update stops when this current-state revision and the Living Capital Vertical Slice v1 contract are accepted on `main` with healthy post-merge state.

Then implement exactly one bounded Living Capital Vertical Slice v1 candidate and stop after direct exact-head PASS, CORRECTION_REQUIRED or REJECT before any empire, second-land, economy or governance work.
