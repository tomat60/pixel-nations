#!/usr/bin/env python3
"""Render a materially re-authored Village V4 candidate using the proven layered renderer.

The rejected M1 proof remains the renderer implementation donor only. This wrapper replaces
its complete desktop/portrait composition before execution: tighter camera, central civic core,
river-shaped road network, bank-integrated crossing and substantially larger developed footprint.
"""

import sys
from pathlib import Path

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 4:
    raise SystemExit(
        "Usage: blender -b --python aurelian_village_v4_reauthor.py -- "
        "<proof_renderer> <base_script> <kaykit_root> <output_dir>"
    )

proof_renderer, base_script, source_root, output_dir = map(Path, argv)

NEW_LAYOUTS = {
    "desktop": {
        "extent": (250.0, 205.0),
        "grid": (132, 108),
        "river": [(-125, 45), (-98, 32), (-68, 18), (-38, 4), (-8, -8), (24, -18), (58, -23), (92, -18), (125, -4)],
        "water_z": -3.2,
        "road_before": [(-105, -82), (-78, -62), (-52, -42), (-30, -24), (-12, -9)],
        "bridge": {"position": (-10.0, -8.0), "rotation": 62.0, "span": 24.0},
        "camera": {"position": (112, -142, 126), "target": (2, 21, 6), "ortho": 91.0, "resolution": (2048, 1280)},
        "trees": [(-106, 67, 0), (-88, 83, 18), (-70, 76, -14), (92, 73, 15), (108, 54, -8), (91, 92, 20)],
        "rocks": [(-106, 8, 0), (-91, 27, 24), (100, 4, -16), (111, 29, 18)],
        "hearth": (-8, 10),
        "paths": {
            "camp": [(-11, -7), (-10, 0), (-8, 10)],
            "shelter": [(-8, 10), (-20, 18), (-31, 27)],
            "food": [(-8, 10), (-3, 22), (3, 34), (9, 46)],
            "timber": [(-8, 10), (-21, 4), (-34, -3), (-44, -9)],
            "scout": [(-5, 13), (11, 21), (27, 27), (43, 31)],
            "storehouse": [(-5, 8), (8, 3), (21, -1), (34, -4)],
            "market": [(-16, 18), (-7, 27), (5, 29), (15, 22), (10, 12), (-2, 11), (-16, 18)],
            "watch": [(18, 22), (31, 13), (44, 5), (54, -4)],
            "council": [(-4, 29), (-4, 41), (-3, 54)],
        },
        "assets": {
            "camp": [
                ("tent", (4, 12), -10, 7.8), ("flag_red", (-16, 11), 0, 7.0),
                ("crate_big", (-1, 3), 16, 6.6), ("crate_small", (6, 4), -12, 6.0),
                ("lumber", (11, 2), 8, 6.3), ("sack", (-9, 2), 0, 5.7),
                ("barrel", (3, -2), 0, 6.0), ("wheelbarrow", (14, 8), -20, 6.1),
            ],
            "shelter": [
                ("house_a", (-31, 28), 18, 8.8), ("house_c", (-18, 32), -10, 7.2),
            ],
            "food": [
                ("grain", (10, 47), -8, 5.3), ("house_b", (22, 47), -12, 7.5),
                ("sack", (2, 38), 12, 5.5), ("bucket_water", (8, 36), 0, 5.6),
                ("fence", (-1, 46), 76, 4.8), ("fence", (19, 38), -12, 4.8),
            ],
            "timber": [
                ("scaffolding", (-43, -9), -16, 7.2), ("tree_cut", (-52, 1), 10, 7.1),
                ("lumber", (-34, -14), 5, 6.7), ("lumber", (-48, -18), -8, 6.2),
                ("pallet", (-29, -6), 16, 5.9), ("ladder", (-39, 4), -20, 6.2),
            ],
            "scout": [
                ("tent", (44, 32), -16, 6.0), ("flag_red", (34, 25), -6, 6.4),
                ("flag_red", (51, 37), 10, 6.4), ("target", (53, 27), -14, 6.3),
                ("crate_open", (42, 25), 18, 5.6),
            ],
            "storehouse": [
                ("storehouse", (35, -5), -12, 6.7), ("house_c", (30, 10), 18, 7.7),
                ("crate_big", (24, -10), 10, 6.0), ("crate_small", (32, -13), -10, 5.5),
                ("barrel", (43, -10), 0, 5.8),
            ],
            "market": [
                ("market", (3, 23), 8, 8.7), ("well", (-10, 25), 0, 7.5),
                ("house_d", (18, 32), -10, 7.7), ("crate_open", (14, 20), 12, 5.5),
                ("house_e", (-19, 17), 12, 7.1),
            ],
            "watch": [
                ("tower", (55, -5), -18, 5.5), ("barracks", (49, 12), -24, 5.2),
                ("fence", (59, 5), 68, 5.1), ("fence", (56, 20), 72, 5.1),
            ],
            "council": [
                ("church", (-3, 55), 7, 9.0), ("council_stage", (-15, 45), -8, 6.9),
                ("house_e", (13, 53), 14, 7.5), ("flag_red", (-8, 48), 0, 6.2),
            ],
        },
        "field": {"center": (7, 43), "rotation": -8, "size": (24, 15)},
        "plaza": {"center": (1, 24), "radius": 14.5},
    },
    "portrait": {
        "extent": (180.0, 275.0),
        "grid": (96, 148),
        "river": [(-90, -25), (-65, -30), (-40, -34), (-15, -32), (10, -24), (34, -11), (58, 7), (90, 22)],
        "water_z": -3.2,
        "road_before": [(0, -132), (-3, -102), (-6, -73), (-8, -48), (-8, -31)],
        "bridge": {"position": (-8.0, -30.0), "rotation": 80.0, "span": 19.0},
        "camera": {"position": (22, -190, 151), "target": (0, 31, 7), "ortho": 108.0, "resolution": (780, 1688)},
        "trees": [(-60, 92, 0), (-51, 126, 16), (-62, 158, -12), (58, 105, -18), (66, 143, 20), (52, 179, -8)],
        "rocks": [(-66, 18, 0), (-58, 55, 24), (64, 29, -16), (68, 67, 18)],
        "hearth": (-7, 8),
        "paths": {
            "camp": [(-8, -28), (-8, -10), (-7, 8)],
            "shelter": [(-7, 8), (-19, 18), (-27, 29)],
            "food": [(-5, 11), (5, 23), (13, 38), (18, 54)],
            "timber": [(-8, 7), (-20, 1), (-31, -5)],
            "scout": [(-4, 14), (5, 31), (12, 49), (18, 68)],
            "storehouse": [(-5, 7), (8, 5), (21, 3), (31, 1)],
            "market": [(-17, 22), (-8, 34), (3, 38), (13, 31), (9, 20), (-3, 17), (-17, 22)],
            "watch": [(13, 47), (3, 63), (-6, 79)],
            "council": [(-2, 43), (-2, 61), (-1, 82)],
        },
        "assets": {
            "camp": [
                ("tent", (8, 11), -10, 7.1), ("flag_red", (-18, 9), 0, 6.6),
                ("crate_big", (1, 1), 15, 6.2), ("crate_small", (8, 3), -10, 5.8),
                ("lumber", (13, -1), 8, 5.9), ("sack", (-9, 0), 0, 5.3),
                ("barrel", (5, -5), 0, 5.6), ("wheelbarrow", (16, 6), -18, 5.8),
            ],
            "shelter": [("house_a", (-28, 30), -18, 7.8), ("house_c", (-16, 36), 12, 6.4)],
            "food": [
                ("grain", (19, 55), 8, 5.0), ("house_b", (25, 69), -10, 6.7),
                ("sack", (10, 44), 12, 5.2), ("bucket_water", (7, 50), 0, 5.1),
                ("fence", (25, 47), 82, 4.3), ("fence", (13, 61), -8, 4.3),
            ],
            "timber": [
                ("scaffolding", (-32, -5), -12, 6.4), ("tree_cut", (-42, 3), 8, 6.4),
                ("lumber", (-26, -11), 4, 6.0), ("lumber", (-38, -13), -7, 5.6),
                ("pallet", (-21, -3), 15, 5.3), ("ladder", (-30, 5), -18, 5.5),
            ],
            "scout": [
                ("tent", (20, 69), -14, 5.5), ("flag_red", (8, 61), -6, 5.9),
                ("flag_red", (26, 75), 10, 5.9), ("target", (29, 64), -12, 5.8),
                ("crate_open", (18, 60), 15, 5.1),
            ],
            "storehouse": [
                ("storehouse", (32, 1), -10, 6.0), ("house_c", (27, 18), 16, 6.8),
                ("crate_big", (21, -5), 10, 5.5), ("crate_small", (29, -8), -10, 5.1),
                ("barrel", (38, -6), 0, 5.3),
            ],
            "market": [
                ("market", (1, 32), 8, 7.4), ("well", (-12, 36), 0, 6.6),
                ("house_d", (15, 45), -9, 6.7), ("crate_open", (11, 34), 12, 4.9),
                ("house_e", (-20, 25), 12, 6.1),
            ],
            "watch": [
                ("tower", (-9, 80), -16, 5.0), ("barracks", (4, 89), -22, 4.8),
                ("fence", (-16, 84), 18, 4.7), ("fence", (-11, 96), 24, 4.7),
            ],
            "council": [
                ("church", (-1, 84), 5, 7.9), ("council_stage", (-15, 72), -6, 5.9),
                ("house_e", (14, 86), 12, 6.5), ("flag_red", (-6, 77), 0, 5.6),
            ],
        },
        "field": {"center": (17, 52), "rotation": 7, "size": (18, 12)},
        "plaza": {"center": (0, 34), "radius": 11.5},
    },
}

source = proof_renderer.read_text()
start = source.index("base.LAYOUTS = {")
end = source.index("\n\n\ndef cube", start)
replacement = "base.LAYOUTS = " + repr(NEW_LAYOUTS)
source = source[:start] + replacement + source[end:]

sys.argv = [str(proof_renderer), "--", str(base_script), str(source_root), str(output_dir)]
namespace = {"__name__": "__main__", "__file__": str(proof_renderer)}
exec(compile(source, str(proof_renderer), "exec"), namespace)
