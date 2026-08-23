# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-23
Current state revision: First Land Claim accepted, First Settlement Founding v1 selected
Authority source: this file on the current `main`
Authority baseline SHA: `cecf7dc4ee4635c8fea97c234ccc4e6b9bbbac40`
Product baseline SHA: `cecf7dc4ee4635c8fea97c234ccc4e6b9bbbac40`
Current milestone: authorize exactly one Godot Aurelian First Settlement Founding v1 candidate
Active execution issue: #415
Active implementation PR: none until this authority update is accepted
Last completed milestone: PR #478 `GODOT_AURELIAN_FIRST_LAND_CLAIM_PASS`, accepted head `82a2f020bbac0bddfbda0d0216ad3990b4b1d12a`, merged as `cecf7dc4ee4635c8fea97c234ccc4e6b9bbbac40`
Next allowed action: after this authority update and `docs/GODOT_AURELIAN_FIRST_SETTLEMENT_FOUNDING_V1_CONTRACT.md` merge with healthy post-merge checks, implement exactly one bounded First Settlement Founding v1 candidate.

## Product truth

Pixel Nations is a strategy game built around:

`one land -> settlement / city -> nation -> empire`

The full logical world contains 10,000 lands in a 100 x 100 structure. The current demo geography is Sector A-01 / Aurelian Basin.

P4-P11 remain accepted. P11 does not authorize P12. ADR-001 remains binding: Godot is the target runtime. Next.js `/play` remains the behavioral reference / rollback shell until a later explicitly accepted replacement milestone.

The demo must prove the fantasy through one understandable player arc before broadening systems.

## Binding view roles

Village, Map and World are three decision layers over one persistent physical geography:

- Village = `HOW`: make one place live and grow.
- Map = `WHERE`: choose, scout, claim and connect nearby land.
- World = `WHY / WHICH DIRECTION`: choose larger strategic direction.

Binding contract: `docs/AURELIAN_VIEW_ROLES_V1.md`.

River, Gilded Crossing, Greenvale origin, roads, landmarks, topology orientation and physical geography remain shared. Camera, LOD, overlays and available interactions may vary by layer.

## Accepted product foundation

The following milestones are accepted and must not be rebuilt for the next slice:

- PR #449: `IMPLEMENTATION_REFERENCE_PASS / PRODUCTION_VISUAL_NOT_YET_ACCEPTED`, deterministic Blender 4.3.2 -> GLB -> Godot 4.7.1 shared Aurelian geography.
- PR #451: `PRODUCTION_VILLAGE_PASS`, accepted `claimed -> founded -> developed` Village presentation.
- PR #454: `PRODUCTION_MAP_PASS`, accepted Map land-state presentation.
- PR #457: `PRODUCTION_WORLD_PASS`, accepted World strategic-direction role.
- PR #460: `AURELIAN_DECISION_LOOP_PASS`, accepted World -> Map -> Village intent handoff.
- PR #463: `GODOT_PLAYABLE_AURELIAN_ENTRY_PASS`, accepted normal Godot entry and keyboard layer navigation.
- PR #466: `GODOT_AURELIAN_RENDER_ASSET_PACKAGING_PASS`, canonical packaged Aurelian GLB.
- PR #469: `GODOT_WEB_EXPORT_PLAYABILITY_PASS`, accepted real Chromium Web export playability.
- PR #475: `GODOT_AURELIAN_SESSION_PERSISTENCE_V2_PASS`, accepted native FileAccess JSON plus synchronous Web localStorage adapter.
- PR #478: `GODOT_AURELIAN_FIRST_LAND_CLAIM_PASS`, accepted explicit first-land claim and persistent claimed state.

Accepted GLB identity remains `04116e3d662d461f0d29ca797444193b0873f5aba6012790af7d366c63e01048` unless a later explicit asset milestone changes it.

Rejected paths remain rejected unless a new documented blocker requires reconsideration:

