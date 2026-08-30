# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-30
Current state revision: 1
Authority baseline SHA: `68ca85b49602125bc4829fe71de1288eb760aefd`
Product baseline SHA: `68ca85b49602125bc4829fe71de1288eb760aefd`

Current milestone: authorize exactly one bounded Godot Aurelian candidate for First Inter-Land Coordination v1.

Active execution issue: #555
Next allowed action: after this authority transition merges with healthy exact-head checks, implement exactly one bounded First Inter-Land Coordination v1 candidate.

## Accepted product baseline

North Ridge Specialization Payoff v1 is accepted as `GODOT_AURELIAN_NORTH_RIDGE_SPECIALIZATION_PAYOFF_PASS`.

Accepted exact head: `b9db7b2dde50c5ef1169117514721e44b4dd1ca9`
Merge commit: `68ca85b49602125bc4829fe71de1288eb760aefd`

Exact-head evidence:

- Playable Entry: run `33318965669`, artifact `9734499631`, digest `sha256:9b05179fd838da70ee2f480353656b37b66b1b60962d0858ae3f7834fd58712c`
- Web Playability: run `33318965887`, artifact `9734381172`, digest `sha256:32b145d3853712aeca00fddc020ecc86e8aeb256f9d45a6c7c3299a3a95ba348`
- Session Persistence v2: run `33318965840`, artifact `9734411723`, digest `sha256:bb62b7e9d577cc416adacee4205009c72673c75651abcf12cf38181ccddd3578`

Direct review confirmed:

- Trade Post exposes and persists `Open Ridge Logistics Line`.
- Watch Post exposes and persists `Light North Ridge Signal`.
- Both results remain visually and semantically distinct.
- Each profile emits exactly one matching payoff event.
- Native restart, Web reload and profile reopen preserve the chosen payoff.
- Village remains HOW, Map remains WHERE and World remains WHY/WHICH DIRECTION.
- East Route, North Ridge, Greenvale and one physical Aurelian Basin geography remain unchanged.

Issue #551 is complete. Post-merge Vercel status for the product baseline is `SUCCESS`. Public route smoke remains `PRODUCTION UNVERIFIED` because the deployment check does not expose a canonical public origin.

## Strategy decision

The accepted frontier role now needs to coordinate the capital and outpost in one deliberate two-land operation.

First Inter-Land Coordination v1 provides exactly one branch-specific action:

- Trade Post plus active logistics line: `Dispatch Ridge Convoy`
- Watch Post plus active signal: `Raise Basin Alert`

This slice makes the two-land empire act as one network without adding an economy, simulated units, combat, a third land, repeatable operations or a general mission system.

## Required product outcome

The candidate must prove this normal-input sequence:

`active North Ridge payoff -> World identifies the coordination need -> Map inspects the Greenvale to North Ridge link -> Village commits the matching operation -> Map shows the coordinated result -> Greenvale acknowledges completion -> World records a functioning two-land empire`

The result must persist across native restart, Web reload and profile reopen.

## Binding constraints

- The accepted specialization and payoff determine the only available operation.
- Exactly one coordination result and one terminal event may exist per profile.
- Trade and Watch results remain mutually exclusive.
- Preserve the established outpost, exactly two claimed lands, Greenvale capital and all earlier progression.
- Preserve one physical Aurelian Basin geography.
- Village answers HOW, Map answers WHERE and World answers WHY/WHICH DIRECTION.
- No resources, prices, inventory, production, workers, queues, timers, simulated units, combat, third land, repeatable operation or generic mission system.
- No new GLB, terrain, camera, asset family, dependency, app/play/public shell, P12, MAX, paid tools or extra spend.

## Steward process

- One active product or recovery PR at a time.
- Every acceptance decision requires exact-head workflows, artifacts and direct review.
- Green CI alone is not acceptance.
- Infra failures before product testing receive only the smallest job rerun.
- Deterministic failures are fixed on the same PR without blind retry.
- At most one bounded correction is allowed before PASS or REJECT.
- Authority transitions combine the accepted PASS record and the next bounded contract in one documentation PR.

## Current stop condition

After this authority transition merges, implement exactly one First Inter-Land Coordination v1 candidate. Stop after direct classification as `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_PASS` or `GODOT_AURELIAN_FIRST_INTER_LAND_COORDINATION_REJECT`.
