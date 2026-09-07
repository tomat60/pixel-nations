# Deferred Input Ready v1 Authority

Status: AUTHORIZED AFTER MERGE
Date: 2026-09-07
Portfolio gate: #606
Execution issue: #608

## Decision

Authorize exactly one bounded `DEFERRED_INPUT_READY_V1` recovery candidate.

The current evidence separates persisted state from runtime readiness to consume the next normal OS input. A synchronous `PLAYABLE_AURELIAN_ENTRY_STATE` line is therefore not an acceptable next-input barrier by itself.

## Allowed scope

Product/runtime:
- `game/scenes/aurelian/playable_aurelian_entry_v1.gd`
- add one minimal asynchronous readiness emission keyed by the current state
- readiness must be emitted only after the state transition has completed and the runtime has crossed a later process frame

Evidence/workflow:
- reuse or restore the rejected native state-gated driver only as a test utility
- gate each next key on the readiness token, not merely persisted-state output
- add one exact-head workflow that runs at least three clean-profile traversals through the bounded first-session route

## Forbidden

- no progression rewrite
- no persistence schema change
- no UI, camera, asset, visual, economy or mechanics change
- no fixed sleep as the primary transition barrier
- no second timing strategy in the same candidate
- no reopening rejected PRs #605, #600, #594, #591 or #587

## Acceptance

The candidate passes only if all are true:
1. readiness is asynchronous relative to `_apply_entry_state()` and emitted after a later process frame;
2. three clean profiles complete the same normal-input traversal deterministically to the required two-land finale;
3. exact-head logs make input -> state -> readiness ordering auditable;
4. timeout, wrong state, duplicate/missing readiness or process exit fail closed;
5. existing Foundation, Playable Entry, persistence, Web/export and generic CI regressions remain green where triggered.

One deterministic correction is allowed after the first exact-head failure.

## Stop condition

If the candidate still misses or duplicates input after a valid readiness token, close without merge and stop timing/debounce experiments. The next portfolio gate must review input-handler architecture itself.
