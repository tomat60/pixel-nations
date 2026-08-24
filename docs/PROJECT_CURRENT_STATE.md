# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-24
Current state revision: First Nation Founding v1 accepted
Authority source: this file on the current `main`
Authority baseline SHA: `20293fa6d83b55c886536875566d15fb89c0164b`
Product baseline SHA: `20293fa6d83b55c886536875566d15fb89c0164b`
Current milestone: none authorized
Active execution issue: #502
Next allowed action: one bounded strategy review and a separate documentation-only contract for any next product milestone.

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
- direct review confirmed visible city-to-nation progression, correct view roles and unchanged shared geography;
- no visual correction was required.

Accepted evidence:

- Playable Entry run `32726753368`, artifact `9519982639`, digest `sha256:fc00c0e3e9ee0adada6e22934aa7170e059fcf48d61fdb483a41588bc5e6779d`;
- Web Playability run `32726753303`, artifact `9519881895`, digest `sha256:286c484c3438bcec26de8670c14b4f04c307cd9f519a2f31292a8e6fbf6890a0`;
- Session Persistence v2 run `32726753309`, accepted rerun artifact `9520087645`, digest `sha256:0b455fdf9a301c4db2aeb9ea8600c0120d7366300916f08a675354db1b7fe0b2`.

Issue #502 is completed by this accepted implementation.

## Current gate

No additional product implementation is authorized.

Allowed:

- repository QA and release verification;
- one bounded strategy review;
- one separate documentation-only contract for a selected next milestone.

Forbidden until a new contract is accepted on `main`:

- product implementation;
- economy, prices, resources, costs, rewards, inventory or taxes;
- population simulation, workers, timers, queues or repeated actions;
- governance systems, laws, factions, diplomacy or combat;
- empire progression;
- another land or multiple-land expansion;
- new terrain, geography, GLB or asset family;
- broad Village, Map or World polish;
- `app/play/**` or public shell changes;
- backend, accounts, cloud save or multiplayer;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12, MAX, paid tools or image generation authority.

## Release state

- PR #504 exact-head product evidence: PASS;
- PR #504 merge and current main: `20293fa6d83b55c886536875566d15fb89c0164b`;
- post-merge Vercel: SUCCESS;
- issue #502: completed;
- public-origin route verification remains an environment capability boundary, not evidence of an outage.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Use focused Godot tests during iteration and full evidence at the final gate.
4. Directly inspect running-game images and motion.
5. One bounded visual correction maximum per milestone.
6. An open PR with no meaningful progress for roughly one steward interval is P0.
7. Preserve accepted shared geography and avoid rebuilding the GLB.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful as executor, GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not implementation authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. accepted ADRs, especially ADR-001;
3. root `AGENTS.md`;
4. an active execution issue named here;
5. accepted exact-head evidence and merged PRs;
6. operating and QA protocols;
7. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Session start gate

Before meaningful work:

1. run `npm run pn:status` when a checkout is available;
2. read this file, ADR-001 and root `AGENTS.md`;
3. re-fetch live GitHub state;
4. state model and tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

## Current stop condition

Do not start another product implementation before a bounded strategy review and a separate contract are accepted on `main`.
