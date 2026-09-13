# Aurelian Minimal Economy Foundation v1 Research

Status: PASS candidate
Issue: #715
Baseline: `main@36130d57faef6c064484a4a9ad83c63bc6996036`
Terminal label: `AURELIAN_MINIMAL_ECONOMY_FOUNDATION_V1_RESEARCH_PASS`

## Decision

Select **Aurelian Provision Allocation v1** as the smallest truthful economy candidate.

One Aurelian Provision is acquired by the already accepted first-caravan dispatch. At the existing North Ridge outpost establishment decision, the player must explicitly choose one of two mutually exclusive destinations:

1. allocate the Provision to North Ridge, consuming it to establish the existing North Ridge Outpost and preserving the accepted Trade Post / Watch Post continuation;
2. hold the Provision as a committed Greenvale Reserve, leaving claimed North Ridge without an outpost.

This is not Frontier Capacity under another name. Frontier Capacity is a derived 1-to-0 commitment boundary that has only the specialization use. Aurelian Provision has an earlier acquisition event, remains scarce across later accepted progression, and has two geographically different uses with persistent, mutually exclusive consequences.

## Fresh repository findings

- The accepted first-caravan action already sets `caravan_dispatched` and persists it.
- The current default session reaches the two-land North Ridge final before the existing outpost graph.
- The outpost graph already owns truthful states for claimed inspection, establishment, administration and the later Trade Post / Watch Post split.
- `frontier_capacity()` is derived only from `north_ridge_outpost == "established"` and `north_ridge_specialization == "none"`; it adds no persistent field.
- The current session adapter already persists the outpost and specialization fields, so one enum with fail-closed fallback is the minimum new persistence fact.
- Phase C in the strategy plan asks for the smallest resource set and one or two development tradeoffs, and rejects resources that do not change a decision or visible world.

## Models compared

| Model | Acquisition | Choice | Player value | Truthfulness and observability | Persistence and regression risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| **Aurelian Provision** | Exactly one unit on the accepted first-caravan dispatch | Consume at North Ridge Outpost or commit as Greenvale Reserve | Connects the first trade action to later expansion and creates an understandable spend-versus-hold decision | A single physical provision token remains at Greenvale when held; spending removes it and exposes the existing North Ridge Outpost. The outcome is visible in Village, Map and World | One enum; deterministic legacy inference from existing caravan/outpost facts; reuses the accepted outpost branch | **SELECT** |
| Construction Timber | One unit from a new forest/work action | Build North Ridge Outpost or improve Greenvale | Concrete and visually legible | The repository has a forest/work edge but no accepted player-owned harvesting action or inventory fact. Acquisition would require a new mechanic before the decision | Requires gathering states, presentation and persistence in addition to allocation; high scope and controller risk | REJECT |
| Trade Cargo | One unit from the first caravan | Seed Trade Post or retain cargo in Greenvale | Easy to explain on the Trade branch | Cargo does not truthfully fund the Watch Post branch and would bias or duplicate the already accepted specialization choice | Either fragments the accepted two-branch graph or needs a second conversion rule; poor reversibility | REJECT |

A fourth abstract model, Civic Mandate, was excluded before scoring because it behaves like authority/capacity rather than a material resource and would mostly change HUD copy.

## Selected contract

### Resource and acquisition

- Public name: `Aurelian Provision`.
- Quantity ceiling: exactly one.
- Acquisition fact: available when `caravan_dispatched == true` and no destination is committed.
- No timer, tick, random roll, passive production, repeatable grant or second unit.
- Reloading or reopening cannot grant another unit.

### Explicit decision

The decision is inserted only at the existing `village_north_ridge_outpost_establish_action` boundary after two lands are claimed.

- `ENTER`: allocate Provision to North Ridge and establish the existing outpost.
- `DOWN`, then `ENTER`: commit Provision as Greenvale Reserve.
- The currently inspected choice must be explicit before confirmation.
- A press, applied-action receipt, resulting-state receipt and release receipt are required before the next input.

### Mutually exclusive visible consequences

**North Ridge allocation**

- Village: the provision token is absent from Greenvale and administration copy identifies the committed outpost.
- Map: the existing North Ridge Outpost marker is present.
- World: the existing held-frontier posture is present.
- Existing Trade Post / Watch Post specialization remains reachable.

**Greenvale Reserve**

- Village: the same provision token remains physically stored at Greenvale.
- Map: Greenvale carries the reserve locus and North Ridge remains claimed with no outpost marker.
- World: the reserve remains attached to Greenvale while North Ridge is visibly unprovisioned.
- The North Ridge specialization graph is not reachable in v1.

