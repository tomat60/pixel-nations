# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-26
Current state revision: Directional Empire Identity v1 authorized
Authority source: this file on the current `main`
Authority baseline SHA: `8fe1436ee6824606304d2c4bb55c06b85636c2ee`
Product baseline SHA: `ebdc103a3f2a9ff4c8a495e9547a084ae9a6a715`
Current milestone: Directional Empire Identity v1 authorized for exactly one bounded implementation candidate
Active execution issue: #522
Next allowed action: implement exactly one Godot Aurelian Directional Empire Identity v1 candidate under the accepted contract, then run exact-head evidence and direct review.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement -> city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current playable demonstration remains Sector A-01 / Aurelian Basin.

Godot remains the target runtime under ADR-001. Next.js `/play` remains a bridge, mechanics reference and rollback surface.

Village, Map and World remain three roles over one physical geography:

- Village = HOW
- Map = WHERE
- World = WHY / WHICH DIRECTION

## Accepted foundation

Do not rebuild these accepted capabilities:

- shared deterministic Aurelian Basin geography and Blender to GLB to Godot pipeline;
- Production Village progression through claimed, founded, developed, city, capital and imperial capital;
- Production Map land, route, city, homeland and imperial heartland presentation;
- Production World strategic-direction, nation and first-empire role;
- World to Map to Village decision handoff;
- normal Godot playable entry and keyboard navigation;
- packaged Aurelian render asset;
- Chromium Web export playability;
- Session Persistence v2 for native and Web;
- explicit First Land Claim;
- explicit First Settlement Founding;
- Aurelian Visible Expansion v1;
- explicit First Settlement Development;
- explicit First Trade Route Connection;
- explicit First Trade Caravan Dispatch;
- explicit First City Charter;
- explicit First Nation Founding;
- Living Capital Vertical Slice v1;
- First National Direction Commitment v1;
- First National Mandate v1;
- First Empire Proclamation v1.

Accepted GLB identity and shared physical geography remain unchanged.

## Most recent accepted product milestone

PR #520 `Implement Godot Aurelian First Empire Proclamation v1` is accepted and merged.

- terminal result: `GODOT_AURELIAN_FIRST_EMPIRE_PROCLAMATION_PASS`;
- accepted head: `864d888f5f159f59447bda099177d7b36066a213`;
- merged product baseline: `ebdc103a3f2a9ff4c8a495e9547a084ae9a6a715`;
- Village owns the deliberate `Proclaim Aurelian Empire` action and imperial-capital presentation;
- Map shows the existing homeland as the imperial heartland without changing ownership or geography;
- World recognizes the first Aurelian Empire while preserving Trade, Expand or Frontier;
- Session Persistence v2 preserves `empire_proclaimed=true` and the committed direction;
- direct still and motion review accepted the candidate after one bounded visual correction;
- no new asset, GLB or geography was added.

Accepted exact-head evidence:

- Playable Entry run `32976610513`, artifact `9610013150`, digest `sha256:770d8e135a8e6e961fe2a1564b9c91cf44dbeceeba387015288d7bad5dc19d0c`;
- Web Playability run `32976610533`, artifact `9609824128`, digest `sha256:93416bce16e0ad36140c2e9934af019ff79d099e09a47f883e95277f213b0002`;
- Session Persistence v2 run `32976610485`, artifact `9609855562`, digest `sha256:f1122de8633798e290659e0d228a45dc1248ae270d65f4451fbabbba877c3aba`.

Issue #518 is completed by this accepted implementation.

## Strategy decision

The linear first-run fantasy is complete. Another state after proclamation would add little playable value.

The next bounded slice makes the already accepted Trade, Expand or Frontier commitment visibly consequential at the empire endpoint:

`committed direction -> mandate underway -> explicit empire proclamation -> direction-specific imperial capital -> direction-specific imperial heartland -> direction-specific first empire identity`

This is a payoff for an existing strategic choice, not post-proclamation progression.

## Current authority

Issue #522 and `docs/GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_V1_CONTRACT.md` authorize exactly one implementation candidate.

The candidate must:

- preserve the accepted proclamation action and event;
- make Trade, Expand and Frontier materially distinguishable without relying only on HUD prose;
- keep Village as HOW, Map as WHERE and World as WHY / WHICH DIRECTION;
- preserve the committed direction and `empire_proclaimed=true` across native restart, Web reload and persistent-profile reopen;
- preserve all shared geography and accepted imperial hierarchy;
- produce exact-head Playable Entry, Web Playability and Session Persistence evidence;
- receive direct still and motion review for all three variants.

Green CI alone is not acceptance. One bounded visual correction maximum is allowed. The terminal classification must be exactly:

- `GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_PASS`; or
- `GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_REJECT`.

## Allowed scope

- one exact manifest for Trade, Expand and Frontier outcomes;
- focused controller and HUD changes under the accepted Godot Aurelian surface;
- restrained procedural direction cues using accepted geometry, colors and loci;
- focused tests and Session Persistence v2 fixtures;
- narrowly scoped updates to the existing evidence workflows;
- contract-linked documentation.

## Forbidden scope

- progression after first empire proclamation;
- another land, territorial ownership change or multi-land simulation;
- economy, resources, costs, rewards, taxes, production or inventory;
- population, workers, timers or queues;
- governance systems, laws, factions or diplomacy;
- combat, units, damage or military simulation;
- backend, accounts, cloud save or multiplayer;
- React, SVG or CSS rebuilding of final game surfaces;
- new GLB, terrain, geography, asset family, dependency, paid asset or paid tool;
- broad visual polish, broad CI changes or platform refactoring;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12 or MAX.

## Process rules

1. Optimize for visible playable progress, not gate count.
2. One active product or recovery PR at a time.
3. Green CI is necessary but not sufficient for visual or product acceptance.
4. Directly inspect running-game images, motion and persistence artifacts.
5. Preserve the accepted shared geography and avoid rebuilding the GLB.
6. Any head movement invalidates older evidence.
7. Fix deterministic failures at root cause on the same PR.
8. Rerun only the smallest failing job for isolated infrastructure failures.

## Tool and cost policy

- Strategy, control and direct review: GPT-5.6 Sol.
- Deterministic GitHub and Godot tooling first.
- Cursor only when materially useful as executor, default GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- Image generation is not acceptance authority.

## Source-of-truth precedence

1. this `PROJECT_CURRENT_STATE.md`;
2. `docs/GODOT_AURELIAN_DIRECTIONAL_EMPIRE_IDENTITY_V1_CONTRACT.md`;
3. active execution issue #522;
4. accepted ADRs, especially ADR-001;
5. root `AGENTS.md`;
6. accepted exact-head evidence and merged PRs;
7. operating and QA protocols;
8. historical issues, PRs, briefs and reports.

Issue #415 remains shared-geography history and continuity guidance, not current implementation authority.

## Current stop condition

Stop after one accepted or rejected Directional Empire Identity v1 candidate. A PASS must be recorded in this file before any later strategy review. A REJECT must restore the accepted First Empire Proclamation baseline and record the exact reason.