- independent React/SVG/CSS Village/Map/World geography;
- primitive procedural Godot/KayKit visual proof paths #426/#447;
- rejected authored-terrain candidates #429/#437/#448;
- Session Persistence v1 Web `user://` technique from #472;
- free-form generated fantasy/dashboard imagery as implementation authority.

## Accepted First Land Claim v1

PR #478 accepted runtime path:

`world_neutral -> world_trade_selected -> map_east_route_selected -> explicit claim -> map_east_route_claimed -> village_claimed -> returned claimed Map -> world_trade_selected`

Final evidence identity:

- accepted head: `82a2f020bbac0bddfbda0d0216ad3990b4b1d12a`;
- merge: `cecf7dc4ee4635c8fea97c234ccc4e6b9bbbac40`;
- Playable Entry run: `32633954725`, artifact `9491816242`, digest `sha256:288ec879d5d195de0cf2bf84f298bd027068b3d0aded5d8234c57566e408b60d`;
- Web Playability run: `32633954720`, artifact `9491819439`, digest `sha256:49a96686a4021933510b1ec405bc326ec5d7170cfddcc2cf12e20e5b43dcdf79`;
- Session Persistence v2 run: `32633954704`, artifact `9491823626`, digest `sha256:c6d9ac4f2787ba55c05d870627bb2b75bf13b71ffbf5a15424bf3331511dcf1c`;
- final classification: `GODOT_AURELIAN_FIRST_LAND_CLAIM_PASS`.

The first meaningful artifact was technically green but visually wrong because developed Greenvale was visible before the first claim. The single permitted bounded visual correction hid settlement structures in pre-claim World/Map states and preserved the accepted `claimed` consequence only after explicit claim. Direct review accepted the corrected exact-head artifacts.

The accepted persistence proof preserves `map_east_route_claimed:east_trade` through native restart, same-origin Chromium reload and same-profile browser reopen. Real input after restore opens `village_claimed`. Denied Web storage safely falls back to `world_neutral:none`.

## Current bounded milestone: First Settlement Founding v1

Binding proposed contract: `docs/GODOT_AURELIAN_FIRST_SETTLEMENT_FOUNDING_V1_CONTRACT.md`.

The next smallest core-loop step is:

`claimed land -> explicit Found Greenvale -> founded settlement`

The accepted Production Village already contains both `claimed` and `founded` visual states. The next implementation must connect those existing states through one deliberate player action. It must not build a new Village art system.

Required product truth:

1. East Route is already claimed before founding begins.
2. Opening Village shows the accepted `claimed` state.
3. The HUD exposes an explicit `Found Greenvale` action.
4. Founding changes Village to the accepted `founded` state.
5. Leaving Village does not erase the founded state.
6. Returning to Village still shows founded.
7. Native restart, Web reload and same-profile browser reopen preserve founded state.
8. Map continues to show East Route as claimed.
9. World/Map/Village shared geography does not change.

No resource cost, timer, worker, production queue or economy is needed to prove this milestone.

## Allowed scope for First Settlement Founding v1

Allowed:

- `game/scenes/aurelian/**` for the existing playable controller, manifests and Village state binding;
- `game/tests/**` for founding semantics, transitions and persistence;
- existing focused Playable Entry, Web Playability and Session Persistence v2 evidence workflows where necessary;
- one additional small focused evidence workflow only if existing evidence cannot prove founding.

Forbidden:

- terrain or GLB rebuild;
- new asset family or paid asset;
- broad Village/Map/World visual polish;
- economy, resource costs, timers, workers or production queues;
- multiple-land expansion or scouting expansion;
- city/nation/empire mechanics;
- `app/play/**` or public route replacement;
- backend, accounts, cloud save, multiplayer, combat, diplomacy or crypto;
- P12;
- MAX or paid tools.

## Evidence and acceptance gate

One exact candidate head must provide:

