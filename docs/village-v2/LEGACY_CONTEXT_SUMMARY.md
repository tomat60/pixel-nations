# Village V1 Legacy Context Summary

Village V1 is the stable fallback and remains responsible for current mechanics, state transitions, persistence, hitboxes, selectors and QA semantics.

Its visual implementation is not Village V2 art direction. The large `app/play/components/VillageScene.tsx` file contains legacy terrain SVG, CSS buildings, district patches, labels, props and presentation rules. These may be inspected only when a task explicitly needs fallback mechanics or QA compatibility.

## V2 boundary

- Do not use `SettlementCredibilityLayer` as visible V2 art.
- Do not reuse V1 building primitives, district patches, road SVGs, labels or institution glyphs.
- Do not infer V2 material, density, lighting or composition from V1.
- Keep V1 available behind the default-off V2 switch until a complete V2 evidence package passes.
- Preserve hidden/semantic compatibility only where required for tests; semantic compatibility must not reintroduce visual ownership.

The preferred Fable `village-v2` context contains the V2 renderer, layer manifest and durable production/quarantine contracts. Full V1 source belongs only in the explicit `legacy` context profile.
