# Agent Run Package — #328 Aurelian Village Progression Recovery

Classification: `EXECUTION_TRIGGER_PACKAGE / DO_NOT_MERGE_AS_PRODUCT_CODE / REPLACES_PASSIVE_WAITING`

This branch exists because issue #328 was strategically correct but operationally passive: no linked implementation PR, no executor response, no assignee/runner trigger and no branch existed. This package converts #328 into a visible draft PR/branch that can be watched, reviewed and handed to an implementation executor.

## Source issue

- Issue: #328 — `AGENT RUN: Aurelian Village progression recovery prompt`
- Strategic source: #327
- Visual target source: #314 / PR #315
- PR #315 head: `59fbebf4ba2d7cddb77a8ca4d93701b6bec4599a`
- Rejected product use: #316 / PR #317 claim-map/editor flow
- Mechanic-only reference: PR #326 one-shelter reveal

## Operational correction

Previous state was incorrectly allowed to sit at `NO_MEANINGFUL_CHANGE`. Correct state:

`ISSUE_BRIEF_ACCEPTED / EXECUTION_NOT_TRIGGERED / PASSIVE_WAITING_REJECTED`

This PR is therefore not a final implementation. It is a control artifact whose job is to force the next step into one of three outcomes:

1. a true implementation PR that stages `camp → one shelter → living settlement` from the accepted Aurelian/Godot visual family;
2. an exact pre-coding implementation plan accepted on #328;
3. an honest blocker classification: `BLOCKED_NEEDS_LAYERED_ASSET_PLAN` or `BLOCKED_NO_EXECUTOR_TRIGGER`.

## Executor prompt

Use Cursor GPT-5.5 with MAX OFF.

Do not use Fable, image generation, paid tools, MAX, a second asset family, or a broad refactor.

Before coding, respond on #328 or this PR with:

1. Confirm the product correction:
   - #315 visual source retained;
   - #316 claim-map/editor use rejected;
   - #326 mechanic only.
2. State exact source branch/commit/artifacts:
   - start from `main` unless a safer branch is proven;
   - import/reuse only accepted #315 assets or deterministic #315 reproduction artifacts;
   - list exact hashes before visual acceptance.
3. Define three visual states:
   - camp/opening: Aurelian visual language, sparse, hearth/camp only;
   - first shelter: one readable shelter appears after the first order with a construction beat;
   - developed settlement: visually approaches the accepted Aurelian/Godot settlement/city composition.
4. Choose runtime path:
   - React `/play` only if it can preserve the accepted visual family without weak CSS/SVG fallback;
   - Godot proof only if that is the safest deterministic path;
   - bridge path only if explicitly bounded and evidence-backed.
5. List exact files expected to change.
6. Provide validation commands.
7. Provide screenshot/evidence contract.
8. Classify whether implementable now or blocked.

## Hard forbidden list

- No main write.
- No merge, mark-ready or deployment.
- No backend, accounts, payments, crypto/NFT/wallet/token, multiplayer, combat or economy.
- No broad reducer, persistence, routing or world-expansion changes.
- No weak CSS/SVG polish of the current Village as final direction.
- No claim-map/editor opening flow.
- No changing product order away from `existing land → camp → first building → living village → later regional expansion map`.
- No treating green CI as visual acceptance.

## Required evidence for any implementation PR

- Desktop contact sheet:
  - camp/opening;
  - one-shelter;
  - developed settlement/reference.
- Mobile contact sheet:
  - camp/opening;
  - one-shelter;
  - developed settlement/reference.
- Run ID, artifact ID, digest, asset hashes, file hashes and exact head SHA.
- Build/QA logs.
- Direct visual classification before merge.

## PR #326 control finding

PR #326 stays draft/unmerged and is not a valid continuation path. It is only a mechanical proof that the first order should reveal one shelter. It should not be used as the visual target because it relies on fragile CSS/nth-child/path selectors, hardcoded branch checkout and old-scene visual polish.

## Stop condition

Stop after one of:

- implementation PR exists with exact evidence;
- accepted implementation plan exists;
- `BLOCKED_NEEDS_LAYERED_ASSET_PLAN`;
- `BLOCKED_NO_EXECUTOR_TRIGGER`.

Do not continue passive waiting.