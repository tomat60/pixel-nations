# Fable Village V2 Asset Review Template

Use only after the four referenced image files are committed and their metadata is verified.

```md
FABLE_MODE: asset_review
CONTEXT_PROFILE: village-v2

## Visual evidence files
- `docs/village-v2/assets/developed-master.webp`
- `docs/village-v2/assets/developed-master-1x-crop.webp`
- `docs/village-v2/assets/shelter-proof.webp`
- `docs/visual-evidence/village-v1-owner-rejection.webp`

## Visual evidence metadata
- role=developed-master | path=docs/village-v2/assets/developed-master.webp | dimensions=2048x1152 | bytes=<exact> | sha=<exact> | capture=production-art | scale=1.0 | camera=<registration-id> | stage=developed
- role=master-1x-crop | path=docs/village-v2/assets/developed-master-1x-crop.webp | dimensions=<exact> | bytes=<exact> | sha=<exact> | capture=native-crop | scale=1.0 | camera=<registration-id> | stage=developed-detail
- role=shelter | path=docs/village-v2/assets/shelter-proof.webp | dimensions=2048x1152 | bytes=<exact> | sha=<exact> | capture=production-art | scale=1.0 | camera=<same-registration-id> | stage=shelter
- role=v1-baseline | path=docs/visual-evidence/village-v1-owner-rejection.webp | dimensions=<exact> | bytes=<exact> | sha=<exact> | capture=browser-evidence | scale=1.0 | camera=v1-baseline | stage=v1

## Required output contract
1. Evidence provenance
2. Binary asset verdict
3. Target-direction fidelity
4. Developed and shelter registration verdict
5. Blocking defects
6. Final gate

## Stop condition
Return `HOLD_NO_IMPLEMENTATION` when any file, dimension, SHA, byte size, camera ID or evidence role is missing or inconsistent. Return no implementation instructions.
```
