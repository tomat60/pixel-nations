# Village First Shelter Component V2

Classification: `EXECUTOR_ACTIVE / PRODUCT_PATCH_PENDING / DO_NOT_MERGE`

This branch exists to apply one bounded component-level correction in `app/play/components/VillageScene.tsx`:

- first shelter order renders one home;
- food or timber progress renders two homes;
- food plus timber renders three homes;
- storehouse renders four homes;
- yard props stay hidden until the second home;
- no CSS selector hiding, reducer, persistence, routing, map/world/nation/empire, asset or product-flow change.

The branch-write workflow applies the exact fail-closed patch, commits it to this branch, runs build, Village QA and Village progression video evidence, and uploads exact-head evidence. This control file is temporary and must be removed before final product review so the final PR scope can be reduced to the component change and any accepted durable QA guard.