The token is one object in the canonical Aurelian geography. Camera-specific visibility/LOD may vary, but its transform and destination may not be separately authored per view. HUD text may identify the quantity and destination, but HUD-only evidence fails.

### State and persistence delta

Add exactly one persisted enum:

`first_provision_allocation = "none" | "north_ridge_outpost" | "greenvale_reserve"`

Derived quantities:

- available Provision = 1 only when `caravan_dispatched` is true and allocation is `none`;
- Greenvale Reserve = 1 only when allocation is `greenvale_reserve`;
- available Provision = 0 after North Ridge allocation.

Fail-closed load rules:

1. missing or invalid allocation loads as `none`;
2. if a legacy session has `north_ridge_outpost == "established"` or a committed specialization, infer `north_ridge_outpost`;
3. if `caravan_dispatched == false`, allocation must sanitize to `none`;
4. no load path may fabricate a caravan, an outpost, a specialization or a second Provision;
5. the existing session version and storage location remain unchanged unless preflight proves a version bump is mandatory.

## Proposed later implementation ceiling

A later implementation candidate may change at most these seven exact files, subject to fresh preflight and separate merged authority:

1. `game/scenes/aurelian/playable_aurelian_first_session_v6.gd`
2. `game/scenes/aurelian/aurelian_session_persistence_v2.gd`
3. `game/scenes/aurelian/aurelian_minimal_economy_foundation_v1_manifest.json`
4. `game/tests/aurelian_minimal_economy_foundation_v1_test.gd`
5. `.github/workflows/godot-aurelian-minimal-economy-foundation-v1.yml`
6. `.github/workflows/production-village-v1.yml`
7. `.github/workflows/godot-aurelian-view-lod-contract-v2.yml`

No implementation file is authorized by this research. Preflight must prove that existing path filters select every other named regression; otherwise the candidate is rejected or a new authority explicitly revises the ceiling before a branch exists.

## Mandatory implementation preflight

Before any product branch:

1. prove the exact current input index and state at acquisition and at both decision confirmations;
2. prove all direct and transitive workflow path filters for the seven-file ceiling;
3. prove the session adapter can add the enum with missing/invalid/legacy fallback without changing storage identity;
4. prove the existing North Ridge allocation reaches the unchanged Trade and Watch branches;
5. define new terminal Reserve states without reusing names that imply an outpost exists;
6. prove one canonical token/presentation can be visible from Village, Map and World without new assets or geography;
7. enumerate exact state sanitizer rules for fresh, legacy outpost, Trade, Watch and invalid sessions;
8. lock the first 35 inputs unchanged and use receipt-gated normal input thereafter;
9. confirm no second resource, income loop, worker, timer, queue, price, market, tax, third land, combat, diplomacy, backend or broad controller rewrite;
10. record `IMPLEMENTATION_PREFLIGHT_PASS` on a separate implementation issue, then require separate merged authority before implementation.

## Required exact-head evidence for a later candidate

- one clean North Ridge allocation profile and one clean Greenvale Reserve profile in native;
- the same two clean profiles in exported Web;
- continuous video for all four runs;
- exactly eight 1440 x 900 stills per branch covering acquisition, inspected choice, confirmation, Village consequence, Map consequence, World consequence, native restart and Web reload/profile reopen;
- manifest with SHA-256 for every still, video, state log and persistence record;
- exact press, action receipt, resulting state and release receipt for every normal input;
- acquisition occurs once, quantity never exceeds one and reload never duplicates it;
- North Ridge branch persists outpost plus later Trade or Watch choice;
- Reserve branch persists Greenvale Reserve and truthfully keeps North Ridge without an outpost;
- shared geography, GLB, topology, cameras, sole input ownership and the accepted first 35 inputs remain unchanged;
- focused workflow plus Default First Session v6, Input Release Boundary v3, Production Village, View LOD v2, Session Persistence v2, Web Playability, Playable Entry, Foundation, CI, Visual QA, P4-P8 and P10-P11;
- direct review of all frames, videos, logs, manifests, persistence records and hashes.

Green CI alone is not acceptance. One complete implementation candidate and at most one bounded correction would be allowed. Product PASS would be only `GODOT_AURELIAN_MINIMAL_ECONOMY_FOUNDATION_V1_PASS`; otherwise terminal `GODOT_AURELIAN_MINIMAL_ECONOMY_FOUNDATION_V1_REJECT`.

## Research stop condition

This document satisfies the research contract by selecting one bounded model, naming its one acquisition rule, real spend-versus-hold decision, cross-view consequences, minimum persistence delta, exact proposed files, preflight and evidence gates.

Research PASS still authorizes no product implementation. The next safe action after merge is a fresh implementation issue and preflight plus a separate merged authority.