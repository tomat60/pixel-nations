# Village V2 Production Contract

No Village V2 integration work may begin until a committed 2048×1152 developed master and same-camera shelter proof have both passed GPT-5.6 and Fable asset review.

## Required art inputs

- One clean, native 2048×1152 developed-settlement master.
- One shelter proof derived from the same registered scene by removing later groups only.
- One opaque terrain base plus eight genuine cumulative art layers: camp, shelter, food, timber, storehouse, market, watch and council.
- Fixed camera, crop, terrain, river, lighting direction and registration ID across every state.
- No UI, labels, callouts, presentation framing, blurred patches or baked shadows from removed objects.

## Asset review gate

Asset review requires four verified images:

1. developed master, full frame;
2. developed master, native 1:1 crop;
3. same-camera shelter proof;
4. current V1 baseline.

Each image must declare repository path, native dimensions, byte size, SHA/provenance, capture type, scale factor, camera-registration ID and gameplay stage.

The review returns only `PASS`, `FAIL` or `HOLD_NO_IMPLEMENTATION`. A formal workflow success, green CI, renderer compatibility or relative improvement over V1 is not an art pass.

## Hard rejection conditions

- developed master below 2048×1152 or 50 KB;
- direction fixture used as runtime or production art;
- camera/crop/lighting drift between developed and shelter;
- fewer than eight genuine gameplay deltas;
- V1 SVG/CSS primitives, filters, glows, blobs, dots or stripes used as substitutes for missing art;
- shared full-frame snapshots mapped to multiple stages;
- full-frame blur or crossfade presented as construction progression.

## Handoff sequence

1. Produce the developed master outside runtime code.
2. GPT-5.6 reviews the real file directly.
3. Produce shelter from the same registered scene.
4. GPT-5.6 and Fable perform asset review on identical evidence.
5. Only after both pass, split base plus eight layers.
6. Run temporal review on exact stage evidence.
7. Only after both asset and temporal passes may an implementation handoff be written.
