# Aurelian V3 composition board package

Status: **BOARD CANDIDATE — no production implementation authorized**.

This package converts issue #341 from prose into one shared, measurable visual plan. It contains five SVG boards:

1. `desktop-composition.svg` — 16:10 occupancy, complete bridge, village silhouette, circulation and negative-space targets.
2. `portrait-composition.svg` — 390×844-equivalent framing using the same world with an intentional vertical route.
3. `bridge-detail.svg` — road → embankment → abutment → deck → abutment → embankment/road.
4. `village-circulation.svg` — plaza, shelter, home cluster, civic/work edges, landmark, one primary route and necessary spurs.
5. `rejection-annotations.svg` — explicit visual failures from the rejected V2 direction that must not recur.

## Measurable acceptance targets

| Target | Desktop | Portrait |
|---|---:|---:|
| Village silhouette occupancy | 31–36% | 28–34% |
| Bridge + both landings visible | 100% | 100% |
| Bridge/landing visual occupancy | 19–23% | 20–26% |
| Protected negative space | 22–28% | 14–20% |
| Unused top field | ≤12% | ≤9% |
| Main route readable bridge→plaza | yes | yes |
| Core landmark connected to circulation | yes | yes |

## Shared-world camera contract

The authored world remains identical. Desktop uses a shallow diagonal overview. Portrait rotates the camera toward the primary route, compresses depth and places the village core in the upper-middle; it does not solve framing by clipping the bridge or settlement.

## Review order

1. Direct GPT composition review against the measurable targets.
2. Owner review of the same five boards.
3. Bounded Fable review only after the board is materially complete.
4. Only after acceptance: open a narrow source-art implementation sprint.

No Blender, production scene, game code or asset implementation belongs in this package.