- Village claimed before founding;
- explicit founding-action proof;
- Village founded after action;
- returned claimed Map;
- reopened founded Village;
- normal-input claim -> open -> found -> return -> reopen sequence;
- native restart, Web reload and same-profile reopen preserving founded;
- exact-head transition/state tests and manifests;
- World/Map/Village geography regression proof.

Green CI is necessary but never sufficient. Direct screenshot/video review is required.

Terminal classification:

- `GODOT_AURELIAN_FIRST_SETTLEMENT_FOUNDING_PASS`
- `GODOT_AURELIAN_FIRST_SETTLEMENT_FOUNDING_REJECT`

One bounded correction maximum after the first meaningful artifact. Then PASS or REJECT.

## Product interaction hierarchy

1. World creates a strategic reason to expand.
2. Map chooses and claims nearby land.
3. Village converts claimed land into settlement growth.
4. Settlement growth may unlock later Map/World options only after the current local loop is understandable.

This feedback loop matters more than adding decoration to any one view.

## Process acceleration rules

1. One active product/recovery PR at a time.
2. Do not rebuild shared terrain for view-specific interactions.
3. One milestone changes one decision layer; other layers are regression evidence.
4. Use focused Godot workflows before broad legacy web QA.
5. Green CI is necessary but not visual acceptance.
6. Directly review artifacts immediately after focused success.
7. One meaningful candidate, one bounded correction, then PASS or REJECT.
8. Infra failure before product validation gets smallest-job recovery, not a new product commit.
9. Do not rerun successful exact-head checks solely because PR metadata changed when repository protection does not require it.
10. User-reported confusion/rejection overrides screenshot-only QA.
11. An open PR with no progress for roughly one steward interval is P0 and must be inspected, not left for the user to notice.

## Tool and cost policy

- Strategy/control/direct review: GPT-5.6 Sol.
- Deterministic GitHub/Godot first.
- Blender only if the accepted shared asset itself must change, which is not authorized in the current milestone.
- Cursor only when it materially speeds a precisely scoped implementation task.
- Default Cursor if used: GPT-5.5 without MAX.
- MAX: OFF.
- Extra spend target: 0 USD.
- No new paid tool or asset family without a named blocker and explicit value case.

## Mandatory PR/release ownership

The user is not responsible for detecting stuck PRs, failed checks, stale evidence or broken releases.

For every PR/head change:

- fetch exact head/base and ahead/behind;
- verify changed-file scope and mergeability;
- inspect exact-head workflows/jobs;
- inspect required artifacts directly;
- classify `PENDING / BLOCKED / REJECTED / READY`.

After every write, branch, PR, workflow or merge movement, refetch exact state immediately.

After merge, verify accepted head -> merge SHA -> new `main` -> repo checks -> available deployment status.

## Source-of-truth precedence

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially ADR-001
3. root `AGENTS.md`
4. active issue #415
5. current accepted milestone contract
6. `docs/AURELIAN_VIEW_ROLES_V1.md`
7. accepted topology/art-direction/reference contracts
8. accepted exact-head evidence and operating protocols
9. historical issues, branches and closed PRs

## Session start gate

Before meaningful product implementation:

1. Run `npm run pn:status` when a checkout is available.
2. Read this file, ADR-001, root `AGENTS.md`, #415 and the current milestone contract.
3. Re-fetch live GitHub state.
4. State model/tool, MAX, cost, allowed scope, forbidden actions, validation and stop condition.

If `pn:status` returns `AUTHORITY_STATUS=FAIL` or `BLOCKED_STALE_PROJECT_STATE`, stop product work and repair authority first.

## Current stop condition

This authority update stops when the First Settlement Founding v1 contract and this current-state revision are accepted on `main` with healthy post-merge state.

Then implement exactly one bounded First Settlement Founding v1 candidate. Stop after direct exact-head PASS or REJECT before any economy, city, multiple-land or broader expansion work.
