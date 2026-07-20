# Fable Visual Context Recovery Validation

Local deterministic validation completed before opening the recovery PR.

## Commands

- `node --check scripts/fable-issue-directive.mjs`
- synthetic `strategy/general` directive with `FABLE_PREFLIGHT_ONLY=true`
- synthetic `asset_review/village-v2` directive with missing master metadata
- synthetic legacy directive using `## Required output`

## Results

- JavaScript syntax: PASS.
- `strategy/general`: `DRY_RUN_VALIDATED`.
- missing-asset review: `HOLD_NO_IMPLEMENTATION`; no Anthropic call made.
- legacy output heading: `DRY_RUN_VALIDATED`.

The deterministic hold reported missing `master-1x-crop`, `shelter`, `v1-baseline`, unattached developed-master path and an evidence count of zero.

This file records test evidence only. It does not authorize Village V2 implementation and does not modify game or visual assets.
