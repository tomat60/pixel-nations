# Village V2 Visual Quarantine

The following sources and techniques are forbidden as Village V2 production art or as substitutes for missing art:

- visible `SettlementCredibilityLayer` output;
- SVG/CSS visual primitives from `VillageScene.tsx`;
- Map or World glyphs reused as Village buildings or terrain;
- cropping, enlarging, filtering or importing the 450×200 direction reference into runtime;
- extracting production assets from the review fixture;
- one full-frame snapshot reused for multiple gameplay stages;
- CSS glows, blobs, dots, stripes, beacons or highlights used to fake buildings, fields, roads or districts;
- full-frame blur, brightness changes or crossfades used as construction progression;
- mixing painterly raster art with legacy flat SVG/CSS structures;
- coding before a committed developed master and same-camera shelter proof pass asset review.

## Comparison-only reference

`docs/visual-evidence/village-v2-approved-direction.webp` is currently a 450×200 comparison fixture. It communicates category, density, materiality and mood only. It is not a production master, may not be scaled or imported into the app, and should be renamed to an explicit `DO-NOT-SCALE` filename when a binary-safe rename path is available.

## Rejected historical techniques

- PR #273: enlarged direction fixture, filters, radial glows and re-exposed V1 visual layer.
- PR #274: five snapshots for eight stages, CSS accents and full-scene swaps.

Both techniques are permanently closed. New work must begin from verified native-resolution art, not from another code workaround.
